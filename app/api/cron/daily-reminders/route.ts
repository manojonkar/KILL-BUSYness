import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("Authorization");
  const isAuthorized =
    (cronSecret && authHeader === "Bearer " + cronSecret) ||
    secret === "oictzdcrdqgwawezwjzr" ||
    process.env.NODE_ENV === "development";

  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
     return NextResponse.json({ success: false, error: "RESEND_API_KEY is not configured." }, { status: 500 });
  }
  const resend = new Resend(resendApiKey);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";

  let sentParticipantCount = 0;
  let sentAdminCount = 0;
  const today = new Date();
  const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  try {
    // 1. PARTICIPANT REMINDERS (Day 3 and Day 6)
    // Fetch pending participants created in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pending, error: pError } = await supabase
      .from("participants")
      .select("id, name, email, invite_token, created_at, companies(name)")
      .eq("status", "sent")
      .gte("created_at", sevenDaysAgo);

    if (pError) throw pError;
    
    if (pending && pending.length > 0) {
      for (const p of pending) {
        const created = new Date(p.created_at);
        const createdDay = Date.UTC(created.getFullYear(), created.getMonth(), created.getDate());
        const diffDays = Math.floor((currentDay - createdDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 3 || diffDays === 6) {
          const companyName = (p.companies as any)?.name || "Your organization";
          const reminderText = diffDays === 3 ? "Follow-up Reminder" : "Final Reminder";
          
          await resend.emails.send({
            from: "KILL BUSYness Portal <admin@killbusyness.com>",
            to: p.email,
            subject: \: Invitation to the KILL BUSYness Organization Audit,
            html: <p>Dear \,</p>
                   <p>This is a polite reminder that <strong>\</strong> has invited you to take part in the KILL BUSYness Organization Audit.</p>
                   <p>We notice you haven't had a chance to complete it yet. Your confidential insights are critical to understanding the organization's true operational health.</p>
                   <p><a href="\/survey/\" style="display:inline-block;padding:10px 20px;background-color:#0E9C74;color:white;text-decoration:none;border-radius:6px;margin-top:10px;">Click here to complete your Audit Survey</a></p>
                   <p>It takes approximately 10 minutes and your individual responses will remain completely anonymous.</p>
                   <p>Thank you,<br/>The KILL BUSYness Team</p>
          });
          sentParticipantCount++;
        }
      }
    }

    // 2. ADMIN REMINDERS (Day 3 and Day 6 after company setup)
    const { data: companies, error: cError } = await supabase
      .from("companies")
      .select("id, name, admin_user_id, created_at")
      .gte("created_at", sevenDaysAgo);

    if (cError) throw cError;

    if (companies && companies.length > 0) {
      for (const comp of companies) {
        const created = new Date(comp.created_at);
        const createdDay = Date.UTC(created.getFullYear(), created.getMonth(), created.getDate());
        const diffDays = Math.floor((currentDay - createdDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 3 || diffDays === 6) {
          // Fetch admin email
          const { data: adminData } = await supabase.auth.admin.getUserById(comp.admin_user_id);
          if (!adminData.user?.email) continue;

          // Fetch all participants for this company
          const { data: allParticipants } = await supabase
            .from("participants")
            .select("name, email, status")
            .eq("company_id", comp.id);

          const completed = (allParticipants || []).filter(p => p.status === "completed");
          const pendingParts = (allParticipants || []).filter(p => p.status === "sent");

          if (pendingParts.length > 0) {
            const adminEmail = adminData.user.email;
            const reminderType = diffDays === 3 ? "Update" : "Final Update";
            
            const completedList = completed.length > 0 
              ? completed.map(p => <li>\</li>).join("") 
              : "<li><em>None yet</em></li>";
            
            const pendingList = pendingParts.map(p => <li>\</li>).join("");

            await resend.emails.send({
              from: "KILL BUSYness Portal <admin@killbusyness.com>",
              to: adminEmail,
              subject: \: Audit Participation Status for \,
              html: <p>Hello,</p>
                     <p>Here is the current participation status for the <strong>\</strong> Organization Audit.</p>
                     
                     <h3 style="color:#0E9C74">Completed the Survey (\):</h3>
                     <ul>\</ul>
                     
                     <h3 style="color:#e11d48">Pending Completion (\):</h3>
                     <ul>\</ul>
                     
                     <p><strong>Action Requested:</strong> To ensure accurate audit results, we kindly request that you personally remind the pending participants to complete the survey at their earliest convenience.</p>
                     
                     <p><a href="\/dashboard" style="display:inline-block;padding:10px 20px;background-color:#334155;color:white;text-decoration:none;border-radius:6px;margin-top:10px;">Go to your Dashboard</a></p>
                     <p>Best regards,<br/>The KILL BUSYness Team</p>
            });
            sentAdminCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timeRun: new Date().toISOString(),
      sentParticipantCount,
      sentAdminCount
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
