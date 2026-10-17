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
    if (error.message.includes("User already registered") || error.message.includes("already registered")) {
      return { error: "This email is already securely registered for early access. Please click 'Forgot Password' below to set your password and log in." };
    }
    return { error: error.message };
  }

  // Check if they completed an audit survey, and award 25 points if they did
  if (data.user) {
    const { data: p } = await supabase
      .from("participants")
      .select("id")
      .eq("email", email)
      .eq("status", "completed")
      .maybeSingle();
      
    if (p) {
      await supabase.rpc("award_points", { p_user_id: data.user.id, p_amount: 25, p_reason: "Completed organization diagnostic" });
    }
  }

  if (data.session) {
    return { redirect: "/dashboard" };
  }
  return { redirect: "/login?message=" + encodeURIComponent("Registration successful! Please check your email to validate your account.") };
}
