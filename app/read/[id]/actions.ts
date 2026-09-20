"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveReflection, evaluateBadges } from "@/lib/gamification";

export async function saveReflectionAction(chapterId: number, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;
  const body = String(formData.get("body") || "");
  await saveReflection(supabase, chapterId, body);
  await evaluateBadges(supabase, user.id);
  revalidatePath(`/read/${chapterId}`);
  revalidatePath("/dashboard");
}

export async function unlockChapterAction(chapterId: number, cost: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: progress } = await supabase.from('user_progress').select('wallet').eq('user_id', user.id).single();
  if (!progress || progress.wallet < cost) {
    return { error: "Insufficient MI Credits. Share your story or complete an audit to earn more!" };
  }

  const { data: updated, error: updateError } = await supabase.from('user_progress')
    .update({ wallet: progress.wallet - cost })
    .eq('user_id', user.id)
    .eq('wallet', progress.wallet)
    .select();

  if (updateError || !updated || updated.length === 0) {
    return { error: "Transaction failed, please try again." };
  }

  await supabase.from('redemptions').insert({ user_id: user.id, item: `Chapter ${chapterId} Unlock`, cost: cost });

  revalidatePath(`/read/${chapterId}`);
  return { success: true };
}
