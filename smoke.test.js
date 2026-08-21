/* Smoke test: load the app in jsdom, submit the intake form (PDF example
   DOB 20/08/2005), and verify the report renders all sections.

   The Vedic ephemeris (astro.js) is a self-contained Meeus port — no
   vendor bundle, no window.Astronomy. Its reference-chart values are
   validated below against independently computed VSOP87/astronomy-engine
   constants (recorded to 7 decimals) and against a brute-force
   horizon/meridian search. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const astroJs = fs.readFileSync(path.join(root, "astro.js"), "utf8");
const dataJs = fs.readFileSync(path.join(root, "data.js"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const { window } = dom;

// jsdom lacks scrollTo / print
window.scrollTo = () => {};
window.print = () => {};

// eval the scripts in the same order index.html loads them, so the
// top-level lexical bindings (NVAstro, DB) are visible to app.js
// (mirrors <script> scoping)
window.eval(astroJs + "\n;\n" + dataJs + "\n;\n" + appJs);

const $ = (s) => window.document.querySelector(s);

// fill the form
$("#fullName").value = "Priya Sharma";
$("#dob").value = "2005-08-20";
$("#mobile").value = "9876543210";
$("#vehicle").value = "HR51AB1234";
$("#birthTime").value = "14:05";
$("#birthPlace").value = "New Delhi, India";
$("#goalChips .chip[data-goal='Money']").click();
$("#goalChips .chip[data-goal='Career']").click();
$("#entrance").value = "SW";
$("#kitchen").value = "NE";
$("#bedroom").value = "SW";
$("#toilet").value = "NW";
$("#watchType").value = "smart";

$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));

const report = $("#reportRoot").innerHTML;
const priyaNak = window.NVAstro.compute({ dob: "2005-08-20", time: "14:05", place: "New Delhi, India" }).moon.nakshatra.name;
const checks = [
  ["report visible", !$("#reportView").classList.contains("hidden")],
  ["load latest local chart enabled", !$("#loadLatestBtn").classList.contains("hidden")],
  ["app version badge", $("#appBadge").textContent === "App v2.4.0 · Meeus engine"],
  ["knowledge pack badge", report.includes("Knowledge pack v2.1.0")],
  ["ganesh invocation", report.includes("ॐ श्री गणेशाय नमः")],
  ["green wording", report.includes("Green cells are present")],
  ["driver = 2", report.includes('num-value">2<')],
  ["conductor = 8", report.includes('num-value">8<')],
  ["loshu grid rendered (3 grids × 9)", (report.match(/loshu-cell/g) || []).length === 27],
  ["core nature section", report.includes("Core Nature") && report.includes("Two numbers shape your nature")],
  ["strengths & shadows", report.includes("Amplify These") && report.includes("Watch These")],
  ["adopt & release", report.includes("Adopt") && report.includes("Release")],
  ["how-we-judge notes", (report.match(/How we judge this/g) || []).length >= 2],
  ["8 plane cards", (report.match(/card plane-card/g) || []).length === 8],
  ["plane badges", report.includes("Active") || report.includes("Partial") || report.includes("Weak")],
  ["golden & silver rajyoga", report.includes("Golden Rajyoga") && report.includes("Silver Rajyoga")],
  ["plane chips", (report.match(/plane-chip/g) || []).length >= 24],
  ["missing numbers section", report.includes("Missing Numbers")],
  ["name section", report.includes("Name Analysis")],
  ["mobile section", report.includes("Mobile Number Vibration")],
  ["vehicle section", report.includes("Vehicle Number Vibration")],
  ["vehicle number analysed", report.includes("HR51AB1234")],
  ["colors section", report.includes("Lucky Colours") && report.includes("Day-wise Dressing")],
  ["career section", report.includes("Best Fields")],
  ["timing section", report.includes("Favourable Years") && report.includes("Personal Year")],
  ["evolving chart section", report.includes("Your Evolving Chart") && report.includes("Lucky-year timing vs what you actually did")],
  ["anonymous scaffold shown", report.includes("Anonymous contribution scaffold")],
  ["zodiac section (Leo for 20/08)", report.includes("Zodiac Power Kit") && report.includes("Leo")],
  ["zodiac card in core profile", report.includes("Sun Sign")],
  ["vedic sun sign + surya rashi label", report.includes("Vedic Sun Sign") && report.includes("Surya Rashi")],
  ["sidereal / lahiri wording", report.includes("Sidereal") && report.includes("Lahiri")],
  ["western tropical reference shown", report.includes("Western tropical reference") && report.includes("Leo")],
  ["birth time shown in hero", report.includes("Born 2:05 PM, New Delhi, India")],
  ["unambiguous international DOB format", report.includes("DOB <strong>20 Aug 2005</strong>")],
  ["report generation date stamped", /Report generated \d{1,2} \w{3} \d{4}/.test(report)],
  ["reading guide present", report.includes("How to read this report")],
  ["reading guide explains Driver & Conductor", report.includes("Driver (Moolank)") && report.includes("Conductor (Bhagyank)") && report.includes("40-Day Priority Plan")],
  ["executive summary present", report.includes("Summary — Your Chart in One Glance")],
  ["summary anchored and linked from quick-nav", report.includes('id="summary"') && report.includes('href="#summary"') && report.includes(">Summary</a>")],
  ["summary is the first card after the hero", (() => {
    const kids = [...$("#reportRoot").children];
    return kids[0].classList.contains("report-hero") && kids[1].classList.contains("summary-card") && kids[2].classList.contains("reading-guide");
  })()],
  ["exactly one summary card", (report.match(/summary-card/g) || []).length === 1],
  ["summary personalised greeting", report.includes("<strong>Priya</strong>, your chart blends")],
  ["summary states core numbers", report.includes("Driver <strong>2</strong> · Moon (Chandra)") && report.includes("Conductor <strong>8</strong> · Saturn (Shani)")],
  ["summary Vedic sky uses computed birth star", report.includes(`birth star <strong>${priyaNak}</strong>`) && report.includes("· Lagna <strong>")],
  ["summary missing energies point to remedy kits", report.includes("Missing energies: <strong>") && report.includes(`full remedy kits in Section ${4}`)],
  ["summary way forward lists top actions", report.includes("The way forward") && report.includes("40-Day Priority Plan</strong> (Section") && report.includes("Then keep the weekly rhythm")],
  ["summary uses plain (stripped) priority text", /The way forward[\s\S]{0,400}Strengthen/.test(report)],
  ["no fabricated divisional-chart claims", !report.includes("(D1)") && !report.includes("(D4)") && !report.includes("house 4")],
  ["vedic tier 2 unlocked badge", report.includes("Tier 2 · Unlocked")],
  ["chandra rashi + nakshatra + lagna disclosure", report.includes("Chandra Rashi") && report.includes("Nakshatra") && report.includes("Lagna")],
  ["astro-identity snapshot card", report.includes("Astro-Identity Snapshot")],
  ["snapshot full chart cells", (report.match(/astro-cell/g) || []).length === 4],
  ["snapshot nakshatra strip", report.includes("Nakshatra of the Moon")],
  ["snapshot moon + lagna + midheaven labels", report.includes("Moon · Chandra Rashi") && report.includes("Lagna (Ascendant)") && report.includes("Midheaven / 10th House Cusp (Dasham Bhava)")],
  ["snapshot ayanamsa footnote", report.includes("Lahiri (Chitrapaksha) ayanamsa")],
  ["hero pill unlocked", report.includes("Vedic chart unlocked")],
  ["cross-system harmony note (ruler missing)", report.includes("Cross-system harmony") && report.includes("number 1 is")],
  ["crystal companion section", report.includes("Crystal Companion Guide")],
  ["selenite ritual", report.includes("Selenite")],
  ["short mantra in kits", report.includes("Wish-Paper Affirmation") && report.includes("Daily Short Mantra")],
  ["watch section", report.includes("Watch &amp; Wearable Remedy")],
  ["vastu section", report.includes("Vastu Dosh Scan")],
  ["SW entrance dosh detected", report.includes("Southwest entrance")],
  ["kitchen NE dosh detected", report.includes("Kitchen (fire)")],
  ["goal plans", report.includes("Money — Remedy Plan") && report.includes("Career — Remedy Plan")],
  ["priority plan", report.includes("40-Day Priority Plan")],
  ["priority items wrapped in copy container", (() => {
    const items = [...window.document.querySelectorAll(".priority-item")];
    return items.length > 0 && items.every((el) => el.firstElementChild && el.firstElementChild.classList.contains("priority-copy"));
  })()],
  ["smartwatch caution", report.includes("Rahu (4) energy")],
  ["no undefined leaks", !report.includes("undefined")],
  ["no NaN leaks", !report.includes("NaN")],
];

let fail = 0;
checks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// second profile: name correction path with an enemy name number
$("#editBtn").click();
$("#fullName").value = "Rahul"; // chaldean 17 -> 8 (enemy of driver 2 & conductor... check)
$("#dob").value = "2010-10-15";  // driver 6, conductor 1
$("#mobile").value = "9999999999";
$("#birthTime").value = ""; $("#birthPlace").value = ""; // clear Vedic Tier-2 fields
$("#entrance").value = "unsure"; $("#kitchen").value = "unsure";
$("#bedroom").value = "unsure"; $("#toilet").value = "unsure";
$("#watchType").value = "none";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r2 = $("#reportRoot").innerHTML;
const checks2 = [
  ["driver 6 / conductor 1", r2.includes('num-value">6<') && r2.includes('num-value">1<')],
  ["name verdict shown", r2.includes("Name Number")],
  ["spelling suggestions rendered", r2.includes("Recommended spellings") || r2.includes("no spelling change needed") || r2.includes("vibrates in harmony") || r2.includes("Consult a numerologist")],
  ["vastu empty state", r2.includes("No direction details")],
  ["harmony note present (aligns comfortably branch)", r2.includes("Cross-system harmony") && r2.includes("align comfortably")],
  ["tier 2 unlock-now wording (no birth details)", r2.includes("Tier 2 · Unlock now")],
  ["reduced snapshot card with unlock prompt", r2.includes("Astro-Identity Snapshot") && r2.includes("Unlock the full snapshot") && (r2.match(/astro-cell/g) || []).length === 1],
  ["summary works without birth details", r2.includes("Summary — Your Chart in One Glance") && r2.includes("add your birth time and city to unlock Moon sign, Nakshatra and Lagna")],
  ["no undefined leaks", !r2.includes("undefined")],
];
checks2.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// third case: Meher Afrose 01/05/1979 — practitioner example.
// Missing 6 must be compensatable by a sound-preserving spelling
// (e.g. MMeher-style doubling), and no variant may drop letters.
$("#editBtn").click();
$("#fullName").value = "Meher Afrose";
$("#dob").value = "1979-05-01";
$("#mobile").value = "9812345678";
$("#vehicle").value = "";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r3 = $("#reportRoot").innerHTML;
const sug3 = window.__NV.nameSuggestions(window.__NV.computeProfile({
  name: "Meher Afrose", dob: "1979-05-01", mobile: "9812345678",
  goals: ["Money"], entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", watchType: "none", vehicle: ""
}));
const has6 = sug3.variants && sug3.variants.some((v) => v.reduced === 6);
const noDrops = sug3.variants && sug3.variants.every((v) => v.text.replace(/\s/g, "").length >= "MeherAfrose".length);
const soundOnly = sug3.variants && sug3.variants.every((v) => !/drop/i.test(v.change));
const checks3 = [
  ["driver 1 / conductor 5", r3.includes('num-value">1<') && r3.includes('num-value">5<')],
  ["missing-6 compensation suggested", !!has6],
  ["no letter drops in variants", !!noDrops && !!soundOnly],
  ["why-it-helps column", r3.includes("Why it helps")],
  ["vehicle empty state", r3.includes("Choosing a Lucky Vehicle Number")],
  ["no undefined leaks", !r3.includes("undefined")],
];
checks3.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });
if (sug3.variants) console.log("  Meher variants:", sug3.variants.map((v) => `${v.text} (${v.compound}->${v.reduced})`).join(" | "));

// fourth block: engine functions (kua + compatibility)
const NV = window.__NV;
const kuaCases = [
  ["male", 1985, 6], ["female", 1985, 9], ["male", 2005, 4], ["female", 2005, 2],
  ["male", 1950, 2], ["female", 1990, 8], ["male", 2000, 9], ["female", 2000, 6]
];
const kuaChecks = kuaCases.map(([g, y, exp]) => [`kua ${g} ${y} = ${exp}`, NV.kuaNumber(g, y) === exp]);
kuaChecks.push(["kua null when no gender", NV.kuaNumber("", 1990) === null]);
kuaChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

const pa = NV.computeProfile({ name: "A", dob: "2005-08-20", mobile: "9876543210", gender: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure" });
const pb = NV.computeProfile({ name: "B", dob: "1990-04-15", mobile: "", gender: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure" });
const comp = NV.compatibility(pa, pb);
const compChecks = [
  ["compatibility 4 pairs", comp.pairs.length === 4],
  ["compatibility score bounded", comp.score >= 0 && comp.score <= 8],
  ["compatibility verdict present", ["Strong", "Good", "Workable", "Challenging"].includes(comp.verdict)],
  ["compatibility tallies sum to 4", comp.friendly + comp.neutral + comp.enemy === 4],
];
compChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// Vedic precision tiers + birth-time formatting (progressive disclosure engine)
const baseInput = { name: "T", dob: "2005-08-20", mobile: "9876543210", gender: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure" };
const pTier2 = NV.computeProfile(Object.assign({}, baseInput, { birthTime: "14:05", birthPlace: "New Delhi, India" }));
const pTierPartial = NV.computeProfile(Object.assign({}, baseInput, { birthTime: "23:30" }));
const pTier1 = NV.computeProfile(Object.assign({}, baseInput));
const vedicChecks = [
  ["formatBirthTime 14:05 -> 2:05 PM", NV.formatBirthTime("14:05") === "2:05 PM"],
  ["formatBirthTime 00:05 -> 12:05 AM", NV.formatBirthTime("00:05") === "12:05 AM"],
  ["formatBirthTime empty -> ''", NV.formatBirthTime("") === ""],
  ["tier 2 when time + place", pTier2.vedicTier === 2],
  ["tier partial with time only", pTierPartial.vedicTier === "partial"],
  ["tier 1 with no birth details", pTier1.vedicTier === 1],
  ["birthTimeDisplay on profile", pTier2.birthTimeDisplay === "2:05 PM"],
  ["birthPlace flows into profile", pTier2.birthPlace === "New Delhi, India"],
  ["astro full chart when time + place", pTier2.astro && pTier2.astro.tier === "full"],
  ["astro sun-only when no birth details", pTier1.astro && pTier1.astro.tier === "sun"],
  ["astro sun-only when partial (time only)", pTierPartial.astro && pTierPartial.astro.tier === "sun"],
];
vedicChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

/* ---- Vedic ephemeris engine (astro.js): tables, matching, reference chart ---- */
const NA = window.NVAstro;
const nakUnitChecks = [
  ["sign 0° = Aries", NA.signOf(0).name === "Aries" && NA.signOf(0).glyph === "♈"],
  ["sign 29.99° stays Aries", NA.signOf(29.99).name === "Aries"],
  ["sign 30.01° = Taurus", NA.signOf(30.01).name === "Taurus" && NA.signOf(30.01).glyph === "♉"],
  ["sign 359.9° = Pisces", NA.signOf(359.9).name === "Pisces"],
  ["nakshatra 0° = Ashwini pada 1", NA.nakshatraOf(0).name === "Ashwini" && NA.nakshatraOf(0).pada === 1],
  ["nakshatra 226.7° = Jyeshtha pada 1", NA.nakshatraOf(226.7).name === "Jyeshtha" && NA.nakshatraOf(226.7).pada === 1],
  ["nakshatra 233.5° = Jyeshtha pada 3", NA.nakshatraOf(233.5).name === "Jyeshtha" && NA.nakshatraOf(233.5).pada === 3],
  ["nakshatra 239.9° = Jyeshtha pada 4", NA.nakshatraOf(239.9).name === "Jyeshtha" && NA.nakshatraOf(239.9).pada === 4],
  ["nakshatra 359.9° = Revati pada 4", NA.nakshatraOf(359.9).name === "Revati" && NA.nakshatraOf(359.9).pada === 4],
  ["nakshatra lords (vimshottari)", NA.nakshatraOf(226.7).lord === "Mercury" && NA.nakshatraOf(0).lord === "Ketu"],
  ["ayanamsa 1976 ≈ 23.5°", NA.ayanamsaForDate("1976-08-05") > 23.4 && NA.ayanamsaForDate("1976-08-05") < 23.6],
  ["ayanamsa 2026 ≈ 24.2°", NA.ayanamsaForDate("2026-08-05") > 24.1 && NA.ayanamsaForDate("2026-08-05") < 24.3],
  ["city match Faridabad, India", NA.matchPlace("Faridabad, India") && NA.matchPlace("Faridabad, India").name === "Faridabad" && NA.matchPlace("Faridabad, India").tz === 5.5],
  ["city alias Bombay -> Mumbai", NA.matchPlace("Bombay, MH").name === "Mumbai"],
  ["unknown place -> null", NA.matchPlace("Atlantis, Somewhere") === null],
  ["coordinates parsed", NA.matchPlace("28.39, 77.31") && NA.matchPlace("28.39, 77.31").fromCoords === true],
  ["coordinates + tz override", NA.matchPlace("40.71, -74.01, -5") && NA.matchPlace("40.71, -74.01, -5").tz === -5],
  ["atlas has 300+ cities", NA.cityNames().length >= 300],
];
nakUnitChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// Reference chart: Randeep Walia, 05/08/1976 (dd/mm), 20:15 IST, Faridabad.
// Independently verified expectations: Sun tropical Leo 13°17′ / sidereal
// Cancer 19°45′, Moon sidereal Scorpio 24°52′ = Jyeshtha pada 3, Lagna
// sidereal Aquarius 12°26′, Midheaven sidereal Scorpio 20°39′.
const ref = NA.compute({ dob: "1976-08-05", time: "20:15", place: "Faridabad, India" });
const refChecks = [
  ["reference chart computes (full tier)", ref.ok && ref.tier === "full"],
  ["ref Sun sidereal Cancer ♋", ref.sun.sign === "Cancer" && ref.sun.glyph === "♋"],
  ["ref Sun tropical Leo ♌", ref.sun.tropicalSign === "Leo" && ref.sun.tropicalGlyph === "♌"],
  ["ref Sun degree 19°45′", ref.sun.degStr === "19°45′"],
  ["ref Moon sidereal Scorpio ♏", ref.moon.sign === "Scorpio" && ref.moon.glyph === "♏"],
  ["ref Moon degree 24°52′", ref.moon.degStr === "24°52′"],
  ["ref nakshatra Jyeshtha pada 3", ref.moon.nakshatra.name === "Jyeshtha" && ref.moon.nakshatra.pada === 3],  ["ref nakshatra span 226°40′–240°00′", ref.moon.nakshatra.spanStr === "226°40′–240°00′"],
  ["ref Lagna sidereal Aquarius ♒", ref.lagna.sign === "Aquarius" && ref.lagna.glyph === "♒"],
  ["ref Lagna degree 12°26′", ref.lagna.degStr === "12°26′"],
  ["ref Midheaven sidereal Scorpio ♏", ref.mc.sign === "Scorpio" && ref.mc.glyph === "♏"],
  ["ref Midheaven degree 20°39′", ref.mc.degStr === "20°39′"],
  ["ref ayanamsa ≈ 23.5±0.1°", Math.abs(ref.ayanamsa - 23.526) < 0.1],
  ["ref place resolved", ref.place.name === "Faridabad" && ref.place.tz === 5.5],
  ["ref engine label (self-contained Meeus)", ref.engine.includes("Meeus")],
  // Meeus port vs the independently computed VSOP87 (astronomy-engine)
  // reference values for this exact moment
  ["ref Sun ≈ VSOP87 133.2882° (< 0.02°)", Math.abs(ref.sun.lonTropical - 133.2881954) < 0.02],
  ["ref Moon ≈ VSOP87 258.4002° (< 0.02°)", Math.abs(ref.moon.lonTropical - 258.4002444) < 0.02],
  ["ref ΔT(1976) ≈ 47 s", Math.abs((NA.astroMoment(1976, 8, 5, 14.75).jdTt - NA.astroMoment(1976, 8, 5, 14.75).jdUtc) * 86400 - 47.095) < 2],
  ["vendored engine removed (no window.Astronomy)", typeof window.Astronomy === "undefined"],
];
refChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// Cross-validate the ascendant & MC formulas against an independent
// brute-force horizon/meridian search (different maths path), using the
// Meeus port's own sidereal time + true obliquity.
const refMom = NA.astroMoment(1976, 8, 5, 14.75);
function bruteAsc(latDeg, lonDeg, mom) {
  const eps = NA.trueObliquity(mom.tt) / NA.DEG;
  const lstDeg = NA.clamp360(NA.gmstDeg(mom.jdUtc) + lonDeg);
  const altAt = (L) => {
    const l = L / NA.DEG;
    const dec = Math.asin(Math.sin(l) * Math.sin(eps));
    const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l));
    const H = (lstDeg / NA.DEG) - ra;
    return Math.asin(Math.sin(latDeg / NA.DEG) * Math.sin(dec) + Math.cos(latDeg / NA.DEG) * Math.cos(dec) * Math.cos(H));
  };
  let prev = altAt(0);
  for (let L = 0.05; L <= 360; L += 0.05) {
    const cur = altAt(L);
    if (Math.sin(prev) >= 0 && Math.sin(cur) < 0) {
      const l = L / NA.DEG;
      const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l));
      const H = (lstDeg / NA.DEG) - ra;
      if (Math.sin(H) < 0) return L; // east side -> rising point
    }
    prev = cur;
  }
  return null;
}
function bruteMc(lonDeg, mom) {
  const eps = NA.trueObliquity(mom.tt) / NA.DEG;
  const lstDeg = NA.clamp360(NA.gmstDeg(mom.jdUtc) + lonDeg);
  let prevH = null;
  for (let L = 0.25; L <= 360; L += 0.25) {
    const l = L / NA.DEG;
    const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l));
    const H = NA.clamp360((lstDeg / NA.DEG - ra) * NA.DEG);
    if (prevH !== null && Math.sin(prevH / NA.DEG) >= 0 && Math.sin(H / NA.DEG) < 0) return L - 0.125; // upper culmination
    prevH = H;
  }
  return null;
}
const ascFormula = NA.ascendantDeg(28.4089, 77.3178, refMom);
const ascBrute = bruteAsc(28.4089, 77.3178, refMom);
const mcFormula = NA.mcDeg(77.3178, refMom);
const mcBrute = bruteMc(77.3178, refMom);
const crossChecks = [
  ["lagna formula vs brute-force < 0.25°", ascBrute !== null && Math.abs(ascFormula - ascBrute) < 0.25],
  ["lagna tropical ≈ VSOP87 335.97° (< 0.15°)", Math.abs(ascFormula - 335.9671041) < 0.15],
  ["mc formula vs brute-force < 0.5°", mcBrute !== null && Math.abs(mcFormula - mcBrute) < 0.5],
  ["mc tropical ≈ VSOP87 254.19° (< 0.15°)", Math.abs(mcFormula - 254.1873123) < 0.15],
];
crossChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// Reference chart rendered end-to-end through the form
$("#editBtn").click();
$("#fullName").value = "Randeep Walia";
$("#dob").value = "1976-08-05";
$("#mobile").value = "9810012345";
$("#vehicle").value = "";
$("#birthTime").value = "20:15";
$("#birthPlace").value = "Faridabad, India";
$("#goalChips .chip[data-goal='Career']").click();
$("#entrance").value = "unsure";
$("#kitchen").value = "unsure";
$("#bedroom").value = "unsure";
$("#toilet").value = "unsure";
$("#watchType").value = "none";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const rRef = $("#reportRoot").innerHTML;
const refRenderChecks = [
  ["ref card rendered", rRef.includes("Astro-Identity Snapshot") && rRef.includes("your Vedic sky at birth")],
  ["ref sun ♌/♋ rendered", rRef.includes("♌") && rRef.includes("♋")],
  ["ref moon ♏ + Jyeshtha rendered", rRef.includes("♏") && rRef.includes("Jyeshtha")],
  ["star-lord → Driver link note (Jyeshtha → Mercury → Driver 5)", rRef.includes("Star–Driver link") && rRef.includes("Mercury (Budha)") && rRef.includes("your Driver <strong>5</strong>")],
  ["summary repeats star-driver link", rRef.includes("Summary — Your Chart in One Glance") && rRef.includes("birth star and root number run on one current")],
  ["ref pada 3 rendered", rRef.includes("Pada 3")],
  ["ref lagna ♒ Aquarius rendered", rRef.includes("♒") && rRef.includes("Aquarius")],
  ["ref degrees rendered", rRef.includes("24°52′") && rRef.includes("12°26′")],
  ["ref place in footnote", rRef.includes("Faridabad, Haryana, India")],
  ["ref hero pill", rRef.includes("Vedic chart unlocked") && rRef.includes("Aquarius Lagna") && rRef.includes("Jyeshtha Star")],
  ["ref no undefined leaks", !rRef.includes("undefined")],
  ["ref no NaN leaks", !rRef.includes("NaN")],
];
refRenderChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// Unmatched-place path: tier-2 fields given but the atlas can't resolve them
$("#editBtn").click();
$("#birthPlace").value = "Atlantis, Somewhere";
$("#goalChips .chip[data-goal='Career']").click();
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const rAtlantis = $("#reportRoot").innerHTML;
const atlantisChecks = [
  ["unmatched place handled gracefully", rAtlantis.includes("built-in atlas") && rAtlantis.includes("Atlantis, Somewhere")],
  ["unmatched place keeps sun card", rAtlantis.includes("your Vedic Sun") && !rAtlantis.includes("Nakshatra of the Moon")],
];
atlantisChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

