"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveClaim(claimId: string, userId: string, credits: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== "manojonkar@gmail.com") return;

  // Mark claim approved
  await supabase.from("claims").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", claimId);

  // Award credits
  const { data: progress } = await supabase.from("user_progress").select("xp, wallet").eq("user_id", userId).single();
  if (progress) {
    await supabase.from("user_progress").update({
      xp: progress.xp + credits,
      wallet: progress.wallet + credits,
    }).eq("user_id", userId);
  }

  revalidatePath("/admin/claims");
}

export async function rejectClaim(claimId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== "manojonkar@gmail.com") return;

  await supabase.from("claims").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", claimId);
  revalidatePath("/admin/claims");
}
