"use server";

import { sendPortalEmail } from "@/lib/email";

export async function sendAssessmentEmail(email: string, score: number, bandName: string) {
  try {
    // 1. Send Immediate Email (Day 1: The Scorecard & The Heavy Lifting)
    const result = await sendPortalEmail({
      from: "Manoj Onkar <admin@managementinnovations.co.in>",
      to: email,
      cc: "Killbusynessteam@gmail.com",
      replyTo: "admin@managementinnovations.co.in",
      subject: "Your HPO Score reveals a critical growth bottleneck",
      html: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
          <p>Hi,</p>
          <p>You just ran your organization through the HPO Assessment. Your score placed you in the <strong>${bandName || "Assessment"}</strong> category (${score}/100).</p>
          <p>Global engagement is currently sitting at 23% (and only 14% in India). This means your leadership team is dragging 80% of the company on its back. <em>That</em> is why your organization is so BUSY.</p>
          <p>Activity does not equal performance. If you want to fix this, I highly recommend picking up a copy of <a href="https://www.killbusyness.com/buy">KILL BUSYness</a> to understand how to unblock your growth.</p>
          <p>Best,<br>Manoj</p>
        </div>`,
    });

    return { success: result.success };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

