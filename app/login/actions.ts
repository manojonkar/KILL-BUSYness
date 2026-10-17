"use server";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      // Feature: Auto-adopt password on first login for invited users
      const adminClient = createAdminClient();
      const { data: searchData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existingUser = searchData?.users?.find((u: any) => u.email === email);
      
      // If the user exists but has literally NEVER logged in before (last_sign_in_at is null/empty)
      if (existingUser && !existingUser.last_sign_in_at) {
        // Force update their password to whatever they just typed
        await adminClient.auth.admin.updateUserById(existingUser.id, { password: password });
        
        // Log them in immediately with the new password
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
        if (!retryError) {
          return { redirect: "/dashboard" };
        }
      }

      return { error: "Invalid login credentials. Please try again or reset your password." };
    }
    return { error: error.message };
  }
  return { redirect: "/dashboard" };
}
