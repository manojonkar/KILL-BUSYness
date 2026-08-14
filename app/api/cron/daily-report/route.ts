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
  const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. Fetch 24-hour activities
    const [
      { data: newOrders },
      { data: newCompanies },
      { data: newCompletions },
      // 2. Fetch lifetime stats counts
      { count: totalOrdersCount },
      { count: totalCompaniesCount },
      { count: totalCompletedSurveysCount }
    ] = await Promise.all([
      supabase.from("book_orders").select("*").gte("created_at", past24h).order("created_at", { ascending: false }),
      supabase.from("companies").select("*").gte("created_at", past24h).order("created_at", { ascending: false }),
      supabase.from("participants").select("*, companies(name)").eq("status", "completed").gte("completed_at", past24h).order("completed_at", { ascending: false }),
      supabase.from("book_orders").select("*", { count: "exact", head: true }),
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("participants").select("*", { count: "exact", head: true }).eq("status", "completed")
    ]);

    const resNewOrders = newOrders || [];
    const resNewCompanies = newCompanies || [];
    const resNewCompletions = newCompletions || [];

    // Calculate revenue from paid/completed orders
    const { data: allPaidOrders } = await supabase.from("book_orders").select("amount").eq("status", "paid");
    const totalPaidRevenue = (allPaidOrders || []).reduce((acc, o) => acc + o.amount, 0);

    // Build the email HTML
    let emailHtml = `
      <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;">KILL BUSYness Portal — Daily Report</h2>
        <p style="color: #475569;">Activity summary for the last 24 hours (since ${new Date(past24h).toLocaleString("en-IN")}):</p>
        
        <!-- Summary Dashboard -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.95rem;">
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #e2e8f0; text-align: left; padding: 10px;">Metric</th>
            <th style="border: 1px solid #e2e8f0; text-align: center; padding: 10px; width: 120px;">Last 24 Hours</th>
            <th style="border: 1px solid #e2e8f0; text-align: center; padding: 10px; width: 120px;">Lifetime Total</th>
          </tr>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 10px;">Book Orders Placed</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px; font-weight: bold; color: ${resNewOrders.length > 0 ? "#0f766e" : "#475569"};">${resNewOrders.length}</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px;">${totalOrdersCount || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 10px;">Registered Companies</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px; font-weight: bold; color: ${resNewCompanies.length > 0 ? "#0f766e" : "#475569"};">${resNewCompanies.length}</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px;">${totalCompaniesCount || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 10px;">Survey Completions</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px; font-weight: bold; color: ${resNewCompletions.length > 0 ? "#0f766e" : "#475569"};">${resNewCompletions.length}</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px;">${totalCompletedSurveysCount || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 10px;">Total Paid Revenue</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px; font-weight: bold; color: #0f766e;">—</td>
            <td style="border: 1px solid #e2e8f0; text-align: center; padding: 10px; font-weight: bold;">₹${totalPaidRevenue.toLocaleString("en-IN")}</td>
          </tr>
        </table>
    `;

    // 2. Add New Book Orders section
    if (resNewOrders.length > 0) {
      emailHtml += `
        <h3 style="color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">New Book Orders (${resNewOrders.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.88rem;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
              <th style="text-align: left; padding: 8px;">Ref</th>
              <th style="text-align: left; padding: 8px;">Customer</th>
              <th style="text-align: left; padding: 8px;">Format</th>
              <th style="text-align: right; padding: 8px;">Amount</th>
              <th style="text-align: left; padding: 8px;">Notes</th>
              <th style="text-align: center; padding: 8px;">Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      resNewOrders.forEach((o) => {
        emailHtml += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px; font-family: monospace; font-weight: bold;">${o.ref}</td>
            <td style="padding: 8px;"><strong>${o.name}</strong><br/><span style="font-size: 0.78rem; color: #64748b;">${o.email} · ${o.phone}</span></td>
            <td style="padding: 8px;">${o.format}</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">₹${o.amount.toLocaleString("en-IN")}</td>
            <td style="padding: 8px; font-size: 0.78rem; color: #475569;">${o.notes || "—"}</td>
            <td style="padding: 8px; text-align: center;"><span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background-color: ${o.status === "paid" ? "#ccfbf1; color: #0f766e" : o.status === "dispatched" ? "#dbeafe; color: #1d4ed8" : "#fef3c7; color: #d97706"};">${o.status}</span></td>
          </tr>
        `;
      });
      emailHtml += `</tbody></table>`;
    }

    // 3. Add New Companies Registered section
    if (resNewCompanies.length > 0) {
      emailHtml += `
        <h3 style="color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">New Registered Companies (${resNewCompanies.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.88rem;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
              <th style="text-align: left; padding: 8px;">Company Name</th>
              <th style="text-align: left; padding: 8px;">Admin Contact</th>
              <th style="text-align: left; padding: 8px;">Industry / Size</th>
              <th style="text-align: center; padding: 8px; width: 80px;">Seats</th>
            </tr>
          </thead>
          <tbody>
      `;
      resNewCompanies.forEach((c) => {
        emailHtml += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px; font-weight: bold; color: #0f172a;">${c.name}</td>
            <td style="padding: 8px;">${c.admin_name || "—"}<br/><span style="font-size: 0.78rem; color: #64748b;">${c.admin_email || "—"}</span></td>
            <td style="padding: 8px;">${c.industry || "—"}<br/><span style="font-size: 0.78rem; color: #64748b;">Size: ${c.size || "—"}</span></td>
            <td style="padding: 8px; text-align: center; font-weight: bold;">${c.seats}</td>
          </tr>
        `;
      });
      emailHtml += `</tbody></table>`;
    }

    // 4. Add Survey Takers / Completions section
    if (resNewCompletions.length > 0) {
      emailHtml += `
        <h3 style="color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">New Survey Completions (${resNewCompletions.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.88rem;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
              <th style="text-align: left; padding: 8px;">Respondent</th>
              <th style="text-align: left; padding: 8px;">Company</th>
              <th style="text-align: left; padding: 8px;">Organizational Level</th>
              <th style="text-align: left; padding: 8px;">Completed At</th>
            </tr>
          </thead>
          <tbody>
      `;
      resNewCompletions.forEach((p: any) => {
        emailHtml += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px; font-weight: bold;">${p.name || "Anonymous"}<br/><span style="font-size: 0.78rem; color: #64748b;">${p.email}</span></td>
            <td style="padding: 8px;">${p.companies?.name || "—"}</td>
            <td style="padding: 8px;">${p.level}</td>
            <td style="padding: 8px; color: #475569;">${new Date(p.completed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
          </tr>
        `;
      });
      emailHtml += `</tbody></table>`;
    }

    emailHtml += `
        <p style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 0.75rem; color: #94a3b8; text-align: center;">
          This report is auto-generated by the KILL BUSYness Portal. Access the dashboard at <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com"}/admin" style="color: #0f766e;">killbusyness.com/admin</a>.
        </p>
      </div>
    `;

    // 5. Send daily email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "KILL BUSYness Portal <admin@killbusyness.com>",
        to: "manoj@managementinnovations.co.in",
        subject: `[KILL BUSYness] Daily Activity Report — ${new Date().toLocaleDateString('en-IN')}`,
        html: emailHtml
      });
    }

    return NextResponse.json({
      success: true,
      timeRun: new Date().toISOString(),
      newOrders: resNewOrders.length,
      newCompanies: resNewCompanies.length,
      newCompletions: resNewCompletions.length,
      emailSent: !!resendApiKey
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
