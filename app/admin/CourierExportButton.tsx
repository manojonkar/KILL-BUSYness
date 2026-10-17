"use client";

export default function CourierExportButton({ orders }: { orders: any[] }) {
  const handleExport = () => {
    // Filter for only physical items (paperback) or anything with an address, optionally checking status="paid"
    const relevantOrders = orders.filter(o => 
      (o.format === "paperback" || !!o.address) &&
      (o.status === "paid" || o.status === "dispatched")
    );

    if (relevantOrders.length === 0) {
      alert("No paid physical orders found in this view.");
      return;
    }

    const headers = ["Order Ref", "Customer Name", "Phone", "Quantity", "Address", "City", "State", "Pincode", "Notes"];
    
    const rows = relevantOrders.map(o => {
      const match = o.notes?.match(/Quantity:\s*(\d+)/i);
      const qty = match ? match[1] : o.quantity;
      
      const cleanAddress = (o.address || "").replace(/"/g, '""').replace(/\n/g, ', ');
      const cleanNotes = (o.notes || "").replace(/"/g, '""').replace(/\n/g, ' ');

      return [
        o.ref,
        `"${o.name || ''}"`,
        `"${o.phone || ''}"`,
        qty,
        `"${cleanAddress}"`,
        `"${o.city || ''}"`,
        `"${o.state || ''}"`,
        `"${o.pincode || ''}"`,
        `"${cleanNotes}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Courier_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="btn btn-sm btn-outline"
      style={{ borderRadius: 20, borderColor: "#0E9C74", color: "#0E9C74", fontWeight: 600 }}
      title="Download addresses for physical deliveries"
    >
      📦 Export for Courier
    </button>
  );
}
