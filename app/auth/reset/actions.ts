"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setNewPassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8) redirect("/auth/reset?error=" + encodeURIComponent("Password must be at least 8 characters."));
  if (password !== confirm) redirect("/auth/reset?error=" + encodeURIComponent("Those two passwords don't match."));
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/auth/reset?error=" + encodeURIComponent(error.message));
  redirect("/dashboard");
}
