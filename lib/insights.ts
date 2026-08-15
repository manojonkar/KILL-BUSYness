/**
 * lib/insights.ts
 * All coaching-tone diagnostic content for the KILL BUSYness audit report.
 * Content is keyed by dimension key × score band (high/mid/low).
 */

export interface DimInsight {
  whatItMeans: string;
  symptom: string;
  oneMove: string;
}

export interface DimInsights {
  high: DimInsight;
  mid: DimInsight;
  low: DimInsight;
  strengthNote: string; // shown when this is a top-2 strength
}

export const DIMENSION_INSIGHTS: Record<string, DimInsights> = {

  workload: {
    strengthNote: "A sustainable workload is the invisible foundation everything else rests on. When people are not chronically overloaded, they can think clearly, take initiative and care about quality. This result tells you that foundation is solid — protect it deliberately as growth pressure builds.",
    high: {
      whatItMeans: "Your workload is genuinely sustainable — and that is rarer than it sounds. Most growing organizations quietly normalize overload until it becomes invisible. The fact that yours hasn't means your people have the headspace to do their best work.",
      symptom: "You're likely seeing people who can take initiative, think beyond their immediate task and stay engaged over time — all signs of a healthy system.",
      oneMove: "Keep this by making workload a standing agenda item in leadership — not to report on busyness, but to actively question whether you're adding work faster than you're removing it."
    },
    mid: {
      whatItMeans: "There are real signs of pressure in the system, even if it doesn't feel critical yet. Sustainable and stretched are separated by smaller margins than most leaders realize — and stretched has a way of becoming the default without anyone deciding it should.",
      symptom: "You may be seeing people who are performing well in short bursts but running a little too hot — good delivery, but less capacity for creative thinking or owning problems beyond their own role.",
      oneMove: "Identify the top three things consuming disproportionate energy right now. Question whether each is genuinely essential, or whether it's a legacy commitment that's never been examined."
    },
    low: {
      whatItMeans: "This score is telling you that your system is under real pressure. Chronic overload doesn't just make people tired — it narrows thinking, reduces initiative and gradually crowds out everything that isn't urgent. The work still gets done, but the quality of decision-making quietly declines.",
      symptom: "In overloaded organizations, leaders spend most of their time in reactive mode, meetings multiply, accountability suffers (because everyone is too busy to follow through), and strategic work keeps getting pushed to 'next quarter.'",
      oneMove: "Before adding any new initiative, conduct a stop-doing audit with your leadership team: list every recurring meeting, process and project, and remove or reduce at least 20%. Capacity for what matters most cannot be created without first subtracting."
    }
  },

  purpose: {
    strengthNote: "A clearly lived purpose is one of the most powerful competitive advantages an organization can have — and one of the hardest to build. The fact that your people feel it on a day-to-day basis means decisions get made faster and better, and motivation runs deeper than incentives.",
    high: {
      whatItMeans: "Purpose is alive in your organization — not just on a wall, but in the decisions people make every day. This is a genuine strength and a source of energy that keeps performing organizations ahead of purely transactional ones.",
      symptom: "People probably use 'why we do this' in conversations naturally, not just in formal settings — which means it's real.",
      oneMove: "The risk with strong purpose is that it can drift subtly during periods of growth. Schedule a purpose review once a year — not to change it, but to ask: 'Is every major decision we made this year consistent with this?'"
    },
    mid: {
      whatItMeans: "Your purpose exists, but it hasn't fully landed in the day-to-day reality of the organization. There's a gap between the articulated purpose and what actually drives decisions — which means it's doing less work for you than it could.",
      symptom: "You may find that purpose language appears in formal settings (pitch decks, onboarding) but rarely comes up naturally when decisions are being made or problems are being solved.",
      oneMove: "Start every leadership meeting for the next quarter by asking: 'Does this agenda item move us toward our purpose, or are we drifting?' That single question, consistently applied, does more to embed purpose than any communication campaign."
    },
    low: {
      whatItMeans: "A low purpose score doesn't mean your organization is directionless — it means the direction isn't translating into day-to-day clarity. When purpose is missing or unclear, people default to effort and activity rather than meaning and impact. That's a significant energy leak.",
      symptom: "In lower-purpose organizations, talented people often feel like they're doing jobs rather than building something. Turnover tends to be higher, motivation more variable, and strategic alignment harder to achieve.",
      oneMove: "Before writing a new purpose statement, hold a single session with your leadership team answering this: 'What would be genuinely lost in the world if we closed tomorrow?' The answer to that question is your purpose — it doesn't need to be invented, it needs to be surfaced and spoken."
    }
  },

  strategy: {
    strengthNote: "Strategic alignment at this level means your leadership team is pulling in the same direction — and that is a real competitive advantage. When everyone knows what you're trying to be for which customers, decisions get made faster and trade-offs get resolved without escalation.",
    high: {
      whatItMeans: "Your strategy is clear and genuinely shared. That means your leadership team can make independent decisions that are consistent with each other — one of the most powerful efficiency gains an organization can achieve.",
      symptom: "You're probably finding that cross-functional collaboration is easier than in comparable organizations, and that 'who should own this?' questions get resolved faster.",
      oneMove: "Test the alignment once a year by asking each leader independently: 'Who is our target customer, and what are we uniquely offering them?' The answers should be nearly identical. If they're diverging, the strategy needs re-articulation, not a new strategy."
    },
    mid: {
      whatItMeans: "There is a strategy, but the alignment isn't complete. Some leaders are running on slightly different assumptions about who you're serving and what makes you different — which means strategic energy is being diluted.",
      symptom: "You may see this in recurring disagreements about priorities, difficulty saying no to opportunities, and a tendency to do more things rather than do fewer things better.",
      oneMove: "Host a half-day strategy alignment session with one agenda item: 'If we could only serve one customer type and be famous for one thing, what would they be?' Don't move to action until you have genuine agreement, not just polite consensus."
    },
    low: {
      whatItMeans: "A low strategy score is one of the most important signals in this report — because everything else in an organization depends on a shared understanding of direction. Without it, even talented teams pull against each other without realizing it.",
      symptom: "In low-strategy organizations, you typically see: lots of activity, unclear prioritization, difficulty turning down opportunities, leaders solving the same problems in different ways, and a sense of being busy without clear progress.",
      oneMove: "Clear strategy starts with a clear customer. Get your leadership team in a room and answer just three questions: Who specifically are we serving? What specifically do they need from us? What would make us their only real choice? Lock the answers down before doing anything else."
    }
  },

  competency: {
    strengthNote: "The Competency Chain is one of the most complex things to get right — it spans hiring, training, promotion, delivery and brand. A strong score here means you're building an organization that can perform consistently, not just occasionally. That reliability is what earns lasting client relationships.",
    high: {
      whatItMeans: "Your competency chain is functioning well — the right people are getting into roles, getting equipped, and delivering consistently. This is harder to achieve than it looks, and it compounds: great people attract more great people.",
      symptom: "You're likely seeing delivery that clients trust predictably, relatively smooth onboarding, and promotions that tend to work out.",
      oneMove: "The main risk in a strong competency chain is complacency. Build tomorrow's capabilities today by running a quarterly question with your leadership team: 'What will our best clients need from us in two years that we can't currently deliver?'"
    },
    mid: {
      whatItMeans: "Parts of your competency chain are working well, but there are gaps that are quietly costing you. Whether it's in hiring, training, promotion decisions or delivery consistency — the chain is only as strong as its weakest link.",
      symptom: "This often shows up as inconsistent client experiences, leaders who are great technically but struggle with their teams, or new hires who take longer to become effective than they should.",
      oneMove: "Map your competency chain from hiring to delivery and identify the single link that is most frequently breaking. Fix that one link before working on the others — chain improvements only stick when you start at the point of failure."
    },
    low: {
      whatItMeans: "A low score here is a meaningful signal that the organization is working harder than it needs to, because the system for building and deploying capability isn't fully working. This isn't about the quality of your people — it's about the system they're operating in.",
      symptom: "You may be seeing: high performers compensating for underperformers, promotions that don't stick, client relationships that depend on specific individuals rather than the organization, or training that happens informally (or not at all).",
      oneMove: "Start with the promotion question: 'Are we promoting people into leadership because they're great leaders, or because they're great at the individual job?' Getting this one decision right has a multiplier effect on everything else in the chain."
    }
  },

  reflection: {
    strengthNote: "An organization that pauses to question its own assumptions — not just review its results — is building something that lasts. Most organizations optimize Version 1.0 indefinitely. Yours is actively working on Version 2.0. That is a genuine competitive advantage that compounds over time.",
    high: {
      whatItMeans: "Your leadership team has built the discipline of stepping back from the business to look at it clearly. This is rarer than it should be, and it's what separates organizations that improve deliberately from ones that improve only when forced to.",
      symptom: "You're probably seeing strategic conversations that are genuinely challenging, not just validating — and leaders who are comfortable surfacing uncomfortable truths.",
      oneMove: "Protect the reflection time aggressively. As the organization grows, operational pressure will always try to reclaim it. Make a rule: this time is non-negotiable, even (especially) when things are busy."
    },
    mid: {
      whatItMeans: "There's some reflection happening, but it's not yet a reliable discipline. Reflection is probably reactive rather than scheduled — triggered by problems rather than built into the rhythm of leadership.",
      symptom: "You may find that strategic thinking gets crowded out by operational demands, that leaders are always meaning to have a deeper conversation about direction 'once things settle down,' and that uncomfortable truths take a long time to surface.",
      oneMove: "Schedule a fixed monthly 90-minute slot — for leadership only — with one question only: 'What assumption are we operating on that might be wrong?' Protect this time before the month begins, not when it's convenient."
    },
    low: {
      whatItMeans: "A low reflection score tells you that the organization is primarily in execution mode — doing, not questioning. That's not a criticism; it's often how successful organizations are built in the early stages. But without regular reflection, the risk is running hard in the wrong direction without realizing it.",
      symptom: "In low-reflection organizations, you tend to see: busyness that feels productive but generates a nagging sense that important things aren't being addressed, strategy that hasn't meaningfully evolved, and leaders who are too close to daily operations to see the whole picture.",
      oneMove: "Start simply: block 90 minutes per month — fixed, in the calendar before the month begins — for one question only: 'If we had to build this business from scratch today, what would we do differently?' You don't need a framework. You need the time and the honest conversation."
    }
  },

  ownership: {
    strengthNote: "An organization where work moves through commitment rather than reminders is one where leaders can genuinely delegate — which is what makes growth possible. Your score here means your people are taking responsibility, not just taking instructions. That is the foundation of a high-performance culture.",
    high: {
      whatItMeans: "Ownership is genuinely distributed in your organization — people are driving outcomes, not waiting to be chased. This means your leadership capacity multiplies: each leader can hold more because the people around them can be trusted to carry their part.",
      symptom: "You're likely seeing fewer escalations, faster resolution of problems, and a culture where 'someone should do something about this' is replaced by 'I'll take that.'",
      oneMove: "The main risk to high ownership is when leaders, under pressure, start doing rather than enabling. Watch for this pattern — it subtly signals to the team that ownership isn't really expected."
    },
    mid: {
      whatItMeans: "Ownership is present but inconsistent. Some people and teams are driving outcomes reliably; others need more follow-up than they should. The gap between the two creates drag and puts disproportionate load on the leaders who have to close it.",
      symptom: "You may be seeing: commitments that need to be re-confirmed, follow-up becoming a standard part of every project, and a pattern where things happen when the right leader is watching and slow down when they're not.",
      oneMove: "In your next leadership meeting, replace all status updates with one question per agenda item: 'Who owns this, and what is their personal commitment to completion?' Making ownership explicit — by name, not by role — is the single fastest way to shift the culture."
    },
    low: {
      whatItMeans: "A low ownership score is telling you that accountability isn't flowing through the organization as it needs to. This isn't necessarily about people not caring — it's more often about a system that hasn't made ownership clear and consistent enough to become a habit.",
      symptom: "You're probably seeing: things falling through the cracks despite everyone being busy, leaders spending significant time chasing updates, and a pattern where 'it wasn't my responsibility' is a comfortable explanation rather than a red flag.",
      oneMove: "Introduce a simple ownership protocol for every commitment made in any leadership forum: one owner, one deadline, one measure of done. Make this non-negotiable and visible. The habit builds quickly once it's consistently applied."
    }
  },

  leadership: {
    strengthNote: "Distributed leadership — where many people are creating change, not just the person at the top — is what makes organizations scalable. Your score here tells you that leadership capacity is genuinely broad, which means your future isn't constrained by a small number of people at the top.",
    high: {
      whatItMeans: "Leadership in your organization is genuinely creating the future, not just managing the present. And it's distributed — which means the organization doesn't stop moving when any one person isn't in the room. That's the mark of a genuinely strong leadership culture.",
      symptom: "You're likely seeing: initiatives that start without being pushed from the top, leaders who are comfortable challenging each other's assumptions, and a culture that can adapt to change without the whole system depending on one person.",
      oneMove: "The next step for high-performing leadership cultures is developing the next generation before it's urgent. Identify two or three people who could lead at the next level, and deliberately expand their scope now — not when you need them to step up."
    },
    mid: {
      whatItMeans: "Leadership is present and functional, but it's more concentrated than it could be. Some leaders are genuinely creating — others are primarily managing. The gap represents unrealized capacity that the organization isn't fully using.",
      symptom: "You may see: initiatives that are dependent on specific individuals, a tendency for decisions to flow upward to a smaller group than is healthy, and talented people who are waiting for permission to lead more.",
      oneMove: "Choose one significant challenge in the organization and genuinely hand it to someone below the top leadership tier. Give them real authority, real resources and real accountability — and resist the urge to retake ownership when it gets difficult. That act, repeated, builds leadership culture."
    },
    low: {
      whatItMeans: "Leadership is concentrated, which means the organization's ability to create change is limited by the bandwidth of a small number of people. This isn't a reflection of character — it's often the natural result of growth without deliberate leadership development.",
      symptom: "You're probably seeing: a leadership team that is stretched managing today while struggling to build tomorrow, capable people who aren't stepping up (because the environment hasn't consistently invited them to), and strategic progress that depends heavily on one or two individuals.",
      oneMove: "Start by asking: 'What are the three most important leadership decisions we're making every week that don't actually need to be made at the top?' Identify them, identify who could own them, and begin the handover. Distributed leadership grows one deliberate transfer at a time."
    }
  },

  standards: {
    strengthNote: "Organizations where leaders' actions match their words — especially under pressure — are the ones that build genuine trust and consistent culture. Your score here tells you that the standard isn't just stated, it's modelled. That's the hardest and most important thing a leadership team can do.",
    high: {
      whatItMeans: "Your leaders are walking the talk — and that matters more than any policy or value statement ever could. When people see that standards hold even under pressure, they internalize them. When they don't, they quietly stop believing in them.",
      symptom: "You're likely seeing: a team that holds itself to account because it watches its leaders do the same, cross-functional collaboration that works because turf wars are genuinely not tolerated, and an environment where people are treated as assets rather than resources.",
      oneMove: "The risk with high standards is that they require constant maintenance. Once a year, ask your leadership team to honestly audit one question: 'Where have we made an exception to our standards in the last 12 months, and what message did that send?'"
    },
    mid: {
      whatItMeans: "Standards are set and generally maintained, but there are gaps — moments where the stated standard and the actual behaviour diverge. Those gaps matter more than they look: people notice every inconsistency, and they adjust their own behaviour accordingly.",
      symptom: "You may see: silos that persist despite organizational values that don't support them, standards that hold in good times but slip when things are under pressure, and a sense that 'world-class' is an aspiration rather than a current operating mode.",
      oneMove: "Pick one standard that is stated but inconsistently lived — and for the next 90 days, make it a leadership team commitment to visibly model it, call it out when it happens well, and address it directly (not punitively) when it doesn't."
    },
    low: {
      whatItMeans: "A low standards score signals a gap between what the organization says and what it actually does — and that gap has real consequences. It erodes trust, creates inconsistency in how people work together, and makes it harder to build a culture that performs without constant oversight.",
      symptom: "You're likely seeing: turf protection between departments, variability in how different teams operate, a sense that being 'good for your size' is the internal benchmark rather than genuine excellence, and moments where the leadership team's actions don't quite match what they ask of others.",
      oneMove: "Start with one honest conversation in your leadership team: 'Where are we asking of others what we're not consistently delivering ourselves?' Name it clearly, without blame. Agreement on the gap is the first step to closing it — and the team's willingness to have that conversation is itself a standard worth setting."
    }
  },

  execution: {
    strengthNote: "The ability to actually build what you've planned — to protect time, test assumptions, redesign systems and measure progress — is where most organizations fall short. Your score here tells you that your organization can execute intentional change, not just manage operations. That's an uncommon capability.",
    high: {
      whatItMeans: "Your execution is disciplined — you're not just planning change, you're actually building it. Plans have protected time. Assumptions are being tested. Progress is measurable. That combination is rare and valuable.",
      symptom: "You're likely seeing: transformation initiatives that actually move forward (not just get talked about), leaders who can point to tangible progress in the last 90 days, and a culture where 'we'll get to it' is the exception rather than the norm.",
      oneMove: "Continue testing your assumptions against real customer and market data — not conference-room guesses. The organizations that sustain strong execution are the ones that stay connected to real-world feedback and adjust without ego."
    },
    mid: {
      whatItMeans: "The intention to execute is there, but it's competing with operational pressure for time, attention and resources. Plans get made and then business-as-usual reclaims the calendar. Progress happens, but more slowly and less reliably than the strategy requires.",
      symptom: "You may see: strategic initiatives that have been 'in progress' for longer than planned, leaders who genuinely want to work on transformation but find the week fills up before they get to it, and a pattern where the urgent crowds out the important.",
      oneMove: "Protect a minimum of two hours per week per senior leader for strategic build work — before the week begins, not when it's convenient. If it's not in the calendar, it won't happen. The discipline of protecting that time is itself the first act of execution."
    },
    low: {
      whatItMeans: "A low execution score tells you that good ideas aren't reliably becoming reality. The bottleneck isn't vision or intention — it's the disciplined work of translating strategy into phased plans, protecting time to work on them, and measuring whether they're moving.",
      symptom: "In low-execution organizations, you typically see: plenty of strategy conversations but difficulty pointing to what has materially changed in the last quarter, leaders who are brilliant in planning meetings but running the same operations six months later, and a sense that 'transformation' keeps getting pushed to next year.",
      oneMove: "Choose one strategic priority — just one — and build a 90-day plan for it with four elements: what will be different in 90 days, who owns each step, when is the protected time in the calendar to work on it, and how will you measure progress? Start there, make it work, then build the muscle for the next one."
    }
  },

  sustain: {
    strengthNote: "The ability to sustain performance — to keep the reflection discipline, maintain standards and continue growing through success, not just through adversity — is the mark of an organization that has genuinely understood what got it here. Your score here is a strong signal that you're building something that lasts.",
    high: {
      whatItMeans: "You're treating current success as a foundation for the next level, not an achievement to protect. That is the mindset that separates organizations that grow for a generation from ones that peak and plateau. It also tells you that your leadership discipline is holding even as success grows.",
      symptom: "You're likely seeing: a leadership team that is energized by the next challenge rather than defensive about the current position, performance standards that are still rising rather than settling, and an organization that could weather the departure of a senior leader without significant disruption.",
      oneMove: "The main risk at high sustain scores is that they eventually erode — quietly, without anyone deciding they should. Make a rule: once a year, re-audit every dimension of this assessment and ask: 'Where have we started to coast?'"
    },
    mid: {
      whatItMeans: "Your organization is sustaining reasonably well, but there are areas where success is creating a subtle complacency — a tendency to protect what you have rather than building what's next. This is natural and correctable, but it's worth addressing before it becomes structural.",
      symptom: "You may see: high performers who are good at current work but less stretched toward the next level, reflection disciplines that are less rigorous than they used to be, or a sense that 'we've earned the right to slow down a little.'",
      oneMove: "Ask your leadership team: 'If our best competitor was studying everything we do and planning to beat us, where would they start?' The answer to that question is where your next investment should go — not where you're currently strong."
    },
    low: {
      whatItMeans: "A low sustain score often appears in organizations that have achieved real success — and found that success creates its own risks. Complacency, over-dependence on key individuals, and a drift in the reflection discipline are all patterns that can quietly erode what took years to build.",
      symptom: "You may be seeing: an organization that is very dependent on specific senior leaders, a reflection discipline that has been deprioritized as 'things are going well,' a sense that current performance is the benchmark rather than a foundation for the next level.",
      oneMove: "Start with the key-person question: 'Which parts of our performance would decline significantly if one senior leader left tomorrow?' Address the single highest-risk dependency first — through documentation, deliberate cross-training, or leadership development — before it becomes a crisis."
    }
  }
};

