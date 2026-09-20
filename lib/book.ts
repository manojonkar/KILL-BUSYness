import type { SupabaseClient } from "@supabase/supabase-js";

export interface BookFormat { key: string; label: string; price: number; usdPrice: number; physical: boolean; blurb: string; desc?: string; }

export const FORMATS: Record<string, BookFormat> = {
  ebook: {
    key: "ebook",
    label: "Digital eBook",
    price: 999,
    usdPrice: 12.99,
    physical: false,
    blurb: "Read directly in your browser with our portal reader."
  },
  paperback: { key: "paperback", label: "Paperback", price: 1999, usdPrice: 29.99, physical: true, blurb: "Beautifully printed, shipped to you." },
  audiobook: { key: "audiobook", label: "AudioBook (Full Book)", price: 999, usdPrice: 12.99, physical: false, blurb: "Listen to the complete book." },
  ...Object.fromEntries(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => [
      `audio_chapter_${id}`,
      {
        key: `audio_chapter_${id}`,
        label: `Audio Chapter ${id === 0 ? "Intro" : id}`,
        price: 100,
        usdPrice: 1.99,
        physical: false,
        blurb: `Listen to Chapter ${id === 0 ? "Intro" : id}.`
      }
    ])
  ),
  ...Object.fromEntries(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => [
      `pdf_chapter_${id}`,
      {
        key: `pdf_chapter_${id}`,
        label: `PDF Chapter ${id === 0 ? "Intro" : id}`,
        price: 100,
        usdPrice: 1.99,
        physical: false,
        blurb: `Read the full PDF for Chapter ${id === 0 ? "Intro" : id}.`
      }
    ])
  )
};

export interface PromoCode {
  discountPercent?: number;
  fixedPrice?: number;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  "WELCOME10": { discountPercent: 10 },
  "VIPBOOK": { fixedPrice: 1500 },
  "MI PARTNER": { fixedPrice: 425 },
  "MIPARTNER": { fixedPrice: 425 },
  "LAURUS": { discountPercent: 10 }
};

export async function hasPurchasedAnyBook(supabase: SupabaseClient, email: string): Promise<boolean> {
  if (!email) return false;
  const { data } = await supabase
    .from("book_orders")
    .select("format, notes")
    .ilike("email", email)
    .in("status", ["paid", "dispatched"]);
  
  if (!data || data.length === 0) return false;
  return data.some(d => d.format === "ebook" || d.format === "paperback" || d.format === "audiobook" || (d.notes && d.notes.includes("[FORMAT:audiobook]")));
}

export async function hasPurchasedAudioBook(supabase: SupabaseClient, email: string, chapterId?: number): Promise<boolean> {
  if (!email) return false;
  const { data } = await supabase
    .from("book_orders")
    .select("format, notes")
    .ilike("email", email)
    .in("status", ["paid", "dispatched"]);
  if (!data || data.length === 0) return false;
  
  return data.some(d => {
    if (d.format === 'audiobook' || (d.notes && d.notes.includes('[FORMAT:audiobook]'))) return true;
    if (chapterId !== undefined && (d.format === `audio_chapter_${chapterId}` || (d.notes && d.notes.includes(`[FORMAT:audio_chapter_${chapterId}]`)))) return true;
    return false;
  });
}

export async function hasPurchasedPdfChapter(supabase: SupabaseClient, email: string, chapterId: number): Promise<boolean> {
  if (!email) return false;
  const { data } = await supabase
    .from("book_orders")
    .select("format, notes")
    .ilike("email", email)
    .in("status", ["paid", "dispatched"]);
  if (!data || data.length === 0) return false;
  return data.some(d => d.format === `pdf_chapter_${chapterId}` || (d.notes && d.notes.includes(`[FORMAT:pdf_chapter_${chapterId}]`)));
}
export async function getSettings(supabase: SupabaseClient) {
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings: Record<string, string> = {};
  if (data) {
    for (const row of data) settings[row.key] = row.value;
  }
  return settings;
}
