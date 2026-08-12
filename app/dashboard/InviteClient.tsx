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
          Paste a list below — one person per line: <code>Name, Email, Level</code> (Level optional, defaults to Employee).
        </p>
        <form action={bulkAction}>
          <textarea name="bulkList" rows={6} placeholder={"Priya Shah, priya@company.com, Senior Leadership\nArjun Mehta, arjun@company.com, Manager"} style={{ width: "100%", fontFamily: "var(--mono)", fontSize: ".82rem" }} />
          <button className="btn btn-dark btn-sm" style={{ marginTop: 10 }} type="submit">Add List to Invitees</button>
        </form>
      </div>
    </>
  );
}
