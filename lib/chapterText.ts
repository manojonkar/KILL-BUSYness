import fs from 'fs';
import path from 'path';
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getChapterSummary(supabase: SupabaseClient, chapterId: number): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'chapters', `${chapterId}.md`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    console.error("Error reading chapter markdown:", err);
  }
  
  // Fallback to database if local file is missing
  const { data } = await supabase
    .from("chapter_texts")
    .select("summary")
    .eq("chapter_id", chapterId)
    .maybeSingle();
  return data?.summary || "";
}

export async function getAllChapterSummaries(supabase: SupabaseClient): Promise<Record<number, string>> {
  const map: Record<number, string> = {};
  for (let i = 0; i <= 10; i++) {
    map[i] = await getChapterSummary(supabase, i);
  }
  return map;
}
