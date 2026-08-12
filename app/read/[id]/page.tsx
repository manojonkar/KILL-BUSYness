import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ListenPlayer from "@/components/ListenPlayer";
import ReflectBox from "./ReflectBox";
import { saveReflectionAction } from "./actions";
import { CHAPTERS } from "@/lib/chapters";
import { getChapterSummary } from "@/lib/chapterText";
import { createClient } from "@/lib/supabase/server";
import { markChapterRead, getReflection, evaluateBadges } from "@/lib/gamification";

export default async function ChapterPage({ params }: { params: { id: string } }) {
  const chapterId = parseInt(params.id, 10);
  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) notFound();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const summary = await getChapterSummary(supabase, chapter.id);
  let reflectionBody = "";
  if (user) {
    await markChapterRead(supabase, chapter.id);
    await evaluateBadges(supabase, user.id);
    reflectionBody = await getReflection(supabase, user.id, chapter.id);
  }
  const boundSave = saveReflectionAction.bind(null, chapter.id);
  return (
    <>
      <Header active="Read" />
      <main>
        <p className="crumb"><a href="/read">← All Chapters</a></p>
        <div className="card" style={{ padding: "30px 32px" }}>
          <span className="eyebrow">Chapter {chapter.num} · ROAR: {chapter.roar}</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 14 }}>{chapter.title}</h3>
          <p className="body-text" style={{ whiteSpace: "pre-line" }}>{summary}</p>
          <div style={{ marginTop: 20 }}><ListenPlayer title={chapter.title} summary={summary} /></div>
          <ReflectBox prompt={chapter.reflect} initialBody={reflectionBody} loggedIn={!!user} action={boundSave} />
        </div>
      </main>
    </>
  );
}
