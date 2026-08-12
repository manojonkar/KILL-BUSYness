import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { setNewPassword } from "./actions";

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
        <div className="card" style={{ padding: 30, maxWidth: 440 }}>
          {searchParams?.error ? <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p> : null}
          <form action={setNewPassword}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>New password</label>
              <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
            </div>
            <div className="field" style={{ marginBottom: 18 }}>
              <label>Confirm new password</label>
              <input name="confirm" type="password" required minLength={8} placeholder="Type it again" />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>Save new password</button>
          </form>
        </div>
      </main>
    </>
  );
}
