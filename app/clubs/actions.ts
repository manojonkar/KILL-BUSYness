"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createClub(name: string, organization?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!name.trim()) return { success: false, error: "Club name is required." };

  const { data, error } = await supabase.from("clubs").insert({
    name: name.trim(),
    organization: organization?.trim() || null,
    founder_id: user.id,
  }).select().single();

  if (error) return { success: false, error: "Could not create club." };

  // Founder auto-joins
  await supabase.from("club_members").insert({
    club_id: data.id,
    user_id: user.id,
  });

  revalidatePath("/clubs");
  return { success: true };
}

export async function joinClub(clubId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("club_members").upsert({
    club_id: clubId,
    user_id: user.id,
  }, { onConflict: "club_id,user_id" });

  revalidatePath("/clubs");
  return { success: true };
}

export async function leaveClub(clubId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("club_members").delete().eq("club_id", clubId).eq("user_id", user.id);

  revalidatePath("/clubs");
  return { success: true };
}
