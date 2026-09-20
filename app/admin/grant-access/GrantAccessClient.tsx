"use client";
import { useState } from "react";
import { grantSingleAccess, grantBulkAccess } from "./actions";

export default function GrantAccessClient() {
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [formats, setFormats] = useState<string[]>(["ebook", "audiobook"]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const toggleFormat = (f: string) => {
    if (formats.includes(f)) {
      setFormats(formats.filter(x => x !== f));
    } else {
      setFormats([...formats, f]);
    }
  };

  const handleSingle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";

    const res = await grantSingleAccess(name, email, formats);
    setLoading(false);

    if (res?.error) {
      setMessage({ text: res.error, type: "error" });
    } else {
      setMessage({ text: res.message || `Successfully granted access to ${email}!`, type: "success" });
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleBulk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    const fileInput = (e.currentTarget.elements.namedItem("csvFile") as HTMLInputElement);
    const file = fileInput?.files?.[0];
    
    if (!file) {
      setLoading(false);
      setMessage({ text: "Please select a CSV file.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result?.toString() || "";
      const res = await grantBulkAccess(csvText, formats);
      setLoading(false);

      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setMessage({ text: res.message || `Successfully processed ${res.count} users!`, type: "success" });
        (e.target as HTMLFormElement).reset();
      }
    };
    reader.onerror = () => {
      setLoading(false);
      setMessage({ text: "Failed to read file.", type: "error" });
    };
    reader.readAsText(file);
  };

  return (
    <div className="card" style={{ padding: 32 }}>
      
      {/* Format Selection */}
      <div style={{ marginBottom: 32, padding: 20, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h4 style={{ marginBottom: 12, fontSize: "1.05rem" }}>1. Select Access Level</h4>
        <div style={{ display: "flex", gap: 24 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={formats.includes("ebook")} 
              onChange={() => toggleFormat("ebook")} 
              style={{ width: 18, height: 18 }}
            />
            Digital eBook (PDFs)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={formats.includes("audiobook")} 
              onChange={() => toggleFormat("audiobook")}
              style={{ width: 18, height: 18 }}
            />
            AudioBook
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
        <button 
          onClick={() => setTab("single")}
          style={{ padding: "12px 24px", borderBottom: tab === "single" ? "2px solid #0E9C74" : "2px solid transparent", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", fontWeight: 700, color: tab === "single" ? "#0E9C74" : "#64748b" }}
        >
          Single Entry
        </button>
        <button 
          onClick={() => setTab("bulk")}
          style={{ padding: "12px 24px", borderBottom: tab === "bulk" ? "2px solid #0E9C74" : "2px solid transparent", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", fontWeight: 700, color: tab === "bulk" ? "#0E9C74" : "#64748b" }}
        >
          Bulk Upload (.csv)
        </button>
      </div>

      {/* Messages */}
      {message.text && (
        <div style={{ padding: 16, borderRadius: 8, marginBottom: 24, background: message.type === "error" ? "#fee2e2" : "#d1fae5", color: message.type === "error" ? "#991b1b" : "#065f46" }}>
          {message.text}
        </div>
      )}

      {/* Single Tab */}
      {tab === "single" && (
        <form onSubmit={handleSingle} style={{ display: "grid", gap: 16, maxWidth: 500 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>Name</label>
            <input type="text" name="name" required className="input" style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 6 }} placeholder="John Doe" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4 }}>Email Address</label>
            <input type="email" name="email" required className="input" style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 6 }} placeholder="john@example.com" />
          </div>
          <button type="submit" className="btn btn-teal" disabled={loading} style={{ justifyContent: "center", marginTop: 8 }}>
            {loading ? "Processing..." : "Grant Access & Send Email"}
          </button>
        </form>
      )}

      {/* Bulk Tab */}
      {tab === "bulk" && (
        <form onSubmit={handleBulk} style={{ display: "grid", gap: 16, maxWidth: 500 }}>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Upload a CSV file containing two columns: <strong>Name</strong> and <strong>Email</strong>.<br/>
            (You can save an Excel file as a .csv file).
          </p>
          <div style={{ border: "2px dashed #cbd5e1", padding: 32, borderRadius: 8, textAlign: "center", background: "#f8fafc" }}>
            <input type="file" name="csvFile" accept=".csv" required style={{ width: "100%", cursor: "pointer" }} />
          </div>
          <button type="submit" className="btn btn-teal" disabled={loading} style={{ justifyContent: "center", marginTop: 8 }}>
            {loading ? "Processing..." : "Upload & Grant Access"}
          </button>
        </form>
      )}

    </div>
  );
}
