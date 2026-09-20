"use client";
import { useTransition } from "react";
import { approveClaim, rejectClaim } from "./actions";

export default function ClaimActions({ claimId, userId, credits }: { claimId: string; userId: string; credits: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="btn btn-sm btn-teal"
        disabled={isPending}
        onClick={() => startTransition(() => approveClaim(claimId, userId, credits))}
      >
        {isPending ? "…" : "✓ Approve"}
      </button>
      <button
        className="btn btn-sm btn-outline"
        disabled={isPending}
        onClick={() => startTransition(() => rejectClaim(claimId))}
        style={{ color: "#ef4444", borderColor: "#fecaca" }}
      >
        ✗ Reject
      </button>
    </div>
  );
}