/** Per-question coaching note based on score */
export function questionNote(score: number, band: "high" | "mid" | "low"): string {
  const notes: Record<"high" | "mid" | "low", string> = {
    high: "A genuine strength — this is working and worth protecting.",
    mid: "Functional but with room to grow — a focused effort here will compound.",
    low: "A meaningful gap — this is where the highest-leverage work lives."
  };
  return notes[band];
}

export function scoreBand(score: number): "high" | "mid" | "low" {
  return score >= 70 ? "high" : score >= 40 ? "mid" : "low";
}

/** Coaching interpretation for the overall score */
export function overallInterpretation(overall: number, weakestLabel: string, strongestLabel: string): string {
  if (overall >= 70) {
    return `With a Health Score of ${overall}/100, your organization is operating in the High Performance Zone. You have real strengths to build from — especially in ${strongestLabel}. The opportunity now is to keep the reflection discipline sharp so these gains become permanent rather than cyclical. Pay particular attention to ${weakestLabel}, which is your clearest lever for the next level.`;
  } else if (overall >= 40) {
    return `With a Health Score of ${overall}/100, your organization is in the Build Zone — the fundamentals are present, but there is meaningful performance being left on the table. Your greatest strength is ${strongestLabel}, which gives you a foundation to build from. The most important place to invest your energy right now is ${weakestLabel} — addressing it will have the highest multiplier effect across the organization.`;
  } else {
    return `With a Health Score of ${overall}/100, your organization is carrying significant BUSYness. This isn't a judgment — it's a map. The most important thing you can do right now is resist the urge to fix everything at once. Start with ${weakestLabel}, and make meaningful progress there before broadening your focus. Your strength in ${strongestLabel} gives you real energy to work with.`;
  }
}

