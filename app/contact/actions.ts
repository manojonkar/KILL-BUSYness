"use server";
import { redirect } from "next/navigation";
import { Resend } from "resend";

export async function sendContactMessage(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=" + encodeURIComponent("Please fill in every field."));
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const resend = new Resend(key);
      await resend.emails.send({
        from: "KILL BUSYness Portal <admin@killbusyness.com>",
        to: "manoj@managementinnovations.co.in",
        cc: "manoj@managementinnovations.co.in",
        replyTo: email,
        subject: `KILL BUSYness Portal — message from ${name}`,
        html: `<p><strong>${name}</strong> (${email}) wrote:</p><p>${message.replace(/\n/g, "<br/>")}</p>`
      });
    } catch {
    }
  }
  redirect("/contact?sent=1");
}
