"use server";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const supabase = createClient();
  const adminClient = createAdminClient();

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  // 1. Try standard login first
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (!error) {
    return { redirect: "/dashboard" };
  }

  // 2. Frictionless Login: If credentials failed (e.g. they forgot or never set a password),
  // check if the user exists in auth or has an order in the database.
  try {
    const { data: searchData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let existingUser = searchData?.users?.find((u: any) => u.email === email);

    // If user doesn't even exist in auth, check if they have a granted book order
    if (!existingUser) {
      const { data: order } = await adminClient
        .from("book_orders")
        .select("name, email")
        .eq("email", email)
        .in("status", ["paid", "dispatched"])
        .maybeSingle();

      if (order) {
        // Create the user account instantly with the password they just typed
        const { data: created, error: createError } = await adminClient.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: { name: order.name }
        });
        if (!createError && created?.user) {
          existingUser = created.user;
        }
      }
    }

    // If the user exists (or was just created), adopt the password they entered and sign them in immediately
    if (existingUser) {
      await adminClient.auth.admin.updateUserById(existingUser.id, { 
        password: password,
        email_confirm: true 
      });

      const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
      if (!retryError) {
        return { redirect: "/dashboard" };
      }
    }
  } catch (err: any) {
    console.error("[Login] Frictionless adoption error:", err);
  }

  return { error: "Invalid login credentials. Please check your email or contact support." };
}
