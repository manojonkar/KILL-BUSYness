"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { evaluateBadges } from "@/lib/gamification";

export async function finishRegistration(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const industry = String(formData.get("industry") || "").trim();
  const size = String(formData.get("size") || "250-500");
  const seats = parseInt(String(formData.get("seats") || "10"), 10) || 10;
  const adminName = String(formData.get("adminName") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim().toLowerCase();

  if (!name) {
    redirect("/dashboard?error=" + encodeURIComponent("Company name is required"));
  }

  const { data: existing } = await supabase.from("companies").select("id").eq("admin_user_id", user!.id).maybeSingle();
  if (existing) {
    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({ name, industry, size, seats, admin_user_id: user!.id, admin_name: adminName, admin_email: adminEmail })
    .select();

  if (!error && data && data.length > 0) {
    await evaluateBadges(supabase, user!.id);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
