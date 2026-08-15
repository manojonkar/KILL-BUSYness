import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PrintButton from "./PrintButton";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/dimensions";
import { computeDimensionScores, computeQuestionScores, overallScore, answersArrayFromRows, type ParticipantAnswers } from "@/lib/scoring";
import { weakestDimensions, strongestDimensions, overallAnalysis, actionPlanText, scoreColor } from "@/lib/suggestions";
import { touchStreak, evaluateBadges } from "@/lib/gamification";

export default async function ReportPage({ params }: { params: { companyId: string } }) {
  // Try session-based client first (for logged-in admin)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Always use admin client to fetch report data — makes the link work from email too
  const adminClient = createAdminClient();

  const { data: company } = await adminClient.from("companies").select("*").eq("id", params.companyId).maybeSingle();
  if (!company) notFound();

  // Only run gamification for the actual company admin
  if (user && company.admin_user_id === user.id) {
    await touchStreak(supabase);
    await evaluateBadges(supabase, user.id);
  }

  const { data: participantRows } = await adminClient.from("participants").select("id, status").eq("company_id", company.id);
  const participantIds = (participantRows || []).map((p) => p.id);

  const { data: responseRows } = await adminClient
    .from("responses")
    .select("participant_id, question_index, answer")
    .in("participant_id", participantIds.length ? participantIds : ["00000000-0000-0000-0000-000000000000"]);

  const byParticipant = new Map<string, { question_index: number; answer: number }[]>();
  (responseRows || []).forEach((r) => {
    const arr = byParticipant.get(r.participant_id) || [];
    arr.push({ question_index: r.question_index, answer: r.answer });
    byParticipant.set(r.participant_id, arr);
  });

  const participants: ParticipantAnswers[] = participantIds.map((id) => ({
    participantId: id,
    answers: answersArrayFromRows(byParticipant.get(id) || [])
  }));

  const respCount = participants.filter((p) => p.answers.some((a) => a >= 0)).length;
  const scores = computeDimensionScores(participants);
  const qScores = computeQuestionScores(participants);
  const overall = overallScore(scores);
  const weakest = weakestDimensions(participants, 3);
  const strongest = strongestDimensions(participants, 2);
  const analysis = overallAnalysis(participants);

  const gaugeColor = overall >= 70 ? "#0E9C74" : overall >= 40 ? "#D9A441" : "#FF5A3C";
  const circumference = 2 * Math.PI * 58;

  return (
    <>
      <Header active="Overview" />
      <style dangerouslySetInnerHTML={{ __html: "@media print{.utilitybar,.topbar,.no-print,footer.foot{display:none!important}body{background:#fff}main{padding:0;max-width:none}.card{box-shadow:none;border:1px solid #ddd;break-inside:avoid;page-break-inside:avoid}.grid.cols-2{grid-template-columns:1fr}}" }} />
      <main>
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <PrintButton />
        </div>
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div className="gauge-wrap">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="#F0EEE6" strokeWidth="14" />
              <circle
                cx="70"
                cy="70"
                r="58"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - overall / 100)}
                transform="rotate(-90 70 70)"
              />
              <text x="70" y="78" textAnchor="middle" fontFamily="Space Grotesk" fontSize="30" fontWeight={700}>
                {overall}
              </text>
            </svg>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3>{company.name}</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: ".88rem", margin: "8px 0" }}>
                Organizational Health Score based on {respCount} respondent{respCount !== 1 ? "s" : ""} across your organization. Higher is
                better: 100 is the healthiest, 0 is most dysfunctional.
              </p>
              <p style={{ fontSize: ".9rem" }}>{analysis.summary}</p>
            </div>
          </div>
        </div>

        <div className="grid cols-2">
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 16 }}>Scores by dimension</h4>
            {DIMENSIONS.map((d) => {
              const s = scores[d.key];
              return (
                <div className="bar-dim" key={d.key}>
                  <div className="lbl">
                    <span>{d.label}</span>
                    <span>{s}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${s}%`, background: scoreColor(s) }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 14 }}>Areas that need attention</h4>
              {weakest.map((d) => (
                <div className="insight-card" key={d.key}>
                  <strong>
                    {d.label} — {d.score}/100.
                  </strong>{" "}
                  Rooted in Chapter {d.chapter} ({d.chapterTitle}). This is your highest-leverage fix.
                </div>
              ))}
              <h4 style={{ margin: "18px 0 14px" }}>Where you&apos;re strongest</h4>
              {strongest.map((d) => (
                <div className="insight-card pos" key={d.key}>
                  <strong>
                    {d.label} — {d.score}/100.
                  </strong>{" "}
                  Protect this — it&apos;s a real advantage, not an accident.
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 26, marginTop: 16 }}>
          <h4 style={{ marginBottom: 10 }}>Your Action Plan</h4>
          {weakest.map((d, i) => (
            <div className="action-item" key={d.key}>
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <div>{actionPlanText(d, i)}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 26, marginTop: 16 }}>
          <h4 style={{ marginBottom: 4 }}>Question-by-Question Breakdown</h4>
          <p style={{ fontSize: ".78rem", color: "var(--ink-faint)", marginBottom: 16 }}>
            Every question is scored 0–100 (higher = stronger) — dimension scores above are simply the
            average of the questions within them.
          </p>
          {DIMENSIONS.map((d) => {
            const rows = qScores.filter((q) => q.dimKey === d.key);
            return (
              <div style={{ marginBottom: 18 }} key={d.key}>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>
                  {d.label} — Ch.{d.chapter}
                </div>
                {rows.map((r) => (
                  <div className="bar-dim" key={r.qIndexInDim}>
                    <div className="lbl">
                      <span style={{ maxWidth: "82%" }}>{r.text}</span>
                      <span>{r.count ? r.score : "—"}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${r.score}%`, background: scoreColor(r.score) }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
