"use client";
import { useState } from "react";
import { sendContactMessage } from "./actions";

export default function ContactForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await sendContactMessage(formData);
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
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <h3 style={{ marginBottom: 12, color: "#0f766e" }}>Message Sent</h3>
        <p style={{ color: "var(--ink-soft)" }}>We've received your message and will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <>
      {error && <p style={{ color: "#9B2226", fontSize: ".9rem", marginBottom: 16, fontWeight: 500 }}>{error}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
      <div className="field">
        <label>Name</label>
        <input name="name" placeholder="Your name" required />
      </div>
      <div className="field">
        <label>Email</label>
        <input name="email" type="email" placeholder="you@company.com" required />
      </div>
      <div className="field full">
        <label>Message</label>
        <textarea name="message" rows={5} placeholder="What would you like to talk about?" required />
      </div>
        <button className="btn btn-primary" style={{ marginTop: 16, gridColumn: "1/-1" }} type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </>
  );
}
