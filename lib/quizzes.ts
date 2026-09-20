export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  chapterId: number;
  questions: Question[];
}

export const QUIZZES: Record<number, Quiz> = {
  0: {
    chapterId: 0,
    questions: [
      {
        id: 1,
        text: "What does the book identify as the \"Blind Spot of the Management World\"?",
        options: [
          "The lack of technological integration",
          "The assumption that management's job is to use resources smartly to get maximum output",
          "Failing to satisfy shareholders",
          "The inability to manage human resources effectively"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "According to the Introduction, what foundational mindset has management operated on for the better part of a century?",
        options: [
          "Extract Maximum",
          "Sustain Growth",
          "Optimize People",
          "Build for the Future"
        ],
        correctAnswer: 0
      },
      {
        id: 3,
        text: "How does the book suggest we reframe the term \"Human Resources\"?",
        options: [
          "Human Capital",
          "People Assets",
          "Human Sources",
          "Human Operations"
        ],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "When the \"extractive\" mindset is applied, what is the first place the \"hollowing\" shows up?",
        options: [
          "In the profit margins",
          "In the people",
          "In the technology stack",
          "In the supply chain"
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "When energy quietly withdraws from people, what internal decision do they typically make?",
        options: [
          "\"Go through the motions. Don't bring your heart into the game. Protect yourself.\"",
          "\"Work harder to impress leadership.\"",
          "\"Quit immediately and find another job.\"",
          "\"Report the cultural issues to human resources.\""
        ],
        correctAnswer: 0
      }
    ]
  },
  1: {
    chapterId: 1,
    questions: [
      {
        id: 1,
        text: "What does BUSYness give the illusion of?",
        options: ["Profitability", "Productivity", "Efficiency", "Control"],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "The predictable cycle of BUSYness typically begins with what?",
        options: ["Incompetent staff", "Low budgets", "Unclarity (an unclear purpose, strategy, or set of priorities)", "Strict deadlines"],
        correctAnswer: 2
      },
      {
        id: 3,
        text: "When organizations lack clarity, people default to \"Overactivity\", which means:",
        options: ["Reacting to everything because they have no filter for what is important vs urgent.", "Doing only the minimum required to avoid drawing attention.", "Deliberately sabotaging processes to slow things down.", "Asking managers for permission before starting any task."],
        correctAnswer: 0
      },
      {
        id: 4,
        text: "When frustration and exhaustion set in from shallow results, what do leaders typically reach for?",
        options: ["More strategic reflection", "External consultants", "Rest and recuperation", "More activity and more BUSYness"],
        correctAnswer: 3
      },
      {
        id: 5,
        text: "In a BUSY organization, meetings often consume significant time while generating:",
        options: ["Too much accountability", "Conflict and rapid restructuring", "Few decisions that justify their cost", "High levels of creativity"],
        correctAnswer: 2
      }
    ]
  },
  2: {
    chapterId: 2,
    questions: [
      {
        id: 1,
        text: "In the ROAR framework, \"Purpose\" belongs to which move?",
        options: ["Run", "Own", "Assert", "Reflect"],
        correctAnswer: 3
      },
      {
        id: 2,
        text: "Purpose is defined in the book as:",
        options: ["The financial target for the next quarter.", "The destination of the company.", "The WHY of your game and its impact on the world.", "The PR statement on the company website."],
        correctAnswer: 2
      },
      {
        id: 3,
        text: "When organizations connect to their purpose, it gives teams the feeling of:",
        options: ["Maximizing resources and extracting value.", "Surviving another quarter.", "\"Building the Temple\" instead of being BUSY laying bricks.", "Operating at maximum speed without stopping."],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "According to the book, BUSYness is in part what fills the space where __________ should be.",
        options: ["Micromanagement", "Purpose", "Technology", "Strict rules"],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "A clear purpose makes decisions easier because instead of asking \"What should we do?\", the question becomes:",
        options: ["\"How much will this cost?\"", "\"What will the competition do?\"", "\"Will this make us look productive?\"", "\"Does this serve our purpose?\""],
        correctAnswer: 3
      }
    ]
  },
  3: {
    chapterId: 3,
    questions: [
      {
        id: 1,
        text: "According to strategy scholar Roger Martin, most organizations don't have a strategy; instead, they have a:",
        options: ["Vision", "Plan", "Purpose", "Target"],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "What do most organizations often mistake for a real strategy?",
        options: [
          "A collection of intentions without the discipline of choosing what not to do.",
          "A detailed financial model projecting future revenue without defining clear market trade-offs.",
          "A list of ambitious new markets to enter without allocating the necessary resources.",
          "A rigid operational blueprint designed to maximize efficiency while ignoring external competition."
        ],
        correctAnswer: 0
      },
      {
        id: 3,
        text: "Developing a true strategy requires an organization to do what?",
        options: [
          "Act rapidly to outpace competitors and seize every available opportunity in the market.",
          "Slow down, think, reflect, and ultimately make a conscious strategic choice.",
          "Hire external consultants to draft a comprehensive plan based on industry best practices.",
          "Approve all new projects immediately to ensure maximum output and continuous engagement."
        ],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "To create a strategy as a set of interconnected choices, the book recommends asking which of these questions?",
        options: [
          "\"How can we systematically undercut the competition's pricing to gain immediate market share?\"",
          "\"Which specific customer segments do you genuinely wish to serve with your offerings?\"",
          "\"What is the most efficient method available to rapidly increase our profit margins?\"",
          "\"How many innovative new products can we realistically launch in the current year?\""
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "What is the spirit of a strategy-focused organization?",
        options: [
          "Having every decision in the company be in sync with the answers to the three core strategic questions.",
          "Ensuring every department holds weekly status meetings to review operational tasks and metrics.",
          "Rewriting the foundational business plan every quarter to adapt to changing market conditions.",
          "Attempting to serve every potential customer need regardless of the operational cost involved."
        ],
        correctAnswer: 0
      }
    ]
  },
  4: {
    chapterId: 4,
    questions: [
      {
        id: 1,
        text: "In the context of The Competency Chain, how does compromise spread through an organization?",
        options: [
          "It is triggered by external competitors and spreads rapidly due to intense market pressure.",
          "Each compromise breaks the next link, making further compromises both necessary and easily justified.",
          "It is typically introduced as a deliberate cost-saving strategy by upper and middle management.",
          "It occurs entirely at random without any clear structural pattern or predictable operational cause."
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "How do BUSY organizations typically treat recruitment?",
        options: ["As a strategic investment", "As an optional luxury", "As an operational necessity", "As a legacy builder"],
        correctAnswer: 2
      },
      {
        id: 3,
        text: "Why is hiring the \"available candidate\" instead of the \"right candidate\" considered a trap?",
        options: [
          "Because available candidates generally demand much higher salaries than the market average dictates.",
          "Because it sounds reasonable initially, but you rarely get a clean second chance later.",
          "Because these candidates are statistically much more likely to resign within the first month.",
          "Because standard corporate policies typically prohibit hiring anyone without an extensive interview process."
        ],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "What happens when you compromise at the point of entry (recruitment)?",
        options: [
          "You save significant financial resources in the short term.",
          "You can easily utilize targeted training to catch up later.",
          "You fundamentally compromise every operational process downstream.",
          "You temporarily increase the organization's overall productivity levels."
        ],
        correctAnswer: 2
      },
      {
        id: 5,
        text: "\"Good enough isn't High Performance. Good enough is the architecture of _________.\"",
        options: ["Efficiency", "Management", "Strategy", "BUSYness"],
        correctAnswer: 3
      }
    ]
  },
  5: {
    chapterId: 5,
    questions: [
      {
        id: 1,
        text: "According to Chapter 5, what is BUSYness actually serving as?",
        options: [
          "The primary root cause of all significant market and operational failures.",
          "A socially approved way of avoiding the discomfort of not knowing.",
          "A necessary psychological mechanism to ensure maximum daily productivity.",
          "The most effective method to rapidly align the organization's strategy."
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "A BUSY organization typically has a shortage of what?",
        options: [
          "Accurate information and reliable strategic data from the market.",
          "Frequent meetings and extensive discussions among leadership.",
          "The stillness in which information actually becomes understanding.",
          "Motivation and dedicated team effort to execute daily operations."
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        text: "When working on long-term transformation (Version 1.0 to Version 2.0), Version 2.0 will only happen if:",
        options: [
          "You replace all your current leadership teams with external experts.",
          "You create dedicated time for it and strictly protect that time.",
          "You secure additional external funding immediately before starting.",
          "You completely stop all Version 1.0 daily operational activities."
        ],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "According to Dr. Otto Scharmer's Theory U, what is the first transformation required for creating a new reality?",
        options: ["Transforming Action", "Transforming the Self", "Transforming Perception", "Transforming the Product"],
        correctAnswer: 2
      },
      {
        id: 5,
        text: "A BUSY organization typically has plenty of discussion and debate, but almost no:",
        options: ["Direct arguments", "Fast meetings", "Dialogue", "Hidden agendas"],
        correctAnswer: 2
      }
    ]
  },
  6: {
    chapterId: 6,
    questions: [
      {
        id: 1,
        text: "What does the book describe as an \"accountability tax\"?",
        options: [
          "Having too many layers of unnecessary middle management approval.",
          "A pervasive reminder culture where follow-up is always expected.",
          "Investing heavily in new productivity software and tracking tools.",
          "Paying for expensive external auditors to monitor employee output."
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "According to the book, follow-up is not coordination; it is actually compensation for:",
        options: ["Missing ownership", "Poor scheduling", "Ineffective tools", "Missing resources"],
        correctAnswer: 0
      },
      {
        id: 3,
        text: "How does a follow-up culture typically develop within an organization?",
        options: [
          "It is deliberately designed by leadership to ensure maximum operational efficiency.",
          "It is formally implemented by human resources to rigorously monitor performance.",
          "It accumulates gradually, one loose promise and missed deadline at a time.",
          "It is an unavoidable structural consequence of having a very large team."
        ],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "In a High-Performance culture (compared to a BUSY culture), how are customers viewed?",
        options: [
          "As a standard transaction that needs to be closed as quickly as possible.",
          "As a primary target for aggressively extracting more immediate business.",
          "As true partners whose long-term objectives are genuinely understood.",
          "As an ongoing operational problem that must be managed efficiently."
        ],
        correctAnswer: 2
      },
      {
        id: 5,
        text: "How does a High-Performance organization approach the future compared to a BUSY culture?",
        options: [
          "It constantly scrambles to respond to massive disruption after it happens.",
          "It sees disruption early and moves first by actively scanning the landscape.",
          "It completely ignores the future to focus entirely on present firefighting.",
          "It relies solely on external consultants to accurately predict the future."
        ],
        correctAnswer: 1
      }
    ]
  },
  7: {
    chapterId: 7,
    questions: [
      {
        id: 1,
        text: "According to John Kotter's research at Harvard, what is true about most organizations?",
        options: [
          "They are significantly underfunded and structurally overstaffed at the top.",
          "They are fundamentally overmanaged and significantly underled at the core.",
          "They suffer primarily from a chronic lack of operational talent.",
          "They fail because they have too many leaders making strategic decisions."
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "In the context of leadership, what is the deliberate choice a leader must make?",
        options: [
          "To focus exclusively on cutting operational costs to increase margins.",
          "To deliberately choose to create a new reality rather than merely optimise.",
          "To manage the existing business reality as efficiently as humanly possible.",
          "To delegate all long-term strategic planning directly to middle management."
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        text: "What happens when an organization defends its past methods instead of serving its mission?",
        options: [
          "It guarantees continuous and predictable long-term financial success over time.",
          "It successfully eliminates all internal corporate risk and operational uncertainty.",
          "It inadvertently builds a strong cultural immunity to necessary strategic change.",
          "It rapidly increases its immediate market share and overall customer base."
        ],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "According to the book, what eventually happens to the methods and processes that produced an organization's early success?",
        options: [
          "They naturally evolve and scale effortlessly without requiring any deliberate leadership intervention.",
          "They eventually become limiting walls that cause the organization to build an immunity to change.",
          "They remain perfectly effective and can be relied upon indefinitely regardless of market shifts.",
          "They are automatically upgraded by middle management as part of routine operational reviews."
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "Why do organizations often resist breaking out of \"Comfort Zone 1\" (Past Ways of Working)?",
        options: [
          "Because implementing new operational processes is usually much more financially expensive.",
          "Because executive leadership teams generally prefer the excitement of daily firefighting.",
          "Because they consciously choose familiar inefficiency over unfamiliar and uncomfortable improvement.",
          "Because the broader market usually punishes any kind of radical organizational change."
        ],
        correctAnswer: 2
      }
    ]
  },
  8: {
    chapterId: 8,
    questions: [
      {
        id: 1,
        text: "In the ROAR framework, what does the \"Assert\" move require you to do?",
        options: [
          "To forcefully demand that all of your employees consistently work longer hours.",
          "To set non-negotiable standards for yourself first, then for the entire organization.",
          "To aggressively renegotiate all of your vendor contracts to secure better pricing immediately.",
          "To openly criticize the past strategic decisions of the organization's previous leadership."
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "According to Edgar Schein's research at MIT, what truly shapes an organization's culture?",
        options: [
          "The official core values clearly written and displayed on the company website.",
          "What leaders consistently pay attention to, meticulously measure, and react to under pressure.",
          "The specific compensation and financial bonus structures applied to middle management.",
          "The total amount of venture funding the organization successfully raises from outside investors."
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        text: "How do Eco-centric leaders fundamentally differ from Ego-centric leaders?",
        options: [
          "Ego-centric leaders demand team excellence; Eco-centric leaders primarily demand strict rule compliance.",
          "Ego-centric leaders enforce through fear; Eco-centric leaders inspire through the standards they hold first.",
          "Ego-centric leaders build lasting organizational cultures; Eco-centric cultures end the moment they leave.",
          "Ego-centric leaders delegate everything to their teams; Eco-centric leaders make all strategic decisions."
        ],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "According to the core principles of the book, which of the following statements about organizational behavior is most accurate?",
        options: [
          "The organization primarily does what the executive leadership team explicitly says in official meetings.",
          "The organization ultimately does exactly what the CEO and leadership actually do in practice.",
          "The organization is largely unaffected by the personal habits and daily actions of the CEO.",
          "The organization only follows the formalized written policies that are officially approved by the board."
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "According to the text, when is a leader's true commitment to culture and standards most visibly tested and embedded?",
        options: [
          "During the annual corporate performance review cycle when budgets and targets are being rigorously evaluated.",
          "During the formal process of drafting and publishing the organization's official core values document.",
          "Consistently under intense pressure, especially in moments when it would be much easier to let something slide.",
          "While confidently presenting the quarterly financial results to the shareholders and the board of directors."
        ],
        correctAnswer: 2
      }
    ]
  }
};