/** 90-day sprint text for a given weak dimension */
export const SPRINT_CONTENT: Record<string, { month1: string; month2: string; month3: string; reread: string }> = {
  workload: {
    month1: "Conduct a stop-doing audit. Every recurring meeting, process and project gets reviewed against one question: is this genuinely creating value, or is it creating the appearance of it? Remove or reduce at least 20% of what's on the plate.",
    month2: "Redesign how work enters the system. Establish a simple rule: for every new commitment added, one existing one must be removed or reduced. Make this a standing practice in leadership decisions.",
    month3: "Re-survey your team on workload and compare against this baseline. Measure the change. Celebrate what's improved. Identify what's resisted change and understand why before month four.",
    reread: "Chapter 1 — The BUSYness Mirror"
  },
  purpose: {
    month1: "Hold a single leadership session with one purpose: to surface and agree on the honest answer to 'What would be lost in the world if we closed tomorrow?' Don't move on until the answer is clear and genuine, not just polished.",
    month2: "Test purpose in the field. For every significant decision made this month, explicitly ask: 'Is this consistent with why we exist?' Document the moments where the answer is yes — and the moments where it isn't.",
    month3: "Share the purpose story with the whole organization — not as a presentation, but as a conversation. Invite people to say where they see it in their daily work, and where they don't. That feedback is your compass for month four.",
    reread: "Chapter 2 — Purpose"
  },
  strategy: {
    month1: "Host a focused half-day alignment session. One agenda item: 'Who is our target customer, and what specifically makes us their best choice?' Don't move to action until every leader can answer this in the same way.",
    month2: "Test the strategy against real customers. Have at least three honest conversations with clients asking what they value most, what they'd miss if you weren't there, and what they wish you did better. Let the answers sharpen the strategy.",
    month3: "Conduct a portfolio review: remove, pause or redirect any initiative that doesn't clearly serve the target customer or the differentiating choice. Strategy is as much about what you stop doing as what you start.",
    reread: "Chapter 3 — Strategy"
  },
  competency: {
    month1: "Audit the weakest link in your competency chain — is it hiring, training, promotion or delivery? Identify the specific breakage point and design one concrete intervention. Don't try to fix the whole chain at once.",
    month2: "Redesign one hiring or promotion decision process so that the criteria are explicit, written down and shared before the decision — not intuited after it. Run one real decision through the new process.",
    month3: "Review the system. Where did the discipline slip? Which friction points were removed and which remain? Adjust the process and hold standard. This is now the new baseline.",
    reread: "Chapter 11 — The Daily Check-in"
  },
  reflection: {
    month1: "Book a fixed 90-minute slot in every leadership calendar — non-negotiable — for a monthly strategic reflection. The only agenda item: 'What assumption are we operating on that might be wrong?' Nothing operational. No exceptions.",
    month2: "Introduce one protected day per quarter for leadership-only strategic thinking. No client work, no operations. The agenda is open: the only requirement is that it's about the future, not the present.",
    month3: "Document what has changed as a result of your reflection sessions. If the answer is 'nothing,' the reflection isn't being converted into action — which is the next problem to solve.",
    reread: "Chapter 5 — Reflection"
  },
  ownership: {
    month1: "Replace all status updates in leadership meetings with a single format: Who owns this? What is their personal commitment to completion? By when? Make this non-negotiable for every agenda item, every week.",
    month2: "Address the top three ownership gaps directly and individually — not in a group setting. Have a one-on-one conversation with each owner about what's getting in the way of them following through. Remove the barrier; don't just re-state the expectation.",
    month3: "Measure commitments made against commitments kept over a 30-day window. Share the data with the team without judgment. The act of making this visible shifts the culture faster than any policy will.",
    reread: "Chapter 6 — Ownership"
  },
  leadership: {
    month1: "Choose one significant challenge and genuinely hand it to someone below the top leadership tier — with real authority, real resources and real accountability. Resist the urge to retake ownership when it gets difficult.",
    month2: "Identify one decision type that is currently concentrated at the top but doesn't need to be. Document the criteria for making that decision and begin delegating it. Build the muscle deliberately.",
    month3: "Review: what did the people you handed leadership to actually create? What did they do that you wouldn't have done? That gap is where organizational growth lives. Expand it.",
    reread: "Chapter 7 — Leadership Creates"
  },
  standards: {
    month1: "In a leadership team session, honestly audit one question: 'Where have our actions not matched our stated standards in the last 90 days?' Name the specific moments without blame. Agreement on the gap is the first step to closing it.",
    month2: "Pick one standard that is stated but inconsistently lived. For 60 days, make it the leadership team's personal practice to visibly model it, acknowledge it when others demonstrate it, and address it directly when it doesn't happen.",
    month3: "Conduct a cross-departmental review: are your functions genuinely operating as one team, or are there silos that have been politely accepted? Surface one structural barrier to collaboration and remove it.",
    reread: "Chapter 8 — Assert the Standard"
  },
  execution: {
    month1: "Choose one strategic priority. Build a 90-day plan with four elements: what will be different in 90 days, who owns each step, when is the protected calendar time to work on it, and how will you measure progress. Start with one. Make it work.",
    month2: "Test the plan against reality. Have two to three honest conversations with customers or stakeholders about the strategic assumption that underpins this priority. Let what you learn sharpen the plan.",
    month3: "Review: what has materially changed in 90 days? What got crowded out? For everything that didn't move, identify the specific barrier — time, clarity, ownership or resources — and address that barrier in the next cycle.",
    reread: "Chapter 9 — Build"
  },
  sustain: {
    month1: "Audit your key-person dependencies: which parts of your performance would decline significantly if one senior leader left tomorrow? Identify the single highest-risk dependency and build a plan to distribute that knowledge and capability.",
    month2: "Re-examine your reflection discipline: is it still as rigorous as it was when you were building? If success has caused it to drift, re-install it as a fixed, non-negotiable leadership practice — not an optional extra.",
    month3: "Ask your leadership team: 'If our best competitor was studying everything we do and planning to beat us, where would they start?' Use the answer to direct your next strategic investment — not toward your strengths, but toward your next necessary evolution.",
    reread: "Chapter 10 — Sustaining Greatness"
  }
};

