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
  ["driver = 2", report.includes('num-value">2<')],
  ["conductor = 8", report.includes('num-value">8<')],
  ["loshu grid rendered", (report.match(/loshu-cell/g) || []).length === 9],
  ["missing numbers section", report.includes("Missing Numbers")],
  ["name section", report.includes("Name Analysis")],
  ["mobile section", report.includes("Mobile Number Vibration")],
  ["vehicle section", report.includes("Vehicle Number Vibration")],
  ["vehicle number analysed", report.includes("HR51AB1234")],
  ["colors section", report.includes("Lucky Colours") && report.includes("Day-wise Dressing")],
  ["career section", report.includes("Best Fields")],
  ["timing section", report.includes("Favourable Years") && report.includes("Personal Year")],
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

console.log(fail === 0 ? "\nALL CHECKS PASSED" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
