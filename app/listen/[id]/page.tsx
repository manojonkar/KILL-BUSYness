import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import AntiCopy from "@/components/AntiCopy";
import Link from "next/link";
import { CHAPTERS } from "@/lib/chapters";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasRedeemedAudioChapter, hasRedeemedFullAudioBook } from "@/lib/gamification";
import { hasPurchasedAudioBook } from "@/lib/book";

export default async function ListenChapterPage({ params }: { params: { id: string } }) {
  const chapterId = parseInt(params.id, 10);
  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) notFound();

  const supabase = createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  let canListen = !!chapter.isAudioPublic;
  if (user && !canListen) {
    canListen = await hasPurchasedAudioBook(adminClient, user.email || "", chapter.id)
             || await hasRedeemedFullAudioBook(supabase, user.id)
             || await hasRedeemedAudioChapter(supabase, user.id, chapter.id);
  }

  // Redirect non-purchasers directly to the buy page for this chapter
  if (!canListen) {
    redirect(`/buy?format=audio_chapter_${chapter.id}`);
  }

  const idx = CHAPTERS.findIndex((c) => c.id === chapterId);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;

  return (
    <>
      <AntiCopy />
      <Header active="Listen" />
      <main>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p className="crumb" style={{ margin: 0 }}>
            <Link href="/listen">&larr; All Audio Chapters</Link>
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {prev && <Link href={`/listen/${prev.id}`} className="btn btn-sm btn-outline">&larr; Prev</Link>}
            {next && <Link href={`/listen/${next.id}`} className="btn btn-sm btn-outline">Next &rarr;</Link>}
          </div>
        </div>

        <div className="card" style={{ padding: "30px 32px" }}>
          <span className="eyebrow">Chapter {chapter.num} &middot; ROAR: {chapter.roar}</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 14 }}>{chapter.title}</h3>

          {chapter.videoId ? (
            <div style={{ marginTop: 24, borderRadius: 12, overflow: "hidden", background: "#000", position: "relative", paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${chapter.videoId}?rel=0&modestbranding=1&cc_load_policy=0&iv_load_policy=3`}
                title={`${chapter.title} - Audio Chapter`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          ) : (
            <div style={{ marginTop: 24, padding: 24, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, color: "#475569" }}>Audio not available for this chapter.</p>
            </div>
          )}

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "2px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: 24, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>Chapter Quiz</h4>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>Test your knowledge and earn up to 100 MI Credits!</p>
              </div>
              <a href={`/quiz/${chapter.id}`} className="btn" style={{ background: "#0f766e", color: "white" }}>
                Take Chapter Quiz
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
