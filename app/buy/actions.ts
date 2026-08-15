"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FORMATS } from "@/lib/book";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function placeOrder(formData: FormData) {
  const g = (k: string) => String(formData.get(k) || "").trim();
  const formatKey = g("format");
  const fmt = FORMATS[formatKey];
  if (!fmt) redirect("/buy");

  const name = g("name");
  const company = g("company");
  const email = g("email").toLowerCase();
  const phone = g("phone");
  const address = g("address");
  const city = g("city");
  const state = g("state");
  const pincode = g("pincode");
  const qtyStr = g("quantity");

  const fail = (m: string) => redirect(`/buy?format=${formatKey}&error=${encodeURIComponent(m)}`);
  if (!name) fail("Please enter your name.");
  if (!EMAIL_RE.test(email)) fail("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 7) fail("Please enter a valid contact number.");
  if (fmt.physical && (!address || !city || !pincode)) fail("Please give a full delivery address including city and PIN code.");

  const quantity = Math.max(1, parseInt(qtyStr, 10) || 1);
  const basePrice = fmt.price;
  const subtotal = basePrice * quantity;
  
  let discountPercent = 0;
  if (quantity > 100) {
    discountPercent = 20;
  } else if (quantity > 10) {
    discountPercent = 10;
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalPrice = subtotal - discountAmount;

  const orderNotes = `Quantity: ${quantity}${
    discountPercent > 0 
      ? `, Applied ${discountPercent}% bulk discount (saved Rs ${discountAmount})` 
      : ""
  }`;

  const supabase = createClient();
  const ref = "KB-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  const { error } = await supabase
    .from("book_orders")
    .insert({
      ref,
      format: fmt.key,
      amount: finalPrice,
      unit_price: basePrice,
      quantity,
      name,
      company: company || null,
      email,
      phone,
      address: fmt.physical ? address : null,
      city: fmt.physical ? city : null,
      state: fmt.physical ? state : null,
      pincode: fmt.physical ? pincode : null,
      notes: orderNotes
    });

  if (error) fail("We couldn't record your order just then. Please try again.");

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const resend = new Resend(key);
    const delivery = fmt.physical ? `${address}, ${city}${state ? ", " + state : ""} ${pincode}` : "eBook — email delivery";
    
    // Admin email breakdown
    const emailBreakdown = `
      <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin-top: 12px; font-family: sans-serif;">
        <tr style="border-bottom: 1px solid #cbd5e1;">
          <th style="text-align: left; padding: 8px 0;">Item</th>
          <th style="text-align: right; padding: 8px 0;">Details</th>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Format</td>
          <td style="text-align: right; padding: 8px 0; font-weight: bold;">${fmt.label}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Unit Price</td>
          <td style="text-align: right; padding: 8px 0;">Rs ${basePrice.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Quantity</td>
          <td style="text-align: right; padding: 8px 0;">${quantity}</td>
        </tr>
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 8px 0;">Subtotal</td>
          <td style="text-align: right; padding: 8px 0;">Rs ${subtotal.toLocaleString("en-IN")}</td>
        </tr>
        ${discountPercent > 0 ? `
        <tr style="color: #0f766e;">
          <td style="padding: 8px 0;">Bulk Discount (${discountPercent}%)</td>
          <td style="text-align: right; padding: 8px 0;">-Rs ${discountAmount.toLocaleString("en-IN")}</td>
        </tr>` : ""}
        <tr style="border-top: 2px solid #94a3b8; font-weight: bold; font-size: 1.1rem; color: #0f172a;">
          <td style="padding: 8px 0;">Total Amount</td>
          <td style="text-align: right; padding: 8px 0;">Rs ${finalPrice.toLocaleString("en-IN")}</td>
        </tr>
      </table>
    `;

    try {
      await resend.emails.send({
        from: "KILL BUSYness <admin@killbusyness.com>",
        to: "admin@managementinnovations.co.in",
        cc: "manoj@managementinnovations.co.in",
        replyTo: email,
        subject: `Book order ${ref} — ${fmt.label} — Qty ${quantity} — Rs ${finalPrice}`,
        html:
          `<p><strong>${name}</strong>${company ? ` (${company})` : ""} ordered the <strong>${fmt.label}</strong>.</p>` +
          `<p><strong>Reference:</strong> ${ref}<br/>` +
          `<strong>Email:</strong> ${email}<br/><strong>Phone:</strong> ${phone}</p>` +
          `<h3>Order Summary</h3>` +
          emailBreakdown +
          `<p><strong>Delivery:</strong><br/>${delivery}</p>` +
          `<p>Payment is by UPI and is <strong>not yet confirmed</strong>. Mark the order paid once the money arrives.</p>`
      });
    } catch {
    }
    
    try {
      await resend.emails.send({
        from: "KILL BUSYness <admin@killbusyness.com>",
        to: email,
        cc: "manoj@managementinnovations.co.in",
        subject: `Your KILL BUSYness order ${ref}`,
        html:
          `<p>Thank you ${name},</p>` +
          `<p>Your order for the <strong>${fmt.label}</strong> is recorded. Reference: <strong>${ref}</strong>.</p>` +
          `<h3>Order Summary</h3>` +
          emailBreakdown +
          `<p>To complete it, pay by UPI and <strong>put ${ref} in the payment note</strong> so we can match it to your order.</p>` +
          `<p>${fmt.physical ? "Once payment is confirmed your copy will be couriered to the address you gave." : "Once payment is confirmed the eBook will be emailed to this address."}</p>` +
          `<p>Questions? Just reply to this email.</p>`
      });
    } catch {
    }
  }

  redirect(`/buy?ref=${encodeURIComponent(ref)}&format=${formatKey}`);
}

export async function submitTransactionId(formData: FormData) {
  const ref = String(formData.get("ref") || "").trim();
  const utr = String(formData.get("utr") || "").trim();
  const formatKey = String(formData.get("format") || "paperback").trim();

  if (!ref) redirect("/buy");

  const supabase = createClient();
  
  // Fetch existing order details
  const { data: order } = await supabase
    .from("book_orders")
    .select("notes, amount, name, email")
    .eq("ref", ref)
    .maybeSingle();

  if (order) {
    const updatedNotes = order.notes 
      ? `${order.notes}, UTR: ${utr}`
      : `UTR: ${utr}`;

    await supabase
      .from("book_orders")
      .update({ notes: updatedNotes })
      .eq("ref", ref);

    // Send notification email to admin about UTR submission
    const key = process.env.RESEND_API_KEY;
    if (key && utr) {
      const resend = new Resend(key);
      try {
        await resend.emails.send({
          from: "KILL BUSYness <admin@killbusyness.com>",
          to: "admin@managementinnovations.co.in",
          cc: "manoj@managementinnovations.co.in",
          subject: `Payment update for order ${ref} — UTR: ${utr}`,
          html: `<p>Payment details updated for order <strong>${ref}</strong> (${order.name}, ${order.email}).</p>` +
                `<p><strong>UPI Transaction Reference / UTR:</strong> ${utr}</p>`
        });
      } catch {}
    }
  }

  redirect(`/buy?ref=${encodeURIComponent(ref)}&paid=true&format=${formatKey}`);
}
