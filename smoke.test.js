/* Hybrid release smoke suite.
   Exercises the two intentionally separate grid engines, authority boundaries,
   Dasha/Vastu timing, accessible module tabs, localisation and print/mobile
   hooks in jsdom. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const styles = read("styles.css");
const schema = JSON.parse(read("knowledge-pack/schema.json"));
const latestManifest = JSON.parse(read("knowledge-pack/latest.json"));
const serializedReleasePack = JSON.parse(read("knowledge-pack/packs/2.8.0.json"));
const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const { window } = dom;
window.scrollTo = () => {};
window.print = () => {};
window.requestAnimationFrame = (fn) => fn();
window.eval(["astro.js", "data.js", "i18n.js", "app.js"].map(read).join("\n;\n"));

const $ = (selector, rootNode) => (rootNode || window.document).querySelector(selector);
const $$ = (selector, rootNode) => Array.from((rootNode || window.document).querySelectorAll(selector));
let failed = 0;
function check(name, value) {
  const ok = !!value;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
function same(value, expected) { return JSON.stringify(value) === JSON.stringify(expected); }
function profile(overrides) {
  return window.__NV.computeProfile(Object.assign({
    name: "Priya Sharma", dob: "2005-08-20", mobile: "9876543210", vehicle: "HR51AB1234",
    goals: ["Money", "Career"], entrance: "SW", kitchen: "NE", bedroom: "SW", toilet: "NW",
    study: "E", staircase: "W", watchType: "smart", gender: "female", birthTime: "14:05", birthPlace: "New Delhi, India"
  }, overrides || {}));
}
function mount(markup) {
  const node = window.document.createElement("div");
  node.innerHTML = markup;
  return node;
}

/* ---- Independent calculation engines ---- */
const loShu = window.__NV.generateLoShuGrid(30, 6, 1986);
const vedic = window.__NV.generateVedicGrid(30, 6, 1986);
const loShuZeroDay = window.__NV.generateLoShuGrid(10, 10, 2000);
const vedicZeroDay = window.__NV.generateVedicGrid(10, 10, 2000);
const vedic19 = window.__NV.generateVedicGrid(19, 2, 2000);
const vedic28 = window.__NV.generateVedicGrid(28, 2, 2000);

check("classic Lo Shu layout is canonical", same(window.__NV.loShuGridLayout, [[4, 9, 2], [3, 5, 7], [8, 1, 6]]));
check("advanced Vedic layout is canonical", same(window.__NV.vedicGridLayout, [[3, 1, 9], [6, 7, 5], [2, 8, 4]]));
check("Lo Shu 30-06-1986 keeps all full-date digits and both roots", loShu.digits.join(",") === "3,6,1,9,8,6,3,6" && loShu.counts[3] === 2 && loShu.counts[6] === 3 && loShu.counts[1] === 1 && loShu.counts[9] === 1 && loShu.counts[8] === 1);
check("Lo Shu includes century digits and does not de-duplicate direct dates", loShu.raw.year === "1986" && loShu.sourceDigits.year.join(",") === "1,9,8,6" && loShuZeroDay.sourceDigits.day.join(",") === "1" && loShuZeroDay.counts[1] === 3);
check("Vedic 30-06-1986 retains filtered historical fixture", vedic.counts[3] === 1 && vedic.counts[6] === 3 && vedic.counts[8] === 1 && Object.values(vedic.counts).filter(Boolean).length === 3 && vedic.digits.join(",") === "6,8,6,3,6");
check("Vedic grid excludes century and de-duplicates direct date input", vedic.excluded.dayDeduplicated && vedic.raw.century === "19" && vedic.sourceDigits.year.join(",") === "8,6" && vedicZeroDay.excluded.dayDeduplicated && vedicZeroDay.counts[1] === 2 && vedicZeroDay.counts[4] === 1);
check("Vedic grid preserves compound-day raw digits and separate Moolank", !vedic19.excluded.dayDeduplicated && vedic19.counts[1] === 2 && vedic19.counts[9] === 1 && vedic19.counts[5] === 1 && !vedic28.excluded.dayDeduplicated && vedic28.counts[2] === 2 && vedic28.counts[8] === 1 && vedic28.counts[1] === 1 && vedic28.counts[5] === 1);

/* ---- Explicit profile namespaces and Lo Shu name/combined coordinates ---- */
const mappingProfile = profile({ name: "ACE", dob: "2000-01-10", goals: ["Money"] });
const loShuMarkup = mount(window.__NV.renderLoShuGrid(mappingProfile));
const loShuGrids = $$(".loshu-grid", loShuMarkup);
const cellMap = (grid, selector) => Object.fromEntries($$(selector, grid).map((cell) => [cell.dataset.gridNumber, cell]));
const nameCells = cellMap(loShuGrids[1], ".loshu-cell");
const combinedCells = cellMap(loShuGrids[2], ".loshu-cell");
check("profile exposes system-scoped grid fields only", mappingProfile.loShuCounts && mappingProfile.vedicCounts && mappingProfile.loShuMissing && mappingProfile.vedicMissing && mappingProfile.loShuNameCounts && mappingProfile.loShuCombinedCounts && !("counts" in mappingProfile) && !("missing" in mappingProfile));
check("Lo Shu renderer retains Birth, Name and Combined grids", loShuGrids.length === 3 && $$(".loshu-cell", loShuMarkup).length === 27);
check("Lo Shu Name grid coordinates follow 4-9-2 / 3-5-7 / 8-1-6", $$(".loshu-cell", loShuGrids[1]).map((cell) => cell.dataset.gridNumber).join(",") === "4,9,2,3,5,7,8,1,6" && ["1", "3", "5"].every((number) => nameCells[number].classList.contains("present")));
check("Lo Shu Combined grid adds name counts by number key", mappingProfile.loShuNameCounts[1] === 1 && mappingProfile.loShuNameCounts[3] === 1 && mappingProfile.loShuNameCounts[5] === 1 && mappingProfile.loShuCombinedCounts[1] === mappingProfile.loShuCounts[1] + mappingProfile.loShuNameCounts[1] && combinedCells["1"].classList.contains("multi") && combinedCells["3"].classList.contains("present") && !combinedCells["3"].classList.contains("multi"));
check("Lo Shu restores eight familiar planes and arrows", $$(".loshu-plane-card", loShuMarkup).length === 8 && $$(".arrow-card", loShuMarkup).length === 8 && loShuMarkup.textContent.includes("Mental Plane") && loShuMarkup.textContent.includes("Arrow of Planning"));

