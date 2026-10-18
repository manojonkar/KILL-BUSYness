"use server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendPortalEmail } from "@/lib/email";

async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== "manojonkar@gmail.com") {
    throw new Error("Unauthorized");
  }
  return supabase;
}

// Supabase's listUsers() returns only 50 users by default, so anyone beyond the first page
// was invisible (accounts "not found", duplicate grants, failed updates). Page through everyone.
async function listAllUsers(adminClient: any): Promise<{ data: { users: any[] } }> {
  const users: any[] = [];
  const perPage = 1000;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const batch = data?.users || [];
    users.push(...batch);
    if (batch.length < perPage) break;
  }
  return { data: { users } };
}

// fetch wrapper that logs when Resend rejects an email instead of failing silently.
async function checkedFetch(input: string, init: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[GrantAccess] Resend rejected email:", res.status, detail);
  }
  return res;
}

// Builds the same hardened link used by /forgot: redirects to /auth/recovery (which
// establishes the session and sends the user to the set-password page) and goes through
// /auth/verify-link so email scanners can't consume the one-time token.
async function buildSecureRecoveryLink(email: string): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl}/auth/recovery` },
  });
  const actionLink = data?.properties?.action_link;
  if (error || !actionLink) {
    console.error("[GrantAccess] Could not generate recovery link:", error?.message);
    return `${siteUrl}/forgot`;
  }
  return `${siteUrl}/auth/verify-link?target=${encodeURIComponent(actionLink)}`;
}

async function sendWelcomeEmail(name: string, email: string, formats: string[]) {
  let formatList = [];
  if (formats.includes("ebook")) formatList.push("the Digital eBook");
  if (formats.includes("audiobook")) formatList.push("the full AudioBook");
  if (formats.includes("masterclass")) formatList.push("the High-Performance Masterclass");
  
  if (formatList.length === 0) return;
  
  let formatText = formatList.join(", ");
  if (formatList.length > 1) {
    const last = formatList.pop();
    formatText = formatList.join(", ") + " and " + last;
  }

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
  
  // Generate a magic link so they don't get a "User already registered" error
  const magicLink = await buildSecureRecoveryLink(email);

  await sendPortalEmail({
    from: "Team KILL BUSYness <admin@killbusyness.com>",
    to: email,
    cc: "Killbusynessteam@gmail.com",
    replyTo: "admin@managementinnovations.co.in",
    subject: "Your Exclusive Access to KILL BUSYness is Ready!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b;">
        <h2 style="color: #0E9C74;">Welcome, ${name}!</h2>
        <p>Thank you for your interest in KILL BUSYness! We have securely unlocked your free digital access on our private portal.</p>
        <p>You have been granted full access to: <strong>${formatText}</strong>.</p>
        <p>Since your account has already been securely generated in the background, you do not need to register. Simply click the secure access link below to instantly log in and set a password of your choice:</p>
        <div style="margin: 24px 0;">
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background: #0E9C74; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 12px;">Secure Auto-Login & Set Password</a>
        </div>
        <p>If the link above expires, you can always request a new one by going to <a href="${BASE_URL}/forgot">${BASE_URL}/forgot</a>.</p>
        <p>Welcome to the journey to build a High Performance Organization!</p>
        <p style="color: #64748b; font-size: 0.9em;">- Manoj Onkar</p>
      </div>
    `
  });
}

