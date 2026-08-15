import { DIMENSIONS, FLAT_QUESTIONS, TOTAL_QUESTIONS } from "./dimensions";

export interface ParticipantAnswers {
  participantId: string;
  answers: number[]; // length TOTAL_QUESTIONS, -1 = unanswered, 0-5 = Likert
}

export interface QuestionScore {
  dimKey: string;
  dimLabel: string;
  chapter: number;
  qIndexInDim: number;
  text: string;
  polarity: string;
  score: number; // 0-100, 100 = healthiest
  count: number;
}

export function computeQuestionScores(participants: ParticipantAnswers[]): QuestionScore[] {
  const respondents = participants.filter((p) => p.answers.some((a) => a >= 0));
  const rows: QuestionScore[] = [];
  FLAT_QUESTIONS.forEach((q, qi) => {
    const dim = DIMENSIONS.find((d) => d.key === q.dimKey)!;
    let sum = 0;
    let count = 0;
    respondents.forEach((p) => {
      if (p.answers[qi] >= 0) {
        sum += p.answers[qi];
        count++;
      }
    });
    const avg = count ? sum / count : 0;
    const rawPct = (avg / 5) * 100;
    const score = count ? Math.round(q.p === "dysfunction" ? 100 - rawPct : rawPct) : 0;
    rows.push({
      dimKey: q.dimKey,
      dimLabel: dim.label,
      chapter: dim.chapter,
      qIndexInDim: q.qIndexInDim,
      text: q.t,
      polarity: q.p,
      score,
      count
    });
  });
  return rows;
}

export function computeDimensionScores(participants: ParticipantAnswers[]): Record<string, number> {
  const qScores = computeQuestionScores(participants);
  const scores: Record<string, number> = {};
  DIMENSIONS.forEach((d) => {
    const rows = qScores.filter((q) => q.dimKey === d.key && q.count > 0);
    scores[d.key] = rows.length ? Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length) : 0;
  });
  return scores;
}

export function overallScore(scores: Record<string, number>): number {
  const vals = Object.values(scores);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

export function answersArrayFromRows(rows: { question_index: number; answer: number }[]): number[] {
  const arr = new Array(TOTAL_QUESTIONS).fill(-1);
  rows.forEach((r) => {
    if (r.question_index >= 0 && r.question_index < TOTAL_QUESTIONS) arr[r.question_index] = r.answer;
  });
  return arr;
}
