"use server";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.killbusyness.com";

async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== "manojonkar@gmail.com") {
    throw new Error("Unauthorized");
  }
  return supabase;
}

async function sendWelcomeEmail(name: string, email: string, formats: string[]) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const formatText = formats.includes("ebook") && formats.includes("audiobook") 
    ? "the Digital eBook and full AudioBook" 
    : formats.includes("ebook") ? "the Digital eBook" : "the full AudioBook";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "KILL BUSYness <admin@killbusyness.com>",
      to: email,
      subject: "Your Free Access to KILL BUSYness is Ready!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b;">
          <h2 style="color: #0E9C74;">Welcome, ${name}!</h2>
          <p>Thank you for purchasing KILL BUSYness! We have unlocked your free digital access on our portal.</p>
          <p>You have been granted full access to: <strong>${formatText}</strong>.</p>
          <p>To start reading and listening, please use this exact email address (<strong>${email}</strong>). If you are new to the portal, please register first. If you already have an account, simply log in!</p>
          <div style="margin: 24px 0;">
            <a href="${BASE_URL}/register" style="display: inline-block; padding: 12px 24px; background: #0E9C74; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 12px;">Register</a>
            <a href="${BASE_URL}/login" style="display: inline-block; padding: 12px 24px; background: #fff; color: #0E9C74; text-decoration: none; border-radius: 8px; font-weight: bold; border: 2px solid #0E9C74;">Access Portal</a>
          </div>
          <p>Welcome to the journey to build a High Performance Organization!</p>
          <p style="color: #64748b; font-size: 0.9em;">- Manoj Onkar</p>
        </div>
      `
    })
  });
}

export async function grantSingleAccess(name: string, email: string, formats: string[]) {
  try {
    const supabase = await verifyAdmin();
    if (!name || !email || formats.length === 0) return { error: "Missing fields" };
    
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingOrders } = await supabase.from("book_orders")
      .select("format, notes")
      .eq("email", normalizedEmail)
      .in("status", ["paid", "dispatched"]);

    const hasEbook = existingOrders?.some(o => o.format === "ebook" || o.format === "paperback" || o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));
    const hasAudio = existingOrders?.some(o => o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));

    const formatsToGrant = formats.filter(f => {
      if (f === "ebook" && hasEbook) return false;
      if (f === "audiobook" && hasAudio) return false;
      return true;
    });

    if (formatsToGrant.length === 0) {
      return { error: "User already has access to the selected formats." };
    }

    const rows = formatsToGrant.map(f => ({
      ref: "KBA-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase(),
      email: normalizedEmail,
      name,
      phone: "N/A",
      format: f === "audiobook" ? "ebook" : f,
      status: "paid",
      amount: 0,
      unit_price: 0,
      quantity: 1,
      notes: f === "audiobook" ? "[FORMAT:audiobook] Manually granted via Admin" : "Manually granted via Admin"
    }));

    const { error } = await supabase.from("book_orders").insert(rows);
    if (error) return { error: error.message };

    await sendWelcomeEmail(name, email, formatsToGrant);
    return { success: true, message: `Successfully granted access to ${email} and sent welcome email!` };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function grantBulkAccess(csvText: string, formats: string[]) {
  try {
    const supabase = await verifyAdmin();
    if (formats.length === 0) return { error: "No formats selected" };

    const rows: any[] = [];
    const validEntries: {name: string, email: string}[] = [];
    
    // Simple CSV parser
    const lines = csvText.split(/\r?\n/);
    let skipped = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 2) continue;

      // Assume format is Name, Email. If they put Email, Name, try to detect.
      let name = cols[0];
      let email = cols[1];

      if (name.includes("@") && !email.includes("@")) {
        name = cols[1];
        email = cols[0];
      }

      // Skip header row if it says "email"
      if (email.toLowerCase() === "email" || !email.includes("@")) {
        skipped++;
        continue;
      }

      validEntries.push({ name: name.trim(), email: email.trim().toLowerCase() });
    }

    if (validEntries.length === 0) return { error: "No valid rows found in CSV. Make sure it has Name, Email columns." };

    // Deduplication check
    const { data: existingOrders } = await supabase.from("book_orders")
      .select("email, format, notes")
      .in("email", validEntries.map(e => e.email))
      .in("status", ["paid", "dispatched"]);

    const existingOrderMap = new Map<string, any[]>();
    existingOrders?.forEach(o => {
      if (!existingOrderMap.has(o.email)) existingOrderMap.set(o.email, []);
      existingOrderMap.get(o.email)!.push(o);
    });

    const newEntries: {name: string, email: string, formatsToGrant: string[]}[] = [];
    let skippedCount = 0;

    for (const entry of validEntries) {
      const userOrders = existingOrderMap.get(entry.email) || [];
      const hasEbook = userOrders.some(o => o.format === "ebook" || o.format === "paperback" || o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));
      const hasAudio = userOrders.some(o => o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));

      const formatsToGrant = formats.filter(f => {
        if (f === "ebook" && hasEbook) return false;
        if (f === "audiobook" && hasAudio) return false;
        return true;
      });

      if (formatsToGrant.length === 0) {
        skippedCount++;
        continue;
      }

      newEntries.push({ name: entry.name, email: entry.email, formatsToGrant });

      formatsToGrant.forEach(f => {
        rows.push({
          ref: "KBA-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase(),
          email: entry.email,
          name: entry.name,
          phone: "N/A",
          format: f === "audiobook" ? "ebook" : f,
          status: "paid",
          amount: 0,
          unit_price: 0,
          quantity: 1,
          notes: f === "audiobook" ? "[FORMAT:audiobook] Manually granted via Admin Bulk" : "Manually granted via Admin Bulk"
        });
      });
    }

    if (rows.length === 0) {
      return { success: true, count: 0, skipped: skippedCount, message: `Skipped all ${skippedCount} users because they already have access.` };
    }

    const { error } = await supabase.from("book_orders").insert(rows);
    if (error) return { error: error.message };

    // Send emails in parallel for newly granted formats
    await Promise.all(newEntries.map(e => sendWelcomeEmail(e.name, e.email, e.formatsToGrant)));

    return { 
      success: true, 
      count: newEntries.length, 
      skipped: skippedCount,
      message: `Successfully processed ${newEntries.length} new users and sent welcome emails! (Skipped ${skippedCount} who already had access).`
    };
  } catch (e: any) {
    return { error: e.message };
  }
}
