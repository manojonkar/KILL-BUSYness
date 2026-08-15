"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendInviteEmail } from "@/app/dashboard/sendInvite";
import { Resend } from "resend";

export async function submitPerceptionGapInvites(formData: FormData) {
  const companyId = formData.get("companyId") as string;
  const emailsText = formData.get("emails") as string;
  const targetLevel = formData.get("targetLevel") as string; // "Senior Leadership" or "Employee"

  if (!companyId || !emailsText || !targetLevel) return;

  const emails = emailsText
    .split(/[\n,;]+/)
    .map(e => e.trim())
    .filter(e => e.includes("@"));

  if (emails.length === 0) return;

  const adminClient = createAdminClient();

  // 1. Get company
  const { data: company } = await adminClient.from("companies").select("*").eq("id", companyId).single();
  if (!company) return;

  // 2. Check seats
  const { count } = await adminClient.from("participants").select("*", { count: "exact", head: true }).eq("company_id", companyId);
  const used = count || 0;
  
  if (used + emails.length > company.seats_purchased) {
    // Cannot invite more than seats purchased
    throw new Error(`You have ${company.seats_purchased - used} seats remaining. Please add more seats to invite ${emails.length} people.`);
  }

  // 3. Create invites
  for (const email of emails) {
    // Generate name from email
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const inviteToken = crypto.randomUUID();

    const { data: newParticipant, error } = await adminClient.from("participants").insert({
      company_id: companyId,
      name,
      email,
      level: targetLevel,
      invite_token: inviteToken,
      status: "pending"
    }).select().single();

    if (!error && newParticipant) {
      await sendInviteEmail(email, name, company.name, inviteToken);
    }
  }

  revalidatePath(`/report/${companyId}`);
}

export async function assignSprintTask(formData: FormData) {
  const companyId = formData.get("companyId") as string;
  const monthIndex = parseInt(formData.get("monthIndex") as string, 10);
  const participantId = formData.get("participantId") as string;
  const taskTitle = formData.get("taskTitle") as string;

  if (!companyId || isNaN(monthIndex) || !participantId) return;

  const adminClient = createAdminClient();
  
  // Save assignment
  const { error } = await adminClient.from("sprint_assignments").upsert({
    company_id: companyId,
    month_index: monthIndex,
    participant_id: participantId,
    status: "pending"
  }, { onConflict: "company_id, month_index, participant_id" });

  if (!error) {
    // Fetch participant info to send email
    const { data: participant } = await adminClient.from("participants").select("name, email").eq("id", participantId).single();
    const { data: company } = await adminClient.from("companies").select("name").eq("id", companyId).single();
    
    if (participant && participant.email && company) {
      const key = process.env.RESEND_API_KEY;
      if (key) {
        const resend = new Resend(key);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
        await resend.emails.send({
          from: "KILL BUSYness Portal <admin@killbusyness.com>",
          to: participant.email,
          cc: "manoj@managementinnovations.co.in",
          subject: `You have been assigned to lead Sprint Month ${monthIndex + 1}`,
          html: `<p>Hi ${participant.name},</p><p>You have been assigned by your leadership team at <strong>${company.name}</strong> to own <strong>${taskTitle}</strong> for Month ${monthIndex + 1} of the turnaround sprint.</p><p>Log in to the portal to view the details and track your progress.</p>`
        }).catch(() => {});
      }
    }
  }

  revalidatePath(`/report/${companyId}`);
}
