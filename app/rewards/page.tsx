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
      <Header active="Journey & Rewards" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Journey &amp; Rewards</span>
          <h2>Your High-Performance journey.</h2>
          <p>Earn MI Credits by reading, reflecting, running your organization&apos;s audit and championing the work. Redeem them for real Management Innovations services.</p>
        </div>

        <div className="card" style={{ padding: 26, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", fontWeight: 700, marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <span>Level {lvl} · {name}</span>
            <span>
              {next ? `${progress.xp} / ${next.min} to ${next.name}` : `${progress.xp} lifetime credits — top level`}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p style={{ fontSize: ".76rem", color: "var(--ink-faint)", marginTop: 10 }}>
            Lifetime credits never fall — they set your level. Your balance below is what you can spend.
          </p>
        </div>

        <div className="grid cols-2">
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 14 }}>Badges</h4>
            <div className="badge-grid">
              {BADGES.map((b) => {
                const unlocked = badges.has(b.id);
                return (
                  <div className={`badge-tile ${unlocked ? "unlocked" : ""}`} key={b.id} style={b.id === "b10" ? { gridColumn: "1 / -1", border: unlocked ? "1px solid #0E9C74" : undefined } : undefined}>
                    {b.id === "b10" ? (
                      <div style={{ marginBottom: 8 }}>
                        <img src="/img/emblem.jpg" alt="Lion Emblem" style={{ width: 180, height: 180, objectFit: "contain", margin: "0 auto", borderRadius: "50%", filter: unlocked ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "grayscale(100%) opacity(40%)" }} />
                      </div>
                    ) : (
                      <div className="ic">{b.ic}</div>
                    )}
                    {b.id === "b10" ? (
                      <h5 style={{ color: "#D9A441", fontWeight: 900, fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "0.02em" }}>{b.name}</h5>
                    ) : (
                      <h5>{b.name}</h5>
                    )}
                    {b.desc && <p>{b.desc}</p>}
                    {b.id === "b10" && unlocked && (
                      <a 
                        href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent("I KILL BUSYness")}&organizationName=${encodeURIComponent("Management Innovations")}&certUrl=${encodeURIComponent("https://www.killbusyness.com")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0077b5", borderColor: "#0077b5", marginTop: 12, fontSize: ".75rem" }}
                        title="Add Certification to LinkedIn Profile"
                      >
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Add to LinkedIn
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 14 }}>Your organization</h4>
            {org ? (
              <>
                <div className="leader-row"><span>Participants invited</span><span>{org.invited}</span></div>
                <div className="leader-row"><span>Surveys completed</span><span>{org.completed}</span></div>
                <div className="leader-row"><span>Response rate</span><span>{org.rate}%</span></div>
                <p style={{ fontSize: ".76rem", color: "var(--ink-faint)", marginTop: 12 }}>
                  {org.completed === 0
                    ? "Your audit unlocks once at least one participant completes the survey."
                    : "A higher response rate makes every score in your report more reliable."}
                </p>
              </>
            ) : (
              <p style={{ color: "var(--ink-faint)", fontSize: ".85rem" }}>
                Register your organization to start the audit and track participation here.
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginTop: 16 }}>
          <h4 style={{ marginBottom: 4 }}>MI Credits</h4>
          <p style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginBottom: 16 }}>
            Balance: <strong style={{ color: "var(--gold)", fontFamily: "var(--mono)" }}>{progress.wallet} MI Credits</strong>
          </p>
          {!hasAudit ? (
            <p style={{ fontSize: ".78rem", color: "var(--ink-faint)", marginBottom: 14 }}>
              Items marked &ldquo;audit required&rdquo; unlock once your organization has completed its audit.
            </p>
          ) : null}
          {store.map((s) => {
            const locked = s.requiresAudit && !hasAudit;
            return (
              <div className="card store-item" style={{ marginBottom: 10, opacity: locked ? 0.55 : 1 }} key={s.name}>
                <span>
                  {s.name}
                  {s.requiresAudit ? (
                    <span style={{ fontSize: ".68rem", fontFamily: "var(--mono)", color: "var(--ink-faint)", display: "block", marginTop: 3 }}>
                      Audit required
                    </span>
                  ) : null}
                </span>
                <span className="price">
                  ◆ {s.cost} <RedeemButton name={s.name} cost={s.cost} canAfford={!locked && progress.wallet >= s.cost} />
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
