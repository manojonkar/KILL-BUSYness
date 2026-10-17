"use client";

import { useState } from "react";
import { updateOrderStatus } from "./actions";

export default function OrderStatusForm({ order }: { order: { id: string; status: string } }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const status = formData.get("status") as string;
    
    setIsSaving(true);
    try {
      await updateOrderStatus(formData);
      // Determine readable status name
      const readableStatus = 
        status === "awaiting_payment" ? "Awaiting Payment" : 
        status === "paid" ? "Paid" : 
        status === "dispatched" ? "Dispatched" : 
        status === "cancelled" ? "Cancelled" : status;
      
      alert(`Success! Status has been explicitly saved as '${readableStatus}'. Emails have been triggered if applicable.`);
    } catch (err: any) {
      alert("Error saving status: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form action={handleSubmit} style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
      <input type="hidden" name="orderId" value={order.id} />
      <select 
        name="status" 
        defaultValue={order.status}
        style={{ 
          fontSize: "0.8rem", 
          padding: "4px 8px", 
          borderRadius: 6, 
          border: "1px solid var(--line)",
          backgroundColor: order.status === "paid" ? "#ccfbf1" : order.status === "dispatched" ? "#dbeafe" : order.status === "cancelled" ? "#fee2e2" : "#fef3c7",
          color: order.status === "paid" ? "#0f766e" : order.status === "dispatched" ? "#1d4ed8" : order.status === "cancelled" ? "#991b1b" : "#d97706",
          fontWeight: 700
        }}
      >
        <option value="awaiting_payment">Awaiting Payment</option>
        <option value="paid">Paid</option>
        <option value="dispatched">Dispatched</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button 
        type="submit" 
        className="btn btn-dark btn-sm" 
        style={{ 
          padding: "5px 10px", 
          fontSize: "0.74rem", 
          borderRadius: 6 
        }}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
