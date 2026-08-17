import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import InviteClient from "./InviteClient";
import { addParticipant, addBulkParticipants, resendInvite, removeParticipant } from "./sendInvite";
import { finishRegistration } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { getProgress, getChapterReads, getBadges, touchStreak, evaluateBadges, levelFor, levelName } from "@/lib/gamification";
import { CHAPTERS } from "@/lib/chapters";

function CircularProgress({ percent, label, value }: { percent: number; label: string; value: string|number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="80" height="80" style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
        <circle cx="40" cy="40" r={radius} stroke="#e2e8f0" strokeWidth="6" fill="none" />
        <circle cx="40" cy="40" r={radius} stroke="url(#progressGradient)" strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} strokeLinecap="round" />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0E9C74" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await touchStreak(supabase);
  await evaluateBadges(supabase, user.id);

  const [progress, readIds, badges, companyRes] = await Promise.all([
    getProgress(supabase, user.id),
    getChapterReads(supabase, user.id),
    getBadges(supabase, user.id),
    supabase.from("companies").select("*").eq("admin_user_id", user.id).maybeSingle()
  ]);
  const company = companyRes.data;

  let participants: { id: string; name: string; email: string; level: string; status: string; invite_token: string }[] = [];
  let hasCompleted = false;
  if (company) {
    const { data } = await supabase
      .from("participants")
      .select("id, name, email, level, status, invite_token")
      .eq("company_id", company.id)
      .order("created_at", { ascending: true });
    participants = data || [];
    hasCompleted = participants.some((p) => p.status === "completed");
  }

  const boundAdd = addParticipant.bind(null, company?.id || "");
  const boundBulk = addBulkParticipants.bind(null, company?.id || "", company?.seats || 10);

  return (
    <>
      <Header active="Overview" />
      <main>
        <div className="hero-panel">
          <h1>Welcome back{user.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}.</h1>
          <p>Your reading journey, XP, and Organization Audit — all in one place.</p>
          <div className="stat-row" style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <CircularProgress percent={Math.round((readIds.size / CHAPTERS.length) * 100)} value={`${readIds.size}/${CHAPTERS.length}`} label="" />
              <div>
                <strong style={{ display: "block", fontSize: "1.1rem" }}>Reading Journey</strong>
                <span style={{ color: "#64748b", fontSize: ".85rem" }}>Chapters read</span>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#D9A441" }}>{progress.xp}</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "1.1rem" }}>Leadership Capital</strong>
                <span style={{ color: "#64748b", fontSize: ".85rem" }}>MI Credits earned</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>{badges.size}</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "1.1rem" }}>Milestones</strong>
                <span style={{ color: "#64748b", fontSize: ".85rem" }}>Capabilities unlocked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid cols-3" style={{ marginBottom: 10 }}>
          <div className="card mini-card">
            <span className="eyebrow">Stage: {levelName(progress.xp)}</span>
            <h3>Your reading journey</h3>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.round((100 * readIds.size) / CHAPTERS.length)}%` }} />
            </div>
            <Link href="/read" className="btn btn-dark btn-sm" style={{ marginTop: 12 }}>
              Open Chapters
            </Link>
          </div>
          <div className="card mini-card">
            <span className="eyebrow">Wallet</span>
            <h3>MI Credits</h3>
            <p>
              You have <strong>{progress.wallet} MI Credits</strong> available.
            </p>
            <Link href="/rewards" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
              View Store
            </Link>
          </div>
          {hasCompleted && company ? (
            <div className="card mini-card">
              <span className="eyebrow">Report</span>
              <h3>Your BUSYness Index</h3>
              <p>See your organization&apos;s live diagnostic report and action plan.</p>
              <Link href={`/report/${company.id}`} className="btn btn-teal btn-sm" style={{ marginTop: 12 }}>
                View Report
              </Link>
            </div>
          ) : null}
        </div>

        <div id="audit" className="section-head" style={{ marginTop: 40 }}>
          <span className="eyebrow">100% Free Organization Audit</span>
          <h2>Measure your BUSYness Index. Build your High-Performance plan.</h2>
          <p>
            An organization-wide diagnostic across the 10 dimensions of KILL BUSYness — from the owner/CEO through the
            leadership team to the wider organization — scored into a full report with a chapter-linked action plan.
          </p>
          <div style={{ display: "inline-block", marginTop: 16, padding: "6px 14px", background: "#ecfdf5", color: "#047857", borderRadius: 20, fontSize: "0.85rem", fontWeight: 700, border: "1px solid #10b981" }}>
            ✓ Completely Free for your entire organization
          </div>
        </div>

        {searchParams?.error ? <p style={{ color: "#9B2226", fontSize: ".85rem", marginBottom: 14 }}>{searchParams.error}</p> : null}

        {!company ? (
          <div className="card" style={{ padding: 30, maxWidth: 720 }}>
            <span className="eyebrow">Step 1 of 2 — Register</span>
            <h3 style={{ marginBottom: 6 }}>Register your organization</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: ".88rem", marginBottom: 22 }}>
              Set up your company below — you can invite your team the moment you register.
            </p>
            <form action={finishRegistration} className="form-grid">
              <div className="field">
                <label>Company Name</label>
                <input name="name" placeholder="e.g. Meridian Industries Pvt Ltd" required />
              </div>
              <div className="field">
                <label>Industry</label>
                <input name="industry" placeholder="e.g. Manufacturing" />
              </div>
              <div className="field">
                <label>Company Size</label>
                <select name="size" defaultValue="250-500">
                  <option>1-50</option>
                  <option>50-250</option>
                  <option>250-500</option>
                  <option>500-2000</option>
                  <option>2000+</option>
                </select>
              </div>
              <div className="field">
                <label>Number of Seats to Invite</label>
                <input name="seats" type="number" min={1} defaultValue={10} />
              </div>
              <div className="field full">
                <label>Your Name (Admin)</label>
                <input name="adminName" defaultValue={user.user_metadata?.name || ""} placeholder="Full name" />
              </div>
              <div className="field full">
                <label>Your Email (Admin)</label>
                <input name="adminEmail" defaultValue={user.email || ""} placeholder="you@company.com" />
              </div>
              <button className="btn btn-primary form-grid full" style={{ marginTop: 4, gridColumn: "1/-1" }} type="submit">
                Register Company (+75 MI Credits)
              </button>
            </form>
          </div>
        ) : (
          <InviteClient seats={company.seats} participants={participants} addAction={boundAdd} bulkAction={boundBulk} resendAction={resendInvite} removeAction={removeParticipant} siteUrl={process.env.NEXT_PUBLIC_SITE_URL || "https://www.killbusyness.com"} />
        )}
      </main>
    </>
  );
}
