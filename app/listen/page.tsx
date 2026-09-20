import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { CHAPTERS } from "@/lib/chapters";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasPurchasedAudioBook } from "@/lib/book";
import { hasRedeemedAudioChapter, hasRedeemedFullAudioBook, getChapterReads } from "@/lib/gamification";

const FULL_AUDIOBOOK_VIDEO_ID = "ESwDzvA9mCg";

export default async function ListenLibraryPage() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    let fullBookPurchased = false;
    let fullBookRedeemed = false;
    if (user) {
      fullBookPurchased = await hasPurchasedAudioBook(adminClient, user.email || "");
      fullBookRedeemed = await hasRedeemedFullAudioBook(supabase, user.id);
    }

    const hasFullAccess = fullBookPurchased || fullBookRedeemed;

    const chapterAccess = await Promise.all(
      CHAPTERS.map(async (c) => {
        let access = !!c.isAudioPublic || hasFullAccess;
        if (!access && user) {
          access = await hasPurchasedAudioBook(adminClient, user.email || "", c.id)
                || await hasRedeemedAudioChapter(supabase, user.id, c.id);
        }
        return { id: c.id, hasAccess: access };
      })
    );

    const accessMap = new Map(chapterAccess.map((a) => [a.id, a.hasAccess]));

    return (
      <>
        <Header active="Listen" />
        <main>
          <div className="section-head">
            <span className="eyebrow">Audio Experience</span>
            <h2>Listen to KILL BUSYness</h2>
            <p>Experience the complete book through audio and video. Purchase the full AudioBook, or unlock individual chapters as you go.</p>
          </div>

          {/* ── Full AudioBook ── */}
          <div className="card" style={{ marginBottom: 40, overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span className="eyebrow">Complete AudioBook</span>
                <h3 style={{ margin: "6px 0 6px", fontSize: "1.35rem" }}>KILL BUSYness — Full AudioBook</h3>
                <p style={{ margin: 0, color: "#475569", fontSize: "0.92rem" }}>The complete book in one sitting. All chapters, back to back.</p>
              </div>
              {hasFullAccess ? (
                <span className="chip level" style={{ flexShrink: 0, alignSelf: "center" }}>Owned</span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "right", lineHeight: 1.4 }}>Rs. 999<br/>2000 Credits</span>
                  <a href="/buy?format=audiobook" className="btn" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
                    Buy Full AudioBook
                  </a>
                </div>
              )}
            </div>

            {hasFullAccess ? (
              <div style={{ marginTop: 24, position: "relative", paddingTop: "56.25%", background: "#000" }}>
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
                  Purchase the Full AudioBook to unlock the complete recording.
                </p>
                <a href="/buy?format=audiobook" className="btn" style={{ background: "#0369a1", color: "#fff", border: "none", fontWeight: 600 }}>
                  Get Full AudioBook — Rs. 999
                </a>
              </div>
            )}
          </div>

          {/* ── Chapter by Chapter ── */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: 4 }}>Listen Chapter by Chapter</h3>
            <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0 }}>Each chapter is also available individually.</p>
          </div>

          <div className="grid cols-3">
            {CHAPTERS.map((c) => {
              const hasChapterAccess = accessMap.get(c.id);
              return (
                <div key={c.id} className="card chapter-card" style={{ display: "flex", flexDirection: "column" }}>
                  <Link href={`/listen/${c.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <div className="chapter-num">{c.num} &middot; {c.roar.toUpperCase()}</div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 6 }}>{c.title}</h3>
                    <p className="desc" style={{ marginTop: 0 }}>{c.desc}</p>
                  </Link>
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    {hasChapterAccess ? (
                      <Link href={`/listen/${c.id}`} className="btn btn-sm btn-outline" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                        Read &amp; Listen
                      </Link>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.4 }}>Rs. 100<br/>200 Credits</span>
                        <a href={`/buy?format=audio_chapter_${c.id}`} className="btn btn-sm" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600, padding: "6px 16px" }}>
                          Unlock Chapter
                        </a>
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
