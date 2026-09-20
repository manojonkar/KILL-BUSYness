"use server";

import { createClient } from "@/lib/supabase/server";
import { submitQuizScore } from "@/lib/gamification";
import { revalidatePath } from "next/cache";

export async function submitQuizAction(chapterId: number, score: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };
  
  const result = await submitQuizScore(supabase, user.id, chapterId, score);
  
  revalidatePath(`/quiz/${chapterId}`);
  revalidatePath(`/dashboard`);
  
  return { success: true, ...result };
}
