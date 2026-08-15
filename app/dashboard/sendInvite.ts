"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const VALID_ROLES: Record<string, string> = {
  "owner / ceo": "owner_ceo",
  "senior leadership": "senior_leadership",
  manager: "manager",
  employee: "employee"
};

export async function sendInviteEmail(toEmail: string, participantName: string, companyName: string, token: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const resend = new Resend(key);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
    await resend.emails.send({
      from: "KILL BUSYness Portal <admin@killbusyness.com>",
      to: toEmail,
      cc: "manoj@managementinnovations.co.in",
      subject: `${companyName} invites you to the KILL BUSYness Organization Audit`,
      html: `<p>Hi ${participantName || "there"},</p><p><strong>${companyName}</strong> has invited you to take part in the KILL BUSYness Organization Audit — a short, confidential diagnostic of how your organization really runs.</p><p><a href="${siteUrl}/survey/${token}">Start the survey</a></p><p>It takes about 10 minutes.</p>`
    });
  } catch {
  }
}

export async function addParticipant(companyId: string, formData: FormData) {
  const supabase = createClient();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const roleRaw = String(formData.get("role") || "Employee").toLowerCase();
  const level = VALID_ROLES[roleRaw] || "employee";
  if (!name || !email) return;

  const { data } = await supabase
    .from("participants")
    .insert({ company_id: companyId, name, email, level, status: "sent" })
    .select("invite_token")
    .single();

  const { data: company } = await supabase.from("companies").select("name").eq("id", companyId).single();
  if (data?.invite_token && company?.name) {
    await sendInviteEmail(email, name, company.name, data.invite_token);
  }
  revalidatePath("/dashboard");
}

export async function addBulkParticipants(companyId: string, seats: number, formData: FormData) {
  const supabase = createClient();
  const raw = String(formData.get("bulkList") || "");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const { count } = await supabase.from("participants").select("id", { count: "exact", head: true }).eq("company_id", companyId);
  let used = count || 0;

  const { data: company } = await supabase.from("companies").select("name").eq("id", companyId).single();

  for (const line of lines) {
    if (used >= seats) break;
    const parts = line.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const [name, email, roleRaw] = parts;
    if (!name || !email || !email.includes("@")) continue;
    const level = VALID_ROLES[(roleRaw || "").toLowerCase()] || "employee";
    const { data } = await supabase
      .from("participants")
      .insert({ company_id: companyId, name, email, level, status: "sent" })
      .select("invite_token")
      .single();
    if (data?.invite_token && company?.name) {
      await sendInviteEmail(email, name, company.name, data.invite_token);
    }
    used++;
  }
  revalidatePath("/dashboard");
}

export async function resendInvite(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("participantId") || "");
  if (!id) return;
  const { data: p } = await supabase.from("participants").select("name, email, status, invite_token, company_id").eq("id", id).maybeSingle();
  if (!p || p.status === "completed") return;
  const { data: company } = await supabase.from("companies").select("name").eq("id", p.company_id).single();
  if (p.invite_token && company?.name) {
    await sendInviteEmail(p.email, p.name, company.name, p.invite_token);
  }
  revalidatePath("/dashboard");
}

export async function removeParticipant(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("participantId") || "");
  if (!id) return;
  // RLS blocks removal of anyone who has already completed the survey.
  await supabase.from("participants").delete().eq("id", id);
  revalidatePath("/dashboard");
}
