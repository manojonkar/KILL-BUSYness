import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { getChapterReads } from "@/lib/gamification";
import { CHAPTERS } from "@/lib/chapters";
import ClubActions from "./ClubActions";

export default async function ClubsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's clubs (founded + joined)
  const [{ data: foundedClubs }, { data: memberships }] = await Promise.all([
    supabase.from("clubs").select("*").eq("founder_id", user.id).order("created_at", { ascending: false }),
    supabase.from("club_members").select("club_id, clubs(*)").eq("user_id", user.id)
  ]);

  // Get all public clubs user could join
  const { data: allClubs } = await supabase
    .from("clubs")
    .select("*, club_members(count)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const myClubIds = new Set([
    ...(foundedClubs || []).map((c: any) => c.id),
    ...(memberships || []).map((m: any) => m.club_id)
  ]);

  // Get reading progress for display
  const readIds = await getChapterReads(supabase, user.id);
  const readPct = Math.round((readIds.size / CHAPTERS.length) * 100);

  return (
    <>
      <Header active="Journey & Rewards" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Reading Clubs</span>
          <h2>Read together. Grow together.</h2>
          <p>Create a reading club for your organization or circle — track collective reading progress and earn 150 MI Credits when 5 members are actively reading.</p>
        </div>

        <div className="grid cols-2" style={{ marginBottom: 28 }}>
          {/* Create a club */}
          <div className="card" style={{ padding: 28 }}>
            <h4 style={{ marginBottom: 14 }}>Start a Club</h4>
            <ClubActions userId={user.id} />
          </div>

          {/* Your stats */}
          <div className="card" style={{ padding: 28 }}>
            <h4 style={{ marginBottom: 14 }}>Your Reading</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ecfdf5", border: "2px solid #0E9C74", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <strong style={{ fontSize: "1rem", color: "#0E9C74" }}>{readPct}%</strong>
              </div>
              <div>
                <strong>{readIds.size}/{CHAPTERS.length} chapters read</strong>
                <p style={{ fontSize: ".82rem", color: "#64748b", margin: 0 }}>Your reading progress is shared with your club.</p>
              </div>
            </div>
            <Link href="/read" className="btn btn-sm btn-dark">Continue Reading →</Link>
          </div>
        </div>

        {/* My clubs */}
        {(foundedClubs || []).length > 0 && (
          <>
            <h3 style={{ marginBottom: 14 }}>Your Clubs</h3>
            <div className="grid cols-3" style={{ marginBottom: 28 }}>
              {(foundedClubs || []).map((club: any) => (
                <div className="card mini-card" key={club.id}>
                  <span className="eyebrow" style={{ color: "#0E9C74" }}>Founded by you</span>
                  <h3 style={{ fontSize: "1.05rem" }}>{club.name}</h3>
                  {club.organization && <p style={{ fontSize: ".82rem", color: "#64748b" }}>{club.organization}</p>}
                  <p style={{ fontSize: ".82rem", color: "#94a3b8" }}>
                    {club.threshold_credited ? "✓ 150 credits earned" : "Invite 5 active readers to earn 150 MI Credits"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Browse clubs */}
        {(allClubs || []).filter((c: any) => !myClubIds.has(c.id)).length > 0 && (
          <>
            <h3 style={{ marginBottom: 14 }}>Browse Clubs</h3>
            <div className="grid cols-3">
              {(allClubs || []).filter((c: any) => !myClubIds.has(c.id)).map((club: any) => (
                <div className="card mini-card" key={club.id}>
                  <h3 style={{ fontSize: "1.05rem" }}>{club.name}</h3>
                  {club.organization && <p style={{ fontSize: ".82rem", color: "#64748b" }}>{club.organization}</p>}
                  <p style={{ fontSize: ".82rem", color: "#94a3b8" }}>
                    {club.club_members?.[0]?.count || 0} members
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
