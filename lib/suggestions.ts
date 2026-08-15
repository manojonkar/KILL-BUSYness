import { DIMENSIONS } from "./dimensions";
import { computeDimensionScores, overallScore, type ParticipantAnswers } from "./scoring";

export interface DimensionResult {
  key: string;
  label: string;
  chapter: number;
  chapterTitle: string;
  score: number;
}

export function rankedDimensions(participants: ParticipantAnswers[]): DimensionResult[] {
  const scores = computeDimensionScores(participants);
  return DIMENSIONS.map((d) => ({
    key: d.key,
    label: d.label,
    chapter: d.chapter,
    chapterTitle: d.chapterTitle,
    score: scores[d.key]
  })).sort((a, b) => b.score - a.score); // highest score first = strongest first
}

// Weakest = lowest scoring dimensions (take from end of descending sort)
export function weakestDimensions(participants: ParticipantAnswers[], n = 3): DimensionResult[] {
  const sorted = rankedDimensions(participants); // highest → lowest
  return sorted.slice(-n).reverse(); // last-N reversed = lowest scored, worst first
}

// Strongest = highest scoring dimensions (take from start of descending sort)
export function strongestDimensions(participants: ParticipantAnswers[], n = 2): DimensionResult[] {
  return rankedDimensions(participants).slice(0, n);
}

export function overallAnalysis(participants: ParticipantAnswers[]): {
  overall: number;
  band: "healthy" | "moderate" | "high-risk";
  summary: string;
} {
  const scores = computeDimensionScores(participants);
  const overall = overallScore(scores);
  // High score = healthy (flipped from old model)
  const band = overall >= 70 ? "healthy" : overall >= 40 ? "moderate" : "high-risk";
  const summary =
    band === "healthy"
      ? "Your organization is running closer to High Performance than BUSYness. Protect what's working and keep the reflection discipline sharp so it doesn't quietly erode."
      : band === "moderate"
      ? "You're carrying a meaningful amount of BUSYness. The gaps below are your highest-leverage places to intervene before they compound."
      : "Your organization is showing significant signs of BUSYness across multiple dimensions. Start with the single weakest dimension below rather than trying to fix everything at once.";
  return { overall, band, summary };
}

export function actionPlanText(d: DimensionResult, index: number): string {
  return `${d.label}: Start with Chapter ${d.chapter} — ${d.chapterTitle}. Run the reflection exercises with your leadership team, then re-survey this dimension in 90 days.`;
}

// High score = green (healthy), low score = red (dysfunctional)
export function scoreColor(score: number): string {
  return score >= 70 ? "#0E9C74" : score >= 40 ? "#D9A441" : "#FF5A3C";
}
