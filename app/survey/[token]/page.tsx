import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SurveyClient from "./SurveyClient";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/dimensions";
import { computeDimensionScores, overallScore } from "@/lib/scoring";
import { weakestDimensions } from "@/lib/suggestions";
import { DIMENSION_INSIGHTS, scoreBand } from "@/lib/insights";

export default async function SurveyPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_survey_state", { p_token: params.token });
  const state = data?.[0];
  if (error || !state) notFound();

  if (state.status === "completed") {
    // 1. Convert answers dict to array of exactly 40 slots
    const arr = Array.from({ length: 40 }, () => -1);
    if (state.answers) {
      Object.entries(state.answers).forEach(([k, v]) => {
        arr[Number(k)] = Number(v);
      });
    }

    // 2. Compute personal score
    const participant = { participantId: "me", level: "employee", answers: arr };
    const scores = computeDimensionScores([participant]);
    const overall = overallScore(scores);
    const weakest = weakestDimensions([participant], 1)[0];
    
    // 3. Get insights for their weakest dimension
    let tips = null;
    if (weakest) {
      const band = scoreBand(weakest.score);
      tips = DIMENSION_INSIGHTS[weakest.key]?.[band];
    }

    return (
      <>
        <Header active="" />
        <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 16px" }}>
          <div className="card" style={{ padding: 40, textAlign: "center", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#fff", marginBottom: 20 }}>
            <h2 style={{ fontSize: "2rem", marginBottom: 8, color: "#fff" }}>Thanks, {state.participant_name}</h2>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: 30 }}>
              Your survey for <strong>{state.company_name}</strong> has been successfully submitted.
            </p>
            
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 30 }}>
              <div style={{ fontSize: ".85rem", textTransform: "uppercase", letterSpacing: ".1em", color: "#94a3b8", marginBottom: 12 }}>
                Your Personal BUSYness Score
              </div>
              <div style={{ fontSize: "4rem", fontWeight: 900, color: overall >= 70 ? "#0E9C74" : overall >= 40 ? "#D9A441" : "#FF5A3C", lineHeight: 1 }}>
                {overall}
                <span style={{ fontSize: "1.5rem", color: "#475569" }}>/100</span>
              </div>
            </div>
          </div>

          {tips && (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ marginBottom: 16 }}>Your High-Leverage Opportunity</h3>
              <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
                Based on your answers, your biggest opportunity to protect your time and energy is in <strong>{weakest.label}</strong>. Here are 3 things you can do differently starting tomorrow:
              </p>
              
              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 8, borderLeft: "4px solid #0E9C74" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: 12, color: "#0f172a" }}>Your one move</h4>
                <p style={{ fontSize: ".95rem", color: "#334155", margin: 0, lineHeight: 1.6 }}>
                  {tips.oneMove}
                </p>
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: ".85rem", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", marginBottom: 8 }}>Why this matters</h4>
                  <p style={{ fontSize: ".85rem", color: "#475569", margin: 0 }}>{tips.whatItMeans}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Organization Audit</span>
          <h2>{state.company_name} — BUSYness Index Survey</h2>
          <p>Answer honestly — this is confidential and only feeds into your organization&apos;s aggregate report.</p>
        </div>
        <SurveyClient token={params.token} initialAnswers={state.answers || {}} participantName={state.participant_name} companyName={state.company_name} />
      </main>
    </>
  );
}
