"use client";
import { useState } from "react";
import { requestReset } from "./actions";

export default function ForgotForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await requestReset(formData);
      if (res && "error" in res && res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res && "success" in res) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p style={{ color: "#154D34", fontSize: ".88rem" }}>
        If an account exists for that address, a reset link is on its way. It expires in one hour. Check your spam folder if it doesn't arrive within a few minutes.
      </p>
    );
  }

  return (
    <>
      {error && <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: 18 }}>
          <label>Email</label>
          <input name="email" type="email" required placeholder="you@company.com" />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </>
  );
}
