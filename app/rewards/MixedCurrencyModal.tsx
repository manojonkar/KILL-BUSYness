"use client";
import { useState } from "react";
import { submitMixedCurrencyPayment } from "./actions";

export default function MixedCurrencyModal({
  name,
  creditCost,
  wallet,
  upiId,
  upiPayee,
}: {
  name: string;
  creditCost: number;
  wallet: number;
  upiId: string;
  upiPayee: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1 Credit = 0.5 INR
  const maxCreditsUsable = Math.min(wallet, creditCost);
  const creditsUsed = maxCreditsUsable; // Maximize credits automatically
  const remainingCreditsCost = creditCost - creditsUsed;
  const remainingInr = remainingCreditsCost * 0.5;

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiPayee)}&am=${remainingInr}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(upiUrl)}`;

  const handlePurchase = async () => {
    setLoading(true);
    const res = await submitMixedCurrencyPayment(name, creditsUsed, remainingInr);
    setLoading(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <>
      <button className="btn btn-sm btn-teal" onClick={() => setOpen(true)}>Purchase</button>
      
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: 32, position: "relative" }}>
            <button 
              onClick={() => setOpen(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
            >
              ×
            </button>
            
            <h4 style={{ marginBottom: 8, fontSize: "1.2rem", fontWeight: 800 }}>Purchase Session</h4>
            <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: 24, lineHeight: 1.5 }}>
              <strong>{name}</strong>
            </p>

            {success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <h4 style={{ color: "#0E9C74", marginBottom: 12 }}>✓ Purchase Confirmed</h4>
                <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  We've received your request! We will verify the payment and email you a calendar link to book your slot.
                </p>
                <button onClick={() => setOpen(false)} className="btn btn-outline" style={{ marginTop: 24 }}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Total Cost:</span>
                    <strong>◆ {creditCost}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#0E9C74" }}>
                    <span style={{ fontSize: "0.9rem" }}>Credits Used:</span>
                    <strong>- ◆ {creditsUsed}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid #e2e8f0", margin: "12px 0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#0f172a", fontSize: "0.95rem", fontWeight: 600 }}>Remaining Balance:</span>
                    <strong style={{ fontSize: "1.2rem" }}>₹ {remainingInr.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {remainingInr > 0 ? (
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 16 }}>
                      Scan the QR below with any UPI app to pay the remaining balance of ₹{remainingInr.toLocaleString('en-IN')}.
                    </p>
                    <img src={qrUrl} alt="UPI QR Code" style={{ width: 168, height: 168, margin: "0 auto", borderRadius: 8, border: "1px solid #e2e8f0", padding: 8 }} />
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 12, fontFamily: "var(--mono)" }}>UPI ID: {upiId}</p>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <p style={{ color: "#0E9C74", fontWeight: 600 }}>Your credits cover the full cost!</p>
                  </div>
                )}

                <button 
                  onClick={handlePurchase}
                  disabled={loading}
                  className="btn btn-teal" 
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {loading ? "Processing..." : remainingInr > 0 ? "I have paid, confirm purchase" : "Redeem with Credits"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
