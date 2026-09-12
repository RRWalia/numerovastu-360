/* Hybrid release smoke suite.
   Exercises the two intentionally separate grid engines, authority boundaries,
   Dasha/Vastu timing, accessible module tabs, localisation and print/mobile
   hooks in jsdom. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const Ajv = require("ajv/dist/2020");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const styles = read("styles.css");
const schema = JSON.parse(read("knowledge-pack/schema.json"));
const latestManifest = JSON.parse(read("knowledge-pack/latest.json"));
const serializedReleasePack = JSON.parse(read("knowledge-pack/packs/2.8.0.json"));
const versionedPackFiles = fs.readdirSync(path.join(root, "knowledge-pack", "packs"))
  .filter((file) => /^\d+\.\d+\.\d+\.json$/.test(file))
  .sort();
const versionedPacks = versionedPackFiles.map((file) => ({ file, pack: JSON.parse(read(path.join("knowledge-pack", "packs", file))) }));
const schemaValidator = new Ajv({ allErrors: true, strict: false }).compile(schema);
const legacySchemaValidator = new Ajv({ allErrors: true, strict: false }).compile({
  type: "object",
  required: ["schemaVersion", "packVersion", "db"],
  properties: {
    schemaVersion: { const: 1 },
    packVersion: { type: "string" },
    db: {
      type: "object",
      required: ["chaldean", "friendship", "numbers", "watch", "traits", "missingFix", "yantra", "kua", "goals", "vastu", "careers", "dayWear", "personalYear", "spelling", "mantraShort", "zodiac", "crystals", "compound", "masterNumbers", "nameAdvice"],
      anyOf: [
        { required: ["loshuLayout", "planes", "arrows"] },
        { required: ["vedicGrid", "dasha"] }
      ]
    }
  }
});
const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const { window } = dom;
window.scrollTo = () => {};
window.print = () => {};
window.requestAnimationFrame = (fn) => fn();
window.eval(["astro.js", "atlas/atlas-in.js", "data.js", "i18n.js", "app.js"].map(read).join("\n;\n"));

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

check("every versioned knowledge pack is covered by schema validation", versionedPacks.every(({ pack }) => pack.schemaVersion === 1 ? legacySchemaValidator(pack) : schemaValidator(pack)));
check("every versioned knowledge pack carries the declared pack version", versionedPacks.every(({ file, pack }) => pack.packVersion === file.replace(/\.json$/, "")));

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
const remedyBlocks = $$("[data-remedy-authority]", authorityReportDom);
check("every remedy-bearing block declares Lo Shu authority", remedyBlocks.length > 0 && remedyBlocks.every((node) => node.getAttribute("data-remedy-authority") === "lo-shu"));
check("Vedic comparison cannot leak remedy authority", !$("#vedic-comparison", authorityReportDom)?.querySelector("[data-remedy-authority]") && !authorityReport.includes('data-remedy-authority="vedic'));
const policy = window.__NV.getActiveDB().dasha.relationshipPolicy;
policy.additionalHostilePairs = ["2-3"];
check("pack policy can add a hostile Sambandha pair", window.__NV.getDashaRelationship(2, 3, 1).relation === "enemy" && window.__NV.getDashaRelationship(2, 3, 1).source === "pack-sambandha-hostile");
policy.additionalHostilePairs = [];
check("classical hostile Sambandha remains enforced when pack policy is empty", window.__NV.getDashaRelationship(4, 2, 1).relation === "enemy" && window.__NV.getDashaRelationship(4, 2, 1).grahan);
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
const renderedWaliaDasha = window.__NV.dashaTimeline(waliaProfile);
const adBadge = $('[data-stack-badge="md-ad"] .badge', waliaDashaSection);
check("Rahu MD + Moon AD is the reference stack on 2026-09-05", waliaDasha.current.md.n === 4 && waliaDasha.current.ad.n === 2 && waliaDasha.current.pd.n === 5 && waliaDasha.current.pdDaysLeft <= 6);
check("Antardasha badge reflects the MD × AD relationship, not Driver × AD", !!adBadge && adBadge.dataset.mdAdRelation === "enemy" && adBadge.classList.contains("bad") && /Challenging/.test(adBadge.textContent) && !/Friendly to you/.test($('[data-stack-badge="md-ad"]', waliaDashaSection).textContent) && $(".predictive-synthesis", waliaDashaSection).dataset.mdAdRelation === "enemy");
check("Dual-Zone pairing is derived from the active lords rather than hard-coded", $("[data-dual-zone]", waliaDashaSection).dataset.dualZone === "2-4" && /North-West/.test($("[data-dual-zone]", waliaDashaSection).textContent) && /South-West/.test($("[data-dual-zone]", waliaDashaSection).textContent));

const micro = $(".dasha-micro-forecast", waliaDashaSection);
const microRows = $$("tr[data-micro-period]", micro);
check("rolling 90-day Pratyantar micro-forecast follows the current sub-period", !!micro && microRows.length >= 3 && microRows[0].classList.contains("hl-row") && microRows[0].dataset.microPeriod === String(renderedWaliaDasha.current.pd.n) && microRows[1].dataset.microPeriod === String((renderedWaliaDasha.current.pd.n % 9) + 1) && $$("th", micro).length === 4 && /Vastu micro-action/.test(micro.textContent));
check("micro-forecast crosses into the next Antardasha and names it", renderedWaliaDasha.current.nextAd && renderedWaliaDasha.upcoming.some((u) => u.adChange && u.adN === renderedWaliaDasha.current.nextAd.n) && $("[data-next-antardasha]", micro).dataset.nextAntardasha === String(renderedWaliaDasha.current.nextAd.n) && /Next:/.test(waliaDashaSection.textContent));
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
  ["core cityNames stay curated", NA.cityNames().length >= 600 && NA.cityNames().length < 2000],
  ["India atlas ingested", typeof NA.atlasSize === "function" && NA.atlasSize() > 6000],
  ["index.html wires the India atlas script tag", html.includes('<script src="atlas/atlas-in.js"></script>')],
  ["short query Et ranks Etah/Etawah without substring noise", (() => { const top = NA.searchPlaces("Et", 12); return top.length >= 2 && top[0].name === "Etah" && top.slice(0, 3).some((h) => h.name === "Etawah") && !top.some((h) => /Detroit|Ethiopia|Basseterre/.test(h.name)); })()],
  ["Faridabad core coords preserved", NA.matchPlace("Faridabad") && Math.abs(NA.matchPlace("Faridabad").lat - 28.4089) < 1e-4 && Math.abs(NA.matchPlace("Faridabad").lon - 77.3178) < 1e-4],
  ["birthPlace datalist stays empty until prefix search", $("#birthPlaceList") && $("#birthPlaceList").children.length === 0],
  ["manual lat/lon override unlocks place", (() => {
    const p = profile({ birthPlace: "Atlantis, Somewhere", birthLat: "28.4089", birthLon: "77.3178", birthTz: "5.5" });
    return p.astro && p.astro.tier === "full" && p.astro.place && p.astro.place.fromCoords;
  })()],
  ["India town Palwal resolves from compact atlas", NA.matchPlace("Palwal, Haryana, India") && NA.matchPlace("Palwal").name === "Palwal" && NA.matchPlace("Palwal").tz === 5.5],
  ["Dahod, Gujarat core coords", (() => {
    const a = NA.matchPlace("Dahod, Gujarat"), b = NA.matchPlace("Dohad");
    return a && a.name === "Dahod" && a.state === "Gujarat" && a.tz === 5.5
      && Math.abs(a.lat - 22.8356) < 1e-4 && Math.abs(a.lon - 74.2560) < 1e-4
      && b && b.name === "Dahod";
  })()],
  ["searchPlaces prefix does not require dumping datalist", NA.searchPlaces("palwal", 5).some((h) => /palwal/i.test(h.name))],
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

/* ---- dd-mm-yyyy date input boundary ---- */
const norm = window.__NV.normalizeDobInput;
const disp = window.__NV.formatDobForDisplay;
const dobChecks = [
  ["dd-mm-yyyy '05-08-1976' normalises to ISO", norm("05-08-1976") === "1976-08-05"],
  ["single digit day/month '5-8-1976' normalises to ISO", norm("5-8-1976") === "1976-08-05"],
  ["legacy ISO '1976-08-05' is accepted and unchanged", norm("1976-08-05") === "1976-08-05"],
  ["'05/08/1976' slash separator accepted", norm("05/08/1976") === "1976-08-05"],
  ["'05.08.1976' dot separator accepted", norm("05.08.1976") === "1976-08-05"],
  ["invalid day 31-02-1976 rejected", norm("31-02-1976") === ""],
  ["invalid month 05-13-1976 rejected", norm("05-13-1976") === ""],
  ["garbage input rejected", norm("not-a-date") === "" && norm("") === ""],
  ["ISO displays as dd-mm-yyyy", disp("1976-08-05") === "05-08-1976"],
  ["dd-mm-yyyy displays unchanged", disp("05-08-1976") === "05-08-1976"],
  ["empty displays empty", disp("") === ""],
];
dobChecks.forEach(([name, ok]) => check(`dob input: ${name}`, ok));

