/* ============================================================
   NumeroVastu 360 — Curated Vedic Numerology & Vastu Remedy DB
   Sources: standard Vedic/Chaldean numerology rules and
   classical planetary friendship, gemstone, rudraksha, mantra
   and Vastu zone mappings.
   ============================================================ */

const DB = {

  /* ---- Chaldean letter -> number map (name numerology) ---- */
  chaldean: {
    A:1, B:2, C:3, D:4, E:5, F:8, G:3, H:5, I:1,
    J:1, K:2, L:3, M:4, N:5, O:7, P:8, Q:1, R:2,
    S:3, T:4, U:6, V:6, W:6, X:5, Y:1, Z:7
  },

  /* ---- Classical Vedic planetary friendship ---- */
  friendship: {
    1: { friends:[2,3,9], neutral:[5],   enemies:[4,6,7,8] },
    2: { friends:[1,5],   neutral:[3,6,8,9], enemies:[4,7] },
    3: { friends:[1,2,9], neutral:[8],   enemies:[4,5,6,7] },
    4: { friends:[5,6,7,8], neutral:[3], enemies:[1,2,9] },
    5: { friends:[1,4,6,7,8], neutral:[3,9], enemies:[2] },
    6: { friends:[4,5,7,8], neutral:[3,9], enemies:[1,2] },
    7: { friends:[4,5,6,8], neutral:[3], enemies:[1,2,9] },
    8: { friends:[4,5,6,7], neutral:[3], enemies:[1,2,9] },
    9: { friends:[1,2,3], neutral:[5,6,8], enemies:[4,7] }
  },

  /* ---- The 9 numbers: planet, traits, full remedy kit ---- */
  numbers: {
    1: {
      planet: "Sun (Surya)", element: "Fire",
      traits: "Leadership, authority, confidence, father, government, visibility, vitality",
      governs: ["Career", "Health", "Business"],
      weakSigns: "Low confidence, trouble with authority/father, weak recognition, low vitality, eye or heart strain",
      day: "Sunday", color: "Gold, Orange, Saffron", metal: "Gold / Copper",
      crystal: "Ruby or Red Aventurine (substitute: Red Jasper)",
      rudraksha: "1 Mukhi Rudraksha",
      mantra: "Om Hram Hreem Hroum Sah Suryaya Namah",
      mantraCount: "108 times daily at sunrise (full cycle: 7,000)",
      charity: "Donate wheat, jaggery, copper or red cloth on Sunday morning",
      lifestyle: "Offer water to the rising Sun daily; wake before sunrise; wear gold/copper; keep the east of home bright and clutter-free",
      fast: "Sunday fast on fruits or one salt-free meal"
    },
    2: {
      planet: "Moon (Chandra)", element: "Water",
      traits: "Mind, calm, emotions, intuition, mother, public relations, fluidity",
      governs: ["Health", "Relationship"],
      weakSigns: "Anxiety, mood swings, poor sleep, strained relationship with mother, overthinking",
      day: "Monday", color: "White, Silver, Cream", metal: "Silver",
      crystal: "Pearl or Moonstone (substitute: White Opal)",
      rudraksha: "2 Mukhi Rudraksha",
      mantra: "Om Shram Shreem Shraum Sah Chandraya Namah",
      mantraCount: "108 times daily in the evening (full cycle: 11,000)",
      charity: "Donate rice, milk, white cloth or silver on Monday",
      lifestyle: "Drink water from a silver glass; spend time near water; keep moonlight exposure at night; respect and serve your mother",
      fast: "Monday fast; avoid salt after sunset"
    },
    3: {
      planet: "Jupiter (Guru)", element: "Ether",
      traits: "Wisdom, growth, wealth, teaching, children, expansion, dharma",
      governs: ["Money", "Business", "Career"],
      weakSigns: "Financial stagnation, lack of direction, issues with mentors/children, liver or weight concerns",
      day: "Thursday", color: "Yellow, Gold", metal: "Gold / Brass",
      crystal: "Yellow Sapphire or Citrine (substitute: Yellow Aventurine)",
      rudraksha: "5 Mukhi Rudraksha",
      mantra: "Om Gram Greem Graum Sah Gurave Namah",
      mantraCount: "108 times daily at sunrise (full cycle: 19,000)",
      charity: "Donate yellow items — chana dal, turmeric, bananas, books — on Thursday",
      lifestyle: "Wear yellow on Thursdays; respect teachers; apply a saffron/turmeric tilak; study or teach something weekly",
      fast: "Thursday fast; avoid bananas after sunset on other days is not required — focus on gratitude"
    },
    4: {
      planet: "Rahu", element: "Air (shadow)",
      traits: "Ambition, unconventional paths, technology, foreign links, sudden events",
      governs: ["Business", "Career"],
      weakSigns: "Confusion, restlessness, sudden setbacks, gadget over-dependence, deception or self-doubt",
      day: "Saturday", color: "Smoky Grey, Dark Blue, Khaki", metal: "Mixed alloys / Silver",
      crystal: "Hessonite (Gomed) or Smoky Quartz",
      rudraksha: "8 Mukhi Rudraksha",
      mantra: "Om Bhram Bhreem Bhroum Sah Rahave Namah",
      mantraCount: "108 times daily after sunset (full cycle: 18,000)",
      charity: "Donate blankets, sesame, mustard oil or feed the poor/stray dogs on Saturday",
      lifestyle: "Limit screen time and wrist gadgets at night; keep the southwest clean and heavy; avoid clutter and broken electronics at home",
      fast: "Saturday light fast; coconut donation on Amavasya"
    },
    5: {
      planet: "Mercury (Budha)", element: "Earth",
      traits: "Communication, business acumen, data, speech, marketing, intellect, adaptability",
      governs: ["Business", "Money", "Career"],
      weakSigns: "Miscommunication, poor deals, nervous energy, speech or skin issues, scattered focus",
      day: "Wednesday", color: "Green, Light Blue", metal: "Silver / Bronze",
      crystal: "Emerald or Green Aventurine (substitute: Peridot)",
      rudraksha: "4 Mukhi Rudraksha",
      mantra: "Om Bram Breem Braum Sah Budhaya Namah",
      mantraCount: "108 times daily in the morning (full cycle: 9,000)",
      charity: "Donate green moong, green cloth or stationery to students on Wednesday",
      lifestyle: "Wear green on Wednesdays; journal or read daily; keep plants at the workspace; speak less and listen more",
      fast: "Wednesday fast on green vegetables / one grain-free meal"
    },
    6: {
      planet: "Venus (Shukra)", element: "Water (refined)",
      traits: "Love, luxury, beauty, art, relationships, comforts, vehicles, charm",
      governs: ["Relationship", "Money"],
      weakSigns: "Relationship friction, lack of comfort/luxury, reproductive or kidney concerns, dull creativity",
      day: "Friday", color: "White, Pink, Rose, Cream", metal: "Silver / White Gold / Rose Gold",
      crystal: "Diamond / Clear Quartz or Rose Quartz (substitute: White Zircon)",
      rudraksha: "6 Mukhi Rudraksha (or 13 Mukhi for attraction)",
      mantra: "Om Dram Dreem Draum Sah Shukraya Namah",
      mantraCount: "108 times daily in the morning (full cycle: 16,000)",
      charity: "Donate white sweets, rice, curd, perfume or white cloth on Friday",
      lifestyle: "Wear clean, fragrant clothes; keep the southeast zone beautiful and fresh; use rose/white scents; honor partner and women in life",
      fast: "Friday fast; kheer or white sweets as prasad"
    },
    7: {
      planet: "Ketu", element: "Fire (shadow)",
      traits: "Spirituality, intuition, research, detachment, past-life karma, moksha",
      governs: ["Health", "Career"],
      weakSigns: "Directionless phases, unexplained fears, sudden losses, feeling invisible, digestive issues",
      day: "Tuesday (or Saturday)", color: "Multi-color, Brown, Smoky tones", metal: "Mixed metal / Panchdhatu",
      crystal: "Cat's Eye (Lehsunia) or Tiger's Eye",
      rudraksha: "9 Mukhi Rudraksha",
      mantra: "Om Sram Sreem Sraum Sah Ketave Namah",
      mantraCount: "108 times daily before sunrise (full cycle: 17,000)",
      charity: "Feed stray dogs; donate multi-colored blankets, sesame or flag at a temple on Tuesday/Saturday",
      lifestyle: "Meditate 10 minutes daily; keep a spiritual corner at home; avoid grey areas in dealings; donate without announcement",
      fast: "Tuesday or Saturday fast; coconut offerings"
    },
    8: {
      planet: "Saturn (Shani)", element: "Air",
      traits: "Discipline, structure, career, justice, delays, hard work, long-term results",
      governs: ["Career", "Business"],
      weakSigns: "Chronic delays, career stagnation, joint/bone pain, feeling overworked yet unrewarded",
      day: "Saturday", color: "Dark Blue, Black, Purple", metal: "Iron / Black Steel",
      crystal: "Blue Sapphire (only after expert check) or Amethyst / Lapis Lazuli",
      rudraksha: "7 Mukhi Rudraksha (or 14 Mukhi for protection)",
      mantra: "Om Pram Preem Praum Sah Shanaishcharaya Namah",
      mantraCount: "108 times daily in the evening (full cycle: 23,000)",
      charity: "Donate black sesame, mustard oil, iron, black cloth or footwear to the needy on Saturday",
      lifestyle: "Serve workers, elderly and the underprivileged; oil massage on Saturdays; keep commitments punctually; light a sesame-oil lamp under a peepal tree on Saturday evening",
      fast: "Saturday fast; khichdi after sunset"
    },
    9: {
      planet: "Mars (Mangal)", element: "Fire",
      traits: "Energy, courage, action, property, siblings, drive, surgery/engineering",
      governs: ["Health", "Money", "Business"],
      weakSigns: "Low drive or uncontrolled anger, property disputes, blood pressure, accidents, debt",
      day: "Tuesday", color: "Red, Coral, Vermilion", metal: "Copper",
      crystal: "Red Coral or Carnelian (substitute: Red Jasper)",
      rudraksha: "3 Mukhi Rudraksha",
      mantra: "Om Kram Kreem Kraum Sah Bhaumaya Namah",
      mantraCount: "108 times daily at sunrise (full cycle: 10,000)",
      charity: "Donate red lentils (masoor), jaggery, red cloth or copper on Tuesday",
      lifestyle: "Exercise daily; channel anger into sport; recite Hanuman Chalisa on Tuesdays; keep the south of home well-lit",
      fast: "Tuesday fast on jaggery-and-wheat items"
    }
  },

  /* ---- Watch / wearable remedy per number (from PDF logic) ---- */
  watch: {
    metal:   { 1:"Gold or gold-tone stainless steel", 2:"Silver stainless steel (pure silver tone)", 3:"Gold or brass-tone metal", 4:"Two-tone mixed metal or dark gunmetal", 5:"Silver steel or bronze-green accents", 6:"Rose gold, white gold or silver", 7:"Panchdhatu / two-tone mixed metal", 8:"Dark steel, black metal or iron-tone; two-tone silver+gold also balances", 9:"Copper-tone or red-accent metal" },
    dial:    { 1:"Champagne, gold or white sunray dial", 2:"White, silver or mother-of-pearl dial (best for the Moon)", 3:"Cream, ivory or champagne dial", 4:"Grey, smoky or deep blue dial", 5:"Ice-blue, teal or light green dial", 6:"White, pink or rose-textured dial", 7:"Earth-tone, brown or gradient dial", 8:"Dark blue or black dial with clean indices", 9:"Red-accent, coral or deep maroon dial" },
    geometry:{ 1:"Round case with clean markers", 2:"Round, soft curves — avoid sharp edges", 3:"Round or cushion case", 4:"Square, rectangular or unconventional shapes", 5:"Slim round case; day-date window favored", 6:"Round or oval, elegant profile", 7:"Minimal, uncluttered dial layout", 8:"Octagonal (8-sided) or square tank case — mirrors Saturn structure", 9:"Bold, sporty round case" },
    features:{ 1:"Simple three-hand display — clarity of leadership", 2:"Quiet analog; avoid constant-notification smartwatches (Rahu noise disturbs Moon)", 3:"Classic analog with date; avoid digital clutter", 4:"Chronograph or tech-forward features acceptable", 5:"Day-date complication (Mercury + structure)", 6:"Slim dress profile; crystal accents favorable", 7:"Minimal complications; quiet dial", 8:"Day-date display for discipline and tracking; structured metal bracelet", 9:"Durable build; rotating bezel or sport functions" },
    strap:   { 1:"Gold-tone metal bracelet", 2:"Silver metal mesh or link bracelet — metal grounds the mind", 3:"Leather tan/brown or gold-tone bracelet", 4:"Metal bracelet preferred over silicone", 5:"Steel bracelet or green leather", 6:"Metal link bracelet; avoid rubber", 7:"Leather or mixed-metal bracelet", 8:"Multi-link steel or jubilee bracelet — anchored structure", 9:"Copper-tone bracelet or red/brown leather" },
    avoid:   { 2:"Smartwatches with constant pinging; if used, set silver/white minimal watch-face, metallic strap, and Do-Not-Disturb at night", 8:"Flimsy plastic watches — weakens structure", 1:"Overly dark or blacked-out dials", 5:"Overly busy dials that scatter Mercury focus" }
  },

  /* ---- Loshu grid layout (positions of numbers 1-9) ---- */
  loshuLayout: [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
  ],

  /* ---- The 8 planes of the Loshu grid, fully analysed ----
     Each plane: zone, about (generic meaning), per-cell role
     (short label, consequence when weak, fix), complete-text. */
  planes: [
    { name: "Mental Plane", zone: "Top row of the Lo Shu Grid", cells: [4, 9, 2],
      about: "This plane describes your thinking pattern — how you plan, judge, decide, and turn an idea into a practical direction. A strong mental plane does not simply mean intelligence; it shows whether your mind naturally connects planning, confidence, and grounded judgement. A weak or missing pattern does not mean you cannot think well, but it usually means you need external structure, written planning, or better decision systems to avoid scattered or delayed choices.",
      roles: {
        4: { short: "Planning", label: "planning & structure", con: "deciding first and structuring later, which can create avoidable reversals", fix: "write the goal, risk, cost, and next three steps before every major choice" },
        9: { short: "Action", label: "decisive action & confidence", con: "hesitation at the exact moment a decision is needed", fix: "practise small, quick decisions daily to rebuild decision confidence" },
        2: { short: "Grounding", label: "grounded judgement", con: "judgements made on emotion or urgency rather than ground facts", fix: "pause before concluding and test decisions against facts and one trusted advisor" }
      },
      complete: "Planning, confidence, and grounded judgement work together — this supports clear strategy, confident decisions, and the ability to explain your reasoning. A strong advisory and leadership mind. Guard against over-analysis; even the best mind must eventually decide." },

    { name: "Emotional Plane", zone: "Middle row of the Lo Shu Grid", cells: [3, 5, 7],
      about: "This plane describes your emotional processing — how you feel, express, absorb, regulate, and set boundaries. It is not only about being emotional; it shows whether feelings become clear communication, stable self-understanding, and mature limits. A weaker pattern can still give warmth or sensitivity, but the person may need more deliberate reflection before reacting, sharing, or closing themselves off.",
      roles: {
        3: { short: "Expression", label: "emotional expression & growth", con: "appearing composed and controlled outside while feelings stay unexpressed — over time this can turn into distance or quiet resentment", fix: "create a safe method of expression — honest conversations, writing, therapy-style reflection, or creative work" },
        5: { short: "Grounding", label: "emotional grounding", con: "emotions that swing before they settle, especially under pressure", fix: "practise centring rituals — breathwork, journaling, or time near water" },
        7: { short: "Boundaries", label: "boundaries & refinement", con: "porous boundaries — absorbing other people's moods and problems as your own", fix: "define what you will and will not accept, and communicate it calmly and early" }
      },
      complete: "Feelings flow into words cleanly, you read others well, and relationships receive both warmth and mature limits. This is a strong pattern for partnerships, caregiving, public-facing work, and team harmony." },

    { name: "Practical Plane", zone: "Bottom row of the Lo Shu Grid", cells: [8, 1, 6],
      about: "This plane describes your material execution — how you handle work, money, resources, delivery, and real-world results. A strong practical plane usually supports converting ability into visible outcomes. A weaker pattern does not mean failure; it means the person may need stronger systems, partners, deadlines, distribution habits, or financial discipline so effort does not remain incomplete or unmonetised.",
      roles: {
        8: { short: "Resources", label: "responsibility & resource handling", con: "effort that stays incomplete or unmonetised despite hard work", fix: "build systems — budgets, checklists, deadlines — that carry work to completion" },
        1: { short: "Ownership", label: "drive & personal ownership", con: "waiting for direction instead of owning outcomes end-to-end", fix: "take single-point ownership of one outcome at a time" },
        6: { short: "Finish Quality", label: "quality & refinement of output", con: "rushed output that undersells your real ability", fix: "define a finish standard before starting and deliver to it" }
      },
      complete: "Resources, ownership, and execution quality work together — a strong pattern for business, career growth, property, operations, and money management. You naturally ask 'how will this actually work?' The area to manage is becoming too outcome-focused; do not let productivity dry out your inner life." },

    { name: "Thought Plane", zone: "Left column of the Lo Shu Grid", cells: [4, 3, 8],
      about: "This plane describes long-form thinking — how you learn, analyse, connect ideas, and build understanding over time. It is different from quick intelligence. It shows whether your thoughts naturally become structured insight, deep study, and useful strategy. When this plane is weak, the person may still be smart, but thinking often improves when it is written down, discussed with the right people, and tested against real-world outcomes.",
      roles: {
        4: { short: "Ideas", label: "idea generation", con: "repeating known frames instead of questioning whether the strategy itself needs change", fix: "capture ideas the moment they appear — a notes habit turns sparks into strategy" },
        3: { short: "Learning", label: "learning & knowledge growth", con: "skill growth that plateaus because new inputs stop arriving", fix: "schedule one new input every week — a book, course, or mentor conversation" },
        8: { short: "Depth", label: "mental endurance & depth", con: "giving up on hard problems just before the breakthrough", fix: "schedule periodic zoom-outs: review assumptions and check that effort is going in the right direction" }
      },
      complete: "Ideas, learning, and depth reinforce each other — you can master complex subjects and convert study into strategy. This supports advisory roles, research, teaching, and any field where understanding compounds." },

    { name: "Will Plane", zone: "Middle column of the Lo Shu Grid", cells: [9, 5, 1],
      about: "This plane describes willpower — how you push through resistance, stay steady under pressure, and adjust when circumstances change. It is not only about aggression or ambition; it shows whether your drive has stamina and flexibility. When this plane is weak, motivation may come in waves, so external accountability, public commitments, routines, and pressure-based deadlines become especially important.",
      roles: {
        9: { short: "Drive", label: "drive & pushing power", con: "strong intentions without force behind them when resistance appears", fix: "use physical training, sport, or competition to build healthy pushing power" },
        5: { short: "Steadiness", label: "steadiness & adaptability", con: "motivation that wavers whenever conditions change", fix: "anchor yourself with fixed routines that hold you steady through change" },
        1: { short: "Direction", label: "self-belief & direction", con: "drive that depends on others' approval or borrowed goals", fix: "write your own direction down — self-chosen goals feed this plane" }
      },
      complete: "You can start with force, continue with patience, and change tactics when the situation demands — useful for entrepreneurship, sports, leadership, crisis work, and long projects. Strong will can also push past healthy limits; pair ambition with recovery and honest review points." },

    { name: "Action Plane", zone: "Right column of the Lo Shu Grid", cells: [2, 7, 6],
      about: "This plane describes follow-through — how you take intention and convert it into disciplined, finished action. It shows patience, boundaries, standards, and the ability to complete work cleanly. A weaker action plane can create delay, overthinking, poor finish, or difficulty enforcing limits, even when the person has good ideas or strong desire. The solution is usually clearer rules, smaller deadlines, and a defined finish standard.",
      roles: {
        2: { short: "Patience", label: "patience & grounding in action", con: "over-editing, checking, or holding back instead of completing — hidden perfection does not produce results", fix: "work to practical deadlines and minimum-viable standards — decide what is good enough for the current stage" },
        7: { short: "Standards", label: "standards & limits", con: "unclear limits, so work expands endlessly past its useful size", fix: "set clear rules for when to stop refining and ship" },
        6: { short: "Completion", label: "finish quality", con: "many things started, few cleanly finished", fix: "define 'done' before you start, and close tasks fully before opening new ones" }
      },
      complete: "Intentions reliably become finished work — patience, standards, and finish quality combine into a reputation for clean delivery. This supports operations, craftsmanship, and any role where the last 10% decides the value." },

    { name: "Golden Rajyoga", zone: "Diagonal of the Lo Shu Grid (4 – 5 – 6)", cells: [4, 5, 6],
      about: "This diagonal is read as an opportunity-to-output pattern. It shows whether a person can notice openings, stabilise them into a workable structure, and refine them into something valuable. It is useful for business, career growth, freelancing, branding, sales, and opportunity conversion. It does not guarantee wealth by itself; it shows the natural support for converting chances into organised and presentable results.",
      roles: {
        4: { short: "Opportunity", label: "spotting fresh opportunities", con: "comfort with known formats while faster-moving openings pass unnoticed", fix: "scan your market weekly — competitors, customer behaviour, new platforms, changing prices" },
        5: { short: "Structure", label: "structuring what you find", con: "opportunities that stay informal and leak value before they crystallise", fix: "give every opportunity a structure: owner, timeline, and budget" },
        6: { short: "Refinement", label: "refining results into value", con: "results delivered plain when they could be packaged premium", fix: "polish before you present — packaging converts work into value" }
      },
      complete: "Opportunity spotting, structure, and refinement connect into a strong wealth-conversion pattern — business, sales, branding, and career growth all benefit directly. Once you identify the right opening, your ability to structure and refine converts it well." },

    { name: "Silver Rajyoga", zone: "Diagonal of the Lo Shu Grid (8 – 5 – 2)", cells: [8, 5, 2],
      about: "This diagonal is read as a material-stability and asset-consolidation pattern. It is connected with property, savings, resource management, patience, and grounded progress. It does not mean instant money. It shows whether the person naturally understands holding, managing, protecting, and slowly building material security. When weak, property or asset growth may still happen, but it usually needs deliberate planning and disciplined external systems.",
      roles: {
        8: { short: "Assets", label: "asset & resource structure", con: "assets held without structure, documentation, or protection", fix: "formalise your assets — documentation, insurance, and clear ownership" },
        5: { short: "Management", label: "balanced management", con: "money and resources handled reactively instead of on a rhythm", fix: "review money and resources on a fixed monthly rhythm" },
        2: { short: "Patience", label: "patience & continuity", con: "becoming too controlling or pressure-driven when dealing with assets", fix: "let assets mature — add patience, relationship sensitivity, and gradual planning instead of pressure" }
      },
      complete: "Asset sense, balanced management, and patience combine into steady material security — property, savings, and long-term holdings grow well under your hand. This is the classic wealth-consolidation diagonal." }
  ],

  /* ---- Core nature per Mulank: traits, strengths & shadows ----
     Mulank = visible day-to-day personality; the same signature set
     marks what to amplify (adopt) and what to release. */
  traits: {
    1: { nature: "A born leader — independent, original, and authoritative. You prefer to initiate rather than follow, and you recover quickly from setbacks.",
         innerDrive: "a deep need to lead, to be recognised, and to stand on your own name",
         strengths: ["Leadership and initiative", "Confidence under pressure", "Original, independent thinking", "Determination and quick recovery"],
         shadows: ["Ego and pride when challenged", "Stubbornness — my way or no way", "Impatience with slower people", "Dominating conversations and decisions"],
         adopt: ["Decisive action", "Self-belief without arrogance", "Pioneering spirit", "Personal accountability"],
         release: ["Micromanaging others", "Need for constant approval", "Anger when opposed", "Doing everything alone"] },
    2: { nature: "Gentle, intuitive, and diplomatic. You sense undercurrents others miss and bring people together — the quiet force behind harmony.",
         innerDrive: "a deep need for connection, emotional security, and peaceful surroundings",
         strengths: ["Empathy and emotional intelligence", "Cooperation and peacemaking", "Patience and diplomacy", "Strong intuition about people"],
         shadows: ["Over-sensitivity to criticism", "Mood swings and worry loops", "Self-doubt at decision time", "Dependency on others' reassurance"],
         adopt: ["Calm persistence", "Healthy collaboration", "Trusting your intuition", "Nurturing yourself first"],
         release: ["Taking things personally", "People-pleasing", "Hesitation and over-deliberation", "Absorbing others' moods"] },
    3: { nature: "Optimistic, expressive, and wise. You think big, teach naturally, and lift the mood of every room you enter.",
         innerDrive: "a deep need to grow, to teach, and to see your ideas expand in the world",
         strengths: ["Communication and expression", "Vision and big-picture thinking", "Teaching and mentoring ability", "Generosity and humour"],
         shadows: ["Scattered energy across too many projects", "Over-promising and exaggeration", "Extravagance with money", "Preaching instead of listening"],
         adopt: ["Disciplined learning", "Mentoring others", "Gratitude practice", "Finishing what you envision"],
         release: ["Judging others quickly", "Impulse spending", "Unfinished projects", "Talking more than listening"] },
    4: { nature: "Unconventional, practical, and tireless. You build differently — systems, gadgets, methods — and you are at your best when breaking an old pattern.",
         innerDrive: "a deep need to build something different and break through imposed limits",
         strengths: ["Out-of-the-box thinking", "Endurance and hard work", "Technology and systems aptitude", "Courage to reform"],
         shadows: ["Restlessness and sudden extremes", "Rigidity inside your own routines", "Suspicion of others' motives", "All-or-nothing decisions"],
         adopt: ["Structured innovation", "Persistence through boring phases", "Financial prudence", "Adaptability to change"],
         release: ["Worst-case overthinking", "Unnecessary secrecy", "Impulsive risks", "Rules for the sake of rules"] },
    5: { nature: "Versatile, witty, and quick. You are the communicator and the deal-maker — freedom, variety, and movement keep you alive.",
         innerDrive: "a deep need for freedom, variety, and movement — mental and physical",
         strengths: ["Communication and persuasion", "Adaptability in any situation", "Sharp calculation and business sense", "Networking and multi-tasking"],
         shadows: ["Restlessness and inconsistency", "Scattered focus", "Starting without finishing", "Nervous energy and over-analysis"],
         adopt: ["Curiosity with follow-through", "Clear, honest speech", "Financial planning", "Flexibility with commitments"],
         release: ["Gossip and loose talk", "Impatience with slower minds", "Too many open loops", "Chasing every new thing"] },
    6: { nature: "Charming, caring, and responsible. Beauty, comfort, and relationships matter to you — people feel looked-after around you.",
         innerDrive: "a deep need for love, beauty, harmony, and a beautiful environment",
         strengths: ["Magnetism and charm", "Nurturing and responsibility", "Aesthetic taste", "Harmony-building in groups"],
         shadows: ["Perfectionism that delays", "Over-attachment and possessiveness", "Indulgence and comfort spending", "Interfering in others' lives"],
         adopt: ["Self-care alongside caregiving", "Healthy boundaries", "Appreciation of beauty daily", "Deep commitment"],
         release: ["Possessiveness", "Vanity", "Carrying others' burdens", "Comfort-zone spending"] },
    7: { nature: "Introspective, analytical, and spiritual. You seek the truth beneath the surface — a researcher of life, happiest with depth over noise.",
         innerDrive: "a deep need for meaning, truth, and inner knowing",
         strengths: ["Research and analytical depth", "Strong intuition", "Independence of thought", "Wisdom-seeking"],
         shadows: ["Isolation and aloofness", "Over-thinking into paralysis", "Distrust of people", "Detachment from practical duties"],
         adopt: ["Purposeful solitude", "Faith in your intuition", "Deep, focused study", "Simplicity in living"],
         release: ["Suspicion without evidence", "Analysis-paralysis", "Pessimism", "Withdrawing when hurt"] },
    8: { nature: "Disciplined, enduring, and justice-oriented. Life tests you early and often — and it is exactly that pressure that forges your authority.",
         innerDrive: "a deep need for order, justice, and lasting results that outlive you",
         strengths: ["Hard work and endurance", "Organization and systems", "Loyalty and dependability", "Long-term vision"],
         shadows: ["Pessimism and self-criticism", "Rigidity", "Feelings locked inside", "Workaholism"],
         adopt: ["Patience with the process", "Systems thinking", "Fairness in judgement", "Consistency over intensity"],
         release: ["Grudges", "Fear of failure", "All work and no play", "Carrying the world alone"] },
    9: { nature: "Energetic, courageous, and protective. You are built for action — you defend your people fiercely and finish what others abandon.",
         innerDrive: "a deep need to act, to protect, and to win",
         strengths: ["Courage and decisiveness", "High energy and stamina", "Drive to completion", "Protection of others"],
         shadows: ["Anger and impulsiveness", "Ego in conflict", "Haste that skips details", "Burnout from over-driving"],
         adopt: ["Channelled aggression through sport or service", "Quick forgiveness", "Bold initiative", "Disciplined action"],
         release: ["Arguments for winning's sake", "Revenge thoughts", "Uncalculated risks", "Rushing past people"] }
  },

  /* ---- Missing-number quick remedies shown on the grid ---- */
  missingFix: {
    1: "Strengthen the Sun: offer water at sunrise; place a sun symbol or copper item in the east.",
    2: "Strengthen the Moon: wear silver; keep a water element in the northwest; practice calming breathwork.",
    3: "Strengthen Jupiter: wear yellow on Thursdays; keep the northeast clean, light and sacred.",
    4: "Balance Rahu: clear southwest clutter; donate on Saturdays; reduce gadget dependence at night.",
    5: "Strengthen Mercury: add green plants to the north/workspace; journal daily; wear green on Wednesdays.",
    6: "Strengthen Venus: beautify the southeast; wear fragrance and clean white/pastel clothes on Fridays.",
    7: "Balance Ketu: create a meditation corner; donate to spiritual causes; spend time in silence weekly.",
    8: "Strengthen Saturn: serve the needy on Saturdays; keep the west tidy; honor deadlines and discipline.",
    9: "Strengthen Mars: exercise daily; keep the south well-lit; recite Hanuman Chalisa on Tuesdays."
  },

  /* ---- Yantra per number (classical remedy category) ---- */
  yantra: {
    1: "Surya Yantra", 2: "Chandra Yantra", 3: "Brihaspati (Guru) Yantra",
    4: "Rahu Yantra", 5: "Budh Yantra", 6: "Shukra Yantra",
    7: "Ketu Yantra", 8: "Shani Yantra", 9: "Mangal Yantra"
  },

  /* ---- The 8 Arrows of the Loshu grid (Chaldean "arrow" framing) ----
     Same 8 lines as the planes above, but under the classical "arrow" names
     practitioners and clients search for. When all three numbers of an arrow
     are present the arrow is "strong"; when they are all missing the arrow is
     "frustrated/confused" (a recognised weakness in classical practice). */
  arrows: [
    { name: "Arrow of Planning", line: [4, 9, 2], axis: "Top row (4-9-2)",
      present: "You think before you act — you plan, weigh options and move with a clear strategy. Strong for business, study and any long project.",
      missing: "Arrow of Confusion — decisions come impulsively or too late. Use written plans, cost/benefit checks and a decision checklist before acting." },
    { name: "Arrow of Emotions", line: [3, 5, 7], axis: "Middle row (3-5-7)",
      present: "You feel deeply and express it well — warmth, empathy and intuition flow naturally, making you naturally good with people.",
      missing: "Arrow of Emotional Restlessness — feelings get bottled up or swing under pressure. Practise daily expression, journaling and centring rituals." },
    { name: "Arrow of Practicality", line: [8, 1, 6], axis: "Bottom row (8-1-6)",
      present: "You convert ideas into real results — money, work and delivery come naturally. Strong material, career and business instincts.",
      missing: "Arrow of Frustration — effort does not convert into results. Install systems: budgets, deadlines and checklists that carry work to completion." },
    { name: "Arrow of Intellect", line: [4, 3, 8], axis: "Left column (4-3-8)",
      present: "A strong analytical mind — you learn deeply, connect ideas and master complex subjects over time.",
      missing: "Arrow of Shallow Thinking — learning plateaus and known patterns repeat. Feed the mind weekly with books, courses or a mentor conversation." },
    { name: "Arrow of Determination", line: [9, 5, 1], axis: "Middle column (1-5-9)",
      present: "You push through resistance with steady will and self-belief — a natural leader who finishes what they start.",
      missing: "Arrow of Wavering Will — motivation comes in waves. Anchor yourself with fixed routines, public commitments and physical training." },
    { name: "Arrow of Activity", line: [2, 7, 6], axis: "Right column (2-7-6)",
      present: "You finish what you start — patience, standards and follow-through combine into reliable, clean delivery.",
      missing: "Arrow of Unfinished Work — many things started, few completed. Define 'done' before you begin and close tasks fully." },
    { name: "Arrow of Prosperity", line: [4, 5, 6], axis: "Diagonal (4-5-6)",
      present: "Opportunity meets structure and polish — you convert chances into wealth, branding and recognition.",
      missing: "Openings slip past or leak value. Scan your market weekly and give every opportunity an owner, timeline and budget." },
    { name: "Arrow of Spirituality", line: [8, 5, 2], axis: "Diagonal (8-5-2)",
      present: "Inner calm and patience — you hold steady, build assets slowly and stay grounded under stress.",
      missing: "Restlessness and money-pressure. Let assets mature; add patience and a fixed monthly review of money and resources." }
  ],

  /* ---- Kua number (Feng Shui personal directions) ----
     NOTE: this is a Chinese / Feng Shui system, NOT classical Vastu Shastra.
     It is included (clearly labelled) because Indian numerology-Vastu apps
     commonly offer it as "your personal lucky direction". 5 maps to 2 (male)
     or 8 (female) at computation time, so no "5" entry exists here. */
  kua: {
    1: { group: "East", element: "Water", shengChi: "Southeast", auspicious: ["Southeast", "East", "South", "North"] },
    2: { group: "West", element: "Earth", shengChi: "Northeast", auspicious: ["Northeast", "West", "Northwest", "Southwest"] },
    3: { group: "East", element: "Wood",  shengChi: "South",     auspicious: ["South", "North", "Southeast", "East"] },
    4: { group: "East", element: "Wood",  shengChi: "North",     auspicious: ["North", "South", "East", "Southeast"] },
    6: { group: "West", element: "Metal", shengChi: "West",      auspicious: ["West", "Northeast", "Southwest", "Northwest"] },
    7: { group: "West", element: "Metal", shengChi: "Northwest", auspicious: ["Northwest", "Southwest", "Northeast", "West"] },
    8: { group: "West", element: "Earth", shengChi: "Southwest", auspicious: ["Southwest", "Northwest", "West", "Northeast"] },
    9: { group: "East", element: "Fire",  shengChi: "East",      auspicious: ["East", "Southeast", "North", "South"] }
  },

  /* ---- Goal -> relevant numbers mapping ---- */
  goals: {
    "Money":        [3, 5, 6, 9, 8],
    "Health":       [1, 2, 9, 7],
    "Career":       [1, 8, 5, 3, 4],
    "Business":     [5, 3, 6, 8, 4],
    "Relationship": [6, 2, 3, 7]
  },

  /* ---- Vastu: 8 zones, ruling planet, best use, doshas & fixes ---- */
  vastu: {
    directions: {
      "N":  { planet: 5, element: "Earth", label: "North (Mercury)",        best: "Living room, study, office desk, cash locker", worst: "Master bedroom, toilet, heavy storage",
              fix: "Keep north light, open and green. For dosh: place green plants, a money plant, or a Mercury/Buddha yantra; use light green decor; keep the zone clutter-free for cash flow." },
      "NE": { planet: 3, element: "Water", label: "Northeast (Jupiter)",    best: "Pooja/meditation room, entrance, study, water element", worst: "Kitchen, toilet, master bedroom, heavy storage, dustbin",
              fix: "Most sacred zone. For dosh: place a water fountain or bowl, light a diya daily, keep a Guru/Jupiter yantra, paint in light yellow/white; shift heavy items out; sea-salt bowl changed weekly absorbs negativity." },
      "E":  { planet: 1, element: "Fire (soft)", label: "East (Sun)",       best: "Entrance, living room, study, balcony", worst: "Toilet, staircase, store room",
              fix: "Keep east open for morning light. For dosh: place a copper sun symbol, keep windows clean, hang a rising-sun image; avoid blocking with tall furniture." },
      "SE": { planet: 6, element: "Fire", label: "Southeast (Venus)",       best: "Kitchen, electricals, gym", worst: "Master bedroom, water tank, pooja room",
              fix: "Fire zone. For dosh (bedroom/water here): add red/orange accents, place a copper pyramid or Venus yantra, keep a red bulb/lamp lit in evenings; avoid water features here." },
      "S":  { planet: 9, element: "Fire", label: "South (Mars)",            best: "Bedroom (with head south), staircase, heavy storage", worst: "Main entrance (inauspicious pada), water tank, open empty space",
              fix: "Keep south heavy and high. For dosh: use red/earthy tones, place a Mangal/Mars yantra, add a brass or copper item, keep the wall strong and well-lit; avoid water elements." },
      "SW": { planet: 4, element: "Earth", label: "Southwest (Rahu)",       best: "Master bedroom, heavy furniture, owner cabin, valuables", worst: "Entrance, toilet, water tank, empty open space",
              fix: "Stability zone. For dosh (entrance/toilet here): place heavy earth elements — lead/brass pyramid, Rahu yantra, family photograph; keep door closed if toilet; use yellow/brown earthy tones; keep heaviest furniture here." },
      "W":  { planet: 8, element: "Air", label: "West (Saturn)",            best: "Dining, children's bedroom, toilet (acceptable), study", worst: "Main entrance (mixed), pooja room",
              fix: "For dosh: place metal wind chimes (6 rods), Saturn yantra, keep zone clean and organized; dark blue/grey accents; avoid fire elements here." },
      "NW": { planet: 2, element: "Air", label: "Northwest (Moon)",         best: "Guest room, toilet (acceptable), garage, finished-goods store", worst: "Master bedroom (causes instability), fire/kitchen",
              fix: "Movement zone. For dosh (kitchen/master bedroom here): place white/silver elements, moon yantra, white flowers or pearl-moonstone bowl; use white/light grey tones; metal wind chime." }
    },

    /* Entrance verdicts */
    entrance: {
      "N":  { score: "Good", note: "North entrance supports wealth flow (Mercury). Keep it well-lit and obstacle-free." },
      "NE": { score: "Excellent", note: "Northeast entrance is among the most auspicious — brings clarity and prosperity." },
      "E":  { score: "Excellent", note: "East entrance welcomes rising-Sun energy — growth, health and recognition." },
      "SE": { score: "Weak", note: "Southeast entrance can cause fire-related friction and expenses. Remedy: place a copper pyramid above the door, red doormat, and two green plants flanking the entry." },
      "S":  { score: "Weak", note: "South entrance is generally avoided. Remedy: Mars yantra above the door, keep the door heavy/solid, place a red bulb near entry, and keep a threshold." },
      "SW": { score: "Dosh", note: "Southwest entrance is a classic Vastu dosh — drains stability and savings. Remedy: Rahu yantra, brass pyramid, heavy door with earthy tones, keep a bright light at the entry, and place a Ganesh idol inside facing the door." },
      "W":  { score: "Moderate", note: "West entrance is acceptable for some plots. Balance with metal chimes and Saturn-friendly orderliness." },
      "NW": { score: "Good", note: "Northwest entrance supports movement, networking and support from people. Keep fresh airflow here." }
    },

    /* Room placement rules evaluated from intake */
    roomRules: [
      { room: "Kitchen",        ideal: ["SE"], acceptable: ["S", "NW"], doshDirs: ["NE", "N", "SW"],
        doshText: "Kitchen (fire) in {dir} creates a fire-element clash — linked to health issues and expenses.",
        fix: "Face east while cooking; place a yellow Jaisalmer stone slab or copper pyramid in the kitchen; keep a red/orange mat; if kitchen is in NE, add a small yellow bulb and sea-salt bowl." },
      { room: "Master Bedroom", ideal: ["SW"], acceptable: ["S", "W"], doshDirs: ["NE", "SE", "NW"],
        doshText: "Master bedroom in {dir} disturbs stability and relationships (SW is the zone of rest).",
        fix: "Sleep with head towards south; use earthy tones (beige/brown); place a pair of rose-quartz stones; if bedroom is in SE, add a copper pyramid and avoid red; if in NW, add white/silver calming elements." },
      { room: "Toilet",         ideal: ["NW", "W"], acceptable: ["S", "SSW"], doshDirs: ["NE", "SW", "SE"],
        doshText: "Toilet in {dir} flushes away that zone's energy — a significant Vastu dosh.",
        fix: "Keep the door always closed; place a bowl of sea salt (change weekly); add a yellow bulb if in NE; place a brass pyramid on the outer wall; maintain strict dryness and ventilation; mirror on the outer door (not facing the seat) deflects energy." },
      { room: "Pooja Room",     ideal: ["NE"], acceptable: ["E", "N"], doshDirs: ["S", "SW", "SE", "under-stairs"],
        doshText: "Pooja space in {dir} weakens spiritual protection of the home.",
        fix: "If relocation is impossible, face east or north while praying; keep the altar on the east wall; light a diya twice daily in the NE of the home regardless." },
      { room: "Study Room",     ideal: ["E", "N", "NE"], acceptable: ["NW", "W"], doshDirs: ["S", "SW", "SE"],
        doshText: "Study room in {dir} works against concentration and memory retention.",
        fix: "Face east or north while studying; place the desk against a solid wall; keep a bookshelf in the west; use light yellow or green tones; keep a crystal or image that inspires focus on the desk." },
      { room: "Staircase",      ideal: ["S", "SW", "W"], acceptable: ["SE", "NW"], doshDirs: ["NE", "N", "E"],
        doshText: "Staircase in {dir} (and especially in the centre/Brahmasthan) creates instability and drains energy.",
        fix: "Keep the staircase well-lit and clutter-free; avoid it rising directly toward the main door; place a heavy object or plant at its base; if central, a skylight or bright light above helps." }
    ],

    /* ---- Plot shapes (missing corners / extensions) ---- */
    plotShapes: {
      "square":             { tone: "good", note: "A square or rectangular plot with all corners intact is the most balanced and auspicious — energy flows evenly." },
      "rectangular":        { tone: "good", note: "A rectangular plot (longer north-south) is balanced; a slight east-north extension is auspicious for growth." },
      "gomukhi":            { tone: "good", note: "Gomukhi (narrow at the front, wide at the back) is auspicious for residence — it holds and gathers prosperity." },
      "shermukhi":          { tone: "bad",  note: "Shermukhi (wide at the front, narrow at the back) is generally avoided — energy and wealth are said to drain away. Remedy: strengthen the rear boundary with a wall or heavy planting." },
      "missing-northeast":  { tone: "bad",  note: "A cut/missing Northeast corner weakens the most sacred zone (Jupiter). Remedy: light a diya there daily, place a water feature, and keep it clean and bright." },
      "missing-southwest":  { tone: "bad",  note: "A missing Southwest corner destabilises the support zone (Rahu / master-bedroom area). Remedy: place heavy furniture or a brass pyramid to anchor the zone." },
      "missing-southeast":  { tone: "warn", note: "A cut Southeast corner weakens the fire (kitchen) zone. Remedy: add a red/orange element and a copper pyramid." },
      "missing-northwest":  { tone: "warn", note: "A cut Northwest corner weakens the movement/support zone (Moon). Remedy: add white/silver elements and a metal wind chime." },
      "extended-northeast": { tone: "good", note: "An extension in the Northeast is highly auspicious — it strengthens prosperity, clarity and spiritual growth." },
      "extended-southwest": { tone: "bad",  note: "An extension in the Southwest adds excessive heaviness. Remedy: keep it uncluttered and light, and use it for storage rather than living." }
    }
  },

  /* ---- Career / profession fields per number ---- */
  careers: {
    1: ["Government & administration", "Politics & public leadership", "Business ownership / entrepreneurship", "Senior management & CEO roles", "Army / police leadership", "Medicine (leadership positions)"],
    2: ["Human resources & public relations", "Hospitality, hotels & tourism", "Nursing, caregiving & psychology", "Counseling & healing", "Dairy, liquids & water trade", "Media & creative arts"],
    3: ["Teaching, education & training", "Banking, finance & accounts", "Law & judiciary", "Consulting & advisory", "Astrology & spiritual guidance", "Writing & publishing"],
    4: ["IT, software & electronics", "Aviation & aerospace", "Foreign trade / MNC jobs", "Startups & unconventional ventures", "Research & innovation", "Film, photography & media tech"],
    5: ["Business, trading & commerce", "Marketing, sales & advertising", "Media, journalism & writing", "Chartered accountancy & audit", "Data analytics & telecom", "Stock market & speculation"],
    6: ["Fashion, beauty & luxury", "Arts, entertainment & cinema", "Interior design & architecture", "Jewellery & automobiles", "Hospitality & fine dining", "Cosmetics & perfumes"],
    7: ["Research & laboratories", "Spirituality, occult & healing", "Investigation & detective work", "Analytics & strategy", "Work in foreign lands", "Philosophy & academia"],
    8: ["Engineering & manufacturing", "Real estate & construction", "Mining, oil & steel", "Law, insurance & compliance", "Large-scale & long-term projects", "Logistics & heavy industry"],
    9: ["Defence, army & police", "Sports & fitness", "Surgery & emergency medicine", "Engineering & mechanics", "Property & land dealing", "Energy, fire & metals sector"]
  },

  /* ---- Day-wise clothing colours (weekday -> planet) ---- */
  dayWear: [
    { day: "Monday",    num: 2, colors: "White, silver, cream or light grey", note: "Moon day — calming, mind-soothing colours" },
    { day: "Tuesday",   num: 9, colors: "Red, coral or maroon",               note: "Mars day — energising, courage-boosting colours" },
    { day: "Wednesday", num: 5, colors: "Green, mint or light green",         note: "Mercury day — sharpens communication and business luck" },
    { day: "Thursday",  num: 3, colors: "Yellow, mustard or gold",            note: "Jupiter day — attracts wisdom, wealth and mentors" },
    { day: "Friday",    num: 6, colors: "White, pink, cream or pastels",      note: "Venus day — love, luxury and relationship harmony" },
    { day: "Saturday",  num: 8, colors: "Dark blue, black or purple",         note: "Saturn day — discipline, structure and protection" },
    { day: "Sunday",    num: 1, colors: "Orange, gold, saffron or royal red", note: "Sun day — authority, vitality and recognition" }
  ],

  /* ---- Personal-year meanings (timing section) ---- */
  personalYear: {
    1: "New beginnings and leadership — launch ventures, take initiative, start what you've been postponing.",
    2: "Patience and partnerships — nurture relationships and alliances; avoid big solo launches.",
    3: "Growth, creativity and expansion — excellent for wealth moves, visibility and learning.",
    4: "Foundation and discipline — build systems and save; expect delays, don't force outcomes.",
    5: "Change and opportunity — travel, marketing pushes, business pivots and bold experiments pay off.",
    6: "Harmony, family and comfort — relationships, home, luxury and creative work flourish.",
    7: "Introspection and mastery — research, upskill, spiritual practice; avoid impulsive risks.",
    8: "Results and recognition — karma delivers; career milestones and rewards for past effort.",
    9: "Completion and action — close old cycles, settle debts, bold moves in property and courage-led goals."
  },

  /* ---- Sound-preserving spelling transforms (Bollywood-style) ----
     Used to generate name corrections that keep pronunciation:
     Tripti -> Triptii, Sunil -> Suniel, Ashish -> Aashish, Kumar -> Kumarr */
  spelling: {
    vowelDoubles: { A: "AA", E: "EE", I: "II", O: "OO", U: "UU" },
    homophones: {
      K: ["C", "KH"], C: ["K", "CK"], S: ["SH", "SS"], F: ["PH"],
      J: ["Z"], Z: ["J"], V: ["W"], W: ["V"], Q: ["K"],
      I: ["Y", "EE"], Y: ["I"], U: ["OO"], PH: ["F"]
    },
    insertVowels: ["A", "E", "I"],          // Suniel-style vowel insertion
    note: "Corrections preserve pronunciation — letters are doubled, added or swapped for same-sound equivalents, never dropped."
  },

  /* ---- Short daily mantras + wish-paper affirmations per number ----
     (Owner-provided table: simple devotional mantra, meaning, affirmation) */
  mantraShort: {
    1: { dev: "ॐ घृणिः सूर्याय नमः", pron: "Om Ghrinih Suryaya Namah", meaning: "Salutations to the radiant Sun, the source of light and life.",
         affirmation: "I radiate confidence, vitality, and leadership. I am the creator of my own destiny." },
    2: { dev: "ॐ सोमाय नमः", pron: "Om Somaya Namah", meaning: "Salutations to the Moon, the nectar of life and emotion.",
         affirmation: "I am calm, intuitive, and emotionally balanced. My heart is open to receiving love." },
    3: { dev: "ॐ गुरवे नमः", pron: "Om Gurave Namah", meaning: "Salutations to the divine teacher and expander of wisdom.",
         affirmation: "I am open to wisdom, growth, and abundant opportunities. My path is blessed." },
    4: { dev: "ॐ राहवे नमः", pron: "Om Rahave Namah", meaning: "Salutations to Rahu, the force of sudden change and material mastery.",
         affirmation: "I embrace change, overcome all obstacles, and manifest my unique path with courage." },
    5: { dev: "ॐ बुधाय नमः", pron: "Om Budhaya Namah", meaning: "Salutations to Mercury, the planet of intellect and communication.",
         affirmation: "My mind is sharp, my words are clear, and I adapt to life with grace and joy." },
    6: { dev: "ॐ शुक्राय नमः", pron: "Om Shukraya Namah", meaning: "Salutations to Venus, the bestower of love, beauty and wealth.",
         affirmation: "I attract love, beauty, and harmonious relationships. I am worthy of abundance." },
    7: { dev: "ॐ केतवे नमः", pron: "Om Ketave Namah", meaning: "Salutations to Ketu, the force of spiritual liberation and intuition.",
         affirmation: "I trust my intuition, release the past, and walk my spiritual path with absolute clarity." },
    8: { dev: "ॐ शनैश्चराय नमः", pron: "Om Shanaischaraya Namah", meaning: "Salutations to Saturn, the lord of karma, discipline and justice.",
         affirmation: "I am disciplined, resilient, and deserving of karmic rewards, wealth, and success." },
    9: { dev: "ॐ मंगलाय नमः", pron: "Om Mangalaya Namah", meaning: "Salutations to Mars, the divine warrior and protector.",
         affirmation: "I act with courage, strength, and unwavering focus. I am protected in all my endeavors." }
  },

  /* ---- Zodiac (sun sign) power kits ----
     (Owner-provided tables: crystals, intentions, mantra, affirmation per sign) */
  zodiac: {
    "Aries":       { ruler: 9, element: "Fire",  crystals: ["Red Jasper", "Carnelian", "Tiger's Eye"],           intentions: "Fitness, courage, leadership",
                     dev: "ॐ मंगलाय नमः", pron: "Om Mangalaya Namah", meaning: "Salutations to Mars.",
                     affirmation: "I lead with courage, act with purpose, and ignite positive change in my life." },
    "Taurus":      { ruler: 6, element: "Earth", crystals: ["Rose Quartz", "Green Aventurine", "Emerald"],       intentions: "Love aura, wealth, stability",
                     dev: "ॐ शुक्राय नमः", pron: "Om Shukraya Namah", meaning: "Salutations to Venus.",
                     affirmation: "I am grounded, abundant, and open to receiving life's greatest pleasures." },
    "Gemini":      { ruler: 5, element: "Air",   crystals: ["Citrine", "Clear Quartz", "Aquamarine"],            intentions: "Study success, communication",
                     dev: "ॐ बुधाय नमः", pron: "Om Budhaya Namah", meaning: "Salutations to Mercury.",
                     affirmation: "I communicate with clarity, embrace new ideas, and find joy in connection." },
    "Cancer":      { ruler: 2, element: "Water", crystals: ["Moonstone", "Pearl", "Rose Quartz"],                intentions: "Inner peace, emotional healing, pregnancy balance",
                     dev: "ॐ सोमाय नमः", pron: "Om Somaya Namah", meaning: "Salutations to the Moon.",
                     affirmation: "My heart is a sanctuary of peace. I nurture myself and others with love." },
    "Leo":         { ruler: 1, element: "Fire",  crystals: ["Sunstone", "Citrine", "Tiger's Eye"],               intentions: "Career success, confidence, wealth",
                     dev: "ॐ घृणिः सूर्याय नमः", pron: "Om Ghrinih Suryaya Namah", meaning: "Salutations to the Sun.",
                     affirmation: "I shine brightly, lead with grace, and inspire warmth in everyone I meet." },
    "Virgo":       { ruler: 5, element: "Earth", crystals: ["Amazonite", "Blue Lace Agate", "Amethyst"],         intentions: "Health & wellness, anxiety relief, study",
                     dev: "ॐ बुधाय नमः", pron: "Om Budhaya Namah", meaning: "Salutations to Mercury.",
                     affirmation: "I find perfection in the present moment and heal my mind, body, and spirit." },
    "Libra":       { ruler: 6, element: "Air",   crystals: ["Rose Quartz", "Lapis Lazuli", "Malachite"],         intentions: "Rebuild relationships, harmony, love aura",
                     dev: "ॐ शुक्राय नमः", pron: "Om Shukraya Namah", meaning: "Salutations to Venus.",
                     affirmation: "I cultivate harmony, beauty, and deep, meaningful relationships in my life." },
    "Scorpio":     { ruler: 9, element: "Water", crystals: ["Black Tourmaline", "Obsidian", "Malachite"],        intentions: "Protection, debt clearing, deep transformation",
                     dev: "ॐ मंगलाय नमः", pron: "Om Mangalaya Namah", meaning: "Salutations to Mars, the divine warrior and protector.",
                     affirmation: "I embrace transformation, release what no longer serves me, and rise stronger." },
    "Sagittarius": { ruler: 3, element: "Fire",  crystals: ["Turquoise", "Lapis Lazuli", "Amethyst"],            intentions: "Study success, travel protection, wisdom",
                     dev: "ॐ गुरवे नमः", pron: "Om Gurave Namah", meaning: "Salutations to the Teacher.",
                     affirmation: "I expand my horizons, seek truth, and trust the beautiful journey ahead." },
    "Capricorn":   { ruler: 8, element: "Earth", crystals: ["Smoky Quartz", "Black Onyx", "Garnet"],             intentions: "Career growth, discipline, debt clearing",
                     dev: "ॐ शनैश्चराय नमः", pron: "Om Shanaischaraya Namah", meaning: "Salutations to Saturn.",
                     affirmation: "My hard work builds lasting success. I am grounded, patient, and unstoppable." },
    "Aquarius":    { ruler: 8, element: "Air",   crystals: ["Amethyst", "Aquamarine", "Clear Quartz"],           intentions: "Inner peace, innovation, spiritual growth",
                     dev: "ॐ शनैश्चराय नमः", pron: "Om Shanaischaraya Namah", meaning: "Salutations to Saturn, the lord of karma, discipline and justice.",
                     affirmation: "I embrace my uniqueness, break boundaries, and contribute positively to the world." },
    "Pisces":      { ruler: 3, element: "Water", crystals: ["Amethyst", "Aquamarine", "Moonstone"],              intentions: "Rebuild relationships, intuition, inner peace",
                     dev: "ॐ गुरवे नमः", pron: "Om Gurave Namah", meaning: "Salutations to the Teacher.",
                     affirmation: "I am deeply connected to my intuition and the universal flow of love and grace." }
  },

  /* ---- Crystal companion guide ----
     Every crystal/gem named in DB.numbers[].crystal and DB.zodiac[].crystals
     has an entry here, so crystalGuide() can surface a full card for each one
     actually relevant to a chart. Names must match verbatim (case-insensitive)
     the names used in those fields. */
  crystals: {
    /* --- Navagraha gemstones (primary + accessible substitutes) --- */
    "Ruby":              { chakra: "Root / Heart", benefits: "Sun's gem of vitality, authority and courage; strengthens the heart, confidence and leadership.", pair: "Red Coral or Gold (Sun energy)" },
    "Red Coral":         { chakra: "Root", benefits: "Mars's gem of courage, protection and blood vitality; energises and defends.", pair: "Carnelian (for accessible action energy)" },
    "Pearl":             { chakra: "Crown / Sacral", benefits: "Moon's gem of the mind — soothes emotions, cools the temper, and supports intuition and calm sleep.", pair: "Moonstone (deepens emotional balance)" },
    "Yellow Sapphire":   { chakra: "Crown / Throat", benefits: "Jupiter's gem of wisdom, wealth and dharma; attracts mentors, growth and prosperity.", pair: "Citrine (its accessible substitute)" },
    "Emerald":           { chakra: "Heart", benefits: "Mercury's gem of intellect and speech; sharpens communication, memory and business acumen.", pair: "Green Aventurine (its accessible substitute)" },
    "Diamond":           { chakra: "Crown", benefits: "Venus's gem of purity and light; amplifies love, clarity and self-worth.", pair: "Clear Quartz (its accessible stand-in)" },
    "Blue Sapphire":     { chakra: "Throat / Third Eye", benefits: "Saturn's gem of discipline, structure and rapid karmic reward; powerful — wear only after an expert check.", pair: "Amethyst or Lapis Lazuli (gentler substitutes)" },
    "Hessonite":         { chakra: "Root", benefits: "Rahu's gem (Gomed) — clears confusion, breaks illusions and stabilises sudden change; wear only on expert advice.", pair: "Smoky Quartz (for gentle grounding)" },
    "Cat's Eye":         { chakra: "Root / Third Eye", benefits: "Ketu's gem (Lehsunia) — sharpens intuition, protects from the unseen and steadies karmic shifts; wear on expert advice.", pair: "Tiger's Eye (for a gentler version)" },

    /* --- Quartz family & substitutes --- */
    "Amethyst":          { chakra: "Third Eye / Crown", benefits: "Calms the mind, reduces stress, enhances intuition, and promotes spiritual peace.", pair: "Clear Quartz (to amplify) or Selenite (to cleanse)" },
    "Clear Quartz":      { chakra: "Crown", benefits: "The master healer; amplifies intention, cleanses the aura and programmes easily for any goal.", pair: "Amethyst (to amplify) or Selenite (to cleanse)" },
    "Rose Quartz":       { chakra: "Heart", benefits: "Unconditional love, emotional healing, self-care, and attracting romance.", pair: "Moonstone (for emotional balance)" },
    "Smoky Quartz":      { chakra: "Root", benefits: "Deeply grounding; absorbs negativity, dissolves debt-mindset and anchors scattered energy.", pair: "Black Tourmaline (for protection)" },
    "Citrine":           { chakra: "Solar Plexus", benefits: "Wealth generation, abundance, joy, and personal power. Known as the \"Merchant's Stone\".", pair: "Pyrite or Green Aventurine (the Dhan Yog combo)" },
    "Black Tourmaline":  { chakra: "Root", benefits: "Ultimate protection against negative energy, EMF smog, and the Evil Eye (Nazar). Grounding.", pair: "Smoky Quartz (for deep grounding and debt clearing)" },
    "Obsidian":          { chakra: "Root", benefits: "Protective truth-mirror; grounds, shields and surfaces what needs releasing — no sugar-coating.", pair: "Black Tourmaline" },
    "Black Onyx":        { chakra: "Root", benefits: "Strength, self-mastery and protection; supports discipline and steady Saturnian grounding.", pair: "Smoky Quartz" },
    "White Opal":        { chakra: "Crown", benefits: "Amplifies emotional clarity and inspiration; the Moon's substitute for pearl when the real gem is unavailable.", pair: "Moonstone" },
    "White Zircon":      { chakra: "Crown", benefits: "Venus's substitute for diamond; brings clarity, brilliance and refined charm.", pair: "Clear Quartz" },
    "Moonstone":         { chakra: "Sacral / Crown", benefits: "Enhances intuition, balances hormones and cycles, and invites gentle emotional flow.", pair: "Pearl (for pure calming Moon energy)" },
    "Red Jasper":        { chakra: "Root", benefits: "Steadies the emotions, builds endurance and gently grounds fiery energy; a protective, nurturing stone.", pair: "Carnelian (for action)" },
    "Carnelian":         { chakra: "Sacral", benefits: "Ignites courage, motivation and creative drive; Mars's warm, accessible stone of action.", pair: "Red Jasper (for grounding)" },
    "Tiger's Eye":       { chakra: "Solar Plexus / Sacral", benefits: "Courage, confidence, focus, and protection from ill-wishing. Great for decision-making.", pair: "Carnelian (for action and motivation)" },
    "Green Aventurine":  { chakra: "Heart", benefits: "The merchant's good-luck stone; attracts opportunity, soothes nerves and supports steady growth.", pair: "Citrine (the Dhan Yog combo)" },
    "Red Aventurine":    { chakra: "Root", benefits: "Grounding and energising; boosts drive, stamina and courage, and clears creative blocks.", pair: "Red Jasper (for stability)" },
    "Yellow Aventurine": { chakra: "Solar Plexus", benefits: "Lightens pessimism, attracts opportunity and supports confident decisions — Jupiter's accessible stone.", pair: "Citrine" },
    "Peridot":           { chakra: "Heart / Solar Plexus", benefits: "Clears jealousy and resentment, opens the heart and refreshes confidence; Mercury's warm-green ally.", pair: "Citrine" },
    "Lapis Lazuli":      { chakra: "Throat / Third Eye", benefits: "Stone of truth and wisdom; supports honest speech, memory and Saturn's steady discipline.", pair: "Clear Quartz (to amplify)" },

    /* --- Zodiac-supporting stones --- */
    "Sunstone":          { chakra: "Sacral / Solar Plexus", benefits: "Carries Sun confidence, joy and personal power; lifts mood and banishes self-doubt.", pair: "Citrine (for abundance)" },
    "Aquamarine":        { chakra: "Throat", benefits: "Cooling and courageous; calms the mind, eases communication and soothes emotional storms.", pair: "Clear Quartz" },
    "Amazonite":         { chakra: "Heart / Throat", benefits: "The truth-teller; balances emotion with speech, soothes anxiety and supports healthy boundaries.", pair: "Amethyst" },
    "Blue Lace Agate":   { chakra: "Throat", benefits: "Gentlest communicator; dissolves tension, encourages calm expression and eases overthinking.", pair: "Aquamarine" },
    "Malachite":         { chakra: "Heart", benefits: "Powerful heart-transformer; clears old emotional patterns and invites deep healing and growth.", pair: "Rose Quartz (to soften its intensity)" },
    "Turquoise":         { chakra: "Throat / Heart", benefits: "The sky stone; protects, aligns speech with truth, and balances giving and receiving.", pair: "Lapis Lazuli" },
    "Garnet":            { chakra: "Root", benefits: "Devotion, stamina and grounded passion; anchors energy and supports commitment.", pair: "Smoky Quartz (for grounding)" },

    /* --- Ritual / special --- */
    "Selenite":          { chakra: "Crown / Ether", benefits: "Liquid light. Cleanses, charges, and recharges other crystals. Promotes deep peace and clarity.", pair: "Use as a base — place your bracelets and crystals on Selenite weekly" },
    "5 Mukhi Rudraksha": { chakra: "Throat / Heart", benefits: "Ruled by Lord Kalagni (Shiva). Balances the 5 elements, lowers blood pressure, and calms the mind.", pair: "Crystal beads (combines spiritual grounding with mineral energy)" }
  },
  seleniteRitual: "Weekly cleansing ritual: every Saturday night, place all your crystals and bracelets on a Selenite plate or slab. By morning they are cleansed and recharged — never let crystals go more than a month without cleansing.",

  /* ---- Compound numbers 1–108 (Chaldean name / business totals) ----
     The full Chaldean total of a name, brand or business carries its own
     meaning BEFORE it is reduced to a single digit. These are classical
     Chaldean compound readings (Cheiro tradition), used for name and
     business analysis. Single digits 1–9 restate the planetary nature. */
  compound: {
    1: "Unity — beginnings, leadership and initiative. The seed energy of the Sun; a strong, independent vibration.",
    2: "Duality — partnership, receptivity and the Moon's calm. Favours cooperation and diplomacy over force.",
    3: "Expression — Jupiter's optimism, growth and communication. A fortunate, expansive vibration.",
    4: "Foundation — Rahu's unconventional builder. Discipline, structure and hard work; watch for rigidity.",
    5: "Change — Mercury's versatility, trade and movement. Quick, adaptable and entrepreneurial.",
    6: "Harmony — Venus's love, beauty and comfort. Diplomatic and creative; watch indulgence.",
    7: "Analysis — Ketu's depth, introspection and spirituality. Wise but inclined to solitude.",
    8: "Power — Saturn's discipline, karma and long-term reward. Authority earned through endurance.",
    9: "Completion — Mars's courage and action. Strong, decisive and protective; channel anger into sport.",
    10: "Wheel of Fortune — a fortunate compound of rising and falling cycles. Success comes through adaptability and seizing the turning point; avoid complacency.",
    11: "The Lion Muzzled — a master number of intuition and illumination carrying a classic warning: hidden opposition or over-idealism can undermine you. Channel it through clear purpose and honesty.",
    12: "The Sacrifice — emotional sensitivity and self-sacrifice. Excellent for service, care and teaching, but guard against being taken advantage of.",
    13: "Change & Regeneration — death-and-rebirth energy. A fortunate number for transformation and new beginnings, though often felt through upheaval first.",
    14: "Movement & Combination — favourable for deals, media, travel and communication; but avoid rash speculation and keep commitments grounded.",
    15: "The Magician — strong personal magnetism, eloquence and persuasive power. Excellent for the arts, sales and the occult, but carries a caution against manipulation.",
    16: "The Tower — a cautionary number: sudden falls follow over-ambition or hidden pride. Build on honest foundations and heed warnings early.",
    17: "Star of the Magi — highly fortunate: success, recognition and enduring love. Steady effort is rewarded with lasting fame.",
    18: "Materialism with a spiritual warning — business and wealth can flourish, but guard against greed and conflict; balance material gains with ethics.",
    19: "Prince of Heaven — one of the most fortunate: victory, happiness and worldly success. Rare and auspicious for leadership.",
    20: "Awakening — a call to purpose and responsibility; the more deliberate the direction, the stronger the outcome. Avoid indecision.",
    21: "Crown of the Magi — success and advancement through discipline and vision. A fortunate number for long-term goals and leadership.",
    22: "The Master Builder — a master number of great vision and manifestation, but heavy: it demands discipline, patience and practical follow-through to avoid illusion.",
    23: "Royal Star of the Lion — a fortunate number of success, protection and favour from those in power. Confident action is rewarded.",
    24: "Love & Success — harmonious relationships, creative fulfilment and material comfort; but avoid possessiveness and dependence.",
    25: "Strength through trial — growth comes through experience and struggle; intuition deepens with each test. Persist — the rewards are real.",
    26: "Caution in partnerships — risk of loss through misjudged alliances or contracts. Verify agreements, trust slowly, and document everything.",
    27: "The Command — a fortunate number of authority, wisdom and good counsel; excellent for leadership, law and teaching.",
    28: "Contradiction & trust — great potential marred by inconsistency or misplaced trust; decide firmly and keep your word.",
    29: "Uncertainty & warning — ambition is present but outcomes are unstable; avoid over-promising and double-check every commitment.",
    30: "Mental superiority, emotional detachment — a strong, intellectual vibration; excellent for study and research, but soften the heart and stay connected.",
    31: "The Hermit — a number of independence and self-reliance; a leader who may stand alone. Success is real but solitary.",
    32: "Success & harmony — a fortunate combination of growth and balance; excellent for long-term ventures, partnerships and public work.",
    33: "The Master Teacher — a master number of compassion and guidance; powerful for healing and teaching, but it demands service over ego.",
    34: "Order & method — steady building through systems and patience; strong for business, but avoid rigidity and worry.",
    35: "Social fortune — eloquence and popularity bring opportunities; guard against scattered energy and over-socialising.",
    36: "Genius & humanity — intellectual brilliance devoted to service; watch the tendency to overthink or feel unappreciated.",
    37: "Lucky in love & friendship — deep, harmonious relationships and creative success; one of the warmest, most fortunate bonds.",
    38: "Pressure & caution — success is possible but often through strain; avoid envy, hasty decisions and questionable dealings.",
    39: "Honour & fame — public recognition, achievement and artistic success; but watch pride and self-absorption.",
    40: "Order & protection — a stable, guarded vibration; good for building quietly, but avoid isolation and complacency.",
    41: "Ambition & achievement — strong drive with visible results; channel intensity into constructive work and avoid burnout.",
    42: "Spiritual strength through adversity — trials refine the soul; patience and faith turn difficulty into wisdom and quiet power.",
    43: "Rebellion & reform — a number of change-makers and unconventional paths; constructive reform succeeds, but avoid revolt for its own sake.",
    44: "The Master of Discipline — a double-4 vibration of formidable endurance and structure; immense achievement is possible, but balance work with recovery.",
    45: "Loss & warning — a cautionary number: avoid speculation, hasty partnerships and neglect of details; what is built must be protected.",
    46: "Success through diplomacy — harmonious relations and steady effort bring reward; excellent for marriage and business alike.",
    47: "Stability & wisdom — patience and reflection produce lasting, well-earned success; a fortunate, grounded number.",
    48: "Ambition with caution — drive is strong, but impatience or misjudgement can cost you; plan carefully and act with restraint.",
    49: "Completion & transformation — a powerful number of endings that clear the way for new beginnings; release what no longer serves.",
    50: "Power through experience — authority earned by depth and endurance; a steady, commanding vibration for leadership.",
    51: "The Warrior — a fortunate, dynamic number of courage and success in battle, business and competition; act decisively and fairly.",
    52: "Adversity & endurance — progress is slow and tested; persistence through hardship builds unshakable strength and eventual reward.",
    53: "Change & renewal — transformation through knowledge; fortunate for those who embrace learning and let go of the past.",
    54: "Courage with risk — bold action brings results, but impulsiveness invites loss; temper fire with planning.",
    55: "The Magician's power — immense charisma and influence, but with a real caution against misuse; integrity decides the outcome.",
    56: "Harmony & abundance — love, comfort and growth align; a fortunate number for family, art and stable wealth.",
    57: "Intuition & breakthrough — deep insight leads to sudden, positive change; trust your inner knowing and act on it.",
    58: "Discipline with reward — Saturn's steady hand: hard, consistent work is repaid with lasting success and respect.",
    59: "Transformation through courage — change is bold and complete; let go of fear and step into the new.",
    60: "Balance & completion — a harmonious closing of cycles; rest, integrate and prepare for the next beginning.",
    61: "Independence & originality — a pioneer's number; self-reliance and fresh ideas bring success, but guard against isolation.",
    62: "Retreat & reflection — a number of the hidden counsellor; wisdom grows in quiet, then serves the world.",
    63: "Communication & charm — persuasive, popular and creative; excellent for writing, teaching and trade.",
    64: "Structure & caution — solid building with a watchful eye; avoid over-control and worry, which sap the gains.",
    65: "Change with grace — adaptability and eloquence smooth life's transitions; a fortunate number for reinvention.",
    66: "Caution in domestic life — love and home need conscious care; guard against possessiveness, indulgence and family friction.",
    67: "Wisdom & stability — a fortunate blend of insight and grounding; excellent for long-term success and teaching.",
    68: "Effort & patience — Saturn tests and then rewards; avoid pessimism and keep moving steadily toward the goal.",
    69: "Completion & courage — endings met with strength clear the path; act bravely and close old chapters cleanly.",
    70: "Introspection & wisdom — a number of the seeker; deep understanding and spiritual growth come through stillness.",
    71: "The Gift — good fortune through unexpected openings and hidden help; stay open and grateful.",
    72: "Partnership & completion — collaborative success; clear agreements and mutual respect bring the best results.",
    73: "Expansion & vision — growth through wisdom and generosity; a fortunate number for leaders and mentors.",
    74: "Structure & service — steady, reliable building in service of others; avoid rigidity and martyrdom.",
    75: "Change & opportunity — adaptability opens doors; a fortunate number for trade, travel and reinvention.",
    76: "Love & beauty — Venus's grace: harmony, art and affection flourish; watch indulgence and possessiveness.",
    77: "Deep wisdom & mystery — a powerful number of intuition and spiritual depth; guard against isolation and over-secrecy.",
    78: "Delusion & caution — glamour and material allure may mislead; verify facts, keep commitments simple and honest.",
    79: "Completion & release — the end of a karmic cycle; let go with grace and prepare for renewal.",
    80: "Power & organisation — strong, structured authority; excellent for management, but temper control with warmth.",
    81: "Achievement & wisdom — a fortunate, elevated number; disciplined effort is crowned with lasting success and respect.",
    82: "Adversity & patience — Saturn's test of endurance; steady, humble work converts hardship into authority.",
    83: "Growth & renewal — expansion through learning and letting go; a fortunate number for scholars and reformers.",
    84: "Structure & transformation — reform through discipline; change is steady and lasting when systems support it.",
    85: "Change with wisdom — adaptability guided by insight; excellent for trade, teaching and communication.",
    86: "Harmony & success — love and achievement align; a fortunate number for partnership and creative work.",
    87: "Intuition & completion — inner guidance brings cycles to a graceful close; trust the still, small voice.",
    88: "Discipline & mastery — the double-8 vibration of Saturn; immense, patient achievement is possible; avoid rigidity and self-criticism.",
    89: "Courage & completion — bold endings clear the way for new beginnings; act with strength and integrity.",
    90: "Introspection & renewal — a number of the seeker at rest; wisdom gathered in quiet prepares the next cycle.",
    91: "Independence & leadership — a pioneer's power; self-reliance and fresh vision bring success; guard against isolation.",
    92: "Partnership & insight — wisdom shared in cooperation; excellent for counselling, teaching and stable alliances.",
    93: "Expansion & service — growth through generosity and guidance; a fortunate number for mentors and healers.",
    94: "Structure & completion — steady building brings cycles to a full, satisfying close; avoid over-control.",
    95: "Change & courage — bold, adaptable action transforms circumstances; a fortunate number for reinvention.",
    96: "Love & completion — relationships and creative cycles reach fulfilment; nurture what you love.",
    97: "Wisdom & release — deep understanding allows graceful letting-go; a powerful number of inner peace.",
    98: "Patience & reward — Saturn's long game: endurance and discipline are repaid with lasting, respected success.",
    99: "Mastery & completion — the highest single-figure compound; wisdom, courage and karma align for major achievement.",
    100: "Favour of the Divine — completion of the first cycle; grace, protection and the blessing of new beginnings.",
    101: "New beginnings — unity renewed at a higher turn of the wheel; initiation and fresh leadership energy.",
    102: "Partnership with purpose — cooperation elevated by clarity; strong for unions and joint ventures with clear roles.",
    103: "Expression & growth — wisdom, communication and expansion in harmony; fortunate for teachers and creators.",
    104: "Foundation renewed — structure and discipline begin a fresh cycle; build carefully and stay flexible.",
    105: "Change & mastery — adaptability crowned with authority; a fortunate number for leaders in times of change.",
    106: "Harmony & completion — love, beauty and achievement reach fulfilment; a warm, fortunate closing.",
    107: "Wisdom & renewal — deep insight opens new beginnings; trust inner guidance and step forward.",
    108: "The Full Circle — the sacred number of completion (108 beads of the mala); karmic wholeness, protection and the blessing of a full cycle."
  },

  /* ---- Master numbers (name / business totals) ----
     In Chaldean practice master numbers apply to NAME and BUSINESS totals
     (not to birth-date reduction, which always yields Driver/Conductor 1–9). */
  masterNumbers: {
    11: { name: "Master Number 11 — The Illuminator", meaning: "The higher octave of 2: intuitive vision, inspiration and spiritual illumination. It carries great sensitivity — channel it through service, art or teaching, and guard against nervous strain and self-doubt." },
    22: { name: "Master Number 22 — The Master Builder", meaning: "The higher octave of 4 — the most powerful of the master numbers, turning grand vision into concrete reality. It demands discipline and patience; without them its energy stays as unrealised potential." },
    33: { name: "Master Number 33 — The Master Teacher", meaning: "The higher octave of 6: compassionate guidance and selfless service. The rarest and most giving vibration — its blessing is fulfilled by lifting others." }
  },

  /* ---- Name-number verdicts ---- */
  nameAdvice: {
    friendly: "Your name number vibrates in harmony with your birth numbers — no spelling change needed.",
    neutral:  "Your name number is neutral. It neither blocks nor boosts; a tuned spelling could add support.",
    enemy:    "Your name number conflicts with your birth numbers — a spelling correction is strongly recommended."
  }
};

if (typeof module !== "undefined") module.exports = DB;