/* ---- Vedic advanced comparison: one birth grid, collapsed, no remedy list ---- */
const vedicMarkup = mount(window.__NV.renderVedicBirthComparison(mappingProfile));
check("advanced Vedic comparison is expanded so the birth grid prints in the PDF", !!$("details.advanced-vedic-comparison", vedicMarkup) && $("details.advanced-vedic-comparison", vedicMarkup).open);
check("advanced Vedic comparison renders only its Birth Grid", $$(".vedic-grid", vedicMarkup).length === 1 && $$(".vedic-cell", vedicMarkup).length === 9 && !vedicMarkup.textContent.includes("Vedic Name Grid") && !vedicMarkup.textContent.includes("Combined Vedic Grid"));
check("advanced Vedic cells keep Vedic coordinates and strength framing", $$(".vedic-cell", vedicMarkup).map((cell) => cell.dataset.gridNumber).join(",") === "3,1,9,6,7,5,2,8,4" && vedicMarkup.textContent.includes("Planetary Strength Indicators") && vedicMarkup.textContent.includes("not a missing-number remedy obligation"));

/* ---- Authority boundaries ---- */
const authorityProfile = profile({ dob: "1986-06-30" });
const alteredGridProfile = Object.assign({}, authorityProfile, {
  loShuCounts: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 9])),
  loShuMissing: [], loShuRepeated: [1, 2, 3], loShuWeak: [], loShuMissingSeverity: [],
  vedicCounts: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 0])),
  vedicMissing: [1, 2, 3, 4, 5, 6, 7, 8, 9], vedicRepeated: [], vedicWeak: []
});
const authorityReport = window.__NV.renderReport(authorityProfile);
const authorityReportDom = mount(authorityReport);
const partnerAuthorityProfile = profile({ dob: "1986-06-30", partnerName: "Arjun Patel", partnerDob: "2000-04-04" });
const partnerAuthorityReportDom = mount(window.__NV.renderReport(partnerAuthorityProfile));
const compatibilityAuthoritySection = $("#compatibility-section", partnerAuthorityReportDom);
const alignedPartnerProfile = profile({ partnerName: "Meera Shah", partnerDob: "1990-08-05" });
const alignedCompatibilitySection = $("#compatibility-section", mount(window.__NV.renderReport(alignedPartnerProfile)));
const basePractice = window.__NV.activationPlan(authorityProfile);
const alteredPractice = window.__NV.activationPlan(alteredGridProfile);
const baseCrystals = window.__NV.crystalGuide(authorityProfile);
const alteredCrystals = window.__NV.crystalGuide(alteredGridProfile);
const fixedDate = "2026-09-05T12:00:00Z";
const baseDasha = window.__NV.dashaTimeline(authorityProfile, fixedDate);
const alteredDasha = window.__NV.dashaTimeline(alteredGridProfile, fixedDate);
const activeLord = baseDasha.current.ad.n;
const expectedZone = window.__NV.getActiveDB().dasha[activeLord].zone.en;
check("Ayurvedic constitution derives only from Driver/Conductor", same(authorityProfile.doshaProfile, alteredGridProfile.doshaProfile) && !("aggravated" in authorityProfile.doshaProfile) && !("underSupported" in authorityProfile.doshaProfile));
check("guardian deities derive only from Driver/Conductor", same(authorityProfile.deityProfile, alteredGridProfile.deityProfile) && !("repeatedDeity" in authorityProfile.deityProfile) && !("underSupported" in authorityProfile.deityProfile));
const authorityDeityCard = $("#deity-card", authorityReportDom);
check("deity card scaffolds guiding archetypes, mantra, cadence, offerings and archetype guidance",
  !!authorityDeityCard &&
  authorityDeityCard.textContent.includes("Guiding Archetypes:") &&
  authorityDeityCard.textContent.includes("Short Mantra:") &&
  authorityDeityCard.textContent.includes("Cadence & Day:") &&
  authorityDeityCard.textContent.includes("Offerings:") &&
  authorityDeityCard.textContent.includes("Lord Vishnu / Lord Dakshinamurthy") &&
  authorityDeityCard.textContent.includes("Maa Lakshmi / Goddess Katyayani")
);
const activeDb = window.__NV.getActiveDB();
const expectedDeities = [
  { n: 1, arch: "Surya Narayana / Lord Rama", mantra: "ॐ घृणिः सूर्याय नमः (Om Ghrinih Suryaya Namah)", cadence: "11× at sunrise · 108× on Sundays", offerings: "Fresh water in a copper vessel (Arghya), red flowers, jaggery, or wheat" },
  { n: 2, arch: "Lord Shiva (Chandrashekhara) / Goddess Gauri (Parvati)", mantra: "ॐ नमः शिवाय (Om Namah Shivaya)", cadence: "11× morning on an empty stomach · 108× on Mondays", offerings: "Pure water, raw milk, white flowers, and bilva leaves" },
  { n: 3, arch: "Lord Vishnu / Lord Dakshinamurthy", mantra: "ॐ नमो भगवते वासुदेवाय (Om Namo Bhagavate Vasudevaya)", cadence: "11× before study, teaching, or major decisions · 108× on Thursdays", offerings: "Chana dal, yellow flowers, turmeric, tulsi leaves, and panak (honey water)" },
  { n: 4, arch: "Maa Durga / Lord Bhairava", mantra: "ॐ दुं दुर्गायै नमः (Om Dum Durgaye Namah)", cadence: "11× when plans feel erratic or overwhelming · 108× on Saturdays", offerings: "Kumkum, red flowers, sesame oil lamp, or feeding stray dogs" },
  { n: 5, arch: "Lord Ganesha / Lord Vishnu", mantra: "ॐ गं गणपतये नमः (Om Gam Ganapataye Namah)", cadence: "11× before commercial negotiations, writing, or calculations · 108× on Wednesdays", offerings: "Fresh green Durva grass, modak, green moong, or stationery donation" },
  { n: 6, arch: "Maa Lakshmi / Goddess Katyayani", mantra: "ॐ श्रीं महालक्ष्म्यै नमः (Om Shreem Mahalakshmyai Namah)", cadence: "11× morning before work · 108× on Fridays", offerings: "White or pink flowers (rose/lotus), kheer, white sweets, and fine natural scents" },
  { n: 7, arch: "Lord Ganesha / Shri Hanuman", mantra: "ॐ गं गणपतये नमः (Om Gam Ganapataye Namah)", cadence: "11× when facing isolation or mental confusion · 108× on Tuesdays or Saturdays", offerings: "21 Durva blades, red tilak, modak, or sesame oil lamp" },
  { n: 8, arch: "Shri Hanuman / Lord Shiva (Mahakaal)", mantra: "ॐ शं शनैश्चराय नमः (Om Sham Shanaischaraya Namah) or Hanuman Chalisa", cadence: "11× morning · 108× (or 1 Chalisa recital) on Saturdays", offerings: "Mustard oil lamp, black sesame seeds, and blue/dark flowers" },
  { n: 9, arch: "Maa Durga / Shri Hanuman (Lord Kartikeya)", mantra: "ॐ हं हनुमते नमः (Om Hum Hanumate Namah) or ॐ दुं दुर्गायै नमः (Om Dum Durgaye Namah)", cadence: "11× for courage before physical effort or confrontation · 108× on Tuesdays", offerings: "Red sindoor, jasmine oil lamp, jaggery with roasted gram, and red hibiscus" }
];
const all9Match = expectedDeities.every((exp) => {
  const d = activeDb.deity[exp.n];
  return d && d.archetypes && d.archetypes.en === exp.arch && d.mantra === exp.mantra && d.cadence.en === exp.cadence && d.offerings.en === exp.offerings && d.presentationCopy && d.presentationCopy.en.length > 20;
});
check("all 9 numbers scaffold exact guiding archetypes, mantras, cadences, offerings and presentation copy", all9Match);
check("Lo Shu alone chooses 40-day practice, lifestyle and remedial crystals", basePractice.targetN !== alteredPractice.targetN && !same(basePractice.daily, alteredPractice.daily) && same(basePractice.powerDays, alteredPractice.powerDays) && baseCrystals.remedyNumbers.join(",") === authorityProfile.loShuMissing.join(",") && alteredCrystals.remedyNumbers.length === 0 && alteredCrystals.picks.length === 0);
const stripGrade = (events) => events.map((event) => event.future.map((w) => Object.assign({}, w, { conversion: null })));
const gradesOf = (events) => events.flatMap((event) => event.future.map((w) => w.conversion.grade));
check("Dasha timing and event windows ignore both grid data sets", same(baseDasha.current, alteredDasha.current) && same(baseDasha.upcoming, alteredDasha.upcoming) && same(stripGrade(baseDasha.events), stripGrade(alteredDasha.events)));
check("natal strength grades conversion probability without deleting windows", gradesOf(alteredDasha.events).every((g) => g === "conditional") && gradesOf(baseDasha.events).some((g) => g !== "conditional") && gradesOf(baseDasha.events).length === gradesOf(alteredDasha.events).length);
check("active Vastu Zone follows the active Dasha lord", authorityReport.includes('data-dasha-vastu-zone="active"') && authorityReport.includes(`its sector is the <strong>${expectedZone}</strong>`) && authorityReport.includes("Active Vastu Zone: Prioritise this sector now"));
check("Vastu context visibly belongs to Timeline and does not set active zone", !!$("#timeline-panel #vastu-section", authorityReportDom) && !$("#foundation-panel #vastu-section", authorityReportDom) && $("#vastu-section", authorityReportDom).getAttribute("data-authority") === "home-vastu-context" && $("#vastu-section", authorityReportDom).textContent.includes("selected only from the current Dasha lords"));
check("rendered authority walls are explicit", authorityReport.includes('data-remedy-authority="lo-shu"') && authorityReport.includes('data-authority="driver-conductor"') && authorityReport.includes('id="dasha-section" data-authority="dasha"') && authorityReport.includes("Kua number is a Feng Shui (Chinese) system") && authorityReport.includes("They do not choose or change Lo Shu remedy targets"));
check("compatibility reflection is relational rather than a second remedy plan", !!compatibilityAuthoritySection && !!$(".compatibility-overview", compatibilityAuthoritySection) && !!$("#compatibility-reflection", compatibilityAuthoritySection) && !!$(".compatibility-strengths", compatibilityAuthoritySection) && $$(".compatibility-blind-spot", compatibilityAuthoritySection).length > 0 && $$(".compatibility-cue", compatibilityAuthoritySection).length > 0 && $$(".kit-row", compatibilityAuthoritySection).every((row) => row.textContent.trim().length > 0) && $$(".kit-card", compatibilityAuthoritySection).length === 0 && !$("#compat-remedies", compatibilityAuthoritySection) && !compatibilityAuthoritySection.textContent.includes("Couple remedy") && !compatibilityAuthoritySection.textContent.includes("run both partners' kits") && compatibilityAuthoritySection.textContent.includes("does not add crystals, Rudraksha, affirmations, lifestyle obligations or a second 40-day plan"));
check("aligned pairs still receive strengths, watchfulness and a communication cue", !!alignedCompatibilitySection && alignedCompatibilitySection.textContent.includes("Mutual strengths") && alignedCompatibilitySection.textContent.includes("Potential blind spots") && alignedCompatibilitySection.textContent.includes("Communication cue:") && $$(".compatibility-cue", alignedCompatibilitySection).length === 1 && $$(".kit-card", alignedCompatibilitySection).length === 0 && $$(".kit-row", alignedCompatibilitySection).every((row) => row.textContent.trim().length > 0));
check("Vedic comparison never produces a competing remedy checklist",  (authorityReport.match(/Missing Numbers — Lo Shu Remedies/g) || []).length === 1 && !authorityReport.includes("Vedic Name Grid") && !authorityReport.includes("Combined Vedic Grid") && !authorityReport.includes("Vedic remedy"));
check("40-day practice excludes static Vastu, dosha and deity prescriptions", !$("#plan-section", authorityReportDom).textContent.includes("Vastu correction") && !$("#plan-section", authorityReportDom).textContent.includes("Dosha-aware rhythm") && !$("#plan-section", authorityReportDom).textContent.includes("Ishta Devta chant"));

