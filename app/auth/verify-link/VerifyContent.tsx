"use client";
import { useSearchParams } from "next/navigation";

export default function VerifyContent() {
  const searchParams = useSearchParams();
  const target = searchParams.get("target");

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", fontFamily: "sans-serif", flexDirection: "column" }}>
      <h2 style={{ marginBottom: 16 }}>Secure Link Verification</h2>
      <p style={{ marginBottom: 32, color: "#666" }}>To verify your request and continue, please click the button below.</p>
      {target ? (
        <a href={target} style={{ display: "inline-block", padding: "12px 24px", background: "#0E9C74", color: "#fff", textDecoration: "none", borderRadius: "8px", fontWeight: "bold" }}>
          Verify & Continue
        </a>
      ) : (
        <p style={{ color: "#e11d48", fontWeight: "bold" }}>Invalid or missing target URL.</p>
      )}
    </div>
  );
}
