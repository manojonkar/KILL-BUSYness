"use client";
import { useState } from "react";
import RedeemButton from "./RedeemButton";

interface StoreItem {
  name: string;
  cost: number;
}

export default function ChapterStoreGroup({ 
  title, 
  icon, 
  items, 
  wallet 
}: { 
  title: string; 
  icon: string; 
  items: StoreItem[]; 
  wallet: number;
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
        <div style={{ color: "#0E9C74", fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {items.length} items
          <span style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", display: "inline-block" }}>▼</span>
        </div>
      </div>
      
      {open && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 20px 20px", display: "grid", gap: 8 }}>
          {items.map((s) => (
            <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <span style={{ fontSize: ".9rem", fontWeight: 600 }}>{s.name}</span>
              <div className="store-price" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {s.cost === 0 ? (
                  <span style={{ color: "#0E9C74", fontWeight: 700, fontSize: ".9rem" }}>FREE</span>
                ) : (
                  <>◆ {s.cost}</>
                )}
                <RedeemButton name={s.name} cost={s.cost} canAfford={wallet >= s.cost} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
