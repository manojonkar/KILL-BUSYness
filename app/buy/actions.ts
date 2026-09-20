"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FORMATS, PROMO_CODES } from "@/lib/book";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function placeOrder(formData: FormData) {
  const g = (k: string) => String(formData.get(k) || "").trim();
  const formatKey = g("format");
  const fmt = FORMATS[formatKey];
  if (!fmt) return { error: "Invalid format selected." };

  const name = g("name");
  const company = g("company");
  const email = g("email").toLowerCase();
  const phone = g("phone");
  const address = g("address");
  const city = g("city");
  const state = g("state");
  const pincode = g("pincode");
  const country = g("country");
  const qtyStr = g("quantity");

  const fail = (m: string) => { return { error: m }; };
  if (!name) return fail("Please enter your name.");
  if (!EMAIL_RE.test(email)) return fail("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 7) return fail("Please enter a valid contact number.");
  if (fmt.physical && (!address || !city || !pincode)) return fail("Please give a full delivery address including city and PIN/ZIP code.");
  
  const fullAddress = country && country.toLowerCase() !== 'india' ? `${address}\nCountry: ${country}` : address;

  const quantity = Math.max(1, parseInt(qtyStr, 10) || 1);
  const appliedCreditsStr = g("appliedCredits");
  const appliedCredits = Math.max(0, parseInt(appliedCreditsStr, 10) || 0);
  const appliedPromo = g("appliedPromo").trim().toUpperCase();

  const isInternational = country && country.trim().toLowerCase() !== 'india' && country.trim() !== '';
  const basePrice = Number((isInternational ? (fmt.usdPrice || fmt.price / 83) : fmt.price).toFixed(2));
  const subtotal = basePrice * quantity;
  
  let discountPercent = 0;
  if (quantity >= 100) {
    discountPercent = 20;
  } else if (quantity >= 50) {
    discountPercent = 15;
  } else if (quantity >= 10) {
    discountPercent = 10;
  }

  const promo = PROMO_CODES[appliedPromo];
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
  const maxCreditsAllowedToApply = Math.floor(priceAfterBulk * creditValueRatio);
  const validCreditsToUse = Math.min(appliedCredits, maxCreditsAllowedToApply);
  const creditDiscount = Number((isInternational ? validCreditsToUse / creditValueRatio : Math.floor(validCreditsToUse / creditValueRatio)).toFixed(2));
  
  const finalPrice = Math.max(0, Number((priceAfterBulk - creditDiscount).toFixed(2)));

  const supabase = createClient();
  let userId = null;

  if (validCreditsToUse > 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return fail("You must be logged in to apply credits.");
    }
    userId = user.id;
    const { data: progress } = await supabase.from("user_progress").select("wallet").eq("user_id", user.id).single();
    if (!progress || progress.wallet < validCreditsToUse) {
      return fail("Failed to apply MI Credits. Please check your balance.");
    }
    
    const { error: deductErr } = await supabase.from("user_progress").update({ wallet: progress.wallet - validCreditsToUse }).eq("user_id", user.id);
    if (deductErr) {
      return fail("Failed to apply MI Credits. Please try again.");
    }
  }

  const orderNotes = `Quantity: ${quantity}${
    discountPercent > 0 
      ? `, Applied ${discountPercent}% bulk discount (saved ${isInternational ? 'US$' : 'Rs'} ${discountAmount})` 
      : ""
  }${
    promo
      ? `, Applied Promo Code: ${appliedPromo}`
      : ""
  }${
    validCreditsToUse > 0
      ? `, Applied ${validCreditsToUse} MI Credits (saved ${isInternational ? 'US$' : 'Rs'} ${creditDiscount})`
      : ""
  }`;

  // If price is 0, just insert as a redemption and skip the book_orders constraint completely!
  if (finalPrice === 0 && userId) {
    await supabase.from("redemptions").insert({
      user_id: userId,
      item: `FULL_ORDER_${fmt.key}`,
      cost: validCreditsToUse
    });
    redirect(`/buy?format=${fmt.key}&ref=FREE_CREDIT_ORDER&paid=true`);
    return;
  }

  const ref = "KB-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  
  // Bypass DB constraints by storing unsupported formats as ebook + notes
  const dbFormat = (fmt.key === 'ebook' || fmt.key === 'paperback') ? fmt.key : 'ebook';
  const notesPrefix = (fmt.key !== dbFormat) ? `[FORMAT:${fmt.key}] ` : '';

  const { error } = await supabase
    .from("book_orders")
    .insert({
      ref,
      format: dbFormat,
      amount: finalPrice,
      status: finalPrice === 0 ? 'paid' : 'awaiting_payment',
      unit_price: basePrice,
      quantity,
      name,
      company: company || null,
      email,
      phone,
      address: fmt.physical ? fullAddress : null,
      city: fmt.physical ? city : null,
      state: fmt.physical ? state : null,
      pincode: fmt.physical ? pincode : null,
      notes: notesPrefix + orderNotes
    });

  if (error) return fail(`We couldn't record your order just then. Please try again. (${error.message})`);

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const resend = new Resend(key);
    try {
      await resend.emails.send({
        from: "KILL BUSYness <hello@killbusyness.com>",
        to: email,
        subject: `Your Order Reference: ${ref}`,
        html: `<p>Hi ${name},</p><p>You ordered ${quantity}x <strong>${fmt.label}</strong>.</p><p>Your reference is <strong>${ref}</strong>.</p><p>Amount to pay: ${isInternational ? 'US$' : 'Rs'} ${finalPrice}</p><p>Please complete payment by ${isInternational ? 'Razorpay' : 'UPI'} if you haven't already.</p>`
      });
    } catch (e) {}
  }

  redirect(`/buy?format=${fmt.key}&ref=${ref}${isInternational ? '&intl=true' : ''}`);
}

export async function submitTransactionId(formData: FormData) {
  const ref = String(formData.get("ref") || "");
  const utr = String(formData.get("utr") || "");
  const format = String(formData.get("format") || "");

  if (ref && utr) {
    const supabase = createClient();
    const { data: order } = await supabase.from("book_orders").select("notes").eq("ref", ref).single();
    if (order) {
      await supabase
        .from("book_orders")
        .update({ notes: (order.notes || "") + `\n[UTR: ${utr}]` })
        .eq("ref", ref);
    }
  }

  redirect(`/buy?format=${format}&ref=${ref}&paid=true`);
}
