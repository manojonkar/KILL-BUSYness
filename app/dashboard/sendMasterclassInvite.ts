"use server";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

export async function sendMasterclassInvite(formData: FormData) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) throw new Error("RESEND_API_KEY missing");
  const resend = new Resend(resendApiKey);
  
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";

  if (!email) throw new Error("Email is required");

  await resend.emails.send({
    from: "Manoj Onkar <admin@killbusyness.com>",
    to: email,
    subject: "Your Exclusive Invite: The KILL BUSYness Masterclass",
    html: `<p>Hi ${name || "there"},</p>
           <p>I wanted to personally invite you to access a private resource we just launched.</p>
           <p>We've unlocked access to our exclusive <strong>High-Performance Masterclass</strong> for your email.</p>
           <p>In this session, we break down exactly how you can transition a leadership team from an Extractive, BUSY culture to a Generative, High-Performance Organization.</p>
           <p><a href="${siteUrl}/masterclass" style="display:inline-block;padding:12px 24px;background-color:#0E9C74;color:white;text-decoration:none;border-radius:6px;margin-top:10px;font-weight:bold;">Watch the Masterclass Now</a></p>
           <p>Best regards,<br/>Manoj Onkar</p>`
  });

  return { success: true };
}
