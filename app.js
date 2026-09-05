/* ============================================================
   NumeroVastu 360 — calculation engine + report renderer
   All computation is local. Multi-language support: English, Hindi, Gujarati.
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- helpers ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function reduce(n) {
    n = Math.abs(n);
    while (n > 9) n = String(n).split("").reduce((a, d) => a + Number(d), 0);
    return n || 9; // guard: 0 shouldn't occur
  }
  const digitSum = (str) => str.replace(/\D/g, "").split("").reduce((a, d) => a + Number(d), 0);
  const digitsOf = (str) => str.replace(/\D/g, "").split("").map(Number).filter((d) => d > 0);
  // The Foundation uses the classical Lo Shu magic-square coordinates. The
  // advanced Vedic Ank Kundali remains a separate birth-only comparison.
  const LO_SHU_GRID_LAYOUT = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const LO_SHU_PLANE_CELLS = [
    [4, 9, 2], [3, 5, 7], [8, 1, 6], [4, 3, 8],
    [9, 5, 1], [2, 7, 6], [4, 5, 6], [8, 5, 2]
  ];
  const LO_SHU_ARROW_LINES = LO_SHU_PLANE_CELLS.map((cells) => cells.slice());
  const VEDIC_GRID_LAYOUT = [[3, 1, 9], [6, 7, 5], [2, 8, 4]];
  const DEFAULT_VEDIC_PLANES = [
    { key: "practical", cells: [3, 1, 9], element: "Fire", governs: "Vision, executive drive, leadership and proactive execution." },
    { key: "materialistic", cells: [6, 7, 5], element: "Air", governs: "Wealth accumulation, luxury, analytical thinking, business acumen and networking." },
    { key: "emotional", cells: [2, 8, 4], element: "Water", governs: "Intuition, emotional balance, perseverance, discipline and systematic planning." }
  ];
  // The Vastu compass is a separate Vedic planetary mapping — grid positions
  // must never be mistaken for Lo Shu / Bagua directional positions.
  const VEDIC_VASTU_COMPASS_PLANETS = Object.freeze({ N: 5, NE: 3, E: 1, SE: 6, S: 9, SW: 4, W: 8, NW: 2 });
  const VEDIC_DASHA_ZONES = Object.freeze({
    1: "East", 2: "North-West", 3: "North-East", 4: "South-West", 5: "Center (Brahmasthan)",
    6: "South-East", 7: "North-East / Center Axis", 8: "West", 9: "South"
  });
  const KARMIC_DEBT_POOL = [13, 14, 16, 19];

  /* Vedic Ank Kundali input is deliberately filtered differently from a
     Lo Shu chart. Keep this as a small, pure function so every part of the
     report (remedies, name support and dasha weighting) reads the same birth
     grid and the calculation can be independently audited. */
  function calendarInteger(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.abs(Math.trunc(n)) : 0;
  }

  function calendarText(value, width) {
    const raw = String(value === undefined || value === null ? "" : value).replace(/\D/g, "");
    const fallback = String(calendarInteger(value));
    return (raw || fallback).padStart(width, "0");
  }

  function nonZeroCalendarDigits(text) {
    return String(text).split("").filter((d) => d !== "0").map(Number);
  }

  function generateVedicGrid(day, month, year) {
    const dayNumber = calendarInteger(day);
    const monthNumber = calendarInteger(month);
    const yearNumber = calendarInteger(year);
    const dayText = calendarText(day, 2);
    const monthText = calendarText(month, 2);
    const yearText = calendarText(year, 4);
    const yearTailText = yearText.slice(-2);
    const centuryText = yearText.slice(0, -2);

    // Moolank is the reduced birth day. Bhagyank intentionally uses the full
    // DOB calculation (including the century) even though century digits are
    // not placed into the 9-cell natal matrix.
    const rulingNo = reduce(dayNumber);
    const destinyNo = reduce(dayNumber + monthNumber + yearNumber);
    const destinyDigitSum = digitSum(`${dayText}${monthText}${yearText}`);

    const dayDigits = nonZeroCalendarDigits(dayText);
    const monthDigits = nonZeroCalendarDigits(monthText);
    const yearDigits = nonZeroCalendarDigits(yearTailText);
    const nonZeroDayValue = dayDigits.length ? Number(dayDigits.join("")) : null;
    const dayDeduplicated = nonZeroDayValue === rulingNo;

    const entries = [];
    const add = (source, values) => values.forEach((number) => entries.push({ source, number }));
    // A one-digit day (including 10/20/30 after zero removal) is represented
    // by the ruling number once, never as a duplicated raw-day digit.
    if (!dayDeduplicated) add("day", dayDigits);
    add("month", monthDigits);
    add("year", yearDigits);
    add("ruling", [rulingNo]);
    add("destiny", [destinyNo]);

    const counts = {};
    for (let i = 1; i <= 9; i++) counts[i] = 0;
    entries.forEach(({ number }) => { if (number >= 1 && number <= 9) counts[number]++; });

    const zeroCount = (text) => (String(text).match(/0/g) || []).length;
    return {
      layout: VEDIC_GRID_LAYOUT.map((row) => row.slice()),
      entries,
      digits: entries.map(({ number }) => number),
      counts,
      rulingNo,
      destinyNo,
      driver: rulingNo,
      conductor: destinyNo,
      sourceDigits: { day: dayDigits, month: monthDigits, year: yearDigits },
      raw: { day: dayText, month: monthText, year: yearText, yearTail: yearTailText, century: centuryText },
      excluded: {
        zeros: { day: zeroCount(dayText), month: zeroCount(monthText), year: zeroCount(yearText) },
        century: centuryText,
        dayDeduplicated,
        nonZeroDayValue
      },
      calculations: {
        rulingDigitSum: digitSum(dayText),
        destinyDigitSum,
        destinyCalendarSum: dayNumber + monthNumber + yearNumber
      }
    };
  }

  /* Classic Lo Shu plotting deliberately differs from the advanced Vedic
     comparison. It keeps every non-zero digit of the complete DD-MM-YYYY
     date (including 19/20 century digits), then adds Moolank and Bhagyank.
     This pure engine is the sole source for Foundation remedy obligations. */
  function generateLoShuGrid(day, month, year) {
    const dayNumber = calendarInteger(day);
    const monthNumber = calendarInteger(month);
    const yearNumber = calendarInteger(year);
    const dayText = calendarText(day, 2);
    const monthText = calendarText(month, 2);
    const yearText = calendarText(year, 4);
    const rulingNo = reduce(dayNumber);
    const destinyNo = reduce(dayNumber + monthNumber + yearNumber);
    const dayDigits = nonZeroCalendarDigits(dayText);
    const monthDigits = nonZeroCalendarDigits(monthText);
    const yearDigits = nonZeroCalendarDigits(yearText);
    const entries = [];
    const add = (source, values) => values.forEach((number) => entries.push({ source, number }));
    add("day", dayDigits);
    add("month", monthDigits);
    add("year", yearDigits);
    add("ruling", [rulingNo]);
    add("destiny", [destinyNo]);
    const counts = {};
    for (let i = 1; i <= 9; i++) counts[i] = 0;
    entries.forEach(({ number }) => { if (number >= 1 && number <= 9) counts[number]++; });
    const zeroCount = (text) => (String(text).match(/0/g) || []).length;
    return {
      layout: LO_SHU_GRID_LAYOUT.map((row) => row.slice()),
      entries,
      digits: entries.map(({ number }) => number),
      counts,
      rulingNo,
      destinyNo,
      driver: rulingNo,
      conductor: destinyNo,
      sourceDigits: { day: dayDigits, month: monthDigits, year: yearDigits },
      raw: { day: dayText, month: monthText, year: yearText },
      excluded: { zeros: { day: zeroCount(dayText), month: zeroCount(monthText), year: zeroCount(yearText) } },
      calculations: {
        rulingDigitSum: digitSum(dayText),
        destinyDigitSum: digitSum(`${dayText}${monthText}${yearText}`),
        destinyCalendarSum: dayNumber + monthNumber + yearNumber
      }
    };
  }

  function relation(a, b) {
    if (a === b) return "friendly"; // a planet is never its own enemy
    const f = (window.DB && window.DB.friendship) ? window.DB.friendship[a] : null;
    if (!f) return "neutral";
    if (f.friends.includes(b)) return "friendly";
    if (f.neutral.includes(b)) return "neutral";
    return "enemy";
  }

  /* Ayurvedic dosha profile — determined only by the Driver + Conductor.
     Foundation/Lo Shu count signals never alter this baseline. It enriches
     the Health interpretation without adding PII or asking any medical
     measurement. Read as traditional wellness guidance only. */
  function buildDoshaProfile(src) {
    const db = getActiveDB();
    const map = db.dosha || (window.DB && window.DB.dosha) || {};
    const ddriver = map[src.driver] || {};
    const dconductor = map[src.conductor] || {};
    const counts = { pitta: 0, vata: 0, kapha: 0 };
    const addType = (label) => {
      String(label || "").toLowerCase().split(/[\s\u2013\-/,]+/).forEach((tok) => {
        const k = tok.replace(/[^a-z]/g, "");
        if (counts[k] !== undefined) counts[k]++;
      });
    };
    addType(ddriver.dominant);
    addType(dconductor.dominant);
    const driverT = String(ddriver.dominant || "").toLowerCase();
    const conductorT = String(dconductor.dominant || "").toLowerCase();
    if (driverT.includes("tridoshic") || conductorT.includes("tridoshic")) {
      counts.pitta++; counts.vata++; counts.kapha++;
    }
    const max = Math.max(counts.pitta, counts.vata, counts.kapha);
    const cap = (x) => x === "pitta" ? "Pitta" : x === "vata" ? "Vata" : "Kapha";
    const top = ["pitta", "vata", "kapha"].filter((k) => counts[k] === max && max > 0);
    const primary = top.map(cap).join(top.length > 1 ? "–" : "");
    return {
      driverNumber: src.driver,
      conductorNumber: src.conductor,
      driverType: ddriver.dominant || "",
      conductorType: dconductor.dominant || "",
      driverDosha: ddriver,
      conductorDosha: dconductor,
      counts,
      primary,
      primaryTags: top.map(cap)
    };
  }

  /* Ishta Devta (deity protection) profile — pure function over the Driver +
     Conductor numbers using the classical number → deity correspondence.
     It names the personal guardian deity (ishta devta) behind each key
     number and turns the deity's chant, 108× round and offerings into a
     small, concrete protection practice. Read as traditional spiritual
     guidance — the reader's own family tradition and guru's instruction
     always take priority. */
  function buildDeityProfile(src) {
    const db = getActiveDB();
    const map = db.deity || (window.DB && window.DB.deity) || {};
    const driverDeity = map[src.driver] || null;
    const conductorDeity = map[src.conductor] || null;
    const sameDeity = !!(driverDeity && conductorDeity && driverDeity.god && conductorDeity.god &&
      driverDeity.god.en === conductorDeity.god.en && driverDeity.mantra === conductorDeity.mantra);
    return {
      driverNumber: src.driver,
      conductorNumber: src.conductor,
      driverDeity,
      conductorDeity,
      sameDeity
    };
  }

  const APP_VERSION = ($('meta[name="nv-version"]') && $('meta[name="nv-version"]').content) || "2.8.0";
  const BUILD_LABEL = ($('meta[name="nv-build-label"]') && $('meta[name="nv-build-label"]').content) || "Build 2026-09-05";
  const DEFAULT_MANIFEST_PATH = "knowledge-pack/latest.json";
  const STORAGE_KEYS = {
    lang: "nv_lang",
    packCache: "nv360.packCache.v1",
    history: "nv360.history.v1",
    practice: "nv360.practice.v1",
    journal: "nv360.journal.v1",
    plan: "nv360.plan.v1",
    contributionEnabled: "nv360.contributionEnabled.v1",
    contributionOutbox: "nv360.contributionOutbox.v1"
  };
  const SECTION = { core: 1, traits: 2, grid: 3, weak: 4, zodiac: 5, name: 6, mobile: 7, vehicle: 8, watch: 9, crystal: 10, colours: 11, career: 12, timing: 13, dasha: 14, memory: 15, vastu: 16, kua: 17, compatibility: 18, goalsStart: 19 };

  const state = {
    lang: "en",
    pack: null,
    history: [],
    contributionEnabled: false,
    lastInput: null,
    activeProfileKey: "",
    reportModule: "foundation",
    toastTimer: null,
    updatePromise: null
  };

  try {
    const savedLang = localStorage.getItem(STORAGE_KEYS.lang);
    if (savedLang && ["en", "hi", "gu"].includes(savedLang)) {
      state.lang = savedLang;
    }
  } catch (e) {}

  function getLang() {
    return state.lang || "en";
  }

  function getI18nPack(lang) {
    const l = lang || getLang();
    return (window.I18N && window.I18N[l]) || (window.I18N && window.I18N.en) || null;
  }

  function t(key, fallback) {
    const p = getI18nPack();
    if (p && p.ui && p.ui[key] !== undefined) return p.ui[key];
    const en = window.I18N && window.I18N.en && window.I18N.en.ui;
    if (en && en[key] !== undefined) return en[key];
    return fallback || "";
  }

  /* Localised knowledge-pack text — entries shaped { en, hi, gu } with
     English as the guaranteed fallback (same pattern as excessEnergy). */
  const loc = (field, lang) => {
    const l = lang || getLang();
    return (field && (field[l] || field.en)) || "";
  };

  function getActiveDB() {
    const base = window.DB || {};
    const pack = getI18nPack() || {};
    const merged = Object.assign({}, base, pack);

    // Keep the two grids explicit and independent. Localised legacy Lo Shu
    // plane/arrow prose may live at the top level of a language pack, but it
    // only decorates the Foundation's canonical Lo Shu data; it can never
    // replace either coordinate system.
    if (base.loShuGrid) {
      merged.loShuGrid = Object.assign({}, base.loShuGrid, {
        layout: base.loShuGrid.layout,
        planes: Array.isArray(pack.planes) ? pack.planes : base.loShuGrid.planes,
        arrows: Array.isArray(pack.arrows) ? pack.arrows : base.loShuGrid.arrows
      });
    }
    if (base.vedicGrid) merged.vedicGrid = base.vedicGrid;
    delete merged.planes;
    delete merged.arrows;
    delete merged.loshuLayout;
    return merged;
  }

  const DAY_NAMES = {
    en: { 1: "Sunday", 2: "Monday", 9: "Tuesday", 5: "Wednesday", 3: "Thursday", 6: "Friday", 8: "Saturday", 4: "Saturday", 7: "Tuesday" },
    hi: { 1: "रविवार", 2: "सोमवार", 9: "मंगलवार", 5: "बुधवार", 3: "गुरुवार", 6: "शुक्रवार", 8: "शनिवार", 4: "शनिवार", 7: "मंगलवार" },
    gu: { 1: "રવિવાર", 2: "સોમવાર", 9: "મંગળવાર", 5: "બુધવાર", 3: "ગુરુવાર", 6: "શુક્રવાર", 8: "શનિવાર", 4: "શનિવાર", 7: "મંગળવાર" }
  };
  const DAY_OF = DAY_NAMES.en;

  function dayOf(n) {
    const lang = getLang();
    return (DAY_NAMES[lang] && DAY_NAMES[lang][n]) || DAY_NAMES.en[n] || "Sunday";
  }

  function relBadge(r) {
    const lang = getLang();
    const labels = {
      en: { friendly: "Harmonious", neutral: "Neutral", enemy: "Conflicting" },
      hi: { friendly: "अनुकूल (मित्र)", neutral: "सामान्य (सम)", enemy: "प्रतिकूल (शत्रु)" },
      gu: { friendly: "અનુકૂળ (મિત્ર)", neutral: "સામાન્ય (સમ)", enemy: "પ્રતિકૂળ (શત્રુ)" }
    }[lang] || { friendly: "Harmonious", neutral: "Neutral", enemy: "Conflicting" };

    return r === "friendly" ? `<span class="badge good">${labels.friendly}</span>`
      : r === "neutral" ? `<span class="badge warn">${labels.neutral}</span>`
      : `<span class="badge bad">${labels.enemy}</span>`;
  }

  function safeJSONParse(value, fallback) {
    if (!value) return fallback;
    try { return JSON.parse(value); } catch { return fallback; }
  }
  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return safeJSONParse(raw, fallback);
    } catch {
      return fallback;
    }
  }
  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function compareVersions(a, b) {
    const pa = String(a || "0").split(".").map(Number);
    const pb = String(b || "0").split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const va = pa[i] || 0, vb = pb[i] || 0;
      if (va > vb) return 1;
      if (va < vb) return -1;
    }
    return 0;
  }
  function isoDate(d) {
    return (d instanceof Date ? d : d ? new Date(d) : new Date()).toISOString();
  }
  function prettyDate(input) {
    if (!input) return "";
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    const lang = getLang();
    const loc = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
    try {
      return d.toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }
  }
  function formatBirthTime(t) {
    if (!t) return "";
    const [hh, mm] = t.split(":").map(Number);
    if (isNaN(hh) || isNaN(mm)) return t;
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 || 12;
    return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
  }
  function profileKeyOf(input) {
    return `${input.name || "anonymous"}|${input.dob || ""}`;
  }

  function normalizePack(raw, source) {
    if (!raw || typeof raw !== "object") return null;
    const db = raw.db || window.DB || {};
    return {
      app: raw.app || "NumeroVastu 360",
      schemaVersion: raw.schemaVersion || 2,
      packVersion: raw.packVersion || "2.8.0",
      generatedAt: raw.generatedAt || isoDate(),
      manifestPath: raw.manifestPath || DEFAULT_MANIFEST_PATH,
      source: source || "bundled",
      contribution: Object.assign({
        mode: "scaffold",
        endpoint: null,
        description: "Anonymous aggregate counts only. Off by default; no names, DOBs, phones or raw free-text are sent."
      }, raw.contribution || {}),
      db
    };
  }

  function validatePack(pack) {
    if (!pack || typeof pack !== "object") return { ok: false, errors: ["pack must be an object"] };
    const errs = [];
    if (!Number.isInteger(pack.schemaVersion) || pack.schemaVersion < 2) errs.push("schemaVersion must be 2 or newer for the hybrid pack");
    if (!pack.packVersion || typeof pack.packVersion !== "string") errs.push("missing packVersion");
    if (!pack.db || typeof pack.db !== "object") errs.push("missing db object");
    else {
      const db = pack.db;
      ["numbers", "traits", "loShuGrid", "vedicGrid", "dasha", "vastu", "crystals", "careers", "personalYear"].forEach((k) => {
        if (!db[k] || typeof db[k] !== "object") errs.push(`db.${k} missing or invalid`);
      });
      if (db.loShuGrid) {
        const layout = db.loShuGrid.layout;
        const cells = Array.isArray(layout) ? layout.flat() : [];
        const canonicalCells = LO_SHU_GRID_LAYOUT.flat();
        if (!Array.isArray(layout) || layout.length !== 3 || layout.some((row) => !Array.isArray(row) || row.length !== 3) || cells.join(",") !== canonicalCells.join(",")) {
          errs.push("db.loShuGrid.layout must be the canonical 4–9–2 / 3–5–7 / 8–1–6 template");
        }
        const planes = db.loShuGrid.planes;
        const validPlanes = Array.isArray(planes) && planes.length === LO_SHU_PLANE_CELLS.length &&
          planes.every((plane, index) => plane && Array.isArray(plane.cells) && plane.cells.join(",") === LO_SHU_PLANE_CELLS[index].join(","));
        if (!validPlanes) errs.push("db.loShuGrid.planes must define the canonical eight Lo Shu planes");
        const arrows = db.loShuGrid.arrows;
        const validArrows = Array.isArray(arrows) && arrows.length === LO_SHU_ARROW_LINES.length &&
          arrows.every((arrow, index) => arrow && Array.isArray(arrow.line) && arrow.line.join(",") === LO_SHU_ARROW_LINES[index].join(","));
        if (!validArrows) errs.push("db.loShuGrid.arrows must define the canonical eight Lo Shu arrows");
        const plotting = db.loShuGrid.plotting;
        if (!plotting || ["zeros", "year", "calculations"].some((key) => typeof plotting[key] !== "string")) {
          errs.push("db.loShuGrid.plotting must document zero, full-year and calculation rules");
        }
      }
      if (db.vedicGrid) {
        const layout = db.vedicGrid.layout;
        const cells = Array.isArray(layout) ? layout.flat() : [];
        const canonicalCells = VEDIC_GRID_LAYOUT.flat();
        if (!Array.isArray(layout) || layout.length !== 3 || layout.some((row) => !Array.isArray(row) || row.length !== 3) || cells.join(",") !== canonicalCells.join(",")) {
          errs.push("db.vedicGrid.layout must be the canonical 3–1–9 / 6–7–5 / 2–8–4 template");
        }
        const validPlanes = Array.isArray(db.vedicGrid.planes) && db.vedicGrid.planes.length === DEFAULT_VEDIC_PLANES.length &&
          db.vedicGrid.planes.every((plane, index) => plane && plane.key === DEFAULT_VEDIC_PLANES[index].key &&
            Array.isArray(plane.cells) && plane.cells.join(",") === DEFAULT_VEDIC_PLANES[index].cells.join(","));
        if (!validPlanes) errs.push("db.vedicGrid.planes must define the canonical Practical, Materialistic and Emotional horizontal planes");
        const filtering = db.vedicGrid.filtering;
        if (!filtering || ["zeros", "century", "dateDeduplication", "calculations"].some((key) => typeof filtering[key] !== "string")) {
          errs.push("db.vedicGrid.filtering must document zero, century, date de-duplication and calculation rules");
        }
      }
      const compass = db.vastu && db.vastu.directions;
      if (!compass || Object.entries(VEDIC_VASTU_COMPASS_PLANETS).some(([direction, planet]) => !compass[direction] || Number(compass[direction].planet) !== planet)) {
        errs.push("db.vastu.directions must retain the canonical Vedic planetary compass mapping");
      }
      // The Timeline is part of the hybrid contract, so every release pack
      // must carry Dasha zones matching the Vedic compass (including Ketu's
      // North-East / Center axis), never a legacy grid axis.
      if (db.dasha && Object.entries(VEDIC_DASHA_ZONES).some(([number, zone]) => !db.dasha[number] || !db.dasha[number].zone || db.dasha[number].zone.en !== zone)) {
        errs.push("db.dasha zones must retain the canonical Vedic planetary direction mapping");
      }
      if (db.numbers) {
        for (let i = 1; i <= 9; i++) {
          if (!db.numbers[i]) errs.push(`db.numbers[${i}] missing`);
        }
      }
    }
    return { ok: errs.length === 0, errors: errs };
  }

  function showToast(message, tone) {
    const vp = $("#toastViewport");
    if (!vp) return;
    vp.innerHTML = `<div class="toast toast-${tone || "info"}" role="status">${esc(message)}</div>`;
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      vp.innerHTML = "";
      state.toastTimer = null;
    }, 2800);
  }

  function bundledPack() {
    return normalizePack(window.__NV_BUNDLED_PACK || { db: window.DB }, "bundled");
  }
  function activePack() {
    return state.pack || bundledPack();
  }
  function setActivePack(pack, source, persist) {
    const norm = normalizePack(pack, source);
    const valid = validatePack(norm);
    if (!valid.ok) return false;
    state.pack = norm;
    if (norm.db) window.DB = norm.db;
    if (persist) writeStore(STORAGE_KEYS.packCache, norm);
    updateKnowledgeUI();
    return true;
  }
  function latestSnapshot() {
    return state.history[0] || null;
  }

  function hydrateState() {
    state.history = readStore(STORAGE_KEYS.history, []);
    state.contributionEnabled = !!readStore(STORAGE_KEYS.contributionEnabled, false);
    const cached = readStore(STORAGE_KEYS.packCache, null);
    const bundled = bundledPack();
    /* A stale cached pack could silently shadow newer bundled content after an
       upgrade — only restore the cache when it is at least as new as the bundle,
       and overwrite a stale cache with the fresh bundled pack. */
    if (cached && cached.packVersion && compareVersions(cached.packVersion, bundled.packVersion) >= 0) {
      setActivePack(cached, "cached", false);
    } else {
      setActivePack(bundled, "bundled", !!cached);
    }
  }

  function updateContributionUI() {
    const cb = $("#contributeAnonymous");
    if (cb) cb.checked = state.contributionEnabled;
    const hint = $("#contributionHint");
    if (hint) {
      hint.textContent = state.contributionEnabled
        ? "Enabled. Only anonymous aggregate counts will be staged for contribution."
        : "Off by default. No names, dates of birth, phone numbers, vehicle numbers or free-text journal notes are shared.";
    }
  }

  function updateKnowledgeUI() {
    const pack = activePack();
    const label = `Knowledge pack v${pack ? pack.packVersion : APP_VERSION}`;
    const sourceText = pack ? (pack.source === "remote" ? "Live update active" : pack.source === "cached" ? "Cached update active" : "Bundled pack active") : "Bundled pack active";
    if ($("#knowledgeBadge")) $("#knowledgeBadge").textContent = label;
    if ($("#appBadge")) $("#appBadge").textContent = `App v${APP_VERSION} · Meeus engine`;
    if ($("#buildBadge")) $("#buildBadge").textContent = BUILD_LABEL;
    if ($("#knowledgeVersionText")) $("#knowledgeVersionText").textContent = `v${pack ? pack.packVersion : APP_VERSION}`;
    if ($("#knowledgeStatusText")) $("#knowledgeStatusText").textContent = `${sourceText}. The app works instantly offline, then can optionally fetch a newer public knowledge pack.`;
    if ($("#knowledgeSubtext")) $("#knowledgeSubtext").textContent = pack && pack.generatedAt
      ? `Published ${prettyDate(pack.generatedAt)} · schema v${pack.schemaVersion}`
      : "Uses bundled content instantly, then quietly checks for a newer pack.";
  }

  function updateMemoryUI() {
    const snap = latestSnapshot();
    if ($("#memoryBadge")) $("#memoryBadge").textContent = state.history.length ? `${state.history.length} local snapshot${state.history.length > 1 ? "s" : ""}` : "Local memory ready";
    if ($("#memorySummaryText")) $("#memorySummaryText").textContent = state.history.length ? `${state.history.length} saved chart${state.history.length > 1 ? "s" : ""}` : "No saved charts yet";
    if ($("#memoryStatusText")) $("#memoryStatusText").textContent = snap
      ? `Latest: ${snap.name} · ${prettyDate(snap.savedAt)} · Driver ${snap.driver}, Conductor ${snap.conductor}`
      : "Saved reports stay on this device only.";
    if ($("#loadLatestBtn")) $("#loadLatestBtn").classList.toggle("hidden", !snap);
  }

  async function refreshKnowledgePack(opts) {
    const options = Object.assign({ silent: true }, opts || {});
    if (state.updatePromise) return state.updatePromise;
    const pack = activePack();
    if (!window.fetch || !pack || !pack.manifestPath) return null;
    state.updatePromise = (async () => {
      try {
        if ($("#knowledgeStatusText")) $("#knowledgeStatusText").textContent = "Checking for a newer knowledge pack…";
        const manifestRes = await window.fetch(`${pack.manifestPath}?t=${Date.now()}`, { cache: "no-store" });
        if (!manifestRes.ok) throw new Error(`manifest ${manifestRes.status}`);
        const manifest = await manifestRes.json();
        const latestVersion = String(manifest.latestVersion || manifest.packVersion || pack.packVersion);
        if (compareVersions(latestVersion, pack.packVersion) <= 0) {
          updateKnowledgeUI();
          if (!options.silent) showToast(`Already on knowledge pack v${pack.packVersion}`, "info");
          return null;
        }
        const nextUrl = manifest.packUrl || manifest.url;
        if (!nextUrl) throw new Error("manifest missing packUrl");
        const packRes = await window.fetch(`${nextUrl}?v=${encodeURIComponent(latestVersion)}`, { cache: "no-store" });
        if (!packRes.ok) throw new Error(`pack ${packRes.status}`);
        const incoming = normalizePack(await packRes.json(), "remote");
        const check = validatePack(incoming);
        if (!check.ok) throw new Error(check.errors.join(", "));
        setActivePack(incoming, "remote", true);
        if (state.lastInput) {
          lastProfile = computeProfile(state.lastInput);
          showReport(lastProfile, { preserveScroll: true });
        }
        showToast(`Knowledge updated to v${incoming.packVersion}`, "good");
        return incoming;
      } catch (err) {
        updateKnowledgeUI();
        if (!options.silent) showToast(`Knowledge update unavailable right now`, "warn");
        return null;
      } finally {
        state.updatePromise = null;
      }
    })();
    return state.updatePromise;
  }

  function chaldeanValue(name) {
    const chaldean = (window.DB && window.DB.chaldean) || {};
    return name.toUpperCase().split("").reduce((a, ch) => a + (chaldean[ch] || 0), 0);
  }

  const compoundMeaning = (n) => {
    const db = getActiveDB();
    return (n >= 1 && n <= 108 && db.compound) ? db.compound[n] : null;
  };
  const masterNumber = (n) => {
    const db = getActiveDB();
    return (db.masterNumbers && db.masterNumbers[n]) || null;
  };

  const ZRANGES = [
    ["Aries", [3, 21], [4, 19]], ["Taurus", [4, 20], [5, 20]], ["Gemini", [5, 21], [6, 20]],
    ["Cancer", [6, 21], [7, 22]], ["Leo", [7, 23], [8, 22]], ["Virgo", [8, 23], [9, 22]],
    ["Libra", [9, 23], [10, 22]], ["Scorpio", [10, 23], [11, 21]], ["Sagittarius", [11, 22], [12, 21]],
    ["Capricorn", [12, 22], [1, 19]], ["Aquarius", [1, 20], [2, 18]], ["Pisces", [2, 19], [3, 20]]
  ];
  const SRANGES = [
    ["Aries", [4, 14], [5, 14]], ["Taurus", [5, 15], [6, 14]], ["Gemini", [6, 15], [7, 15]],
    ["Cancer", [7, 16], [8, 16]], ["Leo", [8, 17], [9, 16]], ["Virgo", [9, 17], [10, 17]],
    ["Libra", [10, 18], [11, 16]], ["Scorpio", [11, 17], [12, 15]], ["Sagittarius", [12, 16], [1, 14]],
    ["Capricorn", [1, 15], [2, 12]], ["Aquarius", [2, 13], [3, 14]], ["Pisces", [3, 15], [4, 13]]
  ];
  function zodiacFromRanges(d, m, ranges) {
    const v = m * 100 + d;
    for (const [name, s, e] of ranges) {
      const sv = s[0] * 100 + s[1], ev = e[0] * 100 + e[1];
      if (sv <= ev ? (v >= sv && v <= ev) : (v >= sv || v <= ev)) return name;
    }
    return ranges[ranges.length - 1][0];
  }
  const zodiacSign = (d, m) => zodiacFromRanges(d, m, ZRANGES);           // Sayana (tropical)
  const zodiacSignSidereal = (d, m) => zodiacFromRanges(d, m, SRANGES);   // Nirayana (Vedic)

  function kuaNumber(gender, year) {
    if (!gender || !year) return null;
    const yy = year % 100;
    const n = yy === 0 ? 0 : reduce(yy);
    const post2000 = year >= 2000;
    let k = gender === "male" ? (post2000 ? 9 - n : 10 - n) : (post2000 ? n + 6 : n + 5);
    k = reduce(k);
    if (k === 5) k = gender === "male" ? 2 : 8;
    return k;
  }

  const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dirLabel = (d) => {
    const db = getActiveDB();
    return (db.vastu && db.vastu.directions && db.vastu.directions[d]) ? db.vastu.directions[d].label : d;
  };

  /* ---------------- intake setup ---------------- */
  function populateDirectionSelects() {
    const roomSelects = ["entrance", "kitchen", "bedroom", "toilet", "study", "staircase"];
    const unsureLabel = getLang() === "hi" ? "निश्चित नहीं" : getLang() === "gu" ? "નક્કી નથી" : "Not sure";
    roomSelects.forEach((id) => {
      const sel = $("#" + id);
      if (!sel) return;
      const curVal = sel.value || "unsure";
      const opts = [`<option value="unsure">${unsureLabel}</option>`]
        .concat(DIRS.map((d) => `<option value="${d}">${dirLabel(d)}</option>`));
      sel.innerHTML = opts.join("");
      sel.value = curVal;
    });
  }

  /* Birthplace suggestions from atlas */
  if (window.NVAstro && $("#birthPlaceList")) {
    const list = $("#birthPlaceList");
    window.NVAstro.cityNames().forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      list.appendChild(opt);
    });
  }

  const selectedGoals = new Set();
  function syncGoalChips(goals) {
    selectedGoals.clear();
    const incoming = new Set(goals || []);
    $$("#goalChips .chip").forEach((chip) => {
      const on = incoming.has(chip.dataset.goal);
      chip.classList.toggle("selected", on);
      if (on) selectedGoals.add(chip.dataset.goal);
    });
    if ($("#err-goals")) $("#err-goals").hidden = selectedGoals.size > 0;
  }
  $$("#goalChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const g = chip.dataset.goal;
      if (selectedGoals.has(g)) { selectedGoals.delete(g); chip.classList.remove("selected"); }
      else { selectedGoals.add(g); chip.classList.add("selected"); }
      if ($("#err-goals")) $("#err-goals").hidden = selectedGoals.size > 0;
    });
  });

  function fillFormFromSnapshot(snapshot) {
    if (!snapshot || !snapshot.input) return;
    if ($("#fullName")) $("#fullName").value = snapshot.input.name || "";
    if ($("#dob")) $("#dob").value = snapshot.input.dob || "";
    if ($("#mobile")) $("#mobile").value = snapshot.input.mobile || "";
    if ($("#vehicle")) $("#vehicle").value = snapshot.input.vehicle || "";
    if ($("#entrance")) $("#entrance").value = snapshot.input.entrance || "unsure";
    if ($("#kitchen")) $("#kitchen").value = snapshot.input.kitchen || "unsure";
    if ($("#bedroom")) $("#bedroom").value = snapshot.input.bedroom || "unsure";
    if ($("#toilet")) $("#toilet").value = snapshot.input.toilet || "unsure";
    if ($("#study")) $("#study").value = snapshot.input.study || "unsure";
    if ($("#staircase")) $("#staircase").value = snapshot.input.staircase || "unsure";
    if ($("#plotShape")) $("#plotShape").value = snapshot.input.plotShape || "unsure";
    if ($("#watchType")) $("#watchType").value = snapshot.input.watchType || "none";
    if ($("#gender")) $("#gender").value = snapshot.input.gender || "";
    if ($("#birthTime")) $("#birthTime").value = snapshot.input.birthTime || "";
    if ($("#birthPlace")) $("#birthPlace").value = snapshot.input.birthPlace || "";
    if ($("#brand")) $("#brand").value = snapshot.input.brand || "";
    if ($("#partnerName")) $("#partnerName").value = snapshot.input.partnerName || "";
    if ($("#partnerDob")) $("#partnerDob").value = snapshot.input.partnerDob || "";
    syncGoalChips(snapshot.input.goals || []);
  }

  /* ---------------- validation ---------------- */
  function setErr(id, on) {
    if ($("#err-" + id)) $("#err-" + id).hidden = !on;
    if ($("#" + id)) $("#" + id).classList.toggle("error", on);
  }
  function validate() {
    let ok = true, first = null;
    const name = ($("#fullName") && $("#fullName").value.trim()) || "";
    const badName = name.length < 2 || !/[a-zA-Z\u0900-\u097F\u0A80-\u0AFF]/.test(name);
    setErr("fullName", badName); if (badName) { ok = false; first = first || $("#fullName"); }

    const dob = ($("#dob") && $("#dob").value) || "";
    const badDob = !dob || isNaN(new Date(dob).getTime()) || new Date(dob) > new Date();
    setErr("dob", badDob); if (badDob) { ok = false; first = first || $("#dob"); }

    const mob = ($("#mobile") && $("#mobile").value.replace(/\D/g, "")) || "";
    // 8+ digits AND at least one non-zero digit — an all-zero number has no
    // planetary vibration and would otherwise surface as a phantom "9".
    const badMob = mob.length < 8 || !/[1-9]/.test(mob);
    setErr("mobile", badMob); if (badMob) { ok = false; first = first || $("#mobile"); }

    const badGoals = selectedGoals.size === 0;
    if ($("#err-goals")) $("#err-goals").hidden = !badGoals;
    if (badGoals) ok = false;

    if (first) first.focus();
    return ok;
  }

  /* ---------------- core engine ---------------- */
  function computeProfile(input) {
    const [y, m, d] = input.dob.split("-").map(Number);
    // Both engines read the same DOB but retain deliberately different
    // plotting rules. Driver/Conductor derive from the DOB itself, not from
    // a grid, so the Dasha engine has no grid dependency.
    const loShuGrid = generateLoShuGrid(d, m, y);
    const vedicGrid = generateVedicGrid(d, m, y);
    const driver = reduce(d);
    const dobCompound = digitSum(input.dob);
    const conductor = reduce(d + m + y);
    const signalSets = (counts) => ({
      missing: Object.keys(counts).filter((k) => counts[k] === 0).map(Number),
      repeated: Object.keys(counts).filter((k) => counts[k] >= 3).map(Number),
      weak: Object.keys(counts).filter((k) => counts[k] === 1).map(Number)
    });
    const loShuSignals = signalSets(loShuGrid.counts);
    const vedicSignals = signalSets(vedicGrid.counts);

    // Name (Chaldean): Name and Combined grids belong to the Lo Shu
    // Foundation only. The advanced Vedic view remains birth-grid-only.
    const nameCompound = chaldeanValue(input.name);
    const nameNum = reduce(nameCompound);
    const nameRelD = relation(driver, nameNum);
    const nameRelC = relation(conductor, nameNum);

    // Karmic Debt scan (13 / 14 / 16 / 19) — the classical rule checks the
    // UNREDUCED totals: the birth day itself, the full birth-date digit sum,
    // and the full Chaldean name total. When one of them lands on a karmic
    // number, the reduced Driver/Conductor/Name carries that lesson.
    const karmicDebts = [];
    if (KARMIC_DEBT_POOL.includes(d)) karmicDebts.push({ n: d, source: "driver" });
    if (KARMIC_DEBT_POOL.includes(dobCompound)) karmicDebts.push({ n: dobCompound, source: "conductor" });
    if (KARMIC_DEBT_POOL.includes(nameCompound)) karmicDebts.push({ n: nameCompound, source: "name" });

    const loShuNameCounts = {};
    for (let i = 1; i <= 9; i++) loShuNameCounts[i] = 0;
    const chaldeanMap = (window.DB && window.DB.chaldean) || {};
    input.name.toUpperCase().split("").forEach((ch) => { const v = chaldeanMap[ch]; if (v) loShuNameCounts[v]++; });
    const loShuCombinedCounts = {};
    for (let i = 1; i <= 9; i++) loShuCombinedCounts[i] = loShuGrid.counts[i] + loShuNameCounts[i];

    // Mobile
    const mobCompound = digitSum(input.mobile);
    const mobNum = reduce(mobCompound);
    const mobRelD = relation(driver, mobNum);
    const mobRelC = relation(conductor, mobNum);

    // Vedic Tier
    const birthTimeRaw = String(input.birthTime || "").trim();
    const birthPlaceRaw = String(input.birthPlace || "").trim();
    const hasTime = !!birthTimeRaw;
    const hasPlace = !!birthPlaceRaw;
    const vedicTier = (hasTime && hasPlace) ? 2 : (hasTime || hasPlace) ? "partial" : 1;

    const astro = (typeof window !== "undefined" && window.NVAstro)
      ? window.NVAstro.compute({ dob: input.dob, time: birthTimeRaw, place: birthPlaceRaw })
      : { ok: false, reason: "engine-missing" };

    const loShuMissingSeverity = loShuSignals.missing.map((n) => {
      const inBirth = loShuGrid.counts[n] > 0;
      const inName = loShuNameCounts[n] > 0;
      const isDriverOrConductor = n === driver || n === conductor;
      const critical = !inBirth && !inName && !isDriverOrConductor;
      const echoedBy = [];
      if (inName) echoedBy.push("Name");
      if (isDriverOrConductor) echoedBy.push(n === driver ? "Driver" : "Conductor");
      return { n, critical, echoedBy };
    });

    const kua = kuaNumber(input.gender, y);

    return {
      name: input.name,
      day: d, month: m, year: y,
      driver, conductor,
      loShuGrid,
      loShuCounts: loShuGrid.counts,
      loShuMissing: loShuSignals.missing,
      loShuRepeated: loShuSignals.repeated,
      loShuWeak: loShuSignals.weak,
      loShuMissingSeverity,
      loShuNameCounts,
      loShuCombinedCounts,
      vedicGrid,
      vedicCounts: vedicGrid.counts,
      vedicMissing: vedicSignals.missing,
      vedicRepeated: vedicSignals.repeated,
      vedicWeak: vedicSignals.weak,
      dobCompound, karmicDebts,
      // Authority boundary: these profiles receive only Driver/Conductor.
      doshaProfile: buildDoshaProfile({ driver, conductor }),
      deityProfile: buildDeityProfile({ driver, conductor }),
      nameCompound, nameNum, nameRelD, nameRelC,
      mobile: input.mobile, mobCompound, mobNum, mobRelD, mobRelC,
      vehicle: input.vehicle || "",
      goals: input.goals || [],
      entrance: input.entrance || "unsure",
      kitchen: input.kitchen || "unsure",
      bedroom: input.bedroom || "unsure",
      toilet: input.toilet || "unsure",
      study: input.study || "unsure",
      staircase: input.staircase || "unsure",
      plotShape: input.plotShape || "unsure",
      watchType: input.watchType || "none",
      gender: input.gender || "",
      birthTime: birthTimeRaw,
      birthTimeDisplay: formatBirthTime(birthTimeRaw),
      birthPlace: birthPlaceRaw,
      brand: input.brand || "",
      partnerName: input.partnerName || "",
      partnerDob: input.partnerDob || "",
      zodiac: zodiacSignSidereal(d, m),
      zodiacTropical: zodiacSign(d, m),
      vedicTier, astro, kua
    };
  }

  /* Localised label for dosha tags, so the constitution name reads naturally
     in English, Hindi and Gujarati while the data stays canonical. */
  function doshaLabel(type, lang) {
    const map = (lang === "hi"
      ? { pitta: "पित्त", vata: "वात", kapha: "कफ" }
      : lang === "gu"
        ? { pitta: "પિત્ત", vata: "વાત", kapha: "કફ" }
        : { pitta: "Pitta", vata: "Vata", kapha: "Kapha" });
    return String(type || "").split(/[\s\u2013\-/,]+/).map((w) => map[w.toLowerCase()] || w).filter(Boolean).join("–");
  }

  /* ---------------- spelling correction & name suggestions ---------------- */
  function spellingCandidates(name, baseCompound) {
    const up = name.toUpperCase();
    const S = (window.DB && window.DB.spelling) || { homophones: {}, vowelDoubles: {}, insertVowels: [] };
    const candidates = [];
    const seen = new Set([up.replace(/\s+/g, " ")]);
    const keepCase = (i, str) => str.split("").map((c, j) => {
      const orig = name[i + j];
      if (orig && orig === orig.toLowerCase()) return c.toLowerCase();
      return c;
    }).join("");
    const addCand = (text, change, kind, deltaV) => {
      const key = text.toUpperCase();
      if (seen.has(key)) return;
      seen.add(key);
      const compound = chaldeanValue(text);
      candidates.push({ text, change, compound, reduced: reduce(compound), kind, delta: Math.abs(compound - baseCompound) + (deltaV || 0) });
    };
    up.split("").forEach((ch, i) => {
      const v = (window.DB && window.DB.chaldean && window.DB.chaldean[ch]) || 0;
      if (!v) return;
      if ("BCDFGHJKLMNPQRSTVWXYZ".includes(ch) || (S.vowelDoubles && S.vowelDoubles[ch])) {
        const t = name.slice(0, i) + name[i] + name.slice(i);
        addCand(t, `double "${name[i]}"`, "double", 0);
      }
      ((S.homophones && S.homophones[ch]) || []).forEach((rep) => {
        const t = name.slice(0, i) + keepCase(i, rep) + name.slice(i + 1);
        addCand(t, `${name[i]} → ${rep}`, "swap", 1);
      });
      if (i > 0 && up[i - 1] !== " ") {
        (S.insertVowels || []).forEach((vowel) => {
          const t = name.slice(0, i + 1) + keepCase(i, vowel) + name.slice(i + 1);
          addCand(t, `insert "${vowel}" after "${name[i]}"`, "insert", 2);
        });
      }
    });
    return candidates;
  }

  /* Optional grid-filling spellings for an ALREADY-harmonious name.
     These never "correct" anything — they consciously fill a number that is
     missing from the Lo Shu Foundation grid, stay non-enemy to both Driver and Conductor,
     and never add to a number the person already has in excess. */
  function buildOptionalSpellings(p) {
    const db = getActiveDB();
    const fillable = p.loShuMissing.filter((n) =>
      relation(p.driver, n) !== "enemy" &&
      relation(p.conductor, n) !== "enemy" &&
      !p.loShuRepeated.includes(n)
    );
    if (!fillable.length) return { variants: [], targets: [] };
    const candidates = spellingCandidates(p.name, p.nameCompound);
    const kindRank = { double: 0, swap: 1, insert: 2 };
    const variants = [];
    const seen = new Set();
    fillable.forEach((n) => {
      const planet = db.numbers[n].planet.split(" ")[0];
      const hits = candidates
        .filter((c) => c.reduced === n)
        .sort((a, b) => kindRank[a.kind] - kindRank[b.kind] || a.delta - b.delta);
      hits.slice(0, 2).forEach((c) => {
        const key = c.text.toUpperCase();
        if (seen.has(key)) return;
        seen.add(key);
        variants.push({
          ...c,
          targetN: n,
          why: `optional: fills your missing number ${n} (${planet}) — stays harmonious with Driver ${p.driver} and Conductor ${p.conductor}`
        });
      });
    });
    return { variants: variants.slice(0, 4), targets: fillable };
  }

  function nameSuggestions(p) {
    const optional = buildOptionalSpellings(p);
    if (p.nameRelD !== "enemy" && p.nameRelC !== "enemy") {
      return { needed: false, verdict: p.nameRelD === "neutral" || p.nameRelC === "neutral" ? "neutral" : "friendly", optional };
    }

    const db = getActiveDB();
    const missingRanked = p.loShuMissing.slice().sort((a, b) => {
      const score = (n) => {
        const rd = relation(p.driver, n), rc = relation(p.conductor, n);
        if (rd === "friendly" && rc === "friendly") return 0;
        if (rd !== "enemy" || rc !== "enemy") return 1;
        return 2;
      };
      return score(a) - score(b);
    }).map((n) => ({ n, why: `compensates your missing number ${n} (${db.numbers[n].planet})` }));

    const harm = [];
    for (let n = 1; n <= 9; n++) {
      const rd = relation(p.driver, n), rc = relation(p.conductor, n);
      if (rd !== "enemy" && rc !== "enemy" && !p.loShuMissing.includes(n)) {
        harm.push({
          n,
          why: rd === "friendly" && rc === "friendly"
            ? `harmonious with both Driver ${p.driver} and Conductor ${p.conductor}`
            : `acceptable to Driver ${p.driver} and Conductor ${p.conductor}`
        });
      }
    }
    const targets = missingRanked.concat(harm);
    if (!targets.length) return { needed: true, verdict: "enemy", variants: [], targets: [] };

    const candidates = spellingCandidates(p.name, p.nameCompound);

    const kindRank = { double: 0, swap: 1, insert: 2 };
    const variants = [];
    targets.forEach((tgt) => {
      const hits = candidates
        .filter((c) => c.reduced === tgt.n)
        .sort((a, b) => kindRank[a.kind] - kindRank[b.kind] || a.delta - b.delta);
      hits.slice(0, 2).forEach((c) => variants.push({ ...c, why: tgt.why, targetN: tgt.n }));
    });

    const finalSeen = new Set();
    const out = [];
    variants.forEach((v) => {
      const k = v.text.toUpperCase();
      if (finalSeen.has(k)) return;
      finalSeen.add(k); out.push(v);
    });

    return { needed: true, verdict: "enemy", variants: out.slice(0, 6), targets: targets.map((tgt) => tgt.n), optional };
  }

  function brandAnalysis(brand, p) {
    if (!brand || !brand.trim()) return null;
    const total = chaldeanValue(brand.trim());
    const root = reduce(total);
    const relD = relation(p.driver, root);
    const relC = relation(p.conductor, root);
    const conflicting = relD === "enemy" || relC === "enemy";

    const auspicious = [];
    for (let n = 1; n <= 9; n++) {
      if (relation(p.driver, n) !== "enemy" && relation(p.conductor, n) !== "enemy") auspicious.push(n);
    }

    let suggestions = [];
    if (conflicting) {
      const candidates = spellingCandidates(brand.trim(), total);
      const kindRank = { double: 0, swap: 1, insert: 2 };
      suggestions = candidates
        .filter((c) => auspicious.includes(c.reduced))
        .sort((a, b) => kindRank[a.kind] - kindRank[b.kind] || a.delta - b.delta)
        .slice(0, 6)
        .map((c) => ({ ...c, why: `brand number ${c.reduced} is friendly to your Driver ${p.driver} and Conductor ${p.conductor}` }));
    }

    return {
      brand: brand.trim(), total, root, relD, relC, conflicting, auspicious,
      suggestions,
      master: masterNumber(total),
      compound: compoundMeaning(total)
    };
  }

  function mobileSuggestion(p) {
    const bad = p.mobRelD === "enemy" || p.mobRelC === "enemy";
    if (!bad) return { needed: false };
    const good = [];
    for (let t = 9; t <= 60; t++) {
      const r = reduce(t);
      if (relation(p.driver, r) === "friendly" && relation(p.conductor, r) === "friendly") good.push(t);
    }
    return { needed: true, goodTotals: good.slice(0, 6) };
  }

  function compatibility(a, b) {
    const pairs = [
      { a: `Your Driver ${a.driver}`, b: `their Driver ${b.driver}`, aNum: a.driver, bNum: b.driver, sideB: "their Driver", r: relation(a.driver, b.driver) },
      { a: `Your Driver ${a.driver}`, b: `their Conductor ${b.conductor}`, aNum: a.driver, bNum: b.conductor, sideB: "their Conductor", r: relation(a.driver, b.conductor) },
      { a: `Your Conductor ${a.conductor}`, b: `their Driver ${b.driver}`, aNum: a.conductor, bNum: b.driver, sideB: "their Driver", r: relation(a.conductor, b.driver) },
      { a: `Your Conductor ${a.conductor}`, b: `their Conductor ${b.conductor}`, aNum: a.conductor, bNum: b.conductor, sideB: "their Conductor", r: relation(a.conductor, b.conductor) }
    ];
    const score = pairs.reduce((s, p) => s + (p.r === "friendly" ? 2 : p.r === "neutral" ? 1 : 0), 0);
    const friendly = pairs.filter((p) => p.r === "friendly").length;
    const neutral = pairs.filter((p) => p.r === "neutral").length;
    const enemy = pairs.filter((p) => p.r === "enemy").length;
    const verdict = score >= 7 ? "Strong" : score >= 5 ? "Good" : score >= 3 ? "Workable" : "Challenging";
    return { pairs, score, max: 8, verdict, friendly, neutral, enemy };
  }

  /* ---- compatibility reflection helpers -------------------------------
     Compatibility can describe pairwise friction and communication cues, but
     never creates a relationship remedy programme or timing prescription. */
  const PAIR_FRICTION = {
    "1-4": {
      friction: { en: "Sun's need for recognition meets Rahu's unconventional, restless style — clashes over authority, credit and \"who is right\".", hi: "सूर्य की पहचान की चाह और राहु की अपरंपरागत, चंचल शैली टकराती है — अधिकार, श्रेय और \"सही कौन\" पर विवाद।", gu: "સૂર્યની ઓળખની ચાહ અને રાહુની અપરંપરાગત, ચંચળ શૈલી અથડાય છે — સત્તા, શ્રેય અને \"સાચો કોણ\" પર વિવાદ." }
    },
    "1-6": {
      friction: { en: "Sun's authority vs Venus's comfort and sociability — one pushes status and discipline, the other beauty, leisure and spending.", hi: "सूर्य का अधिकार बनाम शुक्र का सुख-सामर्थ्य और मिलनसारिता — एक पद और अनुशासन का दबाव देता है, दूसरा सौंदर्य, विश्राम और खर्च की चाह।", gu: "સૂર્યનું વર્ચસ્વ વિરુદ્ધ શુક્રનો આરામ અને મિલનસારપણું — એક પ્રતિષ્ઠા અને શિસ્ત થોપે, બીજો સૌંદર્ય, વિશ્રાંતિ અને ખર્ચ ઇચ્છે." }
    },
    "1-7": {
      friction: { en: "Sun wants the stage, Ketu prefers silence and withdrawal — one feels ignored, the other feels exposed.", hi: "सूर्य मंच चाहता है, केतु मौन और एकांत — एक को अनदेखा लगता है, दूसरे को बहुत उजाला।", gu: "સૂર્યને સ્ટેજ જોઈએ, કેતુને મૌન અને એકાંત — એકને અવગણના લાગે, બીજાને વધુ પડતું પ્રકાશન." }
    },
    "1-8": {
      friction: { en: "Sun's quick authority meets Saturn's slow, tested methods — power struggles, delays read as defiance, discipline as insult.", hi: "सूर्य की तेज़ अधिकार-शैली और शनि की धीमी, परखी हुई पद्धति — सत्ता-संघर्ष, विलंब को विरोध और अनुशासन को अपमान समझा जाता है।", gu: "સૂર્યની ઝડપી સત્તા-શૈલી અને શનિની ધીમી, કસાયેલી પદ્ધતિ — સત્તા-સંઘર્ષ, વિલંબને વિરોધ અને શિસ્તને અપમાન ગણાય." }
    },
    "2-4": {
      friction: { en: "Moon's emotional sensitivity meets Rahu's restlessness — mood swings meet unpredictability, reassurance meets distraction.", hi: "चंद्र की भावुक संवेदनशीलता और राहु की बेचैनी — मन की लहरें अनिश्चितता से टकराती हैं, आश्वासन विचलित करने से।", gu: "ચંદ્રની ભાવુક સંવેદનશીલતા અને રાહુની બેચાની — મનની લહેરો અનિશ્ચિતતા સામે અથડાય, દિલાસો વિચલિત કરે." }
    },
    "2-7": {
      friction: { en: "Moon needs connection and words; Ketu withdraws into silence — distance feels like rejection, closeness feels like pressure.", hi: "चंद्र को जुड़ाव और वाणी चाहिए; केतु मौन में खो जाता है — दूरी अस्वीकृति और निकटता दबाव लगती है।", gu: "ચંદ્રને જોડાણ અને વાણી જોઈએ; કેતુ મૌનમાં ખોવાય — અંતરાલ અસ્વીકૃતિ અને નિકટતા દબાણ લાગે." }
    },
    "3-4": {
      friction: { en: "Jupiter's tradition and study vs Rahu's shortcuts — the 3-side preaches, the 4-side improvises; both feel unrespected.", hi: "गुरु की परंपरा और अध्ययन बनाम राहु के शॉर्टकट — 3 पक्ष उपदेश देता है, 4 पक्ष जुगाड़ करता है; दोनों को अनादर लगता है।", gu: "ગુરુની પરંપરા અને અભ્યાસ વિરુદ્ધ રાહુના ટૂંકા રસ્તા — 3 પક્ષ ઉપદેશ આપે, 4 પક્ષ જુગાડ કરે; બંનેને અનાદર લાગે." }
    },
    "3-5": {
      friction: { en: "Jupiter's depth vs Mercury's speed — advice sounds like criticism to the 5-side; the 3-side finds the 5-side scattered and superficial.", hi: "गुरु की गहराई बनाम बुध की गति — 5 पक्ष को सलाह आलोचना लगती है; 3 पक्ष 5 पक्ष को बिखरा हुआ और ऊपरी समझता है।", gu: "ગુરુની ઊંડાણ વિરુદ્ધ બુધની ઝડપ — 5 પક્ષને સલાહ ટીકા લાગે; 3 પક્ષ 5 પક્ષને બિખરાયેલો અને સપરી સમજે." }
    },
    "3-6": {
      friction: { en: "Jupiter's dharma and study vs Venus's comfort and luxury — spending vs saving, devotion vs enjoyment.", hi: "गुरु का धर्म और अध्ययन बनाम शुक्र का आराम और विलासिता — बचत बनाम खर्च, त्याग बनाम भोग।", gu: "ગુરુનો ધર્મ અને અભ્યાસ વિરુદ્ધ શુક્રનો આરામ અને વિલાસ — બચત વિરુદ્ધ ખર્ચ, ત્યાગ વિરુદ્ધ ભોગ." }
    },
    "3-7": {
      friction: { en: "Jupiter's outward teaching vs Ketu's inward detachment — one expands the world, the other renounces it; plans meet sudden withdrawal.", hi: "गुरु का बाहरमुखी उपदेश बनाम केतु का भीतरमुखी वैराग्य — एक जग का विस्तार करता है, दूसरा त्याग; योजनाएँ अचानक मौन से मिलती हैं।", gu: "ગુરુનું બહિર્મુખ શિક્ષણ વિરુદ્ધ કેતુનું અંતર્મુખ વૈરાગ્ય — એક જગતનો વિસ્તાર કરે, બીજો ત્યાગે; યોજનાઓ અચાનક મૌન પામે." }
    },
    "4-9": {
      friction: { en: "Rahu's risky shortcuts meet Mars's blunt force — impulsive decisions meet a short fuse; arguments escalate fast.", hi: "राहु के जोखिम भरे शॉर्टकट और मंगल की सीधी तेज़ शक्ति — आवेशी निर्णय और तपती ज़ुबान; बहस तेज़ी से बढ़ती है।", gu: "રાહુના જોખમી ટૂંકા રસ્તા અને મંગળની સીધી તેજ શક્તિ — આવેશી નિર્ણય અને ગરમ જીભ; વાદ-વિવાદ ઝડપથી વધે." }
    },
    "7-9": {
      friction: { en: "Ketu's detachment vs Mars's fiery drive — one renounces, one conquers; shared plans stall between mysticism and muscle.", hi: "केतु का वैराग्य बनाम मंगल की तेज़ चाह — एक त्यागता है, दूसरा जीतता है; रहस्यवाद और बल के बीच योजनाएँ अटकती हैं।", gu: "કેતુનો વૈરાગ્ય વિરુદ્ધ મંગળની તેજ ઇચ્છા — એક ત્યાગે, બીજો જીતે; રહસ્યવાદ અને બળ વચ્ચે યોજનાઓ અટકે." }
    }
  };

  function pairKey(x, y) { return Math.min(x, y) + "-" + Math.max(x, y); }

  const RELATIONSHIP_COMMUNICATION_GUIDANCE = {
    en: "Before the issue escalates, name your need with an ‘I’ statement, agree one clear next step, and review it together at a set time.",
    hi: "बात बढ़ने से पहले अपनी जरूरत को ‘मैं’ वाक्य में कहें, एक स्पष्ट अगला कदम तय करें और तय समय पर साथ उसकी समीक्षा करें।",
    gu: "વાત વધે તે પહેલાં તમારી જરૂરિયાત ‘હું’ વાક્યમાં કહો, એક સ્પષ્ટ આગલું પગલું નક્કી કરો અને નક્કી સમયે સાથે તેની સમીક્ષા કરો."
  };

  // Retained name for external compatibility; returns reflection inputs only.
  function compatRemedies(a, b, compat) {
    const db = getActiveDB();
    const conflicts = compat.pairs
      .filter((pr) => pr.r === "enemy")
      .map((pr) => {
        const g = PAIR_FRICTION[pairKey(pr.aNum, pr.bNum)] || null;
        return Object.assign({}, pr, {
          planetA: db.numbers[pr.aNum].planet,
          planetB: db.numbers[pr.bNum].planet,
          friction: g ? g.friction : null,
          bridge: RELATIONSHIP_COMMUNICATION_GUIDANCE
        });
      });
    /* Shared reference numbers: acceptable (never enemy) to both charts, ranked. */
    const four = [a.driver, a.conductor, b.driver, b.conductor].filter((n, i, arr) => arr.indexOf(n) === i);
    const bridges = [];
    for (let n = 1; n <= 9; n++) {
      const rels = four.map((m) => (m === n ? "friendly" : relation(m, n)));
      if (rels.indexOf("enemy") !== -1) continue;
      const score = rels.reduce((s, r) => s + (r === "friendly" ? 2 : 1), 0);
      bridges.push({ n, score, planet: db.numbers[n].planet.split(" ")[0] });
    }
    bridges.sort((x, y) => y.score - x.score || x.n - y.n);
    return {
      conflicts,
      bridges: bridges.slice(0, 3),
      bridgePool: bridges.length,
      neutralLinks: compat.pairs.filter((pr) => pr.r === "neutral").length
    };
  }


  function vehicleAnalysis(p) {
    const db = getActiveDB();
    const bothGood = [], okTotals = [];
    for (let t = 4; t <= 45; t++) {
      const r = reduce(t);
      const rd = relation(p.driver, r), rc = relation(p.conductor, r);
      if (rd === "friendly" && rc === "friendly") bothGood.push(t);
      else if (rd !== "enemy" && rc !== "enemy") okTotals.push(t);
    }
    const goodTotals = bothGood.length ? bothGood : okTotals;
    const luckyPlanetNums = [p.driver, p.conductor].filter((n, i, a) => a.indexOf(n) === i);
    const luckyColors = luckyPlanetNums.map((n) => db.numbers[n].color.split(",")[0] + " (" + db.numbers[n].planet.split(" ")[0] + ")");

    if (!p.vehicle || !p.vehicle.trim()) {
      return { provided: false, goodTotals: goodTotals.slice(0, 8), luckyColors };
    }

    const letters = p.vehicle.replace(/[^a-zA-Z]/g, "");
    const digits = p.vehicle.replace(/\D/g, "");
    const letterVal = chaldeanValue(letters);
    const digitVal = digitSum(digits);
    const total = letterVal + digitVal;
    const num = reduce(total);
    const relD = relation(p.driver, num);
    const relC = relation(p.conductor, num);
    return {
      provided: true, raw: p.vehicle.toUpperCase(),
      letters: letters.toUpperCase(), letterVal, digitVal, total, num,
      relD, relC,
      conflicting: relD === "enemy" || relC === "enemy",
      goodTotals: goodTotals.slice(0, 8), luckyColors
    };
  }

  /* Pinnacles & Challenges — the classical four life phases, derived purely
     from the birth date:
       P1 = day+month, P2 = day+year, P3 = P1+P2, P4 = month+year   (reduced 1–9)
       C1 = |day−month|, C2 = |day−year|, C3 = |C1−C2|, C4 = |month−year|
     Challenges use the single-digit components and are kept as-is (0–8,
     never reduced). Phase convention: the first pinnacle ends at age
     36 − Conductor, each following pinnacle spans 9 years, and the fourth
     runs to the end of life. */
  function pinnacleAnalysis(p) {
    const rd = reduce(p.day), rm = reduce(p.month), ry = reduce(p.year);
    const p1 = reduce(p.day + p.month);
    const p2 = reduce(p.day + p.year);
    const p3 = reduce(p1 + p2);
    const p4 = reduce(p.month + p.year);
    const c1 = Math.abs(rd - rm);
    const c2 = Math.abs(rd - ry);
    const c3 = Math.abs(c1 - c2);
    const c4 = Math.abs(rm - ry);
    const end1 = 36 - p.conductor;
    const end2 = end1 + 9;
    const end3 = end2 + 9;
    const phases = [
      { i: 1, pinnacle: p1, challenge: c1, from: 0, to: end1 },
      { i: 2, pinnacle: p2, challenge: c2, from: end1 + 1, to: end2 },
      { i: 3, pinnacle: p3, challenge: c3, from: end2 + 1, to: end3 },
      { i: 4, pinnacle: p4, challenge: c4, from: end3 + 1, to: null },
    ];
    return { phases, firstEnd: end1 };
  }

  function timingAnalysis(p) {
    const now = new Date();
    const cy = now.getFullYear();
    const personalYearNum = (yr) => reduce(p.day + p.month + reduce(yr));
    const db = getActiveDB();
    const pinnacles = pinnacleAnalysis(p);

    const years = [0, 1, 2, 3].map((off) => {
      const yr = cy + off;
      const n = personalYearNum(yr);
      return { yr, n, meaning: db.personalYear[n] || (window.DB && window.DB.personalYear && window.DB.personalYear[n]) || "", current: off === 0 };
    });

    const luckyYears = [];
    for (let off = 0; off <= 12 && luckyYears.length < 6; off++) {
      const yr = cy + off;
      const yv = reduce(yr);
      const py = personalYearNum(yr);
      const reasons = [];
      if (relation(p.driver, yv) === "friendly") reasons.push(`year vibration ${yv} supports Driver ${p.driver}`);
      if (py === p.driver) reasons.push(`personal year ${py} = your Driver — a personal-power year`);
      else if (py === p.conductor) reasons.push(`personal year ${py} = your Conductor — destiny doors open`);
      else if (relation(p.driver, py) === "friendly") reasons.push(`personal year ${py} is friendly to Driver ${p.driver}`);
      if (reasons.length) luckyYears.push({ yr, py, why: reasons.join("; ") });
    }

    const curAge = cy - p.year - (new Date(cy, p.month - 1, p.day) > now ? 1 : 0);
    const milestones = [];
    for (let age = curAge; age <= curAge + 25 && milestones.length < 6; age++) {
      const a = reduce(age);
      const rd = relation(p.driver, a), rc = relation(p.conductor, a);
      if (a === p.driver) milestones.push({ age, yr: p.year + age, why: `age reduces to ${a} = your Driver — peak personal-power year` });
      else if (a === p.conductor) milestones.push({ age, yr: p.year + age, why: `age reduces to ${a} = your Conductor — destiny-alignment year` });
      else if (rd === "friendly" && rc === "friendly") milestones.push({ age, yr: p.year + age, why: `age reduces to ${a} — harmonious with both your numbers` });
    }
    return { years, luckyYears, milestones, curAge, pinnacles };
  }

  /* ---------------- Numerology Dasha engine (Ank Jyotish) ----------------
     Classical proportional cycle on a 45-year base (1+2+…+9 = 45).
     · Mahadasha starts at birth with the Moolank and lasts N solar years;
       the sequence then advances cyclically 1→9 and repeats after 45 years.
     · Antardasha = MD years × AD number ÷ 45, sequence starting from the
       MD lord itself (nested mathematical continuity).
     · Pratyantar = AD span × PD number ÷ 45, sequence starting from the
       AD lord.
     Dates use the 365.2425-day solar year from the date of birth; when the
     user has provided an exact birth time (Vedic Tier 2) the cycle is
     anchored to that time for finer boundaries. */
  const DASHA_YEAR_MS = 365.2425 * 86400000;

  function dashaSequenceFrom(n) {
    return Array.from({ length: 9 }, (_, i) => ((n - 1 + i) % 9) + 1);
  }

  function dashaBirthDate(p) {
    let hh = 0, mm = 0;
    if (p.birthTime) {
      const parts = String(p.birthTime).split(":").map(Number);
      if (!isNaN(parts[0])) hh = parts[0];
      if (!isNaN(parts[1])) mm = parts[1];
    }
    return new Date(p.year, p.month - 1, p.day, hh, mm);
  }

  function buildAntardashas(mdNumber, mdStartMs) {
    let cur = mdStartMs;
    return dashaSequenceFrom(mdNumber).map((adN) => {
      const ms = (mdNumber * adN / 45) * DASHA_YEAR_MS;
      const seg = { n: adN, startMs: cur, endMs: cur + ms };
      cur += ms;
      return seg;
    });
  }

  function buildPratyantars(adSeg) {
    const span = adSeg.endMs - adSeg.startMs;
    let cur = adSeg.startMs;
    return dashaSequenceFrom(adSeg.n).map((pdN) => {
      const ms = span * pdN / 45;
      const seg = { n: pdN, startMs: cur, endMs: cur + ms };
      cur += ms;
      return seg;
    });
  }

  /* Dasha owns timing and life-event windows. Scores intentionally use only
     the active Mahadasha/Antardasha lords and the event's Dasha definition;
     neither Lo Shu nor Vedic-grid counts can strengthen, weaken or reroute a
     prediction window. */
  function scoreEventWindow(ev, mdN, adN) {
    let s = 0;
    if (ev.primary.includes(adN)) s += 3;
    if (ev.primary.includes(mdN)) s += 2;
    if (ev.support.includes(adN)) s += 1.5;
    if (ev.support.includes(mdN)) s += 1;
    return s;
  }

  function dashaTimeline(p, refDate) {
    const birth = dashaBirthDate(p);
    const birthMs = birth.getTime();
    const nowMs = (refDate ? new Date(refDate) : new Date()).getTime();

    // Lifetime Mahadasha ladder (birth → ~100 years)
    const mahadashas = [];
    let cur = birthMs, n = p.driver;
    while (cur < birthMs + 100 * DASHA_YEAR_MS) {
      const ms = n * DASHA_YEAR_MS;
      mahadashas.push({
        n,
        startMs: cur, endMs: cur + ms,
        fromAge: Math.round((cur - birthMs) / DASHA_YEAR_MS),
        toAge: Math.round((cur + ms - birthMs) / DASHA_YEAR_MS),
        current: nowMs >= cur && nowMs < cur + ms
      });
      cur += ms;
      n = (n % 9) + 1;
    }

    // Current nested stack: MD → AD → PD
    const md = mahadashas.find((m) => m.current) || mahadashas[mahadashas.length - 1];
    const ads = buildAntardashas(md.n, md.startMs);
    const ad = ads.find((a) => nowMs >= a.startMs && nowMs < a.endMs) || ads[ads.length - 1];
    const pds = buildPratyantars(ad);
    const pd = pds.find((x) => nowMs >= x.startMs && nowMs < x.endMs) || pds[pds.length - 1];
    const adProgress = Math.max(0, Math.min(100, Math.round(((nowMs - ad.startMs) / (ad.endMs - ad.startMs)) * 100)));
    const pdDaysLeft = Math.max(0, Math.ceil((pd.endMs - nowMs) / 86400000));

    // Life-event windows: scan every AD segment across life against the
    // classical Dasha lords, then keep the best upcoming windows (plus the
    // strongest past one for validation).
    const db = getActiveDB();
    const dashaDB = db.dasha || (window.DB && window.DB.dasha) || {};
    const eventDefs = dashaDB.lifeEvents || {};
    const events = Object.keys(eventDefs).map((key) => {
      const ev = eventDefs[key];
      const windows = [];
      mahadashas.forEach((m) => {
        buildAntardashas(m.n, m.startMs).forEach((a) => {
          const midAge = ((a.startMs + a.endMs) / 2 - birthMs) / DASHA_YEAR_MS;
          if (midAge < ev.band[0] || midAge > ev.band[1]) return;
          const score = scoreEventWindow(ev, m.n, a.n);
          if (score >= 3) windows.push({
            mdN: m.n, adN: a.n, score,
            startMs: a.startMs, endMs: a.endMs,
            fromAge: Math.floor((a.startMs - birthMs) / DASHA_YEAR_MS),
            toAge: Math.ceil((a.endMs - birthMs) / DASHA_YEAR_MS),
            past: a.endMs < nowMs,
            active: nowMs >= a.startMs && nowMs < a.endMs
          });
        });
      });
      const future = windows.filter((w) => !w.past).sort((x, y) => y.score - x.score || x.startMs - y.startMs).slice(0, 3).sort((x, y) => x.startMs - y.startMs);
      const pastBest = windows.filter((w) => w.past).sort((x, y) => y.score - x.score)[0] || null;
      return { key, def: ev, future, pastBest };
    });

    return { birthMs, mahadashas, current: { md, ad, pd, adProgress, pdDaysLeft }, events };
  }

  function watchSpec(p) {
    const d = p.driver, c = p.conductor;
    const db = getActiveDB();
    const lang = getLang();
    const rows = [
      [lang === "hi" ? "धातु / केस" : lang === "gu" ? "ધાતુ / કેસ" : "Metal / Case", db.watch.metal[d], lang === "hi" ? `मूलांक ${d} (${db.numbers[d].planet}) के अनुकूल` : lang === "gu" ? `મૂળાંક ${d} (${db.numbers[d].planet}) ના અનુકૂળ` : `Supports Driver ${d} (${db.numbers[d].planet})`],
      [lang === "hi" ? "डायल का रंग" : lang === "gu" ? "ડાયલનો રંગ" : "Dial Colour", db.watch.dial[d], lang === "hi" ? `मन को शांत और ${db.numbers[d].planet} को मजबूत करता है` : lang === "gu" ? `મનને શાંત અને ${db.numbers[d].planet} ને મજબૂત કરે છે` : `Calms and strengthens the ${db.numbers[d].planet} mind`],
      [lang === "hi" ? "डायल का आकार" : lang === "gu" ? "ડાયલનો આકાર" : "Case Geometry", db.watch.geometry[c], lang === "hi" ? `भाग्यांक ${c} (${db.numbers[c].planet}) की संरचना` : lang === "gu" ? `ભાગ્યાંક ${c} (${db.numbers[c].planet}) ની રચના` : `Mirrors Conductor ${c} (${db.numbers[c].planet}) structure`],
      [lang === "hi" ? "स्ट्रैप (पट्टा)" : lang === "gu" ? "સ્ટ્રેપ (પટ્ટો)" : "Strap", db.watch.strap[d], lang === "hi" ? "धातु ऊर्जा को स्थिर रखती है; रबर से बचें" : lang === "gu" ? "ધાતુ ઊર્જાને સ્થિર રાખે છે; રબરથી બચો" : "Metal grounds energy; avoid rubber/silicone"],
      [lang === "hi" ? "मुख्य विशेषताएं" : lang === "gu" ? "મુખ્ય વિશેષતાઓ" : "Key Features", db.watch.features[c], lang === "hi" ? `भाग्यांक ${c} कार्य निष्पादन सहायक` : lang === "gu" ? `ભાગ્યાંક ${c} કાર્ય પૂર્તિ સહાયક` : `Conductor ${c} execution support`],
    ];
    const avoids = [db.watch.avoid[d], db.watch.avoid[c]].filter(Boolean);
    const days = [...new Set([dayOf(d), dayOf(c)])];
    const timeText = lang === "hi" ? "सुबह ६:३० से ८:३० के बीच (सूर्योदय काल)" : lang === "gu" ? "સવારે ૬:૩૦ થી ૮:૩૦ વચ્ચે (સૂર્યોદય સમય)" : "between 6:30 AM and 8:30 AM (sunrise hours)";
    return {
      rows, avoids, days,
      time: timeText,
      currentVerdict: currentWatchVerdict(p)
    };
  }

  function currentWatchVerdict(p) {
    const t = p.watchType;
    if (!t || t === "none") return null;
    const db = getActiveDB();
    const lang = getLang();
    if (t === "smart") {
      const sensitive = [2, 7].includes(p.driver) || [2, 7].includes(p.conductor);
      if (lang === "hi") {
        return sensitive
          ? { tone: "warn", text: `आपकी स्मार्टवॉच राहु (४) की ऊर्जा पर काम करती है — कलाई पर बार-बार आने वाले नोटिफिकेशन आपके ${db.numbers[p.driver].planet} मूलांक को अशांत कर सकते हैं। यदि इसे पहनना जारी रखें: मेटल स्ट्रैप लगाएं, न्यूनतम डायल रखें और सोते समय 'डू नॉट डिस्टर्ब' चालू रखें।` }
          : { tone: "info", text: `स्मार्टवॉच आपके चार्ट के लिए ठीक है — नोटिफिकेशन सीमित रखें और राहु (४) की इलेक्ट्रॉनिक ऊर्जा को संतुलित करने के लिए मेटल स्ट्रैप को प्राथमिकता दें।` };
      }
      if (lang === "gu") {
        return sensitive
          ? { tone: "warn", text: `તમારી સ્માર્ટવોચ રાહુ (૪) ની ઊર્જા પર કામ કરે છે — કાંડા પર વારંવાર આવતા નોટિફિકેશન તમારા ${db.numbers[p.driver].planet} મૂળાંકને અશાંત કરી શકે છે. જો પહેરવાનું ચાલુ રાખો: મેટલ સ્ટ્રેપ લગાવો, સાદો ડાયલ રાખો અને ઊંઘતી વખતે 'ડુ નોટ ડિસ્ટર્બ' ચાલુ રાખો.` }
          : { tone: "info", text: `સ્માર્ટવોચ તમારા ચાર્ટ માટે યોગ્ય છે — નોટિફિકેશન મર્યાદિત રાખો અને રાહુ (૪) ની ઇલેક્ટ્રોનિક ઊર્જા સંતુલિત કરવા મેટલ સ્ટ્રેપને પ્રાથમિકતા આપો.` };
      }
      return sensitive
        ? { tone: "warn", text: `Your smartwatch runs on Rahu (4) energy — constant wrist notifications can disturb your ${db.numbers[p.driver].planet} driver. If you keep it: switch to a metallic strap, use a minimal ${p.driver === 2 ? "silver/white" : "calm"} watch-face, and enable Do-Not-Disturb during sleep and deep work.` }
        : { tone: "info", text: "A smartwatch is acceptable for your chart — keep notifications curated and prefer a metallic strap to ground the Rahu (4) electronic energy." };
    }
    if (t === "digital") {
      return {
        tone: "info",
        text: lang === "hi" ? "डिजिटल घड़ी सामान्य है। ऊपर दिए गए विवरण के अनुसार मेटल स्ट्रैप वाली एनालॉग घड़ी पहनने से अतिरिक्त ग्रहीय लाभ मिलेगा।"
          : lang === "gu" ? "ડિજિટલ ઘડિયાળ સામાન્ય છે. ઉપર દર્શાવેલ વિગત મુજબ મેટલ સ્ટ્રેપ વાળી એનાલોગ ઘડિયાળ પહેરવાથી વધારાનો ગ્રહીય લાભ મળશે."
          : "A digital watch is neutral. Upgrading to a metal-strap analog aligned with the spec above would add planetary support."
      };
    }
    return {
      tone: "good",
      text: lang === "hi" ? "क्लासिक एनालॉग घड़ी आपके चार्ट के लिए सर्वोत्तम है। पूर्ण लाभ के लिए ऊपर दिए गए धातु, डायल रंग और आकार का मिलान करें।"
        : lang === "gu" ? "ક્લાસિક એનાલોગ ઘડિયાળ તમારા ચાર્ટ માટે સર્વોત્તમ છે. સંપૂર્ણ લાભ માટે ઉપર દર્શાવેલ ધાતુ, ડાયલ રંગ અને આકાર પસંદ કરો."
        : "A classic analog watch suits your chart. Match the metal, dial colour and geometry to the spec above for full alignment."
    };
  }

  function vastuReport(p) {
    const findings = [];
    const db = getActiveDB();
    const lang = getLang();
    if (p.entrance && p.entrance !== "unsure" && db.vastu && db.vastu.entrance) {
      const e = db.vastu.entrance[p.entrance];
      if (e) {
        findings.push({
          item: lang === "hi" ? `मुख्य द्वार — ${dirLabel(p.entrance)}` : lang === "gu" ? `મુખ્ય પ્રવેશદ્વાર — ${dirLabel(p.entrance)}` : `Main entrance — ${dirLabel(p.entrance)}`,
          tone: e.score === "Excellent" || e.score === "Good" ? "good" : e.score === "Moderate" ? "warn" : "bad",
          label: e.score, note: e.note
        });
      }
    }
    const roomMap = {
      kitchen: lang === "hi" ? "रसोईघर (Kitchen)" : lang === "gu" ? "રસોડું (Kitchen)" : "Kitchen",
      bedroom: lang === "hi" ? "मास्टर बेडरूम (Master Bedroom)" : lang === "gu" ? "મુખ્ય બેડરૂમ (Master Bedroom)" : "Master Bedroom",
      toilet: lang === "hi" ? "शौचालय (Toilet)" : lang === "gu" ? "શૌચાલય (Toilet)" : "Toilet",
      study: lang === "hi" ? "अध्ययन कक्ष (Study Room)" : lang === "gu" ? "અભ્યાસ ખંડ (Study Room)" : "Study Room",
      staircase: lang === "hi" ? "सीढ़ियां (Staircase)" : lang === "gu" ? "દાદર / પગથિયાં (Staircase)" : "Staircase"
    };
    const engRoomNames = { kitchen: "Kitchen", bedroom: "Master Bedroom", toilet: "Toilet", study: "Study Room", staircase: "Staircase" };
    Object.entries(engRoomNames).forEach(([key, engName]) => {
      const dir = p[key];
      if (!dir || dir === "unsure" || !db.vastu || !db.vastu.roomRules) return;
      const rule = db.vastu.roomRules.find((r) => r.room === engName);
      if (!rule) return;
      const status = (rule.ideal && rule.ideal.includes(dir)) ? "ideal" : (rule.acceptable && rule.acceptable.includes(dir)) ? "ok" : "dosh";
      const roomLabel = roomMap[key] || engName;
      findings.push({
        item: `${roomLabel} — ${dirLabel(dir)}`,
        tone: status === "ideal" ? "good" : status === "ok" ? "warn" : "bad",
        label: status === "ideal" ? "Ideal" : status === "ok" ? "Acceptable" : "Dosh",
        note: status === "dosh" ? rule.doshText.replace("{dir}", dirLabel(dir)) + " " + rule.fix : status === "ok" ? (lang === "hi" ? "स्वीकार्य स्थिति। " + rule.fix : lang === "gu" ? "સ્વીકાર્ય સ્થિતિ. " + rule.fix : "Acceptable placement. " + rule.fix) : (lang === "hi" ? "उत्तम स्थिति — संतुलित ऊर्जा का संचार।" : lang === "gu" ? "ઉત્તમ સ્થિતિ — સંતુલિત ઊર્જાનો સંચાર." : "Well placed — supports balanced energy.")
      });
    });

    if (p.plotShape && p.plotShape !== "unsure" && db.vastu && db.vastu.plotShapes && db.vastu.plotShapes[p.plotShape]) {
      const ps = db.vastu.plotShapes[p.plotShape];
      findings.push({
        item: lang === "hi" ? `प्लॉट का आकार — ${p.plotShape.replace(/-/g, " ")}` : lang === "gu" ? `પ્લોટનો આકાર — ${p.plotShape.replace(/-/g, " ")}` : `Plot shape — ${p.plotShape.replace(/-/g, " ")}`,
        tone: ps.tone,
        label: ps.tone === "good" ? "Balanced" : ps.tone === "warn" ? "Caution" : "Dosh",
        note: ps.note
      });
    }
    return findings;
  }

  function goalPlan(p) {
    const db = getActiveDB();
    const goalsMap = (window.DB && window.DB.goals) || {};
    return p.goals.map((g) => {
      const nums = goalsMap[g] || [];
      const weak = nums.filter((n) => p.loShuMissing.includes(n));
      const strong = nums.filter((n) => !p.loShuMissing.includes(n));
      const focus = weak.length ? weak : nums.slice(0, 2);
      return { goal: g, weak, strong, focus: focus.map((n) => ({ n, ...db.numbers[n] })) };
    });
  }

  /* The Foundation practice engine intentionally reads one source only: the
     classic Lo Shu signal set. Driver/Conductor power days are rendered
     separately below as a scheduling reference, never as plan selectors. */
  function loShuPracticeTargets(p) {
    const critical = (p.loShuMissingSeverity || [])
      .filter((entry) => entry && entry.critical)
      .map((entry) => Number(entry.n));
    const missing = [...new Set(critical.concat((p.loShuMissing || []).map(Number)))];
    const repeated = [...new Set((p.loShuRepeated || []).map(Number))];
    const present = Object.keys(p.loShuCounts || {})
      .map(Number)
      .filter((n) => (p.loShuCounts[n] || 0) > 0)
      .sort((a, b) => (p.loShuCounts[b] - p.loShuCounts[a]) || a - b);
    const ordered = missing.concat(repeated.filter((n) => !missing.includes(n)), present.filter((n) => !missing.includes(n) && !repeated.includes(n)));
    return {
      missing,
      repeated,
      primary: ordered[0] || 5,
      secondary: ordered.find((n) => n !== (ordered[0] || 5)) || null
    };
  }

  function priorityPlan(p) {
    const db = getActiveDB();
    const lang = getLang();
    const targets = loShuPracticeTargets(p);
    const rows = [];
    targets.missing.slice(0, 5).forEach((n) => {
      const info = db.numbers[n];
      if (!info) return;
      if (lang === "hi") {
        rows.push({ cadence: "daily", source: "lo-shu", text: `<strong>${esc(info.planet)}</strong> को बलवान बनाएं (लो शू में अनुपस्थित अंक ${n}): <span class="mantra">${esc(info.mantra)}</span> का जाप करें (${esc(info.mantraCount)}), ${esc(info.color.split(",")[0])} रंग अपनाएं और ${esc(info.lifestyle.split(";")[0])} का अभ्यास करें।` });
      } else if (lang === "gu") {
        rows.push({ cadence: "daily", source: "lo-shu", text: `<strong>${esc(info.planet)}</strong> ને બળવાન બનાવો (લો શુમાં ખૂટતો અંક ${n}): <span class="mantra">${esc(info.mantra)}</span> નો જાપ કરો (${esc(info.mantraCount)}), ${esc(info.color.split(",")[0])} રંગ અપનાવો અને ${esc(info.lifestyle.split(";")[0])} નો અભ્યાસ કરો.` });
      } else {
        rows.push({ cadence: "daily", source: "lo-shu", text: `Strengthen <strong>${esc(info.planet)}</strong> (missing ${n} in your Lo Shu grid): chant <span class="mantra">${esc(info.mantra)}</span> ${esc(info.mantraCount)}, use ${esc(info.color.split(",")[0])} and practise ${esc(info.lifestyle.split(";")[0])}.` });
      }
    });
    targets.repeated.slice(0, 3).forEach((n) => {
      const info = db.numbers[n];
      const excess = (db.excessEnergy && db.excessEnergy[n]) || {};
      const channel = loc(excess.channel, lang) || info.lifestyle;
      if (!info) return;
      if (lang === "hi") {
        rows.push({ cadence: "daily", source: "lo-shu", text: `<strong>${esc(info.planet)}</strong> की ${p.loShuCounts[n]}× दोहराई ऊर्जा को दिशा दें: ${esc(channel)}। इस अंक को और बढ़ाने वाला उपाय न जोड़ें।` });
      } else if (lang === "gu") {
        rows.push({ cadence: "daily", source: "lo-shu", text: `<strong>${esc(info.planet)}</strong> ની ${p.loShuCounts[n]}× પુનરાવર્તિત ઊર્જાને દિશા આપો: ${esc(channel)}. આ અંકને વધુ વધારતો ઉપાય ઉમેરશો નહીં.` });
      } else {
        rows.push({ cadence: "daily", source: "lo-shu", text: `Channel ${p.loShuCounts[n]}× repeated <strong>${esc(info.planet)}</strong> energy: ${esc(channel)}. Do not add another remedy that feeds this number.` });
      }
    });
    if (!rows.length) {
      const info = db.numbers[targets.primary];
      rows.push({ cadence: "daily", source: "lo-shu", text: lang === "hi"
        ? `आपकी लो शू जन्म-पट्टिका संतुलित है। अंक <strong>${targets.primary}</strong> (${esc(info.planet)}) की सकारात्मक आदत <strong>${esc(info.lifestyle.split(";")[0])}</strong> को स्थिरता के लिए रोज दोहराएं।`
        : lang === "gu"
          ? `તમારી લો શુ જન્મ-ગ્રિડ સંતુલિત છે. સ્થિરતા માટે અંક <strong>${targets.primary}</strong> (${esc(info.planet)}) ની સકારાત્મક ટેવ <strong>${esc(info.lifestyle.split(";")[0])}</strong> રોજ દોહરાવો.`
          : `Your Lo Shu Birth Grid is balanced. For maintenance, repeat number <strong>${targets.primary}</strong> (${esc(info.planet)})'s positive habit: <strong>${esc(info.lifestyle.split(";")[0])}</strong>.` });
    }
    return rows.slice(0, 8);
  }

  function plainText(html) {
    return String(html || "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function firstNameOf(name) {
    return String(name || "Friend").trim().split(/\s+/)[0] || "Friend";
  }

  /* Foundation summary is deliberately descriptive. Dasha, active Vastu and
     dated event windows are linked out to Timeline instead of being inferred
     from a Lo Shu grid or a static room scan. */
  function northstarSummary(p) {
    const db = getActiveDB();
    const lang = getLang();
    const targets = loShuPracticeTargets(p);
    const primary = targets.primary;
    const primaryInfo = db.numbers[primary];
    const goalNames = p.goals && p.goals.length ? p.goals : [lang === "hi" ? "समग्र विकास" : lang === "gu" ? "સર્વાંગી વિકાસ" : "overall growth"];
    const missingText = targets.missing.length ? targets.missing.join(", ") : "";
    const repeatedText = targets.repeated.length ? targets.repeated.join(", ") : "";
    let headline, story, moves, checks, cards;

    if (lang === "hi") {
      headline = `${esc(firstNameOf(p.name))}, आपका Foundation लो शू संकेतों के साथ ${esc(goalNames.join(" + "))} के लिए एक व्यावहारिक, निरंतर दिशा देता है।`;
      story = `आपका मूलांक ${p.driver} (${esc(db.numbers[p.driver].planet)}) आपकी दैनिक अभिव्यक्ति और भाग्यांक ${p.conductor} (${esc(db.numbers[p.conductor].planet)}) दीर्घकालिक दिशा बताते हैं। आपके remedy और lifestyle targets, हालांकि, केवल लो शू जन्म-ग्रिड से आते हैं: ${targets.missing.length ? `अनुपस्थित अंक <strong>${missingText}</strong>` : targets.repeated.length ? `दोहराए अंक <strong>${repeatedText}</strong> की channeling` : "संतुलित grid की maintenance"}।`;
      moves = [
        { title: targets.missing.length ? `लो शू का पहला gap — अंक ${primary}` : `लो शू की मुख्य ऊर्जा — अंक ${primary}`, detail: `${esc(primaryInfo.planet)} के mantra, affirmation, crystal/Rudraksha और habit को 40-दिन के अभ्यास में रखें।` },
        { title: targets.repeated.length ? `दोहराई ऊर्जा को दिशा दें — ${repeatedText}` : "जन्म, नाम और संयुक्त grid देखें", detail: targets.repeated.length ? "उसी अंक को और बढ़ाने के बजाय उसकी क्षमता को अनुशासित काम, सेवा या कला में लगाएं।" : "तीनों लो शू grids के coordinates और planes/arrows से अपने व्यवहारिक pattern पहचानें।" },
        { title: "अगली समय-सीमा Timeline में देखें", detail: "महादशा, अंतर्दशा, जीवन-घटना windows और Active Vastu Zone केवल Timeline · Vedic Dasha में देखें।" }
      ];
      checks = [
        "<strong>उपाय-अधिकार:</strong> missing/repeated remedy, crystal, Rudraksha, affirmation और habit केवल लो शू से आते हैं।",
        "<strong>मूलांक / भाग्यांक:</strong> आयुर्वेदिक baseline, इष्ट देवता और power days के अलग स्रोत हैं।",
        "<strong>समय और वास्तु:</strong> तारीखें, event windows और सक्रिय वास्तु क्षेत्र केवल दशा से आते हैं — Kua/Feng Shui अलग रहता है।"
      ];
      cards = [
        { label: "Foundation focus", value: `लो शू ${primary}`, note: targets.missing.length ? `पहले अनुपस्थित अंक ${missingText} को क्रम से साधें।` : targets.repeated.length ? `दोहराए अंक ${repeatedText} को अधिक fuel देने के बजाय channel करें।` : "संतुलित grid को सरल daily habit से बनाए रखें।" },
        { label: "आपके लक्ष्य", value: esc(goalNames.join(", ")), note: "यह दिशा तय करते हैं; remedy target केवल लो शू signal से आता है।" },
        { label: "Driver / Conductor", value: `${p.driver} / ${p.conductor}`, note: "व्यक्तित्व baseline, guardian deity, Ayurvedic baseline और power days के लिए।" },
        { label: "Timeline cue", value: "Vedic Dasha", note: "Active Vastu Zone, current/next period dates और life-event windows के लिए Timeline खोलें।" }
      ];
    } else if (lang === "gu") {
      headline = `${esc(firstNameOf(p.name))}, તમારું Foundation લો શુ સંકેતો સાથે ${esc(goalNames.join(" + "))} માટે વ્યવહારુ અને સતત દિશા આપે છે.`;
      story = `તમારો મૂળાંક ${p.driver} (${esc(db.numbers[p.driver].planet)}) દૈનિક અભિવ્યક્તિ અને ભાગ્યાંક ${p.conductor} (${esc(db.numbers[p.conductor].planet)}) લાંબી દિશા બતાવે છે. પરંતુ તમારા remedy અને lifestyle targets ફક્ત લો શુ જન્મ-ગ્રિડમાંથી આવે છે: ${targets.missing.length ? `ખૂટતા અંક <strong>${missingText}</strong>` : targets.repeated.length ? `પુનરાવર્તિત અંક <strong>${repeatedText}</strong> ની channeling` : "સંતુલિત grid ની maintenance"}.`;
      moves = [
        { title: targets.missing.length ? `લો શુનો પ્રથમ gap — અંક ${primary}` : `લો શુની મુખ્ય ઊર્જા — અંક ${primary}`, detail: `${esc(primaryInfo.planet)} નો mantra, affirmation, crystal/Rudraksha અને habit ૪૦-દિવસના અભ્યાસમાં રાખો.` },
        { title: targets.repeated.length ? `પુનરાવર્તિત ઊર્જાને દિશા આપો — ${repeatedText}` : "જન્મ, નામ અને સંયુક્ત grid જુઓ", detail: targets.repeated.length ? "એ જ અંકને વધુ વધારવાને બદલે તેની ક્ષમતાને શિસ્તબદ્ધ કામ, સેવા કે કલામાં લગાવો." : "ત્રણેય લો શુ grids ના coordinates અને planes/arrows થી વર્તનના pattern ઓળખો." },
        { title: "આગલી સમય-રેખા Timeline માં જુઓ", detail: "મહાદશા, અંતર્દશા, જીવન-ઘટના windows અને Active Vastu Zone ફક્ત સમયરેખા · વૈદિક દશામાં જુઓ." }
      ];
      checks = [
        "<strong>ઉપાય-અધિકાર:</strong> missing/repeated remedy, crystal, Rudraksha, affirmation અને habit ફક્ત લો શુમાંથી આવે છે.",
        "<strong>મૂળાંક / ભાગ્યાંક:</strong> Ayurvedic baseline, ઇષ્ટ દેવતા અને power days ના અલગ સ્ત્રોત છે.",
        "<strong>સમય અને વાસ્તુ:</strong> તારીખો, event windows અને સક્રિય વાસ્તુ ક્ષેત્ર ફક્ત દશાથી આવે છે — Kua/Feng Shui અલગ રહે છે."
      ];
      cards = [
        { label: "Foundation focus", value: `લો શુ ${primary}`, note: targets.missing.length ? `પહેલાં ખૂટતા અંક ${missingText} ને ક્રમથી સાધો.` : targets.repeated.length ? `પુનરાવર્તિત અંક ${repeatedText} ને વધુ fuel આપવાને બદલે channel કરો.` : "સંતુલિત grid ને સરળ daily habit થી જાળવો." },
        { label: "તમારા લક્ષ્યો", value: esc(goalNames.join(", ")), note: "તે દિશા નક્કી કરે છે; remedy target ફક્ત લો શુ signal પરથી આવે છે." },
        { label: "Driver / Conductor", value: `${p.driver} / ${p.conductor}`, note: "વ્યક્તિત્વ baseline, guardian deity, Ayurvedic baseline અને power days માટે." },
        { label: "Timeline cue", value: "વૈદિક દશા", note: "Active Vastu Zone, current/next period dates અને life-event windows માટે Timeline ખોલો." }
      ];
    } else {
      headline = `${esc(firstNameOf(p.name))}, your Foundation turns Lo Shu signals into a practical, consistent direction for ${esc(goalNames.join(" + ").toLowerCase())}.`;
      story = `Your Driver ${p.driver} (${esc(db.numbers[p.driver].planet)}) describes day-to-day expression and Conductor ${p.conductor} (${esc(db.numbers[p.conductor].planet)}) describes longer direction. Your remedy and lifestyle targets, however, come only from the Lo Shu Birth Grid: ${targets.missing.length ? `missing number${targets.missing.length > 1 ? "s" : ""} <strong>${missingText}</strong>` : targets.repeated.length ? `channeling repeated number${targets.repeated.length > 1 ? "s" : ""} <strong>${repeatedText}</strong>` : "maintenance of a balanced grid"}.`;
      moves = [
        { title: targets.missing.length ? `First Lo Shu gap — number ${primary}` : `Primary Lo Shu energy — number ${primary}`, detail: `Keep ${esc(primaryInfo.planet)}'s mantra, affirmation, crystal/Rudraksha and habit inside the 40-day practice.` },
        { title: targets.repeated.length ? `Channel surplus energy — ${repeatedText}` : "Read the Birth, Name and Combined grids", detail: targets.repeated.length ? "Put capacity into disciplined work, service or craft instead of feeding the same number again." : "Use the matching Lo Shu coordinates and planes/arrows to notice practical behaviour patterns." },
        { title: "Read the next time window in Timeline", detail: "Mahadasha, Antardasha, life-event windows and the Active Vastu Zone live only in Timeline · Vedic Dasha." }
      ];
      checks = [
        "<strong>Remedy authority:</strong> missing/repeated remedies, crystals, Rudraksha, affirmations and habits come only from Lo Shu.",
        "<strong>Driver / Conductor:</strong> these are the separate sources for the Ayurvedic baseline, guardian deities and power days.",
        "<strong>Timing and Vastu:</strong> dates, event windows and the active Vastu zone come only from Dasha — Kua/Feng Shui remains separate."
      ];
      cards = [
        { label: "Foundation focus", value: `Lo Shu ${primary}`, note: targets.missing.length ? `Work through missing number${targets.missing.length > 1 ? "s" : ""} ${missingText} in order.` : targets.repeated.length ? `Channel repeated number${targets.repeated.length > 1 ? "s" : ""} ${repeatedText}; do not add more fuel.` : "Maintain the balanced grid with one simple daily habit." },
        { label: "Your focus", value: esc(goalNames.join(", ")), note: "Goals set direction; only a Lo Shu signal sets a remedy target." },
        { label: "Driver / Conductor", value: `${p.driver} / ${p.conductor}`, note: "Personality baseline, guardian deity, Ayurvedic baseline and power days." },
        { label: "Timeline cue", value: "Vedic Dasha", note: "Open Timeline for the Active Vastu Zone, current/next period dates and life-event windows." }
      ];
    }
    return { headline, story, cards, checks, moves };
  }

  /* The 40-day mandala is a Lo Shu practice. It is deliberately isolated from
     Vedic grid indicators, Dasha timing, home-direction findings, dosha and
     deity baselines. Those systems keep their own cards/modules. */
  function activationPlan(p) {
    const db = getActiveDB();
    const lang = getLang();
    const targets = loShuPracticeTargets(p);
    const targetN = targets.primary;
    const target = db.numbers[targetN];
    const targetShort = db.mantraShort[targetN];
    const secondaryN = targets.secondary;
    const secondary = secondaryN ? db.numbers[secondaryN] : null;
    const targetSignal = targets.missing.includes(targetN) ? "missing" : targets.repeated.includes(targetN) ? "repeated" : "present";
    const targetDescriptor = lang === "hi"
      ? (targetSignal === "missing" ? `लो शू में अनुपस्थित अंक ${targetN}` : targetSignal === "repeated" ? `लो शू में ${p.loShuCounts[targetN]}× दोहराया अंक ${targetN}` : `लो शू का सहायक अंक ${targetN}`)
      : lang === "gu"
        ? (targetSignal === "missing" ? `લો શુમાં ખૂટતો અંક ${targetN}` : targetSignal === "repeated" ? `લો શુંમાં ${p.loShuCounts[targetN]}× પુનરાવર્તિત અંક ${targetN}` : `લો શુનો સહાયક અંક ${targetN}`)
        : (targetSignal === "missing" ? `missing Lo Shu number ${targetN}` : targetSignal === "repeated" ? `${p.loShuCounts[targetN]}× repeated Lo Shu number ${targetN}` : `supportive Lo Shu number ${targetN}`);

    let daily;
    if (lang === "hi") {
      daily = [
        { ico: "🌅", label: "सूर्योदय मंत्र जाप", value: `<span class="mantra">${esc(targetShort.dev)}</span> <em>(${esc(targetShort.pron)})</em> — २७ बार, सुबह ८ बजे से पहले`, sub: `${esc(targetShort.meaning)} यह आपके ${esc(targetDescriptor)} के ${esc(target.planet)} संकेत को अभ्यास में लाता है।` },
        { ico: "📝", label: "संकल्प पत्र", value: `लिखें: “${esc(targetShort.affirmation)}” ११ बार`, sub: "कागज को पर्स या तकिए के नीचे रखें — लिखित संकल्प निरंतरता को सहारा देता है।" },
        { ico: "🎨", label: "लो शू रंग संकेत", value: `${esc(target.color.split(",")[0])} रंग को अपने दैनिक अभ्यास में शामिल करें।`, sub: `यह रंग केवल लो शू के अंक ${targetN} के अभ्यास के लिए चुना गया है।` },
        { ico: "🌿", label: "जीवनशैली संकेत", value: esc(target.lifestyle.split(";")[0]), sub: `${esc(target.planet)} की ऊर्जा को संतुलित दिशा देने वाली छोटी, रोज़ की आदत।` }
      ];
    } else if (lang === "gu") {
      daily = [
        { ico: "🌅", label: "સૂર્યોદય મંત્ર જાપ", value: `<span class="mantra">${esc(targetShort.dev)}</span> <em>(${esc(targetShort.pron)})</em> — ૨૭ વખત, સવારે ૮ વાગ્યા પહેલાં`, sub: `${esc(targetShort.meaning)} આ તમારા ${esc(targetDescriptor)} ના ${esc(target.planet)} સંકેતને અભ્યાસમાં લાવે છે.` },
        { ico: "📝", label: "સંકલ્પ પત્ર", value: `લખો: “${esc(targetShort.affirmation)}” ૧૧ વખત`, sub: "કાગળને પર્સમાં કે ઓશીકા નીચે રાખો — લખેલો સંકલ્પ સાતત્યને ટેકો આપે છે." },
        { ico: "🎨", label: "લો શુ રંગ સંકેત", value: `${esc(target.color.split(",")[0])} રંગને દૈનિક અભ્યાસમાં સામેલ કરો.`, sub: `આ રંગ માત્ર લો શુના અંક ${targetN} ના અભ્યાસ માટે પસંદ કરાયો છે.` },
        { ico: "🌿", label: "જીવનશૈલી સંકેત", value: esc(target.lifestyle.split(";")[0]), sub: `${esc(target.planet)} ની ઊર્જાને સંતુલિત દિશા આપતી નાની, રોજની ટેવ.` }
      ];
    } else {
      daily = [
        { ico: "🌅", label: "Sunrise mantra", value: `<span class="mantra">${esc(targetShort.dev)}</span> <em>(${esc(targetShort.pron)})</em> — 27 times, ideally before 8 AM`, sub: `${esc(targetShort.meaning)} This practises the ${esc(target.planet)} signal in your ${esc(targetDescriptor)}.` },
        { ico: "📝", label: "Wish paper", value: `Write “${esc(targetShort.affirmation)}” 11 times`, sub: "Keep the paper in your wallet or under your pillow — a written intention supports consistency." },
        { ico: "🎨", label: "Lo Shu colour cue", value: `Bring ${esc(target.color.split(",")[0].toLowerCase())} into your daily practice.`, sub: `This colour is selected only for the Lo Shu number ${targetN} practice.` },
        { ico: "🌿", label: "Lifestyle cue", value: esc(target.lifestyle.split(";")[0]), sub: `A small daily habit that gives ${esc(target.planet)} energy a balanced direction.` }
      ];
    }

    /* Power days remain a Driver/Conductor-only reference. They can help a
       person choose a check-in day but never change the Lo Shu target above. */
    const powerDays = [];
    const appendPowerDay = (n, role) => {
      const info = db.numbers[n];
      if (!info) return;
      if (lang === "hi") {
        powerDays.push({ day: dayOf(n), planet: `${n} — ${esc(info.planet)}`, note: `${role} का power day — केवल check-in या शुरुआत चुनने का संदर्भ; यह लो शू अभ्यास-लक्ष्य नहीं बदलता।`, charity: info.charity, fast: info.fast });
      } else if (lang === "gu") {
        powerDays.push({ day: dayOf(n), planet: `${n} — ${esc(info.planet)}`, note: `${role} નો power day — ફક્ત check-in કે શરૂઆત પસંદ કરવાનો સંદર્ભ; આ લો શુ અભ્યાસ-લક્ષ્ય બદલતો નથી.`, charity: info.charity, fast: info.fast });
      } else {
        powerDays.push({ day: DAY_OF[n], planet: `${n} — ${esc(info.planet)}`, note: `Your ${role} power day — a check-in or start-day reference only; it never changes the Lo Shu practice target.`, charity: info.charity, fast: info.fast });
      }
    };
    appendPowerDay(p.driver, lang === "hi" ? "मूलांक" : lang === "gu" ? "મૂલાંક" : "Driver");
    if (p.conductor !== p.driver) appendPowerDay(p.conductor, lang === "hi" ? "भाग्यांक" : lang === "gu" ? "ભાગ્યાંક" : "Conductor");

    const repeatedChannel = targets.repeated.length
      ? (loc((db.excessEnergy && db.excessEnergy[targets.repeated[0]] || {}).channel, lang) || db.numbers[targets.repeated[0]].lifestyle)
      : "";
    const phases = [];
    if (lang === "hi") {
      const firstRows = [`ऊपर दी गई <strong>दैनिक मुख्य साधना</strong> शुरू करें — एक ही समय और स्थान पर, प्रतिदिन। यह योजना केवल आपके ${esc(targetDescriptor)} से चुनी गई है।`];
      if (targetSignal === "repeated") firstRows.push(`ऊर्जा को बढ़ाने के बजाय दिशा दें: ${esc(repeatedChannel)}।`);
      phases.push({ badge: "दिन १–७", title: "आधार — संकेत को देखें", rows: firstRows });
      phases.push({ badge: "दिन ८–२१", title: "लय — आदत को स्थिर करें", rows: [`${esc(target.lifestyle.split(";")[0])} को हर दिन दर्ज करें और नीचे के <strong>४०-दिवसीय ट्रैकर</strong> में निशान लगाएं।`, `किसी भी अनुपस्थित अंक को अतिरिक्त सूची से न चुनें — पहले अंक ${targetN} की निरंतरता बनाएं।`] });
      const thirdRows = secondary ? [`दूसरा लो शू संकेत जोड़ें: <strong>${esc(secondary.planet)} (${secondaryN})</strong> के लिए <span class="mantra">${esc(db.mantraShort[secondaryN].dev)}</span> ११ बार और ${esc(secondary.color.split(",")[0])} रंग शामिल करें।`] : [`साधना को गहरा करें: सूर्योदय मंत्र जाप बढ़ाकर <strong>१०८ बार</strong> करें और अपने अनुभव लिखें।`];
      if (targets.repeated.length && targetSignal !== "repeated") thirdRows.push(`दोहराए अंक ${targets.repeated.join(", ")} को और बढ़ाने के बजाय उनकी ऊर्जा को काम, सेवा या अनुशासन में दिशा दें।`);
      phases.push({ badge: "दिन २२–४०", title: "समन्वय — लो शू संकेत", rows: thirdRows });
      phases.push({ badge: "दिन ४०+", title: "अवलोकन एवं निरंतरता", rows: [`<strong>४०वें दिन</strong> ट्रैकर और जर्नल में देखें कि ${esc(targetDescriptor)} के साथ क्या बदला।`, `केवल लो शू के अनुपस्थित/दोहराए संकेत के अनुसार हल्का अभ्यास जारी रखें। तिथियों, जीवन-घटना विंडो और सक्रिय वास्तु क्षेत्र के लिए <strong>Timeline · Vedic Dasha</strong> देखें।`] });
    } else if (lang === "gu") {
      const firstRows = [`ઉપરની <strong>દૈનિક મુખ્ય સાધના</strong> શરૂ કરો — રોજ એક જ સમયે અને એક જ સ્થળે. આ યોજના ફક્ત તમારા ${esc(targetDescriptor)} પરથી પસંદ કરાઈ છે.`];
      if (targetSignal === "repeated") firstRows.push(`ઊર્જાને વધારવાને બદલે દિશા આપો: ${esc(repeatedChannel)}.`);
      phases.push({ badge: "દિવસ ૧–૭", title: "પાયો — સંકેત જુઓ", rows: firstRows });
      phases.push({ badge: "દિવસ ૮–૨૧", title: "લય — ટેવ સ્થિર કરો", rows: [`${esc(target.lifestyle.split(";")[0])} ને રોજ નોંધો અને નીચેના <strong>૪૦-દિવસીય ટ્રેકર</strong> માં નિશાની કરો.`, `કોઈ ખૂટતો અંક વધારાની યાદીમાંથી ન પસંદ કરો — પહેલાં અંક ${targetN} ની સાતત્ય બનાવો.`] });
      const thirdRows = secondary ? [`બીજો લો શુ સંકેત ઉમેરો: <strong>${esc(secondary.planet)} (${secondaryN})</strong> માટે <span class="mantra">${esc(db.mantraShort[secondaryN].dev)}</span> ૧૧ વખત અને ${esc(secondary.color.split(",")[0])} રંગ સામેલ કરો.`] : [`અભ્યાસ ઊંડો કરો: સૂર્યોદય મંત્ર જાપ <strong>૧૦૮ વખત</strong> કરો અને અનુભવ લખો.`];
      if (targets.repeated.length && targetSignal !== "repeated") thirdRows.push(`પુનરાવર્તિત અંક ${targets.repeated.join(", ")} ને વધુ વધારવાને બદલે તેની ઊર્જાને કામ, સેવા કે શિસ્તમાં દિશા આપો.`);
      phases.push({ badge: "દિવસ ૨૨–૪૦", title: "સમન્વય — લો શુ સંકેત", rows: thirdRows });
      phases.push({ badge: "દિવસ ૪૦+", title: "અવલોકન અને સાતત્ય", rows: [`<strong>૪૦મા દિવસે</strong> ટ્રેકર અને જર્નલમાં જુઓ કે ${esc(targetDescriptor)} સાથે શું બદલાયું.`, `ફક્ત લો શુના ખૂટતા/પુનરાવર્તિત સંકેત મુજબ હળવો અભ્યાસ ચાલુ રાખો. તારીખો, જીવન-ઘટના વિન્ડો અને સક્રિય વાસ્તુ ક્ષેત્ર માટે <strong>સમયરેખા · વૈદિક દશા</strong> જુઓ.`] });
    } else {
      const firstRows = [`Begin the <strong>daily core ritual</strong> above at the same time and place each day. This plan is selected only from your ${esc(targetDescriptor)}.`];
      if (targetSignal === "repeated") firstRows.push(`Give the surplus direction rather than more fuel: ${esc(repeatedChannel)}.`);
      phases.push({ badge: "Days 1–7", title: "Foundation — notice the signal", rows: firstRows });
      phases.push({ badge: "Days 8–21", title: "Rhythm — stabilize the habit", rows: [`Log <strong>${esc(target.lifestyle.split(";")[0])}</strong> each day and mark the <strong>40-Day Tracker</strong> below.`, `Do not add a new missing-number target yet — first build consistency with number ${targetN}.`] });
      const thirdRows = secondary ? [`Add a second Lo Shu signal: use <strong>${esc(secondary.planet)} (${secondaryN})</strong>'s short mantra <span class="mantra">${esc(db.mantraShort[secondaryN].dev)}</span> ×11 and its ${esc(secondary.color.split(",")[0].toLowerCase())} colour.`] : [`Deepen the practice: raise the sunrise mantra to <strong>108 times</strong> and write down what you notice.`];
      if (targets.repeated.length && targetSignal !== "repeated") thirdRows.push(`Channel repeated number${targets.repeated.length > 1 ? "s" : ""} ${targets.repeated.join(", ")} through work, service or disciplined craft rather than adding more fuel.`);
      phases.push({ badge: "Days 22–40", title: "Integrate — Lo Shu signals", rows: thirdRows });
      phases.push({ badge: "Day 40+", title: "Review & reset", rows: [`On <strong>Day 40</strong>, use your tracker and journal to review what changed around this ${esc(targetDescriptor)}.`, `Continue only the light practice your Lo Shu missing/repeated signals call for. For dates, life-event windows and the active Vastu zone, open <strong>Timeline · Vedic Dasha</strong>.`] });
    }

    return { targetN, target: { ...target, short: targetShort }, missingFocus: targets.missing, repeatedFocus: targets.repeated, daily, powerDays, phases };
  }

  function saveSnapshot(input, profile, timing) {
    const snapshot = {
      id: `${profileKeyOf(input)}|${Date.now()}`,
      key: profileKeyOf(input),
      name: input.name,
      dob: input.dob,
      savedAt: isoDate(),
      packVersion: activePack().packVersion,
      driver: profile.driver,
      conductor: profile.conductor,
      loShuMissing: profile.loShuMissing,
      goals: profile.goals,
      luckyYears: timing.luckyYears.map((y) => y.yr),
      input: Object.assign({}, input)
    };
    state.activeProfileKey = snapshot.key;
    const history = state.history.filter((item) => item.key !== snapshot.key);
    history.unshift(snapshot);
    state.history = history.slice(0, 15);
    writeStore(STORAGE_KEYS.history, state.history);
    updateMemoryUI();
  }

  function readPlanStore() { return readStore(STORAGE_KEYS.plan, {}); }
  function writePlanStore(store) { return writeStore(STORAGE_KEYS.plan, store); }
  function readPlan(profileKey) {
    const store = readPlanStore();
    const cur = store[profileKey] || { startedAt: null, days: [] };
    return { startedAt: cur.startedAt || null, days: Array.isArray(cur.days) ? cur.days : [] };
  }
  function writePlan(profileKey, plan) {
    const store = readPlanStore();
    store[profileKey] = { startedAt: plan.startedAt || null, days: plan.days || [] };
    writePlanStore(store);
  }

  function readPracticeStore() { return readStore(STORAGE_KEYS.practice, {}); }
  function writePracticeStore(store) { return writeStore(STORAGE_KEYS.practice, store); }
  function readJournalStore() { return readStore(STORAGE_KEYS.journal, {}); }
  function writeJournalStore(store) { return writeStore(STORAGE_KEYS.journal, store); }

  function logPractice(profileKey, number) {
    const store = readPracticeStore();
    const list = store[profileKey] || [];
    list.unshift({ number, at: isoDate() });
    store[profileKey] = list.slice(0, 100);
    writePracticeStore(store);
  }
  function addJournalEntry(profileKey, text) {
    const store = readJournalStore();
    const list = store[profileKey] || [];
    list.unshift({ text, at: isoDate() });
    store[profileKey] = list.slice(0, 50);
    writeJournalStore(store);
  }

  function contributionPayload(profile, timing) {
    return {
      schemaVersion: 1,
      packVersion: activePack().packVersion,
      createdAt: isoDate(),
      driver: profile.driver,
      conductor: profile.conductor,
      loShuMissingCount: profile.loShuMissing.length,
      loShuRepeatedCount: profile.loShuRepeated.length,
      goals: profile.goals,
      luckyYearActive: timing.luckyYears.some((item) => item.yr === new Date().getFullYear()),
      kua: profile.kua,
      vedicTier: profile.vedicTier
    };
  }

  function queueAnonymousContribution(profile, timing) {
    if (!state.contributionEnabled) return null;
    const payload = contributionPayload(profile, timing);
    const outbox = readStore(STORAGE_KEYS.contributionOutbox, []);
    outbox.unshift(payload);
    writeStore(STORAGE_KEYS.contributionOutbox, outbox.slice(0, 25));
    return payload;
  }

  function evolvingChartData(profile, timing) {
    const key = state.activeProfileKey || profileKeyOf(profile);
    const practices = (readPracticeStore()[key] || []);
    const journal = (readJournalStore()[key] || []);
    const snapshots = state.history.filter((s) => s.key === key);
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const movesThisYear = journal.filter((j) => String(j.at || "").startsWith(String(now.getFullYear()))).length;

    const focusNumbers = Array.from(new Set([profile.driver, profile.conductor, ...profile.loShuMissing])).slice(0, 4);
    const practiceSummary = focusNumbers.map((n) => {
      const allForNum = practices.filter((p) => p.number === n);
      const thisMonth = allForNum.filter((p) => String(p.at || "").startsWith(curMonth)).length;
      return { n, total: allForNum.length, month: thisMonth };
    });

    const currentYearLucky = timing.luckyYears.some((entry) => entry.yr === now.getFullYear());
    const previewPayload = contributionPayload(profile, timing);

    return { snapshots, movesThisYear, currentYearLucky, practiceSummary, journal, previewPayload };
  }

  function zodiacHarmonyNote(p, z) {
    const db = getActiveDB();
    const ruler = z.ruler;
    const planet = db.numbers[ruler] ? db.numbers[ruler].planet : String(ruler);
    const aligns = p.driver === ruler || p.conductor === ruler;
    const lang = getLang();
    const statement = lang === "hi"
      ? `${aligns ? `आपकी सूर्य-राशि का स्वामी ${esc(planet)} आपके ${p.driver === ruler ? "मूलांक" : "भाग्यांक"} से भी जुड़ता है।` : `आपकी सूर्य-राशि का स्वामी ${esc(planet)} (अंक ${ruler}) एक अलग राशिगत संदर्भ देता है।`} यह राशिगत परत लो शू remedy checklist, इष्ट देवता, आयुर्वेदिक baseline, power days या दशा-वास्तु समय को नहीं बदलती।`
      : lang === "gu"
        ? `${aligns ? `તમારા સૂર્ય-રાશિના સ્વામી ${esc(planet)} તમારા ${p.driver === ruler ? "મૂલાંક" : "ભાગ્યાંક"} સાથે પણ જોડાય છે.` : `તમારા સૂર્ય-રાશિના સ્વામી ${esc(planet)} (અંક ${ruler}) અલગ રાશિ-સંદર્ભ આપે છે.`} આ રાશિ-સ્તર લો શુ remedy checklist, ઇષ્ટ દેવતા, આયુર્વેદિક baseline, power days અથવા દશા-વાસ્તુ સમયને બદલતું નથી.`
        : `${aligns ? `Your Sun-sign ruler, ${esc(planet)}, also aligns with your ${p.driver === ruler ? "Driver" : "Conductor"}.` : `Your Sun-sign ruler, ${esc(planet)} (number ${ruler}), provides a separate zodiac reference.`} This zodiac layer does not alter the Lo Shu remedy checklist, guardian deities, Ayurvedic baseline, power days or Dasha/Vastu timing.`;
    return `<div class="harmony-note judge-note"><strong>${lang === "hi" ? "राशि का स्थान:" : lang === "gu" ? "રાશિનું સ્થાન:" : "Where the zodiac layer fits:"}</strong> ${statement}</div>`;
  }

  function fmtAy(deg) {
    if (deg == null) return "24°00′";
    const d = Math.floor(deg);
    const m = Math.round((deg - d) * 60);
    return `${d}°${String(m).padStart(2, "0")}′`;
  }
  function fmtTz(tz) {
    const sign = tz < 0 ? "-" : "+";
    const abs = Math.abs(tz);
    return `UTC${sign}${Math.floor(abs)}:${String(Math.round((abs % 1) * 60)).padStart(2, "0")}`;
  }
  function astroCell(cls, glyph, label, degLine, sub, ref) {
    return `<div class="astro-cell ${cls}">
      <div class="astro-glyph">${glyph}</div>
      <div class="astro-name">${label}</div>
      <div class="astro-deg">${degLine}</div>
      <div class="astro-sub">${sub}</div>
      <div class="astro-ref">${ref}</div>
    </div>`;
  }

  function vedicSnapshotCard(p) {
    const a = p.astro;
    if (!a || !a.ok) return "";
    const boundaryNote = a.boundary
      ? `<p class="astro-note astro-boundary">Your Sun sits on the <strong>${esc(a.daySpan[0])} / ${esc(a.daySpan[1])}</strong> boundary on your birth date — the exact hour can tip the final sign. Add your birth time to pin it precisely.</p>`
      : "";
    if (a.tier === "full") {
      const pl = a.place, nak = a.moon.nakshatra;
      const placeLine = pl.fromCoords
        ? `${esc(pl.displayName)}`
        : `${esc(pl.name)}${pl.state ? ", " + esc(pl.state) : ""}, ${esc(pl.country)}`;
      const caveat = pl.dst
        ? ` · standard-time offset (${fmtTz(pl.tz)}) — if daylight saving applied on the birth date, shift the time accordingly`
        : ` · ${fmtTz(pl.tz)}`;
      return `<div class="card astro-snapshot-card" id="vedic-snapshot">
      <div class="goal-head">
        <div class="card-title">🪐 Astro-Identity Snapshot — your Vedic sky at birth</div>
        <span class="badge info">Computed on this device · ${esc(a.engine)}</span>
      </div>
      <div class="astro-grid">
        ${astroCell("astro-sun", esc(a.sun.glyph), "Sun · Surya Rashi", `${esc(a.sun.sign)} ${esc(a.sun.degStr)}`, `${esc(a.sun.element)} · ruled by ${esc(a.sun.lord)}`, `Western tropical reference: ${esc(a.sun.tropicalGlyph)} ${esc(a.sun.tropicalSign)} ${esc(a.sun.tropicalDegStr)}`)}
        ${astroCell("astro-moon", esc(a.moon.glyph), "Moon · Chandra Rashi", `${esc(a.moon.sign)} ${esc(a.moon.degStr)}`, `${esc(a.moon.element)} · ruled by ${esc(a.moon.lord)}`, `<span class="astro-nak-badge">${esc(nak.glyph)} ${esc(nak.name)} · Pada ${nak.pada} · lord ${esc(nak.lord)}</span>`)}
        ${astroCell("astro-lagna", esc(a.lagna.glyph), "Lagna (Ascendant)", `${esc(a.lagna.sign)} ${esc(a.lagna.degStr)}`, `${esc(a.lagna.element)} · ruled by ${esc(a.lagna.lord)}`, "The sign rising on the eastern horizon at your birth minute")}
        ${astroCell("astro-mc", esc(a.mc.glyph), "Midheaven (MC)", `${esc(a.mc.sign)} ${esc(a.mc.degStr)}`, `${esc(a.mc.element)} · ruled by ${esc(a.mc.lord)}`, "Highest point of the ecliptic — career &amp; public life")}
      </div>
      <div class="astro-nak-strip">
        <div class="astro-nak-head">Nakshatra of the Moon — <strong>${esc(nak.name)}</strong> ${esc(nak.glyph)} · <strong>Pada ${nak.pada} of 4</strong> · ${esc(nak.spanStr)} of the sidereal zodiac</div>
        <div class="astro-nak-body">Vimshottari lord <strong>${esc(nak.lord)}</strong> · Deity <strong>${esc(nak.deity)}</strong> — ${esc(nak.trait)}.</div>
      </div>
      <div class="astro-foot">
        Lahiri (Chitrapaksha) ayanamsa <strong>${fmtAy(a.ayanamsa)}</strong> · Birth moment <strong>${esc(a.moment.localIso)}</strong> local, ${placeLine} (${esc(pl.lat.toFixed(2))}°N, ${esc(Math.abs(pl.lon).toFixed(2))}°${pl.lon >= 0 ? "E" : "W"})${caveat} · Positions are sidereal (Nirayana). Everything is computed locally in your browser — nothing is sent anywhere.
      </div>
    </div>`;
    }

    const need = [];
    if (!p.birthTime) need.push("<strong>exact birth time</strong>");
    if (!p.birthPlace) need.push("<strong>birth city / place</strong>");
    let unlockText;
    if (a.placeUnmatched) {
      unlockText = `We couldn't match <strong>“${esc(p.birthPlace)}”</strong> to the built-in atlas (${(window.NVAstro && window.NVAstro.cityNames().length) || 630}+ cities, fully offline). Try “City, State” — e.g. <strong>Faridabad, India</strong> — or enter coordinates like <strong>“28.41, 77.32”</strong> (add a third number to override the time zone, e.g. “40.71, -74.01, -5”).`;
    } else if (need.length === 1) {
      unlockText = `Almost unlocked — add your ${need[0]} (Edit Details → Vedic Precision) to reveal your <strong>Moon Sign (Chandra Rashi)</strong>, <strong>Nakshatra</strong> with its pada, <strong>Lagna</strong> and <strong>Midheaven</strong>, computed instantly on this device.`;
    } else {
      unlockText = `Add your <strong>exact birth time</strong> and <strong>birth city / place</strong> (Edit Details → Vedic Precision) to unlock your <strong>Moon Sign (Chandra Rashi)</strong>, <strong>Nakshatra</strong> with its pada, <strong>Lagna</strong> and <strong>Midheaven</strong> — computed instantly on your device, never sent anywhere.`;
    }
    return `<div class="card astro-snapshot-card astro-snapshot-reduced" id="vedic-snapshot">
      <div class="goal-head">
        <div class="card-title">🪐 Astro-Identity Snapshot — your Vedic Sun</div>
        <span class="badge info">Tier 1 · from your date of birth</span>
      </div>
      <div class="astro-grid">
        ${astroCell("astro-sun", esc(a.sun.glyph), "Sun · Surya Rashi", `${esc(a.sun.sign)} ${esc(a.sun.degStr)}`, `${esc(a.sun.element)} · ruled by ${esc(a.sun.lord)}`, `Western tropical reference: ${esc(a.sun.tropicalGlyph)} ${esc(a.sun.tropicalSign)} ${esc(a.sun.tropicalDegStr)}`)}
        <div class="astro-unlock">
          <div class="astro-unlock-title">🔓 Unlock the full snapshot</div>
          <p>${unlockText}</p>
          ${boundaryNote}
        </div>
      </div>
      <div class="astro-foot">
        Lahiri (Chitrapaksha) ayanamsa <strong>${fmtAy(a.ayanamsa)}</strong> · Sun position computed for your birth date (sidereal / Nirayana) · ${esc(a.engine)} · Everything runs locally in your browser — nothing is sent anywhere.
      </div>
    </div>`;
  }

  function vedicTierDisclosure(p) {
    let stateLine, badge;
    if (p.vedicTier === 2) {
      const full = p.astro && p.astro.tier === "full";
      badge = full ? "Tier 2 · Unlocked" : "Tier 2 · Add a recognised birthplace";
      stateLine = full
        ? `Your birth time (<strong>${esc(p.birthTimeDisplay)}</strong>) and birthplace (<strong>${esc(p.birthPlace)}</strong>) unlock the full snapshot above — Moon Sign (Chandra Rashi), Nakshatra, Lagna and Midheaven are computed on this device and never leave your browser.`
        : `Your birth time (<strong>${esc(p.birthTimeDisplay)}</strong>) and birthplace (<strong>${esc(p.birthPlace)}</strong>) are saved — enter your place as “City, State” (e.g. Faridabad, India) or coordinates (“28.41, 77.32”) to complete the snapshot.`;
    } else if (p.vedicTier === "partial") {
      badge = "Tier 2 · Almost unlocked";
      stateLine = `Almost there — add the missing <strong>${p.birthTime && !p.birthPlace ? "birth city / place" : "exact birth time"}</strong> (Edit Details) to complete your Astro-Identity Snapshot.`;
    } else {
      badge = "Tier 2 · Unlock now";
      stateLine = "Add your <strong>exact birth time</strong> and <strong>birth city / place</strong> (Edit Details) to unlock Moon Sign (Chandra Rashi), Nakshatra, Lagna and Midheaven — computed on this device, never sent anywhere.";
    }
    return `<div class="card vedic-tier-card">
      <div class="card-title">Deepen your Vedic chart — progressive precision</div>
      <div class="tier-list">
        <div class="tier tier-ready">
          <span class="tier-badge tier-badge-ready">Tier 1 · Ready now</span>
          <div class="tier-body">
            <strong>Vedic Sun Sign (Surya Rashi)</strong> — sidereal / Nirayana, Lahiri ayanamsa (~24° behind the Western tropical zodiac). Computed instantly from your date of birth; this is the layer this report uses today.
          </div>
        </div>
        <div class="tier ${p.vedicTier === 2 ? "tier-ready" : "tier-upcoming"}">
          <span class="tier-badge ${p.vedicTier === 2 ? "tier-badge-ready" : "tier-badge-upcoming"}">${badge}</span>
          <div class="tier-body">
            <strong>Moon Sign (Chandra Rashi) · Nakshatra · Lagna · Midheaven</strong> — ${stateLine}
          </div>
        </div>
      </div>
    </div>`;
  }

  /* Shared spelling table (used by both correction-required and optional-enhancement rows). */
  function spellingTableHtml(rows) {
    const lang = getLang();
    if (!rows || !rows.length) return "";
    return `<div class="table-scroll"><table class="rtable">
      <tr><th>${lang === "hi" ? "सुझाई गई स्पेलिंग" : lang === "gu" ? "સૂચવેલી સ્પેલિંગ" : "Suggested spelling"}</th><th>${lang === "hi" ? "बदलाव" : lang === "gu" ? "ફેરફાર" : "Change"}</th><th>${lang === "hi" ? "नया कुल योग" : lang === "gu" ? "નવો સરવાળો" : "New total"}</th><th>${lang === "hi" ? "नया अंक" : lang === "gu" ? "નવો અંક" : "New number"}</th><th>${lang === "hi" ? "यह कैसे मदद करता है" : lang === "gu" ? "આ કેવી રીતે મદદ કરે છે" : "Why it helps"}</th></tr>
      ${rows.map((v) => `<tr><td><strong>${esc(v.text)}</strong></td><td>${esc(v.change)}</td><td>${v.compound}</td><td>${v.reduced}</td><td>${esc(v.why)}</td></tr>`).join("")}
    </table></div>`;
  }

  /* Excess-energy channeling card — numbers repeated 3+ times get a full,
     prescriptive "overshoot / channel it" card instead of one generic line. */
  function renderExcessEnergyCard(p) {
    const db = getActiveDB();
    const lang = getLang();
    const rows = p.loShuRepeated.map((n) => {
      const entry = (db.excessEnergy && db.excessEnergy[n]) || {};
      const overshoot = loc(entry.overshoot, lang);
      const channel = loc(entry.channel, lang);
      const count = p.loShuCounts[n] || 0;
      return `<div class="kit-row"><div class="kit-ico"><strong>${n}</strong></div><div class="kit-body">
        <div class="kit-label">${esc(db.numbers[n].planet)} — ${lang === "hi" ? `${count}× दोहराया` : lang === "gu" ? `${count}× પુનરાવર્તિત` : `repeated ${count}×`}</div>
        <div class="kit-value"><strong>${lang === "hi" ? "जब यह बढ़ता है:" : lang === "gu" ? "જ્યારે તે વધુ થાય:" : "When it overshoots:"}</strong> ${esc(overshoot)}</div>
        <div class="kit-value"><strong>${lang === "hi" ? "इसे दिशा दें:" : lang === "gu" ? "તેને દિશા આપો:" : "Channel it:"}</strong> ${esc(channel)}</div>
      </div></div>`;
    }).join("");
    const guidance = lang === "hi"
      ? "यह लो शू का repeated-number signal है: प्रतिभा को दिशा दें, अधिक ईंधन नहीं। उसी अंक को बढ़ाने वाले नाम, मोबाइल या वाहन कुल से बचें और ऊपर की आदतों में ऊर्जा लगाएं।"
      : lang === "gu"
        ? "આ લો શુનો repeated-number signal છે: પ્રતિભાને દિશા આપો, વધુ બળતણ નહીં. એ જ અંક વધારતા નામ, મોબાઇલ અથવા વાહન ટોટલ ટાળો અને ઊર્જા ઉપરની આદતોમાં લગાવો."
        : "This is a Lo Shu repeated-number signal: give the talent direction, not more fuel. Avoid name, mobile or vehicle totals that pile onto the same number; put the surplus into the habits above.";
    return `<div class="card" data-remedy-authority="lo-shu"><div class="card-title">${lang === "hi" ? "अधिक ऊर्जा — सही दिशा में" : lang === "gu" ? "વધુ ઊર્જા — યોગ્ય દિશામાં" : "Excess Energy — Channel It"}</div><div class="kit">${rows}</div><div class="card-sub">${guidance}</div></div>`;
  }

  /* Karmic Debt card — scans the three classical unreduced totals
     (birth day, full birth-date sum, Chaldean name total) for 13/14/16/19.
     A clean slate is stated explicitly so users trust the check ran.
     Remedies route through the remedy kit of the debt's reduced root. */
  function karmicDebtCard(p) {
    const db = getActiveDB();
    const lang = getLang();
    const debts = p.karmicDebts || [];
    const srcLabel = (src) => src === "driver"
      ? (lang === "hi" ? "जन्म तिथि" : lang === "gu" ? "જન્મ તિથિ" : "Birth day")
      : src === "conductor"
        ? (lang === "hi" ? "पूर्ण जन्मतिथि का योग" : lang === "gu" ? "સંપૂર્ણ જન્મતારીખનો સરવાળો" : "Full birth-date total")
        : (lang === "hi" ? "नाम का चाल्डियन योग" : lang === "gu" ? "નામનો કાલ્ડિયન સરવાળો" : "Name Chaldean total");
    const rows = debts.map((kd) => {
      const e = (db.karmicDebt && db.karmicDebt[kd.n]) || {};
      const rootInfo = db.numbers[reduce(kd.n)] || {};
      return `<div class="kit-row">
        <div class="kit-ico bad-ico"><strong>${kd.n}</strong></div>
        <div class="kit-body">
          <div class="kit-label">${esc(srcLabel(kd.source))} — ${esc(loc(e.title, lang) || `Karmic Debt ${kd.n}`)}</div>
          <div class="kit-value"><strong>${lang === "hi" ? "दोहराती सीख:" : lang === "gu" ? "વારંવાર આવતી સીખ:" : "Repeating lesson:"}</strong> ${esc(loc(e.lesson, lang))}</div>
          <div class="kit-value"><strong>${lang === "hi" ? "निवारण:" : lang === "gu" ? "નિવારણ:" : "Settling remedy:"}</strong> ${esc(loc(e.remedy, lang))}</div>
          <div class="card-sub">${lang === "hi" ? `यह अंक ${kd.n} → ${reduce(kd.n)} में सिमटता है — पूर्ण सहायता के लिए ${esc(rootInfo.planet || "")} उपाय-किट भी अपनाएं।` : lang === "gu" ? `આ અંક ${kd.n} → ${reduce(kd.n)} માં સંયોજાય છે — સંપૂર્ણ સહાય માટે ${esc(rootInfo.planet || "")} ઉપાય-કિટ પણ અપનાવો.` : `This debt reduces to ${kd.n} → ${reduce(kd.n)} — pair it with the ${esc(rootInfo.planet || "")} remedy kit for full support.`}</div>
        </div>
      </div>`;
    }).join("");
    const clean = lang === "hi"
      ? "जन्म तिथि, पूर्ण जन्मतिथि के योग और नाम के चाल्डियन योग में कर्मऋण अंक (13, 14, 16, 19) में से कोई नहीं है — जन्म-पट्टिका का कर्म पट्ट साफ है।"
      : lang === "gu"
        ? "જન્મ તિથિ, સંપૂર્ણ જન્મતારીખના સરવાળા અને નામના કાલ્ડિયન સરવાળામાં કર્મઋણ અંકો (13, 14, 16, 19) પૈકી કોઈ નથી — જન્મ-પત્રિકાનો કર્મ હિસાબ સ્વચ્છ છે."
        : "None of the karmic debt numbers (13, 14, 16, 19) appear in your birth day, full birth-date total or name total — a clean karmic slate.";
    const judgeNote = lang === "hi"
      ? "कर्मऋण हमेशा <strong>सीमांत (गैर-संक्षिप्त) योग</strong> पर जांचा जाता है — जन्म तिथि जैसी है, पूरी जन्मतिथि के अंकों का कुल योग, और नाम का पूरा चाल्डियन योग। केवल अंतिम अंक (मूलांक/भाग्यांक/नामांक) देखने से ये सीख छूट जाती हैं।"
      : lang === "gu"
        ? "કર્મઋણ હંમેશાં <strong>અઘટિત (બિન-ઘટાડેલા) સરવાળા</strong> પર તપાસાય છે — જન્મ તિથિ જેમ છે તેમ, સંપૂર્ણ જન્મતારીખના અંકોનો કુલ સરવાળો, અને નામનો સંપૂર્ણ કાલ્ડિયન સરવાળો. ફક્ત અંતિમ અંક (મૂળાંક/ભાગ્યાંક/નામાંક) જોવાથી આ સીખ છૂટી જાય છે."
        : "Karmic debt is always checked at the <strong>unreduced subtotal</strong> — the birth day as it falls, the digit sum of the entire birth date, and the full Chaldean name total. Reading only the final Driver/Conductor/Name digit would miss these lessons.";
    return `<div class="card" id="karmic-debt-card">
      <div class="goal-head">
        <div class="card-title">${t("karmicDebtTitle", "Karmic Debt Check — 13 · 14 · 16 · 19")}</div>
        <span class="badge ${debts.length ? "warn" : "good"}">${debts.length ? (lang === "hi" ? `${debts.length} मिले` : lang === "gu" ? `${debts.length} મળ્યા` : `${debts.length} found`) : (lang === "hi" ? "कोई कर्मऋण नहीं" : lang === "gu" ? "કોઈ કર્મઋણ નહીં" : "Clean slate")}</span>
      </div>
      ${debts.length ? `<div class="kit">${rows}</div>` : `<div class="kit-value">${clean}</div>`}
      <div class="judge-note"><strong>${t("howWeJudge", "How we judge this:")}</strong> ${judgeNote}</div>
    </div>`;
  }

  /* Ayurvedic dosha card — a Driver/Conductor-only constitution baseline.
     Lo Shu and advanced Vedic grid signals do not modify this layer. */
  function doshaCard(p) {
    const db = getActiveDB();
    const lang = getLang();
    const d = p.doshaProfile || {};
    const labels = lang === "hi" ? { pitta: "पित्त", vata: "वात", kapha: "कफ" }
      : lang === "gu" ? { pitta: "પિત્ત", vata: "વાત", kapha: "કફ" }
        : { pitta: "Pitta", vata: "Vata", kapha: "Kapha" };
    const doshaName = (value) => String(value || "").split(/[\s\u2013\-/,]+/).map((word) => labels[word.toLowerCase()] || word).filter(Boolean).join("–");
    const row = (n, entry, role) => `<div class="kit-row"><div class="kit-ico"><strong>${n}</strong></div><div class="kit-body"><div class="kit-label">${esc(db.numbers[n].planet)} · ${esc(role)} → ${doshaName(entry.dominant)}</div><div class="kit-value">${esc(loc(entry.nature, lang))}</div><div class="card-sub">${lang === "hi" ? "संतुलन:" : lang === "gu" ? "સંતુલન:" : "Balance:"} ${esc(loc(entry.routine, lang))}</div></div></div>`;
    const blend = ["pitta", "vata", "kapha"].map((key) => `${labels[key]} ${d.counts && d.counts[key] || 0}`).join(" · ");
    const foods = [loc(d.driverDosha && d.driverDosha.balancingFoods, lang), loc(d.conductorDosha && d.conductorDosha.balancingFoods, lang)].filter(Boolean).join(" ");
    return `<div class="card" id="dosha-card" data-authority="driver-conductor"><div class="goal-head"><div class="card-title">${lang === "hi" ? "आयुर्वेदिक दोष स्तर — आपकी प्रकृति" : lang === "gu" ? "આયુર્વેદિક દોષ સ્તર — તમારી પ્રકૃતિ" : "Ayurvedic Dosha Layer — Your Constitution"}</div><span class="badge warn">${doshaName(d.primary) || (lang === "hi" ? "संतुलित" : lang === "gu" ? "સંતુલિત" : "Balanced")}</span></div>
      <div class="card-sub">${lang === "hi" ? "यह baseline केवल मूलांक और भाग्यांक से आता है — लो शू या वैदिक-grid की missing/repeated cells इसे नहीं बदलतीं।" : lang === "gu" ? "આ baseline ફક્ત મૂળાંક અને ભાગ્યાંકથી આવે છે — લો શુ અથવા વૈદિક-grid ની missing/repeated cells તેને બદલતી નથી." : "This baseline comes only from your Driver and Conductor — Lo Shu or Vedic-grid missing/repeated cells do not change it."}</div>
      <div class="kit">${row(d.driverNumber, d.driverDosha || {}, lang === "hi" ? "मूलांक" : lang === "gu" ? "મૂલાંક" : "Driver")}${row(d.conductorNumber, d.conductorDosha || {}, lang === "hi" ? "भाग्यांक" : lang === "gu" ? "ભાગ્યાંક" : "Conductor")}</div>
      <div class="kit"><div class="kit-label">${lang === "hi" ? "मिश्रित प्रकृति" : lang === "gu" ? "મિશ્ર પ્રકૃતિ" : "Blended constitution"}</div><div class="kit-value"><strong>${doshaName(d.primary)}</strong> — ${blend}</div><div class="kit-value"><strong>${lang === "hi" ? "संतुलन-पोषण:" : lang === "gu" ? "સંતુલન-પોષણ:" : "Balancing foods:"}</strong> ${esc(foods)}</div></div>
      <div class="judge-note"><strong>${t("howWeJudge", "How we judge this:")}</strong> ${lang === "hi" ? "यह पारंपरिक wellness guidance है, निदान नहीं; चिकित्सा सलाह के लिए योग्य पेशेवर से बात करें।" : lang === "gu" ? "આ પરંપરાગત wellness guidance છે, નિદાન નથી; તબીબી સલાહ માટે લાયક વ્યાવસાયિક સાથે વાત કરો." : "This is traditional wellness guidance, not a diagnosis; speak with a qualified professional for medical advice."}</div></div>`;
  }

  /* Deity Protection Layer — Ishta Devta card. Names the guardian deity
     (ishta devta) behind the Driver and Conductor numbers, with the
     classical mantra, the daily 11× chant, the 108× round, offerings and
     support materials. Framed as traditional spiritual guidance: the
     reader's own family tradition and guru's instruction take priority. */
  function deityCard(p) {
    const dp = p.deityProfile || {};
    const db = getActiveDB();
    const lang = getLang();
    const L = (obj) => obj ? obj[lang] || obj.en || "" : "";
    const guardians = [];
    if (dp.driverDeity) guardians.push({ n: dp.driverNumber, role: lang === "hi" ? "ड्राइवर / मूलांक" : lang === "gu" ? "ડ્રાઈવર / મૂળાંક" : "Driver / Moolank", deity: dp.driverDeity });
    if (dp.conductorDeity && !dp.sameDeity) guardians.push({ n: dp.conductorNumber, role: lang === "hi" ? "कंडक्टर / भाग्यांक" : lang === "gu" ? "કન્ડક્ટર / ભાગ્યાંક" : "Conductor / Bhagyank", deity: dp.conductorDeity });
    const rows = guardians.map((guard) => `<div class="kit-row"><div class="kit-ico"><strong>${guard.n}</strong></div><div class="kit-body"><div class="kit-label">${esc(guard.role)} · ${esc(db.numbers[guard.n].planet.split(" ")[0])}</div><div class="kit-value"><strong>${esc(L(guard.deity.god))}</strong> — <span class="mantra">${esc(guard.deity.mantra)}</span></div><div class="card-sub">${esc(L(guard.deity.primaryChant))} · ${esc(L(guard.deity.weeklyChant))}</div><div class="card-sub">${esc(L(guard.deity.offerings))}</div></div></div>`).join("");
    const badge = dp.sameDeity ? L(dp.driverDeity && dp.driverDeity.god) : guardians.map((g) => L(g.deity.god)).join(" · ");
    return `<div class="card" id="deity-card" data-authority="driver-conductor"><div class="goal-head"><div class="card-title">${lang === "hi" ? "देव-संरक्षण स्तर — आपका इष्ट देवता" : lang === "gu" ? "દેવ-સંરક્ષણ સ્તર — તમારો ઈષ્ટ દેવતા" : "Deity Protection Layer — Your Ishta Devta"}</div><span class="badge">${esc(badge)}</span></div><div class="card-sub">${lang === "hi" ? "रक्षक देव केवल आपके मूलांक और भाग्यांक से चुने जाते हैं। लो शू और उन्नत वैदिक तुलना इस चयन को नहीं बदलते।" : lang === "gu" ? "રક્ષક દેવ ફક્ત તમારા મૂળાંક અને ભાગ્યાંકથી પસંદ થાય છે. લો શુ અને ઉન્નત વૈદિક તુલના આ પસંદગી બદલતી નથી." : "Guardian deities are selected only from your Driver and Conductor. Lo Shu and the advanced Vedic comparison never change this selection."}</div><div class="kit">${rows}</div>${dp.sameDeity ? `<div class="kit-value">${lang === "hi" ? "एक ही इष्ट देव दोनों मुख्य अंकों का सहारा हैं।" : lang === "gu" ? "એક જ ઇષ્ટ દેવ બંને મુખ્ય અંકોનો સહારો છે." : "One ishta devta supports both of your key numbers."}</div>` : ""}<div class="judge-note"><strong>${t("howWeJudge", "How we judge this:")}</strong> ${lang === "hi" ? "यह पारंपरिक आध्यात्मिक मार्गदर्शन है; अपनी कुल-परंपरा और गुरु की शिक्षा को प्राथमिकता दें।" : lang === "gu" ? "આ પરંપરાગત આધ્યાત્મિક માર્ગદર્શન છે; તમારી કુળ-પરંપરા અને ગુરુની શિક્ષાને પ્રાથમિકતા આપો." : "This is traditional spiritual guidance; give priority to your family tradition and guru's instruction."}</div></div>`;
  }

  function gridConfigIsCanonical(layout, canonical) {
    return Array.isArray(layout) && layout.length === 3 &&
      layout.every((row) => Array.isArray(row) && row.length === 3) &&
      layout.flat().join(",") === canonical.flat().join(",");
  }

  function loShuGridConfig(db) {
    const configured = (db && db.loShuGrid) || {};
    const fallback = (window.DB && window.DB.loShuGrid) || {};
    const layout = gridConfigIsCanonical(configured.layout, LO_SHU_GRID_LAYOUT)
      ? configured.layout : LO_SHU_GRID_LAYOUT;
    const isPlaneSet = (planes) => Array.isArray(planes) && planes.length === LO_SHU_PLANE_CELLS.length &&
      planes.every((plane, i) => plane && Array.isArray(plane.cells) && plane.cells.join(",") === LO_SHU_PLANE_CELLS[i].join(","));
    const isArrowSet = (arrows) => Array.isArray(arrows) && arrows.length === LO_SHU_ARROW_LINES.length &&
      arrows.every((arrow, i) => arrow && Array.isArray(arrow.line) && arrow.line.join(",") === LO_SHU_ARROW_LINES[i].join(","));
    return {
      layout,
      planes: isPlaneSet(configured.planes) ? configured.planes : (isPlaneSet(fallback.planes) ? fallback.planes : []),
      arrows: isArrowSet(configured.arrows) ? configured.arrows : (isArrowSet(fallback.arrows) ? fallback.arrows : []),
      plotting: configured.plotting || fallback.plotting || {}
    };
  }

  function vedicGridConfig(db) {
    const configured = (db && db.vedicGrid) || {};
    const layout = gridConfigIsCanonical(configured.layout, VEDIC_GRID_LAYOUT)
      ? configured.layout : VEDIC_GRID_LAYOUT;
    const planes = Array.isArray(configured.planes) && configured.planes.length === DEFAULT_VEDIC_PLANES.length &&
      configured.planes.every((plane, i) => plane && plane.key === DEFAULT_VEDIC_PLANES[i].key &&
        Array.isArray(plane.cells) && plane.cells.join(",") === DEFAULT_VEDIC_PLANES[i].cells.join(","))
      ? configured.planes : DEFAULT_VEDIC_PLANES;
    return { layout, planes, filtering: configured.filtering || {} };
  }

  function gridCopy(lang) {
    const copies = {
      en: {
        present: "Present", repeated: "Repeated", missing: "Missing", weak: "Single occurrence",
        birth: "Birth Grid", name: "Name Grid", combined: "Combined Grid", source: "Source",
        plotted: "Plotted digits", treatment: "Treatment", day: "Birth day", month: "Birth month", year: "Birth year",
        driver: "Driver / Moolank", conductor: "Conductor / Bhagyank", complete: "Complete", partial: "Partial",
        needsSupport: "Needs conscious support", strengths: "Strengths", gaps: "Growth cues"
      },
      hi: {
        present: "उपस्थित", repeated: "दोहराया", missing: "अनुपस्थित", weak: "एक बार उपस्थित",
        birth: "जन्म ग्रिड", name: "नाम ग्रिड", combined: "संयुक्त ग्रिड", source: "स्रोत",
        plotted: "रखे गए अंक", treatment: "नियम", day: "जन्म दिन", month: "जन्म माह", year: "जन्म वर्ष",
        driver: "मूलांक", conductor: "भाग्यांक", complete: "पूर्ण", partial: "आंशिक",
        needsSupport: "सजग सहारा चाहिए", strengths: "शक्तियां", gaps: "विकास संकेत"
      },
      gu: {
        present: "હાજર", repeated: "પુનરાવર્તિત", missing: "ખૂટતો", weak: "એક વાર હાજર",
        birth: "જન્મ ગ્રિડ", name: "નામ ગ્રિડ", combined: "સંયુક્ત ગ્રિડ", source: "સ્ત્રોત",
        plotted: "મૂકેલા અંકો", treatment: "નિયમ", day: "જન્મ દિવસ", month: "જન્મ મહિનો", year: "જન્મ વર્ષ",
        driver: "મૂલાંક", conductor: "ભાગ્યાંક", complete: "સંપૂર્ણ", partial: "આંશિક",
        needsSupport: "સભાન સહારો જોઈએ", strengths: "શક્તિઓ", gaps: "વિકાસ સંકેતો"
      }
    };
    return copies[lang] || copies.en;
  }

  function renderLoShuGridCells(counts, label) {
    const db = getActiveDB();
    const copy = gridCopy(getLang());
    const layout = loShuGridConfig(db).layout;
    return layout.flat().map((n) => {
      const c = counts[n] || 0;
      const cls = c === 0 ? "missing" : c >= 3 ? "present multi" : "present";
      const digits = c ? Array(c).fill(n).map((x) => `<span>${x}</span>`).join("") : `<span>${n}</span>`;
      return `<div class="loshu-cell ${cls}" data-grid-engine="lo-shu" data-grid-number="${n}" data-missing-label="${esc(copy.missing)}" title="${esc(label || "Lo Shu")} · ${n}: ${c} occurrence${c === 1 ? "" : "s"}">
        <div class="digits">${digits}</div>
        ${c ? `<div class="cnt">${esc(db.numbers[n].planet.split(" ")[0])}</div>` : ""}
      </div>`;
    }).join("");
  }

  function renderLoShuGrid(p) {
    const db = getActiveDB();
    const lang = getLang();
    const copy = gridCopy(lang);
    const config = loShuGridConfig(db);
    const grid = p.loShuGrid || generateLoShuGrid(p.day, p.month, p.year);
    const numberList = (numbers) => numbers && numbers.length ? numbers.join(", ") : "—";
    const planeCards = config.planes.map((plane) => {
      const present = plane.cells.filter((n) => p.loShuCounts[n] > 0);
      const absent = plane.cells.filter((n) => p.loShuCounts[n] === 0);
      const chips = plane.cells.map((n) => `<span class="plane-chip ${p.loShuCounts[n] > 0 ? "on" : "off"}">${n}</span>`).join("");
      const missingRoles = absent.map((n) => {
        const role = plane.roles && plane.roles[n] ? plane.roles[n] : {};
        return `${n} — ${role.label || role.short || "support"}${role.fix ? `: ${role.fix}` : ""}`;
      });
      const complete = present.length === plane.cells.length;
      const reading = complete ? (plane.complete || "This Lo Shu line is fully represented.")
        : missingRoles.length ? missingRoles.join(" · ") : (plane.about || "");
      return `<article class="card plane-card loshu-plane-card">
        <div class="goal-head"><div class="card-title">${esc(plane.name || "Lo Shu Plane")}</div><span class="badge ${complete ? "good" : "warn"}">${complete ? copy.complete : copy.partial}</span></div>
        <div class="card-sub">${esc(plane.zone || "")} · ${plane.cells.join(" – ")}</div>
        <div class="plane-chips">${chips}</div>
        <div class="kit-value plane-about">${esc(plane.about || "")}</div>
        <div class="kit-value"><strong>${complete ? copy.strengths : copy.gaps}:</strong> ${esc(reading)}</div>
      </article>`;
    }).join("");
    const arrowCards = config.arrows.map((arrow) => {
      const formed = arrow.line.every((n) => p.loShuCounts[n] > 0);
      const state = formed ? copy.present : copy.missing;
      return `<article class="card arrow-card ${formed ? "arrow-formed" : "arrow-open"}">
        <div class="goal-head"><div class="card-title">${esc(arrow.name || "Lo Shu Arrow")}</div><span class="badge ${formed ? "good" : "warn"}">${state}</span></div>
        <div class="card-sub">${esc(arrow.axis || "")} · ${arrow.line.join(" – ")}</div>
        <div class="kit-value">${esc(formed ? arrow.present : arrow.missing)}</div>
      </article>`;
    }).join("");
    const severityByNumber = {};
    p.loShuMissingSeverity.forEach((entry) => { severityByNumber[entry.n] = entry; });
    const missingFixes = p.loShuMissing.map((n) => {
      const severity = severityByNumber[n];
      const badge = severity && severity.critical
        ? `<span class="badge bad">${t("critical", "Critical")}</span>`
        : severity && severity.echoedBy.length
          ? `<span class="badge warn">${esc(severity.echoedBy.join(" / "))}</span>` : "";
      return `<div class="kit-row"><div class="kit-ico bad-ico"><strong>${n}</strong></div><div class="kit-body">
        <div class="kit-label">${esc(db.numbers[n].planet)} — ${copy.missing} ${badge}</div>
        <div class="kit-value">${esc(db.missingFix[n] || "Build a steady, practical habit around this quality.")}</div>
      </div></div>`;
    }).join("");
    const formulaDigits = `${grid.raw.day}${grid.raw.month}${grid.raw.year}`.split("").join(" + ");
    const sourceRows = [
      [copy.day, numberList(grid.sourceDigits.day), "All non-zero day digits"],
      [copy.month, numberList(grid.sourceDigits.month), "All non-zero month digits"],
      [copy.year, numberList(grid.sourceDigits.year), "Full year, including century digits"],
      [copy.driver, String(p.driver), "Added after raw DOB digits"],
      [copy.conductor, String(p.conductor), "Added after raw DOB digits"]
    ].map(([source, digits, treatment]) => `<tr><td><strong>${esc(source)}</strong></td><td>${esc(digits)}</td><td>${esc(treatment)}</td></tr>`).join("");

    return `<section class="rsection" id="loshu-grid-section" data-remedy-authority="lo-shu">
      <h2 class="rsection-title"><span class="idx">${SECTION.grid}</span>${t("secLoShuGrid", "Lo Shu Blueprint — Your Foundation")}</h2>
      <div class="card loshu-grid-intro">
        <div class="card-title">${lang === "hi" ? "क्लासिक लो शू जन्म-पट्टिका" : lang === "gu" ? "ક્લાસિક લો શુ જન્મ-પટ્ટિકા" : "Classic Lo Shu Birth Blueprint"}</div>
        <div class="kit-value">${lang === "hi" ? "यह आपका प्राथमिक Foundation grid है: ४–९–२ / ३–५–७ / ८–१–६। जन्म, नाम और संयुक्त ग्रिड के संकेत यहां व्यक्तित्व, आदतों और ४०-दिवसीय अभ्यास को चलाते हैं।" : lang === "gu" ? "આ તમારું મુખ્ય Foundation grid છે: ૪–૯–૨ / ૩–૫–૭ / ૮–૧–૬. જન્મ, નામ અને સંયુક્ત ગ્રિડના સંકેતો અહીં વ્યક્તિત્વ, આદતો અને ૪૦-દિવસના અભ્યાસને માર્ગદર્શન આપે છે." : "This is your primary Foundation grid: 4–9–2 / 3–5–7 / 8–1–6. Its Birth, Name and Combined signals guide personality patterns, habits and the 40-day practice."}</div>
        <div class="judge-note">${lang === "hi" ? "उपाय-अधिकार: अनुपस्थित और दोहराए अंक केवल लो शू से आते हैं। आयुर्वेद, इष्ट देव और power days केवल मूलांक/भाग्यांक से आते हैं; समय और सक्रिय वास्तु क्षेत्र केवल दशा से आते हैं।" : lang === "gu" ? "ઉપાય-અધિકાર: ખૂટતા અને પુનરાવર્તિત અંકો ફક્ત લો શુમાંથી આવે છે. આયુર્વેદ, ઇષ્ટ દેવ અને power days ફક્ત મૂળાંક/ભાગ્યાંકથી આવે છે; સમય અને સક્રિય વાસ્તુ ક્ષેત્ર ફક્ત દશાથી આવે છે." : "Authority boundary: missing and repeated-number remedies come only from Lo Shu. Ayurveda, guardian deities and power days come only from Driver/Conductor; timing and active Vastu zones come only from Dasha."}</div>
      </div>
      <div class="loshu-grid-wrap">
        <div><div class="loshu-grid" role="img" aria-label="Classic Lo Shu Birth Grid">${renderLoShuGridCells(p.loShuCounts, copy.birth)}</div>
          <div class="vedic-legend" style="margin-top:8px"><span><i class="dot g"></i>${copy.present}</span><span><i class="dot y"></i>${copy.repeated}</span><span><i class="dot w"></i>${copy.missing}</span></div></div>
        <div class="card"><div class="card-title">${copy.birth}</div>
          <div class="kit-value"><span class="badge good">${copy.present}</span> ${Object.keys(p.loShuCounts).filter((k) => p.loShuCounts[k] > 0).join(", ") || "—"}</div>
          ${p.loShuWeak.length ? `<div class="kit-value"><span class="badge warn">${copy.weak}</span> ${p.loShuWeak.join(", ")}</div>` : ""}
          <div class="kit-value"><span class="badge bad">${copy.missing}</span> ${p.loShuMissing.length ? p.loShuMissing.join(", ") : copy.complete}</div>
        </div>
      </div>
      <div class="card"><div class="card-title">${lang === "hi" ? "लो शू प्लॉटिंग नियम" : lang === "gu" ? "લો શુ પ્લોટિંગ નિયમો" : "Lo Shu plotting rules"}</div>
        <div class="kit-value"><strong>1.</strong> ${esc(config.plotting.zeros || "Remove every 0 before plotting.")}<br><strong>2.</strong> ${esc(config.plotting.year || "Plot all non-zero digits of the full birth date, including century digits.")}<br><strong>3.</strong> ${esc(config.plotting.calculations || "Add Driver and Conductor after the raw DOB digits.")}</div>
        <div class="vedic-calculation-grid"><div><span class="kit-label">${copy.driver}</span><div class="vedic-formula">${grid.raw.day.split("").join(" + ")} = ${grid.calculations.rulingDigitSum} → <strong>${p.driver}</strong></div></div><div><span class="kit-label">${copy.conductor}</span><div class="vedic-formula">${formulaDigits} = ${grid.calculations.destinyDigitSum} → <strong>${p.conductor}</strong></div></div></div>
      </div>
      <div class="card"><div class="card-title">${lang === "hi" ? "आपकी जन्म-पट्टिका कैसे बनी" : lang === "gu" ? "તમારી જન્મ-પટ્ટિકા કેવી રીતે બની" : "How your Lo Shu Birth Grid was plotted"}</div><div class="table-scroll"><table class="rtable"><tr><th>${copy.source}</th><th>${copy.plotted}</th><th>${copy.treatment}</th></tr>${sourceRows}</table></div></div>
      <div class="card-grid two loshu-secondary-grids">
        <div class="card"><div class="card-title">${copy.name}</div><div class="loshu-grid compact" role="img" aria-label="Lo Shu Name Grid">${renderLoShuGridCells(p.loShuNameCounts, copy.name)}</div><div class="card-sub">${lang === "hi" ? "आपके दैनिक नाम के चाल्डियन अक्षर-मूल्य उसी लो शू निर्देशांकों पर।" : lang === "gu" ? "તમારા દૈનિક નામના ચાલ્ડિયન અક્ષર-મૂલ્યો એ જ લો શુ નિર્દેશાંકો પર." : "The Chaldean values in your everyday name, mapped onto the same Lo Shu coordinates."}</div></div>
        <div class="card"><div class="card-title">${copy.combined}</div><div class="loshu-grid compact" role="img" aria-label="Lo Shu Combined Grid">${renderLoShuGridCells(p.loShuCombinedCounts, copy.combined)}</div><div class="card-sub">${lang === "hi" ? "जन्म और नाम का संयुक्त संकेत — आप दुनिया में किस ऊर्जा को मजबूत करते हैं।" : lang === "gu" ? "જન્મ અને નામનો સંયુક્ત સંકેત — તમે વિશ્વમાં કઈ ઊર્જા મજબૂત કરો છો." : "Your Birth and Name signals together — the energy you reinforce in the world."}</div></div>
      </div>
      <div class="plane-cards">${planeCards}</div>
      <div class="card"><div class="card-title">${lang === "hi" ? "लो शू तीर — बने हुए पैटर्न" : lang === "gu" ? "લો શુ તીર — બનેલા પેટર્ન" : "Lo Shu Arrows — formed patterns"}</div><div class="arrow-grid">${arrowCards}</div></div>
      ${p.loShuMissing.length ? `<div class="card" id="loshu-remedies"><div class="card-title">${lang === "hi" ? "अनुपस्थित अंक — लो शू उपाय" : lang === "gu" ? "ખૂટતા અંકો — લો શુ ઉપાયો" : "Missing Numbers — Lo Shu Remedies"}</div><div class="card-sub">${lang === "hi" ? "यही एकमात्र missing-number remedy checklist है।" : lang === "gu" ? "આ એકમાત્ર missing-number remedy checklist છે." : "This is the one and only missing-number remedy checklist."}</div><div class="kit">${missingFixes}</div></div>` : `<div class="card"><div class="kit-value"><span class="badge good">${copy.complete}</span> ${lang === "hi" ? "सभी लो शू अंक उपस्थित हैं — अभ्यास सुधार और स्थिरता के लिए रखें।" : lang === "gu" ? "બધા લો શુ અંકો હાજર છે — અભ્યાસ સુધારણા અને સાતત્ય માટે રાખો." : "All Lo Shu numbers are present — keep the practice for refinement and consistency."}</div></div>`}
      ${p.loShuRepeated.length ? `<div class="rsection-desc">${lang === "hi" ? "दोहराए गए ३+ अंक:" : lang === "gu" ? "૩+ વાર પુનરાવર્તિત અંકો:" : "Repeated 3+ times:"} <strong>${p.loShuRepeated.join(", ")}</strong></div>${renderExcessEnergyCard(p)}` : ""}
    </section>`;
  }

  function vedicGridCopy(lang) {
    const copy = {
      en: { title: "Vedic Birth Grid — Planetary Strength Indicators", intro: "An advanced comparison only. This birth-only Ank Kundali uses filtered DOB plotting and the Vedic layout 3–1–9 / 6–7–5 / 2–8–4.", present: "Present indicator", repeated: "Concentrated indicator", weak: "Single indicator", missing: "Absent indicator", note: "These indicators describe a separate Vedic lens. An absent or repeated indicator is not a missing-number remedy obligation and does not create another checklist.", source: "Source", plotted: "Plotted digits", treatment: "Vedic treatment", day: "Birth day", month: "Birth month", year: "Birth year", ruling: "Ruling Number", destiny: "Destiny Number" },
      hi: { title: "वैदिक जन्म ग्रिड — ग्रह-शक्ति संकेतक", intro: "केवल उन्नत तुलना। यह जन्म-अंक कुंडली छाने हुए DOB नियमों और ३–१–९ / ६–७–५ / २–८–४ वैदिक क्रम का उपयोग करती है।", present: "उपस्थित संकेतक", repeated: "सघन संकेतक", weak: "एकल संकेतक", missing: "अनुपस्थित संकेतक", note: "ये अलग वैदिक दृष्टि के संकेतक हैं। अनुपस्थित या दोहराया संकेतक missing-number remedy obligation नहीं बनाता और दूसरी checklist नहीं देता।", source: "स्रोत", plotted: "रखे गए अंक", treatment: "वैदिक नियम", day: "जन्म दिन", month: "जन्म माह", year: "जन्म वर्ष", ruling: "मूलांक", destiny: "भाग्यांक" },
      gu: { title: "વૈદિક જન્મ ગ્રિડ — ગ્રહ-શક્તિ સંકેતકો", intro: "માત્ર ઉન્નત તુલના. આ જન્મ-અંક કુંડળી છાનેલા DOB નિયમો અને ૩–૧–૯ / ૬–૭–૫ / ૨–૮–૪ વૈદિક ક્રમ વાપરે છે.", present: "હાજર સંકેતક", repeated: "સઘન સંકેતક", weak: "એકલ સંકેતક", missing: "ગેરહાજર સંકેતક", note: "આ અલગ વૈદિક દૃષ્ટિના સંકેતકો છે. ગેરહાજર અથવા પુનરાવર્તિત સંકેતક missing-number remedy obligation બનતો નથી અને બીજી checklist આપતો નથી.", source: "સ્ત્રોત", plotted: "મૂકેલા અંકો", treatment: "વૈદિક નિયમ", day: "જન્મ દિવસ", month: "જન્મ મહિનો", year: "જન્મ વર્ષ", ruling: "મૂલાંક", destiny: "ભાગ્યાંક" }
    };
    return copy[lang] || copy.en;
  }

  function renderVedicGridCells(counts) {
    const db = getActiveDB();
    const copy = vedicGridCopy(getLang());
    const layout = vedicGridConfig(db).layout;
    return layout.flat().map((n) => {
      const c = counts[n] || 0;
      const cls = c === 0 ? "missing" : c >= 3 ? "present multi" : "present";
      const digits = c ? Array(c).fill(n).map((x) => `<span>${x}</span>`).join("") : `<span>${n}</span>`;
      return `<div class="vedic-cell ${cls}" data-grid-engine="vedic" data-grid-number="${n}" data-missing-label="${esc(copy.missing)}" title="Vedic birth indicator · ${n}: ${c} occurrence${c === 1 ? "" : "s"}"><div class="digits">${digits}</div>${c ? `<div class="cnt">${esc(db.numbers[n].planet.split(" ")[0])}</div>` : ""}</div>`;
    }).join("");
  }

  function renderVedicBirthComparison(p) {
    const lang = getLang();
    const copy = vedicGridCopy(lang);
    const grid = p.vedicGrid || generateVedicGrid(p.day, p.month, p.year);
    const numberList = (numbers) => numbers && numbers.length ? numbers.join(", ") : "—";
    const sourceRows = [
      [copy.day, grid.excluded.dayDeduplicated ? "—" : numberList(grid.sourceDigits.day), grid.excluded.dayDeduplicated ? (lang === "hi" ? "मूलांक के रूप में एक बार दर्ज" : lang === "gu" ? "મૂલાંક તરીકે એક વખત દાખલ" : "Entered once as the Ruling Number") : (lang === "hi" ? "संयुक्त तारीख के अंक" : lang === "gu" ? "સંયુક્ત તારીખના અંકો" : "Compound-day digits")],
      [copy.month, numberList(grid.sourceDigits.month), lang === "hi" ? "शून्य हटाए गए" : lang === "gu" ? "શૂન્ય દૂર કરાયા" : "Zeros removed"],
      [copy.year, numberList(grid.sourceDigits.year), lang === "hi" ? "केवल वर्ष के अंतिम दो अंक; शताब्दी हटाई" : lang === "gu" ? "માત્ર વર્ષના છેલ્લા બે અંકો; સદી દૂર" : "Final two year digits only; century excluded"],
      [copy.ruling, String(p.driver), lang === "hi" ? "फ़िल्टरिंग के बाद जोड़ा" : lang === "gu" ? "છટણી પછી ઉમેર્યો" : "Added after filtering"],
      [copy.destiny, String(p.conductor), lang === "hi" ? "पूर्ण DOB से निकाला और जोड़ा" : lang === "gu" ? "પૂર્ણ DOBથી ગણીને ઉમેર્યો" : "Calculated from complete DOB and added"]
    ].map(([source, digits, treatment]) => `<tr><td><strong>${esc(source)}</strong></td><td>${esc(digits)}</td><td>${esc(treatment)}</td></tr>`).join("");
    const present = Object.keys(p.vedicCounts).filter((n) => p.vedicCounts[n] > 0).join(", ") || "—";
    return `<section class="rsection vedic-comparison-section" id="vedic-comparison-section">
      <details class="advanced-vedic-comparison">
        <summary><span>${t("secVedicCompare", "Advanced Vedic Comparison")}</span><span class="details-hint">${lang === "hi" ? "वैकल्पिक जन्म-ग्रिड" : lang === "gu" ? "વૈકલ્પિક જન્મ-ગ્રિડ" : "Optional birth-grid view"}</span></summary>
        <div class="details-body">
          <h2 class="rsection-title"><span class="idx">+</span>${copy.title}</h2>
          <div class="card vedic-grid-intro"><div class="kit-value">${copy.intro}</div><div class="judge-note">${copy.note}</div></div>
          <div class="vedic-grid-wrap"><div><div class="vedic-grid" role="img" aria-label="Vedic Birth Grid planetary strength indicators">${renderVedicGridCells(p.vedicCounts)}</div><div class="vedic-legend" style="margin-top:8px"><span><i class="dot g"></i>${copy.present}</span><span><i class="dot y"></i>${copy.repeated}</span><span><i class="dot w"></i>${copy.missing}</span></div></div>
            <div class="card"><div class="card-title">${lang === "hi" ? "जन्म संकेतक एक नजर में" : lang === "gu" ? "જન્મ સંકેતકો એક નજરે" : "Birth indicators at a glance"}</div><div class="kit-value"><span class="badge good">${copy.present}</span> ${present}</div>${p.vedicWeak.length ? `<div class="kit-value"><span class="badge warn">${copy.weak}</span> ${p.vedicWeak.join(", ")}</div>` : ""}<div class="kit-value"><span class="badge info">${copy.missing}</span> ${p.vedicMissing.length ? p.vedicMissing.join(", ") : (lang === "hi" ? "कोई नहीं" : lang === "gu" ? "કોઈ નહીં" : "none")}</div></div>
          </div>
          <div class="card"><div class="card-title">${lang === "hi" ? "वैदिक जन्म ग्रिड कैसे बना" : lang === "gu" ? "વૈદિક જન્મ ગ્રિડ કેવી રીતે બન્યો" : "How the Vedic Birth Grid was plotted"}</div><div class="table-scroll"><table class="rtable"><tr><th>${copy.source}</th><th>${copy.plotted}</th><th>${copy.treatment}</th></tr>${sourceRows}</table></div></div>
        </div>
      </details>
    </section>`;
  }

  // Retained as a public compatibility alias for integrations/tests. It is now
  // explicitly a birth-only advanced comparison, never a remedy renderer.
  function renderVedicGrid(p) { return renderVedicBirthComparison(p); }

  function kitCard(n, heading) {
    const db = getActiveDB();
    const i = db.numbers[n];
    const sm = db.mantraShort[n];
    const yantraName = (db.yantra && db.yantra[n]) || (window.DB && window.DB.yantra && window.DB.yantra[n]) || `Yantra ${n}`;
    const lang = getLang();

    return `<div class="card">
      <div class="goal-head">
        <div class="num-value" style="width:40px;height:40px;font-size:18px;line-height:40px">${n}</div>
        <div>
          <div class="card-title">${esc(i.planet)}</div>
          <div class="card-sub">${esc(heading || i.traits)}</div>
        </div>
      </div>
      <div class="kit">
        <div class="kit-row"><div class="kit-ico">🕉</div><div class="kit-body"><div class="kit-label">${t("beejMantra", "Beej Mantra")}</div><div class="kit-value"><span class="mantra">${esc(i.mantra)}</span><br>${esc(i.mantraCount)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🙏</div><div class="kit-body"><div class="kit-label">${t("dailyShortMantra", "Daily Short Mantra")}</div><div class="kit-value"><span class="mantra">${esc(sm.dev)}</span> <em>(${esc(sm.pron)})</em><br><span class="card-sub">${esc(sm.meaning)}</span></div></div></div>
        <div class="kit-row"><div class="kit-ico">📝</div><div class="kit-body"><div class="kit-label">${t("wishPaperAffirmation", "Wish-Paper Affirmation")}</div><div class="kit-value">“${esc(sm.affirmation)}”<br><span class="card-sub">${lang === "hi" ? "इसे अपने संकल्प पत्र पर रोज ११ बार लिखें और पर्स या तकिए के नीचे रखें।" : lang === "gu" ? "આને તમારા સંકલ્પ પત્ર પર રોજ ૧૧ વખત લખો અને પર્સમાં કે ઓશીકા નીચે રાખો." : "Write this on your wish paper 11 times daily, then keep the paper in your wallet or under your pillow."}</span></div></div></div>
        <div class="kit-row"><div class="kit-ico">💎</div><div class="kit-body"><div class="kit-label">${t("crystal", "Crystal")}</div><div class="kit-value">${esc(i.crystal)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">📿</div><div class="kit-body"><div class="kit-label">${t("rudraksha", "Rudraksha")}</div><div class="kit-value">${esc(i.rudraksha)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🔱</div><div class="kit-body"><div class="kit-label">${t("yantra", "Yantra")}</div><div class="kit-value">${esc(yantraName)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🎨</div><div class="kit-body"><div class="kit-label">${t("colorDayMetal", "Colour / Metal") }</div><div class="kit-value">${esc(i.color)} · ${esc(i.metal)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🎁</div><div class="kit-body"><div class="kit-label">${t("charity", "Charity")}</div><div class="kit-value">${esc(i.charity)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🌿</div><div class="kit-body"><div class="kit-label">${t("lifestyle", "Lifestyle")}</div><div class="kit-value">${esc(i.lifestyle)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🍽</div><div class="kit-body"><div class="kit-label">${t("fast", "Fast")}</div><div class="kit-value">${esc(i.fast)}</div></div></div>
      </div>
    </div>`;
  }

  /* Crystal and Rudraksha remedy picks are intentionally Lo Shu-only. The
     Driver/Conductor baseline, zodiac reference and Vedic comparison do not
     add competing remedial stones. */
  function crystalGuide(p) {
    const db = getActiveDB();
    const remedyNumbers = [...new Set((p.loShuMissing || []).map(Number))];
    const sources = remedyNumbers.map((n) => db.numbers[n] && db.numbers[n].crystal).filter(Boolean);
    const keys = Object.keys(db.crystals || {}).filter((k) => k !== "Selenite" && k !== "5 Mukhi Rudraksha");
    const seen = new Set();
    const picks = [];
    for (const src of sources) {
      const s = String(src || "").toLowerCase();
      for (const k of keys) {
        if (!seen.has(k) && s.includes(k.toLowerCase())) { seen.add(k); picks.push(k); }
      }
    }

    const rudrakshaPool = remedyNumbers.map((n) => db.numbers[n] && db.numbers[n].rudraksha).filter(Boolean).join(" ").toLowerCase();
    const rudrakshaNote = rudrakshaPool.includes("5 mukhi") ? db.crystals["5 Mukhi Rudraksha"] : null;

    return { remedyNumbers, picks: picks.slice(0, 5), rudrakshaNote };
  }

  function renderReport(p) {
    const db = getActiveDB();
    const lang = getLang();
    const nameSug = nameSuggestions(p);
    const mobSug = mobileSuggestion(p);
    const brand = p.brand ? brandAnalysis(p.brand, p) : null;
    const vehicle = vehicleAnalysis(p);
    const timing = timingAnalysis(p);
    const vastu = vastuReport(p);
    const goals = goalPlan(p);
    const priorities = priorityPlan(p);
    const watch = watchSpec(p);
    const evolving = evolvingChartData(p, timing);
    const summary = northstarSummary(p);
    const activation = activationPlan(p);
    const dobStr = `${String(p.day).padStart(2, "0")}/${String(p.month).padStart(2, "0")}/${p.year}`;

    const summarySection = `<section class="rsection summary-section" id="summary-section">
      <div class="summary-shell">
        <p class="summary-kicker">${t("secSummary", "Northstar Summary")}</p>
        <h2 class="summary-title">${summary.headline}</h2>
        <p class="summary-story">${summary.story}</p>
        <div class="summary-card-grid">
          ${summary.cards.map((card) => `<div class="summary-card"><div class="summary-label">${card.label}</div><div class="summary-value">${card.value}</div><p>${card.note}</p></div>`).join("")}
        </div>
        <div class="summary-next">
          <div>
            <h3>${t("firstThreeMoves", "Your first three moves")}</h3>
            <ol class="summary-actions">${summary.moves.map((move, idx) => `<li><span class="summary-step">${idx + 1}</span><span class="summary-move"><span class="summary-move-title">${move.title}</span><span class="summary-move-detail">${move.detail}</span></span></li>`).join("")}
            </ol>
            <a class="summary-cta" href="#plan-section">${t("open40DayPlan", "Open your full 40-Day Activation Plan ↓")}</a>
          </div>
          <div class="summary-way-forward">
            <h3>${t("wayForward", "Way forward")}</h3>
            ${summary.checks.map((line) => `<p>${line}</p>`).join("")}
            <p><strong>${lang === "hi" ? "इसे अपना मार्गदर्शक बनाएं:" : lang === "gu" ? "આને તમારું માર્ગદર્શન બનાવો:" : "Use this as your northstar:"}</strong> ${lang === "hi" ? `एक साथ सारे उपाय न करें। रिपोर्ट के अंत में दी गई ४०-दिवसीय योजना का पालन करें और परिणाम प्रगति चार्ट (खंड ${SECTION.memory}) में देखें।` : lang === "gu" ? `એક સાથે બધા ઉપાયો ન કરો. રિપોર્ટના અંતે આપેલી ૪૦ દિવસની યોજનાનું પાલન કરો અને પરિણામો પ્રગતિ ચાર્ટ (વિભાગ ${SECTION.memory}) માં જુઓ.` : `do not try every remedy at once. Walk the 40-day Activation Plan at the end of this report — tick each day off in its tracker — then review your results in Your Evolving Chart (Section ${SECTION.memory}).`}</p>
          </div>
        </div>
      </div>
    </section>`;

    const td = db.traits[p.driver], tc = db.traits[p.conductor];
    const traitsSection = `<section class="rsection" id="traits-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.traits}</span>${t("secTraits", "Your Core Nature — Traits, Strengths & Shadows")}</h2>
      <div class="card">
        <div class="card-sub" style="text-transform:uppercase;letter-spacing:.05em;font-weight:600">${lang === "hi" ? "दो अंक आपके स्वभाव का निर्माण करते हैं" : lang === "gu" ? "બે અંક તમારા સ્વભાવનું નિર્માણ કરે છે" : "Two numbers shape your nature"}</div>
        <div class="nature-pair">
          <div class="nature-chip">
            <div class="num-value">${p.driver}</div>
            <div class="num-label">${t("driverLabel", "Driver (Moolank)")} · ${esc(db.numbers[p.driver].planet.split(" ")[0])}</div>
          </div>
          <div class="nature-chip">
            <div class="num-value alt">${p.conductor}</div>
            <div class="num-label">${t("conductorLabel", "Conductor (Bhagyank)")} · ${esc(db.numbers[p.conductor].planet.split(" ")[0])}</div>
          </div>
        </div>
        <div class="kit-value">${esc(td.nature)} ${lang === "hi" ? `गहराई में, आपका भाग्यांक ${esc(tc.innerDrive)} को दर्शाता है।` : lang === "gu" ? `ઊંડાણમાં, તમારો ભાગ્યાંક ${esc(tc.innerDrive)} દર્શાવે છે.` : `Beneath the surface, your Bhagyank carries ${esc(tc.innerDrive)}.`}</div>
        <div class="judge-note"><strong>${t("howWeJudge", "How we judge this:")}</strong> ${lang === "hi" ? `आपका स्वभाव केवल मूलांक से नहीं देखा जाता। <strong>मूलांक</strong> आपकी दैनिक सोच और व्यक्तित्व है, जबकि <strong>भाग्यांक</strong> आपकी गहरी अंतःप्रेरणा है। हम दोनों को मिलाकर पूरा चित्र देखते हैं।` : lang === "gu" ? `તમારો સ્વભાવ માત્ર મૂળાંક પરથી નથી જોવાતો. <strong>મૂળાંક</strong> તમારી દૈનિક વિચારસરણી છે, જ્યારે <strong>ભાગ્યાંક</strong> તમારી ઊંડી આંતરિક પ્રેરણા છે. આપણે બંનેને મેળવીને સંપૂર્ણ ચિત્ર જોઈએ છીએ.` : "Your nature is not read from your Mulank alone. Your <strong>Mulank</strong> (from your birth day) is your visible, day-to-day personality, while your <strong>Bhagyank</strong> (from your full birth date) drives your deeper instincts. We read <strong>both together</strong> for the full picture."}</div>
      </div>
      <div class="card-grid two">
        <div class="card strength-card">
          <div class="card-title">${t("amplifyThese", "Your Strengths — Amplify These")}</div>
          <div class="kit">${td.strengths.map((s) => `<div class="kit-row"><div class="kit-ico good-ico">✓</div><div class="kit-body"><div class="kit-value">${esc(s)}</div></div></div>`).join("")}</div>
        </div>
        <div class="card shadow-card">
          <div class="card-title">${t("watchThese", "Your Shadows — Watch These")}</div>
          <div class="kit">${td.shadows.map((s) => `<div class="kit-row"><div class="kit-ico bad-ico">!</div><div class="kit-body"><div class="kit-value">${esc(s)}</div></div></div>`).join("")}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">${lang === "hi" ? "कौन से गुण अपनाएं, किन्हें त्यागें" : lang === "gu" ? "કયા ગુણો અપનાવવા, કયા છોડવા" : "Which Qualities to Adopt, Which to Let Go"}</div>
        <div class="adopt-release">
          <div class="adopt-col">
            <div class="kit-label" style="color:var(--positive)">${t("adopt", "Adopt")}</div>
            ${td.adopt.map((s) => `<div class="ar-item">+ ${esc(s)}</div>`).join("")}
          </div>
          <div class="release-col">
            <div class="kit-label" style="color:var(--danger)">${t("release", "Release")}</div>
            ${td.release.map((s) => `<div class="ar-item">− ${esc(s)}</div>`).join("")}
          </div>
        </div>
        <div class="judge-note"><strong>${t("howWeJudge", "How we judge this:")}</strong> ${lang === "hi" ? "प्रत्येक मूलांक के साथ कुछ खास शक्तियां बढ़ाने और कुछ आदतों को छोड़ने का शास्त्रीय नियम जुड़ा होता है।" : lang === "gu" ? "દરેક મૂળાંક સાથે કેટલીક વિશેષ શક્તિઓ વધારવાનો અને કેટલીક આદતો છોડવાનો શાસ્ત્રીય નિયમ જોડાયેલો હોય છે." : "Each Mulank carries a signature set of strengths to <strong>amplify</strong> and tendencies to <strong>release</strong>, shaped by its ruling planet and how that planet tends to over- or under-express in daily life."}</div>
      </div>
    </section>`;

    const weakSection = p.loShuMissing.length
      ? `<section class="rsection" id="remedy-section" data-remedy-authority="lo-shu">
          <h2 class="rsection-title"><span class="idx">${SECTION.weak}</span>${t("secWeak", "Lo Shu Remedy Kits")}</h2>
          <p class="rsection-desc">${lang === "hi" ? "लो शू जन्म-पट्टिका में अनुपस्थित अंकों के पूर्ण उपाय किट — यही इस रिपोर्ट की एकमात्र missing-number remedy सूची है।" : lang === "gu" ? "લો શુ જન્મ-ગ્રિડમાં ખૂટતા અંકોના સંપૂર્ણ ઉપાય કિટ — આ જ રિપોર્ટની એકમાત્ર missing-number remedy સૂચિ છે." : `Full Lo Shu Foundation remedy kits for missing numbers — the only missing-number remedy list in this report.`}</p>
          <div class="card-grid two">${p.loShuMissing.slice(0, 4).map((n) => kitCard(n)).join("")}</div>
          ${p.loShuMissing.length > 4 ? `<p class="rsection-desc">+ ${p.loShuMissing.length - 4} more missing numbers — apply their quick balancers from Section ${SECTION.grid}.</p>` : ""}
        </section>` : "";

    const z = db.zodiac[p.zodiac] || {};
    /* Keep the sidereal Sun-sign as a descriptive Vedic reference, not a
       second source of crystals, affirmations or remedy obligations. */
    const zodiacSection = `<section class="rsection" id="vedic-section" data-authority="zodiac-reference">
      <h2 class="rsection-title"><span class="idx">${SECTION.zodiac}</span>${t("secZodiac", "Your Vedic Sun-sign Reference — {sign}").replace("{sign}", esc(p.zodiac))}</h2>
      <p class="rsection-desc">${lang === "hi" ? "यह आपकी वैदिक सूर्य राशि (सायडीरियल / निरयण, लाहिड़ी अयनांश) का संदर्भ है। यह स्वभाव और इरादों को समझने में मदद कर सकता है, लेकिन लो शू remedy checklist, crystals, affirmations, Rudraksha, इष्ट देवता, power days या दशा-वास्तु समय को नहीं बदलता।" : lang === "gu" ? "આ તમારી વૈદિક સૂર્ય રાશિ (સિડિરિયલ / નિરયણ, લાહિરી અયનામ્સા) નો સંદર્ભ છે. તે સ્વભાવ અને ઇરાદા સમજવામાં મદદ કરી શકે છે, પરંતુ લો શુ remedy checklist, crystals, affirmations, Rudraksha, ઇષ્ટ દેવતા, power days અથવા દશા-વાસ્તુ સમયને બદલતું નથી." : `This is your Vedic Sun-sign reference (sidereal / Nirayana, Lahiri ayanamsa). It can contextualise temperament and intentions, but it never changes the Lo Shu remedy checklist, crystals, affirmations, Rudraksha, guardian deities, power days or Dasha/Vastu timing. Western tropical reference: <strong>${esc(p.zodiacTropical)}</strong>.`}</p>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">${esc(p.zodiac)} — ${esc(z.element || "")}</div>
          <span class="badge info">${lang === "hi" ? "संदर्भ मात्र" : lang === "gu" ? "ફક્ત સંદર્ભ" : "Reference only"}</span>
        </div>
        <div class="kit">
          <div class="kit-row"><div class="kit-ico">☉</div><div class="kit-body"><div class="kit-label">${lang === "hi" ? "तत्व और स्वामी" : lang === "gu" ? "તત્વ અને સ્વામી" : "Element and ruler"}</div><div class="kit-value">${esc(z.element || "")} · ${esc(db.numbers[z.ruler] && db.numbers[z.ruler].planet || "")}</div></div></div>
          <div class="kit-row"><div class="kit-ico">◎</div><div class="kit-body"><div class="kit-label">${lang === "hi" ? "चिंतन का विषय" : lang === "gu" ? "ચિંતનનો વિષય" : "Reflection theme"}</div><div class="kit-value">${esc(z.intentions || "")}</div></div></div>
        </div>
      </div>
      ${zodiacHarmonyNote(p, z)}
      ${vedicSnapshotCard(p)}
      ${vedicTierDisclosure(p)}
    </section>`;

    const nameVerdictTone = nameSug.verdict === "enemy" || (p.nameRelD === "enemy" || p.nameRelC === "enemy") ? "bad" : nameSug.verdict === "neutral" ? "warn" : "good";
    const nameMaster = masterNumber(p.nameCompound);
    const nameSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.name}</span>${t("secName", "Name Analysis & Spelling Correction")}</h2>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">${esc(p.name)}</div>
          <span class="badge info">Chaldean total ${p.nameCompound}${nameMaster ? " (Master Number)" : ""} → Name Number ${p.nameNum}</span>
          ${relBadge(p.nameRelD === "enemy" || p.nameRelC === "enemy" ? "enemy" : p.nameRelD === "neutral" || p.nameRelC === "neutral" ? "neutral" : "friendly")}
        </div>
        <table class="rtable">
          <tr><th>Name number vs Driver ${p.driver}</th><td>${relBadge(p.nameRelD)} ${p.nameRelD === "enemy" ? "— clashes with your core mind/self energy" : ""}</td></tr>
          <tr><th>Name number vs Conductor ${p.conductor}</th><td>${relBadge(p.nameRelC)} ${p.nameRelC === "enemy" ? "— works against your destiny path" : ""}</td></tr>
        </table>
        ${nameMaster ? `<div class="judge-note"><strong>${esc(nameMaster.name)}:</strong> ${esc(nameMaster.meaning)}</div>` : (compoundMeaning(p.nameCompound) ? `<div class="judge-note"><strong>Compound Number ${p.nameCompound}:</strong> ${esc(compoundMeaning(p.nameCompound))}</div>` : "")}
        ${nameSug.needed
          ? (nameSug.variants && nameSug.variants.length
            ? `<div class="card-sub"><strong>${lang === "hi" ? "सुझाई गई स्पेलिंग" : lang === "gu" ? "સૂચવેલી સ્પેલિંગ" : "Recommended spellings"}</strong> — ${lang === "hi" ? "उच्चारण वही रहता है; अक्षरों को ध्वनि-सुरक्षित तरीके से बदला गया है:" : lang === "gu" ? "ઉચ્ચાર એ જ રહે છે; અક્ષરોને ધ્વનિ-સુરક્ષિત રીતે બદલવામાં આવ્યા છે:" : "pronunciation stays the same; letters are doubled, added or swapped for same-sound equivalents (the way Tripti became Triptii and Sunil became Suniel). Priority is given to spellings that fill the missing numbers in your Lo Shu Foundation grid:"}</div>
               ${spellingTableHtml(nameSug.variants)}
               <div class="card-sub">${lang === "hi" ? `नई स्पेलिंग को रोज २१ बार ४० दिनों तक लिखें और ${dayOf(p.driver)} से शुरुआत करें।` : lang === "gu" ? `નવી સ્પેલિંગ રોજ ૨૧ વખત ૪૦ દિવસ સુધી લખો અને ${dayOf(p.driver)} ના દિવસે શરૂ કરો.` : `Write the new spelling 21 times daily for 40 days, update it on non-legal items first (email signature, social profiles, visiting cards), and introduce it on a ${DAY_OF[p.driver]}.`}</div>`
            : `<div class="card-sub">Consult a numerologist for a custom spelling — targets friendly to both your numbers are limited. Favour spellings totalling a number that fills a missing number in your grid (${p.loShuMissing.join(", ") || "none missing"}) or is friendly to Driver ${p.driver} and Conductor ${p.conductor}.</div>`)
          : `<div class="kit-value">${esc(db.nameAdvice[nameVerdictTone === "good" ? "friendly" : "neutral"])}</div>${(nameSug.optional && nameSug.optional.variants && nameSug.optional.variants.length) ? `<div class="card" style="margin-top:12px">
               <div class="goal-head">
                 <div class="card-title">${lang === "hi" ? "वैकल्पिक वृद्धि (Optional Enhancement)" : lang === "gu" ? "વૈકલ્પિક ઉન્નતિ (Optional Enhancement)" : "Optional Enhancement"}</div>
                 <span class="badge info">${lang === "hi" ? "केवल वैकल्पिक — कोई बदलाव आवश्यक नहीं" : lang === "gu" ? "માત્ર વૈકલ્પિક — કોઈ ફેરફાર જરૂરી નથી" : "Optional only — no change required"}</span>
               </div>
               <div class="kit-value">${lang === "hi" ? `आपका नाम पहले से ही आपके जन्म अंकों के अनुकूल है, इसलिए कुछ भी बदलना आवश्यक नहीं है। नीचे दी गई स्पेलिंगें आपके लो शू Foundation grid में अनुपस्थित अंक को जोड़ने का एक <em>वैकल्पिक</em> तरीका हैं — इनका उच्चारण समान रहता है, ये मूलांक ${p.driver} और भाग्यांक ${p.conductor} के अनुकूल रहती हैं, और ऐसे अंक में कभी वृद्धि नहीं करतीं जो आपके पास पहले से अधिक मात्रा में है।` : lang === "gu" ? `તમારું નામ પહેલેથી જ તમારા જન્મ અંકો સાથે સુમેળભર્યું છે, તેથી કંઈ બદલવાની જરૂર નથી. નીચે આપેલી સ્પેલિંગો તમારા લો શુ Foundation grid માં ખૂટતો અંક ઉમેરવાનો <em>વૈકલ્પિક</em> માર્ગ છે — ઉચ્ચાર એ જ રહે છે, તે મૂળાંક ${p.driver} અને ભાગ્યાંક ${p.conductor} સાથે અનુકૂળ રહે છે, અને એવા અંકમાં ક્યારેય વધારો કરતી નથી જે તમારી પાસે પહેલેથી વધુ માત્રામાં હોય.` : `Your name already harmonises with your birth numbers, so nothing needs to change. The spellings below are an <em>optional</em> way to consciously add a number your Lo Shu Foundation grid is missing — they keep the same pronunciation, stay harmonious with Driver ${p.driver} and Conductor ${p.conductor}, and never add fuel to a number you already have in excess.`}</div>
               ${spellingTableHtml(nameSug.optional.variants)}
               <div class="card-sub">${lang === "hi" ? "वैकल्पिक: यदि चाहें तो नई स्पेलिंग को ४० दिनों तक रोज २१ बार लिखें और पहले गैर-कानूनी प्रोफाइल पर उपयोग करें — कोई कानूनी बदलाव आवश्यक नहीं।" : lang === "gu" ? "વૈકલ્પિક: જો ઇચ્છો તો નવી સ્પેલિંગ ૪૦ દિવસ સુધી રોજ ૨૧ વખત લખો અને પહેલાં બિન-કાનૂની પ્રોફાઇલ પર વાપરો — કોઈ કાનૂની ફેરફાર જરૂરી નથી." : `Optional: if you wish to activate it, write the new spelling 21 times daily for 40 days and use it on non-legal profiles first — no legal change is required.`}</div>
             </div>` : ""}`}
      </div>
      ${brand ? `<div class="card">
        <div class="card-title">Business / Brand Name — Chaldean Success Reading</div>
        <div class="goal-head">
          <div class="card-title">${esc(brand.brand)}</div>
          <span class="badge info">Chaldean total ${brand.total}${brand.master ? " (Master Number)" : ""} → Number ${brand.root}</span>
          ${relBadge(brand.conflicting ? "enemy" : (brand.relD === "neutral" && brand.relC === "neutral" ? "neutral" : "friendly"))}
        </div>
        <table class="rtable">
          <tr><th>vs Driver ${p.driver}</th><td>${relBadge(brand.relD)}</td></tr>
          <tr><th>vs Conductor ${p.conductor}</th><td>${relBadge(brand.relC)}</td></tr>
        </table>
        ${brand.master ? `<div class="judge-note"><strong>${esc(brand.master.name)}:</strong> ${esc(brand.master.meaning)}</div>` : (brand.compound ? `<div class="judge-note"><strong>Compound Number ${brand.total}:</strong> ${esc(brand.compound)}</div>` : "")}
        ${brand.conflicting
          ? `<div class="kit-value">This brand name works against your birth numbers. <strong>Auspicious business roots for you: ${brand.auspicious.join(", ")}.</strong></div>${brand.suggestions.length ? `<div class="card-sub"><strong>Sound-preserving corrections</strong> (pronunciation stays the same):</div><div class="table-scroll"><table class="rtable"><tr><th>Suggested</th><th>Change</th><th>New total</th><th>Number</th><th>Why</th></tr>${brand.suggestions.map((v) => `<tr><td><strong>${esc(v.text)}</strong></td><td>${esc(v.change)}</td><td>${v.compound}</td><td>${v.reduced}</td><td>${esc(v.why)}</td></tr>`).join("")}</table></div>` : `<div class="card-sub">No pronunciation-preserving correction reaches an auspicious root — consult a numerologist for a custom brand name.</div>`}`
          : `<div class="kit-value">This brand name vibrates harmoniously with your birth numbers — an auspicious choice for your venture.</div>`}
      </div>` : ""}
    </section>`;

    const mobSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.mobile}</span>${t("secMobile", "Mobile Number Vibration")}</h2>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">${esc(p.mobile)}</div>
          <span class="badge info">Digits total ${p.mobCompound} → Number ${p.mobNum} (${esc(db.numbers[p.mobNum].planet)})</span>
          ${relBadge(p.mobRelD === "enemy" || p.mobRelC === "enemy" ? "enemy" : p.mobRelD === "neutral" && p.mobRelC === "neutral" ? "neutral" : "friendly")}
        </div>
        <table class="rtable">
          <tr><th>vs Driver ${p.driver}</th><td>${relBadge(p.mobRelD)}</td></tr>
          <tr><th>vs Conductor ${p.conductor}</th><td>${relBadge(p.mobRelC)}</td></tr>
        </table>
        ${compoundMeaning(p.mobCompound) ? `<div class="judge-note"><strong>Compound Number ${p.mobCompound}:</strong> ${esc(compoundMeaning(p.mobCompound))}</div>` : ""}
        ${mobSug.needed
          ? `<div class="kit-value">${lang === "hi" ? `आपका मोबाइल नंबर जन्म अंकों के साथ अनुकूल नहीं है — भविष्य में ऐसा नंबर चुनें जिसका कुल योग <strong>${mobSug.goodTotals.join(", ")}</strong> हो।` : lang === "gu" ? `તમારો મોબાઈલ નંબર જન્મ અંકો સાથે સુમેળભર્યો નથી — ભવિષ્યમાં એવો નંબર પસંદ કરો જેનો કુલ સરવાળો <strong>${mobSug.goodTotals.join(", ")}</strong> થતો હોય.` : `Your mobile number works against your birth numbers — since your phone is your most-used device, this is a high-impact change. When choosing a new number, pick one whose digits total <strong>${mobSug.goodTotals.join(", ")}</strong>. Activate the new SIM on a ${dayOf(p.driver)} or ${dayOf(p.conductor)} morning.`}</div>`
          : `<div class="kit-value">${lang === "hi" ? "आपका मोबाइल नंबर आपके जन्म अंकों के अनुकूल है — बदलने की आवश्यकता नहीं है।" : lang === "gu" ? "તમારો મોબાઈલ નંબર તમારા જન્મ અંકો સાથે સુમેળભર્યો છે — બદલવાની જરૂર નથી." : "Your mobile number vibrates acceptably with your birth numbers — no change required."}</div>`}
      </div>
    </section>`;

    const vehicleSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.vehicle}</span>${t("secVehicle", "Vehicle Number Vibration")}</h2>
      <p class="rsection-desc">${lang === "hi" ? "आप प्रतिदिन अपने वाहन की ऊर्जा में यात्रा करते हैं — इसका रजिस्ट्रेशन नंबर चालडियन पद्धति से विश्लेषित किया जाता है।" : lang === "gu" ? "તમે દરરોજ તમારા વાહનની ઊર્જામાં મુસાફરી કરો છો — તેનો રજીસ્ટ્રેશન નંબર ચાલ્ડિયન પદ્ધતિથી વિશ્લેષિત થાય છે." : "You travel inside your vehicle's vibration every day — its registration number carries Chaldean letter values plus digit values."}</p>
      ${vehicle.provided
        ? `<div class="card">
            <div class="goal-head">
              <div class="card-title">${esc(vehicle.raw)}</div>
              <span class="badge info">Letters ${vehicle.letterVal} + digits ${vehicle.digitVal} = ${vehicle.total} → Number ${vehicle.num} (${esc(db.numbers[vehicle.num].planet)})</span>
              ${relBadge(vehicle.conflicting ? "enemy" : vehicle.relD === "neutral" && vehicle.relC === "neutral" ? "neutral" : "friendly")}
            </div>
            <table class="rtable">
              <tr><th>vs Driver ${p.driver}</th><td>${relBadge(vehicle.relD)}</td></tr>
              <tr><th>vs Conductor ${p.conductor}</th><td>${relBadge(vehicle.relC)}</td></tr>
            </table>
            ${vehicle.conflicting
              ? `<div class="kit-value">${lang === "hi" ? `यह वाहन नंबर जन्म अंकों के साथ अनुकूल नहीं है। नया वाहन लेते समय कुल योग <strong>${vehicle.goodTotals.join(", ")}</strong> वाला नंबर चुनें। तब तक वाहन में छोटा ${esc(db.numbers[p.driver].crystal.split(" ")[0])} रखें।` : lang === "gu" ? `આ વાહન નંબર જન્મ અંકો સાથે સુમેળભર્યો નથી. નવું વાહન લેતી વખતે કુલ સરવાળો <strong>${vehicle.goodTotals.join(", ")}</strong> વાળો નંબર પસંદ કરો. ત્યાં સુધી વાહનમાં નાનો ${esc(db.numbers[p.driver].crystal.split(" ")[0])} રાખો.` : `This number works against your birth numbers. When you next register or change a vehicle, choose a plate whose letters (Chaldean) + digits total <strong>${vehicle.goodTotals.join(", ")}</strong>. Until then, keep a small ${esc(db.numbers[p.driver].crystal.split(" ")[0])} or ${esc(db.numbers[p.driver].planet.split(" ")[0])} yantra in the vehicle and start new journeys on ${DAY_OF[p.driver]}.`}</div>`
              : `<div class="kit-value">${lang === "hi" ? "आपका वाहन नंबर जन्म अंकों के अनुकूल है — इसे बनाए रखें।" : lang === "gu" ? "તમારો વાહન નંબર જન્મ અંકો સાથે સુમેળભર્યો છે — તેને જાળવી રાખો." : "Your vehicle number vibrates acceptably with your birth numbers — keep it. For your next vehicle, the totals below remain your best picks."}</div>`}
          </div>`
        : `<div class="card"><div class="kit-value">${lang === "hi" ? "कोई वाहन नंबर दर्ज नहीं किया गया था — नया वाहन खरीदते समय नीचे दिए गए मार्गदर्शन का उपयोग करें।" : lang === "gu" ? "કોઈ વાહન નંબર દાખલ કરવામાં આવ્યો ન હતો — નવું વાહન ખરીદતી વખતે નીચે આપેલા માર્ગદર્શનનો ઉપયોગ કરો." : "No vehicle number was entered — use the guidance below whenever you buy a car/bike or choose a registration number."}</div></div>`}
      <div class="card">
        <div class="card-title">${lang === "hi" ? "शुभ वाहन नंबर का चयन" : lang === "gu" ? "શુભ વાહન નંબરની પસંદગી" : "Choosing a Lucky Vehicle Number"}</div>
        <div class="kit-value">${lang === "hi" ? `ऐसा नंबर चुनें जिसके <strong>अक्षरों + अंकों का कुल योग</strong>: <strong>${vehicle.goodTotals.join(", ")}</strong> हो। शुभ वाहन रंग: <strong>${esc(vehicle.luckyColors.join(" या "))}</strong>। नए वाहन की डिलीवरी <strong>${dayOf(p.driver)}</strong> या <strong>${dayOf(p.conductor)}</strong> को लें।` : lang === "gu" ? `એવો નંબર પસંદ કરો જેના <strong>અક્ષરો + અંકોનો કુલ સરવાળો</strong>: <strong>${vehicle.goodTotals.join(", ")}</strong> થતો હોય. શુભ વાહન રંગો: <strong>${esc(vehicle.luckyColors.join(" અથવા "))}</strong>. નવા વાહનની ડિલિવરી <strong>${dayOf(p.driver)}</strong> કે <strong>${dayOf(p.conductor)}</strong> ના દિવસે લો.` : `Pick a registration whose <strong>letter values + digits total</strong> is one of: <strong>${vehicle.goodTotals.join(", ")}</strong> (these reduce to numbers in harmony with Driver ${p.driver} and Conductor ${p.conductor}). Favour vehicle colours <strong>${esc(vehicle.luckyColors.join(" or "))}</strong>. Take delivery of a new vehicle on a <strong>${DAY_OF[p.driver]}</strong> or <strong>${DAY_OF[p.conductor]}</strong>, ideally in the morning.`}</div>
      </div>
    </section>`;

    const watchSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.watch}</span>${t("secWatch", "Watch & Wearable Remedy")}</h2>
      <p class="rsection-desc">Your watch sits on your pulse all day — its metal, colour and geometry continuously feed planetary energy. Spec aligned to Driver ${p.driver} (${esc(db.numbers[p.driver].planet)}) + Conductor ${p.conductor} (${esc(db.numbers[p.conductor].planet)}).</p>
      <div class="table-scroll"><table class="rtable">
        <tr><th>Element</th><th>Recommended</th><th>Why</th></tr>
        ${watch.rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}
      </table></div>
      ${watch.avoids.length ? `<div class="card"><div class="card-title">Avoid</div>${watch.avoids.map((a) => `<div class="kit-value">• ${esc(a)}</div>`).join("")}</div>` : ""}
      ${watch.currentVerdict ? `<div class="card"><div class="goal-head"><div class="card-title">${lang === "hi" ? "आपकी वर्तमान घड़ी" : lang === "gu" ? "તમારી હાલની ઘડિયાળ" : "Your current watch"}</div><span class="badge ${watch.currentVerdict.tone}">${watch.currentVerdict.tone === "good" ? "Aligned" : watch.currentVerdict.tone === "warn" ? "Caution" : "Note"}</span></div><div class="kit-value">${esc(watch.currentVerdict.text)}</div></div>` : ""}
      <div class="card"><div class="card-title">${lang === "hi" ? "शुभ मुहूर्त में धारण" : lang === "gu" ? "શુભ મુહૂર્તમાં ધારણ" : "Auspicious Activation"}</div><div class="kit-value">${lang === "hi" ? `नई घड़ी को पहली बार <strong>${watch.days.join(" या ")}</strong> की सुबह, ${watch.time} में पहनें।` : lang === "gu" ? `નવી ઘડિયાળને પ્રથમ વખત <strong>${watch.days.join(" કે ")}</strong> ની સવારે, ${watch.time} માં પહેરો.` : `Wear the new watch for the first time on a <strong>${watch.days.join(" or ")}</strong> morning, ${watch.time}. Set a clear intention for your ${esc(p.goals[0] || "goal")} goal while putting it on.`}</div></div>
    </section>`;

    const cg = crystalGuide(p);
    const crystalSection = `<section class="rsection" data-remedy-authority="lo-shu">
      <h2 class="rsection-title"><span class="idx">${SECTION.crystal}</span>${t("secCrystal", "Crystal Companion Guide")}</h2>
      <p class="rsection-desc">${lang === "hi" ? `ये crystal और Rudraksha सुझाव केवल लो शू में अनुपस्थित अंक ${cg.remedyNumbers.length ? `<strong>${cg.remedyNumbers.join(" / ")}</strong>` : "के अभाव"} से आते हैं। मूलांक/भाग्यांक, राशि और उन्नत वैदिक grid इन्हें नहीं बदलते।` : lang === "gu" ? `આ crystal અને Rudraksha સૂચનો ફક્ત લો શુંમાં ખૂટતા અંક ${cg.remedyNumbers.length ? `<strong>${cg.remedyNumbers.join(" / ")}</strong>` : "ના અભાવ"} પરથી આવે છે. મૂળાંક/ભાગ્યાંક, રાશિ અને ઉન્નત વૈદિક grid તેને બદલતા નથી.` : `These crystal and Rudraksha suggestions come only from missing Lo Shu number${cg.remedyNumbers.length === 1 ? "" : "s"} ${cg.remedyNumbers.length ? `<strong>${cg.remedyNumbers.join(" / ")}</strong>` : "— none are required"}. Driver/Conductor, zodiac and the advanced Vedic grid do not change them.`}</p>
      ${cg.picks.length ? `<div class="card-grid two">${cg.picks.map((k) => {
        const c = db.crystals[k];
        return `<div class="card">
          <div class="card-title">💎 ${esc(k)}</div>
          <div class="kit">
            <div class="kit-row"><div class="kit-ico">⚡</div><div class="kit-body"><div class="kit-label">Energy / Chakra</div><div class="kit-value">${esc(c.chakra)}</div></div></div>
            <div class="kit-row"><div class="kit-ico">✨</div><div class="kit-body"><div class="kit-label">Core Benefits</div><div class="kit-value">${esc(c.benefits)}</div></div></div>
            <div class="kit-row"><div class="kit-ico">🔗</div><div class="kit-body"><div class="kit-label">Best Paired With</div><div class="kit-value">${esc(c.pair)}</div></div></div>
          </div>
        </div>`;
      }).join("")}</div>` : `<div class="card"><div class="kit-value">${lang === "hi" ? "लो शू में कोई अनुपस्थित अंक नहीं है, इसलिए अतिरिक्त remedial crystal आवश्यक नहीं है। दोहराए अंक को पत्थर से बढ़ाने के बजाय उसकी ऊर्जा को आदत में दिशा दें।" : lang === "gu" ? "લો શુંમાં કોઈ ખૂટતો અંક નથી, તેથી વધારાનો remedial crystal જરૂરી નથી. પુનરાવર્તિત અંકને પથ્થરથી વધારવાને બદલે તેની ઊર્જાને ટેવમાં દિશા આપો." : "No Lo Shu number is missing, so no extra remedial crystal is required. Channel a repeated number through its habit rather than feeding it with another stone."}</div></div>`}
      <div class="card">
        <div class="card-title">🧼 Cleansing &amp; Charging — the Selenite Rule</div>
        <div class="kit-value">${esc(db.crystals["Selenite"].benefits)}<br><strong>${esc(db.seleniteRitual)}</strong></div>
      </div>
      ${cg.rudrakshaNote ? `<div class="card"><div class="card-title">📿 5 Mukhi Rudraksha Note</div><div class="kit-value">${esc(cg.rudrakshaNote.benefits)} Best paired with: ${esc(cg.rudrakshaNote.pair)}.</div></div>` : ""}
    </section>`;

    const powerDaySet = [...new Set([dayOf(p.driver), dayOf(p.conductor)])];
    const colorSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.colours}</span>${t("secColours", "Lucky Colours & Day-wise Dressing")}</h2>
      <div class="card">
        <div class="card-title">Your Power Colours</div>
        <div class="kit-value">${lang === "hi" ? `अधिकांशतः <strong>${esc(db.numbers[p.driver].color)}</strong> पहनें — यह आपके मूलांक ${p.driver} (${esc(db.numbers[p.driver].planet)}) को शक्ति देता है। महत्वपूर्ण बैठकों और निर्णयों में <strong>${esc(db.numbers[p.conductor].color)}</strong> जोड़ें।` : lang === "gu" ? `મોટેભાગે <strong>${esc(db.numbers[p.driver].color)}</strong> પહેરો — આ તમારા મૂળાંક ${p.driver} (${esc(db.numbers[p.driver].planet)}) ને બળ આપે છે. મહત્વના કાર્યોમાં <strong>${esc(db.numbers[p.conductor].color)}</strong> ઉમેરો.` : `Wear <strong>${esc(db.numbers[p.driver].color)}</strong> most often — they feed your Driver ${p.driver} (${esc(db.numbers[p.driver].planet)}), your core personality. Add <strong>${esc(db.numbers[p.conductor].color)}</strong> for important days, meetings and decisions — they support your Conductor ${p.conductor} (${esc(db.numbers[p.conductor].planet)}).`}</div>
      </div>
      <div class="card">
        <div class="card-title">${lang === "hi" ? "दिन अनुसार क्या पहनें" : lang === "gu" ? "વાર મુજબ શું પહેરવું" : "What to Wear, Day by Day"}</div>
        <div class="table-scroll"><table class="rtable">
          <tr><th>Day</th><th>Planet</th><th>Wear these colours</th><th>Note</th></tr>
          ${db.dayWear.map((d) => `<tr${powerDaySet.includes(d.day) ? ' class="hl-row"' : ""}>
            <td><strong>${esc(d.day)}</strong>${powerDaySet.includes(d.day) ? ` <span class="badge good">${lang === "hi" ? "आपका मुख्य शुभ वार" : lang === "gu" ? "તમારો મુખ્ય શુભ વાર" : "Your power day"}</span>` : ""}</td>
            <td>${esc(db.numbers[d.num].planet.split(" ")[0])}</td>
            <td>${esc(d.colors)}</td>
            <td>${esc(d.note)}</td>
          </tr>`).join("")}
        </table></div>
        <div class="card-sub">${lang === "hi" ? "नियम: अपने मुख्य शुभ वार पर कभी फटे या पुराने कपड़े न पहनें — उस दिन ग्रह ऊर्जा सीधे आकर्षित होती है।" : lang === "gu" ? "નિયમ: તમારા મુખ્ય શુભ વારે ક્યારેય ફાટેલા કે જૂના કપડાં ન પહેરો — તે દિવસે ગ્રહ ઊર્જા સીધી આકર્ષિત થાય છે." : "Rule of thumb: never wear dull or torn clothes on your power days — that is when your planets receive energy most directly."}</div>
      </div>
    </section>`;

    const driverCareers = db.careers[p.driver], conductorCareers = db.careers[p.conductor];
    const overlap = driverCareers.filter((c) => conductorCareers.includes(c));
    const careerSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.career}</span>${t("secCareer", "Best Fields & Professions")}</h2>
      <p class="rsection-desc">Fields ruled by your Driver suit your natural talent; fields ruled by your Conductor bring destiny-level success. The sweet spot is where they overlap.</p>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">Natural Talent — Driver ${p.driver} (${esc(db.numbers[p.driver].planet)})</div>
          <div class="kit">${driverCareers.map((c) => `<div class="kit-row"><div class="kit-ico">›</div><div class="kit-body"><div class="kit-value">${esc(c)}</div></div></div>`).join("")}</div>
        </div>
        <div class="card">
          <div class="card-title">Destiny Growth — Conductor ${p.conductor} (${esc(db.numbers[p.conductor].planet)})</div>
          <div class="kit">${conductorCareers.map((c) => `<div class="kit-row"><div class="kit-ico">›</div><div class="kit-body"><div class="kit-value">${esc(c)}</div></div></div>`).join("")}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Career Direction Verdict</div>
        <div class="kit-value">${overlap.length
          ? (lang === "hi" ? `आपकी प्रतिभा और भाग्य का सुंदर मिलन: <strong>${overlap.map(esc).join(", ")}</strong> — इन क्षेत्रों को प्राथमिकता दें।` : lang === "gu" ? `તમારી આવડત અને ભાગ્યનો સુંદર મેળ: <strong>${overlap.map(esc).join(", ")}</strong> — આ ક્ષેત્રોને પ્રાથમિકતા આપો.` : `Your talent and destiny align beautifully in: <strong>${overlap.map(esc).join(", ")}</strong> — prioritise these for the highest chance of excelling.`)
          : (lang === "hi" ? `मूलांक और भाग्यांक अलग-अलग क्षेत्रों की ओर संकेत करते हैं — दोनों को मिलाएं (जैसे मूलांक ${p.driver} का कौशल भाग्यांक ${p.conductor} के उद्योग में लगाएं)।` : lang === "gu" ? `મૂળાંક અને ભાગ્યાંક અલગ ક્ષેત્રો સૂચવે છે — બંનેને જોડો (જેમ કે મૂળાંક ${p.driver} નું કૌશલ્ય ભાગ્યાંક ${p.conductor} ના ઉદ્યોગમાં વાપરો).` : `Your Driver and Conductor pull towards different fields — combine them (e.g. a Driver-${p.driver} skill applied inside a Conductor-${p.conductor} industry) and success probability multiplies.`)}
          ${p.loShuMissing.includes(3) ? ` Number 3 (Jupiter) is missing from your grid — careers involving teaching, finance or advisory need extra Jupiter remedy support (see Section 4).` : ""}
          ${p.loShuMissing.includes(8) ? ` Number 8 (Saturn) is missing — long-term career stability improves as you apply the Saturn remedies in Section 4.` : ""}</div>
      </div>
    </section>`;

    const pinn = timing.pinnacles || { phases: [], firstEnd: null };
    const agesLbl = lang === "hi" ? "आयु" : lang === "gu" ? "ઉંમર" : "Ages";
    const pinnacleCard = `<div class="card" id="pinnacles-card">
        <div class="card-title">${t("pinnacleCardTitle", "Four Life Phases — Pinnacles & Challenges")}</div>
        <div class="table-scroll"><table class="rtable">
          <tr><th>${lang === "hi" ? "चरण" : lang === "gu" ? "તબક્કો" : "Phase"}</th><th>${lang === "hi" ? "आयु व वर्ष" : lang === "gu" ? "ઉંમર અને વર્ષ" : "Ages & Years"}</th><th>${lang === "hi" ? "पिनेकल (शिखर) — उभरती ऊर्जा" : lang === "gu" ? "પિનેકલ (શિખર) — ઊભરતી ઊર્જા" : "Pinnacle — rising energy"}</th><th>${lang === "hi" ? "चुनौती — सीखने योग्य पाठ" : lang === "gu" ? "પડકાર — શીખવા જેવી સીખ" : "Challenge — lesson to master"}</th></tr>
          ${pinn.phases.map((ph) => {
            const pk = (db.pinnacle && db.pinnacle[ph.pinnacle]) || {};
            const cl = (db.challengeLesson && db.challengeLesson[ph.challenge]) || {};
            const ageSpan = ph.to === null ? `${agesLbl} ${ph.from}+` : `${agesLbl} ${ph.from}–${ph.to}`;
            const yearSpan = ph.to === null ? `${p.year + ph.from} →` : `${p.year + ph.from}–${p.year + ph.to}`;
            const cur = timing.curAge >= ph.from && (ph.to === null || timing.curAge <= ph.to);
            return `<tr${cur ? ' class="hl-row"' : ""}>
            <td><strong>${lang === "hi" ? "चरण" : lang === "gu" ? "તબક્કો" : "Phase"} ${ph.i}</strong>${cur ? ` <span class="badge info">${lang === "hi" ? "वर्तमान" : lang === "gu" ? "હાલમાં" : "Now"}</span>` : ""}</td>
            <td>${ageSpan} <span class="card-sub">(${yearSpan})</span></td>
            <td><strong>${ph.pinnacle}</strong> (${esc(db.numbers[ph.pinnacle].planet.split(" ")[0])}) — ${esc(loc(pk.theme, lang))}</td>
            <td><strong>${ph.challenge}</strong> — ${esc(loc(cl, lang))}</td>
          </tr>`;
          }).join("")}
        </table></div>
        <div class="judge-note"><strong>${t("howWeJudge", "How we judge this:")}</strong> ${lang === "hi" ? "पिनेकल जन्मतिथि से निकाले जाते हैं — दिन+माह, दिन+वर्ष, उन दोनों का योग, और माह+वर्ष। चुनौतियां इन्हीं घटकों के अंतर हैं। पहला चरण <strong>36 − भाग्यांक</strong> की उम्र तक चलता है, उसके बाद प्रत्येक चरण ९ वर्ष का होता है। हर चरण की शिखर-ऊर्जा को साधें और चुनौती की सीख अपनाएं — यही उस दौर का सबसे तेज़ मार्ग है।" : lang === "gu" ? "પિનેકલ જન્મતારીખથી નિગમે છે — દિવસ+માસ, દિવસ+વર્ષ, તે બંનેનો સરવાળો, અને માસ+વર્ષ. પડકારો એ જ ઘટકોના તફાવત છે. પહેલો તબક્કો <strong>36 − ભાગ્યાંક</strong> ઉંમર સુધી ચાલે છે, પછી દરેક તબક્કો ૯ વર્ષનો. દરેક તબક્કાની શિખર-ઊર્જાને વધારો અને પડકારની સીખ અપનાવો — એ જ તે સમયનો સૌથી ઝડપી માર્ગ છે." : "Pinnacles are derived from your birth date — day+month, day+year, their sum, and month+year. Challenges are the gaps between those same components. The first phase runs to <strong>36 − Conductor</strong>, each phase after spans 9 years. Grow into each phase's rising energy while mastering its challenge — that is the fastest route through the period."}</div>
      </div>`;

    const timingSection = `<section class="rsection" id="timing-section" data-authority="personal-year-context">
      <h2 class="rsection-title"><span class="idx">${SECTION.timing}</span>${t("secTiming", "Long-range Personal-Year Context")}</h2>
      <p class="rsection-desc">${lang === "hi" ? "यह मूलांक/भाग्यांक से निकला व्यापक personal-year संदर्भ है, सक्रिय भविष्यवाणी नहीं। वर्तमान दशा की तिथियां, event windows और Active Vastu Zone केवल नीचे के Dasha roadmap से तय होते हैं।" : lang === "gu" ? "આ મૂળાંક/ભાગ્યાંક પરથી આવેલો વ્યાપક personal-year સંદર્ભ છે, સક્રિય આગાહી નથી. વર્તમાન દશાની તારીખો, event windows અને Active Vastu Zone ફક્ત નીચેના Dasha roadmap થી નક્કી થાય છે." : "This is broad Driver/Conductor personal-year context, not active prediction. Current Dasha dates, event windows and the Active Vastu Zone are determined only by the Dasha roadmap below."}</p>
      <div class="card">
        <div class="card-title">${lang === "hi" ? "व्यक्तिगत वर्ष संदर्भ" : lang === "gu" ? "વ્યક્તિગત વર્ષ સંદર્ભ" : "Personal-Year Reference"}</div>
        <div class="table-scroll"><table class="rtable">
          <tr><th>Year</th><th>Personal Year</th><th>Reflection theme — not Dasha timing</th></tr>
          ${timing.years.map((y) => `<tr${y.current ? ' class="hl-row"' : ""}>
            <td><strong>${y.yr}</strong>${y.current ? ` <span class="badge info">${lang === "hi" ? "वर्तमान" : lang === "gu" ? "હાલમાં" : "Now"}</span>` : ""}</td>
            <td>${y.n} (${esc(db.numbers[y.n].planet.split(" ")[0])})</td>
            <td>${esc(y.meaning)}</td>
          </tr>`).join("")}
        </table></div>
      </div>
      ${pinnacleCard}
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">${lang === "hi" ? "सहायक personal-year themes" : lang === "gu" ? "સહાયક personal-year themes" : "Supportive Personal-Year Themes"}</div>
          <div class="kit">${timing.luckyYears.map((l) => `<div class="kit-row"><div class="kit-ico"><strong>${l.yr}</strong></div><div class="kit-body"><div class="kit-value">Personal year ${l.py} — ${esc(l.why)}</div></div></div>`).join("")}</div>
          <div class="card-sub">${lang === "hi" ? "इन्हें व्यापक reflection के रूप में पढ़ें; किसी भी समय-संवेदी निर्णय के लिए नीचे की दशा-window देखें।" : lang === "gu" ? "તેને વ્યાપક reflection તરીકે વાંચો; કોઈ પણ સમય-સંવેદનશીલ નિર્ણય માટે નીચેની દશા-window જુઓ." : "Read these as broad reflection themes; use the Dasha windows below for time-sensitive decisions."}</div>
        </div>
        <div class="card">
          <div class="card-title">${lang === "hi" ? "जीवन के पड़ाव — reflection" : lang === "gu" ? "જીવનના પડાવ — reflection" : "Milestone Ages — Reflection"}</div>
          <div class="kit">${timing.milestones.map((m) => `<div class="kit-row"><div class="kit-ico"><strong>${m.age}</strong></div><div class="kit-body"><div class="kit-value">Year ${m.yr} — ${esc(m.why)}</div></div></div>`).join("")}</div>
          <div class="card-sub">${lang === "hi" ? "ये उम्र आत्म-चिंतन के पड़ाव हैं; सक्रिय अवसर-दिनांक और दिशा के लिए दशा roadmap देखें।" : lang === "gu" ? "આ ઉમર આત્મ-ચિંતનના પડાવ છે; સક્રિય તક-તારીખો અને દિશા માટે દશા roadmap જુઓ." : "These ages are reflection milestones; use the Dasha roadmap for active opportunity dates and direction."}</div>
        </div>
      </div>
    </section>`;

    /* ---- Section: Numerology Dasha timeline + life-event windows ---- */
    const dashaSection = (function () {
      const dl = dashaTimeline(p);
      const dashaDB = db.dasha || (window.DB && window.DB.dasha) || {};
      if (!dashaDB[1]) return "";
      const planetOf = (n) => esc(db.numbers[n].planet.split(" ")[0]);
      const yearOfMs = (ms) => new Date(ms).getFullYear();
      const cur = dl.current;
      const mdInfo = dashaDB[cur.md.n] || {}, adInfo = dashaDB[cur.ad.n] || {}, pdInfo = dashaDB[cur.pd.n] || {};
      const nowLbl = lang === "hi" ? "वर्तमान" : lang === "gu" ? "હાલમાં" : "Now";
      const agesLbl2 = lang === "hi" ? "आयु" : lang === "gu" ? "ઉંમર" : "Ages";
      const relBadgeFor = (n) => {
        const rd = relation(p.driver, n);
        return rd === "friendly" ? `<span class="badge good">${lang === "hi" ? "मित्र ग्रह" : lang === "gu" ? "મિત્ર ગ્રહ" : "Friendly to you"}</span>`
          : rd === "enemy" ? `<span class="badge warn">${lang === "hi" ? "सावधानी काल" : lang === "gu" ? "સાવધાની કાળ" : "Handle with care"}</span>`
          : `<span class="badge info">${lang === "hi" ? "तटस्थ" : lang === "gu" ? "તટસ્થ" : "Neutral"}</span>`;
      };

      const stackCard = `<div class="card">
        <div class="goal-head">
          <div class="card-title">${lang === "hi" ? "आपका सक्रिय दशा-क्रम" : lang === "gu" ? "તમારો સક્રિય દશા-ક્રમ" : "Your Active Dasha Stack"}</div>
          <span class="badge info">${lang === "hi" ? "शास्त्रीय आनुपातिक (४५-वर्ष)" : lang === "gu" ? "શાસ્ત્રીય પ્રમાણસર (૪૫-વર્ષ)" : "Classical Proportional (45-Yr)"}</span>
        </div>
        <div class="card-grid" style="margin-top:10px">
          <div class="card num-card">
            <div class="num-value">${cur.md.n}</div>
            <div class="num-label">${lang === "hi" ? "महादशा" : lang === "gu" ? "મહાદશા" : "Mahadasha"} · ${planetOf(cur.md.n)}</div>
            <div class="num-sub">${yearOfMs(cur.md.startMs)}–${yearOfMs(cur.md.endMs)} (${agesLbl2} ${cur.md.fromAge}–${cur.md.toAge}) ${relBadgeFor(cur.md.n)}</div>
          </div>
          <div class="card num-card">
            <div class="num-value alt">${cur.ad.n}</div>
            <div class="num-label">${lang === "hi" ? "अंतर्दशा" : lang === "gu" ? "અંતર્દશા" : "Antardasha"} · ${planetOf(cur.ad.n)}</div>
            <div class="num-sub">${prettyDate(cur.ad.startMs)} → ${prettyDate(cur.ad.endMs)}</div>
            <div class="progress-track" role="progressbar" aria-valuenow="${cur.adProgress}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${cur.adProgress}%"></div></div>
            <div class="num-sub">${cur.adProgress}% ${lang === "hi" ? "पूर्ण" : lang === "gu" ? "પૂર્ણ" : "elapsed"}</div>
          </div>
          <div class="card num-card">
            <div class="num-value" style="font-size:26px">${cur.pd.n}</div>
            <div class="num-label">${lang === "hi" ? "प्रत्यंतर दशा" : lang === "gu" ? "પ્રત્યંતર દશા" : "Pratyantar Dasha"} · ${planetOf(cur.pd.n)}</div>
            <div class="num-sub">${cur.pdDaysLeft} ${lang === "hi" ? "दिन शेष" : lang === "gu" ? "દિવસ બાકી" : "days remaining"} (${lang === "hi" ? "तक" : lang === "gu" ? "સુધી" : "until"} ${prettyDate(cur.pd.endMs)})</div>
          </div>
        </div>
        <div class="kit-value"><strong>${lang === "hi" ? `इस काल का स्वर — महादशा ${cur.md.n} (${planetOf(cur.md.n)}):` : lang === "gu" ? `આ સમયગાળાનો સૂર — મહાદશા ${cur.md.n} (${planetOf(cur.md.n)}):` : `The tone of this chapter — Mahadasha ${cur.md.n} (${planetOf(cur.md.n)}):`}</strong> ${esc(loc(mdInfo.theme, lang))}</div>
        <div class="kit-value"><strong>${lang === "hi" ? `इस वर्ष की धारा — अंतर्दशा ${cur.ad.n} (${planetOf(cur.ad.n)}):` : lang === "gu" ? `આ વર્ષની ધારા — અંતર્દશા ${cur.ad.n} (${planetOf(cur.ad.n)}):` : `The current within it — Antardasha ${cur.ad.n} (${planetOf(cur.ad.n)}):`}</strong> ${esc(loc(adInfo.events, lang))}. <em>${esc(loc(adInfo.caution, lang))}</em></div>
        <div class="kit-row" data-dasha-vastu-zone="active"><div class="kit-ico">🧭</div><div class="kit-body">
          <div class="kit-label">${lang === "hi" ? "सक्रिय वास्तु क्षेत्र: इस उप-काल में इसे साधें" : lang === "gu" ? "સક્રિય વાસ્તુ ક્ષેત્ર: આ ઉપ-કાળમાં આને સાધો" : "Active Vastu Zone: Prioritise this sector now"}</div>
          <div class="kit-value">${lang === "hi" ? `आपके वर्तमान उप-स्वामी <strong>${planetOf(cur.ad.n)} (अंतर्दशा ${cur.ad.n})</strong> का क्षेत्र <strong>${esc(loc(adInfo.zone, lang))}</strong> (${esc(adInfo.zoneElement || "")}) है। ${esc(loc(adInfo.zoneRemedy, lang))}` : lang === "gu" ? `તમારા વર્તમાન ઉપ-સ્વામી <strong>${planetOf(cur.ad.n)} (અંતર્દશા ${cur.ad.n})</strong> નું ક્ષેત્ર <strong>${esc(loc(adInfo.zone, lang))}</strong> (${esc(adInfo.zoneElement || "")}) છે. ${esc(loc(adInfo.zoneRemedy, lang))}` : `Your current sub-ruler is <strong>${planetOf(cur.ad.n)} (AD ${cur.ad.n})</strong> — its sector is the <strong>${esc(loc(adInfo.zone, lang))}</strong> (${esc(adInfo.zoneElement || "")}). ${esc(loc(adInfo.zoneRemedy, lang))}`}</div>
          <div class="kit-value">${lang === "hi" ? `सूक्ष्म-काल के लिए: प्रत्यंतर स्वामी ${planetOf(cur.pd.n)} — ${esc(loc(pdInfo.zone, lang))} को भी स्वच्छ रखें।` : lang === "gu" ? `સૂક્ષ્મ-કાળ માટે: પ્રત્યંતર સ્વામી ${planetOf(cur.pd.n)} — ${esc(loc(pdInfo.zone, lang))} ને પણ સ્વચ્છ રાખો.` : `For the micro-period: Pratyantar lord ${planetOf(cur.pd.n)} — also keep the ${esc(loc(pdInfo.zone, lang))} clean and serviced.`}</div>
        </div></div>
      </div>`;

      const ladderCard = `<div class="card">
        <div class="card-title">${lang === "hi" ? "जीवन-भर की महादशा सीढ़ी" : lang === "gu" ? "જીવનભરની મહાદશા સીડી" : "Lifetime Mahadasha Ladder"}</div>
        <div class="table-scroll"><table class="rtable">
          <tr><th>${lang === "hi" ? "महादशा" : lang === "gu" ? "મહાદશા" : "Mahadasha"}</th><th>${lang === "hi" ? "आयु व वर्ष" : lang === "gu" ? "ઉંમર અને વર્ષ" : "Ages & Years"}</th><th>${lang === "hi" ? "काल का विषय" : lang === "gu" ? "કાળનો વિષય" : "Theme of the period"}</th></tr>
          ${dl.mahadashas.map((m) => {
            const info = dashaDB[m.n] || {};
            return `<tr${m.current ? ' class="hl-row"' : ""}>
              <td><strong>${m.n}</strong> · ${planetOf(m.n)}${m.current ? ` <span class="badge info">${nowLbl}</span>` : ""}</td>
              <td>${agesLbl2} ${m.fromAge}–${m.toAge} <span class="card-sub">(${yearOfMs(m.startMs)}–${yearOfMs(m.endMs)})</span></td>
              <td>${esc(loc(info.theme, lang))}</td>
            </tr>`;
          }).join("")}
        </table></div>
      </div>`;

      const eventRows = dl.events.map((e) => {
        const lbl = esc(loc(e.def.label, lang));
        const windows = e.future.length
          ? e.future.map((w) => {
              const badge = w.active ? ` <span class="badge good">${lang === "hi" ? "अभी सक्रिय" : lang === "gu" ? "હમણાં સક્રિય" : "Active now"}</span>` : "";
              return `<div class="kit-value"><strong>${yearOfMs(w.startMs)}–${yearOfMs(w.endMs)}</strong> (${agesLbl2} ${w.fromAge}–${w.toAge}) — ${lang === "hi" ? "महादशा" : lang === "gu" ? "મહાદશા" : "MD"} ${w.mdN} (${planetOf(w.mdN)}) · ${lang === "hi" ? "अंतर्दशा" : lang === "gu" ? "અંતર્દશા" : "AD"} ${w.adN} (${planetOf(w.adN)})${badge}</div>`;
            }).join("")
          : `<div class="kit-value">${lang === "hi" ? "इस scan में निकट भविष्य की कोई प्रबल दशा-window नहीं है — व्यवहारिक तैयारी जारी रखें और अगला दशा संक्रमण देखें।" : lang === "gu" ? "આ scan માં નજીકના ભવિષ્યની કોઈ પ્રબળ દશા-window નથી — વ્યવહારિક તૈયારી ચાલુ રાખો અને આગળનું દશા પરિવર્તન જુઓ." : "No strong upcoming Dasha window appears in this scan — keep practical preparation steady and watch the next Dasha transition."}</div>`;
        const pastLine = e.pastBest
          ? `<div class="card-sub">${lang === "hi" ? `पिछली प्रबल विंडो: ${yearOfMs(e.pastBest.startMs)}–${yearOfMs(e.pastBest.endMs)} (आयु ${e.pastBest.fromAge}–${e.pastBest.toAge}) — मिलान करें कि उस दौर में क्या घटा था।` : lang === "gu" ? `ગત પ્રબળ વિન્ડો: ${yearOfMs(e.pastBest.startMs)}–${yearOfMs(e.pastBest.endMs)} (ઉંમર ${e.pastBest.fromAge}–${e.pastBest.toAge}) — તે સમયગાળામાં શું બન્યું હતું તે સરખાવો.` : `Strongest past window: ${yearOfMs(e.pastBest.startMs)}–${yearOfMs(e.pastBest.endMs)} (ages ${e.pastBest.fromAge}–${e.pastBest.toAge}) — cross-check what actually happened then; it is your personal proof of how this cycle speaks.`}</div>`
          : "";
        return `<div class="kit-row"><div class="kit-ico">${e.def.icon || "★"}</div><div class="kit-body">
          <div class="kit-label">${lbl}</div>
          ${windows}
          ${pastLine}
        </div></div>`;
      }).join("");

      const eventsCard = `<div class="card">
        <div class="card-title">${lang === "hi" ? "जीवन-घटना विंडो — विवाह, विदेश, करियर, संपत्ति, धन" : lang === "gu" ? "જીવન-ઘટના વિન્ડો — લગ્ન, વિદેશ, કારકિર્દી, મિલકત, ધન" : "Life-Event Windows — marriage, abroad, career, property, wealth"}</div>
        <div class="card-sub">${lang === "hi" ? "प्रत्येक विंडो वह अवधि है जब उस घटना के शास्त्रीय कारक ग्रह (जैसे विवाह के लिए शुक्र-चंद्र, विदेश के लिए राहु-केतु) महादशा-अंतर्दशा में सक्रिय होते हैं। ये दशा-आधारित अनुकूल अवसर-काल हैं, निश्चित भविष्यवाणी नहीं।" : lang === "gu" ? "દરેક વિન્ડો એ સમયગાળો છે જ્યારે તે ઘટનાના શાસ્ત્રીય કારક ગ્રહો (જેમ કે લગ્ન માટે શુક્ર-ચંદ્ર, વિદેશ માટે રાહુ-કેતુ) મહાદશા-અંતર્દશામાં સક્રિય હોય છે. આ દશા-આધારિત અનુકૂળ તક-કાળ છે, નિશ્ચિત ભવિષ્યવાણી નથી." : "Each window marks when the classical significators of that event (Venus–Moon for marriage, Rahu–Ketu for abroad, Sun–Saturn for career, and so on) become active in your Mahadasha–Antardasha stack. Read them as Dasha-based favourable opportunity periods, not fixed predictions."}</div>
        <div class="kit">${eventRows}</div>
      </div>`;

      return `<section class="rsection" id="dasha-section" data-authority="dasha">
        <h2 class="rsection-title"><span class="idx">${SECTION.dasha}</span>${t("secDasha", "Dasha Timeline — Life Event Windows")}</h2>
        <p class="rsection-desc">${lang === "hi" ? "अंक-ज्योतिष की दशा प्रणाली: जन्म से आपका मूलांक अपनी महादशा शुरू करता है (अंक = वर्ष), फिर क्रम ९ अंकों में घूमता है। हर महादशा के भीतर अंतर्दशा और प्रत्यंतर दशा उसी अनुपात में चलती हैं — यही बताता है कि कौन-सा ग्रह अभी आपके जीवन का 'ऑपरेटिंग सिस्टम' चला रहा है।" : lang === "gu" ? "અંક-જ્યોતિષની દશા પ્રણાલી: જન્મથી તમારો મૂળાંક પોતાની મહાદશા શરૂ કરે છે (અંક = વર્ષ), પછી ક્રમ ૯ અંકોમાં ફરે છે. દરેક મહાદશાની અંદર અંતર્દશા અને પ્રત્યંતર દશા એ જ પ્રમાણમાં ચાલે છે — એ જ બતાવે છે કે કયો ગ્રહ અત્યારે તમારા જીવનની 'ઓપરેટિંગ સિસ્ટમ' ચલાવે છે." : "The Ank Jyotish dasha system: from birth, your Moolank opens its own Mahadasha (number = years), then the sequence walks the 9 numbers in order. Inside every Mahadasha run proportional Antardashas and Pratyantar dashas — together they show which planet is running your life's operating system right now."}</p>
        ${stackCard}
        ${ladderCard}
        ${eventsCard}
        <div class="judge-note"><strong>${t("howWeJudge", "How we judge this:")}</strong> ${lang === "hi" ? "हम शास्त्रीय आनुपातिक चक्र (महादशा × अंतर्दशा ÷ ४५) का उपयोग करते हैं, जो हर उप-काल को ग्रह के भार के अनुपात में रखता है — इससे महादशा, अंतर्दशा और प्रत्यंतर तीनों स्तर गणितीय रूप से एक-दूसरे में सटीक बैठते हैं। <em>वैकल्पिक पद्धति:</em> कुछ आधुनिक अंकशास्त्री अंतर्दशा को जन्मदिन-से-जन्मदिन के ठीक १-वर्ष खंड मानते हैं; दोनों विद्यालय प्रचलित हैं, तिथियां थोड़ी भिन्न आ सकती हैं। घटना-विंडो केवल सक्रिय महादशा-अंतर्दशा के कारक ग्रहों से बनती है; लो शू और वैदिक जन्म-ग्रिड इन्हें नहीं बदलते।" : lang === "gu" ? "અમે શાસ્ત્રીય પ્રમાણસર ચક્ર (મહાદશા × અંતર્દશા ÷ ૪૫) નો ઉપયોગ કરીએ છીએ, જે દરેક ઉપ-કાળને ગ્રહના ભાર પ્રમાણે રાખે છે — તેથી મહાદશા, અંતર્દશા અને પ્રત્યંતર ત્રણેય સ્તર ગણિતની રીતે એકબીજામાં ચોક્કસ બેસે છે. <em>વૈકલ્પિક પદ્ધતિ:</em> કેટલાક આધુનિક અંકશાસ્ત્રીઓ અંતર્દશાને જન્મદિવસ-થી-જન્મદિવસ બરાબર ૧-વર્ષ ખંડ ગણે છે; બંને શાળાઓ પ્રચલિત છે, તારીખો થોડી અલગ આવી શકે છે. ઘટના-વિન્ડો ફક્ત સક્રિય મહાદશા-અંતર્દશાના કારક ગ્રહોથી બને છે; લો શુ અને વૈદિક જન્મ-ગ્રિડ તેને બદલતા નથી." : "We use the classical Vimshottari-derived proportional cycle (MD × AD ÷ 45), which scales each sub-period relative to planetary weight — keeping nested mathematical continuity across the Mahadasha, Antardasha and Pratyantar levels. <em>Note on alternative schools:</em> some modern practitioners run Antardashas as flat 1-year blocks aligned to your solar return (birthday to birthday); both schools are in live use and dates can shift slightly between them. Event windows use only the active Mahadasha–Antardasha significator pattern; neither Lo Shu nor Vedic birth-grid counts can change them." + (p.birthTime ? " Your exact birth time anchors the cycle boundaries." : ` Cycle boundaries are anchored to your date of birth at midnight — add your exact birth time in the intake form for finer boundaries.`)}</div>
      </section>`;
    })();

    const memorySection = `<section class="rsection" id="memory-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.memory}</span>${t("secMemory", "Your Evolving Chart")}</h2>
      <p class="rsection-desc">This section is private, on-device memory only. It helps the app learn your own journey over time without uploading personal data.</p>
      <div class="insight-grid">
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "सुरक्षित चार्ट" : lang === "gu" ? "સેવ કરેલા ચાર્ટ" : "Saved snapshots"}</div>
          <div class="metric-value">${evolving.snapshots.length}</div>
          <div class="metric-sub">${lang === "hi" ? `नवीनतम: ${evolving.snapshots[0] ? prettyDate(evolving.snapshots[0].savedAt) : "अभी सुरक्षित नहीं"}` : lang === "gu" ? `તાજેતરનું: ${evolving.snapshots[0] ? prettyDate(evolving.snapshots[0].savedAt) : "હજી સેવ નથી"}` : `Latest saved on ${evolving.snapshots[0] ? prettyDate(evolving.snapshots[0].savedAt) : "this device not yet"}`}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "इस वर्ष का प्रभाव" : lang === "gu" ? "આ વર્ષનો પ્રભાવ" : "This year in context"}</div>
          <div class="metric-value">${evolving.currentYearLucky ? (lang === "hi" ? "अनुकूल" : lang === "gu" ? "અનુકૂળ" : "Favourable") : (lang === "hi" ? "धैर्य से निर्माण" : lang === "gu" ? "ધીરજથી નિર્માણ" : "Build steadily")}</div>
          <div class="metric-sub">${evolving.currentYearLucky ? (lang === "hi" ? "यह वर्ष आपके शुभ वर्षों की सूची में आता है।" : lang === "gu" ? "આ વર્ષ તમારા શુભ વર્ષોની યાદીમાં આવે છે." : "This year appears in your lucky-year window.") : (lang === "hi" ? "अनुशासन और निरंतरता बनाए रखें।" : lang === "gu" ? "શિસ્ત અને સાતત્ય જાળવી રાખો." : "Not one of your top timing windows — use discipline and consistency.")}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "इस वर्ष दर्ज कदम" : lang === "gu" ? "આ વર્ષે નોંધેલા પગલાં" : "Moves logged this year"}</div>
          <div class="metric-value">${evolving.movesThisYear}</div>
          <div class="metric-sub">A local reality-check against your timing cycle.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "ज्ञान का स्रोत" : lang === "gu" ? "જ્ઞાનનો સ્ત્રોત" : "Knowledge source"}</div>
          <div class="metric-value">v${esc(activePack().packVersion)}</div>
          <div class="metric-sub">${esc(activePack().source === "remote" ? "Live-updated content pack" : activePack().source === "cached" ? "Cached content pack" : "Bundled starter pack")}</div>
        </div>
      </div>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">${lang === "hi" ? "इस महीने उपायों का अभ्यास" : lang === "gu" ? "આ મહિને ઉપાયોનો અભ્યાસ" : "Remedy engagement this month"}</div>
          <div class="card-sub">${lang === "hi" ? "एक टैप से अपने मुख्य ग्रहों का चेक-इन दर्ज करें।" : lang === "gu" ? "એક ટેપથી તમારા મુખ્ય ગ્રહોનું ચેક-ઇન નોંધો." : "One tap adds a private check-in for the planets that matter most in this chart."}</div>
          <div class="engagement-list">
            ${evolving.practiceSummary.map((item) => `<div class="engagement-item"><div><strong>${item.n} — ${esc(db.numbers[item.n].planet)}</strong><span>${item.month} logged this month · ${item.total} total</span></div><button class="btn btn-secondary btn-32" type="button" data-practice-number="${item.n}">${lang === "hi" ? "अभ्यास दर्ज करें" : lang === "gu" ? "અભ્યાસ નોંધો" : "Log practice"}</button></div>`).join("")}
          </div>
        </div>
        <div class="card">
          <div class="card-title">${lang === "hi" ? "शुभ समय बनाम वास्तविक कर्म" : lang === "gu" ? "શુભ સમય વિરુદ્ધ વાસ્તવિક કર્મ" : "Lucky-year timing vs what you actually did"}</div>
          <div class="card-sub">${lang === "hi" ? "कोई बड़ा निर्णय या उपाय की शुरुआत यहां स्थानीय रूप से दर्ज करें।" : lang === "gu" ? "કોઈ મોટો નિર્ણય કે ઉપાયની શરૂઆત અહીં નોંધો." : "Log a real-world move locally — job switch, launch, purchase, proposal, relocation, or a strong 40-day remedy push."}</div>
          <form id="localJournalForm" class="mini-form">
            <input id="localJournalText" class="input" type="text" maxlength="160" placeholder="${lang === "hi" ? "जैसे: शुक्रवार के शुक्र उपाय शुरू किए और बेडरूम का वास्तु सुधारा" : lang === "gu" ? "જેમ કે: શુક્રવારના શુક્ર ઉપાયો શરૂ કર્યા અને બેડરૂમનું વાસ્તુ સુધાર્યું" : "e.g. Started Friday Venus remedy streak and redesigned bedroom"}" />
            <button class="btn btn-primary btn-32" type="submit">${lang === "hi" ? "सुरक्षित करें" : lang === "gu" ? "સેવ કરો" : "Save locally"}</button>
          </form>
          <div class="timeline">
            ${evolving.journal.length ? evolving.journal.map((entry) => `<div class="timeline-item"><div><strong>${esc(entry.text)}</strong><span>${prettyDate(entry.at)}</span></div></div>`).join("") : `<div class="timeline-item"><div><strong>${lang === "hi" ? "अभी कोई नोट दर्ज नहीं है" : lang === "gu" ? "હજી કોઈ નોંધ દાખલ નથી" : "No local moves logged yet"}</strong><span>${lang === "hi" ? "आपकी टिप्पणियां पूरी तरह आपके डिवाइस पर ही रहती हैं।" : lang === "gu" ? "તમારી નોંધ સંપૂર્ણપણે તમારા ડિવાઇસ પર જ રહે છે." : "Your notes stay on this device and never enter the anonymous contribution payload."}</span></div></div>`}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">Anonymous contribution scaffold</div>
          <span class="badge ${state.contributionEnabled ? "good" : "warn"}">${state.contributionEnabled ? "Opted in" : "Off by default"}</span>
        </div>
        <div class="kit-value">${state.contributionEnabled ? "Only anonymous aggregate counts are prepared. If a contribution endpoint is configured in a future knowledge pack, the app can send just these counts — never names, DOBs, phones, vehicle numbers or your private notes." : "Anonymous cross-user learning is currently disabled for this device. You can turn it on in the intake form at any time."}</div>
        <div class="code-block">${esc(JSON.stringify(evolving.previewPayload, null, 2))}</div>
      </div>
    </section>`;

    /* This is a fixed home-placement context scan. It is intentionally placed
       in Timeline beside the Dasha-led active zone, but it never chooses that
       active zone or changes a period date. */
    const vastuSection = vastu.length
      ? `<section class="rsection" id="vastu-section" data-authority="home-vastu-context">
          <h2 class="rsection-title"><span class="idx">${SECTION.vastu}</span>${t("secVastu", "Home Vastu Context")}</h2>
          <p class="rsection-desc">${lang === "hi" ? "यह आपके दिए गए कमरे/दिशा विवरण का स्थिर home-context scan है। ऊपर का ‘Active Vastu Zone’ केवल वर्तमान दशा के स्वामियों से चुना जाता है; यह सूची उसे नहीं बदलती।" : lang === "gu" ? "આ તમારા આપેલા રૂમ/દિશા વિગતોનું સ્થિર home-context scan છે. ઉપરનો ‘Active Vastu Zone’ ફક્ત વર્તમાન દશાના સ્વામીઓ પરથી પસંદ થાય છે; આ યાદી તેને બદલતી નથી." : "This is a fixed home-context scan from the room directions you supplied. The ‘Active Vastu Zone’ above is selected only from the current Dasha lords; this list never changes it."}</p>
          <div class="card">
            <div class="kit">
            ${vastu.map((f) => `<div class="kit-row">
              <div class="kit-ico">${f.tone === "good" ? "✓" : f.tone === "warn" ? "!" : "✕"}</div>
              <div class="kit-body">
                <div class="kit-value"><strong>${esc(f.item)}</strong> <span class="badge ${f.tone}">${esc(f.label)}</span></div>
                <div class="card-sub">${esc(f.note)}</div>
              </div>
            </div>`).join("")}
            </div>
          </div>
          <p class="rsection-desc">${lang === "hi" ? "सामान्य रखरखाव: घर के मध्य (ब्रह्मस्थान) को खाली और साफ रखें; दोष वाले स्थान पर समुद्री नमक की कटोरी रखें और हर हफ्ते बदलें; ईशान कोण में रोज दीया जलाएं।" : lang === "gu" ? "સામાન્ય જાળવણી: ઘરના મધ્ય (બ્રહ્મસ્થાન) ને ખાલી અને સ્વચ્છ રાખો; દોષ વાળી જગ્યાએ દરિયાઈ મીઠાની વાટકી રાખો અને દર અઠવાડિયે બદલો; ઇશાન ખૂણામાં રોજ દીવો પ્રગટાવો." : "General upkeep: keep the centre (Brahmasthan) of the property empty and clean; place a bowl of sea salt in dosh zones and replace it weekly; keep the northeast lit with a daily diya."}</p>
        </section>`
      : `<section class="rsection" id="vastu-section" data-authority="home-vastu-context">
          <h2 class="rsection-title"><span class="idx">${SECTION.vastu}</span>${t("secVastu", "Home Vastu Context")}</h2>
          <p class="rsection-desc">${lang === "hi" ? "यह स्थिर home-context scan है; सक्रिय वास्तु क्षेत्र केवल वर्तमान दशा से आता है।" : lang === "gu" ? "આ સ્થિર home-context scan છે; સક્રિય વાસ્તુ ક્ષેત્ર ફક્ત વર્તમાન દશાથી આવે છે." : "This is a fixed home-context scan; the active Vastu zone comes only from the current Dasha."}</p>
          <div class="card"><div class="kit-value">${lang === "hi" ? "कोई वास्तु विवरण नहीं दिया गया था — मुख्य द्वार, रसोई, बेडरूम और टॉयलेट दर्ज कर पुनः जांचें।" : lang === "gu" ? "કોઈ વાસ્તુ વિગત આપી ન હતી — મુખ્ય દ્વાર, રસોડું, બેડરૂમ અને ટોઇલેટ દાખલ કરી ફરી તપાસો." : "No direction details were provided — re-run with your entrance, kitchen, bedroom and toilet directions for a full dosh scan."}</div></div>
        </section>`;

    const kuaInfo = p.kua ? db.kua[p.kua] : null;
    const kuaSection = `<section class="rsection" id="kua-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.kua}</span>${t("secKua", "Personal Lucky Directions — Kua Number")}</h2>
      <p class="rsection-desc">${lang === "hi" ? "नोट: <strong>कुआ अंक फेंगशुई (चीनी पद्धति)</strong> का हिस्सा है, शास्त्रीय वैदिक वास्तु का नहीं — इसे 'व्यक्तिगत शुभ दिशा' के रूप में यहां स्पष्ट रूप से अलग दिया गया है।" : lang === "gu" ? "નોંધ: <strong>કુઆ અંક ફેંગશુઈ (ચીની પદ્ધતિ)</strong> નો ભાગ છે, શાસ્ત્રીય વૈદિક વાસ્તુનો નહીં — તેને 'અંગત શુભ દિશા' તરીકે અહીં સ્પષ્ટ રીતે અલગ આપેલ છે." : 'Note: the <strong>Kua number is a Feng Shui (Chinese) system</strong>, not classical Vastu Shastra — we include it clearly separated because it is commonly requested as "your personal lucky direction".'}</p>
      ${kuaInfo ? `<div class="card">
        <div class="goal-head">
          <div class="card-title">${lang === "hi" ? `आपका कुआ अंक ${p.kua} है — ${esc(kuaInfo.group)}, ${esc(kuaInfo.element)} तत्व` : lang === "gu" ? `તમારો કુઆ અંક ${p.kua} છે — ${esc(kuaInfo.group)}, ${esc(kuaInfo.element)} તત્વ` : `Your Kua number is ${p.kua} — ${esc(kuaInfo.group)} group, ${esc(kuaInfo.element)} element`}</div>
          <span class="badge info">Feng Shui</span>
        </div>
        <div class="kit-value">${lang === "hi" ? `आपकी सर्वोत्तम दिशा (शेंग ची — धन व सफलता) <strong>${esc(kuaInfo.shengChi)}</strong> है। काम करते या सोते समय इस दिशा में मुंह/सिर रखें।` : lang === "gu" ? `તમારી સર્વોત્તમ દિશા (શેંગ ચી — ધન અને સફળતા) <strong>${esc(kuaInfo.shengChi)}</strong> છે. કામ કરતી વખતે કે સૂતી વખતે આ દિશા તરફ મોં/માથું રાખો.` : `Your best direction (Sheng Chi — wealth &amp; success) is <strong>${esc(kuaInfo.shengChi)}</strong>. Face this direction when working or sleeping for maximum support.`}</div>
        <div class="kit-value">${lang === "hi" ? `आपकी चार शुभ दिशाएं: <strong>${kuaInfo.auspicious.map(esc).join(", ")}</strong>। टेबल, बिस्तर और मुख्य द्वार को इन दिशाओं में रखें।` : lang === "gu" ? `તમારી ચાર શુભ દિશાઓ: <strong>${kuaInfo.auspicious.map(esc).join(", ")}</strong>. ટેબલ, પલંગ અને મુખ્ય દ્વારને આ દિશાઓમાં રાખો.` : `Your four auspicious directions: <strong>${kuaInfo.auspicious.map(esc).join(", ")}</strong>. Orient your desk, bed head and main door towards these wherever practical.`}</div>
      </div>` : `<div class="card"><div class="kit-value">${lang === "hi" ? "कुआ अंक जानने के लिए फॉर्म में 'विवरण बदलें' पर जाकर अपना लिंग (Gender) चुनें।" : lang === "gu" ? "કુઆ અંક જાણવા માટે ફોર્મમાં 'વિગત બદલો' પર જઈને તમારી જાતિ (Gender) પસંદ કરો." : 'Add your <strong>gender</strong> in the intake form (use "Edit Details" and re-run) to compute your Kua number and personal lucky directions.'}</div></div>`}
    </section>`;

    const partnerValid = p.partnerName && p.partnerDob && !isNaN(new Date(p.partnerDob).getTime());
    const partnerFirst = (p.partnerName || "").trim().split(/\s+/)[0] || (lang === "hi" ? "पार्टनर" : lang === "gu" ? "પાર્ટનર" : "partner");
    const partnerProfile = partnerValid
      ? computeProfile({ name: p.partnerName, dob: p.partnerDob, mobile: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", gender: "" })
      : null;
    const compat = partnerValid ? compatibility(p, partnerProfile) : null;
    const cRem = compat ? compatRemedies(p, partnerProfile, compat) : null;
    const LT = (en, hi, gu) => (lang === "hi" ? hi : lang === "gu" ? gu : en);

    /* Compatibility remains a relationship-reflection feature. It intentionally
       does not mint a second crystal/Rudraksha checklist or a competing
       40-day remedy plan; those remain governed by the primary Lo Shu chart. */
    const compatReflectionCard = !cRem ? "" : (function () {
      const rows = [];
      const friendlyPairs = compat.pairs.filter(function (pair) { return pair.r === "friendly"; });
      const neutralPairs = compat.pairs.filter(function (pair) { return pair.r === "neutral"; });
      const pairList = function (pairs) {
        return pairs.map(function (pair) { return "<strong>" + esc(pair.a) + " × " + esc(pair.b) + "</strong>"; }).join(" · ");
      };
      const intro = (compat.verdict === "Strong" || compat.verdict === "Good")
        ? LT("This pairing has a cooperative baseline. Read the strengths, watch points and communication cues below as shared planning prompts, not as a remedial checklist.",
             "इस मिलान का सहयोगी आधार है। नीचे की शक्तियों, ध्यान-बिंदुओं और संवाद-संकेतों को साझा योजना के संकेत की तरह लें, उपाय-list की तरह नहीं।",
             "આ જોડાણનો સહયોગી આધાર છે. નીચેની શક્તિઓ, ધ્યાન-બિંદુઓ અને સંવાદ-સંકેતોને સહભાગી આયોજનના સંકેત તરીકે લો, ઉપાય-list તરીકે નહીં.")
        : LT("This pairing benefits from conscious communication. The strengths, blind spots and practical cues below help you make agreements together; they are not a replacement for professional relationship support.",
             "इस मिलान को सजग संवाद से लाभ होगा। नीचे की शक्तियां, सावधानी-बिंदु और व्यावहारिक संकेत साथ में समझौते बनाने में मदद करते हैं; ये पेशेवर relationship support का विकल्प नहीं हैं।",
             "આ જોડાણને સજાગ સંવાદથી લાભ થશે. નીચેની શક્તિઓ, સાવચેતીના મુદ્દા અને વ્યવહારુ સંકેતો સાથે મળીને કરાર બનાવવા મદદ કરે છે; તે વ્યાવસાયિક relationship support નો વિકલ્પ નથી.");
      rows.push('<div class="card" id="compatibility-reflection" data-authority="compatibility-reflection">');
      rows.push('<div class="compatibility-reflection-intro">');
      rows.push('<div class="goal-head"><div class="card-title">🤝 ' + LT("Compatibility reflection", "सामंजस्य चिंतन", "સુસંગતતા ચિંતન") + " — " + esc(p.name.split(/\s+/)[0]) + " &amp; " + esc(partnerFirst) + '</div><span class="badge ' + (compat.enemy ? "warn" : "good") + '">' + (cRem.conflicts.length ? cRem.conflicts.length + " " + LT("friction pair(s)", "घर्षण जोड़(ें)", "ઘર્ષણ જોડી(ઓ)") : LT("no major friction", "मुख्य घर्षण नहीं", "મુખ્ય ઘર્ષણ નથી")) + "</span></div>");
      rows.push('<div class="kit-value">' + intro + "</div>");
      rows.push("</div>");

      rows.push('<div class="kit-row compatibility-strengths"><div class="kit-ico">✨</div><div class="kit-body"><div class="kit-label">' + LT("Mutual strengths", "परस्पर शक्तियां", "પરસ્પર શક્તિઓ") + '</div><div class="kit-value">' + (friendlyPairs.length
        ? LT(pairList(friendlyPairs) + " form supportive lanes between your two Driver/Conductor pairs. Use these natural points of agreement for shared decisions, appreciation and momentum.",
             pairList(friendlyPairs) + " आपके दो मूलांक/भाग्यांक जोड़ों के सहयोगी मार्ग हैं। इन सहज सहमतियों को साझा निर्णय, सराहना और गति के लिए उपयोग करें।",
             pairList(friendlyPairs) + " તમારા બે મૂળાંક/ભાગ્યાંક જોડીઓ વચ્ચે સહાયક માર્ગ બનાવે છે. આ સહજ સહમતીઓનો ઉપયોગ સહભાગી નિર્ણય, પ્રશંસા અને ગતિ માટે કરો.")
        : LT("No pair is marked harmonious yet. Build strength by making expectations and repair steps explicit rather than assuming alignment.",
             "अभी कोई जोड़ी harmonious चिह्नित नहीं है। अनकही सहमति मानने के बजाय अपेक्षाएं और सुधार के कदम स्पष्ट करके शक्ति बनाएं।",
             "હજી કોઈ જોડી harmonious તરીકે ચિહ્નિત નથી. અનકહી સહમતી માનવાને બદલે અપેક્ષાઓ અને સુધારાના પગલાં સ્પષ્ટ કરીને શક્તિ બનાવો.")) + "</div></div></div>");

      if (neutralPairs.length) {
        rows.push('<div class="kit-row compatibility-watch-points"><div class="kit-ico">👀</div><div class="kit-body"><div class="kit-label">' + LT("Watch points", "ध्यान-बिंदु", "ધ્યાન-બિંદુઓ") + '</div><div class="kit-value">' + LT(pairList(neutralPairs) + " are workable rather than automatic strengths. Name assumptions early, agree roles and revisit decisions before small differences accumulate.",
          pairList(neutralPairs) + " साध्य हैं, अपने-आप बनने वाली शक्तियां नहीं। धारणाएं जल्दी स्पष्ट करें, भूमिकाएं तय करें और छोटे मतभेद बढ़ने से पहले निर्णय दोबारा देखें।",
          pairList(neutralPairs) + " સાધ્ય છે, આપમેળે બનતી શક્તિઓ નથી. ધારણાઓ વહેલી સ્પષ્ટ કરો, ભૂમિકાઓ નક્કી કરો અને નાના મતભેદ વધે તે પહેલાં નિર્ણય ફરી જુઓ.") + "</div></div></div>");
      }

      if (cRem.conflicts.length) {
        cRem.conflicts.forEach(function (c) {
          rows.push('<div class="kit-row compatibility-blind-spot"><div class="kit-ico">⚡</div><div class="kit-body"><div class="kit-label">' + LT("Potential blind spot", "संभावित सावधानी-बिंदु", "સંભવિત સાવચેતીનો મુદ્દો") + " · " + esc(c.a) + " (" + esc(c.planetA.split(" ")[0]) + ") × " + esc(c.b) + " (" + esc(c.planetB.split(" ")[0]) + ")</div>");
          rows.push(c.friction
            ? '<div class="kit-value">' + esc(c.friction[lang] || c.friction.en) + '</div><div class="compatibility-cue">🌉 <strong>' + LT("Communication cue:", "संवाद संकेत:", "સંવાદ સંકેત:") + "</strong> " + esc(c.bridge[lang] || c.bridge.en) + "</div>"
            : '<div class="compatibility-cue">🌉 <strong>' + LT("Communication cue:", "संवाद संकेत:", "સંવાદ સંકેત:") + "</strong> " + LT("Name the difference, make one small agreement, then review it together.", "अंतर को नाम दें, एक छोटा समझौता बनाएं, फिर उसे साथ में देखें।", "તફાવતને નામ આપો, એક નાનો કરાર બનાવો, પછી સાથે તેની સમીક્ષા કરો.") + "</div>");
          rows.push("</div></div>");
        });
      } else {
        rows.push('<div class="kit-row compatibility-blind-spot"><div class="kit-ico">🛡</div><div class="kit-body"><div class="kit-label">' + LT("Potential blind spots", "संभावित सावधानी-बिंदु", "સંભવિત સાવચેતીના મુદ્દા") + '</div><div class="kit-value">' + LT("No conflicting Driver/Conductor pair appears in this comparison. Protect the bond by keeping communication specific when priorities or timing differ.", "इस तुलना में कोई विरोधी मूलांक/भाग्यांक जोड़ी नहीं है। प्राथमिकताएं या समय अलग हों तो संवाद को स्पष्ट रखकर संबंध की रक्षा करें।", "આ સરખામણીમાં કોઈ વિરોધી મૂળાંક/ભાગ્યાંક જોડી નથી. પ્રાથમિકતાઓ અથવા સમય અલગ હોય ત્યારે સંવાદને સ્પષ્ટ રાખીને સંબંધનું રક્ષણ કરો.") + '</div><div class="compatibility-cue">🌉 <strong>' + LT("Communication cue:", "संवाद संकेत:", "સંવાદ સંકેત:") + '</strong> ' + LT("Keep a short recurring check-in for decisions, appreciation and any change in priorities.", "निर्णय, सराहना और प्राथमिकताओं में बदलाव के लिए छोटा नियमित check-in रखें।", "નિર્ણય, પ્રશંસા અને પ્રાથમિકતાઓમાં ફેરફાર માટે ટૂંકો નિયમિત check-in રાખો.") + "</div></div></div>");
      }

      if (cRem.bridges.length) {
        rows.push('<div class="kit-row compatibility-shared-cues"><div class="kit-ico">🌉</div><div class="kit-body"><div class="kit-label">' + LT("Shared reference numbers", "साझा संदर्भ अंक", "સહભાગી સંદર્ભ અંકો") + '</div><div class="kit-value">' + cRem.bridges.map(function (br) { return "<strong>" + br.n + "</strong> (" + esc(br.planet) + ")"; }).join(" · ") + '</div><div class="card-sub">' + LT("Use these as conversation cues for shared projects, not remedy targets, power days or event-timing instructions.", "इनको साझा परियोजनाओं के लिए संवाद-संकेत की तरह लें, remedy targets, power days या event-timing निर्देश की तरह नहीं।", "તેનો ઉપયોગ સહભાગી યોજનાઓ માટે સંવાદ-સંકેત તરીકે કરો, remedy targets, power days અથવા event-timing સૂચના તરીકે નહીં.") + "</div></div></div>");
      }
      rows.push('<div class="judge-note"><strong>' + LT("Scope:", "सीमा:", "મર્યાદા:") + "</strong> " + LT("Compatibility does not add crystals, Rudraksha, affirmations, lifestyle obligations or a second 40-day plan. Use the Lo Shu Foundation for those; use Timeline for Dasha timing and active Vastu.", "सामंजस्य crystals, Rudraksha, affirmations, lifestyle obligations या दूसरी 40-दिन योजना नहीं जोड़ता। इनके लिए लो शू Foundation और दशा समय/सक्रिय वास्तु के लिए Timeline देखें।", "સુસંગતતા crystals, Rudraksha, affirmations, lifestyle obligations અથવા બીજી ૪૦-દિવસની યોજના ઉમેરતી નથી. તેના માટે લો શુ Foundation અને દશા સમય/સક્રિય વાસ્તુ માટે Timeline જુઓ.") + "</div>");
      rows.push("</div>");
      return rows.join("");
    })();

    const compatSection = `<section class="rsection" id="compatibility-section">
      <div class="compatibility-overview">
        <h2 class="rsection-title"><span class="idx">${SECTION.compatibility}</span>${t("secCompat", "Compatibility & Matchmaking")}</h2>
        ${compat ? `<p class="rsection-desc">Pairwise Driver / Conductor match between <strong>${esc(p.name)}</strong> and <strong>${esc(p.partnerName)}</strong> (marriage or business partnership).</p>
          <div class="card compatibility-overview-card">
            <div class="goal-head">
              <div class="card-title">Overall verdict: ${compat.verdict}</div>
              <span class="badge ${compat.verdict === "Strong" || compat.verdict === "Good" ? "good" : compat.verdict === "Workable" ? "warn" : "bad"}">${compat.friendly} harmonious · ${compat.neutral} neutral · ${compat.enemy} conflicting</span>
            </div>
            <div class="table-scroll"><table class="rtable">
              <tr><th>Pairing</th><th>Relation</th></tr>
              ${compat.pairs.map((pr) => `<tr><td>${esc(pr.a)} × ${esc(pr.b)}</td><td>${relBadge(pr.r)}</td></tr>`).join("")}
            </table></div>
            <div class="kit-value">${compat.verdict === "Strong" ? (lang === "hi" ? "स्वाभाविक रूप से सहयोगी और शुभ मिलान — आपके अंक एक दूसरे को शक्ति देते हैं।" : lang === "gu" ? "કુદરતી રીતે સહયોગી અને શુભ મિલાન — તમારા અંકો એકબીજાને બળ આપે છે." : "A naturally cooperative pairing — your numbers reinforce each other.") : compat.verdict === "Good" ? (lang === "hi" ? "सकारात्मक और अनुकूल मिलान — कुछ सामान्य कड़ियों के साथ यह संबंध सुखद रहेगा।" : lang === "gu" ? "હકારાત્મક અને અનુકૂળ મિલાન — કેટલીક સામાન્ય કડીઓ સાથે આ સંબંધ સુખદ રહેશે." : "A supportive pairing with a couple of neutral links — manageable and mostly aligned.") : compat.verdict === "Workable" ? (lang === "hi" ? "साध्य मिलान, किंतु थोड़ा प्रयास आवश्यक है — प्रतिकूल कड़ियों पर समझदारी जरूरी है।" : lang === "gu" ? "સાધ્ય મિલાન, પણ થોડો પ્રયાસ જરૂરી છે — પ્રતિકૂળ કડીઓ પર સમજણ જરૂરી છે." : "Workable, but needs conscious effort — the conflicting links are the areas to manage.") : (lang === "hi" ? "चुनौतीपूर्ण मिलान — विरोधी अंकों के प्रभाव को समझने के लिए साफ संवाद और व्यवहारिक समझौते जरूरी हैं।" : lang === "gu" ? "પડકારરૂપ મિલાન — વિરોધી અંકોના પ્રભાવને સમજવા માટે સ્પષ્ટ સંવાદ અને વ્યવહારુ સમજોતાં જરૂરી છે." : "Challenging pairing — the conflicting numbers need clear communication and practical agreements to bridge.")}</div>
          </div>`
        : `<div class="card compatibility-overview-card">
            <div class="card-title">${lang === "hi" ? "आपके लिए कौन से अंक अनुकूल हैं?" : lang === "gu" ? "તમારા માટે કયા અંકો અનુકૂળ છે?" : "Who are you compatible with?"}</div>
            <div class="kit-value">${lang === "hi" ? "पूर्ण मिलान के लिए पार्टनर का नाम और जन्मतिथि जोड़ें। इस बीच, यहां देखें कि आपके अंक अन्य मूलांकों से कैसे मेल खाते हैं:" : lang === "gu" ? "સંપૂર્ણ મિલાન માટે પાર્ટનરનું નામ અને જન્મ તારીખ ઉમેરો. દરમિયાન, અહીં જુઓ કે તમારા અંકો અન્ય મૂળાંકો સાથે કેવી રીતે મેળ ખાય છે:" : "Add a <strong>partner's name and date of birth</strong> (Edit Details → Compatibility) for a full two-person Driver / Conductor match. Meanwhile, here is how your numbers relate to every other Driver:"}</div>
            <div class="table-scroll"><table class="rtable">
              <tr><th>${lang === "hi" ? "अन्य व्यक्ति का मूलांक" : lang === "gu" ? "અન્ય વ્યક્તિનો મૂળાંક" : "Other person's Driver"}</th><th>vs your Driver ${p.driver}</th><th>vs your Conductor ${p.conductor}</th></tr>
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<tr><td><strong>${n}</strong> (${esc(db.numbers[n].planet.split(" ")[0])})</td><td>${relBadge(relation(p.driver, n))}</td><td>${relBadge(relation(p.conductor, n))}</td></tr>`).join("")}
            </table></div>
          </div>`}
      </div>
      ${compat ? compatReflectionCard : ""}
    </section>`;

    const goalsStart = SECTION.goalsStart;
    const goalSections = goals.map((g, i) => `<section class="rsection" data-remedy-authority="lo-shu">
      <h2 class="rsection-title"><span class="idx">${goalsStart + i}</span>${esc(g.goal)} — ${lang === "hi" ? "लो शू उपाय फोकस" : lang === "gu" ? "લો શુ ઉપાય ફોકસ" : "Lo Shu Remedy Focus"}</h2>
      <p class="rsection-desc">${g.weak.length
        ? (lang === "hi" ? `आपके लो शू जन्म-ग्रिड में अनुपस्थित अंक <strong>${g.weak.join(", ")}</strong> इस लक्ष्य के लिए practice targets हैं।` : lang === "gu" ? `તમારા લો શુ જન્મ-ગ્રિડમાં ખૂટતા અંક <strong>${g.weak.join(", ")}</strong> આ લક્ષ્ય માટે practice targets છે.` : `Missing Lo Shu Birth Grid number${g.weak.length > 1 ? "s" : ""} <strong>${g.weak.join(", ")}</strong> are the practice targets for this focus.`)
        : (lang === "hi" ? "इस लक्ष्य से जुड़े लो शू अंक उपस्थित हैं — कोई अतिरिक्त remedy kit आवश्यक नहीं है।" : lang === "gu" ? "આ લક્ષ્ય સાથે જોડાયેલા લો શુ અંકો હાજર છે — વધારાની remedy kit જરૂરી નથી." : `The Lo Shu numbers connected to this focus are present — no extra remedy kit is required.`)}</p>
      ${g.weak.length ? `<div class="card-grid two">${g.focus.map((f) => kitCard(f.n)).join("")}</div>` : `<div class="card"><div class="kit-value">${lang === "hi" ? "40-दिन की लो शू practice में पहले से चुने गए missing/repeated signal पर बने रहें; किसी present number को नया remedy target न बनाएं।" : lang === "gu" ? "૪૦-દિવસના લો શુ અભ્યાસમાં પહેલેથી પસંદ કરેલા missing/repeated signal પર જ રહો; કોઈ present number ને નવો remedy target ન બનાવો." : "Stay with the missing/repeated signal already selected in your 40-day Lo Shu practice; do not turn a present number into a new remedy target."}</div></div>`}
    </section>`).join("");

    const cadenceLabel = {
      daily: lang === "hi" ? "दैनिक" : lang === "gu" ? "દૈનિક" : "Daily",
      weekly: lang === "hi" ? "साप्ताहिक" : lang === "gu" ? "સાપ્તાહિક" : "Weekly",
      once: lang === "hi" ? "एक बार" : lang === "gu" ? "એક વાર" : "One-time"
    };
    const planKey = state.activeProfileKey || profileKeyOf(p);
    const planState = readPlan(planKey);
    const PLAN_DAYS = 40;
    const planDays = Array.from({ length: PLAN_DAYS }, (_, i) => !!planState.days[i]);
    const planDone = planDays.filter(Boolean).length;
    const planNext = planDays.indexOf(false);
    const planStatus = planDone >= PLAN_DAYS
      ? (lang === "hi" ? `मंडल पूर्ण — ४० में से ४० दिन संपन्न! अब प्रगति चार्ट में परिणाम देखें।` : lang === "gu" ? `મંડળ પૂર્ણ — ૪૦ માંથી ૪૦ દિવસ સંપન્ન! હવે પ્રગતિ ચાર્ટમાં પરિણામો જુઓ.` : `Mandala complete — ${PLAN_DAYS} of ${PLAN_DAYS} days done. Now review what shifted in Your Evolving Chart (Section ${SECTION.memory}).`)
      : planDone === 0
        ? (lang === "hi" ? `अपने लो शू अभ्यास के साथ आज शुरुआत करें और दिन १ पर टैप करें। निरंतरता ही उपाय है।` : lang === "gu" ? `તમારા લો શુ અભ્યાસ સાથે આજે શરૂઆત કરો અને દિવસ ૧ પર ટેપ કરો. સાતત્ય જ ઉપાય છે.` : `Begin your Lo Shu practice today, then tap Day 1. Consistency is the remedy.`)
        : (lang === "hi" ? `${planDone} / ${PLAN_DAYS} दिन पूर्ण — अगला दिन ${planNext + 1} है। नियम न तोड़ें।` : lang === "gu" ? `${planDone} / ${PLAN_DAYS} દિવસ પૂર્ણ — આગામી દિવસ ${planNext + 1} છે. સાતત્ય જાળવી રાખો.` : `${planDone} of ${PLAN_DAYS} days done — Day ${planNext + 1} is next${planNext + 1 <= PLAN_DAYS ? `, ${PLAN_DAYS - planDone} day${PLAN_DAYS - planDone === 1 ? "" : "s"} to go` : ""}. Keep the thread unbroken.`);

    const prioritySection = `<section class="rsection" id="plan-section" data-remedy-authority="lo-shu">
      <h2 class="rsection-title"><span class="idx">${goalsStart + goals.length}</span>${t("secPlan", "Your 40-Day Activation Plan")}</h2>
      <p class="rsection-desc">${lang === "hi" ? "४० दिन का मंडल आपके लो शू जन्म-ग्रिड के अनुपस्थित और दोहराए संकेतों से चुना जाता है। मंत्र, affirmation, crystal, Rudraksha और आदतों का यह एकमात्र remedy अभ्यास है। मूलांक/भाग्यांक के power days नीचे केवल अलग scheduling reference हैं; दशा की तारीखें और सक्रिय वास्तु क्षेत्र Timeline में रहते हैं।" : lang === "gu" ? "૪૦ દિવસનું મંડળ તમારા લો શુ જન્મ-ગ્રિડના ખૂટતા અને પુનરાવર્તિત સંકેતો પરથી પસંદ થાય છે. મંત્ર, affirmation, crystal, Rudraksha અને ટેવોનો આ એકમાત્ર remedy અભ્યાસ છે. મૂળાંક/ભાગ્યાંકના power days નીચે ફક્ત અલગ scheduling reference છે; દશાની તારીખો અને સક્રિય વાસ્તુ ક્ષેત્ર સમયરેખામાં રહે છે." : "This 40-day mandala is selected from missing and repeated signals in your Lo Shu Birth Grid. It is the one remedy practice for mantras, affirmations, crystals, Rudraksha and habits. Driver/Conductor power days below are a separate scheduling reference only; Dasha dates and the active Vastu zone live in Timeline."}</p>
      <div class="card-grid two">
        <div class="card ritual-card" data-remedy-authority="lo-shu">
          <div class="card-title">${lang === "hi" ? "आपकी लो शू दैनिक मुख्य साधना" : lang === "gu" ? "તમારી લો શુ દૈનિક મુખ્ય સાધના" : "Your Lo Shu Daily Core Ritual"}</div>
          <div class="kit">
            ${activation.daily.map((row) => `<div class="kit-row"><div class="kit-ico">${row.ico}</div><div class="kit-body"><div class="kit-label">${row.label}</div><div class="kit-value">${row.value}<br><span class="card-sub">${row.sub}</span></div></div></div>`).join("")}
          </div>
        </div>
        <div class="card" data-authority="driver-conductor">
          <div class="card-title">${lang === "hi" ? "मूलांक / भाग्यांक Power Days" : lang === "gu" ? "મૂળાંક / ભાગ્યાંક Power Days" : "Driver / Conductor Power Days"}</div>
          <div class="card-sub">${lang === "hi" ? "ये केवल मूलांक और भाग्यांक से आते हैं। ये लो शू के remedy targets को नहीं चुनते या बदलते।" : lang === "gu" ? "આ ફક્ત મૂળાંક અને ભાગ્યાંક પરથી આવે છે. તે લો શુના remedy targets પસંદ કરતા કે બદલતા નથી." : "These come only from Driver and Conductor. They do not choose or change Lo Shu remedy targets."}</div>
          <div class="table-scroll"><table class="rtable">
            <tr><th>Day</th><th>Planet</th><th>Charity</th><th>Fast</th></tr>
            ${activation.powerDays.map((w) => `<tr>
              <td><strong>${esc(w.day)}</strong></td>
              <td>${w.planet}<br><span class="card-sub">${w.note}</span></td>
              <td>${esc(w.charity)}</td>
              <td>${esc(w.fast)}</td>
            </tr>`).join("")}
          </table></div>
        </div>
      </div>
      <div class="plan-subhead">${lang === "hi" ? "मंडल के चार चरण" : lang === "gu" ? "મંડળના ચાર તબક્કા" : "The four phases of your mandala"}</div>
      <div class="phase-grid">
        ${activation.phases.map((phase) => `<div class="phase-card">
          <span class="phase-badge">${phase.badge}</span>
          <div class="phase-title">${phase.title}</div>
          <div class="phase-rows">${phase.rows.map((r) => `<div class="phase-row">${r}</div>`).join("")}</div>
        </div>`).join("")}
      </div>
      <div class="plan-subhead">${lang === "hi" ? "आपकी कार्य सूची — आवृत्ति अनुसार" : lang === "gu" ? "તમારી કાર્ય સૂચિ — આવૃત્તિ મુજબ" : "Your action checklist — tagged by cadence"}</div>
      <div class="priority-list">${priorities.map((item) => `<div class="priority-item"><span class="cadence cadence-${item.cadence}">${cadenceLabel[item.cadence] || "Daily"}</span><span class="priority-text">${item.text}</span></div>`).join("")}
      </div>
      <div class="card tracker-card" id="plan-tracker">
        <div class="goal-head">
          <div class="card-title">${lang === "hi" ? "४०-दिवसीय ट्रैकर — प्रत्येक दिन पूर्ण होने पर टैप करें" : lang === "gu" ? "૪૦ દિવસનો ટ્રેકર — પૂર્ણ થયેલ દરેક દિવસ પર ટેપ કરો" : "40-Day Tracker — tap each day you complete"}</div>
          <span class="badge ${planDone >= PLAN_DAYS ? "good" : planDone > 0 ? "info" : "warn"}">${planDone}/${PLAN_DAYS}</span>
        </div>
        <div class="kit-value">${planStatus}</div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${PLAN_DAYS}" aria-valuenow="${planDone}"><div class="progress-fill" style="width:${Math.round((planDone / PLAN_DAYS) * 100)}%"></div></div>
        <div class="tracker-grid">
          ${planDays.map((done, i) => `<button type="button" class="tracker-cell${done ? " done" : ""}${!done && i === planNext ? " next" : ""}" data-plan-day="${i + 1}" aria-pressed="${done}" aria-label="Day ${i + 1}${done ? " completed" : ""}">${done ? "✓" : i + 1}</button>`).join("")}
        </div>
        <div class="tracker-foot">
          <span>${planState.startedAt ? `Cycle started ${prettyDate(planState.startedAt)} · ` : ""}Progress is saved privately on this device, per profile.</span>
          ${planDone > 0 ? `<button class="btn btn-secondary btn-32" type="button" data-plan-reset>${t("resetCycle", "Reset cycle")}</button>` : ""}
        </div>
      </div>
    </section>`;

    const birthLine = [p.birthTimeDisplay, p.birthPlace].filter(Boolean).join(", ");
    let vedicPill;
    if (p.vedicTier === 2 && p.astro && p.astro.tier === "full") {
      const m = p.astro.moon, l = p.astro.lagna;
      vedicPill = `<span class="status-pill status-vedic">Vedic chart unlocked — ${m.glyph} ${m.nakshatra.name} · Lagna ${l.glyph}</span>`;
    } else if (p.vedicTier === 2) {
      vedicPill = `<span class="status-pill status-vedic">Vedic Tier 2 — add a recognised birthplace</span>`;
    } else if (p.vedicTier === "partial") {
      vedicPill = `<span class="status-pill status-vedic">Vedic Tier 2 partially unlocked</span>`;
    } else {
      vedicPill = `<span class="status-pill status-vedic">Vedic Sun Sign · Sidereal (Lahiri)</span>`;
    }

    const activeModule = reportModuleFromHash();
    const foundationHidden = activeModule !== "foundation" ? " hidden" : "";
    const timelineHidden = activeModule !== "timeline" ? " hidden" : "";
    const foundationSelected = activeModule === "foundation";

    return `
      <div class="report-hero">
        <div class="invocation">ॐ श्री गणेशाय नमः</div>
        <h1>${t("reportHeroTitle", "Remedy Report — {name}").replace("{name}", esc(p.name))}</h1>
        <p>DOB ${dobStr}${birthLine ? ` · Born ${esc(birthLine)}` : ""} · Focus: ${p.goals.map(esc).join(", ")} · Generated locally on your device</p>
        <div class="report-meta">
          <span class="status-pill status-private">${t("statusPrivate", "Private & local")}</span>
          <span class="status-pill status-knowledge">Knowledge pack v${esc(activePack().packVersion)}</span>
          <span class="status-pill status-memory">${evolving.snapshots.length} local snapshot${evolving.snapshots.length === 1 ? "" : "s"}</span>
          ${vedicPill}
        </div>
        <div class="module-tabs" role="tablist" aria-label="${t("moduleNavigation", "Report modules")}">
          <button class="module-tab${foundationSelected ? " active" : ""}" id="foundation-tab" type="button" role="tab" aria-selected="${foundationSelected}" aria-controls="foundation-panel" tabindex="${foundationSelected ? "0" : "-1"}" data-module-tab="foundation">${t("tabFoundation", "Foundation · Lo Shu")}</button>
          <button class="module-tab${!foundationSelected ? " active" : ""}" id="timeline-tab" type="button" role="tab" aria-selected="${!foundationSelected}" aria-controls="timeline-panel" tabindex="${!foundationSelected ? "0" : "-1"}" data-module-tab="timeline">${t("tabTimeline", "Timeline · Vedic Dasha")}</button>
        </div>
        <nav class="report-nav" aria-label="${t("moduleQuickNavigation", "Module navigation")}">
          <a href="#foundation" data-module-jump="foundation">${t("navFoundation", "Foundation")}</a>
          <a href="#loshu-grid-section">${t("navLoShu", "Lo Shu Blueprint")}</a>
          <a href="#timeline" data-module-jump="timeline">${t("navTimeline", "Timeline")}</a>
          <a href="#dasha-section">${t("navDasha", "Dasha")}</a>
          <a href="#vastu-section">${t("navVastu", "Vastu")}</a>
          <a href="#plan-section">${t("navPlan", "40-Day Plan")}</a>
        </nav>
      </div>
      <section class="report-module-panel foundation-panel" id="foundation-panel" role="tabpanel" aria-labelledby="foundation-tab"${foundationHidden}>
        <div class="module-panel-heading"><p class="summary-kicker">${t("tabFoundation", "Foundation · Lo Shu")}</p><h2>${t("foundationPanelTitle", "Your psychological blueprint and practice")}</h2><p>${t("foundationPanelDesc", "Use the classic Lo Shu Birth, Name and Combined grids to understand patterns, then build your practical 40-day activation plan.")}</p></div>
        ${summarySection}
        <section class="rsection" id="core-profile">
          <h2 class="rsection-title"><span class="idx">${SECTION.core}</span>${t("secProfile", "Core Numerology Profile")}</h2>
          <div class="card-grid">
            ${numCard(t("driverLabel", "Driver (Moolank)"), p.driver, lang === "hi" ? "आपकी सोच, व्यक्तित्व और दैनिक ऊर्जा" : lang === "gu" ? "તમારી વિચારસરણી, વ્યક્તિત્વ અને દૈનિક ઊર્જા" : "Your mind, personality and day-to-day energy")}
            ${numCard(t("conductorLabel", "Conductor (Bhagyank)"), p.conductor, lang === "hi" ? "आपका भाग्य मार्ग और दीर्घकालिक सफलता" : lang === "gu" ? "તમારો ભાગ્ય માર્ગ અને દીર્ઘકાલીન સફળતા" : "Your destiny path and long-term results")}
            ${numCard("Name Number", p.nameNum, `Chaldean total ${p.nameCompound} — ${lang === "hi" ? "दुनिया आपको कैसे स्वीकारती है" : lang === "gu" ? "દુનિયા તમને કેવી રીતે સ્વીકારે છે" : "how the world receives you"}`)}
            ${numCard("Mobile Number", p.mobNum, `Digits total ${p.mobCompound} — ${lang === "hi" ? "सर्वाधिक प्रयुक्त दैनिक ऊर्जा" : lang === "gu" ? "સૌથી વધુ વપરાતી દૈનિક ઊર્જા" : "your most-used vibration"}`)}
            <div class="card num-card" data-authority="zodiac-reference"><div class="num-value" style="font-size:26px">${esc(p.zodiac)}</div><div class="num-label">Vedic Sun Sign · Surya Rashi</div><div class="num-planet">${esc(db.zodiac[p.zodiac].element)} · Ruled by ${esc(db.numbers[db.zodiac[p.zodiac].ruler].planet)}</div><div class="num-traits">Sidereal / Lahiri reference only — it does not choose remedies, crystals or timing.</div><div class="num-traits vedic-western-ref">Western tropical reference: ${esc(p.zodiacTropical)}</div></div>
          </div>
          <div class="card"><div class="card-title">Driver ${p.driver} × Conductor ${p.conductor} combination</div><div class="kit-value">Your mind runs on <strong>${esc(db.numbers[p.driver].planet)}</strong> (${esc(db.numbers[p.driver].traits.split(",")[0].toLowerCase())}) while your destiny demands <strong>${esc(db.numbers[p.conductor].planet)}</strong> (${esc(db.numbers[p.conductor].traits.split(",")[0].toLowerCase())}). This pair is <strong>${relation(p.driver, p.conductor)}</strong> — ${relation(p.driver, p.conductor) === "friendly" ? "a naturally cooperative chart; remedies will amplify what already flows." : relation(p.driver, p.conductor) === "neutral" ? "a workable chart; targeted remedies will sharpen results." : "the remedies below are chosen to bridge these two energies."}</div></div>
          ${karmicDebtCard(p)}
          ${doshaCard(p)}
          ${deityCard(p)}
        </section>
        ${traitsSection}
        ${renderLoShuGrid(p)}
        ${renderVedicBirthComparison(p)}
        ${weakSection}
        ${zodiacSection}
        ${nameSection}
        ${mobSection}
        ${vehicleSection}
        ${watchSection}
        ${crystalSection}
        ${colorSection}
        ${careerSection}
        ${memorySection}
        ${kuaSection}
        ${compatSection}
        ${goalSections}
        ${prioritySection}
      </section>
      <section class="report-module-panel timeline-panel" id="timeline-panel" role="tabpanel" aria-labelledby="timeline-tab"${timelineHidden}>
        <div class="module-panel-heading timeline-panel-heading" id="timeline-top"><p class="summary-kicker">${t("tabTimeline", "Timeline · Vedic Dasha")}</p><h2>${t("timelinePanelTitle", "Your Dasha roadmap")}</h2><p>${t("timelinePanelDesc", "Read the current Dasha stack, active Vastu zone and life-event windows as a time-based roadmap. This module never uses either grid to alter timing.")}</p><nav class="timeline-anchor-nav" aria-label="${t("timelineNavigation", "Timeline navigation")}"><a href="#timing-section">${t("navTiming", "Timing")}</a><a href="#dasha-section">${t("navDasha", "Dasha roadmap")}</a><a href="#vastu-section">${t("navVastu", "Home Vastu")}</a><a href="#timeline-top">${t("backToTimeline", "Timeline top")}</a></nav></div>
        ${timingSection}
        ${dashaSection}
        ${vastuSection}
      </section>
    `;
  }

  function numCard(label, val, sub) {
    return `<div class="card num-card">
      <div class="num-value">${val}</div>
      <div class="num-label">${label}</div>
      <div class="num-sub">${sub}</div>
    </div>`;
  }

  /* ---------------- view switching & interactions ---------------- */
  let lastProfile = null;

  function reportModuleFromHash(hash) {
    const id = String(hash === undefined ? window.location.hash : hash || "").replace(/^#/, "");
    if (id === "timeline" || id === "timeline-panel" || id === "timeline-top" || id === "timing-section" || id === "dasha-section" || id === "vastu-section") return "timeline";
    return "foundation";
  }

  function moduleForTarget(targetId) {
    if (!targetId) return "foundation";
    const target = document.getElementById(targetId);
    return target && target.closest("#timeline-panel") ? "timeline" : reportModuleFromHash(`#${targetId}`);
  }

  function setReportModule(moduleName, options) {
    const opts = options || {};
    const next = moduleName === "timeline" ? "timeline" : "foundation";
    const root = $("#reportRoot");
    if (!root) return;
    const foundation = $("#foundation-panel", root);
    const timeline = $("#timeline-panel", root);
    const tabs = $$('[data-module-tab]', root);
    if (foundation) foundation.hidden = next !== "foundation";
    if (timeline) timeline.hidden = next !== "timeline";
    tabs.forEach((tab) => {
      const selected = tab.dataset.moduleTab === next;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    state.reportModule = next;
    if (opts.writeHash) {
      const wanted = `#${next}`;
      if (window.location.hash !== wanted) window.location.hash = wanted;
    }
    if (opts.focus) {
      const selected = $(`[data-module-tab="${next}"]`, root);
      if (selected) selected.focus();
    }
    if (opts.scrollToHash) {
      const targetId = String(window.location.hash || "").replace(/^#/, "");
      const target = targetId && document.getElementById(targetId);
      if (target && typeof target.scrollIntoView === "function") {
        const schedule = window.requestAnimationFrame || ((fn) => setTimeout(fn, 0));
        schedule(() => target.scrollIntoView({ block: "start", behavior: "auto" }));
      }
    }
  }

  function bindReportModuleNavigation() {
    const root = $("#reportRoot");
    if (!root) return;
    $$('[data-module-tab]', root).forEach((tab) => {
      if (tab.dataset.moduleBound) return;
      tab.dataset.moduleBound = "true";
      tab.addEventListener("click", () => setReportModule(tab.dataset.moduleTab, { writeHash: true, focus: true }));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const ordered = $$('[data-module-tab]', root);
        let index = ordered.indexOf(tab);
        if (event.key === "ArrowRight") index = (index + 1) % ordered.length;
        if (event.key === "ArrowLeft") index = (index - 1 + ordered.length) % ordered.length;
        if (event.key === "Home") index = 0;
        if (event.key === "End") index = ordered.length - 1;
        const next = ordered[index];
        setReportModule(next.dataset.moduleTab, { writeHash: true, focus: true });
      });
    });
    $$('a[href^="#"]', root).forEach((link) => {
      if (link.dataset.moduleBound) return;
      link.dataset.moduleBound = "true";
      link.addEventListener("click", () => {
        const explicit = link.dataset.moduleJump;
        const targetId = String(link.getAttribute("href") || "").replace(/^#/, "");
        setReportModule(explicit || moduleForTarget(targetId), { writeHash: false });
      });
    });
  }

  function bindReportInteractions() {
    bindReportModuleNavigation();
    $$('[data-practice-number]', $("#reportRoot")).forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = Number(btn.getAttribute("data-practice-number"));
        if (!state.activeProfileKey || !n) return;
        const db = getActiveDB();
        logPractice(state.activeProfileKey, n);
        showToast(`Logged ${db.numbers[n].planet} practice locally`, "good");
        if (state.lastInput) {
          lastProfile = computeProfile(state.lastInput);
          rerenderEvolving();
        }
      });
    });

    const journalForm = $("#localJournalForm", $("#reportRoot"));
    if (journalForm) {
      journalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $("#localJournalText", journalForm);
        const text = input ? input.value.trim() : "";
        if (!text || !state.activeProfileKey) return;
        addJournalEntry(state.activeProfileKey, text);
        if (input) input.value = "";
        showToast("Note saved locally", "good");
        if (state.lastInput) {
          lastProfile = computeProfile(state.lastInput);
          rerenderEvolving();
        }
      });
    }

    function rerenderEvolving() {
      const sec = $("#memory-section", $("#reportRoot"));
      if (!sec || !lastProfile) return;
      const timing = timingAnalysis(lastProfile);
      const evolving = evolvingChartData(lastProfile, timing);
      const db = getActiveDB();
      const lang = getLang();
      sec.querySelector(".insight-grid").innerHTML = `
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "सुरक्षित चार्ट" : lang === "gu" ? "સેવ કરેલા ચાર્ટ" : "Saved snapshots"}</div>
          <div class="metric-value">${evolving.snapshots.length}</div>
          <div class="metric-sub">${lang === "hi" ? `नवीनतम: ${evolving.snapshots[0] ? prettyDate(evolving.snapshots[0].savedAt) : "अभी सुरक्षित नहीं"}` : lang === "gu" ? `તાજેતરનું: ${evolving.snapshots[0] ? prettyDate(evolving.snapshots[0].savedAt) : "હજી સેવ નથી"}` : `Latest saved on ${evolving.snapshots[0] ? prettyDate(evolving.snapshots[0].savedAt) : "this device not yet"}`}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "इस वर्ष का प्रभाव" : lang === "gu" ? "આ વર્ષનો પ્રભાવ" : "This year in context"}</div>
          <div class="metric-value">${evolving.currentYearLucky ? (lang === "hi" ? "अनुकूल" : lang === "gu" ? "અનુકૂળ" : "Favourable") : (lang === "hi" ? "धैर्य से निर्माण" : lang === "gu" ? "ધીરજથી નિર્માણ" : "Build steadily")}</div>
          <div class="metric-sub">${evolving.currentYearLucky ? (lang === "hi" ? "यह वर्ष आपके शुभ वर्षों की सूची में आता है।" : lang === "gu" ? "આ વર્ષ તમારા શુભ વર્ષોની યાદીમાં આવે છે." : "This year appears in your lucky-year window.") : (lang === "hi" ? "अनुशासन और निरंतरता बनाए रखें।" : lang === "gu" ? "શિસ્ત અને સાતત્ય જાળવી રાખો." : "Not one of your top timing windows — use discipline and consistency.")}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "इस वर्ष दर्ज कदम" : lang === "gu" ? "આ વર્ષે નોંધેલા પગલાં" : "Moves logged this year"}</div>
          <div class="metric-value">${evolving.movesThisYear}</div>
          <div class="metric-sub">A local reality-check against your timing cycle.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${lang === "hi" ? "ज्ञान का स्रोत" : lang === "gu" ? "જ્ઞાનનો સ્ત્રોત" : "Knowledge source"}</div>
          <div class="metric-value">v${esc(activePack().packVersion)}</div>
          <div class="metric-sub">${esc(activePack().source === "remote" ? "Live-updated content pack" : activePack().source === "cached" ? "Cached content pack" : "Bundled starter pack")}</div>
        </div>
      `;
      sec.querySelector(".engagement-list").innerHTML = evolving.practiceSummary.map((item) => `<div class="engagement-item"><div><strong>${item.n} — ${esc(db.numbers[item.n].planet)}</strong><span>${item.month} logged this month · ${item.total} total</span></div><button class="btn btn-secondary btn-32" type="button" data-practice-number="${item.n}">${lang === "hi" ? "अभ्यास दर्ज करें" : lang === "gu" ? "અભ્યાસ નોંધો" : "Log practice"}</button></div>`).join("");
      sec.querySelector(".timeline").innerHTML = evolving.journal.length ? evolving.journal.map((entry) => `<div class="timeline-item"><div><strong>${esc(entry.text)}</strong><span>${prettyDate(entry.at)}</span></div></div>`).join("") : `<div class="timeline-item"><div><strong>${lang === "hi" ? "अभी कोई नोट दर्ज नहीं है" : lang === "gu" ? "હજી કોઈ નોંધ દાખલ નથી" : "No local moves logged yet"}</strong><span>${lang === "hi" ? "आपकी टिप्पणियां पूरी तरह आपके डिवाइस पर ही रहती हैं।" : lang === "gu" ? "તમારી નોંધ સંપૂર્ણપણે તમારા ડિવાઇસ પર જ રહે છે." : "Your notes stay on this device and never enter the anonymous contribution payload."}</span></div></div>`;
      bindReportInteractions();
    }

    function rerenderToPlan() {
      if (!lastProfile) return;
      const planKey = state.activeProfileKey || profileKeyOf(lastProfile);
      const planState = readPlan(planKey);
      const PLAN_DAYS = 40;
      const planDays = Array.from({ length: PLAN_DAYS }, (_, i) => !!planState.days[i]);
      const planDone = planDays.filter(Boolean).length;
      const planNext = planDays.indexOf(false);
      const lang = getLang();

      const planStatus = planDone >= PLAN_DAYS
        ? (lang === "hi" ? `मंडल पूर्ण — ४० में से ४० दिन संपन्न! अब प्रगति चार्ट में परिणाम देखें।` : lang === "gu" ? `મંડળ પૂર્ણ — ૪૦ માંથી ૪૦ દિવસ સંપન્ન! હવે પ્રગતિ ચાર્ટમાં પરિણામો જુઓ.` : `Mandala complete — ${PLAN_DAYS} of ${PLAN_DAYS} days done. Now review what shifted in Your Evolving Chart (Section ${SECTION.memory}).`)
        : planDone === 0
          ? (lang === "hi" ? `सर्वोत्तम शुरुआत के लिए <strong>${dayOf(lastProfile.driver)}</strong> की सुबह से प्रारंभ करें और दिन १ पर टैप करें।` : lang === "gu" ? `શ્રેષ્ઠ શરૂઆત માટે <strong>${dayOf(lastProfile.driver)}</strong> ની સવારથી પ્રારંભ કરો અને દિવસ ૧ પર ટેપ કરો.` : `Begin on a <strong>${DAY_OF[lastProfile.driver]}</strong> morning for the strongest start, then tap Day 1. The ritual takes under 10 minutes — consistency is the remedy.`)
          : (lang === "hi" ? `${planDone} / ${PLAN_DAYS} दिन पूर्ण — अगला दिन ${planNext + 1} है। नियम न तोड़ें।` : lang === "gu" ? `${planDone} / ${PLAN_DAYS} દિવસ પૂર્ણ — આગામી દિવસ ${planNext + 1} છે. સાતત્ય જાળવી રાખો.` : `${planDone} of ${PLAN_DAYS} days done — Day ${planNext + 1} is next${planNext + 1 <= PLAN_DAYS ? `, ${PLAN_DAYS - planDone} day${PLAN_DAYS - planDone === 1 ? "" : "s"} to go` : ""}. Keep the thread unbroken.`);

      const tracker = $("#plan-tracker", $("#reportRoot"));
      if (!tracker) return;
      tracker.querySelector(".badge").textContent = `${planDone}/${PLAN_DAYS}`;
      tracker.querySelector(".badge").className = `badge ${planDone >= PLAN_DAYS ? "good" : planDone > 0 ? "info" : "warn"}`;
      tracker.querySelector(".kit-value").innerHTML = planStatus;
      tracker.querySelector(".progress-fill").style.width = `${Math.round((planDone / PLAN_DAYS) * 100)}%`;
      tracker.querySelector(".progress-track").setAttribute("aria-valuenow", String(planDone));
      tracker.querySelector(".tracker-grid").innerHTML = planDays.map((done, i) => `<button type="button" class="tracker-cell${done ? " done" : ""}${!done && i === planNext ? " next" : ""}" data-plan-day="${i + 1}" aria-pressed="${done}" aria-label="Day ${i + 1}${done ? " completed" : ""}">${done ? "✓" : i + 1}</button>`).join("");
      tracker.querySelector(".tracker-foot").innerHTML = `
        <span>${planState.startedAt ? `Cycle started ${prettyDate(planState.startedAt)} · ` : ""}Progress is saved privately on this device, per profile.</span>
        ${planDone > 0 ? `<button class="btn btn-secondary btn-32" type="button" data-plan-reset>${t("resetCycle", "Reset cycle")}</button>` : ""}
      `;
      bindReportInteractions();
    }

    $$("[data-plan-day]", $("#reportRoot")).forEach((cell) => {
      cell.addEventListener("click", () => {
        const dayIdx = Number(cell.getAttribute("data-plan-day")) - 1;
        if (dayIdx < 0 || dayIdx >= 40) return;
        const key = state.activeProfileKey || (state.lastInput ? profileKeyOf(state.lastInput) : "");
        if (!key) return;
        const plan = readPlan(key);
        const PLAN_DAYS = 40;
        const days = Array.from({ length: PLAN_DAYS }, (_, i) => !!plan.days[i]);
        const currentlyDone = !!days[dayIdx];
        days[dayIdx] = !currentlyDone;
        const newStartedAt = plan.startedAt || isoDate();
        writePlan(key, { startedAt: newStartedAt, days });
        showToast(currentlyDone ? `Day ${dayIdx + 1} marked incomplete` : `Day ${dayIdx + 1} complete — keep going!`, currentlyDone ? "info" : "good");
        rerenderToPlan();
      });
    });

    const planResetBtn = $("[data-plan-reset]", $("#reportRoot"));
    if (planResetBtn) {
      planResetBtn.addEventListener("click", () => {
        const key = state.activeProfileKey || (state.lastInput ? profileKeyOf(state.lastInput) : "");
        if (!key) return;
        writePlan(key, { startedAt: null, days: [] });
        showToast("40-day tracker reset — begin again on your Driver day", "info");
        rerenderToPlan();
      });
    }
  }

  function showReport(p, options) {
    const opts = options || {};
    const scrollTop = window.scrollY || 0;
    lastProfile = p;
    $("#reportRoot").innerHTML = renderReport(p);
    $("#intakeView").classList.add("hidden");
    $("#reportView").classList.remove("hidden");
    $("#editBtn").classList.remove("hidden");
    $("#printBtn").classList.remove("hidden");
    bindReportInteractions();
    setReportModule(reportModuleFromHash(), { scrollToHash: !!window.location.hash && !opts.preserveScroll });
    window.scrollTo({ top: opts.preserveScroll ? scrollTop : 0, behavior: "auto" });
    document.title = `Report — ${p.name} | NumeroVastu 360`;
  }

  function showIntake() {
    $("#reportView").classList.add("hidden");
    $("#intakeView").classList.remove("hidden");
    $("#editBtn").classList.add("hidden");
    $("#printBtn").classList.add("hidden");
    document.title = "NumeroVastu 360 — Numerology & Vastu Remedy Report";
    window.scrollTo({ top: 0 });
  }

  /* ---------------- language switching ---------------- */
  function applyLanguageToUI() {
    const lang = getLang();
    populateDirectionSelects();

    // Update buttons in header and form
    $$("#langSelector .lang-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === lang));
    $$("#formLangPicker .lang-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.lang === lang));

    if ($("#editBtn .btn-text")) $("#editBtn .btn-text").textContent = t("editDetails", "Edit Details");
    if ($("#printBtn .btn-text")) $("#printBtn .btn-text").textContent = t("savePrint", "Save / Print Report");
    if ($(".brand-sub")) $(".brand-sub").textContent = t("brandSub", "Numerology & Vastu Remedy Engine");

    // Intake intro
    if ($(".intro-title")) $(".intro-title").textContent = t("introTitle", "Your 360° Remedy Report");
    if ($(".intro-desc")) $(".intro-desc").textContent = t("introDesc", "Enter your details once...");
    if ($("#lblReportLang")) $("#lblReportLang").textContent = t("reportLanguage", "Report Language");
    if ($("#descReportLang")) $("#descReportLang").textContent = t("reportLanguageDesc", "Choose your preferred language for the report.");

    // Generate button
    if ($("#generateBtn")) {
      const btn = $("#generateBtn");
      btn.innerHTML = `${t("generateBtn", "Generate My Remedy Report")} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
    }

    /* Generic intake-form localisation: any element carrying
         data-i18n="key"      -> textContent
         data-i18n-html="key" -> innerHTML (trusted pack content only)
         data-i18n-ph="key"   -> placeholder attribute
       is translated from the active i18n pack, falling back to the markup
       text already present in index.html. This keeps the form, its hints and
       its error messages in the same language as the generated report. */
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n"), el.textContent); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.getAttribute("data-i18n-html"), el.innerHTML); });
    $$("[data-i18n-ph]").forEach((el) => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"), el.getAttribute("placeholder") || "")); });
  }

  function setLanguage(lang) {
    if (!window.I18N || !window.I18N[lang]) return;
    state.lang = lang;
    try { localStorage.setItem(STORAGE_KEYS.lang, lang); } catch (e) {}
    applyLanguageToUI();

    if (!$("#reportView").classList.contains("hidden") && state.lastInput) {
      lastProfile = computeProfile(state.lastInput);
      showReport(lastProfile, { preserveScroll: true });
    }

    const langObj = window.I18N[lang];
    const langNative = (langObj && langObj.meta && langObj.meta.native) || lang;
    const msg = lang === "hi" ? `भाषा: ${langNative} सेट की गई` : lang === "gu" ? `ભાષા: ${langNative} પસંદ કરી` : `Language: ${langNative}`;
    showToast(msg, "good");
  }

  window.addEventListener("hashchange", () => {
    if (!$("#reportView").classList.contains("hidden")) {
      setReportModule(reportModuleFromHash(), { scrollToHash: true });
    }
  });

  // Bind language buttons
  $$("#langSelector .lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
  $$("#formLangPicker .lang-chip").forEach((chip) => {
    chip.addEventListener("click", () => setLanguage(chip.dataset.lang));
  });

  populateDirectionSelects();
  hydrateState();
  updateContributionUI();
  updateKnowledgeUI();
  updateMemoryUI();
  applyLanguageToUI();

  $("#contributeAnonymous").addEventListener("change", (e) => {
    state.contributionEnabled = !!e.target.checked;
    writeStore(STORAGE_KEYS.contributionEnabled, state.contributionEnabled);
    updateContributionUI();
    showToast(state.contributionEnabled ? "Anonymous aggregate contribution enabled" : "Anonymous aggregate contribution turned off", state.contributionEnabled ? "good" : "info");
  });
  $("#refreshKnowledgeBtn").addEventListener("click", () => { refreshKnowledgePack({ silent: false }); });
  $("#loadLatestBtn").addEventListener("click", () => {
    const snap = latestSnapshot();
    if (!snap) return;
    fillFormFromSnapshot(snap);
    showToast(`Loaded local chart for ${snap.name}`, "info");
  });

  $("#intakeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    const input = {
      name: $("#fullName").value.trim(),
      dob: $("#dob").value,
      mobile: $("#mobile").value.replace(/[^\d+]/g, ""),
      vehicle: $("#vehicle").value.trim(),
      goals: Array.from(selectedGoals),
      entrance: $("#entrance").value,
      kitchen: $("#kitchen").value,
      bedroom: $("#bedroom").value,
      toilet: $("#toilet").value,
      study: $("#study").value,
      staircase: $("#staircase").value,
      plotShape: $("#plotShape").value,
      watchType: $("#watchType").value,
      gender: $("#gender").value,
      birthTime: $("#birthTime").value,
      birthPlace: $("#birthPlace").value.trim(),
      brand: $("#brand").value.trim(),
      partnerName: $("#partnerName").value.trim(),
      partnerDob: $("#partnerDob").value
    };
    state.lastInput = Object.assign({}, input);
    lastProfile = computeProfile(input);
    const timing = timingAnalysis(lastProfile);
    saveSnapshot(input, lastProfile, timing);
    queueAnonymousContribution(lastProfile, timing);
    showReport(lastProfile);
  });

  $("#editBtn").addEventListener("click", showIntake);
  $("#printBtn").addEventListener("click", () => window.print());
  refreshKnowledgePack({ silent: true });

  /* expose for smoke tests and external control */
  window.__NV = {
    computeProfile, generateLoShuGrid, generateVedicGrid, nameSuggestions, buildOptionalSpellings, brandAnalysis, spellingCandidates,
    mobileSuggestion, vehicleAnalysis, timingAnalysis, pinnacleAnalysis, dashaTimeline, zodiacSign,
    loShuPracticeTargets, activationPlan, priorityPlan, crystalGuide, vastuReport,
    zodiacSignSidereal, kuaNumber, compatibility, compatRemedies, compoundMeaning,
    masterNumber, reduce, relation, chaldeanValue, validatePack,
    normalizePack, contributionPayload, formatBirthTime, setLanguage, getLang,
    renderLoShuGrid, renderVedicGrid, renderVedicBirthComparison, renderReport, showReport, showIntake, getActiveDB,
    setReportModule, reportModuleFromHash,
    loShuGridLayout: LO_SHU_GRID_LAYOUT.map((row) => row.slice()),
    vedicGridLayout: VEDIC_GRID_LAYOUT.map((row) => row.slice())
  };
})();
