"use client";
import { useState } from "react";

export default function ListenPlayer({ title, summary }: { title: string; summary: string }) {
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech playback is not supported in this browser");
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(title + ". " + summary.replace(/\n/g, " "));
    utter.rate = 0.96;
    utter.volume = 1;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  }

  return (
    <button type="button" className="btn btn-dark btn-sm" onClick={toggle}>
      {playing ? "⏹ Stop" : "🎧 Listen (~5 min)"}
    </button>
  );
}
