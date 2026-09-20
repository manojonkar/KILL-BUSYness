"use client";
import { useState } from "react";
import { finishRegistration } from "./actions";

export default function RegistrationForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await finishRegistration(formData);
      if (res && "error" in res && res.error) {
        setError(res.error);
        setLoading(false);
      }
      // If success, finishRegistration actually does revalidatePath and the server component will rerender without this form,
      // so we don't necessarily need to set success state. But we leave loading true so the button doesn't flash back.
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p style={{ color: "#9B2226", fontSize: ".9rem", marginBottom: 16, fontWeight: 500 }}>{error}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label>Company Name</label>
          <input name="name" placeholder="e.g. Meridian Industries Pvt Ltd" required />
        </div>
        <div className="field">
          <label>Industry</label>
          <input name="industry" placeholder="e.g. Manufacturing" />
        </div>
        <div className="field">
          <label>Company Size</label>
          <select name="size" defaultValue="250-500">
            <option>1-50</option>
            <option>50-250</option>
            <option>250-500</option>
            <option>500-2000</option>
            <option>2000+</option>
          </select>
        </div>
        <div className="field">
          <label>Number of Seats to Invite</label>
          <input name="seats" type="number" min={1} defaultValue={10} />
        </div>
        <div className="field full">
          <label>Your Name (Admin)</label>
          <input name="adminName" defaultValue={defaultName} placeholder="Full name" />
        </div>
        <div className="field full">
          <label>Your Email (Admin)</label>
          <input name="adminEmail" defaultValue={defaultEmail} placeholder="you@company.com" />
        </div>
        <button className="btn btn-primary form-grid full" style={{ marginTop: 4, gridColumn: "1/-1" }} type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Company (+75 MI Credits)"}
        </button>
      </form>
    </>
  );
}
