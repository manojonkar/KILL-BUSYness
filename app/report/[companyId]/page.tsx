import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/dimensions";
import { computeDimensionScores, computeQuestionScores, overallScore, answersArrayFromRows, type ParticipantAnswers, filterByLevel } from "@/lib/scoring";
import { weakestDimensions, strongestDimensions, scoreColor } from "@/lib/suggestions";
import { DIMENSION_INSIGHTS, SPRINT_CONTENT, scoreBand, questionNote, overallInterpretation } from "@/lib/insights";
import { touchStreak, evaluateBadges } from "@/lib/gamification";
import PerceptionGapCTA from "@/components/PerceptionGapCTA";
import SprintAssigner from "@/components/SprintAssigner";
import AlignmentHeatmap from "@/components/AlignmentHeatmap";

/* ── helpers ─────────────────────────────────────────────── */
function bandLabel(overall: number) {
  if (overall >= 70) return { label: "High Performance Zone", color: "#0E9C74", bg: "#f0fdf4" };
  if (overall >= 40) return { label: "Build Zone", color: "#D9A441", bg: "#fffbeb" };
  return { label: "Crisis Zone", color: "#FF5A3C", bg: "#fff5f5" };
}

/* ── radar chart (pure SVG, 10 dimensions) ───────────────── */
type ChartDataset = { id: string; label: string; scores: Record<string, number>; color: string; fill?: string; dash?: string };

function RadarChart({ datasets }: { datasets: ChartDataset[] }) {
  const cx = 150, cy = 150, R = 110;
  const keys = DIMENSIONS.map(d => d.key);
  const n = keys.length;
  const angle = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;

  const pt = (i: number, pct: number) => ({
    x: cx + R * pct * Math.cos(angle(i)),
    y: cy + R * pct * Math.sin(angle(i)),
  });

  const rings = [0.25, 0.5, 0.75, 1.0];
  const shortLabels: Record<string, string> = {
    workload: "Workload", purpose: "Purpose", strategy: "Strategy",
    competency: "Competency", reflection: "Reflection", ownership: "Ownership",
    leadership: "Leadership", standards: "Standards", execution: "Execution",
    sustain: "Sustaining"
  };

  return (
    <svg viewBox="0 0 300 300" width="300" height="300" style={{ overflow: "visible" }}>
      {/* Background rings */}
      {rings.map(r => {
        const pts = keys.map((_, i) => pt(i, r));
        return (
          <polygon key={r}
            points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
            fill="none" stroke="#e2e0d8" strokeWidth={r === 1 ? 1.5 : 0.8}
          />
        );
      })}
      {/* Axis lines */}
      {keys.map((_, i) => {
        const outer = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="#e2e0d8" strokeWidth={0.8} />;
      })}
      
      {/* Data polygons */}
      {datasets.map(ds => {
        const dataPoints = keys.map((k, i) => pt(i, (ds.scores[k] ?? 0) / 100));
        const polygonStr = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        return (
          <g key={ds.id}>
            <polygon 
              points={polygonStr} 
              fill={ds.fill || "none"} 
              stroke={ds.color} 
              strokeWidth={ds.dash ? 1.5 : 2} 
              strokeDasharray={ds.dash || "none"}
              strokeLinejoin="round" 
            />
            {/* Data points */}
            {dataPoints.map((p, i) => {
              const s = ds.scores[keys[i]] ?? 0;
              // If it's the primary (founder) dataset, use conditional colors, otherwise use dataset color
              const c = ds.id === "primary" ? (s >= 70 ? "#0E9C74" : s >= 40 ? "#D9A441" : "#FF5A3C") : ds.color;
              return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3.5} fill={c} stroke="#fff" strokeWidth={1} />;
            })}
          </g>
        );
      })}

      {/* Labels */}
      {keys.map((k, i) => {
        const labelR = R + 22;
        const lx = cx + labelR * Math.cos(angle(i));
        const ly = cy + labelR * Math.sin(angle(i));
        const anchor = lx < cx - 5 ? "end" : lx > cx + 5 ? "start" : "middle";
        return (
          <text key={k} x={lx.toFixed(1)} y={ly.toFixed(1)}
            textAnchor={anchor} dominantBaseline="middle"
            fontFamily="Inter, sans-serif" fontSize={9.5} fill="#64748b" fontWeight={500}>
            {shortLabels[k]}
          </text>
        );
      })}
      {/* Ring labels */}
      <text x={cx + 2} y={cy - R * 0.25 - 3} fontSize={7} fill="#94a3b8" textAnchor="middle">25</text>
      <text x={cx + 2} y={cy - R * 0.5 - 3} fontSize={7} fill="#94a3b8" textAnchor="middle">50</text>
      <text x={cx + 2} y={cy - R * 0.75 - 3} fontSize={7} fill="#94a3b8" textAnchor="middle">75</text>
      <text x={cx + 2} y={cy - R - 3} fontSize={7} fill="#94a3b8" textAnchor="middle">100</text>
    </svg>
  );
}

