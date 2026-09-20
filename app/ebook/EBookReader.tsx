"use client";

import { useState, useEffect, useRef } from "react";

export default function EBookReader({ totalPages }: { totalPages: number }) {
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("killbusyness_ebook_page");
    if (saved) {
      setPage(parseInt(saved, 10) || 0);
    }
  }, []);

  const goToPage = (p: number) => {
    const newPage = Math.max(0, Math.min(p, totalPages - 1));
    setPage(newPage);
    localStorage.setItem("killbusyness_ebook_page", newPage.toString());
    setLoading(true);
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px" }}>
          <button 
            onClick={() => goToPage(page - 1)} 
            disabled={page === 0}
            className="btn btn-sm btn-outline"
          >
            ← Previous
          </button>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.9rem", color: "#475569", fontWeight: 600 }}>
            {Math.round((page / (totalPages - 1)) * 100)}% Completed
          </div>
          <button 
            onClick={() => goToPage(page + 1)} 
            disabled={page === totalPages - 1}
            className="btn btn-sm btn-outline"
          >
            Next →
          </button>
        </div>
        <div style={{ width: "100%", height: 4, background: "#f1f5f9" }}>
          <div style={{ 
            height: "100%", 
            background: "#0f766e", 
            width: `${(page / (totalPages - 1)) * 100}%`,
            transition: "width 0.3s ease"
          }}></div>
        </div>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          display: "flex", 
          justifyContent: "center", 
          padding: "20px",
          background: "#e2e8f0"
        }}
      >
        <div style={{ 
          position: "relative",
          maxWidth: "100%", 
          width: "800px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          background: "#fff",
          minHeight: "80vh"
        }}>
          {loading && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#94a3b8" }}>
              Loading page...
            </div>
          )}
          {/* We use a regular img tag and disable dragging/right click */}
          <img 
            src={`/files/ebook_pages/page_${page}.jpg`} 
            alt={`Page ${page + 1}`}
            onLoad={() => setLoading(false)}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            style={{ 
              width: "100%", 
              height: "auto", 
              display: "block",
              opacity: loading ? 0 : 1,
              transition: "opacity 0.2s"
            }} 
          />
        </div>
      </div>
    </div>
  );
}
