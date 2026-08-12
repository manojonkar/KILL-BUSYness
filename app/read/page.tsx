import Link from "next/link";
import Header from "@/components/Header";
import { CHAPTERS } from "@/lib/chapters";
import { createClient } from "@/lib/supabase/server";
import { getChapterReads } from "@/lib/gamification";

export default async function ReadLibraryPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const readIds = user ? await getChapterReads(supabase, user.id) : new Set<number>();

  return (
    <>
      <Header active="Read" />
      <main>
        <div className="section-head">
          <span className="eyebrow">The Book, Reimagined</span>
          <h2>Read KILL BUSYness — one chapter at a time.</h2>
          <p>
            Every chapter as a complete, detailed summary — grounded in the ROAR model: Reflect, Own, Assert, Run. Read,
            listen (~5 min narration), then save a private reflection as you go.
          </p>
        </div>
        <div className="grid cols-3">
          {CHAPTERS.map((c) => {
            const done = readIds.has(c.id);
            return (
              <Link key={c.id} href={`/read/${c.id}`} className="card chapter-card">
                <div className="chapter-num">
                  {c.num} · {c.roar.toUpperCase()}
                </div>
                <h3>{c.title}</h3>
                <span className="roar-tag">ROAR · {c.roar}</span>
                <p className="desc">{c.desc}</p>
                <div className="chapter-foot">
                  <span>Detailed summary · ~5 min</span>
                  <span>{done ? "✓ Read" : "Not started"}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="disclaimer">
          🔒 This portal is for your personal use as part of the KILL BUSYness Organization Audit programme.
        </div>
      </main>
    </>
  );
}
