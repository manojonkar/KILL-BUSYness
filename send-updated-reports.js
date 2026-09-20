/**
 * send-updated-reports.js
 * Sends the revised (high=good) audit report to every company that has completed survey responses.
 * Run once from the project root: node send-updated-reports.js
 */
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://oictzdcrdqgwawezwjzr.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("ERROR: RESEND_API_KEY env var not set. Run as: RESEND_API_KEY=re_xxx node send-updated-reports.js");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const DIMENSIONS = [
  { key: "workload",    label: "BUSYness & Workload Pressure", chapter: 1, chapterTitle: "The BUSYness Mirror",    qCount: 3 },
  { key: "purpose",    label: "Purpose",                       chapter: 2, chapterTitle: "Purpose",                qCount: 4 },
  { key: "strategy",   label: "Strategy",                      chapter: 3, chapterTitle: "Strategy",               qCount: 5 },
  { key: "competency", label: "Competency Chain",              chapter: 4, chapterTitle: "The Competency Chain",   qCount: 7 },
  { key: "reflection", label: "Reflection & Learning",         chapter: 5, chapterTitle: "Reflection",             qCount: 3 },
  { key: "ownership",  label: "Ownership",                     chapter: 6, chapterTitle: "Ownership",              qCount: 3 },
  { key: "leadership", label: "Leadership",                    chapter: 7, chapterTitle: "Leadership Creates",     qCount: 2 },
  { key: "standards",  label: "Standards",                     chapter: 8, chapterTitle: "Assert the Standard",    qCount: 4 },
  { key: "execution",  label: "Execution & Build",             chapter: 9, chapterTitle: "Build",                  qCount: 6 },
  { key: "sustain",    label: "Sustaining Greatness",          chapter: 10, chapterTitle: "Sustaining Greatness",  qCount: 3 }
];
const TOTAL_Q = DIMENSIONS.reduce((a, d) => a + d.qCount, 0);

function scoreColor(s) { return s >= 70 ? "#0E9C74" : s >= 40 ? "#D9A441" : "#FF5A3C"; }
function scoreBg(s)    { return s >= 70 ? "#ccfbf1" : s >= 40 ? "#fef3c7" : "#fee2e2"; }
function band(s)       { return s >= 70 ? "✅ Healthy" : s >= 40 ? "⚠️ Moderate" : "🔴 At Risk"; }
function bandText(s)   {
  return s >= 70
    ? "Your organization is running closer to High Performance than BUSYness. Protect what's working and keep the reflection discipline sharp."
    : s >= 40
    ? "You're carrying a meaningful amount of BUSYness. The gaps below are your highest-leverage places to intervene before they compound."
    : "Your organization is showing significant signs of BUSYness. Start with the single weakest dimension below rather than trying to fix everything at once.";
}

function computeScores(responsesRows) {
  const qSums = new Array(TOTAL_Q).fill(0);
  const qCounts = new Array(TOTAL_Q).fill(0);
  responsesRows.forEach(r => {
    if (r.question_index >= 0 && r.question_index < TOTAL_Q && r.answer >= 0) {
      qSums[r.question_index] += r.answer;
      qCounts[r.question_index]++;
    }
  });

  let dimStart = 0;
  const dimScores = {};
  DIMENSIONS.forEach(d => {
    const scores = [];
    for (let i = dimStart; i < dimStart + d.qCount; i++) {
      if (qCounts[i] > 0) scores.push(Math.round((qSums[i] / qCounts[i] / 5) * 100));
    }
    dimScores[d.key] = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    dimStart += d.qCount;
  });

  const vals = Object.values(dimScores);
  const overall = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

  // Sort dimensions for insights
  const sorted = DIMENSIONS.map(d => ({ ...d, score: dimScores[d.key] })).sort((a, b) => a.score - b.score);
  const weakest = sorted.slice(0, 3);   // lowest scored = needs attention
  const strongest = sorted.slice(-2).reverse(); // highest scored = strengths

  return { dimScores, overall, weakest, strongest };
}

