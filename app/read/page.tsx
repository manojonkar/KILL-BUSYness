import Link from "next/link";
import Header from "@/components/Header";
import { CHAPTERS } from "@/lib/chapters";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasPurchasedAnyBook, hasPurchasedPdfChapter } from "@/lib/book";
import EBookReader from "@/app/ebook/EBookReader";

export default async function ReadIndex() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check permanent purchase status (ignoring temporary access)
    const isPermanentlyOwned = await hasPurchasedAnyBook(adminClient, user?.email || "", true);
    
    // Check chapter permanent purchase status
    const paidChapters = new Set<number>();
    if (isPermanentlyOwned) {
      CHAPTERS.forEach(c => paidChapters.add(c.id));
    } else {
      await Promise.all(CHAPTERS.map(async (c) => {
        const hasPaid = await hasPurchasedPdfChapter(adminClient, user?.email || "", c.id, true);
        if (hasPaid) paidChapters.add(c.id);
      }));
    }

    return (
      <>
        <Header active="Read" />
        <main>
          <div className="section-head">
            <span className="eyebrow">The Book, Reimagined</span>
            <h2>Read KILL BUSYness</h2>
            <p>
              Experience the complete book through beautifully rendered PDF pages. Purchase the full eBook or individual chapters, or enjoy free instant reading via Temporary Access.
            </p>
          </div>

          {/* ── Full eBook ── */}
          <div className="card" style={{ marginBottom: 40, overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span className="eyebrow">Complete eBook</span>
                <h3 style={{ margin: "6px 0 4px", fontSize: "1.35rem" }}>KILL BUSYness — Full eBook</h3>
                <p style={{ margin: 0, color: "#475569", fontSize: "0.92rem" }}>
                  The complete 154-page book. Available with full online reader.
                </p>
              </div>

              {isPermanentlyOwned ? (
                <span className="chip level" style={{ flexShrink: 0 }}>Owned &middot; Lifetime Access</span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
                  <div style={{ textAlign: "right", lineHeight: 1.3 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}>Rs. 999</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>2000 Credits</div>
                  </div>
                  <a 
                    href="/buy?format=ebook" 
                    className="btn" 
                    style={{ background: "#0369a1", color: "#fff", border: "none", fontWeight: 600, padding: "8px 18px", textDecoration: "none" }}
                  >
                    BUY eBook — Rs. 999
                  </a>
                  <a 
                    href="#reader-container" 
                    className="btn" 
                    style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #86efac", fontWeight: 600, padding: "8px 18px", textDecoration: "none" }}
                  >
                    Temp. Access (Free) ➔
                  </a>
                </div>
              )}
            </div>

            {/* eBook Reader container accessible directly via Temp Access or Paid */}
            <div id="reader-container" style={{ height: "82vh", background: "#e2e8f0", borderTop: "1px solid #cbd5e1" }}>
              <EBookReader totalPages={154} />
            </div>
          </div>

          {/* ── Chapter by Chapter ── */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: 4 }}>Read Chapter by Chapter</h3>
            <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0 }}>
              Each chapter is available for individual purchase (Rs. 100) or immediate reading via Temporary Access.
            </p>
          </div>

          <div className="grid cols-3">
            {CHAPTERS.map((c) => {
              const isPaid = paidChapters.has(c.id);
              return (
                <div key={c.id} className="card chapter-card" style={{ display: "flex", flexDirection: "column" }}>
                  <Link href={`/read/${c.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <div className="chapter-num">{c.num} &middot; {c.roar.toUpperCase()}</div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 6 }}>{c.title}</h3>
                    <p className="desc" style={{ marginTop: 0 }}>{c.desc}</p>
                  </Link>

                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                    {isPaid ? (
                      <Link href={`/read/${c.id}`} className="btn btn-sm btn-outline" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                        Read Chapter (Owned)
                      </Link>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#64748b" }}>
                          <span>Price: <strong style={{ color: "#0f172a" }}>Rs. 100</strong> / 200 Cr</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <a 
                            href={`/buy?format=pdf_chapter_${c.id}`} 
                            className="btn btn-sm" 
                            style={{ flex: 1, justifyContent: "center", background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: 600, padding: "7px 8px", fontSize: "0.82rem", textAlign: "center" }}
                          >
                            BUY &middot; Rs. 100
                          </a>
                          <Link 
                            href={`/read/${c.id}`} 
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
        <h2>SERVER ERROR DETECTED</h2>
        <p><strong>Message:</strong> {err.message}</p>
        <p><strong>Stack:</strong> {err.stack}</p>
      </div>
    );
  }
}
