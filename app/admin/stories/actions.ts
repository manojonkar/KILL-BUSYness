"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveStory(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createClient();
  const { data: story } = await supabase.from("stories").select("user_id, approved").eq("id", id).maybeSingle();
  if (!story || story.approved) return;
  await supabase.from("stories").update({ approved: true }).eq("id", id);
  const { count } = await supabase
    .from("stories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", story.user_id)
    .eq("approved", true);
  if ((count || 0) <= 3) {
    await supabase.rpc("award_published_story", { p_user: story.user_id });
  }
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function removeStory(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createClient();
  await supabase.from("stories").delete().eq("id", id);
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}
