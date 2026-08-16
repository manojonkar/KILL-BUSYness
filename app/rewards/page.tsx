import { redirect } from "next/navigation";
import Header from "@/components/Header";
import RedeemButton from "./RedeemButton";
import { createClient } from "@/lib/supabase/server";
import { getProgress, getBadges, levelFor, levelName, nextLevel, touchStreak, evaluateBadges, BADGES, getStoreItems, getOrgStats } from "@/lib/gamification";

export default async function RewardsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await touchStreak(supabase);
  await evaluateBadges(supabase, user.id);

  const [progress, badges, store, org] = await Promise.all([
    getProgress(supabase, user.id),
    getBadges(supabase, user.id),
    getStoreItems(supabase),
    getOrgStats(supabase, user.id)
  ]);

  const lvl = levelFor(progress.xp);
  const name = levelName(progress.xp);
  const next = nextLevel(progress.xp);
  const pct = next ? Math.round((100 * progress.xp) / next.min) : 100;
  const hasAudit = !!org && org.completed > 0;

  return (
    <>
      <Header active="Leadership Journey" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Leadership Journey &amp; Capabilities</span>
          <h2>Your High-Performance Journey.</h2>
          <p>Earn MI Credits by reading, reflecting, running your organization&apos;s diagnostic, and championing the work. Leverage your credits for VIP store rewards and management engagements.</p>
        </div>

        <div className="gamification-container" style={{ marginBottom: 24 }}>
          <div className="level-map">
            <div className="level-header">
              <span className="level-title">Stage: {name}</span>
              <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600 }}>
                {next ? `${progress.xp} / ${next.min} Leadership Capital` : `${progress.xp} Leadership Capital — Top Stage`}
              </span>
            </div>
            <div className="level-progress-container">
              <div className="level-progress-bar" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <p style={{ fontSize: ".85rem", color: "#64748b", marginTop: 16 }}>
              Continue your executive development to unlock the next leadership stage and new capabilities.
            </p>
          </div>
        </div>

        <div className="gamification-container" style={{ gridTemplateColumns: "1fr", marginBottom: 24 }}>
          <div className="card" style={{ padding: 32, background: "#fafaf8", border: "none" }}>
            <h4 style={{ marginBottom: 24, fontSize: "1.2rem", fontWeight: 800 }}>Milestone Portfolio</h4>
            <div className="trophy-case">
              {BADGES.map((b) => {
                const unlocked = badges.has(b.id);
                const isMaster = b.id === "b10";
                return (
                  <div className={`trophy-item ${unlocked ? "unlocked" : "locked"} ${isMaster ? "master-badge" : ""}`} key={b.id}>
                    {isMaster ? (
                      <div style={{ marginBottom: 12 }}>
                        <img src="/img/emblem.jpg" alt="Lion Emblem" style={{ width: 140, height: 140, objectFit: "contain", margin: "0 auto", borderRadius: "50%", filter: unlocked ? "drop-shadow(0 4px 12px rgba(217,164,65,0.25))" : "grayscale(100%) opacity(40%)" }} />
                      </div>
                    ) : (
                      <div className="trophy-icon">{b.ic}</div>
                    )}
                    
                    <h5 className="trophy-name">{b.name}</h5>
                    {b.desc && <p className="trophy-desc">{b.desc}</p>}
                    
                    {isMaster && unlocked && (
                      <a 
                        href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent("I KILL BUSYness")}&organizationName=${encodeURIComponent("Management Innovations")}&certUrl=${encodeURIComponent("https://www.killbusyness.com")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#0077b5", borderColor: "#0077b5", marginTop: 16, fontSize: ".85rem", background: "#fff", padding: "8px 16px", borderRadius: "20px" }}
                        title="Add Certification to LinkedIn Profile"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Add to Profile
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grid cols-2">
          <div className="card" style={{ padding: 32 }}>
            <h4 style={{ marginBottom: 14 }}>Your organization</h4>
            {org ? (
              <>
                <div className="leader-row" style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}><span style={{ color: "#64748b" }}>Participants invited</span><span style={{ fontWeight: 600 }}>{org.invited}</span></div>
                <div className="leader-row" style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}><span style={{ color: "#64748b" }}>Surveys completed</span><span style={{ fontWeight: 600 }}>{org.completed}</span></div>
                <div className="leader-row" style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}><span style={{ color: "#64748b" }}>Response rate</span><span style={{ fontWeight: 600 }}>{org.rate}%</span></div>
                <p style={{ fontSize: ".85rem", color: "#94a3b8", marginTop: 16 }}>
                  {org.completed === 0
                    ? "Your diagnostic report unlocks once at least one participant completes the survey."
                    : "A higher response rate makes every score in your diagnostic more reliable."}
                </p>
              </>
            ) : (
              <p style={{ color: "var(--ink-faint)", fontSize: ".85rem" }}>
                Register your organization to start the audit and track participation here.
              </p>
            )}
          </div>
          
          <div className="card" style={{ padding: 32 }}>
            <h4 style={{ marginBottom: 8 }}>VIP Store</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <p style={{ color: "#64748b", fontSize: ".9rem", margin: 0 }}>Available MI Credits:</p>
              <strong style={{ color: "#D9A441", fontSize: "1.2rem", fontFamily: "var(--mono)" }}>{progress.wallet}</strong>
            </div>
            
            <div className="vip-store">
              {store.map((s) => {
                const locked = s.requiresAudit && !hasAudit;
                return (
                  <div className={`store-card ${locked ? "locked" : ""}`} key={s.name}>
                    <div className="store-info">
                      <h5>{s.name}</h5>
                      {s.requiresAudit && (
                        <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>
                          <span style={{ color: "#ef4444", marginRight: 4 }}>●</span>
                          Diagnostic required
                        </span>
                      )}
                    </div>
                    <div className="store-price">
                      ◆ {s.cost} <RedeemButton name={s.name} cost={s.cost} canAfford={!locked && progress.wallet >= s.cost} />
                    </div>
                  </div>
                );
              })}
            </div>
            {!hasAudit && (
              <p style={{ fontSize: ".75rem", color: "#94a3b8", marginTop: 16, textAlign: "center" }}>
                Unlock exclusive VIP store items by initiating your organization diagnostic.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