/* Live mask behaviour (real input events, as a browser/Playwright typing or
   pasting would fire). */
function fireDobInput(value) {
  $("#dob").value = value;
  $("#dob").dispatchEvent(new window.Event("input", { bubbles: true }));
  return $("#dob").value;
}
const maskedDd = fireDobInput("05081976");                       // digits only -> dd-mm-yyyy
const isoUnmangled = fireDobInput("2005-08-20");                 // pasted ISO stays untouched
const typedDd = fireDobInput("05-08-1976");                      // already dd-mm-yyyy unchanged
check("dob input: live mask turns bare digits into dd-mm-yyyy", maskedDd === "05-08-1976");
check("dob input: live mask does not mangle a pasted yyyy-mm-dd ISO", isoUnmangled === "2005-08-20");
check("dob input: live mask leaves typed dd-mm-yyyy intact", typedDd === "05-08-1976");

/* ---- Mobile number remedy: the ideal total list must never be blank ----
   A total friendly to *both* birth numbers does not exist for 24 of the 81
   Driver×Conductor pairs (Driver 6 × Conductor 1 among them), which used to
   render "pick one whose digits total ." — the highest-impact remedy in the
   report with no number in it. The engine must fall back rather than go quiet,
   and must never recommend a root that is an outright enemy of either number. */
const mobHostile = { mobRelD: "enemy", mobRelC: "enemy" };
const mobPairs = [];
for (let d = 1; d <= 9; d++) {
  for (let c = 1; c <= 9; c++) {
    const sug = window.__NV.mobileSuggestion(Object.assign({ driver: d, conductor: c }, mobHostile));
    const roots = sug.goodTotals.map((total) => window.__NV.reduce(total));
    mobPairs.push({
      pair: `${d}x${c}`,
      needed: sug.needed,
      listed: sug.goodTotals.length > 0,
      clean: roots.every((r) => window.__NV.relation(d, r) !== "enemy" && window.__NV.relation(c, r) !== "enemy")
    });
  }
}
const mobBlank = mobPairs.filter((row) => !row.listed).map((row) => row.pair);
const mobEnemy = mobPairs.filter((row) => !row.clean).map((row) => row.pair);
check("mobile remedy: every Driver×Conductor pair gets a non-empty ideal total list", mobBlank.length === 0);
check("mobile remedy: no suggested total reduces to an enemy of either birth number", mobEnemy.length === 0);
check("mobile remedy: Driver 6 × Conductor 1 (no total is friendly to both) still falls back", (() => {
  const roots = window.__NV.mobileSuggestion(Object.assign({ driver: 6, conductor: 1 }, mobHostile)).goodTotals.map((total) => window.__NV.reduce(total));
  return roots.length === 6 && roots.every((r) => [3, 5, 9].includes(r));
})());
check("mobile remedy: harmonious numbers stay harmonious — no suggestion is forced", window.__NV.mobileSuggestion({ driver: 6, conductor: 1, mobRelD: "friendly", mobRelC: "friendly" }).needed === false);

/* The reported chart: Simardeep Walia, 15-10-2010 → Driver 6 / Conductor 1. */
const simardeep = profile({ name: "Simardeep Walia", dob: "2010-10-15", mobile: "9991000000", goals: ["Money"], gender: "male" });
check("Simardeep 15-10-2010 plots as Driver 6 / Conductor 1", simardeep.driver === 6 && simardeep.conductor === 1);
check("Simardeep mobile 9991000000 (Number 1) is hostile to Driver 6", simardeep.mobNum === 1 && simardeep.mobRelD === "enemy");
const simardeepSug = window.__NV.mobileSuggestion(simardeep);
check("Simardeep gets a concrete ideal mobile total list", simardeepSug.needed === true && simardeepSug.goodTotals.length === 6);
const simardeepMobile = mount(window.__NV.renderReport(simardeep)).textContent
  .split("Vehicle Number Vibration")[0]
  .replace(/\s+/g, " ");
check("Simardeep report names the ideal mobile totals instead of an empty gap", /pick one whose digits total 9, 12, 14, 18, 21, 23\./.test(simardeepMobile) && !/digits total\s*\./.test(simardeepMobile));

/* ---- Clinical safety overlays: solar-load moderation + under-18 gem guard ----
   The reported chart (Simardeep 15-10-2010) repeats the Sun digit 4× with a
   Pitta constitution and was consulted as a 15-year-old student, so the
   report must (1) moderate solar rituals with cooling channeling habits and
   (2) defer heavy planetary gems to gentle substitutes. The chart engines
   stay untouched — these are labelled overlays, and the dosha baseline stays
   a pure Driver/Conductor function. Age is pinned synthetically so the
   assertions stay deterministic whatever the wall clock says. */
check("currentAgeYears computes completed years with month/day boundary", window.__NV.currentAgeYears(15, 10, 2010, Date.UTC(2026, 8, 7)) === 15 && window.__NV.currentAgeYears(15, 10, 2010, Date.UTC(2026, 9, 14)) === 15 && window.__NV.currentAgeYears(15, 10, 2010, Date.UTC(2026, 9, 15)) === 16 && window.__NV.currentAgeYears(1, 1, 2000, Date.UTC(2026, 0, 1)) === 26);
check("profile exposes a completed-years age signal", Number.isFinite(simardeep.ageYears) && Number.isFinite(profile({ dob: "1986-06-30" }).ageYears));

const solarSim = Object.assign({}, simardeep); // age-independent overlays
const solarReportDom = mount(window.__NV.renderReport(solarSim));
check("solar overload detected for a 4× Sun chart", window.__NV.solarOverload(solarSim) && window.__NV.solarLoadOf(solarSim) === 4);
const solarDoshaNote = $('#dosha-card [data-solar-moderation="dosha"]', solarReportDom);
check("4× Sun + Pitta moderates the Ayurvedic baseline ritual", !!solarDoshaNote && /solar moderation \(4× Sun \+ Pitta\)/.test(solarDoshaNote.textContent) && /brief, calm arghya/.test(solarDoshaNote.textContent) && /Chandra Bhedana/.test(solarDoshaNote.textContent) && solarDoshaNote.getAttribute("data-authority") === "lo-shu-overlay");
const solarExcessNote = $('[data-solar-moderation="excess"]', solarReportDom);
check("excess-energy card cools the repeated Sun instead of feeding it", !!solarExcessNote && /Cool the surplus/.test(solarExcessNote.textContent) && /perfectionism, head-heat and impatience/.test(solarExcessNote.textContent));
const simTattvaDom = mount(window.__NV.renderVedicTattvaSection(solarSim));
const solarAgniNote = $('[data-solar-moderation="agni"]', simTattvaDom);
check("4A Agni card runs the fire anchors in their mildest form under solar load", !!solarAgniNote && /skip Surya Bhedana/.test(solarAgniNote.textContent) && /Chandra Bhedana/.test(solarAgniNote.textContent));
check("4A banned-word rule still holds with the solar moderation row present", (() => { const txt = simTattvaDom.textContent; return !/Vedic remedy/.test(txt) && !/fast/i.test(txt) && !/crystal/i.test(txt) && !/rudraksha/i.test(txt) && !/yantra/i.test(txt) && !/beej/i.test(txt) && !/\bring\b/i.test(txt) && !/mala/i.test(txt); })());

