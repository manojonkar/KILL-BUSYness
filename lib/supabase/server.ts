import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

export function createAdminClient() {
  return createSupabaseClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oictzdcrdqgwawezwjzr.supabase.co"),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA")
  );
}
