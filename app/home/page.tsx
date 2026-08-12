import Link from "next/link";
import Header from "@/components/Header";
import { BOOK_COVER } from "@/lib/brand";

export default function HomePage() {
  return (
    <>
      <Header active="Overview" />
      <main>
        <div className="hero-panel" style={{ padding: "34px 44px" }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 40, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 0 }}>
            <h1 style={{ fontSize: "clamp(1.05rem, 3.05vw, 2.3rem)", whiteSpace: "nowrap", margin: 0 }}>
              Build <em>High Performance</em> Organizations.
            </h1>
            <div className="hero-actions">
              <Link href="/read" className="btn btn-primary">
                Start Reading
              </Link>
              <Link href="/register" className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.35)" }}>
                Run Your Organization Audit
              </Link>
            </div>
            <div className="stat-row">
              <div>
                <strong>11</strong>
                <span>chapters</span>
              </div>
              <div>
                <strong>10</strong>
                <span>audit dimensions</span>
              </div>
              <div>
                <strong>8</strong>
                <span>badges to earn</span>
              </div>
              <div>
                <strong>4</strong>
                <span>ROAR phases</span>
              </div>
            </div>
          </div>
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
            <div style={{ background: "#fff", padding: 14, borderRadius: 12, boxShadow: "0 24px 60px -20px rgba(0,0,0,.5)" }}>
              <img
                src={BOOK_COVER}
                alt="KILL BUSYness — the book, front cover"
                style={{ width: 150, display: "block", borderRadius: 4 }}
              />
            </div>
            <Link href="/buy" className="btn btn-primary btn-sm" style={{ justifyContent: "center", background: "#fff", color: "var(--ink)", width: 178 }}>
              Buy the Book
            </Link>
          </div>
          </div>
        </div>

        <div className="grid cols-3">
          <div className="card mini-card">
            <span className="eyebrow">Read</span>
            <h3>Your reading journey</h3>
            <p>The book, told chapter by chapter across 11 chapters and 4 ROAR phases — read or listen, ~5 min each.</p>
            <Link href="/read" className="btn btn-dark btn-sm" style={{ marginTop: 12 }}>
              Open Chapters
            </Link>
          </div>
          <div className="card mini-card">
            <span className="eyebrow">Organization</span>
            <h3>Audit status</h3>
            <p>Register your company, invite your owner/CEO and leadership team, and get a full diagnostic report with an action plan.</p>
            <Link href="/register" className="btn btn-teal btn-sm" style={{ marginTop: 12 }}>
              Go to Audit
            </Link>
          </div>
          <div className="card mini-card">
            <span className="eyebrow">Wallet</span>
            <h3>MI Credits</h3>
            <p>Earn MI Credits by reading, reflecting, and completing your audit — redeem them for real Management Innovations services.</p>
            <Link href="/rewards" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
              Open Wallet
            </Link>
          </div>
        </div>

        <div className="quote-strip">
          <p>&ldquo;High Performance is Fulfilling the Purpose. Reliably. Ongoingly.&rdquo;</p>
          <span>Manoj Onkar — KILL BUSYness</span>
        </div>

        <div className="grid cols-4">
          <Link href="/read" className="card mini-card" style={{ cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📖</div>
            <h3 style={{ fontSize: "1rem" }}>Read</h3>
            <p>11 chapters, byte-size</p>
          </Link>
          <Link href="/dashboard#audit" className="card mini-card" style={{ cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📊</div>
            <h3 style={{ fontSize: "1rem" }}>Audit</h3>
            <p>Organization-wide BUSYness diagnostic</p>
          </Link>
          <Link href="/media" className="card mini-card" style={{ cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🎧</div>
            <h3 style={{ fontSize: "1rem" }}>Media Hub</h3>
            <p>Audio narration for every chapter</p>
          </Link>
          <Link href="/stories" className="card mini-card" style={{ cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🌟</div>
            <h3 style={{ fontSize: "1rem" }}>Share Your Story</h3>
            <p>Your transformation, in your words</p>
          </Link>
        </div>

        <div className="ribbon">
          <div className="logos">
            <span>Management Innovations</span>
            <span>·</span>
            <span>ODeX Extraordinary Organizations</span>
          </div>
          <div className="author">
            <strong>Manoj Onkar</strong>Founder, Management Innovations
          </div>
        </div>
      </main>
    </>
  );
}