/* ---- PR #20 follow-up: formula display, MD×AD badge, plane readings, roadmap ---- */
const waliaProfile = profile({ name: "Randeep Walia", dob: "1978-01-31", goals: ["Career"], gender: "male", birthTime: "", birthPlace: "", partnerName: "", partnerDob: "" });
const waliaLoShu = mount(window.__NV.renderLoShuGrid(waliaProfile));
const waliaFormulas = $$(".root-formula", waliaLoShu);
const conductorFormula = waliaFormulas[1];
const conductorDigits = $$(".root-digit", conductorFormula).map((el) => el.textContent).join("");
check("31/01/1978 Conductor formula prints every DOB digit, including the leading 3 and the 0", waliaProfile.driver === 4 && waliaProfile.conductor === 3 && conductorDigits === "31011978" && conductorFormula.dataset.digitSum === "30" && conductorFormula.dataset.root === "3" && $(".root-total", conductorFormula).textContent === "30" && $(".root-result", conductorFormula).textContent === "3");
check("root formulas are grouped by day / month / year and never use a monospace digit string", $$(".root-group", conductorFormula).length === 3 && $$(".root-group", waliaFormulas[0]).length === 1 && !$(".vedic-formula", waliaLoShu) && !/\$/.test(conductorFormula.textContent) && /Calendar check: 31 \+ 1 \+ 1978 = 2010 → 3/.test(waliaLoShu.textContent));
check("reduction chain keeps every intermediate step", same(window.__NV.reductionChain(30), [30, 3]) && same(window.__NV.reductionChain(38), [38, 11, 2]) && same(window.__NV.reductionChain(4), [4]));

