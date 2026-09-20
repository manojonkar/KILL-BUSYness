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
    .select("id, status, amount, email")
    .eq("id", orderId)
    .single();

  const { error } = await supabase
    .from("book_orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error("Failed to update status: " + error.message);
  }

  // Award MI Credits when marking as 'paid' (only if not already paid)
  if (status === "paid" && order && order.status !== "paid" && order.email && order.amount > 0) {
    const creditsToAward = creditsForAmount(order.amount);

    if (creditsToAward > 0) {
      // Find the user account matching the order email
      const { data: authUsers } = await supabase
        .from("user_progress")
        .select("user_id, xp, wallet")
        .limit(500);

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

  revalidatePath("/admin");
}
