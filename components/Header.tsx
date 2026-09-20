import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MI_LOGO, BOOK_COVER } from "@/lib/brand";
import { getProgress, levelFor, levelName } from "@/lib/gamification";

import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/home",            label: "Overview" },
  { href: "/read",            label: "Read" },
  { href: "/listen",          label: "Listen" },
  { href: "/stories",         label: "Share Your Story" },
  { href: "/dashboard#audit", label: "Organization Audit" },
  { href: "/rewards",         label: "Journey & Rewards" },
  { href: "/contact",         label: "Contact" },
];

export default async function Header({ active }: { active?: string }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const progress = user ? await getProgress(supabase, user.id) : null;

    return (
      <>
        <div className="utilitybar">
          <div className="utilitybar-inner">
            <img className="mi-logo-img" alt="Management Innovations" src={MI_LOGO} />
            <Link href="/read" className="utilitybar-book">
              <img className="book-cover-thumb" alt="KILL BUSYness book cover" src={BOOK_COVER} />
            </Link>
          </div>
        </div>
        <div className="topbar">
          <div className="topbar-inner">
            <nav className="nav">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={active === n.label ? "active" : ""}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="hud">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn btn-sm btn-outline">
                    Dashboard
                  </Link>
                  <Link href="/rewards" className="chip credits" style={{ textDecoration: "none" }}>
                    ◆ {progress?.xp || 0}
                  </Link>
                  <Link href="/rewards" className="chip level" style={{ textDecoration: "none" }}>
                    {levelName(progress?.xp || 0)}
                  </Link>
                  {(progress?.wallet ?? 0) > 0 && (
                    <Link href="/rewards" className="chip wallet" style={{ textDecoration: "none" }}>
                      {progress?.wallet} Credits
                    </Link>
                  )}
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login" className="btn btn-sm btn-dark">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </>
    );
  } catch (err: any) {
    return <div style={{ background: "red", color: "white", padding: 10 }}>HEADER ERROR: {err.message}</div>;
  }
}
