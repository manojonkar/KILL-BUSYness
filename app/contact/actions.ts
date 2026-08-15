"use server";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

export async function sendContactMessage(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=" + encodeURIComponent("Please fill in every field."));
  }

  // 1. Save to database
  try {
    const adminClient = createAdminClient();
    await adminClient.from("contact_messages").insert({ name, email, message });
  } catch {
    // Fail silently — email delivery is the priority
  }

  // 2. Send email immediately
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const resend = new Resend(key);
      await resend.emails.send({
        from: "KILL BUSYness Portal <admin@killbusyness.com>",
        to: "manoj@managementinnovations.co.in",
        cc: "manoj@managementinnovations.co.in",
        replyTo: email,
        subject: `KILL BUSYness — Message from ${name}`,
        html:
          `<div style="font-family:sans-serif;max-width:560px">` +
          `<h2 style="color:#0f172a;margin-bottom:4px">New Contact Message</h2>` +
          `<p style="color:#64748b;font-size:13px;margin-top:0">Submitted via killbusyness.com/contact</p>` +
          `<table style="width:100%;border-collapse:collapse;margin:16px 0">` +
          `<tr><td style="padding:8px 0;font-size:13px;color:#94a3b8;width:80px">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a">${name}</td></tr>` +
          `<tr><td style="padding:8px 0;font-size:13px;color:#94a3b8">Email</td><td style="padding:8px 0;font-size:14px;color:#0f172a"><a href="mailto:${email}">${email}</a></td></tr>` +
          `</table>` +
          `<div style="background:#f8f7f4;border-left:3px solid #0E9C74;padding:14px 16px;border-radius:4px;font-size:14px;color:#334155;line-height:1.6">` +
          `${message.replace(/\n/g, "<br/>")}</div>` +
          `<p style="font-size:12px;color:#94a3b8;margin-top:16px">Reply directly to this email to respond to ${name}.</p>` +
          `</div>`
      });
    } catch {
    }
  }
  redirect("/contact?sent=1");
}
