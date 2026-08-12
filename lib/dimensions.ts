
export type Polarity = "health" | "dysfunction";

export interface DimQuestion {
  t: string;
  p: Polarity;
}

export interface Dimension {
  key: string;
  label: string;
  chapter: number;
  chapterTitle: string;
  qs: DimQuestion[];
}

export const DIMENSIONS: Dimension[] = [
 {key:"workload", label:"BUSYness & Workload Pressure", chapter:1, chapterTitle:"The BUSYness Mirror",
  qs:[
    {t:"Our workload is sustainable \u2014 people are not routinely overworked.", p:"health"},
    {t:"Our workload stays manageable rather than steadily increasing.", p:"health"},
    {t:"Our stress levels stay healthy rather than steadily rising.", p:"health"}
  ]},
 {key:"purpose", label:"Purpose", chapter:2, chapterTitle:"Purpose",
  qs:[
    {t:"We have a clearly articulated purpose for the organization.", p:"health"},
    {t:"Everyone in our organization knows our purpose.", p:"health"},
    {t:"We live our purpose on a day-to-day basis.", p:"health"},
    {t:"Our purpose influences our decisions and actions.", p:"health"}
  ]},
 {key:"strategy", label:"Strategy", chapter:3, chapterTitle:"Strategy",
  qs:[
    {t:"We have a clearly articulated strategy that all our leadership team are aligned to.", p:"health"},
    {t:"We know our target customer segment and we are all aligned on that.", p:"health"},
    {t:"We know what needs of our target customer segment we are focusing on.", p:"health"},
    {t:"We are committed to being unique in the eyes of our customers.", p:"health"},
    {t:"We are all aligned on how we are going to be unique in the eyes of our customers.", p:"health"}
  ]},
 {key:"competency", label:"Competency Chain", chapter:4, chapterTitle:"The Competency Chain",
  qs:[
    {t:"We hire the right candidate for the role, rather than settling for who's available.", p:"health"},
    {t:"New hires and team members get real, sufficient training before they're expected to perform.", p:"health"},
    {t:"We promote people into leadership based on leadership ability, not just individual performance.", p:"health"},
    {t:"We win business that is genuinely profitable, not just high in volume.", p:"health"},
    {t:"We deliver reliably enough that our best clients have no reason to look for backup suppliers.", p:"health"},
    {t:"Our brand reflects consistent quality, rather than \"good people, but you have to manage them.\"", p:"health"},
    {t:"We are building the capabilities we'll need tomorrow, today.", p:"health"}
  ]},
 {key:"reflection", label:"Reflection & Learning", chapter:5, chapterTitle:"Reflection",
  qs:[
    {t:"Our leadership team pauses to question its own assumptions, not just review results.", p:"health"},
    {t:"We are actively building \"Version 2.0\" of this business, with protected time, rather than just running Version 1.0 harder.", p:"health"},
    {t:"We seek out uncomfortable truths about the business rather than avoiding them through more activity.", p:"health"}
  ]},
 {key:"ownership", label:"Ownership", chapter:6, chapterTitle:"Ownership",
  qs:[
    {t:"Work moves forward through commitment and initiative, rather than reminders and follow-ups.", p:"health"},
    {t:"When something is agreed, it happens without anyone needing to chase it.", p:"health"},
    {t:"People here take responsibility for outcomes rather than explaining why it wasn't their part.", p:"health"}
  ]},
 {key:"leadership", label:"Leadership", chapter:7, chapterTitle:"Leadership Creates",
  qs:[
    {t:"Our leaders are actively creating a new future, not just managing today's reality.", p:"health"},
    {t:"Leadership here is distributed — many people lead change, not just the person at the top.", p:"health"}
  ]},
 {key:"standards", label:"Standards", chapter:8, chapterTitle:"Assert the Standard",
  qs:[
    {t:"Our leaders' actions actually match their stated standards, especially under pressure.", p:"health"},
    {t:"We hold every function to world-class practice, rather than \"good enough for our size.\"", p:"health"},
    {t:"Departments here operate as one team, rather than protecting their own turf.", p:"health"},
    {t:"We treat our people as a source of value to invest in, rather than a resource to deploy.", p:"health"}
  ]},
 {key:"execution", label:"Execution & Build", chapter:9, chapterTitle:"Build",
  qs:[
    {t:"We have a clear, phased plan for our most important transformation, not just good intentions.", p:"health"},
    {t:"We protect real time on our leaders' calendars for this work, rather than letting business-as-usual reclaim it.", p:"health"},
    {t:"We test our assumptions about customers and strategy against real data and real conversations, not conference-room guesses.", p:"health"},
    {t:"We have redesigned our structure and performance/reward systems to actually fit our strategy, rather than leaving the old ones in place.", p:"health"},
    {t:"Our standards and processes hold up even when a specific leader isn't in the room to enforce them.", p:"health"},
    {t:"We can point to measurable progress in the last 90 days on what matters most.", p:"health"}
  ]},
 {key:"sustain", label:"Sustaining Greatness", chapter:10, chapterTitle:"Sustaining Greatness",
  qs:[
    {t:"We treat our current success as a foundation for the next level, rather than an achievement to protect.", p:"health"},
    {t:"Our high performance would survive the departure of any single senior leader.", p:"health"},
    {t:"We keep our reflection and renewal discipline rigorous even as success grows, rather than letting it fade.", p:"health"}
  ]}
];

export const TOTAL_QUESTIONS = DIMENSIONS.reduce((a, d) => a + d.qs.length, 0);

export const FLAT_QUESTIONS: { dimKey: string; qIndexInDim: number; t: string; p: Polarity }[] =
  DIMENSIONS.flatMap((d) => d.qs.map((q, qIndexInDim) => ({ dimKey: d.key, qIndexInDim, t: q.t, p: q.p })));
