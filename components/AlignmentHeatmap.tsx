"use client";

import { DIMENSIONS } from "@/lib/dimensions";

type QScore = { dimKey: string; count: number; score: number; text: string };

export default function AlignmentHeatmap({ 
  founderQScores, 
  teamQScores 
}: { 
  founderQScores: QScore[]; 
  teamQScores: QScore[]; 
}) {
  return (
    <div style={{ marginTop: 24, width: "100%" }}>
      <h4 style={{ fontSize: ".85rem", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", marginBottom: 16 }}>
        Team Alignment Heatmap (Question by Question)
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {DIMENSIONS.map((d) => {
          const fScores = founderQScores.filter(q => q.dimKey === d.key);
          const tScores = teamQScores.filter(q => q.dimKey === d.key);
          
          if (tScores.every(t => t.count === 0)) return null; // No team responses for this dimension

          return (
            <div key={d.key} style={{ background: "#f8fafc", borderRadius: 8, padding: 16, border: "1px solid #e2e8f0" }}>
              <strong style={{ display: "block", fontSize: ".8rem", color: "#0f172a", marginBottom: 12 }}>{d.label}</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fScores.map((fq, i) => {
                  const tq = tScores[i];
                  if (!tq || tq.count === 0) return null;

                  const gap = fq.score - tq.score;
                  // If gap > 20, red. If gap < -20, blue (team thinks it's better). If between -20 and 20, green (aligned).
                  let color = "#10b981"; // aligned green
                  let bg = "#ecfdf5";
                  let label = "Aligned";

                  if (gap >= 20) {
                    color = "#ef4444"; // red (blind spot)
                    bg = "#fef2f2";
                    label = "Blind Spot";
                  } else if (gap <= -20) {
                    color = "#3b82f6"; // blue (reverse blind spot)
                    bg = "#eff6ff";
                    label = "Underestimated";
                  }

                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 12px", background: bg, borderRadius: 6, borderLeft: `3px solid ${color}` }}>
                      <div style={{ flex: 1, fontSize: ".75rem", color: "#334155", lineHeight: 1.4 }}>{fq.text}</div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 100 }}>
                        <div style={{ fontSize: ".65rem", textTransform: "uppercase", fontWeight: 700, color, letterSpacing: ".05em", marginBottom: 4 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: ".7rem", color: "#64748b" }}>
                          You: <strong style={{ color: "#0f172a" }}>{fq.score}</strong> | Team: <strong style={{ color: "#0f172a" }}>{tq.score}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