async function sendAppInviteEmail(name: string, email: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
  
  const magicLink = await buildSecureRecoveryLink(email);

  await sendPortalEmail({
    from: "Team KILL BUSYness <admin@killbusyness.com>",
    to: email,
    cc: "Killbusynessteam@gmail.com",
    replyTo: "admin@managementinnovations.co.in",
    subject: "Invitation: Help shape the future of the KILL BUSYness app (Beta)",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b; line-height: 1.6;">
        <p>Hi ${name || "there"},</p>
        <p>We are reaching out because we value your perspective as a leader.</p>
        <p>For years, our team at Management Innovations has watched brilliant executives get trapped in the "Extractive Century" model—confusing motion with progress, and endless busyness with actual business outcomes. That’s exactly why Manoj Onkar wrote <em>KILL BUSYness</em>.</p>
        <p>But reading a book is only step one. Changing organizational behavior requires daily, in-the-moment reinforcement.</p>
        <p>That’s why our team has been secretly building the <strong>KILL BUSYness App</strong>—a bite-sized, gamified learning companion designed to help leaders instantly shift from activities to outcomes. And before we launch it to the public, we want you to be one of the very first to test the Beta version.</p>
        
        <h3 style="color: #0E9C74; margin-top: 24px;">What you'll find inside:</h3>
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 10px;"><strong>2-Minute Micro-Modules:</strong> The entire <em>KILL BUSYness</em> methodology broken down into actionable, bite-sized lessons with built-in audio.</li>
          <li style="margin-bottom: 10px;"><strong>The AI OD Coach:</strong> We've trained a dedicated AI engine on Manoj's exact organizational development frameworks. It acts as an on-demand consultant to help you navigate your current team dilemmas.</li>
          <li style="margin-bottom: 10px;"><strong>Reflection & Gamification:</strong> Earn "MI Credits" for completing modules and reflecting on how to apply them to your workspace.</li>
        </ul>
        
        <h3 style="color: #0E9C74; margin-top: 24px;">Our ask of you:</h3>
        <p>We’re not looking for praise; we’re looking for friction. We want you to log in, test the interface, and try to stump the AI Coach with your hardest leadership challenges.</p>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">
            <strong>Access the Beta here:</strong><br/>
            Since your secure account has already been generated, simply click the secure access link below to instantly log in and set a password:<br/>
            <a href="${magicLink}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background: #0E9C74; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Secure Auto-Login & Set Password</a>
          </li>
          <li style="margin-bottom: 10px;"><strong>Download the App:</strong> For the best experience, install the app directly to your phone or desktop. Open the link in Chrome or Safari, tap the Share/Menu icon, and select <strong>"Add to Home Screen"</strong> (or "Install App" on desktop).</li>
          <li style="margin-bottom: 10px;"><strong>Give Feedback:</strong> Use the thumbs up/down buttons inside the AI Coach, or click the "Email KILL BUSYness Team" button to tell us exactly what works, what doesn't, and what you'd like to see added.</li>
        </ol>
        
        <p>Your insights will directly shape the final version of this platform.</p>
        <p>Thank you for your time, your leadership, and your feedback. Let's kill busyness together.</p>
        <p><em>Note: Please send any direct replies or questions to Manoj@managementinnovations.co.in</em></p>
        
        <p style="margin-top: 30px;">Best regards,<br/><br/><strong>Team KILL BUSYness</strong><br/>Management Innovations</p>
      </div>
    `
  });
}

async function handleMetadata(email: string, name: string, isMasterclass: boolean, isApp: boolean) {
  const adminClient = createAdminClient();
  const { data: searchData } = await listAllUsers(adminClient);
  const existingUser = searchData?.users?.find((u: any) => u.email === email);
  
  const updates: any = { name };
  if (isMasterclass) {
    updates.is_masterclass_invitee = true;
    updates.masterclass_accessed = false;
    updates.invited_at = new Date().toISOString();
  }
  if (isApp) {
    updates.is_app_invitee = true;
    updates.app_invited_at = new Date().toISOString();
  }

  if (!existingUser) {
    await adminClient.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-10) + "A1!", 
      email_confirm: true,
      user_metadata: updates
    });
  } else {
    await adminClient.auth.admin.updateUserById(existingUser.id, {
      user_metadata: { ...existingUser.user_metadata, ...updates }
    });
  }
}

async function getMetadataUsers() {
  const adminClient = createAdminClient();
  const { data: searchData } = await listAllUsers(adminClient);
  const usersWithMasterclass = new Set<string>();
  const usersWithApp = new Set<string>();
  
  searchData?.users?.forEach((u: any) => {
    if (u.user_metadata?.is_masterclass_invitee) usersWithMasterclass.add(u.email);
    if (u.user_metadata?.is_app_invitee) usersWithApp.add(u.email);
  });
  return { usersWithMasterclass, usersWithApp };
}

export async function coreGrantSingleAccess(supabase: any, name: string, email: string, formats: string[]) {
  if (!name || !email || formats.length === 0) return { error: "Missing fields" };
  
  const normalizedEmail = email.trim().toLowerCase();

  // Check existing book/audiobook orders
  const { data: existingOrders } = await supabase.from("book_orders")
    .select("format, notes")
    .eq("email", normalizedEmail)
    .in("status", ["paid", "dispatched"]);

  const hasEbook = existingOrders?.some((o: any) => o.format === "ebook" || o.format === "paperback" || o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));
  const hasAudio = existingOrders?.some((o: any) => o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));

  // Check existing metadata access
  const { usersWithMasterclass, usersWithApp } = await getMetadataUsers();
  const hasMasterclass = usersWithMasterclass.has(normalizedEmail);
  const hasApp = usersWithApp.has(normalizedEmail);

  const formatsToGrant = formats.filter(f => {
    if (f === "ebook" && hasEbook) return false;
    if (f === "audiobook" && hasAudio) return false;
    if (f === "masterclass" && hasMasterclass) return false;
    if (f === "app" && hasApp) return false;
    return true;
  });

  if (formatsToGrant.length === 0) {
    return { error: "User already has access to the selected formats." };
  }

  // Process eBook / AudioBook (book_orders table)
  const bookFormats = formatsToGrant.filter(f => f === "ebook" || f === "audiobook");
  if (bookFormats.length > 0) {
    const rows = bookFormats.map(f => ({
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
  }

  // Process Metadata (auth.users metadata)
  const grantMasterclass = formatsToGrant.includes("masterclass");
  const grantApp = formatsToGrant.includes("app");
  if (grantMasterclass || grantApp) {
    await handleMetadata(normalizedEmail, name, grantMasterclass, grantApp);
  }

  // Send emails
  if (formatsToGrant.some(f => ["ebook", "audiobook", "masterclass"].includes(f))) {
    await sendWelcomeEmail(name, normalizedEmail, formatsToGrant);
  }
  if (grantApp) {
    await sendAppInviteEmail(name, normalizedEmail);
  }

  return { success: true, message: `Successfully granted access to ${normalizedEmail} and sent welcome email(s)!` };
}

export async function grantSingleAccess(name: string, email: string, formats: string[]) {
  try {
    const supabase = await verifyAdmin();
    return await coreGrantSingleAccess(supabase, name, email, formats);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function resendAccessEmail(name: string, email: string, formats: string[]) {
  try {
    await verifyAdmin();
    const normalizedEmail = email.trim().toLowerCase();
    if (!name || !normalizedEmail || formats.length === 0) return { error: "Missing fields" };
    if (formats.some(f => ["ebook", "audiobook", "masterclass"].includes(f))) {
      await sendWelcomeEmail(name, normalizedEmail, formats);
    }
    if (formats.includes("app")) {
      await sendAppInviteEmail(name, normalizedEmail);
    }
    return { success: true, message: `Email(s) re-sent to ${normalizedEmail}.` };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function grantBulkAccess(csvText: string, formats: string[]) {
  try {
    const supabase = await verifyAdmin();
    if (formats.length === 0) return { error: "No formats selected" };

    const validEntries: {name: string, email: string}[] = [];
    const lines = csvText.split(/\r?\n/);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 2) continue;

      let name = cols[0];
      let email = cols[1];

      if (name.includes("@") && !email.includes("@")) {
        name = cols[1];
        email = cols[0];
      }

      if (email.toLowerCase() === "email" || !email.includes("@")) {
        continue;
      }

      validEntries.push({ name: name.trim(), email: email.trim().toLowerCase() });
    }

    if (validEntries.length === 0) return { error: "No valid rows found in CSV." };

    // Deduplication check for book orders
    const { data: existingOrders } = await supabase.from("book_orders")
      .select("email, format, notes")
      .in("email", validEntries.map(e => e.email))
      .in("status", ["paid", "dispatched"]);

    const existingOrderMap = new Map<string, any[]>();
    existingOrders?.forEach(o => {
      if (!existingOrderMap.has(o.email)) existingOrderMap.set(o.email, []);
      existingOrderMap.get(o.email)!.push(o);
    });

    // Deduplication check for metadata
    const { usersWithMasterclass, usersWithApp } = await getMetadataUsers();

    const newEntries: {name: string, email: string, formatsToGrant: string[]}[] = [];
    let skippedCount = 0;
    const rowsToInsert: any[] = [];

    for (const entry of validEntries) {
      const userOrders = existingOrderMap.get(entry.email) || [];
      const hasEbook = userOrders.some(o => o.format === "ebook" || o.format === "paperback" || o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));
      const hasAudio = userOrders.some(o => o.format === "audiobook" || (o.notes && o.notes.includes("[FORMAT:audiobook]")));
      const hasMasterclass = usersWithMasterclass.has(entry.email);
      const hasApp = usersWithApp.has(entry.email);

      const formatsToGrant = formats.filter(f => {
        if (f === "ebook" && hasEbook) return false;
        if (f === "audiobook" && hasAudio) return false;
        if (f === "masterclass" && hasMasterclass) return false;
        if (f === "app" && hasApp) return false;
        return true;
      });

      if (formatsToGrant.length === 0) {
        skippedCount++;
        continue;
      }

      newEntries.push({ name: entry.name, email: entry.email, formatsToGrant });

      // Queue book orders
      const bookFormats = formatsToGrant.filter(f => f === "ebook" || f === "audiobook");
      bookFormats.forEach(f => {
        rowsToInsert.push({
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

    if (newEntries.length === 0) {
      return { success: true, count: 0, skipped: skippedCount, message: `Skipped all ${skippedCount} users because they already have access.` };
    }

    // Insert book orders
    if (rowsToInsert.length > 0) {
      const { error } = await supabase.from("book_orders").insert(rowsToInsert);
      if (error) return { error: error.message };
    }

    // Process Metadata and send emails in parallel (using chunks for safety)
    const chunkSize = 10;
    for (let i = 0; i < newEntries.length; i += chunkSize) {
      const chunk = newEntries.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (e) => {
        const grantMasterclass = e.formatsToGrant.includes("masterclass");
        const grantApp = e.formatsToGrant.includes("app");
        if (grantMasterclass || grantApp) {
          await handleMetadata(e.email, e.name, grantMasterclass, grantApp);
        }
        if (e.formatsToGrant.some(f => ["ebook", "audiobook", "masterclass"].includes(f))) {
          await sendWelcomeEmail(e.name, e.email, e.formatsToGrant);
        }
        if (grantApp) {
          await sendAppInviteEmail(e.name, e.email);
        }
      }));
    }

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
