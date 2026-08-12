"use client";

export default function PrintButton() {
  return (
    <button className="btn btn-outline btn-sm no-print" type="button" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
