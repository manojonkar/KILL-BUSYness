"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import { Resend } from "resend";

export async function submitAnswer(token: string, questionIndex: number, answer: number) {
  const supabase = createClient();
  await supabase.rpc("submit_survey_answer", { p_token: token, p_question_index: questionIndex, p_answer: answer });
  revalidatePath(`/survey/${token}`);
}

export async function completeSurvey(token: string) {
  const supabase = createClient();
  await supabase.rpc("complete_survey", { p_token: token });

  // Custom Point Logic & Invites
  const { data: p } = await supabase
    .from("participants")
    .select("company_id, name, email")
    .eq("invite_token", token)
    .maybeSingle();

  if (p) {
    // 1. Award 5 points to the admin of the company
    const { data: company } = await supabase
      .from("companies")
      .select("admin_user_id")
      .eq("id", p.company_id)
      .maybeSingle();
      
    if (company?.admin_user_id) {
      await supabase.rpc("award_points", { p_user_id: company.admin_user_id, p_amount: 5, p_reason: "Team member completed survey" });
    }

    // 2. Send the participant an auto-invite to claim their 25 points
    const key = process.env.RESEND_API_KEY;
    if (key && p.email) {
      try {
        const resend = new Resend(key);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
        await resend.emails.send({
          from: "KILL BUSYness Portal <admin@killbusyness.com>",
          to: p.email,
          subject: "Your Organization Diagnostic is Complete — Claim your 25 MI Credits",
          html: `<p>Hi ${p.name || "there"},</p>
                 <p>Thank you for completing the KILL BUSYness Organization Audit!</p>
                 <p>For your participation, you have just earned <strong>25 MI Credits</strong>.</p>
                 <p><a href="${siteUrl}/register?email=${encodeURIComponent(p.email)}">Register on the portal</a> to claim your credits and redeem them for executive resources, or to read the KILL BUSYness book.</p>`
        });
      } catch {
        // silently fail email if there's an error
      }
    }
  }

  revalidatePath(`/survey/${token}`);
}
