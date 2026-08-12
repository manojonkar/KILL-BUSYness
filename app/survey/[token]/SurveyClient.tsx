"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DIMENSIONS, TOTAL_QUESTIONS } from "@/lib/dimensions";
import { submitAnswer, completeSurvey } from "./actions";

const LABELS = ["Never", "Rarely", "Sometimes", "Often", "Very Often", "Always"];

export default function SurveyClient({
  token,
  initialAnswers,
  participantName,
  companyName
}: {
  token: string;
  initialAnswers: Record<string, number>;
  participantName: string;
  companyName: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const m: Record<number, number> = {};
    Object.entries(initialAnswers || {}).forEach(([k, v]) => (m[Number(k)] = Number(v)));
    return m;
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const answeredCount = Object.keys(answers).length;

  function setAnswer(gi: number, val: number) {
    setAnswers((prev) => ({ ...prev, [gi]: val }));
    startTransition(() => {
      submitAnswer(token, gi, val);
    });
  }

  function submit() {
    startTransition(async () => {
      await completeSurvey(token);
      router.refresh();
    });
  }

  let qi = -1;

  return (
    <>
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <p style={{ fontSize: ".85rem", color: "var(--ink-soft)" }}>
          Taking the survey as <strong>{participantName}</strong> for <strong>{companyName}</strong>
        </p>
        <div className="survey-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.round((100 * answeredCount) / TOTAL_QUESTIONS)}%` }} />
          </div>
          <p style={{ fontSize: ".78rem", color: "var(--ink-faint)", marginTop: 6 }}>
            {answeredCount} of {TOTAL_QUESTIONS} answered
          </p>
        </div>
      </div>
      {DIMENSIONS.map((d) => (
        <div className="card dim-block" key={d.key}>
          <h4>{d.label}</h4>
          <span className="chapter-link">
            Rooted in Chapter {d.chapter} · {d.chapterTitle}
          </span>
          {d.qs.map((q) => {
            qi++;
            const gi = qi;
            const val = answers[gi];
            return (
              <div className="q-row" key={gi}>
                <p>{q.t}</p>
                <div className="likert">
                  {LABELS.map((l, li) => (
                    <button key={li} type="button" className={val === li ? "active" : ""} title={`${li} — ${l}`} onClick={() => setAnswer(gi, li)}>
                      <span style={{ display: "block", fontSize: "1rem", lineHeight: 1.1 }}>{li}</span>
                      <span style={{ display: "block", fontSize: ".58rem", fontWeight: 600, opacity: 0.75, marginTop: 3, lineHeight: 1.15 }}>{l}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <button className="btn btn-primary" disabled={answeredCount < TOTAL_QUESTIONS || isPending} onClick={submit}>
        Submit Survey
      </button>
    </>
  );
}