const waliaDasha = window.__NV.dashaTimeline(waliaProfile, fixedDate);
const waliaReport = mount(window.__NV.renderReport(waliaProfile));
const waliaDashaSection = $("#dasha-section", waliaReport);
const adBadge = $('[data-stack-badge="md-ad"] .badge', waliaDashaSection);
check("Rahu MD + Moon AD is the reference stack on 2026-09-05", waliaDasha.current.md.n === 4 && waliaDasha.current.ad.n === 2 && waliaDasha.current.pd.n === 5 && waliaDasha.current.pdDaysLeft <= 6);
check("Antardasha badge reflects the MD × AD relationship, not Driver × AD", !!adBadge && adBadge.dataset.mdAdRelation === "enemy" && adBadge.classList.contains("bad") && /Challenging/.test(adBadge.textContent) && !/Friendly to you/.test($('[data-stack-badge="md-ad"]', waliaDashaSection).textContent) && $(".predictive-synthesis", waliaDashaSection).dataset.mdAdRelation === "enemy");
check("Dual-Zone pairing is derived from the active lords rather than hard-coded", $("[data-dual-zone]", waliaDashaSection).dataset.dualZone === "2-4" && /North-West/.test($("[data-dual-zone]", waliaDashaSection).textContent) && /South-West/.test($("[data-dual-zone]", waliaDashaSection).textContent));

const micro = $(".dasha-micro-forecast", waliaDashaSection);
const microRows = $$("tr[data-micro-period]", micro);
check("rolling 90-day Pratyantar micro-forecast follows the current sub-period", !!micro && microRows.length >= 3 && microRows[0].classList.contains("hl-row") && microRows[0].dataset.microPeriod === "5" && microRows[1].dataset.microPeriod === "6" && $$("th", micro).length === 4 && /Vastu micro-action/.test(micro.textContent));
check("micro-forecast crosses into the next Antardasha and names it", waliaDasha.upcoming.some((u) => u.adChange && u.adN === 3) && waliaDasha.current.nextAd && waliaDasha.current.nextAd.n === 3 && $("[data-next-antardasha]", micro).dataset.nextAntardasha === "3" && /Next: Venus \(6\) takes over from/.test(waliaDashaSection.textContent));
check("next-horizon roadmap ignores grid data", same(window.__NV.dashaTimeline(Object.assign({}, waliaProfile, { vedicCounts: alteredGridProfile.vedicCounts, loShuCounts: alteredGridProfile.loShuCounts }), fixedDate).upcoming, waliaDasha.upcoming));

const transit = $(".dasha-transit-synthesis", waliaDashaSection);
check("Personal Year is synthesised with the active Dasha stack", !!transit && transit.dataset.personalYear === "6" && waliaDasha.current.personalYear === 6 && /Personal Year 6/.test(transit.textContent) && /Rahu–Moon stack/.test(transit.textContent) && /Defer/.test(transit.textContent) && /25 Oct 2026/.test(transit.textContent));

const waliaEvents = Object.fromEntries(waliaDasha.events.map((e) => [e.key, e]));
check("Venus wealth windows are retained and graded rather than purged", waliaEvents.wealth.future.some((w) => w.adN === 6) && waliaEvents.wealth.future.filter((w) => w.adN === 6).every((w) => w.conversion.grade !== "high") && waliaEvents.wealth.future.filter((w) => w.adN === 3).every((w) => w.conversion.grade === "high"));
check("event windows render a conversion-probability grade", $$('[data-window-grade="conditional"]', waliaDashaSection).length > 0 && $$('[data-window-grade="high"]', waliaDashaSection).length > 0 && /Conditional — activate the Vastu sector first/.test(waliaDashaSection.textContent) && /High probability — direct conversion/.test(waliaDashaSection.textContent));

