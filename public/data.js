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

  /* ---- Loshu planes / arrows of strength ---- */
  planes: [
    { name: "Mental Plane",      cells: [4,9,2], meaning: "Intellect, memory and analytical thinking" },
    { name: "Emotional Plane",   cells: [3,5,7], meaning: "Feelings, intuition and spiritual depth" },
    { name: "Practical Plane",   cells: [8,1,6], meaning: "Material execution, wealth and physical world" },
    { name: "Thought Arrow",     cells: [4,3,8], meaning: "Planning and disciplined thinking" },
    { name: "Will Arrow",        cells: [9,5,1], meaning: "Determination and persistence" },
    { name: "Action Arrow",      cells: [2,7,6], meaning: "Energy to convert plans into results" },
    { name: "Raj Yoga (Wealth)", cells: [4,5,6], meaning: "Prosperity combination — abundance and success" },
    { name: "Spiritual Yoga",    cells: [2,5,8], meaning: "Inner balance and spiritual growth" }
  ],

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
        fix: "If relocation is impossible, face east or north while praying; keep the altar on the east wall; light a diya twice daily in the NE of the home regardless." }
    ]
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
                     dev: "ॐ नमः शिवाय", pron: "Om Namah Shivaya", meaning: "I bow to Shiva, the transformer.",
                     affirmation: "I embrace transformation, release what no longer serves me, and rise stronger." },
    "Sagittarius": { ruler: 3, element: "Fire",  crystals: ["Turquoise", "Lapis Lazuli", "Amethyst"],            intentions: "Study success, travel protection, wisdom",
                     dev: "ॐ गुरवे नमः", pron: "Om Gurave Namah", meaning: "Salutations to the Teacher.",
                     affirmation: "I expand my horizons, seek truth, and trust the beautiful journey ahead." },
    "Capricorn":   { ruler: 8, element: "Earth", crystals: ["Smoky Quartz", "Black Onyx", "Garnet"],             intentions: "Career growth, discipline, debt clearing",
                     dev: "ॐ शनैश्चराय नमः", pron: "Om Shanaischaraya Namah", meaning: "Salutations to Saturn.",
                     affirmation: "My hard work builds lasting success. I am grounded, patient, and unstoppable." },
    "Aquarius":    { ruler: 8, element: "Air",   crystals: ["Amethyst", "Aquamarine", "Clear Quartz"],           intentions: "Inner peace, innovation, spiritual growth",
                     dev: "ॐ नमः शिवाय", pron: "Om Namah Shivaya", meaning: "I bow to Shiva, the universal consciousness.",
                     affirmation: "I embrace my uniqueness, break boundaries, and contribute positively to the world." },
    "Pisces":      { ruler: 3, element: "Water", crystals: ["Amethyst", "Aquamarine", "Moonstone"],              intentions: "Rebuild relationships, intuition, inner peace",
                     dev: "ॐ गुरवे नमः", pron: "Om Gurave Namah", meaning: "Salutations to the Teacher.",
                     affirmation: "I am deeply connected to my intuition and the universal flow of love and grace." }
  },

  /* ---- Crystal companion guide (Owner-provided table) ---- */
  crystals: {
    "Amethyst":         { chakra: "Third Eye / Crown", benefits: "Calms the mind, reduces stress, enhances intuition, and promotes spiritual peace.", pair: "Clear Quartz (to amplify) or Selenite (to cleanse)" },
    "Rose Quartz":      { chakra: "Heart", benefits: "Unconditional love, emotional healing, self-care, and attracting romance.", pair: "Moonstone (for emotional balance)" },
    "Citrine":          { chakra: "Solar Plexus", benefits: "Wealth generation, abundance, joy, and personal power. Known as the \"Merchant's Stone\".", pair: "Pyrite or Green Aventurine (the Dhan Yog combo)" },
    "Black Tourmaline": { chakra: "Root", benefits: "Ultimate protection against negative energy, EMF smog, and the Evil Eye (Nazar). Grounding.", pair: "Smoky Quartz (for deep grounding and debt clearing)" },
    "Tiger's Eye":      { chakra: "Solar Plexus / Sacral", benefits: "Courage, confidence, focus, and protection from ill-wishing. Great for decision-making.", pair: "Carnelian (for action and motivation)" },
    "Selenite":         { chakra: "Crown / Ether", benefits: "Liquid light. Cleanses, charges, and recharges other crystals. Promotes deep peace and clarity.", pair: "Use as a base — place your bracelets and crystals on Selenite weekly" },
    "5 Mukhi Rudraksha": { chakra: "Throat / Heart", benefits: "Ruled by Lord Kalagni (Shiva). Balances the 5 elements, lowers blood pressure, and calms the mind.", pair: "Crystal beads (combines spiritual grounding with mineral energy)" }
  },
  seleniteRitual: "Weekly cleansing ritual: every Saturday night, place all your crystals and bracelets on a Selenite plate or slab. By morning they are cleansed and recharged — never let crystals go more than a month without cleansing.",

  /* ---- Name-number verdicts ---- */
  nameAdvice: {
    friendly: "Your name number vibrates in harmony with your birth numbers — no spelling change needed.",
    neutral:  "Your name number is neutral. It neither blocks nor boosts; a tuned spelling could add support.",
    enemy:    "Your name number conflicts with your birth numbers — a spelling correction is strongly recommended."
  }
};

if (typeof module !== "undefined") module.exports = DB;
