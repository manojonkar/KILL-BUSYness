"use client";
import { useTransition } from "react";
import { redeemItem } from "./actions";

export default function RedeemButton({ name, cost, canAfford }: { name: string; cost: number; canAfford: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className={`btn btn-sm ${canAfford ? "btn-teal" : "btn-outline"}`}
      disabled={!canAfford || isPending}
      onClick={() => startTransition(() => redeemItem(name))}
    >
      {isPending ? "Redeeming…" : "Redeem"}
    </button>
  );
}
