"use server";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Deterministic credentials derivation for password-free zero-friction signin
const getDeterministicPassword = (email: string) => {
  return `KB_Executive_${Buffer.from(email.toLowerCase().trim()).toString("base64").replace(/=/g, "")}!2026`;
};

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim() || email.split("@")[0];
  const autoPassword = getDeterministicPassword(email);
  const supabase = createClient();
  const adminClient = createAdminClient();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  // 1. First try sign in with the deterministic password
  const { error: signInError } = await supabase.auth.signInWithPassword({ 
    email, 
    password: autoPassword 
  });
  
  if (!signInError) {
    return { redirect: "/dashboard" };
  }

  // 2. If user exists in auth from previously, update their password so they can log in seamlessly without a password prompt
  try {
    const { data: searchData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let existingUser = searchData?.users?.find((u: any) => u.email === email);

    if (existingUser) {
      await adminClient.auth.admin.updateUserById(existingUser.id, { 
        password: autoPassword,
        email_confirm: true 
      });

      const { error: retryError } = await supabase.auth.signInWithPassword({ 
        email, 
        password: autoPassword 
      });
      if (!retryError) {
        return { redirect: "/dashboard" };
      }
    } else {
      // 3. User does not exist in auth yet -> create them instantly
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: email,
        password: autoPassword,
        email_confirm: true,
        user_metadata: { name }
      });

      if (!createError && created?.user) {
        // Also grant full book access order automatically so all chapters open smoothly
        await adminClient.from("book_orders").insert({ 
          ref: "AUTO-" + Date.now(),
          name: name, 
          phone: "0000", 
          email: email, 
          format: "ebook", 
          notes: "[FORMAT:audiobook] Auto granted passwordless executive access",
          amount: 0, 
          unit_price: 0,
          quantity: 1,
          status: "paid" 
        });

        const { error: newSignInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password: autoPassword 
        });
        if (!newSignInError) {
          return { redirect: "/dashboard" };
        }
      }
    }
  } catch (err: any) {
    console.error("[Login] Frictionless adoption error:", err);
  }

  // Fallback direct sign up attempt via client
  try {
    await supabase.auth.signUp({
      email,
      password: autoPassword,
      options: { data: { name } }
    });
    return { redirect: "/dashboard" };
  } catch (e: any) {
    return { redirect: "/dashboard" };
  }
}
