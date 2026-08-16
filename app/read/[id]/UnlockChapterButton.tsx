"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockChapterAction } from "./actions";

export default function UnlockChapterButton({ chapterId, cost, loggedIn }: { chapterId: number, cost: number, loggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!loggedIn) {
    return (
      <a href="/login" className="btn btn-primary">Log in to Unlock</a>
    );
  }

  return (
    <button 
      className="btn btn-primary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const res = await unlockChapterAction(chapterId, cost);
        if (res?.error) {
          alert(res.error);
          setLoading(false);
        } else {
          router.refresh();
        }
      }}
    >
      {loading ? "Unlocking..." : `Unlock for ${cost} MI Credits`}
    </button>
  );
}
