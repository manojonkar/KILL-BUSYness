"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendInviteEmail } from "@/app/dashboard/sendInvite";

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
