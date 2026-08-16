import type { SupabaseClient } from "@supabase/supabase-js";
import { CHAPTERS } from "./chapters";

export const LEVELS: { name: string; min: number }[] = [
  { name: "Observer", min: 0 },
  { name: "Reflector", min: 200 },
  { name: "Owner", min: 550 },
  { name: "Asserter", min: 1000 },
  { name: "Runner", min: 1800 }
];

export interface Badge {
  id: string;
  ic: string;
  name: string;
  desc: string;
}

export const BADGES: Badge[] = [
  { id: "b1", ic: "🪞", name: "First Reflection", desc: "Save your first reflection" },
  { id: "b2", ic: "🧠", name: "Deep Thinker", desc: "Save a reflection on all 11 chapters" },
  { id: "b3", ic: "🔁", name: "ROAR Complete", desc: "Read from all 4 ROAR phases" },
  { id: "b8", ic: "🎓", name: "Full Book", desc: "Read all 11 chapters" },
  { id: "b4", ic: "🏗️", name: "Audit Architect", desc: "Register your organization" },
  { id: "b6", ic: "👥", name: "Team Builder", desc: "Invite 10 or more participants" },
  { id: "b7", ic: "🚀", name: "Transformer", desc: "Improve your BUSYness Index by 15+ on a re-run" },
  { id: "b9", ic: "📣", name: "Ambassador", desc: "3 referrals sign up and start reading" },
  { id: "b10", ic: "⚡", name: "I KILL BUSYness", desc: "Complete the book and the Organization Audit" }
];

export interface StoreItem { name: string; cost: number; requiresAudit: boolean; }

export async function getStoreItems(supabase: SupabaseClient): Promise<StoreItem[]> {
  const { data } = await supabase
    .from("store_items")
    .select("item, cost, requires_audit")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return (data || []).map((r: { item: string; cost: number; requires_audit: boolean }) => ({
    name: r.item,
    cost: r.cost,
    requiresAudit: !!r.requires_audit
  }));
}

const ROAR_GROUPS: Record<string, string> = {
  Foundation: "Reflect",
  See: "Reflect",
  Reflect: "Reflect",
  Own: "Own",
  Assert: "Assert",
  Run: "Run"
};

export function levelFor(credits: number) {
  let i = 0;
  LEVELS.forEach((l, idx) => {
    if (credits >= l.min) i = idx;
  });
  return i + 1;
}

export function levelName(credits: number) {
  return LEVELS[levelFor(credits) - 1].name;
}

export function nextLevel(credits: number): { name: string; min: number } | null {
  return LEVELS[levelFor(credits)] || null;
}

export interface Progress {
  xp: number;
  wallet: number;
  streak: number;
}

export async function getProgress(supabase: SupabaseClient, userId: string): Promise<Progress> {
  const { data } = await supabase.from("user_progress").select("xp, wallet, streak").eq("user_id", userId).maybeSingle();
  return data ? { xp: data.xp, wallet: data.wallet, streak: data.streak } : { xp: 0, wallet: 0, streak: 1 };
}

export async function touchStreak(supabase: SupabaseClient) {
  await supabase.rpc("touch_streak");
}

export async function markChapterRead(supabase: SupabaseClient, chapterId: number) {
  await supabase.rpc("mark_chapter_read", { p_chapter_id: chapterId });
}

export async function getChapterReads(supabase: SupabaseClient, userId: string): Promise<Set<number>> {
  const { data } = await supabase.from("user_chapter_reads").select("chapter_id").eq("user_id", userId);
  return new Set((data || []).map((r: { chapter_id: number }) => r.chapter_id));
}

export async function getReflection(supabase: SupabaseClient, userId: string, chapterId: number): Promise<string> {
  const { data } = await supabase
    .from("user_reflections")
    .select("body")
    .eq("user_id", userId)
    .eq("chapter_id", chapterId)
    .maybeSingle();
  return data?.body || "";
}

export async function saveReflection(supabase: SupabaseClient, chapterId: number, body: string) {
  await supabase.rpc("save_reflection", { p_chapter_id: chapterId, p_body: body });
}

export async function getBadges(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId);
  return new Set((data || []).map((r: { badge_id: string }) => r.badge_id));
}

async function awardBadge(supabase: SupabaseClient, userId: string, badgeId: string, have: Set<string>) {
  if (have.has(badgeId)) return;
  await supabase.from("user_badges").upsert({ user_id: userId, badge_id: badgeId }, { onConflict: "user_id,badge_id" });
  have.add(badgeId);
}

export async function evaluateBadges(supabase: SupabaseClient, userId: string) {
  const have = await getBadges(supabase, userId);
  const [{ data: reflections }, { data: reads }, { data: company }, { data: story }] = await Promise.all([
    supabase.from("user_reflections").select("chapter_id").eq("user_id", userId),
    supabase.from("user_chapter_reads").select("chapter_id").eq("user_id", userId),
    supabase.from("companies").select("id").eq("admin_user_id", userId).maybeSingle(),
    supabase.from("stories").select("id").eq("user_id", userId).limit(1)
  ]);

  if ((reflections?.length || 0) > 0) await awardBadge(supabase, userId, "b1", have);

  const readIds = new Set((reads || []).map((r: { chapter_id: number }) => r.chapter_id));
  if ((reflections?.length || 0) >= CHAPTERS.length) await awardBadge(supabase, userId, "b2", have);
  if (readIds.size >= CHAPTERS.length) await awardBadge(supabase, userId, "b8", have);

  // Master Badge: Read the whole book AND generated an audit
  if (readIds.size >= CHAPTERS.length && company) {
    await awardBadge(supabase, userId, "b10", have);
  }

  const groupsSeen = new Set<string>();
  readIds.forEach((id) => {
    const ch = CHAPTERS.find((c) => c.id === id);
    if (ch) groupsSeen.add(ROAR_GROUPS[ch.roar] || ch.roar);
  });
  if (["Reflect", "Own", "Assert", "Run"].every((g) => groupsSeen.has(g))) await awardBadge(supabase, userId, "b3", have);

  if (company?.id) await awardBadge(supabase, userId, "b4", have);

  if (company?.id) {
    const { data: participants } = await supabase.from("participants").select("id").eq("company_id", company.id);
    if ((participants || []).length >= 10) await awardBadge(supabase, userId, "b6", have);
  }

  return have;
}

export interface OrgStats { invited: number; completed: number; rate: number; }

export async function getOrgStats(supabase: SupabaseClient, userId: string): Promise<OrgStats | null> {
  const { data: company } = await supabase.from("companies").select("id").eq("admin_user_id", userId).maybeSingle();
  if (!company?.id) return null;
  const { data } = await supabase.from("participants").select("status").eq("company_id", company.id);
  const rows = data || [];
  const completed = rows.filter((r: { status: string }) => r.status === "completed").length;
  return { invited: rows.length, completed, rate: rows.length ? Math.round((100 * completed) / rows.length) : 0 };
}

