"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { createClient } from '@supabase/supabase-js';
import html2canvas from 'html2canvas';
import { sendAssessmentEmail } from "./actions";

// Initialize Supabase client
// Replace 'https://oictzdcrqgwawezwjzr.supabase.co' with your actual project URL from the Supabase dashboard
const supabaseUrl = 'https://oictzdcrqgwawezwjzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTc5MzQsImV4cCI6MjEwMTU3MzkzNH0._-QPa4TDifIriTJlcuP05w6eCPnXUjcFDQNcFEQ0kB8';
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------------------------------------------------------------------
// Design tokens (see inline <style> for full system)
// Navy #14213D · Gold #C9A24B · Cream #FAF7F1 · Ink #2B2E33 · Line #E4DFD3
// ---------------------------------------------------------------------------

const PILLARS = [
  {
    id: "mtp", short: "Purpose", name: "Massive Transformative Purpose",
    anchor: "Soul · Positive Contribution to Society",
    statements: [
      "Our purpose was co-created with employees, not issued by leadership alone.",
      "Our purpose translates into a measurable societal or ecosystem outcome, not just a slogan.",
      "Every major strategic decision is pressure-tested against our purpose.",
      "Our purpose is visible in onboarding, performance conversations and public communication.",
    ],
  },
  {
    id: "lead", short: "Leadership", name: "Leadership Transformation",
    anchor: "Head + Heart",
    statements: [
      "Leaders are assessed and developed on both performance and people-impact metrics.",
      "360° feedback and coaching are routine here, not remedial.",
      "Leaders visibly model the behaviours they ask of others.",
      "Succession pipelines are deliberately built, not accidental.",
    ],
  },
  {
    id: "culture", short: "Culture", name: "Culture Transformation",
    anchor: "Heart + Soul",
    statements: [
      "Our culture is defined in behavioural terms, not just value words on a wall.",
      "Rituals, recognition and rewards reinforce our desired culture systematically.",
      "Psychological safety is measured here, not assumed.",
      "Culture health is reviewed with the same rigor as financial performance.",
    ],
  },
  {
    id: "strategy", short: "Strategy", name: "Breakthrough Competitive Strategy",
    anchor: "Future Ready",
    statements: [
      "We run a formal environmental scanning and scenario planning cadence.",
      "Our strategy explicitly names what we will stop doing, not just start.",
      "Resource allocation is reviewed and reallocated at least annually toward emerging bets.",
      "Our strategy is stress-tested against at least one disruptive future scenario per cycle.",
    ],
  },
  {
    id: "execution", short: "Execution", name: "Strategy Execution",
    anchor: "Head",
    statements: [
      "Strategy is cascaded into owned, measurable goals at every level.",
      "A structured operating rhythm (e.g. quarterly business reviews) tracks execution.",
      "Blockers are surfaced and resolved fast, with clear escalation paths.",
      "Our execution capability itself is measured, not just outcomes.",
    ],
  },
  {
    id: "talent", short: "Talent", name: "Talent Management",
    anchor: "Heart",
    statements: [
      "Clear, fair frameworks exist here for hiring, growth and reward.",
      "Career pathing and internal mobility are actively enabled.",
      "Our critical roles have identified successors.",
      "Talent data is reviewed at the leadership table regularly.",
    ],
  },
  {
    id: "sales", short: "Sales", name: "Sales Transformation",
    anchor: "Future Ready + Head",
    statements: [
      "A defined, trained sales methodology is used consistently, not left to individual style.",
      "Pipeline and forecast accuracy are tracked and coached, not just reported.",
      "Customer insight loops back systematically into product and strategy.",
      "Sales technology and enablement are actively invested in and adopted.",
    ],
  },
  {
    id: "innovation", short: "Innovation", name: "Innovation Culture",
    anchor: "Future Ready + Soul",
    statements: [
      "Dedicated time, budget or mechanism exists for people to pursue new ideas.",
      "Failure from genuine experiments is treated as learning here, not punished.",
      "Ideas from anywhere in the organization have a real path to being tried.",
      "We track innovation output (ideas piloted, scaled, retired), not just innovation activity.",
    ],
  },
];

