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
              {BADGES.map((b) => (
                <div className={`badge-tile ${badges.has(b.id) ? "unlocked" : ""}`} key={b.id}>
                  <div className="ic">{b.ic}</div>
                  <h5>{b.name}</h5>
                  <p>{b.desc}</p>
                </div>
              ))}
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
