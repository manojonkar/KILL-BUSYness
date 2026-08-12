import Header from "@/components/Header";
import ListenPlayer from "@/components/ListenPlayer";
import { CHAPTERS } from "@/lib/chapters";
import { getAllChapterSummaries } from "@/lib/chapterText";
import { createClient } from "@/lib/supabase/server";

export default async function MediaPage() {
  const supabase = createClient();
  const summaries = await getAllChapterSummaries(supabase);
  return (
    <>
      <Header active="Media Hub" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Media Hub</span>
          <h2>Listen to every chapter.</h2>
          <p>Each chapter&apos;s detailed summary, narrated live in your browser — about 5 minutes each.</p>
        </div>
        <div className="grid cols-3" style={{ marginBottom: 30 }}>
          {CHAPTERS.slice(1).map((c) => (
            <div className="card media-card" key={c.id}>
              <div className="media-body">
                <span className="eyebrow" style={{ marginBottom: 6 }}>Chapter {c.num} · {c.roar}</span>
                <h4>{c.title}</h4>
                <p style={{ marginBottom: 14 }}>Narrated · ~5 min</p>
                <ListenPlayer title={c.title} summary={summaries[c.id] || ""} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
