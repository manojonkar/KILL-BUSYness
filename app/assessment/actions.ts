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
    // 1. Send Immediate Email (Day 1: The Scorecard & The Heavy Lifting)
    const { data: day1, error: err1 } = await resend.emails.send({
      from: "Manoj Onkar <manoj@killbusyness.com>",
      to: email,
      subject: "Your HPO Score reveals a critical growth bottleneck",
      html: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
          <p>Hi,</p>
          <p>You just ran your organization through the HPO Assessment. Your score placed you in the <strong>\</strong> category (\/100).</p>
          <p>Global engagement is currently sitting at 23% (and only 14% in India). This means your leadership team is dragging 80% of the company on its back. <em>That</em> is why your organization is so BUSY.</p>
          <p>Activity does not equal performance. If you want to fix this, I highly recommend picking up a copy of <a href="https://www.killbusyness.com/buy">KILL BUSYness</a> to understand how to unblock your growth.</p>
          <p>Best,<br>Manoj</p>
        </div>`,
    });

    if (err1) return { success: false, error: err1 };

    // 2. Schedule Day 3 Email (The Three Silences)
    const day3Date = new Date();
    day3Date.setHours(day3Date.getHours() + 72); // Resend allows max 72 hours scheduling

    const { data: day3, error: err3 } = await resend.emails.send({
      from: "Manoj Onkar <manoj@killbusyness.com>",
      to: email,
      subject: "The Three Silences killing your organization",
      html: `
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
          <p>Hi,</p>
          <p>The reason 80% of your workforce is disengaged is due to Extractive Management.</p>
          <p>This creates the <strong>Three Silences</strong>: Silence of the Soul, Heart, and Head. People default to compliance rather than commitment.</p>
          <p>You can read the Introductory Chapter, <em>Reinventing Management</em>, right now on our portal to see exactly how to break these silences.</p>
          <p>Best,<br>Manoj</p>
        </div>`,
      scheduledAt: day3Date.toISOString(),
    });

    // Note: Day 7 (Masterclass Invite) requires a cron job or webhook since Resend limits scheduling to 72 hours.
    
    return { success: true, data: { day1, day3 } };
  } catch (err) {
    return { success: false, error: err };
  }
}