/* ── metadata ─────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: { companyId: string } }) {
  const adminClient = createAdminClient();
  const { data: company } = await adminClient.from("companies").select("name").eq("id", params.companyId).maybeSingle();
  const title = company ? `${company.name} | KILL BUSYness Audit` : "KILL BUSYness Audit";
  const desc = "We just completed our organizational health audit and committed to a 90-day sprint. No more chaos, just execution.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
  
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [`${siteUrl}/api/og?company=${encodeURIComponent(company?.name || "Organization")}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [`${siteUrl}/api/og?company=${encodeURIComponent(company?.name || "Organization")}`],
    }
  };
}

/* ── page ─────────────────────────────────────────────────── */
export default async function ReportPage({ params }: { params: { companyId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = createAdminClient();

  const { data: company } = await adminClient.from("companies").select("*").eq("id", params.companyId).maybeSingle();
  if (!company) notFound();

  if (user && company.admin_user_id === user.id) {
    await touchStreak(supabase);
    await evaluateBadges(supabase, user.id);
  }

  const { data: participantRows } = await adminClient.from("participants").select("id, status, level, name").eq("company_id", company.id);
  const participantIds = (participantRows || []).map(p => p.id);

  const { data: assignments } = await adminClient.from("sprint_assignments").select("*").eq("company_id", company.id);

  const { data: responseRows } = await adminClient
    .from("responses")
    .select("participant_id, question_index, answer")
    .in("participant_id", participantIds.length ? participantIds : ["00000000-0000-0000-0000-000000000000"]);

  const byParticipant = new Map<string, { question_index: number; answer: number }[]>();
  (responseRows || []).forEach(r => {
    const arr = byParticipant.get(r.participant_id) || [];
    arr.push({ question_index: r.question_index, answer: r.answer });
    byParticipant.set(r.participant_id, arr);
  });

  const participants: ParticipantAnswers[] = participantIds.map(id => {
    const pRow = (participantRows || []).find(r => r.id === id);
    return {
      participantId: id,
      level: pRow?.level,
      answers: answersArrayFromRows(byParticipant.get(id) || [])
    };
  });

  const respCount = participants.filter(p => p.answers.some(a => a >= 0)).length;
  const scores = computeDimensionScores(participants);
  const qScores = computeQuestionScores(participants);

  const founderParticipants = filterByLevel(participants, "founder");
  const teamParticipants = participants.filter(p => p.level !== "owner_ceo" && p.level !== "founder"); // Everything else is team

  // Slices for the Radar Chart
  const founderScores = computeDimensionScores(founderParticipants);
  const leadershipScores = computeDimensionScores(filterByLevel(participants, "leadership"));
  const orgScores = computeDimensionScores(filterByLevel(participants, "org"));

  // Slices for the Heatmap
  const founderQScores = computeQuestionScores(founderParticipants);
  const teamQScores = computeQuestionScores(teamParticipants);

  const chartDatasets: ChartDataset[] = [];
  if (Object.values(founderScores).some(v => v > 0)) {
    chartDatasets.push({ id: "primary", label: "Your Perception", scores: founderScores, color: "#0E9C74", fill: "rgba(14,156,116,0.15)" });
  } else {
    // fallback if founder hasn't taken it but others have
    chartDatasets.push({ id: "primary", label: "Organization Profile", scores: scores, color: "#0E9C74", fill: "rgba(14,156,116,0.15)" });
  }
  if (Object.values(leadershipScores).some(v => v > 0)) {
    chartDatasets.push({ id: "leadership", label: "Leadership Reality", scores: leadershipScores, color: "#ea580c", dash: "6,4" });
  }
  if (Object.values(orgScores).some(v => v > 0)) {
    chartDatasets.push({ id: "org", label: "Org Reality", scores: orgScores, color: "#64748b", dash: "2,4" });
  }

  const overall = overallScore(scores);
  const weakest = weakestDimensions(participants, 3);
  const strongest = strongestDimensions(participants, 2);

  const gaugeColor = overall >= 70 ? "#0E9C74" : overall >= 40 ? "#D9A441" : "#FF5A3C";
  const circumference = 2 * Math.PI * 58;
  const band = bandLabel(overall);
  const summaryText = overallInterpretation(overall, weakest[0]?.label ?? "", strongest[0]?.label ?? "");

  // Critical signal: any single question below 20
  const criticalQs = qScores.filter(q => q.count > 0 && q.score < 20);

  const reportDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Header active="Overview" />
      <style dangerouslySetInnerHTML={{ __html: `

        .dim-insight { border-left:3px solid var(--c,#e2e0d8); padding:16px 18px; border-radius:6px; background:var(--bg,#fafaf8); margin-bottom:14px; }
        .dim-insight h5 { margin:0 0 8px; font-size:.88rem; color:#0f172a; }
        .dim-insight p { margin:6px 0 0; font-size:.82rem; color:#475569; line-height:1.6; }
        .dim-insight .label { font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--c); margin-bottom:4px; }
        .sprint-card { border-radius:8px; overflow:hidden; margin-bottom:12px; border:1px solid #e2e0d8; }
        .sprint-head { padding:10px 16px; display:flex; gap:12px; align-items:center; background:#f8f7f4; border-bottom:1px solid #e2e0d8; }
        .sprint-body { padding:12px 16px; font-size:.82rem; color:#475569; line-height:1.65; }
        .sprint-month { font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:3px 8px; border-radius:12px; }
        .q-note { font-size:.74rem; margin-top:3px; color:#94a3b8; }
        .cta-section { background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%); border-radius:12px; padding:32px; text-align:center; color:#fff; margin-top:24px; }
        .cta-section h3 { color:#fff; margin:0 0 10px; }
        .cta-section p { color:#94a3b8; font-size:.88rem; margin:0 0 20px; }
        .cta-btn { display:inline-block; background:#0E9C74; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:700; font-size:.9rem; }
      `}} />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 64px" }}>

        {/* Report Date header & Share */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: ".8rem", color: "var(--ink-faint)" }}>
            KILL BUSYness Organizational Health Audit · {reportDate}
          </div>
          <a 
            href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent("We just completed our organizational health audit via KILL BUSYness. We've identified our blind spots and are committing to a 90-day sprint. No more chaos, just execution.\n\nCheck out the audit here: https://www.killbusyness.com")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#0077b5", borderColor: "#0077b5" }}
            title="Share your commitment on LinkedIn"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Share Commitment
          </a>
        </div>

        {/* ── SECTION 1: Score Header ───────────────────────── */}
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Gauge */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="#F0EEE6" strokeWidth="14" />
                <circle cx="70" cy="70" r="58" fill="none" stroke={gaugeColor} strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - overall / 100)}
                  transform="rotate(-90 70 70)" />
                <text x="70" y="68" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="32" fontWeight={700} fill="#0f172a">{overall}</text>
                <text x="70" y="86" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#94a3b8">out of 100</text>
              </svg>
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: band.color, background: band.bg, borderRadius: 20, padding: "3px 10px", marginTop: 6, display: "inline-block" }}>
                {band.label}
              </div>
            </div>

            {/* Summary */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 4 }}>
                {company.industry || "Organization"} · {respCount} respondent{respCount !== 1 ? "s" : ""}
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: "1.4rem" }}>{company.name}</h2>
              <p style={{ fontSize: ".88rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>{summaryText}</p>

              {respCount === 1 && (
                <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "8px 12px", fontSize: ".78rem", color: "#92400e" }}>
                  ⚠ This report reflects one perspective. Adding more respondents will give you a richer and more accurate picture.
                </div>
              )}
            </div>
          </div>

          {/* Score band legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
            {[{ range: "70–100", label: "High Performance Zone", color: "#0E9C74", bg: "#f0fdf4" },
              { range: "40–69", label: "Build Zone", color: "#D9A441", bg: "#fffbeb" },
              { range: "0–39", label: "Crisis Zone", color: "#FF5A3C", bg: "#fff5f5" }].map(b => (
              <div key={b.range} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: b.color }} />
                <span style={{ color: b.color, fontWeight: 700 }}>{b.range}</span>
                <span style={{ color: "#94a3b8" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical signal callout */}
        {criticalQs.length > 0 && (
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#FF5A3C", marginBottom: 8 }}>
              🚨 Critical Signals — Questions scoring below 20
            </div>
            {criticalQs.map((q, i) => (
              <div key={i} style={{ fontSize: ".82rem", color: "#7f1d1d", marginBottom: 4 }}>
                <strong>{q.score}/100</strong> — {q.text}
              </div>
            ))}
            <p style={{ fontSize: ".78rem", color: "#991b1b", marginTop: 8, marginBottom: 0 }}>
              These represent your most urgent leverage points. Small, focused interventions here will unlock improvement across the rest of the organization.
            </p>
          </div>
        )}

        {/* ── SECTION 2: Radar + Dimension Bars ─────────────── */}
        <div className="grid cols-2" style={{ gap: 20, marginBottom: 20 }}>
          {/* Radar */}
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 16 }}>
              {chartDatasets.length > 1 ? "Perception Gap Analysis" : "Organizational Profile — All 10 Dimensions"}
            </div>
            <RadarChart datasets={chartDatasets} />
            
            {/* Chart Legend */}
            {chartDatasets.length > 1 && (
              <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: ".7rem", fontWeight: 500 }}>
                {chartDatasets.map(ds => (
                  <div key={ds.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ 
                      width: 14, height: 3, background: ds.color, 
                      borderTop: ds.dash ? `2px dashed #fff` : "none" // faux dash
                    }} />
                    <span style={{ color: ds.color }}>{ds.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Perception Gap Blind Spots */}
            {chartDatasets.length > 1 && (
              <div style={{ marginTop: 24, width: "100%" }}>
                {DIMENSIONS.map(d => {
                  const fScore = founderScores[d.key] || 0;
                  const lScore = leadershipScores[d.key] || 0;
                  const oScore = orgScores[d.key] || 0;
                  
                  // A blind spot is when founder is > 20 points higher than the lowest team score
                  const lowestTeamScore = Math.min(lScore > 0 ? lScore : 100, oScore > 0 ? oScore : 100);
                  if (lowestTeamScore === 100) return null; // no team data
                  
                  const gap = fScore - lowestTeamScore;
                  if (gap >= 20) {
                    return (
                      <div key={`gap-${d.key}`} style={{ background: "#fff5f5", borderLeft: "3px solid #ef4444", padding: "12px 16px", borderRadius: "0 6px 6px 0", marginBottom: 12 }}>
                        <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
                          🚨 Perception Blind Spot: {d.label}
                        </div>
                        <p style={{ fontSize: ".82rem", color: "#7f1d1d", margin: 0, lineHeight: 1.5 }}>
                          You rated {d.label} an <strong>{fScore}</strong>, but your team rated it a <strong>{lowestTeamScore}</strong>. This signifies a major disconnect between intent at the top and reality on the ground.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Heatmap */}
            {chartDatasets.length > 1 && (
              <AlignmentHeatmap founderQScores={founderQScores} teamQScores={teamQScores} />
            )}
          </div>

          {/* Show the Magnet CTA only to the founder, and only if no team members have responded yet */}
          {(user && company.admin_user_id === user.id && chartDatasets.length === 1) && (
            <div style={{ gridColumn: "1 / -1" }}>
              <PerceptionGapCTA companyId={company.id} seatsRemaining={company.seats_purchased - participantIds.length} />
            </div>
          )}

          {/* Dimension bars */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 16 }}>
              Scores by Dimension
            </div>
            {DIMENSIONS.map(d => {
              const s = scores[d.key];
              const bc = scoreColor(s);
              return (
                <div key={d.key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", marginBottom: 4 }}>
                    <span style={{ color: "#334155" }}>{d.label}</span>
                    <span style={{ fontWeight: 700, color: bc }}>{s}</span>
                  </div>
                  <div style={{ background: "#f0eee6", borderRadius: 4, height: 8 }}>
                    <div style={{ width: `${s}%`, height: 8, borderRadius: 4, background: bc, transition: "width .4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 3: Diagnostic cards — weakest 3 ──────── */}
        <div className="card" style={{ padding: 26, marginBottom: 20 }}>
          <h4 style={{ marginBottom: 4 }}>Your Highest-Leverage Opportunities</h4>
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginBottom: 20 }}>
            These are the three dimensions with the most room to grow. Each one represents a coaching opportunity — not a failure. The organization that acts on these first will see the fastest compounding improvement.
          </p>
          {weakest.map((d, idx) => {
            const band = scoreBand(d.score);
            const insight = DIMENSION_INSIGHTS[d.key];
            const di = insight?.[band];
            const borderColor = d.score >= 70 ? "#0E9C74" : d.score >= 40 ? "#D9A441" : "#FF5A3C";
            const bgColor = d.score >= 70 ? "#f0fdf4" : d.score >= 40 ? "#fffbeb" : "#fff9f9";
            return (
              <div key={d.key} style={{ "--c": borderColor, "--bg": bgColor } as any} className="dim-insight">
                <div className="label">#{idx + 1} Priority · Ch.{d.chapter} — {d.chapterTitle}</div>
                <h5>{d.label} <span style={{ fontWeight: 400, color: "#94a3b8" }}>— {d.score}/100</span></h5>
                {di && (
                  <>
                    <p><strong style={{ color: "#0f172a" }}>What this score means:</strong> {di.whatItMeans}</p>
                    <p style={{ marginTop: 8 }}><strong style={{ color: "#0f172a" }}>You&apos;re likely experiencing:</strong> {di.symptom}</p>
                    <p style={{ marginTop: 8 }}><strong style={{ color: borderColor }}>Your one move:</strong> {di.oneMove}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ── SECTION 4: Strength cards ─────────────────────── */}
        <div className="card" style={{ padding: 26, marginBottom: 20 }}>
          <h4 style={{ marginBottom: 4 }}>Your Organizational Strengths</h4>
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginBottom: 20 }}>
            These dimensions are working well and give you a real foundation to build from. Understanding why they&apos;re strong — and what risks could erode them — is as important as addressing the gaps.
          </p>
          {strongest.map(d => {
            const insight = DIMENSION_INSIGHTS[d.key];
            return (
              <div key={d.key} style={{ "--c": "#0E9C74", "--bg": "#f0fdf4" } as any} className="dim-insight">
                <div className="label">✦ Strength · Ch.{d.chapter} — {d.chapterTitle}</div>
                <h5>{d.label} <span style={{ fontWeight: 400, color: "#94a3b8" }}>— {d.score}/100</span></h5>
                {insight && <p>{insight.strengthNote}</p>}
              </div>
            );
          })}
        </div>

        {/* ── SECTION 5: 90-day sprint ──────────────────────── */}
        <div className="card" style={{ padding: 26, marginBottom: 20 }}>
          <h4 style={{ marginBottom: 4 }}>Your 90-Day Action Sprint</h4>
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginBottom: 20 }}>
            One month. One dimension. One move. The most effective organizations don&apos;t fix everything at once — they sequence their interventions so each one builds on the last.
          </p>
          {weakest.map((d, i) => {
            const sprint = SPRINT_CONTENT[d.key];
            if (!sprint) return null;
            const months = [
              { label: `Month ${i * 1 + 1}`, text: i === 0 ? sprint.month1 : i === 1 ? sprint.month2 : sprint.month3, color: "#0E9C74" },
            ];
            const monthText = i === 0 ? sprint.month1 : i === 1 ? sprint.month2 : sprint.month3;
            const mColor = i === 0 ? "#0E9C74" : i === 1 ? "#D9A441" : "#64748b";
            return (
              <div key={d.key} className="sprint-card">
                <div className="sprint-head">
                  <span className="sprint-month" style={{ background: mColor + "20", color: mColor }}>Month {i + 1}</span>
                  <strong style={{ fontSize: ".88rem", color: "#0f172a" }}>{d.label}</strong>
                  <span style={{ fontSize: ".75rem", color: "#94a3b8", marginLeft: "auto" }}>Score: {d.score}/100</span>
                </div>
                <div className="sprint-body">
                  {monthText}
                  <SprintAssigner 
                    companyId={company.id}
                    monthIndex={i}
                    taskTitle={d.label}
                    participants={(participantRows || []).map(p => ({ id: p.id, name: p.name || "Team Member" }))}
                    existingAssignment={assignments?.find(a => a.month_index === i)}
                  />
                  {i === 0 && (
                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ display: "block", fontSize: ".85rem", color: "#0f172a" }}>Need more detail?</strong>
                        <span style={{ fontSize: ".75rem", color: "#64748b" }}>Generate a printable action plan for this dimension.</span>
                      </div>
                      <a href={`/report/${company.id}/playbook/${d.key}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Generate Playbook
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8f7f4", borderRadius: 8, fontSize: ".8rem", color: "#64748b" }}>
            <strong style={{ color: "#0f172a" }}>After 90 days:</strong> Re-run this survey. Compare the scores. The change — or the resistance to change — will tell you exactly what to focus on next.
          </div>
        </div>

        {/* ── SECTION 5.5: Founder Actions ────────────────────── */}
        <div className="card" style={{ padding: 26, marginBottom: 20, background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #cbd5e1" }}>
          <h4 style={{ marginBottom: 4, color: "#0f172a" }}>Your Next Steps</h4>
          <p style={{ fontSize: ".88rem", color: "#475569", marginBottom: 20, fontWeight: 500 }}>
            Please see the most suitable options for your organization:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Have the leadership team complete studying the book",
              "Organize a Leader Briefing Session with a KILL BUSYness expert to help the leadership team get better insights and sort out their doubts",
              "Refer Chapter 9 for creating a detailed implementation plan",
              "Organize a 2 day KILL BUSYness workshop",
              "Do deeper work on Organization Development by going for OD Consulting or attending the ODeX Workshop (OD for Extraordinary Organizations)"
            ].map((option, idx) => (
              <div key={idx} style={{ background: "#fff", padding: "16px 20px", borderRadius: 8, borderLeft: "4px solid #0E9C74", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ background: "#f0fdf4", color: "#0E9C74", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <p style={{ margin: 0, fontSize: ".9rem", color: "#334155", lineHeight: 1.5 }}>
                  {option}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 6: Question-by-question breakdown ─────── */}
        <div className="card" style={{ padding: 26, marginBottom: 20 }}>
          <h4 style={{ marginBottom: 4 }}>Full Diagnostic Breakdown — Question by Question</h4>
          <p style={{ fontSize: ".78rem", color: "var(--ink-faint)", marginBottom: 20 }}>
            Every question scored 0–100 (higher = stronger). These are your raw signals — the specific beliefs and behaviours your organization holds right now.
          </p>
          {DIMENSIONS.map(d => {
            const rows = qScores.filter(q => q.dimKey === d.key);
            const ds = scores[d.key];
            return (
              <div style={{ marginBottom: 22 }} key={d.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                    {d.label} · Ch.{d.chapter}
                  </div>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: scoreColor(ds) }}>{ds}/100</div>
                </div>
                {rows.map(r => {
                  const qb = scoreBand(r.score);
                  const note = questionNote(r.score, qb);
                  const noteColor = qb === "high" ? "#0E9C74" : qb === "mid" ? "#D9A441" : "#FF5A3C";
                  const prefix = qb === "high" ? "✓" : qb === "mid" ? "△" : "⚠";
                  return (
                    <div key={r.qIndexInDim} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", marginBottom: 3 }}>
                        <span style={{ maxWidth: "84%", color: "#334155", lineHeight: 1.5 }}>{r.text}</span>
                        <span style={{ fontWeight: 700, color: scoreColor(r.score), flexShrink: 0, marginLeft: 8 }}>{r.count ? r.score : "—"}</span>
                      </div>
                      <div style={{ background: "#f0eee6", borderRadius: 4, height: 6, marginBottom: 4 }}>
                        <div style={{ width: `${r.score}%`, height: 6, borderRadius: 4, background: scoreColor(r.score) }} />
                      </div>
                      {r.count > 0 && (
                        <div className="q-note" style={{ color: noteColor }}>{prefix} {note}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── SECTION 7: Chapter re-read recommendations ───── */}
        <div className="card" style={{ padding: 26, marginBottom: 24 }}>
          <h4 style={{ marginBottom: 4 }}>Recommended Reading — Based on Your Results</h4>
          <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginBottom: 16 }}>
            The chapters below are directly relevant to your biggest opportunities. Re-reading them with your current scores in mind will unlock a different layer of insight than the first reading.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {weakest.map(d => {
              const sprint = SPRINT_CONTENT[d.key];
              const bc = scoreColor(d.score);
              return (
                <div key={d.key} style={{ border: `1px solid ${bc}40`, borderLeft: `3px solid ${bc}`, borderRadius: 6, padding: "12px 14px", background: "#fafaf8" }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: bc, marginBottom: 4 }}>Priority Reading</div>
                  <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{sprint?.reread ?? `Chapter ${d.chapter}`}</div>
                  <div style={{ fontSize: ".78rem", color: "#64748b" }}>{d.label} · Current score: {d.score}/100</div>
                </div>
              );
            })}
            {strongest.map(d => {
              const sprint = SPRINT_CONTENT[d.key];
              return (
                <div key={d.key} style={{ border: "1px solid #0E9C7440", borderLeft: "3px solid #0E9C74", borderRadius: 6, padding: "12px 14px", background: "#fafaf8" }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#0E9C74", marginBottom: 4 }}>Consolidate Your Strength</div>
                  <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{sprint?.reread ?? `Chapter ${d.chapter}`}</div>
                  <div style={{ fontSize: ".78rem", color: "#64748b" }}>{d.label} · Current score: {d.score}/100</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 8: CTA ────────────────────────────────── */}
        <div className="cta-section no-print">
          <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#0E9C74", marginBottom: 10 }}>
            You don&apos;t have to do this alone
          </div>
          <h3>Let&apos;s talk about what this means for your organization.</h3>
          <p>
            This report is a starting point, not a final verdict. If you&apos;d like to explore what these results mean in the context of your specific challenges — or how to design an intervention that actually sticks — we&apos;d love to hear from you.
          </p>
          <a href="mailto:manoj@managementinnovations.co.in?subject=KILL BUSYness Audit — %7Bcompany name%7D" className="cta-btn">
            Reach out to Manoj →
          </a>
          <div style={{ marginTop: 12, fontSize: ".75rem", color: "#64748b" }}>
            Reply to this email or write to manoj@managementinnovations.co.in
          </div>
        </div>

      </main>
    </>
  );
}
