import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MI_LOGO, BOOK_COVER } from "@/lib/brand";
import { getProgress, levelFor, levelName } from "@/lib/gamification";

import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/home",            label: "Overview" },
  { href: "/read",            label: "Read" },
  { href: "/listen",          label: "Listen" },
  { href: "/resources",       label: "Resources" },
  { href: "/stories",         label: "Share Your Story" },
  { href: "/dashboard#audit", label: "Organization Audit" },
  { href: "/contact",         label: "Contact" },
];

export default async function Header({ active }: { active?: string }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const progress = user ? await getProgress(supabase, user.id) : null;

    return (
      <header>
        <div className="utilitybar">
          <div className="utilitybar-inner">
            <img className="mi-logo-img" alt="Management Innovations" src={MI_LOGO} />
            <Link href="/read" className="utilitybar-book">
              <img className="book-cover-thumb" alt="KILL BUSYness book cover" src={BOOK_COVER} />
            </Link>
          </div>
        </div>
        
        {/* ROW 1: ORIGINAL MAIN NAVIGATION (No inline overrides) */}
        <div className="topbar">
          <div className="topbar-inner">
            <nav className="nav">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={active === n.label ? "active" : ""}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* ROW 2: HUD / DASHBOARD COMPACT AREA */}
        <div style={{ backgroundColor: '#0f172a', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #1e293b', padding: '8px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div className="hud" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {user ? (
                <>
                  <Link href="/dashboard" style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#ffffff', backgroundColor: '#334155', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #475569' }}>
                    Dashboard
                  </Link>
                  <Link href="/rewards" className="chip credits" style={{ textDecoration: "none", padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '100px' }}>
                    XP: {progress?.xp || 0}
                  </Link>
                  <Link href="/rewards" className="chip level" style={{ textDecoration: "none", padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '100px' }}>
                    {levelName(progress?.xp || 0)}
                  </Link>
                  {(progress?.wallet ?? 0) > 0 && (
                    <Link href="/rewards" className="chip wallet" style={{ textDecoration: "none", padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#0E9C74', color: '#ffffff', borderRadius: '100px' }}>
                      {progress?.wallet} Credits
                    </Link>
                  )}
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login" style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#ffffff', backgroundColor: '#0E9C74', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  } catch (err: any) {
    return <div style={{ background: "red", color: "white", padding: 10 }}>HEADER ERROR: {err.message}</div>;
  }
}
