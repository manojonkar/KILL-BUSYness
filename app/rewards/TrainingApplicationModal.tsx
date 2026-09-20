"use client";
import { useState } from "react";
import { submitTrainingApplication } from "./actions";

export default function TrainingApplicationModal({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await submitTrainingApplication(name, formData);
    setLoading(false);
    
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <>
      <button className="btn btn-sm btn-outline" onClick={() => setOpen(true)}>Apply</button>
      
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 500, padding: 32, position: "relative" }}>
            <button 
              onClick={() => setOpen(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
            >
              ×
            </button>
            
            <h4 style={{ marginBottom: 8, fontSize: "1.2rem", fontWeight: 800 }}>Apply for Training</h4>
            <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: 24, lineHeight: 1.5 }}>
              <strong>{name}</strong>
            </p>

            {success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <h4 style={{ color: "#0E9C74", marginBottom: 12 }}>✓ Application Sent</h4>
                <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  We've received your application. We'll be in touch soon to discuss dates and details! Note: Credits will be deducted only once your seat is confirmed.
                </p>
                <button onClick={() => setOpen(false)} className="btn btn-outline" style={{ marginTop: 24 }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                  <input type="text" name="name" required className="input" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>Email Address</label>
                  <input type="email" name="email" required className="input" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>Company/Organization</label>
                  <input type="text" name="company" required className="input" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }} />
                </div>
                <div className="mobile-stack" style={{ gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>Preferred Month</label>
                    <input type="text" name="preferred_dates" placeholder="e.g. October 2026" required className="input" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>Expected Attendees</label>
                    <input type="number" name="attendees" min="1" required className="input" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }} />
                  </div>
                </div>

                {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
                
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "8px 0" }}>
                  By applying, you confirm your interest. No credits are deducted today.
                </p>

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn btn-teal" 
                  style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                >
                  {loading ? "Sending..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