const LEVEL_NAME = { 1: "Emerging", 2: "Developing", 3: "Established", 4: "Exemplary", 5: "Extraordinary" };
const LEVEL_HINT = {
  1: "Aware, informal — exists in pockets",
  2: "Documented intent — applied inconsistently",
  3: "Systematized — consistent and measured",
  4: "Embedded — self-sustaining, benchmarked",
  5: "Regenerative — we elevate others too",
};

function bandFor(index) {
  if (index < 40) return { name: "HPO Aspirant", note: "Committed to the journey; not yet ready for certification", color: "#8A8F98" };
  if (index < 60) return { name: "HPO Certified", note: "Meets the baseline standard across all 8 pillars", color: "#C9A24B" };
  if (index < 80) return { name: "HPO Distinguished", note: "Consistently strong; several pillars at Exemplary level", color: "#A9812F" };
  return { name: "HPO Extraordinary", note: "Regenerative impact; sector-defining benchmark", color: "#14213D" };
}

function Hex({ state }) {
  // state: 'done' | 'current' | 'pending'
  const fill = state === "done" ? "#C9A24B" : state === "current" ? "#14213D" : "#FAF7F1";
  const stroke = state === "pending" ? "#C9B98F" : state === "current" ? "#14213D" : "#C9A24B";
  return (
    <svg width="26" height="26" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <polygon points="50,2 93,25 93,75 50,98 7,75 7,25" fill={fill} stroke={stroke} strokeWidth="7" />
    </svg>
  );
}

