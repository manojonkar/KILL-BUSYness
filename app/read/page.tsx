import Link from "next/link";
import Header from "@/components/Header";
import { CHAPTERS } from "@/lib/chapters";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasPurchasedAnyBook, hasPurchasedPdfChapter } from "@/lib/book";
import { isChapterUnlocked } from "@/lib/gamification";
import EBookReader from "@/app/ebook/EBookReader";

export default async function ReadIndex() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    let hasFullAccess = false;
    const accessMap = new Map<number, boolean>();

    if (user) {
      hasFullAccess = await hasPurchasedAnyBook(adminClient, user.email || "");
      
      if (!hasFullAccess) {
        await Promise.all(CHAPTERS.map(async (c) => {
          let hasAccess = false;
          hasAccess = await hasPurchasedPdfChapter(adminClient, user.email || "", c.id);
          if (!hasAccess) {
            hasAccess = await isChapterUnlocked(supabase, user.id, c.id);
          }
          accessMap.set(c.id, hasAccess);
        }));
      } else {
        CHAPTERS.forEach(c => accessMap.set(c.id, true));
      }
    }

    return (
      <>
        <Header active="Read" />
        <main>
          <div className="section-head">
            <span className="eyebrow">The Book, Reimagined</span>
            <h2>Read KILL BUSYness</h2>
            <p>
              Experience the complete book through beautifully rendered PDF pages. Purchase the full eBook, or unlock individual chapters as you go.
            </p>
          </div>

          {/* ── Full eBook ── */}
          <div className="card" style={{ marginBottom: 40, overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span className="eyebrow">Complete eBook</span>
                <h3 style={{ margin: "6px 0 6px", fontSize: "1.35rem" }}>KILL BUSYness — Full eBook</h3>
                <p style={{ margin: 0, color: "#475569", fontSize: "0.92rem" }}>The complete 154-page book.</p>
              </div>
              {hasFullAccess ? (
                <span className="chip level" style={{ flexShrink: 0, alignSelf: "center" }}>Owned</span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "right", lineHeight: 1.4 }}>Rs. 999<br/>2000 Credits</span>
                  <a href="/buy?format=ebook" className="btn" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
                    Buy Full eBook
                  </a>
                </div>
              )}
            </div>

            {hasFullAccess ? (
              <div style={{ marginTop: 24, height: "80vh", background: "#e2e8f0", borderTop: "1px solid #e2e8f0" }}>
                <EBookReader totalPages={154} />
              </div>
            ) : (
              <div style={{ margin: "20px 28px 28px", padding: 24, background: "#f8fafc", borderRadius: 10, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "0.95rem" }}>
                  Purchase the Full eBook to unlock the complete book.
                </p>
                <a href="/buy?format=ebook" className="btn" style={{ background: "#0369a1", color: "#fff", border: "none", fontWeight: 600 }}>
                  Get Full eBook — Rs. 999
                </a>
              </div>
            )}
          </div>

          {/* ── Chapter by Chapter ── */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: 4 }}>Read Chapter by Chapter</h3>
            <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0 }}>Each chapter is also available individually.</p>
          </div>

          <div className="grid cols-3">
            {CHAPTERS.map((c) => {
              const hasChapterAccess = accessMap.get(c.id);
              return (
                <div key={c.id} className="card chapter-card" style={{ display: "flex", flexDirection: "column" }}>
                  <Link href={`/read/${c.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <div className="chapter-num">{c.num} &middot; {c.roar.toUpperCase()}</div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 6 }}>{c.title}</h3>
                    <p className="desc" style={{ marginTop: 0 }}>{c.desc}</p>
                  </Link>
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    {hasChapterAccess ? (
                      <Link href={`/read/${c.id}`} className="btn btn-sm btn-outline" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                        Read Chapter
                      </Link>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.4 }}>Rs. 100<br/>200 Credits</span>
                        <a href={`/buy?format=pdf_chapter_${c.id}`} className="btn btn-sm" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600, padding: "6px 16px" }}>
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
        <h2>SERVER ERROR DETECTED</h2>
        <p><strong>Message:</strong> {err.message}</p>
        <p><strong>Stack:</strong> {err.stack}</p>
      </div>
    );
  }
}
