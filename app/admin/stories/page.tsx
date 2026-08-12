import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { approveStory, removeStory } from "./actions";

type Row = { id: string; name: string; role: string; body: string; consent: boolean; approved: boolean; created_at: string };

export default async function AdminStoriesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_site_admin");
  if (!isAdmin) redirect("/dashboard");

  const { data } = await supabase
    .from("stories")
    .select("id, name, role, body, consent, approved, created_at")
    .order("created_at", { ascending: false });
  const rows = (data || []) as Row[];
  const pending = rows.filter((s) => !s.approved);
  const live = rows.filter((s) => s.approved);

  return (
    <>
      <Header active="Share Your Story" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Moderation</span>
          <h2>Story wall queue</h2>
          <p>Nothing appears on the public wall until you approve it. {pending.length} awaiting review, {live.length} live.</p>
        </div>

        <h3 style={{ marginBottom: 12 }}>Awaiting review</h3>
        {pending.length ? (
          pending.map((s) => (
            <div className="card" style={{ padding: 22, marginBottom: 12 }} key={s.id}>
              <span className="eyebrow">{s.role || "Leader"} {s.consent ? "" : "· NO CONSENT GIVEN"}</span>
              <h4 style={{ marginBottom: 8 }}>{s.name}</h4>
              <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", marginBottom: 14 }}>{s.body}</p>
              <div style={{ display: "flex", gap: 8 }}>
                {s.consent ? (
                  <form action={approveStory}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn btn-teal btn-sm" type="submit">Approve &amp; publish</button>
                  </form>
                ) : (
                  <span style={{ fontSize: ".78rem", color: "var(--ink-faint)" }}>Cannot publish — author did not consent.</span>
                )}
                <form action={removeStory}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="btn btn-outline btn-sm" type="submit">Delete</button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--ink-faint)", fontSize: ".88rem", marginBottom: 24 }}>Nothing waiting. New submissions land here.</p>
        )}

        <h3 style={{ margin: "26px 0 12px" }}>Live on the wall</h3>
        {live.length ? (
          live.map((s) => (
            <div className="card" style={{ padding: 18, marginBottom: 10 }} key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <strong style={{ fontSize: ".92rem" }}>{s.name}</strong>
                  <p style={{ fontSize: ".84rem", color: "var(--ink-soft)", marginTop: 4 }}>{s.body}</p>
                </div>
                <form action={removeStory}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="btn btn-outline btn-sm" type="submit">Remove</button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--ink-faint)", fontSize: ".88rem" }}>No stories published yet.</p>
        )}
      </main>
    </>
  );
}
