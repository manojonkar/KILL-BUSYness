"use client";
import { useState } from "react";

type Participant = { id: string; name: string; email: string; level: string; status: string; invite_token: string };

const ROLE_LABEL: Record<string, string> = {
  owner_ceo: "Owner / CEO",
  senior_leadership: "Senior Leadership",
  manager: "Manager",
  employee: "Employee"
};

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={copy} title={url}>
      {copied ? "✓ Copied" : "Copy link"}
    </button>
  );
}

export default function InviteClient({
  seats,
  participants,
  addAction,
  bulkAction,
  resendAction,
  removeAction,
  siteUrl
}: {
  seats: number;
  participants: Participant[];
  addAction: (formData: FormData) => void;
  bulkAction: (formData: FormData) => void;
  resendAction: (formData: FormData) => void;
  removeAction: (formData: FormData) => void;
  siteUrl: string;
}) {
  const used = participants.length;
  const [bulkText, setBulkText] = useState("");
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const normalizeLevel = (lvl: string): string => {
    const l = String(lvl || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (l.includes("ceo") || l.includes("owner")) return "Owner / CEO";
    if (l.includes("senior") || l.includes("leadership") || l.includes("director") || l.includes("vp")) return "Senior Leadership";
    if (l.includes("manager") || l.includes("head") || l.includes("lead")) return "Manager";
    return "Employee";
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingError(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const XLSX = await import("xlsx");
        const u8 = new Uint8Array(arrayBuffer);
        const wb = XLSX.read(u8, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert sheet to array of arrays (raw format)
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        if (data.length === 0) {
          setParsingError("The uploaded file is empty.");
          setIsParsing(false);
          return;
        }

        const lines: string[] = [];
        
        // Detect headers
        const firstRow = data[0] as string[];
        let nameIdx = 0;
        let emailIdx = 1;
        let levelIdx = 2;

        if (firstRow && firstRow.length > 0) {
          const lowerHeaders = firstRow.map(h => String(h || "").toLowerCase().trim());
          const foundName = lowerHeaders.findIndex(h => h.includes("name") || h.includes("title"));
          const foundEmail = lowerHeaders.findIndex(h => h.includes("email") || h.includes("mail"));
          const foundLevel = lowerHeaders.findIndex(h => h.includes("level") || h.includes("role") || h.includes("type"));
          
          if (foundName !== -1) nameIdx = foundName;
          if (foundEmail !== -1) emailIdx = foundEmail;
          if (foundLevel !== -1) levelIdx = foundLevel;
        }

        const hasHeaders = firstRow && firstRow.some(h => {
          const l = String(h || "").toLowerCase();
          return l.includes("name") || l.includes("email");
        });
        const startRow = hasHeaders ? 1 : 0;

        for (let r = startRow; r < data.length; r++) {
          const row = data[r] as any[];
          if (!row || row.length === 0) continue;
          
          const name = String(row[nameIdx] || "").trim();
          const email = String(row[emailIdx] || "").trim();
          const levelVal = levelIdx !== -1 && row[levelIdx] ? String(row[levelIdx]).trim() : "Employee";
          const level = normalizeLevel(levelVal);
          
          if (name && email && email.includes("@")) {
            lines.push(`${name}, ${email}, ${level}`);
          }
        }

        if (lines.length === 0) {
          setParsingError("No valid rows containing both Name and Email were found.");
        } else {
          setBulkText(prev => {
            const current = prev.trim();
            const added = lines.join("\n");
            return current ? `${current}\n${added}` : added;
          });
        }
      } catch (err: any) {
        setParsingError("Failed to parse file: " + err.message);
      } finally {
        setIsParsing(false);
        // Reset file input so same file can be uploaded again if needed
        e.target.value = "";
      }
    };
    
    reader.onerror = () => {
      setParsingError("Error reading file.");
      setIsParsing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="card" style={{ padding: 30, marginBottom: 16 }}>
        <span className="eyebrow">Step 2 of 2 — Invite Your Team</span>
        <p style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginBottom: 20 }}>
          Invite up to {seats} people to take the audit — start with yourself as owner/CEO, then bring in your leadership team and as much of the wider organization as you&apos;d like.
        </p>
        <form action={addAction} className="invite-row">
          <input name="name" placeholder="Full name" required />
          <input name="email" type="email" placeholder="Email address" required />
          <select name="role" defaultValue="Owner / CEO">
            <option>Owner / CEO</option>
            <option>Senior Leadership</option>
            <option>Manager</option>
            <option>Employee</option>
          </select>
          <button className="btn btn-dark btn-sm" type="submit">Add</button>
        </form>
        <div className="invite-table">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Level</th><th>Status</th><th>Survey link</th><th>Manage</th></tr>
            </thead>
            <tbody>
              {participants.length ? (
                participants.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{ROLE_LABEL[p.level] || p.level}</td>
                    <td>
                      <span className={`badge-status ${p.status === "completed" ? "done" : "pending"}`}>
                        {p.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td>
                      {p.status === "completed" ? (
                        <span style={{ color: "var(--ink-faint)", fontSize: ".78rem" }}>—</span>
                      ) : (
                        <CopyLink url={`${siteUrl}/survey/${p.invite_token}`} />
                      )}
                    </td>
                    <td>
                      {p.status === "completed" ? (
                        <span style={{ color: "var(--ink-faint)", fontSize: ".78rem" }}>Locked</span>
                      ) : (
                        <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <form action={resendAction}>
                            <input type="hidden" name="participantId" value={p.id} />
                            <button className="btn btn-outline btn-sm" type="submit" title="Send the invite email again">Resend</button>
                          </form>
                          <form action={removeAction} onSubmit={(e) => { if (!confirm(`Remove ${p.name} and free up their seat?`)) e.preventDefault(); }}>
                            <input type="hidden" name="participantId" value={p.id} />
                            <button className="btn btn-outline btn-sm" type="submit" title="Remove and free the seat">Remove</button>
                          </form>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ color: "var(--ink-faint)" }}>No participants invited yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: ".78rem", color: "var(--ink-faint)", marginTop: 10 }}>
          {used}/{seats} seats used. An invite email goes out automatically when you add someone — if it doesn&apos;t arrive, use Resend, or copy the survey link and send it any way you like. Each link is unique to that person. Anyone who has completed the survey is locked, so their answers can&apos;t be deleted from here.
        </p>
      </div>
      
      <div className="card" style={{ padding: 30 }}>
        <span className="eyebrow">Bulk Add Participants</span>
        <h3 style={{ marginBottom: 4 }}>Invite many people at once</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginBottom: 14 }}>
          Paste a list below, or upload an Excel/CSV spreadsheet. Format: one person per line: <code>Name, Email, Level</code> (Level is optional, mapping to Owner/CEO, Senior Leadership, Manager, or Employee).
        </p>
        
        {/* Excel / CSV File Uploader */}
        <div 
          style={{ 
            marginBottom: 20, 
            padding: "20px", 
            border: "2px dashed var(--line, #cbd5e1)", 
            borderRadius: "10px", 
            backgroundColor: "#f8fafc", 
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>
            📂 Upload Excel (.xlsx, .xls) or CSV file
          </span>
          <span style={{ fontSize: "0.74rem", color: "#64748b", maxWidth: 400 }}>
            We will detect columns named Name and Email (or columns 1 and 2) and append them automatically below.
          </span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelUpload}
            disabled={isParsing}
            style={{ 
              fontSize: "0.8rem", 
              marginTop: 10,
              padding: "6px 12px",
              background: "#fff",
              border: "1px solid var(--line, #e2e8f0)",
              borderRadius: 6,
              cursor: "pointer"
            }}
          />
          {isParsing && (
            <span style={{ fontSize: "0.8rem", color: "var(--teal-ink, #0f766e)", fontWeight: "bold" }}>
              ⏳ Parsing spreadsheet, please wait...
            </span>
          )}
          {parsingError && (
            <span style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: "bold" }}>
              ❌ {parsingError}
            </span>
          )}
        </div>

        <form action={bulkAction}>
          <textarea 
            name="bulkList" 
            rows={6} 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Priya Shah, priya@company.com, Senior Leadership\nArjun Mehta, arjun@company.com, Manager"} 
            style={{ width: "100%", fontFamily: "var(--mono)", fontSize: ".82rem" }} 
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn btn-dark btn-sm" type="submit">Add List to Invitees</button>
            {bulkText && (
              <button 
                className="btn btn-outline btn-sm" 
                type="button" 
                onClick={() => setBulkText("")}
              >
                Clear List
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
