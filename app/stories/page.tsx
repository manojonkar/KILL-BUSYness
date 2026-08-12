import Header from "@/components/Header";
import StoryForm from "./StoryForm";
import { createClient } from "@/lib/supabase/server";

export default async function StoriesPage({ searchParams }: { searchParams: { error?: string; sent?: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: community } = await supabase
    .from("stories")
    .select("name, role, body, created_at")
    .eq("consent", true)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <>
      <Header active="Share Your Story" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Community</span>
          <h2>Share your story.</h2>
          <p>Real leaders, real transformations. Tell us what changed when you killed BUSYness in your organization — your story may be featured here for other leaders to learn from.</p>
        </div>

        {searchParams?.error ? <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p> : null}
        {searchParams?.sent ? (
          <p style={{ color: "#154D34", fontSize: ".88rem", marginBottom: 14 }}>
            Thank you — your story has been sent for review. It will appear below once approved.
          </p>
        ) : null}

        <StoryForm loggedIn={!!user} />

        <p style={{ fontSize: ".8rem", color: "var(--ink-faint)", marginBottom: 34 }}>
          Every story is reviewed before it appears below.
        </p>

        <div className="section-head" style={{ marginBottom: 18 }}>
          <span className="eyebrow">Sharing by Readers &amp; Implementors</span>
          <h2 style={{ fontSize: "1.5rem" }}>What others have changed.</h2>
        </div>

        {community && community.length > 0 ? (
          <div className="grid cols-3">
            {community.map((s, i) => (
              <div className="card mini-card" key={i}>
                <span className="eyebrow">{s.role || "Leader"}</span>
                <h3 style={{ fontSize: "1.05rem" }}>{s.name}</h3>
                <p>&ldquo;{s.body}&rdquo;</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 26, maxWidth: 720 }}>
            <p style={{ color: "var(--ink-soft)", fontSize: ".9rem" }}>
              No stories published yet. Be the first to share what changed in your organization.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
