import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ListenPlayer from "@/components/ListenPlayer";
import AntiCopy from "@/components/AntiCopy";
import ReflectBox from "./ReflectBox";
import { saveReflectionAction } from "./actions";
import { CHAPTERS } from "@/lib/chapters";
import { getChapterSummary } from "@/lib/chapterText";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      <AntiCopy />
      <Header active="Read" />
      <main>
        <p className="crumb"><a href="/read">← All Chapters</a></p>
        <div className="card" style={{ padding: "30px 32px" }}>
          <span className="eyebrow">Chapter {chapter.num} · ROAR: {chapter.roar}</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 14 }}>{chapter.title}</h3>
          <div className="chapter-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            .chapter-markdown img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 16px 0;
              user-select: none;
              pointer-events: none;
              -webkit-user-drag: none;
            }
            .chapter-markdown table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            .chapter-markdown th, .chapter-markdown td {
              border: 1px solid #e2e8f0;
              padding: 8px 12px;
              text-align: left;
            }
            .chapter-markdown th {
              background: #f8fafc;
            }
            .chapter-markdown h1, .chapter-markdown h2, .chapter-markdown h3 {
              margin-top: 24px;
              margin-bottom: 12px;
            }
            .chapter-markdown p {
              margin-bottom: 16px;
              line-height: 1.6;
            }
            .chapter-markdown blockquote {
              border-left: 4px solid #D9A441;
              padding-left: 16px;
              color: #475569;
              font-style: italic;
              margin: 16px 0;
            }
          `}} />
          <div style={{ marginTop: 20 }}><ListenPlayer title={chapter.title} summary={summary} /></div>
          <ReflectBox prompt={chapter.reflect} initialBody={reflectionBody} loggedIn={!!user} action={boundSave} />
        </div>
      </main>
    </>
  );
}
