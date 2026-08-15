"use client";

import { useState } from "react";
import { submitPerceptionGapInvites } from "@/app/report/[companyId]/actions";

export default function PerceptionGapCTA({ companyId, seatsRemaining }: { companyId: string, seatsRemaining: number }) {
  const [activeTab, setActiveTab] = useState<"none" | "leadership" | "org">("none");
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("companyId", companyId);
      formData.append("emails", emails);
      formData.append("targetLevel", activeTab === "leadership" ? "Senior Leadership" : "Employee");
      
      const emailCount = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes("@")).length;
      if (emailCount > seatsRemaining) {
        throw new Error(`You are trying to invite ${emailCount} people, but only have ${seatsRemaining} seats left. Please go to your dashboard to add more seats (Current Cost: INR 0).`);
      }

      await submitPerceptionGapInvites(formData);
      setSuccess(true);
      setEmails("");
      setActiveTab("none");
    } catch (err: any) {
      setError(err.message || "Failed to send invites.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: 24, textAlign: "center", marginBottom: 30 }}>
        <h4 style={{ color: "#166534", margin: "0 0 8px" }}>Invites Sent Successfully</h4>
        <p style={{ color: "#15803d", fontSize: ".85rem", margin: 0 }}>
          Your team will receive an email shortly. As they complete the audit, their results will automatically appear overlaid on your Radar Chart above.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32, marginBottom: 30, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#fff" }}>
      <h3 style={{ color: "#fff", margin: "0 0 10px", fontSize: "1.3rem" }}>Is this your reality, or just your perception?</h3>
      <p style={{ color: "#94a3b8", fontSize: ".9rem", lineHeight: 1.6, marginBottom: 24 }}>
        Founders often score their organizations 20-30% higher than their front-line teams do. The only way to know if you have a blind spot is to compare your perception against your team&apos;s reality.
      </p>

      {activeTab === "none" && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button 
            onClick={() => setActiveTab("leadership")}
            style={{ flex: 1, padding: "14px 20px", background: "#f8fafc", color: "#0f172a", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", transition: "transform 0.1s" }}
          >
            Invite Leadership Team
          </button>
          <button 
            onClick={() => setActiveTab("org")}
            style={{ flex: 1, padding: "14px 20px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
          >
            Invite Whole Organization
          </button>
        </div>
      )}

      {activeTab !== "none" && (
        <div style={{ background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ color: "#fff", margin: 0 }}>
              Inviting {activeTab === "leadership" ? "Leadership Team" : "Whole Organization"}
            </h4>
            <button onClick={() => setActiveTab("none")} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: ".8rem" }}>Cancel</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <textarea 
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Paste email addresses here (separated by commas or new lines)..."
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "#fff", padding: 12, minHeight: 100, fontSize: ".85rem", fontFamily: "var(--mono)", marginBottom: 12 }}
              required
            />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>
                You have <strong>{seatsRemaining}</strong> seats remaining. <br/>
                <span style={{ opacity: 0.7 }}>(Cost to add more seats is currently INR 0)</span>
              </div>
              <button 
                type="submit" 
                disabled={loading || !emails}
                style={{ background: "#0E9C74", color: "#fff", padding: "10px 24px", border: "none", borderRadius: 6, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending..." : "Send Invites"}
              </button>
            </div>
            
            {error && (
              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 6, color: "#fca5a5", fontSize: ".8rem" }}>
                {error}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