/* ---- Clinical release: formula string, Sambhandha, triage, cockpit ---- */
const fmt = window.__NV.formatConductorBreakdown;
check("formatConductorBreakdown maps the exact DOB digits with no string artifacts", fmt("1978-01-31", 3) === "3 + 1 + 1 + 1 + 9 + 7 + 8 = 30 → 3" && fmt("31-01-1978", 3) === "3 + 1 + 1 + 1 + 9 + 7 + 8 = 30 → 3" && fmt("31011978", 3) === "3 + 1 + 1 + 1 + 9 + 7 + 8 = 30 → 3" && !/\$/.test(fmt("1978-01-31", 3)));
check("formatConductorBreakdown keeps intermediate reductions and single-step sums", fmt("2000-11-29", 6) === "2 + 9 + 1 + 1 + 2 = 15 → 6" && fmt("31", 4) === "3 + 1 = 4" && fmt("", 3) === "" && window.__NV.reductionChain(38).join(",") === "38,11,2");
const conductorPlainNode = $(".root-formula-plain", conductorFormula);
check("the printed Conductor block carries the deterministic plain-text equation", !!conductorPlainNode && conductorPlainNode.textContent === "3 + 1 + 1 + 1 + 9 + 7 + 8 = 30 → 3" && conductorPlainNode.dataset.plainFormula === conductorPlainNode.textContent && !/\+ 8 =/.test(conductorPlainNode.textContent.replace("7 + 8", "")));

const sambandha = window.__NV.getDashaRelationship;
const rahuMoon = sambandha(4, 2, 4);
check("Rahu MD × Moon AD is a Grahan conflict and can never be green", rahuMoon.relation === "enemy" && rahuMoon.grahan === true && rahuMoon.cssClass === "badge-conflict" && rahuMoon.tone === "bad" && /Grahan/.test(rahuMoon.guidance) && sambandha(2, 4, 2).relation === "enemy" && sambandha(4, 1, 4).grahan === true);
check("classical hostile pairs are symmetric even when a pack lists one side neutral", sambandha(3, 6, 1).relation === "enemy" && sambandha(6, 3, 1).relation === "enemy" && sambandha(9, 8, 1).relation === "enemy" && sambandha(8, 9, 1).relation === "enemy" && sambandha(1, 8, 1).relation === "enemy");
check("only a neutral MD × AD falls back to Driver compatibility", sambandha(5, 3, 1).relation === "neutral" && sambandha(5, 3, 1).source === "driver-fallback" && sambandha(5, 3, 3).cssClass === "badge-friendly" && sambandha(5, 3, 4).cssClass === "badge-neutral" && sambandha(4, 5, 4).source === "md-ad" && sambandha(4, 5, 4).cssClass === "badge-friendly");
check("the rendered Antardasha badge carries the Sambhandha source", adBadge.classList.contains("badge-conflict") && adBadge.dataset.sambandha === "grahan" && !adBadge.classList.contains("good") && /Grahan \(eclipse\) sub-period/.test($(".stack-badge-guidance", waliaDashaSection).textContent));

const qualify = window.__NV.qualifyEventWindow;
check("qualifyEventWindow grades instead of scrubbing natally absent significators", qualify([6, 2, 3], waliaProfile.vedicCounts, [4, 6]).natalStatus === "Absent" && qualify([6, 2, 3], waliaProfile.vedicCounts, [4, 6]).grade === "conditional" && /Vastu activation/.test(qualify([6, 2, 3], waliaProfile.vedicCounts, [4, 6]).clinicalNote) && qualify([6, 2, 3], waliaProfile.vedicCounts, [4, 3]).grade === "high" && qualify([6, 2, 3], waliaProfile.vedicCounts, [3, 6]).grade === "moderate" && qualify([6, 2], waliaProfile.vedicCounts, [4, 7]) === null);

const triage = window.__NV.remedyTriage(waliaProfile, waliaDasha, fixedDate);
check("triage prescribes exactly one acute target — the missing number that is live", triage.tier1.mode === "acute" && triage.tier1.n === 2 && /Antardasha lord 2/.test(triage.tier1.reasons.join(" ")) && triage.tier1.mantra === "Om Somaya Namah" && /27×/.test(triage.tier1.japa) && triage.tier1.day === "Monday");
check("remaining missing numbers are demoted to environmental Tier 2 with an activation date", triage.tier2.map((x) => x.n).sort().join(",") === "5,6" && triage.tier2.every((x) => /environmental cue only/i.test(x.hold) && x.unlockLabel) && triage.withheld.length === 3 && /cannot fast 3 days in 7/.test(triage.withheld.join(" ")));
const balancedTriage = window.__NV.remedyTriage(profile({ dob: "1987-06-25", name: "Balanced Client" }), null, fixedDate);
check("triage degrades safely for other charts", ["acute", "environmental", "maintenance"].includes(balancedTriage.tier1.mode) && Array.isArray(balancedTriage.tier2) && balancedTriage.activeNumbers.length > 0);

