import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oictzdcrdqgwawezwjzr.supabase.co"),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTc5MzQsImV4cCI6MjEwMTU3MzkzNH0._-QPa4TDifIriTJlcuP05w6eCPnXUjcFDQNcFEQ0kB8"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
          }
        }
      }
    }
  );
}