function buildEmailHtml(company, respondents, overall, dimScores, weakest, strongest) {
  const circumference = 2 * Math.PI * 58;
  const gaugeOffset = circumference * (1 - overall / 100);
  const gaugeCol = scoreColor(overall);
  const reportUrl = `https://www.killbusyness.com/report/${company.id}`;

  // Dimension bars
  const dimBars = DIMENSIONS.map(d => {
    const s = dimScores[d.key];
    return `
      <tr>
        <td style="padding: 6px 0; font-size: 0.82rem; color: #1e293b; width: 50%">${d.label}</td>
        <td style="padding: 6px 8px;">
          <div style="background: #f0eee6; border-radius: 4px; height: 10px; overflow: hidden;">
            <div style="width: ${s}%; height: 10px; background: ${scoreColor(s)}; border-radius: 4px;"></div>
          </div>
        </td>
        <td style="padding: 6px 0; font-size: 0.82rem; font-weight: 700; color: ${scoreColor(s)}; width: 40px; text-align: right;">${s}</td>
      </tr>`;
  }).join("");

  const weakestCards = weakest.map(d => `
    <div style="background: #fff5f5; border-left: 4px solid #FF5A3C; padding: 12px 14px; border-radius: 4px; margin-bottom: 10px;">
      <strong style="color: #1e293b;">${d.label} — ${d.score}/100</strong><br/>
      <span style="font-size: 0.82rem; color: #475569;">Rooted in Chapter ${d.chapter} (${d.chapterTitle}). This is your highest-leverage fix.</span>
    </div>`).join("");

  const strongestCards = strongest.map(d => `
    <div style="background: #f0fdf4; border-left: 4px solid #0E9C74; padding: 12px 14px; border-radius: 4px; margin-bottom: 10px;">
      <strong style="color: #1e293b;">${d.label} — ${d.score}/100</strong><br/>
      <span style="font-size: 0.82rem; color: #475569;">Protect this — it's a real advantage, not an accident.</span>
    </div>`).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f8fafc; font-family: 'Segoe UI', sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); border-radius: 12px; padding: 28px 32px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 0.75rem; letter-spacing: 0.12em; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">KILL BUSYness Organizational Audit</div>
      <h1 style="margin: 0; font-size: 1.5rem; color: #ffffff; font-weight: 700;">${company.name}</h1>
      <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 6px;">Updated Report — Organizational Health Score</div>
    </div>

    <!-- Score card -->
    <div style="background: #ffffff; border-radius: 12px; padding: 28px 32px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
      <div style="display: flex; align-items: center; gap: 24px;">
        <!-- SVG gauge inline -->
        <div style="text-align: center; min-width: 120px;">
          <svg width="120" height="120" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="70" r="58" fill="none" stroke="#F0EEE6" stroke-width="14"/>
            <circle cx="70" cy="70" r="58" fill="none" stroke="${gaugeCol}" stroke-width="14" stroke-linecap="round"
              stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${gaugeOffset.toFixed(2)}"
              transform="rotate(-90 70 70)"/>
            <text x="70" y="78" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="700" fill="#1e293b">${overall}</text>
          </svg>
          <div style="font-size: 0.8rem; color: ${gaugeCol}; font-weight: 700; margin-top: 4px;">${band(overall)}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 0.78rem; color: #64748b; margin-bottom: 6px;">Based on ${respondents} respondent${respondents !== 1 ? "s" : ""} · Higher is better (100 = healthiest)</div>
          <p style="margin: 0; font-size: 0.92rem; color: #1e293b; line-height: 1.6;">${bandText(overall)}</p>
          <div style="margin-top: 14px;">
            <a href="${reportUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">View Full Interactive Report →</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Dimension scores -->
    <div style="background: #ffffff; border-radius: 12px; padding: 24px 32px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
      <h3 style="margin: 0 0 16px; font-size: 1rem; color: #0f172a;">Scores by Dimension</h3>
      <table style="width: 100%; border-collapse: collapse;">${dimBars}</table>
    </div>

    <!-- Insights -->
    <div style="background: #ffffff; border-radius: 12px; padding: 24px 32px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
      <h3 style="margin: 0 0 14px; font-size: 1rem; color: #0f172a;">Areas That Need Attention</h3>
      ${weakestCards}
      <h3 style="margin: 20px 0 14px; font-size: 1rem; color: #0f172a;">Where You're Strongest</h3>
      ${strongestCards}
    </div>

    <!-- Important note -->
    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
      <strong style="color: #9a3412; font-size: 0.85rem;">📢 Note on Updated Scores</strong>
      <p style="margin: 6px 0 0; font-size: 0.82rem; color: #7c2d12;">
        We have updated the scoring model of the KILL BUSYness Audit. Your score now reflects an <strong>Organizational Health Score</strong> — a higher number means higher health and performance. 
        A score of 100 means maximum organizational health; 0 means maximum BUSYness. Your report on our portal has been updated automatically.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 0.72rem; color: #94a3b8; padding-top: 10px;">
      KILL BUSYness Portal · <a href="https://www.killbusyness.com" style="color: #0f766e;">killbusyness.com</a><br/>
      This is an automated report. Reply to this email if you have any questions.
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const { data: companies } = await sb.from("companies").select("id, name, admin_name, admin_email, admin_user_id");
  const { data: participants } = await sb.from("participants").select("id, company_id, name, email, status, level");
  const { data: responses } = await sb.from("responses").select("participant_id, question_index, answer");

  const toEmail = [];

  for (const c of (companies || [])) {
    const cParts = (participants || []).filter(p => p.company_id === c.id);
    const cCompleted = cParts.filter(p => p.status === "completed");
    if (cCompleted.length === 0 || !c.admin_email) continue;

    const cPartIds = cParts.map(p => p.id);
    const cResponses = (responses || []).filter(r => cPartIds.includes(r.participant_id));
    if (cResponses.length === 0) continue;

    const { dimScores, overall, weakest, strongest } = computeScores(cResponses);
    toEmail.push({ company: c, respondents: cCompleted.length, overall, dimScores, weakest, strongest });
  }

  console.log(`Found ${toEmail.length} companies to email.`);

  // Send via Resend
  const { Resend } = require("resend");
  const resend = new Resend(RESEND_API_KEY);

  for (const entry of toEmail) {
    const { company, respondents, overall, dimScores, weakest, strongest } = entry;
    const html = buildEmailHtml(company, respondents, overall, dimScores, weakest, strongest);

    try {
      const res = await resend.emails.send({
        from: "KILL BUSYness <admin@killbusyness.com>",
        to: company.admin_email,
        subject: `Your Updated KILL BUSYness Audit Report — ${company.name} (Health Score: ${overall}/100)`,
        html
      });
      console.log(`✅ Sent to ${company.admin_email} (${company.name}) | Score: ${overall}/100 | ID: ${res.data?.id || "?"}`);
    } catch (err) {
      console.error(`❌ Failed for ${company.admin_email} (${company.name}):`, err.message);
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\nDone. All emails dispatched.");
}

main().catch(console.error);
