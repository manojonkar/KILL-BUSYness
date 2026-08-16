import fs from 'fs';
import path from 'path';
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFullChapter(supabase: SupabaseClient, chapterId: number): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'chapters', `${chapterId}.md`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    console.error("Error reading chapter markdown:", err);
  }
  const { data } = await supabase.from("chapter_texts").select("body").eq("chapter_id", chapterId).maybeSingle();
  return data?.body || "";
}

export async function getChapterSummary(supabase: SupabaseClient, chapterId: number): Promise<string> {
  const fullText = await getFullChapter(supabase, chapterId);
  if (!fullText) return "";

  const lines = fullText.split('\n');
  const summaryLines: string[] = [];
  let pCount = 0;
  
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Always include headings, images, and tables
    if (trimmed.startsWith('#') || trimmed.startsWith('![](')) {
      summaryLines.push(line);
      summaryLines.push('');
      continue;
    }
    
    if (trimmed.startsWith('|')) {
      inTable = true;
      summaryLines.push(line);
      continue;
    }
    
    if (inTable && !trimmed.startsWith('|')) {
      inTable = false;
      summaryLines.push('');
    }

    // Include first 3 paragraphs of regular text (ignoring page numbers or short lines)
    if (!inTable && trimmed.length > 30 && pCount < 3) {
      summaryLines.push(line);
      summaryLines.push('');
      pCount++;
    }
  }

  summaryLines.push('');
  summaryLines.push('> **This is a chapter summary. Unlock the full chapter to read the complete text and deep dive into the concepts.**');

  return summaryLines.join('\n');
}

export async function getAllChapterSummaries(supabase: SupabaseClient): Promise<Record<number, string>> {
  const map: Record<number, string> = {};
  for (let i = 0; i <= 10; i++) {
    map[i] = await getChapterSummary(supabase, i);
  }
  return map;
}
