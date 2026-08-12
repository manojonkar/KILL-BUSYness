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
