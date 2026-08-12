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

  const fail = (m: string) => redirect(`/buy?format=${formatKey}&error=${encodeURIComponent(m)}`);
  if (!name) fail("Please enter your name.");
  if (!EMAIL_RE.test(email)) fail("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 7) fail("Please enter a valid contact number.");
  if (fmt.physical && (!address || !city || !pincode)) fail("Please give a full delivery address including city and PIN code.");

  const supabase = createClient();
  const ref = "KB-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  const { error } = await supabase
    .from("book_orders")
    .insert({
      ref,
      format: fmt.key,
      amount: fmt.price,
      name,
      company: company || null,
      email,
      phone,
      address: fmt.physical ? address : null,
      city: fmt.physical ? city : null,
      state: fmt.physical ? state : null,
      pincode: fmt.physical ? pincode : null
    });

  if (error) fail("We couldn't record your order just then. Please try again.");

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const resend = new Resend(key);
    const delivery = fmt.physical ? `${address}, ${city}${state ? ", " + state : ""} ${pincode}` : "eBook — email delivery";
    try {
      await resend.emails.send({
        from: "KILL BUSYness <admin@killbusyness.com>",
        to: "admin@managementinnovations.co.in",
        replyTo: email,
        subject: `Book order ${ref} — ${fmt.label} — Rs ${fmt.price}`,
        html:
          `<p><strong>${name}</strong>${company ? ` (${company})` : ""} ordered the <strong>${fmt.label}</strong>.</p>` +
          `<p><strong>Reference:</strong> ${ref}<br/><strong>Amount:</strong> Rs ${fmt.price}<br/>` +
          `<strong>Email:</strong> ${email}<br/><strong>Phone:</strong> ${phone}</p>` +
          `<p><strong>Delivery:</strong><br/>${delivery}</p>` +
          `<p>Payment is by UPI and is <strong>not yet confirmed</strong>. Mark the order paid once the money arrives.</p>`
      });
    } catch {
    }
    try {
      await resend.emails.send({
        from: "KILL BUSYness <admin@killbusyness.com>",
        to: email,
        subject: `Your KILL BUSYness order ${ref}`,
        html:
          `<p>Thank you ${name},</p>` +
          `<p>Your order for the <strong>${fmt.label}</strong> is recorded. Reference <strong>${ref}</strong>, amount <strong>Rs ${fmt.price}</strong>.</p>` +
          `<p>To complete it, pay by UPI and <strong>put ${ref} in the payment note</strong> so we can match it to your order.</p>` +
          `<p>${fmt.physical ? "Once payment is confirmed your copy will be couriered to the address you gave." : "Once payment is confirmed the eBook will be emailed to this address."}</p>` +
          `<p>Questions? Just reply to this email.</p>`
      });
    } catch {
    }
  }

  redirect(`/buy?ref=${encodeURIComponent(ref)}&format=${formatKey}`);
}
