"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function redeemItem(name: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ok } = await supabase.rpc("redeem_item", { p_item: name });
  if (ok) {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      try {
        const resend = new Resend(key);
        await resend.emails.send({
          from: "KILL BUSYness Portal <admin@killbusyness.com>",
          to: "manoj@managementinnovations.co.in",
          cc: "manoj@managementinnovations.co.in",
          subject: `MI Currency redemption: ${name}`,
          html: `<p>${user.email} redeemed <strong>${name}</strong>.</p>`
        });
      } catch {
      }
    }
  }
  revalidatePath("/rewards");
}
