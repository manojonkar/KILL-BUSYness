"use client";

import { useState } from "react";
import { setNewPassword } from "./actions";

export default function ResetForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Those two passwords don't match.");
      setLoading(false);
      return;
    }

    try {
      const result = await setNewPassword(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 30, maxWidth: 440 }}>
      {error && <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>New password</label>
          <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
        </div>
        <div className="field" style={{ marginBottom: 18 }}>
          <label>Confirm new password</label>
          <input name="confirm" type="password" required minLength={8} placeholder="Type it again" />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Saving..." : "Save new password"}
        </button>
      </form>
    </div>
  );
}