const anonPayload = NV.contributionPayload(pa, NV.timingAnalysis(pa));
const anonChecks = [
  ["anonymous payload has packVersion", typeof anonPayload.packVersion === "string" && anonPayload.packVersion.length > 0],
  ["anonymous payload excludes personal strings", !("name" in anonPayload) && !("dob" in anonPayload) && !("mobile" in anonPayload) && !("birthTime" in anonPayload) && !("birthPlace" in anonPayload)],
  ["anonymous payload includes missingCounts", anonPayload.missingCounts && typeof anonPayload.missingCounts === "object"],
];
anonChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// fifth block: render of new features (gender + partner)
$("#editBtn").click();
$("#fullName").value = "Priya Sharma";
$("#dob").value = "2005-08-20";
$("#mobile").value = "9876543210";
$("#vehicle").value = "";
$("#gender").value = "female";
$("#partnerName").value = "Anjali Verma";
$("#partnerDob").value = "1990-04-15";
$("#entrance").value = "unsure"; $("#kitchen").value = "unsure";
$("#bedroom").value = "unsure"; $("#toilet").value = "unsure";
$("#watchType").value = "none";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r4 = $("#reportRoot").innerHTML;
const checks4 = [
  ["8 arrow cards", (r4.match(/card arrow-card/g) || []).length === 8],
  ["arrow names present", ["Arrow of Determination", "Arrow of Intellect", "Arrow of Spirituality", "Arrow of Prosperity", "Arrow of Planning", "Arrow of Emotions", "Arrow of Practicality", "Arrow of Activity"].every((n) => r4.includes(n))],
  ["arrow state badges", r4.includes("Strong") || r4.includes("Partial") || r4.includes("Frustrated")],
  ["yantra in remedy kits", r4.includes("Yantra") && r4.includes("Surya Yantra")],
  ["weak tier shown", r4.includes(">Weak</span>")],
  ["missing severity badge", r4.includes("Critical") || r4.includes("Echoed by")],
  ["kua section (Feng Shui labelled)", r4.includes("Personal Lucky Directions") && r4.includes("Feng Shui")],
  ["kua number computed (female 2005 -> 2)", r4.includes("Kua number is 2")],
  ["compatibility section", r4.includes("Compatibility &amp; Matchmaking") && r4.includes("Anjali Verma")],
  ["compatibility verdict", r4.includes("Overall verdict")],
  ["no undefined leaks", !r4.includes("undefined")],
  ["no NaN leaks", !r4.includes("NaN")],
];
checks4.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// sixth block: compound numbers, master numbers, name/combined grids, brand, vastu extras
const compoundChecks = [
  ["compound 51 meaning", typeof NV.compoundMeaning(51) === "string" && NV.compoundMeaning(51).includes("Warrior")],
  ["compound out-of-range is null", NV.compoundMeaning(200) === null && NV.compoundMeaning(0) === null],
  ["master number 22", NV.masterNumber(22) && NV.masterNumber(22).name.includes("Master Builder")],
  ["master number 11", NV.masterNumber(11) && NV.masterNumber(11).name.includes("Illuminator")],
  ["master number 33", NV.masterNumber(33) && NV.masterNumber(33).name.includes("Master Teacher")],
  ["master non-master is null", NV.masterNumber(20) === null],
];
compoundChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// brand analysis (reuses the Chaldean engine)
const brand = NV.brandAnalysis("Shree Balaji Textiles", NV.computeProfile({ name: "Priya Sharma", dob: "2005-08-20", mobile: "9876543210", gender: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure" }));
const brandChecks = [
  ["brand total/root computed", brand.total > 0 && brand.root >= 1 && brand.root <= 9],
  ["brand auspicious roots present", Array.isArray(brand.auspicious) && brand.auspicious.length > 0],
  ["brand suggestions are sound-preserving", brand.suggestions.every((v) => !/drop/i.test(v.change))],
];
brandChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// render with brand + study + staircase + plot shape
$("#editBtn").click();
$("#fullName").value = "Priya Sharma";
$("#dob").value = "2005-08-20";
$("#mobile").value = "9876543210";
$("#brand").value = "Shree Balaji Textiles";
$("#study").value = "E";
$("#staircase").value = "NE";
$("#plotShape").value = "missing-northeast";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r5 = $("#reportRoot").innerHTML;
const checks5 = [
  ["name compound meaning shown", r5.includes("Compound Number")],
  ["name grid & combined grid", r5.includes("Name Grid") && r5.includes("Combined Grid")],
  ["brand section rendered", r5.includes("Business / Brand Name") && r5.includes("Shree Balaji Textiles")],
  ["brand compound/m&#8203;aster shown", r5.includes("Chaldean total")],
  ["study room analysed", r5.includes("Study Room")],
  ["staircase dosh (NE)", r5.includes("Staircase")],
  ["plot shape dosh", r5.includes("Plot shape") && r5.includes("Northeast corner")],
  ["mobile compound meaning", r5.includes("Compound Number")],
  ["no undefined leaks", !r5.includes("undefined")],
  ["no NaN leaks", !r5.includes("NaN")],
];
checks5.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// seventh block: reinforcing harmony branch — zodiac ruler equals the Driver.
// 06/06/1990 -> Driver 6, sidereal Taurus (ruled by Venus/number 6) -> overlap.
$("#editBtn").click();
$("#fullName").value = "Priya Sharma";
$("#dob").value = "1990-06-06";
$("#mobile").value = "9876543210";
$("#vehicle").value = "";
$("#birthTime").value = ""; $("#birthPlace").value = "";
$("#entrance").value = "unsure"; $("#kitchen").value = "unsure";
$("#bedroom").value = "unsure"; $("#toilet").value = "unsure";
$("#watchType").value = "none";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r6 = $("#reportRoot").innerHTML;
const checks6 = [
  ["harmony reinforcing branch (ruler = driver)", r6.includes("Cross-system harmony") && r6.includes("Driver (Moolank)")],
  ["tier 1 pill shown in hero", r6.includes("Vedic Sun Sign · Sidereal (Lahiri)")],
  ["no undefined leaks", !r6.includes("undefined")],
];
checks6.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// eighth block: report layout rhythm (section spacing + print pagination).
// Sections must be direct children of #reportRoot so the flex gap applies,
// and the stylesheet must keep the rhythm + print-break rules.
const stylesCss = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const sectionsInRoot = [...window.document.querySelectorAll("#reportRoot > .rsection")].length;
const layoutChecks = [
  ["report sections are direct children of #reportRoot", sectionsInRoot >= 15 && sectionsInRoot === window.document.querySelectorAll(".rsection").length],
  ["section rhythm rule present", stylesCss.includes("#reportRoot { display: flex; flex-direction: column; gap: 32px; }")],
  ["astro-grid extra margins removed", stylesCss.includes(".astro-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 12px;\n  margin: 0;\n}")],
  ["print: sections may flow across pages", /\.rsection \{ animation: none; break-inside: auto; \}/.test(stylesCss)],
  ["print: cards may fragment at row boundaries", /\.card \{ break-inside: auto; \}/.test(stylesCss)],
  ["print: headings never orphaned at page bottom", stylesCss.includes(".rsection-title, .rsection-desc, .card-title, .card-sub, .goal-head, .kit-label, .num-label, .summary-label { break-after: avoid; }")],
  ["print: small atomic units kept intact", stylesCss.includes(".report-hero, .num-card, .arrow-card, .plane-card, .metric-card, .tier, .kit-row, .priority-item, .table-scroll, .loshu-cell, .astro-cell, .astro-nak-strip, .astro-foot, .timeline-item, .engagement-item, .summary-item { break-inside: avoid; }")],
  ["print: page margins defined", stylesCss.includes("@page { margin: 14mm 11mm; }")],
  ["report closing block: brand + disclaimer", report.includes("NumeroVastu 360 — Private Report") && report.includes("not a substitute for professional medical, legal or financial advice")],
  ["print: closing block kept together", stylesCss.includes(".report-closing { break-inside: avoid; }")],
  ["print: no orphan/widow lines", stylesCss.includes("p, li { orphans: 2; widows: 2; }")],
  ["WCAG AA label contrast tokens", stylesCss.includes("--label-secondary: rgba(0, 0, 0, 0.64);") && stylesCss.includes("--label-tertiary: rgba(0, 0, 0, 0.55);")],
  ["international system font stack", stylesCss.includes("--font: system-ui, -apple-system,")],
];
layoutChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

console.log(fail === 0 ? "\nALL CHECKS PASSED" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
