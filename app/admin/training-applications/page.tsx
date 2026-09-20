import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTrainingApplicationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only admin can access
  if (user.email !== "manojonkar@gmail.com") redirect("/home");

  const { data: applications } = await supabase
    .from("training_applications")
    .select("*, auth_users:user_id(email)")
    .order("created_at", { ascending: false });

  const allApps = applications || [];

  return (
    <>
      <Header />
      <main>
        <div className="section-head">
          <span className="eyebrow">Admin</span>
          <h2>Training Applications</h2>
          <p>Review applications for training engagements.</p>
        </div>

        {allApps.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "#94a3b8" }}>No applications yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {allApps.map((app: any) => {
              const statusColors: Record<string, string> = {
                pending: "#D9A441",
                approved: "#0E9C74",
                rejected: "#ef4444",
              };
              return (
                <div className="card" key={app.id} style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <strong style={{ fontSize: "1rem" }}>{app.item_name}</strong>
                      <span style={{
                        display: "inline-block", marginLeft: 10, padding: "2px 10px",
                        background: statusColors[app.status] + "15",
                        color: statusColors[app.status],
                        borderRadius: 12, fontSize: ".75rem", fontWeight: 700,
                        textTransform: "uppercase"
                      }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mobile-stack" style={{ gap: 8, fontSize: ".88rem", color: "#334155", marginBottom: 12 }}>
                    <div><strong>Name:</strong> {app.name}</div>
                    <div><strong>Email:</strong> {app.email}</div>
                    <div><strong>Company:</strong> {app.company}</div>
                    <div><strong>Dates:</strong> {app.preferred_dates}</div>
                    <div><strong>Attendees:</strong> {app.attendees}</div>
                  </div>

                  <div style={{ fontSize: ".78rem", color: "#94a3b8" }}>
                    <span>Account: {app.auth_users?.email || app.user_id}</span>
                    <span style={{ margin: "0 8px" }}>·</span>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
