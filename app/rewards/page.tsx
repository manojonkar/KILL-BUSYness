import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import RedeemButton from "./RedeemButton";
import ClaimForm from "./ClaimForm";
import ReferralLink from "./ReferralLink";
import ChapterStoreGroup from "./ChapterStoreGroup";
import TrainingStoreGroup from "./TrainingStoreGroup";
import MixedCurrencyModal from "./MixedCurrencyModal";
import { createClient } from "@/lib/supabase/server";
import { getReferralCode } from "./actions";
import { getSettings } from "@/lib/book";
import {
  getProgress, getBadges, levelFor, levelName, nextLevel, touchStreak,
  evaluateBadges, BADGES, LEVELS, getStoreItems, getOrgStats, getEarningProgress
} from "@/lib/gamification";

export default async function RewardsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?ref=/rewards");

  const settings = await getSettings(supabase);
  await touchStreak(supabase);
  await evaluateBadges(supabase, user.id);

  const [progress, badges, store, org, earning] = await Promise.all([
    getProgress(supabase, user.id),
    getBadges(supabase, user.id),
    getStoreItems(supabase),
    getOrgStats(supabase, user.id),
    getEarningProgress(supabase, user.id)
  ]);

  const referralCode = await getReferralCode();

  const lvl = levelFor(progress.xp);
  const name = levelName(progress.xp);
  const next = nextLevel(progress.xp);
  const currentLevel = LEVELS[lvl - 1];
  const pctInLevel = next
    ? Math.round(((progress.xp - currentLevel.min) / (next.min - currentLevel.min)) * 100)
    : 100;
  const hasAudit = !!org && org.completed > 0;

  /* ── Journey insight: what to do next ── */
  let journeyInsight = "";
  let journeyCta = { label: "", href: "" };
  if (lvl === 1) {
    journeyInsight = "Start reading and reflecting to move toward Visionary.";
    journeyCta = { label: "Start Reading →", href: "/read" };
  } else if (lvl === 2) {
    journeyInsight = "You cannot reach Catalyst without running an organization audit.";
    journeyCta = { label: "Run Your Audit →", href: "/dashboard#audit" };
  } else if (lvl === 3) {
    journeyInsight = "Advocate the work — refer, gift, or run a reading club to reach Architect.";
    journeyCta = { label: "Share Your Story →", href: "/stories" };
  } else if (lvl === 4) {
    journeyInsight = "Commercial engagement — attend or organize training to reach the top.";
    journeyCta = { label: "Contact Us →", href: "/contact" };
  } else {
    journeyInsight = "You've reached the highest stage. Keep leading.";
    journeyCta = { label: "View Store →", href: "#store" };
  }

  /* ── Sort badges: unlocked first, then by proximity to unlock ── */
  const sortedBadges = [...BADGES].sort((a, b) => {
    const aUnlocked = badges.has(a.id) ? 0 : 1;
    const bUnlocked = badges.has(b.id) ? 0 : 1;
    if (a.id === "b10") return 1;  // master always last
    if (b.id === "b10") return -1;
    return aUnlocked - bUnlocked;
  });

  /* ── Badge progress hints ── */
  function badgeProgress(badgeId: string): string | null {
    if (badges.has(badgeId)) return null;
    switch (badgeId) {
      case "b1": return earning.reflectionsSaved > 0 ? null : "Save 1 reflection";
      case "b2": return `${earning.reflectionsSaved}/${earning.totalChapters} reflections`;
      case "b3": return "Read from all 4 ROAR phases";
      case "b8": return `${earning.chaptersRead}/${earning.totalChapters} chapters`;
      case "b4": return earning.orgRegistered ? null : "Register your org";
      case "b6": return `${earning.participantsInvited}/10 invited`;
      case "b7": return "Run audit twice, improve 15+";
      case "b9": return `${earning.referralSignups}/3 referrals`;
      default: return null;
    }
  }

  /* ── Earning pathway data ── */
  const consumeActions = [
    { icon: "📖", label: "Read a chapter", credits: 15, done: earning.chaptersRead > 0, progress: `${earning.chaptersRead}/${earning.totalChapters}` },
    { icon: "🪞", label: "Save a reflection", credits: 25, done: earning.reflectionsSaved > 0, progress: `${earning.reflectionsSaved}/${earning.totalChapters}` },
    { icon: "📚", label: "Complete all 11", credits: 75, done: earning.allChaptersComplete, progress: earning.allChaptersComplete ? "✓" : "" },
    { icon: "🔥", label: "7-day streak", credits: 30, done: earning.hasStreak7, progress: earning.hasStreak7 ? "✓" : `${earning.streakDays}/7 days` },
  ];
  const diagnoseActions = [
    { icon: "🏗️", label: "Register org", credits: 75, done: earning.orgRegistered, progress: earning.orgRegistered ? "✓" : "" },
    { icon: "📊", label: "Complete survey", credits: 100, done: earning.surveyCompleted, progress: earning.surveyCompleted ? "✓" : "" },
    { icon: "👥", label: "Invite 10+", credits: 50, done: earning.participantsInvited >= 10, progress: `${earning.participantsInvited}/10` },
    { icon: "📋", label: "First report", credits: 100, done: earning.reportGenerated, progress: earning.reportGenerated ? "✓" : "" },
  ];
  const advocateActions = [
    { icon: "🔗", label: "Referral signup", credits: 50, done: earning.referralSignups > 0, progress: `${earning.referralSignups} so far` },
    { icon: "📣", label: "Submit a story", credits: 25, done: earning.storiesSubmitted > 0, progress: earning.storiesSubmitted > 0 ? "✓" : "" },
    { icon: "🎁", label: "Gift the book", credits: 75, done: false, progress: "Claim" },
    { icon: "📖", label: "Reading club (5+)", credits: 150, done: false, progress: "Coming soon" },
  ];

  /* ── Store tiers & processing ── */
  const allDigital = store.filter(s => !s.requiresAudit && s.cost <= 300);
  
  // Separate out the chapters for grouping
  const readChapters = allDigital.filter(s => s.name.match(/^PDF Chapter (0?\d+|Intro)$/i) || s.name === "Full eBook").map(c => ({
    ...c, cost: c.name.match(/^PDF Chapter (Intro|0)$/i) ? 0 : c.cost
  }));
  const listenChapters = allDigital.filter(s => s.name.match(/^Audio Chapter (0?\d+|Intro)$/i) || s.name === "Full AudioBook").map(c => ({
    ...c, cost: c.name.match(/^Audio Chapter (Intro|0)$/i) ? 0 : c.cost
  }));
  const otherDigitalItems = allDigital.filter(s => !s.name.match(/^PDF Chapter (0?\d+|Intro)$/i) && !s.name.match(/^Audio Chapter (0?\d+|Intro)$/i) && s.name !== "Full eBook" && s.name !== "Full AudioBook");

  // Separate Training items from Conversations
  const trainingKeywords = ["ODeX", "public Training", "In-house Training"];
  const trainingItems = store.filter(s => s.requiresAudit && trainingKeywords.some(kw => s.name.includes(kw)));
  const conversationItems = store.filter(s => s.requiresAudit && !trainingKeywords.some(kw => s.name.includes(kw)));
  
  // No longer using discountItems explicitly since all items are either training or conversations


  return (
    <>
      <Header active="Leadership Journey" />
      <main>
        {/* ── Section header ── */}
        <div className="section-head">
          <span className="eyebrow">Leadership Journey &amp; Capabilities</span>
          <h2>Your High-Performance Journey.</h2>
          <p>Earn MI Credits by reading, reflecting, running your organization&apos;s diagnostic, and championing the work. Leverage your credits for exclusive rewards and management engagements.</p>
        </div>

        {/* ══════ A. ROAR Journey Map ══════ */}
        <div className="journey-map">
          <div className="journey-nodes">
            {LEVELS.map((level, i) => {
              const isCompleted = lvl > i + 1;
              const isActive = lvl === i + 1;
              const isFuture = lvl < i + 1;
              return (
                <div
                  key={level.name}
                  className={`journey-node ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${isFuture ? "future" : ""}`}
                >
                  <div className="journey-node-circle">
                    {isCompleted ? "✓" : i + 1}
                  </div>
                  <span className="journey-node-label">{level.name}</span>
                  <span className="journey-node-credits">{level.min}+</span>
                </div>
              );
            })}
          </div>
          <div className="journey-progress-track">
            <div className="journey-progress-fill" style={{ width: `${Math.min(((lvl - 1) / (LEVELS.length - 1)) * 100 + (pctInLevel / (LEVELS.length - 1)), 100)}%` }} />
          </div>
          <div className="journey-status">
            <span className="journey-current">
              <strong>{name}</strong> · {progress.xp} MI Credits
              {next && <> · {next.min - progress.xp} to {next.name}</>}
            </span>
          </div>
          <div className="journey-insight">
            <p>{journeyInsight}</p>
            <Link href={journeyCta.href} className="btn btn-sm btn-teal">{journeyCta.label}</Link>
          </div>
        </div>

        {/* ══════ B. Earning Pathways ══════ */}
        <div style={{ 
          marginTop: 48, marginBottom: 28, padding: "32px 40px", 
          background: "linear-gradient(135deg, #0b1730 0%, #132a52 100%)", 
          border: "1px solid #23386b",
          borderRadius: 16, color: "#fff", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)"
        }}>
          <h3 style={{ fontSize: "1.85rem", fontWeight: 800, marginBottom: 12, color: "#fff" }}>How to Earn MI Credits</h3>
          <p style={{ color: "#cbd5e1", fontSize: "1.05rem", maxWidth: 700, lineHeight: 1.6 }}>
            There are three core pathways to accumulate your balance. Engage deeply with the content, run your organization's diagnostic, and advocate for the principles of KILL BUSYness. 
            <strong> The more active you are, the higher your balance grows.</strong>
          </p>
        </div>
        <div className="earning-pathways">
          <div className="pathway-card consume">
            <div className="pathway-header">
              <h4>1. Consume</h4>
              <span className="pathway-subtitle">Individual · Automatic</span>
            </div>
            <div className="pathway-actions">
              {consumeActions.map((a) => (
                <div key={a.label} className={`pathway-action ${a.done ? "done" : ""}`}>
                  <span className="pathway-icon">{a.icon}</span>
                  <span className="pathway-label">{a.label}</span>
                  <span className="pathway-credits">+{a.credits}</span>
                  <span className="pathway-status">{a.done ? "✓" : a.progress}</span>
                </div>
              ))}
            </div>
            <div className="pathway-max">max ≈ 545</div>
          </div>

          <div className="pathway-card diagnose">
            <div className="pathway-header">
              <h4>2. Diagnose</h4>
              <span className="pathway-subtitle">Organization · Automatic</span>
            </div>
            <div className="pathway-actions">
              {diagnoseActions.map((a) => (
                <div key={a.label} className={`pathway-action ${a.done ? "done" : ""}`}>
                  <span className="pathway-icon">{a.icon}</span>
                  <span className="pathway-label">{a.label}</span>
                  <span className="pathway-credits">+{a.credits}</span>
                  <span className="pathway-status">{a.done ? "✓" : a.progress}</span>
                </div>
              ))}
            </div>
            <div className="pathway-max">max ≈ 325</div>
          </div>

          <div className="pathway-card advocate">
            <div className="pathway-header">
              <h4>3. Advocate</h4>
              <span className="pathway-subtitle">Spread · Uncapped</span>
            </div>
            <div className="pathway-actions">
              {advocateActions.map((a) => (
                <div key={a.label} className={`pathway-action ${a.done ? "done" : ""}`}>
                  <span className="pathway-icon">{a.icon}</span>
                  <span className="pathway-label">{a.label}</span>
                  <span className="pathway-credits">+{a.credits}</span>
                  <span className="pathway-status">{a.done ? "✓" : a.progress}</span>
                </div>
              ))}
            </div>
            <div className="pathway-max">uncapped</div>
          </div>
        </div>

        {/* ── Earning summary strip ── */}
        <div className="earning-summary">
          <span>Your progress:</span>
          {earning.chaptersRead > 0 && <span className="earned-tag">✓ {earning.chaptersRead} chapters ({earning.chaptersRead * 15})</span>}
          {earning.reflectionsSaved > 0 && <span className="earned-tag">✓ {earning.reflectionsSaved} reflections ({earning.reflectionsSaved * 25})</span>}
          {earning.orgRegistered && <span className="earned-tag">✓ Org registered (75)</span>}
          {earning.surveyCompleted && <span className="earned-tag">✓ Survey completed (100)</span>}
          {earning.storiesSubmitted > 0 && <span className="earned-tag">✓ {earning.storiesSubmitted} stories</span>}
          {earning.chaptersRead === 0 && earning.reflectionsSaved === 0 && !earning.orgRegistered && (
            <span style={{ color: "#94a3b8", fontSize: ".85rem" }}>Start reading to begin earning MI Credits</span>
          )}
        </div>

        {/* ══════ C. Milestone Portfolio ══════ */}
        <div className="gamification-container" style={{ gridTemplateColumns: "1fr", marginBottom: 24 }}>
          <div className="card" style={{ padding: 32, background: "#fafaf8", border: "none" }}>
            <h4 style={{ marginBottom: 24, fontSize: "1.2rem", fontWeight: 800 }}>Milestone Portfolio</h4>
            <div className="trophy-case">
              {sortedBadges.map((b) => {
                const unlocked = badges.has(b.id);
                const isMaster = b.id === "b10";
                const progressHint = badgeProgress(b.id);
                return (
                  <div className={`trophy-item ${unlocked ? "unlocked" : "locked"} ${isMaster ? "master-badge" : ""}`} key={b.id}>
                    {isMaster ? (
                      <div style={{ marginBottom: 12 }}>
                        <img src="/img/emblem.jpg" alt="Lion Emblem" style={{ width: 140, height: 140, objectFit: "contain", margin: "0 auto", borderRadius: "50%", filter: unlocked ? "drop-shadow(0 4px 12px rgba(217,164,65,0.25))" : "opacity(40%) sepia(30%)" }} />
                      </div>
                    ) : (
                      <div className="trophy-icon">{b.ic}</div>
                    )}
                    
                    <h5 className="trophy-name">{b.name}</h5>
                    {b.desc && <p className="trophy-desc">{b.desc}</p>}
                    
                    {/* Progress indicator for locked badges */}
                    {!unlocked && !isMaster && progressHint && (
                      <div className="trophy-progress">
                        <span>{progressHint}</span>
                      </div>
                    )}
                    
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

        {/* ══════ D. VIP Store + E. Org Stats ══════ */}
        <div style={{ 
          marginTop: 64, marginBottom: 28, padding: "32px 40px", 
          background: "linear-gradient(135deg, #0E9C74 0%, #047857 100%)", 
          borderRadius: 16, color: "#fff", boxShadow: "0 10px 25px -5px rgba(14,156,116,0.3)"
        }}>
          <h3 style={{ fontSize: "1.85rem", fontWeight: 800, marginBottom: 12, color: "#fff" }}>How to Redeem MI Credits</h3>
          <p style={{ color: "#d1fae5", fontSize: "1.05rem", maxWidth: 700, lineHeight: 1.6 }}>
            Exchange your earned MI Credits for exclusive digital assets, 1-on-1 executive conversations, or significant discounts on in-person training. As you progress through the ROAR journey, higher tiers will unlock automatically.
          </p>
        </div>

        <div className="grid cols-2" id="store">
          {/* Org stats */}
          <div className="card" style={{ padding: 32 }}>
            <h4 style={{ marginBottom: 14 }}>Your organization</h4>
            {org ? (
              <>
                <div className="org-stats-strip">
                  <div className="org-stat-pill">
                    <strong>{org.invited}</strong>
                    <span>invited</span>
                  </div>
                  <div className="org-stat-pill">
                    <strong>{org.completed}</strong>
                    <span>completed</span>
                  </div>
                  <div className="org-stat-pill">
                    <strong>{org.rate}%</strong>
                    <span>response</span>
                  </div>
                </div>
                <p style={{ fontSize: ".85rem", color: "#94a3b8", marginTop: 16 }}>
                  {org.completed === 0
                    ? "Your diagnostic report unlocks once at least one participant completes the survey."
                    : "A higher response rate makes every score in your diagnostic more reliable."}
                </p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "var(--ink-faint)", fontSize: ".85rem", marginBottom: 16 }}>
                  Register your organization to start the audit and earn up to 325 additional MI Credits.
                </p>
                <Link href="/dashboard#audit" className="btn btn-sm btn-teal">Register Organization →</Link>
              </div>
            )}
          </div>
          
          {/* VIP Store */}
          <div className="card" style={{ padding: 32 }}>
            <h4 style={{ marginBottom: 8 }}>VIP Store</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <p style={{ color: "#64748b", fontSize: ".9rem", margin: 0 }}>Available MI Credits:</p>
              <strong style={{ color: "#D9A441", fontSize: "1.2rem", fontFamily: "var(--mono)" }}>◆ {progress.wallet}</strong>
            </div>
            
            {/* Rung 1: Digital */}
            {(readChapters.length > 0 || listenChapters.length > 0 || otherDigitalItems.length > 0) && (
              <div className="store-rung">
                <div className="store-rung-label">📄 Digital Self-Serve</div>
                <div className="vip-store">
                  {readChapters.length > 0 && (
                    <ChapterStoreGroup 
                      title="Read Chapters" 
                      icon="📖" 
                      items={readChapters} 
                      wallet={progress.wallet} 
                    />
                  )}
                  {listenChapters.length > 0 && (
                    <ChapterStoreGroup 
                      title="Listen Chapters" 
                      icon="🎧" 
                      items={listenChapters} 
                      wallet={progress.wallet} 
                    />
                  )}
                  {otherDigitalItems.map((s) => (
                    <div className="store-card" key={s.name}>
                      <div className="store-info">
                        <h5>{s.name}</h5>
                      </div>
                      <div className="store-price">
                        ◆ {s.cost} <RedeemButton name={s.name} cost={s.cost} canAfford={progress.wallet >= s.cost} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rung 2: Conversations */}
            {conversationItems.length > 0 && (
              <div className="store-rung conversations">
                <div className="store-rung-label">💬 Conversations {!hasAudit && <span className="rung-gate">🔒 Audit required</span>}</div>
                <div className="vip-store">
                  {conversationItems.map((s) => {
                    const locked = !hasAudit;
                    return (
                      <div className={`store-card ${locked ? "locked" : ""}`} key={s.name}>
                        <div className="store-info">
                          <h5>{s.name}</h5>
                          {locked && (
                            <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>
                              <span style={{ color: "#ef4444", marginRight: 4 }}>●</span>
                              Diagnostic required
                            </span>
                          )}
                        </div>
                        <div className="store-price" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ color: "#D9A441", fontFamily: "var(--mono)", fontWeight: 700 }}>◆ {s.cost}</span>
                          {!locked && (
                            <MixedCurrencyModal 
                              name={s.name} 
                              creditCost={s.cost} 
                              wallet={progress.wallet} 
                              upiId={settings.upi_id || ""}
                              upiPayee={settings.upi_payee || "Management Innovations"}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rung 3: Training Discounts */}
            {trainingItems.length > 0 && (
              <div className="store-rung discounts">
                <div className="store-rung-label">🎓 Training Options {!hasAudit && <span className="rung-gate">🔒 Audit required</span>}</div>
                <div className="vip-store">
                  <div className={!hasAudit ? "locked" : ""}>
                    <TrainingStoreGroup 
                      title="Apply for Training" 
                      icon="🎓" 
                      items={trainingItems} 
                    />
                  </div>
                </div>
              </div>
            )}

            {!hasAudit && (
              <p style={{ fontSize: ".75rem", color: "#94a3b8", marginTop: 16, textAlign: "center" }}>
                Unlock conversation and training items by completing your organization diagnostic.
              </p>
            )}
          </div>
        </div>

        {/* ══════ F. Grow Your Impact ══════ */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h4 style={{ marginBottom: 16, fontSize: "1.1rem", fontWeight: 800 }}>Grow Your Impact</h4>
          
          <div className="grid cols-2" style={{ gap: 20 }}>
            {/* Referral link */}
            <div>
              <h5 style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 6 }}>🔗 Invite Others</h5>
              <p style={{ fontSize: ".82rem", color: "#64748b", marginBottom: 4 }}>
                Earn <strong>50 MI Credits</strong> when someone signs up via your link, and <strong>100 more</strong> when they complete an audit.
              </p>
              {referralCode && <ReferralLink code={referralCode} />}
            </div>

            {/* Reading clubs */}
            <div>
              <h5 style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 6 }}>📖 Reading Clubs</h5>
              <p style={{ fontSize: ".82rem", color: "#64748b", marginBottom: 8 }}>
                Start a reading club for your organization. Earn <strong>150 MI Credits</strong> when 5 members are actively reading.
              </p>
              <Link href="/clubs" className="btn btn-sm btn-outline">Open Reading Clubs →</Link>
            </div>
          </div>

          {/* Claims */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
            <h5 style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 6 }}>🎓 External Activities</h5>
            <p style={{ fontSize: ".82rem", color: "#64748b" }}>
              Gifted the book, attended a training, or organized one for your company? Claim credits for activities that happen outside the portal.
            </p>
            <ClaimForm />
          </div>
        </div>
      </main>
    </>
  );
}
