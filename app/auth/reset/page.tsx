import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import ResetForm from "./ResetForm";

export default async function ResetPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot?error=" + encodeURIComponent("That reset link has expired or already been used. Request a new one."));
  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Account recovery</span>
          <h2>Choose a new password</h2>
          <p>You&apos;re signed in as {user.email}. Set a new password below.</p>
        </div>
        <ResetForm initialError={searchParams?.error} />
      </main>
    </>
  );
}
