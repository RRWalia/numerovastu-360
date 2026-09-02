/* Smoke test: load the app in jsdom, submit the intake form (PDF example
   DOB 20/08/2005), and verify the report renders all sections in English, Hindi, and Gujarati.

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
const i18nJs = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const { window } = dom;

// jsdom lacks scrollTo / print
window.scrollTo = () => {};
window.print = () => {};

// eval the scripts in the same order index.html loads them, so the
// top-level lexical bindings (NVAstro, DB, I18N) are visible to app.js
// (mirrors <script> scoping)
window.eval(astroJs + "\n;\n" + dataJs + "\n;\n" + i18nJs + "\n;\n" + appJs);

const $ = (s) => window.document.querySelector(s);
const $$ = (s) => Array.from(window.document.querySelectorAll(s));

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
const checks = [
  ["report visible", !$("#reportView").classList.contains("hidden")],
  ["load latest local chart enabled", !$("#loadLatestBtn").classList.contains("hidden")],
  ["app version badge", $("#appBadge").textContent === "App v2.6.1 · Meeus engine"],
  ["build badge", $("#buildBadge").textContent === "Build 2026-09-02"],
  ["knowledge pack badge", report.includes("Knowledge pack v2.4.0")],
  ["ganesh invocation", report.includes("ॐ श्री गणेशाय नमः")],
  ["northstar summary section", report.includes("Northstar Summary") && report.includes("Your first three moves") && report.includes("Way forward")],
  ["northstar summary links to plan", report.includes('href="#plan-section"')],
  ["no summary/plan duplication", (() => {
    const summaryPart = report.slice(report.indexOf('id="summary-section"'), report.indexOf('id="core-profile"'));
    const summaryClean = !summaryPart.includes("Strengthen <strong>") && !summaryPart.includes("observe your Driver day") && !summaryPart.includes("Wear the aligned watch spec");
    const onceEach = (report.match(/observe your Driver day/g) || []).length === 1 && (report.match(/Wear the aligned watch spec/g) || []).length === 1;
    return summaryClean && onceEach;
  })()],
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
  ["karmic debt card renders (clean slate)", report.includes("Karmic Debt Check") && report.includes("Clean slate")],
  ["pinnacle & challenge card renders", report.includes("Four Life Phases") && report.includes("Pinnacle") && report.includes("Challenge")],
  ["pinnacle phase ages (20/08/2005 -> first ends 36-8=28)", report.includes("Ages 0–28") && report.includes("Ages 47+")],
  ["current pinnacle phase highlighted", report.includes('id="pinnacles-card"') && (report.match(/hl-row/g) || []).length >= 2],
  ["evolving chart section", report.includes("Your Evolving Chart") && report.includes("Lucky-year timing vs what you actually did")],
  ["anonymous scaffold shown", report.includes("Anonymous contribution scaffold")],
  ["zodiac section (Leo for 20/08)", report.includes("Zodiac Power Kit") && report.includes("Leo")],
  ["zodiac card in core profile", report.includes("Sun Sign")],
  ["vedic sun sign + surya rashi label", report.includes("Vedic Sun Sign") && report.includes("Surya Rashi")],
  ["sidereal / lahiri wording", report.includes("Sidereal") && report.includes("Lahiri")],
  ["western tropical reference shown", report.includes("Western tropical reference") && report.includes("Leo")],
  ["birth time shown in hero", report.includes("Born 2:05 PM, New Delhi, India")],
  ["vedic tier 2 unlocked badge", report.includes("Tier 2 · Unlocked")],
  ["chandra rashi + nakshatra + lagna disclosure", report.includes("Chandra Rashi") && report.includes("Nakshatra") && report.includes("Lagna")],
  ["astro-identity snapshot card", report.includes("Astro-Identity Snapshot")],
  ["snapshot full chart cells", (report.match(/astro-cell/g) || []).length === 4],
  ["snapshot nakshatra strip", report.includes("Nakshatra of the Moon")],
  ["snapshot moon + lagna + midheaven labels", report.includes("Moon · Chandra Rashi") && report.includes("Lagna (Ascendant)") && report.includes("Midheaven (MC)")],
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
  ["40-day activation plan", report.includes("Your 40-Day Activation Plan") && report.includes("Daily Core Ritual") && report.includes("Weekly Rhythm")],
  ["plan phases rendered", report.includes("Days 1–7") && report.includes("Days 8–21") && report.includes("Days 22–40") && report.includes("Day 40+")],
  ["plan cadence chips", report.includes("cadence-daily") && report.includes("cadence-weekly") && report.includes("cadence-once")],
  ["40-day tracker grid", (report.match(/data-plan-day="/g) || []).length === 40 && report.includes("40-Day Tracker")],
  ["report nav includes plan", report.includes(">40-Day Plan</a>")],
  ["smartwatch caution", report.includes("Rahu (4) energy")],
  ["no undefined leaks", !report.includes("undefined")],
  ["excess energy card title", report.includes("Excess Energy") && report.includes("Channel It")],
  ["excess energy repeated number rendered", report.includes("repeated 3×") && report.includes("Moon (Chandra)")],
  ["excess energy overshoot + channel labels", report.includes("When it overshoots:") && report.includes("Channel it:")],
  ["excess energy guidance (no more fuel)", report.includes("give it direction, not more fuel")],
  ["ayurvedic dosha card renders", report.includes("Ayurvedic Dosha Layer") && report.includes('id="dosha-card"')],
  ["dosha blend from Driver + Conductor", report.includes("Blended constitution") && report.includes("Kapha–Vata") && report.includes("Vata")],
  ["dosha aggravation cross-ref in excess energy", report.includes("Dosha view:") && report.includes("repeated 3×")],
  ["dosha-aware 40-day plan line", report.includes("Dosha-aware rhythm:") && report.includes("anchor the morning ritual")],
  ["dosha disclaimer on card", report.includes("traditional wellness guidance") && report.includes("not a substitute for professional medical advice")],
  ["no NaN leaks", !report.includes("NaN")],
];

let fail = 0;
window.Element.prototype.scrollIntoView = window.Element.prototype.scrollIntoView || (() => {});
checks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// 40-day tracker interactions: toggle, persist, reset (first profile still on screen)
const qsa = (s) => Array.from(window.document.querySelectorAll(s));
qsa('[data-plan-day="1"]')[0].click();
qsa('[data-plan-day="2"]')[0].click();
let live = $("#reportRoot").innerHTML;
const trackerChecks = [
  ["tracker toggles two days", live.includes(">2/40<") && (live.match(/aria-pressed="true"/g) || []).length === 2],
  ["tracker highlights next day", live.includes("Day 3 is next")],
  ["tracker reset button appears", live.includes("data-plan-reset")],
];
qsa('[data-plan-day="1"]')[0].click();
live = $("#reportRoot").innerHTML;
trackerChecks.push(["tracker untoggles a day", live.includes(">1/40<") && live.includes("Day 1 is next")]);
qsa('[data-plan-reset]')[0].click();
live = $("#reportRoot").innerHTML;
trackerChecks.push(["tracker resets cycle", live.includes(">0/40<") && !live.includes("data-plan-reset")]);
qsa('[data-plan-day="7"]')[0].click();
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
live = $("#reportRoot").innerHTML;
trackerChecks.push(["tracker persists across re-submit", live.includes(">1/40<") && live.includes('data-plan-day="7" aria-pressed="true"')]);
trackerChecks.push(["tracker store is local-only", (() => { try { const s = JSON.parse(window.localStorage.getItem("nv360.plan.v1") || "{}"); const k = Object.keys(s)[0]; return !!k && Array.isArray(s[k].days); } catch { return false; } })()]);
trackerChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// Multi-language validation: Hindi (hi) & Gujarati (gu)
// 1. Switch to Hindi via UI and verify report
$('[data-lang="hi"]').click();
const rHi = $("#reportRoot").innerHTML;
const hindiChecks = [
  ["Hindi lang active", window.__NV.getLang() === "hi"],
  ["Hindi report hero title", rHi.includes("समाधान रिपोर्ट — Priya Sharma")],
  ["Hindi northstar summary", rHi.includes("मुख्य मार्गदर्शक सारांश") && rHi.includes("आपके पहले तीन कदम") && rHi.includes("आगे का रास्ता")],
  ["Hindi 40-day activation plan", rHi.includes("४०-दिवसीय") && rHi.includes("आपकी दैनिक मुख्य साधना") && rHi.includes("साप्ताहिक क्रम")],
  ["Hindi Loshu grid title", rHi.includes("आपका लो-शू ग्रिड — ८ तलों का संपूर्ण विश्लेषण")],
  ["Hindi Golden & Silver Rajyoga", rHi.includes("स्वर्ण राजयोग") && rHi.includes("रजत राजयोग")],
  ["Hindi planet name in grid", rHi.includes("चन्द्रमा") || rHi.includes("शनि")],
  ["Hindi weak number remedy", rHi.includes("निर्बल ग्रह") || rHi.includes("कमजोर कड़ी को मजबूत करें")],
  ["Hindi watch advice", rHi.includes("घड़ी") && (rHi.includes("धातु") || rHi.includes("डायल"))],
  ["Hindi Vastu dosh", rHi.includes("वास्तु दोष")],
  ["Hindi no undefined leaks", !rHi.includes("undefined")],
  ["Hindi no NaN leaks", !rHi.includes("NaN")],
  ["Hindi karmic + pinnacle titles", rHi.includes("कर्मऋण जाँच") && rHi.includes("जीवन के चार चरण")],
  ["Hindi ayurvedic dosha card", rHi.includes("आयुर्वेदिक दोष स्तर") && rHi.includes("मिश्रित प्रकृति")],
  ["Hindi dosha cross-ref + plan line", rHi.includes("दोष-दृष्टि") && rHi.includes("दोष-लय")],
  ["Hindi dosha disclaimer", rHi.includes("पारंपरिक") && rHi.includes("पेशेवर चिकित्सा सलाह")],
  ["Hindi intake form localized (label)", $('label[for="fullName"] span').textContent.includes("पूरा नाम")],
  ["Hindi intake form localized (placeholder)", $("#fullName").getAttribute("placeholder").includes("राहुल शर्मा")],
  ["Hindi error text localized", $("#err-mobile").textContent.includes("कम से कम ८ अंक")],
  ["Hindi goal chips localized", $('#goalChips .chip[data-goal="Money"]').textContent.includes("धन")],
];
hindiChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// 2. Switch to Gujarati via UI and verify report
$('[data-lang="gu"]').click();
const rGu = $("#reportRoot").innerHTML;
const gujaratiChecks = [
  ["Gujarati lang active", window.__NV.getLang() === "gu"],
  ["Gujarati report hero title", rGu.includes("ઉપાય રિપોર્ટ — Priya Sharma")],
  ["Gujarati northstar summary", rGu.includes("મુખ્ય માર્ગદર્શક સારાંશ") && rGu.includes("તમારા પ્રથમ ત્રણ પગલાં") && rGu.includes("આગળનો માર્ગ")],
  ["Gujarati 40-day activation plan", rGu.includes("૪૦ દિવસની") && rGu.includes("તમારી દૈનિક મુખ્ય સાધના") && rGu.includes("સાપ્તાહિક ક્રમ")],
  ["Gujarati Loshu grid title", rGu.includes("તમારો લો-શુ ગ્રીડ — ૮ સ્તરોનું સંપૂર્ણ વિશ્લેષણ")],
  ["Gujarati Golden & Silver Rajyoga", rGu.includes("સુવર્ણ રાજયોગ") && rGu.includes("રજત રાજયોગ")],
  ["Gujarati planet name in grid", rGu.includes("ચંદ્ર") || rGu.includes("શનિ")],
  ["Gujarati weak number remedy", rGu.includes("નિર્બળ ગ્રહ") || rGu.includes("નબળી કડીને બળવાન બનાવો")],
  ["Gujarati watch advice", (rGu.includes("કાંડા ઘડિયાળ") || rGu.includes("ઘડિયાળ")) && (rGu.includes("ધાતુ") || rGu.includes("ડાયલ"))],
  ["Gujarati Vastu dosh", rGu.includes("વાસ્તુ દોષ")],
  ["Gujarati no undefined leaks", !rGu.includes("undefined")],
  ["Gujarati no NaN leaks", !rGu.includes("NaN")],
  ["Gujarati karmic + pinnacle titles", rGu.includes("કર્મઋણ તપાસ") && rGu.includes("જીવનના ચાર તબક્કા")],
  ["Gujarati ayurvedic dosha card", rGu.includes("આયુર્વેદિક દોષ સ્તર") && rGu.includes("મિશ્ર પ્રકૃતિ")],
  ["Gujarati dosha cross-ref + plan line", rGu.includes("દોષ-દૃષ્ટિ") && rGu.includes("દોષ-લય")],
  ["Gujarati dosha disclaimer", rGu.includes("પરંપરાગત") && rGu.includes("વ્યાવસાયિક તબીબી સલાહ")],
];
gujaratiChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// 3. Switch back to English
$('[data-lang="en"]').click();
const rEn = $("#reportRoot").innerHTML;
const englishChecks = [
  ["English lang active", window.__NV.getLang() === "en"],
  ["English report hero title", rEn.includes("Remedy Report — Priya Sharma")],
  ["English northstar summary", rEn.includes("Northstar Summary")],
  ["English 40-day plan", rEn.includes("Your 40-Day Activation Plan")],
  ["English no undefined leaks", !rEn.includes("undefined")],
  ["English no NaN leaks", !rEn.includes("NaN")],
];
englishChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

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

// 3b: optional grid-filling spellings — name ALREADY harmonious (D6 C4, missing 2/3/7/8).
$("#editBtn").click();
$("#fullName").value = "Nayan Laxmichand Shah";
$("#dob").value = "1990-06-15";
$("#mobile").value = "9876543210";
$("#vehicle").value = "";
// Toggle Money off then back on so the shared goal-chip state is unchanged for
// the downstream reference-chart block (which clicks Career and needs ≥1 goal).
$("#goalChips .chip[data-goal='Money']").click();
$("#goalChips .chip[data-goal='Money']").click();
$("#entrance").value = "unsure"; $("#kitchen").value = "unsure";
$("#bedroom").value = "unsure"; $("#toilet").value = "unsure";
$("#watchType").value = "none";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r3b = $("#reportRoot").innerHTML;
const p3b = window.__NV.computeProfile({
  name: "Nayan Laxmichand Shah", dob: "1990-06-15", mobile: "9876543210",
  goals: ["Money"], entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", watchType: "none", vehicle: ""
});
const sug3b = window.__NV.nameSuggestions(p3b);
const opt3b = window.__NV.buildOptionalSpellings(p3b);
const optVariantFillsMissing = opt3b.variants.length > 0 && opt3b.variants.every((v) => p3b.missing.includes(v.reduced));
const optNonEnemy = opt3b.variants.every((v) => window.__NV.relation(p3b.driver, v.reduced) !== "enemy" && window.__NV.relation(p3b.conductor, v.reduced) !== "enemy");
const optNotRepeated = opt3b.variants.every((v) => !p3b.repeated.includes(v.reduced));
const optHarmonious = sug3b.needed === false;
const checks3b = [
  ["harmonious name needs no correction", optHarmonious],
  ["optional spellings fill a genuinely missing number", !!optVariantFillsMissing],
  ["optional spellings stay non-enemy to Driver & Conductor", !!optNonEnemy],
  ["optional spellings never add to an excessive number", !!optNotRepeated],
  ["optional enhancement card rendered", r3b.includes("Optional Enhancement") && r3b.includes("Optional only")],
  ["optional why-it-helps uses 'optional:' framing", r3b.includes("optional: fills your missing number")],
  ["no undefined leaks", !r3b.includes("undefined")],
  ["no NaN leaks", !r3b.includes("NaN")],
];
checks3b.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });
if (opt3b.variants) console.log("  Optional variants:", opt3b.variants.map((v) => `${v.text} (${v.compound}->${v.reduced}, fills ${v.targetN})`).join(" | "));

// 3c: excess-energy knowledge content — present for all nine numbers.
const ee = window.__NV.getActiveDB().excessEnergy || {};
const eeChecks = [
  ["excessEnergy data has 9 numbers", Object.keys(ee).length === 9],
  ["each number has en overshoot + channel", [1,2,3,4,5,6,7,8,9].every((n) => ee[n] && ee[n].overshoot && ee[n].overshoot.en && ee[n].channel && ee[n].channel.en)],
  ["each number has hindi + gujarati channel", [1,2,3,4,5,6,7,8,9].every((n) => ee[n] && ee[n].channel.hi && ee[n].channel.gu)],
  ["excessEnergy data in active DB via getActiveDB", window.__NV.getActiveDB().excessEnergy === ee],
];
eeChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// 3d: Ayurvedic dosha content + pure compute function.
const doshaDb = window.__NV.getActiveDB().dosha || {};
const doshaChecks = [
  ["dosha data has 9 numbers", Object.keys(doshaDb).length === 9],
  ["each number has dominant + en/hi/gu nature", [1,2,3,4,5,6,7,8,9].every((n) => doshaDb[n] && doshaDb[n].dominant && doshaDb[n].nature && doshaDb[n].nature.en && doshaDb[n].nature.hi && doshaDb[n].nature.gu)],
  ["each number has en/hi/gu aggravation + balancingFoods", [1,2,3,4,5,6,7,8,9].every((n) => doshaDb[n] && doshaDb[n].aggravation.en && doshaDb[n].aggravation.hi && doshaDb[n].aggravation.gu && doshaDb[n].balancingFoods.en && doshaDb[n].balancingFoods.hi && doshaDb[n].balancingFoods.gu)],
  ["each number has routine + mantraLinkedNote", [1,2,3,4,5,6,7,8,9].every((n) => doshaDb[n] && doshaDb[n].routine.en && doshaDb[n].routine.hi && doshaDb[n].routine.gu && doshaDb[n].mantraLinkedNote.en && doshaDb[n].mantraLinkedNote.hi && doshaDb[n].mantraLinkedNote.gu)],
];
doshaChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

const doshaProfile = window.__NV.computeProfile({
  name: "Priya Sharma", dob: "2005-08-20", mobile: "9876543210", goals: ["Money", "Career"],
  entrance: "SW", kitchen: "NE", bedroom: "SW", toilet: "NW", watchType: "smart", vehicle: "HR51AB1234"
}).doshaProfile;
const doshaProfileChecks = [
  ["doshaProfile blended from driver + conductor", doshaProfile.driverNumber === 2 && doshaProfile.conductorNumber === 8 && doshaProfile.primary === "Vata"],
  ["doshaProfile flags repeated 3+ as aggravation", doshaProfile.aggravated.some((a) => a.n === 2 && a.count >= 3)],
  ["doshaProfile exposes balanced/support gaps", typeof doshaProfile.counts.pitta === "number" && Array.isArray(doshaProfile.underSupported) && Array.isArray(doshaProfile.missingDosha)],
];
doshaProfileChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

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
  ["compatibility score bounded", comp.score >= 0 && comp.score <= 100],
  ["compatibility verdict present", ["Strong", "Good", "Workable", "Challenging"].includes(comp.verdict)],
  ["compatibility tallies sum to 4", comp.friendly + comp.neutral + comp.enemy === 4],
];
compChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// compatibility bridge remedies (engine)
const pc = NV.computeProfile({ name: "C", dob: "2000-01-01", mobile: "", gender: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure" });
const compC = NV.compatibility(pa, pc); // 2/7 vs 1/1 -> two enemy pairs (7 vs 1)
const cRemC = NV.compatRemedies(pa, pc, compC);
const cRem = NV.compatRemedies(pa, pb, comp);
const F = window.DB.friendship;
const bridgeOk = (rem, profA, profB) => rem.bridges.every((br) => [profA.driver, profA.conductor, profB.driver, profB.conductor].every((m) => F[m].enemies.indexOf(br.n) === -1));
const remedyChecks = [
  ["compatRemedies conflicts match enemy count", cRemC.conflicts.length === compC.enemy],
  ["conflicting pair has bridge guidance", cRemC.conflicts.every((c) => c.friction && c.bridge && c.friction.en && c.bridge.en)],
  ["conflicting pair names planets", cRemC.conflicts.every((c) => typeof c.planetA === "string" && typeof c.planetB === "string")],
  ["bridge numbers non-enemy to all four numbers", bridgeOk(cRemC, pa, pc) && bridgeOk(cRem, pa, pb)],
  ["bridge numbers ranked 1..9, max 3", cRemC.bridges.length <= 3 && cRemC.bridges.every((b) => b.n >= 1 && b.n <= 9)],
  ["clean pairing -> no conflicts, neutral plan", cRem.conflicts.length === comp.enemy && cRem.neutralLinks === comp.neutral],
];
remedyChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

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
  ["atlas has 600+ cities", NA.cityNames().length >= 600],
  ["Hargeisa, Capital of Somaliland resolves", NA.matchPlace("Hargeisa, Capital of Somaliland") && NA.matchPlace("Hargeisa, Capital of Somaliland").name === "Hargeisa" && NA.matchPlace("Hargeisa, Capital of Somaliland").tz === 3],
  ["country alias Somaliland -> Hargeisa", NA.matchPlace("Somaliland") && NA.matchPlace("Somaliland").name === "Hargeisa"],
  ["world capitals resolve (spot check)", ["Naypyidaw", "Brasília", "Dodoma", "Abuja", "Minsk", "Havana", "Nuuk", "Ankara", "Sri Jayawardenepura Kotte"].every((c) => NA.matchPlace(c))],
  ["country aliases resolve (spot check)", ["Nepal", "Bhutan", "Kenya", "Peru", "Chile", "New Zealand"].every((c) => NA.matchPlace(c))],
  ["atlas entries structurally sound", NA.cities().every((r) => Array.isArray(r) && r.length === 8 && Math.abs(r[4]) <= 90 && Math.abs(r[5]) <= 180 && r[6] >= -12 && r[6] <= 14 && typeof r[7] === "boolean")],
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
  ["ref nakshatra Jyeshtha pada 3", ref.moon.nakshatra.name === "Jyeshtha" && ref.moon.nakshatra.pada === 3],
  ["ref nakshatra span 226°40′–240°00′", ref.moon.nakshatra.spanStr === "226°40′–240°00′"],
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
  ["ref pada 3 rendered", rRef.includes("Pada 3")],
  ["ref lagna ♒ Aquarius rendered", rRef.includes("♒") && rRef.includes("Aquarius")],
  ["ref degrees rendered", rRef.includes("24°52′") && rRef.includes("12°26′")],
  ["ref place in footnote", rRef.includes("Faridabad, Haryana, India")],
  ["ref hero pill", rRef.includes("Vedic chart unlocked") && rRef.includes("Jyeshtha")],
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
  ["anonymous payload includes missingCounts", anonPayload.missingCounts !== undefined],
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
$("#partnerDob").value = "1990-05-06"; // driver 6, conductor 3 -> no enemy pairs vs 2/8
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
  ["compatibility remedy card", r4.includes("Compatibility remedy plan") && r4.includes("no clashes")],
  ["bridge numbers row (clean pairing)", r4.includes("Bridge numbers")],
  ["neutral-link activation (clean pairing)", r4.includes("Activate the neutral links")],
  ["no undefined leaks", !r4.includes("undefined")],
  ["no NaN leaks", !r4.includes("NaN")],
];
checks4.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// 4b: compatibility remedy card with a conflicting pairing (2/7 vs 1/1)
$("#editBtn").click();
$("#fullName").value = "Priya Sharma";
$("#dob").value = "2005-08-20";
$("#mobile").value = "9876543210";
$("#vehicle").value = "";
$("#gender").value = "female";
$("#partnerName").value = "Rahul Singh";
$("#partnerDob").value = "2000-01-01";
$("#entrance").value = "unsure"; $("#kitchen").value = "unsure";
$("#bedroom").value = "unsure"; $("#toilet").value = "unsure";
$("#watchType").value = "none";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r4b = $("#reportRoot").innerHTML;
const checks4b = [
  ["remedy card shows clash pair count", r4b.includes("clash pair(s)")],
  ["friction + bridge conduct rendered", r4b.includes("Couple remedy for this pair") && r4b.includes("🌉")],
  ["couple rituals with mantras", r4b.includes("11×") && r4b.includes("mantra")],
  ["bridge kit card for partner planet", r4b.includes("Bridge kit")],
  ["bridge numbers row", r4b.includes("Bridge numbers")],
  ["no undefined leaks", !r4b.includes("undefined")],
  ["no NaN leaks", !r4b.includes("NaN")],
];
checks4b.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

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

// karmic debt + pinnacles engine checks (classical formulas)
// "Priya" -> Chaldean 8+2+1+1+1 = 13; 16/07/1994 -> birth day 16 (debt),
// full-date sum 1+6+0+7+1+9+9+4 = 37 -> conductor 1 (no debt).
const kdp = NV.computeProfile({ name: "Priya", dob: "1994-07-16", mobile: "9876543210", gender: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure" });
const kdpMain = NV.computeProfile({ name: "Priya Sharma", dob: "2005-08-20", mobile: "9876543210", gender: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure" });
const kdpT = NV.timingAnalysis(kdpMain);
const karmicChecks = [
  ["karmic debt detected at unreduced subtotals", kdp.karmicDebts.length === 2 && kdp.karmicDebts.some((k) => k.n === 16 && k.source === "driver") && kdp.karmicDebts.some((k) => k.n === 13 && k.source === "name")],
  ["no false karmic debt on clean chart", kdpMain.karmicDebts.length === 0],
  ["dobCompound exposed (17 for 20/08/2005)", kdpMain.dobCompound === 17],
  ["pinnacles: 4 phases returned", kdpT.pinnacles && kdpT.pinnacles.phases.length === 4],
  ["pinnacle values 20/08/2005 -> 1,9,1,6", kdpT.pinnacles.phases.map((x) => x.pinnacle).join(",") === "1,9,1,6"],
  ["challenge values 20/08/2005 -> 6,5,1,1", kdpT.pinnacles.phases.map((x) => x.challenge).join(",") === "6,5,1,1"],
  ["first pinnacle ends at 36 - conductor", kdpT.pinnacles.firstEnd === 28 && kdpT.pinnacles.phases[0].to === 28 && kdpT.pinnacles.phases[1].from === 29],
  ["challenges stay within 0-8", kdpT.pinnacles.phases.every((x) => x.challenge >= 0 && x.challenge <= 8)],
  ["pure pinnacle fn export matches", NV.pinnacleAnalysis(kdpMain).phases[3].pinnacle === 6],
];
karmicChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

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
  ["brand compound/master shown", r5.includes("Chaldean total")],
  ["study room analysed", r5.includes("Study Room")],
  ["staircase dosh (NE)", r5.includes("Staircase")],
  ["plot shape dosh", r5.includes("Plot shape") && r5.includes("Northeast corner")],
  ["mobile compound meaning", r5.includes("Compound Number")],
  ["no undefined leaks", !r5.includes("undefined")],
  ["no NaN leaks", !r5.includes("NaN")],
];
checks5.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

// 6b: karmic debt profile rendered end-to-end (name "Priya" = 13, birth day 16)
$("#editBtn").click();
$("#fullName").value = "Priya";
$("#dob").value = "1994-07-16";
$("#mobile").value = "9876543210";
$("#vehicle").value = "";
$("#birthTime").value = ""; $("#birthPlace").value = "";
$("#brand").value = "";
$("#partnerName").value = ""; $("#partnerDob").value = "";
$("#entrance").value = "unsure"; $("#kitchen").value = "unsure";
$("#bedroom").value = "unsure"; $("#toilet").value = "unsure";
$("#watchType").value = "none";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const r5b = $("#reportRoot").innerHTML;
const checks5b = [
  ["karmic debt badge shows count", r5b.includes("Karmic Debt Check") && r5b.includes("2 found")],
  ["debt 16 humility content", r5b.includes("Debt of Humility") && r5b.includes("Birth day")],
  ["debt 13 effort content", r5b.includes("Debt of Effort") && r5b.includes("Name Chaldean total")],
  ["settling remedy rendered", r5b.includes("Settling remedy:")],
  ["debt resolved to root kit", r5b.includes("16 → 7") && r5b.includes("13 → 4")],
  ["karmic debt joins one-time plan", r5b.includes("Settle karmic debt 16")],
  ["pinnacle card still renders", r5b.includes("Four Life Phases")],
  ["no undefined leaks", !r5b.includes("undefined")],
  ["no NaN leaks", !r5b.includes("NaN")],
];
checks5b.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

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

// eighth block: intake validation guards (degenerate inputs must not render)
$("#editBtn").click();
$("#fullName").value = "Validation Probe";
$("#dob").value = "1990-06-06";
$("#mobile").value = "0000000000"; // all-zero: no planetary vibration
$("#vehicle").value = "";
$("#birthTime").value = ""; $("#birthPlace").value = "";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
const valChecks = [
  ["all-zero mobile rejected", !$("#err-mobile").hidden],
  ["degenerate input did not re-render report", !$("#reportRoot").innerHTML.includes("Validation Probe")],
];
$("#mobile").value = "9876543210";
$("#dob").value = "2999-01-01"; // future date
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
valChecks.push(["future DOB rejected", !$("#err-dob").hidden]);
valChecks.push(["future DOB did not re-render", !$("#reportRoot").innerHTML.includes("Validation Probe")]);
$("#dob").value = "1990-06-06";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
valChecks.push(["form recovers after valid submit", $("#reportRoot").innerHTML.includes("Validation Probe")]);
valChecks.forEach(([name, ok]) => { console.log((ok ? "PASS" : "FAIL") + "  " + name); if (!ok) fail++; });

console.log(fail === 0 ? "\nALL CHECKS PASSED" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
