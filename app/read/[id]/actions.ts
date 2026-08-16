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

  const { data, error } = await supabase.rpc("unlock_chapter", { p_chapter_id: chapterId, p_cost: cost });
  
  if (error || !data) {
    return { error: "Insufficient MI Credits. Share your story or complete an audit to earn more!" };
  }

  revalidatePath(`/read/${chapterId}`);
  return { success: true };
}
