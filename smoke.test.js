/* Smoke test: load the app in jsdom, submit the intake form (PDF example
   DOB 20/08/2005), and verify the report renders all sections. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dataJs = fs.readFileSync(path.join(root, "data.js"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const { window } = dom;

// jsdom lacks scrollTo / print
window.scrollTo = () => {};
window.print = () => {};

// eval both scripts together so the top-level `const DB` lexical
// binding from data.js is visible to app.js (mirrors <script> scoping)
window.eval(dataJs + "\n;\n" + appJs);

const $ = (s) => window.document.querySelector(s);

// fill the form
$("#fullName").value = "Priya Sharma";
$("#dob").value = "2005-08-20";
$("#mobile").value = "9876543210";
$("#vehicle").value = "HR51AB1234";
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
  ["crystal companion section", report.includes("Crystal Companion Guide")],
  ["selenite ritual", report.includes("Selenite")],
  ["short mantra in kits", report.includes("Wish-Paper Affirmation") && report.includes("Daily Short Mantra")],
  ["watch section", report.includes("Watch &amp; Wearable Remedy")],
  ["vastu section", report.includes("Vastu Dosh Scan")],
  ["SW entrance dosh detected", report.includes("Southwest entrance")],
  ["kitchen NE dosh detected", report.includes("Kitchen (fire)")],
  ["goal plans", report.includes("Money — Remedy Plan") && report.includes("Career — Remedy Plan")],
  ["priority plan", report.includes("40-Day Priority Plan")],
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

const anonPayload = NV.contributionPayload(pa, NV.timingAnalysis(pa));
const anonChecks = [
  ["anonymous payload has packVersion", typeof anonPayload.packVersion === "string" && anonPayload.packVersion.length > 0],
  ["anonymous payload excludes personal strings", !("name" in anonPayload) && !("dob" in anonPayload) && !("mobile" in anonPayload)],
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

console.log(fail === 0 ? "\nALL CHECKS PASSED" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
