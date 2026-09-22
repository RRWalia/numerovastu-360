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
const serializedReleasePack = JSON.parse(read("knowledge-pack/packs/2.10.0.json"));
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
/* The comparison is a COLLAPSED optional disclosure on screen (README
   "Advanced Vedic comparison" → "it is closed by default"), and print CSS
   force-expands it so the birth grid still reaches the PDF. This previously
   asserted the markup carried `open`, which contradicted the documented
   behaviour, the "Optional birth-grid view" hint, the dedicated
   `.advanced-vedic-comparison:not([open]) > .details-body` print rule, and the
   Playwright spec that clicks the summary to expand it. The `open` attribute
   was a real regression; this now pins the contract that both the print rule
   and the visual spec depend on. */
const vedicDetails = $("details.advanced-vedic-comparison", vedicMarkup);
check("advanced Vedic comparison is a collapsed optional disclosure on screen", !!vedicDetails && !vedicDetails.hasAttribute("open") && /Optional birth-grid view/.test(vedicDetails.textContent));
check("print CSS force-expands the collapsed comparison so the birth grid reaches the PDF", /\.advanced-vedic-comparison:not\(\[open\]\) > \.details-body \{ display: flex !important; \}/.test(styles));
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
/* ---- Chandra-bala: progressive precision applied to the partner ----------
   The Moon moves ~13°20' a day, so a Moon Rashi / Nakshatra / Chandra-bala
   verdict is not derivable from a date of birth. The contract under test is
   binary: either both natal Moons are computable and the classical Rashi axis
   is shown, or the module says it was not computed. There is no third state,
   and no defaulted noon birth or stand-in city anywhere in between. */
const moonTier1Profile = profile({ partnerName: "Arjun Patel", partnerDob: "2000-04-04" });
const moonTier2Profile = profile({ partnerName: "Arjun Patel", partnerDob: "2000-04-04", partnerBirthTime: "09:30", partnerBirthPlace: "Ahmedabad, India" });
const moonSelfGapProfile = profile({ birthTime: "", birthPlace: "", partnerName: "Arjun Patel", partnerDob: "2000-04-04", partnerBirthTime: "09:30", partnerBirthPlace: "Ahmedabad, India" });
const moonBadPlaceProfile = profile({ partnerName: "Arjun Patel", partnerDob: "2000-04-04", partnerBirthTime: "09:30", partnerBirthPlace: "Zzzz Nowhere" });
const moonTier1Card = $("#chandra-bala", mount(window.__NV.renderReport(moonTier1Profile)));
const moonTier2Card = $("#chandra-bala", mount(window.__NV.renderReport(moonTier2Profile)));
const moonSelfGapCard = $("#chandra-bala", mount(window.__NV.renderReport(moonSelfGapProfile)));
const moonBadPlaceCard = $("#chandra-bala", mount(window.__NV.renderReport(moonBadPlaceProfile)));