/** Actionable 4-step framework content for employee mini-reports */
export const PARTICIPANT_TIPS: Record<string, { tip1: string; tip2: string }> = {
  workload: {
    tip1: "Identify your single highest-leverage task for tomorrow and block 90 minutes of uninterrupted time for it before checking email.",
    tip2: "Audit your recurring meetings this week. Ask the organizer to make one of them asynchronous or excuse yourself if your active input isn't required."
  },
  purpose: {
    tip1: "Before starting your next major task, explicitly write down how it connects to the broader team objective. If you can't, ask for clarification.",
    tip2: "Start your next team meeting by acknowledging a colleague who made a decision that perfectly aligned with the organization's core values."
  },
  strategy: {
    tip1: "When asked to take on a new project this week, pause and ask: 'How does this directly support our top strategic priority right now?'",
    tip2: "Write down what you believe the team's top priority is, and ask your manager if it matches their view. Misalignment is the root of most friction."
  },
  competency: {
    tip1: "Identify one specific skill that is slowing you down. Block 30 minutes this Friday to learn a better way to do it, or ask a peer to show you.",
    tip2: "Document one recurring process you handle so clearly that someone else could cover for you tomorrow without asking questions."
  },
  reflection: {
    tip1: "At the end of the day, spend 5 minutes writing down one thing that went well and one thing you could have done better. Close your laptop immediately after.",
    tip2: "In your next 1-on-1, don't just report status. Ask your manager: 'What is one blind spot you think I have in how I'm approaching my work?'"
  },
  meetings: {
    tip1: "For every meeting you organize this week, include a 1-sentence desired outcome in the invite. If it doesn't have an outcome, cancel it.",
    tip2: "Practice the 'Law of Two Feet'—if you are in a meeting where you are neither adding nor receiving value, politely excuse yourself."
  },
  execution: {
    tip1: "Reduce wasting time and energy in follow ups.",
    tip2: "Help others and yourself by honouring your commitments and being proactive in action."
  },
  ownership: {
    tip1: "Stop bringing problems to your manager. This week, bring a problem accompanied by your best proposed solution.",
    tip2: "When a mistake happens, be the first to say 'I own this' before pointing to the system or external factors."
  },
  courage: {
    tip1: "Speak up in the next meeting when you see a consensus forming that you genuinely believe is flawed. Respectful friction prevents disaster.",
    tip2: "Have that difficult conversation you've been putting off. Delaying it is draining more energy than actually doing it."
  },
  sustain: {
    tip1: "Identify the process that is working best for you right now, and write it down so it becomes repeatable even when you are tired.",
    tip2: "Protect your recovery time. Turn off Slack/email notifications on your phone after hours so you can return to work with full capacity."
  }
};
