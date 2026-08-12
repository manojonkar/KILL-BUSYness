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
  })).sort((a, b) => a.score - b.score);
}

export function weakestDimensions(participants: ParticipantAnswers[], n = 3): DimensionResult[] {
  const sorted = rankedDimensions(participants);
  return sorted.slice(-n).reverse();
}

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
  const band = overall <= 30 ? "healthy" : overall <= 60 ? "moderate" : "high-risk";
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

export function scoreColor(score: number): string {
  return score <= 30 ? "#0E9C74" : score <= 60 ? "#D9A441" : "#FF5A3C";
}