const minorSim = Object.assign({}, simardeep, { ageYears: 15 });
const minorReportDom = mount(window.__NV.renderReport(minorSim));
check("under-18 chart flags the Lo Shu remedy kits for parents", !!$('#remedy-section [data-age-guardrail="under-18"]', minorReportDom) && /Under-18 note for parents/.test($('#remedy-section', minorReportDom).textContent));
const minorKits = $$("#remedy-section .card", minorReportDom);
const kitOf = (label) => minorKits.find((card) => new RegExp(label).test(($(".card-title", card) || { textContent: "" }).textContent));
const crystalRowOf = (card) => $$(".kit-row", card).find((row) => ($(".kit-label", row) || { textContent: "" }).textContent.trim() === "Crystal");
check("Rahu kit defers Hessonite (Gomed) to Smoky Quartz for a minor", (() => { const row = crystalRowOf(kitOf("Rahu")); return !!row && /^Smoky Quartz — the gentle substitute/.test(($(".kit-value", row) || {}).textContent || "") && /Hessonite \(Gomed\) stays deferred/.test(row.textContent) && !!$('[data-age-guardrail="under-18"]', kitOf("Rahu")); })());
check("Saturn kit defers Blue Sapphire (Neelam) to Amethyst/Lapis for a minor", (() => { const row = crystalRowOf(kitOf("Saturn")); return !!row && /^Amethyst or Lapis Lazuli — the gentle substitute/.test(($(".kit-value", row) || {}).textContent || "") && /Blue Sapphire \(Neelam\) stays deferred/.test(row.textContent); })());
check("Ketu kit defers Cat's Eye (Lehsunia) to Tiger's Eye for a minor", (() => { const row = crystalRowOf(kitOf("Ketu")); return !!row && /^Tiger's Eye — the gentle substitute/.test(($(".kit-value", row) || {}).textContent || ""); })());
check("non-heavy kits keep the canonical adult crystal string for minors", (() => { const row = crystalRowOf(kitOf("Jupiter")); return !!row && /Yellow Sapphire or Citrine/.test(($(".kit-value", row) || {}).textContent || "") && !/gentle substitute/.test(row.textContent); })());

const minorCrystalSection = $$("section.rsection", minorReportDom).find((section) => /Crystal Companion Guide/.test(section.textContent));
const minorCrystalCards = $$(".card", minorCrystalSection);
check("Crystal Guide swaps every heavy pick to its gentle substitute for a minor", !minorCrystalCards.some((card) => { const t = ($(".card-title", card) || { textContent: "" }).textContent; return /💎\s*(Blue Sapphire|Hessonite|Cat's Eye)/.test(t); }) && !!$('[data-gentle-substitute="Hessonite"]', minorCrystalSection));
check("Crystal Guide carries the parent note routing minors to 4A anchors", !!$('[data-age-guardrail="under-18"]', minorCrystalSection) && /gentle substitutes/.test(minorCrystalSection.textContent) && /Amethyst or Citrine/.test(minorCrystalSection.textContent));

const minorTransit = $(".dasha-transit-synthesis", minorReportDom);
const simStack = window.__NV.dashaTimeline(simardeep).current;
const simStackEnemy = window.__NV.getDashaRelationship(simStack.md.n, simStack.ad.n, simardeep.driver).relation === "enemy";
check("student lens rides only a conflicting stack on a minor chart", (!!$("[data-student-stack-note]", minorReportDom)) === simStackEnemy && (!simStackEnemy || /small, reversible steps/.test($("[data-student-stack-note]", minorReportDom).textContent)));
if (simStack.md.n === 8 && simStack.ad.n === 9) {
  check("Saturn × Mars student lens names the authority/independence friction and the computed closure date", /Saturn × Mars/.test($("[data-student-stack-note]", minorReportDom).textContent) && /rules and authority \(Saturn\)/.test($("[data-student-stack-note]", minorReportDom).textContent) && new RegExp(`sub-period closes on ${"\\d{1,2} \\w{3} \\d{4}"}`).test($("[data-student-stack-note]", minorReportDom).textContent));
}

const adultCleanReport = window.__NV.renderReport(profile({ dob: "1986-06-30" })); // adult, single Sun
check("adult chart without solar overload stays free of safety overlays", !/data-solar-moderation/.test(adultCleanReport) && !/data-age-guardrail/.test(adultCleanReport) && !/data-student-stack-note/.test(adultCleanReport));
check("non-Pitta repeated Sun gets cooling habits but not dosha/Agni overlays", (() => { const waliaDom = mount(window.__NV.renderReport(waliaProfile)); return !$('[data-solar-moderation="dosha"]', waliaDom) && !mount(window.__NV.renderVedicTattvaSection(waliaProfile)).textContent.includes("Solar-load moderation") && window.__NV.solarOverload(waliaProfile); })());

const minorCockpitDom = mount(window.__NV.renderPractitionerCockpit(minorSim));
check("cockpit surfaces age and both safety guardrails for a minor", /age 15/.test(minorCockpitDom.textContent) && !!$('[data-cockpit-guardrail="under-18"]', minorCockpitDom) && !!$('[data-cockpit-guardrail="solar"]', minorCockpitDom));

/* ---- Page 36 ↔ Remedy Triage alignment (Daily Core Ritual blocker) ----
   Historical bug: the ritual card took the first critical missing number
   (missing[0] → Ketu 7) while the triage card beside it prescribed Mars 9
   as the sole acute target with Ketu held. The plan now binds to the
   triage engine: acute Tier-1 number leads the ritual; when nothing
   missing is live, japa is held explicitly instead of contradicting. */
const simRawTargets = window.__NV.loShuPracticeTargets(simardeep);
check("raw Lo Shu gap order still starts at Ketu 7 (documents the old mismatch input)", simRawTargets.primary === 7);
const simTriage = window.__NV.remedyTriage(simardeep);
const simPlan = window.__NV.activationPlan(simardeep, simTriage);
check("daily core ritual binds to the triage Tier-1 target instead of missing[0]", simPlan.targetN === simTriage.tier1.n && simPlan.targetN !== simRawTargets.primary);
check("acute plan carries the sync note and tier metadata", simPlan.acute === (simTriage.tier1.mode === "acute") && simPlan.tier1Mode === simTriage.tier1.mode && /Synced with the Remedy Triage/.test(simPlan.triageNote));
const simRitualDom = $(".ritual-card", mount(window.__NV.renderReport(simardeep)));
const simRitualText = simRitualDom.textContent;
const tier1Short = window.__NV.getActiveDB().mantraShort[simTriage.tier1.n];
check("Page 36 chants the Tier-1 short mantra", simRitualText.includes(tier1Short.dev) && simRitualText.includes(tier1Short.pron) && simRitualDom.dataset.ritualTarget === String(simTriage.tier1.n));
check("Page 36 ritual target equals the triage card's acute number", $("#remedy-triage", mount(window.__NV.renderReport(simardeep))).dataset.tier1Number === simRitualDom.dataset.ritualTarget && $('[data-ritual-sync]', simRitualDom).dataset.ritualSync === simTriage.tier1.mode);
if (simTriage.tier1.mode === "acute" && simTriage.tier1.n === 9) {
  check("Simardeep Page 36 prescribes Om Mangalaya Namah (Mars 9), never Om Ketave Namah (Ketu 7)", simRitualText.includes("ॐ मंगलाय नमः") && simRitualText.includes("Om Mangalaya Namah") && !simRitualText.includes("ॐ केतवे नमः") && !simRitualText.includes("Om Ketave Namah"));
}
const heldPlan = window.__NV.activationPlan(authorityProfile, { tier1: { mode: "environmental", n: 2, planet: "Moon (Chandra)", reasons: ["No missing number is live in the current stack"], japa: "Hold japa — no beej mantra is clinically indicated this period", zone: "North-West", zoneRemedy: "Keep the North-West clutter-free; add brass decor and check stored water." }, tier2: [] });
check("environmental tier-1 holds japa instead of chanting a non-live missing number", heldPlan.holdJapa === true && /japa on hold/.test(heldPlan.daily[0].label) && /Hold japa/.test(heldPlan.daily[0].value) && !/<span class="mantra">/.test(heldPlan.daily[0].value) && /North-West/.test(heldPlan.daily[0].sub));
check("maintenance-tier plans keep the classic Lo Shu primary unchanged", window.__NV.activationPlan(alteredGridProfile).targetN === window.__NV.loShuPracticeTargets(alteredGridProfile).primary);

/* ---- Moon-cold clinical guardrail (Number 2 / Chandra) ----
   Raw lunar remedies are Sheeta Guna (cold potency): for every DOB with a
   cold-sensitivity signal — a declared Allergies/Respiratory/Cold tag, a
   Vata channel in the dosha baseline, Mercury 5, or the Health focus — the
   Number 2 kit, triage, ritual, Tattva water anchor, crystal note and
   cockpit switch to the warm clinical form. The canonical Moon kit stays
   untouched; the guardrail is purely additive. */
const moonWalia = profile({ name: "Randeep Walia", dob: "1976-08-05", goals: ["Health", "Career"], gender: "male", birthTime: "20:15", birthPlace: "Faridabad, Haryana, India" });
const moonWaliaDecl = profile({ name: "Randeep Walia", dob: "1976-08-05", goals: ["Health", "Career"], healthTags: ["respiratory"], gender: "male", birthTime: "20:15", birthPlace: "Faridabad, Haryana, India" });
const moonClean = profile({ name: "Clean Pitta", dob: "1999-09-09", goals: ["Money"] });
check("Moon-cold sensitivity fires for a Driver-5 Vata-carrying Health chart", same(window.__NV.moonColdSensitivity(moonWalia), { level: "potential", reasons: ["vata-baseline", "mercury-5", "health-focus"] }));
check("respiratory sub-tag upgrades Moon-cold to declared", window.__NV.moonColdSensitivity(moonWaliaDecl).level === "declared" && window.__NV.moonColdSensitivity(moonWaliaDecl).reasons[0] === "declared-respiratory");
check("pure-Pitta non-Health chart has no Moon-cold signal", window.__NV.moonColdSensitivity(moonClean) === null && window.__NV.getRemedyClinicalGuardrail(3, moonWalia) === null && window.__NV.getRemedyClinicalGuardrail(6, moonWalia) === null);
check("clinical guardrail object carries badge and warm substitutes", (() => { const g = window.__NV.getRemedyClinicalGuardrail(2, moonWalia); return !!g && g.type === "warning" && /Respiratory & Cold Sensitivity/.test(g.badge) && /Vataja Pratishyaya/.test(g.note) && /Chandrashekhara/.test(g.note) && /Nadi Shodhana/.test(g.note); })());
const moonReportDom = mount(window.__NV.renderReport(moonWalia));
const moonKitCards = $$("#remedy-section .card", moonReportDom);
const moonKitOf = (label) => moonKitCards.find((card) => new RegExp(label).test(($(".card-title", card) || { textContent: "" }).textContent));
check("Section 4 Moon kit leads with the guardrail and keeps canonical copy", (() => { const kit = moonKitOf("Moon"); return !!kit && !!$('[data-clinical-guardrail="moon-cold"]', kit) && $(".kit", kit).firstElementChild.getAttribute("data-clinical-guardrail") === "moon-cold" && /Om Shram Shreem Shraum Sah Chandraya Namah/.test(kit.textContent); })());
check("Section 4 non-Moon kits stay free of the Moon guardrail", ["Jupiter", "Rahu"].every((label) => { const kit = moonKitOf(label); return !!kit && !$('[data-clinical-guardrail="moon-cold"]', kit); }) && !$("[data-clinical-guardrail]", moonKitOf("Jupiter")) && !!$('[data-clinical-guardrail="dosha-contra"]', moonKitOf("Rahu")));
const moonHealthSection = $$("section.rsection", moonReportDom).find((section) => /Health \u2014 Lo Shu Remedy Focus/.test(section.textContent));
check("Health focus section carries the Moon-cold banner", !!moonHealthSection && !!$('[data-clinical-guardrail="moon-cold"]', moonHealthSection));
const moonDeclHealthSection = $$("section.rsection", mount(window.__NV.renderReport(moonWaliaDecl))).find((section) => /Health \u2014 Lo Shu Remedy Focus/.test(section.textContent));
check("declared tag echoes in the Health section", !!$('[data-health-tags="respiratory"]', moonDeclHealthSection) && $('[data-clinical-guardrail="moon-cold"]', moonDeclHealthSection).dataset.guardrailLevel === "declared");
const moonTattvaDom = mount(window.__NV.renderVedicTattvaSection(moonWalia));
const moonEmotional = $$(".tattva-card", moonTattvaDom).find((c) => c.dataset.vedicPlane === "emotional");
check("Emotional water anchor runs lukewarm via silver, never refrigerated", !!moonEmotional && /silver vessel/.test(moonEmotional.textContent) && /refrigerated drinks/.test(moonEmotional.textContent) && !/coconut water/.test(moonEmotional.textContent) && !!$('[data-clinical-guardrail="moon-cold"]', moonEmotional));
check("4A banned-word rule still holds with the Moon-cold overlay", (() => { const txt = moonTattvaDom.textContent; return !/Vedic remedy/.test(txt) && !/fast/i.test(txt) && !/crystal/i.test(txt) && !/rudraksha/i.test(txt) && !/yantra/i.test(txt) && !/beej/i.test(txt) && !/\bring\b/i.test(txt) && !/mala/i.test(txt); })());
check("cockpit flags Moon-cold only for sensitive charts", !!$('[data-cockpit-guardrail="moon-cold"]', mount(window.__NV.renderPractitionerCockpit(moonWalia))) && !$('[data-cockpit-guardrail="moon-cold"]', mount(window.__NV.renderPractitionerCockpit(moonClean))));
const moonTriageCard = $("#remedy-triage", moonReportDom);
check("Moon triage carries the guardrail in either tier", moonTriageCard.dataset.tier1Number === "2" ? !!$('#remedy-triage [data-clinical-guardrail="moon-cold"]', moonReportDom) : /run it warm/.test(moonTriageCard.textContent));
const grahanFixedTriage = window.__NV.remedyTriage(waliaProfile, null, fixedDate);
check("acute Moon triage prescribes the guardrail beside the japa", grahanFixedTriage.tier1.mode === "acute" && grahanFixedTriage.tier1.n === 2 && !!$('[data-clinical-guardrail="moon-cold"]', mount(window.__NV.renderTriageCard(waliaProfile, grahanFixedTriage))));
const grahanReportDom = mount(window.__NV.renderReport(waliaProfile));
check("acute Moon ritual and checklist carry the warm-form flag", $("#remedy-triage", grahanReportDom).dataset.tier1Number === "2" && !!$('.ritual-card [data-clinical-guardrail="moon-cold"]', grahanReportDom) && !!$('#plan-section .priority-guardrail[data-clinical-guardrail="moon-cold"]', grahanReportDom));
const moonCrystalSection = $$("section.rsection", moonReportDom).find((section) => /Crystal Companion Guide/.test(section.textContent));
check("Crystal Guide holds Pearl/Moonstone on a congested airway", !!$('[data-clinical-guardrail="moon-cold"]', moonCrystalSection) && /only when the airway is clear/.test(moonCrystalSection.textContent));
check("clean Pitta report stays free of Moon-cold overlays", !/moon-cold/.test(window.__NV.renderReport(moonClean)) && same(window.__NV.getRemedyClinicalGuardrail(7, moonClean).reasons, ["pitta-baseline"]) && window.__NV.getRemedyClinicalGuardrail(7, moonClean).level === "potential" && $('[data-cockpit-guardrail="dosha-contra"]', mount(window.__NV.renderPractitionerCockpit(moonClean))).dataset.contraNumbers === "7");

/* Health sub-tag intake: the tag row appears only with the Health focus and
   flows into the report as a declared guardrail. Money stays selected so
   the reference-chart submit below keeps its context. */
$("#editBtn").click();
$("#goalChips .chip[data-goal='Health']").click();
check("Health focus reveals the clinical sub-tags", !$("#healthTagsWrap").classList.contains("hidden") && $$("#healthTagChips .chip").length === 3);
$("#healthTagChips .chip[data-health-tag='respiratory']").click();
$("#fullName").value = "Randeep Walia";
$("#dob").value = "05-08-1976";
$("#mobile").value = "9876543210";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
check("intake respiratory tag renders a declared report guardrail", /data-clinical-guardrail="moon-cold"/.test($("#reportRoot").innerHTML) && /data-guardrail-level="declared"/.test($("#reportRoot").innerHTML) && /You flagged Allergies/.test($("#reportRoot").innerHTML));
$("#editBtn").click();
$("#goalChips .chip[data-goal='Health']").click();
check("deselecting Health clears its sub-tags", $$("#healthTagChips .chip.selected").length === 0 && $("#healthTagsWrap").classList.contains("hidden"));

/* Reference chart authored through the new dd-mm-yyyy text field. */
$("#editBtn").click();
$("#fullName").value = "Randeep Walia";
$("#dob").value = "05-08-1976";           // user-facing dd-mm-yyyy
$("#birthPlace").value = "Faridabad, Haryana, India";
$("#birthTime").value = "20:15";
$("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
check("dob input: typed dd-mm-yyyy field normalises the live chart", $("#reportRoot").innerHTML.includes("05-08-1976") && window.__NV.computeProfile({ name: "Randeep Walia", dob: "1976-08-05", mobile: "", goals: [] }).day === 5);
check("dob input: field reformats to day-month-year after submit", $("#dob").value === "05-08-1976");

/* ---- Dosha x planet clinical contraindication overlay (Numbers 1-9) ----
   Every planetary kit carries an Ayurvedic quality load (Ushna / Sheeta /
   Guru / Ruksha-Chala) that clashes with a matching dosha channel, a
   declared Health tag, or a Health focus on Health-governed planets.
   Number 2 keeps the bespoke Moon-cold path; numbers 1 and 3-9 share the
   generic matrix below. Render asserts use Dasha-independent touchpoints
   (kit cards, priority rows, cockpit facts); Tier-1/ritual rows are pinned
   at object level because the acute target rotates with the wall clock. */
const kaphaChart = profile({ name: "Kapha Chart", dob: "1970-01-06", goals: ["Money"] });
const pittaChart = profile({ name: "Pitta Chart", dob: "2000-05-09", goals: ["Money"] });
const vataChart = profile({ name: "Vata Chart", dob: "1970-01-04", goals: ["Money", "Career"] });
const tridoshicChart = profile({ name: "Tridoshic Chart", dob: "1970-01-05", goals: ["Money"] });
const heatDecl = profile({ name: "Randeep Walia", dob: "1976-08-05", goals: ["Health", "Career"], healthTags: ["heat"], gender: "male" });
const fatigueDecl = profile({ name: "Randeep Walia", dob: "1976-08-05", goals: ["Health", "Career"], healthTags: ["fatigue"], gender: "male" });
check("contra fixtures plot the intended dosha channels and gaps", kaphaChart.driver === 6 && kaphaChart.conductor === 6 && same(kaphaChart.loShuMissing, [2, 3, 4, 5, 8]) && pittaChart.driver === 9 && pittaChart.conductor === 7 && same(pittaChart.loShuMissing, [1, 3, 4, 6, 8]) && vataChart.driver === 4 && vataChart.conductor === 4 && same(vataChart.loShuMissing, [2, 3, 5, 6, 8]) && tridoshicChart.driver === 5 && tridoshicChart.conductor === 5);
check("Vata channel reads identically on the generic and Moon paths", [kaphaChart, pittaChart, vataChart, tridoshicChart, moonWalia, moonClean].every((p) => window.__NV.doshaChannelInBaseline(p, "vata") === window.__NV.vataInBaseline(p)));
check("Tridoshic carries Vata only: Vata rules fire, Pitta/Kapha rules stay null", same(window.__NV.doshaContraSensitivity(5, tridoshicChart).reasons, ["vata-baseline", "mercury-5"]) && window.__NV.doshaContraSensitivity(4, tridoshicChart) !== null && window.__NV.doshaContraSensitivity(8, tridoshicChart) !== null && window.__NV.doshaContraSensitivity(1, tridoshicChart) === null && window.__NV.doshaContraSensitivity(3, tridoshicChart) === null && window.__NV.doshaContraSensitivity(6, tridoshicChart) === null && window.__NV.doshaContraSensitivity(7, tridoshicChart) === null && window.__NV.doshaContraSensitivity(9, tridoshicChart) === null);
check("contra reasons follow the dosha x tag x Health matrix", same(window.__NV.getRemedyClinicalGuardrail(1, moonWalia).reasons, ["pitta-baseline", "health-focus"]) && same(window.__NV.getRemedyClinicalGuardrail(4, moonWalia).reasons, ["vata-baseline", "mercury-5"]) && same(window.__NV.getRemedyClinicalGuardrail(3, kaphaChart).reasons, ["kapha-baseline"]) && window.__NV.getRemedyClinicalGuardrail(3, kaphaChart).level === "potential" && window.__NV.getRemedyClinicalGuardrail(2, kaphaChart) !== null && window.__NV.getRemedyClinicalGuardrail(2, kaphaChart).badge !== window.__NV.getRemedyClinicalGuardrail(3, kaphaChart).badge);
check("declared heat/fatigue tags escalate Ushna and Guru/Chala kits", window.__NV.getRemedyClinicalGuardrail(1, heatDecl).level === "declared" && window.__NV.getRemedyClinicalGuardrail(1, heatDecl).reasons[0] === "declared-heat" && window.__NV.getRemedyClinicalGuardrail(9, heatDecl).level === "declared" && window.__NV.getRemedyClinicalGuardrail(3, fatigueDecl).level === "declared" && window.__NV.getRemedyClinicalGuardrail(3, fatigueDecl).reasons[0] === "declared-fatigue" && window.__NV.getRemedyClinicalGuardrail(8, fatigueDecl).level === "declared" && window.__NV.getRemedyClinicalGuardrail(6, moonWaliaDecl).level === "declared" && window.__NV.getRemedyClinicalGuardrail(6, moonWaliaDecl).reasons[0] === "declared-respiratory");
const kaphaDom = mount(window.__NV.renderReport(kaphaChart));
const kaphaKits = $$("#remedy-section .card", kaphaDom);
const kaphaKitOf = (label) => kaphaKits.find((card) => new RegExp(label).test(($(".card-title", card) || { textContent: "" }).textContent));
check("Kapha Section 4 flags Jupiter/Rahu/Mercury kits first-row, keeps canonical mantra", ["Jupiter", "Rahu", "Mercury"].every((label) => { const kit = kaphaKitOf(label); return !!kit && !!$('[data-clinical-guardrail="dosha-contra"]', kit) && $(".kit", kit).firstElementChild.getAttribute("data-clinical-guardrail") === "dosha-contra"; }) && /Om Gram Greem Graum Sah Gurave Namah/.test(kaphaKitOf("Jupiter").textContent) && !!$('[data-clinical-guardrail="moon-cold"]', kaphaKitOf("Moon")));
const pittaDom = mount(window.__NV.renderReport(pittaChart));
const pittaKits = $$("#remedy-section .card", pittaDom);
const pittaKitOf = (label) => pittaKits.find((card) => new RegExp(label).test(($(".card-title", card) || { textContent: "" }).textContent));
check("Pitta Section 4 flags only the loaded Sun kit, keeps canonical copy", (() => { const sun = pittaKitOf("Sun"); return !!sun && !!$('[data-clinical-guardrail="dosha-contra"]', sun) && /Om Hram Hreem Hroum Sah Suryaya Namah/.test(sun.textContent); })() && ["Jupiter", "Rahu", "Venus"].every((label) => !$("[data-clinical-guardrail]", pittaKitOf(label))));
const pittaCrystal = $$("section.rsection", pittaDom).find((section) => /Crystal Companion Guide/.test(section.textContent));
check("Crystal Guide cools Ruby/Red Coral trials on a Pitta-loaded chart", !!$('[data-clinical-guardrail="dosha-contra"]', pittaCrystal) && /briefly and on cool skin/.test(pittaCrystal.textContent));
const vataCareer = $$("section.rsection", mount(window.__NV.renderReport(vataChart))).find((section) => /Career \u2014 Lo Shu Remedy Focus/.test(section.textContent));
check("Career focus carries the Saturn mild-form kit for a Vata chart", (() => { const kits = $$(".card", vataCareer); const saturn = kits.find((card) => /Saturn/.test(($(".card-title", card) || { textContent: "" }).textContent)); return !!saturn && !!$('[data-clinical-guardrail="dosha-contra"]', saturn) && /Om Pram Preem Praum Sah Shanaishcharaya Namah/.test(saturn.textContent); })());
const cleanHealth = profile({ name: "Clean Pitta", dob: "1999-09-09", goals: ["Health"] });
const cleanHealthSection = $$("section.rsection", mount(window.__NV.renderReport(cleanHealth))).find((section) => /Health \u2014 Lo Shu Remedy Focus/.test(section.textContent));
check("Health focus lists its governed kits and flags the Ketu kit", !!$('[data-contra-scope="health-focus"]', cleanHealthSection) && $('[data-contra-scope="health-focus"]', cleanHealthSection).dataset.contraNumbers === "1,7,9" && (() => { const kits = $$(".card", cleanHealthSection); const ketu = kits.find((card) => /Ketu/.test(($(".card-title", card) || { textContent: "" }).textContent)); return !!ketu && !!$('[data-clinical-guardrail="dosha-contra"]', ketu); })());
check("cockpit condenses loaded missing numbers per chart", $('[data-cockpit-guardrail="dosha-contra"]', mount(window.__NV.renderPractitionerCockpit(pittaChart))).dataset.contraNumbers === "1" && $('[data-cockpit-guardrail="dosha-contra"]', mount(window.__NV.renderPractitionerCockpit(vataChart))).dataset.contraNumbers === "5,8" && $('[data-cockpit-guardrail="dosha-contra"]', mount(window.__NV.renderPractitionerCockpit(moonClean))).dataset.contraNumbers === "7");
const waliaTriageFixed = mount(window.__NV.renderTriageCard(waliaProfile, grahanFixedTriage));
check("latent Mercury/Venus triage rows name their mild form", /When it activates, run it calm/.test(waliaTriageFixed.textContent) && /When it activates, run it light/.test(waliaTriageFixed.textContent));
const waliaPlanDom = mount(window.__NV.renderReport(waliaProfile));
check("checklist flags Vata/Kapha rows and repeated Pitta loads", !!$('#plan-section .priority-guardrail[data-contra-number="5"]', waliaPlanDom) && /Vata-sensitive/.test($('#plan-section .priority-guardrail[data-contra-number="5"]', waliaPlanDom).textContent) && !!$('#plan-section .priority-guardrail[data-contra-number="6"]', waliaPlanDom) && /Kapha-sensitive/.test($('#plan-section .priority-guardrail[data-contra-number="6"]', waliaPlanDom).textContent) && !$('#plan-section .priority-guardrail[data-contra-number="1"]', waliaPlanDom) && !!$('#plan-section .priority-guardrail[data-contra-number="9"]', mount(window.__NV.renderReport(moonClean))));
const cleanKitCards = $$("#remedy-section .card", mount(window.__NV.renderReport(moonClean)));
check("Pitta-only Section 4 kits without a dosha load stay banner-free", cleanKitCards.length === 4 && cleanKitCards.every((kit) => !$("[data-clinical-guardrail]", kit)));
window.__NV.setLanguage("hi");
const hiContra = window.__NV.renderReport(pittaChart);
window.__NV.setLanguage("gu");
const guContra = window.__NV.renderReport(pittaChart);
window.__NV.setLanguage("en");
check("dosha-contra banners localise to Hindi and Gujarati", /data-clinical-guardrail="dosha-contra"/.test(hiContra) && /\u0928\u0948\u0926\u093e\u0928\u093f\u0915 \u0938\u0941\u0930\u0915\u094d\u0937\u093e/.test(hiContra) && /data-clinical-guardrail="dosha-contra"/.test(guContra) && /\u0a95\u0acd\u0ab2\u0abf\u0aa8\u0abf\u0a95\u0ab2 \u0ab8\u0ab2\u0abe\u0aae\u0aa4\u0ac0/.test(guContra) && window.__NV.getLang() === "en");

/* ---- Classical Vimshottari layer (true nakshatra anchoring) ----------------
   The Ank Jyotish roadmap and the classical Vimshottari stack are two separate
   traditions. These checks pin the classical maths against a by-hand chart so
   the two can never be silently merged into one claim again. */
const vimProfile = profile({
  name: "Vim Fixture", dob: "1976-08-05", goals: ["Career"], gender: "male",
  birthTime: "20:15", birthPlace: "Faridabad, India"
});
const vim = window.__NV.vimshottariTimeline(vimProfile);
check("Vimshottari anchors on the Moon nakshatra, not the Moolank", !!vim && vim.anchor.nakshatra === "Jyeshtha" && vim.anchor.lord === "Mercury" && vim.anchor.deity === "Indra" && vim.anchor.pada === 3 && vim.anchor.moonSign === "Scorpio" && vimProfile.driver === 5);
// Moon 234.8744° sidereal → 8.2077° into the 13.3333° Jyeshtha span → 61.56%
// elapsed → Mercury (17y) balance = (1 − 0.6156) × 17 = 6.535y.
check("Vimshottari balance deducts the traversed nakshatra fraction", !!vim && vim.anchor.elapsedPct === 61.6 && Math.abs(vim.balanceYears - 6.535) < 0.002 && vim.mahadashas[0].lord === "Mercury" && vim.mahadashas[0].balance === true);
check("Vimshottari keeps the classical fixed 120-year lord durations", window.__NV.VIMSHOTTARI_TOTAL_YEARS === 120 && same(window.__NV.VIMSHOTTARI_LORDS.map((r) => r[1]), [7, 20, 6, 10, 7, 18, 16, 19, 17]));
const vimLords = vim.mahadashas.map((m) => m.lord);
check("Vimshottari advances in the canonical Ketu→Mercury order", same(vimLords.slice(0, 6), ["Mercury", "Ketu", "Venus", "Sun", "Moon", "Mars"]) && vim.mahadashas.slice(1, 6).every((m) => m.years === m.fullYears));
const vimMars = vim.mahadashas.find((m) => m.lord === "Mars");
check("Vimshottari places the running Mahadasha at Mars, not the Ank Jyotish Venus", !!vimMars && vimMars.current === true && vim.current.md.lord === "Mars" && vim.current.ad.lord === "Rahu" && vim.agreementSignature === "Mars/Rahu");
// The decisive framing check: the two clocks must be allowed to disagree.
const ankNow = window.__NV.dashaTimeline(vimProfile, new Date("2026-09-12"));
const ankLordNow = (window.__NV.getActiveDB().numbers[ankNow.current.md.n].planet || "").split(" ")[0];
check("the two Dasha traditions are independently reported and may disagree", ankNow.current.md.n === 6 && ankLordNow === "Venus" && vim.current.md.lord === "Mars" && ankLordNow !== vim.current.md.lord);
check("Vimshottari sub-periods subdivide by the 120-year weights", (() => {
  const md = vim.current.md, ad = vim.current.ad;
  const expected = md.years * (window.__NV.VIMSHOTTARI_LORDS.find((r) => r[0] === ad.lord)[1] / 120);
  return Math.abs(ad.years - expected) < 1e-9 && ad.startMs >= md.startMs && ad.endMs <= md.endMs + 1 && vim.current.pd.startMs >= ad.startMs && vim.current.pd.endMs <= ad.endMs + 1;
})());
// Regression: sub-periods must carry their own age window. An earlier version
// rendered the parent Mahadasha's ages on the Antardasha and Pratyantar rows,
// which misreported a 1-year AD as spanning the whole 7-year MD.
check("each sub-period reports its own age window, not the Mahadasha's", (() => {
  const { md, ad, pd } = vim.current;
  return ad.fromAge !== md.fromAge && ad.toAge !== md.toAge &&
    ad.fromAge >= md.fromAge && ad.toAge <= md.toAge &&
    pd.fromAge >= ad.fromAge && pd.toAge <= ad.toAge &&
    ad.fromAge < ad.toAge && pd.fromAge < pd.toAge;
})());
const noTimeProfile = profile({ name: "Vim Fixture", dob: "1976-08-05", goals: ["Career"], birthTime: "", birthPlace: "" });
check("Vimshottari needs Tier-2 birth data and degrades honestly without it", window.__NV.vimshottariTimeline(noTimeProfile) === null);
const vimReport = window.__NV.renderReport(vimProfile);
const vimDom = mount(vimReport);
const vimCard = $("#dasha-section .vimshottari-card", vimDom);
check("the classical layer renders as its own authority card", !!vimCard && vimCard.getAttribute("data-authority") === "vimshottari" && vimCard.getAttribute("data-vimshottari-md") === "Mars" && vimCard.getAttribute("data-vimshottari-agrees") === "no" && /Mars/.test(vimCard.textContent) && /Jyeshtha/.test(vimCard.textContent) && /6\.535/.test(vimCard.textContent));
check("the classical layer carries no remedy authority or Vastu zone content", !vimCard.querySelector("[data-remedy-authority]") && !vimCard.querySelector("[data-dasha-vastu-zone]") && !/zone-remedy|Lo Shu remedy target/i.test(vimCard.textContent));
// Regression: the disagreement note read "Ank Jyotish: 6" — a bare digit —
// because the lord was looked up on the dasha period entry instead of
// db.numbers. It must name the planet, and name both lords side by side.
check("the disagreement note names both lords with their planets", /Ank Jyotish: Venus \(6\)/.test(vimCard.textContent) && /Vimshottari: Mars \(9\)/.test(vimCard.textContent) && /data-vimshottari-comparison="differ"/.test(vimReport));
check("sub-period rows render their own dates and ages", (() => {
  const rows = Array.from(vimCard.querySelectorAll("table tr")).map((tr) => tr.textContent.replace(/\s+/g, " ").trim());
  const ad = rows.find((r) => /Antardasha/.test(r));
  const md = rows.find((r) => /Mahadasha/.test(r) && /Mars/.test(r));
  return !!ad && !!md && /Rahu/.test(ad) && /2026/.test(ad) && !/Ages 49\.5–56\.5/.test(ad) && /Ages 49\.5–56\.5/.test(md);
})());
const noTimeReport = window.__NV.renderReport(noTimeProfile);
const noTimeCard = $("#dasha-section .vimshottari-card", mount(noTimeReport));
check("without birth data the card explains the requirement instead of guessing", !!noTimeCard && noTimeCard.getAttribute("data-vimshottari") === "unavailable" && /exact birth time/.test(noTimeCard.textContent));
check("the timeline never claims to be Vimshottari-derived", !/Vimshottari-derived/i.test(vimReport) && !/Vimshottari-derived/i.test(read("app.js")) && !/Vimshottari-derived/i.test(read("i18n.js")) && /not classical Vimshottari/i.test(vimReport));
window.__NV.setLanguage("hi");
const hiVim = window.__NV.renderReport(vimProfile);
const hiVimCard = $("#dasha-section .vimshottari-card", mount(hiVim));
check("the Vimshottari card localises to Hindi", !!hiVimCard && hiVimCard.getAttribute("data-vimshottari-md") === "Mars" && /\u0936\u093e\u0938\u094d\u0924\u094d\u0930\u0940\u092f \u0935\u093f\u092e\u094d\u0936\u094b\u0924\u094d\u0924\u0930\u0940/.test(hiVimCard.textContent) && !/Classical Vimshottari Dasha \u2014 Moon-Nakshatra/.test(hiVimCard.textContent));
window.__NV.setLanguage("gu");
const guVim = window.__NV.renderReport(vimProfile);
const guVimCard = $("#dasha-section .vimshottari-card", mount(guVim));
check("the Vimshottari card localises to Gujarati", !!guVimCard && guVimCard.getAttribute("data-vimshottari-md") === "Mars" && /\u0ab6\u0abe\u0ab8\u0acd\u0aa4\u0acd\u0ab0\u0ac0\u0aaf \u0ab5\u0abf\u0aae\u0acd\u0ab6\u0acb\u0aa4\u0acd\u0aa4\u0ab0\u0ac0/.test(guVimCard.textContent));
window.__NV.setLanguage("en");
check("every localised Vimshottari key is translated in all three languages", (() => {
  const keys = ["vimshottariTitle", "vimshottariKicker", "vimshottariIntro", "vimshottariAnchorLabel", "vimshottariBalanceLabel", "vimshottariBalanceNote", "vimshottariLadderTitle", "vimshottariCurrentTitle", "vimshottariCompareTitle", "vimshottariCompareAgree", "vimshottariCompareDiffer", "vimshottariNoTime", "vimshottariAge", "vimshottariBalanceTag", "vimshottariMD", "vimshottariAD", "vimshottariPD", "vimshottariElapsed", "vimshottariBoundary", "dashaJudgeNote"];
  return ["en", "hi", "gu"].every((lang) => keys.every((k) => {
    const v = window.I18N[lang] && window.I18N[lang].ui && window.I18N[lang].ui[k];
    return typeof v === "string" && v.trim().length > 0;
  }));
})());

/* ---- Authority-vocabulary lint -------------------------------------------
   Regression guard: as content grows, a remedy-bearing block must never be
   re-sourced by another module. Every authority tag must come from the known
   vocabulary, and no non-Lo-Shu scope may contain a remedy obligation. */
const AUTHORITY_VOCAB = new Set(["lo-shu-overlay", "driver-conductor", "vedic-tattva", "zodiac-reference", "personal-year-context", "dasha", "dasha-vastu-zone", "vimshottari", "home-vastu-context", "compatibility-reflection", "clinical-cockpit", "framework-note"]);
const authorityNodes = $$("[data-authority]", authorityReportDom);
check("every data-authority tag comes from the declared vocabulary", authorityNodes.length > 0 && authorityNodes.every((node) => AUTHORITY_VOCAB.has(node.getAttribute("data-authority"))));
check("every remedy-bearing block nests inside Lo Shu authority", remedyBlocks.every((node) => !!node.closest('[data-authority="lo-shu-overlay"], [data-authority="clinical-cockpit"]') || !node.closest("[data-authority]")) && authorityNodes.filter((node) => node.getAttribute("data-authority") !== "lo-shu-overlay" && node.getAttribute("data-authority") !== "clinical-cockpit").every((node) => !node.querySelector("[data-remedy-authority]")));
check("no Vedic-authority scope carries a Lo Shu remedy obligation", authorityNodes.filter((node) => ["vedic-tattva", "zodiac-reference", "dasha", "vimshottari"].includes(node.getAttribute("data-authority"))).every((node) => !node.querySelector("[data-remedy-authority]") && !node.querySelector("[data-solar-moderation]")));
// The zone card is Dasha-selected but Vastu-prescribed, so it must declare
// its own authority instead of silently inheriting the Dasha scope.
const zoneCards = $$('[data-dasha-vastu-zone="active"]', authorityReportDom);
check("the Dasha-selected Vastu zone declares its own authority scope", zoneCards.length === 1 && zoneCards[0].getAttribute("data-authority") === "dasha-vastu-zone" && !!zoneCards[0].closest('[data-authority="dasha"]') && !zoneCards[0].querySelector("[data-remedy-authority]"));
check("the classical Vimshottari card carries no Vastu or remedy content at all", (() => { const c = $("#dasha-section .vimshottari-card", authorityReportDom); return !!c && !c.querySelector("[data-remedy-authority]") && !c.querySelector("[data-dasha-vastu-zone]") && !/sector|direction|North-East|South-West/i.test(c.getAttribute("data-vimshottari") === "unavailable" ? "" : c.textContent.replace(/never feeds Lo Shu remedies, Vastu zones/g, "")); })());

/* ---- Classical safety boundary is documented, not just hard-coded -------- */
const packPolicySchema = schema.properties.db.properties.dasha.properties.relationshipPolicy;
check("the pack schema names the non-removable classical safety pairs", !!packPolicySchema.description && /cannot (be )?remove|non-removable|immutable/i.test(packPolicySchema.description) && Array.isArray(packPolicySchema["x-classicalSafetyPairs"]) && packPolicySchema["x-classicalSafetyPairs"].length > 0);
check("the documented classical pairs match the pairs the engine enforces", (() => {
  const documented = packPolicySchema["x-classicalSafetyPairs"].map((p) => `${p.md}-${p.ad}`);
  const grahan = documented.filter((p) => ["4-2", "2-4", "4-1", "1-4"].includes(p));
  const hostile = documented.filter((p) => ["1-8", "8-1", "9-8", "8-9", "3-6", "6-3"].includes(p));
  return grahan.length === 4 && hostile.length === 6 && documented.every((p) => window.__NV.getDashaRelationship(+p.split("-")[0], +p.split("-")[1], 1).relation === "enemy");
})());

/* ---- Field read mode (phone consultations) -------------------------------
   Presentation-only. It must never change an engine result or an authority
   boundary, and it must be suppressed in print. */
const fieldBtn = $("#fieldBtn");
check("field mode is an actual toggle button, not a styled div", !!fieldBtn && fieldBtn.tagName === "BUTTON" && fieldBtn.getAttribute("aria-pressed") === "false" && /fieldModeToggle/.test(fieldBtn.getAttribute("data-i18n-aria") || ""));
fieldBtn.dispatchEvent(new window.Event("click"));
check("toggling field mode sets the body class and pressed state", window.document.body.classList.contains("field-mode") && fieldBtn.getAttribute("aria-pressed") === "true" && window.localStorage.getItem("nv360.fieldMode.v1") === "1");
check("field mode leaves every engine output untouched", (() => {
  const before = JSON.stringify(window.__NV.dashaTimeline(authorityProfile));
  const vimBefore = JSON.stringify(window.__NV.vimshottariTimeline(authorityProfile));
  const after = JSON.stringify(window.__NV.dashaTimeline(authorityProfile));
  const vimAfter = JSON.stringify(window.__NV.vimshottariTimeline(authorityProfile));
  return before === after && vimBefore === vimAfter;
})());
check("field mode localises in all three languages", (() => {
  const out = [];
  for (const lang of ["en", "hi", "gu"]) {
    window.__NV.setLanguage(lang);
    window.__NV.showReport(authorityProfile, { preserveScroll: true });
    out.push($("#fieldBtn .btn-text").textContent.trim());
  }
  window.__NV.setLanguage("en");
  return new Set(out).size === 3 && out[1].length > 0 && out[2].length > 0;
})());
// Regression: the field-mode block was originally unscoped, so its
// grid-template-columns:1fr !important would have collapsed the 3-column
// cockpit grid on a printed sheet. It is now wrapped in @media screen, and
// this asserts nothing under .field-mode can ever appear in a print block.
check("print CSS cannot inherit field mode — the A4 sheet is unchanged", (() => {
  const blockAt = (openBraceIdx) => {
    let depth = 0;
    for (let j = openBraceIdx; j < styles.length; j++) {
      if (styles[j] === "{") depth++;
      else if (styles[j] === "}") { depth--; if (depth === 0) return styles.slice(openBraceIdx, j + 1); }
    }
    return "";
  };
  const mediaBlocks = (kind) => {
    const out = [];
    const marker = "@media " + kind;
    let from = 0, at;
    while ((at = styles.indexOf(marker, from)) !== -1) {
      const brace = styles.indexOf("{", at);
      if (brace === -1) break;
      out.push(blockAt(brace));
      from = brace + 1;
    }
    return out;
  };
  const printBlocks = mediaBlocks("print");
  const screenBlocks = mediaBlocks("screen");
  return printBlocks.length > 0 &&
    printBlocks.every((b) => !b.includes(".field-mode")) &&
    screenBlocks.some((b) => b.includes(".field-mode .cockpit-grid")) &&
    screenBlocks.some((b) => b.includes(".field-mode .kit-row"));
})());
fieldBtn.dispatchEvent(new window.Event("click"));
check("toggling field mode off restores the report and clears storage", !window.document.body.classList.contains("field-mode") && fieldBtn.getAttribute("aria-pressed") === "false" && window.localStorage.getItem("nv360.fieldMode.v1") === "0");

/* ---- PWA packaging ------------------------------------------------------
   Offline installability must never break the browser-only app: these checks
   pin that the worker only touches static assets, that the manifest is
   install-valid, and that the strict CSP is not defeated by inline script. */
const manifest = JSON.parse(read("manifest.webmanifest"));
const swSource = read("sw.js");
check("the web app manifest declares an installable standalone app", manifest.name && manifest.short_name && manifest.display === "standalone" && manifest.start_url && manifest.scope && manifest.theme_color && manifest.background_color);
check("every manifest icon exists on disk with a declared size", manifest.icons.length >= 3 && manifest.icons.every((icon) => fs.existsSync(path.join(root, icon.src)) && /^\d+x\d+$/.test(icon.sizes) && icon.type === "image/png"));
check("the manifest ships a maskable icon for Android adaptive launchers", manifest.icons.some((icon) => String(icon.purpose || "").split(/\s+/).includes("maskable")) && manifest.icons.some((icon) => String(icon.purpose || "").split(/\s+/).includes("any")));
check("the manifest is linked from the document head with an Apple touch icon", /<link rel="manifest" href="manifest\.webmanifest" \/>/.test(html) && /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png" \/>/.test(html) && /name="apple-mobile-web-app-capable" content="yes"/.test(html));
check("the service worker is versioned and never caches non-GET or cross-origin requests", /^const CACHE_VERSION = "/m.test(swSource) && /request\.method === "GET"/.test(swSource) && /url\.origin === self\.location\.origin/.test(swSource) && /request\.headers\.has\("range"\)/.test(swSource));
check("the service worker treats the knowledge pack as network-first", /knowledge-pack\//.test(swSource) && /networkFirst\(request, PACK_CACHE\)/.test(swSource));
check("the service worker precaches only static shell assets, never personal data", (() => {
  const list = swSource.slice(swSource.indexOf("const SHELL_ASSETS"), swSource.indexOf("];", swSource.indexOf("const SHELL_ASSETS")));
  return !/localStorage|sessionStorage|indexedDB|\?name=|\bdob\b/i.test(list) && /\.\/index\.html/.test(list) && /\.\/app\.js/.test(list);
})());
check("registration is CSP-safe and can be bypassed with ?sw=off", !/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/.test(html) && /serviceWorker\.register\("sw\.js"\)/.test(read("app.js")) && /sw=off/.test(read("app.js")));
check("the static build copies the manifest, worker and icons into dist/", (() => {
  const buildSrc = read("scripts/build-static.cjs");
  return /'sw\.js'/.test(buildSrc) && /'manifest\.webmanifest'/.test(buildSrc) && /'icons'/.test(buildSrc) && /CACHE_VERSION/.test(buildSrc);
})());

/* ---- Community / packaging gate -----------------------------------------
   The audit's open packaging items: a licence, a content-review process and
   CI on every PR. Pinned so they cannot silently disappear. */
check("the project ships an MIT licence", fs.existsSync(path.join(root, "LICENSE")) && /^MIT License/m.test(read("LICENSE")));
check("a content-review gate is documented and routed by CODEOWNERS", fs.existsSync(path.join(root, "CONTRIBUTING.md")) && /Content review gate/i.test(read("CONTRIBUTING.md")) && /practitioner sign-off/i.test(read("CONTRIBUTING.md")) && fs.existsSync(path.join(root, ".github", "CODEOWNERS")) && /knowledge-pack\//.test(read(path.join(".github", "CODEOWNERS"))));
check("every remedy/dosha path is named in the pull-request template", fs.existsSync(path.join(root, ".github", "PULL_REQUEST_TEMPLATE.md")) && /Content review:/i.test(read(path.join(".github", "PULL_REQUEST_TEMPLATE.md"))) && /dosha/i.test(read(path.join(".github", "PULL_REQUEST_TEMPLATE.md"))));
check("CI runs the full gate on every pull request", fs.existsSync(path.join(root, ".github", "workflows", "ci.yml")) && (() => {
  const ci = read(path.join(".github", "workflows", "ci.yml"));
  return /pull_request:/.test(ci) && /npm ci/.test(ci) && /npm run check$|npm run check\b/m.test(ci);
})());

/* ---- Source archive freshness -------------------------------------------
   The committed "full source" download had silently gone six releases stale
   (it still carried a deleted vite.config.js and a two-major-old pack), which
   is worse than shipping no archive at all. It is now generated from HEAD and
   verified on every run. */
const pkgScripts = JSON.parse(read("package.json")).scripts;
const packSource = read("scripts/package-source.mjs");
check("the source archive is generated from HEAD, not hand-maintained", !!pkgScripts["package:source"] && !!pkgScripts["check:source-zip"] && /"archive"/.test(packSource) && /"ls-files"/.test(packSource) && /--check/.test(packSource));
check("the release gate includes the archive freshness check", /check:source-zip/.test(pkgScripts.check) && /check:source-zip/.test(read(path.join(".github", "workflows", "ci.yml"))));
check("the source archive builder refuses to package a dirty tree", /uncommitted changes/.test(read("scripts/package-source.mjs")) && /status", "--porcelain"/.test(read("scripts/package-source.mjs")));
check("every generated asset is reproducible from a committed script", fs.existsSync(path.join(root, "scripts", "build-icons.mjs")) && fs.existsSync(path.join(root, "scripts", "build-static.cjs")) && !!pkgScripts["icons:build"]);

if (failed) {
  console.error(`\n${failed} hybrid smoke check${failed === 1 ? "" : "s"} failed.`);
  process.exit(1);
}
console.log("\nAll hybrid smoke checks passed.");
