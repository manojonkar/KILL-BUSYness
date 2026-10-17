"use client";
import { useState } from "react";
import { login } from "./actions";

import { useRouter } from "next/navigation";

export default function LoginForm({ initialError, initialMessage }: { initialError?: string, initialMessage?: string }) {
  const [error, setError] = useState(initialError || "");
  const [message, setMessage] = useState(initialMessage || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await login(formData);
      if (res && "error" in res && res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res && "redirect" in res && res.redirect) {
        router.push(res.redirect);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{error}</p>}
      {message && <p style={{ color: "#2B8C44", fontSize: ".85rem", marginBottom: 14 }}>{message}</p>}
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
