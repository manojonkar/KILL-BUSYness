"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Round to nearest 10 */
function creditsForAmount(amountINR: number): number {
  const raw = amountINR * 0.1;
  return Math.round(raw / 10) * 10;
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get("orderId") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!orderId || !status) {
    throw new Error("Order ID and Status are required.");
  }

  const supabase = createClient();
  const { data: isAdmin } = await supabase.rpc("is_site_admin");
  if (!isAdmin) {
    throw new Error("Unauthorized: Site Admin access required.");
  }

  // Fetch the current order before updating
  const { data: order } = await supabase
    .from("book_orders")
    .select("id, status, amount, unit_price, email, name, ref, format, notes")
    .eq("id", orderId)
    .single();

  const oldStatus = order?.status;

  const { error } = await supabase
    .from("book_orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error("Failed to update status: " + error.message);
  }

  // Award MI Credits when marking as 'paid' (only if not already paid)
  if (status === "paid" && order && oldStatus !== "paid" && order.email && order.amount > 0) {
    const creditsToAward = creditsForAmount(order.amount);

    if (creditsToAward > 0) {
      // Look up user by email via auth
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const matchedUser = users?.find(
        (u) => u.email?.toLowerCase() === order.email.toLowerCase()
      );

      if (matchedUser) {
        const { data: prog } = await supabase
          .from("user_progress")
          .select("wallet, xp")
          .eq("user_id", matchedUser.id)
          .maybeSingle();

        if (prog) {
          await supabase
            .from("user_progress")
            .update({
              wallet: prog.wallet + creditsToAward,
              xp: prog.xp + creditsToAward,
            })
            .eq("user_id", matchedUser.id);
        } else {
          // Create a user_progress record if missing
          await supabase.from("user_progress").insert({
            user_id: matchedUser.id,
            wallet: creditsToAward,
            xp: creditsToAward,
            streak: 1,
          });
        }
      }
    }
  }

  // --- AUTOMATED EMAILS LOGIC ---
  if (order && order.email) {
    const resendKey = process.env.RESEND_API_KEY;
    
    if (resendKey) {
      // Detect if international based on unit_price or amount (USD prices are small, INR prices are large)
      const isInternational = order.unit_price ? order.unit_price < 200 : order.amount < 500;
      const currencyStr = isInternational ? "USD" : "INR";
      const rzpLink = isInternational ? "https://rzp.io/rzp/KILLBUSYness" : "https://razorpay.me/@Management";
      const displayAmount = order.amount;

      let subject = "";
      let htmlBody = "";

      if (status === "paid") {
        subject = "Payment Received - KILL BUSYness";
        
        const isDigital = order.format === 'ebook' || order.format === 'audiobook' || (order.notes && order.notes.includes('[FORMAT:audiobook]'));

        if (isDigital) {
          subject = "Your Digital Access to KILL BUSYness";
          htmlBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b; line-height: 1.6;">
              <p>Hi ${order.name || 'there'},</p>
              <p>Thank you very much for your order for the digital copy of the book!</p>
              <p>You can now access the eBook, the AudioBook, the KILL BUSYness App, the Portal, and all of its exclusive resources.</p>
              <p>Please use the links below to access your materials:</p>
              <ul style="margin-bottom: 24px;">
                <li><strong>Main Portal (eBook, AudioBook, & Resources):</strong> <a href="https://www.killbusyness.com/login" style="color: #0E9C74;">https://www.killbusyness.com/login</a></li>
                <li><strong>KILL BUSYness App (Gamified Execution):</strong> <a href="https://app.killbusyness.com" style="color: #0E9C74;">https://app.killbusyness.com</a></li>
              </ul>
              <p style="font-size: 0.9em; color: #4b5563; background: #f3f4f6; padding: 12px; border-radius: 6px;">
                <em>(Log in using the email address you used for this order. If this is your first time, simply use the "Forgot Password" or "Magic Link" option on the login page to securely access your new account!)</em>
              </p>
              <p style="margin-top: 30px;">Best regards,<br/><strong>Team KILL BUSYness</strong></p>
            </div>
          `;
        } else {
          htmlBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b; line-height: 1.6;">
              <p>Hi ${order.name || 'there'},</p>
              <p>Thank you very much for your order. We have received your payment for the book <strong>'KILL BUSYness .Build High Performance Organizations'</strong>.</p>
              <p>The book(s) will be dispatched soon and you should receive them within a week or 10 days.</p>
              <p style="margin-top: 30px;">Best regards,<br/><strong>Team KILL BUSYness</strong></p>
            </div>
          `;
        }
      } else if (status === "awaiting_payment") {
        const isDigital = order.format === 'ebook' || order.format === 'audiobook' || (order.notes && order.notes.includes('[FORMAT:audiobook]'));

        if (isDigital) {
          subject = "Thanks for your order. Pl confirm your payment";
          htmlBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b; line-height: 1.6;">
              <p>Hi ${order.name || 'there'},</p>
              <p>Thank you very much for your order for the digital copy of the book <strong>'KILL BUSYness .Build High Performance Organizations'</strong>.</p>
              <p>You can complete your payment of <strong>${currencyStr} ${displayAmount}</strong> on this link:</p>
              <div style="margin: 24px 0;">
                <a href="${rzpLink}" style="display: inline-block; padding: 12px 24px; background: #0E9C74; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Click here to pay via Razorpay</a>
              </div>
              <p style="font-size: 0.9em; color: #4b5563;"><em>(Once your payment is confirmed, you will receive an email with instant access to the eBook, AudioBook, App, and Portal).</em></p>
              <p style="margin-top: 24px; padding: 12px; border-left: 4px solid #f59e0b; background: #fef3c7;">
                <strong>If you have already paid, please reply to this email and share the screenshot or the name of the payee, amount, and other details for us to confirm your payment.</strong>
              </p>
              <p style="margin-top: 30px;">Best regards,<br/><strong>Team KILL BUSYness</strong></p>
            </div>
          `;
        } else {
          subject = "Thanks for your order. Pl confirm your payment";
          htmlBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b; line-height: 1.6;">
              <p>Hi ${order.name || 'there'},</p>
              <p>Thank you very much for your order for the paperback copy of the book <strong>'KILL BUSYness .Build High Performance Organizations'</strong>.</p>
              <p>You can complete your payment of <strong>${currencyStr} ${displayAmount}</strong> on this link:</p>
              <div style="margin: 24px 0;">
                <a href="${rzpLink}" style="display: inline-block; padding: 12px 24px; background: #0E9C74; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Click here to pay via Razorpay</a>
              </div>
              <p style="margin-top: 24px; padding: 12px; border-left: 4px solid #f59e0b; background: #fef3c7;">
                <strong>If you have already paid, please reply to this email and share the screenshot or the name of the payee, amount, and other details for us to confirm your payment.</strong>
              </p>
              <p style="margin-top: 30px;">Best regards,<br/><strong>Team KILL BUSYness</strong></p>
            </div>
          `;
        }
      }

      if (subject && htmlBody) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "Team KILL BUSYness <admin@killbusyness.com>",
              reply_to: "admin@managementinnovations.co.in",
              cc: "Killbusynessteam@gmail.com",
              to: order.email,
              subject: subject,
              html: htmlBody
            })
          });
        } catch (e) {
          console.error("Failed to send order status email:", e);
        }
      }
    }
  }

  revalidatePath("/admin");
}
