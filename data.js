/* ============================================================
   NumeroVastu 360 — Curated Vedic Numerology & Vastu Remedy DB
   Sources: standard Vedic/Chaldean numerology rules and
   classical planetary friendship, gemstone, rudraksha, mantra
   and Vastu zone mappings.
   ============================================================ */

var DB = {

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
  },

  /* ---- Excess energy (numbers repeated 3+ times) — channeling guidance ----
     A repeated number is a talent amplifier. When it overshoots it shows up as
     the negative pole of that planet; the "channel" guidance redirects the
     surplus into a fruitful, happy, wholesome direction — never adds more fuel. */
  excessEnergy: {
    1: {
      overshoot: { en: "Ego and dominance in family/team decisions, needing to be right, friction with father or authority, burnout from carrying everything alone.", hi: "परिवार/टीम के निर्णयों में अहंकार और दबदबा, हमेशा सही होने की ज़िद, पिता या अधिकार से मनमुटाव, सब कुछ अकेले ढोने से थकावट।", gu: "કુટુંબ/ટીમના નિર્ણયોમાં અહંકાર અને દબદબો, હંમેશાં સાચા હોવાની જિદ, પિતા કે સત્તા સાથે મનમુટાવ, બધું એકલા ઉપાડવાથી થાક." },
      channel: { en: "Lead by lifting others — mentor one person weekly and give credit in public; offer water to the rising Sun; donate wheat or jaggery on a Sunday as a humility practice.", hi: "दूसरों को आगे बढ़ाकर नेतृत्व करें — हर हफ्ते किसी एक को मार्गदर्शन दें और सार्वजनिक रूप से श्रेय दें; उगते सूर्य को जल अर्पित करें; विनम्रता हेतु रविवार को गेहूं या गुड़ दान करें।", gu: "બીજાને આગળ લાવીને નેતૃત્વ કરો — દર અઠવાડિયે કોઈ એકને માર્ગદર્શન આપો અને જાહેરમાં શ્રેય આપો; ઊગતા સૂર્યને જળ અર્પણ કરો; નમ્રતા માટે રવિવારે ઘઉં કે ગોળ દાન કરો." }
    },
    2: {
      overshoot: { en: "Overthinking, mood swings, emotional dependence, sleepless nights, indecision from feeling too much.", hi: "अत्यधिक सोचना, मन की लहरें, भावनात्मक निर्भरता, नींद न आना, बहुत ज़्यादा महसूस करने से असमंजस।", gu: "વધુ પડતું વિચારવું, મનની લહેરો, લાગણીશીલ નિર્ભરતા, ઊંઘ ન આવવી, વધુ પડતું અનુભવવાથી દ્વિધા." },
      channel: { en: "Channel the sensitive mind into service — write or journal nightly, spend quiet time near water; fast on Monday or serve your mother to ground the Moon.", hi: "संवेदनशील मन को सेवा में लगाएं — रात को लिखें या डायरी रखें, जल के पास शांत समय बिताएं; सोमवार को उपवास रखें या मां की सेवा करें।", gu: "સંવેદનશીલ મનને સેવામાં લગાવો — રાત્રે લખો કે ડાયરી રાખો, પાણી પાસે શાંત સમય પસાર કરો; સોમવારે ઉપવાસ રાખો કે માતાની સેવા કરો." }
    },
    3: {
      overshoot: { en: "Over-generosity, unsolicited advice, ego in teaching, spending on status, friction with children or mentors.", hi: "अति उदारता, अनचाही सलाह, सिखाने में अहंकार, प्रतिष्ठा पर खर्च, बच्चों/गुरुओं से उलझन।", gu: "અતિ ઉદારતા, અણધારી સલાહ, શીખવવામાં અહંકાર, પ્રતિષ્ઠા પર ખર્ચ, બાળકો/ગુરુ સાથે મતભેદ." },
      channel: { en: "Turn wisdom into structured teaching or writing; give knowledge (books, mentoring), not money; donate books on Thursday and practise humility in counsel.", hi: "ज्ञान को व्यवस्थित शिक्षण या लेखन में बदलें; धन नहीं, ज्ञान (पुस्तकें/मार्गदर्शन) दें; गुरुवार को पुस्तकें दान करें और सलाह में नम्रता रखें।", gu: "જ્ઞાનને વ્યવસ્થિત શિક્ષણ કે લેખનમાં ફેરવો; ધન નહીં, જ્ઞાન (પુસ્તકો/માર્ગદર્શન) આપો; ગુરુવારે પુસ્તકો દાન કરો અને સલાહમાં નમ્રતા રાખો." }
    },
    4: {
      overshoot: { en: "Restlessness, shortcuts and risky gambles, tech/gadget over-dependence, sudden volatility, distrust.", hi: "बेचैनी, शॉर्टकट और जोखिम भरे दांव, तकनीक/गैजेट पर अत्यधिक निर्भरता, अचानक उतार-चढ़ाव, अविश्वास।", gu: "બેચેની, શોર્ટકટ અને જોખમી શરત, ટેક/ગેજેટ પર અતિ નિર્ભરતા, અચાનક ઉતાર-ચઢાવ, અવિશ્વાસ." },
      channel: { en: "Channel the hunger into innovation and technology careers; discipline screen time; donate blankets or sesame on Saturday; ground decisions in routine.", hi: "इस महत्वाकांक्षा को नवाचार और तकनीकी करियर में लगाएं; स्क्रीन समय नियंत्रित करें; शनिवार को कंबल/तिल दान करें; निर्णय दिनचर्या पर टिकाएं।", gu: "આ મહત્વાકાંક્ષાને નવીનતા અને ટેક કરિયરમાં લગાવો; સ્ક્રીન સમય મર્યાદિત રાખો; શનિવારે ધાબળા/તલ દાન કરો; નિર્ણયો દિનચર્યા પર ટેકવો." }
    },
    5: {
      overshoot: { en: "Scattered focus, chatter and over-promising, nervous energy, too many deals, superficial connections.", hi: "बिखरा हुआ ध्यान, बहुत बोलना और वादों का बोझ, घबराहट भरी ऊर्जा, बहुत सारे सौदे, सतही रिश्ते।", gu: "છૂટાછવાયું ધ્યાન, વધુ બોલવું અને વચનોનો બોજ, ગભરાટ ભરી ઊર્જા, ઘણા સોદા, સપાટીપરી સંબંધો." },
      channel: { en: "Channel the speed into writing, trading, data or marketing; speak less and listen more; journal daily; donate green moong or stationery on Wednesday.", hi: "गति को लेखन, व्यापार, डेटा या मार्केटिंग में लगाएं; कम बोलें, ज़्यादा सुनें; रोज डायरी लिखें; बुधवार को हरा मूंग/स्टेशनरी दान करें।", gu: "ઝડપને લેખન, વેપાર, ડેટા કે માર્કેટિંગમાં લગાવો; ઓછું બોલો, વધુ સાંભળો; રોજ ડાયરી લખો; બુધવારે લીલા મગ/સ્ટેશનરી દાન કરો." }
    },
    6: {
      overshoot: { en: "Over-indulgence in luxury, spending, attraction or relationships, vanity, comfort-seeking.", hi: "विलासिता, खर्च, आकर्षण/रिश्तों में अति, दिखावा, आराम की तलाश की अधिकता।", gu: "વૈભવ, ખર્ચ, આકર્ષણ/સંબંધોમાં અતિ, દેખાડો, આરામની શોધ વધુ પડતી." },
      channel: { en: "Channel charm into art, hospitality or relationship counselling; enjoy beauty without excess — give white sweets or curd on Friday; make Friday a shared day of enjoyment.", hi: "आकर्षण को कला, आतिथ्य या रिश्तों की सलाह में लगाएं; सौंदर्य का आनंद संयम से लें — शुक्रवार को सफेद मिठाई/दही दान करें; शुक्रवार को साझा आनंद का दिन बनाएं।", gu: "આકર્ષણને કલા, આતિથ્ય કે સંબંધ-સલાહમાં લગાવો; સૌંદર્યનો આનંદ મર્યાદાથી લો — શુક્રવારે સફેદ મીઠાઈ/દહીં દાન કરો; શુક્રવારને સાઝો આનંદનો દિવસ બનાવો." }
    },
    7: {
      overshoot: { en: "Detachment and withdrawal, unexplained fears, isolation, sudden losses, escapism.", hi: "वैराग्य और एकांत, अज्ञात भय, अलगाव, अचानक हानि, पलायनवाद।", gu: "વૈરાગ્ય અને એકાંત, અજ્ઞાત ભય, અલગાવ, અચાનક હાનિ, પલાયનવાદ." },
      channel: { en: "Channel intuition into research, spirituality or healing; meditate 10 minutes daily; donate silently (stray dogs, blankets); stay connected to people.", hi: "अंतर्ज्ञान को शोध, अध्यात्म या चिकित्सा में लगाएं; रोज 10 मिनट ध्यान करें; बिना घोषणा दान करें (आवारा कुत्ते/कंबल); लोगों से जुड़े रहें।", gu: "અંતર્જ્ઞાનને સંશોધન, અધ્યાત્મ કે ચિકિત્સામાં લગાવો; રોજ 10 મિનિટ ધ્યાન કરો; જાહેરાત વગર દાન કરો (રખડતા કૂતરા/ધાબળા); લોકો સાથે જોડાયેલા રહો." }
    },
    8: {
      overshoot: { en: "Overwork and burnout, pessimism, delays and blame, controlling others, joint or bone strain.", hi: "अति परिश्रम और थकावट, निराशावाद, विलंब और दोषारोपण, दूसरों को नियंत्रित करना, जोड़ों/हड्डियों में खिंचाव।", gu: "વધુ પડતું કામ અને થાક, નિરાશાવાદ, વિલંબ અને દોષારોપણ, બીજાને નિયંત્રિત કરવું, સાંધા/હાડકાંની તાણ." },
      channel: { en: "Delegate Saturn's workload; serve workers and elders; donate oil, iron or black sesame on Saturday; take one rest day and structure work in cycles.", hi: "शनि का बोझ बांटें — काम सौंपें; मजदूरों/बड़ों की सेवा करें; शनिवार को तेल, लोहा या काले तिल दान करें; एक विश्राम दिवस रखें और काम को चक्रों में बांटें।", gu: "શનિનો બોજો વહેંચો — કામ સોંપો; મજૂરો/વડીલોની સેવા કરો; શનિવારે તેલ, લોખંડ કે કાળા તલ દાન કરો; એક વિશ્રાંતિ દિવસ રાખો અને કામને ચક્રોમાં વહેંચો." }
    },
    9: {
      overshoot: { en: "Anger, impulsive action, conflict, accidents, fiery arguments, a dominating force.", hi: "क्रोध, आवेशपूर्ण कार्य, संघर्ष, दुर्घटनाएं, तीखी बहस, दबदबे की शक्ति।", gu: "ક્રોધ, આવેશી કાર્ય, સંઘર્ષ, અકસ્માત, તીખી દલીલ, દબદબાની શક્તિ." },
      channel: { en: "Channel Mars into sport, exercise, martial arts or seva; count to ten before speaking; donate red lentils or red cloth on Tuesday; lead by protecting, not fighting.", hi: "मंगल को खेल, व्यायाम, मार्शल आर्ट या सेवा में लगाएं; बोलने से पहले दस तक गिनें; मंगलवार को मसूर की दाल/लाल कपड़ा दान करें; रक्षक बनकर नेतृत्व करें, लड़ाकू नहीं।", gu: "મંગળને રમત, કસરત, માર્શલ આર્ટ કે સેવામાં લગાવો; બોલતાં પહેલાં દસ સુધી ગણો; મંગળવારે મસૂર/લાલ કાપડ દાન કરો; લડાકુ નહીં, રક્ષક બનીને નેતૃત્વ કરો." }
    }
  },

  /* ---- Ayurvedic Dosha Layer (Jyotish–Ayurveda constitutional map) ----
     Each Vedic number carries a classical planetary dosha signature.
     In this app it is used only as traditional wellness guidance: a
     constitution-level lifestyle scaffold that explains the "why" behind
     the existing remedy kits. It is never a diagnosis or medical claim. */
  dosha: {
    1: {
      dominant: "Pitta",
      nature: { en: "Solar-fire constitution — naturally warm digestion, focused will, leadership and inner heat.", hi: "सूर्य-अग्नि प्रकृति — स्वाभाविक रूप से गर्म पाचन, केंद्रित इच्छाशक्ति, नेतृत्व और भीतर की ऊष्मा।", gu: "સૂર્ય-અગ્નિ પ્રકૃતિ — કુદરતી રીતે ગરમ પાચન, કેન્દ્રિત ઇચ્છાશક્તિ, નેતૃત્વ અને અંદરની ઊષ્મા." },
      aggravation: { en: "Inflammation, acidity, irritability, ego-heat, midday heat exhaustion and skin sensitivity to sun.", hi: "जलन, एसिडिटी, चिड़चिड़ापन, अहं-ऊष्मा, दोपहर की गर्मी से थकावट और सूर्य से त्वचा की संवेदनशीलता।", gu: "બળતરા, એસિડિટી, ચિડિચિડાપણું, અહં-ઊષ્મા, બપોરની ગરમીથી થાક અને સૂર્યથી ત્વચાની સંવેદનશીલતા." },
      balancingFoods: { en: "Cooling, sweet and bitter foods: cucumber, fennel, coriander, coconut water, melon and cooled grains.", hi: "ठंडे, मीठे और कड़वे आहार: खीरा, सौंफ, धनिया, नारियल पानी, खरबूजा और ठंडा अनाज।", gu: "ઠંડા, મીઠા અને કડવા આહાર: કાકડી, સુંફ, ધાણા, નારિયેળ પાણી, તરબૂચ અને ઠંડું અનાજ." },
      routine: { en: "Start before sunrise with Surya arghya; avoid noon sun exertion; keep meals warm but not spicy; schedule a short cool-down rest after noon.", hi: "सूर्योदय से पहले सूर्य अर्घ्य दें; दोपहर की धूप में परिश्रम से बचें; भोजन गर्म पर अति-मसालेदार नहीं व तेल हल्का; दोपहर बाद थोड़ा ठंडा विश्राम रखें।", gu: "સૂર્યોદય પહેલાં સૂર્ય અર્ઘ્ય આપો; બપોરના તડકામાં પરિશ્રમ ટાળો; ભોજન ગરમ પણ વધુ મસાલેદાર નહીં; બપોર પછી થોડો ઠંડો વિશ્રામ લો." },
      mantraLinkedNote: { en: "The Sunday / Surya fast and water-offering work best when paired with cooling foods and an early start — the ritual cools solar heat instead of adding dry intensity.", hi: "रविवार / सूर्य का व्रत और जल-अर्घ्य ठंडे आहार व सुबह की शुरुआत के साथ सर्वोत्तम लाभ देते हैं — यह उपाय सूर्य-ऊष्मा को ठंडा करता है, तीव्रता नहीं बढ़ाता।", gu: "રવિવાર / સૂર્યનો ઉપવાસ અને જળ-અર્ઘ્ય ઠંડા આહાર સાથે અને વહેલી શરૂઆત સાથે શ્રેષ્ઠ લાભ આપે છે — આ ઉપાય સૂર્ય-ઊષ્માને ઠંડી કરે છે, તીવ્રતા નહીં વધારે." }
    },
    2: {
      dominant: "Kapha–Vata",
      nature: { en: "Moon constitution — watery, rhythmic, caring, with a sensitive mind and a calm, fluid body memory.", hi: "चंद्र प्रकृति — जलमय, लयबद्ध, स्नेही, संवेदनशील मन और शांत, तरल शरीर-स्मृति।", gu: "ચંદ્ર પ્રકૃતિ — જલમય, લયબદ્ધ, સ્નેહી, સંવેદનશીલ મન અને શાંત, પ્રવાહી શરીર-સ્મૃતિ." },
      aggravation: { en: "Fluid retention plus anxious overthinking, disturbed sleep, emotional dependence and cyclical heaviness.", hi: "जल-संचय के साथ चिंताग्रस्त अतिविचार, नींद न आना, भावनात्मक निर्भरता और चक्रीय भारीपन।", gu: "પ્રવાહીના જથ્થા સાથે ચિંતાપૂર્ણ અતિવિચાર, ઊંઘ ન આવવી, લાગણીશીલ નિર્ભરતા અને ચક્રીય ભારેપણું." },
      balancingFoods: { en: "Warm, light, easily digestible foods: cooked vegetables, ginger, small lentil soup and star-anise tea; avoid excessive cold and heavy dairy.", hi: "गर्म, हल्के और सुपाच्य आहार: उबली सब्जियां, अदरक, हल्की दाल सूप व चक्रफूल चाय; अत्यधिक ठंडा और भारी डेयरी से बचें।", gu: "ગરમ, હળવા અને સુપાચ્ય આહાર: બાફેલી શાકભાજી, આદુ, હળવી દાળ સૂપ અને સુંગધ ચા; વધુ ઠંડું અને ભારે ડેરી ટાળો." },
      routine: { en: "Anchor the Moon with a fixed sleep time, a silver-glass water habit, journaling before bed and light evening movement.", hi: "चंद्रमा को निर्धारित सोने के समय, चांदी के गिलास में पानी, रात में डायरी और हल्की शाम की यात्रा-गति से स्थिर करें।", gu: "ચંદ્રને નિશ્ચિત સૂવાના સમય, ચાંદીના ગ્લાસમાં પાણીની આદત, સાંજે ડાયરી અને હળવી સાંજની ગતિથી સ્થિર કરો." },
      mantraLinkedNote: { en: "The Monday Moon fast and silver-water practice work best with a steady bedtime — the Moon calms through rhythm, not restriction.", hi: "सोमवार का चंद्र व्रत और चांदी का जल स्थिर सोने के समय के साथ सर्वोत्तम हैं — चंद्रमा नियम (लय) से शांत होता है, निषेध से नहीं।", gu: "સોમવારનો ચંદ્ર ઉપવાસ અને ચાંદીનું જળ સ્થિર સૂવાના સમય સાથે શ્રેષ્ઠ છે — ચંદ્ર લયથી શાંત થાય છે, નિષેધથી નહીં." }
    },
    3: {
      dominant: "Kapha",
      nature: { en: "Kapha constitution — steady, generous, wise, slow to change but deeply loyal and grounded.", hi: "कफ प्रकृति — स्थिर, उदार, बुद्धिमान, बदलने में धीमा पर गहरा स्नेही और आधारभूत।", gu: "કફ પ્રકૃતિ — સ્થિર, ઉદાર, બુદ્ધિશાળી, બદલવામાં ધીમી પણ ઊંડો સ્નેહી અને આધારભૂત." },
      aggravation: { en: "Heaviness, congestion, lethargy, weight stagnation and a tendency to accumulate — in food, money or obligations.", hi: "भारीपन, जकड़न, आलस्य, वजन में रुकावट और संचय की प्रवृत्ति — भोजन, धन या जिम्मेदारियों में।", gu: "ભારેપણું, જકડાણ, આળસ, વજનમાં અટકાવ અને સંચયની વૃત્તિ — ભોજન, ધન કે જવાબદારીઓમાં." },
      balancingFoods: { en: "Light, warm, pungent foods: ginger, turmeric, oats, millets and hot water through the day; less cold and heavy dairy.", hi: "हल्का, गर्म और तीखा आहार: अदरक, हल्दी, ओट्स, मोटे अनाज और दिनभर गर्म पानी; ठंडा व भारी डेयरी कम।", gu: "હળવો, ગરમ અને તીખો આહાર: આદુ, હળદર, ઓટ્સ, બાજરી અને દિવસભર ગરમ પાણી; ઠંડી અને ભારે ડેરી ઓછી." },
      routine: { en: "Move daily — brisk walk, stair climbing or pranayama before breakfast; take the largest meal before sunset; keep Thursday learning active.", hi: "रोज चलें — नाश्ते से पहले तेज सैर, सीढ़ियां या प्राणायाम; सबसे बड़ा भोजन सूर्यास्त से पहले; गुरुवार का अध्ययन सक्रिय रखें।", gu: "રોજ ચાલો — નાસ્તા પહેલાં ઝડપી સૈર, સીડી કે પ્રાણાયામ; સૌથી મોટું ભોજન સૂર્યાસ્ત પહેલાં; ગુરુવારનો અભ્યાસ સક્રિય રાખો." },
      mantraLinkedNote: { en: "The Thursday Jupiter routine acts as a mental heater — add real movement so wealth ideas do not settle into storage.", hi: "गुरुवार का जीवनशैली उपाय मानसिक ऊष्मक है — इसमें वास्तविक शारीरिक गति जोड़ें ताकि धन की सोच भंडार में न पड़ी रहे।", gu: "ગુરુવારનો જીવનશૈલી ઉપાય માનસિક ઊષ્મક છે — તેમાં વાસ્તવિક શારીરિક ગતિ ઉમેરો જેથી ધનના વિચાર સંગ્રહમાં ન પડી રહે." }
    },
    4: {
      dominant: "Vata",
      nature: { en: "Rahu constitution — quick, unconventional, technology-driven, with a restless mind and sudden bursts of change.", hi: "राहु प्रकृति — तेज़, अपारंपरिक, तकनीक-चालित, बेचैन मन और अचानक बदलाव की लहरें।", gu: "રાહુ પ્રકૃતિ — ઝડપી, અપરંપરાગત, ટેક-આધારિત, બેચેન મન અને અચાનક બદલાવની લહેરો." },
      aggravation: { en: "Nervous restlessness, erratic routine, obsessive loops, phone or tech overuse and feeling scattered.", hi: "घबराहट भरी बेचैनी, अस्त-व्यस्त दिनचर्या, जुनूनी चक्र, फोन/तकनीक अति-प्रयोग और मन का बिखराव।", gu: "ગભરાટ ભરી બેચેની, અસ્તવ્યસ્ત દિનચર્યા, જુનૂની ચક્ર, ફોન/ટેક અતિ-ઉપયોગ અને મનનું છૂટાછવાયું થવું." },
      balancingFoods: { en: "Warm, moist, grounding foods: cooked grains, sesame, ghee, soups and root vegetables; regular warm meals instead of snack-drifting.", hi: "गर्म, नम और स्थिर आहार: पका अनाज, तिल, घी, सूप व जड़ वाली सब्जियां; स्नैक-अनियमितता के बजाय नियमित गर्म भोजन।", gu: "ગરમ, ભેજવાળો અને સ્થિર આહાર: શેકેલું ધાન, તલ, ઘી, સૂપ અને મૂળ શાકભાજી; નાસ્તાના તણાવને બદલે નિયમિત ગરમ ભોજન." },
      routine: { en: "Ground the routine: fixed meal and sleep times, screens off after sunset, one daily walk and a written plan each morning.", hi: "दिनचर्या स्थिर करें: भोजन और नींद का नियत समय, सूर्यास्त के बाद स्क्रीन बंद, रोज एक सैर और सुबह की लिखित योजना।", gu: "દિનચર્યા સ્થિર કરો: ભોજન અને ઊંઘનો નિયત સમય, સૂર્યાસ્ત પછી સ્ક્રીન બંધ, રોજ એક સૈર અને સવારની લેખિત યોજના." },
      mantraLinkedNote: { en: "Rahu is disciplined by time — the Saturday sesame/blanket giving works when paired with screens off at night and one non-negotiable meal time.", hi: "राहु समय से अनुशासित होता है — शनिवार के तिल/कंबल दान का असर तब बनता है जब रात में स्क्रीन बंद और भोजन का एक अटल समय हो।", gu: "રાહુ સમયથી શિસ્તમાં રહે છે — શનિવારના તલ/ધાબળા દાનની અસર ત્યારે બનતી જ્યારે રાત્રે સ્ક્રીન બંધ અને ભોજનનો એક અટલ સમય હોય." }
    },
    5: {
      dominant: "Tridoshic",
      nature: { en: "Mercury constitution — the balancer of the three doshas: changeable, communicative, adaptable and able to correct over time.", hi: "बुध प्रकृति — तीनों दोषों का संतुलक: परिवर्तनशील, संवादात्मक, अनुकूलनशील और समय के साथ सुधारने वाला।", gu: "બુધ પ્રકૃતિ — ત્રણેય દોષનો સંતુલક: પરિવર્તનશીલ, સંવાદાત્મક, અનુકૂલનશીલ અને સમય સાથે સુધારતો." },
      aggravation: { en: "Overthinking, irregular digestion, scattered nerves, excessive talking and inconsistent routine.", hi: "अतिविचार, अनियमित पाचन, बिखरी नसें, अति-बोलना और असंगत दिनचर्या।", gu: "અતિવિચાર, અનિયમિત પાચન, છૂટાછવાયા ચેતા-તંત્ર, વધુ બોલવું અને સંગત નહીં દિનચર્યા." },
      balancingFoods: { en: "Simple, regular, easy-to-digest meals: light grains, cooked salad, herbs and a daily green-vegetable dish; avoid grazing and excess coffee.", hi: "साधारण, नियमित और सुपाच्य भोजन: हल्का अनाज, हरा सलाद, जड़ी-बूटियां व रोज की हरी सब्जी; बार-बार खाना और अधिक कॉफी से बचें।", gu: "સાદું, નિયમિત અને સુપાચ્ય ભોજન: હળવું અનાજ, કાચું સલાડ, જડીબુટ્ટી અને રોજની લીલી શાકભાજી; વારંવાર ખાવું અને વધુ કોફી ટાળો." },
      routine: { en: "Use the Wednesday Mercury habit as a reset — speak less, journal more, keep fixed wake/sleep windows and regular meal times.", hi: "बुधवार की आदत को रीसेट बनाएं — कम बोलें, अधिक लिखें, सोने-जागने का नियत समय और भोजन के नियमित समय।", gu: "બુધવારની આદતને રીસેટ બનાવો — ઓછું બોલો, વધુ લખો, ઊંઘ-જાગવાનો નિયત સમય અને નિયમિત ભોજનના સમય." },
      mantraLinkedNote: { en: "Mercury is the natural equaliser — its mantra and weekly green/stationery giving are especially useful when another dosha runs too high.", hi: "बुध स्वाभाविक संतुलक है — उसका मंत्र और साप्ताहिक हरा/स्टेशनरी दान विशेष रूप से तब काम आता है जब कोई दूसरा दोष बढ़ रहा हो।", gu: "બુધ સ્વાભાવિક સંતુલક છે — તેનો મંત્ર અને સાપ્તાહિક લીલું/સ્ટેશનરી દાન ખાસ ત્યારે કામ આવે છે જ્યારે કોઈ બીજો દોષ વધતો હોય." }
    },
    6: {
      dominant: "Vata–Kapha",
      nature: { en: "Venus constitution — relational, artistic, comfort-seeking, with both a refined sweet side and a lazy digestive side.", hi: "शुक्र प्रकृति — संबंध-प्रधान, कलात्मक, सुख-सुविधा चाहने वाली; एक ओर सुंदर मिठास, दूसरी ओर धीमा पाचन।", gu: "શુક્ર પ્રકૃતિ — સંબંધ-પ્રધાન, કલાત્મક, આરામ શોધનાર; એક બાજુ સુંદર મીઠાશ, બીજી બાજુ ધીમું પાચન." },
      aggravation: { en: "Indulgence, cravings, reproductive or comfort excess, heavy rich foods and over-attachment to pleasure.", hi: "भोग-विलास, लालसा, प्रजनन/सुख-सुविधा की अति, भारी मिठास और सुखदायी खाने से अधिक जुड़ाव।", gu: "ભોગ-વિલાસ, લાલસા, પ્રજનન/આરામની અતિ, ભારે મીઠી વસ્તુઓ અને સુખદ ભોજન સાથે વધુ જોડાણ." },
      balancingFoods: { en: "Light, aromatic, balanced food: fresh greens, lentils, rose water and fennel; avoid prolonged sugar, heavy cream and late-night sweets.", hi: "हल्का, सुगंधित और संतुलित भोजन: ताजे साग, दालें, गुलाब जल व सौंफ; लंबे समय तक चीनी, भारी क्रीम और रात की मिठाइयों से बचें।", gu: "હળવો, સુગંધિત અને સંતુલિત આહાર: તાજા લીલા શાક, દાળ, ગુલાબજળ અને સુંફ; લાંબા સમય સુધી ખાંડ, ભારે ક્રીમ અને રાત્રિની મીઠાઈ ટાળો." },
      routine: { en: "Keep Friday a shared enjoyable day, but with a clear boundary — one treat, then movement, long walk or dance; keep relationships light, not clinging.", hi: "शुक्रवार को साझा आनंद का दिन रखें पर स्पष्ट सीमा — एक मिठाई, फिर गति, सैर या नृत्य; रिश्ते हल्के रखें, जकड़ें नहीं।", gu: "શુક્રવારને સાઝો આનંદનો દિવસ રાખો પણ સ્પષ્ટ મર્યાદા — એક મીઠાઈ, પછી ગતિ, ચાલ કે નૃત્ય; સંબંધ હળવા રાખો, જકડો નહીં." },
      mantraLinkedNote: { en: "The Friday Venus cures work best with moderation — white sweets and comfort need a companion walk, or the treat becomes the aggravation.", hi: "शुक्रवार के शुक्र उपाय संयम के साथ सर्वोत्तम हैं — सफेद मिठाई और सुख-सुविधा के साथ सैर जरूरी है, अन्यथा भोग ही दोष बन जाता है।", gu: "શુક્રવારના શુક્ર ઉપાય સંયમ સાથે શ્રેષ્ઠ છે — સફેદ મીઠાઈ અને આરામની સાથે ચાલ જરૂરી છે, નહીંતર ભોગ જ દોષ બની જાય." }
    },
    7: {
      dominant: "Pitta",
      nature: { en: "Ketu constitution — piercing insight, research ability, spiritual heat, with a precise but often detached fire.", hi: "केतु प्रकृति — गहरी दृष्टि, शोध-क्षमता, आध्यात्मिक ऊष्मा; सूक्ष्म पर प्रायः विरक्त अग्नि।", gu: "કેતુ પ્રકૃતિ — ઊંડી દૃષ્ટિ, સંશોધન-ક્ષમતા, આધ્યાત્મિક ઊષ્મા; સૂક્ષ્મ પણ સામાન્યતઃ અલગ અગ્નિ." },
      aggravation: { en: "Sudden heat spikes, skin sensitivity, ungrounded intensity and irritation from feeling invisible or disconnected.", hi: "अचानक ऊष्मा-लहरें, त्वचा की संवेदनशीलता, बेजड़ तीव्रता और अदृश्य/विच्छिन्न महसूस होने से चिड़चिड़ापन।", gu: "અચાનક ઊષ્મા-લહેરો, ત્વચાની સંવેદનશીલતા, બેજડ તીવ્રતા અને અદ્રશ્ય/વિચ્છિન્ન લાગવાથી ચિડિચિડાપણું." },
      balancingFoods: { en: "Cooling, gentle, clean foods: coconut, coriander, bitter greens, rice and warm milk; avoid fermented, pungent and late-night hot food.", hi: "ठंडे, कोमल और साफ आहार: नारियल, धनिया, कड़वे साग, चावल और गर्म दूध; किण्वित, तीखा और रात को गर्म-भारी भोजन से बचें।", gu: "ઠંડા, નમ્ર અને શુદ્ધ આહાર: નારિયેળ, ધાણા, કડવા લીલા શાક, ચોખા અને ગરમ દૂધ; કિણ્વિત, તીખું અને રાત્રે ગરમ-ભારે ભોજન ટાળો." },
      routine: { en: "Ground the inward fire: 10 minutes of meditation daily, silent charity, time outdoors in the morning and one quiet evening without screens.", hi: "आंतरिक अग्नि को स्थिर करें: रोज 10 मिनट ध्यान, मौन दान, सुबह खुले में समय और बिना स्क्रीन की शांत शाम।", gu: "આંતરિક અગ્નિને સ્થિર કરો: રોજ ૧૦ મિનિટ ધ્યાન, મૌન દાન, સવારે ખુલ્લામાં સમય અને સ્ક્રીન વગરની શાંત સાંજ." },
      mantraLinkedNote: { en: "The Ketu mantra opens awareness — keep it paired with silent giving and early grounding so heat becomes direction, not a spike.", hi: "केतु मंत्र जागरूकता खोलता है — इसे मौन दान और सुबह की स्थिरता के साथ रखें ताकि ऊष्मा दिशा बने, न कि अचानक लहर।", gu: "કેતુ મંત્ર જાગૃતતા ખોલે છે — તેને મૌન દાન અને સવારની સ્થિરતા સાથે રાખો જેથી ઊષ્મા દિશા બને, નહીં કે અચાનક લહેર." }
    },
    8: {
      dominant: "Vata",
      nature: { en: "Saturn constitution — structured, enduring, detail-focused, with a dry, cold and hardworking physical tone.", hi: "शनि प्रकृति — संरचित, सहनशील, बारीकी-केंद्रित; शुष्क, ठंडा और परिश्रमी शारीरिक स्वर।", gu: "શનિ પ્રકૃતિ — માળખાગત, ટકાઉ, ઝીણવટ-કેન્દ્રિત; શુષ્ક, ઠંડો અને પરિશ્રમી શારીરિક સ્વર." },
      aggravation: { en: "Dryness, joint stiffness, cold limbs, chronic worry, overwork and burnout from holding too much.", hi: "शुष्कता, जोड़ों की जकड़न, ठंडे अंग, चिर-चिंता, अति-परिश्रम और अधिक संभालने से थकावट।", gu: "શુષ્કતા, સાંધાની જકડાણ, ઠંડા અંગ, લાંબી ચિંતા, વધુ કામ અને બહુ સંભાળવાથી થાક." },
      balancingFoods: { en: "Warm, oily, grounding foods: sesame, ghee, cooked rice, root vegetables and warm milk; avoid dry, raw, cold and instant snacking.", hi: "गर्म, स्निग्ध और स्थिर आहार: तिल, घी, पका चावल, जड़ वाली सब्जियां, गर्म दूध; सूखा, कच्चा, ठंडा और झटपट स्नैक से बचें।", gu: "ગરમ, તૈલી અને સ્થિર આહાર: તલ, ઘી, શેકેલું ચોખા, મૂળ શાકભાજી, ગરમ દૂધ; સૂકું, કાચું, ઠંડું અને ઝટપટ નાસ્તો ટાળો." },
      routine: { en: "Regular meal times, warm oil massage (abhyanga) on Saturday or before bed, one rest day and short structured work cycles with breaks.", hi: "भोजन का नियत समय, शनिवार या सोने से पहले गर्म तेल मालिश (अभ्यंग), एक विश्राम दिवस और ब्रेक-सहित छोटे कार्य-चक्र।", gu: "ભોજનનો નિયત સમય, શનિવારે કે સૂતાં પહેલાં ગરમ તેલ માલિશ (અભ્યંગ), એક વિશ્રામ દિવસ અને વિરામ સાથે ટૂંકાં કામ-ચક્ર." },
      mantraLinkedNote: { en: "The Saturday Saturn practice — oil, iron and black sesame giving — works because it adds warmth and rhythm to dry, over-worked Vata energy.", hi: "शनिवार का शनि उपाय — तेल, लोहा और काले तिल — शुष्क, अधिक-काम वाली वात ऊर्जा में गर्मी और लय जोड़ने के कारण कार्य करता है।", gu: "શનિવારનો શનિ ઉપાય — તેલ, લોખંડ અને કાળા તલ — શુષ્ક, વધુ કામવાળી વાત ઊર્જામાં ગરમી અને લય ઉમેરવાથી કામ કરે છે." }
    },
    9: {
      dominant: "Pitta",
      nature: { en: "Mars constitution — brave, driven, protective, with a hot, fiery metabolism and an instinct to act now.", hi: "मंगल प्रकृति — साहसी, प्रेरित, रक्षक; गर्म, ज्वलंत चयापचय और अभी-अभी करने की प्रवृत्ति।", gu: "મંગળ પ્રકૃતિ — હિંમતવાન, પ્રેરિત, રક્ષક; ગરમ, અગ્નિમય ચયાપચય અને તરત કરવાની વૃત્તિ." },
      aggravation: { en: "Anger-flashes, blood-pressure heat, inflammation, impatience and burning out from too much intensity.", hi: "क्रोध की लहरें, रक्तचाप-ऊष्मा, जलन, अधीरता और अति-तीव्रता से जलना।", gu: "ક્રોધની લહેરો, બ્લડપ્રેશર-ઊષ્મા, બળતરા, અધીરાઈ અને અતિ-તીવ્રતાથી બળવું." },
      balancingFoods: { en: "Cooling, sweet and hydrating foods: cucumber, coconut, mint, watermelon and barley water; avoid very spicy, fried and alcoholic heat.", hi: "ठंडे, मीठे और जलयुक्त आहार: खीरा, नारियल, पुदीना, तरबूज, जौ का पानी; अति-मसालेदार, तला और शराब से बचें।", gu: "ઠંડા, મીઠા અને જળયુક્ત આહાર: કાકડી, નારિયેળ, ફુદીના, તરબૂચ, જવનું પાણી; વધુ મસાલેદાર, તળેલું અને આલ્કોહોલ ટાળો." },
      routine: { en: "Channel the fire: daily exercise or sport, count to ten before speaking, morning movement over evening intensity and a cool-down after conflict.", hi: "अग्नि को दिशा दें: रोज व्यायाम/खेल, बोलने से पहले दस तक गिनें, शाम की तीव्रता से बेहतर सुबह की गति, और विवाद के बाद ठंडा होना।", gu: "અગ્નિને દિશા આપો: રોજ કસરત/રમત, બોલતાં પહેલાં દસ સુધી ગણો, સાંજની તીવ્રતા કરતાં સવારની ગતિ, અને વિવાદ પછી ઠંડા થવું." },
      mantraLinkedNote: { en: "The Tuesday Mars remedy works when paired with physical release — red lentils and red cloth are for protection; exercise is the pressure valve.", hi: "मंगलवार का मंगल उपाय शारीरिक निष्कासन के साथ काम करता है — लाल दाल और लाल कपड़ा रक्षा के लिए हैं; व्यायाम दबाव-नली है।", gu: "મંગળવારનો મંગળ ઉપાય શારીરિક નિકાલ સાથે કામ કરે છે — લાલ દાળ અને લાલ કાપડ રક્ષણ માટે છે; કસરત દબાણ-નળી છે." }
    }
  },

  /* ---- Deity Protection Layer (classical number → ishta devta map) ----
     Every birth number 1–9 carries a guardian deity (ishta devta) in the
     Hindu tradition; knowing and keeping one's own ishta is itself a shield.
     Each entry: god (trilingual name), the classical mantra (Devanagari +
     IAST), the primary chant, the 108× round, offerings (naivedya), everyday
     support materials and a protection note. Framed strictly as traditional
     spiritual guidance — the reader's own family tradition and guru's
     instruction always take priority. */
  deity: {
    1: {
      god: { en: "Lord Surya", hi: "भगवान सूर्य", gu: "ભગવાન સૂર્ય" },
      mantra: "ॐ मित्राय नमः (Om Mitraya Namah)",
      primaryChant: { en: "11× each morning, facing the rising sun, before work", hi: "सुबह सूर्य की ओर मुख करके, कार्य शुरू करने से पहले 11×", gu: "સવારે સૂર્ય તરફ મોં કરીને, કામ શરૂ કરતાં પહેલાં 11×" },
      weeklyChant: { en: "108× on Sundays", hi: "रविवार को 108×", gu: "રવિવારે 108×" },
      offerings: { en: "Water, honey or jaggery offered to the sun (Surya arghya)", hi: "सूर्य को जल, शहद या गुड़ (सूर्य अर्घ्य)", gu: "સૂર્યને જળ, મધ કે ગોળ (સૂર્ય અર્ઘ્ય)" },
      support: { en: "Wheat, jaggery or copper; wear saffron on Sundays", hi: "गेहूं, गुड़ या तांबा; रविवार को केसरिया पहनें", gu: "ઘઉં, ગોળ કે તાંબું; રવિવારે કેસરી પહેરો" },
      protectionNote: { en: "Surya guards the authority and confidence behind this number — when recognition, status or self-belief feels blocked, the morning sun-facing chant steadies the field first.", hi: "सूर्य इस अंक के पीछे के अधिकार और आत्मविश्वास की रक्षा करते हैं — मान, स्थिति या आत्म-विश्वास रुका लगे तो सुबह की सूर्य-मुखी साधना पहले ही मयदान को स्थिर कर देती है।", gu: "સૂર્ય આ અંક પાછળના અધિકાર અને આત્મવિશ્વાસની રક્ષા કરે છે — માન, સ્થિતિ કે આત્મ-વિશ્વાસ અટકેલો લાગે તો સવારની સૂર્ય-મુખી સાધના પહેલાં જ મેદાનને સ્થિર કરી દે છે." }
    },
    2: {
      god: { en: "Lord Shiva", hi: "भगवान शिव", gu: "ભગવાન શિવ" },
      mantra: "ॐ नमः शिवाय (Om Namah Shivaya)",
      primaryChant: { en: "11× in the early morning on an empty stomach", hi: "सुबह उठते ही, खाली पेट 11×", gu: "સવારે ઉઠતાં જ, ખાલી પેટે 11×" },
      weeklyChant: { en: "108× on Mondays", hi: "सोमवार को 108×", gu: "સોમવારે 108×" },
      offerings: { en: "Milk, white flowers and bilva leaves", hi: "दूध, सफेद फूल और बिल्व पत्ती", gu: "દૂધ, સફેદ ફૂલ અને બિલ્વ પાન" },
      support: { en: "Milk, white flowers or white cloth; wear white on Mondays", hi: "दूध, सफेद फूल या सफेद कपड़ा; सोमवार को सफेद पहनें", gu: "દૂધ, સફેદ ફૂલ કે સફેદ કાપડ; સોમવારે સફેદ પહેરો" },
      protectionNote: { en: "Shiva protects the Moon's calm — when emotions, sleep or the household mood run rough, the five-syllable chant steadies the mind first, and the chart follows.", hi: "शिव चंद्र की शांति की रक्षा करते हैं — भावनाएं, नींद या घर का मूड खराब हो तो पाँच-अक्षरी मंत्र पहले मन को स्थिर करता है, फिर पूरा चार्ट।", gu: "શિવ ચંદ્રની શાંતિની રક્ષા કરે છે — લાગણીઓ, ઊંઘ કે ઘરનો મૂડ ખરાબ થાય તો પાંચ-અક્ષરિય મંત્ર પહેલાં મનને સ્થિર કરે છે, પછી આખું ચાર્ટ." }
    },
    3: {
      god: { en: "Lord Vishnu", hi: "भगवान विष्णु", gu: "ભગવાન વિષ્ણુ" },
      mantra: "ॐ नमो भगवते वासुदेवाय (Om Namo Bhagavate Vasudevaya)",
      primaryChant: { en: "11× before study, advice or any new commitment", hi: "अध्ययन, सलाह या किसी नए वादे से पहले 11×", gu: "અભ્યાસ, સલાહ કે કોઈ નવા વચન પહેલાં 11×" },
      weeklyChant: { en: "108× on Thursdays", hi: "गुरुवार को 108×", gu: "ગુરુવારે 108×" },
      offerings: { en: "Tulsi leaves, yellow flowers and honey (panak)", hi: "तुलसी पत्ती, पीले फूल और शहद (पनाक)", gu: "તુલસી પાન, પીળા ફૂલ અને મધ (પનાક)" },
      support: { en: "Yellow flowers, tulsi or yellow cloth; give books or sweets on Thursdays", hi: "पीले फूल, तुलसी या पीला कपड़ा; गुरुवार को पुस्तकें या मिठाई दान करें", gu: "પીળા ફૂલ, તુલસી કે પીળું કાપડ; ગુરુવારે પુસ્તકો કે મિઠાઈ દાન કરો" },
      protectionNote: { en: "Vishnu sustains the Guru's dharma and reputation — when wealth, faith or a respected position feels shaken, this chant holds what has already been built.", hi: "विष्णु गुरु के धर्म और मान-सम्मान की रक्षा करते हैं — धन, विश्वास या सम्मानित स्थिति हिलती लगे तो यह मंत्र बना-बसाए हुए को सहारा देता है।", gu: "વિષ્ણુ ગુરુના ધર્મ અને માન-સન્માનની રક્ષા કરે છે — ધન, વિશ્વાસ કે સન્માનિત સ્થિતિ હિલતી લાગે તો આ મંત્ર બનાવેલાને સહારો આપે છે." }
    },
    4: {
      god: { en: "Maa Durga", hi: "माँ दुर्गा", gu: "મા દુર્ગા" },
      mantra: "ॐ दुं दुर्गायै नमः (Om Dum Durgaye Namah)",
      primaryChant: { en: "11× whenever plans feel confusing or sudden", hi: "जब भी योजनाएं भ्रमपूर्ण या अचानक लगे, 11×", gu: "જ્યારેય યોજનાઓ ગૂંચવાડભર્યી કે અચાનક લાગે, 11×" },
      weeklyChant: { en: "108× on Saturdays (Rahu's day)", hi: "शनिवार को (राहु का वार) 108×", gu: "શનિવારે (રાહુનો વાર) 108×" },
      offerings: { en: "Kumkum, red flowers and a diya of sesame oil", hi: "कुंकुम, लाल फूल और तिल के तेल की दीया", gu: "કુંકમ, લાલ ફૂલ અને તલના તેલનો દીવો" },
      support: { en: "Kumkum, red flowers or red cloth; wear red on Rahu's day", hi: "कुंकुम, लाल फूल या लाल कपड़ा; राहु के वार लाल पहनें", gu: "કુંકમ, લાલ ફૂલ કે લાલ કાપડ; રાહુના વાર લાલ પહેરો" },
      protectionNote: { en: "Durga is the shield against Rahu's illusions — sudden distractions, wrong decisions and restless tech loops break against her protection.", hi: "दुर्गा राहु के भ्रम की कवच हैं — अचानक उठने वाला विचलन, गलत निर्णय और बेचैन तकनीकी चक्र उनकी रक्षा से टूटते हैं।", gu: "દુર્ગા રાહુના ભ્રમનું કવચ છે — અચાનક ઊભું થતું વિચલન, ખોટા નિર્ણય અને બેચેન ટેક ચક્ર તેની રક્ષાથી તૂટી જાય છે." }
    },
    5: {
      god: { en: "Lord Ganesha", hi: "श्री गणेश", gu: "શ્રી ગણેશ" },
      mantra: "ॐ गं गणपतये नमः (Om Gam Ganapataye Namah)",
      primaryChant: { en: "11× before starting work", hi: "कार्य शुरू करने से पहले 11×", gu: "કામ શરૂ કરતાં પહેલાં 11×" },
      weeklyChant: { en: "108× on Wednesdays", hi: "बुधवार को 108×", gu: "બુધવારે 108×" },
      offerings: { en: "Modak or laddoo with a tuft of durva grass", hi: "दुर्वा के साथ मोदक या लड्डू", gu: "દુર્વડ સાથે મોદક કે લડ્ડુ" },
      support: { en: "Green mung dal; keep a dedicated pen and notebook (stationery) for Ganesha", hi: "हरा मूंग; गणेश की समर्पित स्टेशनरी (नई पेन और डायरी) रखें", gu: "લીલું મગ; ગણેશ માટે સમર્પિત સ્ટેશનરી (નવી પેન અને ડાયરી) રાખો" },
      protectionNote: { en: "Ganesha removes the Mercury mind's obstacles — before meetings, writing, travel or any new start, the 11× chant clears the path; the Wednesday 108× keeps the whole week's doors open.", hi: "गणेश बुध-मन के रुकावटें हटाते हैं — बैठक, लेखन, यात्रा या किसी नई शुरुआत से पहले 11× जाप राह साफ करता है; बुधवार का 108× पूरे सप्ताह के दरवाज़े खुले रखता है।", gu: "ગણેશ બુધ-મનના અવરોધો દૂર કરે છે — બેઠક, લેખન, મુસાફરી કે કોઈ નવી શરૂઆત પહેલાં 11× જાપ રાહ સ્વચ્છ કરે છે; બુધવારનું 108× આખા સપ્તાહના દરવાજા ખુલ્લા રાખે છે." }
    },
    6: {
      god: { en: "Maa Lakshmi", hi: "माँ लक्ष्मी", gu: "મા લક્ષ્મી" },
      mantra: "ॐ श्रीं महालक्ष्म्यै नमः (Om Shreem Mahalakshmyai Namah)",
      primaryChant: { en: "11× before handling money or signing anything", hi: "धन संभालने या हस्ताक्षर करने से पहले 11×", gu: "ધન સંભાળવા કે હસ્તાક્ષર કરતાં પહેલાં 11×" },
      weeklyChant: { en: "108× on Fridays", hi: "शुक्रवार को 108×", gu: "શુક્રવારે 108×" },
      offerings: { en: "White flowers and milk sweets; keep a diya lit on Fridays", hi: "सफेद फूल और दूध की मिठाई; शुक्रवार को दीया जलाएं", gu: "સફેદ ફૂલ અને દૂધની મિઠાઈ; શુક્રવારે દીવો પ્રગટાવો" },
      support: { en: "Sugar, milk or white cloth; donate sweets on Fridays", hi: "चিনি, दूध या सफेद कपड़ा; शुक्रवार को मिठाई दान करें", gu: "ચણી, દૂધ કે સફેદ કાપડ; શુક્રવારે મિઠાઈ દાન કરો" },
      protectionNote: { en: "Lakshmi protects the Venus stream of money and relationships — the pre-transaction chant keeps deals clean and partnerships from turning sharp.", hi: "लक्ष्मी शुक्र के धन और रिश्तों की धारा की रक्षा करती हैं — लेन-देन से पहले का जाप सौदे साफ और साझेदारी को कड़वाहट से बचाता है।", gu: "લક્ષ્મી શુક્રના ધન અને સંબંધોની ધારાની રક્ષા કરે છે — વેપાર પહેલાંનો જાપ સોદા સ્વચ્છ અને સાझेદારીને તીક્ષ્ણ થવાથી બચાવે છે." }
    },
    7: {
      god: { en: "Shri Hanuman", hi: "श्री हनुमान", gu: "શ્રી હનુમાન" },
      mantra: "ॐ हं हनुमन्तये नमः (Hum Hanumante Namah)",
      primaryChant: { en: "11× whenever the mind drifts into confusion or fear", hi: "जब भी मन भ्रम या भय में उठे, 11×", gu: "જ્યારેય મન ભ્રમ કે ભયમાં ઊઠે, 11×" },
      weeklyChant: { en: "108× (or one Chalisa) on Saturdays", hi: "शनिवार को 108× (या एक चालीसा)", gu: "શનિવારે 108× (કે એક ચાલીસા)" },
      offerings: { en: "Sesame (til) and sesame oil; a red tilak for the devotee", hi: "तिल और तिल का तेल; भक्त को लाल तिलक", gu: "તલ અને તલનું તેલ; ભકતને લાલ તિલક" },
      support: { en: "Sesame, sesame oil or iron; honour the humble on Saturdays", hi: "तिल, तिल का तेल या लोहा; शनिवार को झुके हुए का सत्कार करें", gu: "તલ, તલનું તેલ કે લોખંડ; શનિવારે નમ્ર વ્યક્તિનું સ્વાગત કરો" },
      protectionNote: { en: "Hanuman guards the Ketu shadow — sudden losses, hidden enemies and spiritual confusion retreat before his courage; the Chalisa is this number's strongest shield.", hi: "हनुमान केतु की छाया की रक्षा करते हैं — अचानक हानि, छुपे शत्रु और आध्यात्मिक भ्रम उनके साहस से पीछे हटते हैं; चालीसा इस अंक का सबसे मज़बूत कवच है।", gu: "હનુમાન કેતુની છાયાની રક્ષા કરે છે — અચાનક હાનિ, છુપા શત્રુ અને આધ્યાત્મિક ભ્રમ તેમના સાહસથી પાછા હટી જાય છે; ચાલીસા આ અંકનું સૌથી મજબૂત કવચ છે." }
    },
    8: {
      god: { en: "Shri Hanuman", hi: "श्री हनुमान", gu: "શ્રી હનુમાન" },
      mantra: "ॐ हं हनुमन्तये नमः (Hum Hanumante Namah)",
      primaryChant: { en: "11× before hard work, delays or any legal matter", hi: "कठिन काम, विलंब या किसी कानूनी मामले से पहले 11×", gu: "કઠોર કામ, વિલંબ કે કોઈ કાનૂની મસલા પહેલાં 11×" },
      weeklyChant: { en: "108× (or one Chalisa) on Saturdays", hi: "शनिवार को 108× (या एक चालीसा)", gu: "શનિવારે 108× (કે એક ચાલીસા)" },
      offerings: { en: "Black sesame (til), sesame oil and a diya", hi: "काला तिल, तिल का तेल और दीया", gu: "કાળું તલ, તલનું તેલ અને દીવો" },
      support: { en: "Black sesame, oil or iron; serve workers and elders on Saturdays", hi: "काला तिल, तेल या लोहा; शनिवार को मजदूरों और बड़ों की सेवा करें", gu: "કાળું તલ, તેલ કે લોખંડ; શનિવારે કામદારો અને વડીલોની સેવા કરો" },
      protectionNote: { en: "Hanuman carries the Saturn load — delays, discipline and heavy obligations turn into steady progress when this number chants before effort; the Saturday 108× keeps the karmic debt light.", hi: "हनुमान शनि का बोझ संभालते हैं — विलंब, अनुशासन और भारी दायित्व तब स्थिर प्रगति बनते हैं जब यह अंक परिश्रम से पहले जपा जाए; शनिवार का 108× कर्म-देय हल्का रखता है।", gu: "હનુમાન શનિનો બોજ સંભાળે છે — વિલંબ, શિસ્ત અને ભારે ફરજ ત્યારે સ્થિર પ્રગતિ બને છે જ્યારે આ અંક પરિશ્રમ પહેલાં જપાતો હોય; શનિવારનું 108× જાપ કર્મ-દેય હળવું રાખે છે." }
    },
    9: {
      god: { en: "Maa Durga", hi: "माँ दुर्गा", gu: "મા દુર્ગા" },
      mantra: "ॐ दुं दुर्गायै नमः (Om Dum Durgaye Namah)",
      primaryChant: { en: "11× on Tuesdays", hi: "मंगलवार को 11×", gu: "મંગળવારે 11×" },
      weeklyChant: { en: "108× during Navaratri and Durga Ashtami (nine nights and the eighth day)", hi: "नवरात्रि और दुर्गा अष्टमी में 108× (नौ रातें और आठवीं तिथि)", gu: "નવરાત્રિ અને દુર્ગા અષ્ટમીમાં 108× (નવ રાત અને આઠમી તિથિ)" },
      offerings: { en: "Red flowers, kumkum and red cloth; jaggery and coconut as bhog", hi: "लाल फूल, कुंकुम और लाल कपड़ा; गुड़ और नारियल भोग", gu: "લાલ ફૂલ, કુંકમ અને લાલ કાપડ; ગોળ અને નારિયેળ ભોગ" },
      support: { en: "Jaggery, coconut or red cloth; donate on Tuesdays and Durga Ashtami", hi: "गुड़, नारियल या लाल कपड़ा; मंगलवार और दुर्गा अष्टमी को दान करें", gu: "ગોળ, નારિયેળ કે લાલ કાપડ; મંગળવાર અને દુર્ગા અષ્ટમીએ દાન કરો" },
      protectionNote: { en: "Durga is the warrior-shield of the Mars energy — courage in confrontation, protection from enemies and safe completion of bold moves; the Tuesday 11× keeps the fire in the hand, not in the heart.", hi: "दुर्गा मंगल ऊर्जा की योद्धा-कवच हैं — सामने आने पर साहस, शत्रुओं से रक्षा और साहसिक कदमों का सुरक्षित समापन; मंगलवार का 11× अग्नि को हथियार में रखता है, दिल में नहीं।", gu: "દુર્ગા મંગળ ઊર્જાનું યોધ્ધા-કવચ છે — સામ ન આવવામાં સાહસ, શત્રુઓથી રક્ષણ અને હિંમતભર્યા પગલાંનું સુરક્ષિત સમાપન; મંગળવારનું 11× અગ્નિને હાથમાં રાખે છે, હૃદયમાં નહીં." }
    }
  },

  /* ---- Karmic Debt numbers (13 / 14 / 16 / 19) ----
     Classical rule: when the UNREDUCED birth day, the full birth-date total
     or the Chaldean name total lands on one of these four numbers, the
     reduced Driver/Conductor/Name number carries a specific karmic lesson.
     Each entry: title, the lesson life keeps repeating, and the settling
     remedy — routed through the planet remedy kit of the reduced root. */
  karmicDebt: {
    13: {
      root: 4,
      title: { en: "Debt of Effort (13 → 4)", hi: "परिश्रम का कर्मऋण (13 → 4)", gu: "પરિશ્રમનું કર્મઋણ (13 → 4)" },
      lesson: { en: "Life keeps removing shortcuts until work is finished fully and honestly. Half-done efforts, corner-cutting, procrastination and shifting blame return as repeated obstacles — steady, organised effort is the only way through.",
                hi: "जीवन तब तक शॉर्टकट बंद करता रहता है जब तक काम पूरी निष्ठा से पूरा न हो। आधे-अधूरे प्रयास, कोना काटना, टालमटोल और दोष दूसरों पर डालना बार-बार बाधा बनकर लौटते हैं — व्यवस्थित और निरंतर परिश्रम ही एकमात्र मार्ग है।",
                gu: "જીવન ત્યાં સુધી શોર્ટકટ બંધ કરતું રહે છે જ્યાં સુધી કામ પૂરી નિષ્ઠાથી પૂરું ન થાય. અધૂરા પ્રયાસ, છેડા કાપવા, ટાળવણું અને દોષ બીજા પર નાખવો વારંવાર અવરોધ બનીને પાછા આવે છે — વ્યવસ્થિત અને સતત પરિશ્રમ જ એકમાત્ર માર્ગ છે." },
      remedy: { en: "On Saturdays serve or feed daily-wage workers; keep one fixed daily work-slot that nothing can break; finish one pending task fully before starting anything new (Rahu–4 discipline).",
                hi: "शनिवार को दिहाड़ी मजदूरों की सेवा करें या उन्हें भोजन दें; रोज का एक निश्चित काम-समय रखें जिसे कुछ भी न तोड़ सके; नया काम शुरू करने से पहले एक अटका हुआ काम पूरा करें (राहु–४ का अनुशासन)।",
                gu: "શનિવારે મજૂરોની સેવા કરો કે ભોજન આપો; રોજનો એક નિશ્ચિત કામનો સમય રાખો જેને કંઈ પણ તોડી ન શકે; નવું કામ શરૂ કરતાં પહેલાં એક અટકેલું કામ પૂરું કરો (રાહુ–૪ ની શિસ્ત)." }
    },
    14: {
      root: 5,
      title: { en: "Debt of Moderation (14 → 5)", hi: "संयम का कर्मऋण (14 → 5)", gu: "સંયમનું કર્મઋણ (14 → 5)" },
      lesson: { en: "The senses keep pulling toward excess — food, drink, comfort, thrill-seeking or promises made lightly and broken easily. The lesson is moderation: freedom survives only inside commitment.",
                hi: "इंद्रियां बार-बार अति की ओर खींचती हैं — भोजन, आराम, उत्साह के पीछे भागना या हल्के में दिए और आसानी से टूटते वादे। सीख है संयम — स्वतंत्रता केवल प्रतिबद्धता के भीतर ही टिकती है।",
                gu: "ઇન્દ્રિયો વારંવાર અતિ તરફ ખેંચે છે — ભોજન, આરામ, ઉત્તેજનાની લય, કે હળવાશથી આપીને સહેલાશથી તૂટી જતાં વચનો. સીખ છે સંયમ — સ્વાતંત્ર્ય ફક્ત પ્રતિબદ્ધતામાં જ ટકે છે." },
      remedy: { en: "Keep five small, unbreakable promises instead of one big one; avoid speculation and impulse spending; donate green moong or books/stationery on Wednesday; one evening a week, keep the senses light.",
                hi: "एक बड़े वादे की जगह पाँच छोटे, अटूट वादे रखें; सट्टे और आवेगी खर्च से बचें; बुधवार को हरा मूंग या पुस्तकें/स्टेशनरी दान करें; सप्ताह में एक शाम इंद्रियों को हल्की रखें।",
                gu: "એક મોટા વચનને બદલે પાંચ નાના, અકાપત વચનો રાખો; સટ્ટા અને આવેગી ખર્ચથી બચો; બુધવારે લીલા મગ કે પુસ્તકો/સ્ટેશનરી દાન કરો; અઠવાડિયામાં એક સાંજ ઇન્દ્રિયો માટે હળવી રાખો." }
    },
    16: {
      root: 7,
      title: { en: "Debt of Humility (16 → 7)", hi: "विनम्रता का कर्मऋण (16 → 7)", gu: "વિનમ્રતાનું કર્મઋણ (16 → 7)" },
      lesson: { en: "Sudden falls arrive where pride or secrecy built the tower — often around love, trust or status. What collapses was standing on ego; what is rebuilt on humility and truth stays standing.",
                hi: "जहां मीनार अहंकार या गोपनीयता पर खड़ी होती है, वहां अचानक पतन आता है — प्रायः प्रेम, विश्वास या प्रतिष्ठा के क्षेत्र में। जो गिरता है वो अहं पर टिका था; जो विनम्रता और सत्य पर फिर बनता है, वही टिकता है।",
                gu: "જ્યાં મિનારો અહંકાર કે ગોપનીયતા પર ઊભો હોય ત્યાં અચાનક પતન આવે છે — સામાન્ય રીતે પ્રેમ, વિશ્વાસ કે પ્રતિષ્ઠામાં. જે પડે છે તે અહં પર ટકેલું હતું; જે વિનમ્રતા અને સત્ય પર ફરી બને છે તે જ ટકે છે." },
      remedy: { en: "Practise silent charity — feed stray dogs or donate blankets without telling anyone; meditate 10 minutes daily (Ketu–7); be the first to apologise in your closest relationship; never attack anyone's dignity publicly.",
                hi: "मौन दान का अभ्यास करें — आवारा कुत्तों को खिलाएं या कंबल बिना किसी को बताए दान करें; रोज १० मिनट ध्यान करें (केतु–७); सबसे निकट के रिश्ते में क्षमा मांगने की पहल करें; किसी की प्रतिष्ठा सार्वजनिक रूप से कभी न ठेस पहुंचाएं।",
                gu: "મૌન દાનનો અભ્યાસ કરો — રખડતા કૂતરાઓને ખવડાવો કે કોઈને ન કહેતા ધાબળા દાન કરો; રોજ ૧૦ મિનિટ ધ્યાન કરો (કેતુ–૭); સૌથી નજીકના સંબંધમાં ક્ષમા માંગવાની પહેલ કરો; કોઈની પ્રતિષ્ઠાને જાહેરમાં ક્યારેય ઠેસ ન પહોંચાડો." }
    },
    19: {
      root: 1,
      title: { en: "Debt of Power (19 → 1)", hi: "सत्ता का कर्मऋण (19 → 1)", gu: "સત્તાનું કર્મઋણ (19 → 1)" },
      lesson: { en: "Independence was once misused — either leaning on no one and refusing help, or making others carry too much. Life re-teaches fair self-reliance: stand alone when needed, accept help with grace, and use strength for others.",
                hi: "स्वतंत्रता का दुरुपयोग हुआ — या तो किसी पर भरोसा न करना और सहायता ठुकराना, या दूसरों पर अति बोझ डालना। जीवन निष्पक्ष आत्मनिर्भरता फिर सिखाता है — ज़रूरत हो तो अकेले खड़े रहें, सहायता शालीनता से स्वीकारें, बल दूसरों के लिए लगाएं।",
                gu: "સ્વતંત્રતાનો દુરુપયોગ થયો — કાં તો કોઈ પર આધાર ન લેવો અને મદદ અસ્વીકારવી, કે બીજા પર અતિશય બોજ નાખવો. જીવન ન્યાયસંગત આત્મનિર્ભરતા ફરી શીખવે છે — જરૂર હોય તો એકલા ઊભા રહો, મદદ સૌજન્યથી સ્વીકારો, શક્તિ બીજા માટે વાપરો." },
      remedy: { en: "Offer water to the rising Sun daily (Surya arghya); serve your father or a mentor; once a week do one task for someone without being asked; donate wheat, jaggery or copper on Sunday.",
                hi: "रोज उगते सूर्य को जल अर्पित करें (सूर्य अर्घ्य); पिता या गुरु की सेवा करें; हर हफ्ते किसी के लिए बिना कहे एक काम करें; रविवार को गेहूं, गुड़ या तांबा दान करें।",
                gu: "રોજ ઊગતા સૂર્યને જળ અર્પણ કરો (સૂર્ય અર્ઘ્ય); પિતા કે ગુરુની સેવા કરો; દર અઠવાડિયે કોઈ માટે વગર કહ્યે એક કામ કરો; રવિવારે ઘઉં, ગોળ કે તાંબું દાન કરો." }
    }
  },

  /* ---- Pinnacles & Challenges (four life phases) ----
     Classical life-phase system derived from the birth date:
       P1 = day+month, P2 = day+year, P3 = P1+P2, P4 = month+year (reduced 1–9)
       C1 = |day−month|, C2 = |day−year|, C3 = |C1−C2|, C4 = |month−year| (0–8, never reduced)
     Phase boundaries: first pinnacle ends at 36 − Conductor, each next
     spans 9 years, the fourth runs to the end of life.
     pinnacle[n] = the peak energy available in that phase;
     challengeLesson[c] = the recurring lesson to master alongside it. */
  pinnacle: {
    1: { theme: { en: "Independence and self-starting — a phase to lead, launch and build identity.", hi: "स्वतंत्रता और आत्म-शुरुआत — नेतृत्व, शुभारंभ और पहचान बनाने का चरण।", gu: "સ્વતંત્રતા અને સ્વ-શરૂઆત — નેતૃત્વ, શરૂઆત અને ઓળખ ઘડવાનો તબક્કો." } },
    2: { theme: { en: "Partnership and patience — alliances, diplomacy and quiet consolidation.", hi: "साझेदारी और धैर्य — गठबंधन, कूटनीति और शांत सुधृढ़ीकरण।", gu: "ભાગીદારી અને ધીરજ — જોડાણ, કૂટનીતિ અને શાંત મજબૂતાઈ." } },
    3: { theme: { en: "Expression and expansion — visibility, creativity, teaching and growth.", hi: "अभिव्यक्ति और विस्तार — प्रमुखता, रचनात्मकता, शिक्षण और वृद्धि।", gu: "અભિવ્યક્તિ અને વિસ્તાર — દેખાવ, સર્જનાત્મકતા, શિક્ષણ અને વૃદ્ધિ." } },
    4: { theme: { en: "Foundation and system — hard structuring; slow but permanent gains.", hi: "नींव और व्यवस्था — कठोर संरचना; धीमे पर स्थायी लाभ।", gu: "પાયો અને વ્યવસ્થા — મક્કમ બાંધકામ; ધીમો પરંતુ કાયમી લાભ." } },
    5: { theme: { en: "Change and commerce — travel, deals, reinvention; doors move fast.", hi: "परिवर्तन और व्यापार — यात्रा, सौदे, नवीनीकरण; दरवाज़े तेज़ी से खुलते हैं।", gu: "ફેરફાર અને વેપાર — મુસાફરી, સોદા, નવીનીકરણ; દરવાજા ઝડપથી ખુલે છે." } },
    6: { theme: { en: "Home, harmony and service — family duty, comfort and trusted counsel.", hi: "घर, सामंजस्य और सेवा — पारिवारिक दायित्व, सुख-सुविधा और विश्वसनीय सलाह।", gu: "ઘર, સુમેળ અને સેવા — પારિવારિક ફરજ, આરામ અને વિશ્વસનીય સલાહ." } },
    7: { theme: { en: "Depth and mastery — study, specialisation, spiritual insight; inward strength.", hi: "गहराई और प्रवीणता — अध्ययन, विशेषज्ञता, आध्यात्मिक अंतर्दृष्टि; आंतरिक बल।", gu: "ઊંડાણ અને નિપુણતા — અભ્યાસ, વિશિષ્ટતા, આધ્યાત્મિક સૂઝ; આંતરિક બળ." } },
    8: { theme: { en: "Authority and harvest — karma pays; command, management, material results.", hi: "अधिकार और फसल — कर्म फल देता है; कमान, प्रबंधन, भौतिक परिणाम।", gu: "સત્તા અને કાપણી — કર્મ ફળ આપે છે; કમાન, સંચાલન, ભૌતિક પરિણામ." } },
    9: { theme: { en: "Action and completion — bold closures, courage and large-scale service.", hi: "कर्म और पूर्णता — साहसिक समापन, धैर्य और बड़े पैमाने की सेवा।", gu: "ક્રિયા અને સંપૂર્ણતા — હિંમતભર્યું સમાપન, સાહસ અને મોટા પાયે સેવા." } }
  },

  challengeLesson: {
    0: { en: "The challenge of choice — no single fault is assigned; any number's weakness can surface. Discipline across the board is the answer.",
         hi: "चुनाव की चुनौती — कोई एक दोष निर्धारित नहीं; किसी भी अंक की कमजोरी उभर सकती है। सभी क्षेत्रों में अनुशासन ही उत्तर है।",
         gu: "પસંદગીનો પડકાર — કોઈ એક ખામી નિયત નથી; કોઈ પણ અંકની નબળાઈ ઊભરી શકે છે. સર્વક્ષેત્ર શિસ્ત જ ઉત્તર છે." },
    1: { en: "Stand up for yourself — overcome the urge to yield to others' will.",
         hi: "अपने लिए खड़े होना सीखें — दूसरों की इच्छा के आगे झुकने की प्रवृत्ति पर काबू पाएं।",
         gu: "પોતાના માટે ઊભા રહેતા શીખો — બીજાની ઇચ્છા આગળ નમવાની વૃત્તિ પર કાબૂ મેળવો." },
    2: { en: "Over-sensitivity and self-doubt — build inner security without comparing yourself to others.",
         hi: "अति-संवेदनशीलता और आत्म-संदेह — बिना तुलना के आंतरिक सुरक्षा बनाएं।",
         gu: "અતિ-સંવેદનશીલતા અને આત્મ-શંકા — સરખામણી વગર આંતરિક સુરક્ષા ઘડો." },
    3: { en: "Scattered self-expression — focus your words; finish what you start saying and doing.",
         hi: "बिखरी अभिव्यक्ति — अपने शब्दों पर केंद्रित रहें; जो कहना-करना शुरू करें, उसे पूरा करें।",
         gu: "છૂટાછવાયેલી અભિવ્યક્તિ — તમારા શબ્દો પર કેન્દ્રિત રહો; શરૂ કરેલું કહેવું-કરવું પૂરું કરો." },
    4: { en: "Rigidity or disorder — build routines and honour them without becoming inflexible.",
         hi: "कठोरता या अस्तव्यस्तता — दिनचर्या बनाएं और ढीले हुए बिना उसका पालन करें।",
         gu: "કઠોરતા કે ગડબડ — દિનચર્યા બનાવો અને અનમ્ય ન બનતા તેનું પાલન કરો." },
    5: { en: "Restlessness — channel freedom constructively; don't run from responsibility.",
         hi: "बेचैनी — स्वतंत्रता को रचनात्मक दिशा दें; जिम्मेदारी से न भागें।",
         gu: "અસ્થિરતા — સ્વાતંત્ર્યને રચનાત્મક દિશા આપો; જવાબદારીથી ભાગશો નહીં." },
    6: { en: "Perfectionism in relationships — accept loved ones as they are; duty without resentment.",
         hi: "रिश्तों में परफेक्शनवाद — अपनों को जैसे हैं स्वीकारें; कर्तव्य, बिना शिकायत।",
         gu: "સંબંધોમાં સંપૂર્ણતાવાદ — પ્રિયજનોને જેમ છે તેમ સ્વીકારો; ફરજ, ફરિયાદ વગર." },
    7: { en: "Trust and faith — fear of betrayal closes you off; develop discernment without suspicion.",
         hi: "विश्वास और आस्था — धोखे के डर से बंद न हों; संदेह के बिना विवेक विकसित करें।",
         gu: "વિશ્વાસ અને શ્રદ્ધા — છેતરાવાના ડરથી બંધાશો નહીં; શંકા વગર વિવેક વિકસાવો." },
    8: { en: "Money and power lessons — balance material drive with ethics; neither chase it nor scorn it.",
         hi: "धन और सत्ता की सीख — भौतिक महत्वाकांक्षा को नैतिकता से संतुलित करें; न पीछा करें, न तिरस्कार।",
         gu: "ધન અને સત્તાની સીખ — ભૌતિક મહત્વાકાંક્ષાને નૈતિકતા સાથે સંતુલિત કરો; ન પાછળ ભાગો, ન તિરસ્કાર કરો." }
  }
};

const KNOWLEDGE_PACK = {
  app: "NumeroVastu 360",
  schemaVersion: 1,
  packVersion: "2.5.0",
  generatedAt: "2026-09-02T00:00:00Z",
  manifestPath: "knowledge-pack/latest.json",
  contribution: {
    mode: "scaffold",
    endpoint: null,
    description: "Anonymous aggregate counts only. Off by default; no names, DOBs, phones or raw free-text are sent."
  },
  db: DB
};

if (typeof window !== "undefined") {
  window.DB = DB;
  window.__NV_BUNDLED_PACK = KNOWLEDGE_PACK;
}

if (typeof module !== "undefined") {
  module.exports = { DB, KNOWLEDGE_PACK };
}