const cockpitData = window.__NV.practitionerCockpit(waliaProfile, fixedDate);
check("cockpit reads the same engines as the full report", cockpitData.core.driver === 4 && cockpitData.core.conductor === 3 && cockpitData.core.loShuMissing.join(",") === "2,5,6" && cockpitData.core.vedicMissing.join(",") === "2,5,6,9" && cockpitData.core.vedicStrong.join(",") === "1,3" && cockpitData.timing.md.n === 4 && cockpitData.timing.ad.n === 2 && cockpitData.timing.pd.n === 5 && cockpitData.timing.personalYear.n === 6 && cockpitData.timing.sambandha.grahan === true && cockpitData.vastu.primary.zone === "North-West" && cockpitData.vastu.anchor.zone === "South-West");
const cockpit = mount(window.__NV.renderPractitionerCockpit(waliaProfile, fixedDate));
const cockpitSheet = $(".cockpit-sheet", cockpit);
const cockpitBadge = $('[data-cockpit-ad-relation] .badge', cockpit);
check("cockpit renders one consolidated sheet with every clinical block", !!cockpitSheet && !!$('[data-cockpit-block="timing"]', cockpit) && !!$('[data-cockpit-block="triage"]', cockpit) && !!$('[data-cockpit-block="tier2"]', cockpit) && !!$('[data-cockpit-block="windows"]', cockpit) && $$(".cockpit-cell", cockpit).length === 3 && !/undefined|NaN/.test(cockpit.textContent));
check("cockpit shows the conflict, the sector fix and a single japa dose", cockpitBadge.classList.contains("badge-conflict") && !cockpitBadge.classList.contains("good") && /Grahan Yoga/.test(cockpitBadge.textContent) && $('[data-cockpit-block="triage"]', cockpit).dataset.tier1Number === "2" && /Om Somaya Namah/.test(cockpit.textContent) && /27×/.test(cockpit.textContent) && /North-West/.test(cockpit.textContent) && /South-West/.test(cockpit.textContent));
check("cockpit keeps absent-significator windows visible and graded", $$("[data-cockpit-window]", cockpit).length === 5 && $$('[data-grade="conditional"]', cockpit).length > 0 && $$('[data-grade="high"]', cockpit).length > 0 && /Conditional · remedy-led/.test(cockpit.textContent) && /Requires environmental Vastu activation/.test(cockpit.textContent));
check("cockpit prints as its own page and never splits a card", styles.includes("@page { size: A4 portrait; margin: 12mm 10mm; }") && styles.includes("body.print-cockpit #cockpit-panel { display: block !important; margin: 0; }") && styles.includes(".cockpit-block, .cockpit-sheet > * { break-inside: avoid; page-break-inside: avoid; }") && styles.includes(".badge.badge-conflict { background: var(--light-red-bg); color: #c92a36; }"));
const cockpitPrintTitle = $(".cockpit-sheet-title", cockpit);
check("cockpit keeps its single-page print contract: intro stripped, forced break, compact type", !!cockpitPrintTitle && /Practitioner Clinical Cockpit/.test(cockpitPrintTitle.textContent)
  && styles.includes(".cockpit-panel-heading { display: none !important; }")
  && styles.includes("#practitioner-cockpit.cockpit-section {")
  && styles.includes("break-before: page;")
  && styles.includes("font-size: 8.5pt;")
  && styles.includes(".cockpit-table { font-size: 7.5pt; line-height: 1.15; }")
  && styles.includes("body.print-cockpit .cockpit-section { margin: 0; break-before: auto; page-break-before: auto; }")
  && styles.includes(".skip-link, .report-nav, .module-tabs, .timeline-anchor-nav, .cockpit-toolbar { display: none !important; }"));
const waliaPlan = $("#plan-section", waliaReport);
const waliaTriageCard = $("#remedy-triage", waliaPlan);
check("the 40-day plan opens with a staged prescription instead of every remedy at once", !!waliaTriageCard && waliaTriageCard.dataset.tier1Number === "2" && /Om Somaya Namah/.test(waliaTriageCard.textContent) && $$('[data-triage-tier="2"]', waliaTriageCard).length === 2 && /Deliberately withheld this cycle/.test(waliaTriageCard.textContent) && $$('.priority-item[data-triage-tier="1"]', waliaPlan).length === 1 && $$('.priority-item[data-triage-tier="2"]', waliaPlan).length === 2 && /Tier 2 · hold/.test(waliaPlan.textContent));

const waliaCockpitPanel = $("#cockpit-panel", waliaReport);
check("cockpit is a first-class report module", !!waliaCockpitPanel && waliaCockpitPanel.getAttribute("role") === "tabpanel" && !!$("#practitioner-cockpit", waliaCockpitPanel) && window.__NV.reportModuleFromHash("#cockpit") === "cockpit" && window.__NV.reportModuleFromHash("#practitioner-cockpit") === "cockpit" && window.__NV.reportModuleFromHash("#dasha-section") === "timeline");

const waliaVedic = mount(window.__NV.renderVedicBirthComparison(waliaProfile));
const planeCards = $$(".vedic-plane-reading", waliaVedic);
const planeByKey = Object.fromEntries(planeCards.map((c) => [c.dataset.vedicPlane, c]));
check("Vedic planes receive qualitative readings", planeCards.length === 3 && planeByKey.practical.dataset.planeState === "partial" && /Jupiter \(3\)/.test(planeByKey.practical.textContent) && /Without Mars \(9\)/.test(planeByKey.practical.textContent) && /without Venus \(6\)/i.test(planeByKey.materialistic.textContent) && /without Mercury \(5\)/i.test(planeByKey.materialistic.textContent) && /Without Moon \(2\)/.test(planeByKey.emotional.textContent));
const emptyMaterial = window.__NV.vedicPlaneReadings(Object.assign({}, waliaProfile, { vedicCounts: Object.assign({}, waliaProfile.vedicCounts, { 7: 0 }) }), "en");
check("empty and complete plane states get dedicated sentences", emptyMaterial.find((pl) => pl.key === "materialistic").state === "empty" && /empty Material Plane/i.test(emptyMaterial.find((pl) => pl.key === "materialistic").reading) && window.__NV.vedicPlaneReadings(alteredGridProfile, "en").every((pl) => pl.state === "empty") && !/Vedic remedy/.test(waliaVedic.textContent));

