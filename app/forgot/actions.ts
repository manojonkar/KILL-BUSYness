"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Please enter your email address." };
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/auth/callback?next=/auth/reset` });
  return { success: true };
}
