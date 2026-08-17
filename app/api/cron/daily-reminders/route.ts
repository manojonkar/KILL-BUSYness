import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Check authorization (Vercel Cron header, manual secret bypass, or dev environment)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("Authorization");
  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    secret === "oictzdcrdqgwawezwjzr" ||
    process.env.NODE_ENV === "development";

  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // We fetch all pending participants created in the last 4 days
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pending, error } = await supabase
      .from("participants")
      .select("id, name, email, invite_token, created_at, companies(name)")
      .eq("status", "sent")
      .gte("created_at", fourDaysAgo);

    if (error) throw error;
    
    if (!pending || pending.length === 0) {
      return NextResponse.json({ success: true, message: "No pending invites in the last 4 days." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
       return NextResponse.json({ success: false, error: "RESEND_API_KEY is not configured." }, { status: 500 });
    }
    const resend = new Resend(resendApiKey);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";

    let sentCount = 0;
    const now = Date.now();

    for (const p of pending) {
      const createdDate = new Date(p.created_at).getTime();
      const diffHours = (now - createdDate) / (1000 * 60 * 60);
      
      // We check if the invite is exactly 1 day old (between 23 and 25 hours) 
      // or exactly 3 days old (between 71 and 73 hours)
      // Since cron runs once a day, using a 2-3 hour window ensures we catch it.
      // To be safer, since a daily cron runs at a specific time, if we run it daily, we can just check if diffDays is 1 or 3 based on calendar days, but hours is more precise if they were invited exactly 24 or 72 hrs ago.
      // A simpler robust way for a daily cron:
      // The cron runs daily at e.g. 9 AM. So we check if the invite was sent between 1 and 2 days ago for the 1-day reminder.
      // Let's use strict hour boundaries. Assuming this cron runs once every hour or day? If it runs daily, the invite could have been sent at 5 PM, so at 9 AM the next day it's only 16 hours old. At 9 AM the day after, it's 40 hours old.
      // It's much safer to check the calendar date difference.
      
      const created = new Date(p.created_at);
      const today = new Date();
      // zero out times
      const createdDay = Date.UTC(created.getFullYear(), created.getMonth(), created.getDate());
      const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffDays = Math.floor((currentDay - createdDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 1 || diffDays === 3) {
        const companyName = (p.companies as any)?.name || "Your organization";
        const reminderText = diffDays === 1 ? "Just a quick reminder" : "Final reminder";
        
        await resend.emails.send({
          from: "KILL BUSYness Portal <admin@killbusyness.com>",
          to: p.email,
          subject: `${reminderText}: Invitation to the KILL BUSYness Organization Audit`,
          html: `<p>Hi ${p.name || "there"},</p>
                 <p>This is a gentle reminder that <strong>${companyName}</strong> invited you to take part in the KILL BUSYness Organization Audit.</p>
                 <p><a href="${siteUrl}/survey/${p.invite_token}">Click here to start the free survey</a></p>
                 <p>It takes about 10 minutes and your responses are completely confidential and free.</p>`
        });
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timeRun: new Date().toISOString(),
      sentCount
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