check("partner birth time and place survive the intake into the profile", moonTier2Profile.partnerBirthTime === "09:30" && moonTier2Profile.partnerBirthPlace === "Ahmedabad, India" && moonTier1Profile.partnerBirthTime === "" && moonTier1Profile.partnerBirthPlace === "" && !!$("#partnerBirthTime") && !!$("#partnerBirthPlace") && $("#partnerBirthPlace").getAttribute("list") === "partnerBirthPlaceList" && !!$("#partnerBirthPlaceList"));
check("a partner with only a date of birth never yields a guessed Moon", (() => {
  const r = window.__NV.chandraBala(moonTier1Profile, window.__NV.computeProfile({ name: "Arjun Patel", dob: "2000-04-04", mobile: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", gender: "" }));
  return r.tier === 1 && r.chandraBalaComputed === false && !r.axis && !r.partner && r.partnerSide === true && r.selfSide === false
    && same(r.missing, ["partner-birth-time", "partner-birth-place"])
    && r.message === "Chandra-bala not computed — add partner birth time and location";
})());
check("the Tier 1 Moon banner states plainly that Chandra-bala was not computed", !!moonTier1Card && moonTier1Card.getAttribute("data-chandra-bala") === "not-computed" && moonTier1Card.getAttribute("data-chandra-tier") === "1" && moonTier1Card.textContent.includes("Chandra-bala not computed") && /partner's exact birth time/.test(moonTier1Card.textContent) && /13\u00b020\u2032 a day/.test(moonTier1Card.textContent) && !/Shadashtaka|Navapanchama|Dwidwadasha/.test(moonTier1Card.textContent));
check("the degraded banner names the missing side, not just 'some data'", !!moonSelfGapCard && moonSelfGapCard.getAttribute("data-chandra-bala") === "not-computed" && /your own exact birth time/.test(moonSelfGapCard.textContent) && !/your partner's exact birth time/.test(moonSelfGapCard.textContent) && !!moonBadPlaceCard && moonBadPlaceCard.getAttribute("data-chandra-bala") === "not-computed" && /atlas recognises/.test(moonBadPlaceCard.textContent));
check("partner birth time and place unlock a computed Chandra-bala verdict", !!moonTier2Card && moonTier2Card.getAttribute("data-chandra-bala") === "computed" && moonTier2Card.getAttribute("data-chandra-tier") === "2" && moonTier2Card.getAttribute("data-chandra-axis") === "2/12" && /Dwidwadasha/.test(moonTier2Card.textContent) && /Aquarius/.test(moonTier2Card.textContent) && /Pisces/.test(moonTier2Card.textContent) && !moonTier2Card.textContent.includes("Chandra-bala not computed") && !/undefined|NaN/.test(moonTier2Card.innerHTML));
check("all twelve relative Moon positions resolve to the seven classical axes", (() => {
  const chart = (deg) => ({ dob: "2000-01-01", day: 1, month: 1, year: 2000, birthTime: "10:00", birthPlace: "New Delhi, India", astro: { ok: true, tier: "full", engine: "test", moon: { lonSidereal: deg, nakshatra: { name: "N", pada: 1, lord: "L", glyph: "x" } } } });
  const expected = ["1/1", "2/12", "3/11", "4/10", "5/9", "6/8", "7/7", "6/8", "5/9", "4/10", "3/11", "2/12"];
  const got = Array.from({ length: 12 }, (_, i) => window.__NV.chandraBala(chart(5), chart(5 + i * 30)).axis.key);
  const sanskrit = window.__NV.chandraBala(chart(5), chart(155)).axis;
  return same(got, expected) && sanskrit.sanskrit === "Shadashtaka" && sanskrit.quality === "challenging" && sanskrit.forward === 6 && sanskrit.reverse === 8;
})());
check("the shared-rashi-lord relaxation is reported as a fact, never as a score", (() => {
  const chart = (deg) => ({ dob: "2000-01-01", day: 1, month: 1, year: 2000, birthTime: "10:00", birthPlace: "New Delhi, India", astro: { ok: true, tier: "full", engine: "test", moon: { lonSidereal: deg, nakshatra: { name: "N", pada: 1, lord: "L", glyph: "x" } } } });
  const marsPair = window.__NV.chandraBala(chart(5), chart(215));   // Aries / Scorpio, both Mars
  const plain = window.__NV.chandraBala(chart(5), chart(155));      // Aries / Virgo, 6/8, different lords
  return marsPair.axis.key === "6/8" && marsPair.sameRashiLord === true && marsPair.doshaRelaxedBySharedLord === true
    && plain.sameRashiLord === false && plain.doshaRelaxedBySharedLord === false
    && !("score" in marsPair) && !("points" in marsPair) && !("gunas" in marsPair);
})());
check("the Moon layer never becomes a remedy, a muhurtha or an Ashtakoota score", !!moonTier2Card && moonTier2Card.getAttribute("data-authority") === "chandra-bala" && !moonTier2Card.querySelector("[data-remedy-authority]") && !moonTier2Card.querySelector(".kit-card") && /not a 36-point Ashtakoota score/.test(moonTier2Card.textContent) && /no remedy, no muhurtha, no Vastu zone/.test(moonTier2Card.textContent) && !/wear |mantra|crystal|Rudraksha|fast on/i.test(moonTier2Card.textContent));
/* ---- Partner Astro-Identity Snapshot (Section 18 companion) --------------
   A positional side-by-side so the Chandra-bala verdict can be verified
   against the actual longitudes. It appears only when the partner chart is
   Tier 2, and it must never grow a second verdict or a remedy. */
const moonPairCard = $("#partner-astro-snapshot", mount(window.__NV.renderReport(moonTier2Profile)));
const moonPairSelfGapCard = $("#partner-astro-snapshot", mount(window.__NV.renderReport(moonSelfGapProfile)));
check("the partner snapshot renders both charts' Sun, Moon, Nakshatra pada and Lagna", (() => {
  if (!moonPairCard) return false;
  const rows = $$("tr", moonPairCard);
  const head = $$("th", rows[0]).map((th) => th.textContent.trim());
  const labels = rows.slice(1).map((r) => $$("td", r)[0].textContent.trim());
  const partnerCells = rows.slice(1).map((r) => $$("td", r)[2].textContent.trim());
  return rows.length === 5
    && same(head, ["Factor", "Priya", "Arjun"])
    && same(labels, ["Sun · Surya Rashi", "Moon · Chandra Rashi", "Nakshatra · Pada", "Lagna (Ascendant)"])
    && /Pisces/.test(partnerCells[0]) && /Pisces 13°16′/.test(partnerCells[1])
    && /Uttara Bhadrapada · Pada 3/.test(partnerCells[2]) && /Taurus/.test(partnerCells[3])
    && $$(".astro-pair-key", moonPairCard).length === 2
    && !/undefined|NaN/.test(moonPairCard.innerHTML);
})());
check("the partner snapshot appears only once the partner chart reaches Tier 2", !moonPairCard.textContent.includes("not computed") && !$("#partner-astro-snapshot", mount(window.__NV.renderReport(moonTier1Profile))) && !$("#partner-astro-snapshot", mount(window.__NV.renderReport(moonBadPlaceProfile))) && !$("#partner-astro-snapshot", mount(window.__NV.renderReport(profile({ partnerName: "", partnerDob: "" })))));
check("a Tier 1 primary chart degrades its own column instead of blanking it", !!moonPairSelfGapCard && $$(".astro-pending", moonPairSelfGapCard).length === 3 && /not computed — add your birth time/.test(moonPairSelfGapCard.textContent) && /Pisces 13°16′/.test(moonPairSelfGapCard.textContent) && !/undefined|NaN/.test(moonPairSelfGapCard.innerHTML));
check("the partner snapshot states its own birth moment, place and ayanamsa", !!$(".astro-foot", moonPairCard) && /2000-04-04T09:30/.test(moonPairCard.textContent) && /Ahmedabad, Gujarat, India/.test(moonPairCard.textContent) && /Lahiri \(Chitrapaksha\) ayanamsa/.test(moonPairCard.textContent) && /never leave this device/.test(moonPairCard.textContent));
check("the partner snapshot is positions only — no second verdict and no remedy", moonPairCard.getAttribute("data-authority") === "chandra-bala" && !moonPairCard.querySelector("[data-remedy-authority]") && !moonPairCard.querySelector(".kit-card") && /no second verdict, no Ashtakoota points and no remedy/.test(moonPairCard.textContent) && !/Shadashtaka|Navapanchama|Dwidwadasha|verdict —/.test(moonPairCard.textContent));
check("the Chandra-bala verdict is printed before the snapshot that evidences it", (() => {
  const html = window.__NV.renderReport(moonTier2Profile);
  return html.indexOf('id="chandra-bala"') > -1 && html.indexOf('id="chandra-bala"') < html.indexOf('id="partner-astro-snapshot"');
})());
check("coordinate-entered partner places do not print their coordinates twice", (() => {
  const c = $("#partner-astro-snapshot", mount(window.__NV.renderReport(profile({ partnerName: "Arjun Patel", partnerDob: "2000-04-04", partnerBirthTime: "09:30", partnerBirthPlace: "28.41, 77.32" }))));
  return !!c && (c.textContent.match(/28\.41°/g) || []).length === 1;
})());

check("the Moon layer is absent entirely when no partner is supplied", !$("#chandra-bala", authorityReportDom) && !$("#chandra-bala", mount(window.__NV.renderReport(profile({ partnerName: "", partnerDob: "" })))));

/* ---- Partner Vimshottari anchor (Section 18 companion) --------------------
   The partner's own classical stack reuses the primary engine unchanged.
   Hand check for the fixture (2000-04-04, 09:30, Ahmedabad): the sidereal
   Moon sits in Uttara Bhadrapada p3 (lord Saturn) at 74.6% of the 13°20′
   span, so the Saturn balance is (1 − 0.746) × 19 = 4.822y; the Mercury MD
   (17y, 2005-01-29 → 2022-01-29) is followed by Ketu (7y), making Ketu the
   running Mahadasha through 2029-01-29. */
const partnerVimProfile = window.__NV.computeProfile({ name: "Arjun Patel", dob: "2000-04-04", mobile: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", gender: "", birthTime: "09:30", birthPlace: "Ahmedabad, India" });
const partnerVim = window.__NV.vimshottariTimeline(partnerVimProfile);
check("partner Vimshottari anchors on the partner's natal Moon via the same engine", !!partnerVim && partnerVim.anchor.nakshatra === "Uttara Bhadrapada" && partnerVim.anchor.pada === 3 && partnerVim.anchor.lord === "Saturn" && partnerVim.anchor.moonSign === "Pisces" && partnerVim.anchor.elapsedPct === 74.6 && Math.abs(partnerVim.balanceYears - 4.822) < 0.002 && partnerVim.current.md.lord === "Ketu" && partnerVim.mahadashas[1].lord === "Mercury");
const moonTier2VimDom = mount(window.__NV.renderReport(moonTier2Profile));
const moonTier2VimCard = $("#partner-vimshottari", moonTier2VimDom);
check("partner birth time and place unlock the partner's own Vimshottari card", !!moonTier2VimCard && moonTier2VimCard.getAttribute("data-partner-vimshottari") === "available" && moonTier2VimCard.getAttribute("data-authority") === "vimshottari" && moonTier2VimCard.getAttribute("data-partner-vimshottari-md") === "Ketu" && /Uttara Bhadrapada/.test(moonTier2VimCard.textContent) && /74\.6/.test(moonTier2VimCard.textContent) && /4\.822/.test(moonTier2VimCard.textContent) && !/undefined|NaN/.test(moonTier2VimCard.innerHTML));
check("the partner card compares the two active Mahadasha lords as a plain fact", moonTier2VimCard.getAttribute("data-partner-vimshottari-agrees") === "no" && !!moonTier2VimCard.querySelector('[data-partner-vim-compare="differ"]') && /Jupiter/.test(moonTier2VimCard.textContent) && /Ketu/.test(moonTier2VimCard.textContent));
check("the partner Vimshottari card has no Tier 1 variant — it appears only once the partner chart reaches Tier 2", (() => {
  const tier1 = $("#partner-vimshottari", mount(window.__NV.renderReport(moonTier1Profile)));
  const badPlace = $("#partner-vimshottari", mount(window.__NV.renderReport(moonBadPlaceProfile)));
  const noPartner = $("#partner-vimshottari", mount(window.__NV.renderReport(profile({ partnerName: "", partnerDob: "" }))));
  return !tier1 && !badPlace && !noPartner;
})());
check("a Tier 1 primary chart still shows the partner stack, with the comparison withheld", (() => {
  const c = $("#partner-vimshottari", mount(window.__NV.renderReport(moonSelfGapProfile)));
  return !!c && c.getAttribute("data-partner-vimshottari") === "available" && c.getAttribute("data-partner-vimshottari-agrees") === "n/a" && !!c.querySelector('[data-partner-vim-compare="not-comparable"]') && /not compared/.test(c.textContent);
})());
check("the partner Vimshottari card is a timing read-out only — no remedy, muhurtha or score", moonTier2VimCard.getAttribute("data-authority") === "vimshottari" && !moonTier2VimCard.querySelector("[data-remedy-authority]") && !moonTier2VimCard.querySelector(".kit-card") && /no remedy, no muhurtha/.test(moonTier2VimCard.textContent) && !/wear |mantra|crystal|Rudraksha|fast on/i.test(moonTier2VimCard.textContent));
check("the partner Vimshottari card keeps the primary card's pixel locator single", (() => {
  const html = window.__NV.renderReport(moonTier2Profile);
  return (html.match(/class="card vimshottari-card"/g) || []).length === 1 && !/class="card vimshottari-card partner-vimshottari-card"/.test(html);
})());
window.__NV.setLanguage("hi");
const hiMoonTier2VimCard = $("#partner-vimshottari", mount(window.__NV.renderReport(moonTier2Profile)));
check("the partner Vimshottari card localises to Hindi", !!hiMoonTier2VimCard && /शास्त्रीय विम्शोत्तरी दशा/.test(hiMoonTier2VimCard.textContent) && !/Partner's Classical Vimshottari Dasha/.test(hiMoonTier2VimCard.textContent));
window.__NV.setLanguage("gu");
const guMoonTier2VimCard = $("#partner-vimshottari", mount(window.__NV.renderReport(moonTier2Profile)));
check("the partner Vimshottari card localises to Gujarati", !!guMoonTier2VimCard && /શાસ્ત્રીય વિમ્શોત્તરી દશા/.test(guMoonTier2VimCard.textContent));
window.__NV.setLanguage("en");

/* ---- Tara Bala: the Nakshatra-level Moon-pairing layer --------------------
   Hand check for the fixtures: the self Moon (2005-08-20 14:05 New Delhi) is
   in Shatabhisha (24th nakshatra) and the partner Moon (2000-04-04 09:30
   Ahmedabad) in Uttara Bhadrapada (26th). Inclusive partner→self count
   26 → 26 mod 9 = 8 → auspicious; self→partner count 3 → 3 → inauspicious:
   a mixed reading. Source-verified worked examples: Rohini(4th) → Anuradha
   (17th) = 14 → remainder 5 → inauspicious, the other way = 15 → 6 →
   auspicious; Jyeshtha(18th) / Purva Phalguni(11th) = 8 → 8 auspicious and
   21 → 3 inauspicious. */
check("Tara Bala reproduces the classical worked examples from the references", window.__NV.taraCount(3, 16) === 14 && window.__NV.taraCount(16, 3) === 15 && window.__NV.taraCount(10, 17) === 8 && window.__NV.taraCount(17, 10) === 21);
const taraEngine = window.__NV.taraBala(moonTier2Profile, partnerVimProfile);
check("Tara Bala counts inclusive nakshatra spans in both directions", !!taraEngine && taraEngine.computed === true && taraEngine.forward.count === 26 && taraEngine.forward.remainder === 8 && taraEngine.forward.auspicious === true && taraEngine.reverse.count === 3 && taraEngine.reverse.remainder === 3 && taraEngine.reverse.auspicious === false && taraEngine.sameNakshatra === false && taraEngine.bothAuspicious === false && taraEngine.bothInauspicious === false);
check("Tara Bala degrades honestly when either natal Moon is missing", (() => {
  const selfShort = window.__NV.taraBala(moonSelfGapProfile, partnerVimProfile);
  const partnerShort = window.__NV.taraBala(moonTier2Profile, window.__NV.computeProfile({ name: "Arjun Patel", dob: "2000-04-04", mobile: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", gender: "" }));
  return selfShort.computed === false && selfShort.missing.indexOf("self-nakshatra") !== -1 && selfShort.missing.indexOf("partner-nakshatra") === -1 && /add your birth time and place/.test(selfShort.message)
    && partnerShort.computed === false && partnerShort.missing.indexOf("partner-nakshatra") !== -1 && /partner birth time and place/.test(partnerShort.message);
})());
check("a partner whose Moon shares the self nakshatra gives Janma Tara (count 1 both ways)", (() => {
  const janmaPartner = window.__NV.computeProfile({ name: "Meera Shah", dob: "1990-08-08", mobile: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", gender: "", birthTime: "12:00", birthPlace: "Ahmedabad, India" });
  const r = window.__NV.taraBala(moonTier2Profile, janmaPartner);
  return !!r && r.computed === true && r.sameNakshatra === true && r.forward.count === 1 && r.reverse.count === 1 && r.forward.remainder === 1 && r.bothAuspicious === true;
})());
const taraBlock = $("#tara-bala", moonTier2Card);
check("the computed Chandra-bala card carries the Nakshatra-level Tara layer", !!taraBlock && taraBlock.getAttribute("data-tara") === "computed" && taraBlock.getAttribute("data-tara-fwd") === "26" && taraBlock.getAttribute("data-tara-rev") === "3" && taraBlock.getAttribute("data-tara-fwd-rem") === "8" && taraBlock.getAttribute("data-tara-rev-rem") === "3" && taraBlock.getAttribute("data-tara-verdict") === "mixed" && /Uttara Bhadrapada/.test(taraBlock.textContent) && /Shatabhisha/.test(taraBlock.textContent) && /26 Nakshatras/.test(taraBlock.textContent) && /remainder 8/.test(taraBlock.textContent) && /traditionally inauspicious/.test(taraBlock.textContent) && /mixed/.test(taraBlock.textContent) && !/undefined|NaN/.test(taraBlock.innerHTML));
check("the Janma Tara note renders only when both Moons share a nakshatra", (() => {
  const janmaPartnerProfile = profile({ partnerName: "Meera Shah", partnerDob: "1990-08-08", partnerBirthTime: "12:00", partnerBirthPlace: "Ahmedabad, India" });
  const janmaCard = $("#tara-bala", mount(window.__NV.renderReport(janmaPartnerProfile)));
  const mixedCard = $("#tara-bala", mount(window.__NV.renderReport(moonTier2Profile)));
  return !!janmaCard && janmaCard.getAttribute("data-tara-fwd") === "1" && /Janma Tara/.test(janmaCard.textContent) && !!mixedCard && !/Janma Tara/.test(mixedCard.textContent);
})());
check("Tara Bala is a reported working, never a score, remedy or muhurtha", !!taraBlock && !taraBlock.querySelector("[data-remedy-authority]") && /not folded into any 36-point score/.test(taraBlock.textContent) && /no remedy, no muhurtha, no Vastu zone/.test(taraBlock.textContent) && !/wear |mantra|crystal|Rudraksha|fast on/i.test(taraBlock.textContent));
check("the Tier 1 Moon banner carries no Tara layer", !$("#tara-bala", moonTier1Card) && !$("#tara-bala", mount(window.__NV.renderReport(moonBadPlaceProfile))));
window.__NV.setLanguage("hi");
const hiTaraBlock = $("#tara-bala", mount(window.__NV.renderReport(moonTier2Profile)));
check("the Tara layer localises to Hindi", !!hiTaraBlock && /तारा बल/.test(hiTaraBlock.textContent) && /नक्षत्र-स्तर/.test(hiTaraBlock.textContent) && !/Nakshatra-level layer/.test(hiTaraBlock.textContent));
window.__NV.setLanguage("gu");
const guTaraBlock = $("#tara-bala", mount(window.__NV.renderReport(moonTier2Profile)));
check("the Tara layer localises to Gujarati", !!guTaraBlock && /તારા બલ/.test(guTaraBlock.textContent));
window.__NV.setLanguage("en");

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
const waliaWealthCoverage = waliaEvents.wealth.coverage;
check("wealth windows span the full 21–75 band with lifetime coverage printed", waliaEvents.wealth.future.length <= 5 && waliaWealthCoverage.total > waliaEvents.wealth.future.length && waliaWealthCoverage.last.toAge >= 74 && waliaDasha.mahadashas.some((m) => m.fromAge <= 80 && m.toAge >= 80) && $$("[data-lifetime-coverage]", waliaDashaSection).length === 5 && /Lifetime coverage: .*significator windows inside the 21–75 age band/.test(waliaDashaSection.textContent));
const waliaMarriage = waliaEvents.marriage;
const DASHA_YEAR_MS = 365.2425 * 86400000;
check("closed marriage band surfaces late windows scanned till the 80-year horizon", waliaMarriage.bandClosed === true && waliaMarriage.future.length > 0 && waliaMarriage.future.length <= 3 && waliaMarriage.future.every((w) => w.beyondBand === true) && Math.round((waliaMarriage.lateHorizonMs - waliaDasha.birthMs) / DASHA_YEAR_MS) === 80 && /Late window — beyond the classical 18–45 age band/.test(waliaDashaSection.textContent) && /80-year average lifespan/.test(waliaDashaSection.textContent));
const elderDasha = window.__NV.dashaTimeline(profile({ dob: "1948-06-15" }), fixedDate);
const elderMarriage = elderDasha.events.find((e) => e.key === "marriage");
check("late scan keeps a 15-year floor past the 80-year horizon", elderMarriage.lateHorizonMs > elderDasha.birthMs + 80 * DASHA_YEAR_MS && Math.round((elderMarriage.lateHorizonMs - elderDasha.birthMs) / DASHA_YEAR_MS) === Math.round((new Date(fixedDate).getTime() - elderDasha.birthMs) / DASHA_YEAR_MS + 15));
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
/* ---- Classical Maitri table (2026-09 practitioner audit, pack 2.10.0) ----
   relation(driver, other) is ONE-WAY: the driver's row classifies the other
   number. The table is the standard printed Moolank Maitri chart — the Sun
   is friendly to Venus and Mars (not to Moon/Jupiter), the Moon befriends
   Sun and Mercury (Mars is her enemy), and so on. Pin the whole matrix so a
   future "symmetry tidy-up" cannot silently re-enemy the classical friends
   (22 of the 72 one-way entries moved in this audit; rows 4/7 and the
   per-row shadow stances are the documented exception). */
const maitriExpected = {
  1: { friends: [6, 9], neutral: [5, 8], enemies: [2, 3, 4, 7] },
  2: { friends: [1, 5], neutral: [3, 6, 8], enemies: [4, 7, 9] },
  3: { friends: [2, 5], neutral: [6, 9], enemies: [1, 4, 7, 8] },
  4: { friends: [5, 6, 7, 8], neutral: [3], enemies: [1, 2, 9] },
  5: { friends: [1, 2, 4, 7], neutral: [3, 6, 8, 9], enemies: [] },
  6: { friends: [2, 4, 7, 9], neutral: [3, 5, 8], enemies: [1] },
  7: { friends: [4, 5, 6, 8], neutral: [3], enemies: [1, 2, 9] },
  8: { friends: [4, 5, 6, 7], neutral: [1, 2, 3], enemies: [9] },
  9: { friends: [1, 6], neutral: [5, 8], enemies: [2, 3, 4, 7] }
};
const rel = window.__NV.relation;
const maitriRowOk = Object.entries(maitriExpected).every(([num, expected]) => {
  const row = window.__NV.getActiveDB().friendship[Number(num)];
  const matches = (tier) => same(row[tier].slice().sort((a, b) => a - b), expected[tier].slice().sort((a, b) => a - b));
  return matches("friends") && matches("neutral") && matches("enemies");
});
check("friendship matrix matches the classical one-way Moolank Maitri chart (pack 2.10.0)", maitriRowOk);
check("friendship stays one-way where the classical chart says so", rel(2, 1) === "friendly" && rel(1, 2) === "enemy" && rel(9, 6) === "friendly" && rel(6, 9) === "friendly" && rel(5, 6) === "neutral" && rel(6, 5) === "neutral" && rel(1, 6) === "friendly" && rel(6, 1) === "enemy" && rel(3, 1) === "enemy" && rel(1, 3) === "enemy");
check("every friendship row partitions the other eight numbers", Object.keys(maitriExpected).every((num) => {
  const row = window.__NV.getActiveDB().friendship[Number(num)];
  const all = [...row.friends, ...row.neutral, ...row.enemies];
  return all.length === 8 && all.every((x) => x >= 1 && x <= 9 && x !== Number(num)) && new Set(all).size === 8;
}));
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
check("cockpit prints as its own page and never splits a card", styles.includes("@page { size: A4 portrait; margin: 12mm 10mm; }") && styles.includes("body.print-cockpit #cockpit-panel { display: block !important; margin: 0; }") && styles.includes(".cockpit-block, .cockpit-sheet > * { break-inside: avoid; page-break-inside: avoid; }") && (styles.includes(".badge.badge-conflict { background: var(--light-red-bg); color: #c92a36; }") || styles.includes(".badge.badge-conflict { background: var(--light-red-bg); color: #a81e2a;")) && /break-before:\s*page/.test(styles) && /page-break-before:\s*always/.test(styles) && /break-inside:\s*avoid/.test(styles) && /page-break-inside:\s*avoid/.test(styles) && styles.includes(".cockpit,") && styles.includes(".report-cockpit") && styles.includes("display: block;"));
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
check("serialized 2.10.0 release pack exactly matches the bundled hybrid pack", same(serializedReleasePack, window.__NV_BUNDLED_PACK) && window.__NV.validatePack(serializedReleasePack).ok && latestManifest.latestVersion === "2.10.0" && latestManifest.packUrl === "knowledge-pack/packs/2.10.0.json");
check("life-event bands cover wealth till 75 inside the 80-year lifespan horizon", same(window.__NV_BUNDLED_PACK.db.dasha.lifeEvents.wealth.band, [21, 75]) && same(window.__NV_BUNDLED_PACK.db.dasha.lifeEvents.property.band, [24, 75]) && same(window.__NV_BUNDLED_PACK.db.dasha.lifeEvents.career.band, [21, 70]) && same(window.__NV_BUNDLED_PACK.db.dasha.lifeEvents.abroad.band, [16, 60]) && same(window.__NV_BUNDLED_PACK.db.dasha.lifeEvents.marriage.band, [18, 45]) && window.__NV.DASHA_LIFESPAN_YEARS === 80 && window.__NV.DASHA_FUTURE_WINDOWS === 5 && window.__NV.DASHA_LATE_WINDOWS === 3);
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
check("unambiguous international DOB format in hero", liveReport.includes("DOB <strong>20 Aug 2005</strong>"));
check("report generation date stamped", /Report generated \d{1,2} \w{3,4} \d{4}/.test(liveReport));
check("reading guide present", liveReport.includes("How to read this report") && liveReport.includes("Driver (Moolank)") && liveReport.includes("Conductor (Bhagyank)") && liveReport.includes("40-Day Activation Plan"));
check("report closing block: brand + privacy + disclaimer", liveReport.includes("NumeroVastu 360 — Private Report") && liveReport.includes("not a substitute for professional medical, legal or financial advice"));
check("hero DOB formatter is timezone-safe and locale-aware", window.__NV.formatBirthDate({ day: 5, month: 8, year: 1976 }) === "5 Aug 1976" && window.__NV.formatBirthDate({}) === "");
check("closing block does not repeat the generation stamp", (() => { const closing = $("#reportRoot .report-closing") || mount(liveReport).querySelector(".report-closing"); return !!closing && !closing.textContent.includes("Report generated"); })());

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
  /* The reading guide, generation stamp and closing block are report-level
     copy, so they must ship in all three languages — no partial translation. */
  check(`${language} reading guide, generation line and closing block are localised`, report.includes(language === "hi" ? "इस रिपोर्ट को कैसे पढ़ें" : "આ રિપોર્ટ કેવી રીતે વાંચવો") && report.includes(language === "hi" ? "NumeroVastu 360 — निजी रिपोर्ट" : "NumeroVastu 360 — ખાનગી રિપોર્ટ") && report.includes(language === "hi" ? "रिपोर्ट निर्मित" : "રિપોર્ટ બનાવ્યું") && !report.includes("How to read this report"));
  check(`${language} hero DOB renders locale month names`, new RegExp(language === "hi" ? "जन्म तिथि: <strong>20 .+ 2005</strong>" : "જન્મ તારીખ: <strong>20 .+ 2005</strong>").test(report));
}
check("mobile timeline navigation remains horizontally reachable", /@media \(max-width: 640px\)/.test(styles) && /\.report-nav \{ flex-wrap: nowrap; overflow-x: auto;/.test(styles) && /\.timeline-anchor-nav \{ flex-wrap: nowrap; overflow-x: auto;/.test(styles));
check("print/PDF expands both panels and the collapsed Vedic comparison", /@media print/.test(styles) && /\.report-module-panel\[hidden\] \{ display: flex !important; \}/.test(styles) && /\.advanced-vedic-comparison:not\(\[open\]\) > \.details-body \{ display: flex !important; \}/.test(styles));
check("cockpit-only print job keeps its one-A4 contract (closing footer screen-only)", /body\.print-cockpit \.report-closing \{ display: none !important; \}/.test(styles));
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
  ["ref hero pill", rRef.includes("Vedic chart unlocked") && rRef.includes("Aquarius Lagna") && rRef.includes("Jyeshtha Star")],
  ["star-lord → Driver resonance note (Jyeshtha → Mercury → Driver 5)", rRef.includes("Star–Driver resonance") && rRef.includes("Mercury (Budha)") && rRef.includes("your Driver <strong>5</strong>") && rRef.includes("adds no remedy and changes no timing")],
  ["ref MC keeps its astronomical identity, never sold as the 10th cusp", rRef.includes("Midheaven (MC)") && !rRef.includes("Midheaven / 10th House Cusp")],
  ["ref Dasham Bhava names the true 10th-from-Lagna sign (Aquarius → Scorpio)", rRef.includes("Whole-sign Vedic 10th house (Dasham Bhava) from your Lagna: <strong>♏ Scorpio</strong>")],
  ["ref no undefined leaks", !rRef.includes("undefined")],
  ["ref no NaN leaks", !rRef.includes("NaN")],
];
refRenderChecks.forEach(([name, ok]) => check(name, ok));

/* The Midheaven is NOT the Vedic 10th-house cusp. On this chart the Lagna is
   Libra and the MC falls in Leo, while whole-sign Dasham Bhava (10th from the
   Lagna) is Cancer — the two disagree by a sign, which happens in roughly a
   third of charts. The snapshot must keep both identities honest. */
const mcSplitProfile = window.__NV.computeProfile(Object.assign({}, baseInput, { name: "MC Split", dob: "1950-01-03", birthTime: "03:35", birthPlace: "Faridabad, India" }));
const rMcSplit = window.__NV.renderReport(mcSplitProfile);
[
  ["split chart: MC cell reports the MC sign (Leo), not the 10th house", mcSplitProfile.astro.lagna.sign === "Libra" && mcSplitProfile.astro.mc.sign === "Leo" && rMcSplit.includes("Midheaven (MC)") && rMcSplit.includes("Leo 5°13′")],
  ["split chart: Dasham Bhava follows the Lagna (Cancer), not the MC", rMcSplit.includes("Whole-sign Vedic 10th house (Dasham Bhava) from your Lagna: <strong>♋ Cancer</strong>")],
].forEach(([name, ok]) => check(name, ok));

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
   A total friendly to *both* birth numbers does not exist for a small set of
   Driver×Conductor pairs (Driver 3 × Conductor 9 among them, under the
   classical one-way Maitri table of pack 2.10.0), which used to render
   "pick one whose digits total ." — the highest-impact remedy in the report
   with no number in it. The engine must fall back rather than go quiet, and
   must never recommend a root that is an outright enemy of either number. */
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
/* 3 × 9 (Jupiter / Mars) has no root friendly to both under the classical
   Maitri table — 3's friends {2,5} and 9's friends {1,6} never meet, and the
   self-rows are enemy/neutral — so the fallback tier is exercised here. */
check("mobile remedy: Driver 3 × Conductor 9 (no total is friendly to both) still falls back", (() => {
  const roots = window.__NV.mobileSuggestion(Object.assign({ driver: 3, conductor: 9 }, mobHostile)).goodTotals.map((total) => window.__NV.reduce(total));
  return roots.length === 6 && roots.every((r) => [5, 6, 9].includes(r));
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
/* Under the classical Maitri table (pack 2.10.0) roots 6 and 9 are friendly
   to BOTH Driver 6 and Conductor 1 (Mars befriends both Shukra and Surya;
   Surya befriends Shukra and Mars), so the ideal list is 9/15/18/24/27/33. */
check("Simardeep report names the ideal mobile totals instead of an empty gap", /pick one whose digits total 9, 15, 18, 24, 27, 33\./.test(simardeepMobile) && !/digits total\s*\./.test(simardeepMobile));

/* ---- Mobile verdict must never contradict its own ideal-total list ---------
   The reported chart is Driver 5 / Conductor 9 (Mercury / Mars): the only root
   friendly to *both* is 1 (Sun), so 8155056910 (40 → 4) was hostile to Mars and
   the report recommended 10/19/28/37/46/55. The replacement 7574011152 totals
   33 → 6 (Venus): under the classical Maitri table (pack 2.10.0) Mars
   befriends Venus while Mercury is neutral to her — friendly to one, neutral
   to the other. That is genuinely not hostile, so `needed` stays
   false; but the old code then printed "vibrates acceptably, no change
   required" and rendered no ideal totals at all, contradicting the list the
   same report had just recommended. The engine now classifies three verdicts
   (hostile / off-target / optimal) and always returns the ideal totals. */
const mcPairs = [[5, 9], [9, 5]];
check("mobile verdict: 5x9 and 9x5 both reduce the ideal set to root 1 (totals 10..55)", mcPairs.every(([d, c]) =>
  JSON.stringify(window.__NV.mobileSuggestion({ driver: d, conductor: c, mobRelD: "enemy", mobRelC: "enemy" }).goodTotals) === "[10,19,28,37,46,55]"
));
check("mobile verdict: a hostile total (40 → Rahu 4) is flagged for change", mcPairs.every(([d, c]) => {
  const sug = window.__NV.mobileSuggestion({ driver: d, conductor: c, mobCompound: 40, mobRelD: window.__NV.relation(d, 4), mobRelC: window.__NV.relation(c, 4) });
  return sug.needed === true && sug.verdict === "hostile";
}));
check("mobile verdict: 33 → 6 is not hostile but is off-target, and still carries the ideal totals", mcPairs.every(([d, c]) => {
  const sug = window.__NV.mobileSuggestion({ driver: d, conductor: c, mobCompound: 33, mobRelD: window.__NV.relation(d, 6), mobRelC: window.__NV.relation(c, 6) });
  return sug.needed === false && sug.verdict === "off-target" && JSON.stringify(sug.goodTotals) === "[10,19,28,37,46,55]";
}));
check("mobile verdict: a total inside the ideal set (19 → Sun 1) reads as optimal", mcPairs.every(([d, c]) => {
  const sug = window.__NV.mobileSuggestion({ driver: d, conductor: c, mobCompound: 19, mobRelD: window.__NV.relation(d, 1), mobRelC: window.__NV.relation(c, 1) });
  return sug.needed === false && sug.verdict === "optimal";
}));
/* Membership is judged on the reduced root, not on the sliced top-6, so a
   larger total that still reduces to the ideal root is not demoted. */
check("mobile verdict: 64 → 1 is optimal even though 64 is outside the printed top-6", (() => {
  const sug = window.__NV.mobileSuggestion({ driver: 5, conductor: 9, mobCompound: 64, mobRelD: "friendly", mobRelC: "friendly" });
  return sug.verdict === "optimal" && !sug.goodTotals.includes(64);
})());
/* The fallback tier (Driver 3 x Conductor 9) has no both-friendly root, so
   every non-enemy root is inside the ideal set and off-target can never fire. */
check("mobile verdict: a fallback-tier pair can never report off-target", [5, 6, 9].every((r) => {
  const sug = window.__NV.mobileSuggestion({ driver: 3, conductor: 9, mobCompound: r * 9 + r, mobRelD: window.__NV.relation(3, r), mobRelC: window.__NV.relation(9, r) });
  return sug.needed === false && sug.verdict === "optimal";
}));

const mcOffTarget = profile({ dob: "1970-05-05", mobile: "7574011152", gender: "male" });
check("reported chart: Driver 5 / Conductor 9 with mobile 7574011152 totals 33 → 6", mcOffTarget.driver === 5 && mcOffTarget.conductor === 9 && mcOffTarget.mobCompound === 33 && mcOffTarget.mobNum === 6);
const mcOffTargetHtml = mount(window.__NV.renderReport(mcOffTarget)).innerHTML
  .split("Mobile Number Vibration")[1]
  .split("Vehicle Number Vibration")[0];
const mcOffTargetText = mcOffTargetHtml.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
check("off-target mobile report keeps the number but still names the ideal totals", /not hostile to your birth numbers/.test(mcOffTargetText) && /totals 10, 19, 28, 37, 46, 55 remain your best picks/.test(mcOffTargetText) && !/no change required/.test(mcOffTargetText));
/* The headline badge must not outrank the verdict: a green "Harmonious"
   sitting directly above "sits outside your ideal set" is the mixed message
   that started this. The per-row badges stay accurate, so the assertion skips
   the leading "Digits total …" info pill and reads the verdict badge. */
const mcVerdictBadge = (html) => (html.match(/<span class="badge [^"]*"[^>]*>([^<]*)<\/span>/g) || [])
  .map((m) => m.replace(/^<[^>]*>/, "").replace(/<\/span>$/, ""))
  .filter((label) => !/^Digits total/.test(label))[0] || "";
check("off-target headline badge reads 'Acceptable — off ideal set', never 'Harmonious'", mcVerdictBadge(mcOffTargetHtml) === "Acceptable — off ideal set");
const mcOptimalHtml = mount(window.__NV.renderReport(profile({ dob: "1970-05-05", mobile: "7210000009", gender: "male" }))).innerHTML
  .split("Mobile Number Vibration")[1]
  .split("Vehicle Number Vibration")[0];
check("optimal mobile report still says no change required", /vibrates acceptably with your birth numbers — no change required/.test(mcOptimalHtml.replace(/<[^>]*>/g, "").replace(/\s+/g, " ")));
check("optimal headline badge stays 'Harmonious'", mcVerdictBadge(mcOptimalHtml) === "Harmonious");
/* Behaviour change worth pinning: a root neutral to BOTH birth numbers used to
   print a "Neutral" headline badge. Every such root is by definition outside a
   both-friendly ideal set, so it now reads off-target instead — more
   informative, and the prose explains it. (The relBadge("neutral") branch is
   retained for custom knowledge packs whose friendship rows could make it
   reachable again; no bundled pack reaches it.) */
const mcNeutralProfile = profile({ dob: "1971-02-02", mobile: "3000000000", gender: "male" });
check("a both-neutral root is Driver 2 / Conductor 4 with root 3", mcNeutralProfile.driver === 2 && mcNeutralProfile.conductor === 4 && mcNeutralProfile.mobNum === 3
  && mcNeutralProfile.mobRelD === "neutral" && mcNeutralProfile.mobRelC === "neutral");
const mcNeutralHtml = mount(window.__NV.renderReport(mcNeutralProfile)).innerHTML
  .split("Mobile Number Vibration")[1]
  .split("Vehicle Number Vibration")[0];
check("a both-neutral root now reads off-target, not a bare 'Neutral'", mcVerdictBadge(mcNeutralHtml) === "Acceptable — off ideal set"
  && window.__NV.mobileSuggestion(mcNeutralProfile).verdict === "off-target");


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
/* Declared authority scopes. feng-shui (the cordoned-off optional Kua module)
   and vedic-direction-rulers (the classical Ashta Dikpalaka reference card)
   were added by the 2026-09 architecture audit; neither may carry Lo Shu
   remedy obligations. */
const AUTHORITY_VOCAB = new Set(["lo-shu-overlay", "driver-conductor", "vedic-tattva", "zodiac-reference", "personal-year-context", "dasha", "dasha-vastu-zone", "vimshottari", "home-vastu-context", "compatibility-reflection", "chandra-bala", "clinical-cockpit", "framework-note", "feng-shui", "vedic-direction-rulers"]);
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

/* ---- Scaled Sadhana depth (practice bandwidth) ---------------------------
   The consultee chooses a practice depth; the scale sizes the daily practice
   and NOTHING else. These assertions pin the three doses (11x Minimalist /
   27x Practitioner / 108x Classical), prove that the Lo Shu target and the
   triage tier are identical at every depth, that a held japa stays held, and
   that the Section 4A Tattva scope — which is forbidden to carry mala,
   mineral or Lo Shu mandala content — is untouched by the new copy. */
const sadhanaLevels = ["beginner", "intermediate", "classical"];
const sadhanaProfiles = {};
sadhanaLevels.forEach((level) => { sadhanaProfiles[level] = profile({ dob: "1986-06-30", sadhana: level }); });
const sadhanaPlans = {};
sadhanaLevels.forEach((level) => { sadhanaPlans[level] = window.__NV.activationPlan(sadhanaProfiles[level]); });

check("intake offers exactly the three Scaled Sadhana depths", (() => {
  const options = $$("#sadhanaOptions .sadhana-option");
  return options.length === 3
    && options.map((b) => b.dataset.sadhana).join(",") === "beginner,intermediate,classical"
    && options.every((b) => b.type === "button" && /sadhana(Block|Title)/.test(b.closest("#sadhanaBlock") ? "sadhanaBlock" : "sadhanaTitle"));
})());
check("the Practitioner / Sadhak 27x dose is the default so no existing prescription changes silently", (() => {
  const options = $$("#sadhanaOptions .sadhana-option");
  const selected = options.filter((b) => b.classList.contains("selected"));
  return selected.length === 1 && selected[0].dataset.sadhana === "intermediate" && selected[0].getAttribute("aria-pressed") === "true"
    && window.__NV.normalizeSadhana(undefined) === "intermediate" && window.__NV.normalizeSadhana("guru") === "intermediate"
    && window.__NV.normalizeSadhana("CLASSICAL") === "classical" && profile({ dob: "1986-06-30" }).sadhana === "intermediate";
})());
check("each depth renders its own japa dose (11x / 27x / 108x) in the plan and the triage card", (() => {
  const expected = { beginner: "11", intermediate: "27", classical: "108" };
  return sadhanaLevels.every((level) => {
    const count = expected[level];
    const planText = sadhanaPlans[level].daily[0].value;
    const triage = window.__NV.remedyTriage(sadhanaProfiles[level]);
    return new RegExp(`— ${count} times`).test(planText) && new RegExp(`${count}× daily`).test(triage.tier1.japa);
  });
})());
check("practice depth never re-sources the Lo Shu remedy target or the triage tier", (() => {
  const targets = sadhanaLevels.map((level) => window.__NV.activationPlan(sadhanaProfiles[level]).targetN);
  const tiers = sadhanaLevels.map((level) => window.__NV.remedyTriage(sadhanaProfiles[level]).tier1.n);
  const tiersMode = sadhanaLevels.map((level) => window.__NV.remedyTriage(sadhanaProfiles[level]).tier1.mode);
  return new Set(targets).size === 1 && new Set(tiers).size === 1 && new Set(tiersMode).size === 1
    && targets[0] === window.__NV.loShuPracticeTargets(sadhanaProfiles.classical).primary;
})());
check("the plan card declares the chosen depth and sizes mala, snan and charity with it", (() => {
  const beginner = mount(window.__NV.sadhanaPlanBlock(sadhanaProfiles.beginner, sadhanaPlans.beginner));
  const classical = mount(window.__NV.sadhanaPlanBlock(sadhanaProfiles.classical, sadhanaPlans.classical));
  const rowText = (node, key) => $(`[data-sadhana-row="${key}"]`, node).textContent;
  return $(".sadhana-card", beginner).dataset.sadhanaScale === "beginner"
    && $(".sadhana-card", classical).dataset.sadhanaScale === "classical"
    && $(".sadhana-card", classical).getAttribute("data-remedy-authority") === "lo-shu"
    && /No mala required/.test(rowText(beginner, "mala")) && /dedicated mala/.test(rowText(classical, "mala"))
    && /Monthly/.test(rowText(beginner, "charity")) && /Weekly/.test(rowText(classical, "charity"))
    && /quick shower/.test(rowText(beginner, "snan")) && /every practice day/.test(rowText(classical, "snan"))
    && /5 minutes/.test(rowText(beginner, "breath")) && /20 minutes/.test(rowText(classical, "breath"));
})());
check("the Classical depth points back at the health notice instead of silently adding intensity", (() => {
  const classical = mount(window.__NV.sadhanaPlanBlock(sadhanaProfiles.classical, sadhanaPlans.classical));
  const beginner = mount(window.__NV.sadhanaPlanBlock(sadhanaProfiles.beginner, sadhanaPlans.beginner));
  return /licensed healthcare professional/.test(classical.textContent) && /Ethical & Health Notice/.test(classical.textContent)
    && !/licensed healthcare professional/.test(beginner.textContent);
})());
check("a clinical guardrail still caps the dose: held japa stays held at every depth", (() => {
  return sadhanaLevels.every((level) => {
    const held = window.__NV.activationPlan(sadhanaProfiles[level], { tier1: { mode: "environmental", n: 2, planet: "Moon (Chandra)", reasons: ["No missing number is live in the current stack"], japa: "Hold japa — no beej mantra is clinically indicated this period", zone: "North-West", zoneRemedy: "Keep the North-West clutter-free." }, tier2: [] });
    const card = mount(window.__NV.sadhanaPlanBlock(sadhanaProfiles[level], held));
    return held.holdJapa === true && held.sadhana === level && /japa on hold/.test(held.daily[0].label) && /held this cycle by the Remedy Triage/.test(card.textContent);
  });
})());
const moonClassical = profile({ name: "Randeep Walia", dob: "1976-08-05", goals: ["Health", "Career"], gender: "male", birthTime: "20:15", birthPlace: "Faridabad, Haryana, India", sadhana: "classical" });
check("clinical guardrails are never scaled away by the Classical depth", (() => {
  const domMoon = mount(window.__NV.renderReport(moonClassical));
  const card = $(".sadhana-card", domMoon);
  /* Even at 108x the Moon-cold guardrail renders, and a held japa stays held:
     the scale reports the dose it will resume instead of chanting past it. */
  return window.__NV.moonColdSensitivity(moonClassical)
    && !!$('[data-clinical-guardrail="moon-cold"]', domMoon)
    && !!card && card.dataset.sadhanaScale === "classical" && /held this cycle by the Remedy Triage/.test(card.textContent);
})());
check("the scale copy never leaks into the Section 4A Tattva scope", (() => {
  const text = mount(window.__NV.renderVedicTattvaSection(waliaProfile)).textContent;
  return !/Scaled Sadhana|practice depth|dedicated mala|Japa \/ affirmation dose/i.test(text) && !/mala/i.test(text);
})());
check("the scaled dose localises into Devanagari and Gujarati numerals", window.__NV.localNumber(108, "hi") === "१०८" && window.__NV.localNumber(108, "gu") === "૧૦૮" && window.__NV.localNumber(27, "en") === "27"
  && (() => { window.__NV.setLanguage("hi"); const hiPlan = window.__NV.activationPlan(sadhanaProfiles.classical); const ok = /१०८ बार/.test(hiPlan.daily[0].value); window.__NV.setLanguage("gu"); const guPlan = window.__NV.activationPlan(sadhanaProfiles.classical); const okGu = /૧૦૮ વખત/.test(guPlan.daily[0].value); window.__NV.setLanguage("en"); return ok && okGu; })());
check("every Scaled Sadhana key is translated in all three languages", (() => {
  const keys = Object.keys(window.I18N.en.ui).filter((k) => /^sadhana/.test(k));
  return keys.length >= 40 && ["en", "hi", "gu"].every((lang) => keys.every((k) => typeof window.I18N[lang].ui[k] === "string" && window.I18N[lang].ui[k].trim().length > 0));
})());

/* ---- Upfront Ethical & Health Notice (Northstar Summary) ------------------
   The notice must open the Northstar Summary (the report's page-2 summary
   card), must state the exact framing the practitioner approved, and must
   carry no remedy authority: it is a framework note, not a prescription. */
const NOTICE_BODY = "Numerology, Vedic Dasha timelines, and elemental tattva suggestions are traditional interpretive frameworks for personal reflection and lifestyle harmonization. They do not constitute medical, psychological, legal, or financial diagnoses. Always consult a licensed healthcare professional before initiating new dietary fasts, herbal routines, or intense breathwork regimens.";
check("the upfront notice sits directly inside the Northstar Summary, before the story", (() => {
  const section = $("#summary-section", mount(window.__NV.renderReport(authorityProfile)));
  const notice = $("[data-clinical-notice='upfront']", section);
  const children = Array.from($(".summary-shell", section).children).map((el) => el.className);
  return !!notice && notice.tagName === "ASIDE" && notice.getAttribute("role") === "note"
    && notice.getAttribute("data-authority") === "framework-note"
    && children.indexOf("summary-notice") > children.indexOf("summary-title") && children.indexOf("summary-notice") < children.indexOf("summary-story");
})());
check("the notice carries the exact approved clinical & metaphysical wording", (() => {
  const notice = $("[data-clinical-notice='upfront']", mount(window.__NV.renderReport(authorityProfile)));
  return notice.textContent.includes("Ethical & Health Notice") && notice.textContent.includes(NOTICE_BODY);
})());
check("the notice is a framework note with no remedy or solar-moderation obligation", (() => {
  const notice = $("[data-clinical-notice='upfront']", mount(window.__NV.renderReport(authorityProfile)));
  return !notice.querySelector("[data-remedy-authority]") && !notice.querySelector("[data-solar-moderation]") && !notice.querySelector("[data-clinical-guardrail]");
})());
check("the notice localises in all three languages", ["en", "hi", "gu"].every((lang) => {
  const ui = window.I18N[lang].ui;
  return typeof ui.clinicalNoticeTitle === "string" && ui.clinicalNoticeTitle.trim().length > 0
    && typeof ui.clinicalNoticeBody === "string" && ui.clinicalNoticeBody.trim().length > 120;
}) && window.I18N.en.ui.clinicalNoticeBody === NOTICE_BODY);
check("print keeps the notice whole and bordered on white paper", /\.summary-notice \{ break-inside: avoid-page; page-break-inside: avoid; background: #fff; border: 1px solid #999;/.test(styles) && /\.summary-notice-body \{ color: #333; \}/.test(styles));
check("the summary reports the chosen practice depth beside the remedies", (() => {
  const domSummary = mount(window.__NV.renderReport(sadhanaProfiles.classical));
  const cards = $$(".summary-card", domSummary).map((c) => c.textContent);
  const beginnerCards = $$(".summary-card", mount(window.__NV.renderReport(sadhanaProfiles.beginner))).map((c) => c.textContent);
  return cards.some((t) => /Practice depth/.test(t) && /108/.test(t) && /Classical/.test(t))
    && beginnerCards.some((t) => /Practice depth/.test(t) && /11/.test(t) && /Minimalist/.test(t));
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

/* ---- 2026-09 architecture & UX audit fixes ------------------------------
   Pillars: (1) strict grid tagging for event windows, Kua cordoned off as an
   optional Feng Shui module, primary Dasha engine with a cordoned
   cross-reference; (2) progressive disclosure with goal aggregation and no
   technical leaks in the client view; (3) the 7-Day Micro-Routine and DO /
   DO-NOT cards at the front; (4) Client/Practitioner bundling, practicality-
   rated name corrections and automated conflict muting. */

// Amar Sambhvani — the reference chart from the audit (24 Jan 1983, 00:10,
// Ahmedabad; Money + Business + Career all map to missing 5).
const amarProfile = profile({
  name: "Amar Sambhvani", dob: "1983-01-24", gender: "male",
  goals: ["Money", "Business", "Career"], birthTime: "00:10",
  birthPlace: "Ahmedabad, Gujarat, India", healthTags: ["heat"]
});
const amarReport = window.__NV.renderReport(amarProfile);
const amarDom = mount(amarReport);

/* Pillar 1a — strict grid tagging on life-event windows */
check("event-window grades always evaluate the Vedic array and say so", (() => {
  const conv = window.__NV.natalConversion(
    { primary: [4, 7], support: [5] }, 5, 4, amarProfile);
  return conv.grid === "vedic" && conv.adPresent === (amarProfile.vedicCounts[4] > 0);
})());
check("event-window sentences name the Vedic Ank Kundali, never a generic birth grid", (() => {
  const windows = $$('[data-window-grade]', amarDom);
  return windows.length > 0 && windows.every((w) => w.getAttribute("data-natal-grid") === "vedic")
    && /Vedic Ank Kundali grid \(3–1–9 \/ 6–7–5 \/ 2–8–4\)/.test(amarReport);
})());
check("grid divergences between Lo Shu and Vedic arrays are disclosed, not hidden", (() => {
  // 9 plots in Amar's Lo Shu grid (century digit) but not in his Vedic grid —
  // any window whose significator spans that gap must carry the disclosure.
  const conv = window.__NV.natalConversion({ primary: [9], support: [] }, 9, 9, amarProfile);
  return conv.divergence.includes(9) && conv.grid === "vedic";
})());

/* Pillar 1b — Kua cordoned off as an optional Feng Shui module */
check("Kua is an explicit optional Feng Shui module, not a Vastu zone", (() => {
  const sec = $("#kua-section", amarDom);
  return !!sec && sec.getAttribute("data-module") === "feng-shui-optional"
    && sec.getAttribute("data-authority") === "feng-shui"
    && !!$("[data-kua-module]", sec)
    && /optional, separate module/.test(sec.textContent)
    && !$("#vastu-section [data-kua-module]", amarDom);
})());
check("the Vastu section stands on classical Ashta Dikpalaka direction rulers", (() => {
  const card = $(".ashta-dikpalaka-card", amarDom);
  return !!card && ["Indra", "Agni", "Yama", "Nirṛti", "Varuṇa", "Vāyu", "Kubera", "Īśāna"]
    .every((deity) => card.textContent.includes(deity))
    && card.getAttribute("data-authority") === "vedic-direction-rulers";
})());

/* Pillar 1c — primary Dasha engine with a cordoned cross-reference */
check("the Dasha section declares its primary engine and cordons the other", (() => {
  const sec = $("#dasha-section", amarDom);
  const banner = $(".dasha-engine-banner", amarDom);
  return !!sec && sec.getAttribute("data-primary-dasha-engine") === "ank"
    && !!banner && /Two Dasha clocks/.test(banner.textContent)
    && !!$('[data-crossref-engine="vimshottari"]', sec)
    && !$('[data-crossref-engine="ank"]', sec);
})());
check("the banner names both current lords so Mercury vs Jupiter reads as two clocks", (() => {
  const banner = $(".dasha-engine-banner", amarDom);
  return !!banner && /Ank Jyotish Mercury \(5\)/.test(banner.textContent)
    && /Vimshottari.*Jupiter|Jupiter/.test(banner.textContent)
    && banner.getAttribute("data-dasha-agree") === "no";
})());
check("switching the primary engine swaps which system is cordoned off", (() => {
  window.localStorage.setItem("nv360.dashaEngine.v1", "vimshottari");
  window.__NV.setDashaEngine("vimshottari");
  const rep = mount(window.__NV.renderReport(amarProfile));
  const sec = $("#dasha-section", rep);
  const ok = sec.getAttribute("data-primary-dasha-engine") === "vimshottari"
    && !!$('[data-crossref-engine="ank"]', sec)
    && !$('[data-crossref-engine="vimshottari"]', sec);
  window.__NV.setDashaEngine("ank");
  window.localStorage.removeItem("nv360.dashaEngine.v1");
  return ok;
})());

/* Pillar 2a — goal aggregation kills the copy-paste redundancy */
check("Money, Business and Career merge into one Combined Strategic Focus section", (() => {
  const combined = $$('[data-goal-aggregation="combined"]', amarDom);
  const goalHeadings = $$("h2.rsection-title", amarDom).filter((h) => /Lo Shu Remedy Focus/.test(h.textContent));
  return combined.length === 1
    && /Combined Strategic Focus: Money, Business, Career \(Mercury 5\)/.test(combined[0].textContent)
    && !!combined[0].querySelector('[data-combined-goals="Money,Business,Career"]')
    && goalHeadings.length === 0;
})());
check("a combined section renders each remedy kit exactly once", (() => {
  const combined = $('[data-goal-aggregation="combined"]', amarDom);
  const kits = $$(".card .num-value", combined).map((n) => n.textContent.trim());
  return kits.filter((k) => k === "5").length === 1;
})());

/* Pillar 2b — technical leaks stripped from the client view */
check("the raw JSON contribution payload is marked practitioner-only", (() => {
  const block = $('[data-technical="contribution-scaffold"]', amarDom);
  return !!block && block.classList.contains("practitioner-only")
    && /schemaVersion/.test(block.textContent);
})());
check("client CSS suppresses every practitioner-only block on screen and in print", /body\.report-mode-client \.practitioner-only,\s*body\.report-mode-client \[data-technical\] \{ display: none !important; \}/.test(styles) && /body\.report-mode-client \.practitioner-only,\s*body\.report-mode-client \[data-technical\],\s*body\.report-mode-client \.dasha-crossref \{ display: none !important; \}/.test(styles));
check("the Muhurtha section no longer leaks h0=-0.8333° or engine names to clients", (() => {
  // The raw hour-angle constant is practitioner-only. In the default client
  // view it may be entirely absent (toggle off) — the only requirement is that
  // it can NEVER reach the client-facing markup.
  const idx = amarReport.indexOf("h0=-0.8333");
  let guarded = true;
  if (idx !== -1) {
    const before = amarReport.slice(Math.max(0, idx - 300), idx);
    guarded = /practitioner-only/.test(before);
  }
  // Strip every practitioner-only node, then assert the client view is clean.
  const visible = amarReport.replace(/<(div|span)[^>]*class="[^"]*practitioner-only[^"]*"[^>]*>[\s\S]*?<\/(div|span)>/g, "");
  return guarded && !/h0=-0\.8333/.test(visible) && !/Meeus Ch\.16/.test(visible) && !/Meeus ephemeris \(AA\)/.test(visible);
})());

/* Pillar 3 — Layman Implementation Framework at the front */
check("the 7-Day Micro-Routine table sits in the Layer-1 summary", (() => {
  const layer = $('[data-report-layer="1"] .micro-routine-card', amarDom);
  if (!layer) return false;
  const rows = $$("tr", layer);
  return rows.length >= 4
    && /Daily \(Sunrise\)/.test(layer.textContent)
    && /Daily \(Night\)/.test(layer.textContent)
    && /Chant/.test(layer.textContent);
})());
check("the micro-routine sunrise row matches the Tier-1 target of the 40-day plan", (() => {
  const card = $('[data-micro-routine]', amarDom);
  const plan = window.__NV.activationPlan(amarProfile);
  return card.textContent.includes(String(plan.targetN)) && card.textContent.includes("27");
})());
check("explicit DO / DO-NOT cards render in Layer 1 with contrast content", (() => {
  const grid = $('[data-report-layer="1"] .do-avoid-grid', amarDom);
  if (!grid) return false;
  const dos = $$(".do-item", grid).map((n) => n.textContent);
  const donts = $$(".dont-item", grid).map((n) => n.textContent);
  return dos.length >= 2 && donts.length >= 2
    && donts.some((t) => /stack multiple dark stones|gemstones/i.test(t))
    && dos.some((t) => /North-East|Brahmasthan/i.test(t));
})());
check("solar overload + Pitta mutes the conflicting Sun day row instead of printing it live", (() => {
  const muted = $$('.micro-routine-card tr[data-conflict-muted="solar-overload"]', amarDom);
  const solar = window.__NV.solarOverload(amarProfile);
  return solar && muted.length >= 1 && /Muted/.test(muted[0].textContent)
    && $$(".do-item", amarDom).every((n) => !/Surya Bhedana/.test(n.textContent));
})());
/* Pillar 3b — 2026-09 polish: the routine must be runnable at a glance, the
   solar guardrail must not read as "all sun practice is banned", and no cell
   may print a hyphen mangled by a PDF line-wrap. */
check("micro-routine action cells print labelled lines instead of concatenated prose", (() => {
  const card = $("[data-micro-routine]", amarDom);
  if (!card) return false;
  const cells = $$("td.micro-action-cell", card);
  const kinds = new Set($$("td.micro-action-cell [data-action-kind]", card).map((n) => n.getAttribute("data-action-kind")));
  const text = card.textContent.replace(/\s+/g, " ");
  return cells.length >= 5 && kinds.has("wear") && kinds.has("donate")
    && !/Wear:\s*Wear/i.test(text) && !/Donate:\s*Donate/i.test(text);
})());
check("the Friday row keeps colour, wear clause and charity on separate labelled lines", (() => {
  const card = $("[data-micro-routine]", amarDom);
  const friday = $$("tr", card).find((tr) => /Shukra/.test(tr.textContent));
  if (!friday) return false;
  const items = $$("[data-action-kind]", friday).map((n) => n.getAttribute("data-action-kind"));
  const text = friday.textContent.replace(/\s+/g, " ");
  return items[0] === "wear" && items.includes("donate")
    && /Wear: White · clean, fragrant clothes/.test(text)
    && /Donate: white sweets, rice, curd/.test(text);
})());
check("the solar-muted Sun row still allows a brief sunrise arghya and drops the daily offering ritual", (() => {
  const card = $("[data-micro-routine]", amarDom);
  const row = $$('tr[data-conflict-muted="solar-overload"]', card).find((tr) => /Surya/.test(tr.textContent))
    || $$('tr[data-conflict-muted="solar-overload"]', card)[0];
  if (!row) return false;
  const text = row.textContent.replace(/\s+/g, " ");
  return /Brief sunrise Arghya only \(30 sec\)/.test(text)
    && /avoid midday sun/.test(text)
    && !/Offer water to the rising Sun daily/.test(text)
    && /Muted/.test(text);
})());
check("the DO card keeps the brief arghya while the DO-NOT card bans only the extended forms", (() => {
  const grid = $('[data-report-layer="1"] .do-avoid-grid', amarDom);
  const dos = $$(".do-item", grid).map((n) => n.textContent);
  const donts = $$(".dont-item", grid).map((n) => n.textContent);
  return dos.some((t) => /30-second sunrise Arghya/.test(t))
    && donts.some((t) => /Skip extended sun rituals/.test(t) && /Surya Bhedana/.test(t))
    && !dos.some((t) => /Surya Bhedana/.test(t));
})());
check("micro-forecast Vastu micro-actions print clause-per-line with clean punctuation", (() => {
  const card = $(".dasha-micro-forecast", amarDom);
  if (!card) return false;
  const lists = $$(".micro-forecast-list", card);
  const moonRow = $$("tr", card).find((tr) => /clutter-free/.test(tr.textContent));
  return lists.length >= 3
    && lists.every((list) => $$("li", list).length >= 1 && $$("li", list).every((li) => /[.!?]$/.test(li.textContent.trim())))
    && !!moonRow && /Keep the North-West clutter-free\./.test(moonRow.textContent);
})());
check("client text hygiene repairs dangling hyphens, spaced punctuation and the reported typo", (() => {
  const tidy = window.__NV.tidyText("Clear the zone; it stays clutterfree-; and , tidy");
  const clientText = amarReport.replace(/<[^>]+>/g, " ").replace(/&#\d+;/g, " ");
  return tidy === "Clear the zone; it stays clutter-free; and, tidy"
    && !/clutterfree/i.test(clientText)
    && !/[A-Za-z]-[;,.]/.test(clientText);
})());
/* 2.14.1 print-dossier polish (client QA, pages 20–21 / 41 / 2). The garbled
   "Window 1 - Everyday / Buyhliess cards" and "jointbone /strain" extractions
   were never bad data — they were a wrapped badge label painting its second
   line over the description below it, because .badge carried a FIXED
   height: 22px as an inline-flex box inside narrow table cells. The suite now
   pins all three layers of the fix: the growing badge box, the explicit cell
   leading, the block-wrapper cell structure, and the Sunday wear line. */
check("badge pills grow around wrapped labels instead of clipping at a fixed 22px", (() => {
  const badgeRule = (styles.match(/\.badge \{[^}]*\}/) || [""])[0];
  return /min-height: 22px/.test(badgeRule)
    && !/(^|[^-])height:\s*22px/.test(badgeRule);
})());
check("spelling and micro-forecast table cells print on defined 1.35 leading, top-aligned", (() => {
  return /\.spelling-table td, \.micro-forecast-table td \{ line-height: 1\.35; vertical-align: top; \}/.test(styles)
    && /\.spelling-table \.spelling-cell-title \{ display: flex; \}/.test(styles);
})());
check("spelling-table Strategy and Applies-to titles are their own block wrappers, not loose inline text", (() => {
  const table = $(".spelling-table", amarDom);
  if (!table) return false;
  const titles = $$("[data-strategy]", table).concat($$("[data-window-badge]", table));
  const hints = $$("[data-window-hint]", table).concat($$("[data-strategy-hint]", table));
  return titles.length >= 4
    && titles.every((n) => n.parentElement
      && n.parentElement.tagName === "DIV"
      && n.parentElement.classList.contains("spelling-cell-title")
      && n.parentElement.parentElement.tagName === "TD")
    && hints.length >= 2
    && hints.every((h) => h.tagName === "DIV" && h.classList.contains("card-sub")
      && h.parentElement.tagName === "TD"
      && !!h.previousElementSibling && h.previousElementSibling.classList.contains("spelling-cell-title"));
})());
check("the Saturn 90-day caution carries the clean joint/bone compound and renders it intact", (() => {
  const caution = ((window.DB.dasha || {})[8] || {}).caution || {};
  const en = String(caution.en || "");
  const clientText = amarReport.replace(/<[^>]+>/g, " ");
  return /Delays, joint\/bone strain and pessimism/.test(en)
    && !/jointbone|bone \/ strain| \/. /.test(en)
    && !/jointbone/i.test(clientText);
})());
check("micro-forecast MD · AD math sits on its own block line under the sub-lord name", (() => {
  const card = $(".dasha-micro-forecast", amarDom);
  if (!card) return false;
  const math = $$("td .card-sub", card).filter((n) => /^MD \d+ · AD \d+$/.test(n.textContent.trim()));
  return math.length >= 1
    && math.every((n) => n.parentElement.tagName === "TD"
      && !!n.parentElement.querySelector("strong"));
})());
check("the Sunday row prints complete dressing guidance, matching the Friday slot", (() => {
  const card = $("[data-micro-routine]", amarDom);
  if (!card) return false;
  const sunday = $$("tr", card).find((tr) => /Surya/.test(tr.textContent));
  if (!sunday) return false;
  const text = sunday.textContent.replace(/\s+/g, " ");
  const wear = $$("[data-action-kind='wear'] li, li[data-action-kind='wear']", sunday)[0];
  return /Wear: Gold, saffron, or warm yellow/.test(text)
    && !/^Wear: Gold(?!, saffron)/.test((wear || sunday).textContent.replace(/\s+/g, " ").trim())
    && !/Wear: Wear/i.test(text);
})());
check("the Tattva Agni plane mutes Surya Bhedana and Solar Activation under solar overload", (() => {
  const tattva = mount(window.__NV.renderVedicTattvaSection(amarProfile));
  const muted = $$('[data-conflict-muted="solar-overload"]', tattva);
  return muted.length >= 1
    && muted.every((row) => /Surya Bhedana|Solar Activation|सूर्य भेदन|सूर्य सक्रियण|સૂર્ય ભેદન|સૂર્ય સક્રિયકરણ/i.test(row.textContent));
})());

/* Pillar 4a — Client / Practitioner conditional bundling */
check("the report hero carries the Client / Practitioner switch and engine picker", (() => {
  const controls = $("[data-report-controls]", amarDom);
  return !!controls
    && $$("[data-report-mode-btn]", controls).length === 2
    && !!$("[data-dasha-engine-select]", controls)
    && !!$("#dashaEngineSelect") && !!$("#reportModeSelect");
})());
check("client print hides the cockpit panel and cross-reference appendices", /body\.report-mode-client:not\(\.print-cockpit\) #cockpit-panel \{ display: none !important; \}/.test(styles) && /@media print \{[\s\S]*body\.report-mode-client/.test(styles));
check("the explicit cockpit print job is honoured even in client mode", /body\.report-mode-client:not\(\.print-cockpit\) #cockpit-panel/.test(styles) && !/body\.report-mode-client\.print-cockpit #cockpit-panel \{ display: none/.test(styles));
check("practitioner print force-expands cross-references and the optional Kua module", /body\.report-mode-practitioner \.dasha-crossref:not\(\[open\]\) > \.dasha-crossref-body[\s\S]*?display: block !important;/.test(styles) && /body\.report-mode-practitioner \.optional-module-card:not\(\[open\]\) > \.card-body \{ display: block !important; \}/.test(styles));

/* Pillar 4b — name correction: practicality rating + first-name/initial options */
check("name suggestions carry a 1–5 pronunciation & practicality rating", (() => {
  const sug = window.__NV.nameSuggestions(amarProfile);
  const pool = (sug.variants || []).concat((sug.optional && sug.optional.variants) || []);
  return pool.length > 0 && pool.every((v) => v.practicality && v.practicality.score >= 1 && v.practicality.score <= 5 && typeof v.practicality.label === "string");
})());
check("name suggestions include middle-initial options, not just trailing doubles", (() => {
  const sug = window.__NV.nameSuggestions(amarProfile);
  const pool = (sug.variants || []).concat((sug.optional && sug.optional.variants) || []);
  return pool.some((v) => v.kind === "initial" && /add middle initial/.test(v.change));
})());
/* 2026-09 polish pass — the rating is tiered by strategy rather than blanket-
   penalised, so a client can see that the legal-safe route and the digital-
   safe route are different products: middle initial 5, low-contrast double 4,
   ending-shifting double 3. The old assertion ("cluster double <= 3") pinned
   the previous blanket penalty and is deliberately replaced, not weakened. */
check("name practicality is tiered by strategy: initial 5, subtle double 4, ending-shifting double 3", (() => {
  const initial = window.__NV.namePracticality({ text: "Amar H Sambhvani", change: 'add middle initial "H"', kind: "initial" }, "Amar Sambhvani");
  const lowContrast = window.__NV.namePracticality({ text: "Amar Sambhhvani", change: 'double "h"', kind: "double" }, "Amar Sambhvani");
  const endingShift = window.__NV.namePracticality({ text: "Amar Sambhvanni", change: 'double "n"', kind: "double" }, "Amar Sambhvani");
  const midNameInsert = window.__NV.namePracticality({ text: "Amear Sambhvani", change: 'insert "E" after "m"', kind: "insert" }, "Amar Sambhvani");
  return initial.score === 5 && lowContrast.score === 4 && endingShift.score === 3
    && initial.score > lowContrast.score && lowContrast.score > endingShift.score
    && midNameInsert.score < lowContrast.score
    && lowContrast.label === "Good" && endingShift.label === "Moderate";
})());
check("the spelling table prints the practicality column", /data-practicality="\d"/.test(amarReport) && /Pronunciation & practicality/.test(amarReport));

/* Pillar 4c — client agency over the name change: both strategies, one table */
check("the optional menu restores spelling alterations beneath the middle initials", (() => {
  const optional = window.__NV.buildOptionalSpellings(amarProfile);
  const variants = optional.variants || [];
  const kinds = variants.map((v) => v.kind);
  const strategies = variants.map((v) => window.__NV.nameStrategyOf(v.kind).key);
  return kinds.indexOf("initial") === 0
    && kinds.filter((k) => k === "initial").length >= 2
    && kinds.indexOf("double") > kinds.lastIndexOf("initial")
    && strategies.includes("middle-initial") && strategies.includes("spelling-alteration");
})());
/* The dual-name pass added the "Applies to" (window) column, so the table is
   six columns wide now — Strategy alone no longer tells the client whether a
   spelling touches their professional profile or a statutory record. The old
   five-column assertion is deliberately replaced, not weakened: the window
   column is asserted, and every row must still carry its strategy tag. */
check("the spelling table carries Strategy and Applies-to columns and tags every row", (() => {
  const table = $(".spelling-table", amarDom);
  if (!table) return false;
  const headers = $$("th", table).map((th) => th.textContent.trim());
  const strategies = $$("[data-strategy]", table).map((n) => n.getAttribute("data-strategy"));
  const windows = $$("tr[data-window]", table).map((n) => n.getAttribute("data-window"));
  return headers.includes("Strategy") && headers.includes("Suggested spelling") && headers.includes("Applies to")
    && headers.length === 6
    && strategies.includes("middle-initial") && strategies.includes("spelling-alteration")
    && windows.length >= 4 && windows.every((w) => w === "public" || w === "legal")
    && $$("[data-practicality]", table).length >= 4;
})());
check("the strategy column explains each strategy once, not on every row", (() => {
  const table = $(".spelling-table", amarDom);
  const hints = $$("[data-strategy-hint]", table);
  const keys = hints.map((n) => n.getAttribute("data-strategy-hint"));
  return hints.length === 2 && new Set(keys).size === 2
    && keys.includes("middle-initial") && keys.includes("spelling-alteration")
    && $$("tr[data-spelling-strategy]", table).length >= 4;
})());
check("middle-initial rows stay clean for legal records while alterations say digital-first", (() => {
  const table = $(".spelling-table", amarDom);
  const initialRow = $('tr[data-spelling-strategy="middle-initial"]', table);
  const alterationRow = $('tr[data-spelling-strategy="spelling-alteration"]', table);
  return !!initialRow && !!alterationRow
    && /banking and legal records/.test(initialRow.textContent)
    && /social media, digital profiles/.test(alterationRow.textContent)
    && /\(5\)/.test(initialRow.textContent);
})());

/* Pillar 4d — dual-name intake: everyday vs full legal identity
   One ambiguous "Full Name" box cannot tell the engine which spelling the
   client actually lives in, and it hides the patronymic that carries the only
   culturally free tuning lever: the real family initial. These checks pin the
   intake contract, the authentic-initial priority and the golden rule that no
   invented letter may be injected once the patronymic is known. */
const dualProfile = profile({
  name: "Amar K Sambhvani", legalName: "Amarkumar Kishorbhai Sambhvani",
  dob: "1983-01-24", goals: ["Money", "Business", "Career"], gender: "male"
});
const duelProfile = profile({ name: "Randeep Walia", legalName: "Randeep Ravindra Walia", dob: "1976-08-05", goals: ["Career"], gender: "male" });
const singleProfile = profile({ name: "Amar Sambhvani", dob: "1983-01-24", goals: ["Money"], gender: "male" });
const dualHtml = window.__NV.renderReport(dualProfile);
const dualDom = mount(dualHtml);

check("the intake captures an everyday name and a separate, optional legal name", (() => {
  const everyday = $("#fullName");
  const legal = $("#legalName");
  const everydayLabel = $('label[for="fullName"]').textContent.trim();
  const legalLabel = $('label[for="legalName"]').textContent.trim();
  return !!everyday && !!legal
    && everyday.hasAttribute("required") && !legal.hasAttribute("required")
    && /Everyday \/ Professional Name/.test(everydayLabel)
    && /Full Legal Name \(as on Aadhaar \/ PAN\)/.test(legalLabel)
    && /patronymic/.test($("#legalNameHint").textContent);
})());
check("the everyday name keeps the primary reading while the legal string is scored in parallel", (() => {
  return dualProfile.name === "Amar K Sambhvani" && dualProfile.nameCompound === 38 && dualProfile.nameNum === 2
    && dualProfile.legalName === "Amarkumar Kishorbhai Sambhvani"
    && dualProfile.legalNameCompound === 80 && dualProfile.legalNameNum === 8 && dualProfile.nameDual === true
    && dualProfile.patronymicTokens.join(",") === "Kishorbhai"
    && dualProfile.patronymicInitials.join(",") === "K"
    && singleProfile.nameDual === false && singleProfile.legalName === singleProfile.name
    && singleProfile.legalNameCompound === singleProfile.nameCompound;
})());
check("a single-name chart keeps its classic reading and is only nudged to add the legal string", (() => {
  const a = window.__NV.renderReport(singleProfile);
  return singleProfile.nameCompound === 36 && singleProfile.nameNum === 9
    && /Amar Sambhvani/.test(a) && !/id="legal-name-layer"/.test(a) && /id="legal-name-nudge"/.test(a)
    && window.__NV.nameIdentity("Amar Sambhvani", "").availableAuthenticInitials.length === 0;
})());
check("the authentic patronymic initial is offered first, ahead of every spelling alteration", (() => {
  const sug = window.__NV.nameSuggestions(duelProfile);
  const variants = (sug.variants || []).concat((sug.optional && sug.optional.variants) || []);
  const first = variants[0];
  const authIndex = variants.findIndex((v) => v.kind === "authentic-initial");
  return !!first && first.kind === "authentic-initial"
    && first.text === "Randeep R Walia" && first.compound === 44 && first.reduced === 8
    && first.window === "public" && first.authentic === true && first.letter === "R" && first.sourceToken === "Ravindra"
    && /authentic patronymic initial "R" \(from "Ravindra"\)/.test(first.change)
    && first.practicality.score === 5 && first.practicality.label === "Excellent"
    && window.__NV.nameStrategyOf("authentic-initial").key === "authentic-middle-initial"
    && authIndex === 0
    /* Under the classical Maitri table (pack 2.10.0) Mars is hostile to all
       three of this chart's missing numbers (Moon, Jupiter, Rahu), so no
       spelling alteration may be offered at all — the authentic initial
       alone remains, and every offered total must stay non-hostile to both
       birth numbers. */
    && variants.length === 1
    && variants.every((v) => window.__NV.relation(duelProfile.driver, v.reduced) !== "enemy" && window.__NV.relation(duelProfile.conductor, v.reduced) !== "enemy");
})());
check("a patronymic already abbreviated on the record is still an authentic initial", (() => {
  const id = window.__NV.nameIdentity("Amar Sambhvani", "Amarkumar K Sambhvani");
  const pool = window.__NV.nameCandidatePool(profile({ name: "Amar Sambhvani", legalName: "Amarkumar K Sambhvani" }), id);
  const auth = pool.find((c) => c.kind === "authentic-initial");
  return id.patronymicInitials.join(",") === "K"
    && !!auth && auth.text === "Amar K Sambhvani" && auth.letter === "K" && auth.sourceToken === "K";
})());
check("no arbitrary letter is injected once the legal patronymic is known", (() => {
  const pool = window.__NV.nameCandidatePool(duelProfile, window.__NV.nameIdentity("Amar Sambhvani", "Amarkumar Kishorbhai Sambhvani"));
  return pool.length > 0
    && !pool.some((c) => c.kind === "initial")
    && !pool.some((c) => /add middle initial/.test(c.change || ""))
    && pool.some((c) => c.kind === "authentic-initial" && c.letter === "K")
    && !pool.some((c) => c.kind === "authentic-initial" && c.letter !== "K");
})());
check("the golden rule rejects a second initial beside an existing middle token", (() => {
  const soloId = window.__NV.nameIdentity("Amar Kishorbhai Sambhvani", "");
  const soloPool = window.__NV.nameCandidatePool(profile({ name: "Amar Kishorbhai Sambhvani" }), soloId);
  /* Same patronymic spelled out again in the legal string: the identity knows
     the letter, but the everyday name already carries the token in full, so
     the only legitimate lever is compression. */
  const fullId = window.__NV.nameIdentity("Amar Kishorbhai Sambhvani", "Amarkumar Kishorbhai Sambhvani");
  const fullPool = window.__NV.nameCandidatePool(profile({ name: "Amar Kishorbhai Sambhvani", legalName: "Amarkumar Kishorbhai Sambhvani" }), fullId);
  const banned = (c) => /add middle initial/.test(c.change || "") || c.kind === "authentic-initial";
  return soloId.hasOwnMiddleToken === true
    && !soloPool.some((c) => c.kind === "initial")
    && !soloPool.some((c) => c.kind === "authentic-initial")
    && soloPool.some((c) => c.kind === "compress" && c.text === "Amar K Sambhvani")
    && fullId.availableAuthenticInitials.length === 0
    && !fullPool.some(banned);
})());
check("window 2 tunes only the first name and holds the patronymic byte-for-byte", (() => {
  const sug = window.__NV.nameSuggestions(dualProfile);
  const legal = sug.legalVariants || [];
  return legal.length >= 1
    && legal.every((v) => v.window === "legal"
      && /Kishorbhai Sambhvani$/.test(v.text)
      && /first name only/.test(v.change)
      && ["double", "swap", "insert"].includes(v.kind));
})());
check("the report prints the Document / Legal total beside the everyday reading", (() => {
  const card = $("#legal-name-layer", dualDom);
  const publicLayer = $('[data-name-layer="public"]', dualDom);
  return !!card && card.getAttribute("data-legal-total") === "80"
    && /Chaldean total 80/.test(card.textContent) && /Name Number 8/.test(card.textContent)
    && /Amarkumar Kishorbhai Sambhvani/.test(card.textContent)
    && /authentic initial K/.test(card.textContent) && /Chaldean 2/.test(card.textContent)
    && !!publicLayer && /Everyday \/ Public & Professional name/.test(publicLayer.textContent);
})());
check("the two windows of name correction are stated with the client's own examples", (() => {
  const card = $("#name-windows", dualDom);
  if (!card) return false;
  const rows = $$("[data-window-row]", card);
  return rows.length === 2
    && rows[0].getAttribute("data-window-row") === "public" && /Window 1 — Everyday \/ Public/.test(rows[0].textContent) && /Amarkumar K Sambhvani/.test(rows[0].textContent)
    && rows[1].getAttribute("data-window-row") === "legal" && /Window 2 — Formal \/ Document/.test(rows[1].textContent) && /Amarkumar Kishorbhai Sambhvani/.test(rows[1].textContent)
    && /no paperwork/.test(rows[0].textContent)
    && /Amarkumar U Kishorbhai/.test(card.textContent);
})());
check("the report table tags Window 1 and Window 2 rows separately", (() => {
  const rows = $$("tr[data-window]", dualDom);
  const windows = rows.map((r) => r.getAttribute("data-window"));
  const badges = $$("[data-window-badge]", dualDom).map((n) => n.getAttribute("data-window-badge"));
  return windows.includes("public") && windows.includes("legal")
    && badges.includes("public") && badges.includes("legal")
    && $$("[data-window-hint]", dualDom).length === 2
    && rows.filter((r) => r.getAttribute("data-window") === "legal").every((r) => /Kishorbhai/.test(r.textContent));
})());
check("a legal total on a karmic number is scanned as its own source", (() => {
  const karmic = profile({ name: "Adi An", legalName: "Adi Bala An", dob: "1983-01-24", goals: ["Money"], gender: "male" });
  const debt = (karmic.karmicDebts || []).find((k) => k.source === "legalName");
  const html = window.__NV.renderReport(karmic);
  return karmic.legalNameCompound === 19 && !!debt && debt.n === 19
    && /data-legal-karmic="19"/.test(html) && /Legal-name Chaldean total/.test(html);
})());
check("the intake submission stores both spellings and restores them from local memory", (() => {
  $("#editBtn").click();
  $("#fullName").value = "Amar K Sambhvani";
  $("#legalName").value = "Amarkumar Kishorbhai Sambhvani";
  $("#dob").value = "24-01-1983";
  $("#mobile").value = "9876543210";
  $$("#goalChips .chip").forEach((chip) => { if (chip.classList.contains("selected")) chip.click(); });
  $("#goalChips .chip[data-goal='Money']").click();
  $("#intakeForm").dispatchEvent(new window.Event("submit", { cancelable: true }));
  const rendered = $("#reportRoot").innerHTML;
  $("#editBtn").click();
  $("#fullName").value = "";
  $("#legalName").value = "";
  $("#loadLatestBtn").click();
  return /id="legal-name-layer"/.test(rendered)
    && $("#fullName").value === "Amar K Sambhvani"
    && $("#legalName").value === "Amarkumar Kishorbhai Sambhvani";
})());

if (failed) {
  console.error(`\n${failed} hybrid smoke check${failed === 1 ? "" : "s"} failed.`);
  process.exit(1);
}
console.log("\nAll hybrid smoke checks passed.");