const waliaTattva = window.__NV.vedicTattvaAnchors(waliaProfile, "en");
const waliaTattvaDom = mount(window.__NV.renderVedicTattvaSection(waliaProfile));
const tattvaCards = $$(".tattva-card", waliaTattvaDom);
const tattvaByKey = Object.fromEntries(tattvaCards.map((c) => [c.dataset.vedicPlane, c]));
const tattvaText = waliaTattvaDom.textContent;
check("Walia 4A emits Tattva cards only for partial or empty Vedic planes", waliaTattva.length === 3 && waliaTattva.every((pl) => pl.state === "partial") && tattvaCards.length === 3 && $("#tattva-section", waliaTattvaDom).getAttribute("data-authority") === "vedic-tattva" && /4A/.test($(".idx", waliaTattvaDom).textContent) && tattvaText.includes("Vedic Plane Harmonization — Elemental Tattva Balancing") && tattvaText.includes("without adding ritual fatigue"));
check("Tattva kits map Practical Agni, Materialistic Vayu and Emotional Jala", tattvaByKey.practical.textContent.includes("Agni / Fire Tattva") && /Surya Bhedana/.test(tattvaByKey.practical.textContent) && tattvaByKey.materialistic.textContent.includes("Vayu / Air Tattva") && /Nadi Shodhana/.test(tattvaByKey.materialistic.textContent) && tattvaByKey.emotional.textContent.includes("Jala / Water") && /Chandra Bhedana/.test(tattvaByKey.emotional.textContent) && /Behavioral Micro-Habit/.test(tattvaText) && /Aushadhi Snan/.test(tattvaText));
check("Tattva 4A never adds ritual, mineral or Lo Shu mandala stack", !/Vedic remedy/.test(tattvaText) && !/fast/i.test(tattvaText) && !/crystal/i.test(tattvaText) && !/rudraksha/i.test(tattvaText) && !/yantra/i.test(tattvaText) && !/beej/i.test(tattvaText) && !/\bring\b/i.test(tattvaText) && !/mala/i.test(tattvaText));
const completePractical = Object.assign({}, waliaProfile, { vedicCounts: Object.assign({}, waliaProfile.vedicCounts, { 3: 1, 1: 1, 9: 1 }) });
const completePracticalDom = mount(window.__NV.renderVedicTattvaSection(completePractical));
check("complete Practical plane suppresses the Agni Tattva card", window.__NV.vedicTattvaAnchors(completePractical, "en").every((pl) => pl.key !== "practical") && !$$(".tattva-card", completePracticalDom).some((c) => c.dataset.vedicPlane === "practical") && $$(".tattva-card", completePracticalDom).length === 2);
const allCompleteCounts = {};
for (let n = 1; n <= 9; n++) allCompleteCounts[n] = 1;
const allCompleteDom = mount(window.__NV.renderVedicTattvaSection(Object.assign({}, waliaProfile, { vedicCounts: allCompleteCounts })));
check("4A is omitted when every Vedic plane is complete", window.__NV.vedicTattvaAnchors(Object.assign({}, waliaProfile, { vedicCounts: allCompleteCounts }), "en").length === 0 && allCompleteDom.innerHTML.trim() === "");
const emptyTattva = window.__NV.vedicTattvaAnchors(Object.assign({}, waliaProfile, { vedicCounts: Object.assign({}, waliaProfile.vedicCounts, { 6: 0, 7: 0, 5: 0 }) }), "en");
check("empty Material plane still receives a Deficient Vayu card", emptyTattva.find((pl) => pl.key === "materialistic").state === "empty" && /Deficient/.test(mount(window.__NV.renderVedicTattvaSection(Object.assign({}, waliaProfile, { vedicCounts: Object.assign({}, waliaProfile.vedicCounts, { 6: 0, 7: 0, 5: 0 }) }))).textContent));

/* ---- Pack shape and canonical mappings ---- */
const validPack = window.__NV.validatePack(window.__NV_BUNDLED_PACK);
const malformedLoShu = JSON.parse(JSON.stringify(window.__NV_BUNDLED_PACK));
malformedLoShu.db.loShuGrid.layout = [[3, 1, 9], [6, 7, 5], [2, 8, 4]];
const malformedVedic = JSON.parse(JSON.stringify(window.__NV_BUNDLED_PACK));
malformedVedic.db.vedicGrid.layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
const malformedDasha = JSON.parse(JSON.stringify(window.__NV_BUNDLED_PACK));
malformedDasha.db.dasha[7].zone.en = "North-East";
const legacySchemaPack = JSON.parse(JSON.stringify(window.__NV_BUNDLED_PACK));
legacySchemaPack.schemaVersion = 1;
const missingDashaPack = JSON.parse(JSON.stringify(window.__NV_BUNDLED_PACK));
delete missingDashaPack.db.dasha;
check("hybrid knowledge pack validates and schema requires both grids plus Dasha", validPack.ok && schema.properties.schemaVersion.minimum === 2 && schema.properties.db.required.includes("loShuGrid") && schema.properties.db.required.includes("vedicGrid") && schema.properties.db.required.includes("dasha"));
check("serialized 2.8.0 release pack exactly matches the bundled hybrid pack", same(serializedReleasePack, window.__NV_BUNDLED_PACK) && window.__NV.validatePack(serializedReleasePack).ok && latestManifest.latestVersion === "2.8.0" && latestManifest.packUrl === "knowledge-pack/packs/2.8.0.json");
check("validator rejects crossed grids, malformed Dasha zones and legacy hybrid pack shapes", !window.__NV.validatePack(malformedLoShu).ok && !window.__NV.validatePack(malformedVedic).ok && !window.__NV.validatePack(malformedDasha).ok && !window.__NV.validatePack(legacySchemaPack).ok && !window.__NV.validatePack(missingDashaPack).ok);
check("canonical Vastu and Dasha mappings remain Vedic and independent of layouts", window.__NV_BUNDLED_PACK.db.vastu.directions.NE.planet === 3 && window.__NV_BUNDLED_PACK.db.vastu.directions.SW.planet === 4 && window.__NV_BUNDLED_PACK.db.dasha[7].zone.en === "North-East / Center Axis");

