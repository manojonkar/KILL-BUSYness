"use client";

export default function PrintPlaybookButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="btn btn-primary"
      style={{ cursor: "pointer", padding: "10px 20px", borderRadius: 6, fontWeight: 600 }}
    >
      🖨️ Print / Save as PDF
    </button>
  );
}
