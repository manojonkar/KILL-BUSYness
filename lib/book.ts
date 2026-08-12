import type { SupabaseClient } from "@supabase/supabase-js";

export interface BookFormat { key: string; label: string; price: number; physical: boolean; blurb: string; }

export const FORMATS: Record<string, BookFormat> = {
  ebook: { key: "ebook", label: "eBook", price: 999, physical: false, blurb: "Delivered to your email once payment is confirmed." },
  paperback: { key: "paperback", label: "Paperback", price: 1999, physical: true, blurb: "Couriered to your address anywhere in India. Price includes delivery." },
  hardcover: { key: "hardcover", label: "Hardcover", price: 2999, physical: true, blurb: "Couriered to your address anywhere in India. Price includes delivery." }
};

export async function getSettings(supabase: SupabaseClient): Promise<Record<string, string>> {
  const { data } = await supabase.from("site_settings").select("key, value");
  const m: Record<string, string> = {};
  (data || []).forEach((r: { key: string; value: string }) => (m[r.key] = r.value));
  return m;
}
