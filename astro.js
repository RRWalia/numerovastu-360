/* ============================================================
   NumeroVastu 360 — astro.js
   In-browser Vedic ephemeris (Tier 2 of the Vedic precision
   stack). Computes the sidereal (Nirayana) positions of the
   Sun, Moon, Lagna (ascendant) and Midheaven from birth date,
   time and place — entirely on-device, no network, no server.

   Engine: a self-contained port of Jean Meeus, "Astronomical
   Algorithms" (2nd ed., 1998) — Julian day & ΔT (ch. 7/10),
   Greenwich sidereal time (ch. 12, IAU-82), nutation &
   obliquity (ch. 22, Table 22.A), the Sun (ch. 25) and the
   Moon (ch. 47, Table 47.A). Coefficient tables taken from the
   MIT-licensed `astronomia` port of the same book (Meeus
   tables are public reference data). No runtime dependencies.

   Ayanamsa: Lahiri (Chitrapaksha), the standard Indian civil
   calendar ayanamsa.

   No personal data is ever sent anywhere.
   ============================================================ */

window.NVAstro = (function () {
  "use strict";

  const VERSION = "1.1.0";
  const ENGINE = "Meeus ephemeris (AA) v1.1.0";
  const DEG = 180 / Math.PI;
  const NAK_SPAN = 360 / 27; // 13°20′ per nakshatra
  const PADA_SPAN = NAK_SPAN / 4; // 3°20′ per pada

  /* Lahiri ayanamsa (Chitrapaksha). Base value 23°51′12″ (23.8533°)
     at J2000, precessing ~50.29″/Julian year. Good to ~1′ over the
     last few centuries — far finer than sign/nakshatra resolution. */
  const AYANAMSA_J2000 = 23.8533;
  const AYANAMSA_RATE = 0.013969; // degrees per Julian year

  const clamp360 = (x) => ((x % 360) + 360) % 360;
  const pad2 = (n) => String(n).padStart(2, "0");

  /* IAU 2006 mean obliquity polynomial (arcsec), arg = days since J2000. */
  function meanObliquity(daysSinceJ2000) {
    const T = daysSinceJ2000 / 36525.0;
    return (84381.448 - 46.815 * T - 0.00059 * T * T + 0.001813 * T * T * T) / 3600.0;
  }

  function ayanamsaAt(daysSinceJ2000) {
    return AYANAMSA_J2000 + (daysSinceJ2000 / 365.25) * AYANAMSA_RATE;
  }
  const ayanamsaForDate = (dobISO) => {
    const p = parseDob(dobISO);
    if (!p) return null;
    return ayanamsaAt(daysSinceJ2000Of(p.y, p.m, p.d, 12));
  };

  function daysSinceJ2000Of(y, m, d, utcHours) {
    return jdFromUtc(y, m, d, utcHours) - 2451545.0;
  }

  /* ---------------- sign tables ---------------- */
  const SIGNS = [
    { name: "Aries", glyph: "♈", element: "Fire", lord: "Mars" },
    { name: "Taurus", glyph: "♉", element: "Earth", lord: "Venus" },
    { name: "Gemini", glyph: "♊", element: "Air", lord: "Mercury" },
    { name: "Cancer", glyph: "♋", element: "Water", lord: "Moon" },
    { name: "Leo", glyph: "♌", element: "Fire", lord: "Sun" },
    { name: "Virgo", glyph: "♍", element: "Earth", lord: "Mercury" },
    { name: "Libra", glyph: "♎", element: "Air", lord: "Venus" },
    { name: "Scorpio", glyph: "♏", element: "Water", lord: "Mars" },
    { name: "Sagittarius", glyph: "♐", element: "Fire", lord: "Jupiter" },
    { name: "Capricorn", glyph: "♑", element: "Earth", lord: "Saturn" },
    { name: "Aquarius", glyph: "♒", element: "Air", lord: "Saturn" },
    { name: "Pisces", glyph: "♓", element: "Water", lord: "Jupiter" }
  ];

  function signOf(lonSidereal) {
    const L = clamp360(lonSidereal);
    const idx = Math.min(11, Math.floor(L / 30));
    const within = L - idx * 30;
    return {
      index: idx,
      name: SIGNS[idx].name,
      glyph: SIGNS[idx].glyph,
      element: SIGNS[idx].element,
      lord: SIGNS[idx].lord,
      lon: L,
      within,
      deg: Math.floor(within),
      min: Math.floor((within - Math.floor(within)) * 60),
      degStr: Math.floor(within) + "°" + pad2(Math.floor((within - Math.floor(within)) * 60)) + "′"
    };
  }

  /* ---------------- nakshatra table (27 equal sectors) ---------------- */
  /* [name, vimshottari lord, deity, glyph, one-line trait] */
  const NAK_ROWS = [
    ["Ashwini", "Ketu", "Ashwini Kumaras", "🐴", "swift-healer energy; new beginnings"],
    ["Bharani", "Venus", "Yama", "🌀", "creative endurance; the cycles of life"],
    ["Krittika", "Sun", "Agni", "🔥", "sharp, purifying fire; cuts through illusion"],
    ["Rohini", "Moon", "Brahma", "🐂", "abundance, growth and magnetic charm"],
    ["Mrigashira", "Mars", "Soma", "🦌", "gentle searching; a curious, restless mind"],
    ["Ardra", "Rahu", "Rudra", "💧", "storm energy; deep transformation"],
    ["Punarvasu", "Jupiter", "Aditi", "🏹", "renewal; the returning light"],
    ["Pushya", "Saturn", "Brihaspati", "🐄", "nourishing; auspicious protection"],
    ["Ashlesha", "Mercury", "Nagas", "🐍", "mystical insight; hypnotic presence"],
    ["Magha", "Ketu", "Pitris", "👑", "ancestral power; royal bearing"],
    ["Purva Phalguni", "Venus", "Bhaga", "🛏️", "enjoyment; creative leisure"],
    ["Uttara Phalguni", "Sun", "Aryaman", "🛏️", "steady patronage; loyal support"],
    ["Hasta", "Moon", "Savitar", "✋", "skilful hands; precision and craft"],
    ["Chitra", "Mars", "Tvashtar", "💎", "brilliant crafting; striking presence"],
    ["Swati", "Rahu", "Vayu", "🌱", "independent movement; fresh freedom"],
    ["Vishakha", "Jupiter", "Indra & Agni", "🏺", "focused ambition; victory"],
    ["Anuradha", "Saturn", "Mitra", "🌸", "devotion and friendship; endurance"],
    ["Jyeshtha", "Mercury", "Indra", "☂️", "seniority; protective authority"],
    ["Mula", "Ketu", "Nirriti", "🪢", "uprooting; radical truth-seeking"],
    ["Purva Ashadha", "Venus", "Apas", "🐘", "invincible early victory"],
    ["Uttara Ashadha", "Sun", "Vishvedevas", "🐘", "lasting victory; steady dharma"],
    ["Shravana", "Moon", "Vishnu", "👂", "deep listening; devoted learning"],
    ["Dhanishta", "Mars", "Vasus", "🥁", "rhythm; a wealth of talents"],
    ["Shatabhisha", "Rahu", "Varuna", "⭕", "healing mystery; vast horizons"],
    ["Purva Bhadrapada", "Jupiter", "Aja Ekapada", "⚔️", "intense elevation; single-point focus"],
    ["Uttara Bhadrapada", "Saturn", "Ahir Budhnya", "🐍", "depth; wisdom that ripens late"],
    ["Revati", "Mercury", "Pushan", "🐟", "safe passage; compassionate care"]
  ];
  const NAKS = NAK_ROWS.map((r) => ({ name: r[0], lord: r[1], deity: r[2], glyph: r[3], trait: r[4] }));

  function fmtAbs(lonAbs) {
    const d = Math.floor(lonAbs), m = Math.floor((lonAbs - d) * 60);
    return d + "°" + pad2(m) + "′";
  }

  function nakshatraOf(lonSidereal) {
    const L = clamp360(lonSidereal);
    const idx = Math.min(26, Math.floor(L / NAK_SPAN));
    const start = idx * NAK_SPAN;
    const within = L - start;
    const pada = Math.min(4, Math.floor(within / PADA_SPAN) + 1);
    return {
      index: idx,
      name: NAKS[idx].name,
      lord: NAKS[idx].lord,
      deity: NAKS[idx].deity,
      glyph: NAKS[idx].glyph,
      trait: NAKS[idx].trait,
      pada,
      start,
      end: start + NAK_SPAN,
      within,
      spanStr: fmtAbs(start) + "–" + fmtAbs(start + NAK_SPAN)
    };
  }

  /* ---------------- input parsing ---------------- */
  function parseDob(dob) {
    const m = String(dob || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return { y, m: mo, d };
  }

  function parseTime(t) {
    const m = String(t || "").trim().match(/^(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const h = +m[1], min = +m[2];
    if (h > 23 || min > 59) return null;
    return { h, min };
  }

  /* ---------------- birthplace atlas (offline, on-device) ----------------
     Entries: [keys, display name, state, country, lat, lon, tzHours, dst]
     tzHours = standard-time offset from UTC. India runs a single zone
     (UTC+5:30) with no daylight saving. Non-Indian entries carry a dst
     flag so the report can print the standard-offset caveat. */
  const CITIES = [
    // — India (UTC+5:30, no DST) —
    ["delhi,new delhi,nct delhi", "New Delhi", "Delhi", "India", 28.6139, 77.2090, 5.5, false],
    ["mumbai,bombay", "Mumbai", "Maharashtra", "India", 19.0760, 72.8777, 5.5, false],
    ["bengaluru,bangalore", "Bengaluru", "Karnataka", "India", 12.9716, 77.5946, 5.5, false],
    ["chennai,madras", "Chennai", "Tamil Nadu", "India", 13.0827, 80.2707, 5.5, false],
    ["kolkata,calcutta", "Kolkata", "West Bengal", "India", 22.5726, 88.3639, 5.5, false],
    ["hyderabad,secunderabad", "Hyderabad", "Telangana", "India", 17.3850, 78.4867, 5.5, false],
    ["ahmedabad,amdavad", "Ahmedabad", "Gujarat", "India", 23.0225, 72.5714, 5.5, false],
    ["pune,poona", "Pune", "Maharashtra", "India", 18.5204, 73.8567, 5.5, false],
    ["jaipur", "Jaipur", "Rajasthan", "India", 26.9124, 75.7873, 5.5, false],
    ["lucknow", "Lucknow", "Uttar Pradesh", "India", 26.8467, 80.9462, 5.5, false],
    ["kanpur,cawnpore", "Kanpur", "Uttar Pradesh", "India", 26.4499, 80.3319, 5.5, false],
    ["nagpur", "Nagpur", "Maharashtra", "India", 21.1458, 79.0882, 5.5, false],
    ["indore", "Indore", "Madhya Pradesh", "India", 22.7196, 75.8577, 5.5, false],
    ["bhopal", "Bhopal", "Madhya Pradesh", "India", 23.2599, 77.4126, 5.5, false],
    ["surat", "Surat", "Gujarat", "India", 21.1702, 72.8311, 5.5, false],
    ["patna", "Patna", "Bihar", "India", 25.5941, 85.1376, 5.5, false],
    ["vadodara,baroda", "Vadodara", "Gujarat", "India", 22.3072, 73.1812, 5.5, false],
    ["ludhiana", "Ludhiana", "Punjab", "India", 30.9010, 75.8573, 5.5, false],
    ["agra", "Agra", "Uttar Pradesh", "India", 27.1767, 78.0081, 5.5, false],
    ["nashik,nasik", "Nashik", "Maharashtra", "India", 19.9975, 73.7898, 5.5, false],
    ["faridabad", "Faridabad", "Haryana", "India", 28.4089, 77.3178, 5.5, false],
    ["meerut", "Meerut", "Uttar Pradesh", "India", 28.9845, 77.7064, 5.5, false],
    ["rajkot", "Rajkot", "Gujarat", "India", 22.3039, 70.8022, 5.5, false],
    ["varanasi,banaras,benares,kashi", "Varanasi", "Uttar Pradesh", "India", 25.3176, 82.9739, 5.5, false],
    ["srinagar", "Srinagar", "Jammu & Kashmir", "India", 34.0837, 74.7973, 5.5, false],
    ["amritsar", "Amritsar", "Punjab", "India", 31.6340, 74.8723, 5.5, false],
    ["prayagraj,allahabad", "Prayagraj", "Uttar Pradesh", "India", 25.4358, 81.8463, 5.5, false],
    ["visakhapatnam,vizag", "Visakhapatnam", "Andhra Pradesh", "India", 17.6868, 83.2185, 5.5, false],
    ["guwahati", "Guwahati", "Assam", "India", 26.1445, 91.7362, 5.5, false],
    ["chandigarh", "Chandigarh", "Chandigarh", "India", 30.7333, 76.7794, 5.5, false],
    ["coimbatore", "Coimbatore", "Tamil Nadu", "India", 11.0168, 76.9558, 5.5, false],
    ["madurai", "Madurai", "Tamil Nadu", "India", 9.9252, 78.1198, 5.5, false],
    ["kochi,cochin,ernakulam", "Kochi", "Kerala", "India", 9.9312, 76.2673, 5.5, false],
    ["thiruvananthapuram,trivandrum", "Thiruvananthapuram", "Kerala", "India", 8.5241, 76.9366, 5.5, false],
    ["mysuru,mysore", "Mysuru", "Karnataka", "India", 12.2958, 76.6394, 5.5, false],
    ["jodhpur", "Jodhpur", "Rajasthan", "India", 26.2389, 73.0243, 5.5, false],
    ["raipur", "Raipur", "Chhattisgarh", "India", 21.2514, 81.6296, 5.5, false],
    ["ranchi", "Ranchi", "Jharkhand", "India", 23.3441, 85.3096, 5.5, false],
    ["bhubaneswar", "Bhubaneswar", "Odisha", "India", 20.2961, 85.8245, 5.5, false],
    ["dehradun", "Dehradun", "Uttarakhand", "India", 30.3165, 78.0322, 5.5, false],
    ["gwalior", "Gwalior", "Madhya Pradesh", "India", 26.2183, 78.1828, 5.5, false],
    ["vijayawada", "Vijayawada", "Andhra Pradesh", "India", 16.5062, 80.6480, 5.5, false],
    ["jalandhar", "Jalandhar", "Punjab", "India", 31.3260, 75.5762, 5.5, false],
    ["dhanbad", "Dhanbad", "Jharkhand", "India", 23.7957, 86.4304, 5.5, false],
    ["aurangabad,chhatrapati sambhajinagar", "Chhatrapati Sambhajinagar", "Maharashtra", "India", 19.8762, 75.3433, 5.5, false],
    ["hubballi,hubli,dharwad", "Hubballi-Dharwad", "Karnataka", "India", 15.3647, 75.1240, 5.5, false],
    ["salem", "Salem", "Tamil Nadu", "India", 11.6643, 78.1460, 5.5, false],
    ["tiruchirappalli,trichy", "Tiruchirappalli", "Tamil Nadu", "India", 10.7905, 78.7047, 5.5, false],
    ["mangaluru,mangalore", "Mangaluru", "Karnataka", "India", 12.9141, 74.8560, 5.5, false],
    ["gorakhpur", "Gorakhpur", "Uttar Pradesh", "India", 26.7606, 83.3732, 5.5, false],
    ["jhansi", "Jhansi", "Uttar Pradesh", "India", 25.4484, 78.5685, 5.5, false],
    ["jamnagar", "Jamnagar", "Gujarat", "India", 22.4707, 70.0577, 5.5, false],
    ["siliguri", "Siliguri", "West Bengal", "India", 26.7271, 88.3953, 5.5, false],
    ["udaipur", "Udaipur", "Rajasthan", "India", 24.5854, 73.7125, 5.5, false],
    ["aligarh", "Aligarh", "Uttar Pradesh", "India", 27.8974, 78.0880, 5.5, false],
    ["bareilly", "Bareilly", "Uttar Pradesh", "India", 28.3670, 79.4304, 5.5, false],
    ["moradabad", "Moradabad", "Uttar Pradesh", "India", 28.8386, 78.7733, 5.5, false],
    ["saharanpur", "Saharanpur", "Uttar Pradesh", "India", 29.9679, 77.5452, 5.5, false],
    ["noida,greater noida", "Noida", "Uttar Pradesh", "India", 28.5355, 77.3910, 5.5, false],
    ["ghaziabad", "Ghaziabad", "Uttar Pradesh", "India", 28.6692, 77.4538, 5.5, false],
    ["gurugram,gurgaon", "Gurugram", "Haryana", "India", 28.4595, 77.0266, 5.5, false],
    ["nanded", "Nanded", "Maharashtra", "India", 19.1383, 77.3210, 5.5, false],
    ["kolhapur", "Kolhapur", "Maharashtra", "India", 16.7050, 74.2433, 5.5, false],
    ["solapur", "Solapur", "Maharashtra", "India", 17.6599, 75.9064, 5.5, false],
    ["tirunelveli", "Tirunelveli", "Tamil Nadu", "India", 8.7139, 77.7567, 5.5, false],
    ["warangal", "Warangal", "Telangana", "India", 17.9689, 79.5941, 5.5, false],
    ["jabalpur", "Jabalpur", "Madhya Pradesh", "India", 23.1815, 79.9864, 5.5, false],
    ["jamshedpur", "Jamshedpur", "Jharkhand", "India", 22.8046, 86.2029, 5.5, false],
    ["kota", "Kota", "Rajasthan", "India", 25.2138, 75.8648, 5.5, false],
    ["bikaner", "Bikaner", "Rajasthan", "India", 28.0229, 73.3119, 5.5, false],
    ["ajmer", "Ajmer", "Rajasthan", "India", 26.4499, 74.6399, 5.5, false],
    ["panipat", "Panipat", "Haryana", "India", 29.3909, 76.9635, 5.5, false],
    ["rohtak", "Rohtak", "Haryana", "India", 28.8955, 76.6066, 5.5, false],
    ["karnal", "Karnal", "Haryana", "India", 29.6857, 76.9905, 5.5, false],
    ["hisar,hissar", "Hisar", "Haryana", "India", 29.1492, 75.7217, 5.5, false],
    ["shimla,simla", "Shimla", "Himachal Pradesh", "India", 31.1048, 77.1734, 5.5, false],
    ["jammu", "Jammu", "Jammu & Kashmir", "India", 32.7266, 74.8570, 5.5, false],
    ["imphal", "Imphal", "Manipur", "India", 24.8170, 93.9368, 5.5, false],
    ["aizawl", "Aizawl", "Mizoram", "India", 23.7271, 92.7176, 5.5, false],
    ["shillong", "Shillong", "Meghalaya", "India", 25.5788, 91.8933, 5.5, false],
    ["agartala", "Agartala", "Tripura", "India", 23.8315, 91.2868, 5.5, false],
    ["kohima", "Kohima", "Nagaland", "India", 25.6751, 94.1086, 5.5, false],
    ["itanagar", "Itanagar", "Arunachal Pradesh", "India", 27.0844, 93.6053, 5.5, false],
    ["gangtok", "Gangtok", "Sikkim", "India", 27.3389, 88.6065, 5.5, false],
    ["panaji,panjim", "Panaji", "Goa", "India", 15.4909, 73.8278, 5.5, false],
    ["puducherry,pondicherry", "Puducherry", "Puducherry", "India", 11.9416, 79.8083, 5.5, false],
    ["port blair", "Port Blair", "Andaman & Nicobar", "India", 11.6234, 92.7265, 5.5, false],
    ["gandhinagar", "Gandhinagar", "Gujarat", "India", 23.2156, 72.6369, 5.5, false],
    ["haldwani", "Haldwani", "Uttarakhand", "India", 29.2183, 79.5130, 5.5, false],
    ["haridwar,hardwar", "Haridwar", "Uttarakhand", "India", 29.9457, 78.1642, 5.5, false],
    ["rishikesh", "Rishikesh", "Uttarakhand", "India", 30.0869, 78.2676, 5.5, false],
    ["mathura", "Mathura", "Uttar Pradesh", "India", 27.4924, 77.6737, 5.5, false],
    ["vrindavan", "Vrindavan", "Uttar Pradesh", "India", 27.5811, 77.6940, 5.5, false],
    ["ayodhya,faizabad", "Ayodhya", "Uttar Pradesh", "India", 26.7922, 82.1998, 5.5, false],
    ["dwarka,dwarka gujarat", "Dwarka", "Gujarat", "India", 22.2394, 68.9678, 5.5, false],
    ["somnath,prabhas patan", "Somnath", "Gujarat", "India", 20.9060, 70.3844, 5.5, false],
    ["tirupati,tirumala", "Tirupati", "Andhra Pradesh", "India", 13.6288, 79.4192, 5.5, false],
    ["ujjain", "Ujjain", "Madhya Pradesh", "India", 23.1765, 75.7885, 5.5, false],
    ["vellore", "Vellore", "Tamil Nadu", "India", 12.9165, 79.1325, 5.5, false],
    ["erode", "Erode", "Tamil Nadu", "India", 11.3410, 77.7172, 5.5, false],
    ["thoothukudi,tuticorin", "Thoothukudi", "Tamil Nadu", "India", 8.7642, 78.1348, 5.5, false],
    ["kakinada", "Kakinada", "Andhra Pradesh", "India", 16.9891, 82.2475, 5.5, false],
    ["guntur", "Guntur", "Andhra Pradesh", "India", 16.3067, 80.4365, 5.5, false],
    ["nellore", "Nellore", "Andhra Pradesh", "India", 14.4426, 79.9865, 5.5, false],
    ["kurnool", "Kurnool", "Andhra Pradesh", "India", 15.8281, 78.0373, 5.5, false],
    ["rajahmundry", "Rajahmundry", "Andhra Pradesh", "India", 17.0005, 81.8040, 5.5, false],
    ["belagavi,belgaum", "Belagavi", "Karnataka", "India", 15.8497, 74.4977, 5.5, false],
    ["thane", "Thane", "Maharashtra", "India", 19.2183, 72.9781, 5.5, false],
    ["navi mumbai", "Navi Mumbai", "Maharashtra", "India", 19.0330, 73.0297, 5.5, false],
    ["kalyan", "Kalyan", "Maharashtra", "India", 19.2403, 73.1305, 5.5, false],
    ["ambala", "Ambala", "Haryana", "India", 30.3782, 76.7767, 5.5, false],
    ["bathinda", "Bathinda", "Punjab", "India", 30.2110, 74.9455, 5.5, false],
    ["patiala", "Patiala", "Punjab", "India", 30.3398, 76.3869, 5.5, false],
    ["rourkela", "Rourkela", "Odisha", "India", 22.2604, 84.8536, 5.5, false],
    ["cuttack", "Cuttack", "Odisha", "India", 20.4625, 85.8830, 5.5, false],
    ["bokaro", "Bokaro", "Jharkhand", "India", 23.6693, 86.1511, 5.5, false],
    ["muzaffarpur", "Muzaffarpur", "Bihar", "India", 26.1197, 85.3910, 5.5, false],
    ["gaya", "Gaya", "Bihar", "India", 24.7914, 85.0002, 5.5, false],
    ["bhagalpur", "Bhagalpur", "Bihar", "India", 25.2425, 87.0169, 5.5, false],
    ["kollam,quilon", "Kollam", "Kerala", "India", 8.8932, 76.6141, 5.5, false],
    ["thrissur,trichur", "Thrissur", "Kerala", "India", 10.5276, 76.2144, 5.5, false],
    ["kozhikode,calicut", "Kozhikode", "Kerala", "India", 11.2588, 75.7804, 5.5, false],
    ["kannur,cannanore", "Kannur", "Kerala", "India", 11.8745, 75.3704, 5.5, false],
    ["kottayam", "Kottayam", "Kerala", "India", 9.5916, 76.5222, 5.5, false],
    ["sangli", "Sangli", "Maharashtra", "India", 16.8524, 74.5815, 5.5, false],
    ["amravati", "Amravati", "Maharashtra", "India", 20.9374, 77.7796, 5.5, false],
    ["jalgaon", "Jalgaon", "Maharashtra", "India", 21.0077, 75.5626, 5.5, false],
    ["akola", "Akola", "Maharashtra", "India", 20.7010, 77.0050, 5.5, false],
    ["latur", "Latur", "Maharashtra", "India", 18.4088, 76.5604, 5.5, false],
    ["sagar", "Sagar", "Madhya Pradesh", "India", 23.8388, 78.7378, 5.5, false],
    ["rewari", "Rewari", "Haryana", "India", 28.1930, 76.6159, 5.5, false],
    ["sonipat,sonepat", "Sonipat", "Haryana", "India", 28.9931, 77.0151, 5.5, false],
    ["firozabad", "Firozabad", "Uttar Pradesh", "India", 27.1592, 78.3957, 5.5, false],
    ["rampur", "Rampur", "Uttar Pradesh", "India", 28.7986, 79.0252, 5.5, false],
    ["muzaffarnagar", "Muzaffarnagar", "Uttar Pradesh", "India", 29.4727, 77.7085, 5.5, false],
    ["hapur", "Hapur", "Uttar Pradesh", "India", 28.7295, 77.7758, 5.5, false],
    ["modinagar", "Modinagar", "Uttar Pradesh", "India", 28.8386, 77.5815, 5.5, false],
    ["mathura vrindavan", "Mathura", "Uttar Pradesh", "India", 27.4924, 77.6737, 5.5, false],
    ["kurukshetra", "Kurukshetra", "Haryana", "India", 29.9695, 76.8783, 5.5, false],
    ["jind", "Jind", "Haryana", "India", 29.3157, 76.3144, 5.5, false],
    ["sirsa", "Sirsa", "Haryana", "India", 29.5339, 75.0177, 5.5, false],
    ["fatehabad", "Fatehabad", "Haryana", "India", 29.5145, 75.4488, 5.5, false],
    ["kaithal", "Kaithal", "Haryana", "India", 29.8010, 76.3997, 5.5, false],
    ["palwal", "Palwal", "Haryana", "India", 28.1447, 77.3254, 5.5, false],
    ["ballabgarh", "Ballabgarh", "Haryana", "India", 28.3392, 77.3266, 5.5, false],
    ["sonepat", "Sonipat", "Haryana", "India", 28.9931, 77.0151, 5.5, false],
    // — Indian Union Territories / hill towns —
    ["leh", "Leh", "Ladakh", "India", 34.1526, 77.5771, 5.5, false],
    ["kargil", "Kargil", "Ladakh", "India", 34.5540, 76.1340, 5.5, false],
    ["dharamshala,dharamsala", "Dharamshala", "Himachal Pradesh", "India", 32.2190, 76.3234, 5.5, false],
    ["mandi", "Mandi", "Himachal Pradesh", "India", 31.5892, 76.9182, 5.5, false],
    ["solan", "Solan", "Himachal Pradesh", "India", 30.9045, 77.0967, 5.5, false],
    ["nainital", "Nainital", "Uttarakhand", "India", 29.3919, 79.4542, 5.5, false],
    ["mussoorie", "Mussoorie", "Uttarakhand", "India", 30.4598, 78.0644, 5.5, false],
    ["roorkee", "Roorkee", "Uttarakhand", "India", 29.8543, 77.8880, 5.5, false],
    ["silchar", "Silchar", "Assam", "India", 24.8333, 92.7789, 5.5, false],
    ["dibrugarh", "Dibrugarh", "Assam", "India", 27.4728, 94.9120, 5.5, false],
    ["jorhat", "Jorhat", "Assam", "India", 26.7509, 94.2037, 5.5, false],
    ["tezpur", "Tezpur", "Assam", "India", 26.6528, 92.7926, 5.5, false],
    ["darjeeling", "Darjeeling", "West Bengal", "India", 27.0410, 88.2663, 5.5, false],
    ["durgapur", "Durgapur", "West Bengal", "India", 23.5204, 87.3119, 5.5, false],
    ["asansol", "Asansol", "West Bengal", "India", 23.6739, 86.9524, 5.5, false],
    ["howrah,haora", "Howrah", "West Bengal", "India", 22.5958, 88.2636, 5.5, false],
    ["hajipur", "Hajipur", "Bihar", "India", 25.6925, 85.2084, 5.5, false],
    ["darbhanga", "Darbhanga", "Bihar", "India", 26.1542, 85.8918, 5.5, false],
    ["gopalganj", "Gopalganj", "Bihar", "India", 26.4653, 84.4423, 5.5, false],
    ["purnia,purnea", "Purnia", "Bihar", "India", 25.7771, 87.4753, 5.5, false],
    ["saharsa", "Saharsa", "Bihar", "India", 25.8749, 86.5961, 5.5, false],
    ["bettiah", "Bettiah", "Bihar", "India", 26.8024, 84.5022, 5.5, false],
    ["sambalpur", "Sambalpur", "Odisha", "India", 21.4669, 83.9812, 5.5, false],
    ["berhampur,brahmapur", "Brahmapur", "Odisha", "India", 19.3150, 84.7941, 5.5, false],
    ["puri", "Puri", "Odisha", "India", 19.8135, 85.8312, 5.5, false],
    ["jeypore", "Jeypore", "Odisha", "India", 18.8563, 82.5716, 5.5, false],
    ["korba", "Korba", "Chhattisgarh", "India", 22.3595, 82.7501, 5.5, false],
    ["bilaspur", "Bilaspur", "Chhattisgarh", "India", 22.0797, 82.1409, 5.5, false],
    ["durg", "Durg", "Chhattisgarh", "India", 21.1904, 81.2849, 5.5, false],
    ["bhillai,bhilai", "Bhilai", "Chhattisgarh", "India", 21.1938, 81.3509, 5.5, false],
    ["jagdalpur", "Jagdalpur", "Chhattisgarh", "India", 19.0808, 82.0311, 5.5, false],
    ["ambikapur", "Ambikapur", "Chhattisgarh", "India", 23.1193, 83.2026, 5.5, false],
    ["ratlam", "Ratlam", "Madhya Pradesh", "India", 23.3315, 75.0367, 5.5, false],
    ["burhanpur", "Burhanpur", "Madhya Pradesh", "India", 21.3077, 76.2289, 5.5, false],
    ["khandwa", "Khandwa", "Madhya Pradesh", "India", 21.8257, 76.3520, 5.5, false],
    ["morena", "Morena", "Madhya Pradesh", "India", 26.5002, 78.0022, 5.5, false],
    ["bhind", "Bhind", "Madhya Pradesh", "India", 26.5597, 78.7883, 5.5, false],
    ["chhatarpur", "Chhatarpur", "Madhya Pradesh", "India", 24.9145, 79.5810, 5.5, false],
    ["satna", "Satna", "Madhya Pradesh", "India", 24.6005, 80.8322, 5.5, false],
    ["rewari haryana", "Rewari", "Haryana", "India", 28.1930, 76.6159, 5.5, false],
    ["bhilwara", "Bhilwara", "Rajasthan", "India", 25.3407, 74.6313, 5.5, false],
    ["alwar", "Alwar", "Rajasthan", "India", 27.5530, 76.6346, 5.5, false],
    ["bharatpur", "Bharatpur", "Rajasthan", "India", 27.2152, 77.4931, 5.5, false],
    ["sikar", "Sikar", "Rajasthan", "India", 27.6120, 75.1400, 5.5, false],
    ["tonk", "Tonk", "Rajasthan", "India", 26.1645, 75.7861, 5.5, false],
    ["chittorgarh,chittor", "Chittorgarh", "Rajasthan", "India", 24.8887, 74.6269, 5.5, false],
    ["sriganganagar,ganganagar", "Sri Ganganagar", "Rajasthan", "India", 29.9038, 73.8772, 5.5, false],
    ["pali", "Pali", "Rajasthan", "India", 25.7726, 73.3234, 5.5, false],
    ["barmer", "Barmer", "Rajasthan", "India", 25.7501, 71.3964, 5.5, false],
    ["jaisalmer", "Jaisalmer", "Rajasthan", "India", 26.9157, 70.9083, 5.5, false],
    ["mount abu", "Mount Abu", "Rajasthan", "India", 24.5926, 72.7156, 5.5, false],
    ["hanumangarh", "Hanumangarh", "Rajasthan", "India", 29.5818, 74.3294, 5.5, false],
    ["jhalawar", "Jhalawar", "Rajasthan", "India", 24.5960, 76.1610, 5.5, false],
    ["banswara", "Banswara", "Rajasthan", "India", 23.5455, 74.4414, 5.5, false],
    ["anand", "Anand", "Gujarat", "India", 22.5645, 72.9289, 5.5, false],
    ["bhavnagar", "Bhavnagar", "Gujarat", "India", 21.7645, 72.1519, 5.5, false],
    ["bhuj", "Bhuj", "Gujarat", "India", 23.2420, 69.6669, 5.5, false],
    ["junagadh", "Junagadh", "Gujarat", "India", 21.5222, 70.4579, 5.5, false],
    ["gandhidham", "Gandhidham", "Gujarat", "India", 23.0753, 70.1337, 5.5, false],
    ["morbi,morvi", "Morbi", "Gujarat", "India", 22.8173, 70.8377, 5.5, false],
    ["nadiad", "Nadiad", "Gujarat", "India", 22.6916, 72.8634, 5.5, false],
    ["porbandar", "Porbandar", "Gujarat", "India", 21.6417, 69.6293, 5.5, false],
    ["valsad,bulsar", "Valsad", "Gujarat", "India", 20.5992, 72.9342, 5.5, false],
    ["navsari", "Navsari", "Gujarat", "India", 20.9467, 72.9520, 5.5, false],
    ["bardoli", "Bardoli", "Gujarat", "India", 21.1229, 73.1118, 5.5, false],
    ["mehsana,mahesana", "Mehsana", "Gujarat", "India", 23.5880, 72.3693, 5.5, false],
    ["palanpur", "Palanpur", "Gujarat", "India", 24.1723, 72.4346, 5.5, false],
    ["kadi", "Kadi", "Gujarat", "India", 23.2990, 72.3340, 5.5, false],
    ["deesa,disa", "Deesa", "Gujarat", "India", 24.2564, 72.1846, 5.5, false],
    ["amreli", "Amreli", "Gujarat", "India", 21.6000, 71.2118, 5.5, false],
    ["veraval", "Veraval", "Gujarat", "India", 20.9159, 70.3629, 5.5, false],
    ["kalol", "Kalol", "Gujarat", "India", 23.2222, 72.5066, 5.5, false],
    ["himatnagar", "Himatnagar", "Gujarat", "India", 23.5990, 72.9660, 5.5, false],
    ["surendranagar", "Surendranagar", "Gujarat", "India", 22.7280, 71.6486, 5.5, false],
    ["botad", "Botad", "Gujarat", "India", 22.1696, 71.6684, 5.5, false],
    ["thiruvallur,tiruvallur", "Tiruvallur", "Tamil Nadu", "India", 13.1442, 79.9084, 5.5, false],
    ["kanchipuram,conjeevaram", "Kanchipuram", "Tamil Nadu", "India", 12.8342, 79.7036, 5.5, false],
    ["thiruvannamalai,tiruvannamalai", "Tiruvannamalai", "Tamil Nadu", "India", 12.2253, 79.0747, 5.5, false],
    ["thanjavur,tanjore", "Thanjavur", "Tamil Nadu", "India", 10.7870, 79.1378, 5.5, false],
    ["cuddalore", "Cuddalore", "Tamil Nadu", "India", 11.7447, 79.7680, 5.5, false],
    ["nagercoil", "Nagercoil", "Tamil Nadu", "India", 8.1833, 77.4119, 5.5, false],
    ["kumbakonam", "Kumbakonam", "Tamil Nadu", "India", 10.9617, 79.3881, 5.5, false],
    ["hosur", "Hosur", "Tamil Nadu", "India", 12.7409, 77.8253, 5.5, false],
    ["dindigul", "Dindigul", "Tamil Nadu", "India", 10.3673, 77.9803, 5.5, false],
    ["karur", "Karur", "Tamil Nadu", "India", 10.9601, 78.0766, 5.5, false],
    ["sivakasi", "Sivakasi", "Tamil Nadu", "India", 9.4533, 77.8024, 5.5, false],
    ["virudhunagar", "Virudhunagar", "Tamil Nadu", "India", 9.5850, 77.9582, 5.5, false],
    ["tenkasi", "Tenkasi", "Tamil Nadu", "India", 8.9595, 77.3150, 5.5, false],
    ["kanyakumari", "Kanyakumari", "Tamil Nadu", "India", 8.0883, 77.5385, 5.5, false],
    ["ooty,ootacamund,udagamandalam", "Udhagamandalam (Ooty)", "Tamil Nadu", "India", 11.4102, 76.6950, 5.5, false],
    ["kodaikanal", "Kodaikanal", "Tamil Nadu", "India", 10.2381, 77.4892, 5.5, false],
    ["bellary,ballari", "Ballari", "Karnataka", "India", 15.1394, 76.9214, 5.5, false],
    ["davangere,davanagere", "Davangere", "Karnataka", "India", 14.4644, 75.9218, 5.5, false],
    ["shimoga,shivamogga", "Shivamogga", "Karnataka", "India", 13.9299, 75.5681, 5.5, false],
    ["tumkur,tumakuru", "Tumakuru", "Karnataka", "India", 13.3379, 77.1173, 5.5, false],
    ["bijapur,vijayapura", "Vijayapura", "Karnataka", "India", 16.8302, 75.7100, 5.5, false],
    ["kalaburagi,gulbarga", "Kalaburagi", "Karnataka", "India", 17.3297, 76.8343, 5.5, false],
    ["bidar", "Bidar", "Karnataka", "India", 17.9104, 77.5199, 5.5, false],
    ["raichur", "Raichur", "Karnataka", "India", 16.2076, 77.3463, 5.5, false],
    ["udupi", "Udupi", "Karnataka", "India", 13.3409, 74.7421, 5.5, false],
    ["chitradurga", "Chitradurga", "Karnataka", "India", 14.2280, 76.4000, 5.5, false],
    ["hassan", "Hassan", "Karnataka", "India", 13.0068, 76.1028, 5.5, false],
    ["mandya", "Mandya", "Karnataka", "India", 12.5221, 76.8955, 5.5, false],
    ["adilabad", "Adilabad", "Telangana", "India", 19.6640, 78.5320, 5.5, false],
    ["karimnagar", "Karimnagar", "Telangana", "India", 18.4386, 79.1288, 5.5, false],
    ["khammam", "Khammam", "Telangana", "India", 17.2473, 80.1514, 5.5, false],
    ["nizamabad", "Nizamabad", "Telangana", "India", 18.6725, 78.0941, 5.5, false],
    ["mahabubnagar", "Mahabubnagar", "Telangana", "India", 16.7372, 77.9855, 5.5, false],
    ["nalgonda", "Nalgonda", "Telangana", "India", 17.0575, 79.2689, 5.5, false],
    ["srikakulam", "Srikakulam", "Andhra Pradesh", "India", 18.2949, 83.8967, 5.5, false],
    ["vizianagaram", "Vizianagaram", "Andhra Pradesh", "India", 18.1067, 83.3955, 5.5, false],
    ["anantapur,anantapuram", "Anantapur", "Andhra Pradesh", "India", 14.6819, 77.6006, 5.5, false],
    ["chittoor", "Chittoor", "Andhra Pradesh", "India", 13.2172, 79.1003, 5.5, false],
    ["ongole", "Ongole", "Andhra Pradesh", "India", 15.5057, 80.0499, 5.5, false],
    ["eluru", "Eluru", "Andhra Pradesh", "India", 16.7107, 81.0952, 5.5, false],
    ["kadapa,cuddapah", "Kadapa", "Andhra Pradesh", "India", 14.4674, 78.8242, 5.5, false],
    ["machilipatnam,masulipatnam", "Machilipatnam", "Andhra Pradesh", "India", 16.1875, 81.1389, 5.5, false],
    ["proddatur", "Proddatur", "Andhra Pradesh", "India", 14.7502, 78.5481, 5.5, false],
    ["hindupur", "Hindupur", "Andhra Pradesh", "India", 13.8281, 77.4914, 5.5, false],
    // — world cities (standard offsets; DST caveat shown when dst=true) —
    ["kathmandu", "Kathmandu", "Bagmati", "Nepal", 27.7172, 85.3240, 5.75, false],
    ["colombo", "Colombo", "Western", "Sri Lanka", 6.9271, 79.8612, 5.5, false],
    ["dhaka", "Dhaka", "Dhaka", "Bangladesh", 23.8103, 90.4125, 6, false],
    ["karachi", "Karachi", "Sindh", "Pakistan", 24.8607, 67.0011, 5, false],
    ["lahore", "Lahore", "Punjab", "Pakistan", 31.5204, 74.3587, 5, false],
    ["islamabad", "Islamabad", "Islamabad", "Pakistan", 33.6844, 73.0479, 5, false],
    ["kabul", "Kabul", "Kabul", "Afghanistan", 34.5553, 69.2075, 4.5, false],
    ["tehran", "Tehran", "Tehran", "Iran", 35.6892, 51.3890, 3.5, false],
    ["baghdad", "Baghdad", "Baghdad", "Iraq", 33.3152, 44.3661, 3, false],
    ["dubai", "Dubai", "Dubai", "UAE", 25.2048, 55.2708, 4, false],
    ["abu dhabi", "Abu Dhabi", "Abu Dhabi", "UAE", 24.4539, 54.3773, 4, false],
    ["sharjah", "Sharjah", "Sharjah", "UAE", 25.3463, 55.4209, 4, false],
    ["muscat", "Muscat", "Muscat", "Oman", 23.5880, 58.3829, 4, false],
    ["doha", "Doha", "Doha", "Qatar", 25.2854, 51.5310, 3, false],
    ["riyadh", "Riyadh", "Riyadh", "Saudi Arabia", 24.7136, 46.6753, 3, false],
    ["jeddah", "Jeddah", "Makkah", "Saudi Arabia", 21.4858, 39.1925, 3, false],
    ["kuwait city,kuwait", "Kuwait City", "Al Asimah", "Kuwait", 29.3759, 47.9774, 3, false],
    ["manama,bahrain", "Manama", "Capital", "Bahrain", 26.2285, 50.5860, 3, false],
    ["singapore", "Singapore", "Singapore", "Singapore", 1.3521, 103.8198, 8, false],
    ["kuala lumpur", "Kuala Lumpur", "Kuala Lumpur", "Malaysia", 3.1390, 101.6869, 8, false],
    ["bangkok", "Bangkok", "Bangkok", "Thailand", 13.7563, 100.5018, 7, false],
    ["jakarta", "Jakarta", "Jakarta", "Indonesia", -6.2088, 106.8456, 7, false],
    ["manila", "Manila", "Metro Manila", "Philippines", 14.5995, 120.9842, 8, false],
    ["hong kong", "Hong Kong", "Hong Kong", "Hong Kong", 22.3193, 114.1694, 8, false],
    ["tokyo", "Tokyo", "Tokyo", "Japan", 35.6762, 139.6503, 9, false],
    ["osaka", "Osaka", "Osaka", "Japan", 34.6937, 135.5023, 9, false],
    ["seoul", "Seoul", "Seoul", "South Korea", 37.5665, 126.9780, 9, false],
    ["beijing", "Beijing", "Beijing", "China", 39.9042, 116.4074, 8, false],
    ["shanghai", "Shanghai", "Shanghai", "China", 31.2304, 121.4737, 8, false],
    ["taipei", "Taipei", "Taipei", "Taiwan", 25.0330, 121.5654, 8, false],
    ["london", "London", "England", "United Kingdom", 51.5074, -0.1278, 0, true],
    ["manchester", "Manchester", "England", "United Kingdom", 53.4808, -2.2426, 0, true],
    ["birmingham", "Birmingham", "England", "United Kingdom", 52.4862, -1.8904, 0, true],
    ["leicester", "Leicester", "England", "United Kingdom", 52.6369, -1.1398, 0, true],
    ["edinburgh", "Edinburgh", "Scotland", "United Kingdom", 55.9533, -3.1883, 0, true],
    ["glasgow", "Glasgow", "Scotland", "United Kingdom", 55.8642, -4.2518, 0, true],
    ["dublin", "Dublin", "Leinster", "Ireland", 53.3498, -6.2603, 0, true],
    ["paris", "Paris", "Île-de-France", "France", 48.8566, 2.3522, 1, true],
    ["berlin", "Berlin", "Berlin", "Germany", 52.5200, 13.4050, 1, true],
    ["frankfurt", "Frankfurt", "Hesse", "Germany", 50.1109, 8.6821, 1, true],
    ["munich", "Munich", "Bavaria", "Germany", 48.1351, 11.5820, 1, true],
    ["amsterdam", "Amsterdam", "North Holland", "Netherlands", 52.3676, 4.9041, 1, true],
    ["brussels", "Brussels", "Brussels", "Belgium", 50.8503, 4.3517, 1, true],
    ["zurich", "Zurich", "Zurich", "Switzerland", 47.3769, 8.5417, 1, true],
    ["geneva", "Geneva", "Geneva", "Switzerland", 46.2044, 6.1432, 1, true],
    ["rome", "Rome", "Lazio", "Italy", 41.9028, 12.4964, 1, true],
    ["milan", "Milan", "Lombardy", "Italy", 45.4642, 9.1900, 1, true],
    ["madrid", "Madrid", "Madrid", "Spain", 40.4168, -3.7038, 1, true],
    ["barcelona", "Barcelona", "Catalonia", "Spain", 41.3874, 2.1686, 1, true],
    ["lisbon", "Lisbon", "Lisbon", "Portugal", 38.7223, -9.1393, 0, true],
    ["stockholm", "Stockholm", "Stockholm", "Sweden", 59.3293, 18.0686, 1, true],
    ["oslo", "Oslo", "Oslo", "Norway", 59.9139, 10.7522, 1, true],
    ["copenhagen", "Copenhagen", "Capital", "Denmark", 55.6761, 12.5683, 1, true],
    ["helsinki", "Helsinki", "Uusimaa", "Finland", 60.1699, 24.9384, 2, true],
    ["warsaw", "Warsaw", "Masovia", "Poland", 52.2297, 21.0122, 1, true],
    ["prague", "Prague", "Prague", "Czechia", 50.0755, 14.4378, 1, true],
    ["vienna", "Vienna", "Vienna", "Austria", 48.2082, 16.3738, 1, true],
    ["athens", "Athens", "Attica", "Greece", 37.9838, 23.7275, 2, true],
    ["istanbul", "Istanbul", "Istanbul", "Türkiye", 41.0082, 28.9784, 3, false],
    ["moscow", "Moscow", "Moscow", "Russia", 55.7558, 37.6173, 3, false],
    ["kyiv,kiev", "Kyiv", "Kyiv", "Ukraine", 50.4501, 30.5234, 2, true],
    ["tel aviv", "Tel Aviv", "Tel Aviv", "Israel", 32.0853, 34.7818, 2, true],
    ["cairo", "Cairo", "Cairo", "Egypt", 30.0444, 31.2357, 2, false],
    ["nairobi", "Nairobi", "Nairobi", "Kenya", -1.2921, 36.8219, 3, false],
    ["lagos", "Lagos", "Lagos", "Nigeria", 6.5244, 3.3792, 1, false],
    ["accra", "Accra", "Greater Accra", "Ghana", 5.6037, -0.1870, 0, false],
    ["johannesburg", "Johannesburg", "Gauteng", "South Africa", -26.2041, 28.0473, 2, false],
    ["cape town", "Cape Town", "Western Cape", "South Africa", -33.9249, 18.4241, 2, false],
    ["durban", "Durban", "KwaZulu-Natal", "South Africa", -29.8587, 31.0218, 2, false],
    ["nassau", "Nassau", "New Providence", "Bahamas", 25.0479, -77.3554, -5, true],
    ["toronto", "Toronto", "Ontario", "Canada", 43.6532, -79.3832, -5, true],
    ["vancouver", "Vancouver", "British Columbia", "Canada", 49.2827, -123.1207, -8, true],
    ["calgary", "Calgary", "Alberta", "Canada", 51.0447, -114.0719, -7, true],
    ["montreal", "Montreal", "Quebec", "Canada", 45.5017, -73.5673, -5, true],
    ["ottawa", "Ottawa", "Ontario", "Canada", 45.4215, -75.6972, -5, true],
    ["edmonton", "Edmonton", "Alberta", "Canada", 53.5461, -113.4938, -7, true],
    ["winnipeg", "Winnipeg", "Manitoba", "Canada", 49.8951, -97.1384, -6, true],
    ["halifax", "Halifax", "Nova Scotia", "Canada", 44.6488, -63.5752, -4, true],
    ["new york,new york city,nyc", "New York", "New York", "USA", 40.7128, -74.0060, -5, true],
    ["los angeles", "Los Angeles", "California", "USA", 34.0522, -118.2437, -8, true],
    ["chicago", "Chicago", "Illinois", "USA", 41.8781, -87.6298, -6, true],
    ["houston", "Houston", "Texas", "USA", 29.7604, -95.3698, -6, true],
    ["san francisco", "San Francisco", "California", "USA", 37.7749, -122.4194, -8, true],
    ["san jose", "San Jose", "California", "USA", 37.3382, -121.8863, -8, true],
    ["seattle", "Seattle", "Washington", "USA", 47.6062, -122.3321, -8, true],
    ["boston", "Boston", "Massachusetts", "USA", 42.3601, -71.0589, -5, true],
    ["washington,washington dc", "Washington, D.C.", "District of Columbia", "USA", 38.9072, -77.0369, -5, true],
    ["atlanta", "Atlanta", "Georgia", "USA", 33.7490, -84.3880, -5, true],
    ["miami", "Miami", "Florida", "USA", 25.7617, -80.1918, -5, true],
    ["orlando", "Orlando", "Florida", "USA", 28.5383, -81.3792, -5, true],
    ["dallas", "Dallas", "Texas", "USA", 32.7767, -96.7970, -6, true],
    ["austin", "Austin", "Texas", "USA", 30.2672, -97.7431, -6, true],
    ["denver", "Denver", "Colorado", "USA", 39.7392, -104.9903, -7, true],
    ["phoenix", "Phoenix", "Arizona", "USA", 33.4484, -112.0740, -7, false],
    ["las vegas", "Las Vegas", "Nevada", "USA", 36.1699, -115.1398, -8, true],
    ["san diego", "San Diego", "California", "USA", 32.7157, -117.1611, -8, true],
    ["portland", "Portland", "Oregon", "USA", 45.5152, -122.6784, -8, true],
    ["minneapolis", "Minneapolis", "Minnesota", "USA", 44.9778, -93.2650, -6, true],
    ["detroit", "Detroit", "Michigan", "USA", 42.3314, -83.0458, -5, true],
    ["philadelphia", "Philadelphia", "Pennsylvania", "USA", 39.9526, -75.1652, -5, true],
    ["pittsburgh", "Pittsburgh", "Pennsylvania", "USA", 40.4406, -79.9959, -5, true],
    ["raleigh", "Raleigh", "North Carolina", "USA", 35.7796, -78.6382, -5, true],
    ["charlotte", "Charlotte", "North Carolina", "USA", 35.2271, -80.8431, -5, true],
    ["nashville", "Nashville", "Tennessee", "USA", 36.1627, -86.7816, -6, true],
    ["columbus", "Columbus", "Ohio", "USA", 39.9612, -82.9988, -5, true],
    ["indianapolis", "Indianapolis", "Indiana", "USA", 39.7684, -86.1581, -5, true],
    ["salt lake city", "Salt Lake City", "Utah", "USA", 40.7608, -111.8910, -7, true],
    ["honolulu", "Honolulu", "Hawaii", "USA", 21.3069, -157.8583, -10, false],
    ["anchorage", "Anchorage", "Alaska", "USA", 61.2181, -149.9003, -9, true],
    ["mexico city", "Mexico City", "Mexico City", "Mexico", 19.4326, -99.1332, -6, false],
    ["bogota", "Bogotá", "Bogotá", "Colombia", 4.7110, -74.0721, -5, false],
    ["lima", "Lima", "Lima", "Peru", -12.0464, -77.0428, -5, false],
    ["santiago", "Santiago", "Santiago", "Chile", -33.4489, -70.6693, -4, true],
    ["buenos aires", "Buenos Aires", "Buenos Aires", "Argentina", -34.6037, -58.3816, -3, false],
    ["sao paulo,são paulo", "São Paulo", "São Paulo", "Brazil", -23.5505, -46.6333, -3, false],
    ["rio de janeiro", "Rio de Janeiro", "Rio de Janeiro", "Brazil", -22.9068, -43.1729, -3, false],
    ["caracas", "Caracas", "Caracas", "Venezuela", 10.4806, -66.9036, -4, false],
    ["kingston", "Kingston", "Kingston", "Jamaica", 18.0179, -76.8099, -5, false],
    ["georgetown", "Georgetown", "Demerara-Mahaica", "Guyana", 6.8013, -58.1551, -4, false],
    ["paramaribo", "Paramaribo", "Paramaribo", "Suriname", 5.8520, -55.2038, -3, false],
    ["port of spain", "Port of Spain", "Port of Spain", "Trinidad & Tobago", 10.6596, -61.5019, -4, false],
    ["sydney", "Sydney", "New South Wales", "Australia", -33.8688, 151.2093, 10, true],
    ["melbourne", "Melbourne", "Victoria", "Australia", -37.8136, 144.9631, 10, true],
    ["brisbane", "Brisbane", "Queensland", "Australia", -27.4698, 153.0251, 10, false],
    ["perth", "Perth", "Western Australia", "Australia", -31.9505, 115.8605, 8, false],
    ["adelaide", "Adelaide", "South Australia", "Australia", -34.9285, 138.6007, 9.5, true],
    ["canberra", "Canberra", "Australian Capital Territory", "Australia", -35.2809, 149.1300, 10, true],
    ["auckland", "Auckland", "Auckland", "New Zealand", -36.8485, 174.7633, 12, true],
    ["wellington", "Wellington", "Wellington", "New Zealand", -41.2866, 174.7756, 12, true],
    ["christchurch", "Christchurch", "Canterbury", "New Zealand", -43.5320, 172.6306, 12, true],
    ["suva", "Suva", "Central", "Fiji", -18.1248, 178.4501, 12, false],
    ["nadi", "Nadi", "Western", "Fiji", -17.7765, 177.4356, 12, false],
    ["port moresby", "Port Moresby", "National Capital", "Papua New Guinea", -9.4438, 147.1803, 10, false],
    ["dili", "Dili", "Dili", "Timor-Leste", -8.5569, 125.5603, 9, false],
    ["yangon,rangoon", "Yangon", "Yangon", "Myanmar", 16.8409, 96.1735, 6.5, false],
    ["hanoi", "Hanoi", "Hanoi", "Vietnam", 21.0278, 105.8342, 7, false],
    ["ho chi minh city,saigon", "Ho Chi Minh City", "Ho Chi Minh City", "Vietnam", 10.8231, 106.6297, 7, false],
    ["phnom penh", "Phnom Penh", "Phnom Penh", "Cambodia", 11.5564, 104.9282, 7, false],
    ["vientiane", "Vientiane", "Vientiane", "Laos", 17.9757, 102.6331, 7, false],
    ["bandar seri begawan", "Bandar Seri Begawan", "Brunei-Muara", "Brunei", 4.9031, 114.9398, 8, false],
    ["male,maldives", "Malé", "Malé", "Maldives", 4.1755, 73.5093, 5, false],
    ["port louis", "Port Louis", "Port Louis", "Mauritius", -20.1609, 57.5012, 4, false],
    ["victoria", "Victoria", "Mahé", "Seychelles", -4.6191, 55.4513, 4, false],
    ["kampala", "Kampala", "Kampala", "Uganda", 0.3476, 32.5825, 3, false],
    ["dar es salaam", "Dar es Salaam", "Dar es Salaam", "Tanzania", -6.7924, 39.2083, 3, false],
    ["addis ababa", "Addis Ababa", "Addis Ababa", "Ethiopia", 8.9806, 38.7578, 3, false],
    ["algiers", "Algiers", "Algiers", "Algeria", 36.7538, 3.0588, 1, false],
    ["casablanca", "Casablanca", "Casablanca-Settat", "Morocco", 33.5731, -7.5898, 1, true],
    ["tunis", "Tunis", "Tunis", "Tunisia", 36.8065, 10.1815, 1, false],
    ["tripoli", "Tripoli", "Tripoli", "Libya", 32.8872, 13.1913, 2, false],
    ["reykjavik", "Reykjavík", "Capital", "Iceland", 64.1466, -21.9426, 0, false],
    ["nicosia", "Nicosia", "Nicosia", "Cyprus", 35.1856, 33.3823, 2, true],
    ["malta,valletta", "Valletta", "Valletta", "Malta", 35.8989, 14.5146, 1, true],
    ["tbilisi", "Tbilisi", "Tbilisi", "Georgia", 41.7151, 44.8271, 4, false],
    ["yerevan", "Yerevan", "Yerevan", "Armenia", 40.1792, 44.4991, 4, false],
    ["baku", "Baku", "Baku", "Azerbaijan", 40.4093, 49.8671, 4, false],
    ["tashkent", "Tashkent", "Tashkent", "Uzbekistan", 41.2995, 69.2401, 5, false],
    ["almaty", "Almaty", "Almaty", "Kazakhstan", 43.2220, 76.8512, 5, false],
    ["ulaanbaatar", "Ulaanbaatar", "Ulaanbaatar", "Mongolia", 47.8864, 106.9057, 8, false],
    ["nur-sultan,astana", "Astana", "Astana", "Kazakhstan", 51.1694, 71.4491, 5, false]
  ];

  const PLACE_LOOKUP = {};
  CITIES.forEach((row) => {
    const entry = { name: row[1], state: row[2], country: row[3], lat: row[4], lon: row[5], tz: row[6], dst: row[7] };
    row[0].split(",").forEach((k) => { PLACE_LOOKUP[k.trim()] = entry; });
  });

  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,()\-–—]/g, " ").replace(/\s+/g, " ").trim();

  function cityNames() {
    const seen = new Set();
    const names = [];
    CITIES.forEach((row) => {
      const k = norm(row[1]);
      if (!seen.has(k)) { seen.add(k); names.push(row[1] + ", " + row[3]); }
    });
    return names.sort((a, b) => a.localeCompare(b));
  }

  function matchPlace(raw) {
    const rawT = String(raw || "").trim();
    if (!rawT) return null;

    // coordinates: "28.39, 77.31" | "28.39 N, 77.31 E" | "40.71, -74.01, -5" (lat, lon[, utc-offset])
    const rawLC = rawT.toLowerCase();
    const coordM = rawLC.match(/^(-?\d{1,3}(?:\.\d+)?)\s*([ns]?)\s*[,;/]\s*(-?\d{1,3}(?:\.\d+)?)\s*([ew]?)(?:\s*[,;/]\s*(-?\d{1,2}(?:\.\d+)?))?$/);
    if (coordM) {
      let lat = parseFloat(coordM[1]);
      let lon = parseFloat(coordM[3]);
      if (coordM[2] === "s" || /^-\d/.test(coordM[1])) lat = -Math.abs(lat);
      if (coordM[4] === "w" || /^-\d/.test(coordM[3])) lon = -Math.abs(lon);
      if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      let tz = 5.5; // coordinates without an explicit offset are assumed Indian time
      if (coordM[5] !== undefined && !isNaN(parseFloat(coordM[5])) && Math.abs(parseFloat(coordM[5])) <= 14) tz = parseFloat(coordM[5]);
      const tzGiven = coordM[5] !== undefined;
      return {
        name: "Custom coordinates", state: "", country: "coordinates", lat, lon, tz,
        dst: false, fromCoords: true,
        displayName: `${lat}°, ${lon}°` + (tzGiven ? ` · UTC${tz >= 0 ? "+" : ""}${tz}` : " · assumed UTC+5:30")
      };
    }

    const s = norm(rawT);
    if (!s) return null;
    // city match: full string, first comma-segment, or leading known key
    const candidates = [s].concat(s.split(",").map((x) => x.trim()).filter(Boolean));
    for (const cand of candidates) {
      if (PLACE_LOOKUP[cand]) return Object.assign({ fromCoords: false }, PLACE_LOOKUP[cand]);
    }
    const keys = Object.keys(PLACE_LOOKUP).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (s === k || s.startsWith(k + " ")) return Object.assign({ fromCoords: false }, PLACE_LOOKUP[k]);
    }
    return null;
  }

  /* ---------------- ephemeris (self-contained Meeus port) ------------
     Jean Meeus, "Astronomical Algorithms", 2nd ed. (1998):
       ch. 7  Julian Day (Gregorian)
       ch. 10 ΔT = TT − UT (polynomial branches + yearly table)
       ch. 12 Greenwich mean sidereal time (IAU-82 coefficients)
       ch. 22 nutation Δψ/Δε (Table 22.A, IAU 1980) & obliquity
       ch. 25 Sun (low-accuracy series; good to ~0.01°, 1900-2100)
       ch. 47 Moon (Table 47.A: 60 longitude terms + planetary
              addenda 3958·sin A₁ + 1962·sin(L′−F) + 318·sin A₂;
              latitude terms omitted — not needed for a chart)
     Results are APPARENT positions (true equinox of date): nutation
     Δψ is applied to Sun and Moon, aberration −20.4898″/R to the
     Sun, and Lagna/MC use the true obliquity ε₀ + Δε. Validated
     against an independent Meeus port and the published reference
     chart (Sun/Moon agree to < 2″, Lagna/MC < 12″). */

  const RAD = Math.PI / 180;
  const sinD = (x) => Math.sin(x * RAD);
  const cosD = (x) => Math.cos(x * RAD);
  function horner(x, ...c) {
    let a = 0;
    for (let i = c.length - 1; i >= 0; i--) a = a * x + c[i];
    return a;
  }

  /* -- ch. 7: Julian Day from a proleptic-Gregorian date + UTC hours -- */
  function jdFromUtc(y, m, d, utcHours) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1))
      + d + B - 1524.5 + (utcHours || 0) / 24;
  }

  /* -- ch. 10: ΔT = TT − UT in seconds. Polynomial branches per Meeus;
     DT_YEARLY holds observed ΔT at integer years 1657-2032 (sampled
     from the USNO/IERS series via astronomia), linearly interpolated
     between entries (error < ~0.5 s → < 0.3″ in the Moon). -- */
  const DT_FIRST = 1657;
  const DT_YEARLY = [
    44.00, 43.00, 40.00, 38.00, 37.00, 36.00, 37.00, 38.00, 36.00, 35.00, 34.00, 33.00,
    32.00, 31.00, 30.00, 29.00, 29.00, 28.00, 27.00, 26.00, 25.00, 25.00, 26.00, 26.00,
    25.00, 24.00, 24.00, 24.00, 24.00, 24.00, 23.00, 23.00, 22.00, 22.00, 22.00, 21.00,
    21.00, 21.00, 21.00, 20.00, 20.00, 20.00, 20.00, 21.00, 21.00, 20.00, 20.00, 19.00,
    19.00, 19.00, 20.00, 20.00, 20.00, 20.00, 20.00, 21.00, 21.00, 21.00, 21.00, 21.00,
    21.00, 21.00, 21.00, 21.10, 21.00, 20.90, 20.70, 20.40, 20.00, 19.40, 18.70, 17.80,
    17.00, 16.60, 16.10, 15.70, 15.30, 14.70, 14.30, 14.10, 14.10, 13.70, 13.50, 13.50,
    13.40, 13.40, 13.30, 13.20, 13.20, 13.10, 13.00, 13.30, 13.50, 13.70, 13.90, 14.00,
    14.10, 14.10, 14.30, 14.40, 14.60, 14.70, 14.70, 14.80, 14.90, 15.00, 15.20, 15.40,
    15.60, 15.60, 15.90, 15.90, 15.70, 15.70, 15.70, 15.90, 16.10, 15.90, 15.70, 15.30,
    15.50, 15.60, 15.60, 15.60, 15.50, 15.40, 15.20, 14.90, 14.60, 14.30, 14.10, 14.20,
    13.70, 13.30, 13.00, 13.20, 13.10, 13.30, 13.50, 13.20, 13.10, 13.00, 12.60, 12.60,
    12.00, 11.80, 11.40, 11.10, 11.10, 11.10, 11.10, 11.20, 11.50, 11.20, 11.70, 11.90,
    11.80, 11.80, 11.80, 11.60, 11.50, 11.40, 11.30, 11.13, 10.94, 10.29, 9.94, 9.88,
    9.72, 9.66, 9.51, 9.21, 8.60, 7.95, 7.59, 7.36, 7.10, 6.89, 6.73, 6.39,
    6.25, 6.25, 6.22, 6.22, 6.30, 6.35, 6.32, 6.33, 6.37, 6.40, 6.46, 6.48,
    6.53, 6.55, 6.69, 6.84, 7.03, 7.15, 7.26, 7.23, 7.21, 6.99, 7.19, 7.35,
    7.41, 7.36, 6.95, 6.45, 5.92, 5.15, 4.11, 2.94, 1.97, 1.04, 0.11, -0.82,
    -1.70, -2.48, -3.19, -3.84, -4.43, -4.79, -5.09, -5.36, -5.37, -5.34, -5.40, -5.58,
    -5.74, -5.69, -5.67, -5.73, -5.78, -5.86, -6.01, -6.28, -6.53, -6.50, -6.41, -6.11,
    -5.63, -4.68, -3.72, -2.70, -1.48, -0.08, 1.26, 2.59, 3.92, 5.20, 6.29, 7.68,
    9.13, 10.38, 11.64, 13.23, 14.69, 16.00, 17.19, 18.19, 19.13, 20.14, 20.86, 21.41,
    22.06, 22.51, 23.01, 23.46, 23.63, 23.95, 24.39, 24.34, 24.10, 24.02, 23.98, 23.89,
    23.93, 23.88, 23.91, 23.76, 23.91, 23.96, 24.04, 24.35, 24.82, 25.30, 25.77, 26.27,
    26.76, 27.27, 27.77, 28.25, 28.70, 29.15, 29.57, 29.97, 30.36, 30.72, 31.07, 31.35,
    31.68, 32.17, 32.67, 33.15, 33.58, 33.99, 34.47, 35.03, 35.74, 36.55, 37.43, 38.29,
    39.20, 40.18, 41.17, 42.23, 43.37, 44.48, 45.48, 46.46, 47.52, 48.53, 49.59, 50.54,
    51.38, 52.17, 52.96, 53.79, 54.34, 54.87, 55.32, 55.82, 56.30, 56.86, 57.57, 58.31,
    59.12, 59.98, 60.79, 61.63, 62.30, 62.97, 63.47, 63.83, 64.09, 64.30, 64.47, 64.57,
    64.69, 64.85, 65.15, 65.46, 65.78, 66.07, 66.32, 66.60, 66.91, 67.28, 67.64, 68.10,
    68.59, 68.97, 69.22, 69.36, 69.36, 69.29, 69.17, 68.37, 68.60, 68.83, 69.07, 69.31,
    69.58, 69.86, 70.16, 78.95
  ];
  function deltaTSeconds(dyear) {
    if (dyear < -500) { const u = (dyear - 1820) / 100; return horner(u, -20, 0, 32); }
    if (dyear < 500) return horner(dyear / 100, 10583.6, -1014.41, 33.78311, -5.952053, -0.1798452, 0.022174192, 0.0090316521);
    if (dyear < 1600) return horner((dyear - 1000) / 100, 1574.2, -556.01, 71.23472, 0.319781, -0.8503463, -0.005050998, 0.0083572073);
    if (dyear < DT_FIRST) return horner(dyear - 1600, 120, -0.9808, -0.01532, 1 / 7129);
    if (dyear < DT_FIRST + DT_YEARLY.length - 1) {
      const i = Math.min(Math.floor(dyear) - DT_FIRST, DT_YEARLY.length - 2);
      return DT_YEARLY[i] + (dyear - (DT_FIRST + i)) * (DT_YEARLY[i + 1] - DT_YEARLY[i]);
    }
    if (dyear < 2050) return horner((dyear - 2000) / 100, 62.92, 32.217, 55.89);
    if (dyear < 2150) return horner((dyear - 1820) / 100, -205.72, 56.28, 32);
    const u = (dyear - 1820) / 100;
    return -20 + 32 * u * u;
  }

  /* -- a moment in time: UTC Julian day + ΔT → TT. `tt`/`ut` are days
     since J2000.0, the same convention the rest of this module uses. -- */
  function astroMoment(y, m, d, utcHours) {
    const jdUtc = jdFromUtc(y, m, d, utcHours);
    const jdTt = jdUtc + deltaTSeconds(2000 + (jdUtc - 2451545.0) / 365.25) / 86400;
    return { jdUtc, jdTt, ut: jdUtc - 2451545.0, tt: jdTt - 2451545.0 };
  }

  /* -- ch. 22: nutation (Table 22.A, IAU 1980; terms < 0.0003″ dropped).
     Rows: [D, M, M′, F, Ω, s0, s1, c0, c1] with coefficients in 0.0001″. -- */
  const NUT_TAB = [
    0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9,
    -2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1,
    0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5,
    0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5,
    0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1,
    0, 0, 1, 0, 0, 712, 0.1, -7, 0,
    -2, 1, 0, 2, 2, -517, 1.2, 224, -0.6,
    0, 0, 0, 2, 1, -386, -0.4, 200, 0,
    0, 0, 1, 2, 2, -301, 0, 129, -0.1,
    -2, -1, 0, 2, 2, 217, -0.5, -95, 0.3,
    -2, 0, 1, 0, 0, -158, 0, 0, 0,
    -2, 0, 0, 2, 1, 129, 0.1, -70, 0,
    0, 0, -1, 2, 2, 123, 0, -53, 0,
    2, 0, 0, 0, 0, 63, 0, 0, 0,
    0, 0, 1, 0, 1, 63, 0.1, -33, 0,
    2, 0, -1, 2, 2, -59, 0, 26, 0,
    0, 0, -1, 0, 1, -58, -0.1, 32, 0,
    0, 0, 1, 2, 1, -51, 0, 27, 0,
    -2, 0, 2, 0, 0, 48, 0, 0, 0,
    0, 0, -2, 2, 1, 46, 0, -24, 0,
    2, 0, 0, 2, 2, -38, 0, 16, 0,
    0, 0, 2, 2, 2, -31, 0, 13, 0,
    0, 0, 2, 0, 0, 29, 0, 0, 0,
    -2, 0, 1, 2, 2, 29, 0, -12, 0,
    0, 0, 0, 2, 0, 26, 0, 0, 0,
    -2, 0, 0, 2, 0, -22, 0, 0, 0,
    0, 0, -1, 2, 1, 21, 0, -10, 0,
    0, 2, 0, 0, 0, 17, -0.1, 0, 0,
    2, 0, -1, 0, 1, 16, 0, -8, 0,
    -2, 2, 0, 2, 2, -16, 0.1, 7, 0,
    0, 1, 0, 0, 1, -15, 0, 9, 0,
    -2, 0, 1, 0, 1, -13, 0, 7, 0,
    0, -1, 0, 0, 1, -12, 0, 6, 0,
    0, 0, 2, -2, 0, 11, 0, 0, 0,
    2, 0, -1, 2, 1, -10, 0, 5, 0,
    2, 0, 1, 2, 2, -8, 0, 3, 0,
    0, 1, 0, 2, 2, 7, 0, -3, 0,
    -2, 1, 1, 0, 0, -7, 0, 0, 0,
    0, -1, 0, 2, 2, -7, 0, 3, 0,
    2, 0, 0, 2, 1, -7, 0, 3, 0,
    2, 0, 1, 0, 0, 6, 0, 0, 0,
    -2, 0, 2, 2, 2, 6, 0, -3, 0,
    -2, 0, 1, 2, 1, 6, 0, -3, 0,
    2, 0, -2, 0, 1, -6, 0, 3, 0,
    2, 0, 0, 0, 1, -6, 0, 3, 0,
    0, -1, 1, 0, 0, 5, 0, 0, 0,
    -2, -1, 0, 2, 1, -5, 0, 3, 0,
    -2, 0, 0, 0, 1, -5, 0, 3, 0,
    0, 0, 2, 2, 1, -5, 0, 3, 0,
    -2, 0, 2, 0, 1, 4, 0, 0, 0,
    -2, 1, 0, 2, 1, 4, 0, 0, 0,
    0, 0, 1, -2, 0, 4, 0, 0, 0,
    -1, 0, 1, 0, 0, -4, 0, 0, 0,
    -2, 1, 0, 0, 0, -4, 0, 0, 0,
    1, 0, 0, 0, 0, -4, 0, 0, 0,
    0, 0, 1, 2, 0, 3, 0, 0, 0,
    0, 0, -2, 2, 2, -3, 0, 0, 0,
    -1, -1, 1, 0, 0, -3, 0, 0, 0,
    0, 1, 1, 0, 0, -3, 0, 0, 0,
    0, -1, 1, 2, 2, -3, 0, 0, 0,
    2, -1, -1, 2, 2, -3, 0, 0, 0,
    0, 0, 3, 2, 2, -3, 0, 0, 0,
    2, -1, 0, 2, 2, -3, 0, 0, 0
  ];
  function nutationOf(daysTt) {
    const T = daysTt / 36525;
    const D = horner(T, 297.85036, 445267.11148, -0.0019142, 1 / 189474);
    const M = horner(T, 357.52772, 35999.05034, -0.0001603, -1 / 300000);
    const N = horner(T, 134.96298, 477198.867398, 0.0086972, 1 / 56250);
    const F = horner(T, 93.27191, 483202.017538, -0.0036825, 1 / 327270);
    const O = horner(T, 125.04452, -1934.136261, 0.0020708, 1 / 450000);
    let dPsi = 0, dEps = 0;
    for (let i = NUT_TAB.length - 9; i >= 0; i -= 9) { // small terms first
      const arg = NUT_TAB[i] * D + NUT_TAB[i + 1] * M + NUT_TAB[i + 2] * N
        + NUT_TAB[i + 3] * F + NUT_TAB[i + 4] * O;
      dPsi += sinD(arg) * (NUT_TAB[i + 5] + NUT_TAB[i + 6] * T);
      dEps += cosD(arg) * (NUT_TAB[i + 7] + NUT_TAB[i + 8] * T);
    }
    return { dPsi: dPsi * 1e-4 / 3600, dEps: dEps * 1e-4 / 3600 };
  }

  function trueObliquity(daysTt) {
    return meanObliquity(daysTt) + nutationOf(daysTt).dEps;
  }

  /* -- ch. 25: the Sun. True geometric longitude (mean equinox of date)
     plus center equation; apparent = + nutation Δψ + aberration. -- */
  function sunTrueLonAnomaly(T) {
    const L0 = horner(T, 280.46646, 36000.76983, 0.0003032);
    const M = horner(T, 357.52911, 35999.05029, -0.0001537);
    const C = horner(T, 1.914602, -0.004817, -0.000014) * sinD(M)
      + (0.019993 - 0.000101 * T) * sinD(2 * M)
      + 0.000289 * sinD(3 * M);
    return [clamp360(L0 + C), clamp360(M + C)];
  }

  function sunRadiusAU(T) {
    const ano = sunTrueLonAnomaly(T)[1];
    const e = horner(T, 0.016708634, -0.000042037, -0.0000001267);
    return 1.000001018 * (1 - e * e) / (1 + e * cosD(ano));
  }

  function sunApparentLon(daysTt) {
    const T = daysTt / 36525;
    const lon = sunTrueLonAnomaly(T)[0];
    return clamp360(lon + nutationOf(daysTt).dPsi - 20.4898 / (3600 * sunRadiusAU(T)));
  }

  /* -- ch. 47: the Moon. Table 47.A longitude terms (60) plus the
     planetary addenda; geometric position referenced to the mean
     equinox of date, apparent = + nutation Δψ. Rows: [D, M, M′, F,
     Σl (1e-6 °), Σr (1e-3 km)]; terms with |M| = 1 carry E, |M| = 2 E². -- */
  const MOON_TAU = [
    0, 0, 1, 0, 6288774, -20905355, 2, 0, -1, 0, 1274027, -3699111,
    2, 0, 0, 0, 658314, -2955968, 0, 0, 2, 0, 213618, -569925,
    0, 1, 0, 0, -185116, 48888, 0, 0, 0, 2, -114332, -3149,
    2, 0, -2, 0, 58793, 246158, 2, -1, -1, 0, 57066, -152138,
    2, 0, 1, 0, 53322, -170733, 2, -1, 0, 0, 45758, -204586,
    0, 1, -1, 0, -40923, -129620, 1, 0, 0, 0, -34720, 108743,
    0, 1, 1, 0, -30383, 104755, 2, 0, 0, -2, 15327, 10321,
    0, 0, 1, 2, -12528, 0, 0, 0, 1, -2, 10980, 79661,
    4, 0, -1, 0, 10675, -34782, 0, 0, 3, 0, 10034, -23210,
    4, 0, -2, 0, 8548, -21636, 2, 1, -1, 0, -7888, 24208,
    2, 1, 0, 0, -6766, 30824, 1, 0, -1, 0, -5163, -8379,
    1, 1, 0, 0, 4987, -16675, 2, -1, 1, 0, 4036, -12831,
    2, 0, 2, 0, 3994, -10445, 4, 0, 0, 0, 3861, -11650,
    2, 0, -3, 0, 3665, 14403, 0, 1, -2, 0, -2689, -7003,
    2, 0, -1, 2, -2602, 0, 2, -1, -2, 0, 2390, 10056,
    1, 0, 1, 0, -2348, 6322, 2, -2, 0, 0, 2236, -9884,
    0, 1, 2, 0, -2120, 5751, 0, 2, 0, 0, -2069, 0,
    2, -2, -1, 0, 2048, -4950, 2, 0, 1, -2, -1773, 4130,
    2, 0, 0, 2, -1595, 0, 4, -1, -1, 0, 1215, -3958,
    0, 0, 2, 2, -1110, 0, 3, 0, -1, 0, -892, 3258,
    2, 1, 1, 0, -810, 2616, 4, -1, -2, 0, 759, -1897,
    0, 2, -1, 0, -713, -2117, 2, 2, -1, 0, -700, 2354,
    2, 1, -2, 0, 691, 0, 2, -1, 0, -2, 596, 0,
    4, 0, 1, 0, 549, -1423, 0, 0, 4, 0, 537, -1117,
    4, -1, 0, 0, 520, -1571, 1, 0, -2, 0, -487, -1739,
    2, 1, 0, -2, -399, 0, 0, 0, 2, -2, -381, -4421,
    1, 1, 1, 0, 351, 0, 3, 0, -2, 0, -340, 0,
    4, 0, -3, 0, 330, 0, 2, -1, 2, 0, 327, 0,
    0, 2, 1, 0, -323, 1165, 1, 1, -1, 0, 299, 0,
    2, 0, 3, 0, 294, 0, 2, 0, -1, -2, 0, 8752
  ];
  function moonGeometricLon(daysTt) {
    const T = daysTt / 36525;
    const Lp = horner(T, 218.3164477, 481267.88123421, -0.0015786, 1 / 538841, -1 / 65194000);
    const D = horner(T, 297.8501921, 445267.1114034, -0.0018819, 1 / 545868, -1 / 113065000);
    const M = horner(T, 357.5291092, 35999.0502909, -0.0001536, 1 / 24490000);
    const Mp = horner(T, 134.9633964, 477198.8675055, 0.0087414, 1 / 69699, -1 / 14712000);
    const F = horner(T, 93.272095, 483202.0175233, -0.0036539, -1 / 3526000, 1 / 863310000);
    const A1 = 119.75 + 131.849 * T;
    const A2 = 53.09 + 479264.29 * T;
    const E = horner(T, 1, -0.002516, -0.0000074);
    const E2 = E * E;
    let sL = 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2);
    for (let i = 0; i < MOON_TAU.length; i += 6) {
      const m = MOON_TAU[i + 1];
      const k = m === 0 ? 1 : (m === 1 || m === -1 ? E : E2);
      sL += MOON_TAU[i + 4]
        * sinD(MOON_TAU[i] * D + m * M + MOON_TAU[i + 2] * Mp + MOON_TAU[i + 3] * F) * k;
    }
    return clamp360(Lp) + sL * 1e-6;
  }

  function moonApparentLon(daysTt) {
    return clamp360(moonGeometricLon(daysTt) + nutationOf(daysTt).dPsi);
  }

  /* -- ch. 12: Greenwich mean sidereal time, degrees ((12.2) + (12.4),
     IAU-82 coefficients; T at 0h UT1 of the date). -- */
  function gmstDeg(jdUtc) {
    const j0 = Math.floor(jdUtc + 0.5) - 0.5;          // JD of 0h UT1
    const f = jdUtc + 0.5 - Math.floor(jdUtc + 0.5);   // fraction of day elapsed
    const T = (j0 - 2451545.0) / 36525;
    const s = horner(T, 24110.54841, 8640184.812866, 0.093104, -0.0000062);
    return clamp360((s + f * 1.00273790935 * 86400) / 240);
  }

  /* -- Lagna (ascendant) & Midheaven from local sidereal time and the
     TRUE obliquity ε₀ + Δε (standard horizon/meridian formulas). -- */
  function ascendantDeg(latDeg, lonDeg, mom) {
    const lst = (gmstDeg(mom.jdUtc) + lonDeg) * RAD;
    const e = trueObliquity(mom.tt) * RAD;
    const phi = latDeg * RAD;
    return clamp360(Math.atan2(Math.cos(lst),
      -(Math.sin(lst) * Math.cos(e) + Math.tan(phi) * Math.sin(e))) * DEG);
  }

  function mcDeg(lonDeg, mom) {
    const lst = (gmstDeg(mom.jdUtc) + lonDeg) * RAD;
    const e = trueObliquity(mom.tt) * RAD;
    return clamp360(Math.atan2(Math.sin(lst), Math.cos(lst) * Math.cos(e)) * DEG);
  }

  function sunAt(mom) { return sunApparentLon(mom.tt); }
  function moonAt(mom) { return moonApparentLon(mom.tt); }

  function bodyToResult(tropicalLon, time, label) {
    const sidLon = clamp360(tropicalLon - ayanamsaAt(time.tt));
    const sign = signOf(sidLon);
    const trop = signOf(tropicalLon);
    return {
      lonSidereal: sidLon,
      lonTropical: tropicalLon,
      sign: sign.name, glyph: sign.glyph, element: sign.element, lord: sign.lord, degStr: sign.degStr,
      tropicalSign: trop.name, tropicalGlyph: trop.glyph, tropicalDegStr: trop.degStr
    };
  }

  /* Sun for a DOB-only reading: computed at UTC noon of that date, with a
     boundary flag when the Sun crosses a sign between 00:00–23:59 UTC. */
  function computeSunOnly(dob) {
    const p = parseDob(dob);
    if (!p) return null;
    const tNoon = astroMoment(p.y, p.m, p.d, 12);
    const tStart = astroMoment(p.y, p.m, p.d, 0);
    const tEnd = astroMoment(p.y, p.m, p.d, 23.983);
    const sun = bodyToResult(sunAt(tNoon), tNoon, "Sun");
    const sStart = clamp360(sunAt(tStart) - ayanamsaAt(tStart.tt));
    const sEnd = clamp360(sunAt(tEnd) - ayanamsaAt(tEnd.tt));
    return {
      sun,
      ayanamsa: ayanamsaAt(tNoon.tt),
      boundary: signOf(sStart).name !== signOf(sEnd).name,
      daySpan: [signOf(sStart).name, signOf(sEnd).name]
    };
  }

  /* Main entry: compute({dob:"YYYY-MM-DD", time:"HH:MM", place:"City, …"}) */
  function compute(input) {
    const p = parseDob(input && input.dob);
    if (!p) return { ok: false, reason: "dob" };
    const sunOnly = computeSunOnly(input.dob);
    const time = parseTime(input && input.time);
    const placeRaw = String((input && input.place) || "").trim();
    const place = placeRaw ? matchPlace(placeRaw) : null;

    const unlock = [];
    if (!time) unlock.push("your exact birth time");
    if (!place) unlock.push("your birth city / place");
    if (!unlock.length) unlock.push("a valid birthplace from the built-in atlas");

    if (!time || !place) {
      const missing = [];
      let placeUnmatched = false;
      if (!time) missing.push("your exact birth time");
      if (!place) {
        if (placeRaw) {
          placeUnmatched = true;
          missing.push("a birthplace the built-in atlas recognises — try “City, State” (e.g. Faridabad, India) or coordinates like “28.41, 77.32”");
        } else {
          missing.push("your birth city / place");
        }
      }
      return {
        ok: true, tier: "sun",
        sun: sunOnly.sun, ayanamsa: sunOnly.ayanamsa,
        boundary: sunOnly.boundary, daySpan: sunOnly.daySpan,
        missing: missing,
        placeUnmatched,
        place: null,
        engine: ENGINE
      };
    }

    // full chart: convert local clock time to UTC via the place's standard offset
    const tz = place.tz;
    const localMin = time.h * 60 + time.min;
    const utcMin = localMin - tz * 60;
    const utcHours = utcMin / 60;
    const t = astroMoment(p.y, p.m, p.d, utcHours);
    const tNoon = astroMoment(p.y, p.m, p.d, 12);

    const sun = bodyToResult(sunAt(t), t, "Sun");
    const moon = bodyToResult(moonAt(t), t, "Moon");
    moon.nakshatra = nakshatraOf(moon.lonSidereal);
    const asc = ascendantDeg(place.lat, place.lon, t);
    const lagna = bodyToResult(asc, t, "Lagna");
    const mc = bodyToResult(mcDeg(place.lon, t), t, "Midheaven");
    const ayanamsa = ayanamsaAt(t.tt);

    return {
      ok: true, tier: "full",
      place: {
        name: place.name, state: place.state, country: place.country,
        lat: place.lat, lon: place.lon, tz: place.tz, dst: place.dst,
        fromCoords: place.fromCoords, displayName: place.displayName || place.name
      },
      moment: {
        localIso: `${p.y}-${pad2(p.m)}-${pad2(p.d)}T${pad2(time.h)}:${pad2(time.min)}`,
        utcIso: new Date(Date.UTC(p.y, p.m - 1, p.d, 0, 0, 0) + utcHours * 3600000).toISOString(),
        tz
      },
      sun, moon, lagna, mc,
      ayanamsa,
      engine: ENGINE
    };
  }

  return {
    VERSION,
    ENGINE,
    compute,
    computeSunOnly,
    matchPlace,
    cityNames,
    signOf,
    nakshatraOf,
    ayanamsaForDate,
    ayanamsaAt,
    meanObliquity,
    trueObliquity,
    nutationOf,
    gmstDeg,
    jdFromUtc,
    astroMoment,
    deltaTSeconds,
    sunApparentLon,
    moonApparentLon,
    ascendantDeg,
    mcDeg,
    parseDob,
    parseTime,
    clamp360,
    DEG
  };
})();
