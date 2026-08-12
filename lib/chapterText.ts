import type { SupabaseClient } from "@supabase/supabase-js";

export async function getChapterSummary(supabase: SupabaseClient, chapterId: number): Promise<string> {
  const { data } = await supabase
    .from("chapter_texts")
    .select("summary")
    .eq("chapter_id", chapterId)
    .maybeSingle();
  return data?.summary || "";
}

export async function getAllChapterSummaries(supabase: SupabaseClient): Promise<Record<number, string>> {
  const { data } = await supabase.from("chapter_texts").select("chapter_id, summary");
  const map: Record<number, string> = {};
  (data || []).forEach((r: { chapter_id: number; summary: string }) => {
    map[r.chapter_id] = r.summary;
  });
  return map;
}
