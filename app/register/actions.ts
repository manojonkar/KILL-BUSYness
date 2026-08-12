"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function registerAccount(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }
  if (data.session) {
    redirect("/dashboard");
  }
  redirect("/login?error=" + encodeURIComponent("Check your email to confirm your account, then log in."));
}
