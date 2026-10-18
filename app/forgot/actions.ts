"use server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPortalEmail } from "@/lib/email";

export async function requestReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Please enter your email address." };
  
  const adminClient = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
  
  try {
    const { data: linkData, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: { redirectTo: `${siteUrl}/auth/recovery` }
    });
    
    if (error) throw error;
    
    const magicLink = linkData?.properties?.action_link;
    if (!magicLink) throw new Error("Could not generate reset link");

    const secureLink = `${siteUrl}/auth/verify-link?target=${encodeURIComponent(magicLink)}`;

    const sendResult = await sendPortalEmail({
      from: "Team KILL BUSYness <admin@killbusyness.com>",
      to: email,
      replyTo: "admin@managementinnovations.co.in",
      subject: "Reset your KILL BUSYness password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b; line-height: 1.6;">
          <h2 style="color: #0E9C74;">Password Reset Request</h2>
          <p>We received a request to reset the password for your KILL BUSYness account.</p>
          <p>Click the secure link below to log in and set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${secureLink}" style="display: inline-block; padding: 12px 24px; background: #0E9C74; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request this reset, you can safely ignore this email.</p>
          <p style="margin-top: 30px;">Best regards,<br/><strong>Team KILL BUSYness</strong></p>
        </div>
      `
    });

    if (!sendResult.success) {
      console.error("[PasswordReset] Dispatch failed:", sendResult.error);
      return { error: "We couldn't send the reset email right now. Please try again in a few minutes or write to admin@managementinnovations.co.in." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[PasswordReset] failed:", err.message);
    // Unknown address -> generic success (prevents email enumeration).
    // Anything else (e.g. email server not configured) must NOT look like success.
    const msg = String(err?.message || "").toLowerCase();
    if (msg.includes("not found") || msg.includes("no user") || msg.includes("user") && msg.includes("exist")) {
      return { success: true };
    }
    return { error: "We couldn't send the reset email right now. Please try again in a few minutes or write to admin@managementinnovations.co.in." };
  }
}