export default function XOSelfAssessment() {
  const [screen, setScreen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("xo_screen");
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
    }
    return "landing";
  }); // 'landing' | 0-7 | 'capture' | 'results'
  const [orgName, setOrgName] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("xo_orgName") || "";
    return "";
  });
  const [answers, setAnswers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("xo_answers");
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
    }
    return {};
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("xo_email") || "";
    return "";
  });

  useEffect(() => { localStorage.setItem("xo_screen", JSON.stringify(screen)); }, [screen]);
  useEffect(() => { localStorage.setItem("xo_orgName", orgName); }, [orgName]);
  useEffect(() => { localStorage.setItem("xo_answers", JSON.stringify(answers)); }, [answers]);
  useEffect(() => { localStorage.setItem("xo_email", email); }, [email]);

  const setAnswer = (pillarId, qIdx, value) => {
    setAnswers((prev) => {
      const arr = prev[pillarId] ? [...prev[pillarId]] : [null, null, null, null];
      arr[qIdx] = value;
      return { ...prev, [pillarId]: arr };
    });

    // Check if this pillar is now fully answered to auto-advance
    const currentPillarArr = answers[pillarId] ? [...answers[pillarId]] : [null, null, null, null];
    currentPillarArr[qIdx] = value;
    if (currentPillarArr.every(v => v !== null && v !== undefined)) {
      setTimeout(() => {
        setScreen(prevScreen => {
          if (typeof prevScreen === "number" && PILLARS[prevScreen].id === pillarId) {
            return prevScreen === PILLARS.length - 1 ? "capture" : prevScreen + 1;
          }
          return prevScreen;
        });
      }, 600); // 600ms delay for visual feedback before auto-advancing
    }
  };

  const pillarLevels = useMemo(() => {
    const out = {};
    PILLARS.forEach((p) => {
      const arr = answers[p.id];
      if (arr && arr.every((v) => v !== null && v !== undefined)) {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        out[p.id] = Math.min(5, Math.max(1, Math.round(avg)));
      }
    });
    return out;
  }, [answers]);

  const allComplete = PILLARS.every((p) => pillarLevels[p.id]);
  const sumLevels = PILLARS.reduce((s, p) => s + (pillarLevels[p.id] || 0), 0);
  const xoIndex = allComplete ? Math.round((sumLevels / 40) * 100) : null;
  const band = xoIndex !== null ? bandFor(xoIndex) : null;

  const currentIsAnswered = (idx) => {
    const p = PILLARS[idx];
    const arr = answers[p.id];
    return !!arr && arr.every((v) => v !== null && v !== undefined);
  };

  const radarData = PILLARS.map((p) => ({ pillar: p.short, level: pillarLevels[p.id] || 0 }));

  const goNext = () => {
    if (screen === "landing") { setScreen(0); return; }
    if (typeof screen === "number") {
      if (screen === PILLARS.length - 1) setScreen("capture");
      else setScreen(screen + 1);
    } else if (screen === "capture") {
      setScreen("results");
    }
  };
  const goBack = () => {
    if (typeof screen === "number") {
      if (screen === 0) setScreen("landing");
      else setScreen(screen - 1);
    } else if (screen === "capture") {
      setScreen(PILLARS.length - 1);
    } else if (screen === "results") {
      setScreen("capture");
    }
  };
  const skipToResults = () => {
    setScreen("results");
  };

  const submitResults = async () => {
    try {
      // 1. Save to Supabase
      await supabase.from('assessments').insert([{
        org_name: orgName,
        email: email,
        xo_index: xoIndex,
        answers: answers,
        band_name: band ? band.name : ''
      }]);
      
      // 2. Trigger Email #1 via Resend
      if (email && email.includes('@')) {
        await sendAssessmentEmail(email, xoIndex, band ? band.name : '');
      }
    } catch (e) {
      console.error('Error saving assessment or sending email:', e);
    }
    setScreen("results");
  };

  const resultsRef = useRef(null);
  const downloadBadge = async () => {
    if (!resultsRef.current) return;
    try {
      const canvas = await html2canvas(resultsRef.current, { backgroundColor: "#FAF7F1", scale: 2 });
      const link = document.createElement("a");
      link.download = `${orgName || "Organization"}_XO_Profile.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Error generating badge:", e);
    }
  };
  const restart = () => { 
    setAnswers({}); setOrgName(""); setEmail(""); setScreen("landing"); 
    if (typeof window !== "undefined") {
      localStorage.removeItem("xo_answers");
      localStorage.removeItem("xo_orgName");
      localStorage.removeItem("xo_email");
      localStorage.removeItem("xo_screen");
    }
  };

  return (
    <div className="xo-root">
      

<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .xo-root {
          --navy: #0f172a;
          --navy-deep: #020617;
          --navy-light: #334155;
          --gold: #0E9C74;
          --gold-light: #34d399;
          --cream: #f0f4f8;
          --ink: #1e293b;
          --grey: #64748b;
          --line: #e2e8f0;
          font-family: 'Inter', sans-serif;
          background: var(--cream);
          color: var(--ink);
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 64px 20px 80px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .xo-root *, .xo-root *::before, .xo-root *::after { box-sizing: border-box; }
        .xo-root button:focus-visible, .xo-root input:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .xo-root * { transition: none !important; animation: none !important; } }

        .xo-shell { width: 100%; max-width: 820px; }
        
        .xo-eyebrow {
          font-family: 'Inter', sans-serif; font-size: 13px; letter-spacing: 0.15em; font-weight: 700;
          color: var(--gold); text-transform: uppercase; margin-bottom: 12px;
        }
        
        .xo-h1 {
          font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.02em;
          font-size: clamp(32px, 5vw, 44px); line-height: 1.15; 
          color: var(--navy);
          margin: 0 0 16px;
        }
        
        .xo-lede { font-size: 18px; line-height: 1.6; color: var(--grey); max-width: 600px; margin: 0 0 36px; }

        .xo-card {
          background: #ffffff; border: 1px solid var(--line); border-radius: 16px;
          padding: 48px 46px; 
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          animation: fadeIn 0.5s ease forwards;
          position: relative; overflow: hidden;
        }
        .xo-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px;
          background: var(--gold);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .xo-hero-hex { display: flex; justify-content: center; margin: 12px 0 40px; transform: scale(1.1); }
        
        .xo-field-label { font-size: 14px; font-weight: 600; color: var(--navy); margin-bottom: 8px; display: block; }
        .xo-input {
          width: 100%; font-family: 'Inter', sans-serif; font-size: 16px; padding: 14px 18px;
          border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: var(--ink);
          transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .xo-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(14,156,116,0.15); outline: none; }
        .xo-input::placeholder { color: #94a3b8; }

        .xo-btn {
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; 
          border-radius: 10px; padding: 14px 28px; cursor: pointer; border: none; 
          transition: all 0.2s ease; display: inline-flex; justify-content: center; align-items: center;
        }
        .xo-btn:active { transform: translateY(1px); }
        .xo-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .xo-btn-primary { 
          background: var(--gold); color: #fff; box-shadow: 0 4px 6px rgba(14,156,116,0.2); 
        }
        .xo-btn-primary:hover:not(:disabled) { 
          background: #0b7a5a; box-shadow: 0 6px 12px rgba(14,156,116,0.3); transform: translateY(-1px);
        }
        
        .xo-btn-ghost { background: transparent; color: var(--navy); border: 1px solid var(--line); }
        .xo-btn-ghost:hover { border-color: #cbd5e1; background: #f8fafc; }

        /* progress */
        .xo-progress-row { display: flex; align-items: center; gap: 8px; margin-bottom: 36px; overflow-x: auto; padding-bottom: 8px; }
        .xo-progress-label { font-size: 13px; font-weight: 600; color: var(--navy-light); margin-left: 8px; white-space: nowrap; }

        /* pillar screen */
        .xo-pillar-eyebrow { font-size: 12px; letter-spacing: 0.15em; color: var(--gold); font-weight: 700; text-transform: uppercase; }
        .xo-pillar-name { font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.01em; font-size: 30px; color: var(--navy); margin: 6px 0 6px; }
        .xo-pillar-anchor { font-size: 15px; color: var(--grey); margin-bottom: 32px; font-weight: 500; }

        .xo-legend { 
          display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: var(--grey); 
          background: #f8fafc; border-radius: 10px; padding: 14px 20px; margin-bottom: 32px; border: 1px solid var(--line);
        }
        .xo-legend b { color: var(--navy); font-weight: 700; }

        .xo-statement { margin-bottom: 32px; }
        .xo-statement:last-child { margin-bottom: 0; }
        .xo-statement-text { font-size: 16px; font-weight: 500; line-height: 1.6; color: var(--navy); margin-bottom: 14px; }
        
        .xo-scale { display: flex; gap: 8px; }
        .xo-scale-btn {
          flex: 1; padding: 12px 4px; text-align: center; border-radius: 10px; border: 1px solid #cbd5e1;
          background: #FFFFFF; cursor: pointer; font-family: 'Inter', sans-serif; 
          transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .xo-scale-btn:hover { border-color: var(--gold); background: #f0fdf4; color: var(--gold); }
        .xo-scale-num { font-size: 20px; font-weight: 700; color: var(--navy-light); display: block; }
        .xo-scale-btn:hover .xo-scale-num { color: var(--gold); }
        
        .xo-scale-btn.selected { 
          background: var(--gold); border-color: var(--gold); box-shadow: 0 4px 10px rgba(14,156,116,0.2); transform: translateY(-1px);
        }
        .xo-scale-btn.selected .xo-scale-num { color: #fff; }

        .xo-nav-row { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; border-top: 1px solid var(--line); padding-top: 24px; }
        .xo-step-count { font-size: 14px; font-weight: 600; color: var(--grey); }

        /* results */
        .xo-index-block { text-align: center; padding: 12px 0 32px; border-bottom: 1px solid var(--line); margin-bottom: 32px; }
        .xo-index-number { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 72px; color: var(--navy); line-height: 1; letter-spacing: -0.03em; }
        .xo-index-sub { font-size: 13px; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase; color: var(--grey); margin-top: 12px; }
        .xo-band-pill {
          display: inline-block; margin-top: 20px; padding: 8px 20px; border-radius: 8px;
          font-size: 14px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.05em;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .xo-band-note { font-size: 15px; font-weight: 500; color: var(--navy-light); margin-top: 14px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5; }

        .xo-breakdown-row {
          display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line);
        }
        .xo-breakdown-row:last-child { border-bottom: none; }
        .xo-breakdown-name { width: 220px; font-size: 14px; font-weight: 600; color: var(--navy); flex-shrink: 0; }
        .xo-breakdown-bar-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .xo-breakdown-bar-fill { height: 100%; background: var(--gold); border-radius: 999px; }
        .xo-breakdown-level { width: 110px; text-align: right; font-size: 13px; font-weight: 600; color: var(--grey); flex-shrink: 0; }

        .xo-disclaimer { font-size: 13px; line-height: 1.6; color: var(--grey); margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--line); }
        .xo-footer-actions { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; justify-content: center; }
        .xo-footer-actions .xo-btn-primary[style] { background: var(--gold) !important; color: #fff !important; border: none !important; }

        @media print {
          .xo-footer-actions, .xo-nav-row { display: none !important; }
          .xo-root { background: #fff; padding: 0; }
          .xo-card { box-shadow: none; border: none; }
        }

        @media (max-width: 640px) {
          .xo-card { padding: 32px 24px; border-radius: 12px; }
          .xo-index-number { font-size: 56px; }
          .xo-breakdown-name { width: 140px; font-size: 13px; }
          .xo-scale { gap: 6px; }
          .xo-scale-btn { padding: 10px 2px; border-radius: 8px; }
          .xo-scale-num { font-size: 18px; }
        }
      `}</style>



      <div className="xo-shell">
        <div className="xo-eyebrow">HPO &middot; High Performance Organizations</div>

        {screen === "landing" && (
          <>
            <h1 className="xo-h1">Where does your organization stand, right now?</h1>
            <p className="xo-lede">
              A self-guided diagnostic against the HPO Standards &mdash; 8 pillars, 32 questions,
              about 10 minutes. You'll get a maturity level per pillar and your HPO Index.
            </p>
            <div className="xo-card">
              <div className="xo-hero-hex">
                <MiniRadarPreview />
              </div>
              <label className="xo-field-label" htmlFor="orgname">Organization name (optional)</label>
              <input
                id="orgname" className="xo-input" placeholder="e.g. Acme Manufacturing"
                value={orgName} onChange={(e) => setOrgName(e.target.value)}
                style={{ marginBottom: 24 }}
              />
              <div className="xo-legend">
                <span><b>1</b> Emerging</span><span><b>2</b> Developing</span><span><b>3</b> Established</span>
                <span><b>4</b> Exemplary</span><span><b>5</b> Extraordinary</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--grey)", margin: "0 0 24px" }}>
                For each statement, rate how true it is of your organization today &mdash; not your aspiration.
                This tool is a self-assessment, not a certification; HPO Certified status requires an independent
                HPO Assessor engagement.
              </p>
              <button className="xo-btn xo-btn-primary" onClick={goNext}>Begin assessment</button>
            </div>
          </>
        )}

        {typeof screen === "number" && (
          <div className="xo-card">
            <div className="xo-progress-row">
              {PILLARS.map((p, i) => (
                <Hex key={p.id} state={i === screen ? "current" : pillarLevels[p.id] ? "done" : "pending"} />
              ))}
              <span className="xo-progress-label">Pillar {screen + 1} of {PILLARS.length}</span>
            </div>

            <div className="xo-pillar-eyebrow">Pillar 0{screen + 1} / 08</div>
            <div className="xo-pillar-name">{PILLARS[screen].name}</div>
            <div className="xo-pillar-anchor">Anchored in: {PILLARS[screen].anchor}</div>

            <div className="xo-legend">
              <span><b>1</b> Emerging</span><span><b>2</b> Developing</span><span><b>3</b> Established</span>
              <span><b>4</b> Exemplary</span><span><b>5</b> Extraordinary</span>
            </div>

            {PILLARS[screen].statements.map((s, qIdx) => (
              <div className="xo-statement" key={qIdx}>
                <div className="xo-statement-text">{s}</div>
                <div className="xo-scale">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      className={"xo-scale-btn" + ((answers[PILLARS[screen].id]?.[qIdx] === v) ? " selected" : "")}
                      onClick={() => setAnswer(PILLARS[screen].id, qIdx, v)}
                      aria-label={`Rate ${v} - ${LEVEL_NAME[v]}`}
                    >
                      <span className="xo-scale-num">{v}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="xo-nav-row">
              <button className="xo-btn xo-btn-ghost" onClick={goBack}>Back</button>
              <span className="xo-step-count">{screen + 1} / {PILLARS.length}</span>
              <button className="xo-btn xo-btn-primary" onClick={goNext} disabled={!currentIsAnswered(screen)}>
                {screen === PILLARS.length - 1 ? "See results" : "Next pillar"}
              </button>
            </div>
          </div>
        )}

        {screen === "capture" && (
          <div className="xo-card" style={{ animation: "fadeIn 0.3s ease" }}>
            <h1 className="xo-h1">Your assessment is complete.</h1>
            <p className="xo-lede">
              Would you like a detailed PDF copy of your results sent to your inbox?
            </p>
            <label className="xo-field-label" htmlFor="email">Email address (optional)</label>
            <input
              id="email" className="xo-input" type="email" placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 32 }}
            />
            <div className="xo-nav-row" style={{ marginTop: 0 }}>
              <button className="xo-btn xo-btn-ghost" onClick={goBack}>Back to questions</button>
              <button className="xo-btn xo-btn-primary" onClick={submitResults}>
                {email ? "Email results & view now" : "Skip & view results now"}
              </button>
            </div>
          </div>
        )}

        {screen === "results" && allComplete && (
          <div className="xo-card" ref={resultsRef}>
            <h1 className="xo-h1" style={{ fontSize: 26, marginBottom: 4 }}>
              {orgName ? orgName : "Your organization"}'s XO profile
            </h1>
            <p className="xo-lede" style={{ marginBottom: 8 }}>Based on your self-assessment today.</p>

            <div className="xo-index-block">
              <div className="xo-index-number">{xoIndex}</div>
              <div className="xo-index-sub">HPO Index / 100</div>
              <div className="xo-band-pill" style={{ background: band.color }}>{band.name}</div>
              <div className="xo-band-note">{band.note}</div>
            </div>

            <div style={{ height: 320, marginBottom: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="#E4DFD3" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: "#14213D" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar name="HPO Profile" dataKey="level" stroke="#C9A24B" fill="#C9A24B" fillOpacity={0.35} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginBottom: 8 }}>
              {PILLARS.map((p) => {
                const lvl = pillarLevels[p.id];
                return (
                  <div className="xo-breakdown-row" key={p.id}>
                    <div className="xo-breakdown-name">{p.name}</div>
                    <div className="xo-breakdown-bar-track">
                      <div className="xo-breakdown-bar-fill" style={{ width: `${(lvl / 5) * 100}%` }} />
                    </div>
                    <div className="xo-breakdown-level">L{lvl} &middot; {LEVEL_NAME[lvl]}</div>
                  </div>
                );
              })}
            </div>

            <p className="xo-disclaimer">
              This is a self-guided diagnostic aligned to the HPO Standards v1.0. It is designed to
              show you where to focus first, not to certify you. HPO Certified status requires an
              independent HPO Assessor engagement through the HPO Developmental Journey. Individual
              pillar scores here are private to you \u2014 only a certified organization's composite
              HPO Index and band are ever made public.
            </p>

            <div className="xo-footer-actions" data-html2canvas-ignore="true">
              <a href="https://www.killbusyness.com/login" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="xo-btn xo-btn-primary" style={{ background: '#C9A24B', color: '#14213D', fontWeight: 'bold' }}>Unlock Full Team Audit</button>
              </a>
              <button className="xo-btn xo-btn-primary" onClick={downloadBadge}>Download Badge</button>
              <button className="xo-btn xo-btn-ghost" onClick={() => window.print()}>Save / print</button>
              <button className="xo-btn xo-btn-ghost" onClick={restart}>Start over</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniRadarPreview() {
  const demo = [
    { pillar: "Purpose", level: 3 }, { pillar: "Leadership", level: 4 }, { pillar: "Culture", level: 3 },
    { pillar: "Strategy", level: 2 }, { pillar: "Execution", level: 3 }, { pillar: "Talent", level: 4 },
    { pillar: "Sales", level: 2 }, { pillar: "Innovation", level: 3 },
  ];
  return (
    <div style={{ width: "100%", maxWidth: 320, height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={demo} outerRadius="70%">
          <PolarGrid stroke="#E4DFD3" />
          <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 9, fill: "#6B7080" }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar dataKey="level" stroke="#C9A24B" fill="#C9A24B" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

