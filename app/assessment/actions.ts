"use server";

import { Resend } from "resend";

export async function sendAssessmentEmail(email: string, score: number, bandName: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("Missing RESEND_API_KEY");
    return { success: false };
  }

  const resend = new Resend(resendApiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: "Manoj Onkar <manoj@killbusyness.com>",
      to: email,
      subject: "Your HPO Score reveals a critical growth bottleneck",
      html: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
          <p>Hi,</p>
          <p>I saw that you just ran your organization through the HPO Assessment. Your score placed you in the <strong>${bandName}</strong> category (${score}/100).</p>
        </div>
      `,
    });
    return { success: !error, data };
  } catch (err) {
    return { success: false, error: err };
  }
}
