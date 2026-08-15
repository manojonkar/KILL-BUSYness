import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MI_LOGO, EMBLEM, BOOK_COVER } from "@/lib/brand";
import { getProgress, levelFor, levelName } from "@/lib/gamification";

const NAV: { href: string; label: string }[] = [
  { href: "/home", label: "Overview" },
  { href: "/read", label: "Read" },
  { href: "/stories", label: "Share Your Story" },
  { href: "/dashboard#audit", label: "Organization Audit" },
  { href: "/rewards", label: "Journey & Rewards" },
  { href: "/media", label: "Media Hub" },
  { href: "/contact", label: "Contact" }
];

export default async function Header({ active }: { active?: string }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const progress = user ? await getProgress(supabase, user.id) : null;

  return (
    <>
      <div className="utilitybar">
        <div className="utilitybar-inner">
          <img className="mi-logo-img" alt="Management Innovations — Vision to Implementation" src={MI_LOGO} />
          <Link href="/read" className="utilitybar-book">
            <img className="book-cover-thumb" alt="KILL BUSYness — the book, front cover" src={BOOK_COVER} />
          </Link>
        </div>
      </div>
      <div className="topbar">
        <div className="topbar-inner">
          <Link href="/home" className="brand">
            <img className="brand-mark" alt="KILL BUSYness" src={EMBLEM} style={{ width: 64, height: 64 }} />
            <span className="brand-text">
              KILL <span className="brand-busy">BUSY</span>ness
            </span>
          </Link>
          <div className="nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={active === n.label ? "active" : ""}>
                {n.label}
              </Link>
            ))}
          </div>
          <div className="hud" style={{ display: "flex", alignItems: "center", minWidth: "max-content" }}>
            {user && progress ? (
              <div style={{ textAlign: "right", lineHeight: 1.25 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--teal-ink, #0f766e)", marginBottom: 2 }}>
                  L{levelFor(progress.xp)} · {levelName(progress.xp)}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--ink-soft)", fontWeight: 500 }}>
                  ◆ {progress.wallet} MI Credits <span style={{ color: "#cbd5e1", margin: "0 4px" }}>•</span> Σ {progress.xp} Lifetime
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline btn-sm">
                  Log In
                </Link>
                <Link href="/register" className="btn btn-dark btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
