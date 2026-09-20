"use client";

import React, { useState } from "react";
import { PROMO_CODES, type BookFormat } from "@/lib/book";

interface OrderFormProps {
  fmt: BookFormat;
  placeOrder: (formData: FormData) => Promise<{ error?: string } | void>;
  wallet?: number;
}

export default function OrderForm({ fmt, placeOrder, wallet = 0 }: OrderFormProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [creditsToUse, setCreditsToUse] = useState<number>(0);
  const [promoCode, setPromoCode] = useState("");
  const [country, setCountry] = useState("India");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isInternational = country.trim().toLowerCase() !== "india" && country.trim() !== "";
  const currencySymbol = isInternational ? "US$" : "Rs.";
  const price = Number((isInternational ? (fmt.usdPrice || fmt.price / 83) : fmt.price).toFixed(2));
  const subtotal = price * quantity;
  
  let discountPercent = 0;
  if (quantity >= 100) {
    discountPercent = 20;
  } else if (quantity >= 50) {
    discountPercent = 15;
  } else if (quantity >= 10) {
    discountPercent = 10;
  }

  const promo = PROMO_CODES[promoCode.trim().toUpperCase()];
  let promoDiscount = 0;

  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  let priceAfterBulk = subtotal - discountAmount;
  
  if (promo) {
    if (promo.fixedPrice) {
      const fixed = Number((isInternational ? promo.fixedPrice / 83 : promo.fixedPrice).toFixed(2));
      priceAfterBulk = fixed * quantity;
    } else if (promo.discountPercent) {
      promoDiscount = Number(((priceAfterBulk * promo.discountPercent) / 100).toFixed(2));
      priceAfterBulk = priceAfterBulk - promoDiscount;
    }
  }
  
  const creditValueRatio = isInternational ? 166 : 2;
  const maxCreditsAllowedToApply = Math.min(wallet, Math.floor(priceAfterBulk * creditValueRatio));
  const validCreditsToUse = Math.min(creditsToUse, maxCreditsAllowedToApply);
  const creditDiscount = Number((isInternational ? validCreditsToUse / creditValueRatio : Math.floor(validCreditsToUse / creditValueRatio)).toFixed(2));

  const finalPrice = Math.max(0, Number((priceAfterBulk - creditDiscount).toFixed(2)));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await placeOrder(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p style={{ color: "#9B2226", fontSize: ".9rem", marginBottom: 16, fontWeight: 500 }}>{error}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
        <input type="hidden" name="format" value={fmt.key} />
        <input type="hidden" name="appliedCredits" value={validCreditsToUse.toString()} />
        <input type="hidden" name="appliedPromo" value={promoCode.trim().toUpperCase()} />
        
        <div className="field">
          <label>Full Name</label>
          <input type="text" name="name" required />
        </div>
        <div className="field">
          <label>Company (Optional)</label>
          <input type="text" name="company" />
        </div>
        <div className="field">
          <label>Email Address</label>
          <input type="email" name="email" required />
        </div>
        <div className="field">
          <label>Phone Number</label>
          <input type="tel" name="phone" required />
        </div>
        {!fmt.physical && (
          <div className="field">
            <label>Country</label>
            <input 
              type="text" 
              name="country" 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required 
            />
          </div>
        )}
        
        {fmt.physical && (
          <>
            <div className="field" style={{ gridColumn: "1/-1" }}>
              <label>Delivery Address</label>
              <textarea name="address" required rows={3} style={{ resize: "vertical" }}></textarea>
            </div>
            <div className="field">
              <label>City</label>
              <input type="text" name="city" required />
            </div>
            <div className="field">
              <label>State / Region</label>
              <input type="text" name="state" required />
            </div>
            <div className="field">
              <label>PIN/ZIP Code</label>
              <input type="text" name="pincode" required />
            </div>
            <div className="field">
              <label>Country</label>
              <input 
                type="text" 
                name="country" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required 
              />
            </div>
          </>
        )}

        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label>Quantity</label>
          <input 
            type="number" 
            name="quantity" 
            min="1"
            max="1000"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            required
          />
          <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: 8, marginBottom: 0 }}>
            <strong>Bulk Discounts:</strong> 10+ copies (10% off), 50+ copies (15% off), 100+ copies (20% off).
          </p>
        </div>
        
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label>Promo Code</label>
          <div style={{ display: "flex", gap: 12 }}>
            <input 
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="e.g. WELCOME10"
              style={{ flex: 1, textTransform: "uppercase" }}
            />
            {promo && (
              <div style={{ padding: "8px 12px", background: "#dcfce7", color: "#166534", borderRadius: 6, fontWeight: 500, fontSize: "0.9rem", display: "flex", alignItems: "center" }}>
                Valid Code!
              </div>
            )}
          </div>
        </div>

        {wallet > 0 ? (
          <div className="field" style={{ gridColumn: "1/-1", background: "#fef3c7", padding: 16, borderRadius: 8, border: "1px solid #fde68a" }}>
            <label style={{ color: "#92400e" }}>
              Redeem MI Credits (Balance: {wallet})
            </label>
            <p style={{ fontSize: "0.85rem", color: "#b45309", marginBottom: 12, marginTop: -4 }}>
              1 INR = 2 Credits. You can apply up to {maxCreditsAllowedToApply} credits to this order.
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <input 
                type="number" 
                min="0"
                max={maxCreditsAllowedToApply}
                value={creditsToUse}
                onChange={(e) => setCreditsToUse(parseInt(e.target.value, 10) || 0)}
                style={{ flex: "1 1 auto", padding: "8px 12px", borderRadius: "6px", border: "1px solid #fcd34d" }}
              />
              <button 
                type="button" 
                className="btn btn-dark btn-sm" 
                onClick={() => setCreditsToUse(maxCreditsAllowedToApply)}
                style={{ whiteSpace: "nowrap" }}
              >
                Apply Max ({maxCreditsAllowedToApply})
              </button>
            </div>
            <div style={{ marginTop: 12, fontSize: "0.9rem", color: "#92400e" }}>
              Applying <strong>{validCreditsToUse} Credits</strong> to save <strong>{currencySymbol} {creditDiscount}</strong>
            </div>
          </div>
        ) : (
          <div className="field" style={{ gridColumn: "1/-1", background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <label style={{ color: "#475569" }}>Redeem MI Credits</label>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
              You have 0 MI Credits available to redeem. (If you have credits, please make sure you are logged in!)
            </p>
          </div>
        )}

        <p style={{ gridColumn: "1/-1", fontSize: ".78rem", color: "var(--ink-faint)", marginTop: 8 }}>
          Your details are used only to fulfil this order. Payment instructions (UPI &amp; International) are on the next screen.
        </p>
        <button className="btn btn-primary" style={{ marginTop: 12, gridColumn: "1/-1" }} type="submit" disabled={loading}>
          {loading ? "Processing..." : `Place Order - ${currencySymbol} ${finalPrice.toLocaleString("en-IN")}`}
        </button>
      </form>
    </>
  );
}
