/* ============================================================
   NumeroVastu 360 — Multi-Language Support (i18n)
   Languages: English (en), Hindi (hi), Gujarati (gu)
   Accurate Vedic Numerology & Vastu translations designed
   for simplicity, respect and easy understanding by common man.
   ============================================================ */

var I18N = {
  "en": {
    "meta": {
      "code": "en",
      "name": "English",
      "native": "English",
      "flag": "🇬🇧"
    },
    "ui": {
      "brandName": "NumeroVastu 360",
      "brandSub": "Numerology & Vastu Remedy Engine",
      "editDetails": "Edit Details",
      "savePrint": "Save / Print Report",
      "skipLink": "Skip to main content",
      "invocation": "ॐ श्री गणेशाय नमः",
      "reportHeroTitle": "Remedy Report — {name}",
      "reportHeroMeta": "DOB {dob}{birthLine} · Focus: {goals} · Generated locally on your device",
      "born": "Born",
      "statusPrivate": "Private & local",
      "statusKnowledge": "Knowledge pack v{ver}",
      "statusApp": "App v2.7.0 · Meeus engine",
      "statusBuild": "Build 2026-09-05",
      "statusMemory": "Local memory ready",
      "statusMemorySnapshots": "{count} local snapshot{s}",
      "startupTitle": "Knowledge Pack + on-device memory",
      "startupSubtitle": "Evolving skill system",
      "checkUpdates": "Check updates",
      "currentPack": "Current pack",
      "currentPackSub": "Uses bundled content instantly, then quietly checks for a newer pack.",
      "localMemory": "Local memory",
      "localMemorySub": "Saved reports stay on this device only.",
      "noSavedCharts": "No saved charts yet",
      "savedChartsCount": "{count} saved chart{s}",
      "privacyMode": "Privacy mode",
      "privacyModeTitle": "Browser-only processing",
      "privacyModeSub": "Names, DOBs, mobile numbers and Vastu details stay on your device.",
      "loadLatestChart": "Load latest local chart",
      "introTitle": "Your 360° Remedy Report",
      "introDesc": "Enter your details once. We compute your Driver & Conductor numbers, build your Vedic Numerology Grid (Ank Kundali), check your name, mobile and vehicle vibrations, map your lucky colours, best careers and favourable years, scan your Vastu — and generate a complete remedy plan for money, health, career, business and relationships.",
      "reportLanguage": "Report Language",
      "reportLanguageDesc": "Choose your preferred language for the report. You can switch anytime:",
      "personalDetails": "Personal Details",
      "fullName": "Full Name",
      "fullNamePlaceholder": "As used daily, e.g. Rahul Sharma",
      "fullNameHint": "Name spelling is analysed with the Chaldean system — use the spelling you actually use.",
      "dob": "Date of Birth",
      "mobile": "Mobile Number",
      "mobilePlaceholder": "10 digits, e.g. 9876543210",
      "mobileHint": "Digits total is matched with your Driver and Conductor.",
      "vehicle": "Vehicle Registration",
      "vehiclePlaceholder": "e.g. HR51AB1234 (optional)",
      "vehicleHint": "Letters + digits Chaldean total.",
      "gender": "Gender (for Feng Shui Kua)",
      "genderUnsure": "Prefer not to say",
      "genderMale": "Male",
      "genderFemale": "Female",
      "genderOther": "Other",
      "focusAreas": "Focus Areas (choose up to 3)",
      "focusAreasDesc": "Choose up to 3 life areas you want to prioritise in this report:",
      "focusMoney": "Money",
      "focusHealth": "Health",
      "focusCareer": "Career",
      "focusBusiness": "Business",
      "focusRelationship": "Relationship",
      "vedicPrecision": "Vedic Precision (optional — unlocks your full Vedic sky)",
      "vedicPrecisionDesc": "Your Vedic Sun Sign (Surya Rashi) — sidereal / Lahiri ayanamsa — is computed instantly from your date of birth alone (Tier 1, ready now). Adding your exact birth time and birth city unlocks the full Astro-Identity Snapshot: Moon Sign (Chandra Rashi), Nakshatra with its pada, Lagna and Midheaven — all computed right here in your browser, never sent anywhere.",
      "birthTime": "Exact Birth Time (optional)",
      "birthTimeHint": "Tier 2 — unlocks Moon Sign (Chandra Rashi), Nakshatra, Lagna & Midheaven (computed on-device).",
      "birthPlace": "Birth City / Place (optional)",
      "birthPlacePlaceholder": "e.g. New Delhi, India",
      "birthPlaceHint": "Tier 2 — anchors the sky over your birthplace. 630+ cities built in (offline); or type coordinates like “28.41, 77.32”.",
      "tier1Ready": "Tier 1 · Ready now",
      "tier1Desc": "Vedic Sun Sign (Surya Rashi) — sidereal / Lahiri, computed instantly from your date of birth. This is the layer today's report uses.",
      "tier2Unlock": "Tier 2 · Unlock now",
      "tier2Desc": "Moon Sign (Chandra Rashi) · Nakshatra · Lagna · Midheaven — birth time + place unlock these instantly, computed on your device with a built-in Vedic ephemeris. They never leave this device.",
      "vastuDetails": "Vastu Details (home / office)",
      "vastuDetailsDesc": "Stand at the centre of your property and check directions with a compass app. Choose “Not sure” if unknown.",
      "entranceLabel": "Main Entrance Faces",
      "kitchenLabel": "Kitchen Located In",
      "bedroomLabel": "Master Bedroom In",
      "toiletLabel": "Toilet Located In",
      "studyLabel": "Study Room In",
      "staircaseLabel": "Staircase Located In",
      "plotShapeLabel": "Plot Shape (optional)",
      "watchTypeLabel": "Watch You Currently Wear (optional)",
      "brandTitle": "Business / Brand Name (optional)",
      "brandDesc": "Enter your business, brand, shop or venture name for a Chaldean success reading — its compound number, auspiciousness and sound-preserving spelling corrections.",
      "brandLabel": "Business / Brand Name",
      "brandPlaceholder": "e.g. Shree Balaji Textiles",
      "privacyTitle": "Privacy & Learning Settings",
      "privacyDesc": "The app evolves through public knowledge packs and private on-device memory. Anonymous contribution is optional and stays off unless you enable it.",
      "privacyToggleLabel": "Help improve future remedies",
      "privacyToggleHint": "If you opt in, the app will only prepare anonymous aggregate counts such as missing-number totals and selected focus areas.",
      "privacyFooterHint": "Off by default. No names, dates of birth, phone numbers, vehicle numbers or free-text journal notes are shared.",
      "compatTitle": "Compatibility (optional — partner / spouse / business partner)",
      "compatDesc": "Add a second person to compare Driver & Conductor compatibility for marriage or partnership.",
      "partnerName": "Partner's Full Name",
      "partnerNamePlaceholder": "e.g. Anjali Verma",
      "partnerDob": "Partner's Date of Birth",
      "generateBtn": "Generate My Remedy Report",
      "formNote": "Your data never leaves this device — all calculations run locally in your browser.",
      "footerText": "NumeroVastu 360 — guidance based on classical Vedic numerology and Vastu principles. Remedies are supportive practices, not a substitute for professional medical, legal or financial advice.",
      "errFullName": "Please enter your full name.",
      "errDob": "Please enter a valid date of birth.",
      "errMobile": "Please enter a valid mobile number (8+ digits, not all zeros).",
      "errGoals": "Select at least one focus area.",
      "navSummary": "Summary",
      "navProfile": "Profile",
      "navVedicGrid": "Vedic Grid",
      "navVedic": "Vedic Sign",
      "navTiming": "Timing",
      "navDasha": "Dasha",
      "navMemory": "Evolving Chart",
      "navVastu": "Vastu",
      "navPlan": "40-Day Plan",
      "secSummary": "Northstar Summary",
      "secProfile": "Core Numerology Profile",
      "secTraits": "Your Core Nature — Traits, Strengths & Shadows",
      "secVedicGrid": "Your Vedic Numerology Grid (Ank Kundali)",
      "secWeak": "Weak Planet Remedy Kits",
      "secZodiac": "Your Vedic Zodiac Power Kit — {sign}",
      "secName": "Name Analysis & Spelling Correction",
      "secMobile": "Mobile Number Vibration",
      "secVehicle": "Vehicle Number Vibration",
      "secWatch": "Watch & Wearable Remedy",
      "secCrystal": "Crystal Companion Guide",
      "secColours": "Lucky Colours & Day-wise Dressing",
      "secCareer": "Best Fields & Professions",
      "secTiming": "Favourable Years & Timing",
      "secDasha": "Dasha Timeline — Life Event Windows",
      "karmicDebtTitle": "Karmic Debt Check — 13 · 14 · 16 · 19",
      "pinnacleCardTitle": "Four Life Phases — Pinnacles & Challenges",
      "secMemory": "Your Evolving Chart",
      "secVastu": "Vastu Dosh Scan",
      "secKua": "Personal Lucky Directions — Kua Number",
      "secCompat": "Compatibility & Matchmaking",
      "secGoalPlan": "{goal} — Remedy Plan",
      "secPlan": "Your 40-Day Activation Plan",
      "driverLabel": "Driver (Moolank)",
      "conductorLabel": "Conductor (Bhagyank)",
      "nameNumLabel": "Name Number",
      "mobNumLabel": "Mobile Number",
      "suryaRashiLabel": "Vedic Sun Sign · Surya Rashi",
      "chandraRashiLabel": "Moon · Chandra Rashi",
      "lagnaLabel": "Lagna (Ascendant)",
      "mcLabel": "Midheaven (MC)",
      "active": "Active",
      "partial": "Partial",
      "weak": "Weak",
      "strong": "Strong",
      "frustrated": "Frustrated",
      "present": "Present",
      "missing": "Missing",
      "critical": "Critical",
      "friendly": "Friendly",
      "neutral": "Neutral",
      "enemy": "Enemy",
      "ideal": "Ideal",
      "acceptable": "Acceptable",
      "dosh": "Dosh",
      "balanced": "Balanced",
      "caution": "Caution",
      "daily": "Daily",
      "weekly": "Weekly",
      "once": "One-time",
      "adopt": "Adopt",
      "release": "Release",
      "amplifyThese": "Your Strengths — Amplify These",
      "watchThese": "Your Shadows — Watch These",
      "howWeJudge": "How we judge this:",
      "beejMantra": "Beej Mantra",
      "dailyShortMantra": "Daily Short Mantra",
      "wishPaperAffirmation": "Wish-Paper Affirmation",
      "crystal": "Crystal",
      "rudraksha": "Rudraksha",
      "yantra": "Yantra",
      "colorDayMetal": "Colour / Day / Metal",
      "charity": "Charity",
      "lifestyle": "Lifestyle",
      "fast": "Fast",
      "open40DayPlan": "Open your full 40-Day Activation Plan ↓",
      "firstThreeMoves": "Your first three moves",
      "wayForward": "Way forward",
      "resetCycle": "Reset cycle",
      "day": "Day",
      "completed": "completed",
      "cycleStarted": "Cycle started {date} · Progress is saved privately on this device, per profile."
    },
    "numbers": {
      "1": {
        "planet": "Sun (Surya)",
        "element": "Fire",
        "traits": "Leadership, authority, confidence, father, government, visibility, vitality",
        "governs": [
          "Career",
          "Health",
          "Business"
        ],
        "weakSigns": "Low confidence, trouble with authority/father, weak recognition, low vitality, eye or heart strain",
        "day": "Sunday",
        "color": "Gold, Orange, Saffron",
        "metal": "Gold / Copper",
        "crystal": "Ruby or Red Aventurine (substitute: Red Jasper)",
        "rudraksha": "1 Mukhi Rudraksha",
        "mantra": "Om Hram Hreem Hroum Sah Suryaya Namah",
        "mantraCount": "108 times daily at sunrise (full cycle: 7,000)",
        "charity": "Donate wheat, jaggery, copper or red cloth on Sunday morning",
        "lifestyle": "Offer water to the rising Sun daily; wake before sunrise; wear gold/copper; keep the east of home bright and clutter-free",
        "fast": "Sunday fast on fruits or one salt-free meal"
      },
      "2": {
        "planet": "Moon (Chandra)",
        "element": "Water",
        "traits": "Mind, calm, emotions, intuition, mother, public relations, fluidity",
        "governs": [
          "Health",
          "Relationship"
        ],
        "weakSigns": "Anxiety, mood swings, poor sleep, strained relationship with mother, overthinking",
        "day": "Monday",
        "color": "White, Silver, Cream",
        "metal": "Silver",
        "crystal": "Pearl or Moonstone (substitute: White Opal)",
        "rudraksha": "2 Mukhi Rudraksha",
        "mantra": "Om Shram Shreem Shraum Sah Chandraya Namah",
        "mantraCount": "108 times daily in the evening (full cycle: 11,000)",
        "charity": "Donate rice, milk, white cloth or silver on Monday",
        "lifestyle": "Drink water from a silver glass; spend time near water; keep moonlight exposure at night; respect and serve your mother",
        "fast": "Monday fast; avoid salt after sunset"
      },
      "3": {
        "planet": "Jupiter (Guru)",
        "element": "Ether",
        "traits": "Wisdom, growth, wealth, teaching, children, expansion, dharma",
        "governs": [
          "Money",
          "Business",
          "Career"
        ],
        "weakSigns": "Financial stagnation, lack of direction, issues with mentors/children, liver or weight concerns",
        "day": "Thursday",
        "color": "Yellow, Gold",
        "metal": "Gold / Brass",
        "crystal": "Yellow Sapphire or Citrine (substitute: Yellow Aventurine)",
        "rudraksha": "5 Mukhi Rudraksha",
        "mantra": "Om Gram Greem Graum Sah Gurave Namah",
        "mantraCount": "108 times daily at sunrise (full cycle: 19,000)",
        "charity": "Donate yellow items — chana dal, turmeric, bananas, books — on Thursday",
        "lifestyle": "Wear yellow on Thursdays; respect teachers; apply a saffron/turmeric tilak; study or teach something weekly",
        "fast": "Thursday fast; avoid bananas after sunset on other days is not required — focus on gratitude"
      },
      "4": {
        "planet": "Rahu",
        "element": "Air (shadow)",
        "traits": "Ambition, unconventional paths, technology, foreign links, sudden events",
        "governs": [
          "Business",
          "Career"
        ],
        "weakSigns": "Confusion, restlessness, sudden setbacks, gadget over-dependence, deception or self-doubt",
        "day": "Saturday",
        "color": "Smoky Grey, Dark Blue, Khaki",
        "metal": "Mixed alloys / Silver",
        "crystal": "Hessonite (Gomed) or Smoky Quartz",
        "rudraksha": "8 Mukhi Rudraksha",
        "mantra": "Om Bhram Bhreem Bhroum Sah Rahave Namah",
        "mantraCount": "108 times daily after sunset (full cycle: 18,000)",
        "charity": "Donate blankets, sesame, mustard oil or feed the poor/stray dogs on Saturday",
        "lifestyle": "Limit screen time and wrist gadgets at night; keep the southwest clean and heavy; avoid clutter and broken electronics at home",
        "fast": "Saturday light fast; coconut donation on Amavasya"
      },
      "5": {
        "planet": "Mercury (Budha)",
        "element": "Earth",
        "traits": "Communication, business acumen, data, speech, marketing, intellect, adaptability",
        "governs": [
          "Business",
          "Money",
          "Career"
        ],
        "weakSigns": "Miscommunication, poor deals, nervous energy, speech or skin issues, scattered focus",
        "day": "Wednesday",
        "color": "Green, Light Blue",
        "metal": "Silver / Bronze",
        "crystal": "Emerald or Green Aventurine (substitute: Peridot)",
        "rudraksha": "4 Mukhi Rudraksha",
        "mantra": "Om Bram Breem Braum Sah Budhaya Namah",
        "mantraCount": "108 times daily in the morning (full cycle: 9,000)",
        "charity": "Donate green moong, green cloth or stationery to students on Wednesday",
        "lifestyle": "Wear green on Wednesdays; journal or read daily; keep plants at the workspace; speak less and listen more",
        "fast": "Wednesday fast on green vegetables / one grain-free meal"
      },
      "6": {
        "planet": "Venus (Shukra)",
        "element": "Water (refined)",
        "traits": "Love, luxury, beauty, art, relationships, comforts, vehicles, charm",
        "governs": [
          "Relationship",
          "Money"
        ],
        "weakSigns": "Relationship friction, lack of comfort/luxury, reproductive or kidney concerns, dull creativity",
        "day": "Friday",
        "color": "White, Pink, Rose, Cream",
        "metal": "Silver / White Gold / Rose Gold",
        "crystal": "Diamond / Clear Quartz or Rose Quartz (substitute: White Zircon)",
        "rudraksha": "6 Mukhi Rudraksha (or 13 Mukhi for attraction)",
        "mantra": "Om Dram Dreem Draum Sah Shukraya Namah",
        "mantraCount": "108 times daily in the morning (full cycle: 16,000)",
        "charity": "Donate white sweets, rice, curd, perfume or white cloth on Friday",
        "lifestyle": "Wear clean, fragrant clothes; keep the southeast zone beautiful and fresh; use rose/white scents; honor partner and women in life",
        "fast": "Friday fast; kheer or white sweets as prasad"
      },
      "7": {
        "planet": "Ketu",
        "element": "Fire (shadow)",
        "traits": "Spirituality, intuition, research, detachment, past-life karma, moksha",
        "governs": [
          "Health",
          "Career"
        ],
        "weakSigns": "Directionless phases, unexplained fears, sudden losses, feeling invisible, digestive issues",
        "day": "Tuesday (or Saturday)",
        "color": "Multi-color, Brown, Smoky tones",
        "metal": "Mixed metal / Panchdhatu",
        "crystal": "Cat's Eye (Lehsunia) or Tiger's Eye",
        "rudraksha": "9 Mukhi Rudraksha",
        "mantra": "Om Sram Sreem Sraum Sah Ketave Namah",
        "mantraCount": "108 times daily before sunrise (full cycle: 17,000)",
        "charity": "Feed stray dogs; donate multi-colored blankets, sesame or flag at a temple on Tuesday/Saturday",
        "lifestyle": "Meditate 10 minutes daily; keep a spiritual corner at home; avoid grey areas in dealings; donate without announcement",
        "fast": "Tuesday or Saturday fast; coconut offerings"
      },
      "8": {
        "planet": "Saturn (Shani)",
        "element": "Air",
        "traits": "Discipline, structure, career, justice, delays, hard work, long-term results",
        "governs": [
          "Career",
          "Business"
        ],
        "weakSigns": "Chronic delays, career stagnation, joint/bone pain, feeling overworked yet unrewarded",
        "day": "Saturday",
        "color": "Dark Blue, Black, Purple",
        "metal": "Iron / Black Steel",
        "crystal": "Blue Sapphire (only after expert check) or Amethyst / Lapis Lazuli",
        "rudraksha": "7 Mukhi Rudraksha (or 14 Mukhi for protection)",
        "mantra": "Om Pram Preem Praum Sah Shanaishcharaya Namah",
        "mantraCount": "108 times daily in the evening (full cycle: 23,000)",
        "charity": "Donate black sesame, mustard oil, iron, black cloth or footwear to the needy on Saturday",
        "lifestyle": "Serve workers, elderly and the underprivileged; oil massage on Saturdays; keep commitments punctually; light a sesame-oil lamp under a peepal tree on Saturday evening",
        "fast": "Saturday fast; khichdi after sunset"
      },
      "9": {
        "planet": "Mars (Mangal)",
        "element": "Fire",
        "traits": "Energy, courage, action, property, siblings, drive, surgery/engineering",
        "governs": [
          "Health",
          "Money",
          "Business"
        ],
        "weakSigns": "Low drive or uncontrolled anger, property disputes, blood pressure, accidents, debt",
        "day": "Tuesday",
        "color": "Red, Coral, Vermilion",
        "metal": "Copper",
        "crystal": "Red Coral or Carnelian (substitute: Red Jasper)",
        "rudraksha": "3 Mukhi Rudraksha",
        "mantra": "Om Kram Kreem Kraum Sah Bhaumaya Namah",
        "mantraCount": "108 times daily at sunrise (full cycle: 10,000)",
        "charity": "Donate red lentils (masoor), jaggery, red cloth or copper on Tuesday",
        "lifestyle": "Exercise daily; channel anger into sport; recite Hanuman Chalisa on Tuesdays; keep the south of home well-lit",
        "fast": "Tuesday fast on jaggery-and-wheat items"
      }
    },
    "traits": {
      "1": {
        "nature": "A born leader — independent, original, and authoritative. You prefer to initiate rather than follow, and you recover quickly from setbacks.",
        "innerDrive": "a deep need to lead, to be recognised, and to stand on your own name",
        "strengths": [
          "Leadership and initiative",
          "Confidence under pressure",
          "Original, independent thinking",
          "Determination and quick recovery"
        ],
        "shadows": [
          "Ego and pride when challenged",
          "Stubbornness — my way or no way",
          "Impatience with slower people",
          "Dominating conversations and decisions"
        ],
        "adopt": [
          "Decisive action",
          "Self-belief without arrogance",
          "Pioneering spirit",
          "Personal accountability"
        ],
        "release": [
          "Micromanaging others",
          "Need for constant approval",
          "Anger when opposed",
          "Doing everything alone"
        ]
      },
      "2": {
        "nature": "Gentle, intuitive, and diplomatic. You sense undercurrents others miss and bring people together — the quiet force behind harmony.",
        "innerDrive": "a deep need for connection, emotional security, and peaceful surroundings",
        "strengths": [
          "Empathy and emotional intelligence",
          "Cooperation and peacemaking",
          "Patience and diplomacy",
          "Strong intuition about people"
        ],
        "shadows": [
          "Over-sensitivity to criticism",
          "Mood swings and worry loops",
          "Self-doubt at decision time",
          "Dependency on others' reassurance"
        ],
        "adopt": [
          "Calm persistence",
          "Healthy collaboration",
          "Trusting your intuition",
          "Nurturing yourself first"
        ],
        "release": [
          "Taking things personally",
          "People-pleasing",
          "Hesitation and over-deliberation",
          "Absorbing others' moods"
        ]
      },
      "3": {
        "nature": "Optimistic, expressive, and wise. You think big, teach naturally, and lift the mood of every room you enter.",
        "innerDrive": "a deep need to grow, to teach, and to see your ideas expand in the world",
        "strengths": [
          "Communication and expression",
          "Vision and big-picture thinking",
          "Teaching and mentoring ability",
          "Generosity and humour"
        ],
        "shadows": [
          "Scattered energy across too many projects",
          "Over-promising and exaggeration",
          "Extravagance with money",
          "Preaching instead of listening"
        ],
        "adopt": [
          "Disciplined learning",
          "Mentoring others",
          "Gratitude practice",
          "Finishing what you envision"
        ],
        "release": [
          "Judging others quickly",
          "Impulse spending",
          "Unfinished projects",
          "Talking more than listening"
        ]
      },
      "4": {
        "nature": "Unconventional, practical, and tireless. You build differently — systems, gadgets, methods — and you are at your best when breaking an old pattern.",
        "innerDrive": "a deep need to build something different and break through imposed limits",
        "strengths": [
          "Out-of-the-box thinking",
          "Endurance and hard work",
          "Technology and systems aptitude",
          "Courage to reform"
        ],
        "shadows": [
          "Restlessness and sudden extremes",
          "Rigidity inside your own routines",
          "Suspicion of others' motives",
          "All-or-nothing decisions"
        ],
        "adopt": [
          "Structured innovation",
          "Persistence through boring phases",
          "Financial prudence",
          "Adaptability to change"
        ],
        "release": [
          "Worst-case overthinking",
          "Unnecessary secrecy",
          "Impulsive risks",
          "Rules for the sake of rules"
        ]
      },
      "5": {
        "nature": "Versatile, witty, and quick. You are the communicator and the deal-maker — freedom, variety, and movement keep you alive.",
        "innerDrive": "a deep need for freedom, variety, and movement — mental and physical",
        "strengths": [
          "Communication and persuasion",
          "Adaptability in any situation",
          "Sharp calculation and business sense",
          "Networking and multi-tasking"
        ],
        "shadows": [
          "Restlessness and inconsistency",
          "Scattered focus",
          "Starting without finishing",
          "Nervous energy and over-analysis"
        ],
        "adopt": [
          "Curiosity with follow-through",
          "Clear, honest speech",
          "Financial planning",
          "Flexibility with commitments"
        ],
        "release": [
          "Gossip and loose talk",
          "Impatience with slower minds",
          "Too many open loops",
          "Chasing every new thing"
        ]
      },
      "6": {
        "nature": "Charming, caring, and responsible. Beauty, comfort, and relationships matter to you — people feel looked-after around you.",
        "innerDrive": "a deep need for love, beauty, harmony, and a beautiful environment",
        "strengths": [
          "Magnetism and charm",
          "Nurturing and responsibility",
          "Aesthetic taste",
          "Harmony-building in groups"
        ],
        "shadows": [
          "Perfectionism that delays",
          "Over-attachment and possessiveness",
          "Indulgence and comfort spending",
          "Interfering in others' lives"
        ],
        "adopt": [
          "Self-care alongside caregiving",
          "Healthy boundaries",
          "Appreciation of beauty daily",
          "Deep commitment"
        ],
        "release": [
          "Possessiveness",
          "Vanity",
          "Carrying others' burdens",
          "Comfort-zone spending"
        ]
      },
      "7": {
        "nature": "Introspective, analytical, and spiritual. You seek the truth beneath the surface — a researcher of life, happiest with depth over noise.",
        "innerDrive": "a deep need for meaning, truth, and inner knowing",
        "strengths": [
          "Research and analytical depth",
          "Strong intuition",
          "Independence of thought",
          "Wisdom-seeking"
        ],
        "shadows": [
          "Isolation and aloofness",
          "Over-thinking into paralysis",
          "Distrust of people",
          "Detachment from practical duties"
        ],
        "adopt": [
          "Purposeful solitude",
          "Faith in your intuition",
          "Deep, focused study",
          "Simplicity in living"
        ],
        "release": [
          "Suspicion without evidence",
          "Analysis-paralysis",
          "Pessimism",
          "Withdrawing when hurt"
        ]
      },
      "8": {
        "nature": "Disciplined, enduring, and justice-oriented. Life tests you early and often — and it is exactly that pressure that forges your authority.",
        "innerDrive": "a deep need for order, justice, and lasting results that outlive you",
        "strengths": [
          "Hard work and endurance",
          "Organization and systems",
          "Loyalty and dependability",
          "Long-term vision"
        ],
        "shadows": [
          "Pessimism and self-criticism",
          "Rigidity",
          "Feelings locked inside",
          "Workaholism"
        ],
        "adopt": [
          "Patience with the process",
          "Systems thinking",
          "Fairness in judgement",
          "Consistency over intensity"
        ],
        "release": [
          "Grudges",
          "Fear of failure",
          "All work and no play",
          "Carrying the world alone"
        ]
      },
      "9": {
        "nature": "Energetic, courageous, and protective. You are built for action — you defend your people fiercely and finish what others abandon.",
        "innerDrive": "a deep need to act, to protect, and to win",
        "strengths": [
          "Courage and decisiveness",
          "High energy and stamina",
          "Drive to completion",
          "Protection of others"
        ],
        "shadows": [
          "Anger and impulsiveness",
          "Ego in conflict",
          "Haste that skips details",
          "Burnout from over-driving"
        ],
        "adopt": [
          "Channelled aggression through sport or service",
          "Quick forgiveness",
          "Bold initiative",
          "Disciplined action"
        ],
        "release": [
          "Arguments for winning's sake",
          "Revenge thoughts",
          "Uncalculated risks",
          "Rushing past people"
        ]
      }
    },
    "planes": [
      {
        "name": "Mental Plane",
        "zone": "Top row of the Lo Shu Grid",
        "cells": [
          4,
          9,
          2
        ],
        "about": "This plane describes your thinking pattern — how you plan, judge, decide, and turn an idea into a practical direction. A strong mental plane does not simply mean intelligence; it shows whether your mind naturally connects planning, confidence, and grounded judgement. A weak or missing pattern does not mean you cannot think well, but it usually means you need external structure, written planning, or better decision systems to avoid scattered or delayed choices.",
        "roles": {
          "2": {
            "short": "Grounding",
            "label": "grounded judgement",
            "con": "judgements made on emotion or urgency rather than ground facts",
            "fix": "pause before concluding and test decisions against facts and one trusted advisor"
          },
          "4": {
            "short": "Planning",
            "label": "planning & structure",
            "con": "deciding first and structuring later, which can create avoidable reversals",
            "fix": "write the goal, risk, cost, and next three steps before every major choice"
          },
          "9": {
            "short": "Action",
            "label": "decisive action & confidence",
            "con": "hesitation at the exact moment a decision is needed",
            "fix": "practise small, quick decisions daily to rebuild decision confidence"
          }
        },
        "complete": "Planning, confidence, and grounded judgement work together — this supports clear strategy, confident decisions, and the ability to explain your reasoning. A strong advisory and leadership mind. Guard against over-analysis; even the best mind must eventually decide."
      },
      {
        "name": "Emotional Plane",
        "zone": "Middle row of the Lo Shu Grid",
        "cells": [
          3,
          5,
          7
        ],
        "about": "This plane describes your emotional processing — how you feel, express, absorb, regulate, and set boundaries. It is not only about being emotional; it shows whether feelings become clear communication, stable self-understanding, and mature limits. A weaker pattern can still give warmth or sensitivity, but the person may need more deliberate reflection before reacting, sharing, or closing themselves off.",
        "roles": {
          "3": {
            "short": "Expression",
            "label": "emotional expression & growth",
            "con": "appearing composed and controlled outside while feelings stay unexpressed — over time this can turn into distance or quiet resentment",
            "fix": "create a safe method of expression — honest conversations, writing, therapy-style reflection, or creative work"
          },
          "5": {
            "short": "Grounding",
            "label": "emotional grounding",
            "con": "emotions that swing before they settle, especially under pressure",
            "fix": "practise centring rituals — breathwork, journaling, or time near water"
          },
          "7": {
            "short": "Boundaries",
            "label": "boundaries & refinement",
            "con": "porous boundaries — absorbing other people's moods and problems as your own",
            "fix": "define what you will and will not accept, and communicate it calmly and early"
          }
        },
        "complete": "Feelings flow into words cleanly, you read others well, and relationships receive both warmth and mature limits. This is a strong pattern for partnerships, caregiving, public-facing work, and team harmony."
      },
      {
        "name": "Practical Plane",
        "zone": "Bottom row of the Lo Shu Grid",
        "cells": [
          8,
          1,
          6
        ],
        "about": "This plane describes your material execution — how you handle work, money, resources, delivery, and real-world results. A strong practical plane usually supports converting ability into visible outcomes. A weaker pattern does not mean failure; it means the person may need stronger systems, partners, deadlines, distribution habits, or financial discipline so effort does not remain incomplete or unmonetised.",
        "roles": {
          "1": {
            "short": "Ownership",
            "label": "drive & personal ownership",
            "con": "waiting for direction instead of owning outcomes end-to-end",
            "fix": "take single-point ownership of one outcome at a time"
          },
          "6": {
            "short": "Finish Quality",
            "label": "quality & refinement of output",
            "con": "rushed output that undersells your real ability",
            "fix": "define a finish standard before starting and deliver to it"
          },
          "8": {
            "short": "Resources",
            "label": "responsibility & resource handling",
            "con": "effort that stays incomplete or unmonetised despite hard work",
            "fix": "build systems — budgets, checklists, deadlines — that carry work to completion"
          }
        },
        "complete": "Resources, ownership, and execution quality work together — a strong pattern for business, career growth, property, operations, and money management. You naturally ask 'how will this actually work?' The area to manage is becoming too outcome-focused; do not let productivity dry out your inner life."
      },
      {
        "name": "Thought Plane",
        "zone": "Left column of the Lo Shu Grid",
        "cells": [
          4,
          3,
          8
        ],
        "about": "This plane describes long-form thinking — how you learn, analyse, connect ideas, and build understanding over time. It is different from quick intelligence. It shows whether your thoughts naturally become structured insight, deep study, and useful strategy. When this plane is weak, the person may still be smart, but thinking often improves when it is written down, discussed with the right people, and tested against real-world outcomes.",
        "roles": {
          "3": {
            "short": "Learning",
            "label": "learning & knowledge growth",
            "con": "skill growth that plateaus because new inputs stop arriving",
            "fix": "schedule one new input every week — a book, course, or mentor conversation"
          },
          "4": {
            "short": "Ideas",
            "label": "idea generation",
            "con": "repeating known frames instead of questioning whether the strategy itself needs change",
            "fix": "capture ideas the moment they appear — a notes habit turns sparks into strategy"
          },
          "8": {
            "short": "Depth",
            "label": "mental endurance & depth",
            "con": "giving up on hard problems just before the breakthrough",
            "fix": "schedule periodic zoom-outs: review assumptions and check that effort is going in the right direction"
          }
        },
        "complete": "Ideas, learning, and depth reinforce each other — you can master complex subjects and convert study into strategy. This supports advisory roles, research, teaching, and any field where understanding compounds."
      },
      {
        "name": "Will Plane",
        "zone": "Middle column of the Lo Shu Grid",
        "cells": [
          9,
          5,
          1
        ],
        "about": "This plane describes willpower — how you push through resistance, stay steady under pressure, and adjust when circumstances change. It is not only about aggression or ambition; it shows whether your drive has stamina and flexibility. When this plane is weak, motivation may come in waves, so external accountability, public commitments, routines, and pressure-based deadlines become especially important.",
        "roles": {
          "1": {
            "short": "Direction",
            "label": "self-belief & direction",
            "con": "drive that depends on others' approval or borrowed goals",
            "fix": "write your own direction down — self-chosen goals feed this plane"
          },
          "5": {
            "short": "Steadiness",
            "label": "steadiness & adaptability",
            "con": "motivation that wavers whenever conditions change",
            "fix": "anchor yourself with fixed routines that hold you steady through change"
          },
          "9": {
            "short": "Drive",
            "label": "drive & pushing power",
            "con": "strong intentions without force behind them when resistance appears",
            "fix": "use physical training, sport, or competition to build healthy pushing power"
          }
        },
        "complete": "You can start with force, continue with patience, and change tactics when the situation demands — useful for entrepreneurship, sports, leadership, crisis work, and long projects. Strong will can also push past healthy limits; pair ambition with recovery and honest review points."
      },
      {
        "name": "Action Plane",
        "zone": "Right column of the Lo Shu Grid",
        "cells": [
          2,
          7,
          6
        ],
        "about": "This plane describes follow-through — how you take intention and convert it into disciplined, finished action. It shows patience, boundaries, standards, and the ability to complete work cleanly. A weaker action plane can create delay, overthinking, poor finish, or difficulty enforcing limits, even when the person has good ideas or strong desire. The solution is usually clearer rules, smaller deadlines, and a defined finish standard.",
        "roles": {
          "2": {
            "short": "Patience",
            "label": "patience & grounding in action",
            "con": "over-editing, checking, or holding back instead of completing — hidden perfection does not produce results",
            "fix": "work to practical deadlines and minimum-viable standards — decide what is good enough for the current stage"
          },
          "6": {
            "short": "Completion",
            "label": "finish quality",
            "con": "many things started, few cleanly finished",
            "fix": "define 'done' before you start, and close tasks fully before opening new ones"
          },
          "7": {
            "short": "Standards",
            "label": "standards & limits",
            "con": "unclear limits, so work expands endlessly past its useful size",
            "fix": "set clear rules for when to stop refining and ship"
          }
        },
        "complete": "Intentions reliably become finished work — patience, standards, and finish quality combine into a reputation for clean delivery. This supports operations, craftsmanship, and any role where the last 10% decides the value."
      },
      {
        "name": "Golden Rajyoga",
        "zone": "Diagonal of the Lo Shu Grid (4 – 5 – 6)",
        "cells": [
          4,
          5,
          6
        ],
        "about": "This diagonal is read as an opportunity-to-output pattern. It shows whether a person can notice openings, stabilise them into a workable structure, and refine them into something valuable. It is useful for business, career growth, freelancing, branding, sales, and opportunity conversion. It does not guarantee wealth by itself; it shows the natural support for converting chances into organised and presentable results.",
        "roles": {
          "4": {
            "short": "Opportunity",
            "label": "spotting fresh opportunities",
            "con": "comfort with known formats while faster-moving openings pass unnoticed",
            "fix": "scan your market weekly — competitors, customer behaviour, new platforms, changing prices"
          },
          "5": {
            "short": "Structure",
            "label": "structuring what you find",
            "con": "opportunities that stay informal and leak value before they crystallise",
            "fix": "give every opportunity a structure: owner, timeline, and budget"
          },
          "6": {
            "short": "Refinement",
            "label": "refining results into value",
            "con": "results delivered plain when they could be packaged premium",
            "fix": "polish before you present — packaging converts work into value"
          }
        },
        "complete": "Opportunity spotting, structure, and refinement connect into a strong wealth-conversion pattern — business, sales, branding, and career growth all benefit directly. Once you identify the right opening, your ability to structure and refine converts it well."
      },
      {
        "name": "Silver Rajyoga",
        "zone": "Diagonal of the Lo Shu Grid (8 – 5 – 2)",
        "cells": [
          8,
          5,
          2
        ],
        "about": "This diagonal is read as a material-stability and asset-consolidation pattern. It is connected with property, savings, resource management, patience, and grounded progress. It does not mean instant money. It shows whether the person naturally understands holding, managing, protecting, and slowly building material security. When weak, property or asset growth may still happen, but it usually needs deliberate planning and disciplined external systems.",
        "roles": {
          "2": {
            "short": "Patience",
            "label": "patience & continuity",
            "con": "becoming too controlling or pressure-driven when dealing with assets",
            "fix": "let assets mature — add patience, relationship sensitivity, and gradual planning instead of pressure"
          },
          "5": {
            "short": "Management",
            "label": "balanced management",
            "con": "money and resources handled reactively instead of on a rhythm",
            "fix": "review money and resources on a fixed monthly rhythm"
          },
          "8": {
            "short": "Assets",
            "label": "asset & resource structure",
            "con": "assets held without structure, documentation, or protection",
            "fix": "formalise your assets — documentation, insurance, and clear ownership"
          }
        },
        "complete": "Asset sense, balanced management, and patience combine into steady material security — property, savings, and long-term holdings grow well under your hand. This is the classic wealth-consolidation diagonal."
      }
    ],
    "arrows": [
      {
        "name": "Arrow of Planning",
        "line": [
          4,
          9,
          2
        ],
        "axis": "Top row (4-9-2)",
        "present": "You think before you act — you plan, weigh options and move with a clear strategy. Strong for business, study and any long project.",
        "missing": "Arrow of Confusion — decisions come impulsively or too late. Use written plans, cost/benefit checks and a decision checklist before acting."
      },
      {
        "name": "Arrow of Emotions",
        "line": [
          3,
          5,
          7
        ],
        "axis": "Middle row (3-5-7)",
        "present": "You feel deeply and express it well — warmth, empathy and intuition flow naturally, making you naturally good with people.",
        "missing": "Arrow of Emotional Restlessness — feelings get bottled up or swing under pressure. Practise daily expression, journaling and centring rituals."
      },
      {
        "name": "Arrow of Practicality",
        "line": [
          8,
          1,
          6
        ],
        "axis": "Bottom row (8-1-6)",
        "present": "You convert ideas into real results — money, work and delivery come naturally. Strong material, career and business instincts.",
        "missing": "Arrow of Frustration — effort does not convert into results. Install systems: budgets, deadlines and checklists that carry work to completion."
      },
      {
        "name": "Arrow of Intellect",
        "line": [
          4,
          3,
          8
        ],
        "axis": "Left column (4-3-8)",
        "present": "A strong analytical mind — you learn deeply, connect ideas and master complex subjects over time.",
        "missing": "Arrow of Shallow Thinking — learning plateaus and known patterns repeat. Feed the mind weekly with books, courses or a mentor conversation."
      },
      {
        "name": "Arrow of Determination",
        "line": [
          9,
          5,
          1
        ],
        "axis": "Middle column (1-5-9)",
        "present": "You push through resistance with steady will and self-belief — a natural leader who finishes what they start.",
        "missing": "Arrow of Wavering Will — motivation comes in waves. Anchor yourself with fixed routines, public commitments and physical training."
      },
      {
        "name": "Arrow of Activity",
        "line": [
          2,
          7,
          6
        ],
        "axis": "Right column (2-7-6)",
        "present": "You finish what you start — patience, standards and follow-through combine into reliable, clean delivery.",
        "missing": "Arrow of Unfinished Work — many things started, few completed. Define 'done' before you begin and close tasks fully."
      },
      {
        "name": "Arrow of Prosperity",
        "line": [
          4,
          5,
          6
        ],
        "axis": "Diagonal (4-5-6)",
        "present": "Opportunity meets structure and polish — you convert chances into wealth, branding and recognition.",
        "missing": "Openings slip past or leak value. Scan your market weekly and give every opportunity an owner, timeline and budget."
      },
      {
        "name": "Arrow of Spirituality",
        "line": [
          8,
          5,
          2
        ],
        "axis": "Diagonal (8-5-2)",
        "present": "Inner calm and patience — you hold steady, build assets slowly and stay grounded under stress.",
        "missing": "Restlessness and money-pressure. Let assets mature; add patience and a fixed monthly review of money and resources."
      }
    ],
    "missingFix": {
      "1": "Strengthen the Sun: offer water at sunrise; place a sun symbol or copper item in the east.",
      "2": "Strengthen the Moon: wear silver; keep a water element in the northwest; practice calming breathwork.",
      "3": "Strengthen Jupiter: wear yellow on Thursdays; keep the northeast clean, light and sacred.",
      "4": "Balance Rahu: clear southwest clutter; donate on Saturdays; reduce gadget dependence at night.",
      "5": "Strengthen Mercury: add green plants to the north/workspace; journal daily; wear green on Wednesdays.",
      "6": "Strengthen Venus: beautify the southeast; wear fragrance and clean white/pastel clothes on Fridays.",
      "7": "Balance Ketu: create a meditation corner; donate to spiritual causes; spend time in silence weekly.",
      "8": "Strengthen Saturn: serve the needy on Saturdays; keep the west tidy; honor deadlines and discipline.",
      "9": "Strengthen Mars: exercise daily; keep the south well-lit; recite Hanuman Chalisa on Tuesdays."
    },
    "watch": {
      "metal": {
        "1": "Gold or gold-tone stainless steel",
        "2": "Silver stainless steel (pure silver tone)",
        "3": "Gold or brass-tone metal",
        "4": "Two-tone mixed metal or dark gunmetal",
        "5": "Silver steel or bronze-green accents",
        "6": "Rose gold, white gold or silver",
        "7": "Panchdhatu / two-tone mixed metal",
        "8": "Dark steel, black metal or iron-tone; two-tone silver+gold also balances",
        "9": "Copper-tone or red-accent metal"
      },
      "dial": {
        "1": "Champagne, gold or white sunray dial",
        "2": "White, silver or mother-of-pearl dial (best for the Moon)",
        "3": "Cream, ivory or champagne dial",
        "4": "Grey, smoky or deep blue dial",
        "5": "Ice-blue, teal or light green dial",
        "6": "White, pink or rose-textured dial",
        "7": "Earth-tone, brown or gradient dial",
        "8": "Dark blue or black dial with clean indices",
        "9": "Red-accent, coral or deep maroon dial"
      },
      "geometry": {
        "1": "Round case with clean markers",
        "2": "Round, soft curves — avoid sharp edges",
        "3": "Round or cushion case",
        "4": "Square, rectangular or unconventional shapes",
        "5": "Slim round case; day-date window favored",
        "6": "Round or oval, elegant profile",
        "7": "Minimal, uncluttered dial layout",
        "8": "Octagonal (8-sided) or square tank case — mirrors Saturn structure",
        "9": "Bold, sporty round case"
      },
      "features": {
        "1": "Simple three-hand display — clarity of leadership",
        "2": "Quiet analog; avoid constant-notification smartwatches (Rahu noise disturbs Moon)",
        "3": "Classic analog with date; avoid digital clutter",
        "4": "Chronograph or tech-forward features acceptable",
        "5": "Day-date complication (Mercury + structure)",
        "6": "Slim dress profile; crystal accents favorable",
        "7": "Minimal complications; quiet dial",
        "8": "Day-date display for discipline and tracking; structured metal bracelet",
        "9": "Durable build; rotating bezel or sport functions"
      },
      "strap": {
        "1": "Gold-tone metal bracelet",
        "2": "Silver metal mesh or link bracelet — metal grounds the mind",
        "3": "Leather tan/brown or gold-tone bracelet",
        "4": "Metal bracelet preferred over silicone",
        "5": "Steel bracelet or green leather",
        "6": "Metal link bracelet; avoid rubber",
        "7": "Leather or mixed-metal bracelet",
        "8": "Multi-link steel or jubilee bracelet — anchored structure",
        "9": "Copper-tone bracelet or red/brown leather"
      },
      "avoid": {
        "1": "Overly dark or blacked-out dials",
        "2": "Smartwatches with constant pinging; if used, set silver/white minimal watch-face, metallic strap, and Do-Not-Disturb at night",
        "5": "Overly busy dials that scatter Mercury focus",
        "8": "Flimsy plastic watches — weakens structure"
      }
    },
    "crystals": {
      "Ruby": {
        "chakra": "Root / Heart",
        "benefits": "Sun's gem of vitality, authority and courage; strengthens the heart, confidence and leadership.",
        "pair": "Red Coral or Gold (Sun energy)"
      },
      "Red Coral": {
        "chakra": "Root",
        "benefits": "Mars's gem of courage, protection and blood vitality; energises and defends.",
        "pair": "Carnelian (for accessible action energy)"
      },
      "Pearl": {
        "chakra": "Crown / Sacral",
        "benefits": "Moon's gem of the mind — soothes emotions, cools the temper, and supports intuition and calm sleep.",
        "pair": "Moonstone (deepens emotional balance)"
      },
      "Yellow Sapphire": {
        "chakra": "Crown / Throat",
        "benefits": "Jupiter's gem of wisdom, wealth and dharma; attracts mentors, growth and prosperity.",
        "pair": "Citrine (its accessible substitute)"
      },
      "Emerald": {
        "chakra": "Heart",
        "benefits": "Mercury's gem of intellect and speech; sharpens communication, memory and business acumen.",
        "pair": "Green Aventurine (its accessible substitute)"
      },
      "Diamond": {
        "chakra": "Crown",
        "benefits": "Venus's gem of purity and light; amplifies love, clarity and self-worth.",
        "pair": "Clear Quartz (its accessible stand-in)"
      },
      "Blue Sapphire": {
        "chakra": "Throat / Third Eye",
        "benefits": "Saturn's gem of discipline, structure and rapid karmic reward; powerful — wear only after an expert check.",
        "pair": "Amethyst or Lapis Lazuli (gentler substitutes)"
      },
      "Hessonite": {
        "chakra": "Root",
        "benefits": "Rahu's gem (Gomed) — clears confusion, breaks illusions and stabilises sudden change; wear only on expert advice.",
        "pair": "Smoky Quartz (for gentle grounding)"
      },
      "Cat's Eye": {
        "chakra": "Root / Third Eye",
        "benefits": "Ketu's gem (Lehsunia) — sharpens intuition, protects from the unseen and steadies karmic shifts; wear on expert advice.",
        "pair": "Tiger's Eye (for a gentler version)"
      },
      "Amethyst": {
        "chakra": "Third Eye / Crown",
        "benefits": "Calms the mind, reduces stress, enhances intuition, and promotes spiritual peace.",
        "pair": "Clear Quartz (to amplify) or Selenite (to cleanse)"
      },
      "Clear Quartz": {
        "chakra": "Crown",
        "benefits": "The master healer; amplifies intention, cleanses the aura and programmes easily for any goal.",
        "pair": "Amethyst (to amplify) or Selenite (to cleanse)"
      },
      "Rose Quartz": {
        "chakra": "Heart",
        "benefits": "Unconditional love, emotional healing, self-care, and attracting romance.",
        "pair": "Moonstone (for emotional balance)"
      },
      "Smoky Quartz": {
        "chakra": "Root",
        "benefits": "Deeply grounding; absorbs negativity, dissolves debt-mindset and anchors scattered energy.",
        "pair": "Black Tourmaline (for protection)"
      },
      "Citrine": {
        "chakra": "Solar Plexus",
        "benefits": "Wealth generation, abundance, joy, and personal power. Known as the \"Merchant's Stone\".",
        "pair": "Pyrite or Green Aventurine (the Dhan Yog combo)"
      },
      "Black Tourmaline": {
        "chakra": "Root",
        "benefits": "Ultimate protection against negative energy, EMF smog, and the Evil Eye (Nazar). Grounding.",
        "pair": "Smoky Quartz (for deep grounding and debt clearing)"
      },
      "Obsidian": {
        "chakra": "Root",
        "benefits": "Protective truth-mirror; grounds, shields and surfaces what needs releasing — no sugar-coating.",
        "pair": "Black Tourmaline"
      },
      "Black Onyx": {
        "chakra": "Root",
        "benefits": "Strength, self-mastery and protection; supports discipline and steady Saturnian grounding.",
        "pair": "Smoky Quartz"
      },
      "White Opal": {
        "chakra": "Crown",
        "benefits": "Amplifies emotional clarity and inspiration; the Moon's substitute for pearl when the real gem is unavailable.",
        "pair": "Moonstone"
      },
      "White Zircon": {
        "chakra": "Crown",
        "benefits": "Venus's substitute for diamond; brings clarity, brilliance and refined charm.",
        "pair": "Clear Quartz"
      },
      "Moonstone": {
        "chakra": "Sacral / Crown",
        "benefits": "Enhances intuition, balances hormones and cycles, and invites gentle emotional flow.",
        "pair": "Pearl (for pure calming Moon energy)"
      },
      "Red Jasper": {
        "chakra": "Root",
        "benefits": "Steadies the emotions, builds endurance and gently grounds fiery energy; a protective, nurturing stone.",
        "pair": "Carnelian (for action)"
      },
      "Carnelian": {
        "chakra": "Sacral",
        "benefits": "Ignites courage, motivation and creative drive; Mars's warm, accessible stone of action.",
        "pair": "Red Jasper (for grounding)"
      },
      "Tiger's Eye": {
        "chakra": "Solar Plexus / Sacral",
        "benefits": "Courage, confidence, focus, and protection from ill-wishing. Great for decision-making.",
        "pair": "Carnelian (for action and motivation)"
      },
      "Green Aventurine": {
        "chakra": "Heart",
        "benefits": "The merchant's good-luck stone; attracts opportunity, soothes nerves and supports steady growth.",
        "pair": "Citrine (the Dhan Yog combo)"
      },
      "Red Aventurine": {
        "chakra": "Root",
        "benefits": "Grounding and energising; boosts drive, stamina and courage, and clears creative blocks.",
        "pair": "Red Jasper (for stability)"
      },
      "Yellow Aventurine": {
        "chakra": "Solar Plexus",
        "benefits": "Lightens pessimism, attracts opportunity and supports confident decisions — Jupiter's accessible stone.",
        "pair": "Citrine"
      },
      "Peridot": {
        "chakra": "Heart / Solar Plexus",
        "benefits": "Clears jealousy and resentment, opens the heart and refreshes confidence; Mercury's warm-green ally.",
        "pair": "Citrine"
      },
      "Lapis Lazuli": {
        "chakra": "Throat / Third Eye",
        "benefits": "Stone of truth and wisdom; supports honest speech, memory and Saturn's steady discipline.",
        "pair": "Clear Quartz (to amplify)"
      },
      "Sunstone": {
        "chakra": "Sacral / Solar Plexus",
        "benefits": "Carries Sun confidence, joy and personal power; lifts mood and banishes self-doubt.",
        "pair": "Citrine (for abundance)"
      },
      "Aquamarine": {
        "chakra": "Throat",
        "benefits": "Cooling and courageous; calms the mind, eases communication and soothes emotional storms.",
        "pair": "Clear Quartz"
      },
      "Amazonite": {
        "chakra": "Heart / Throat",
        "benefits": "The truth-teller; balances emotion with speech, soothes anxiety and supports healthy boundaries.",
        "pair": "Amethyst"
      },
      "Blue Lace Agate": {
        "chakra": "Throat",
        "benefits": "Gentlest communicator; dissolves tension, encourages calm expression and eases overthinking.",
        "pair": "Aquamarine"
      },
      "Malachite": {
        "chakra": "Heart",
        "benefits": "Powerful heart-transformer; clears old emotional patterns and invites deep healing and growth.",
        "pair": "Rose Quartz (to soften its intensity)"
      },
      "Turquoise": {
        "chakra": "Throat / Heart",
        "benefits": "The sky stone; protects, aligns speech with truth, and balances giving and receiving.",
        "pair": "Lapis Lazuli"
      },
      "Garnet": {
        "chakra": "Root",
        "benefits": "Devotion, stamina and grounded passion; anchors energy and supports commitment.",
        "pair": "Smoky Quartz (for grounding)"
      },
      "Selenite": {
        "chakra": "Crown / Ether",
        "benefits": "Liquid light. Cleanses, charges, and recharges other crystals. Promotes deep peace and clarity.",
        "pair": "Use as a base — place your bracelets and crystals on Selenite weekly"
      },
      "5 Mukhi Rudraksha": {
        "chakra": "Throat / Heart",
        "benefits": "Ruled by Lord Kalagni (Shiva). Balances the 5 elements, lowers blood pressure, and calms the mind.",
        "pair": "Crystal beads (combines spiritual grounding with mineral energy)"
      }
    },
    "seleniteRitual": "Weekly cleansing ritual: every Saturday night, place all your crystals and bracelets on a Selenite plate or slab. By morning they are cleansed and recharged — never let crystals go more than a month without cleansing.",
    "dayWear": [
      {
        "day": "Monday",
        "num": 2,
        "colors": "White, silver, cream or light grey",
        "note": "Moon day — calming, mind-soothing colours"
      },
      {
        "day": "Tuesday",
        "num": 9,
        "colors": "Red, coral or maroon",
        "note": "Mars day — energising, courage-boosting colours"
      },
      {
        "day": "Wednesday",
        "num": 5,
        "colors": "Green, mint or light green",
        "note": "Mercury day — sharpens communication and business luck"
      },
      {
        "day": "Thursday",
        "num": 3,
        "colors": "Yellow, mustard or gold",
        "note": "Jupiter day — attracts wisdom, wealth and mentors"
      },
      {
        "day": "Friday",
        "num": 6,
        "colors": "White, pink, cream or pastels",
        "note": "Venus day — love, luxury and relationship harmony"
      },
      {
        "day": "Saturday",
        "num": 8,
        "colors": "Dark blue, black or purple",
        "note": "Saturn day — discipline, structure and protection"
      },
      {
        "day": "Sunday",
        "num": 1,
        "colors": "Orange, gold, saffron or royal red",
        "note": "Sun day — authority, vitality and recognition"
      }
    ],
    "careers": {
      "1": [
        "Government & administration",
        "Politics & public leadership",
        "Business ownership / entrepreneurship",
        "Senior management & CEO roles",
        "Army / police leadership",
        "Medicine (leadership positions)"
      ],
      "2": [
        "Human resources & public relations",
        "Hospitality, hotels & tourism",
        "Nursing, caregiving & psychology",
        "Counseling & healing",
        "Dairy, liquids & water trade",
        "Media & creative arts"
      ],
      "3": [
        "Teaching, education & training",
        "Banking, finance & accounts",
        "Law & judiciary",
        "Consulting & advisory",
        "Astrology & spiritual guidance",
        "Writing & publishing"
      ],
      "4": [
        "IT, software & electronics",
        "Aviation & aerospace",
        "Foreign trade / MNC jobs",
        "Startups & unconventional ventures",
        "Research & innovation",
        "Film, photography & media tech"
      ],
      "5": [
        "Business, trading & commerce",
        "Marketing, sales & advertising",
        "Media, journalism & writing",
        "Chartered accountancy & audit",
        "Data analytics & telecom",
        "Stock market & speculation"
      ],
      "6": [
        "Fashion, beauty & luxury",
        "Arts, entertainment & cinema",
        "Interior design & architecture",
        "Jewellery & automobiles",
        "Hospitality & fine dining",
        "Cosmetics & perfumes"
      ],
      "7": [
        "Research & laboratories",
        "Spirituality, occult & healing",
        "Investigation & detective work",
        "Analytics & strategy",
        "Work in foreign lands",
        "Philosophy & academia"
      ],
      "8": [
        "Engineering & manufacturing",
        "Real estate & construction",
        "Mining, oil & steel",
        "Law, insurance & compliance",
        "Large-scale & long-term projects",
        "Logistics & heavy industry"
      ],
      "9": [
        "Defence, army & police",
        "Sports & fitness",
        "Surgery & emergency medicine",
        "Engineering & mechanics",
        "Property & land dealing",
        "Energy, fire & metals sector"
      ]
    },
    "personalYear": {
      "1": "New beginnings and leadership — launch ventures, take initiative, start what you've been postponing.",
      "2": "Patience and partnerships — nurture relationships and alliances; avoid big solo launches.",
      "3": "Growth, creativity and expansion — excellent for wealth moves, visibility and learning.",
      "4": "Foundation and discipline — build systems and save; expect delays, don't force outcomes.",
      "5": "Change and opportunity — travel, marketing pushes, business pivots and bold experiments pay off.",
      "6": "Harmony, family and comfort — relationships, home, luxury and creative work flourish.",
      "7": "Introspection and mastery — research, upskill, spiritual practice; avoid impulsive risks.",
      "8": "Results and recognition — karma delivers; career milestones and rewards for past effort.",
      "9": "Completion and action — close old cycles, settle debts, bold moves in property and courage-led goals."
    },
    "vastu": {
      "directions": {
        "N": {
          "planet": 5,
          "element": "Earth",
          "label": "North (Mercury)",
          "best": "Living room, study, office desk, cash locker",
          "worst": "Master bedroom, toilet, heavy storage",
          "fix": "Keep north light, open and green. For dosh: place green plants, a money plant, or a Mercury/Buddha yantra; use light green decor; keep the zone clutter-free for cash flow."
        },
        "NE": {
          "planet": 3,
          "element": "Water",
          "label": "Northeast (Jupiter)",
          "best": "Pooja/meditation room, entrance, study, water element",
          "worst": "Kitchen, toilet, master bedroom, heavy storage, dustbin",
          "fix": "Most sacred zone. For dosh: place a water fountain or bowl, light a diya daily, keep a Guru/Jupiter yantra, paint in light yellow/white; shift heavy items out; sea-salt bowl changed weekly absorbs negativity."
        },
        "E": {
          "planet": 1,
          "element": "Fire (soft)",
          "label": "East (Sun)",
          "best": "Entrance, living room, study, balcony",
          "worst": "Toilet, staircase, store room",
          "fix": "Keep east open for morning light. For dosh: place a copper sun symbol, keep windows clean, hang a rising-sun image; avoid blocking with tall furniture."
        },
        "SE": {
          "planet": 6,
          "element": "Fire",
          "label": "Southeast (Venus)",
          "best": "Kitchen, electricals, gym",
          "worst": "Master bedroom, water tank, pooja room",
          "fix": "Fire zone. For dosh (bedroom/water here): add red/orange accents, place a copper pyramid or Venus yantra, keep a red bulb/lamp lit in evenings; avoid water features here."
        },
        "S": {
          "planet": 9,
          "element": "Fire",
          "label": "South (Mars)",
          "best": "Bedroom (with head south), staircase, heavy storage",
          "worst": "Main entrance (inauspicious pada), water tank, open empty space",
          "fix": "Keep south heavy and high. For dosh: use red/earthy tones, place a Mangal/Mars yantra, add a brass or copper item, keep the wall strong and well-lit; avoid water elements."
        },
        "SW": {
          "planet": 4,
          "element": "Earth",
          "label": "Southwest (Rahu)",
          "best": "Master bedroom, heavy furniture, owner cabin, valuables",
          "worst": "Entrance, toilet, water tank, empty open space",
          "fix": "Stability zone. For dosh (entrance/toilet here): place heavy earth elements — lead/brass pyramid, Rahu yantra, family photograph; keep door closed if toilet; use yellow/brown earthy tones; keep heaviest furniture here."
        },
        "W": {
          "planet": 8,
          "element": "Air",
          "label": "West (Saturn)",
          "best": "Dining, children's bedroom, toilet (acceptable), study",
          "worst": "Main entrance (mixed), pooja room",
          "fix": "For dosh: place metal wind chimes (6 rods), Saturn yantra, keep zone clean and organized; dark blue/grey accents; avoid fire elements here."
        },
        "NW": {
          "planet": 2,
          "element": "Air",
          "label": "Northwest (Moon)",
          "best": "Guest room, toilet (acceptable), garage, finished-goods store",
          "worst": "Master bedroom (causes instability), fire/kitchen",
          "fix": "Movement zone. For dosh (kitchen/master bedroom here): place white/silver elements, moon yantra, white flowers or pearl-moonstone bowl; use white/light grey tones; metal wind chime."
        }
      },
      "entrance": {
        "N": {
          "score": "Good",
          "note": "North entrance supports wealth flow (Mercury). Keep it well-lit and obstacle-free."
        },
        "NE": {
          "score": "Excellent",
          "note": "Northeast entrance is among the most auspicious — brings clarity and prosperity."
        },
        "E": {
          "score": "Excellent",
          "note": "East entrance welcomes rising-Sun energy — growth, health and recognition."
        },
        "SE": {
          "score": "Weak",
          "note": "Southeast entrance can cause fire-related friction and expenses. Remedy: place a copper pyramid above the door, red doormat, and two green plants flanking the entry."
        },
        "S": {
          "score": "Weak",
          "note": "South entrance is generally avoided. Remedy: Mars yantra above the door, keep the door heavy/solid, place a red bulb near entry, and keep a threshold."
        },
        "SW": {
          "score": "Dosh",
          "note": "Southwest entrance is a classic Vastu dosh — drains stability and savings. Remedy: Rahu yantra, brass pyramid, heavy door with earthy tones, keep a bright light at the entry, and place a Ganesh idol inside facing the door."
        },
        "W": {
          "score": "Moderate",
          "note": "West entrance is acceptable for some plots. Balance with metal chimes and Saturn-friendly orderliness."
        },
        "NW": {
          "score": "Good",
          "note": "Northwest entrance supports movement, networking and support from people. Keep fresh airflow here."
        }
      },
      "roomRules": [
        {
          "room": "Kitchen",
          "ideal": [
            "SE"
          ],
          "acceptable": [
            "S",
            "NW"
          ],
          "doshDirs": [
            "NE",
            "N",
            "SW"
          ],
          "doshText": "Kitchen (fire) in {dir} creates a fire-element clash — linked to health issues and expenses.",
          "fix": "Face east while cooking; place a yellow Jaisalmer stone slab or copper pyramid in the kitchen; keep a red/orange mat; if kitchen is in NE, add a small yellow bulb and sea-salt bowl."
        },
        {
          "room": "Master Bedroom",
          "ideal": [
            "SW"
          ],
          "acceptable": [
            "S",
            "W"
          ],
          "doshDirs": [
            "NE",
            "SE",
            "NW"
          ],
          "doshText": "Master bedroom in {dir} disturbs stability and relationships (SW is the zone of rest).",
          "fix": "Sleep with head towards south; use earthy tones (beige/brown); place a pair of rose-quartz stones; if bedroom is in SE, add a copper pyramid and avoid red; if in NW, add white/silver calming elements."
        },
        {
          "room": "Toilet",
          "ideal": [
            "NW",
            "W"
          ],
          "acceptable": [
            "S",
            "SSW"
          ],
          "doshDirs": [
            "NE",
            "SW",
            "SE"
          ],
          "doshText": "Toilet in {dir} flushes away that zone's energy — a significant Vastu dosh.",
          "fix": "Keep the door always closed; place a bowl of sea salt (change weekly); add a yellow bulb if in NE; place a brass pyramid on the outer wall; maintain strict dryness and ventilation; mirror on the outer door (not facing the seat) deflects energy."
        },
        {
          "room": "Pooja Room",
          "ideal": [
            "NE"
          ],
          "acceptable": [
            "E",
            "N"
          ],
          "doshDirs": [
            "S",
            "SW",
            "SE",
            "under-stairs"
          ],
          "doshText": "Pooja space in {dir} weakens spiritual protection of the home.",
          "fix": "If relocation is impossible, face east or north while praying; keep the altar on the east wall; light a diya twice daily in the NE of the home regardless."
        },
        {
          "room": "Study Room",
          "ideal": [
            "E",
            "N",
            "NE"
          ],
          "acceptable": [
            "NW",
            "W"
          ],
          "doshDirs": [
            "S",
            "SW",
            "SE"
          ],
          "doshText": "Study room in {dir} works against concentration and memory retention.",
          "fix": "Face east or north while studying; place the desk against a solid wall; keep a bookshelf in the west; use light yellow or green tones; keep a crystal or image that inspires focus on the desk."
        },
        {
          "room": "Staircase",
          "ideal": [
            "S",
            "SW",
            "W"
          ],
          "acceptable": [
            "SE",
            "NW"
          ],
          "doshDirs": [
            "NE",
            "N",
            "E"
          ],
          "doshText": "Staircase in {dir} (and especially in the centre/Brahmasthan) creates instability and drains energy.",
          "fix": "Keep the staircase well-lit and clutter-free; avoid it rising directly toward the main door; place a heavy object or plant at its base; if central, a skylight or bright light above helps."
        }
      ],
      "plotShapes": {
        "square": {
          "tone": "good",
          "note": "A square or rectangular plot with all corners intact is the most balanced and auspicious — energy flows evenly."
        },
        "rectangular": {
          "tone": "good",
          "note": "A rectangular plot (longer north-south) is balanced; a slight east-north extension is auspicious for growth."
        },
        "gomukhi": {
          "tone": "good",
          "note": "Gomukhi (narrow at the front, wide at the back) is auspicious for residence — it holds and gathers prosperity."
        },
        "shermukhi": {
          "tone": "bad",
          "note": "Shermukhi (wide at the front, narrow at the back) is generally avoided — energy and wealth are said to drain away. Remedy: strengthen the rear boundary with a wall or heavy planting."
        },
        "missing-northeast": {
          "tone": "bad",
          "note": "A cut/missing Northeast corner weakens the most sacred zone (Jupiter). Remedy: light a diya there daily, place a water feature, and keep it clean and bright."
        },
        "missing-southwest": {
          "tone": "bad",
          "note": "A missing Southwest corner destabilises the support zone (Rahu / master-bedroom area). Remedy: place heavy furniture or a brass pyramid to anchor the zone."
        },
        "missing-southeast": {
          "tone": "warn",
          "note": "A cut Southeast corner weakens the fire (kitchen) zone. Remedy: add a red/orange element and a copper pyramid."
        },
        "missing-northwest": {
          "tone": "warn",
          "note": "A cut Northwest corner weakens the movement/support zone (Moon). Remedy: add white/silver elements and a metal wind chime."
        },
        "extended-northeast": {
          "tone": "good",
          "note": "An extension in the Northeast is highly auspicious — it strengthens prosperity, clarity and spiritual growth."
        },
        "extended-southwest": {
          "tone": "bad",
          "note": "An extension in the Southwest adds excessive heaviness. Remedy: keep it uncluttered and light, and use it for storage rather than living."
        }
      }
    },
    "kua": {
      "1": {
        "group": "East",
        "element": "Water",
        "shengChi": "Southeast",
        "auspicious": [
          "Southeast",
          "East",
          "South",
          "North"
        ]
      },
      "2": {
        "group": "West",
        "element": "Earth",
        "shengChi": "Northeast",
        "auspicious": [
          "Northeast",
          "West",
          "Northwest",
          "Southwest"
        ]
      },
      "3": {
        "group": "East",
        "element": "Wood",
        "shengChi": "South",
        "auspicious": [
          "South",
          "North",
          "Southeast",
          "East"
        ]
      },
      "4": {
        "group": "East",
        "element": "Wood",
        "shengChi": "North",
        "auspicious": [
          "North",
          "South",
          "East",
          "Southeast"
        ]
      },
      "6": {
        "group": "West",
        "element": "Metal",
        "shengChi": "West",
        "auspicious": [
          "West",
          "Northeast",
          "Southwest",
          "Northwest"
        ]
      },
      "7": {
        "group": "West",
        "element": "Metal",
        "shengChi": "Northwest",
        "auspicious": [
          "Northwest",
          "Southwest",
          "Northeast",
          "West"
        ]
      },
      "8": {
        "group": "West",
        "element": "Earth",
        "shengChi": "Southwest",
        "auspicious": [
          "Southwest",
          "Northwest",
          "West",
          "Northeast"
        ]
      },
      "9": {
        "group": "East",
        "element": "Fire",
        "shengChi": "East",
        "auspicious": [
          "East",
          "Southeast",
          "North",
          "South"
        ]
      }
    },
    "masterNumbers": {
      "11": {
        "name": "Master Number 11 — The Illuminator",
        "meaning": "The higher octave of 2: intuitive vision, inspiration and spiritual illumination. It carries great sensitivity — channel it through service, art or teaching, and guard against nervous strain and self-doubt."
      },
      "22": {
        "name": "Master Number 22 — The Master Builder",
        "meaning": "The higher octave of 4 — the most powerful of the master numbers, turning grand vision into concrete reality. It demands discipline and patience; without them its energy stays as unrealised potential."
      },
      "33": {
        "name": "Master Number 33 — The Master Teacher",
        "meaning": "The higher octave of 6: compassionate guidance and selfless service. The rarest and most giving vibration — its blessing is fulfilled by lifting others."
      }
    },
    "compound": {
      "1": "Unity — beginnings, leadership and initiative. The seed energy of the Sun; a strong, independent vibration.",
      "2": "Duality — partnership, receptivity and the Moon's calm. Favours cooperation and diplomacy over force.",
      "3": "Expression — Jupiter's optimism, growth and communication. A fortunate, expansive vibration.",
      "4": "Foundation — Rahu's unconventional builder. Discipline, structure and hard work; watch for rigidity.",
      "5": "Change — Mercury's versatility, trade and movement. Quick, adaptable and entrepreneurial.",
      "6": "Harmony — Venus's love, beauty and comfort. Diplomatic and creative; watch indulgence.",
      "7": "Analysis — Ketu's depth, introspection and spirituality. Wise but inclined to solitude.",
      "8": "Power — Saturn's discipline, karma and long-term reward. Authority earned through endurance.",
      "9": "Completion — Mars's courage and action. Strong, decisive and protective; channel anger into sport.",
      "10": "Wheel of Fortune — a fortunate compound of rising and falling cycles. Success comes through adaptability and seizing the turning point; avoid complacency.",
      "11": "The Lion Muzzled — a master number of intuition and illumination carrying a classic warning: hidden opposition or over-idealism can undermine you. Channel it through clear purpose and honesty.",
      "12": "The Sacrifice — emotional sensitivity and self-sacrifice. Excellent for service, care and teaching, but guard against being taken advantage of.",
      "13": "Change & Regeneration — death-and-rebirth energy. A fortunate number for transformation and new beginnings, though often felt through upheaval first.",
      "14": "Movement & Combination — favourable for deals, media, travel and communication; but avoid rash speculation and keep commitments grounded.",
      "15": "The Magician — strong personal magnetism, eloquence and persuasive power. Excellent for the arts, sales and the occult, but carries a caution against manipulation.",
      "16": "The Tower — a cautionary number: sudden falls follow over-ambition or hidden pride. Build on honest foundations and heed warnings early.",
      "17": "Star of the Magi — highly fortunate: success, recognition and enduring love. Steady effort is rewarded with lasting fame.",
      "18": "Materialism with a spiritual warning — business and wealth can flourish, but guard against greed and conflict; balance material gains with ethics.",
      "19": "Prince of Heaven — one of the most fortunate: victory, happiness and worldly success. Rare and auspicious for leadership.",
      "20": "Awakening — a call to purpose and responsibility; the more deliberate the direction, the stronger the outcome. Avoid indecision.",
      "21": "Crown of the Magi — success and advancement through discipline and vision. A fortunate number for long-term goals and leadership.",
      "22": "The Master Builder — a master number of great vision and manifestation, but heavy: it demands discipline, patience and practical follow-through to avoid illusion.",
      "23": "Royal Star of the Lion — a fortunate number of success, protection and favour from those in power. Confident action is rewarded.",
      "24": "Love & Success — harmonious relationships, creative fulfilment and material comfort; but avoid possessiveness and dependence.",
      "25": "Strength through trial — growth comes through experience and struggle; intuition deepens with each test. Persist — the rewards are real.",
      "26": "Caution in partnerships — risk of loss through misjudged alliances or contracts. Verify agreements, trust slowly, and document everything.",
      "27": "The Command — a fortunate number of authority, wisdom and good counsel; excellent for leadership, law and teaching.",
      "28": "Contradiction & trust — great potential marred by inconsistency or misplaced trust; decide firmly and keep your word.",
      "29": "Uncertainty & warning — ambition is present but outcomes are unstable; avoid over-promising and double-check every commitment.",
      "30": "Mental superiority, emotional detachment — a strong, intellectual vibration; excellent for study and research, but soften the heart and stay connected.",
      "31": "The Hermit — a number of independence and self-reliance; a leader who may stand alone. Success is real but solitary.",
      "32": "Success & harmony — a fortunate combination of growth and balance; excellent for long-term ventures, partnerships and public work.",
      "33": "The Master Teacher — a master number of compassion and guidance; powerful for healing and teaching, but it demands service over ego.",
      "34": "Order & method — steady building through systems and patience; strong for business, but avoid rigidity and worry.",
      "35": "Social fortune — eloquence and popularity bring opportunities; guard against scattered energy and over-socialising.",
      "36": "Genius & humanity — intellectual brilliance devoted to service; watch the tendency to overthink or feel unappreciated.",
      "37": "Lucky in love & friendship — deep, harmonious relationships and creative success; one of the warmest, most fortunate bonds.",
      "38": "Pressure & caution — success is possible but often through strain; avoid envy, hasty decisions and questionable dealings.",
      "39": "Honour & fame — public recognition, achievement and artistic success; but watch pride and self-absorption.",
      "40": "Order & protection — a stable, guarded vibration; good for building quietly, but avoid isolation and complacency.",
      "41": "Ambition & achievement — strong drive with visible results; channel intensity into constructive work and avoid burnout.",
      "42": "Spiritual strength through adversity — trials refine the soul; patience and faith turn difficulty into wisdom and quiet power.",
      "43": "Rebellion & reform — a number of change-makers and unconventional paths; constructive reform succeeds, but avoid revolt for its own sake.",
      "44": "The Master of Discipline — a double-4 vibration of formidable endurance and structure; immense achievement is possible, but balance work with recovery.",
      "45": "Loss & warning — a cautionary number: avoid speculation, hasty partnerships and neglect of details; what is built must be protected.",
      "46": "Success through diplomacy — harmonious relations and steady effort bring reward; excellent for marriage and business alike.",
      "47": "Stability & wisdom — patience and reflection produce lasting, well-earned success; a fortunate, grounded number.",
      "48": "Ambition with caution — drive is strong, but impatience or misjudgement can cost you; plan carefully and act with restraint.",
      "49": "Completion & transformation — a powerful number of endings that clear the way for new beginnings; release what no longer serves.",
      "50": "Power through experience — authority earned by depth and endurance; a steady, commanding vibration for leadership.",
      "51": "The Warrior — a fortunate, dynamic number of courage and success in battle, business and competition; act decisively and fairly.",
      "52": "Adversity & endurance — progress is slow and tested; persistence through hardship builds unshakable strength and eventual reward.",
      "53": "Change & renewal — transformation through knowledge; fortunate for those who embrace learning and let go of the past.",
      "54": "Courage with risk — bold action brings results, but impulsiveness invites loss; temper fire with planning.",
      "55": "The Magician's power — immense charisma and influence, but with a real caution against misuse; integrity decides the outcome.",
      "56": "Harmony & abundance — love, comfort and growth align; a fortunate number for family, art and stable wealth.",
      "57": "Intuition & breakthrough — deep insight leads to sudden, positive change; trust your inner knowing and act on it.",
      "58": "Discipline with reward — Saturn's steady hand: hard, consistent work is repaid with lasting success and respect.",
      "59": "Transformation through courage — change is bold and complete; let go of fear and step into the new.",
      "60": "Balance & completion — a harmonious closing of cycles; rest, integrate and prepare for the next beginning.",
      "61": "Independence & originality — a pioneer's number; self-reliance and fresh ideas bring success, but guard against isolation.",
      "62": "Retreat & reflection — a number of the hidden counsellor; wisdom grows in quiet, then serves the world.",
      "63": "Communication & charm — persuasive, popular and creative; excellent for writing, teaching and trade.",
      "64": "Structure & caution — solid building with a watchful eye; avoid over-control and worry, which sap the gains.",
      "65": "Change with grace — adaptability and eloquence smooth life's transitions; a fortunate number for reinvention.",
      "66": "Caution in domestic life — love and home need conscious care; guard against possessiveness, indulgence and family friction.",
      "67": "Wisdom & stability — a fortunate blend of insight and grounding; excellent for long-term success and teaching.",
      "68": "Effort & patience — Saturn tests and then rewards; avoid pessimism and keep moving steadily toward the goal.",
      "69": "Completion & courage — endings met with strength clear the path; act bravely and close old chapters cleanly.",
      "70": "Introspection & wisdom — a number of the seeker; deep understanding and spiritual growth come through stillness.",
      "71": "The Gift — good fortune through unexpected openings and hidden help; stay open and grateful.",
      "72": "Partnership & completion — collaborative success; clear agreements and mutual respect bring the best results.",
      "73": "Expansion & vision — growth through wisdom and generosity; a fortunate number for leaders and mentors.",
      "74": "Structure & service — steady, reliable building in service of others; avoid rigidity and martyrdom.",
      "75": "Change & opportunity — adaptability opens doors; a fortunate number for trade, travel and reinvention.",
      "76": "Love & beauty — Venus's grace: harmony, art and affection flourish; watch indulgence and possessiveness.",
      "77": "Deep wisdom & mystery — a powerful number of intuition and spiritual depth; guard against isolation and over-secrecy.",
      "78": "Delusion & caution — glamour and material allure may mislead; verify facts, keep commitments simple and honest.",
      "79": "Completion & release — the end of a karmic cycle; let go with grace and prepare for renewal.",
      "80": "Power & organisation — strong, structured authority; excellent for management, but temper control with warmth.",
      "81": "Achievement & wisdom — a fortunate, elevated number; disciplined effort is crowned with lasting success and respect.",
      "82": "Adversity & patience — Saturn's test of endurance; steady, humble work converts hardship into authority.",
      "83": "Growth & renewal — expansion through learning and letting go; a fortunate number for scholars and reformers.",
      "84": "Structure & transformation — reform through discipline; change is steady and lasting when systems support it.",
      "85": "Change with wisdom — adaptability guided by insight; excellent for trade, teaching and communication.",
      "86": "Harmony & success — love and achievement align; a fortunate number for partnership and creative work.",
      "87": "Intuition & completion — inner guidance brings cycles to a graceful close; trust the still, small voice.",
      "88": "Discipline & mastery — the double-8 vibration of Saturn; immense, patient achievement is possible; avoid rigidity and self-criticism.",
      "89": "Courage & completion — bold endings clear the way for new beginnings; act with strength and integrity.",
      "90": "Introspection & renewal — a number of the seeker at rest; wisdom gathered in quiet prepares the next cycle.",
      "91": "Independence & leadership — a pioneer's power; self-reliance and fresh vision bring success; guard against isolation.",
      "92": "Partnership & insight — wisdom shared in cooperation; excellent for counselling, teaching and stable alliances.",
      "93": "Expansion & service — growth through generosity and guidance; a fortunate number for mentors and healers.",
      "94": "Structure & completion — steady building brings cycles to a full, satisfying close; avoid over-control.",
      "95": "Change & courage — bold, adaptable action transforms circumstances; a fortunate number for reinvention.",
      "96": "Love & completion — relationships and creative cycles reach fulfilment; nurture what you love.",
      "97": "Wisdom & release — deep understanding allows graceful letting-go; a powerful number of inner peace.",
      "98": "Patience & reward — Saturn's long game: endurance and discipline are repaid with lasting, respected success.",
      "99": "Mastery & completion — the highest single-figure compound; wisdom, courage and karma align for major achievement.",
      "100": "Favour of the Divine — completion of the first cycle; grace, protection and the blessing of new beginnings.",
      "101": "New beginnings — unity renewed at a higher turn of the wheel; initiation and fresh leadership energy.",
      "102": "Partnership with purpose — cooperation elevated by clarity; strong for unions and joint ventures with clear roles.",
      "103": "Expression & growth — wisdom, communication and expansion in harmony; fortunate for teachers and creators.",
      "104": "Foundation renewed — structure and discipline begin a fresh cycle; build carefully and stay flexible.",
      "105": "Change & mastery — adaptability crowned with authority; a fortunate number for leaders in times of change.",
      "106": "Harmony & completion — love, beauty and achievement reach fulfilment; a warm, fortunate closing.",
      "107": "Wisdom & renewal — deep insight opens new beginnings; trust inner guidance and step forward.",
      "108": "The Full Circle — the sacred number of completion (108 beads of the mala); karmic wholeness, protection and the blessing of a full cycle."
    },
    "nameAdvice": {
      "friendly": "Your name number vibrates in harmony with your birth numbers — no spelling change needed.",
      "neutral": "Your name number is neutral. It neither blocks nor boosts; a tuned spelling could add support.",
      "enemy": "Your name number conflicts with your birth numbers — a spelling correction is strongly recommended."
    },
    "zodiac": {
      "Aries": {
        "ruler": 9,
        "element": "Fire",
        "crystals": [
          "Red Jasper",
          "Carnelian",
          "Tiger's Eye"
        ],
        "intentions": "Fitness, courage, leadership",
        "dev": "ॐ मंगलाय नमः",
        "pron": "Om Mangalaya Namah",
        "meaning": "Salutations to Mars.",
        "affirmation": "I lead with courage, act with purpose, and ignite positive change in my life."
      },
      "Taurus": {
        "ruler": 6,
        "element": "Earth",
        "crystals": [
          "Rose Quartz",
          "Green Aventurine",
          "Emerald"
        ],
        "intentions": "Love aura, wealth, stability",
        "dev": "ॐ शुक्राय नमः",
        "pron": "Om Shukraya Namah",
        "meaning": "Salutations to Venus.",
        "affirmation": "I am grounded, abundant, and open to receiving life's greatest pleasures."
      },
      "Gemini": {
        "ruler": 5,
        "element": "Air",
        "crystals": [
          "Citrine",
          "Clear Quartz",
          "Aquamarine"
        ],
        "intentions": "Study success, communication",
        "dev": "ॐ बुधाय नमः",
        "pron": "Om Budhaya Namah",
        "meaning": "Salutations to Mercury.",
        "affirmation": "I communicate with clarity, embrace new ideas, and find joy in connection."
      },
      "Cancer": {
        "ruler": 2,
        "element": "Water",
        "crystals": [
          "Moonstone",
          "Pearl",
          "Rose Quartz"
        ],
        "intentions": "Inner peace, emotional healing, pregnancy balance",
        "dev": "ॐ सोमाय नमः",
        "pron": "Om Somaya Namah",
        "meaning": "Salutations to the Moon.",
        "affirmation": "My heart is a sanctuary of peace. I nurture myself and others with love."
      },
      "Leo": {
        "ruler": 1,
        "element": "Fire",
        "crystals": [
          "Sunstone",
          "Citrine",
          "Tiger's Eye"
        ],
        "intentions": "Career success, confidence, wealth",
        "dev": "ॐ घृणिः सूर्याय नमः",
        "pron": "Om Ghrinih Suryaya Namah",
        "meaning": "Salutations to the Sun.",
        "affirmation": "I shine brightly, lead with grace, and inspire warmth in everyone I meet."
      },
      "Virgo": {
        "ruler": 5,
        "element": "Earth",
        "crystals": [
          "Amazonite",
          "Blue Lace Agate",
          "Amethyst"
        ],
        "intentions": "Health & wellness, anxiety relief, study",
        "dev": "ॐ बुधाय नमः",
        "pron": "Om Budhaya Namah",
        "meaning": "Salutations to Mercury.",
        "affirmation": "I find perfection in the present moment and heal my mind, body, and spirit."
      },
      "Libra": {
        "ruler": 6,
        "element": "Air",
        "crystals": [
          "Rose Quartz",
          "Lapis Lazuli",
          "Malachite"
        ],
        "intentions": "Rebuild relationships, harmony, love aura",
        "dev": "ॐ शुक्राय नमः",
        "pron": "Om Shukraya Namah",
        "meaning": "Salutations to Venus.",
        "affirmation": "I cultivate harmony, beauty, and deep, meaningful relationships in my life."
      },
      "Scorpio": {
        "ruler": 9,
        "element": "Water",
        "crystals": [
          "Black Tourmaline",
          "Obsidian",
          "Malachite"
        ],
        "intentions": "Protection, debt clearing, deep transformation",
        "dev": "ॐ मंगलाय नमः",
        "pron": "Om Mangalaya Namah",
        "meaning": "Salutations to Mars, the divine warrior and protector.",
        "affirmation": "I embrace transformation, release what no longer serves me, and rise stronger."
      },
      "Sagittarius": {
        "ruler": 3,
        "element": "Fire",
        "crystals": [
          "Turquoise",
          "Lapis Lazuli",
          "Amethyst"
        ],
        "intentions": "Study success, travel protection, wisdom",
        "dev": "ॐ गुरवे नमः",
        "pron": "Om Gurave Namah",
        "meaning": "Salutations to the Teacher.",
        "affirmation": "I expand my horizons, seek truth, and trust the beautiful journey ahead."
      },
      "Capricorn": {
        "ruler": 8,
        "element": "Earth",
        "crystals": [
          "Smoky Quartz",
          "Black Onyx",
          "Garnet"
        ],
        "intentions": "Career growth, discipline, debt clearing",
        "dev": "ॐ शनैश्चराय नमः",
        "pron": "Om Shanaischaraya Namah",
        "meaning": "Salutations to Saturn.",
        "affirmation": "My hard work builds lasting success. I am grounded, patient, and unstoppable."
      },
      "Aquarius": {
        "ruler": 8,
        "element": "Air",
        "crystals": [
          "Amethyst",
          "Aquamarine",
          "Clear Quartz"
        ],
        "intentions": "Inner peace, innovation, spiritual growth",
        "dev": "ॐ शनैश्चराय नमः",
        "pron": "Om Shanaischaraya Namah",
        "meaning": "Salutations to Saturn, the lord of karma, discipline and justice.",
        "affirmation": "I embrace my uniqueness, break boundaries, and contribute positively to the world."
      },
      "Pisces": {
        "ruler": 3,
        "element": "Water",
        "crystals": [
          "Amethyst",
          "Aquamarine",
          "Moonstone"
        ],
        "intentions": "Rebuild relationships, intuition, inner peace",
        "dev": "ॐ गुरवे नमः",
        "pron": "Om Gurave Namah",
        "meaning": "Salutations to the Teacher.",
        "affirmation": "I am deeply connected to my intuition and the universal flow of love and grace."
      }
    },
    "mantraShort": {
      "1": {
        "dev": "ॐ घृणिः सूर्याय नमः",
        "pron": "Om Ghrinih Suryaya Namah",
        "meaning": "Salutations to the radiant Sun, the source of light and life.",
        "affirmation": "I radiate confidence, vitality, and leadership. I am the creator of my own destiny."
      },
      "2": {
        "dev": "ॐ सोमाय नमः",
        "pron": "Om Somaya Namah",
        "meaning": "Salutations to the Moon, the nectar of life and emotion.",
        "affirmation": "I am calm, intuitive, and emotionally balanced. My heart is open to receiving love."
      },
      "3": {
        "dev": "ॐ गुरवे नमः",
        "pron": "Om Gurave Namah",
        "meaning": "Salutations to the divine teacher and expander of wisdom.",
        "affirmation": "I am open to wisdom, growth, and abundant opportunities. My path is blessed."
      },
      "4": {
        "dev": "ॐ राहवे नमः",
        "pron": "Om Rahave Namah",
        "meaning": "Salutations to Rahu, the force of sudden change and material mastery.",
        "affirmation": "I embrace change, overcome all obstacles, and manifest my unique path with courage."
      },
      "5": {
        "dev": "ॐ बुधाय नमः",
        "pron": "Om Budhaya Namah",
        "meaning": "Salutations to Mercury, the planet of intellect and communication.",
        "affirmation": "My mind is sharp, my words are clear, and I adapt to life with grace and joy."
      },
      "6": {
        "dev": "ॐ शुक्राय नमः",
        "pron": "Om Shukraya Namah",
        "meaning": "Salutations to Venus, the bestower of love, beauty and wealth.",
        "affirmation": "I attract love, beauty, and harmonious relationships. I am worthy of abundance."
      },
      "7": {
        "dev": "ॐ केतवे नमः",
        "pron": "Om Ketave Namah",
        "meaning": "Salutations to Ketu, the force of spiritual liberation and intuition.",
        "affirmation": "I trust my intuition, release the past, and walk my spiritual path with absolute clarity."
      },
      "8": {
        "dev": "ॐ शनैश्चराय नमः",
        "pron": "Om Shanaischaraya Namah",
        "meaning": "Salutations to Saturn, the lord of karma, discipline and justice.",
        "affirmation": "I am disciplined, resilient, and deserving of karmic rewards, wealth, and success."
      },
      "9": {
        "dev": "ॐ मंगलाय नमः",
        "pron": "Om Mangalaya Namah",
        "meaning": "Salutations to Mars, the divine warrior and protector.",
        "affirmation": "I act with courage, strength, and unwavering focus. I am protected in all my endeavors."
      }
    }
  },
  "hi": {
    "meta": {
      "code": "hi",
      "name": "Hindi",
      "native": "हिन्दी",
      "flag": "🇮🇳"
    },
    "ui": {
      "brandName": "NumeroVastu 360",
      "brandSub": "अंकशास्त्र एवं वास्तु समाधान इंजन",
      "editDetails": "विवरण बदलें",
      "savePrint": "रिपोर्ट सेव / प्रिंट करें",
      "skipLink": "मुख्य सामग्री पर जाएं",
      "invocation": "ॐ श्री गणेशाय नमः",
      "reportHeroTitle": "समाधान रिपोर्ट — {name}",
      "reportHeroMeta": "जन्म तिथि: {dob}{birthLine} · मुख्य लक्ष्य: {goals} · आपके डिवाइस पर स्थानीय रूप से तैयार",
      "born": "जन्म",
      "statusPrivate": "गोपनीय एवं सुरक्षित",
      "statusKnowledge": "ज्ञान संग्रह v{ver}",
      "statusApp": "ऐप v2.7.0 · मीउस गणना",
      "statusBuild": "संस्करण 2026-09-05",
      "statusMemory": "लोकल मेमोरी तैयार",
      "statusMemorySnapshots": "{count} सुरक्षित चार्ट",
      "startupTitle": "ज्ञान संग्रह + ऑन-डिवाइस मेमोरी",
      "startupSubtitle": "निरंतर विकसित होने वाली प्रणाली",
      "checkUpdates": "अपडेट जांचें",
      "currentPack": "वर्तमान ज्ञान संग्रह",
      "currentPackSub": "बिना इंटरनेट के तुरंत काम करता है और नए अपडेट की जांच करता है।",
      "localMemory": "लोकल मेमोरी",
      "localMemorySub": "सुरक्षित की गई रिपोर्ट केवल आपके डिवाइस पर ही रहती है।",
      "noSavedCharts": "अभी कोई चार्ट सुरक्षित नहीं है",
      "savedChartsCount": "{count} चार्ट सुरक्षित",
      "privacyMode": "गोपनीयता मोड",
      "privacyModeTitle": "केवल ब्राउज़र में प्रोसेसिंग",
      "privacyModeSub": "नाम, जन्मतिथि, फोन नंबर और वास्तु विवरण पूरी तरह आपके पास सुरक्षित हैं।",
      "loadLatestChart": "पिछला चार्ट लोड करें",
      "introTitle": "आपकी ३६०° समाधान रिपोर्ट",
      "introDesc": "अपनी जानकारी एक बार दर्ज करें। हम आपके मूलांक और भाग्यांक निकालते हैं, आपकी वैदिक अंक कुंडली बनाते हैं, आपके नाम, मोबाइल और वाहन की ध्वनि जांचते हैं, शुभ रंग, सर्वोत्तम कैरियर और अनुकूल वर्ष दर्शाते हैं, आपका वास्तु स्कैन करते हैं — और धन, स्वास्थ्य, कैरियर, व्यापार और रिश्तों के लिए संपूर्ण उपाय योजना बनाते हैं।",
      "reportLanguage": "रिपोर्ट की भाषा (Report Language)",
      "reportLanguageDesc": "रिपोर्ट किस भाषा में देखना चाहते हैं, चुनें (आप ऊपर से कभी भी बदल सकते हैं):",
      "personalDetails": "व्यक्तिगत विवरण (Personal Details)",
      "fullName": "पूरा नाम (Full Name)",
      "fullNamePlaceholder": "जो नाम आप दैनिक जीवन में लिखते हैं, जैसे: राहुल शर्मा",
      "fullNameHint": "नाम का विश्लेषण चालडियन पद्धति से होता है — वही स्पेलिंग लिखें जिसका आप प्रयोग करते हैं।",
      "dob": "जन्म तिथि (Date of Birth)",
      "mobile": "मोबाइल नंबर (Mobile Number)",
      "mobilePlaceholder": "१० अंकों का मोबाइल नंबर, जैसे: 9876543210",
      "mobileHint": "अंकों का कुल योग आपके मूलांक और भाग्यांक से मिलाया जाता है।",
      "vehicle": "वाहन नंबर (Vehicle Number)",
      "vehiclePlaceholder": "जैसे: DL01AB1234 (वैकल्पिक)",
      "vehicleHint": "अक्षरों और अंकों का कुल योग वाहन की ऊर्जा तय करता है।",
      "gender": "लिंग (Gender — फेंगशुई कुआ अंक हेतु)",
      "genderUnsure": "बताना नहीं चाहते",
      "genderMale": "पुरुष",
      "genderFemale": "महिला",
      "genderOther": "अन्य",
      "focusAreas": "मुख्य लक्ष्य / फोकस क्षेत्र (अधिकतम ३ चुनें)",
      "focusAreasDesc": "अपनी जिंदगी के वे क्षेत्र चुनें जिन्हें आप इस रिपोर्ट में प्राथमिकता देना चाहते हैं:",
      "focusMoney": "धन एवं समृद्धि (Money)",
      "focusHealth": "स्वास्थ्य एवं ऊर्जा (Health)",
      "focusCareer": "करियर / नौकरी (Career)",
      "focusBusiness": "व्यापार / व्यवसाय (Business)",
      "focusRelationship": "संबंध एवं परिवार (Relationship)",
      "vedicPrecision": "वैदिक ज्योतिष गणना (Vedic Precision — वैकल्पिक)",
      "vedicPrecisionDesc": "आपकी जन्मतिथि से आपकी वैदिक सूर्य राशि (लाहिड़ी अयनांश) तुरंत निकल जाती है। जन्म का सटीक समय और शहर दर्ज करने से आपकी चंद्र राशि, नक्षत्र व पद, लग्न तथा दशम भाव भी आपके फोन/कंप्यूटर पर ही तैयार हो जाते हैं।",
      "birthTime": "सटीक जन्म समय (वैकल्पिक)",
      "birthTimeHint": "लेवल २ — चंद्र राशि, नक्षत्र, लग्न अनलॉक करता है (बिना किसी सर्वर पर भेजे)।",
      "birthPlace": "जन्म स्थान / शहर (वैकल्पिक)",
      "birthPlacePlaceholder": "जैसे: नई दिल्ली, भारत या अहमदाबाद, भारत",
      "birthPlaceHint": "लेवल २ — ४००+ भारतीय व विश्व के शहर शामिल हैं; या अक्षांश/देशांतर लिखें।",
      "tier1Ready": "लेवल १ · तुरंत तैयार",
      "tier1Desc": "वैदिक सूर्य राशि (निरयण / लाहिड़ी) — जन्मतिथि से तुरंत तैयार। आज की रिपोर्ट इस पर आधारित है।",
      "tier2Unlock": "लेवल २ · अनलॉक करें",
      "tier2Desc": "चंद्र राशि · नक्षत्र · लग्न · दशम भाव — जन्म समय व स्थान दर्ज करने पर तुरंत अनलॉक होते हैं।",
      "vastuDetails": "वास्तु विवरण (घर या कार्यालय)",
      "vastuDetailsDesc": "घर के बीच में खड़े होकर कम्पास (दिशा सूचक) से दिशाएं देखें। जानकारी न होने पर 'निश्चित नहीं' चुनें।",
      "entranceLabel": "मुख्य द्वार (Main Entrance)",
      "kitchenLabel": "रसोईघर (Kitchen)",
      "bedroomLabel": "मास्टर बेडरूम (Master Bedroom)",
      "toiletLabel": "शौचालय (Toilet)",
      "studyLabel": "अध्ययन कक्ष (Study Room)",
      "staircaseLabel": "सीढ़ियां (Staircase)",
      "plotShapeLabel": "प्लॉट / मकान का आकार (Plot Shape)",
      "watchTypeLabel": "वर्तमान में पहनी जाने वाली घड़ी (Watch)",
      "brandTitle": "व्यापार / दुकान / ब्रांड का नाम (वैकल्पिक)",
      "brandDesc": "अपने व्यापार या फर्म का नाम दर्ज करें — उसका संयुक्त अंक, शुभता और सरल स्पेलिंग सुधार जानें।",
      "brandLabel": "व्यापार या ब्रांड का नाम",
      "brandPlaceholder": "जैसे: श्री बालाजी टेक्सटाइल्स",
      "privacyTitle": "गोपनीयता सेटिंग्स",
      "privacyDesc": "यह ऐप पूरी तरह आपके डिवाइस पर काम करता है। कोई भी व्यक्तिगत डेटा कहीं नहीं भेजा जाता।",
      "privacyToggleLabel": "भविष्य के उपायों को बेहतर बनाने में सहयोग करें",
      "privacyToggleHint": "यदि आप इसे चुनते हैं, तो केवल गुमनाम आंकड़े (जैसे मिसिंग अंकों की संख्या) गिने जाते हैं।",
      "privacyFooterHint": "यह हमेशा बंद रहता है। नाम, जन्मतिथि, फोन नंबर या निजी नोट्स कभी साझा नहीं होते।",
      "compatTitle": "गुण मिलान एवं संगतता (वैकल्पिक — जीवनसाथी / बिजनेस पार्टनर)",
      "compatDesc": "विवाह या साझेदारी के लिए दूसरे व्यक्ति का नाम व जन्मतिथि दर्ज करें।",
      "partnerName": "साथी का पूरा नाम",
      "partnerNamePlaceholder": "जैसे: अंजलि वर्मा",
      "partnerDob": "साथी की जन्म तिथि",
      "generateBtn": "मेरी समाधान रिपोर्ट तैयार करें",
      "formNote": "आपकी पूरी जानकारी सुरक्षित है — सारी गणनाएं आपके डिवाइस में ही होती हैं।",
      "footerText": "NumeroVastu 360 — शास्त्रीय वैदिक अंकशास्त्र और वास्तु सिद्धांतों पर आधारित मार्गदर्शन। उपाय सहायक साधन हैं, चिकित्सीय, कानूनी या वित्तीय सलाह का विकल्प नहीं।",
      "errFullName": "कृपया अपना पूरा नाम दर्ज करें।",
      "errDob": "कृपया मान्य जन्म तिथि दर्ज करें।",
      "errMobile": "कृपया मान्य मोबाइल नंबर दर्ज करें (कम से कम ८ अंक; सभी शून्य न हों)।",
      "errGoals": "कम से कम एक मुख्य लक्ष्य (फोकस क्षेत्र) अवश्य चुनें।",
      "navSummary": "सारांश",
      "navProfile": "प्रोफाइल",
      "navVedicGrid": "वैदिक ग्रिड",
      "navVedic": "वैदिक राशि",
      "navTiming": "शुभ समय",
      "navDasha": "दशा",
      "navMemory": "प्रगति चार्ट",
      "navVastu": "वास्तु",
      "navPlan": "४०-दिवसीय योजना",
      "secSummary": "मुख्य मार्गदर्शक सारांश (Northstar Summary)",
      "secProfile": "मुख्य अंकशास्त्र प्रोफाइल",
      "secTraits": "आपका मूल स्वभाव — खूबियां, कमजोरियां और सुधार",
      "secVedicGrid": "आपकी वैदिक अंक कुंडली — ३ तलों का विश्लेषण",
      "secWeak": "निर्बल ग्रहों के संपूर्ण उपाय किट",
      "secZodiac": "आपकी वैदिक सूर्य राशि — {sign}",
      "secName": "नाम विश्लेषण एवं सरल वर्तनी सुधार",
      "secMobile": "मोबाइल नंबर का ऊर्जा प्रभाव",
      "secVehicle": "वाहन नंबर का ऊर्जा प्रभाव",
      "secWatch": "घड़ी एवं कलाई उपाय",
      "secCrystal": "रत्न एवं स्फटिक मार्गदर्शन",
      "secColours": "शुभ रंग एवं वार अनुसार वस्त्र",
      "secCareer": "सर्वोत्तम कार्यक्षेत्र एवं करियर",
      "secTiming": "अनुकूल वर्ष एवं व्यक्तिगत वर्ष चक्र",
      "secDasha": "दशा समय-रेखा — जीवन-घटना विंडो",
      "karmicDebtTitle": "कर्मऋण जाँच — १३ · १४ · १६ · १९",
      "pinnacleCardTitle": "जीवन के चार चरण — शिखर (पिनेकल) एवं चुनौतियां",
      "secMemory": "आपका विकास चार्ट (Evolving Chart)",
      "secVastu": "सरल वास्तु दोष परीक्षण एवं निवारण",
      "secKua": "व्यक्तिगत शुभ दिशाएं — कुआ अंक (Kua)",
      "secCompat": "गुण मिलान एवं संबंध सामंजस्य",
      "secGoalPlan": "{goal} — विशेष उपाय योजना",
      "secPlan": "आपकी ४०-दिवसीय साधना एवं उपाय योजना",
      "driverLabel": "मूलांक (Driver / Moolank)",
      "conductorLabel": "भाग्यांक (Conductor / Bhagyank)",
      "nameNumLabel": "नामांक (Name Number)",
      "mobNumLabel": "मोबाइल अंक",
      "suryaRashiLabel": "वैदिक सूर्य राशि (Surya Rashi)",
      "chandraRashiLabel": "चंद्र राशि (Chandra Rashi)",
      "lagnaLabel": "लग्न (Lagna / Ascendant)",
      "mcLabel": "दशम भाव (Midheaven / MC)",
      "active": "सक्रिय (शुभ)",
      "partial": "आंशिक (मध्यम)",
      "weak": "निर्बल (उपाय आवश्यक)",
      "strong": "मजबूत",
      "frustrated": "अवरुद्ध",
      "present": "उपस्थित",
      "missing": "अनुपस्थित (मिसिंग)",
      "critical": "अति आवश्यक",
      "friendly": "अनुकूल (मित्र)",
      "neutral": "सामान्य (सम)",
      "enemy": "प्रतिकूल (शत्रु)",
      "ideal": "उत्तम (शुभ)",
      "acceptable": "स्वीकार्य",
      "dosh": "दोष (उपाय करें)",
      "balanced": "संतुलित",
      "caution": "सावधानी",
      "daily": "दैनिक",
      "weekly": "साप्ताहिक",
      "once": "एक बार",
      "adopt": "अपनाएं (+)",
      "release": "त्यागें (-)",
      "amplifyThese": "अपनी खूबियों को बढ़ाएं (शक्तियां)",
      "watchThese": "इन कमजोरियों से बचें (सावधानियां)",
      "howWeJudge": "हम इसका आकलन कैसे करते हैं:",
      "beejMantra": "बीज मंत्र",
      "dailyShortMantra": "दैनिक लघु मंत्र",
      "wishPaperAffirmation": "संकल्प पत्र (विश पेपर) वाक्य",
      "crystal": "रत्न / उपरत्न",
      "rudraksha": "रुद्राक्ष",
      "yantra": "यंत्र",
      "colorDayMetal": "रंग / वार / धातु",
      "charity": "दान",
      "lifestyle": "जीवनशैली नियम",
      "fast": "व्रत / उपवास",
      "open40DayPlan": "पूरी ४०-दिवसीय उपाय योजना खोलें ↓",
      "firstThreeMoves": "आपके पहले तीन कदम",
      "wayForward": "आगे का रास्ता",
      "resetCycle": "साइकिल रीसेट करें",
      "day": "दिन",
      "completed": "पूर्ण",
      "cycleStarted": "साधना प्रारंभ: {date} · प्रगति आपके डिवाइस में सुरक्षित है।"
    },
    "numbers": {
      "1": {
        "planet": "सूर्य (Sun / Surya)",
        "element": "अग्नि",
        "traits": "नेतृत्व, मान-सम्मान, आत्मविश्वास, पिता का सहयोग, सरकारी कार्य, जीवन शक्ति",
        "governs": [
          "करियर",
          "स्वास्थ्य",
          "व्यापार"
        ],
        "weakSigns": "कम आत्मविश्वास, पिता से मतभेद, सम्मान में कमी, आंखों या सिर में भारीपन",
        "day": "रविवार",
        "color": "सुनहरा, नारंगी, केसरिया",
        "metal": "सोना / तांबा",
        "crystal": "माणिक्य (Ruby) या रेड जैस्पर (Red Jasper)",
        "rudraksha": "१ मुखी रुद्राक्ष (1 Mukhi Rudraksha)",
        "mantra": "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
        "mantraCount": "प्रतिदिन सूर्योदय के समय १०८ बार (कुल संकल्प: ७,०००)",
        "charity": "रविवार सुबह गेहूं, गुड़, तांबे का बर्तन या लाल वस्त्र जरूरतमंद को दान करें",
        "lifestyle": "प्रतिदिन सूर्योदय से पहले उठें और तांबे के लोटे से उगते सूर्य को अर्घ्य दें; घर की पूर्व दिशा साफ रखें",
        "fast": "रविवार का व्रत रखें; बिना नमक का भोजन या केवल फलाहार करें"
      },
      "2": {
        "planet": "चंद्रमा (Moon / Chandra)",
        "element": "जल",
        "traits": "मन की शांति, सौम्यता, संवेदनशीलता, अंतर्ज्ञान, माता का सुख, जनसंपर्क",
        "governs": [
          "स्वास्थ्य",
          "संबंध"
        ],
        "weakSigns": "अत्यधिक चिंता, मूड स्विंग्स, अनिद्रा, माता से वैचारिक मतभेद, निर्णय लेने में असमंजस",
        "day": "सोमवार",
        "color": "सफेद, चांदी, क्रीम",
        "metal": "चांदी",
        "crystal": "मोती (Pearl) या मूनस्टोन (Moonstone)",
        "rudraksha": "२ मुखी रुद्राक्ष (2 Mukhi Rudraksha)",
        "mantra": "ॐ श्रां श्रीं श्रौं सः चंद्राय नमः",
        "mantraCount": "प्रतिदिन शाम के समय १०८ बार (कुल संकल्प: ११,०००)",
        "charity": "सोमवार को चावल, दूध, सफेद मिठाई, चीनी या चांदी का दान करें",
        "lifestyle": "चांदी के गिलास में पानी पिएं; रात्रि में चंद्रमा की रोशनी में कुछ समय बिताएं; माता का चरण स्पर्श करें",
        "fast": "सोमवार का व्रत रखें; सूर्यास्त के बाद नमक का सेवन न करें"
      },
      "3": {
        "planet": "बृहस्पति / गुरु (Jupiter / Guru)",
        "element": "आकाश",
        "traits": "ज्ञान, बुद्धि, धन वृद्धि, शिक्षण, संतान सुख, धर्म और सकारात्मक सोच",
        "governs": [
          "धन",
          "व्यापार",
          "करियर"
        ],
        "weakSigns": "धन का रुकना, सही मार्गदर्शन न मिलना, बड़ों या गुरुओं से दूरी, पेट या वजन की समस्या",
        "day": "गुरुवार",
        "color": "पीला, सुनहरा",
        "metal": "सोना / पीतल",
        "crystal": "पुखराज (Yellow Sapphire) या सिट्रीन (Citrine / सुनहला)",
        "rudraksha": "५ मुखी रुद्राक्ष (5 Mukhi Rudraksha)",
        "mantra": "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",
        "mantraCount": "प्रतिदिन सुबह १०८ बार (कुल संकल्प: १९,०००)",
        "charity": "गुरुवार को चने की दाल, हल्दी, केले, पीली मिठाई या धार्मिक पुस्तकें दान करें",
        "lifestyle": "गुरुवार को पीले वस्त्र पहनें; केसर या हल्दी का तिलक लगाएं; गुरुजनों और शिक्षकों का सम्मान करें",
        "fast": "गुरुवार का व्रत रखें; पीले फल व बेसन की चीजें ग्रहण करें"
      },
      "4": {
        "planet": "राहु (Rahu)",
        "element": "वायु (छाया)",
        "traits": "महत्वाकांक्षा, नवाचार, तकनीक, दूरदर्शिता, अचानक सफलता, लीक से हटकर सोचना",
        "governs": [
          "व्यापार",
          "करियर"
        ],
        "weakSigns": "मानसिक भ्रम, अचानक रुकावटें, गैजेट्स पर अत्यधिक निर्भरता, बेवजह का शक या डर",
        "day": "शनिवार",
        "color": "स्मोकी ग्रे, गहरा नीला, खाकी",
        "metal": "मिश्र धातु / पंचधातु",
        "crystal": "गोमेद (Hessonite) या स्मोकी क्वार्ट्ज (Smoky Quartz)",
        "rudraksha": "८ मुखी रुद्राक्ष (8 Mukhi Rudraksha)",
        "mantra": "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः",
        "mantraCount": "प्रतिदिन सूर्यास्त के बाद १०८ बार (कुल संकल्प: १८,०००)",
        "charity": "शनिवार को काले/चितकबरे कंबल, काले तिल, सरसों का तेल दान करें या आवारा कुत्तों को भोजन दें",
        "lifestyle": "रात को मोबाइल/स्क्रीन का प्रयोग कम करें; घर का नैऋत्य (SW) कोण भारी और साफ रखें; बंद घड़ियां व कबाड़ हटाएं",
        "fast": "शनिवार को हल्का भोजन करें; अमावस्या के दिन सूखा नारियल जल में प्रवाहित करें"
      },
      "5": {
        "planet": "बुध (Mercury / Budha)",
        "element": "पृथ्वी",
        "traits": "व्यापारिक बुद्धि, संवाद कौशल, मार्केटिंग, त्वरित गणना, अनुकूलन क्षमता",
        "governs": [
          "व्यापार",
          "धन",
          "करियर"
        ],
        "weakSigns": "गलत संवाद, व्यापारिक सौदों में नुकसान, एकाग्रता की कमी, त्वचा या वाणी से जुड़ी परेशानी",
        "day": "बुधवार",
        "color": "हरा, हल्का हरा, मिंट",
        "metal": "कांसा / चांदी",
        "crystal": "पन्ना (Emerald) या ग्रीन एवेंट्यूरिन (Green Aventurine)",
        "rudraksha": "४ मुखी रुद्राक्ष (4 Mukhi Rudraksha)",
        "mantra": "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
        "mantraCount": "प्रतिदिन सुबह १०८ बार (कुल संकल्प: ९,०००)",
        "charity": "बुधवार को हरी मूंग दाल, हरी सब्जियां, हरा चारा गाय को दें या विद्यार्थियों को कॉपी-पेन दान करें",
        "lifestyle": "बुधवार को हरा रंग पहनें; वर्क टेबल पर हरे पौधे (जैसे मनी प्लांट) रखें; मधुर और स्पष्ट वाणी बोलें",
        "fast": "बुधवार का व्रत रखें; हरी सब्जियों का सेवन करें"
      },
      "6": {
        "planet": "शुक्र (Venus / Shukra)",
        "element": "जल (रिफाइंड)",
        "traits": "प्रेम, ऐश्वर्य, आकर्षण, सौंदर्य, कला, दांपत्य सुख, वाहन एवं विलासिता",
        "governs": [
          "संबंध",
          "धन"
        ],
        "weakSigns": "दांपत्य जीवन में तनाव, सुख-सुविधाओं की कमी, आकर्षण में कमी, रचनात्मकता का रुकना",
        "day": "शुक्रवार",
        "color": "सफेद, गुलाबी, क्रीम, हल्का चमकदार",
        "metal": "चांदी / सफेद सोना",
        "crystal": "हीरा, सफेद ओपल (Opal) या रोज क्वार्ट्ज (Rose Quartz)",
        "rudraksha": "६ मुखी रुद्राक्ष (6 Mukhi Rudraksha)",
        "mantra": "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
        "mantraCount": "प्रतिदिन सुबह १०८ बार (कुल संकल्प: १६,०००)",
        "charity": "शुक्रवार को सफेद मिठाई, खीर, चावल, दही, इत्र या सफेद वस्त्र कन्याओं को दान करें",
        "lifestyle": "स्वच्छ और सुगंधित वस्त्र पहनें; गुलाब का इत्र लगाएं; घर का आग्नेय (SE) कोण सुंदर रखें; स्त्रियों का सम्मान करें",
        "fast": "शुक्रवार का व्रत रखें; खीर का प्रसाद ग्रहण करें"
      },
      "7": {
        "planet": "केतु (Ketu)",
        "element": "अग्नि (छाया)",
        "traits": "आध्यात्मिकता, अंतर्ज्ञान, अनुसंधान, गूढ़ विद्याएं, वैराग्य, गहन विचार",
        "governs": [
          "स्वास्थ्य",
          "करियर"
        ],
        "weakSigns": "दिशाहीन महसूस होना, अज्ञात भय, अचानक नुकसान, एकाकीपन, पेट संबंधी परेशानी",
        "day": "मंगलवार / शनिवार",
        "color": "बहुरंगी (मल्टीकलर), भूरा, चितकबरा",
        "metal": "पंचधातु / मिश्र धातु",
        "crystal": "लहसुनिया (Cat's Eye) या टाइगर आई (Tiger's Eye)",
        "rudraksha": "९ मुखी रुद्राक्ष (9 Mukhi Rudraksha)",
        "mantra": "ॐ स्रां स्रीं स्रौं सः केतवे नमः",
        "mantraCount": "प्रतिदिन सुबह सूर्योदय से पहले १०८ बार (कुल संकल्प: १७,०००)",
        "charity": "कुत्तों को मीठी रोटी खिलाएं; बहुरंगी कंबल या मंदिर में तिकोना ध्वज दान करें",
        "lifestyle": "प्रतिदिन १० मिनट शांत बैठकर ध्यान करें; घर में पूजा का शांत कोना बनाएं; बिना दिखावे के दान करें",
        "fast": "मंगलवार या शनिवार का व्रत रखें; गणेश जी की आराधना करें"
      },
      "8": {
        "planet": "शनि (Saturn / Shani)",
        "element": "वायु",
        "traits": "परिश्रम, अनुशासन, न्यायप्रियता, धैर्य, संगठन, स्थायी सफलता, दीर्घकालिक दृष्टि",
        "governs": [
          "करियर",
          "व्यापार"
        ],
        "weakSigns": "कार्यों में अत्यधिक देरी, मेहनत का पूरा फल न मिलना, जोड़ों या हड्डियों में दर्द, निराशावादी सोच",
        "day": "शनिवार",
        "color": "गहरा नीला, काला, जामुनी",
        "metal": "लोहा / डार्क स्टील",
        "crystal": "नीलम (परामर्श उपरांत), जमुनिया (Amethyst) या लाजवर्त (Lapis Lazuli)",
        "rudraksha": "७ मुखी रुद्राक्ष (7 Mukhi Rudraksha)",
        "mantra": "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
        "mantraCount": "प्रतिदिन शाम के समय १०८ बार (कुल संकल्प: २३,०००)",
        "charity": "शनिवार को काले तिल, सरसों का तेल, जूते-चप्पल, काला कपड़ा या भोजन जरूरतमंदों/श्रमिकों को दान करें",
        "lifestyle": "मेहनतकश लोगों का आदर करें; समय का पूरा पाबंद रहें; शनिवार शाम पीपल के वृक्ष के पास सरसों के तेल का दीया जलाएं",
        "fast": "शनिवार का व्रत रखें; शाम को खिचड़ी का सेवन करें"
      },
      "9": {
        "planet": "मंगल (Mars / Mangal)",
        "element": "अग्नि",
        "traits": "साहस, पराक्रम, ऊर्जा, त्वरित निर्णय, भूमि-भवन, रक्षा, दृढ़ संकल्प",
        "governs": [
          "स्वास्थ्य",
          "धन",
          "व्यापार"
        ],
        "weakSigns": "कम ऊर्जा या अत्यधिक क्रोध, जमीन-जायदाद के विवाद, रक्तचाप की समस्या, कर्ज बढ़ना",
        "day": "मंगलवार",
        "color": "लाल, सिंदूरी, मूंगा रंग",
        "metal": "तांबा",
        "crystal": "मूंगा (Red Coral) या कार्नेलियन (Carnelian)",
        "rudraksha": "३ मुखी रुद्राक्ष (3 Mukhi Rudraksha)",
        "mantra": "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
        "mantraCount": "प्रतिदिन सूर्योदय के समय १०८ बार (कुल संकल्प: १०,०००)",
        "charity": "मंगलवार को लाल मसूर दाल, गुड़, लाल वस्त्र या तांबे की वस्तु का दान करें",
        "lifestyle": "प्रतिदिन शारीरिक व्यायाम करें; मंगलवार को हनुमान चालीसा का पाठ करें; घर की दक्षिण दिशा प्रकाशित रखें",
        "fast": "मंगलवार का व्रत रखें; गुड़ व गेहूं का सेवन करें"
      }
    },
    "traits": {
      "1": {
        "nature": "जन्मजात नेता — स्वतंत्र, मौलिक और आत्मविश्वासी। आप दूसरों के पीछे चलने के बजाय आगे बढ़कर शुरुआत करना पसंद करते हैं और असफलताओं से तुरंत उबर जाते हैं।",
        "innerDrive": "स्वतंत्र पहचान बनाने, नेतृत्व करने और अपने दम पर खड़े होने की गहरी इच्छा",
        "strengths": [
          "नेतृत्व क्षमता और त्वरित पहल",
          "दबाव में भी आत्मविश्वास",
          "मौलिक और स्वतंत्र सोच",
          "दृढ़ संकल्प और तेज रिकवरी"
        ],
        "shadows": [
          "चुनौती मिलने पर अहंकार या जिद",
          "दूसरों पर अपनी बात थोपना",
          "धीमे लोगों से जल्दी अधीर होना",
          "हर काम अकेले करने की कोशिश"
        ],
        "adopt": [
          "निर्णायक कर्म",
          "बिना अहंकार का आत्मविश्वास",
          "सहयोग की भावना",
          "जिम्मेदारी स्वीकारना"
        ],
        "release": [
          "दूसरों पर नियंत्रण करने की आदत",
          "निरंतर प्रशंसा की चाह",
          "विरोध होने पर गुस्सा",
          "अकेले सब करने का दबाव"
        ]
      },
      "2": {
        "nature": "सौम्य, संवेदनशील और कूटनीतिज्ञ। आप उन भावनाओं को समझ लेते हैं जिन्हें दूसरे अनदेखा कर देते हैं — आप लोगों को जोड़ने वाली शांत शक्ति हैं।",
        "innerDrive": "सच्चे प्रेम, भावनात्मक सुरक्षा और शांतिपूर्ण वातावरण की गहरी चाह",
        "strengths": [
          "सहानुभूति और भावनात्मक समझ",
          "शांति स्थापना और सहयोग",
          "धैर्य और मधुर व्यवहार",
          "लोगों को परखने की अंतर्दृष्टि"
        ],
        "shadows": [
          "आलोचना से जल्दी आहत होना",
          "मन में चिंता के चक्र चलना",
          "निर्णय लेते समय खुद पर संदेह",
          "दूसरों पर भावनात्मक निर्भरता"
        ],
        "adopt": [
          "शांत दृढ़ता",
          "स्वस्थ साझेदारी",
          "अपने अंतर्ज्ञान पर भरोसा",
          "स्वयं का ध्यान रखना"
        ],
        "release": [
          "हर बात को दिल पर लेना",
          "सबको खुश करने की आदत",
          "निर्णय में हिचकिचाहट",
          "दूसरों का तनाव खुद लेना"
        ]
      },
      "3": {
        "nature": "सकारात्मक, अभिव्यक्त और बुद्धिमान। आप बड़ा सोचते हैं, स्वाभाविक रूप से सिखाते हैं और हर महफिल में सकारात्मक ऊर्जा भर देते हैं।",
        "innerDrive": "लगातार ज्ञान बढ़ाने, सिखाने और अपने विचारों का विस्तार करने की चाह",
        "strengths": [
          "शानदार अभिव्यक्ति और संवाद",
          "दूरगामी और बड़ा सोचने की क्षमता",
          "शिक्षण और मार्गदर्शन कौशल",
          "उदारता और जिंदादिली"
        ],
        "shadows": [
          "एक साथ बहुत सारे कामों में बिखरना",
          "अति-उत्साह में ज्यादा वादे कर देना",
          "फिजूलखर्ची पर नियंत्रण न होना",
          "सुनने के बजाय केवल बोलना"
        ],
        "adopt": [
          "अनुशासित अध्ययन",
          "दूसरों का मार्गदर्शन",
          "कृतज्ञता का भाव",
          "शुरू किए काम को पूरा करना"
        ],
        "release": [
          "जल्दबाजी में राय बनाना",
          "अनावश्यक खर्च",
          "अधूरे छोड़े प्रोजेक्ट",
          "दूसरों को कम आंकना"
        ]
      },
      "4": {
        "nature": "व्यावहारिक, परिश्रमी और आधुनिक सोच वाले। आप लीक से हटकर नए सिस्टम और तरीके बनाते हैं और पुरानी सीमाओं को तोड़ने में माहिर हैं।",
        "innerDrive": "कुछ अलग और ठोस निर्माण करने तथा पुरानी सीमाओं को तोड़ने की चाह",
        "strengths": [
          "लीक से हटकर सोच",
          "अथक परिश्रम और सहनशक्ति",
          "तकनीक और सिस्टम बनाने में निपुणता",
          "बदलाव लाने का साहस"
        ],
        "shadows": [
          "बेचैनी और अचानक फैसले",
          "अपने बनाए नियमों में ज्यादा कड़ा होना",
          "दूसरों के इरादों पर बेवजह शक",
          "सब कुछ या कुछ नहीं का रवैया"
        ],
        "adopt": [
          "व्यवस्थित नवाचार",
          "धैर्यपूर्वक काम को खींचना",
          "वित्तीय सावधानी",
          "बदलाव को स्वीकारना"
        ],
        "release": [
          "हमेशा बुरे परिणाम की चिंता",
          "अनावश्यक गोपनीयता",
          "जल्दबाजी में जोखिम लेना",
          "जिद पकड़ना"
        ]
      },
      "5": {
        "nature": "बहुमुखी, हाजिरजवाब और फुर्तीले। आप अद्भुत संवादकर्ता और व्यापारिक सूझबूझ वाले व्यक्ति हैं — विविधता, स्वतंत्रता और गतिशीलता आपकी जान हैं।",
        "innerDrive": "मानसिक व शारीरिक स्वतंत्रता, नई चीजें सीखने और घूमने की चाह",
        "strengths": [
          "प्रभावशाली संवाद और बातचीत",
          "किसी भी माहौल में ढल जाना",
          "तेज व्यापारिक समझ व गणित",
          "बड़ा नेटवर्क और मल्टीटास्किंग"
        ],
        "shadows": [
          "चंचलता और निरंतरता की कमी",
          "ध्यान का जल्दी भटक जाना",
          "शुरुआत करना पर अंत तक न पहुंचना",
          "अत्यधिक मानसिक तनाव"
        ],
        "adopt": [
          "जिज्ञासा के साथ काम पूरा करना",
          "स्पष्ट और सच्ची वाणी",
          "वित्तीय योजना बनाना",
          "वादों पर टिके रहना"
        ],
        "release": [
          "व्यर्थ की गपशप",
          "धीमे लोगों पर खीझना",
          "बहुत सारे काम अधूरे छोड़ना",
          "हर नई चीज के पीछे भागना"
        ]
      },
      "6": {
        "nature": "आकर्षक, स्नेही और जिम्मेदार। सौंदर्य, पारिवारिक सुख और प्रेम आपके लिए सर्वोपरि हैं — आपके पास लोग सुरक्षित और अपनापन महसूस करते हैं।",
        "innerDrive": "प्रेम, सुंदरता, पारिवारिक शांति और खुशहाल माहौल की चाह",
        "strengths": [
          "आकर्षण और चुंबकीय व्यक्तित्व",
          "देखभाल और जिम्मेदारी की भावना",
          "सौंदर्य व कला की परख",
          "समूह में एकता बनाना"
        ],
        "shadows": [
          "परफेक्शन के चक्कर में काम में देरी",
          "अत्यधिक मोह और पजेसिवनेस",
          "विलासिता पर ज्यादा खर्च",
          "दूसरों के निजी मामलों में दखल"
        ],
        "adopt": [
          "दूसरों के साथ खुद का भी ख्याल",
          "स्वस्थ सीमाएं तय करना",
          "प्रतिदिन सुंदरता की सराहना",
          "गहरा समर्पण"
        ],
        "release": [
          "अधिकार जताने की भावना",
          "दिखावा",
          "दूसरों का बोझ सिर पर लेना",
          "सुविधाओं में आलस"
        ]
      },
      "7": {
        "nature": "अंतर्मुखी, विश्लेषणात्मक और आध्यात्मिक। आप सतह से नीचे छिपे सच को खोजते हैं — शोरगुल से दूर गहराई और एकांत आपको पसंद है।",
        "innerDrive": "सच्चाई, जीवन के रहस्य और आत्मज्ञान को जानने की गहरी प्यास",
        "strengths": [
          "गहरा शोध और विश्लेषणात्मक दृष्टि",
          "मजबूत अंतर्ज्ञान",
          "स्वतंत्र विचार",
          "गूढ़ ज्ञान की समझ"
        ],
        "shadows": [
          "अकेलेपन में सिमट जाना",
          "इतना सोचना कि काम रुक जाए",
          "लोगों पर जल्दी भरोसा न करना",
          "व्यावहारिक जिम्मेदारियों से दूरी"
        ],
        "adopt": [
          "उद्देश्यपूर्ण एकांत",
          "अपने अंतर्ज्ञान पर विश्वास",
          "गहन और केंद्रित अध्ययन",
          "सरल जीवनशैली"
        ],
        "release": [
          "बिना प्रमाण के शक करना",
          "अति-विचार (ओवरथिंकिंग)",
          "निराशावादी सोच",
          "चोट लगने पर सबसे कट जाना"
        ]
      },
      "8": {
        "nature": "अनुशासित, धैर्यवान और न्यायप्रिय। जीवन आपको बार-बार परखता है — और वही कठिन अनुभव आपको एक मजबूत और सम्मानित व्यक्ति बनाते हैं।",
        "innerDrive": "व्यवस्था, न्याय और ऐसे स्थायी परिणाम खड़े करने की चाह जो लंबे समय तक रहें",
        "strengths": [
          "कठिन परिश्रम और सहनशीलता",
          "मजबूत संगठन और सिस्टम बनाना",
          "वफादारी और विश्वसनीयता",
          "दीर्घकालिक नजरिया"
        ],
        "shadows": [
          "निराशा और खुद की ज्यादा आलोचना",
          "कठोरता",
          "मन की बात अंदर ही दबाए रखना",
          "केवल काम में डूबे रहना"
        ],
        "adopt": [
          "प्रक्रिया पर भरोसा और धैर्य",
          "सिस्टम आधारित सोच",
          "न्यायपूर्ण व्यवहार",
          "लगातार छोटे प्रयास"
        ],
        "release": [
          "मन में पुरानी कड़वाहट रखना",
          "असफलता का डर",
          "आराम को भूल जाना",
          "अकेले सारा बोझ उठाना"
        ]
      },
      "9": {
        "nature": "ऊर्जावान, साहसी और रक्षक। आप कर्म और एक्शन के लिए बने हैं — आप अपने प्रियजनों की रक्षा करते हैं और जिसे दूसरे छोड़ देते हैं उसे पूरा करते हैं।",
        "innerDrive": "कर्म करने, दूसरों की रक्षा करने और जीत हासिल करने की प्रबल इच्छा",
        "strengths": [
          "साहस और त्वरित निर्णय",
          "अथाह ऊर्जा और स्टेमिना",
          "कार्य को अंजाम तक पहुंचाना",
          "दूसरों का सहारा बनना"
        ],
        "shadows": [
          "क्रोध और जल्दबाजी में कदम उठाना",
          "विवाद में अहंकार",
          "बारीकियों को नजरअंदाज करना",
          "अति-उत्साह में थक जाना"
        ],
        "adopt": [
          "खेल या सेवा में ऊर्जा लगाना",
          "जल्दी माफ कर देना",
          "साहसी पहल",
          "अनुशासित कर्म"
        ],
        "release": [
          "जीतने के लिए बहस करना",
          "बदले की भावना",
          "बिना सोचे-समझे जोखिम",
          "लोगों पर गुस्सा निकालना"
        ]
      }
    },
    "planes": [
      {
        "name": "मानसिक तल (Mental Plane)",
        "zone": "लो-शू ग्रिड की सबसे ऊपरी पंक्ति (4 - 9 - 2)",
        "about": "यह तल आपकी सोच और निर्णय शैली को दर्शाता है — आप योजना कैसे बनाते हैं, आकलन कैसे करते हैं और विचार को कार्य में कैसे बदलते हैं।",
        "roles": {
          "4": {
            "short": "योजना",
            "label": "योजना एवं रूपरेखा",
            "con": "बिना सोचे कदम उठाना, जिससे बाद में बदलाव करने पड़ते हैं",
            "fix": "हर बड़े निर्णय से पहले लक्ष्य, लागत और तीन मुख्य कदम कागज पर लिखें"
          },
          "9": {
            "short": "निर्णय",
            "label": "त्वरित निर्णय एवं आत्मविश्वास",
            "con": "सही समय पर निर्णय लेने में झिझक या देरी",
            "fix": "दैनिक जीवन में छोटे-छोटे त्वरित निर्णय लेकर आत्मविश्वास बढ़ाएं"
          },
          "2": {
            "short": "धैर्य",
            "label": "धैर्यपूर्ण जमीनी आकलन",
            "con": "तथ्यों के बजाय भावनाओं में बहकर फैसला करना",
            "fix": "फैसले से पहले थोड़ा ठहरें और किसी अनुभवी व्यक्ति से सलाह लें"
          }
        },
        "complete": "योजना, आत्मविश्वास और जमीनी सोच तीनों मिलकर स्पष्ट रणनीति और शानदार नेतृत्व क्षमता देते हैं। अति-विश्लेषण से बचें और निर्णय लें।"
      },
      {
        "name": "भावनात्मक तल (Emotional Plane)",
        "zone": "लो-शू ग्रिड की मध्य पंक्ति (3 - 5 - 7)",
        "about": "यह तल आपकी भावनाओं, संवेदनशीलता और रिश्तों को संभालने के तरीके को दर्शाता है — आपकी भावनाएं बातचीत में कैसे उतरती हैं।",
        "roles": {
          "3": {
            "short": "अभिव्यक्ति",
            "label": "भावनाओं की खुली अभिव्यक्ति",
            "con": "मन की बात दबाए रखना, जिससे अंदर ही अंदर कड़वाहट बढ़ती है",
            "fix": "अपनी बात खुलकर और शांति से कहने का अभ्यास करें"
          },
          "5": {
            "short": "संतुलन",
            "label": "भावनात्मक स्थिरता",
            "con": "दबाव में भावनाएं जल्दी डगमगा जाना",
            "fix": "प्राणायाम, डायरी लिखना या ध्यान के जरिए मन को शांत रखें"
          },
          "7": {
            "short": "सीमाएं",
            "label": "स्वस्थ सीमाएं तय करना",
            "con": "दूसरों की समस्याओं और तनाव को खुद पर ओढ़ लेना",
            "fix": "शांत रहकर स्पष्ट सीमाएं तय करें कि क्या स्वीकार्य है और क्या नहीं"
          }
        },
        "complete": "भावनाएं स्पष्ट शब्दों में बहती हैं, आप दूसरों को अच्छी तरह समझते हैं और रिश्तों में अपनापन और मर्यादा दोनों बनाए रखते हैं।"
      },
      {
        "name": "व्यावहारिक तल (Practical Plane)",
        "zone": "लो-शू ग्रिड की सबसे निचली पंक्ति (8 - 1 - 6)",
        "about": "यह तल आपके भौतिक जीवन, धन प्रबंधन, कार्य निष्पादन और वास्तविक परिणामों को दर्शाता है — योग्यता को सफलता में बदलने का तल।",
        "roles": {
          "8": {
            "short": "साधन प्रबंधन",
            "label": "जिम्मेदारी एवं साधन प्रबंधन",
            "con": "मेहनत के बाद भी धन या परिणाम हाथ में न बचना",
            "fix": "बजट, चेकलिस्ट और समय-सीमा बनाकर काम पूरा करें"
          },
          "1": {
            "short": "स्वामित्व",
            "label": "व्यक्तिगत पहल और स्वामित्व",
            "con": "दूसरों के निर्देश का इंतजार करना, खुद आगे न बढ़ना",
            "fix": "एक समय में एक मुख्य काम की पूरी जिम्मेदारी खुद लें"
          },
          "6": {
            "short": "गुणवत्ता",
            "label": "उत्कृष्ट फिनिशिंग व गुणवत्ता",
            "con": "जल्दबाजी में अधूरा काम पेश करना",
            "fix": "शुरुआत से पहले फिनिशिंग का स्तर तय करें और उसी के अनुसार काम करें"
          }
        },
        "complete": "संसाधन, जिम्मेदारी और बेहतरीन फिनिशिंग मिलकर व्यापार, नौकरी, संपत्ति और धन प्रबंधन में ठोस परिणाम देते हैं।"
      },
      {
        "name": "विचार तल (Thought Plane)",
        "zone": "लो-शू ग्रिड का बायां कॉलम (4 - 3 - 8)",
        "about": "यह तल गहन विचार, सीखने की ललक और ज्ञान के संयोजन को दर्शाता है — विचारों को उपयोगी रणनीति में बदलने की क्षमता।",
        "roles": {
          "4": {
            "short": "विचार",
            "label": "नए विचारों का सृजन",
            "con": "पुराने ढर्रे पर चलते रहना और नई रणनीति न सोचना",
            "fix": "जब भी नया विचार आए, तुरंत डायरी में नोट करें"
          },
          "3": {
            "short": "अध्ययन",
            "label": "ज्ञान और कौशल विकास",
            "con": "सीखना बंद हो जाने से तरक्की का रुकना",
            "fix": "हर हफ्ते कुछ नया सीखें — पुस्तक, कोर्स या अनुभवी से चर्चा"
          },
          "8": {
            "short": "गहराई",
            "label": "मानसिक सहनशक्ति व गहराई",
            "con": "सफलता मिलने से ठीक पहले काम छोड़ देना",
            "fix": "नियमित समीक्षा करें और मेहनत सही दिशा में लगाएं"
          }
        },
        "complete": "विचार, ज्ञान और गहराई मिलकर आपको जटिल विषयों का ज्ञाता और बेहतरीन रणनीतिकार बनाते हैं।"
      },
      {
        "name": "इच्छाशक्ति तल (Will Plane)",
        "zone": "लो-शू ग्रिड का मध्य कॉलम (9 - 5 - 1)",
        "about": "यह तल आपकी आंतरिक इच्छाशक्ति, दबाव में टिके रहने और विपरीत परिस्थितियों में आगे बढ़ने के संकल्प को दर्शाता है।",
        "roles": {
          "9": {
            "short": "ऊर्जा",
            "label": "कार्य करने का जुनून व ऊर्जा",
            "con": "इरादे मजबूत होना पर रुकावट आते ही हिम्मत हारना",
            "fix": "व्यायाम या खेल से अपनी आंतरिक शक्ति और ऊर्जा बढ़ाएं"
          },
          "5": {
            "short": "स्थिरता",
            "label": "स्थिरता और लचीलापन",
            "con": "हालात बदलते ही प्रेरणा कमजोर पड़ना",
            "fix": "दैनिक दिनचर्या बनाएं जो बदलाव के समय भी आपको स्थिर रखे"
          },
          "1": {
            "short": "लक्ष्य",
            "label": "आत्मविश्वास और दिशा",
            "con": "दूसरों की राय या दूसरों के बनाए लक्ष्यों पर निर्भर रहना",
            "fix": "अपने खुद के लक्ष्य लिखें और उन पर अडिग रहें"
          }
        },
        "complete": "आप पूरे जोश से शुरुआत करते हैं, धैर्य से आगे बढ़ते हैं और लक्ष्य हासिल करके ही दम लेते हैं — यह व्यापार और नेतृत्व के लिए उत्तम है।"
      },
      {
        "name": "कर्म तल (Action Plane)",
        "zone": "लो-शू ग्रिड का दायां कॉलम (2 - 7 - 6)",
        "about": "यह तल विचारों को अनुशासित कर्म में बदलने, काम पूरा करने और अंतिम परिणाम हासिल करने की क्षमता को दर्शाता है।",
        "roles": {
          "2": {
            "short": "धैर्य",
            "label": "कर्म में धैर्य और जमीनी सच्चाई",
            "con": "अति-सुधार के चक्कर में काम रोक कर रखना",
            "fix": "व्यावहारिक समय-सीमा तय करें और समय पर काम पूरा करें"
          },
          "7": {
            "short": "मर्यादा",
            "label": "मानक और कार्य सीमाएं",
            "con": "बिना सीमाओं के काम फैलते जाना",
            "fix": "स्पष्ट नियम बनाएं कि कब सुधार रोकना है और काम डिलीवर करना है"
          },
          "6": {
            "short": "पूर्णता",
            "label": "कार्य की पूर्णता व फिनिशिंग",
            "con": "बहुत सारे काम शुरू करना पर खत्म कम करना",
            "fix": "नया काम शुरू करने से पहले पुराना काम पूरी तरह खत्म करें"
          }
        },
        "complete": "इरादे ठोस कर्म में बदलते हैं — धैर्य, मानक और गुणवत्ता मिलकर आपको समय पर काम पूरा करने वाला विश्वसनीय व्यक्ति बनाते हैं।"
      },
      {
        "name": "स्वर्ण राजयोग (Golden Rajyoga)",
        "zone": "लो-शू ग्रिड का मुख्य विकर्ण (4 – 5 – 6)",
        "about": "यह अवसर से समृद्धि का योग है — नए मौकों को पहचानना, उन्हें व्यवस्थित करना और उनसे धन व मान-सम्मान कमाना।",
        "roles": {
          "4": {
            "short": "अवसर",
            "label": "नए अवसरों की पहचान",
            "con": "पुराने तरीकों में रहना और नए मौकों को न देख पाना",
            "fix": "बाजार, नई तकनीक और ग्राहकों की बदलती जरूरतों पर नजर रखें"
          },
          "5": {
            "short": "व्यवस्था",
            "label": "अवसरों को व्यवस्थित करना",
            "con": "अवसर हाथ में आना पर योजना के अभाव में बेकार जाना",
            "fix": "हर अवसर की समय-सीमा और योजना तय करें"
          },
          "6": {
            "short": "मूल्य वृद्धि",
            "label": "काम को आकर्षक और मूल्यवान बनाना",
            "con": "अच्छे काम को साधारण तरीके से पेश करना",
            "fix": "प्रस्तुति और पैकेजिंग को बेहतर बनाएं ताकि पूरा मूल्य मिले"
          }
        },
        "complete": "अवसर पहचानना, व्यवस्थित करना और प्रीमियम वैल्यू बनाना — यह व्यापार, धन लाभ, ब्रांडिंग और करियर में जबर्दस्त सफलता देता है।"
      },
      {
        "name": "रजत राजयोग (Silver Rajyoga)",
        "zone": "लो-शू ग्रिड का दूसरा विकर्ण (8 – 5 – 2)",
        "about": "यह संपत्ति, भूमि, बचत और दीर्घकालिक भौतिक स्थिरता का योग है — धीरे-धीरे मजबूत वित्तीय आधार खड़ा करना।",
        "roles": {
          "8": {
            "short": "संपत्ति",
            "label": "संपत्ति और साधन संरचना",
            "con": "बिना कानूनी व वित्तीय योजना के साधन रखना",
            "fix": "संपत्ति, बीमा और बचत के दस्तावेज व्यवस्थित रखें"
          },
          "5": {
            "short": "प्रबंधन",
            "label": "संतुलित वित्तीय प्रबंधन",
            "con": "बिना योजना के जब मन आया तब धन खर्च करना",
            "fix": "हर महीने एक तय दिन अपने खर्च और बचत की समीक्षा करें"
          },
          "2": {
            "short": "धैर्य",
            "label": "धैर्य और निरंतरता",
            "con": "जल्दबाजी या दबाव में आकर संपत्ति के गलत फैसले लेना",
            "fix": "निवेश को पकने का समय दें — धैर्य से धन बढ़ता है"
          }
        },
        "complete": "संपत्ति की समझ, संतुलित प्रबंधन और धैर्य मिलकर स्थायी धन सुरक्षा देते हैं — भूमि, मकान और बचत आपके हाथ में खूब फलते-फूलते हैं।"
      }
    ],
    "arrows": [
      {
        "name": "योजना का तीर (Arrow of Planning)",
        "axis": "ऊपरी पंक्ति (4-9-2)",
        "present": "आप बिना सोचे कदम नहीं उठाते — योजना बनाते हैं, फायदे-नुकसान तौलते हैं और स्पष्ट रणनीति से चलते हैं।",
        "missing": "भ्रम का तीर (Arrow of Confusion) — फैसले जल्दबाजी में या बहुत देर से आते हैं। लिखित योजना और चेकलिस्ट अपनाएं।"
      },
      {
        "name": "भावनाओं का तीर (Arrow of Emotions)",
        "axis": "मध्य पंक्ति (3-5-7)",
        "present": "आप गहराई से महसूस करते हैं और खुलकर व्यक्त करते हैं — संवेदनशीलता और अंतर्ज्ञान आपको लोगों का प्रिय बनाते हैं।",
        "missing": "भावनात्मक बेचैनी का तीर — भावनाएं अंदर घुटती हैं या दबाव में बहक जाती हैं। दैनिक अभिव्यक्ति और ध्यान का अभ्यास करें।"
      },
      {
        "name": "व्यावहारिकता का तीर (Arrow of Practicality)",
        "axis": "निचली पंक्ति (8-1-6)",
        "present": "आप विचारों को ठोस नतीजों में बदलते हैं — धन, कर्म और कार्य पूरा करना आपके स्वभाव में है।",
        "missing": "निराशा का तीर — मेहनत के बाद भी परिणाम हाथ नहीं लगते। चेकलिस्ट और समय-सीमा का कड़ाई से पालन करें।"
      },
      {
        "name": "बुद्धि का तीर (Arrow of Intellect)",
        "axis": "बायां कॉलम (4-3-8)",
        "present": "गहन विश्लेषणात्मक बुद्धि — आप गहराई से सीखते हैं, चीजों को जोड़ते हैं और कठिन विषयों में महारत हासिल करते हैं।",
        "missing": "सतही सोच का तीर — सीखना रुक जाता है। हर हफ्ते अच्छी किताबें पढ़ें या गुरुओं से सीखें।"
      },
      {
        "name": "दृढ़ संकल्प का तीर (Arrow of Determination)",
        "axis": "मध्य कॉलम (9-5-1)",
        "present": "दृढ़ इच्छाशक्ति और आत्मविश्वास के साथ रुकावटों को पार करते हैं — जो शुरू करते हैं उसे पूरा करते हैं।",
        "missing": "डगमगाती इच्छाशक्ति का तीर — प्रेरणा लहरों की तरह आती-जाती है। निश्चित दिनचर्या और व्यायाम से खुद को अनुशासित करें।"
      },
      {
        "name": "कर्म का तीर (Arrow of Activity)",
        "axis": "दायां कॉलम (2-7-6)",
        "present": "धैर्य, मानक और समर्पण मिलकर आपको हर काम समय पर और सफाई से पूरा करने वाला बनाते हैं।",
        "missing": "अधूरे काम का तीर — बहुत काम शुरू होते हैं, पूरे कम। पहले 'समाप्ति' की परिभाषा तय करें फिर शुरू करें।"
      },
      {
        "name": "समृद्धि का तीर (Arrow of Prosperity)",
        "axis": "विकर्ण (4-5-6)",
        "present": "अवसर, व्यवस्था और आकर्षण मिलकर आपको धन, व्यापार और मान-सम्मान दिलाते हैं।",
        "missing": "अवसर हाथ से फिसल जाते हैं। बाजार पर नजर रखें और हर काम को व्यवस्थित करें।"
      },
      {
        "name": "शांति और स्थिरता का तीर (Arrow of Spirituality / Stability)",
        "axis": "विकर्ण (8-5-2)",
        "present": "आंतरिक शांति और धैर्य — आप तनाव में भी स्थिर रहते हैं और धीरे-धीरे स्थायी संपत्ति बनाते हैं।",
        "missing": "धन और संपत्ति को लेकर बेचैनी। निवेश को समय दें और मासिक बजट बनाएं।"
      }
    ],
    "missingFix": {
      "1": "सूर्य को मजबूत करें: प्रतिदिन सुबह तांबे के लोटे से सूर्य को जल दें; पूर्व दिशा में तांबे का सूर्य लगाएं।",
      "2": "चंद्रमा को मजबूत करें: चांदी का कड़ा या गिलास प्रयोग करें; उत्तर-पश्चिम (NW) दिशा साफ रखें; माता का आशीर्वाद लें।",
      "3": "बृहस्पति को मजबूत करें: गुरुवार को पीले वस्त्र पहनें; ईशान (NE) कोण साफ और पवित्र रखें; हल्दी का तिलक लगाएं।",
      "4": "राहु को संतुलित करें: नैऋत्य (SW) कोण साफ और भारी रखें; शनिवार को दान करें; रात को स्क्रीन समय घटाएं।",
      "5": "बुध को मजबूत करें: उत्तर दिशा या टेबल पर हरे पौधे (मनी प्लांट) रखें; मधुर बोलें; बुधवार को हरा रंग पहनें।",
      "6": "शुक्र को मजबूत करें: आग्नेय (SE) कोण सुंदर रखें; सुगंधित इत्र लगाएं; शुक्रवार को सफेद/पेस्टल कपड़े पहनें।",
      "7": "केतु को संतुलित करें: घर में ध्यान का शांत कोना बनाएं; आवारा कुत्तों को भोजन दें; नियमित ध्यान करें।",
      "8": "शनि को मजबूत करें: शनिवार को जरूरतमंदों की सेवा करें; पश्चिम दिशा साफ रखें; समय की पाबंदी रखें।",
      "9": "मंगल को मजबूत करें: नियमित व्यायाम करें; दक्षिण दिशा प्रकाशित रखें; मंगलवार को हनुमान चालीसा पढ़ें।"
    },
    "watch": {
      "metal": {
        "1": "सोने का रंग या गोल्ड-टोन स्टेनलेस स्टील",
        "2": "सिल्वर स्टेनलेस स्टील (शुद्ध चांदी का टोन)",
        "3": "गोल्ड या ब्रास (पीतल) टोन मेटल",
        "4": "डार्क गनमेटल या डुअल-टोन मिश्रित धातु",
        "5": "सिल्वर स्टील या हरे शेड के साथ मेटल",
        "6": "रोज गोल्ड, व्हाइट गोल्ड या चमकदार सिल्वर",
        "7": "पंचधातु या डुअल-टोन मेटल",
        "8": "डार्क स्टील, ब्लैक मेटल या मजबूत स्टील",
        "9": "कॉपर-टोन (तांबा रंग) या रेड एक्सेंट मेटल"
      },
      "dial": {
        "1": "शैम्पेन, गोल्ड या व्हाइट सनरे डायल",
        "2": "सफेद, सिल्वर या मोती (Mother-of-pearl) डायल",
        "3": "क्रीम, हाथीदांत (Ivory) या शैम्पेन डायल",
        "4": "स्मोकी ग्रे, चारकोल या गहरा नीला डायल",
        "5": "हल्का हरा, आइस-ब्लू या टील डायल",
        "6": "सफेद, गुलाबी, रोज-टेक्सचर्ड या चमकदार डायल",
        "7": "अर्थ-टोन, भूरा या ग्रेडिएंट डायल",
        "8": "गहरा नीला या काला डायल साफ नंबरों के साथ",
        "9": "लाल एक्सेंट, सिंदूरी या गहरा मैरून डायल"
      },
      "geometry": {
        "1": "साफ मार्कर वाला गोल डायल",
        "2": "सॉफ्ट कर्व्स वाला गोल डायल (नुकीले कोनों से बचें)",
        "3": "गोल या कुशन शेप डायल",
        "4": "चौकोर (Square), आयताकार या आधुनिक शेप",
        "5": "स्लिम गोल डायल; डे-डेट विंडो वाला",
        "6": "एलिगेंट गोल या ओवल (अंडाकार) डायल",
        "7": "साधारण और शांत डायल",
        "8": "अष्टकोणीय (8-sided) या मजबूत चौकोर केस",
        "9": "बोल्ड और स्पोर्टी गोल केस"
      },
      "features": {
        "1": "सरल तीन सुइयों वाला डिस्प्ले — नेतृत्व में स्पष्टता",
        "2": "शांत एनालॉग; बार-बार नोटिफिकेशन वाली स्मार्टवॉच से बचें",
        "3": "क्लासिक एनालॉग तारीख के साथ; डिजिटल भ्रम से बचें",
        "4": "क्रोनोग्राफ या आधुनिक फीचर्स स्वीकार्य",
        "5": "डे-डेट (दिन व तारीख) वाली घड़ी (बुध + स्थिरता)",
        "6": "स्लिम ड्रेस प्रोफाइल; क्रिस्टल या चमकदार डिजाइन अनुकूल",
        "7": "सरल व शांत डायल, कम जटिलताएं",
        "8": "अनुशासन और ट्रैकिंग के लिए डे-डेट डिस्प्ले; मजबूत मेटल ब्रेसलेट",
        "9": "मजबूत बनावट; रोटेटिंग बेजल या स्पोर्ट्स फीचर्स"
      },
      "strap": {
        "1": "गोल्ड-टोन मेटल ब्रेसलेट",
        "2": "सिल्वर मेटल मेश या लिंक ब्रेसलेट — धातु मन को स्थिर रखती है",
        "3": "टैन/ब्राउन लेदर या गोल्ड-टोन ब्रेसलेट",
        "4": "सिलिकॉन के बजाय मेटल ब्रेसलेट को प्राथमिकता दें",
        "5": "स्टील ब्रेसलेट या हरा लेदर स्ट्रैप",
        "6": "मेटल लिंक ब्रेसलेट; रबर से बचें",
        "7": "लेदर या मिक्स्ड-मेटल ब्रेसलेट",
        "8": "मजबूत मल्टी-लिंक स्टील ब्रेसलेट",
        "9": "कॉपर-टोन ब्रेसलेट या लाल/भूरा लेदर"
      },
      "avoid": {
        "1": "बहुत गहरे या पूरी तरह काले डायल वाली घड़ियां",
        "2": "लगातार नोटिफिकेशन वाली स्मार्टवॉच (राहु का शोर चंद्रमा को अशांत करता है)",
        "5": "अत्यधिक भीड़भाड़ वाले डायल जो बुध की एकाग्रता भटकाते हैं",
        "8": "सस्ती प्लास्टिक घड़ियां — शनि के अनुशासन को कमजोर करती हैं"
      }
    },
    "crystals": {
      "Ruby": {
        "chakra": "मूलाधार एवं अनाहत (Root / Heart)",
        "benefits": "आत्मविश्वास, मान-सम्मान, नेतृत्व क्षमता और शारीरिक ऊर्जा बढ़ाता है",
        "pair": "पन्ना (Emerald) या मोती (Pearl)"
      },
      "Pearl": {
        "chakra": "स्वाधिष्ठान एवं अनाहत (Sacral / Heart)",
        "benefits": "मन की शांति, तनाव मुक्ति, भावनात्मक संतुलन और अच्छी नींद देता है",
        "pair": "मूनस्टोन या चांदी"
      },
      "Emerald": {
        "chakra": "अनाहत एवं विशुद्ध (Heart / Throat)",
        "benefits": "व्यापारिक बुद्धि, वाणी में प्रभाव, याददाश्त और धन लाभ बढ़ाता है",
        "pair": "हीरा, सफेद जरकन या ग्रीन एवेंट्यूरिन"
      },
      "Yellow Sapphire": {
        "chakra": "मणिपुर एवं आज्ञा (Solar Plexus / Third Eye)",
        "benefits": "ज्ञान, समृद्धि, भाग्य वृद्धि, संतान सुख और उच्च सम्मान दिलाता है",
        "pair": "सिट्रीन या सोना/पीतल"
      },
      "Diamond": {
        "chakra": "अनाहत एवं सहस्रार (Heart / Crown)",
        "benefits": "आकर्षण, दांपत्य सुख, विलासिता, कला और रचनात्मकता बढ़ाता है",
        "pair": "रोज क्वार्ट्ज या चांदी"
      },
      "Blue Sapphire": {
        "chakra": "आज्ञा एवं सहस्रार (Third Eye / Crown)",
        "benefits": "कड़ी मेहनत का फल, न्याय, अनुशासन, एकाग्रता और सुरक्षा देता है",
        "pair": "क्लियर क्वार्ट्ज या एमेथिस्ट"
      },
      "Hessonite": {
        "chakra": "मूलाधार (Root Chakra)",
        "benefits": "मानसिक भ्रम दूर करता है, अचानक सफलता और विदेशी संपर्कों में लाभ कराता है",
        "pair": "स्मोकी क्वार्ट्ज"
      },
      "Cat's Eye": {
        "chakra": "आज्ञा एवं मूलाधार (Third Eye / Root)",
        "benefits": "गहन अंतर्ज्ञान, आध्यात्मिक जागृति और बुरी नजर से सुरक्षा देता है",
        "pair": "टाइगर आई"
      },
      "Red Coral": {
        "chakra": "मूलाधार (Root Chakra)",
        "benefits": "साहस, निर्भीकता, भूमि-भवन लाभ, रक्त संचार और ऊर्जा बढ़ाता है",
        "pair": "रेड जैस्पर या कार्नेलियन"
      },
      "Red Aventurine": {
        "chakra": "मूलाधार एवं स्वाधिष्ठान",
        "benefits": "कार्य करने का जुनून, स्फूर्ति और आत्मविश्वास जगाता है",
        "pair": "क्लियर क्वार्ट्ज या कार्नेलियन"
      },
      "Citrine": {
        "chakra": "मणिपुर चक्र (Solar Plexus)",
        "benefits": "व्यापार में धन लाभ, आशावाद और सफलता को आकर्षित करता है",
        "pair": "ग्रीन एवेंट्यूरिन या पुखराज"
      },
      "Rose Quartz": {
        "chakra": "अनाहत चक्र (Heart Chakra)",
        "benefits": "रिश्तों में मिठास, प्रेम, आत्म-सम्मान और भावनात्मक शांति लाता है",
        "pair": "क्लियर क्वार्ट्ज या एमेथिस्ट"
      },
      "Amethyst": {
        "chakra": "सहस्रार एवं आज्ञा (Crown / Third Eye)",
        "benefits": "तनाव मुक्ति, गहरी शांति, अनिद्रा से राहत और बुरी आदतों से मुक्ति",
        "pair": "रोज क्वार्ट्ज या मूनस्टोन"
      },
      "Clear Quartz": {
        "chakra": "सभी चक्रों को संतुलित करता है",
        "benefits": "ऊर्जा को कई गुना बढ़ाता है और मन को पूर्ण स्पष्टता देता है",
        "pair": "किसी भी रत्न के साथ पहना जा सकता है"
      },
      "Selenite": {
        "chakra": "सहस्रार (Crown Chakra)",
        "benefits": "रत्नों को प्राकृतिक रूप से शुद्ध और चार्ज करता है",
        "pair": "सभी क्रिस्टल्स के लिए आदर्श क्लींजर"
      },
      "5 Mukhi Rudraksha": {
        "chakra": "विशुद्ध चक्र (Throat Chakra)",
        "benefits": "स्वास्थ्य रक्षा, मानसिक शांति, रक्तचाप नियंत्रण और आध्यात्मिक सुरक्षा",
        "pair": "सिट्रीन, पुखराज या स्फटिक"
      }
    },
    "seleniteRitual": "सेलेनाइट प्लेट या बाउल पर अपने सभी क्रिस्टल्स को रात भर रखें — यह बिना पानी या नमक के उन्हें पूर्णतः शुद्ध और ऊर्जावान कर देता है।",
    "dayWear": [
      {
        "day": "सोमवार",
        "num": 2,
        "colors": "सफेद, चांदी, क्रीम या हल्का स्लेटी",
        "note": "चंद्रमा का दिन — मन को शांत और एकाग्र करने वाले रंग"
      },
      {
        "day": "मंगलवार",
        "num": 9,
        "colors": "लाल, सिंदूरी, मूंगा रंग या मैरून",
        "note": "मंगल का दिन — ऊर्जा और साहस बढ़ाने वाले रंग"
      },
      {
        "day": "बुधवार",
        "num": 5,
        "colors": "हरा, हल्का हरा, मिंट या फिरोजी",
        "note": "बुध का दिन — संवाद और व्यापार में सफलता देने वाले रंग"
      },
      {
        "day": "गुरुवार",
        "num": 3,
        "colors": "पीला, सरसों पीला या सुनहरा",
        "note": "गुरु का दिन — ज्ञान, धन और शुभता आकर्षित करने वाले रंग"
      },
      {
        "day": "शुक्रवार",
        "num": 6,
        "colors": "सफेद, गुलाबी, क्रीम या पेस्टल शेड्स",
        "note": "शुक्र का दिन — प्रेम, आकर्षण और संबंधों में मिठास देने वाले रंग"
      },
      {
        "day": "शनिवार",
        "num": 8,
        "colors": "गहरा नीला, काला या जामुनी",
        "note": "शनि का दिन — अनुशासन, स्थिरता और सुरक्षा देने वाले रंग"
      },
      {
        "day": "रविवार",
        "num": 1,
        "colors": "नारंगी, सुनहरा, केसरिया या गहरा लाल",
        "note": "सूर्य का दिन — मान-सम्मान, नेतृत्व और तेज बढ़ाने वाले रंग"
      }
    ],
    "careers": {
      "1": [
        "सरकारी सेवा एवं प्रशासनिक पद (IAS/IPS)",
        "राजनीति एवं सार्वजनिक नेतृत्व",
        "स्वयं का व्यवसाय / उद्यमिता",
        "सीनियर मैनेजमेंट एवं डायरेक्टर्स",
        "सेना / पुलिस में उच्च पद",
        "चिकित्सा क्षेत्र में नेतृत्व"
      ],
      "2": [
        "मानव संसाधन (HR) एवं जनसंपर्क",
        "होटल, हॉस्पिटैलिटी एवं टूरिज्म",
        "नर्सिंग, केयरगिविंग एवं मनोविज्ञान",
        "काउंसलिंग एवं हीलिंग",
        "डेयरी, पेय पदार्थ एवं जल व्यापार",
        "मीडिया, कला एवं संगीत"
      ],
      "3": [
        "शिक्षण, शिक्षा एवं ट्रेनिंग संस्थान",
        "बैंकिंग, वित्त, सीए एवं अकाउंट्स",
        "कानून, वकालत एवं न्यायपालिका",
        "सलाहकार (कंसल्टेंसी) एवं मेंटरिंग",
        "ज्योतिष, वास्तु एवं आध्यात्मिक मार्गदर्शन",
        "लेखन एवं प्रकाशन"
      ],
      "4": [
        "आईटी, सॉफ्टवेयर एवं इलेक्ट्रॉनिक्स",
        "एविएशन (विमानन) एवं एयरोस्पेस",
        "विदेशी व्यापार एवं बहुराष्ट्रीय कंपनियां (MNC)",
        "स्टार्टअप्स एवं नए प्रयोग",
        "अनुसंधान एवं नवाचार",
        "फिल्म, फोटोग्राफी एवं मीडिया तकनीक"
      ],
      "5": [
        "व्यापार, ट्रेडिंग, आयात-निर्यात",
        "मार्केटिंग, सेल्स एवं विज्ञापन",
        "पत्रकारिता, मीडिया एवं जनसंचार",
        "चार्टर्ड अकाउंटेंसी एवं ऑडिट",
        "डेटा एनालिटिक्स एवं टेलीकॉम",
        "शेयर बाजार एवं ब्रोकिंग"
      ],
      "6": [
        "फैशन, ब्यूटी, ग्लैमर एवं लग्जरी ब्रांड्स",
        "कला, सिनेमा, थियेटर एवं मनोरंजन",
        "इंटीरियर डिजाइनिंग एवं आर्किटेक्चर",
        "ज्वैलरी, आभूषण एवं ऑटोमोबाइल",
        "हॉस्पिटैलिटी एवं फाइन डाइनिंग",
        "कॉस्मेटिक्स एवं परफ्यूम"
      ],
      "7": [
        "शोध संस्थान एवं वैज्ञानिक प्रयोगशालाएं",
        "आध्यात्मिकता, योग एवं हीलिंग",
        "जांच, डिटेक्टिव एवं सीक्रेट सर्विसेज",
        "डेटा रणनीति एवं एनालिसिस",
        "विदेशों में कार्य / फॉरेन प्रोजेक्ट्स",
        "दर्शनशास्त्र एवं उच्च शिक्षा"
      ],
      "8": [
        "इंजीनियरिंग, मैन्युफैक्चरिंग एवं निर्माण",
        "रियल एस्टेट, जमीन-जायदाद एवं बिल्डर्स",
        "माइनिंग, लोहा, स्टील, तेल एवं गैस",
        "कानून, बीमा एवं कॉरपोरेट कंप्लायंस",
        "बड़े पैमाने के इंफ्रास्ट्रक्चर प्रोजेक्ट्स",
        "लॉजिस्टिक्स एवं भारी उद्योग"
      ],
      "9": [
        "सेना, पुलिस एवं रक्षा सेवाएं",
        "खेलकूद, फिटनेस एवं एथलेटिक्स",
        "सर्जरी एवं आपातकालीन चिकित्सा",
        "मैकेनिकल एवं सिविल इंजीनियरिंग",
        "प्रॉपर्टी डीलिंग एवं रियल एस्टेट",
        "ऊर्जा, अग्नि एवं धातु उद्योग"
      ]
    },
    "personalYear": {
      "1": "नई शुरुआत और नेतृत्व का वर्ष — नए काम शुरू करें, खुद आगे बढ़कर फैसले लें, जिन्हें टाल रहे थे उन्हें आरंभ करें।",
      "2": "धैर्य और साझेदारी का वर्ष — संबंधों को मजबूत करें, टीम वर्क पर ध्यान दें; अकेले बड़ा जोखिम लेने से बचें।",
      "3": "वृद्धि, रचनात्मकता और विस्तार का वर्ष — धन लाभ, समाज में मान-सम्मान और नई विद्या सीखने के लिए सर्वोत्तम समय।",
      "4": "नींव मजबूत करने और अनुशासन का वर्ष — बचत करें, सिस्टम बनाएं; परिणाम में थोड़ा समय लगे तो घबराएं नहीं।",
      "5": "बदलाव और नए अवसरों का वर्ष — यात्राएं, मार्केटिंग, व्यापार में बदलाव और नए प्रयोग अत्यधिक लाभ देंगे।",
      "6": "पारिवारिक सुख, प्रेम और सद्भाव का वर्ष — घर-परिवार, वाहन, सौंदर्य और रचनात्मक कार्यों के लिए अत्यंत शुभ।",
      "7": "आत्म-चिंतन, अध्ययन और साधना का वर्ष — अपने कौशल निखारें, शोध करें, आध्यात्मिक अभ्यास करें; जल्दबाजी में जोखिम न लें।",
      "8": "कर्मफल और बड़ी उपलब्धियों का वर्ष — पुरानी मेहनत का ठोस फल मिलेगा; करियर में तरक्की और आर्थिक मजबूती का समय।",
      "9": "पूर्णता और नए चक्र की तैयारी का वर्ष — पुराने मामलों को सुलझाएं, कर्ज चुकाएं, साहस और दृढ़ता से आगे बढ़ें।"
    },
    "vastu": {
      "directions": {
        "N": {
          "label": "उत्तर दिशा (बुध)",
          "best": "लिविंग रूम, अध्ययन कक्ष, ऑफिस टेबल, कैश लॉकर (तिजोरी)",
          "worst": "मास्टर बेडरूम, शौचालय, भारी कबाड़",
          "fix": "उत्तर दिशा को हल्का, खुला और हरा-भरा रखें। दोष होने पर: हरे पौधे, मनी प्लांट या बुध यंत्र लगाएं।"
        },
        "NE": {
          "label": "ईशान कोण — उत्तर-पूर्व (बृहस्पति)",
          "best": "पूजा घर, ध्यान कक्ष, मुख्य द्वार, जल तत्व (फाउंटेन)",
          "worst": "रसोई, शौचालय, मास्टर बेडरूम, भारी सामान, डस्टबिन",
          "fix": "सबसे पवित्र दिशा है। दोष होने पर: पानी का कटोरा रखें, नित्य दीया जलाएं, गुरु यंत्र लगाएं, हल्के पीले/सफेद रंग का प्रयोग करें; समुद्री नमक का कटोरा रखें।"
        },
        "E": {
          "label": "पूर्व दिशा (सूर्य)",
          "best": "मुख्य द्वार, बैठक, अध्ययन कक्ष, बालकनी",
          "worst": "शौचालय, सीढ़ियां, स्टोर रूम",
          "fix": "सुबह की धूप के लिए पूर्व को खुला रखें। दोष होने पर: तांबे का सूर्य प्रतीक लगाएं, खिड़कियां साफ रखें।"
        },
        "SE": {
          "label": "आग्नेय कोण — दक्षिण-पूर्व (शुक्र)",
          "best": "रसोईघर, बिजली के उपकरण, जनरेटर, गीजर",
          "worst": "मास्टर बेडरूम, पानी की टंकी, पूजा घर",
          "fix": "अग्नि का स्थान है। दोष होने पर: तांबे का पिरामिड या शुक्र यंत्र लगाएं, शाम को लाल/नारंगी बल्ब जलाएं; यहां जल तत्व न रखें।"
        },
        "S": {
          "label": "दक्षिण दिशा (मंगल)",
          "best": "शयनकक्ष (सिर दक्षिण में), सीढ़ियां, भारी स्टोरेज",
          "worst": "मुख्य द्वार (अशुभ पद पर), पानी की टंकी, खुला खाली स्थान",
          "fix": "दक्षिण को भारी और ऊंचा रखें। दोष होने पर: लाल/मिट्टी के रंग प्रयोग करें, मंगल यंत्र लगाएं, पीतल या तांबे की वस्तुएं रखें।"
        },
        "SW": {
          "label": "नैऋत्य कोण — दक्षिण-पश्चिम (राहु)",
          "best": "मास्टर बेडरूम, भारी अलमारी, मालिक का कमरा, तिजोरी",
          "worst": "मुख्य द्वार, शौचालय, भूमिगत पानी की टंकी, खुला गड्ढा",
          "fix": "स्थिरता का स्थान है। दोष (द्वार/टॉयलेट) होने पर: पीतल का पिरामिड, राहु यंत्र, परिवार का चित्र लगाएं, पीले/भूरे रंग का प्रयोग करें, भारी फर्नीचर रखें।"
        },
        "W": {
          "label": "पश्चिम दिशा (शनि)",
          "best": "डाइनिंग रूम, बच्चों का कमरा, शौचालय (स्वीकार्य), स्टडी",
          "worst": "मुख्य द्वार (मध्यम), पूजा घर",
          "fix": "दोष होने पर: ६ रॉड वाली मेटल विंड चाइम लगाएं, शनि यंत्र रखें, गहरा नीला/ग्रे रंग प्रयोग करें; यहां अग्नि तत्व न रखें।"
        },
        "NW": {
          "label": "वायव्य कोण — उत्तर-पश्चिम (चंद्रमा)",
          "best": "अतिथि कक्ष, तैयार माल का गोदाम, गैरेज",
          "worst": "मास्टर बेडरूम (अस्थिरता लाता है), रसोईघर",
          "fix": "गतिशीलता का स्थान है। दोष होने पर: सफेद/चांदी के रंग, चंद्र यंत्र, सफेद फूल या मेटल विंड चाइम लगाएं।"
        }
      },
      "entrance": {
        "N": {
          "score": "Good",
          "note": "उत्तर का मुख्य द्वार धन के निरंतर प्रवाह (बुध) में सहायक है। इसे प्रकाशित और खुला रखें।"
        },
        "NE": {
          "score": "Excellent",
          "note": "ईशान का मुख्य द्वार सर्वोत्तम व अत्यंत शुभ माना जाता है — यह स्पष्ट सोच, समृद्धि और शांति लाता है।"
        },
        "E": {
          "score": "Excellent",
          "note": "पूर्व का मुख्य द्वार उगते सूर्य की सकारात्मक ऊर्जा लाता है — मान-सम्मान, उत्तम स्वास्थ्य और प्रगति।"
        },
        "SE": {
          "score": "Weak",
          "note": "आग्नेय का द्वार अनावश्यक खर्चे और तनाव ला सकता है। सरल उपाय: दरवाजे के ऊपर तांबे का पिरामिड लगाएं, लाल पायदान रखें और दोनों तरफ हरे पौधे रखें।"
        },
        "S": {
          "score": "Weak",
          "note": "दक्षिण का द्वार सावधानी मांगता है। सरल उपाय: दरवाजे के ऊपर मंगल यंत्र लगाएं, भारी लकड़ी का दरवाजा रखें और लाल बल्ब जलाएं।"
        },
        "SW": {
          "score": "Dosh",
          "note": "नैऋत्य का मुख्य द्वार प्रमुख वास्तु दोष माना जाता है — यह स्थिरता और बचत को घटाता है। सरल उपाय: राहु यंत्र, पीतल का पिरामिड लगाएं, पीले/भूरे रंग का पायदान रखें, दहलीज बनाएं और अंदर की तरफ गणेश जी की प्रतिमा लगाएं।"
        },
        "W": {
          "score": "Moderate",
          "note": "पश्चिम का द्वार सामान्य है। धातु की विंड चाइम और स्वच्छता बनाए रखने से शुभता बढ़ती है।"
        },
        "NW": {
          "score": "Good",
          "note": "वायव्य का द्वार नए संपर्कों, सहयोग और नेटवर्किंग में सहायक है। यहां हवा का आवागमन खुला रखें।"
        }
      },
      "roomRules": [
        {
          "room": "Kitchen",
          "doshText": "{dir} में रसोई (अग्नि) होना अग्नि तत्व का असंतुलन बनाता है — इससे स्वास्थ्य और खर्चों पर असर पड़ता है।",
          "fix": "खाना बनाते समय पूर्व दिशा की ओर मुंह रखें; रसोई में पीला जैसलमेर पत्थर या तांबे का पिरामिड रखें; ईशान में होने पर समुद्री नमक का कटोरा रखें।"
        },
        {
          "room": "Master Bedroom",
          "doshText": "{dir} में मास्टर बेडरूम होने से मानसिक शांति और स्थिरता प्रभावित होती है।",
          "fix": "सोते समय सिर हमेशा दक्षिण दिशा में रखें; कमरे में हल्के भूरे या बेज रंग का प्रयोग करें; रोज क्वार्ट्ज का जोड़ा रखें।"
        },
        {
          "room": "Toilet",
          "doshText": "{dir} में शौचालय होना उस दिशा की ऊर्जा को नष्ट करता है — यह प्रमुख वास्तु दोष है।",
          "fix": "शौचालय का दरवाजा हमेशा बंद रखें; एक कटोरी में समुद्री नमक रखें (हर हफ्ते बदलें); बाहरी दीवार पर पीतल का पिरामिड लगाएं।"
        },
        {
          "room": "Pooja Room",
          "doshText": "{dir} में पूजा स्थल होने से घर की आध्यात्मिक सुरक्षा कमजोर होती है।",
          "fix": "पूजा करते समय पूर्व या उत्तर की ओर मुंह रखें; ईशान कोण में प्रतिदिन सुबह-शाम घी या तिल के तेल का दीया अवश्य जलाएं।"
        },
        {
          "room": "Study Room",
          "doshText": "{dir} में अध्ययन कक्ष होने से पढ़ाई में एकाग्रता और याददाश्त कमजोर पड़ती है।",
          "fix": "पढ़ते समय पूर्व या उत्तर की ओर मुंह करके बैठें; टेबल पर स्फटिक या सरस्वती यंत्र रखें; हल्के पीले या हरे रंग का प्रयोग करें।"
        },
        {
          "room": "Staircase",
          "doshText": "{dir} में (और विशेषकर घर के मध्य ब्रह्मस्थान में) सीढ़ियां होना ऊर्जा में भारीपन और अस्थिरता लाता है।",
          "fix": "सीढ़ियों के नीचे कबाड़ न रखें, वहां रोशनी रखें; सीढ़ियों के आरंभ पर भारी गमला रखें; ब्रह्मस्थान खुला रखें।"
        }
      ],
      "plotShapes": {
        "square": {
          "tone": "good",
          "note": "चौकोर प्लॉट चारों कोनों से संतुलित और अत्यंत शुभ होता है — इसमें ऊर्जा का संचार एक समान रहता है।"
        },
        "rectangular": {
          "tone": "good",
          "note": "आयताकार प्लॉट संतुलित और शुभ होता है — व्यापार और निवास दोनों के लिए फलदायी है।"
        },
        "gomukhi": {
          "tone": "good",
          "note": "गोमुखी प्लॉट (आगे से संकरा, पीछे से चौड़ा) निवास के लिए बहुत शुभ होता है — यह धन और समृद्धि को बांधकर रखता है।"
        },
        "shermukhi": {
          "tone": "bad",
          "note": "शेरमुखी प्लॉट (आगे से चौड़ा, पीछे से संकरा) व्यापार के लिए ठीक है पर निवास के लिए अनुकूल नहीं। उपाय: पीछे की दीवार पर भारी पौधे या चारदीवारी मजबूत करें।"
        },
        "missing-northeast": {
          "tone": "bad",
          "note": "ईशान कोण का कटा होना सबसे पवित्र ऊर्जा को कमजोर करता है। उपाय: कटे हुए कोने पर दीया जलाएं, जल तत्व रखें और रोशनी भरपूर रखें।"
        },
        "missing-southwest": {
          "tone": "bad",
          "note": "नैऋत्य कोण का कटा होना स्थिरता को हिलाता है। उपाय: वहां भारी पीतल का पिरामिड या भारी गमले रखें।"
        },
        "missing-southeast": {
          "tone": "warn",
          "note": "आग्नेय कोण का कटा होना अग्नि तत्व घटाता है। उपाय: लाल/नारंगी रंग और तांबे का पिरामिड लगाएं।"
        },
        "missing-northwest": {
          "tone": "warn",
          "note": "वायव्य कोण का कटा होना सहयोग में कमी लाता है। उपाय: धातु की विंड चाइम और सफेद रंग का प्रयोग करें।"
        },
        "extended-northeast": {
          "tone": "good",
          "note": "ईशान कोण का बढ़ा होना अत्यंत भाग्यशाली और शुभ होता है — यह ज्ञान, मान-सम्मान और धन बढ़ाता है।"
        },
        "extended-southwest": {
          "tone": "bad",
          "note": "नैऋत्य कोण का बढ़ना अत्यधिक भारीपन लाता है। उपाय: उस स्थान को केवल स्टोरेज के लिए इस्तेमाल करें।"
        }
      }
    },
    "kua": {
      "1": {
        "group": "पूर्वी समूह (East)",
        "element": "जल",
        "shengChi": "दक्षिण-पूर्व (SE)",
        "auspicious": [
          "दक्षिण-पूर्व (SE)",
          "पूर्व (E)",
          "दक्षिण (S)",
          "उत्तर (N)"
        ]
      },
      "2": {
        "group": "पश्चिमी समूह (West)",
        "element": "पृथ्वी",
        "shengChi": "उत्तर-पूर्व (NE)",
        "auspicious": [
          "उत्तर-पूर्व (NE)",
          "पश्चिम (W)",
          "उत्तर-पश्चिम (NW)",
          "दक्षिण-पश्चिम (SW)"
        ]
      },
      "3": {
        "group": "पूर्वी समूह (East)",
        "element": "काष्ठ (Wood)",
        "shengChi": "दक्षिण (S)",
        "auspicious": [
          "दक्षिण (S)",
          "उत्तर (N)",
          "दक्षिण-पूर्व (SE)",
          "पूर्व (E)"
        ]
      },
      "4": {
        "group": "पूर्वी समूह (East)",
        "element": "काष्ठ (Wood)",
        "shengChi": "उत्तर (N)",
        "auspicious": [
          "उत्तर (N)",
          "दक्षिण (S)",
          "पूर्व (E)",
          "दक्षिण-पूर्व (SE)"
        ]
      },
      "6": {
        "group": "पश्चिमी समूह (West)",
        "element": "धातु (Metal)",
        "shengChi": "पश्चिम (W)",
        "auspicious": [
          "पश्चिम (W)",
          "उत्तर-पूर्व (NE)",
          "दक्षिण-पश्चिम (SW)",
          "उत्तर-पश्चिम (NW)"
        ]
      },
      "7": {
        "group": "पश्चिमी समूह (West)",
        "element": "धातु (Metal)",
        "shengChi": "उत्तर-पश्चिम (NW)",
        "auspicious": [
          "उत्तर-पश्चिम (NW)",
          "दक्षिण-पश्चिम (SW)",
          "उत्तर-पूर्व (NE)",
          "पश्चिम (W)"
        ]
      },
      "8": {
        "group": "पश्चिमी समूह (West)",
        "element": "पृथ्वी",
        "shengChi": "दक्षिण-पश्चिम (SW)",
        "auspicious": [
          "दक्षिण-पश्चिम (SW)",
          "उत्तर-पश्चिम (NW)",
          "पश्चिम (W)",
          "उत्तर-पूर्व (NE)"
        ]
      },
      "9": {
        "group": "पूर्वी समूह (East)",
        "element": "अग्नि",
        "shengChi": "पूर्व (E)",
        "auspicious": [
          "पूर्व (E)",
          "दक्षिण-पूर्व (SE)",
          "उत्तर (N)",
          "दक्षिण (S)"
        ]
      }
    },
    "masterNumbers": {
      "11": {
        "name": "मास्टर नंबर 11 — प्रकाशक (The Illuminator)",
        "meaning": "यह अंक २ की उच्च ऊर्जा है — तीव्र अंतर्ज्ञान, प्रेरणा और आध्यात्मिक दृष्टि। अत्यधिक संवेदनशीलता को समाज सेवा, कला या शिक्षण में लगाएं और खुद पर संदेह करने से बचें।"
      },
      "22": {
        "name": "मास्टर नंबर 22 — महान निर्माता (The Master Builder)",
        "meaning": "यह अंक ४ की उच्च ऊर्जा है — सबसे शक्तिशाली मास्टर नंबर, जो बड़े सपनों को ठोस हकीकत में बदलता है। इसके लिए कड़े अनुशासन और धैर्य की आवश्यकता होती है।"
      },
      "33": {
        "name": "मास्टर नंबर 33 — महान शिक्षक (The Master Teacher)",
        "meaning": "यह अंक ६ की उच्च ऊर्जा है — करुणा, निस्वार्थ सेवा और ज्ञान का प्रकाश। यह अत्यंत दुर्लभ अंक है, इसका आशीर्वाद दूसरों का जीवन संवारने से पूरा होता है।"
      }
    },
    "nameAdvice": {
      "friendly": "आपका नाम अंक आपकी जन्मतिथि के अंकों (मूलांक व भाग्यांक) के साथ पूर्णतः अनुकूल और शुभ है — स्पेलिंग बदलने की कोई आवश्यकता नहीं है।",
      "neutral": "आपका नाम अंक सामान्य (सम) है। यह न कोई रुकावट डालता है न विशेष सहारा देता है; थोड़ी ट्यून्ड स्पेलिंग से अतिरिक्त लाभ मिल सकता है।",
      "enemy": "आपका नाम अंक आपके जन्म अंकों के साथ तालमेल नहीं बिठा रहा है — इसमें ध्वनि-सुरक्षित स्पेलिंग सुधार करने की दृढ़ सलाह दी जाती है।"
    },
    "zodiac": {
      "Aries": {
        "ruler": 9,
        "element": "अग्नि",
        "crystals": [
          "रेड जैस्पर",
          "कार्नेलियन",
          "टाइगर आई"
        ],
        "intentions": "साहस, फिटनेस, नेतृत्व",
        "dev": "ॐ मंगलाय नमः",
        "pron": "Om Mangalaya Namah",
        "meaning": "मंगल देव को नमन।",
        "affirmation": "मैं निर्भीक, ऊर्जावान और आगे बढ़कर नेतृत्व करने वाला हूं।"
      },
      "Taurus": {
        "ruler": 6,
        "element": "पृथ्वी",
        "crystals": [
          "रोज क्वार्ट्ज",
          "सफेद जरकन",
          "ग्रीन एवेंट्यूरिन"
        ],
        "intentions": "स्थिरता, धन, संबंध सौहार्द",
        "dev": "ॐ शुक्राय नमः",
        "pron": "Om Shukraya Namah",
        "meaning": "शुक्र देव को नमन।",
        "affirmation": "मैं जीवन में शांति, सुख, समृद्धि और स्थायित्व को आकर्षित करता हूं।"
      },
      "Gemini": {
        "ruler": 5,
        "element": "वायु",
        "crystals": [
          "एगेट",
          "सिट्रीन",
          "क्लियर क्वार्ट्ज"
        ],
        "intentions": "स्पष्ट संवाद, ज्ञान, नए विचार",
        "dev": "ॐ बुधाय नमः",
        "pron": "Om Budhaya Namah",
        "meaning": "बुध देव को नमन।",
        "affirmation": "मेरी सोच स्पष्ट, वाणी मधुर और विचार प्रभावशाली हैं।"
      },
      "Cancer": {
        "ruler": 2,
        "element": "जल",
        "crystals": [
          "मूनस्टोन",
          "मोती",
          "रोज क्वार्ट्ज"
        ],
        "intentions": "भावनात्मक शांति, परिवार, अंतर्ज्ञान",
        "dev": "ॐ चंद्राय नमः",
        "pron": "Om Chandraya Namah",
        "meaning": "चंद्र देव को नमन।",
        "affirmation": "मेरा मन शांत है और मेरा परिवार प्रेम व सुरक्षा से परिपूर्ण है।"
      },
      "Leo": {
        "ruler": 1,
        "element": "अग्नि",
        "crystals": [
          "सनस्टोन",
          "टाइगर आई",
          "रेड जैस्पर"
        ],
        "intentions": "आत्मविश्वास, सम्मान, अधिकार",
        "dev": "ॐ सूर्याय नमः",
        "pron": "Om Suryaya Namah",
        "meaning": "सूर्य देव को नमन।",
        "affirmation": "मैं तेज, गरिमा और आत्मबल के साथ अपने जीवन का नेतृत्व करता हूं।"
      },
      "Virgo": {
        "ruler": 5,
        "element": "पृथ्वी",
        "crystals": [
          "ग्रीन एवेंट्यूरिन",
          "अमेजोनाइट",
          "क्लियर क्वार्ट्ज"
        ],
        "intentions": "एकाग्रता, कुशलता, स्वास्थ्य",
        "dev": "ॐ बुधाय नमः",
        "pron": "Om Budhaya Namah",
        "meaning": "बुध देव को नमन।",
        "affirmation": "मेरा हर कार्य व्यवस्थित, सटीक और सकारात्मक फल देने वाला है।"
      },
      "Libra": {
        "ruler": 6,
        "element": "वायु",
        "crystals": [
          "रोज क्वार्ट्ज",
          "ओपल",
          "लापिस लाजुली"
        ],
        "intentions": "संतुलન, न्याय, दांपत्य सुख",
        "dev": "ॐ शुक्राय नमः",
        "pron": "Om Shukraya Namah",
        "meaning": "शुक्र देव को नमन।",
        "affirmation": "मेरे जीवन में पूर्ण संतुलन, न्याय और मधुर संबंध स्थापित हैं।"
      },
      "Scorpio": {
        "ruler": 9,
        "element": "जल",
        "crystals": [
          "कार्नेलियन",
          "ब्लडस्टोन",
          "स्मोकी क्वार्ट्ज"
        ],
        "intentions": "परिवर्तन, आंतरिक शक्ति, सुरक्षा",
        "dev": "ॐ भौमाय नमः",
        "pron": "Om Bhaumaya Namah",
        "meaning": "मंगल देव को नमन।",
        "affirmation": "मुझमें हर बाधा को पार कर नई ऊंचाई छूने की अदम्य शक्ति है।"
      },
      "Sagittarius": {
        "ruler": 3,
        "element": "अग्नि",
        "crystals": [
          "सिट्रीन",
          "पुखराज",
          "सोडालाइट"
        ],
        "intentions": "उच्च ज्ञान, धर्म, समृद्धि",
        "dev": "ॐ गुरवे नमः",
        "pron": "Om Gurave Namah",
        "meaning": "देवगुरु बृहस्पति को नमन।",
        "affirmation": "मेरा दृष्टिकोण व्यापक है और मेरा जीवन ज्ञान व सौभाग्य से भरा है।"
      },
      "Capricorn": {
        "ruler": 8,
        "element": "पृथ्वी",
        "crystals": [
          "गार्नेट",
          "स्मोकी क्वार्ट्ज",
          "ब्लैक टूमलाइन"
        ],
        "intentions": "करियर, अनुशासन, स्थायी सफलता",
        "dev": "ॐ शनये नमः",
        "pron": "Om Shanaye Namah",
        "meaning": "शनि देव को नमन।",
        "affirmation": "मैं अनुशासित, दृढ़ और अपनी मंजिल हासिल करने के लिए समर्पित हूं।"
      },
      "Aquarius": {
        "ruler": 8,
        "element": "वायु",
        "crystals": [
          "एमेथिस्ट",
          "लापिस लाजुली",
          "लैब्राडोराइट"
        ],
        "intentions": "नवाचार, स्वतंत्रता, समाज कल्याण",
        "dev": "ॐ शनैश्चराय नमः",
        "pron": "Om Shanaischaraya Namah",
        "meaning": "शनि देव को नमन।",
        "affirmation": "मेरी दृष्टि भविष्योन्मुखी है और मैं समाज में सकारात्मक बदलाव लाता हूं।"
      },
      "Pisces": {
        "ruler": 3,
        "element": "जल",
        "crystals": [
          "एक्वामरीन",
          "मूनस्टोन",
          "एमेथिस्ट"
        ],
        "intentions": "अध्यात्म, करुणा, मानसिक शांति",
        "dev": "ॐ बृहस्पतये नमः",
        "pron": "Om Brihaspataye Namah",
        "meaning": "बृहस्पति देव को नमन।",
        "affirmation": "मैं ईश्वरीय कृपा से जुड़ा हूं और मेरा हृदय अगाध शांति से भरा है।"
      }
    },
    "mantraShort": {
      "1": {
        "dev": "ॐ घृणिः सूर्याय नमः",
        "pron": "Om Ghrinih Suryaya Namah",
        "meaning": "प्रकाश और जीवन के स्रोत तेजस्वी सूर्यदेव को नमन।",
        "affirmation": "मुझमें अटूट आत्मविश्वास, तेज और नेतृत्व शक्ति है। मैं अपने भाग्य का निर्माता हूं।"
      },
      "2": {
        "dev": "ॐ सोमाय नमः",
        "pron": "Om Somaya Namah",
        "meaning": "शीतलता और अमृत स्वरूपी चंद्रमा को नमन।",
        "affirmation": "मेरा मन शांत, स्थिर और संतुलित है। मेरा हृदय प्रेम और सकारात्मकता से भरा है।"
      },
      "3": {
        "dev": "ॐ गुरवे नमः",
        "pron": "Om Gurave Namah",
        "meaning": "ज्ञान और बुद्धि के विस्तारक देवगुरु बृहस्पति को नमन।",
        "affirmation": "मेरे लिए ज्ञान, समृद्धि और नए अवसरों के द्वार खुले हैं। मेरा मार्ग मंगलमय है।"
      },
      "4": {
        "dev": "ॐ राहवे नमः",
        "pron": "Om Rahave Namah",
        "meaning": "अचानक बदलाव और सफलता देने वाले राहु देव को नमन।",
        "affirmation": "मैं हर बाधा को पार कर साहसपूर्वक अपना अनूठा मार्ग बनाता हूं।"
      },
      "5": {
        "dev": "ॐ बुधाय नमः",
        "pron": "Om Budhaya Namah",
        "meaning": "बुद्धि, वाणी और व्यापार के कारक बुध देव को नमन।",
        "affirmation": "मेरी बुद्धि कुशाग्र है, मेरी वाणी स्पष्ट है और मैं हर परिस्थिति में सहज रहता हूं।"
      },
      "6": {
        "dev": "ॐ शुक्राय नमः",
        "pron": "Om Shukraya Namah",
        "meaning": "प्रेम, सौंदर्य और धन-समृद्धि प्रदाता शुक्र देव को नमन।",
        "affirmation": "मैं सुख, समृद्धि, प्रेम और मधुर संबंधों को आकर्षित करता हूं।"
      },
      "7": {
        "dev": "ॐ केतवे नमः",
        "pron": "Om Ketave Namah",
        "meaning": "अध्यात्म और अंतर्ज्ञान के कारक केतु देव को नमन।",
        "affirmation": "मैं अपने अंतर्ज्ञान पर भरोसा करता हूं और स्पष्टता के साथ आगे बढ़ता हूं।"
      },
      "8": {
        "dev": "ॐ शनैश्चराय नमः",
        "pron": "Om Shanaischaraya Namah",
        "meaning": "कर्मफल, न्याय और अनुशासन के स्वामी शनिदेव को नमन।",
        "affirmation": "मैं अनुशासित, कर्मठ और अपनी मेहनत के श्रेष्ठ फल का अधिकारी हूं।"
      },
      "9": {
        "dev": "ॐ मंगलाय नमः",
        "pron": "Om Mangalaya Namah",
        "meaning": "साहस, पराक्रम और रक्षा के प्रतीक मंगल देव को नमन।",
        "affirmation": "मैं साहस, शक्ति और एकाग्रता के साथ कर्म करता हूं। मैं सुरक्षित और विजयी हूं।"
      }
    },
    "compound": {
      "1": "एकात्मता — नई शुरुआत, नेतृत्व और पहल। सूर्य की मौलिक ऊर्जा; स्वतंत्र और प्रभावशाली अंक।",
      "2": "Duality — partnership, receptivity and the Moon's calm. Favours cooperation and diplomacy over force.",
      "3": "Expression — Jupiter's optimism, growth and communication. A fortunate, expansive vibration.",
      "4": "Foundation — Rahu's unconventional builder. Discipline, structure and hard work; watch for rigidity.",
      "5": "Change — Mercury's versatility, trade and movement. Quick, adaptable and entrepreneurial.",
      "6": "Harmony — Venus's love, beauty and comfort. Diplomatic and creative; watch indulgence.",
      "7": "Analysis — Ketu's depth, introspection and spirituality. Wise but inclined to solitude.",
      "8": "Power — Saturn's discipline, karma and long-term reward. Authority earned through endurance.",
      "9": "Completion — Mars's courage and action. Strong, decisive and protective; channel anger into sport.",
      "10": "भाग्य चक्र (Wheel of Fortune) — जीवन में उत्थान और प्रगति का शुभ अंक। सही समय पर अवसर पहचानकर आगे बढ़ें।",
      "11": "मास्टर नंबर 11 — प्रकाशक। तीव्र अंतर्ज्ञान, संवेदनशीलता और रचनात्मकता। इसे सेवा और कला में लगाएं।",
      "12": "त्याग और ज्ञान — दूसरों के सहयोग और धैर्य से सफलता। अधीरता से बचें।",
      "13": "परिवर्तन और पुनर्जन्મ — पुरानी बाधाओं को तोड़कर नए स्तर पर पहुंचना। कर्मठ रहें।",
      "14": "संतुलन और गतिशीलता — व्यापार और यात्राओं के लिए शुभ; अनावश्यक जोखिम से बचें।",
      "15": "आकर्षण और सौभाग्य (जादुई अंक) — शुक्र की कृपा, धन लाभ, कला, संगीत और लोकप्रियता का अत्यंत शुभ अंक।",
      "16": "सावधानी और सतर्कता — अहंकार से बचें; सादगी और सतर्कता से योजना बनाएं।",
      "17": "ज्ञान का सितारा (Star of the Magi) — आशा, शांति, मान-सम्मान और दीर्घकालिक समृद्धि का शुभ अंक।",
      "18": "कर्म और संघर्ष — धैर्य रखें, विवादों से दूर रहें और कर्मठ बने रहें।",
      "19": "सूर्य का राजकुमार — अत्यंत शुभ व भाग्यशाली अंक; सफलता, सम्मान, खुशी और सभी मनोकामनाओं की पूर्ति।",
      "20": "जागृति और नया दृष्टिकोण — आध्यात्मिक चिंतन और योजना बनाने के लिए शुभ अंक।",
      "21": "विजय और पूर्णता — सफलता, उन्नति और विदेश यात्राओं का अत्यंत शुभ फलदायक अंक।",
      "22": "मास्टर नंबर 22 — महान निर्माता। बड़े सपनों को ठोस हकीकत में बदलने का सबसे शक्तिशाली अंक।",
      "23": "शाही शेर — उच्चाधिकारियों का सहयोग, व्यापार में अपार सफलता और मान-सम्मान का अत्यंत भाग्यशाली अंक।",
      "24": "प्रेम और समृद्धि — मित्रों और परिवार का सहयोग, आर्थिक लाभ और सुखमय जीवन का शुभ अंक।",
      "25": "अनुभव से ज्ञान — जीवन के अनुभवों से सीखकर परिपक्व सफलता पाने का अंक।",
      "26": "कर्म और साझेदारी — सावधानी से साझेदारी करें, धैर्य और अनुशासन से धन संचय करें।",
      "27": "नेतृत्व और साहस — बुद्धि और पराक्रम से मान-सम्मान व उच्च पद प्राप्त करने का अंक।",
      "28": "सावधानी भरा पुरुषार्थ — भरोसेमंद लोगों के साथ काम करें, कानूनी व वित्तीय स्पष्टता रखें।",
      "29": "अनिश्चितता और सीख — भावनाओं पर नियंत्रण रखें और ठोस तथ्यों पर निर्णय लें।",
      "30": "ज्ञान और अभिव्यक्ति — लेखन, शिक्षण और सामाजिक प्रतिष्ठा के लिए शुभ अंक।",
      "31": "एकांत और विचार — अपनी सोच स्पष्ट रखें और व्यावहारिक कर्म पर ध्यान दें।",
      "32": "लोकप्रियता और व्यापार — जनसंपर्क, मीडिया और व्यापारिक सौदों के लिए अत्यधिक भाग्यशाली अंक।",
      "33": "मास्टर नंबर 33 — महान शिक्षक। करुणा, निःस्वार्थ सेवा और ज्ञान का प्रकाश।",
      "34": "Order & method — steady building through systems and patience; strong for business, but avoid rigidity and worry.",
      "35": "Social fortune — eloquence and popularity bring opportunities; guard against scattered energy and over-socialising.",
      "36": "Genius & humanity — intellectual brilliance devoted to service; watch the tendency to overthink or feel unappreciated.",
      "37": "शुभ मित्रता और प्रेम — भाग्यशाली अंक; मित्रों का सहयोग और व्यापार व विवाह में सफलता।",
      "38": "Pressure & caution — success is possible but often through strain; avoid envy, hasty decisions and questionable dealings.",
      "39": "Honour & fame — public recognition, achievement and artistic success; but watch pride and self-absorption.",
      "40": "Order & protection — a stable, guarded vibration; good for building quietly, but avoid isolation and complacency.",
      "41": "दूरदर्शिता और लाभ — नए उद्यमों और नेतृत्व के लिए शुभ अंक।",
      "42": "सौहार्द और परिवार — संबंधों में शांति और पारिवारिक सुख का अंक।",
      "43": "Rebellion & reform — a number of change-makers and unconventional paths; constructive reform succeeds, but avoid revolt for its own sake.",
      "44": "The Master of Discipline — a double-4 vibration of formidable endurance and structure; immense achievement is possible, but balance work with recovery.",
      "45": "सतर्कता और संगठन — साझेदारी और धन के मामलों में लिखित दस्तावेज रखें।",
      "46": "कूटनीति और सफलता — मधुर संबंधों और निरंतर प्रयास से सफलता; व्यापार व विवाह दोनों के लिए उत्तम।",
      "47": "स्थिरता और विवेक — धैर्य और समझदारी से अर्जित स्थायी सफलता।",
      "48": "महत्वाकांक्षा और सावधानी — संयम और योजनाबद्ध तरीके से काम करने पर सफलता।",
      "49": "परिवर्तन और नई शुरुआत — पुराने चक्रों को समाप्त कर नए रास्ते खोलने का अंक।",
      "50": "अनुभव से अधिकार — गहराई और अनुभव से अर्जित सम्मान और नेतृत्व।",
      "51": "योद्धा अंक (The Warrior) — साहस, व्यापार, प्रतियोगिता और विजय का अत्यंत शक्तिशाली व शुभ अंक; निर्णायक फैसले लें।",
      "52": "सहनशीलता और विजय — कठिनाइयों से जूझकर अंततः मजबूत सफलता पाना।",
      "53": "Change & renewal — transformation through knowledge; fortunate for those who embrace learning and let go of the past.",
      "54": "Courage with risk — bold action brings results, but impulsiveness invites loss; temper fire with planning.",
      "55": "The Magician's power — immense charisma and influence, but with a real caution against misuse; integrity decides the outcome.",
      "56": "समृद्धि और प्रेम — पारिवारिक सुख, कला और स्थिर धन लाभ का शुभ अंक।",
      "57": "Intuition & breakthrough — deep insight leads to sudden, positive change; trust your inner knowing and act on it.",
      "58": "Discipline with reward — Saturn's steady hand: hard, consistent work is repaid with lasting success and respect.",
      "59": "साहस और बदलाव — निर्भीक होकर नए अवसरों को अपनाएं।",
      "60": "Balance & completion — a harmonious closing of cycles; rest, integrate and prepare for the next beginning.",
      "61": "Independence & originality — a pioneer's number; self-reliance and fresh ideas bring success, but guard against isolation.",
      "62": "Retreat & reflection — a number of the hidden counsellor; wisdom grows in quiet, then serves the world.",
      "63": "Communication & charm — persuasive, popular and creative; excellent for writing, teaching and trade.",
      "64": "Structure & caution — solid building with a watchful eye; avoid over-control and worry, which sap the gains.",
      "65": "अनुकूलन और आकर्षण — वाकपटुता और नई दिशाओं में सफलता का अंक।",
      "66": "Caution in domestic life — love and home need conscious care; guard against possessiveness, indulgence and family friction.",
      "67": "Wisdom & stability — a fortunate blend of insight and grounding; excellent for long-term success and teaching.",
      "68": "Effort & patience — Saturn tests and then rewards; avoid pessimism and keep moving steadily toward the goal.",
      "69": "Completion & courage — endings met with strength clear the path; act bravely and close old chapters cleanly.",
      "70": "Introspection & wisdom — a number of the seeker; deep understanding and spiritual growth come through stillness.",
      "71": "The Gift — good fortune through unexpected openings and hidden help; stay open and grateful.",
      "72": "Partnership & completion — collaborative success; clear agreements and mutual respect bring the best results.",
      "73": "ज्ञान और विस्तार — उदारता और बुद्धिमत्ता से नेतृत्व करने का शुभ अंक।",
      "74": "Structure & service — steady, reliable building in service of others; avoid rigidity and martyrdom.",
      "75": "Change & opportunity — adaptability opens doors; a fortunate number for trade, travel and reinvention.",
      "76": "Love & beauty — Venus's grace: harmony, art and affection flourish; watch indulgence and possessiveness.",
      "77": "Deep wisdom & mystery — a powerful number of intuition and spiritual depth; guard against isolation and over-secrecy.",
      "78": "Delusion & caution — glamour and material allure may mislead; verify facts, keep commitments simple and honest.",
      "79": "Completion & release — the end of a karmic cycle; let go with grace and prepare for renewal.",
      "80": "Power & organisation — strong, structured authority; excellent for management, but temper control with warmth.",
      "81": "सिद्धि और प्रतिष्ठा — अनुशासित प्रयास से जीवन में उच्च पद व मान-सम्मान।",
      "82": "Adversity & patience — Saturn's test of endurance; steady, humble work converts hardship into authority.",
      "83": "Growth & renewal — expansion through learning and letting go; a fortunate number for scholars and reformers.",
      "84": "Structure & transformation — reform through discipline; change is steady and lasting when systems support it.",
      "85": "Change with wisdom — adaptability guided by insight; excellent for trade, teaching and communication.",
      "86": "Harmony & success — love and achievement align; a fortunate number for partnership and creative work.",
      "87": "Intuition & completion — inner guidance brings cycles to a graceful close; trust the still, small voice.",
      "88": "Discipline & mastery — the double-8 vibration of Saturn; immense, patient achievement is possible; avoid rigidity and self-criticism.",
      "89": "Courage & completion — bold endings clear the way for new beginnings; act with strength and integrity.",
      "90": "Introspection & renewal — a number of the seeker at rest; wisdom gathered in quiet prepares the next cycle.",
      "91": "Independence & leadership — a pioneer's power; self-reliance and fresh vision bring success; guard against isolation.",
      "92": "Partnership & insight — wisdom shared in cooperation; excellent for counselling, teaching and stable alliances.",
      "93": "Expansion & service — growth through generosity and guidance; a fortunate number for mentors and healers.",
      "94": "Structure & completion — steady building brings cycles to a full, satisfying close; avoid over-control.",
      "95": "Change & courage — bold, adaptable action transforms circumstances; a fortunate number for reinvention.",
      "96": "Love & completion — relationships and creative cycles reach fulfilment; nurture what you love.",
      "97": "Wisdom & release — deep understanding allows graceful letting-go; a powerful number of inner peace.",
      "98": "Patience & reward — Saturn's long game: endurance and discipline are repaid with lasting, respected success.",
      "99": "Mastery & completion — the highest single-figure compound; wisdom, courage and karma align for major achievement.",
      "100": "Favour of the Divine — completion of the first cycle; grace, protection and the blessing of new beginnings.",
      "101": "New beginnings — unity renewed at a higher turn of the wheel; initiation and fresh leadership energy.",
      "102": "Partnership with purpose — cooperation elevated by clarity; strong for unions and joint ventures with clear roles.",
      "103": "Expression & growth — wisdom, communication and expansion in harmony; fortunate for teachers and creators.",
      "104": "Foundation renewed — structure and discipline begin a fresh cycle; build carefully and stay flexible.",
      "105": "Change & mastery — adaptability crowned with authority; a fortunate number for leaders in times of change.",
      "106": "Harmony & completion — love, beauty and achievement reach fulfilment; a warm, fortunate closing.",
      "107": "Wisdom & renewal — deep insight opens new beginnings; trust inner guidance and step forward.",
      "108": "पूर्ण चक्र — साधना, सिद्धि, सुरक्षा और पूर्णता का पवित्र अंक।"
    }
  },
  "gu": {
    "meta": {
      "code": "gu",
      "name": "Gujarati",
      "native": "ગુજરાતી",
      "flag": "🇮🇳"
    },
    "ui": {
      "brandName": "NumeroVastu 360",
      "brandSub": "અંકશાસ્ત્ર અને વાસ્તુ ઉપાય એન્જિન",
      "editDetails": "વિગત બદલો",
      "savePrint": "રિપોર્ટ સેવ / પ્રિન્ટ કરો",
      "skipLink": "મુખ્ય વિગત પર જાઓ",
      "invocation": "ॐ શ્રી ગણેશાય નમઃ",
      "reportHeroTitle": "ઉપાય રિપોર્ટ — {name}",
      "reportHeroMeta": "જન્મ તારીખ: {dob}{birthLine} · મુખ્ય લક્ષ્ય: {goals} · તમારા ડિવાઇસ પર ગણતરી કરેલ",
      "born": "જન્મ",
      "statusPrivate": "ખાનગી અને સુરક્ષિત",
      "statusKnowledge": "જ્ઞાન સંગ્રહ v{ver}",
      "statusApp": "એપ v2.7.0 · મીઉસ ગણતરી",
      "statusBuild": "આવૃત્તિ 2026-09-05",
      "statusMemory": "સ્થાનિક મેમરી તૈયાર",
      "statusMemorySnapshots": "{count} સેવ કરેલા ચાર્ટ",
      "startupTitle": "જ્ઞાન સંગ્રહ + ઑન-ડિવાઇસ મેમરી",
      "startupSubtitle": "સતત વિકસતી સિસ્ટમ",
      "checkUpdates": "અપડેટ તપાસો",
      "currentPack": "હાલનો જ્ઞાન સંગ્રહ",
      "currentPackSub": "ઇન્ટરનેટ વિના પણ તરત જ ગણતરી કરે છે અને નવા અપડેટ તપાસે છે.",
      "localMemory": "સ્થાનિક મેમરી",
      "localMemorySub": "સેવ કરેલી રિપોર્ટ ફક્ત તમારા આ ડિવાઇસ પર જ રહે છે.",
      "noSavedCharts": "હજી કોઈ ચાર્ટ સેવ કરેલો નથી",
      "savedChartsCount": "{count} ચાર્ટ સેવ થયેલા છે",
      "privacyMode": "ગોપનીયતા મોડ",
      "privacyModeTitle": "માત્ર બ્રાઉઝર આધારિત ગણતરી",
      "privacyModeSub": "નામ, જન્મ તારીખ, ફોન નંબર અને વાસ્તુ વિગતો સંપૂર્ણ સુરક્ષિત રહે છે.",
      "loadLatestChart": "છેલ્લો ચાર્ટ લોડ કરો",
      "introTitle": "તમારી ૩૬૦° ઉપાય રિપોર્ટ",
      "introDesc": "તમારી વિગતો એક જ વાર દાખલ કરો. અમે તમારા મૂળાંક અને ભાગ્યાંક ગણીએ છીએ, તમારી વૈદિક અંક કુંડળી બનાવીએ છીએ, તમારા નામ, મોબાઈલ અને વાહનની સ્પંદન તપાસીએ છીએ, શુભ રંગો, શ્રેષ્ઠ કરિયર અને અનુકૂળ વર્ષો દર્શાવીએ છીએ, તમારું વાસ્તુ સ્કેન કરીએ છીએ — અને ધન, આરોગ્ય, કરિયર, વ્યવસાય અને સંબંધો માટે સંપૂર્ણ ઉપાય યોજના બનાવીએ છીએ.",
      "reportLanguage": "રિપોર્ટની ભાષા (Report Language)",
      "reportLanguageDesc": "રિપોર્ટ કઈ ભાષામાં જોવા માંગો છો તે પસંદ કરો (તમે ઉપરથી ગમે ત્યારે બદલી શકો છો):",
      "personalDetails": "વ્યક્તિગત વિગત (Personal Details)",
      "fullName": "પૂરું નામ (Full Name)",
      "fullNamePlaceholder": "જે નામ તમે દૈનિક વાપરો છો, જેમ કે: રાહુલ શર્મા",
      "fullNameHint": "નામનું વિશ્લેષણ ચાલ્ડિયન પદ્ધતિથી થાય છે — જે સ્પેલિંગ તમે નિયમિત વાપરો છો તે જ લખો.",
      "dob": "જન્મ તારીખ (Date of Birth)",
      "mobile": "મોબાઈલ નંબર (Mobile Number)",
      "mobilePlaceholder": "૧૦ અંકનો મોબાઈલ નંબર, જેમ કે: 9876543210",
      "mobileHint": "અંકોનો કુલ સરવાળો તમારા મૂળાંક અને ભાગ્યાંક સાથે મેળવવામાં આવે છે.",
      "vehicle": "વાહન નંબર (Vehicle Number)",
      "vehiclePlaceholder": "જેમ કે: GJ01AB1234 (મરજિયાત)",
      "vehicleHint": "અક્ષરો અને અંકોનો કુલ સરવાળો વાહનની ઊર્જા નક્કી કરે છે.",
      "gender": "જાતિ (Gender — ફેંગશુઈ કુઆ અંક માટે)",
      "genderUnsure": "જણાવવા માંગતા નથી",
      "genderMale": "પુરુષ",
      "genderFemale": "મહિલા",
      "genderOther": "અન્ય",
      "focusAreas": "મુખ્ય લક્ષ્ય / ફોકસ ક્ષેત્ર (વધુમાં વધુ ૩ પસંદ કરો)",
      "focusAreasDesc": "તમારા જીવનના તે ક્ષેત્રો પસંદ કરો જેને તમે આ રિપોર્ટમાં પ્રાથમિકતા આપવા માંગો છો:",
      "focusMoney": "ધન અને સમૃદ્ધિ (Money)",
      "focusHealth": "સ્વાસ્થ્ય અને ઊર્જા (Health)",
      "focusCareer": "કારકિર્દી / નોકરી (Career)",
      "focusBusiness": "વેપાર / ધંધો (Business)",
      "focusRelationship": "સંબંધો અને પરિવાર (Relationship)",
      "vedicPrecision": "વૈદિક જ્યોતિષ ગણતરી (Vedic Precision — મરજિયાત)",
      "vedicPrecisionDesc": "તમારી જન્મ તારીખ પરથી વૈદિક સૂર્ય રાશિ (લાહિરી અયનાંશ) તરત ગણાય છે. જન્મ સમય અને શહેર ઉમેરવાથી તમારી ચંદ્ર રાશિ, નક્ષત્ર અને પદ, લગ્ન તથા દશમ ભાવ પણ તમારા આ ફોન/કમ્પ્યુટર પર જ ગણાઈ જાય છે.",
      "birthTime": "ચોક્કસ જન્મ સમય (મરજિયાત)",
      "birthTimeHint": "લેવલ ૨ — ચંદ્ર રાશિ, નક્ષત્ર, લગ્ન અનલૉક કરે છે (કોઈ સર્વર પર મોકલ્યા વગર).",
      "birthPlace": "જન્મ સ્થળ / શહેર (મરજિયાત)",
      "birthPlacePlaceholder": "જેમ કે: અમદાવાદ, ભારત અથવા સુરત, ભારત",
      "birthPlaceHint": "લેવલ ૨ — ૪૦૦+ શહેરો ઑફલાઇન ઉપલબ્ધ છે; અથવા અક્ષાંશ/રેખાંશ લખો.",
      "tier1Ready": "લેવલ ૧ · તૈયાર છે",
      "tier1Desc": "વૈદિક સૂર્ય રાશિ (નિરાયણ / લાહિરી) — જન્મ તારીખ પરથી તરત ગણાય છે.",
      "tier2Unlock": "લેવલ ૨ · અનલૉક કરો",
      "tier2Desc": "ચંદ્ર રાશિ · નક્ષત્ર · લગ્ન · દશમ ભાવ — જન્મ સમય અને સ્થળ ઉમેરીને અનલૉક કરો.",
      "vastuDetails": "વાસ્તુ વિગત (ઘર અથવા ઓફિસ)",
      "vastuDetailsDesc": "ઘરના કેન્દ્ર (બ્રહ્મસ્થાન) માં ઊભા રહીને હોકાયંત્રથી દિશાઓ જુઓ. ખબર ન હોય તો 'નક્કી નથી' પસંદ કરો.",
      "entranceLabel": "મુખ્ય પ્રવેશદ્વાર (Main Entrance)",
      "kitchenLabel": "રસોડું (Kitchen)",
      "bedroomLabel": "મુખ્ય બેડરૂમ (Master Bedroom)",
      "toiletLabel": "શૌચાલય (Toilet)",
      "studyLabel": "અભ્યાસ ખંડ (Study Room)",
      "staircaseLabel": "દાદર / પગથિયાં (Staircase)",
      "plotShapeLabel": "પ્લોટ કે મકાનનો આકાર (Plot Shape)",
      "watchTypeLabel": "હાલમાં પહેરતા હોવ તેવી ઘડિયાળ (Watch)",
      "brandTitle": "વેપાર / પેઢી / બ્રાન્ડનું નામ (મરજિયાત)",
      "brandDesc": "તમારા ધંધા કે દુકાનનું નામ દાખલ કરો — તેનો સંયુક્ત અંક, શુભતા અને સરળ સ્પેલિંગ સુધારા જાણો.",
      "brandLabel": "વેપાર કે બ્રાન્ડનું નામ",
      "brandPlaceholder": "જેમ કે: શ્રી બાલાજી ટેક્સટાઇલ્સ",
      "privacyTitle": "ગોપનીયતા સેટિંગ્સ",
      "privacyDesc": "આ એપ સંપૂર્ણપણે તમારા ડિવાઇસ પર જ ચાલે છે. કોઈપણ અંગત ડેટા ક્યાંય મોકલાતો નથી.",
      "privacyToggleLabel": "ભવિષ્યના ઉપાયોને વધુ સારા બનાવવામાં સહયોગ કરો",
      "privacyToggleHint": "જો તમે આ પસંદ કરો છો, તો માત્ર અનામી આંકડા (જેમ કે ખૂટતા અંકોની સંખ્યા) ગણાય છે.",
      "privacyFooterHint": "આ હંમેશા બંધ રહે છે. નામ, જન્મ તારીખ, ફોન નંબર કે અંગત નોંધ ક્યારેય શેર થતા નથી.",
      "compatTitle": "ગુણ મિલાન અને સુસંગતતા (મરજિયાત — જીવનસાથી / બિઝનેસ પાર્ટનર)",
      "compatDesc": "લગ્ન અથવા ભાગીદારી માટે અન્ય વ્યક્તિનું નામ અને જન્મ તારીખ દાખલ કરો.",
      "partnerName": "સાથીદારનું પૂરું નામ",
      "partnerNamePlaceholder": "જેમ કે: અંજલિ વર્મા",
      "partnerDob": "સાથીદારની જન્મ તારીખ",
      "generateBtn": "મારી ઉપાય રિપોર્ટ તૈયાર કરો",
      "formNote": "તમારી તમામ માહિતી સુરક્ષિત છે — બધી ગણતરીઓ તમારા બ્રાઉઝરમાં જ થાય છે.",
      "footerText": "NumeroVastu 360 — શાસ્ત્રીય વૈદિક અંકશાસ્ત્ર અને વાસ્તુ સિદ્ધાંતો પર આધારિત માર્ગદર્શન. ઉપાયો સહાયક સાધનો છે, તબીબી, કાનૂની કે નાણાકીય સલાહનો વિકલ્પ નથી.",
      "errFullName": "કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.",
      "errDob": "કૃપા કરીને સાચી જન્મ તારીખ દાખલ કરો.",
      "errMobile": "કૃપા કરીને માન્ય મોબાઈલ નંબર દાખલ કરો (ઓછામાં ઓછા ૮ અંક; બધા શૂન્ય ન હોય).",
      "errGoals": "ઓછામાં ઓછું એક મુખ્ય લક્ષ્ય (ફોકસ ક્ષેત્ર) પસંદ કરો.",
      "navSummary": "સારાંશ",
      "navProfile": "પ્રોફાઇલ",
      "navVedicGrid": "વૈદિક ગ્રિડ",
      "navVedic": "વૈદિક રાશિ",
      "navTiming": "શુભ સમય",
      "navDasha": "દશા",
      "navMemory": "પ્રગતિ ચાર્ટ",
      "navVastu": "વાસ્તુ",
      "navPlan": "૪૦-દિવસીય યોજના",
      "secSummary": "મુખ્ય માર્ગદર્શક સારાંશ (Northstar Summary)",
      "secProfile": "મુખ્ય અંકશાસ્ત્ર પ્રોફાઇલ",
      "secTraits": "તમારો મૂળ સ્વભાવ — ખૂબીઓ, નબળાઈઓ અને સુધારા",
      "secVedicGrid": "તમારી વૈદિક અંક કુંડળી — ૩ સ્તરોનું વિશ્લેષણ",
      "secWeak": "નિર્બળ ગ્રહોના સંપૂર્ણ ઉપાય કિટ",
      "secZodiac": "તમારી વૈદિક સૂર્ય રાશિ — {sign}",
      "secName": "નામ વિશ્લેષણ અને સરળ જોડણી સુધારા",
      "secMobile": "મોબાઈલ નંબરનો ઊર્જા પ્રભાવ",
      "secVehicle": "વાહન નંબરનો ઊર્જા પ્રભાવ",
      "secWatch": "કાંડા ઘડિયાળનો ઉપાય",
      "secCrystal": "રત્ન અને સ્ફટિક માર્ગદર્શન",
      "secColours": "શુભ રંગો અને વાર મુજબ વસ્ત્રો",
      "secCareer": "શ્રેષ્ઠ કાર્યક્ષેત્ર અને કારકિર્દી",
      "secTiming": "અનુકૂળ વર્ષો અને વ્યક્તિગત વર્ષ ચક્ર",
      "secDasha": "દશા સમય-રેખા — જીવન-ઘટના વિન્ડો",
      "karmicDebtTitle": "કર્મઋણ તપાસ — ૧૩ · ૧૪ · ૧૬ · ૧૯",
      "pinnacleCardTitle": "જીવનના ચાર તબક્કા — શિખર (પિનેકલ) અને પડકાર",
      "secMemory": "તમારો પ્રગતિ ચાર્ટ (Evolving Chart)",
      "secVastu": "સરળ વાસ્તુ દોષ તપાસ અને નિવારણ",
      "secKua": "અંગત શુભ દિશાઓ — કુઆ અંક (Kua)",
      "secCompat": "ગુણ મિલાન અને સંબંધ સુસંગતતા",
      "secGoalPlan": "{goal} — વિશેષ ઉપાય યોજના",
      "secPlan": "તમારી ૪૦ દિવસની સાધના અને ઉપાય યોજના",
      "driverLabel": "મૂળાંક (Driver / Moolank)",
      "conductorLabel": "ભાગ્યાંક (Conductor / Bhagyank)",
      "nameNumLabel": "નામાંક (Name Number)",
      "mobNumLabel": "મોબાઈલ અંક",
      "suryaRashiLabel": "વૈદિક સૂર્ય રાશિ (Surya Rashi)",
      "chandraRashiLabel": "ચંદ્ર રાશિ (Chandra Rashi)",
      "lagnaLabel": "લગ્ન (Lagna / Ascendant)",
      "mcLabel": "દશમ ભાવ (Midheaven / MC)",
      "active": "સક્રિય (શુભ)",
      "partial": "આંશિક (મધ્યમ)",
      "weak": "નિર્બળ (ઉપાય જરૂરી)",
      "strong": "મજબૂત",
      "frustrated": "અવરોધિત",
      "present": "હાજર",
      "missing": "ગેરહાજર (મિસિંગ)",
      "critical": "અતિ મહત્વનું",
      "friendly": "અનુકૂળ (મિત્ર)",
      "neutral": "સામાન્ય (સમ)",
      "enemy": "પ્રતિકૂળ (શત્રુ)",
      "ideal": "ઉત્તમ (શુભ)",
      "acceptable": "સ્વીકાર્ય",
      "dosh": "દોષ (ઉપાય કરો)",
      "balanced": "સંતુલિત",
      "caution": "સાવધાની",
      "daily": "દૈનિક",
      "weekly": "સાપ્તાહિક",
      "once": "એક વાર",
      "adopt": "અપનાવો (+)",
      "release": "છોડો (-)",
      "amplifyThese": "તમારી ખૂબીઓને વધારો (શક્તિઓ)",
      "watchThese": "આ નબળાઈઓથી બચો (સાવધાનીઓ)",
      "howWeJudge": "આપણે આનું મૂલ્યાંકન કેવી રીતે કરીએ છીએ:",
      "beejMantra": "બીજ મંત્ર",
      "dailyShortMantra": "દૈનિક લઘુ મંત્ર",
      "wishPaperAffirmation": "સંકલ્પ પત્ર (વિશ પેપર) વાક્ય",
      "crystal": "રત્ન / ઉપરત્ન",
      "rudraksha": "રુદ્રાક્ષ",
      "yantra": "યંત્ર",
      "colorDayMetal": "રંગ / વાર / ધાતુ",
      "charity": "દાન",
      "lifestyle": "જીવનશૈલી નિયમ",
      "fast": "ઉપવાસ / વ્રત",
      "open40DayPlan": "સંપૂર્ણ ૪૦ દિવસની ઉપાય યોજના ખોલો ↓",
      "firstThreeMoves": "તમારા પ્રથમ ત્રણ પગલાં",
      "wayForward": "આગળનો માર્ગ",
      "resetCycle": "સાયકલ રીસેટ કરો",
      "day": "દિવસ",
      "completed": "પૂર્ણ",
      "cycleStarted": "સાધના પ્રારંભ: {date} · પ્રગતિ તમારા ડિવાઇસમાં સુરક્ષિત છે."
    },
    "numbers": {
      "1": {
        "planet": "સૂર્ય (Sun / Surya)",
        "element": "અગ્નિ",
        "traits": "નેતૃત્વ, આત્મવિશ્વાસ, માન-સન્માન, પિતાનો સાથ, સરકારી લાભ, ઊર્જા",
        "governs": [
          "કારકિર્દી",
          "સ્વાસ્થ્ય",
          "વેપાર"
        ],
        "weakSigns": "ઓછો આત્મવિશ્વાસ, પિતા સાથે મતભેદ, સન્માનમાં ઘટાડો, આંખો કે માથામાં ભારેપણું",
        "day": "રવિવાર",
        "color": "સોનેરી, નારંગી, કેસરી",
        "metal": "સોનું / તાંબું",
        "crystal": "માણેક (Ruby) અથવા રેડ જેસ્પર (Red Jasper)",
        "rudraksha": "૧ મુખી રુદ્રાક્ષ (1 Mukhi Rudraksha)",
        "mantra": "ॐ હ્રાં હ્રીં હ્રૌં સઃ સૂર્યાય નમઃ",
        "mantraCount": "દરરોજ સૂર્યોદય સમયે ૧૦૮ વખત (કુલ સંકલ્પ: ૭,૦૦૦)",
        "charity": "રવિવારે સવારે ઘઉં, ગોળ, તાંબાનું વાસણ કે લાલ વસ્ત્ર જરૂરિયાતમંદને દાન કરો",
        "lifestyle": "સૂર્યોદય પહેલાં ઊઠો અને તાંબાના લોટાથી ઊગતા સૂર્યને અર્ઘ્ય અર્પણ કરો; ઘરની પૂર્વ દિશા સ્વચ્છ રાખો",
        "fast": "રવિવારનો ઉપવાસ કરો; મીઠા વગરનું ભોજન અથવા ફળાહાર લો"
      },
      "2": {
        "planet": "ચંદ્ર (Moon / Chandra)",
        "element": "જળ",
        "traits": "મનની શાંતિ, નમ્રતા, સંવેદનશીલતા, અંતર્જ્ઞાન, માતાનું સુખ, જનસંપર્ક",
        "governs": [
          "સ્વાસ્થ્ય",
          "સંબંધ"
        ],
        "weakSigns": "વધારે પડતી ચિંતા, મૂડ સ્વિંગ્સ, અનિદ્રા, માતા સાથે વૈચારિક મતભેદ, નિર્ણયમાં મૂંઝવણ",
        "day": "સોમવાર",
        "color": "સફેદ, ચાંદી, ક્રીમ",
        "metal": "ચાંદી",
        "crystal": "મોતી (Pearl) અથવા મૂનસ્ટોન (Moonstone)",
        "rudraksha": "૨ મુખી રુદ્રાક્ષ (2 Mukhi Rudraksha)",
        "mantra": "ॐ શ્રાં શ્રીં શ્રૌં સઃ ચંદ્રાય નમઃ",
        "mantraCount": "દરરોજ સાંજના સમયે ૧૦૮ વખત (કુલ સંકલ્પ: ૧૧,૦૦૦)",
        "charity": "સોમવારે ચોખા, દૂધ, સફેદ મીઠાઈ, ખાંડ કે ચાંદીનું દાન કરો",
        "lifestyle": "ચાંદીના ગ્લાસમાં પાણી પીવો; રાત્રે ચંદ્રના પ્રકાશમાં થોડો સમય બેસો; માતાના ચરણ સ્પર્શ કરો",
        "fast": "સોમવારનો ઉપવાસ કરો; સૂર્યાસ્ત પછી મીઠાનું સેવન ન કરો"
      },
      "3": {
        "planet": "ગુરુ / બૃહસ્પતિ (Jupiter / Guru)",
        "element": "આકાશ",
        "traits": "જ્ઞાન, બુદ્ધિ, ધન વૃદ્ધિ, શિક્ષણ, સંતાન સુખ, ધર્મ અને હકારાત્મક વિચાર",
        "governs": [
          "ધન",
          "વેપાર",
          "કારકિર્દી"
        ],
        "weakSigns": "ધન અટકવું, યોગ્ય માર્ગદર્શન ન મળવું, વડીલો સાથે અંતર, પાચન કે વજનની તકલીફ",
        "day": "ગુરુવાર",
        "color": "પીળો, સોનેરી",
        "metal": "સોનું / પિત્તળ",
        "crystal": "પોખરાજ (Yellow Sapphire) અથવા સિટ્રીન (Citrine / સુનહલો)",
        "rudraksha": "૫ મુખી રુદ્રાક્ષ (5 Mukhi Rudraksha)",
        "mantra": "ॐ ગ્રાં ગ્રીં ગ્રૌં સઃ ગુરવે નમઃ",
        "mantraCount": "દરરોજ સવારે ૧૦૮ વખત (કુલ સંકલ્પ: ૧૯,૦૦૦)",
        "charity": "ગુરુવારે ચણાની દાળ, હળદર, કેળાં, પીળી મીઠાઈ કે ધાર્મિક પુસ્તકો દાન કરો",
        "lifestyle": "ગુરુવારે પીળા વસ્ત્રો પહેરો; કેસર કે હળદરનો ચાંદલો કરો; ગુરુજનો અને વડીલોનો આદર કરો",
        "fast": "ગુરુવારનો ઉપવાસ કરો; પીળા ફળ અને બેસનની વાનગી લો"
      },
      "4": {
        "planet": "રાહુ (Rahu)",
        "element": "વાયુ (છાયા)",
        "traits": "મહત્વાકાંક્ષા, નવીનતા, ટેકનોલોજી, દીર્ઘદ્રષ્ટિ, અચાનક સફળતા, પરંપરાથી અલગ વિચારવું",
        "governs": [
          "વેપાર",
          "કારકિર્દી"
        ],
        "weakSigns": "માનસિક મૂંઝવણ, અચાનક અડચણો, ગેજેટ્સ પર વધુ પડતો આધાર, નકામો વહેમ કે ડર",
        "day": "શનિવાર",
        "color": "સ્મોકી ગ્રે, ઘેરો વાદળી, ખાખી",
        "metal": "મિશ્ર ધાતુ / પંચધાતુ",
        "crystal": "ગોમેદ (Hessonite) અથવા સ્મોકી ક્વાર્ટ્ઝ (Smoky Quartz)",
        "rudraksha": "૮ મુખી રુદ્રાક્ષ (8 Mukhi Rudraksha)",
        "mantra": "ॐ ભ્રાં ભ્રીં ભ્રૌં સઃ રાહવે નમઃ",
        "mantraCount": "દરરોજ સૂર્યાસ્ત પછી ૧૦૮ વખત (કુલ સંકલ્પ: ૧૮,૦૦૦)",
        "charity": "શનિવારે કાળા/ધાબળા, કાળા તલ, સરસવનું તેલ દાન કરો અથવા શ્વાનને ભોજન આપો",
        "lifestyle": "રાત્રે મોબાઈલ/સ્ક્રીનનો ઉપયોગ ઓછો કરો; ઘરનો નૈઋત્ય (SW) ખૂણો ભારે અને સાફ રાખો; ભંગાર હટાવો",
        "fast": "શનિવારે હળવો આહાર લો; અમાસના દિવસે સૂકું નાળિયેર જળમાં પધરાવો"
      },
      "5": {
        "planet": "બુધ (Mercury / Budha)",
        "element": "પૃથ્વી",
        "traits": "વેપાર બુદ્ધિ, સંવાદ કૌશલ્ય, માર્કેટિંગ, ગણતરી, અનુકૂલન ક્ષમતા",
        "governs": [
          "વેપાર",
          "ધન",
          "કારકિર્દી"
        ],
        "weakSigns": "સંવાદમાં ગેરસમજ, વેપારમાં નુકસાન, એકાગ્રતાનો અભાવ, ચામડી કે વાણી સંબંધિત મુશ્કેલી",
        "day": "બુધવાર",
        "color": "લીલો, આછો લીલો, મિન્ટ",
        "metal": "કાંસું / ચાંદી",
        "crystal": "પન્ના (Emerald) અથવા ગ્રીન એવેન્ચ્યુરિન (Green Aventurine)",
        "rudraksha": "૪ મુખી રુદ્રાક્ષ (4 Mukhi Rudraksha)",
        "mantra": "ॐ બ્રાં બ્રીં બ્રૌં સઃ બુધાય નમઃ",
        "mantraCount": "દરરોજ સવારે ૧૦૮ વખત (કુલ સંકલ્પ: ૯,૦૦૦)",
        "charity": "બુધવારે મગની દાળ, લીલા શાકભાજી, ગાયને લીલું ઘાસ અથવા વિદ્યાર્થીઓને ચોપડા-પેન દાન કરો",
        "lifestyle": "બુધવારે લીલા વસ્ત્રો પહેરો; ટેબલ પર લીલા છોડ (જેમ કે મની પ્લાન્ટ) રાખો; મધુર વાણી બોલો",
        "fast": "બુધવારનો ઉપવાસ કરો; લીલા શાકભાજીનો આહાર લો"
      },
      "6": {
        "planet": "શુક્ર (Venus / Shukra)",
        "element": "જળ (રિફાઇન્ડ)",
        "traits": "પ્રેમ, સમૃદ્ધિ, આકર્ષણ, સુંદરતા, કલા, દાંપત્ય સુખ, વાહન અને વૈભવ",
        "governs": [
          "સંબંધ",
          "ધન"
        ],
        "weakSigns": "દાંપત્ય જીવનમાં તણાવ, સુખ-સગવડમાં ઘટાડો, આકર્ષણ ઓછું થવું, સર્જનાત્મકતા અટકવી",
        "day": "શુક્રવાર",
        "color": "સફેદ, ગુલાબી, ક્રીમ, આછો ચમકદાર",
        "metal": "ચાંદી / સફેદ સોનું",
        "crystal": "હીરો, સફેદ ઓપલ (Opal) અથવા રોઝ ક્વાર્ટ્ઝ (Rose Quartz)",
        "rudraksha": "૬ મુખી રુદ્રાક્ષ (6 Mukhi Rudraksha)",
        "mantra": "ॐ દ્રાં દ્રીં દ્રૌં સઃ શુક્રાય નમઃ",
        "mantraCount": "દરરોજ સવારે ૧૦૮ વખત (કુલ સંકલ્પ: ૧૬,૦૦૦)",
        "charity": "શુક્રવારે સફેદ મીઠાઈ, ખીર, ચોખા, દહીં, અત્તર કે સફેદ વસ્ત્રો કન્યાઓને દાન કરો",
        "lifestyle": "સ્વચ્છ અને સુગંધિત કપડાં પહેરો; ગુલાબનું અત્તર લગાવો; ઘરનો આગ્નેય (SE) ખૂણો સુંદર રાખો; સ્ત્રીઓનું સન્માન કરો",
        "fast": "શુક્રવારનો ઉપવાસ કરો; ખીરનો પ્રસાદ લો"
      },
      "7": {
        "planet": "કેતુ (Ketu)",
        "element": "અગ્નિ (છાયા)",
        "traits": "આધ્યાત્મિકતા, અંતર્જ્ઞાન, સંશોધન, ગૂઢ વિદ્યા, વૈરાગ્ય, ઊંડા વિચારો",
        "governs": [
          "સ્વાસ્થ્ય",
          "કારકિર્દી"
        ],
        "weakSigns": "દિશાહીન લાગવું, અજાણ્યો ડર, અચાનક નુકસાન, એકલતા, પેટ સંબંધિત સમસ્યા",
        "day": "મંગળવાર / શનિવાર",
        "color": "બહુરંગી (મલ્ટીકલર), કથ્થઈ, સ્મોકી",
        "metal": "પંચધાતુ / મિશ્ર ધાતુ",
        "crystal": "લહસુનિયા (Cat's Eye) અથવા ટાઈગર આઈ (Tiger's Eye)",
        "rudraksha": "૯ મુખી રુદ્રાક્ષ (9 Mukhi Rudraksha)",
        "mantra": "ॐ સ્રાં સ્રીં સ્રૌં સઃ કેતવે નમઃ",
        "mantraCount": "દરરોજ સૂર્યોદય પહેલાં ૧૦૮ વખત (કુલ સંકલ્પ: ૧૭,૦૦૦)",
        "charity": "શ્વાનને રોટલી ખવડાવો; બહુરંગી ધાબળા અથવા મંદિરમાં ત્રિકોણીય ધજા દાન કરો",
        "lifestyle": "દરરોજ ૧૦ મિનિટ શાંત બેસીને ધ્યાન કરો; ઘરમાં શાંત પૂજા સ્થાન બનાવો; દેખાડા વગર દાન કરો",
        "fast": "મંગળવાર કે શનિવારનો ઉપવાસ કરો; ગણેશજીની આરાધના કરો"
      },
      "8": {
        "planet": "શનિ (Saturn / Shani)",
        "element": "વાયુ",
        "traits": "પરિશ્રમ, શિસ્ત, ન્યાયપ્રિયતા, ધીરજ, સંગઠન, સ્થાયી સફળતા, દીર્ઘકાલીન દ્રષ્ટિ",
        "governs": [
          "કારકિર્દી",
          "વેપાર"
        ],
        "weakSigns": "કામમાં ખૂબ જ વિલંબ, મહેનતનું પૂરતું ફળ ન મળવું, સાંધા કે હાડકામાં દુખાવો, નકારાત્મક વિચારો",
        "day": "શનિવાર",
        "color": "ઘેરો વાદળી, કાળો, જાંબલી",
        "metal": "લોખંડ / ડાર્ક સ્ટીલ",
        "crystal": "નીલમ (નિષ્ણાત સલાહ બાદ), કથેઈ (Amethyst) અથવા લાજવર્ત (Lapis Lazuli)",
        "rudraksha": "૭ મુખી રુદ્રાક્ષ (7 Mukhi Rudraksha)",
        "mantra": "ॐ પ્રાં પ્રીં પ્રૌં સઃ શનૈશ્ચરાય નમઃ",
        "mantraCount": "દરરોજ સાંજના સમયે ૧૦૮ વખત (કુલ સંકલ્પ: ૨૩,૦૦૦)",
        "charity": "શનિવારે કાળા તલ, સરસવનું તેલ, પગરખાં, કાળો કાપડ અથવા ભોજન જરૂરિયાતમંદો/શ્રમિકોને દાન કરો",
        "lifestyle": "શ્રમિકોનો આદર કરો; સમયનું પાલન કરો; શનિવારે સાંજે પીપળાના વૃક્ષ નીચે સરસવના તેલનો દીવો પ્રગટાવો",
        "fast": "શનિવારનો ઉપવાસ કરો; સાંજે ખીચડી આરોગો"
      },
      "9": {
        "planet": "મંગળ (Mars / Mangal)",
        "element": "અગ્નિ",
        "traits": "સાહસ, પરાક્રમ, ઊર્જા, ત્વરિત નિર્ણયો, જમીન-મકાન, રક્ષણ, દ્રઢ સંકલ્પ",
        "governs": [
          "સ્વાસ્થ્ય",
          "ધન",
          "વેપાર"
        ],
        "weakSigns": "ઓછી ઊર્જા અથવા વધારે પડતો ક્રોધ, જમીન-મિલકતના વિવાદ, બ્લડ પ્રેશરની તકલીફ, દેવું વધવું",
        "day": "મંગળવાર",
        "color": "લાલ, સિંદૂરી, પરવાળા રંગ",
        "metal": "તાંબું",
        "crystal": "પરવાળું (Red Coral) અથવા કાર્નેલિયન (Carnelian)",
        "rudraksha": "૩ મુખી રુદ્રાક્ષ (3 Mukhi Rudraksha)",
        "mantra": "ॐ ક્રાં ક્રીં ક્રૌં સઃ ભૌમાય નમઃ",
        "mantraCount": "દરરોજ સૂર્યોદય સમયે ૧૦૮ વખત (કુલ સંકલ્પ: ૧૦,૦૦૦)",
        "charity": "મંગળવારે લાલ મસૂર દાળ, ગોળ, લાલ વસ્ત્ર કે તાંબાની વસ્તુનું દાન કરો",
        "lifestyle": "દરરોજ કસરત કરો; મંગળવારે હનુમાન ચાલીસાનો પાઠ કરો; ઘરની દક્ષિણ દિશા પ્રકાશિત રાખો",
        "fast": "મંગળવારનો ઉપવાસ કરો; ગોળ અને ઘઉંની વાનગી લો"
      }
    },
    "traits": {
      "1": {
        "nature": "જન્મજાત નેતા — સ્વતંત્ર, મૌલિક અને આત્મવિશ્વાસુ. તમે બીજાની પાછળ ચાલવા કરતાં આગળ વધીને શરૂઆત કરવાનું પસંદ કરો છો અને મુશ્કેલીઓમાંથી ઝડપથી બહાર આવી જાઓ છો.",
        "innerDrive": "સ્વતંત્ર ઓળખ બનાવવાની, નેતૃત્વ કરવાની અને પોતાના દમ પર ઊભા રહેવાની ઊંડી ઇચ્છા",
        "strengths": [
          "નેતૃત્વ ક્ષમતા અને ત્વરિત પહેલ",
          "દબાણમાં પણ આત્મવિશ્વાસ",
          "મૌલિક અને સ્વતંત્ર વિચાર",
          "દ્રઢ સંકલ્પ અને ઝડપી રિકવરી"
        ],
        "shadows": [
          "પડકાર મળવા પર અહંકાર કે જીદ",
          "બીજા પર પોતાની વાત થોપવી",
          "ધીમા લોકો પર જલ્દી અકળાtool જવું",
          "બધું કામ એકલા કરવાનો પ્રયાસ"
        ],
        "adopt": [
          "નિર્ણાયક કર્મ",
          "અહંકાર વિનાનો આત્મવિશ્વાસ",
          "સહકારની ભાવના",
          "જવાબદારી સ્વીકારવી"
        ],
        "release": [
          "બીજા પર નિયંત્રણ કરવાની ટેવ",
          "સતત વખાણની અપેક્ષા",
          "વિરોધ થવા પર ગુસ્સો",
          "એકલા બધો બોજ ઉપાડવો"
        ]
      },
      "2": {
        "nature": "સૌમ્ય, સંવેદનશીલ અને મુત્સદ્દી. તમે તે લાગણીઓને પારખી લો છો જેને બીજા અવગણે છે — તમે લોકોને જોડતી શાંત શક્તિ છો.",
        "innerDrive": "સાચો પ્રેમ, ભાવનાત્મક સુરક્ષા અને શાંતિપૂર્ણ વાતાવરણની ઊંડી ઇચ્છા",
        "strengths": [
          "સહાનુભૂતિ અને ભાવનાત્મક સમજ",
          "શાંતિ સ્થાપના અને સહકાર",
          "ધીરજ અને મધુર વ્યવહાર",
          "લોકોને પારખવાની આંતરિક સૂઝ"
        ],
        "shadows": [
          "ટીકાથી ઝડપથી આઘાત લાગવો",
          "મનમાં ચિંતાના વિચારો ચાલવા",
          "નિર્ણય લેતી વખતે પોતાના પર શંકા",
          "બીજા પર ભાવનાત્મક નિર્ભરતા"
        ],
        "adopt": [
          "શાંત દ્રઢતા",
          "સ્વસ્થ ભાગીદારી",
          "પોતાના અંતર્જ્ઞાન પર ભરોસો",
          "પોતાનું ધ્યાન રાખવું"
        ],
        "release": [
          "દરેક વાત મન પર લેવી",
          "બધાને ખુશ રાખવાની ટેવ",
          "નિર્ણયમાં ખચકાટ",
          "બીજાનો તણાવ પોતાના પર લેવો"
        ]
      },
      "3": {
        "nature": "હકારાત્મક, અભિવ્યક્ત અને બુદ્ધિશાળી. તમે મોટું વિચારો છો, કુદરતી રીતે શીખવો છો અને દરેક સભામાં ઉત્સાહ ભરી દો છો.",
        "innerDrive": "સતત જ્ઞાન વધારવાની, શીખવવાની અને પોતાના વિચારોનો વિસ્તાર કરવાની ઇચ્છા",
        "strengths": [
          "ઉત્તમ અભિવ્યક્તિ અને સંવાદ",
          "દૂરંદેશી અને મોટું વિચારવાની ક્ષમતા",
          "શિક્ષણ અને માર્ગદર્શન કૌશલ્ય",
          "ઉદારતા અને જીવંતતા"
        ],
        "shadows": [
          "એક સાથે ઘણા બધા કામોમાં વિખેરાઈ જવું",
          "અતિ-ઉત્સાહમાં વધુ પડતા વચનો આપવા",
          "વધારાના ખર્ચ પર નિયંત્રણ ન રહેવું",
          "સાંભળવા કરતાં માત્ર બોલવું"
        ],
        "adopt": [
          "શિસ્તબદ્ધ અભ્યાસ",
          "બીજાનું માર્ગદર્શન",
          "કૃતજ્ઞતાનો ભાવ",
          "શરૂ કરેલું કામ પૂરું કરવું"
        ],
        "release": [
          "ઉતાવળમાં અભિપ્રાય બાંધવો",
          "બિનજરૂરી ખર્ચ",
          "અધૂરા છોડેલા પ્રોજેક્ટ",
          "બીજાને ઓછા આંકવા"
        ]
      },
      "4": {
        "nature": "વ્યવહારુ, મહેનતુ અને આધુનિક વિચારસરણી ધરાવતા. તમે પરંપરાથી અલગ નવી પદ્ધતિઓ બનાવો છો અને જૂની સીમાઓ તોડવામાં માહેર છો.",
        "innerDrive": "કંઈક અલગ અને નક્કર નિર્માણ કરવાની તથા જૂની મર્યાદાઓ તોડવાની ચાહ",
        "strengths": [
          "આઉટ-ઓફ-ધ-બોક્સ વિચાર",
          "અથાક પરિશ્રમ અને સહનશક્તિ",
          "ટેકનોલોજી અને સિસ્ટમ બનાવવામાં નિપુણતા",
          "બદલાવ લાવવાની હિંમત"
        ],
        "shadows": [
          "બેચેની અને અચાનક નિર્ણયો",
          "પોતાના બનાવેલા નિયમોમાં વધુ કડક થવું",
          "બીજાના ઇરાદાઓ પર બિનજરૂરી શંકા",
          "બધું અથવા કંઈ નહીંનું વલણ"
        ],
        "adopt": [
          "વ્યવસ્થિત નવીનતા",
          "ધીરજપૂર્વક કામ આગળ ધપાવવું",
          "નાણાકીય સાવચેતી",
          "બદલાવને સ્વીકારવો"
        ],
        "release": [
          "હંમેશા ખરાબ પરિણામનો ડર",
          "બિનજરૂરી ગુપ્તતા",
          "ઉતાવળમાં જોખમ લેવું",
          "જીદ પકડવી"
        ]
      },
      "5": {
        "nature": "બહુમુખી, હાજરજવાબી અને ચપળ. તમે ઉત્કૃષ્ટ સંવાદક અને વેપારી સૂઝ ધરાવતી વ્યક્તિ છો — વિવિધતા, સ્વતંત્રતા અને ગતિશીલતા તમારી ઓળખ છે.",
        "innerDrive": "માનસિક અને શારીરિક સ્વતંત્રતા, નવી બાબતો શીખવાની અને ફરવાની ચાહ",
        "strengths": [
          "પ્રભાવશાળી સંવાદ અને વાતચીત",
          "કોઈપણ વાતાવરણમાં ભળી જવું",
          "તીવ્ર વેપાર સમજ અને ગણતરી",
          "મોટું નેટવર્ક અને મલ્ટીટાસ્કિંગ"
        ],
        "shadows": [
          "ચંચળતા અને સાતત્યનો અભાવ",
          "ધ્યાન ઝડપથી ભટકી જવું",
          "શરૂઆત કરવી પણ અંત સુધી ન પહોંચવું",
          "વધારે પડતો માનસિક તણાવ"
        ],
        "adopt": [
          "જિજ્ઞાસા સાથે કામ પૂરું કરવું",
          "સ્પષ્ટ અને સાચી વાણી",
          "નાણાકીય આયોજન કરવું",
          "વચનો પાળવા"
        ],
        "release": [
          "નકામી ગપશપ",
          "ધીમા લોકો પર ખીજાવું",
          "ઘણા કામ અધૂરા છોડવા",
          "દરેક નવી વસ્તુ પાછળ દોડવું"
        ]
      },
      "6": {
        "nature": "આકર્ષક, પ્રેમાળ અને જવાબદાર. સુંદરતા, પારિવારિક સુખ અને પ્રેમ તમારા માટે સર્વોપરી છે — તમારી સાથે લોકો સુરક્ષિત અને હુંફ અનુભવે છે.",
        "innerDrive": "પ્રેમ, સુંદરતા, પારિવારિક શાંતિ અને આનંદદાયક વાતાવરણની ઇચ્છા",
        "strengths": [
          "આકર્ષણ અને ચુંબકીય વ્યક્તિત્વ",
          "સંભાળ અને જવાબદારીની ભાવના",
          "સૌંદર્ય અને કલાની પરખ",
          "જૂથમાં એકતા જાળવવી"
        ],
        "shadows": [
          "પરફેક્શનના ચક્કરમાં કામમાં વિલંબ",
          "વધારે પડતો મોહ અને પઝેસિવનેસ",
          "વૈભવ પર વધુ ખર્ચ",
          "બીજાના અંગત મામલામાં દખલ"
        ],
        "adopt": [
          "બીજાની સાથે પોતાનું પણ ધ્યાન",
          "સ્વસ્થ સીમાઓ નક્કી કરવી",
          "દરરોજ સુંદરતાની કદર કરવી",
          "ઊંડું સમર્પણ"
        ],
        "release": [
          "અધિકાર જતાવવાની ભાવના",
          "દેખાડો કરવો",
          "બીજાનો બોજ માથે લેવો",
          "સુવિધાઓમાં આળસ"
        ]
      },
      "7": {
        "nature": "અંતર્મુખી, વિશ્લેષણાત્મક અને આધ્યાત્મિક. તમે સપાટીથી નીચે છુપાયેલા સત્યને શોધો છો — ઘોંઘાટથી દૂર ઊંડાણ અને એકાંત તમને ગમે છે.",
        "innerDrive": "સત્ય, જીવનના રહસ્યો અને આત્મજ્ઞાનને જાણવાની ઊંડી તરસ",
        "strengths": [
          "ઊંડું સંશોધન અને વિશ્લેષણાત્મક દ્રષ્ટિ",
          "મજબૂત અંતર્જ્ઞાન",
          "સ્વતંત્ર વિચારસરણી",
          "ગૂઢ જ્ઞાનની સમજ"
        ],
        "shadows": [
          "એકલતામાં સરી પડવું",
          "એટલું વિચારવું કે કામ અટકી જાય",
          "લોકો પર જલ્દી ભરોસો ન કરવો",
          "વ્યવહારુ જવાબદારીઓથી દૂર ભાગવું"
        ],
        "adopt": [
          "ઉદ્દેશ્યપૂર્ણ એકાંત",
          "પોતાના અંતર્જ્ઞાન પર વિશ્વાસ",
          "ઊંડો અને કેન્દ્રિત અભ્યાસ",
          "સરળ જીવનશૈલી"
        ],
        "release": [
          "પુરાવા વગર શંકા કરવી",
          "વધારે પડતો વિચાર (ઓવરથિંકિંગ)",
          "નિરાશાવાદી વિચાર",
          "દુઃખ થવા પર બધાથી અળગા થઈ જવું"
        ]
      },
      "8": {
        "nature": "શિસ્તબદ્ધ, ધીરજવાન અને ન્યાયપ્રિય. જીવન તમને વારંવાર પરખે છે — અને તે જ કઠિન અનુભવો તમને મજબૂત અને પ્રતિષ્ઠિત વ્યક્તિ બનાવે છે.",
        "innerDrive": "વ્યવસ્થા, ન્યાય અને એવા સ્થાયી પરિણામો ઊભા કરવાની ચાહ જે લાંબા સમય સુધી ટકી રહે",
        "strengths": [
          "કઠિન પરિશ્રમ અને સહનશીલતા",
          "મજબૂત સંગઠન અને સિસ્ટમ બનાવવી",
          "વફાદારી અને વિશ્વસનીયતા",
          "દીર્ઘકાલીન દ્રષ્ટિકોણ"
        ],
        "shadows": [
          "નિરાશા અને પોતાની વધુ પડતી ટીકા",
          "કડકાઈ",
          "મનની વાત અંદર જ દબાવી રાખવી",
          "માત્ર કામમાં જ ડૂબેલા રહેવું"
        ],
        "adopt": [
          "પ્રક્રિયા પર ભરોસો અને ધીરજ",
          "સિસ્ટમ આધારિત વિચાર",
          "ન્યાયપૂર્ણ વર્તન",
          "સતત નાના પ્રયાસો"
        ],
        "release": [
          "મનમાં જૂની કડવાશ રાખવી",
          "નિષ્ફળતાનો ડર",
          "આરામ ભૂલી જવો",
          "એકલા બધો બોજ ઉપાડવો"
        ]
      },
      "9": {
        "nature": "ઊર્જાવાન, સાહસી અને રક્ષક. તમે કર્મ અને એક્શન માટે બનેલા છો — તમે પોતાના સ્વજનોનું રક્ષણ કરો છો અને જેને બીજા છોડી દે છે તેને પૂરું કરો છો.",
        "innerDrive": "કર્મ કરવાની, બીજાનું રક્ષણ કરવાની અને વિજય મેળવવાની પ્રબળ ઇચ્છા",
        "strengths": [
          "સાહસ અને ત્વરિત નિર્ણયો",
          "અખૂટ ઊર્જા અને સ્ટેમિના",
          "કામને પૂર્ણાહુતિ સુધી પહોંચાડવું",
          "બીજાનો આધાર બનવું"
        ],
        "shadows": [
          "ક્રોધ અને ઉતાવળમાં પગલું ભરવું",
          "વિવાદમાં અહંકાર",
          "ઝીણી વિગતોની અવગણના",
          "અતિ-ઉત્સાહમાં થાકી જવું"
        ],
        "adopt": [
          "રમતગમત કે સેવામાં ઊર્જા લગાવવી",
          "ઝડપથી માફ કરી દેવું",
          "સાહસિક પહેલ",
          "શિસ્તબદ્ધ કર્મ"
        ],
        "release": [
          "જીતવા માટે દલીલબાજી",
          "બદલાની ભાવના",
          "વિચાર્યા વગર જોખમ",
          "લોકો પર ગુસ્સો ઉતારવો"
        ]
      }
    },
    "planes": [
      {
        "name": "માનસિક સ્તર (Mental Plane)",
        "zone": "લો-શુ ગ્રીડની સૌથી ઉપરની હરોળ (4 - 9 - 2)",
        "about": "આ સ્તર તમારી વિચારવાની શૈલી અને નિર્ણય શક્તિ દર્શાવે છે — તમે આયોજન કેવી રીતે કરો છો, મૂલ્યાંકન કેવી રીતે કરો છો અને વિચારને કાર્યમાં કેવી રીતે બદલો છો.",
        "roles": {
          "4": {
            "short": "આયોજન",
            "label": "આયોજન અને માળખું",
            "con": "વિચાર્યા વગર પગલું ભરવું, જેથી પછીથી ફેરફાર કરવા પડે",
            "fix": "દરેક મોટા નિર્ણય પહેલાં લક્ષ્ય, ખર્ચ અને ત્રણ મુખ્ય પગલાં કાગળ પર લખો"
          },
          "9": {
            "short": "નિર્ણય",
            "label": "ત્વરિત નિર્ણય અને આત્મવિશ્વાસ",
            "con": "યોગ્ય સમયે નિર્ણય લેવામાં ખચકાટ કે વિલંબ",
            "fix": "દૈનિક જીવનમાં નાના-નાના ઝડપી નિર્ણયો લઈને આત્મવિશ્વાસ વધારો"
          },
          "2": {
            "short": "ધીરજ",
            "label": "ધીરજપૂર્વક વાસ્તવિક મૂલ્યાંકન",
            "con": "હકીકતોને બદલે લાગણીમાં વહીને નિર્ણય લેવો",
            "fix": "નિર્ણય લેતાં પહેલાં થોડું થોભો અને કોઈ અનુભવી વ્યક્તિની સલાહ લો"
          }
        },
        "complete": "આયોજન, આત્મવિશ્વાસ અને વાસ્તવિક વિચાર ત્રણેય મળીને સ્પષ્ટ રણનીતિ અને ઉત્તમ નેતૃત્વ ક્ષમતા આપે છે. અતિ-વિશ્લેષણથી બચો અને નિર્ણય લો."
      },
      {
        "name": "ભાવનાત્મક સ્તર (Emotional Plane)",
        "zone": "લો-શુ ગ્રીડની મધ્ય હરોળ (3 - 5 - 7)",
        "about": "આ સ્તર તમારી લાગણીઓ, સંવેદનશીલતા અને સંબંધો સંભાળવાની રીત દર્શાવે છે — તમારી લાગણીઓ વ્યવહારમાં કેવી રીતે ઉતરે છે.",
        "roles": {
          "3": {
            "short": "અભિવ્યક્તિ",
            "label": "લાગણીઓની ખુલ્લી અભિવ્યક્તિ",
            "con": "મનની વાત દબાવી રાખવી, જેથી અંદર કડવાશ વધે",
            "fix": "પોતાની વાત ખુલ્લેઆમ અને શાંતિથી કહેવાની ટેવ પાડો"
          },
          "5": {
            "short": "સંતુલન",
            "label": "ભાવનાત્મક સ્થિરતા",
            "con": "દબાણમાં લાગણીઓ ઝડપથી ડગમગી જવી",
            "fix": "પ્રાણાયામ, ડાયરી લખવી કે ધ્યાન દ્વારા મનને શાંત રાખો"
          },
          "7": {
            "short": "સીમાઓ",
            "label": "સ્વસ્થ સીમાઓ નક્કી કરવી",
            "con": "બીજાની સમસ્યાઓ અને તણાવ પોતાના માથે ઓઢી લેવો",
            "fix": "શાંત રહીને સ્પષ્ટ સીમાઓ નક્કી કરો કે શું સ્વીકાર્ય છે અને શું નહીં"
          }
        },
        "complete": "લાગણીઓ સ્પષ્ટ શબ્દોમાં વહે છે, તમે બીજાને સારી રીતે સમજો છો અને સંબંધોમાં હુંફ તથા મર્યાદા બંને જાળવી રાખો છો."
      },
      {
        "name": "વ્યવહારિક સ્તર (Practical Plane)",
        "zone": "લો-શુ ગ્રીડની સૌથી નીચેની હરોળ (8 - 1 - 6)",
        "about": "આ સ્તર તમારા ભૌતિક જીવન, નાણાં વ્યવસ્થાપન, કાર્ય પરિણામો અને વાસ્તવિક સફળતા દર્શાવે છે — આવડતને પરિણામમાં બદલવાનું સ્તર.",
        "roles": {
          "8": {
            "short": "સાધન વ્યવસ્થા",
            "label": "જવાબદારી અને સાધન વ્યવસ્થા",
            "con": "મહેનત પછી પણ ધન કે પરિણામ હાથમાં ન બચવું",
            "fix": "બજેટ, ચેકલિસ્ટ અને સમયમર્યાદા બનાવીને કામ પૂરું કરો"
          },
          "1": {
            "short": "માલિકી",
            "label": "વ્યક્તિગત પહેલ અને માલિકીભાવ",
            "con": "બીજાના નિર્દેશની રાહ જોવી, જાતે આગળ ન વધવું",
            "fix": "એક સમયે એક મુખ્ય કામની પૂરી જવાબદારી જાતે લો"
          },
          "6": {
            "short": "ગુણવત્તા",
            "label": "ઉત્કૃષ્ટ ફિનિશિંગ અને ગુણવત્તા",
            "con": "ઉતાવળમાં અધૂરું કામ રજૂ કરવું",
            "fix": "શરૂઆત પહેલાં ફિનિશિંગનું સ્તર નક્કી કરો અને તે મુજબ જ કામ કરો"
          }
        },
        "complete": "સંસાધન, જવાબદારી અને ઉત્તમ ફિનિશિંગ મળીને વેપાર, નોકરી, મિલકત અને નાણાં વ્યવસ્થાપનમાં નક્કર પરિણામ આપે છે."
      },
      {
        "name": "વિચાર સ્તર (Thought Plane)",
        "zone": "લો-શુ ગ્રીડનો ડાબો સ્તંભ (4 - 3 - 8)",
        "about": "આ સ્તર ઊંડો વિચાર, શીખવાની ધગશ અને જ્ઞાનના સંયોજનને દર્શાવે છે — વિચારોને ઉપયોગી રણનીતિમાં બદલવાની ક્ષમતા.",
        "roles": {
          "4": {
            "short": "વિચારો",
            "label": "નવા વિચારોનું સર્જન",
            "con": "જૂના ઢાંચામાં રહેવું અને નવી રણનીતિ ન વિચારવી",
            "fix": "જ્યારે પણ નવો વિચાર આવે, તરત જ ડાયરીમાં નોંધી લો"
          },
          "3": {
            "short": "અભ્યાસ",
            "label": "જ્ઞાન અને કૌશલ્ય વિકાસ",
            "con": "શીખવાનું બંધ થઈ જવાથી પ્રગતિ અટકવી",
            "fix": "દર અઠવાડિયે કંઈક નવું શીખો — પુસ્તક, કોર્સ કે અનુભવી સાથે ચર્ચા"
          },
          "8": {
            "short": "ઊંડાણ",
            "label": "માનસિક સહનશક્તિ અને ઊંડાણ",
            "con": "સફળતા મળવાની તૈયારી હોય ત્યારે જ કામ છોડી દેવું",
            "fix": "નિયમિત સમીક્ષા કરો અને મહેનત સાચી દિશામાં લગાવો"
          }
        },
        "complete": "વિચાર, જ્ઞાન અને ઊંડાણ મળીને તમને જટિલ વિષયોના નિષ્ણાત અને શ્રેષ્ઠ રણનીતિકાર બનાવે છે."
      },
      {
        "name": "ઇચ્છાશક્તિ સ્તર (Will Plane)",
        "zone": "લો-શુ ગ્રીડનો મધ્ય સ્તંભ (9 - 5 - 1)",
        "about": "આ સ્તર તમારી આંતરિક મનોબળ, દબાણમાં ટકી રહેવાની ક્ષમતા અને મુશ્કેલ સંજોગોમાં આગળ વધવાના સંકલ્પને દર્શાવે છે.",
        "roles": {
          "9": {
            "short": "ઊર્જા",
            "label": "કાર્ય કરવાનો ઉત્સાહ અને ઊર્જા",
            "con": "ઇરાદા મજબૂત હોવા છતાં અડચણ આવતાં જ હિંમત હારી જવી",
            "fix": "કસરત કે રમતગમતથી તમારી આંતરિક શક્તિ અને ઊર્જા વધારો"
          },
          "5": {
            "short": "સ્થિરતા",
            "label": "સ્થિરતા અને પરિવર્તનક્ષમતા",
            "con": "સંજોગો બદલાતાં જ પ્રેરણા નબળી પડવી",
            "fix": "દૈનિક દિનચર્યા બનાવો જે બદલાવના સમયે પણ તમને સ્થિર રાખે"
          },
          "1": {
            "short": "લક્ષ્ય",
            "label": "આત્મવિશ્વાસ અને દિશા",
            "con": "બીજાના અભિપ્રાય કે બીજાના બનાવેલા લક્ષ્યો પર નિર્ભર રહેવું",
            "fix": "પોતાના લક્ષ્યો જાતે લખો અને તેના પર અડગ રહો"
          }
        },
        "complete": "તમે પૂરા જોશથી શરૂઆત કરો છો, ધીરજથી આગળ વધો છો અને લક્ષ્ય પ્રાપ્ત કરીને જ જંપો છો — આ વેપાર અને નેતૃત્વ માટે ઉત્તમ છે."
      },
      {
        "name": "કર્મ સ્તર (Action Plane)",
        "zone": "લો-શુ ગ્રીડનો જમણો સ્તંભ (2 - 7 - 6)",
        "about": "આ સ્તર વિચારોને શિસ્તબદ્ધ કર્મમાં બદલવાની, કામ પૂરું કરવાની અને અંતિમ પરિણામ મેળવવાની ક્ષમતા દર્શાવે છે.",
        "roles": {
          "2": {
            "short": "ધીરજ",
            "label": "કર્મમાં ધીરજ અને વાસ્તવિકતા",
            "con": "વધારે પડતા સુધારાના ચક્કરમાં કામ રોકી રાખવું",
            "fix": "વ્યવહારુ સમયમર્યાદા નક્કી કરો અને સમયસર કામ પૂરું કરો"
          },
          "7": {
            "short": "મર્યાદા",
            "label": "ધોરણો અને કાર્ય સીમાઓ",
            "con": "સીમાઓ વગર કામ ફેલાતું જવું",
            "fix": "સ્પષ્ટ નિયમ બનાવો કે ક્યારે સુધારો રોકવો અને કામ સોંપવું"
          },
          "6": {
            "short": "પૂર્ણતા",
            "label": "કાર્યની પૂર્ણતા અને ફિનિશિંગ",
            "con": "ઘણા બધા કામ શરૂ કરવા પણ પૂરા ઓછા કરવા",
            "fix": "નવું કામ શરૂ કરતાં પહેલાં જૂનું કામ સંપૂર્ણ પૂરું કરો"
          }
        },
        "complete": "ઇરાદાઓ નક્કર કર્મમાં બદલાય છે — ધીરજ, ધોરણો અને ગુણવત્તા મળીને તમને સમયસર કામ પૂરું કરનાર વિશ્વસનીય વ્યક્તિ બનાવે છે."
      },
      {
        "name": "સુવર્ણ રાજયોગ (Golden Rajyoga)",
        "zone": "લો-શુ ગ્રીડનો મુખ્ય કર્ણ (4 – 5 – 6)",
        "about": "આ તકમાંથી સમૃદ્ધિ બનાવવાનો યોગ છે — નવી તકોને ઓળખવી, તેને વ્યવસ્થિત કરવી અને તેમાંથી ધન તથા માન-સન્માન મેળવવું.",
        "roles": {
          "4": {
            "short": "તક",
            "label": "નવી તકોની ઓળખ",
            "con": "જૂની પદ્ધતિઓમાં રહેવું અને નવી તકો ન જોઈ શકવી",
            "fix": "બજાર, નવી ટેકનોલોજી અને ગ્રાહકોની બદલાતી જરૂરિયાતો પર નજર રાખો"
          },
          "5": {
            "short": "વ્યવસ્થા",
            "label": "તકોને વ્યવસ્થિત કરવી",
            "con": "તક હાથમાં આવવી પણ આયોજનના અભાવે નકામી જવી",
            "fix": "દરેક તકની સમયમર્યાદા અને આયોજન નક્કી કરો"
          },
          "6": {
            "short": "મૂલ્યવૃદ્ધિ",
            "label": "કામને આકર્ષક અને મૂલ્યવાન બનાવવું",
            "con": "સારા કામને સાધારણ રીતે રજૂ કરવું",
            "fix": "પ્રસ્તુતિ અને પેકેજિંગ સુધારો જેથી પૂરેપૂરું મૂલ્ય મળે"
          }
        },
        "complete": "તક ઓળખવી, વ્યવસ્થિત કરવી અને પ્રીમિયમ વેલ્યુ બનાવવી — આ વેપાર, ધન લાભ, બ્રાન્ડિંગ અને કારકિર્દીમાં જબરદસ્ત સફળતા આપે છે."
      },
      {
        "name": "રજત રાજયોગ (Silver Rajyoga)",
        "zone": "લો-શુ ગ્રીડનો બીજો કર્ણ (8 – 5 – 2)",
        "about": "આ મિલકત, જમીન, બચત અને દીર્ઘકાલીન ભૌતિક સ્થિરતાનો યોગ છે — ધીમે ધીમે મજબૂત નાણાકીય પાયો ઊભો કરવો.",
        "roles": {
          "8": {
            "short": "મિલકત",
            "label": "મિલકત અને સાધન માળખું",
            "con": "કાનૂની કે નાણાકીય આયોજન વગર સાધનો રાખવા",
            "fix": "મિલકત, વીમો અને બચતના દસ્તાવેજો વ્યવસ્થિત રાખો"
          },
          "5": {
            "short": "સંચાલન",
            "label": "સંતુલિત નાણાકીય સંચાલન",
            "con": "આયોજન વગર જ્યારે મન થાય ત્યારે પૈસા ખર્ચવા",
            "fix": "દર મહિને એક નક્કી દિવસે આવક-ખર્ચ અને બચતની સમીક્ષા કરો"
          },
          "2": {
            "short": "ધીરજ",
            "label": "ધીરજ અને સાતત્ય",
            "con": "ઉતાવળ કે દબાણમાં આવીને મિલકતના ખોટા નિર્ણયો લેવા",
            "fix": "રોકાણને પાકવાનો સમય આપો — ધીરજથી સંપત્તિ વધે છે"
          }
        },
        "complete": "મિલકતની સૂઝ, સંતુલિત સંચાલન અને ધીરજ મળીને સ્થાયી આર્થિક સુરક્ષા આપે છે — જમીન, મકાન અને બચત તમારા હાથમાં ખૂબ ફળે છે."
      }
    ],
    "arrows": [
      {
        "name": "આયોજનનું તીર (Arrow of Planning)",
        "axis": "ઉપરની હરોળ (4-9-2)",
        "present": "તમે વિચાર્યા વગર પગલું નથી ભરતા — આયોજન કરો છો, ફાયદા-નુકસાન તૌલો છો અને સ્પષ્ટ રણનીતિથી ચાલો છો.",
        "missing": "મૂંઝવણનું તીર (Arrow of Confusion) — નિર્ણયો ઉતાવળમાં કે ખૂબ મોડા આવે છે. લેખિત આયોજન અને ચેકલિસ્ટ અપનાવો."
      },
      {
        "name": "લાગણીઓનું તીર (Arrow of Emotions)",
        "axis": "મધ્ય હરોળ (3-5-7)",
        "present": "તમે ઊંડાણપૂર્વક અનુભવો છો અને ખુલીને વ્યક્ત કરો છો — સંવેદનશીલતા અને અંતર્જ્ઞાન તમને લોકોના પ્રિય બનાવે છે.",
        "missing": "ભાવનાત્મક બેચેનીનું તીર — લાગણીઓ અંદર ઘૂંટાય છે કે દબાણમાં વહી જાય છે. દૈનિક અભિવ્યક્તિ અને ધ્યાનનો અભ્યાસ કરો."
      },
      {
        "name": "વ્યવહારિકતાનું તીર (Arrow of Practicality)",
        "axis": "નીચેની હરોળ (8-1-6)",
        "present": "તમે વિચારોને નક્કર પરિણામોમાં બદલો છો — ધન, કર્મ અને કામ પૂરું કરવું તમારા સ્વભાવમાં છે.",
        "missing": "નિરાશાનું તીર — મહેનત પછી પણ પરિણામ હાથ લાગતું નથી. ચેકલિસ્ટ અને સમયમર્યાદાનું કડક પાલન કરો."
      },
      {
        "name": "બુદ્ધિનું તીર (Arrow of Intellect)",
        "axis": "ડાબો સ્તંભ (4-3-8)",
        "present": "ઊંડી વિશ્લેષણાત્મક બુદ્ધિ — તમે ઊંડાણપૂર્વક શીખો છો, બાબતોને જોડો છો અને જટિલ વિષયોમાં નિપુણ બનો છો.",
        "missing": "છીછરી વિચારસરણીનું તીર — શીખવાનું અટકી જાય છે. દર અઠવાડિયે સારા પુસ્તકો વાંચો કે ગુરુઓ પાસેથી શીખો."
      },
      {
        "name": "દ્રઢ સંકલ્પનું તીર (Arrow of Determination)",
        "axis": "મધ્ય સ્તંભ (9-5-1)",
        "present": "દ્રઢ મનોબળ અને આત્મવિશ્વાસ સાથે અડચણો પાર કરો છો — જે શરૂ કરો છો તે પૂરું કરો છો.",
        "missing": "ડગમગતી ઇચ્છાશક્તિનું તીર — પ્રેરણા મોજાંની જેમ આવે-જાય છે. નક્કી દિનચર્યા અને કસરતથી જાતને શિસ્તબદ્ધ કરો."
      },
      {
        "name": "કર્મનું તીર (Arrow of Activity)",
        "axis": "જમણો સ્તંભ (2-7-6)",
        "present": "ધીરજ, ધોરણો અને સમર્પણ મળીને તમને દરેક કામ સમયસર અને સફાઈથી પૂરું કરનાર બનાવે છે.",
        "missing": "અધૂરા કામનું તીર — ઘણા કામ શરૂ થાય છે, પૂરા ઓછા. પહેલાં 'સમાપ્તિ' નક્કી કરો પછી જ શરૂ કરો."
      },
      {
        "name": "સમૃદ્ધિનું તીર (Arrow of Prosperity)",
        "axis": "કર્ણ (4-5-6)",
        "present": "તક, વ્યવસ્થા અને આકર્ષણ મળીને તમને ધન, વેપાર અને માન-સન્માન અપાવે છે.",
        "missing": "તકો હાથમાંથી સરકી જાય છે. બજાર પર નજર રાખો અને દરેક કામને વ્યવસ્થિત કરો."
      },
      {
        "name": "શાંતિ અને સ્થિરતાનું તીર (Arrow of Spirituality / Stability)",
        "axis": "કર્ણ (8-5-2)",
        "present": "આંતરિક શાંતિ અને ધીરજ — તમે તણાવમાં પણ સ્થિર રહો છો અને ધીમે ધીમે કાયમી સંપત્તિ બનાવો છો.",
        "missing": "ધન અને મિલકત બાબતે બેચેની. રોકાણને સમય આપો અને માસિક બજેટ બનાવો."
      }
    ],
    "missingFix": {
      "1": "સૂર્યને બળવાન બનાવો: દરરોજ સવારે તાંબાના લોટાથી સૂર્યને જળ ચડાવો; પૂર્વ દિશામાં તાંબાનું સૂર્ય પ્રતીક લગાવો.",
      "2": "ચંદ્રને બળવાન બનાવો: ચાંદીનું કડું કે ગ્લાસ વાપરો; વાયવ્ય (NW) દિશા સ્વચ્છ રાખો; માતાના આશીર્વાદ લો.",
      "3": "ગુરુને બળવાન બનાવો: ગુરુવારે પીળા વસ્ત્રો પહેરો; ઇશાન (NE) ખૂણો સ્વચ્છ અને પવિત્ર રાખો; હળદરનો ચાંદલો કરો.",
      "4": "રાહુને સંતુલિત કરો: નૈઋત્ય (SW) ખૂણો સાફ અને ભારે રાખો; શનિવારે દાન કરો; રાત્રે સ્ક્રીન સમય ઘટાડો.",
      "5": "બુધને બળવાન બનાવો: ઉત્તર દિશા કે ટેબલ પર લીલા છોડ (મની પ્લાન્ટ) રાખો; મધુર બોલો; બુધવારે લીલો રંગ પહેરો.",
      "6": "શુક્રને બળવાન બનાવો: આગ્નેય (SE) ખૂણો સુંદર રાખો; સુગંધિત અત્તર લગાવો; શુક્રવારે સફેદ/પેસ્ટલ વસ્ત્રો પહેરો.",
      "7": "કેતુને સંતુલિત કરો: ઘરમાં ધ્યાનનો શાંત ખૂણો બનાવો; અબોલ શ્વાનને રોટલી આપો; નિયમિત ધ્યાન કરો.",
      "8": "શનિને બળવાન બનાવો: શનિવારે જરૂરિયાતમંદોની સેવા કરો; પશ્ચિમ દિશા સાફ રાખો; સમયપાલન કરો.",
      "9": "મંગળને બળવાન બનાવો: નિયમિત કસરત કરો; દક્ષિણ દિશા પ્રકાશિત રાખો; મંગળવારે હનુમાન ચાલીસા વાંચો."
    },
    "watch": {
      "metal": {
        "1": "સોનાનો રંગ અથવા ગોલ્ડ-ટોન સ્ટેનલેસ સ્ટીલ",
        "2": "સિલ્વર સ્ટેનલેસ સ્ટીલ (શુદ્ધ ચાંદીનો ટોન)",
        "3": "ગોલ્ડ અથવા પિત્તળ (Brass) ટોન મેટલ",
        "4": "ડાર્ક ગનમેટલ અથવા ડ્યુઅલ-ટોન મિશ્ર ધાતુ",
        "5": "સિલ્વર સ્ટીલ અથવા લીલા શેડ સાથે મેટલ",
        "6": "રોઝ ગોલ્ડ, વ્હાઇટ ગોલ્ડ અથવા ચમકદાર સિલ્વર",
        "7": "પંચધાતુ અથવા ડ્યુઅલ-ટોન મેટલ",
        "8": "ડાર્ક સ્ટીલ, બ્લેક મેટલ અથવા મજબૂત સ્ટીલ",
        "9": "કોપર-ટોન (તાંબાનો રંગ) અથવા રેડ એક્સેન્ટ મેટલ"
      },
      "dial": {
        "1": "શેમ્પેન, ગોલ્ડ અથવા વ્હાઇટ સનરે ડાયલ",
        "2": "સફેદ, સિલ્વર અથવા મોતી (Mother-of-pearl) ડાયલ",
        "3": "ક્રીમ, હાથીદાંત (Ivory) અથવા શેમ્પેન ડાયલ",
        "4": "સ્મોકી ગ્રે, ચારકોલ અથવા ઘેરો વાદળી ડાયલ",
        "5": "આછો લીલો, આઈસ-બ્લુ અથવા ટીલ ડાયલ",
        "6": "સફેદ, ગુલાબી, રોઝ-ટેક્ષ્ચર અથવા ચમકદાર ડાયલ",
        "7": "અર્થ-ટોન, કથ્થઈ અથવા ગ્રેડિયન્ટ ડાયલ",
        "8": "ઘેરો વાદળી કે કાળો ડાયલ સ્વચ્છ અંકો સાથે",
        "9": "લાલ એક્સેન્ટ, સિંદૂરી અથવા ઘેરો મરૂન ડાયલ"
      },
      "geometry": {
        "1": "સ્વચ્છ માર્કર વાળો ગોળ ડાયલ",
        "2": "સોફ્ટ કર્વ્સ વાળો ગોળ ડાયલ (તીક્ષ્ણ ખૂણાથી બચો)",
        "3": "ગોળ અથવા કુશન શેપ ડાયલ",
        "4": "ચોરસ (Square), લંબચોરસ કે આધુનિક શેપ",
        "5": "સ્લિમ ગોળ ડાયલ; ડે-ડેટ વિન્ડો વાળો",
        "6": "એલિગન્ટ ગોળ અથવા અંડાકાર (Oval) ડાયલ",
        "7": "સાદો અને શાંત ડાયલ",
        "8": "અષ્ટકોણીય (8-sided) અથવા મજબૂત ચોરસ કેસ",
        "9": "બોલ્ડ અને સ્પોર્ટી ગોળ કેસ"
      },
      "features": {
        "1": "સરળ ત્રણ કાંટા વાળો ડિસ્પ્લે — નેતૃત્વમાં સ્પષ્ટતા",
        "2": "શાંત એનાલોગ; વારંવાર નોટિફિકેશન વાળી સ્માર્ટવોચથી બચો",
        "3": "ક્લાસિક એનાલોગ તારીખ સાથે; ડિજિટલ ગૂંચવણથી બચો",
        "4": "ક્રોનોગ્રાફ અથવા આધુનિક ફીચર્સ સ્વીકાર્ય",
        "5": "ડે-ડેટ (વાર અને તારીખ) વાળી ઘડિયાળ (બુધ + સ્થિરતા)",
        "6": "સ્લિમ ડ્રેસ પ્રોફાઇલ; ક્રિસ્ટલ કે ચમકદાર ડિઝાઇન અનુકૂળ",
        "7": "સરળ અને શાંત ડાયલ, ઓછી જટિલતાઓ",
        "8": "શિસ્ત અને ટ્રેકિંગ માટે ડે-ડેટ ડિસ્પ્લે; મજબૂત મેટલ બ્રેસલેટ",
        "9": "મજબૂત બનાવટ; રોટેટિંગ બેઝલ અથવા સ્પોર્ટ્સ ફીચર્સ"
      },
      "strap": {
        "1": "ગોલ્ડ-ટોન મેટલ બ્રેસલેટ",
        "2": "સિલ્વર મેટલ મેશ કે લિંક બ્રેસલેટ — ધાતુ મનને સ્થિર રાખે છે",
        "3": "ટેન/બ્રાઉન લેધર અથવા ગોલ્ડ-ટોન બ્રેસલેટ",
        "4": "સિલિકોનને બદલે મેટલ બ્રેસલેટને પ્રાથમિકતા આપો",
        "5": "સ્ટીલ બ્રેસલેટ અથવા લીલો લેધર સ્ટ્રેપ",
        "6": "મેટલ લિંક બ્રેસલેટ; રબરથી બચો",
        "7": "લેધર અથવા મિક્સ્ડ-મેટલ બ્રેસલેટ",
        "8": "મજબૂત મલ્ટી-લિંક સ્ટીલ બ્રેસલેટ",
        "9": "કોપર-ટોન બ્રેસલેટ અથવા લાલ/કથ્થઈ લેધર"
      },
      "avoid": {
        "1": "ખૂબ ઘેરા કે પૂરા કાળા ડાયલ વાળી ઘડિયાળો",
        "2": "સતત નોટિફિકેશન વાળી સ્માર્ટવોચ (રાહુનો અવાજ ચંદ્રને અશાંત કરે છે)",
        "5": "વધારે પડતી ભીડભાડ વાળા ડાયલ જે બુધની એકાગ્રતા ભટકાવે છે",
        "8": "સસ્તી પ્લાસ્ટિક ઘડિયાળો — શનિના અનુશાસનને નબળું પાડે છે"
      }
    },
    "crystals": {
      "Ruby": {
        "chakra": "મૂળાધાર અને અનાહત (Root / Heart)",
        "benefits": "આત્મવિશ્વાસ, માન-સન્માન, નેતૃત્વ ક્ષમતા અને શારીરિક ઊર્જા વધારે છે",
        "pair": "પન્ના (Emerald) અથવા મોતી (Pearl)"
      },
      "Pearl": {
        "chakra": "સ્વાધિષ્ઠાન અને અનાહત (Sacral / Heart)",
        "benefits": "મનની શાંતિ, તણાવ મુક્તિ, ભાવનાત્મક સંતુલન અને સારી ઊંઘ આપે છે",
        "pair": "મૂનસ્ટોન અથવા ચાંદી"
      },
      "Emerald": {
        "chakra": "અનાહત અને વિશુદ્ધ (Heart / Throat)",
        "benefits": "વેપારી બુદ્ધિ, વાણીમાં પ્રભાવ, યાદશક્તિ અને ધન લાભ વધારે છે",
        "pair": "હીરો, સફેદ ઝરકન અથવા ગ્રીન એવેન્ચ્યુરિન"
      },
      "Yellow Sapphire": {
        "chakra": "મણિપુર અને આજ્ઞા (Solar Plexus / Third Eye)",
        "benefits": "જ્ઞાન, સમૃદ્ધિ, ભાગ્ય વૃદ્ધિ, સંતાન સુખ અને મોટું સન્માન અપાવે છે",
        "pair": "સિટ્રીન અથવા સોનું/પિત્તળ"
      },
      "Diamond": {
        "chakra": "અનાહત અને સહસ્રાર (Heart / Crown)",
        "benefits": "આકર્ષણ, દાંપત્ય સુખ, વૈભવ, કલા અને સર્જનાત્મકતા વધારે છે",
        "pair": "રોઝ ક્વાર્ટ્ઝ અથવા ચાંદી"
      },
      "Blue Sapphire": {
        "chakra": "આજ્ઞા અને સહસ્રાર (Third Eye / Crown)",
        "benefits": "કઠિન મહેનતનું ફળ, ન્યાય, શિસ્ત, એકાગ્રતા અને સુરક્ષા આપે છે",
        "pair": "ક્લિયર ક્વાર્ટ્ઝ અથવા એમેથિસ્ટ"
      },
      "Hessonite": {
        "chakra": "મૂળાધાર (Root Chakra)",
        "benefits": "માનસિક મૂંઝવણ દૂર કરે છે, અચાનક સફળતા અને વિદેશી સંપર્કોમાં લાભ કરાવે છે",
        "pair": "સ્મોકી ક્વાર્ટ્ઝ"
      },
      "Cat's Eye": {
        "chakra": "આજ્ઞા અને મૂળાધાર (Third Eye / Root)",
        "benefits": "ઊંડું અંતર્જ્ઞાન, આધ્યાત્મિક જાગૃતિ અને ખરાબ નજરથી રક્ષણ આપે છે",
        "pair": "ટાઈગર આઈ"
      },
      "Red Coral": {
        "chakra": "મૂળાધાર (Root Chakra)",
        "benefits": "સાહસ, નીડરતા, જમીન-મકાન લાભ, રક્ત સંચાર અને ઊર્જા વધારે છે",
        "pair": "રેડ જેસ્પર અથવા કાર્નેલિયન"
      },
      "Red Aventurine": {
        "chakra": "મૂળાધાર અને સ્વાધિષ્ઠાન",
        "benefits": "કાર્ય કરવાનો ઉત્સાહ, સ્ફૂર્તિ અને આત્મવિશ્વાસ જગાડે છે",
        "pair": "ક્લિયર ક્વાર્ટ્ઝ અથવા કાર્નેલિયન"
      },
      "Citrine": {
        "chakra": "મણિપુર ચક્ર (Solar Plexus)",
        "benefits": "વેપારમાં ધન લાભ, આશાવાદ અને સફળતાને આકર્ષિત કરે છે",
        "pair": "ગ્રીન એવેન્ચ્યુરિન અથવા પોખરાજ"
      },
      "Rose Quartz": {
        "chakra": "અનાહત ચક્ર (Heart Chakra)",
        "benefits": "સંબંધોમાં મધુરતા, પ્રેમ, આત્મ-સન્માન અને ભાવનાત્મક શાંતિ લાવે છે",
        "pair": "ક્લિયર ક્વાર્ટ્ઝ અથવા એમેથિસ્ટ"
      },
      "Amethyst": {
        "chakra": "સહસ્રાર અને આજ્ઞા (Crown / Third Eye)",
        "benefits": "તણાવ મુક્તિ, ઊંડી શાંતિ, અનિદ્રામાંથી રાહત અને ખરાબ આદતોમાંથી મુક્તિ",
        "pair": "રોઝ ક્વાર્ટ્ઝ અથવા મૂનસ્ટોન"
      },
      "Clear Quartz": {
        "chakra": "બધા ચક્રોને સંતુલિત કરે છે",
        "benefits": "ઊર્જાને અનેક ગણી વધારે છે અને મનને પૂર્ણ સ્પષ્ટતા આપે છે",
        "pair": "કોઈપણ રત્ન સાથે પહેરી શકાય છે"
      },
      "Selenite": {
        "chakra": "સહસ્રાર (Crown Chakra)",
        "benefits": "રત્નોને કુદરતી રીતે શુદ્ધ અને ચાર્જ કરે છે",
        "pair": "બધા ક્રિસ્ટલ્સ માટે આદર્શ ક્લીન્ઝર"
      },
      "5 Mukhi Rudraksha": {
        "chakra": "વિશુદ્ધ ચક્ર (Throat Chakra)",
        "benefits": "સ્વાસ્થ્ય રક્ષા, માનસિક શાંતિ, બ્લડ પ્રેશર નિયંત્રણ અને આધ્યાત્મિક રક્ષણ",
        "pair": "સિટ્રીન, પોખરાજ અથવા સ્ફટિક"
      }
    },
    "seleniteRitual": "સેલેનાઇટ પ્લેટ કે બાઉલ પર તમારા બધા ક્રિસ્ટલ્સને રાતભર રાખો — તે પાણી કે મીઠા વગર તેમને સંપૂર્ણ શુદ્ધ અને ઊર્જાવાન બનાવી દે છે.",
    "dayWear": [
      {
        "day": "સોમવાર",
        "num": 2,
        "colors": "સફેદ, ચાંદી, ક્રીમ અથવા આછો ગ્રે",
        "note": "ચંદ્રનો વાર — મનને શાંત અને એકાગ્ર કરતા રંગો"
      },
      {
        "day": "મંગળવાર",
        "num": 9,
        "colors": "લાલ, સિંદૂરી, પરવાળા રંગ કે મરૂન",
        "note": "મંગળનો વાર — ઊર્જા અને સાહસ વધારતા રંગો"
      },
      {
        "day": "બુધવાર",
        "num": 5,
        "colors": "લીલો, આછો લીલો, મિન્ટ કે ફિરોઝી",
        "note": "બુધનો વાર — સંવાદ અને વેપારમાં સફળતા આપતા રંગો"
      },
      {
        "day": "ગુરુવાર",
        "num": 3,
        "colors": "પીળો, રાઈ પીળો કે સોનેરી",
        "note": "ગુરુનો વાર — જ્ઞાન, ધન અને શુભતા આકર્ષતા રંગો"
      },
      {
        "day": "શુક્રવાર",
        "num": 6,
        "colors": "સફેદ, ગુલાબી, ક્રીમ કે પેસ્ટલ શેડ્સ",
        "note": "શુક્રનો વાર — પ્રેમ, આકર્ષણ અને સંબંધોમાં મધુરતા આપતા રંગો"
      },
      {
        "day": "શનિવાર",
        "num": 8,
        "colors": "ઘેરો વાદળી, કાળો કે જાંબલી",
        "note": "શનિનો વાર — શિસ્ત, સ્થિરતા અને સુરક્ષા આપતા રંગો"
      },
      {
        "day": "રવિવાર",
        "num": 1,
        "colors": "નારંગી, સોનેરી, કેસરી કે ઘેરો લાલ",
        "note": "સૂર્યનો વાર — માન-સન્માન, નેતૃત્વ અને તેજ વધારતા રંગો"
      }
    ],
    "careers": {
      "1": [
        "સરકારી સેવા અને વહીવટી હોદ્દા (IAS/IPS/GPSC)",
        "રાજકારણ અને જાહેર નેતૃત્વ",
        "પોતાનો વ્યવસાય / સાહસિકતા",
        "સિનિયર મેનેજમેન્ટ અને ડિરેક્ટર્સ",
        "લશ્કર / પોલીસમાં ઉચ્ચ પદ",
        "તબીબી ક્ષેત્રમાં નેતૃત્વ"
      ],
      "2": [
        "હ્યુમન રિસોર્સિસ (HR) અને જનસંપર્ક",
        "હોટેલ, હોસ્પિટાલિટી અને પ્રવાસન",
        "નર્સિંગ, કેરગિવિંગ અને મનોવિજ્ઞાન",
        "કાઉન્સેલિંગ અને હીલિંગ",
        "ડેરી, પીણાં અને જળ વેપાર",
        "મીડિયા, કલા અને સંગીત"
      ],
      "3": [
        "શિક્ષણ, ટ્રેનિંગ અને શૈક્ષણિક સંસ્થાઓ",
        "બેન્કિંગ, ફાઇનાન્સ, સીએ અને એકાઉન્ટ્સ",
        "કાયદો, વકીલાત અને ન્યાયતંત્ર",
        "સલાહકાર (કન્સલ્ટન્સી) અને મેન્ટરિંગ",
        "જ્યોતિષ, વાસ્તુ અને આધ્યાત્મિક માર્ગદર્શન",
        "લેખન અને પ્રકાશન"
      ],
      "4": [
        "આઈટી, સોફ્ટવેર અને ઇલેક્ટ્રોનિક્સ",
        "એવિએશન (ઉડ્ડયન) અને એરોસ્પેસ",
        "વિદેશ વેપાર અને બહુરાષ્ટ્રીય કંપનીઓ (MNC)",
        "સ્ટાર્ટઅપ્સ અને નવા પ્રયોગો",
        "સંશોધન અને નવીનતા",
        "ફિલ્મ, ફોટોગ્રાફી અને મીડિયા ટેક"
      ],
      "5": [
        "વેપાર, ટ્રેડિંગ, આયાત-નિકાસ",
        "માર્કેટિંગ, સેલ્સ અને જાહેરાત",
        "પત્રકારત્વ, મીડિયા અને સંચાર",
        "ચાર્ટર્ડ એકાઉન્ટન્સી અને ઓડિટ",
        "ડેટા એનાલિટિક્સ અને ટેલિકોમ",
        "શેરબજાર અને બ્રોકિંગ"
      ],
      "6": [
        "ફેશન, બ્યુટી, ગ્લેમર અને લક્ઝરી બ્રાન્ડ્સ",
        "કલા, સિનેમા, નાટક અને મનોરંજન",
        "ઇન્ટિરિયર ડિઝાઇનિંગ અને આર્કિટેક્ચર",
        "જ્વેલરી, આભૂષણો અને ઓટોમોબાઇલ",
        "હોસ્પિટાલિટી અને ફાઇન ડાઇનિંગ",
        "કોસ્મેટિક્સ અને પરફ્યુમ"
      ],
      "7": [
        "સંશોધન સંસ્થાઓ અને પ્રયોગશાળાઓ",
        "આધ્યાત્મિકતા, યોગ અને હીલિંગ",
        "તપાસ, ડિટેક્ટિવ અને ઇન્ટેલિજન્સ",
        "ડેટા વ્યૂહરચના અને વિશ્લેષણ",
        "વિદેશમાં કામ / ગ્લોબલ પ્રોજેક્ટ્સ",
        "તત્વજ્ઞાન અને ઉચ્ચ શિક્ષણ"
      ],
      "8": [
        "એન્જિનિયરિંગ, મેન્યુફેક્ચરિંગ અને બાંધકામ",
        "રિયલ એસ્ટેટ, જમીન-મકાન અને બિલ્ડર્સ",
        "માઇનિંગ, લોખંડ, સ્ટીલ, ઓઇલ અને ગેસ",
        "કાયદો, વીમો અને કોર્પોરેટ કમ્પ્લાયન્સ",
        "મોટા પાયાના ઇન્ફ્રાસ્ટ્રક્ચર પ્રોજેક્ટ્સ",
        "લોજિસ્ટિક્સ અને ભારે ઉદ્યોગ"
      ],
      "9": [
        "લશ્કર, પોલીસ અને સુરક્ષા સેવાઓ",
        "રમતગમત, ફિટનેસ અને એથ્લેટિક્સ",
        "સર્જરી અને ઇમરજન્સી મેડિસિન",
        "મિકેનિકલ અને સિવિલ એન્જિનિયરિંગ",
        "પ્રોપર્ટી ડીલિંગ અને રિયલ એસ્ટેટ",
        "ઊર્જા, અગ્નિ અને ધાતુ ઉદ્યોગ"
      ]
    },
    "personalYear": {
      "1": "નવી શરૂઆત અને નેતૃત્વનું વર્ષ — નવા કામ શરૂ કરો, જાતે આગળ વધીને નિર્ણયો લો, જે અટક્યા હતા તેનો પ્રારંભ કરો.",
      "2": "ધીરજ અને ભાગીદારીનું વર્ષ — સંબંધો મજબૂત કરો, ટીમ વર્ક પર ધ્યાન આપો; એકલા મોટું જોખમ લેવાથી બચો.",
      "3": "વિકાસ, સર્જનાત્મકતા અને વિસ્તારનું વર્ષ — ધન લાભ, સમાજમાં માન-સન્માન અને નવું જ્ઞાન મેળવવા માટે ઉત્તમ સમય.",
      "4": "પાયો મજબૂત કરવાનો અને શિસ્તનું વર્ષ — બચત કરો, વ્યવસ્થા બનાવો; પરિણામમાં થોડો સમય લાગે તો ગભરાશો નહીં.",
      "5": "બદલાવ અને નવી તકોનું વર્ષ — પ્રવાસ, માર્કેટિંગ, વેપારમાં ફેરફાર અને નવા પ્રયોગો ખૂબ મોટો લાભ આપશે.",
      "6": "પારિવારિક સુખ, પ્રેમ અને સુમેળનું વર્ષ — ઘર-પરિવાર, વાહન, સુંદરતા અને સર્જનાત્મક કાર્યો માટે અત્યંત શુભ.",
      "7": "આત્મ-મંથન, અભ્યાસ અને સાધનાનું વર્ષ — પોતાની આવડત નિખારો, સંશોધન કરો, આધ્યાત્મિક અભ્યાસ કરો; ઉતાવળમાં જોખમ ન લો.",
      "8": "કર્મફળ અને મોટી સિદ્ધિઓનું વર્ષ — જૂની મહેનતનું નક્કર ફળ મળશે; કારકિર્દીમાં પ્રગતિ અને આર્થિક મજબૂતીનો સમય.",
      "9": "પૂર્ણાહુતિ અને નવા ચક્રની તૈયારીનું વર્ષ — જૂના પ્રશ્નો ઉકેલો, દેવું પૂરું કરો, સાહસ અને હિંમતથી આગળ વધો."
    },
    "vastu": {
      "directions": {
        "N": {
          "label": "ઉત્તર દિશા (બુધ)",
          "best": "લિવિંગ રૂમ, અભ્યાસ ખંડ, ઓફિસ ટેબલ, તિજોરી",
          "worst": "માસ્ટર બેડરૂમ, શૌચાલય, ભારે ભંગાર",
          "fix": "ઉત્તર દિશાને હળવી, ખુલ્લી અને હરિયાળી રાખો. દોષ હોય તો: લીલા છોડ, મની પ્લાન્ટ કે બુધ યંત્ર લગાવો."
        },
        "NE": {
          "label": "ઇશાન ખૂણો — ઉત્તર-પૂર્વ (બૃહસ્પતિ)",
          "best": "પૂજા ઘર, ધ્યાન ખંડ, મુખ્ય દ્વાર, જળ તત્વ (ફુવારો)",
          "worst": "રસોડું, શૌચાલય, માસ્ટર બેડરૂમ, ભારે સામાન, ડસ્ટબિન",
          "fix": "સૌથી પવિત્ર દિશા છે. દોષ હોય તો: પાણીનું પાત્ર રાખો, રોજ દીવો પ્રગટાવો, ગુરુ યંત્ર લગાવો, આછા પીળા/સફેદ રંગનો ઉપયોગ કરો; દરિયાઈ મીઠાની વાટકી રાખો."
        },
        "E": {
          "label": "પૂર્વ દિશા (સૂર્ય)",
          "best": "મુખ્ય પ્રવેશદ્વાર, બેઠક ખંડ, અભ્યાસ ખંડ, બાલ્કની",
          "worst": "શૌચાલય, દાદર (પગથિયાં), સ્ટોર રૂમ",
          "fix": "સવારના તડકા માટે પૂર્વને ખુલ્લી રાખો. દોષ હોય તો: તાંબાનું સૂર્ય પ્રતીક લગાવો, બારીઓ સ્વચ્છ રાખો."
        },
        "SE": {
          "label": "આગ્નેય ખૂણો — દક્ષિણ-પૂર્વ (શુક્ર)",
          "best": "રસોડું, ઇલેક્ટ્રિકલ સાધનો, જનરેટર, ગીઝર",
          "worst": "માસ્ટર બેડરૂમ, પાણીની ટાંકી, પૂજા ઘર",
          "fix": "અગ્નિનું સ્થાન છે. દોષ હોય તો: તાંબાનો પિરામિડ કે શુક્ર યંત્ર લગાવો, સાંજે લાલ/નારંગી બલ્બ પ્રગટાવો; અહીં જળ તત્વ ન રાખો."
        },
        "S": {
          "label": "દક્ષિણ દિશા (મંગળ)",
          "best": "બેડરૂમ (માથું દક્ષિણમાં), દાદર, ભારે સ્ટોરેજ",
          "worst": "મુખ્ય દ્વાર (અશુભ પદ પર), પાણીની ટાંકી, ખુલ્લી ખાલી જગ્યા",
          "fix": "દક્ષિણને ભારે અને ઊંચી રાખો. દોષ હોય તો: લાલ/માટીના રંગો વાપરો, મંગળ યંત્ર લગાવો, પિત્તળ કે તાંબાની વસ્તુઓ રાખો."
        },
        "SW": {
          "label": "નૈઋત્ય ખૂણો — દક્ષિણ-પશ્ચિમ (રાહુ)",
          "best": "માસ્ટર બેડરૂમ, ભારે કબાટ, માલિકનો રૂમ, તિજોરી",
          "worst": "મુખ્ય દ્વાર, શૌચાલય, ભૂગર્ભ ટાંકી, ખુલ્લો ખાડો",
          "fix": "સ્થિરતાનું સ્થાન છે. દોષ (દ્વાર/ટોઇલેટ) હોય તો: પિત્તળનો પિરામિડ, રાહુ યંત્ર, પરિવારનો ફોટો લગાવો, પીળા/કથ્થઈ રંગનો ઉપયોગ કરો, ભારે ફર્નિચર રાખો."
        },
        "W": {
          "label": "પશ્ચિમ દિશા (શનિ)",
          "best": "ડાઇનિંગ રૂમ, બાળકોનો રૂમ, શૌચાલય (સ્વીકાર્ય), સ્ટડી",
          "worst": "મુખ્ય દ્વાર (મધ્યમ), પૂજા ઘર",
          "fix": "દોષ હોય તો: ૬ રોડ વાળી મેટલ વિન્ડ ચાઇમ લગાવો, શનિ યંત્ર રાખો, ઘેરો વાદળી/ગ્રે રંગ વાપરો; અહીં અગ્નિ તત્વ ન રાખો."
        },
        "NW": {
          "label": "વાયવ્ય ખૂણો — ઉત્તર-પશ્ચિમ (ચંદ્ર)",
          "best": "અતિથિ ખંડ, તૈયાર માલનો ગોડાઉન, ગેરેજ",
          "worst": "માસ્ટર બેડરૂમ (અસ્થિરતા લાવે છે), રસોડું",
          "fix": "ગતિશીલતાનું સ્થાન છે. દોષ હોય તો: સફેદ/ચાંદીના રંગો, ચંદ્ર યંત્ર, સફેદ ફૂલો કે મેટલ વિન્ડ ચાઇમ લગાવો."
        }
      },
      "entrance": {
        "N": {
          "score": "Good",
          "note": "ઉત્તરનું મુખ્ય પ્રવેશદ્વાર ધનના સતત પ્રવાહ (બુધ) માટે ઉત્તમ છે. તેને પ્રકાશિત અને ખુલ્લું રાખો."
        },
        "NE": {
          "score": "Excellent",
          "note": "ઇશાનનું મુખ્ય પ્રવેશદ્વાર સર્વોત્તમ અને અત્યંત શુભ ગણાય છે — તે સ્પષ્ટ વિચારસરણી, સમૃદ્ધિ અને શાંતિ લાવે છે."
        },
        "E": {
          "score": "Excellent",
          "note": "પૂર્વનું પ્રવેશદ્વાર ઊગતા સૂર્યની હકારાત્મક ઊર્જા લાવે છે — માન-સન્માન, ઉત્તમ સ્વાસ્થ્ય અને પ્રગતિ."
        },
        "SE": {
          "score": "Weak",
          "note": "આગ્નેયનું દ્વાર બિનજરૂરી ખર્ચા અને તણાવ લાવી શકે છે. સરળ ઉપાય: દરવાજા ઉપર તાંબાનો પિરામિડ લગાવો, લાલ પાયદાન રાખો અને બંને બાજુ લીલા છોડ રાખો."
        },
        "S": {
          "score": "Weak",
          "note": "દક્ષિણનું દ્વાર સાવચેતી માંગે છે. સરળ ઉપાય: દરવાજા ઉપર મંગળ યંત્ર લગાવો, મજબૂત લાકડાનો દરવાજો રાખો અને લાલ બલ્બ પ્રગટાવો."
        },
        "SW": {
          "score": "Dosh",
          "note": "નૈઋત્યનું મુખ્ય દ્વાર મોટો વાસ્તુ દોષ ગણાય છે — તે સ્થિરતા અને બચત ઘટાડે છે. સરળ ઉપાય: રાહુ યંત્ર, પિત્તળનો પિરામિડ લગાવો, પીળા/કથ્થઈ રંગનું પાયદાન રાખો, ઉંબરો બનાવો અને અંદરની બાજુ ગણેશજીની પ્રતિમા લગાવો."
        },
        "W": {
          "score": "Moderate",
          "note": "પશ્ચિમનું દ્વાર સામાન્ય છે. ધાતુની વિન્ડ ચાઇમ અને સ્વચ્છતા જાળવવાથી શુભતા વધે છે."
        },
        "NW": {
          "score": "Good",
          "note": "વાયવ્યનું દ્વાર નવા સંપર્કો, સહયોગ અને નેટવર્કિંગમાં સહાયક છે. અહીં હવાની અવરજવર ખુલ્લી રાખો."
        }
      },
      "roomRules": [
        {
          "room": "Kitchen",
          "doshText": "{dir} માં રસોડું (અગ્નિ) હોવું અગ્નિ તત્વનું અસંતુલન બનાવે છે — તેનાથી સ્વાસ્થ્ય અને ખર્ચા પર અસર પડે છે.",
          "fix": "રસોઈ બનાવતી વખતે પૂર્વ દિશા તરફ મોં રાખો; રસોડામાં પીળો જેસલમેર પથ્થર કે તાંબાનો પિરામિડ રાખો; ઇશાનમાં હોય તો દરિયાઈ મીઠાની વાટકી રાખો."
        },
        {
          "room": "Master Bedroom",
          "doshText": "{dir} માં માસ્ટર બેડરૂમ હોવાથી માનસિક શાંતિ અને સ્થિરતા પ્રભાવિત થાય છે.",
          "fix": "સૂતી વખતે માથું હંમેશા દક્ષિણ દિશામાં રાખો; રૂમમાં આછા કથ્થઈ કે બેજ રંગનો ઉપયોગ કરો; રોઝ ક્વાર્ટ્ઝની જોડી રાખો."
        },
        {
          "room": "Toilet",
          "doshText": "{dir} માં શૌચાલય હોવું તે દિશાની ઊર્જાનો નાશ કરે છે — આ મોટો વાસ્તુ દોષ છે.",
          "fix": "શૌચાલયનો દરવાજો હંમેશા બંધ રાખો; એક વાટકીમાં દરિયાઈ મીઠું રાખો (દર અઠવાડિયે બદલો); બહારની દીવાલ પર પિત્તળનો પિરામિડ લગાવો."
        },
        {
          "room": "Pooja Room",
          "doshText": "{dir} માં પૂજા સ્થાન હોવાથી ઘરની આધ્યાત્મિક સુરક્ષા નબળી પડે છે.",
          "fix": "પૂજા કરતી વખતે પૂર્વ કે ઉત્તર તરફ મોં રાખો; ઇશાન ખૂણામાં દરરોજ સવાર-સાંજ ઘી કે તલના તેલનો દીવો અવશ્ય પ્રગટાવો."
        },
        {
          "room": "Study Room",
          "doshText": "{dir} માં અભ્યાસ ખંડ હોવાથી ભણવામાં એકાગ્રતા અને યાદશક્તિ નબળી પડે છે.",
          "fix": "ભણતી વખતે પૂર્વ કે ઉત્તર તરફ મોં રાખીને બેસો; ટેબલ પર સ્ફટિક કે સરસ્વતી યંત્ર રાખો; આછા પીળા કે લીલા રંગનો ઉપયોગ કરો."
        },
        {
          "room": "Staircase",
          "doshText": "{dir} માં (અને ખાસ કરીને ઘરના મધ્ય બ્રહ્મસ્થાનમાં) પગથિયાં હોવાથી ઊર્જામાં ભારેપણું અને અસ્થિરતા આવે છે.",
          "fix": "પગથિયાં નીચે ભંગાર ન રાખો, ત્યાં અજવાળું રાખો; પગથિયાંની શરૂઆતમાં ભારે કૂંડો રાખો; બ્રહ્મસ્થાન ખુલ્લું રાખો."
        }
      ],
      "plotShapes": {
        "square": {
          "tone": "good",
          "note": "ચોરસ પ્લોટ ચારેય ખૂણાથી સંતુલિત અને અત્યંત શુભ હોય છે — તેમાં ઊર્જાનો સંચાર એકસમાન રહે છે."
        },
        "rectangular": {
          "tone": "good",
          "note": "લંબચોરસ પ્લોટ સંતુલિત અને શુભ હોય છે — વેપાર અને રહેણાંક બંને માટે ફળદાયી છે."
        },
        "gomukhi": {
          "tone": "good",
          "note": "ગોમુખી પ્લોટ (આગળથી સાંકડો, પાછળથી પહોળો) રહેણાંક માટે ખૂબ શુભ હોય છે — તે ધન અને સમૃદ્ધિને સાચવી રાખે છે."
        },
        "shermukhi": {
          "tone": "bad",
          "note": "શેરમુખી પ્લોટ (આગળથી પહોળો, પાછળથી સાંકડો) વેપાર માટે સારો છે પણ રહેણાંક માટે અનુકૂળ નથી. ઉપાય: પાછળની દીવાલ પર ભારે છોડ કે કમ્પાઉન્ડ દીવાલ મજબૂત કરો."
        },
        "missing-northeast": {
          "tone": "bad",
          "note": "ઇશાન ખૂણો કપાયેલો હોવો સૌથી પવિત્ર ઊર્જાને નબળી પાડે છે. ઉપાય: કપાયેલા ખૂણા પર દીવો પ્રગટાવો, જળ તત્વ રાખો અને અજવાળું પૂરતું રાખો."
        },
        "missing-southwest": {
          "tone": "bad",
          "note": "નૈઋત્ય ખૂણો કપાયેલો હોવો સ્થિરતાને હચમચાવે છે. ઉપાય: ત્યાં ભારે પિત્તળનો પિરામિડ કે ભારે કૂંડા રાખો."
        },
        "missing-southeast": {
          "tone": "warn",
          "note": "આગ્નેય ખૂણો કપાયેલો હોવો અગ્નિ તત્વ ઘટાડે છે. ઉપાય: લાલ/નારંગી રંગ અને તાંબાનો પિરામિડ લગાવો."
        },
        "missing-northwest": {
          "tone": "warn",
          "note": "વાયવ્ય ખૂણો કપાયેલો હોવો સહયોગમાં ઘટાડો લાવે છે. ઉપાય: ધાતુની વિન્ડ ચાઇમ અને સફેદ રંગનો ઉપયોગ કરો."
        },
        "extended-northeast": {
          "tone": "good",
          "note": "ઇશાન ખૂણો વધેલો હોવો અત્યંત ભાગ્યશાળી અને શુભ છે — તે જ્ઞાન, માન-સન્માન અને ધન વધારે છે."
        },
        "extended-southwest": {
          "tone": "bad",
          "note": "નૈઋત્ય ખૂણો વધવો વધારે પડતો ભાર લાવે છે. ઉપાય: તે જગ્યાનો ઉપયોગ માત્ર સ્ટોરેજ માટે કરો."
        }
      }
    },
    "kua": {
      "1": {
        "group": "પૂર્વી જૂથ (East)",
        "element": "જળ",
        "shengChi": "દક્ષિણ-પૂર્વ (SE)",
        "auspicious": [
          "દક્ષિણ-પૂર્વ (SE)",
          "પૂર્વ (E)",
          "દક્ષિણ (S)",
          "ઉત્તર (N)"
        ]
      },
      "2": {
        "group": "પશ્ચિમી જૂથ (West)",
        "element": "પૃથ્વી",
        "shengChi": "ઉત્તર-પૂર્વ (NE)",
        "auspicious": [
          "ઉત્તર-પૂર્વ (NE)",
          "પશ્ચિમ (W)",
          "ઉત્તર-પશ્ચિમ (NW)",
          "દક્ષિણ-પશ્ચિમ (SW)"
        ]
      },
      "3": {
        "group": "પૂર્વી જૂથ (East)",
        "element": "કાષ્ઠ (Wood)",
        "shengChi": "દક્ષિણ (S)",
        "auspicious": [
          "દક્ષિણ (S)",
          "ઉત્તર (N)",
          "દક્ષિણ-પૂર્વ (SE)",
          "પૂર્વ (E)"
        ]
      },
      "4": {
        "group": "પૂર્વી જૂથ (East)",
        "element": "કાષ્ઠ (Wood)",
        "shengChi": "ઉત્તર (N)",
        "auspicious": [
          "ઉત્તર (N)",
          "દક્ષિણ (S)",
          "પૂર્વ (E)",
          "દક્ષિણ-પૂર્વ (SE)"
        ]
      },
      "6": {
        "group": "પશ્ચિમી જૂથ (West)",
        "element": "ધાતુ (Metal)",
        "shengChi": "પશ્ચિમ (W)",
        "auspicious": [
          "પશ્ચિમ (W)",
          "ઉત્તર-પૂર્વ (NE)",
          "દક્ષિણ-પશ્ચિમ (SW)",
          "ઉત્તર-પશ્ચિમ (NW)"
        ]
      },
      "7": {
        "group": "પશ્ચિમી જૂથ (West)",
        "element": "ધાતુ (Metal)",
        "shengChi": "ઉત્તર-પશ્ચિમ (NW)",
        "auspicious": [
          "ઉત્તર-પશ્ચિમ (NW)",
          "દક્ષિણ-પશ્ચિમ (SW)",
          "ઉત્તર-પૂર્વ (NE)",
          "પશ્ચિમ (W)"
        ]
      },
      "8": {
        "group": "પશ્ચિમી જૂથ (West)",
        "element": "પૃથ્વી",
        "shengChi": "દક્ષિણ-પશ્ચિમ (SW)",
        "auspicious": [
          "દક્ષિણ-પશ્ચિમ (SW)",
          "ઉત્તર-પશ્ચિમ (NW)",
          "પશ્ચિમ (W)",
          "ઉત્તર-પૂર્વ (NE)"
        ]
      },
      "9": {
        "group": "પૂર્વી જૂથ (East)",
        "element": "અગ્નિ",
        "shengChi": "પૂર્વ (E)",
        "auspicious": [
          "પૂર્વ (E)",
          "દક્ષિણ-પૂર્વ (SE)",
          "ઉત્તર (N)",
          "દક્ષિણ (S)"
        ]
      }
    },
    "masterNumbers": {
      "11": {
        "name": "માસ્ટર નંબર 11 — પ્રકાશક (The Illuminator)",
        "meaning": "આ અંક ૨ ની ઉચ્ચ ઊર્જા છે — તીવ્ર અંતર્જ્ઞાન, પ્રેરણા અને આધ્યાત્મિક દ્રષ્ટિ. સંવેદનશીલતાને સમાજ સેવા, કલા કે શિક્ષણમાં લગાવો અને જાત પર શંકા કરવાથી બચો."
      },
      "22": {
        "name": "માસ્ટર નંબર 22 — મહાન નિર્માતા (The Master Builder)",
        "meaning": "આ અંક ૪ ની ઉચ્ચ ઊર્જા છે — સૌથી શક્તિશાળી માસ્ટર નંબર, જે મોટા સપનાઓને નક્કર હકીકતમાં બદલે છે. આના માટે કડક શિસ્ત અને ધીરજની જરૂર પડે છે."
      },
      "33": {
        "name": "માસ્ટર નંબર 33 — મહાન શિક્ષક (The Master Teacher)",
        "meaning": "આ અંક ૬ ની ઉચ્ચ ઊર્જા છે — કરુણા, નિઃસ્વાર્થ સેવા અને જ્ઞાનનો પ્રકાશ. આ અત્યંત દુર્લભ અંક છે, આનો આશીર્વાદ બીજાનું જીવન સુધારવાથી પૂર્ણ થાય છે."
      }
    },
    "nameAdvice": {
      "friendly": "તમારો નામ અંક તમારી જન્મ તારીખના અંકો (મૂળાંક અને ભાગ્યાંક) સાથે સંપૂર્ણ સુમેળભર્યો અને શુભ છે — સ્પેલિંગ બદલવાની કોઈ જરૂર નથી.",
      "neutral": "તમારો નામ અંક સામાન્ય (સમ) છે. તે કોઈ અવરોધ નથી નાખતો કે વિશેષ ટેકો નથી આપતો; થોડી ટ્યુન કરેલી સ્પેલિંગથી વધારાનો લાભ મળી શકે છે.",
      "enemy": "તમારો નામ અંક તમારા જન્મ અંકો સાથે મેળ નથી ખાતો — તેમાં ઉચ્ચારણ-સુરક્ષિત સ્પેલિંગ સુધારો કરવાની સલાહ આપવામાં આવે છે."
    },
    "zodiac": {
      "Aries": {
        "ruler": 9,
        "element": "અગ્નિ",
        "crystals": [
          "રેડ જેસ્પર",
          "કાર્નેલિયન",
          "ટાઇગર આઈ"
        ],
        "intentions": "સાહસ, ફિટનેસ, નેતૃત્વ",
        "dev": "ॐ મંગલાય નમઃ",
        "pron": "Om Mangalaya Namah",
        "meaning": "મંગળ દેવને નમસ્કાર.",
        "affirmation": "હું નીડર, ઊર્જાવાન અને આગળ વધીને નેતૃત્વ કરનાર છું."
      },
      "Taurus": {
        "ruler": 6,
        "element": "પૃથ્વી",
        "crystals": [
          "રોઝ ક્વાર્ટ્ઝ",
          "સફેદ ઝરકન",
          "ગ્રીન એવેન્ચ્યુરિન"
        ],
        "intentions": "સ્થિરતા, ધન, સંબંધ સૌહાર્દ",
        "dev": "ॐ શુક્રાય નમઃ",
        "pron": "Om Shukraya Namah",
        "meaning": "શુક્ર દેવને નમસ્કાર.",
        "affirmation": "હું જીવનમાં શાંતિ, સુખ, સમૃદ્ધિ અને સ્થાયિત્વને આકર્ષિત કરું છું."
      },
      "Gemini": {
        "ruler": 5,
        "element": "વાયુ",
        "crystals": [
          "એગેટ",
          "સિટ્રીન",
          "ક્લિયર ક્વાર્ટ્ઝ"
        ],
        "intentions": "સ્પષ્ટ સંવાદ, જ્ઞાન, નવા વિચારો",
        "dev": "ॐ બુધાય નમઃ",
        "pron": "Om Budhaya Namah",
        "meaning": "બુધ દેવને નમસ્કાર.",
        "affirmation": "મારી વિચારસરણી સ્પષ્ટ, વાણી મધુર અને વિચારો પ્રભાવશાળી છે."
      },
      "Cancer": {
        "ruler": 2,
        "element": "જળ",
        "crystals": [
          "મૂનસ્ટોન",
          "મોતી",
          "રોઝ ક્વાર્ટ્ઝ"
        ],
        "intentions": "ભાવનાત્મક શાંતિ, પરિવાર, અંતર્જ્ઞાન",
        "dev": "ॐ ચંદ્રાય નમઃ",
        "pron": "Om Chandraya Namah",
        "meaning": "ચંદ્ર દેવને નમસ્કાર.",
        "affirmation": "મારું મન શાંત છે અને મારો પરિવાર પ્રેમ તથા સુરક્ષાથી ભરપૂર છે."
      },
      "Leo": {
        "ruler": 1,
        "element": "અગ્નિ",
        "crystals": [
          "સનસ્ટોન",
          "ટાઇગર આઈ",
          "રેડ જેસ્પર"
        ],
        "intentions": "આત્મવિશ્વાસ, સન્માન, અધિકાર",
        "dev": "ॐ સૂર્યાય નમઃ",
        "pron": "Om Suryaya Namah",
        "meaning": "સૂર્ય દેવને નમસ્કાર.",
        "affirmation": "હું તેજ, ગરિમા અને આત્મબળ સાથે મારા જીવનનું નેતૃત્વ કરું છું."
      },
      "Virgo": {
        "ruler": 5,
        "element": "પૃથ્વી",
        "crystals": [
          "ગ્રીન એવેન્ચ્યુરિન",
          "અમેઝોનાઇટ",
          "ક્લિયર ક્વાર્ટ્ઝ"
        ],
        "intentions": "એકાગ્રતા, કુશળતા, સ્વાસ્થ્ય",
        "dev": "ॐ બુધાય નમઃ",
        "pron": "Om Budhaya Namah",
        "meaning": "બુધ દેવને નમસ્કાર.",
        "affirmation": "મારું દરેક કાર્ય વ્યવસ્થિત, ચોક્કસ અને સકારાત્મક ફળ આપનારું છે."
      },
      "Libra": {
        "ruler": 6,
        "element": "વાયુ",
        "crystals": [
          "રોઝ ક્વાર્ટ્ઝ",
          "ઓપલ",
          "લાપિસ લાઝુલી"
        ],
        "intentions": "સંતુલન, ન્યાય, દાંપત્ય સુખ",
        "dev": "ॐ શુક્રાય નમઃ",
        "pron": "Om Shukraya Namah",
        "meaning": "શુક્ર દેવને નમસ્કાર.",
        "affirmation": "મારા જીવનમાં પૂર્ણ સંતુલન, ન્યાય અને મધુર સંબંધો સ્થપાયેલા છે."
      },
      "Scorpio": {
        "ruler": 9,
        "element": "જળ",
        "crystals": [
          "કાર્નેલિયન",
          "બ્લડસ્ટોન",
          "સ્મોકી ક્વાર્ટ્ઝ"
        ],
        "intentions": "પરિવર્તન, આંતરિક શક્તિ, સુરક્ષા",
        "dev": "ॐ ભૌમાય નમઃ",
        "pron": "Om Bhaumaya Namah",
        "meaning": "મંગળ દેવને નમસ્કાર.",
        "affirmation": "મારામાં દરેક મુશ્કેલી પાર કરીને નવી ઊંચાઈ આંબવાની અદમ્ય શક્તિ છે."
      },
      "Sagittarius": {
        "ruler": 3,
        "element": "અગ્નિ",
        "crystals": [
          "સિટ્રીન",
          "પોખરાજ",
          "સોડાલાઇટ"
        ],
        "intentions": "ઉચ્ચ જ્ઞાન, ધર્મ, સમૃદ્ધિ",
        "dev": "ॐ ગુરવે નમઃ",
        "pron": "Om Gurave Namah",
        "meaning": "દેવગુરુ બૃહસ્પતિને નમસ્કાર.",
        "affirmation": "મારો દ્રષ્ટિકોણ વ્યાપક છે અને મારું જીવન જ્ઞાન તથા સૌભાગ્યથી ભરેલું છે."
      },
      "Capricorn": {
        "ruler": 8,
        "element": "પૃથ્વી",
        "crystals": [
          "ગાર્નેટ",
          "સ્મોકી ક્વાર્ટ્ઝ",
          "બ્લેક ટુર્માલાઇન"
        ],
        "intentions": "કારકિર્દી, શિસ્ત, સ્થાયી સફળતા",
        "dev": "ॐ શનયે નમઃ",
        "pron": "Om Shanaye Namah",
        "meaning": "શનિ દેવને નમસ્કાર.",
        "affirmation": "હું શિસ્તબદ્ધ, દ્રઢ અને મારા લક્ષ્યને પ્રાપ્ત કરવા માટે સમર્પિત છું."
      },
      "Aquarius": {
        "ruler": 8,
        "element": "વાયુ",
        "crystals": [
          "એમેથિસ્ટ",
          "લાપિસ લાઝુલી",
          "લેબ્રાડોરાઇટ"
        ],
        "intentions": "નવીનતા, સ્વતંત્રતા, સમાજ કલ્યાણ",
        "dev": "ॐ શનૈશ્ચરાય નમઃ",
        "pron": "Om Shanaischaraya Namah",
        "meaning": "શનિ દેવને નમસ્કાર.",
        "affirmation": "મારી દ્રષ્ટિ ભવિષ્યોન્મુખી છે અને હું સમાજમાં હકારાત્મક પરિવર્તન લાવું છું."
      },
      "Pisces": {
        "ruler": 3,
        "element": "જળ",
        "crystals": [
          "એક્વામરીન",
          "મૂનસ્ટોન",
          "એમેથિસ્ટ"
        ],
        "intentions": "અધ્યાત્મ, કરુણા, માનસિક શાંતિ",
        "dev": "ॐ બૃહસ્પતયે નમઃ",
        "pron": "Om Brihaspataye Namah",
        "meaning": "બૃહસ્પતિ દેવને નમસ્કાર.",
        "affirmation": "હું ઈશ્વરીય કૃપા સાથે જોડાયેલો છું અને મારું હૃદય અગાધ શાંતિથી ભરેલું છે."
      }
    },
    "mantraShort": {
      "1": {
        "dev": "ॐ ઘૃણિઃ સૂર્યાય નમઃ",
        "pron": "Om Ghrinih Suryaya Namah",
        "meaning": "પ્રકાશ અને જીવનના સ્ત્રોત તેજસ્વી સૂર્યદેવને નમસ્કાર.",
        "affirmation": "મારામાં અખૂટ આત્મવિશ્વાસ, તેજ અને નેતૃત્વ શક્તિ છે. હું મારા ભાગ્યનો ઘડવૈયો છું."
      },
      "2": {
        "dev": "ॐ સોમાય નમઃ",
        "pron": "Om Somaya Namah",
        "meaning": "શીતળતા અને અમૃત સ્વરૂપ ચંદ્રદેવને નમસ્કાર.",
        "affirmation": "મારું મન શાંત, સ્થિર અને સંતુલિત છે. મારું હૃદય પ્રેમ અને હકારાત્મકતાથી ભરેલું છે."
      },
      "3": {
        "dev": "ॐ ગુરવે નમઃ",
        "pron": "Om Gurave Namah",
        "meaning": "જ્ઞાન અને બુદ્ધિના દાતા દેવગુરુ બૃહસ્પતિને નમસ્કાર.",
        "affirmation": "મારા માટે જ્ઞાન, સમૃદ્ધિ અને નવી તકોના દ્વાર ખુલ્લા છે. મારો માર્ગ મંગલમય છે."
      },
      "4": {
        "dev": "ॐ રાહવે નમઃ",
        "pron": "Om Rahave Namah",
        "meaning": "અચાનક પરિવર્તન અને સફળતા આપતા રાહુદેવને નમસ્કાર.",
        "affirmation": "હું દરેક મુશ્કેલી પાર કરીને હિંમતપૂર્વક મારો અનોખો માર્ગ બનાવું છું."
      },
      "5": {
        "dev": "ॐ બુધાય નમઃ",
        "pron": "Om Budhaya Namah",
        "meaning": "બુદ્ધિ, વાણી અને વેપારના કારક બુધદેવને નમસ્કાર.",
        "affirmation": "મારી બુદ્ધિ તેજસ્વી છે, મારી વાણી મધુર છે અને હું દરેક પરિસ્થિતિમાં સહજ રહું છું."
      },
      "6": {
        "dev": "ॐ શુક્રાય નમઃ",
        "pron": "Om Shukraya Namah",
        "meaning": "પ્રેમ, સુંદરતા અને સુખ-સમૃદ્ધિ આપતા શુક્રદેવને નમસ્કાર.",
        "affirmation": "હું સુખ, સમૃદ્ધિ, પ્રેમ અને મધુર સંબંધોને આકર્ષિત કરું છું."
      },
      "7": {
        "dev": "ॐ કેતવે નમઃ",
        "pron": "Om Ketave Namah",
        "meaning": "અધ્યાત્મ અને અંતર્જ્ઞાનના દાતા કેતુદેવને નમસ્કાર.",
        "affirmation": "હું મારી આંતરિક સૂઝ પર ભરોસો રાખું છું અને સ્પષ્ટતા સાથે આગળ વધું છું."
      },
      "8": {
        "dev": "ॐ શનૈશ્ચરાય નમઃ",
        "pron": "Om Shanaischaraya Namah",
        "meaning": "કર્મફળ, ન્યાય અને શિસ્તના સ્વામી શનિદેવને નમસ્કાર.",
        "affirmation": "હું શિસ્તબદ્ધ, મહેનતુ અને મારા પરિશ્રમના ઉત્તમ ફળનો અધિકારી છું."
      },
      "9": {
        "dev": "ॐ મંગલાય નમઃ",
        "pron": "Om Mangalaya Namah",
        "meaning": "સાહસ, પરાક્રમ અને રક્ષણના પ્રતીક મંગળદેવને નમસ્કાર.",
        "affirmation": "હું સાહસ, શક્તિ અને એકાગ્રતા સાથે કર્મ કરું છું. હું સુરક્ષિત અને વિજયી છું."
      }
    },
    "compound": {
      "1": "એકાત્મતા — નવી શરૂઆત, નેતૃત્વ અને પહેલ. સૂર્યની મૌલિક ઊર્જા; સ્વતંત્ર અને પ્રભાવશાળી અંક.",
      "2": "Duality — partnership, receptivity and the Moon's calm. Favours cooperation and diplomacy over force.",
      "3": "Expression — Jupiter's optimism, growth and communication. A fortunate, expansive vibration.",
      "4": "Foundation — Rahu's unconventional builder. Discipline, structure and hard work; watch for rigidity.",
      "5": "Change — Mercury's versatility, trade and movement. Quick, adaptable and entrepreneurial.",
      "6": "Harmony — Venus's love, beauty and comfort. Diplomatic and creative; watch indulgence.",
      "7": "Analysis — Ketu's depth, introspection and spirituality. Wise but inclined to solitude.",
      "8": "Power — Saturn's discipline, karma and long-term reward. Authority earned through endurance.",
      "9": "Completion — Mars's courage and action. Strong, decisive and protective; channel anger into sport.",
      "10": "ભાગ્ય ચક્ર (Wheel of Fortune) — જીવનમાં પ્રગતિ અને ઉત્થાન આપતો શુભ અંક. યોગ્ય સમયે તક ઝડપી આગળ વધો.",
      "11": "માસ્ટર નંબર 11 — પ્રકાશક. તીવ્ર અંતર્જ્ઞાન, સંવેદનશીલતા અને સર્જનાત્મકતા. આને સેવા અને કલામાં લગાવો.",
      "12": "ત્યાગ અને જ્ઞાન — બીજાના સહયોગ અને ધીરજથી સફળતા. અધીરાઈથી બચો.",
      "13": "પરિવર્તન અને નવો જન્મ — જૂની મુશ્કેલીઓ તોડીને નવા સ્તરે પહોંચવું. મહેનતુ બનો.",
      "14": "સંતુલન અને ગતિશીલતા — વેપાર અને મુસાફરી માટે શુભ; બિનજરૂરી જોખમથી બચો.",
      "15": "આકર્ષણ અને સૌભાગ્ય (જાદુઈ અંક) — શુક્રની કૃપા, ધન લાભ, કલા, સંગીત અને લોકપ્રિયતા આપતો અત્યંત શુભ અંક.",
      "16": "સાવચેતી અને સતર્કતા — અહંકારથી બચો; સાદગી અને સાવચેતીથી આયોજન કરો.",
      "17": "જ્ઞાનનો સિતારો (Star of the Magi) — આશા, શાંતિ, માન-સન્માન અને દીર્ઘકાલીન સમૃદ્ધિ આપતો અંક.",
      "18": "કર્મ અને સંઘર્ષ — ધીરજ રાખો, વિવાદોથી દૂર રહો અને પરિશ્રમ કરતા રહો.",
      "19": "સૂર્યનો રાજકુમાર — અત્યંત શુભ અને ભાગ્યશાળી અંક; સફળતા, સન્માન, ખુશી અને મનોકામના પૂર્તિ.",
      "20": "જાગૃતિ અને નવો દ્રષ્ટિકોણ — આધ્યાત્મિક વિચાર અને આયોજન માટે શુભ અંક.",
      "21": "વિજય અને પૂર્ણતા — સફળતા, ઉન્નતિ અને વિદેશ યાત્રા આપતો અત્યંત શુભ ફળદાયી અંક.",
      "22": "માસ્ટર નંબર 22 — મહાન નિર્માતા. મોટા સપનાઓને નક્કર હકીકતમાં બદલતો સૌથી શક્તિશાળી અંક.",
      "23": "શાહી સિંહ — ઉચ્ચ અધિકારીઓનો સાથ, વેપારમાં મોટી સફળતા અને માન-સન્માન આપતો અંક.",
      "24": "પ્રેમ અને સમૃદ્ધિ — મિત્રો અને પરિવારનો સહયોગ, આર્થિક લાભ અને સુખમય જીવન.",
      "25": "અનુભવથી જ્ઞાન — જીવનના અનુભવોમાંથી શીખીને પરિપક્વ સફળતા મેળવવી.",
      "26": "કર્મ અને ભાગીદારી — સાવચેતીપૂર્વક ભાગીદારી કરો, ધીરજ અને શિસ્તથી ધન બચાવો.",
      "27": "નેતૃત્વ અને સાહસ — બુદ્ધિ અને પરાક્રમથી માન-સન્માન અને ઉચ્ચ પદ મેળવવું.",
      "28": "સાવચેતીપૂર્ણ પુરુષાર્થ — વિશ્વાસુ લોકો સાથે કામ કરો, કાનૂની અને નાણાકીય સ્પષ્ટતા રાખો.",
      "29": "અનિશ્ચિતતા અને શીખ — લાગણીઓ પર નિયંત્રણ રાખો અને વાસ્તવિક હકીકતો પર નિર્ણય લો.",
      "30": "જ્ઞાન અને અભિવ્યક્તિ — લેખન, શિક્ષણ અને સામાજિક પ્રતિષ્ઠા માટે શુભ અંક.",
      "31": "એકાંત અને વિચાર — પોતાની વિચારસરણી સ્પષ્ટ રાખો અને વ્યવહારુ કર્મ પર ધ્યાન આપો.",
      "32": "લોકપ્રિયતા અને વેપાર — જનસંપર્ક, મીડિયા અને વેપારી સોદાઓ માટે ખૂબ જ ભાગ્યશાળી અંક.",
      "33": "માસ્ટર નંબર 33 — મહાન શિક્ષક. કરુણા, નિઃસ્વાર્થ સેવા અને જ્ઞાનનો પ્રકાશ.",
      "34": "Order & method — steady building through systems and patience; strong for business, but avoid rigidity and worry.",
      "35": "Social fortune — eloquence and popularity bring opportunities; guard against scattered energy and over-socialising.",
      "36": "Genius & humanity — intellectual brilliance devoted to service; watch the tendency to overthink or feel unappreciated.",
      "37": "શુભ મિત્રતા અને પ્રેમ — ભાગ્યશાળી અંક; મિત્રોનો સાથ અને વેપાર તથા લગ્નમાં સફળતા.",
      "38": "Pressure & caution — success is possible but often through strain; avoid envy, hasty decisions and questionable dealings.",
      "39": "Honour & fame — public recognition, achievement and artistic success; but watch pride and self-absorption.",
      "40": "Order & protection — a stable, guarded vibration; good for building quietly, but avoid isolation and complacency.",
      "41": "દૂરંદેશી અને લાભ — નવા સાહસો અને નેતૃત્વ માટે શુભ અંક.",
      "42": "સુમેળ અને પરિવાર — સંબંધોમાં શાંતિ અને પારિવારિક સુખ આપતો અંક.",
      "43": "Rebellion & reform — a number of change-makers and unconventional paths; constructive reform succeeds, but avoid revolt for its own sake.",
      "44": "The Master of Discipline — a double-4 vibration of formidable endurance and structure; immense achievement is possible, but balance work with recovery.",
      "45": "સતર્કતા અને વ્યવસ્થા — ભાગીદારી અને પૈસાના મામલામાં લેખિત દસ્તાવેજો રાખો.",
      "46": "મુત્સદ્દીગીરી અને સફળતા — મધુર સંબંધો અને સતત પ્રયાસથી સફળતા; વેપાર અને લગ્ન બંને માટે ઉત્તમ.",
      "47": "સ્થિરતા અને વિવેક — ધીરજ અને સમજણથી મેળવેલી સ્થાયી સફળતા.",
      "48": "મહત્વાકાંક્ષા અને સાવચેતી — સંયમ અને આયોજનબદ્ધ રીતે કામ કરવાથી સફળતા.",
      "49": "પરિવર્તન અને નવી શરૂઆત — જૂના પ્રશ્નો પૂરા કરીને નવા રસ્તા ખોલવાનો અંક.",
      "50": "અનુભવથી અધિકાર — ઊંડાણ અને અનુભવથી મળેલું સન્માન અને નેતૃત્વ.",
      "51": "યોદ્ધા અંક (The Warrior) — સાહસ, વેપાર, સ્પર્ધા અને વિજય આપતો અત્યંત શક્તિશાળી અને શુભ અંક; નિર્ણાયક પગલાં ભરો.",
      "52": "સહનશીલતા અને વિજય — મુશ્કેલીઓ સામે લડીને આખરે મજબૂત સફળતા મેળવવી.",
      "53": "Change & renewal — transformation through knowledge; fortunate for those who embrace learning and let go of the past.",
      "54": "Courage with risk — bold action brings results, but impulsiveness invites loss; temper fire with planning.",
      "55": "The Magician's power — immense charisma and influence, but with a real caution against misuse; integrity decides the outcome.",
      "56": "સમૃદ્ધિ અને પ્રેમ — પારિવારિક સુખ, કલા અને સ્થિર ધન લાભ આપતો શુભ અંક.",
      "57": "Intuition & breakthrough — deep insight leads to sudden, positive change; trust your inner knowing and act on it.",
      "58": "Discipline with reward — Saturn's steady hand: hard, consistent work is repaid with lasting success and respect.",
      "59": "સાહસ અને બદલાવ — નીડર બનીને નવી તકો ઝડપી લો.",
      "60": "Balance & completion — a harmonious closing of cycles; rest, integrate and prepare for the next beginning.",
      "61": "Independence & originality — a pioneer's number; self-reliance and fresh ideas bring success, but guard against isolation.",
      "62": "Retreat & reflection — a number of the hidden counsellor; wisdom grows in quiet, then serves the world.",
      "63": "Communication & charm — persuasive, popular and creative; excellent for writing, teaching and trade.",
      "64": "Structure & caution — solid building with a watchful eye; avoid over-control and worry, which sap the gains.",
      "65": "અનુકૂલન અને આકર્ષણ — વાકપટુતા અને નવી દિશાઓમાં સફળતા આપતો અંક.",
      "66": "Caution in domestic life — love and home need conscious care; guard against possessiveness, indulgence and family friction.",
      "67": "Wisdom & stability — a fortunate blend of insight and grounding; excellent for long-term success and teaching.",
      "68": "Effort & patience — Saturn tests and then rewards; avoid pessimism and keep moving steadily toward the goal.",
      "69": "Completion & courage — endings met with strength clear the path; act bravely and close old chapters cleanly.",
      "70": "Introspection & wisdom — a number of the seeker; deep understanding and spiritual growth come through stillness.",
      "71": "The Gift — good fortune through unexpected openings and hidden help; stay open and grateful.",
      "72": "Partnership & completion — collaborative success; clear agreements and mutual respect bring the best results.",
      "73": "જ્ઞાન અને વિસ્તાર — ઉદારતા અને બુદ્ધિમત્તાથી નેતૃત્વ કરવાનો શુભ અંક.",
      "74": "Structure & service — steady, reliable building in service of others; avoid rigidity and martyrdom.",
      "75": "Change & opportunity — adaptability opens doors; a fortunate number for trade, travel and reinvention.",
      "76": "Love & beauty — Venus's grace: harmony, art and affection flourish; watch indulgence and possessiveness.",
      "77": "Deep wisdom & mystery — a powerful number of intuition and spiritual depth; guard against isolation and over-secrecy.",
      "78": "Delusion & caution — glamour and material allure may mislead; verify facts, keep commitments simple and honest.",
      "79": "Completion & release — the end of a karmic cycle; let go with grace and prepare for renewal.",
      "80": "Power & organisation — strong, structured authority; excellent for management, but temper control with warmth.",
      "81": "સિદ્ધિ અને પ્રતિષ્ઠા — શિસ્તબદ્ધ પ્રયાસથી જીવનમાં ઉચ્ચ પદ અને માન-સન્માન.",
      "82": "Adversity & patience — Saturn's test of endurance; steady, humble work converts hardship into authority.",
      "83": "Growth & renewal — expansion through learning and letting go; a fortunate number for scholars and reformers.",
      "84": "Structure & transformation — reform through discipline; change is steady and lasting when systems support it.",
      "85": "Change with wisdom — adaptability guided by insight; excellent for trade, teaching and communication.",
      "86": "Harmony & success — love and achievement align; a fortunate number for partnership and creative work.",
      "87": "Intuition & completion — inner guidance brings cycles to a graceful close; trust the still, small voice.",
      "88": "Discipline & mastery — the double-8 vibration of Saturn; immense, patient achievement is possible; avoid rigidity and self-criticism.",
      "89": "Courage & completion — bold endings clear the way for new beginnings; act with strength and integrity.",
      "90": "Introspection & renewal — a number of the seeker at rest; wisdom gathered in quiet prepares the next cycle.",
      "91": "Independence & leadership — a pioneer's power; self-reliance and fresh vision bring success; guard against isolation.",
      "92": "Partnership & insight — wisdom shared in cooperation; excellent for counselling, teaching and stable alliances.",
      "93": "Expansion & service — growth through generosity and guidance; a fortunate number for mentors and healers.",
      "94": "Structure & completion — steady building brings cycles to a full, satisfying close; avoid over-control.",
      "95": "Change & courage — bold, adaptable action transforms circumstances; a fortunate number for reinvention.",
      "96": "Love & completion — relationships and creative cycles reach fulfilment; nurture what you love.",
      "97": "Wisdom & release — deep understanding allows graceful letting-go; a powerful number of inner peace.",
      "98": "Patience & reward — Saturn's long game: endurance and discipline are repaid with lasting, respected success.",
      "99": "Mastery & completion — the highest single-figure compound; wisdom, courage and karma align for major achievement.",
      "100": "Favour of the Divine — completion of the first cycle; grace, protection and the blessing of new beginnings.",
      "101": "New beginnings — unity renewed at a higher turn of the wheel; initiation and fresh leadership energy.",
      "102": "Partnership with purpose — cooperation elevated by clarity; strong for unions and joint ventures with clear roles.",
      "103": "Expression & growth — wisdom, communication and expansion in harmony; fortunate for teachers and creators.",
      "104": "Foundation renewed — structure and discipline begin a fresh cycle; build carefully and stay flexible.",
      "105": "Change & mastery — adaptability crowned with authority; a fortunate number for leaders in times of change.",
      "106": "Harmony & completion — love, beauty and achievement reach fulfilment; a warm, fortunate closing.",
      "107": "Wisdom & renewal — deep insight opens new beginnings; trust inner guidance and step forward.",
      "108": "પૂર્ણ ચક્ર — સાધના, સિદ્ધિ, સુરક્ષા અને પૂર્ણતા આપતો પવિત્ર અંક."
    }
  }
};

if (typeof window !== "undefined") {
  window.I18N = I18N;
}

if (typeof module !== "undefined") {
  module.exports = { I18N };
}
