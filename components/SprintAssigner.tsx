"use client";

import { useState } from "react";
import { assignSprintTask } from "@/app/report/[companyId]/actions";

type Participant = { id: string; name: string };
type Assignment = { id: string; participant_id: string; status: string };

export default function SprintAssigner({
  companyId,
  monthIndex,
  taskTitle,
  participants,
  existingAssignment
}: {
  companyId: string;
  monthIndex: number;
  taskTitle: string;
  participants: Participant[];
  existingAssignment?: Assignment;
}) {
  const [loading, setLoading] = useState(false);

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const participantId = e.target.value;
    if (!participantId) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("companyId", companyId);
      formData.append("monthIndex", monthIndex.toString());
      formData.append("participantId", participantId);
      formData.append("taskTitle", taskTitle);
      
      await assignSprintTask(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (existingAssignment) {
    const assignedPerson = participants.find(p => p.id === existingAssignment.participant_id);
    return (
      <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "6px 12px", borderRadius: 20, border: "1px solid #e2e8f0", fontSize: ".75rem", color: "#475569" }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Assigned to <strong>{assignedPerson?.name || "Team Member"}</strong>
        {existingAssignment.status === "completed" && <span style={{ color: "#16a34a", fontWeight: "bold", marginLeft: 4 }}>✓ Done</span>}
      </div>
    );
  }

  // If no one is assigned yet, show dropdown
  return (
    <div style={{ marginTop: 12 }}>
      <select 
        onChange={handleAssign}
        disabled={loading || participants.length === 0}
        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: ".75rem", color: "#475569", background: "#fff", cursor: "pointer" }}
        defaultValue=""
      >
        <option value="" disabled>
          {loading ? "Assigning..." : participants.length > 0 ? "+ Assign to team member" : "Invite team to assign tasks"}
        </option>
        {participants.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  );
}
