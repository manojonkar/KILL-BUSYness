import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SurveyClient from "./SurveyClient";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/dimensions";
import { computeDimensionScores, overallScore } from "@/lib/scoring";

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
    // 3. (Removed single weakest logic as per new requirements)

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

          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Your Dimension Breakdown</h3>
            <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              Here is how you scored across all 10 dimensions of KILL BUSYness. Use this feedback to guide your next actions.
            </p>
            
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
              {Object.entries(scores).map(([key, score], i) => {
                const dimensionObj = DIMENSIONS.find(d => d.key === key);
                const chapterText = dimensionObj ? `chapter no. ${dimensionObj.chapter}` : "the relevant chapter";
                let message = "";
                let color = "";
                if (score >= 70) {
                  message = "Leverage this Strength";
                  color = "#0E9C74"; // Green
                } else if (score >= 50) {
                  message = "You are good. Get coached and be Excellent.";
                  color = "#D9A441"; // Amber
                } else {
                  message = `Please study ${chapterText}`;
                  color = "#FF5A3C"; // Red
                }

                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: i === Object.keys(scores).length - 1 ? "none" : "1px solid #e2e8f0", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <div>
                      <strong style={{ display: "block", color: "#0f172a", marginBottom: 4 }}>{dimensionObj?.label}</strong>
                      <span style={{ color: color, fontSize: ".85rem", fontWeight: 600 }}>{message}</span>
                    </div>
                    <div style={{ fontWeight: 800, color: "#334155", fontSize: "1.1rem" }}>{score}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 32, textAlign: "center", background: "#f1f5f9", padding: 24, borderRadius: 8 }}>
              <p style={{ margin: 0, color: "#334155", fontWeight: 600, fontSize: "1.05rem" }}>
                Come back and take the audit again after 30 days to measure your progress.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">100% Free Organization Audit</span>
          <h2>{state.company_name} — BUSYness Index Survey</h2>
          <p>Answer honestly — this is completely free, confidential and only feeds into your organization&apos;s aggregate report.</p>
          <div style={{ display: "inline-block", marginTop: 12, padding: "4px 12px", background: "#ecfdf5", color: "#047857", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700, border: "1px solid #10b981" }}>
            ✓ Free & Confidential
          </div>
        </div>
        <SurveyClient token={params.token} initialAnswers={state.answers || {}} participantName={state.participant_name} companyName={state.company_name} />
      </main>
    </>
  );
}
