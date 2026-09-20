"use client";
import { useState } from "react";

export default function ReferralLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.killbusyness.com/register?ref=${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
      background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
      marginTop: 12, fontSize: ".82rem"
    }}>
      <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>Your referral link:</span>
      <code style={{
        flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontSize: ".78rem", color: "#334155", fontFamily: "var(--mono)"
      }}>
        {url}
      </code>
      <button
        className="btn btn-sm btn-outline"
        onClick={handleCopy}
        style={{ whiteSpace: "nowrap", minWidth: 70 }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
