"use client";
import React, { useState } from "react";
import { sendMasterclassInvite } from "./sendMasterclassInvite";

export default function MasterclassInvite() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      await sendMasterclassInvite(formData);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: "40px", borderTop: "4px solid #0E9C74" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Invite to Masterclass</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Send a secure access link to your personal network.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <input required name="name" type="text" placeholder="Contact Name" className="form-input" />
        </div>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <input required name="email" type="email" placeholder="Contact Email" className="form-input" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: "48px" }}>
          {loading ? "Sending..." : "Send Invite"}
        </button>
      </form>
      
      {success && <div style={{ marginTop: "16px", color: "#0E9C74", fontWeight: "bold" }}>Invite sent successfully!</div>}
      {error && <div style={{ marginTop: "16px", color: "#e11d48", fontWeight: "bold" }}>{error}</div>}
    </div>
  );
}
