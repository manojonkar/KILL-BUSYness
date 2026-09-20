"use client";
import { useState } from "react";
import { login } from "./actions";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await login(formData);
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
          <label>Email</label>
          <input name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div className="field" style={{ marginBottom: 18 }}>
          <label>Password</label>
          <input name="password" type="password" required placeholder="••••••••" />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </button>
      </form>
    </>
  );
}
