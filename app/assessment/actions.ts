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
      from: "Manoj Onkar <manoj@killbusyness.com>", // Ensure this domain is verified in Resend
      to: email,
      subject: "Your HPO Score reveals a critical growth bottleneck",
      html: 
        <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
          <p>Hi,</p>
          <p>I saw that you just ran your organization through the HPO Assessment. Your score placed you in the <strong>\</strong> category (\/100).</p>
          
          <p>Worldwide, employee engagement is stuck at 23%. If you think that is bad, in India the crisis is severely aggravated: engagement plummets to an abysmal 14%.</p>
          
          <p>When 86% of a workforce is disengaged, it is not a people problem. It is a system problem.</p>
          
          <p>Your assessment results point directly to the phenomenon I call <strong>"Mutual Extraction."</strong> The company extracts time and labor from the employee, and the employee extracts a paycheck from the company. Neither actually cares about the future of the other.</p>
          
          <p>This is what is secretly killing your growth. I call these the "Three Silences."</p>
          
          <p>We are going to fix this.</p>
          
          <p>Tomorrow, I am going to send you the blueprint for the <strong>ROAR Model</strong>. It is the exact framework High Performance Organizations use to break the cycle of extraction and build a regenerative culture.</p>
          
          <p>Keep an eye on your inbox.</p>
          
          <p>Best,<br><br><strong>Manoj Onkar</strong><br>KILL BUSYness</p>
        </div>
      ,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: err };
  }
}
