"use client";
import { useState } from "react";
import { registerAccount } from "./actions";

export default function RegisterForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerAccount(formData);
      if (res && "error" in res && res.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Full Name</label>
          <input name="name" required placeholder="Your name" />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Email</label>
          <input name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div className="field" style={{ marginBottom: 18 }}>
          <label>Password</label>
          <input name="password" type="password" required minLength={6} placeholder="At least 6 characters" />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </>
  );
}
