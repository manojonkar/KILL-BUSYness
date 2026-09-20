"use client";
import { useState } from "react";
import TrainingApplicationModal from "./TrainingApplicationModal";

export default function TrainingStoreGroup({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: { name: string; cost: number; requiresAudit: boolean }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="store-card group-card" style={{ flexDirection: "column", alignItems: "stretch", padding: 0, overflow: "hidden" }}>
      <div 
        onClick={() => setOpen(!open)}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
        onMouseLeave={(e) => e.currentTarget.style.background = open ? "#f8fafc" : "transparent"}
        style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          padding: "18px 24px", cursor: "pointer", background: open ? "#f8fafc" : "transparent",
          transition: "background 0.2s"
        }}
      >
        <div className="store-info" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: "1.4rem" }}>{icon}</span>
          <h5 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{title}</h5>
        </div>
        <div style={{ color: "#6366f1", fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {items.length} options
          <span style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", display: "inline-block" }}>▼</span>
        </div>
      </div>
      
      {open && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 20px 20px", display: "grid", gap: 8 }}>
          {items.map((s) => (
            <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <div className="store-info">
                <h6 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{s.name}</h6>
              </div>
              <div className="store-price" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#D9A441", fontFamily: "var(--mono)", fontWeight: 700 }}>◆ {s.cost}</span>
                <TrainingApplicationModal name={s.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
