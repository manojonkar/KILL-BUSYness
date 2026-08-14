"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase
    .from("book_orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error("Failed to update status: " + error.message);
  }

  revalidatePath("/admin");
}
