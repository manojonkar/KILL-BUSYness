"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { evaluateBadges } from "@/lib/gamification";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;

function fail(msg: string): never {
  redirect("/stories?error=" + encodeURIComponent(msg));
}

export async function submitStory(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "Leader").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const consent = formData.get("consent") === "on";

  if (!name) fail("Please add your name.");
  if (!EMAIL_RE.test(email)) fail("Please enter a valid email address so we can verify your story.");
  if (phone && !PHONE_RE.test(phone)) fail("That phone number doesn't look right. Use digits, spaces and + ( ) - only.");
  if (body.length < 40) fail("Please tell us a little more — at least a couple of sentences.");
  if (!consent) fail("Please confirm you're happy for your story to be shared publicly.");

  const { error } = await supabase
    .from("stories")
    .insert({ user_id: user.id, name, role, email, phone: phone || null, body, consent });
  if (error) fail("We couldn't save your story just then. Please try again.");

  await evaluateBadges(supabase, user.id);

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const resend = new Resend(key);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com";
      await resend.emails.send({
        from: "KILL BUSYness Portal <admin@killbusyness.com>",
        to: "admin@managementinnovations.co.in",
        replyTo: email,
        subject: `New story for approval — ${name}`,
        html:
          `<p><strong>${name}</strong>${role ? ` — ${role}` : ""} submitted a story for the public wall.</p>` +
          `<p><strong>Email:</strong> ${email}<br/><strong>Phone:</strong> ${phone || "not given"}<br/>` +
          `<strong>Account:</strong> ${user.email}</p>` +
          `<blockquote style="border-left:3px solid #9B2226;padding-left:12px;color:#333">${body.replace(/\n/g, "<br/>")}</blockquote>` +
          `<p>It is <strong>not</strong> public yet. Approve or delete it here:<br/>` +
          `<a href="${siteUrl}/admin/stories">${siteUrl}/admin/stories</a></p>`
      });
    } catch {
    }
  }

  revalidatePath("/stories");
  redirect("/stories?sent=1");
}
