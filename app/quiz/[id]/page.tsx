import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { CHAPTERS } from "@/lib/chapters";
import { QUIZZES } from "@/lib/quizzes";
import { getQuizScore } from "@/lib/gamification";
import QuizClient from "./QuizClient";

export default async function QuizPage({ params }: { params: { id: string } }) {
  const chapterId = parseInt(params.id, 10);
  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  const quiz = QUIZZES[chapterId];
  
  if (!chapter) {
    return <div>Chapter not found</div>;
  }
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  let maxScore = 0;
  if (user) {
    maxScore = await getQuizScore(supabase, user.id, chapterId);
  }
  
  return (
    <>
      <Header active="Read Chapters" />
      <main>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p className="crumb" style={{ margin: 0 }}><a href={`/read/${chapterId}`}>← Back to Chapter</a></p>
        </div>
        
        <div className="card" style={{ padding: "30px 32px" }}>
          <span className="eyebrow">Chapter {chapter.num} Quiz</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 8 }}>{chapter.title}</h3>
          
          {quiz ? (
             <QuizClient quiz={quiz} maxScore={maxScore} chapterId={chapterId} />
          ) : (
            <p style={{ marginTop: 20 }}>This quiz is still being validated. Check back soon!</p>
          )}
        </div>
      </main>
    </>
  );
}
