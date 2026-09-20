"use client";
import { useTransition } from "react";
import { redeemItem } from "./actions";

export default function RedeemButton({ name, cost, canAfford }: { name: string; cost: number; canAfford: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleRedeem = () => {
    startTransition(async () => {
      const res = await redeemItem(name);
      if (res?.error) {
        alert(res.error);
      } else if (res?.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      }
    });
  };

  const isDownload = name.includes("Synopsis") || name.includes("PDF");

  return (
    <button
      className={`btn btn-sm ${canAfford ? "btn-teal" : "btn-outline"}`}
      disabled={!canAfford || isPending}
      onClick={handleRedeem}
    >
      {isPending ? "Processing…" : isDownload ? "Download" : "Redeem"}
    </button>
  );
}
