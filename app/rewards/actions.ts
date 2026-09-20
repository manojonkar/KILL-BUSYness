"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProgress } from "@/lib/gamification";
import { Resend } from "resend";

export async function redeemItem(name: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: itemData } = await supabase.from('store_items').select('cost').eq('item', name).single();
  if (!itemData) return { success: false, error: "Item not found." };
  let cost = itemData.cost;

  // Make Intro chapter free regardless of DB
  if (name.match(/^PDF Chapter (Intro|0)$/i) || name.match(/^Audio Chapter (Intro|0)$/i)) {
    cost = 0;
  }

  const { data: progress } = await supabase.from('user_progress').select('wallet').eq('user_id', user.id).single();
  if (!progress || progress.wallet < cost) {
    return { success: false, error: "Insufficient MI Credits." };
  }

  const { data: updated, error: updateError } = await supabase.from('user_progress')
    .update({ wallet: progress.wallet - cost })
    .eq('user_id', user.id)
    .eq('wallet', progress.wallet)
    .select();
  
  if (updateError || !updated || updated.length === 0) {
    return { success: false, error: "Transaction failed, please try again." };
  }

  await supabase.from('redemptions').insert({ user_id: user.id, item: name, cost: cost });

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const resend = new Resend(key);
      await resend.emails.send({
        from: "KILL BUSYness Portal <admin@killbusyness.com>",
        to: "manoj@managementinnovations.co.in",
        cc: "manoj@managementinnovations.co.in",
        subject: `MI Currency redemption: ${name}`,
        html: `<p>${user.email} redeemed <strong>${name}</strong>.</p>`
      });
    } catch {
    }
  }
  revalidatePath("/rewards");
  
  if (name.includes("Synopsis") || name.includes("PDF")) {
    return { success: true, downloadUrl: "/files/Synopsis_of_KILL_BUSYness.pdf" };
  }
  
  return { success: true };
}

/* ── Claims ── */

const CLAIM_CREDITS: Record<string, number> = {
  gift_book: 75,
  attend_training: 200,
  organize_training: 500,
};

export async function submitClaim(claimType: string, details: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const credits = CLAIM_CREDITS[claimType];
  if (!credits) return { success: false, error: "Invalid claim type." };
  if (!details.trim()) return { success: false, error: "Please describe what you did." };

  const { error } = await supabase.from("claims").insert({
    user_id: user.id,
    claim_type: claimType,
    details: details.trim(),
    credits_amount: credits,
  });

  if (error) return { success: false, error: "Could not submit claim." };

  // Email notification — this is a sales lead
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const labels: Record<string, string> = {
        gift_book: "Gifted the book",
        attend_training: "Attended public training",
        organize_training: "Organized in-house training",
      };
      const resend = new Resend(key);
      await resend.emails.send({
        from: "KILL BUSYness Portal <admin@killbusyness.com>",
        to: "manoj@managementinnovations.co.in",
        subject: `Credit claim: ${labels[claimType] || claimType}`,
        html: `<p><strong>${user.email}</strong> submitted a claim for <strong>${labels[claimType]}</strong> (${credits} credits).</p><p>Details: ${details}</p><p>Approve at <a href="https://www.killbusyness.com/admin/claims">admin/claims</a>.</p>`
      });
    } catch {}
  }

  revalidatePath("/rewards");
  return { success: true };
}

/* ── Referrals ── */

export async function getReferralCode() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Use a short version of the user ID as referral code
  const code = user.id.substring(0, 8);
  
  // Ensure it's stored
  await supabase.from("user_progress").update({ referral_code: code }).eq("user_id", user.id);
  
  return code;
}
export async function submitTrainingApplication(itemName: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const company = formData.get("company")?.toString() || "";
  const preferred_dates = formData.get("preferred_dates")?.toString() || "";
  const attendees = parseInt(formData.get("attendees")?.toString() || "0", 10);

  if (!name || !email) return { error: "Name and email are required" };

  const { error: dbError } = await supabase.from("training_applications").insert({
    user_id: user.id,
    item_name: itemName,
    name,
    email,
    company,
    preferred_dates,
    attendees
  });

  if (dbError) {
    console.error(dbError);
    return { error: "Failed to save application." };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "admin@killbusyness.com",
        to: "manoj@managementinnovations.co.in",
        subject: `New Training Application: ${itemName}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Dates:</strong> ${preferred_dates}</p>
          <p><strong>Attendees:</strong> ${attendees}</p>
          <p>This user wants to use MI Credits towards this training. You can view the application in the Admin dashboard.</p>
        `
      })
    });
  }

  return { success: true };
}

export async function submitMixedCurrencyPayment(itemName: string, creditsUsed: number, inrPaid: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const progress = await getProgress(supabase, user.id);
  if (progress.wallet < creditsUsed) {
    return { error: "Not enough credits." };
  }

  // Deduct credits via award_progress (negative value)
  if (creditsUsed > 0) {
    await supabase.rpc("award_progress", { p_xp: 0, p_wallet: -creditsUsed });
  }

  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData.user?.email || "Unknown user";

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "admin@killbusyness.com",
        to: "manoj@managementinnovations.co.in",
        subject: `New Executive Conversation Purchase: ${itemName}`,
        html: `
          <p>User <strong>${userEmail}</strong> has purchased: <strong>${itemName}</strong></p>
          <p>They redeemed <strong>${creditsUsed} MI Credits</strong>.</p>
          <p>They paid the remaining balance of <strong>Rs. ${inrPaid}</strong> via the UPI QR code.</p>
          <p><strong>Action required:</strong> Please verify the UPI payment in your bank app, then email them their calendar booking link.</p>
        `
      })
    });
  }

  revalidatePath("/rewards");
  return { success: true };
}
