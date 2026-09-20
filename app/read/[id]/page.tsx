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
  
  let isUnlocked = false;
  let canWatchVideo = !!chapter.isAudioPublic;
  if (user) {
    const boughtAny = await hasPurchasedAnyBook(adminClient, user.email || "");
    if (boughtAny) isUnlocked = true;
    if (!isUnlocked) {
      isUnlocked = await hasPurchasedPdfChapter(adminClient, user.email || "", chapter.id);
    }
    if (!isUnlocked) {
      isUnlocked = await isChapterUnlocked(supabase, user.id, chapter.id);
    }

    if (!canWatchVideo) {
      canWatchVideo = await hasPurchasedAudioBook(adminClient, user.email || "", chapter.id);
    }
    if (!canWatchVideo) {
      canWatchVideo = await hasRedeemedFullAudioBook(supabase, user.id) || await hasRedeemedAudioChapter(supabase, user.id, chapter.id);
    }
  }

  let totalPages = 0;
  if (isUnlocked) {
    try {
      const metaPath = path.join(process.cwd(), "public/files/chapter_pages/metadata.json");
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      totalPages = meta[chapter.id.toString()] || 0;
    } catch(e) {}
  }

  let reflectionBody = "";
  let readIds = new Set<number>();
  if (user) {
    readIds = await getChapterReads(supabase, user.id);
  }

  if (user && isUnlocked) {
    await markChapterRead(supabase, chapter.id);
    await evaluateBadges(supabase, user.id);
    reflectionBody = await getReflection(supabase, user.id, chapter.id);
    readIds.add(chapter.id); // optimistically update local set
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
        <div className="card" style={{ padding: "30px 32px" }}>
          <span className="eyebrow">Chapter {chapter.num} &middot; ROAR: {chapter.roar}</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 14 }}>{chapter.title}</h3>
          
          {isUnlocked ? (
            <div style={{ background: "#e2e8f0", padding: "20px 0", borderRadius: 8, marginTop: 24 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <img key={i} src={`/files/chapter_pages/${chapter.id}/page_${i}.jpg`} style={{ width: "100%", maxWidth: 800, margin: "0 auto 16px auto", height: "auto", display: "block" }}  />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 24, padding: 24, background: "#f8fafc", borderRadius: 8, textAlign: "center", border: "1px solid #e2e8f0" }}>
              <h4 style={{ marginBottom: 12 }}>Unlock Full Chapter</h4>
              <p style={{ marginBottom: 20, fontSize: "0.95rem", color: "#475569" }}>
                Purchase the eBook or this specific PDF chapter to unlock the text.
              </p>
              <div style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "right", lineHeight: 1.4 }}>Rs. 999<br/>2000 Credits</span>
                  <a href="/buy?format=ebook" className="btn btn-sm" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600 }}>Read Full eBook</a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "right", lineHeight: 1.4 }}>Rs. 100<br/>200 Credits</span>
                  <a href={`/buy?format=pdf_chapter_${chapter.id}`} className="btn btn-sm" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600 }}>Read Chapter {chapter.num}</a>
                </div>
              </div>
            </div>
          )}
          
          {canWatchVideo && chapter.videoId ? (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Watch Chapter</h4>
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
          ) : !canWatchVideo ? (
            <div style={{ marginTop: 24, padding: 24, background: "#f8fafc", borderRadius: 8, textAlign: "center", border: "1px solid #e2e8f0" }}>
              <h4 style={{ marginBottom: 12 }}>Watch Video Chapter</h4>
              <p style={{ marginBottom: 20, fontSize: "0.95rem", color: "#475569" }}>
                Purchase the AudioBook or this specific Audio Chapter to unlock the video version.
              </p>
              <div style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "right", lineHeight: 1.4 }}>Rs. 999<br/>2000 Credits</span>
                  <a href="/buy?format=audiobook" className="btn btn-sm" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600 }}>Read Full AudioBook</a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "right", lineHeight: 1.4 }}>Rs. 100<br/>200 Credits</span>
                  <a href={`/buy?format=audio_chapter_${chapter.id}`} className="btn btn-sm" style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontWeight: 600 }}>Read Chapter {chapter.num}</a>
                </div>
              </div>
            </div>
          ) : null}

          {isUnlocked && (
            <>
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
            </>
          )}
        </div>
      </main>
    </>
  );
}
