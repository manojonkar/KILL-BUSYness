import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { computeDimensionScores, overallScore, answersArrayFromRows, type ParticipantAnswers } from "@/lib/scoring";
import { DIMENSIONS } from "@/lib/dimensions";

export const dynamic = "force-dynamic";

function scoreColor(s: number) { return s >= 70 ? "#0E9C74" : s >= 40 ? "#D9A441" : "#FF5A3C"; }
function scoreBg(s: number)    { return s >= 70 ? "#ccfbf1" : s >= 40 ? "#fef3c7" : "#fee2e2"; }
function bandLabel(s: number)  { return s >= 70 ? "✅ Healthy" : s >= 40 ? "⚠️ Moderate" : "🔴 At Risk"; }
function bandText(s: number) {
  return s >= 70
    ? "Your organization is running closer to High Performance than BUSYness. Protect what's working and keep the reflection discipline sharp."
    : s >= 40
    ? "You're carrying a meaningful amount of BUSYness. The gaps below are your highest-leverage places to intervene before they compound."
    : "Your organization is showing significant signs of BUSYness. Start with the single weakest dimension below rather than trying to fix everything at once.";
}

function buildReportEmail(
  company: { id: string; name: string; admin_name?: string },
  respondents: number,
  overall: number,
  dimScores: Record<string, number>,
  weakest: { label: string; score: number; chapter: number; chapterTitle: string }[],
  strongest: { label: string; score: number }[]
): string {
  const circumference = 2 * Math.PI * 58;
  const gaugeOffset = (circumference * (1 - overall / 100)).toFixed(2);
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com"}/report/${company.id}`;

  const dimBars = DIMENSIONS.map(d => {
    const s = dimScores[d.key] ?? 0;
    return `<tr>
      <td style="padding:6px 0;font-size:0.82rem;color:#1e293b;width:50%">${d.label}</td>
      <td style="padding:6px 8px;">
        <div style="background:#f0eee6;border-radius:4px;height:10px;overflow:hidden;">
          <div style="width:${s}%;height:10px;background:${scoreColor(s)};border-radius:4px;"></div>
        </div>
      </td>
      <td style="padding:6px 0;font-size:0.82rem;font-weight:700;color:${scoreColor(s)};width:40px;text-align:right;">${s}</td>
    </tr>`;
  }).join("");

  const weakestCards = weakest.map(d => `
    <div style="background:#fff5f5;border-left:4px solid #FF5A3C;padding:12px 14px;border-radius:4px;margin-bottom:10px;">
      <strong style="color:#1e293b;">${d.label} — ${d.score}/100</strong><br/>
      <span style="font-size:0.82rem;color:#475569;">Rooted in Chapter ${d.chapter} (${d.chapterTitle}). This is your highest-leverage fix.</span>
    </div>`).join("");

  const strongestCards = strongest.map(d => `
    <div style="background:#f0fdf4;border-left:4px solid #0E9C74;padding:12px 14px;border-radius:4px;margin-bottom:10px;">
      <strong style="color:#1e293b;">${d.label} — ${d.score}/100</strong><br/>
      <span style="font-size:0.82rem;color:#475569;">Protect this — it's a real advantage, not an accident.</span>
    </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:24px;">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);border-radius:12px;padding:28px 32px;margin-bottom:20px;text-align:center;">
    <div style="font-size:0.75rem;letter-spacing:0.12em;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">KILL BUSYness Organizational Audit</div>
    <h1 style="margin:0;font-size:1.5rem;color:#ffffff;font-weight:700;">${company.name}</h1>
    <div style="font-size:0.82rem;color:#94a3b8;margin-top:6px;">Updated Report — Organizational Health Score</div>
  </div>
  <div style="background:#ffffff;border-radius:12px;padding:28px 32px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="width:130px;text-align:center;vertical-align:top;">
        <svg width="120" height="120" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="58" fill="none" stroke="#F0EEE6" stroke-width="14"/>
          <circle cx="70" cy="70" r="58" fill="none" stroke="${scoreColor(overall)}" stroke-width="14" stroke-linecap="round"
            stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${gaugeOffset}"
            transform="rotate(-90 70 70)"/>
          <text x="70" y="78" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="700" fill="#1e293b">${overall}</text>
        </svg>
        <div style="font-size:0.8rem;color:${scoreColor(overall)};font-weight:700;margin-top:4px;">${bandLabel(overall)}</div>
      </td>
      <td style="padding-left:20px;vertical-align:top;">
        <div style="font-size:0.78rem;color:#64748b;margin-bottom:6px;">Based on ${respondents} respondent${respondents !== 1 ? "s" : ""} · Higher is better (100 = healthiest)</div>
        <p style="margin:0;font-size:0.92rem;color:#1e293b;line-height:1.6;">${bandText(overall)}</p>
        <div style="margin-top:14px;">
          <a href="${reportUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:0.82rem;font-weight:600;">View Full Interactive Report →</a>
        </div>
      </td>
    </tr></table>
  </div>
  <div style="background:#ffffff;border-radius:12px;padding:24px 32px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    <h3 style="margin:0 0 16px;font-size:1rem;color:#0f172a;">Scores by Dimension</h3>
    <table style="width:100%;border-collapse:collapse;">${dimBars}</table>
  </div>
  <div style="background:#ffffff;border-radius:12px;padding:24px 32px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    <h3 style="margin:0 0 14px;font-size:1rem;color:#0f172a;">Areas That Need Attention</h3>
    ${weakestCards}
    <h3 style="margin:20px 0 14px;font-size:1rem;color:#0f172a;">Where You're Strongest</h3>
    ${strongestCards}
  </div>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
    <strong style="color:#9a3412;font-size:0.85rem;">📢 Note on Updated Scores</strong>
    <p style="margin:6px 0 0;font-size:0.82rem;color:#7c2d12;">
      We have updated the scoring model of the KILL BUSYness Audit. Your score now reflects an <strong>Organizational Health Score</strong> — a higher number means higher health and performance.
      A score of 100 means maximum organizational health; 0 means maximum BUSYness. Your report on our portal has been updated automatically.
    </p>
  </div>
  <div style="text-align:center;font-size:0.72rem;color:#94a3b8;padding-top:10px;">
    KILL BUSYness Portal · <a href="https://www.killbusyness.com" style="color:#0f766e;">killbusyness.com</a><br/>
    This is an automated report. Reply to this email if you have any questions.
  </div>
</div></body></html>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const isAuthorized =
    secret === "oictzdcrdqgwawezwjzr" ||
    process.env.NODE_ENV === "development";

  if (!isAuthorized) return new Response("Unauthorized", { status: 401 });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return NextResponse.json({ success: false, error: "RESEND_API_KEY not set" }, { status: 500 });

  const supabase = createAdminClient();
  const { data: companies } = await supabase.from("companies").select("id, name, admin_name, admin_email, admin_user_id");
  const { data: participants } = await supabase.from("participants").select("id, company_id, status");
  const { data: responses }   = await supabase.from("responses").select("participant_id, question_index, answer");

  const resend = new Resend(resendApiKey);
  const results: { company: string; email: string; score: number; status: string }[] = [];

  for (const c of (companies || [])) {
    if (!c.admin_email) continue;
    const cParts = (participants || []).filter(p => p.company_id === c.id);
    const cCompleted = cParts.filter(p => p.status === "completed");
    if (cCompleted.length === 0) continue;

    const cPartIds = cParts.map(p => p.id);
    const cResponses = (responses || []).filter(r => cPartIds.includes(r.participant_id));
    if (cResponses.length === 0) continue;

    // Build answers arrays
    const byP = new Map<string, { question_index: number; answer: number }[]>();
    cResponses.forEach(r => {
      const arr = byP.get(r.participant_id) || [];
      arr.push({ question_index: r.question_index, answer: r.answer });
      byP.set(r.participant_id, arr);
    });
    const participantAnswers: ParticipantAnswers[] = cPartIds.map(id => ({
      participantId: id,
      answers: answersArrayFromRows(byP.get(id) || [])
    }));

    const dimScores = computeDimensionScores(participantAnswers);
    const overall = overallScore(dimScores);

    // Rank dimensions
    const ranked = DIMENSIONS.map(d => ({ ...d, score: dimScores[d.key] ?? 0 })).sort((a, b) => a.score - b.score);
    const weakest = ranked.slice(0, 3);
    const strongest = ranked.slice(-2).reverse();

    const html = buildReportEmail(c, cCompleted.length, overall, dimScores, weakest, strongest);

    try {
      await resend.emails.send({
        from: "KILL BUSYness <admin@killbusyness.com>",
        to: c.admin_email,
        cc: "manoj@managementinnovations.co.in",
        subject: `Your Updated KILL BUSYness Audit Report — ${c.name} (Health Score: ${overall}/100)`,
        html
      });
      results.push({ company: c.name, email: c.admin_email, score: overall, status: "sent" });
    } catch (err: any) {
      results.push({ company: c.name, email: c.admin_email, score: overall, status: `failed: ${err.message}` });
    }

    await new Promise(r => setTimeout(r, 300));
  }

  return NextResponse.json({ success: true, sent: results.length, results });
}
