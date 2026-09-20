"use client";
import { useState, useTransition } from "react";
import { submitClaim } from "./actions";

const CLAIM_TYPES = [
  { value: "gift_book", label: "🎁 Gifted the book", credits: 75, hint: "Who did you gift it to?" },
  { value: "attend_training", label: "🎓 Attended a public training programme", credits: 200, hint: "Which programme and when?" },
  { value: "organize_training", label: "🏢 Organized an in-house training", credits: 500, hint: "Company, programme, and approximate date" },
];

export default function ClaimForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const selectedType = CLAIM_TYPES.find(t => t.value === type);

  const handleSubmit = () => {
    if (!type || !details.trim()) return;
    startTransition(async () => {
      const res = await submitClaim(type, details);
      if (res?.error) {
        setMessage(res.error);
      } else {
        setMessage("Claim submitted! You'll receive credits once approved.");
        setType("");
        setDetails("");
        setTimeout(() => { setMessage(""); setOpen(false); }, 3000);
      }
    });
  };

  if (!open) {
    return (
      <button
        className="btn btn-sm btn-outline"
        onClick={() => setOpen(true)}
        style={{ marginTop: 12 }}
      >
        Claim Credits for External Activity
      </button>
    );
  }

  return (
    <div style={{ marginTop: 16, padding: 20, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <h5 style={{ marginBottom: 12, fontSize: "0.95rem", fontWeight: 700 }}>Claim MI Credits</h5>
      <p style={{ fontSize: ".8rem", color: "#64748b", marginBottom: 14 }}>
        Gifted the book, attended a training, or organized one? Claim your credits here — we&apos;ll review and approve within 48 hours.
      </p>

      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {CLAIM_TYPES.map(ct => (
          <label
            key={ct.value}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              background: type === ct.value ? "#ecfdf5" : "#fff",
              border: `1px solid ${type === ct.value ? "#0E9C74" : "#e2e8f0"}`,
              borderRadius: 8, cursor: "pointer", fontSize: ".88rem", transition: "all 0.15s"
            }}
          >
            <input
              type="radio"
              name="claimType"
              value={ct.value}
              checked={type === ct.value}
              onChange={(e) => setType(e.target.value)}
              style={{ width: "auto" }}
            />
            <span>{ct.label}</span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: ".78rem", color: "#D9A441", fontWeight: 700 }}>+{ct.credits}</span>
          </label>
        ))}
      </div>

      {selectedType && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: ".82rem", color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>
            {selectedType.hint}
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Brief description..."
            rows={2}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: ".88rem", resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
      )}

      {message && <p style={{ fontSize: ".82rem", color: message.includes("submitted") ? "#047857" : "#ef4444", marginBottom: 10 }}>{message}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn btn-sm btn-teal"
          onClick={handleSubmit}
          disabled={!type || !details.trim() || isPending}
        >
          {isPending ? "Submitting…" : "Submit Claim"}
        </button>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => { setOpen(false); setType(""); setDetails(""); setMessage(""); }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
