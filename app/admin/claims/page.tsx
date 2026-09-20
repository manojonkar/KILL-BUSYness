import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import ClaimActions from "./ClaimActions";

export default async function AdminClaimsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only admin can access
  if (user.email !== "manojonkar@gmail.com") redirect("/home");

  const { data: claims } = await supabase
    .from("claims")
    .select("*, auth_users:user_id(email)")
    .order("created_at", { ascending: false });

  // Fallback: if the join doesn't work, fetch emails separately
  const allClaims = claims || [];

  return (
    <>
      <Header />
      <main>
        <div className="section-head">
          <span className="eyebrow">Admin</span>
          <h2>Credit Claims Queue</h2>
          <p>Review and approve claims for gifting, attending, or organizing training. Each approved claim is a sales lead.</p>
        </div>

        {allClaims.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "#94a3b8" }}>No claims yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {allClaims.map((claim: any) => {
              const labels: Record<string, string> = {
                gift_book: "🎁 Gifted the book",
                attend_training: "🎓 Attended training",
                organize_training: "🏢 Organized training",
              };
              const statusColors: Record<string, string> = {
                pending: "#D9A441",
                approved: "#0E9C74",
                rejected: "#ef4444",
              };
              return (
                <div className="card" key={claim.id} style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <strong style={{ fontSize: "1rem" }}>{labels[claim.claim_type] || claim.claim_type}</strong>
                      <span style={{
                        display: "inline-block", marginLeft: 10, padding: "2px 10px",
                        background: statusColors[claim.status] + "15",
                        color: statusColors[claim.status],
                        borderRadius: 12, fontSize: ".75rem", fontWeight: 700,
                        textTransform: "uppercase"
                      }}>
                        {claim.status}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: ".85rem", color: "#D9A441", fontWeight: 700 }}>
                      +{claim.credits_amount} credits
                    </span>
                  </div>
                  <p style={{ fontSize: ".88rem", color: "#334155", marginBottom: 8 }}>{claim.details}</p>
                  <div style={{ fontSize: ".78rem", color: "#94a3b8", marginBottom: 12 }}>
                    <span>From: {claim.auth_users?.email || claim.user_id}</span>
                    <span style={{ margin: "0 8px" }}>·</span>
                    <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>
                  {claim.status === "pending" && (
                    <ClaimActions claimId={claim.id} userId={claim.user_id} credits={claim.credits_amount} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
