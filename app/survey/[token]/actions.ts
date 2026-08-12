"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitAnswer(token: string, questionIndex: number, answer: number) {
  const supabase = createClient();
  await supabase.rpc("submit_survey_answer", { p_token: token, p_question_index: questionIndex, p_answer: answer });
  revalidatePath(`/survey/${token}`);
}

export async function completeSurvey(token: string) {
  const supabase = createClient();
  await supabase.rpc("complete_survey", { p_token: token });
  revalidatePath(`/survey/${token}`);
}