/* ---- End-to-end report, semantic tabs and URL/hash behavior ---- */
$("#fullName").value = "Priya Sharma";
$("#dob").value = "2005-08-20";
$("#mobile").value = "9876543210";
$("#goalChips .chip[data-goal='Money']").click();
$("#entrance").value = "SW";
$("#kitchen").value = "NE";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
check("onboarding opens Foundation by default", !$("#reportView").classList.contains("hidden") && $("#foundation-tab").getAttribute("aria-selected") === "true" && !$("#foundation-panel").hidden && $("#timeline-panel").hidden);
check("module tabs expose accessible semantics", $(".module-tabs").getAttribute("role") === "tablist" && $$("[role=tab]").length === 3 && $("#foundation-panel").getAttribute("role") === "tabpanel" && $("#timeline-panel").getAttribute("aria-labelledby") === "timeline-tab" && $("#cockpit-panel").getAttribute("aria-labelledby") === "cockpit-tab" && $("#cockpit-panel").hidden);
$("#timeline-tab").click();
check("Timeline tab updates selection, panels and URL hash", window.location.hash === "#timeline" && $("#timeline-tab").getAttribute("aria-selected") === "true" && !$("#timeline-panel").hidden && $("#foundation-panel").hidden);
$("#timeline-tab").dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
check("tab keyboard navigation returns to Foundation", window.location.hash === "#foundation" && $("#foundation-tab").getAttribute("aria-selected") === "true" && !$("#foundation-panel").hidden);
window.location.hash = "#dasha-section";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
check("deep Dasha hash activates Timeline before navigating", !$("#timeline-panel").hidden && $("#timeline-tab").getAttribute("aria-selected") === "true" && window.__NV.reportModuleFromHash("#vastu-section") === "timeline");
$("#cockpit-tab").click();
check("Cockpit tab opens the one-page practitioner sheet", window.location.hash === "#cockpit" && $("#cockpit-tab").getAttribute("aria-selected") === "true" && !$("#cockpit-panel").hidden && $("#timeline-panel").hidden && $("#foundation-panel").hidden && !!$("#cockpit-panel .cockpit-sheet"));
$("#printCockpitBtn").click();
check("cockpit print button narrows the print job to the cockpit page", window.document.body.classList.contains("print-cockpit"));
window.document.body.classList.remove("print-cockpit");
$("#foundation-tab").click();
const liveReport = $("#reportRoot").innerHTML;
check("full hybrid report has no undefined or NaN leakage", !liveReport.includes("undefined") && !liveReport.includes("NaN") && liveReport.includes("Lo Shu Blueprint") && liveReport.includes("Dasha Timeline"));

/* ---- Localisation plus static responsive/print safeguards ---- */
for (const language of ["hi", "gu"]) {
  window.__NV.setLanguage(language);
  const report = $("#reportRoot").innerHTML;
  const localizedCompatibility = $("#compatibility-section", mount(window.__NV.renderReport(partnerAuthorityProfile)));
  const terms = language === "hi"
    ? ["परस्पर शक्तियां", "संभावित सावधानी-बिंदु", "संवाद संकेत:"]
    : ["પરસ્પર શક્તિઓ", "સંભવિત સાવચેતીનો મુદ્દો", "સંવાદ સંકેત:"];
  check(`${language} labels localise both modules and advanced comparison`, $("#foundation-tab").textContent.trim().length > 0 && $("#timeline-tab").textContent.trim().length > 0 && report.includes(language === "hi" ? "उन्नत वैदिक तुलना" : "ઉન્નત વૈદિક તુલના") && report.includes(language === "hi" ? "लो शू ब्लूप्रिंट" : "લો શુ બ્લૂપ્રિન્ટ") && !report.includes("undefined") && !report.includes("NaN"));
  check(`${language} compatibility retains strengths, blind spots and communication cues`, !!localizedCompatibility && terms.every((term) => localizedCompatibility.textContent.includes(term)) && !localizedCompatibility.textContent.includes("undefined") && !localizedCompatibility.textContent.includes("NaN"));
}
check("mobile timeline navigation remains horizontally reachable", /@media \(max-width: 640px\)/.test(styles) && /\.report-nav \{ flex-wrap: nowrap; overflow-x: auto;/.test(styles) && /\.timeline-anchor-nav \{ flex-wrap: nowrap; overflow-x: auto;/.test(styles));
check("print/PDF expands both panels and the collapsed Vedic comparison", /@media print/.test(styles) && /\.report-module-panel\[hidden\] \{ display: flex !important; \}/.test(styles) && /\.advanced-vedic-comparison:not\(\[open\]\) > \.details-body \{ display: flex !important; \}/.test(styles));
check("print CSS keeps Tattva cards intact", /\.tattva-card/.test(styles) && /#tattva-section \{ break-inside: auto; page-break-inside: auto; \}/.test(styles));
check("Compatibility print layout keeps its overview and relational rows together", styles.includes("#compatibility-section { display: block; break-inside: auto; page-break-inside: auto; }") && styles.includes("#compatibility-section > * + * { margin-top: 16px; }") && styles.includes("#compatibility-section .compatibility-overview,") && styles.includes("#compatibility-section .compatibility-reflection-intro,") && styles.includes("#compatibility-section .kit-row,") && styles.includes("break-inside: avoid-page;") && styles.includes("#compatibility-section #compatibility-reflection { display: block; break-inside: auto; page-break-inside: auto; }"));

/* ---- Vedic ephemeris guardrail (restored): Meeus engine vs VSOP87 ----
   astro.js is a self-contained port of Jean Meeus ("Astronomical Algorithms")
   with no vendor bundle and no window.Astronomy. The blocks below pin it to
   independently computed VSOP87/astronomy-engine constants (recorded to 7
   decimals), cross-validate the ascendant/MC formulas against a brute-force
   horizon/meridian search (a different maths path), and verify the reference
   chart renders end-to-end. Ported verbatim from the pre-hybrid suite; only
   the reporter call was adapted to this file's check() helper. */
const NV = window.__NV;
window.Element.prototype.scrollIntoView = window.Element.prototype.scrollIntoView || (() => {});
window.__NV.setLanguage("en"); // harbour: localisation loop above ends in Gujarati; astro assertions need English strings

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
vedicChecks.forEach(([name, ok]) => check(name, ok));

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
nakUnitChecks.forEach(([name, ok]) => check(name, ok));

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
refChecks.forEach(([name, ok]) => check(name, ok));

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
crossChecks.forEach(([name, ok]) => check(name, ok));

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
refRenderChecks.forEach(([name, ok]) => check(name, ok));

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
atlantisChecks.forEach(([name, ok]) => check(name, ok));

if (failed) {
  console.error(`\n${failed} hybrid smoke check${failed === 1 ? "" : "s"} failed.`);
  process.exit(1);
}
console.log("\nAll hybrid smoke checks passed.");
