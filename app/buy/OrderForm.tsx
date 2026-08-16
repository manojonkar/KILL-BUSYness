"use client";

import React, { useState } from "react";
import type { BookFormat } from "@/lib/book";

interface OrderFormProps {
  fmt: BookFormat;
  placeOrder: (formData: FormData) => Promise<void>;
  wallet?: number;
}

export default function OrderForm({ fmt, placeOrder, wallet = 0 }: OrderFormProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [creditsToUse, setCreditsToUse] = useState<number>(0);

  const price = fmt.price;
  const subtotal = price * quantity;
  
  let discountPercent = 0;
  if (quantity > 100) {
    discountPercent = 20;
  } else if (quantity > 10) {
    discountPercent = 10;
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const priceAfterBulk = subtotal - discountAmount;
  
  // Calculate max credits they can use (2 credits = 1 INR)
  const maxCreditsValue = Math.floor(wallet / 2);
  const maxCreditsAllowedToApply = Math.min(wallet, priceAfterBulk * 2);
  
  // Ensure the slider value doesn't exceed the new max if quantity drops
  const validCreditsToUse = Math.min(creditsToUse, maxCreditsAllowedToApply);
  const creditDiscountINR = Math.floor(validCreditsToUse / 2);
  
  const finalPrice = Math.max(0, priceAfterBulk - creditDiscountINR);

  return (
    <form action={placeOrder} className="form-grid">
      <input type="hidden" name="format" value={fmt.key} />
      <input type="hidden" name="appliedCredits" value={validCreditsToUse} />
      
      <div className="field">
        <label htmlFor="name">Your Name</label>
        <input id="name" name="name" placeholder="Full name" required />
      </div>
      
      <div className="field">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" placeholder="Company name" />
      </div>
      
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@company.com" required />
      </div>
      
      <div className="field">
        <label htmlFor="phone">Contact Number</label>
        <input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
      </div>

      <div className="field">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          max="1000"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
          required
        />
      </div>

      {fmt.physical ? (
        <>
          <div className="field full">
            <label htmlFor="address">Delivery Address</label>
            <textarea id="address" name="address" rows={3} placeholder="Flat / building / street" required />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" placeholder="City" required />
          </div>
          <div className="field">
            <label htmlFor="state">State</label>
            <input id="state" name="state" placeholder="State" />
          </div>
          <div className="field">
            <label htmlFor="pincode">PIN Code</label>
            <input id="pincode" name="pincode" placeholder="400001" required />
          </div>
        </>
      ) : null}

      {quantity > 1 && (
        <div 
          style={{ 
            gridColumn: "1/-1", 
            padding: "16px 20px", 
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", 
            borderRadius: "10px", 
            border: "1px solid #cbd5e1", 
            marginTop: "12px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "8px" 
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", color: "#475569" }}>
            <span>Subtotal ({quantity} books)</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {discountPercent > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", color: "#0f766e", fontWeight: 600 }}>
              <span>Bulk Discount ({discountPercent}% off)</span>
              <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
            </div>
          )}
          {validCreditsToUse > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", color: "#D9A441", fontWeight: 600 }}>
              <span>MI Credits Applied ({validCreditsToUse} Credits)</span>
              <span>-₹{creditDiscountINR.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 700, paddingTop: "8px", borderTop: "1px solid #cbd5e1", color: "#0f172a" }}>
            <span>Total Amount</span>
            <span>₹{finalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {wallet > 0 && (
        <div className="field full" style={{ marginTop: 12, padding: "16px 20px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
          <label style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#92400e", fontWeight: 600 }}>Use MI Credits for a discount</span>
            <span style={{ color: "#b45309", fontSize: "0.9rem" }}>Available: {wallet} (₹{maxCreditsValue})</span>
          </label>
          <input
            type="range"
            min="0"
            max={maxCreditsAllowedToApply}
            step="2"
            value={validCreditsToUse}
            onChange={(e) => setCreditsToUse(parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: "#d97706" }}
          />
          <div style={{ textAlign: "center", marginTop: 8, fontSize: "0.9rem", color: "#92400e" }}>
            Applying <strong>{validCreditsToUse} Credits</strong> to save <strong>₹{creditDiscountINR}</strong>
          </div>
        </div>
      )}

      <p style={{ gridColumn: "1/-1", fontSize: ".78rem", color: "var(--ink-faint)", marginTop: 8 }}>
        Your details are used only to fulfil this order. Payment is by UPI on the next screen.
      </p>

      <button className="btn btn-primary" style={{ marginTop: 12, gridColumn: "1/-1" }} type="submit">
        Place Order — ₹{finalPrice.toLocaleString("en-IN")}
      </button>
    </form>
  );
}
