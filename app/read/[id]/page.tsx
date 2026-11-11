import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import AntiCopy from "@/components/AntiCopy";
import ReflectBox from "./ReflectBox";
import { saveReflectionAction } from "./actions";
import { CHAPTERS } from "@/lib/chapters";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { markChapterRead, getReflection, evaluateBadges, isChapterUnlocked, getChapterReads, hasRedeemedAudioChapter, hasRedeemedFullAudioBook } from "@/lib/gamification";
import { hasPurchasedAnyBook, hasPurchasedAudioBook, hasPurchasedPdfChapter } from "@/lib/book";
import fs from "fs";
import path from "path";

export default async function ChapterPage({ params }: { params: { id: string } }) {
  const chapterId = parseInt(params.id, 10);
  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) notFound();
  const supabase = createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Temporary open access allows viewing immediately
  const isUnlocked = true;
  const canWatchVideo = true;

  // Real purchase check to show permanent ownership vs temporary access banner
  const hasPaidBook = await hasPurchasedAnyBook(adminClient, user?.email || "", true);
  const hasPaidChapter = hasPaidBook || await hasPurchasedPdfChapter(adminClient, user?.email || "", chapter.id, true);
  const hasPaidAudio = hasPaidBook || await hasPurchasedAudioBook(adminClient, user?.email || "", chapter.id, true);

  let totalPages = 0;
  try {
    const metaPath = path.join(process.cwd(), "public/files/chapter_pages/metadata.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    totalPages = meta[chapter.id.toString()] || 0;
  } catch(e) {}

  let reflectionBody = "";
  let readIds = new Set<number>();
  if (user) {
    readIds = await getChapterReads(supabase, user.id);
  }

  if (user) {
    await markChapterRead(supabase, chapter.id);
    await evaluateBadges(supabase, user.id);
    reflectionBody = await getReflection(supabase, user.id, chapter.id);
    readIds.add(chapter.id);
  }
  const boundSave = saveReflectionAction.bind(null, chapter.id);

  return (
    <>
      <AntiCopy />
      <Header active="Read" />
      <main>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p className="crumb" style={{ margin: 0 }}><a href="/read">&larr; All Chapters</a></p>
          {user && (
            <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                <span>Completion</span>
                <span>{Math.round((readIds.size / CHAPTERS.length) * 100)}%</span>
              </div>
              <div style={{ width: "100%", height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#0f766e", width: `${(readIds.size / CHAPTERS.length) * 100}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Temporary Access & Buy Bar */}
        <div style={{
          marginBottom: 20,
          padding: "14px 20px",
          background: hasPaidChapter ? "#f8fafc" : "#f0fdf4",
          border: hasPaidChapter ? "1px solid #cbd5e1" : "1px solid #86efac",
          borderRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div>
            {hasPaidChapter ? (
              <span style={{ color: "#0369a1", fontWeight: 600, fontSize: "0.92rem" }}>
                ✓ You own lifetime access to this chapter
              </span>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="chip" style={{ background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: "0.75rem" }}>
                  Temp. Access Active
                </span>
                <span style={{ color: "#166534", fontSize: "0.9rem" }}>
                  You are viewing this chapter with free open access.
                </span>
              </div>
            )}
          </div>
          {!hasPaidChapter && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                Own permanently:
              </span>
              <a
                href={`/buy?format=pdf_chapter_${chapter.id}`}
                className="btn btn-sm"
                style={{ background: "#0369a1", color: "#fff", border: "none", fontWeight: 600, padding: "6px 14px", textDecoration: "none" }}
              >
                BUY Chapter &middot; Rs. 100
              </a>
              <a
                href="/buy?format=ebook"
                className="btn btn-sm"
                style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: 600, padding: "6px 14px", textDecoration: "none" }}
              >
                BUY Full eBook &middot; Rs. 999
              </a>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: "30px 32px" }}>
          <span className="eyebrow">Chapter {chapter.num} &middot; ROAR: {chapter.roar}</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 14 }}>{chapter.title}</h3>
          
          <div style={{ background: "#e2e8f0", padding: "20px 0", borderRadius: 8, marginTop: 24 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <img key={i} src={`/files/chapter_pages/${chapter.id}/page_${i}.jpg`} style={{ width: "100%", maxWidth: 800, margin: "0 auto 16px auto", height: "auto", display: "block" }}  />
            ))}
          </div>

          {chapter.videoId && (
            <div style={{ marginTop: 32, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <h4 style={{ margin: 0 }}>Watch Video Chapter</h4>
                {!hasPaidAudio && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Own video/audio:</span>
                    <a href={`/buy?format=audio_chapter_${chapter.id}`} className="btn btn-sm" style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: 600, padding: "4px 10px", fontSize: "0.8rem" }}>
                      BUY Audio Ch. &middot; Rs. 100
                    </a>
                  </div>
                )}
              </div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8 }}>
                <iframe
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  src={`https://www.youtube.com/embed/${chapter.videoId}?rel=0&cc_load_policy=0&iv_load_policy=3`}
                  title={`Chapter ${chapter.num} Video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <ReflectBox prompt={chapter.reflect} initialBody={reflectionBody} loggedIn={!!user} action={boundSave} />
          
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
