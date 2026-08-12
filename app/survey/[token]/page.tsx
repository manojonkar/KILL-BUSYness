import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SurveyClient from "./SurveyClient";
import { createClient } from "@/lib/supabase/server";

export default async function SurveyPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_survey_state", { p_token: params.token });
  const state = data?.[0];
  if (error || !state) notFound();

  if (state.status === "completed") {
    return (
      <>
        <Header active="" />
        <main>
          <div className="empty-state card">
            <div className="ic">✅</div>
            <h3>Thanks, {state.participant_name} — you&apos;re done.</h3>
            <p>Your survey for {state.company_name} has been submitted. Your company&apos;s admin will see the results in their report.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header active="" />
      <main>
        <div className="section-head">
          <span className="eyebrow">Organization Audit</span>
          <h2>{state.company_name} — BUSYness Index Survey</h2>
          <p>Answer honestly — this is confidential and only feeds into your organization&apos;s aggregate report.</p>
        </div>
        <SurveyClient token={params.token} initialAnswers={state.answers || {}} participantName={state.participant_name} companyName={state.company_name} />
      </main>
    </>
  );
}
