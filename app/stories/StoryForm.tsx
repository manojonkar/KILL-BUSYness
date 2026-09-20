"use client";
import { useState } from "react";
import { submitStory } from "./actions";

export default function StoryForm({ loggedIn }: { loggedIn: boolean }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await submitStory(formData);
      if (res && "error" in res && res.error) {
        setError(res.error);
      } else if (res && "success" in res) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", marginBottom: 20, maxWidth: 720 }}>
        <h3 style={{ marginBottom: 12, color: "#0f766e" }}>Story Submitted!</h3>
        <p style={{ color: "var(--ink-soft)" }}>
          Thank you for sharing your experience. We will review it shortly. You've earned 25 MI Credits!
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 28, marginBottom: 20, maxWidth: 720 }}>
      {error && <p style={{ color: "#9B2226", fontSize: ".9rem", marginBottom: 16, fontWeight: 500 }}>{error}</p>}
      <div className="form-grid">
        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <div className="field">
            <label>Your Name</label>
            <input name="name" placeholder="Full name" required />
          </div>
          <div className="field">
            <label>Company / Role</label>
            <input name="role" placeholder="e.g. CEO, a manufacturing group" />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" type="tel" placeholder="+91 98765 43210" pattern="[0-9+()\-\s]{7,20}" title="Digits, spaces and + ( ) - only" />
          </div>
          <div className="field full">
            <label>Your Story or Insight</label>
            <textarea name="body" rows={4} placeholder="What shifted when you killed BUSYness?" required minLength={40} />
          </div>
          <p style={{ gridColumn: "1/-1", fontSize: ".76rem", color: "var(--ink-faint)", marginTop: 6 }}>
            Your email and phone are used only to verify your story. They are never shown publicly.
          </p>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, fontSize: ".8rem", color: "var(--ink-soft)", gridColumn: "1/-1" }}>
            <input type="checkbox" name="consent" style={{ width: "auto" }} /> I agree my name, role and story may be shared publicly on the KILL BUSYness portal.
          </label>
          {loggedIn ? (
            <button className="btn btn-primary" style={{ marginTop: 16, gridColumn: "1/-1" }} type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Share My Story (+25 MI Credits)"}
            </button>
          ) : (
            <p style={{ gridColumn: "1/-1", marginTop: 16, fontSize: ".85rem" }}>
              <a href="/login" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>
                Log in
              </a>{" "}
              to share your story and earn XP.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
