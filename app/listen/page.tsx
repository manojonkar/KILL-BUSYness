import Link from "next/link";
import Header from "@/components/Header";
import { CHAPTERS } from "@/lib/chapters";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasPurchasedAudioBook } from "@/lib/book";
import { hasRedeemedFullAudioBook } from "@/lib/gamification";

const FULL_AUDIOBOOK_VIDEO_ID = "ESwDzvA9mCg";

export default async function ListenLibraryPage() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check lifetime purchase status for full book (no temp access for the whole audiobook)
    const fullBookPurchased = await hasPurchasedAudioBook(adminClient, user?.email || "", undefined, true);
    const fullBookRedeemed = user ? await hasRedeemedFullAudioBook(supabase, user.id) : false;
    const hasFullAccess = fullBookPurchased || fullBookRedeemed;

    const paidChapters = new Set<number>();
    if (hasFullAccess) {
      CHAPTERS.forEach(c => paidChapters.add(c.id));
    } else {
      await Promise.all(
        CHAPTERS.map(async (c) => {
          const hasPaid = await hasPurchasedAudioBook(adminClient, user?.email || "", c.id, true);
          if (hasPaid) paidChapters.add(c.id);
        })
      );
    }

    return (
      <>
        <Header active="Listen" />
        <main>
          <div className="section-head">
            <span className="eyebrow">Audio Experience</span>
            <h2>Listen to KILL BUSYness</h2>
            <p>Experience the complete book through audio and video. Purchase the full AudioBook, or enjoy instant listening of any chapter via Temporary Access.</p>
          </div>

          {/* ── Full AudioBook (Paid Only) ── */}
          <div className="card" style={{ marginBottom: 40, overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span className="eyebrow">Complete AudioBook</span>
                <h3 style={{ margin: "6px 0 4px", fontSize: "1.35rem" }}>KILL BUSYness — Full AudioBook</h3>
                <p style={{ margin: 0, color: "#475569", fontSize: "0.92rem" }}>The complete book in one sitting. All chapters, back to back.</p>
              </div>

              {hasFullAccess ? (
                <span className="chip level" style={{ flexShrink: 0 }}>Owned &middot; Lifetime Access</span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
                  <div style={{ textAlign: "right", lineHeight: 1.3 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}>Rs. 999</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>2000 Credits</div>
                  </div>
                  <a 
                    href="/buy?format=audiobook" 
                    className="btn" 
                    style={{ background: "#0369a1", color: "#fff", border: "none", fontWeight: 600, padding: "8px 20px", textDecoration: "none" }}
                  >
                    BUY Full AudioBook — Rs. 999
                  </a>
                </div>
              )}
            </div>

            {hasFullAccess ? (
              <div style={{ position: "relative", paddingTop: "56.25%", background: "#000", borderTop: "1px solid #cbd5e1" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${FULL_AUDIOBOOK_VIDEO_ID}?rel=0&modestbranding=1&cc_load_policy=0&iv_load_policy=3`}
                  title="KILL BUSYness — Full AudioBook"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                />
              </div>
            ) : (
              <div style={{ margin: "20px 28px 28px", padding: 24, background: "#f8fafc", borderRadius: 10, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "0.95rem" }}>
                  Purchase the Full AudioBook to unlock the complete continuous recording, or listen to individual chapters below for free with Temporary Access.
                </p>
                <a href="/buy?format=audiobook" className="btn" style={{ background: "#0369a1", color: "#fff", border: "none", fontWeight: 600 }}>
                  Get Full AudioBook — Rs. 999
                </a>
              </div>
            )}
          </div>

          {/* ── Chapter by Chapter (Temp Access + BUY) ── */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: 4 }}>Listen Chapter by Chapter</h3>
            <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0 }}>Each chapter is available for individual purchase (Rs. 100) or immediate listening via Temporary Access.</p>
          </div>

          <div className="grid cols-3">
            {CHAPTERS.map((c) => {
              const isPaid = paidChapters.has(c.id);
              return (
                <div key={c.id} className="card chapter-card" style={{ display: "flex", flexDirection: "column" }}>
                  <Link href={`/listen/${c.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <div className="chapter-num">{c.num} &middot; {c.roar.toUpperCase()}</div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 6 }}>{c.title}</h3>
                    <p className="desc" style={{ marginTop: 0 }}>{c.desc}</p>
                  </Link>
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                    {isPaid ? (
                      <Link href={`/listen/${c.id}`} className="btn btn-sm btn-outline" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                        Read &amp; Listen (Owned)
                      </Link>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#64748b" }}>
                          <span>Price: <strong style={{ color: "#0f172a" }}>Rs. 100</strong> / 200 Cr</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <a 
                            href={`/buy?format=audio_chapter_${c.id}`} 
                            className="btn btn-sm" 
                            style={{ flex: 1, justifyContent: "center", background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: 600, padding: "7px 8px", fontSize: "0.82rem", textAlign: "center" }}
                          >
                            BUY &middot; Rs. 100
                          </a>
                          <Link 
                            href={`/listen/${c.id}`} 
                            className="btn btn-sm" 
                            style={{ flex: 1, justifyContent: "center", background: "#f0fdf4", color: "#166534", border: "1px solid #86efac", fontWeight: 600, padding: "7px 8px", fontSize: "0.82rem", textAlign: "center" }}
                          >
                            Temp. Access
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </>
    );
  } catch (err: any) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        <h2>LISTEN SERVER ERROR</h2>
        <p><strong>Message:</strong> {err.message}</p>
        <p><strong>Stack:</strong> {err.stack}</p>
      </div>
    );
  }
}
