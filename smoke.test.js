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
check("advanced Vedic comparison is collapsed by default", !!$("details.advanced-vedic-comparison", vedicMarkup) && !$("details.advanced-vedic-comparison", vedicMarkup).open);
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
check("Lo Shu alone chooses 40-day practice, lifestyle and remedial crystals", basePractice.targetN !== alteredPractice.targetN && !same(basePractice.daily, alteredPractice.daily) && same(basePractice.powerDays, alteredPractice.powerDays) && baseCrystals.remedyNumbers.join(",") === authorityProfile.loShuMissing.join(",") && alteredCrystals.remedyNumbers.length === 0 && alteredCrystals.picks.length === 0);
check("Dasha timing and event windows ignore both grid data sets", same(baseDasha.current, alteredDasha.current) && same(baseDasha.events.map((event) => event.future), alteredDasha.events.map((event) => event.future)));
check("active Vastu Zone follows the active Dasha lord", authorityReport.includes('data-dasha-vastu-zone="active"') && authorityReport.includes(`its sector is the <strong>${expectedZone}</strong>`) && authorityReport.includes("Active Vastu Zone: Prioritise this sector now"));
check("Vastu context visibly belongs to Timeline and does not set active zone", !!$("#timeline-panel #vastu-section", authorityReportDom) && !$("#foundation-panel #vastu-section", authorityReportDom) && $("#vastu-section", authorityReportDom).getAttribute("data-authority") === "home-vastu-context" && $("#vastu-section", authorityReportDom).textContent.includes("selected only from the current Dasha lords"));
check("rendered authority walls are explicit", authorityReport.includes('data-remedy-authority="lo-shu"') && authorityReport.includes('data-authority="driver-conductor"') && authorityReport.includes('id="dasha-section" data-authority="dasha"') && authorityReport.includes("Kua number is a Feng Shui (Chinese) system") && authorityReport.includes("They do not choose or change Lo Shu remedy targets"));
check("compatibility reflection cannot create partner remedy kits or a second 40-day plan", !!compatibilityAuthoritySection && !!$("#compatibility-reflection", compatibilityAuthoritySection) && $$(".kit-card", compatibilityAuthoritySection).length === 0 && !compatibilityAuthoritySection.textContent.includes("Couple remedy") && !compatibilityAuthoritySection.textContent.includes("run both partners' kits") && compatibilityAuthoritySection.textContent.includes("does not add crystals, Rudraksha, affirmations, lifestyle obligations or a second 40-day plan"));
check("Vedic comparison never produces a competing remedy checklist", (authorityReport.match(/Missing Numbers — Lo Shu Remedies/g) || []).length === 1 && !authorityReport.includes("Vedic Name Grid") && !authorityReport.includes("Combined Vedic Grid") && !authorityReport.includes("Vedic remedy"));
check("40-day practice excludes static Vastu, dosha and deity prescriptions", !$("#plan-section", authorityReportDom).textContent.includes("Vastu correction") && !$("#plan-section", authorityReportDom).textContent.includes("Dosha-aware rhythm") && !$("#plan-section", authorityReportDom).textContent.includes("Ishta Devta chant"));

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
check("module tabs expose accessible semantics", $(".module-tabs").getAttribute("role") === "tablist" && $$("[role=tab]").length === 2 && $("#foundation-panel").getAttribute("role") === "tabpanel" && $("#timeline-panel").getAttribute("aria-labelledby") === "timeline-tab");
$("#timeline-tab").click();
check("Timeline tab updates selection, panels and URL hash", window.location.hash === "#timeline" && $("#timeline-tab").getAttribute("aria-selected") === "true" && !$("#timeline-panel").hidden && $("#foundation-panel").hidden);
$("#timeline-tab").dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
check("tab keyboard navigation returns to Foundation", window.location.hash === "#foundation" && $("#foundation-tab").getAttribute("aria-selected") === "true" && !$("#foundation-panel").hidden);
window.location.hash = "#dasha-section";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
check("deep Dasha hash activates Timeline before navigating", !$("#timeline-panel").hidden && $("#timeline-tab").getAttribute("aria-selected") === "true" && window.__NV.reportModuleFromHash("#vastu-section") === "timeline");
const liveReport = $("#reportRoot").innerHTML;
check("full hybrid report has no undefined or NaN leakage", !liveReport.includes("undefined") && !liveReport.includes("NaN") && liveReport.includes("Lo Shu Blueprint") && liveReport.includes("Dasha Timeline"));

/* ---- Localisation plus static responsive/print safeguards ---- */
for (const language of ["hi", "gu"]) {
  window.__NV.setLanguage(language);
  const report = $("#reportRoot").innerHTML;
  check(`${language} labels localise both modules and advanced comparison`, $("#foundation-tab").textContent.trim().length > 0 && $("#timeline-tab").textContent.trim().length > 0 && report.includes(language === "hi" ? "उन्नत वैदिक तुलना" : "ઉન્નત વૈદિક તુલના") && report.includes(language === "hi" ? "लो शू ब्लूप्रिंट" : "લો શુ બ્લૂપ્રિન્ટ") && !report.includes("undefined") && !report.includes("NaN"));
}
check("mobile timeline navigation remains horizontally reachable", /@media \(max-width: 640px\)/.test(styles) && /\.report-nav \{ flex-wrap: nowrap; overflow-x: auto;/.test(styles) && /\.timeline-anchor-nav \{ flex-wrap: nowrap; overflow-x: auto;/.test(styles));
check("print/PDF expands both panels and the collapsed Vedic comparison", /@media print/.test(styles) && /\.report-module-panel\[hidden\] \{ display: flex !important; \}/.test(styles) && /\.advanced-vedic-comparison:not\(\[open\]\) > \.details-body \{ display: flex !important; \}/.test(styles));

if (failed) {
  console.error(`\n${failed} hybrid smoke check${failed === 1 ? "" : "s"} failed.`);
  process.exit(1);
}
console.log("\nAll hybrid smoke checks passed.");
