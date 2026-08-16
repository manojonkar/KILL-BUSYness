"use client";
import { useState } from "react";
import { readStory } from "./actions";

export default function ReadStoryButton({ storyId, loggedIn }: { storyId: string; loggedIn: boolean }) {
  const [clicked, setClicked] = useState(false);

  if (!loggedIn) return null;

  return (
    <button 
      className="btn btn-outline btn-sm" 
      style={{ marginTop: 12, width: "100%" }}
      disabled={clicked}
      onClick={async () => {
        setClicked(true);
        await readStory(storyId);
      }}
    >
      {clicked ? "Read ✓" : "Mark as Read (+5 MI Credits)"}
    </button>
  );
}
