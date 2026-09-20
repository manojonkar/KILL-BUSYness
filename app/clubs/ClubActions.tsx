"use client";
import { useState, useTransition } from "react";
import { createClub } from "./actions";

export default function ClubActions({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createClub(name.trim(), org.trim());
      if (res?.error) {
        setMessage(res.error);
      } else {
        setMessage("Club created! Share the link to invite members.");
        setName("");
        setOrg("");
      }
    });
  };

  return (
    <div>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <input
          placeholder="Club name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: ".88rem" }}
        />
        <input
          placeholder="Organization (optional)"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          style={{ padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: ".88rem" }}
        />
      </div>
      {message && <p style={{ fontSize: ".82rem", color: message.includes("created") ? "#047857" : "#ef4444", marginBottom: 10 }}>{message}</p>}
      <button
        className="btn btn-sm btn-teal"
        onClick={handleCreate}
        disabled={!name.trim() || isPending}
      >
        {isPending ? "Creating…" : "Create Club"}
      </button>
    </div>
  );
}
