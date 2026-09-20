"use client";

import { useState } from "react";
import { Quiz } from "@/lib/quizzes";
import { submitQuizAction } from "./actions";

export default function QuizClient({ quiz, maxScore, chapterId }: { quiz: Quiz, maxScore: number, chapterId: number }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number, creditsEarned: number } | null>(null);

  const handleSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return; // Prevent changing after submit
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return (correct / quiz.questions.length) * 100;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setSubmitting(true);
    const score = calculateScore();
    
    const res = await submitQuizAction(chapterId, score);
    if ("success" in res && res.success) {
      setResult({ score: res.totalScore!, creditsEarned: res.creditsEarned! });
      setSubmitted(true);
    } else {
      alert("Error submitting score.");
    }
    setSubmitting(false);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div style={{ marginTop: 24 }}>
      {maxScore > 0 && !submitted && (
        <div style={{ padding: "12px 16px", background: "#f0fdf4", color: "#166534", borderRadius: 8, marginBottom: 24, fontSize: "0.9rem", fontWeight: 600 }}>
          Your previous best score is {maxScore}%. Improve it to earn more MI Credits!
        </div>
      )}

      {quiz.questions.map((q, idx) => {
        const selected = answers[q.id];
        const isCorrect = selected === q.correctAnswer;
        
        return (
          <div key={q.id} style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: 16 }}>{idx + 1}. {q.text}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {q.options.map((opt, optIdx) => {
                let bg = "#fff";
                let border = "1px solid #cbd5e1";
                
                if (submitted) {
                  if (optIdx === q.correctAnswer) {
                    bg = "#dcfce7"; // Green for correct
                    border = "1px solid #22c55e";
                  } else if (selected === optIdx && !isCorrect) {
                    bg = "#fee2e2"; // Red for incorrect selected
                    border = "1px solid #ef4444";
                  }
                } else if (selected === optIdx) {
                  bg = "#f1f5f9";
                  border = "1px solid #3b82f6";
                }
                
                return (
                  <div 
                    key={optIdx} 
                    onClick={() => handleSelect(q.id, optIdx)}
                    style={{ 
                      padding: "12px 16px", 
                      borderRadius: 8, 
                      border, 
                      background: bg,
                      cursor: submitted ? "default" : "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {!submitted ? (
        <button 
          onClick={handleSubmit} 
          disabled={submitting} 
          className="btn" 
          style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem" }}
        >
          {submitting ? "Submitting..." : "Submit Answers"}
        </button>
      ) : (
        <div style={{ padding: 24, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>You scored {result?.score}%</h2>
          {result && result.creditsEarned > 0 ? (
            <p style={{ color: "#0f766e", fontWeight: 600, margin: "0 0 16px 0" }}>
              ?? You earned {result.creditsEarned} MI Credits!
            </p>
          ) : (
            <p style={{ color: "#64748b", margin: "0 0 16px 0" }}>
              You didn't beat your previous high score, so no new credits were awarded. Keep trying!
            </p>
          )}
          <button onClick={handleRetake} className="btn btn-outline">
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
