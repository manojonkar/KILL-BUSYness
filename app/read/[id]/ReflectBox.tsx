"use client";
import { useState } from "react";

export default function ReflectBox({
  prompt,
  initialBody,
  loggedIn,
  action
}: {
  prompt: string;
  initialBody: string;
  loggedIn: boolean;
  action: (formData: FormData) => void;
}) {
  const [status, setStatus] = useState("");

  if (!loggedIn) {
    return (
      <div className="reflect-box">
        <label>Reflection Prompt</label>
        <p style={{ fontSize: ".86rem", color: "var(--ink-soft)", margin: "8px 0 12px", fontStyle: "italic" }}>{prompt}</p>
        <p style={{ fontSize: ".82rem" }}>
          <a href="/login" style={{ color: "var(--coral-ink)", fontWeight: 700 }}>
            Log in
          </a>{" "}
          to save your private reflection and earn XP.
        </p>
      </div>
    );
  }

  return (
    <div className="reflect-box">
      <label>Reflection Prompt</label>
      <p style={{ fontSize: ".86rem", color: "var(--ink-soft)", margin: "8px 0 12px", fontStyle: "italic" }}>{prompt}</p>
      <label>Your Private Notes</label>
      <form
        action={async (fd) => {
          await action(fd);
          setStatus("Saved · thank you");
          setTimeout(() => setStatus(""), 2500);
        }}
      >
        <textarea name="body" defaultValue={initialBody} placeholder="What does this mean for your organization, right now?" />
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-dark btn-sm" type="submit">
            Save Reflection
          </button>
          {status ? <span style={{ fontSize: ".78rem", color: "var(--teal-ink)" }}>{status}</span> : null}
        </div>
      </form>
    </div>
  );
}
