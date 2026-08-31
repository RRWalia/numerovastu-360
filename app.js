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

  function relation(a, b) {
    if (a === b) return "friendly"; // a planet is never its own enemy
    const f = (window.DB && window.DB.friendship) ? window.DB.friendship[a] : null;
    if (!f) return "neutral";
    if (f.friends.includes(b)) return "friendly";
    if (f.neutral.includes(b)) return "neutral";
    return "enemy";
  }

  const APP_VERSION = ($('meta[name="nv-version"]') && $('meta[name="nv-version"]').content) || "2.5.0";
  const BUILD_LABEL = ($('meta[name="nv-build-label"]') && $('meta[name="nv-build-label"]').content) || "Build 2026-08-31";
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
  const SECTION = { core: 1, traits: 2, loshu: 3, weak: 4, zodiac: 5, name: 6, mobile: 7, vehicle: 8, watch: 9, crystal: 10, colours: 11, career: 12, timing: 13, memory: 14, vastu: 15, kua: 16, compatibility: 17, goalsStart: 18 };

  const state = {
    lang: "en",
    pack: null,
    history: [],
    contributionEnabled: false,
    lastInput: null,
    activeProfileKey: "",
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

  function getActiveDB() {
    const base = window.DB || {};
    const pack = getI18nPack() || {};
    const merged = Object.assign({}, base, pack);
    if (merged.planes && base.planes) {
      merged.planes = merged.planes.map((pl, i) => Object.assign({}, base.planes[i], pl, { cells: base.planes[i] ? base.planes[i].cells : pl.cells }));
    }
    if (merged.arrows && base.arrows) {
      merged.arrows = merged.arrows.map((ar, i) => Object.assign({}, base.arrows[i], ar, { line: base.arrows[i] ? base.arrows[i].line : ar.line }));
    }
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
      schemaVersion: raw.schemaVersion || 1,
      packVersion: raw.packVersion || "2.2.0",
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
    if (!pack.packVersion || typeof pack.packVersion !== "string") errs.push("missing packVersion");
    if (!pack.db || typeof pack.db !== "object") errs.push("missing db object");
    else {
      const db = pack.db;
      ["numbers", "traits", "planes", "vastu", "crystals", "careers", "personalYear"].forEach((k) => {
        if (!db[k] || typeof db[k] !== "object") errs.push(`db.${k} missing or invalid`);
      });
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
    const badMob = mob.length < 8;
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
    const driver = reduce(d);
    const conductor = reduce(digitSum(input.dob));

    // Loshu counts: DOB digits + driver + conductor (0s excluded)
    const counts = {};
    for (let i = 1; i <= 9; i++) counts[i] = 0;
    const dd = String(d).padStart(2, "0"), mm = String(m).padStart(2, "0"), yyyy = String(y);
    [...digitsOf(dd), ...digitsOf(mm), ...digitsOf(yyyy), driver, conductor].forEach((n) => counts[n]++);
    const missing = Object.keys(counts).filter((k) => counts[k] === 0).map(Number);
    const repeated = Object.keys(counts).filter((k) => counts[k] >= 3).map(Number);
    const weak = Object.keys(counts).filter((k) => counts[k] === 1).map(Number);

    // Name (Chaldean)
    const nameCompound = chaldeanValue(input.name);
    const nameNum = reduce(nameCompound);
    const nameRelD = relation(driver, nameNum);
    const nameRelC = relation(conductor, nameNum);

    const nameCounts = {};
    for (let i = 1; i <= 9; i++) nameCounts[i] = 0;
    const chaldeanMap = (window.DB && window.DB.chaldean) || {};
    input.name.toUpperCase().split("").forEach((ch) => { const v = chaldeanMap[ch]; if (v) nameCounts[v]++; });
    const combinedCounts = {};
    for (let i = 1; i <= 9; i++) combinedCounts[i] = counts[i] + nameCounts[i];

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

    const missingSeverity = missing.map((n) => {
      const inBirth = counts[n] > 0;
      const inName = nameCounts[n] > 0;
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
      driver, conductor, counts, missing, repeated, weak, missingSeverity,
      nameCompound, nameNum, nameRelD, nameRelC, nameCounts, combinedCounts,
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
     missing from the Lo Shu grid, stay non-enemy to both Driver and Conductor,
     and never add to a number the person already has in excess. */
  function buildOptionalSpellings(p) {
    const db = getActiveDB();
    const fillable = p.missing.filter((n) =>
      relation(p.driver, n) !== "enemy" &&
      relation(p.conductor, n) !== "enemy" &&
      !p.repeated.includes(n)
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
    const missingRanked = p.missing.slice().sort((a, b) => {
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
      if (rd !== "enemy" && rc !== "enemy" && !p.missing.includes(n)) {
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

  /* ---- compatibility bridge remedies ----------------------------------
     For each conflicting (enemy) pairing the report now prescribes a
     bridge plan: what the friction looks like, how to conduct around it,
     mutually-acceptable "bridge numbers" (friendly/neutral to BOTH
     charts) and couple rituals drawn from the two planets' remedy kits. */
  const PAIR_BRIDGE = {
    "1-4": {
      friction: { en: "Sun's need for recognition meets Rahu's unconventional, restless style — clashes over authority, credit and \"who is right\".", hi: "सूर्य की पहचान की चाह और राहु की अपरंपरागत, चंचल शैली टकराती है — अधिकार, श्रेय और \"सही कौन\" पर विवाद।", gu: "સૂર્યની ઓળખની ચાહ અને રાહુની અપરંપરાગત, ચંચળ શૈલી અથડાય છે — સત્તા, શ્રેય અને \"સાચો કોણ\" પર વિવાદ." },
      bridge: { en: "Let the 1-side lead decisions openly and publicly credit the 4-side's ideas; the 4-side shares plans before springing them. Serve elders together on Saturdays.", hi: "1 पक्ष निर्णय खुलकर ले और 4 पक्ष के विचारों को सार्वजनिक श्रेय दे; 4 पक्ष योजना पहले बताकर चले। शनिवार को बड़ों की सेवा साथ करें।", gu: "1 પક્ષ નિર્ણય ખુલ્લામાં લે અને 4 પક્ષના વિચારોને સાર્વજનિક શ્રેય આપે; 4 પક્ષ યોજના પહેલાં જણાવી ચાલે. શનિવારે વડીલોની સેવા સાથે કરો." }
    },
    "1-6": {
      friction: { en: "Sun's authority vs Venus's comfort and sociability — one pushes status and discipline, the other beauty, leisure and spending.", hi: "सूर्य का अधिकार बनाम शुक्र का सुख-सामर्थ्य और मिलनसारिता — एक पद और अनुशासन का दबाव देता है, दूसरा सौंदर्य, विश्राम और खर्च की चाह।", gu: "સૂર્યનું વર્ચસ્વ વિરુદ્ધ શુક્રનો આરામ અને મિલનસારપણું — એક પ્રતિષ્ઠા અને શિસ્ત થોપે, બીજો સૌંદર્ય, વિશ્રાંતિ અને ખર્ચ ઇચ્છે." },
      bridge: { en: "Host and celebrate together — Venus-side plans the gathering, Sun-side blesses it publicly. Fix a shared monthly budget so spending never reads as disrespect.", hi: "साथ आयोजन और उत्सव करें — शुक्र पक्ष मेहफिल सजाए, सूर्य पक्ष उसे सार्वजनिक सम्मान दे। साझा मासिक बजट बनाएं ताकि खर्च अनादर न लगे।", gu: "સાથે આયોજન અને ઉજવણી કરો — શુક્ર પક્ષ મહેફિલ સજાવે, સૂર્ય પક્ષ તેને સાર્વજનિક સન્માન આપે. સામુહિક માસિક બજેટ બનાવો જેથી ખર્ચ અનાદર ન લાગે." }
    },
    "1-7": {
      friction: { en: "Sun wants the stage, Ketu prefers silence and withdrawal — one feels ignored, the other feels exposed.", hi: "सूर्य मंच चाहता है, केतु मौन और एकांत — एक को अनदेखा लगता है, दूसरे को बहुत उजाला।", gu: "સૂર્યને સ્ટેજ જોઈએ, કેતુને મૌન અને એકાંત — એકને અવગણના લાગે, બીજાને વધુ પડતું પ્રકાશન." },
      bridge: { en: "Alternate stage and sanctuary: public appreciation for the 1-side, protected quiet time for the 7-side. Share one spiritual practice (temple, meditation) weekly.", hi: "मंच और मौन का एकांतावास बारी-बारी: 1 पक्ष को सार्वजनिक सराहना, 7 पक्ष को सुरक्षित एकांत। साप्ताहिक एक आध्यात्मिक साधना (मंदिर/ध्यान) साझा करें।", gu: "સ્ટેજ અને મૌન વારાફરતી: 1 પક્ષને સાર્વજનિક પ્રશંસા, 7 પક્ષને સુરક્ષિત એકાંત. સાપ્તાહિક એક આધ્યાત્મિક સાધના (મંદિર/ધ્યાન) વહેંચો." }
    },
    "1-8": {
      friction: { en: "Sun's quick authority meets Saturn's slow, tested methods — power struggles, delays read as defiance, discipline as insult.", hi: "सूर्य की तेज़ अधिकार-शैली और शनि की धीमी, परखी हुई पद्धति — सत्ता-संघर्ष, विलंब को विरोध और अनुशासन को अपमान समझा जाता है।", gu: "સૂર્યની ઝડપી સત્તા-શૈલી અને શનિની ધીમી, કસાયેલી પદ્ધતિ — સત્તા-સંઘર્ષ, વિલંબને વિરોધ અને શિસ્તને અપમાન ગણાય." },
      bridge: { en: "Give the 8-side time frames, not ultimatums; the 8-side gives the 1-side visible milestones. Serve workers/elders together; donate iron, oil or black sesame on Saturdays.", hi: "8 पक्ष को अल्टीमेटम नहीं, समय-सीमा दें; 8 पक्ष 1 पक्ष को दृश्य प्रगति दिखाए। साथ मजदूरों/बड़ों की सेवा करें; शनिवार को लोहा, तेल या काले तिल दान करें।", gu: "8 પક્ષને અલ્ટિમેટમ નહીં, સમય-મર્યાદા આપો; 8 પક્ષ 1 પક્ષને દેખાય એવી પ્રગતિ બતાવે. સાથે કામદારો/વડીલોની સેવા કરો; શનિવારે લોખંડ, તેલ કે કાળા તલ દાન કરો." }
    },
    "2-4": {
      friction: { en: "Moon's emotional sensitivity meets Rahu's restlessness — mood swings meet unpredictability, reassurance meets distraction.", hi: "चंद्र की भावुक संवेदनशीलता और राहु की बेचैनी — मन की लहरें अनिश्चितता से टकराती हैं, आश्वासन विचलित करने से।", gu: "ચંદ્રની ભાવુક સંવેદનશીલતા અને રાહુની બેચાની — મનની લહેરો અનિશ્ચિતતા સામે અથડાય, દિલાસો વિચલિત કરે." },
      bridge: { en: "Fixed, soothing routines — same dinner time, device-free evenings. The 4-side states plans plainly; the 2-side voices hurt early instead of storing it.", hi: "नियमित, सुखद दिनचर्या — एक समय भोजन, रात में बिना स्क्रीन का समय। 4 पक्ष योजना स्पष्ट बताए; 2 पक्ष दुख जमा करने की बजाय तुरंत कहे।", gu: "નિયમિત, હૂંફાળી દિનચર્યા — એક સમયે ભોજન, રાત્રે સ્ક્રીન-મુક્ત સમય. 4 પક્ષ યોજના સ્પષ્ટ કહે; 2 પક્ષ દુઃખ ભેગું કરવાને બદલે તરત કહે." }
    },
    "2-7": {
      friction: { en: "Moon needs connection and words; Ketu withdraws into silence — distance feels like rejection, closeness feels like pressure.", hi: "चंद्र को जुड़ाव और वाणी चाहिए; केतु मौन में खो जाता है — दूरी अस्वीकृति और निकटता दबाव लगती है।", gu: "ચંદ્રને જોડાણ અને વાણી જોઈએ; કેતુ મૌનમાં ખોવાય — અંતરાલ અસ્વીકૃતિ અને નિકટતા દબાણ લાગે." },
      bridge: { en: "One gentle, spoken appreciation daily from the 7-side; one no-questions quiet hour for the 7-side from the 2-side. Share moonlit walks or water-side time.", hi: "7 पक्ष रोज़ एक कोमल मौखिक सराहना कहे; 2 पक्ष 7 पक्ष को बिना सवाल का एक शांत घंटा दे। चांदनी में सैर या जल-किनारा साझा करें।", gu: "7 પક્ષ રોજ એક કોમળ મૌખિક પ્રશંસા કહે; 2 પક્ષ 7 પક્ષને પ્રશ્ન વગરનો એક શાંત કલાક આપે. ચાંદનીમાં ચાલ કે પાણી-કિનારો સાથે ભોગવો." }
    },
    "3-4": {
      friction: { en: "Jupiter's tradition and study vs Rahu's shortcuts — the 3-side preaches, the 4-side improvises; both feel unrespected.", hi: "गुरु की परंपरा और अध्ययन बनाम राहु के शॉर्टकट — 3 पक्ष उपदेश देता है, 4 पक्ष जुगाड़ करता है; दोनों को अनादर लगता है।", gu: "ગુરુની પરંપરા અને અભ્યાસ વિરુદ્ધ રાહુના ટૂંકા રસ્તા — 3 પક્ષ ઉપદેશ આપે, 4 પક્ષ જુગાડ કરે; બંનેને અનાદર લાગે." },
      bridge: { en: "Turn preaching into teaching and jugaad into innovation: the 3-side mentors without moralising, the 4-side brings experiments to the table early. Donate books together on Thursdays.", hi: "उपदेश को शिक्षा और जुगाड़ को नवाचार बनाएं: 3 पक्ष बिना नीति-वचन के सिखाए, 4 पक्ष प्रयोग पहले साझा करे। गुरुवार को साथ पुस्तकें दान करें।", gu: "ઉપદેશને શિક્ષણ અને જુગાડને નવીનતા બનાવો: 3 પક્ષ નીતિ-વચન વગર શીખવે, 4 પક્ષ પ્રયોગો પહેલાં મૂકે. ગુરુવારે સાથે પુસ્તકો દાન કરો." }
    },
    "3-5": {
      friction: { en: "Jupiter's depth vs Mercury's speed — advice sounds like criticism to the 5-side; the 3-side finds the 5-side scattered and superficial.", hi: "गुरु की गहराई बनाम बुध की गति — 5 पक्ष को सलाह आलोचना लगती है; 3 पक्ष 5 पक्ष को बिखरा हुआ और ऊपरी समझता है।", gu: "ગુરુની ઊંડાણ વિરુદ્ધ બુધની ઝડપ — 5 પક્ષને સલાહ ટીકા લાગે; 3 પક્ષ 5 પક્ષને બિખરાયેલો અને સપરી સમજે." },
      bridge: { en: "Agree on when to advise and when to just listen. Give the 5-side variety in tasks and the 3-side one deep project; exchange books and skills monthly.", hi: "तय करें कब सलाह देनी है और कब केवल सुनना है। 5 पक्ष को काम में विविधता, 3 पक्ष को एक गहरा प्रोजेक्ट दें; मासिक पुस्तकें/कौशल साझा करें।", gu: "નક્કી કરો ક્યારે સલાહ આપવી અને ક્યારે ફક્ત સાંભળવું. 5 પક્ષને કામમાં વૈવિધ્ય, 3 પક્ષને એક ઊંડો પ્રોજેક્ટ આપો; માસિક પુસ્તકો/કૌશલ્ય વહેંચો." }
    },
    "3-6": {
      friction: { en: "Jupiter's dharma and study vs Venus's comfort and luxury — spending vs saving, devotion vs enjoyment.", hi: "गुरु का धर्म और अध्ययन बनाम शुक्र का आराम और विलासिता — बचत बनाम खर्च, त्याग बनाम भोग।", gu: "ગુરુનો ધર્મ અને અભ્યાસ વિરુદ્ધ શુક્રનો આરામ અને વિલાસ — બચત વિરુદ્ધ ખર્ચ, ત્યાગ વિરુદ્ધ ભોગ." },
      bridge: { en: "Balance altar and dining table: one shared study/devotion hour weekly, and a planned allowance for beauty and food joys — generosity by design, not by guilt.", hi: "पूजा और परोस को संतुलित करें: साप्ताहिक एक साझा अध्ययन/भक्ति घंटा, और सौंदर्य-स्वाद के लिए नियोजित खर्च — बिना अपराध-बोध के औदार्य।", gu: "પૂજા અને પરોસાનું સંતુલન: સાપ્તાહિક એક સામુહિક અભ્યાસ/ભક્તિ કલાક, અને સૌંદર્ય-સ્વાદ માટે આયોજિત ખર્ચ — અપરાધ-ભાવ વગર ઉદારતા." }
    },
    "3-7": {
      friction: { en: "Jupiter's outward teaching vs Ketu's inward detachment — one expands the world, the other renounces it; plans meet sudden withdrawal.", hi: "गुरु का बाहरमुखी उपदेश बनाम केतु का भीतरमुखी वैराग्य — एक जग का विस्तार करता है, दूसरा त्याग; योजनाएँ अचानक मौन से मिलती हैं।", gu: "ગુરુનું બહિર્મુખ શિક્ષણ વિરુદ્ધ કેતુનું અંતર્મુખ વૈરાગ્ય — એક જગતનો વિસ્તાર કરે, બીજો ત્યાગે; યોજનાઓ અચાનક મૌન પામે." },
      bridge: { en: "Honour the 7-side's silences as practice, not rejection; the 7-side announces retreats in advance. Read scripture or walk in nature together weekly.", hi: "7 पक्ष का मौन साधना है, अस्वीकृति नहीं — इसे सम्मान दें; 7 पक्ष एकांत पहले बता दे। साप्ताहिक शास्त्र-पाठ या प्रकृति-भ्रमण साझा करें।", gu: "7 પક્ષનું મૌન સાધના છે, અસ્વીકૃતિ નહીં — તેને સન્માન આપો; 7 પક્ષ એકાંત પહેલાં જણાવે. સાપ્તાહિક શાસ્ત્ર-પાઠ કે પ્રકૃતિ-સવારી સાથે કરો." }
    },
    "4-9": {
      friction: { en: "Rahu's risky shortcuts meet Mars's blunt force — impulsive decisions meet a short fuse; arguments escalate fast.", hi: "राहु के जोखिम भरे शॉर्टकट और मंगल की सीधी तेज़ शक्ति — आवेशी निर्णय और तपती ज़ुबान; बहस तेज़ी से बढ़ती है।", gu: "રાહુના જોખમી ટૂંકા રસ્તા અને મંગળની સીધી તેજ શક્તિ — આવેશી નિર્ણય અને ગરમ જીભ; વાદ-વિવાદ ઝડપથી વધે." },
      bridge: { en: "Cool the fire with the body: exercise or sport together before hard talks. The 9-side speaks after counting to ten; the 4-side drops half-finished risky plans.", hi: "शरीर से अग्नि शांत करें: कठिन बात से पहले साथ व्यायाम/खेल। 9 पक्ष दस तक गिनकर बोले; 4 पक्ष अधूरे जोखिम भरे प्लान छोड़ दे।", gu: "શરીરથી અગ્નિ શાંત કરો: કઠિન વાત પહેલાં સાથે કસરત/રમત. 9 પક્ષ દસ ગણીને બોલે; 4 પક્ષ અધૂરા જોખમી પ્લાન છોડી દે." }
    },
    "7-9": {
      friction: { en: "Ketu's detachment vs Mars's fiery drive — one renounces, one conquers; shared plans stall between mysticism and muscle.", hi: "केतु का वैराग्य बनाम मंगल की तेज़ चाह — एक त्यागता है, दूसरा जीतता है; रहस्यवाद और बल के बीच योजनाएँ अटकती हैं।", gu: "કેતુનો વૈરાગ્ય વિરુદ્ધ મંગળની તેજ ઇચ્છા — એક ત્યાગે, બીજો જીતે; રહસ્યવાદ અને બળ વચ્ચે યોજનાઓ અટકે." },
      bridge: { en: "Channel Mars into seva (service) and Ketu into shared pilgrimage — purpose unites them. The 9-side sets the pace, the 7-side sets the meaning; review goals under one roof monthly.", hi: "मंगल को सेवा में और केतु को साझा तीर्थ में जोड़ें — उद्देश्य दोनों को जोड़ता है। 9 पक्ष गति निर्धारित करे, 7 पक्ष अर्थ; मासिक एक स्थान पर लक्ष्य समीक्षा करें।", gu: "મંગળને સેવામાં અને કેતુને સામુહિક તીર્થમાં જોડો — હેતુ બંનેને જોડે. 9 પક્ષ ગતિ નક્કી કરે, 7 પક્ષ અર્થ; માસિક એક સ્થળે લક્ષ્ય-સમીક્ષા કરો." }
    }
  };

  function pairKey(x, y) { return Math.min(x, y) + "-" + Math.max(x, y); }

  function compatRemedies(a, b, compat) {
    const db = getActiveDB();
    const conflicts = compat.pairs
      .filter((pr) => pr.r === "enemy")
      .map((pr) => {
        const g = PAIR_BRIDGE[pairKey(pr.aNum, pr.bNum)] || null;
        return Object.assign({}, pr, {
          planetA: db.numbers[pr.aNum].planet,
          planetB: db.numbers[pr.bNum].planet,
          friction: g ? g.friction : null,
          bridge: g ? g.bridge : null
        });
      });
    /* bridge numbers: acceptable (never enemy) to BOTH charts, ranked */
    const four = [a.driver, a.conductor, b.driver, b.conductor].filter((n, i, arr) => arr.indexOf(n) === i);
    const bridges = [];
    for (let n = 1; n <= 9; n++) {
      const rels = four.map((m) => (m === n ? "friendly" : relation(m, n)));
      if (rels.indexOf("enemy") !== -1) continue;
      const score = rels.reduce((s, r) => s + (r === "friendly" ? 2 : 1), 0);
      bridges.push({ n, score, planet: db.numbers[n].planet.split(" ")[0], day: db.numbers[n].day, color: db.numbers[n].color.split(",")[0] });
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

  function timingAnalysis(p) {
    const now = new Date();
    const cy = now.getFullYear();
    const personalYearNum = (yr) => reduce(p.day + p.month + reduce(yr));
    const db = getActiveDB();

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
    return { years, luckyYears, milestones, curAge };
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
      const weak = nums.filter((n) => p.missing.includes(n));
      const strong = nums.filter((n) => !p.missing.includes(n));
      const focus = weak.length ? weak : nums.slice(0, 2);
      return { goal: g, weak, strong, focus: focus.map((n) => ({ n, ...db.numbers[n] })) };
    });
  }

  function priorityPlan(p, nameSug, mobSug, vastu) {
    const daily = [];
    const weekly = [];
    const once = [];
    const weakGoalNums = new Set();
    const db = getActiveDB();
    const goalsMap = (window.DB && window.DB.goals) || {};
    const lang = getLang();

    p.goals.forEach((g) => (goalsMap[g] || []).forEach((n) => { if (p.missing.includes(n)) weakGoalNums.add(n); }));
    const criticalFirst = (p.missingSeverity || []).filter((m) => m.critical).map((m) => m.n);
    const rankOrder = criticalFirst.length ? criticalFirst : p.missing;
    const orderedWeak = Array.from(weakGoalNums).sort((a, b) => {
      const ra = rankOrder.indexOf(a), rb = rankOrder.indexOf(b);
      return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
    });

    orderedWeak.forEach((n) => {
      const info = db.numbers[n];
      if (lang === "hi") {
        daily.push({ cadence: "daily", text: `<strong>${info.planet}</strong> को बलवान बनाएं (ग्रिड में अनुपस्थित अंक ${n}): <span class="mantra">${esc(info.mantra)}</span> का जाप करें (${esc(info.mantraCount)}), ${esc(info.day)} को ${esc(info.color.split(",")[0])} वस्त्र पहनें और ${esc(info.crystal)} धारण करें।` });
      } else if (lang === "gu") {
        daily.push({ cadence: "daily", text: `<strong>${info.planet}</strong> ને બળવાન બનાવો (ગ્રીડમાં ખૂટતો અંક ${n}): <span class="mantra">${esc(info.mantra)}</span> નો જાપ કરો (${esc(info.mantraCount)}), ${esc(info.day)} ના દિવસે ${esc(info.color.split(",")[0])} વસ્ત્રો પહેરો અને ${esc(info.crystal)} ધારણ કરો.` });
      } else {
        daily.push({ cadence: "daily", text: `Strengthen <strong>${info.planet}</strong> (missing ${n} in your grid): chant <span class="mantra">${esc(info.mantra)}</span> ${esc(info.mantraCount)}, wear ${esc(info.color.split(",")[0])} on ${esc(info.day)}, and consider ${esc(info.crystal)}.` });
      }
    });

    const dayD = dayOf(p.driver);
    const dayC = dayOf(p.conductor);
    const sameDay = dayD === dayC;

    if (lang === "hi") {
      weekly.push({ cadence: "weekly", text: `साप्ताहिक नियम: अपने मूलांक वार (<strong>${dayD}</strong>)${sameDay ? " और भाग्यांक वार के उपाय साथ करें (दोनों एक ही दिन हैं)" : ` और भाग्यांक वार (<strong>${dayC}</strong>) के उपाय करें`} — बताए अनुसार दान, शुभ रंग और व्रत का पालन करें।` });
      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        once.push({ cadence: "once", text: `नाम की स्पेलिंग में सुधार करें — जन्म अंकों से तालमेल के लिए <strong>${esc(nameSug.variants[0].text)}</strong> (${nameSug.variants[0].compound} → ${nameSug.variants[0].reduced}) अपनाएं।` });
      }
      if (mobSug.needed) {
        once.push({ cadence: "once", text: `मोबाइल नंबर बदलने की योजना बनाएं — मूलांक ${p.driver} और भाग्यांक ${p.conductor} की शुभता के लिए ऐसा नंबर चुनें जिसके अंकों का कुल योग <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> हो।` });
      }
      once.push({ cadence: "once", text: `अनुकूल घड़ी पहनें (खंड ${SECTION.watch} के अनुसार धातु, डायल और आकार) — <strong>${dayD}</strong> की सुबह ६:३०–८:३० बजे इसे सक्रिय करें।` });
      vastu.filter((f) => f.tone === "bad").slice(0, 2).forEach((f) => {
        once.push({ cadence: "once", text: `वास्तु सुधार: <strong>${esc(f.item)}</strong> — खंड ${SECTION.vastu} में दिया गया सरल उपाय करें।` });
      });
    } else if (lang === "gu") {
      weekly.push({ cadence: "weekly", text: `સાપ્તાહિક નિયમ: તમારા મૂળાંક વાર (<strong>${dayD}</strong>)${sameDay ? " અને ભાગ્યાંક વારના ઉપાયો સાથે કરો (બંને એક જ દિવસે છે)" : ` અને ભાગ્યાંક વાર (<strong>${dayC}</strong>) ના ઉપાયો કરો`} — જણાવ્યા મુજબ દાન, શુભ રંગ અને ઉપવાસનું પાલન કરો.` });
      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        once.push({ cadence: "once", text: `નામની સ્પેલિંગમાં સુધારો કરો — જન્મ અંકો સાથે સુમેળ માટે <strong>${esc(nameSug.variants[0].text)}</strong> (${nameSug.variants[0].compound} → ${nameSug.variants[0].reduced}) અપનાવો.` });
      }
      if (mobSug.needed) {
        once.push({ cadence: "once", text: `મોબાઈલ નંબર બદલવાનું આયોજન કરો — મૂળાંક ${p.driver} અને ભાગ્યાંક ${p.conductor} ની શુભતા માટે એવો નંબર પસંદ કરો જેના અંકોનો કુલ સરવાળો <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> થતો હોય.` });
      }
      once.push({ cadence: "once", text: `અનુકૂળ ઘડિયાળ પહેરો (વિભાગ ${SECTION.watch} મુજબ ધાતુ, ડાયલ અને આકાર) — <strong>${dayD}</strong> ની સવારે ૬:૩૦–૮:૩૦ વાગ્યે તેને ધારણ કરો.` });
      vastu.filter((f) => f.tone === "bad").slice(0, 2).forEach((f) => {
        once.push({ cadence: "once", text: `વાસ્તુ સુધારો: <strong>${esc(f.item)}</strong> — વિભાગ ${SECTION.vastu} માં આપેલો સરળ ઉપાય કરો.` });
      });
    } else {
      weekly.push({ cadence: "weekly", text: `Weekly rhythm: observe your Driver day (<strong>${DAY_OF[p.driver]}</strong>)${sameDay ? " and Conductor day remedies together (both fall on the same day for you)" : ` and Conductor day (<strong>${DAY_OF[p.conductor]}</strong>) remedies`} — charity, colours and fasting as listed.` });
      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        once.push({ cadence: "once", text: `Correct your name spelling — try <strong>${esc(nameSug.variants[0].text)}</strong> (${nameSug.variants[0].compound} → ${nameSug.variants[0].reduced}) to align with your birth numbers.` });
      }
      if (mobSug.needed) {
        once.push({ cadence: "once", text: `Plan a mobile-number change — choose a number whose digits total <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> for harmony with Driver ${p.driver} and Conductor ${p.conductor}.` });
      }
      once.push({ cadence: "once", text: `Wear the aligned watch spec (metal, dial, geometry as per Section ${SECTION.watch}) — activate it on <strong>${DAY_OF[p.driver]}</strong> morning, 6:30–8:30 AM.` });
      vastu.filter((f) => f.tone === "bad").slice(0, 2).forEach((f) => {
        once.push({ cadence: "once", text: `Vastu correction: <strong>${esc(f.item)}</strong> — apply the remedy listed in Section ${SECTION.vastu}.` });
      });
    }

    return daily.concat(weekly, once).slice(0, 9);
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

  function northstarSummary(p, timing, goals, vastu, nameSug, mobSug) {
    const db = getActiveDB();
    const lang = getLang();
    const driverInfo = db.numbers[p.driver];
    const conductorInfo = db.numbers[p.conductor];
    const currentYear = timing.years[0];
    const criticalMissing = (p.missingSeverity || []).filter((m) => m.critical).map((m) => m.n);
    const missingFocus = criticalMissing.length ? criticalMissing : p.missing.slice(0, 3);
    const goalNames = p.goals.length ? p.goals : ["overall growth"];
    const doshCount = vastu.filter((f) => f.tone === "bad").length;
    const firstGoal = goals[0];
    const firstGoalFocus = firstGoal && firstGoal.focus && firstGoal.focus.length
      ? firstGoal.focus.map((f) => `${f.n} (${f.planet})`).join(", ")
      : `${p.driver} (${driverInfo.planet}) and ${p.conductor} (${conductorInfo.planet})`;

    let nameLine, mobileLine, vastuLine, headline, story, moves = [];

    if (lang === "hi") {
      nameLine = nameSug.needed && nameSug.variants && nameSug.variants.length
        ? `नाम की स्पेलिंग सुधारना एक प्रभावशाली कदम है: कानूनी बदलाव से पहले <strong>${esc(nameSug.variants[0].text)}</strong> को ४० दिनों तक लिखकर अभ्यास करें।`
        : "आपके वर्तमान नाम की ऊर्जा अनुकूल है; दैनिक साधना, उपाय और घर के वास्तु पर ध्यान दें।";
      mobileLine = mobSug.needed
        ? `आपके मोबाइल नंबर की ऊर्जा में सुधार संभव है; भविष्य में कुल योग <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> वाला नंबर चुनें।`
        : "आपका मोबाइल नंबर ठीक है; दैनिक उपायों और वास्तु सुधार पर ध्यान केंद्रित रखें।";
      vastuLine = doshCount
        ? `${doshCount} वास्तु दोष पर ध्यान देने की आवश्यकता है; सबसे अधिक उपयोग होने वाले कमरों के उपाय पहले करें।`
        : "दिए गए विवरण में कोई बड़ा वास्तु दोष नहीं है; ब्रह्मस्थान साफ रखें और ईशान कोण में रोज दीया जलाएं।";

      if (missingFocus.length) {
        const pNames = missingFocus.slice(0, 2).map((n) => `${esc(db.numbers[n].planet.split(" ")[0])} (${n})`).join(" + ");
        moves.push({ title: `कमजोर कड़ी को मजबूत करें — ${pNames}`, detail: `यह अंक आपके लो-शू ग्रिड में अनुपस्थित हैं और आपके मुख्य लक्ष्यों को प्रभावित करते हैं। इन्हें दैनिक साधना में प्राथमिकता दें।` });
      } else {
        moves.push({ title: "संतुलित ग्रिड की सुरक्षा", detail: "सभी नौ अंक मौजूद हैं — आपको केवल नियमित साधना से सभी ग्रहों की ऊर्जा बनाए रखनी है।" });
      }

      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        moves.push({ title: `सुधरे हुए नाम का अभ्यास — ${esc(nameSug.variants[0].text)}`, detail: "प्रतिदिन २१ बार नई स्पेलिंग लिखें और गैर-कानूनी प्रोफाइल्स पर पहले उपयोग करें।" });
      } else if (mobSug.needed) {
        moves.push({ title: "मोबाइल नंबर की ऊर्जा संतुलित करें", detail: `भविष्य में कुल योग ${mobSug.goodTotals.slice(0, 3).join(", ")} वाला नंबर लेने की योजना बनाएं।` });
      } else {
        moves.push({ title: "नाम और नंबर पूरी तरह अनुकूल हैं", detail: "पहचान स्तर पर कोई बदलाव जरूरी नहीं है, इसलिए अपनी पूरी ऊर्जा दैनिक उपायों और वास्तु पर लगाएं।" });
      }

      const topDosh = vastu.find((f) => f.tone === "bad");
      if (topDosh) {
        moves.push({ title: `${esc(topDosh.item)} का वास्तु दोष ठीक करें`, detail: "यह आपके घर का सबसे संवेदनशील कोना है। पहले हफ्ते में ही इसका उपाय करें ताकि स्थान की सकारात्मकता बढ़े।" });
      } else {
        moves.push({ title: "ब्रह्मस्थान साफ रखें और ईशान में दीया जलाएं", detail: "घर के केंद्र को खाली रखें और ईशान कोण में रोज दीया जलाकर सकारात्मक ऊर्जा का संचार बनाए रखें।" });
      }

      headline = `${esc(firstNameOf(p.name))}, आपका मुख्य मार्गदर्शक ${esc(driverInfo.planet.split(" ")[0])} की स्पष्ट सोच और ${esc(conductorInfo.planet.split(" ")[0])} के कर्म द्वारा ${esc(goalNames.join(" + "))} में अनुशासित प्रगति है।`;
      story = `आपका मूलांक ${p.driver} (${esc(driverInfo.planet)}) यह तय करता है कि आप दैनिक रूप से कैसे सोचते हैं, जबकि भाग्यांक ${p.conductor} (${esc(conductorInfo.planet)}) वह भाग्य मार्ग दिखाता है जिससे स्थायी सफलता मिलती है। सरल शब्दों में: ${esc(driverInfo.traits.split(",")[0])} के साथ शुरुआत करें और ${esc(conductorInfo.traits.split(",")[0])} के अनुसार ठोस सिस्टम बनाएं। ${missingFocus.length ? `मुख्य रूप से अनुपस्थित अंक <strong>${missingFocus.join(", ")}</strong> के उपाय सबसे पहले करें क्योंकि ये आपके चुने हुए लक्ष्यों को प्रभावित करते हैं।` : "आपके ग्रिड में सभी अंक मौजूद हैं, इसलिए केवल नियमित संतुलन बनाए रखना है।"}`;

    } else if (lang === "gu") {
      nameLine = nameSug.needed && nameSug.variants && nameSug.variants.length
        ? `નામની સ્પેલિંગ સુધારવી એ મોટો પ્રભાવશાળી ઉપાય છે: કાનૂની ફેરફાર પહેલાં <strong>${esc(nameSug.variants[0].text)}</strong> ને ૪૦ દિવસ સુધી લખીને ટેવ પાડો.`
        : "તમારા હાલના નામની ઊર્જા અનુકૂળ છે; દૈનિક સાધના, ઉપાયો અને ઘરના વાસ્તુ પર ધ્યાન આપો.";
      mobileLine = mobSug.needed
        ? `તમારા મોબાઈલ નંબરની ઊર્જા સુધારી શકાય છે; ભવિષ્યમાં કુલ સરવાળો <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> વાળો નંબર પસંદ કરો.`
        : "તમારો મોબાઈલ નંબર સામાન્ય છે; દૈનિક ઉપાયો અને વાસ્તુ સુધારા પર ધ્યાન કેન્દ્રિત રાખો.";
      vastuLine = doshCount
        ? `${doshCount} વાસ્તુ દોષ પર ધ્યાન આપવાની જરૂર છે; સૌથી વધુ વપરાતા રૂમના ઉપાયો પહેલાં કરો.`
        : "આપેલી વિગતોમાં કોઈ મોટો વાસ્તુ દોષ નથી; બ્રહ્મસ્થાન સાફ રાખો અને ઇશાન ખૂણામાં રોજ દીવો પ્રગટાવો.";

      if (missingFocus.length) {
        const pNames = missingFocus.slice(0, 2).map((n) => `${esc(db.numbers[n].planet.split(" ")[0])} (${n})`).join(" + ");
        moves.push({ title: `નબળી કડીને બળવાન બનાવો — ${pNames}`, detail: `આ અંકો તમારા લો-શુ ગ્રીડમાં ખૂટે છે અને તમારા મુખ્ય લક્ષ્યોને અસર કરે છે. આને દૈનિક સાધનામાં પ્રાથમિકતા આપો.` });
      } else {
        moves.push({ title: "સંતુલિત ગ્રીડની જાળવણી", detail: "બધા જ નવ અંકો હાજર છે — તમારે માત્ર નિયમિત સાધનાથી બધા ગ્રહોની ઊર્જા જાળવી રાખવાની છે." });
      }

      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        moves.push({ title: `સુધારેલી સ્પેલિંગનો અભ્યાસ — ${esc(nameSug.variants[0].text)}`, detail: "દરરોજ ૨૧ વખત નવી સ્પેલિંગ લખો અને બિન-કાનૂની પ્રોફાઇલ પર પહેલાં વાપરો." });
      } else if (mobSug.needed) {
        moves.push({ title: "મોબાઈલ નંબરની ઊર્જા સંતુલિત કરો", detail: `ભવિષ્યમાં કુલ સરવાળો ${mobSug.goodTotals.slice(0, 3).join(", ")} વાળો નંબર લેવાનું આયોજન કરો.` });
      } else {
        moves.push({ title: "નામ અને નંબર સંપૂર્ણ અનુકૂળ છે", detail: "ઓળખ સ્તરે કોઈ ફેરફાર જરૂરી નથી, તેથી તમારી સંપૂર્ણ ઊર્જા દૈનિક ઉપાયો અને વાસ્તુ પર લગાવો." });
      }

      const topDosh = vastu.find((f) => f.tone === "bad");
      if (topDosh) {
        moves.push({ title: `${esc(topDosh.item)} નો વાસ્તુ દોષ સુધારો`, detail: "આ તમારા ઘરનો સૌથી સંવેદનશીલ ખૂણો છે. પ્રથમ અઠવાડિયામાં જ તેનો ઉપાય કરો જેથી વાતાવરણ હકારાત્મક બને." });
      } else {
        moves.push({ title: "બ્રહ્મસ્થાન સાફ રાખો અને ઇશાનમાં દીવો પ્રગટાવો", detail: "ઘરના મધ્ય ભાગને ખાલી રાખો અને ઇશાન ખૂણામાં રોજ દીવો પ્રગટાવીને હકારાત્મક ઊર્જા જાળવી રાખો." });
      }

      headline = `${esc(firstNameOf(p.name))}, તમારું મુખ્ય માર્ગદર્શન ${esc(driverInfo.planet.split(" ")[0])} ની સ્પષ્ટ વિચારસરણી અને ${esc(conductorInfo.planet.split(" ")[0])} ના કર્મ દ્વારા ${esc(goalNames.join(" + "))} માં શિસ્તબદ્ધ પ્રગતિ છે.`;
      story = `તમારો મૂળાંક ${p.driver} (${esc(driverInfo.planet)}) એ દર્શાવે છે કે તમે દૈનિક કેવી રીતે વિચારો છો, જ્યારે ભાગ્યાંક ${p.conductor} (${esc(conductorInfo.planet)}) તે ભાગ્ય માર્ગ દર્શાવે છે જેથી સ્થાયી સફળતા મળે છે. સરળ શબ્દોમાં: ${esc(driverInfo.traits.split(",")[0])} સાથે શરૂઆત કરો અને ${esc(conductorInfo.traits.split(",")[0])} મુજબ મજબૂત સિસ્ટમ બનાવો. ${missingFocus.length ? `મુખ્યત્વે ખૂટતા અંક <strong>${missingFocus.join(", ")}</strong> ના ઉપાયો પહેલાં કરો કારણ કે તે તમારા પસંદ કરેલા લક્ષ્યોને અસર કરે છે.` : "તમારા ગ્રીડમાં બધા અંકો હાજર છે, તેથી માત્ર નિયમિત સંતુલન જાળવી રાખવાનું છે."}`;

    } else {
      nameLine = nameSug.needed && nameSug.variants && nameSug.variants.length
        ? `Name correction is a high-leverage identity action: test <strong>${esc(nameSug.variants[0].text)}</strong> for 40 days before making legal changes.`
        : "Your current name vibration is workable; focus first on consistency, remedies and environment.";
      mobileLine = mobSug.needed
        ? `Your mobile vibration can be improved; prefer future totals <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong>.`
        : "Your mobile vibration is not the first bottleneck; keep attention on the daily practice and environment fixes.";
      vastuLine = doshCount
        ? `${doshCount} Vastu correction${doshCount === 1 ? "" : "s"} need attention; handle the most-used zones first.`
        : "No major Vastu dosh dominates the inputs given; keep Brahmasthan clean and northeast light active.";

      if (missingFocus.length) {
        const planetNames = missingFocus.slice(0, 2).map((n) => `${esc(db.numbers[n].planet.split(" ")[0])} (${n})`).join(" + ");
        moves.push({
          title: `Seal the leak — power up ${planetNames}`,
          detail: `${missingFocus.length > 1 ? "These numbers are" : "This number is"} missing from your Lo Shu grid and directly ${missingFocus.length > 1 ? "gate" : "gates"} your chosen focus areas. ${missingFocus.length > 1 ? "They headline" : "It headlines"} your daily ritual.`
        });
      } else {
        moves.push({
          title: "Protect a rare, complete grid",
          detail: "All nine numbers are present — your work is refinement, not repair. Your ritual is a maintenance practice that keeps every planet fed."
        });
      }

      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        moves.push({
          title: `Trial a corrected spelling — ${esc(nameSug.variants[0].text)}`,
          detail: "Identity vibrations compound daily. Run a 40-day writing trial before touching legal documents; the full protocol is in the Name section and the plan."
        });
      } else if (mobSug.needed) {
        moves.push({
          title: "Re-tune your most-used vibration",
          detail: `Your mobile number rings all day — plan a future number totalling ${mobSug.goodTotals.slice(0, 3).join(", ")} when the 40-day window feels settled.`
        });
      } else {
        moves.push({
          title: "Your name and number already cooperate",
          detail: "No identity change is required, so every drop of effort goes into practice and environment — the two levers that move fastest."
        });
      }

      const topDosh = vastu.find((f) => f.tone === "bad");
      if (topDosh) {
        moves.push({
          title: `Quiet the ${esc(topDosh.item)} zone`,
          detail: "This is the highest-friction corner in your Vastu scan. Correct it in the first week so the space stops arguing with your remedies."
        });
      } else {
        moves.push({
          title: `Keep the centre light and the northeast lit`,
          detail: "Your space shows no dominant dosh — a clean Brahmasthan and a daily northeast diya hold the field while your remedies work."
        });
      }

      headline = `${esc(firstNameOf(p.name))}, your northstar is disciplined ${esc(goalNames.join(" + ").toLowerCase())} growth through ${esc(driverInfo.planet.split(" ")[0])} clarity and ${esc(conductorInfo.planet.split(" ")[0])} execution.`;
      story = `Your Driver ${p.driver} (${esc(driverInfo.planet)}) shapes how you think and respond each day, while Conductor ${p.conductor} (${esc(conductorInfo.planet)}) shows the destiny path that gives lasting results. In simple terms: lead with ${esc(driverInfo.traits.split(",")[0].toLowerCase())}, but build systems that satisfy ${esc(conductorInfo.traits.split(",")[0].toLowerCase())}. ${missingFocus.length ? `The main leaks to plug are missing number${missingFocus.length > 1 ? "s" : ""} <strong>${missingFocus.join(", ")}</strong>; these become the first remedy targets because they affect your selected focus areas.` : "Your birth grid has no missing numbers, so the path is about refinement rather than repair."}`;
    }

    const cards = [
      { label: lang === "hi" ? "मुख्य दिशा" : lang === "gu" ? "મુખ્ય દિશા" : "Primary direction", value: lang === "hi" ? `${esc(goalNames.join(", "))} पर फोकस` : lang === "gu" ? `${esc(goalNames.join(", "))} પર ફોકસ` : `Focus on ${esc(goalNames.join(", "))}`, note: lang === "hi" ? `दैनिक निर्णयों में मूलांक ${p.driver} और दीर्घकालिक लक्ष्यों में भाग्यांक ${p.conductor} का उपयोग करें।` : lang === "gu" ? `દૈનિક નિર્ણયોમાં મૂળાંક ${p.driver} અને લાંબા ગાળાના લક્ષ્યોમાં ભાગ્યાંક ${p.conductor} નો ઉપયોગ કરો.` : `Use Driver ${p.driver} for daily decisions and Conductor ${p.conductor} for long-term commitments.` },
      { label: lang === "hi" ? "यह वर्ष" : lang === "gu" ? "આ વર્ષ" : "This year", value: currentYear ? (lang === "hi" ? `व्यक्तिगत वर्ष ${currentYear.n}` : lang === "gu" ? `વ્યક્તિગત વર્ષ ${currentYear.n}` : `Personal Year ${currentYear.n}`) : "Timing check", note: currentYear ? esc(currentYear.meaning) : "Use the timing section before major moves." },
      { label: lang === "hi" ? "मुख्य उपाय" : lang === "gu" ? "મુખ્ય ઉપાય" : "Remedy focus", value: esc(firstGoalFocus), note: firstGoal && firstGoal.weak.length ? (lang === "hi" ? "ये अंक आपके लक्ष्य में बाधा डालते हैं, इन्हें मजबूत करें।" : lang === "gu" ? "આ અંકો તમારા લક્ષ્યમાં અવરોધ નાખે છે, આને મજબૂત કરો." : `These numbers block ${esc(firstGoal.goal.toLowerCase())} when unsupported.`) : (lang === "hi" ? "शुभ रंग, मंत्र और साप्ताहिक नियम से ऊर्जा बनाए रखें।" : lang === "gu" ? "શુભ રંગ, મંત્ર અને સાપ્તાહિક નિયમથી ઊર્જા જાળવી રાખો." : "Maintain these energies through colour, mantra and weekly rhythm.") },
      { label: lang === "hi" ? "वास्तु स्थिति" : lang === "gu" ? "વાસ્તુ સ્થિતિ" : "Environment", value: doshCount ? (lang === "hi" ? `${doshCount} वास्तु दोष चिह्नित` : lang === "gu" ? `${doshCount} વાસ્તુ દોષ ચિહ્નિત` : `${doshCount} Vastu dosha${doshCount === 1 ? "" : "s"} flagged`) : (lang === "hi" ? "वास्तु संतुलित है" : lang === "gu" ? "વાસ્તુ સંતુલિત છે" : "Vastu maintenance"), note: esc(plainText(vastuLine)) }
    ];

    return { headline, story, cards, checks: [nameLine, mobileLine, vastuLine], moves };
  }

  function activationPlan(p, timing, goals, vastu, nameSug, mobSug) {
    const db = getActiveDB();
    const lang = getLang();
    const driverInfo = db.numbers[p.driver];
    const conductorInfo = db.numbers[p.conductor];
    const criticalMissing = (p.missingSeverity || []).filter((m) => m.critical).map((m) => m.n);
    const missingFocus = criticalMissing.length ? criticalMissing : p.missing.slice(0, 3);
    const targetN = missingFocus[0] || p.driver;
    const target = db.numbers[targetN];
    const targetShort = db.mantraShort[targetN];
    const secondaryN = missingFocus.filter((n) => n !== targetN)[0] || (missingFocus.length ? null : p.conductor);
    const secondary = secondaryN ? db.numbers[secondaryN] : null;
    const badVastu = vastu.filter((f) => f.tone === "bad");
    const firstGoalName = goals[0] ? goals[0].goal : null;
    const currentYearLucky = timing.luckyYears.some((entry) => entry.yr === new Date().getFullYear());

    let daily = [];
    if (lang === "hi") {
      daily = [
        { ico: "🌅", label: "सूर्योदय मंत्र जाप", value: `<span class="mantra">${esc(targetShort.dev)}</span> <em>(${esc(targetShort.pron)})</em> — २७ बार, सुबह ८ बजे से पहले`, sub: `${esc(targetShort.meaning)} यह आपके ${missingFocus.length ? "निर्बल ग्रह" : "मूलांक ग्रह"} ${esc(target.planet)} को शक्ति देता है।` },
        { ico: "📝", label: "संकल्प पत्र (विश पेपर)", value: `लिखें: “${esc(targetShort.affirmation)}” ११ बार`, sub: "कागज को मोड़कर अपने पर्स या तकिए के नीचे रखें — लिखित संकल्प ऊर्जा को स्थापित करता है।" },
        { ico: "🎨", label: "शुभ रंग धारण करें", value: `प्रत्येक ${esc(target.day)} को ${esc(target.color.split(",")[0])} रंग का प्रयोग करें; अपने मूलांक वार (${dayOf(p.driver)}) को ${esc(driverInfo.color.split(",")[0])} पहनें`, sub: "रंग सबसे सुगम उपाय है — रुमाल, धागा, घड़ी का स्ट्रैप भी पर्याप्त है।" },
        { ico: "🌿", label: "जीवनशैली नियम", value: esc(target.lifestyle.split(";")[0]), sub: `${esc(target.planet)} का दैनिक अनुशासन — छोटा पर चमत्कारी प्रभाव।` }
      ];
    } else if (lang === "gu") {
      daily = [
        { ico: "🌅", label: "સૂર્યોદય મંત્ર જાપ", value: `<span class="mantra">${esc(targetShort.dev)}</span> <em>(${esc(targetShort.pron)})</em> — ૨૭ વખત, સવારે ૮ વાગ્યા પહેલાં`, sub: `${esc(targetShort.meaning)} આ તમારા ${missingFocus.length ? "ખૂટતા ગ્રહ" : "મૂળાંક ગ્રહ"} ${esc(target.planet)} ને બળ આપે છે.` },
        { ico: "📝", label: "સંકલ્પ પત્ર (વિશ પેપર)", value: `લખો: “${esc(targetShort.affirmation)}” ૧૧ વખત`, sub: "કાગળને વાળીને પર્સમાં કે ઓશીકા નીચે રાખો — લખેલો સંકલ્પ ઊર્જાને સ્થાપિત કરે છે." },
        { ico: "🎨", label: "શુભ રંગ ધારણ કરો", value: `દરેક ${esc(target.day)} ના દિવસે ${esc(target.color.split(",")[0])} રંગ વાપરો; મૂળાંક વાર (${dayOf(p.driver)}) ના દિવસે ${esc(driverInfo.color.split(",")[0])} પહેરો`, sub: "રંગ સૌથી સરળ ઉપાય છે — રૂમાલ, દોરો કે ઘડિયાળનો સ્ટ્રેપ પણ ચાલે." },
        { ico: "🌿", label: "જીવનશૈલી નિયમ", value: esc(target.lifestyle.split(";")[0]), sub: `${esc(target.planet)} નો દૈનિક નિયમ — નાનો પણ અદ્ભુત પ્રભાવ.` }
      ];
    } else {
      daily = [
        { ico: "🌅", label: "Sunrise mantra", value: `<span class="mantra">${esc(targetShort.dev)}</span> <em>(${esc(targetShort.pron)})</em> — 27 times, ideally before 8 AM`, sub: `${esc(targetShort.meaning)} This feeds ${esc(target.planet)}, your ${missingFocus.length ? "weakest link" : "Driver planet"}.` },
        { ico: "📝", label: "Wish paper", value: `Write “${esc(targetShort.affirmation)}” 11 times`, sub: "Then keep the paper in your wallet or under your pillow — the written word anchors the vibration." },
        { ico: "🎨", label: "Dress the vibration", value: `Touch ${esc(target.color.split(",")[0].toLowerCase())} every ${esc(target.day.split(" ")[0])}; wear your Driver colour (${esc(driverInfo.color.split(",")[0].toLowerCase())}) on ${esc(DAY_OF[p.driver])}`, sub: "Colour is the fastest wearable remedy — even a thread, watch-strap or phone wallpaper counts." },
        { ico: "🌿", label: "Lifestyle cue", value: esc(target.lifestyle.split(";")[0]), sub: `${esc(target.planet)}'s daily discipline — small, boring, compounding.` }
      ];
    }

    const weekly = [];
    const dDay = dayOf(p.driver), cDay = dayOf(p.conductor);
    if (lang === "hi") {
      weekly.push({ day: dDay, planet: `${p.driver} — ${esc(driverInfo.planet)}`, note: "मूलांक वार — नए कार्य शुरू करने और मुख्य उपाय करने के लिए सर्वोत्तम", charity: driverInfo.charity, fast: driverInfo.fast });
      if (cDay !== dDay) {
        weekly.push({ day: cDay, planet: `${p.conductor} — ${esc(conductorInfo.planet)}`, note: "भाग्यांक वार — बड़े वित्तीय व दीर्घकालिक निर्णयों के लिए सर्वोत्तम", charity: conductorInfo.charity, fast: conductorInfo.fast });
      }
      if (targetN !== p.driver && targetN !== p.conductor && target.day.indexOf(dDay) !== 0 && target.day.indexOf(cDay) !== 0) {
        weekly.push({ day: target.day, planet: `${targetN} — ${esc(target.planet)}`, note: `अनुपस्थित अंक ${targetN} का उपाय वार — इस दिन विशेष दान व नियम पालें`, charity: target.charity, fast: target.fast });
      }
    } else if (lang === "gu") {
      weekly.push({ day: dDay, planet: `${p.driver} — ${esc(driverInfo.planet)}`, note: "મૂળાંક વાર — નવા કામ શરૂ કરવા અને મુખ્ય ઉપાય કરવા માટે ઉત્તમ", charity: driverInfo.charity, fast: driverInfo.fast });
      if (cDay !== dDay) {
        weekly.push({ day: cDay, planet: `${p.conductor} — ${esc(conductorInfo.planet)}`, note: "ભાગ્યાંક વાર — મોટા નાણાકીય અને લાંબા ગાળાના નિર્ણયો માટે ઉત્તમ", charity: conductorInfo.charity, fast: conductorInfo.fast });
      }
      if (targetN !== p.driver && targetN !== p.conductor && target.day.indexOf(dDay) !== 0 && target.day.indexOf(cDay) !== 0) {
        weekly.push({ day: target.day, planet: `${targetN} — ${esc(target.planet)}`, note: `ખૂટતા અંક ${targetN} નો ઉપાય વાર — આ દિવસે વિશેષ દાન અને નિયમ પાળો`, charity: target.charity, fast: target.fast });
      }
    } else {
      weekly.push({ day: DAY_OF[p.driver], planet: `${p.driver} — ${esc(driverInfo.planet)}`, note: "Your Driver day — strongest for starting remedies and visible moves", charity: driverInfo.charity, fast: driverInfo.fast });
      if (DAY_OF[p.conductor] !== DAY_OF[p.driver]) {
        weekly.push({ day: DAY_OF[p.conductor], planet: `${p.conductor} — ${esc(conductorInfo.planet)}`, note: "Your Conductor day — strongest for destiny-level decisions and commitments", charity: conductorInfo.charity, fast: conductorInfo.fast });
      }
      if (targetN !== p.driver && targetN !== p.conductor && target.day.indexOf(DAY_OF[p.driver]) !== 0 && target.day.indexOf(DAY_OF[p.conductor]) !== 0) {
        weekly.push({ day: target.day, planet: `${targetN} — ${esc(target.planet)}`, note: `Remedy day for your missing number ${targetN} — give this one extra weight this cycle`, charity: target.charity, fast: target.fast });
      }
    }

    const phases = [];
    if (lang === "hi") {
      const p1 = [`ऊपर दी गई <strong>दैनिक मुख्य साधना</strong> शुरू करें — एक ही समय, एक ही स्थान, प्रतिदिन सुबह। <strong>${dDay}</strong> से शुरुआत करना सबसे शुभ है।`];
      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        p1.push(`<strong>४०-दिवसीय नाम लेखन साधना</strong>: रोज सुबह <strong>${esc(nameSug.variants[0].text)}</strong> २१ बार लिखें।`);
      }
      p1.push(`घर की ऊर्जा शुद्ध करें: ${badVastu.length ? `दोष वाले स्थान (${esc(badVastu.slice(0, 2).map((f) => f.item).join(", "))}) में` : "ईशान कोण में"} <strong>समुद्री नमक की कटोरी</strong> रखें और रोज <strong>ईशान में दीया</strong> जलाएं।`);
      phases.push({ badge: "दिन १–७", title: "आधार — साधना की शुरुआत", rows: p1 });

      const p2 = [
        `<strong>साप्ताहिक क्रम</strong> जोड़ें — ${weekly.map((w) => `<strong>${esc(w.day)}</strong>`).join(" और ")} को बताए अनुसार दान और व्रत करें।`,
        badVastu.length ? `पहला वास्तु सुधार: <strong>${esc(badVastu[0].item)}</strong> का उपाय करें — स्थान और मन में सामंजस्य जरूरी है।` : `वास्तु रखरखाव: घर के <strong>मध्य (ब्रह्मस्थान)</strong> को साफ और खाली रखें।`
      ];
      if (p.watchType && p.watchType !== "none") p2.push(`अपनी अनुकूल <strong>घड़ी</strong> (खंड ${SECTION.watch}) को ${dDay} की सुबह ६:३०–८:३० के बीच धारण करें।`);
      p2.push(`प्रतिदिन का अभ्यास नीचे दिए गए <strong>४०-दिवसीय ट्रैकर</strong> में दर्ज करें।`);
      phases.push({ badge: "दिन ८–२१", title: "गति — साप्ताहिक नियम", rows: p2 });

      const p3 = [];
      if (secondary) {
        p3.push(`दूसरी चाबी जोड़ें: <strong>${esc(secondary.planet)} (${secondaryN})</strong> का लघु मंत्र <span class="mantra">${esc(db.mantraShort[secondaryN].dev)}</span> ११ बार और ${esc(secondary.color.split(",")[0])} रंग का प्रयोग करें।`);
      } else {
        p3.push(`साधना को गहरा करें: ${esc(target.day)} को सूर्योदय मंत्र जाप बढ़ाकर <strong>१०८ बार</strong> करें।`);
      }
      if (mobSug.needed) p3.push(`इस दौरान कुल योग <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> वाला नया मोबाइल नंबर शॉर्टलिस्ट करें।`);
      if (badVastu[1]) p3.push(`दूसरा वास्तु सुधार: <strong>${esc(badVastu[1].item)}</strong> का उपाय करें।`);
      p3.push(`अनुभव नोट करें: मन की शांति, नींद, धन के नए अवसर — प्रगति चार्ट में लिखें।`);
      phases.push({ badge: "दिन २२–४०", title: "समन्वय — दोनों ऊर्जाओं का मिलन", rows: p3 });

      const p4 = [
        `<strong>४०वें दिन</strong> चक्र पूर्ण करें: ट्रैकर और प्रगति चार्ट में देखें कि क्या बदलाव आया और क्या रुकावट हटी?`,
        `मूलांक व भाग्यांक के नियम <strong>जीवनभर के साथी</strong> हैं; अनुपस्थित अंक के उपाय पूर्ण होने पर विश्राम दे सकते हैं।`,
        currentYearLucky ? `यह कैलेंडर वर्ष आपके <strong>शुभ वर्षों</strong> (खंड ${SECTION.timing}) में है — ४० दिन पूरे होते ही महत्वपूर्ण काम शुरू करें।` : `भविष्य की योजना: अनुकूल समय के अनुसार बड़े फैसले लें — ४० दिन की साधना नाव तैयार करती है, अनुकूल समय उसे आगे बढ़ाता है।`
      ];
      phases.push({ badge: "दिन ४०+", title: "अवलोकन एवं निरंतरता", rows: p4 });

    } else if (lang === "gu") {
      const p1 = [`ઉપર દર્શાવેલી <strong>દૈનિક મુખ્ય સાધના</strong> શરૂ કરો — એક જ સમય, એક જ સ્થળ, દરરોજ સવારે. <strong>${dDay}</strong> થી શરૂઆત કરવી સૌથી શ્રેષ્ઠ છે.`];
      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        p1.push(`<strong>૪૦ દિવસની નામ લેખન સાધના</strong>: દરરોજ સવારે <strong>${esc(nameSug.variants[0].text)}</strong> ૨૧ વખત લખો.`);
      }
      p1.push(`ઘરની ઊર્જા શુદ્ધ કરો: ${badVastu.length ? `દોષ વાળી જગ્યાએ (${esc(badVastu.slice(0, 2).map((f) => f.item).join(", "))})` : "ઇશાન ખૂણામાં"} <strong>દરિયાઈ મીઠાની વાટકી</strong> રાખો અને રોજ <strong>ઇશાનમાં દીવો</strong> પ્રગટાવો.`);
      phases.push({ badge: "દિવસ ૧–૭", title: "પાયો — સાધનાની શરૂઆત", rows: p1 });

      const p2 = [
        `<strong>સાપ્તાહિક ક્રમ</strong> જોડો — ${weekly.map((w) => `<strong>${esc(w.day)}</strong>`).join(" અને ")} ના દિવસે જણાવ્યા મુજબ દાન અને ઉપવાસ કરો.`,
        badVastu.length ? `પ્રથમ વાસ્તુ સુધારો: <strong>${esc(badVastu[0].item)}</strong> નો ઉપાય કરો — વાસ્તુ અને મનનું સુમેળ જરૂરી છે.` : `વાસ્તુ જાળવણી: ઘરના <strong>મધ્ય (બ્રહ્મસ્થાન)</strong> ને સ્વચ્છ અને ખાલી રાખો.`
      ];
      if (p.watchType && p.watchType !== "none") p2.push(`તમારી અનુકૂળ <strong>ઘડિયાળ</strong> (વિભાગ ${SECTION.watch}) ${dDay} ની સવારે ૬:૩૦–૮:૩૦ વચ્ચે ધારણ કરો.`);
      p2.push(`દરરોજનો અભ્યાસ નીચે આપેલા <strong>૪૦ દિવસના ટ્રેકર</strong> માં નોંધો.`);
      phases.push({ badge: "દિવસ ૮–૨૧", title: "ગતિ — સાપ્તાહિક નિયમો", rows: p2 });

      const p3 = [];
      if (secondary) {
        p3.push(`બીજી ચાવી જોડો: <strong>${esc(secondary.planet)} (${secondaryN})</strong> નો લઘુ મંત્ર <span class="mantra">${esc(db.mantraShort[secondaryN].dev)}</span> ૧૧ વખત અને ${esc(secondary.color.split(",")[0])} રંગ વાપરો.`);
      } else {
        p3.push(`સાધના ઊંડી કરો: ${esc(target.day)} ના દિવસે સૂર્યોદય મંત્ર જાપ વધારીને <strong>૧૦૮ વખત</strong> કરો.`);
      }
      if (mobSug.needed) p3.push(`આ સમયગાળામાં કુલ સરવાળો <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> વાળો નવો મોબાઈલ નંબર પસંદ કરો.`);
      if (badVastu[1]) p3.push(`બીજો વાસ્તુ સુધારો: <strong>${esc(badVastu[1].item)}</strong> નો ઉપાય કરો.`);
      p3.push(`અનુભવ નોંધો: મનની શાંતિ, ઊંઘ, ધનની નવી તકો — પ્રગતિ ચાર્ટમાં લખો.`);
      phases.push({ badge: "દિવસ ૨૨–૪૦", title: "સમન્વય — બંને ઊર્જાઓનું જોડાણ", rows: p3 });

      const p4 = [
        `<strong>૪૦મા દિવસે</strong> ચક્ર પૂર્ણ કરો: ટ્રેકર અને પ્રગતિ ચાર્ટમાં જુઓ કે શું બદલાવ આવ્યો અને શું અડચણ દૂર થઈ?`,
        `મૂળાંક અને ભાગ્યાંકના નિયમો <strong>આજીવન સાથી</strong> છે; ખૂટતા અંકના ઉપાયો પૂર્ણ થતાં વિશ્રામ આપી શકો છો.`,
        currentYearLucky ? `આ કેલેન્ડર વર્ષ તમારા <strong>શ્રેષ્ઠ વર્ષો</strong> (વિભાગ ${SECTION.timing}) માં છે — ૪૦ દિવસ પૂરા થતાં જ મહત્વના કાર્યો શરૂ કરો.` : `ભવિષ્યનું આયોજન: અનુકૂળ સમય મુજબ મોટા નિર્ણયો લો — ૪૦ દિવસની સાધના હોડી તૈયાર કરે છે, અનુકૂળ સમય તેને આગળ વધારે છે.`
      ];
      phases.push({ badge: "દિવસ ૪૦+", title: "સમીક્ષા અને સાતત્ય", rows: p4 });

    } else {
      const phase1Rows = [
        `Begin the <strong>daily core ritual</strong> above — same time, same place, every morning. Starting on a <strong>${DAY_OF[p.driver]}</strong> gives the strongest charge.`
      ];
      if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
        phase1Rows.push(`Start the <strong>40-day spelling trial</strong>: write <strong>${esc(nameSug.variants[0].text)}</strong> 21 times each morning and update non-legal profiles first (protocol in Section ${SECTION.name}).`);
      }
      phase1Rows.push(`Set your space: place a <strong>bowl of sea salt</strong> in ${badVastu.length ? `your dosh zone${badVastu.length > 1 ? "s" : ""} (${esc(badVastu.slice(0, 2).map((f) => f.item).join(", "))})` : "the northeast of your home"} and light a daily <strong>northeast diya</strong>.`);
      phases.push({ badge: "Days 1–7", title: "Foundation — anchor the ritual", rows: phase1Rows });

      const dayList = weekly.map((w) => `<strong>${esc(w.day)}</strong>`);
      const dayListText = dayList.length > 2 ? `${dayList.slice(0, -1).join(", ")} and ${dayList[dayList.length - 1]}` : dayList.join(" and ");
      const phase2Rows = [
        `Add the <strong>weekly rhythm</strong> — ${dayListText} charity and fasting exactly as listed above.`,
        badVastu.length
          ? `First Vastu fix: correct the <strong>${esc(badVastu[0].item)}</strong> (${esc(badVastu[0].label.toLowerCase())}) using the remedy in Section ${SECTION.vastu} — space and mind must agree.`
          : `Vastu upkeep: keep the <strong>Brahmasthan (centre)</strong> empty and clean so energy can circulate.`
      ];
      if (p.watchType && p.watchType !== "none") phase2Rows.push(`Activate your aligned <strong>watch</strong> (Section ${SECTION.watch}) on a ${DAY_OF[p.driver]} morning, 6:30–8:30 AM, if you have not yet.`);
      phase2Rows.push(`Log each day's practice with one tap in <strong>Your Evolving Chart</strong> (Section ${SECTION.memory}) — the chart learns your consistency.`);
      phases.push({ badge: "Days 8–21", title: "Build the rhythm", rows: phase2Rows });

      const phase3Rows = [];
      if (secondary) {
        phase3Rows.push(`Add the second key: fold in <strong>${esc(secondary.planet)} (${secondaryN})</strong> — its short mantra <span class="mantra">${esc(db.mantraShort[secondaryN].dev)}</span> ×11 and ${esc(secondary.color.split(",")[0].toLowerCase())} on ${esc(secondary.day.split(" ")[0])}. Two planets, one ritual.`);
      } else {
        phase3Rows.push(`Deepen the practice: raise the sunrise mantra to <strong>108 times</strong> on ${esc(target.day.split(" ")[0])}s — quantity matures into quality in the third week.`);
      }
      if (mobSug.needed) phase3Rows.push(`This is the window to shortlist a <strong>new mobile number</strong> totalling <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> — ${firstGoalName ? `supporting your ${esc(firstGoalName.toLowerCase())} focus and` : ""} harmony with Driver ${p.driver} and Conductor ${p.conductor}.`);
      if (badVastu[1]) phase3Rows.push(`Second Vastu fix: correct the <strong>${esc(badVastu[1].item)}</strong> — the other zone flagged in your scan.`);
      phase3Rows.push(`Notice and note: sleep, mood, money conversations${firstGoalName ? `, ${esc(firstGoalName.toLowerCase())} openings` : ""} — one line a day in the Evolving Chart journal.`);
      phases.push({ badge: "Days 22–40", title: "Integrate — two keys, one flow", rows: phase3Rows });

      const phase4Rows = [
        `On <strong>Day 40</strong>, close the loop: compare your tracker, practice log and snapshots in <strong>Your Evolving Chart</strong> — what shifted, what resisted?`,
        `Decide the keepers: Driver &amp; Conductor practices are <strong>lifelong companions</strong>; missing-number remedies can rest once the leak is sealed — re-run this report any month to refresh the reading.`,
        currentYearLucky
          ? `This calendar year sits in your <strong>Best Years window</strong> (Section ${SECTION.timing}) — schedule the launch, application or purchase you have been holding for right after Day 40.`
          : `Look ahead: time your next big move for the favourable years in Section ${SECTION.timing} — the 40-day cycle builds the vessel, timing sails it.`
      ];
      phases.push({ badge: "Day 40+", title: "Review &amp; reset", rows: phase4Rows });
    }

    return { targetN, target: { ...target, short: targetShort }, missingFocus, daily, weekly, phases };
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
      missing: profile.missing,
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
      missingCounts: profile.missing.length,
      repeatedCounts: profile.repeated.length,
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

    const focusNumbers = Array.from(new Set([profile.driver, profile.conductor, ...profile.missing])).slice(0, 4);
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
    const ruler = z.ruler;
    const db = getActiveDB();
    const num = db.numbers[ruler];
    const planetName = num.planet;
    const crystal = z.crystals && z.crystals[0] ? z.crystals[0] : "sign crystal";
    const missingIt = p.missing.includes(ruler);
    const repeatedIt = p.repeated.includes(ruler);
    const isDriver = p.driver === ruler;
    const isConductor = p.conductor === ruler;
    const lang = getLang();

    if (lang === "hi") {
      if (missingIt && !isDriver && !isConductor) {
        return `<div class="harmony-note judge-note">
          <strong>राशि व अंक सामंजस्य — महत्वपूर्ण संयोग:</strong> आपकी वैदिक सूर्य राशि ${esc(p.zodiac)} के स्वामी <strong>${esc(planetName)} (अंक ${ruler})</strong> हैं — और अंक ${ruler} आपके <strong>लो-शू ग्रिड में अनुपस्थित है</strong>। दो स्वतंत्र प्रणालियां एक ही कमी की ओर संकेत कर रही हैं। नीचे दिए गए राशि किट का प्रयोग करें: <strong>${esc(crystal)}</strong> धारण करें और <strong><span class="mantra">${esc(z.dev)}</span></strong> (${esc(z.pron)}) का जाप करें ताकि अंक ${ruler} की ऊर्जा को बल मिले।
        </div>`;
      }
      if (isDriver || isConductor || repeatedIt) {
        return `<div class="harmony-note judge-note">
          <strong>राशि व अंक सामंजस्य — शक्तिवर्धक प्रभाव:</strong> आपकी सूर्य राशि के स्वामी <strong>${esc(planetName)} (अंक ${ruler})</strong> हैं — जो ${isDriver ? "आपके <strong>मूलांक (Driver)</strong>" : isConductor ? "आपके <strong>भाग्यांक (Conductor)</strong>" : "आपके <strong>ग्रिड में दोहराया गया अंक</strong>"} हैं। राशि और ग्रिड मिलकर एक ही दिशा में शक्ति प्रदान करते हैं।
        </div>`;
      }
      return `<div class="harmony-note judge-note">
        <strong>राशि व अंक सामंजस्य परीक्षण:</strong> आपकी वैदिक सूर्य राशि के स्वामी <strong>${esc(planetName)} (अंक ${ruler})</strong> आपके लो-शू ग्रिड में मौजूद हैं, इसलिए राशि और ग्रिड सहज रूप से तालमेल बिठाते हैं।
      </div>`;
    }

    if (lang === "gu") {
      if (missingIt && !isDriver && !isConductor) {
        return `<div class="harmony-note judge-note">
          <strong>રાશિ અને અંક સુમેળ — મહત્વપૂર્ણ સંયોગ:</strong> તમારી વૈદિક સૂર્ય રાશિ ${esc(p.zodiac)} ના સ્વામી <strong>${esc(planetName)} (અંક ${ruler})</strong> છે — અને અંક ${ruler} તમારા <strong>લો-શુ ગ્રીડમાં ખૂટે છે</strong>. બે સ્વતંત્ર પદ્ધતિઓ એક જ ઉણપ દર્શાવે છે. નીચે આપેલા રાશિ કિટનો ઉપયોગ કરો: <strong>${esc(crystal)}</strong> ધારણ કરો અને <strong><span class="mantra">${esc(z.dev)}</span></strong> (${esc(z.pron)}) નો જાપ કરો જેથી અંક ${ruler} ની ઊર્જા મજબૂત બને.
        </div>`;
      }
      if (isDriver || isConductor || repeatedIt) {
        return `<div class="harmony-note judge-note">
          <strong>રાશિ અને અંક સુમેળ — શક્તિવર્ધક પ્રભાવ:</strong> તમારી સૂર્ય રાશિના સ્વામી <strong>${esc(planetName)} (અંક ${ruler})</strong> છે — જે ${isDriver ? "તમારા <strong>મૂળાંક (Driver)</strong>" : isConductor ? "તમારા <strong>ભાગ્યાંક (Conductor)</strong>" : "તમારા <strong>ગ્રીડમાં પુનરાવર્તિત અંક</strong>"} છે. રાશિ અને ગ્રીડ મળીને એક જ દિશામાં બળ આપે છે.
        </div>`;
      }
      return `<div class="harmony-note judge-note">
        <strong>રાશિ અને અંક સુમેળ પરીક્ષણ:</strong> તમારી વૈદિક સૂર્ય રાશિના સ્વામી <strong>${esc(planetName)} (અંક ${ruler})</strong> તમારા લો-શુ ગ્રીડમાં હાજર છે, તેથી રાશિ અને ગ્રીડ સહજ રીતે મેળ ખાય છે.
      </div>`;
    }

    if (missingIt && !isDriver && !isConductor) {
      return `<div class="harmony-note">
        <strong>Cross-system harmony — an important overlap:</strong> your Vedic Sun sign ${esc(p.zodiac)} is ruled by <strong>${esc(planetName)} (number ${ruler})</strong> — and number ${ruler} is <strong>missing from your Lo Shu grid</strong>. Two independent systems are pointing at the same gap, which makes this the highest-leverage remedy of your chart. The sign kit below doubles as a targeted balancer: wear <strong>${esc(crystal)}</strong> and chant <strong><span class="mantra">${esc(z.dev)}</span></strong> (${esc(z.pron)}) to consciously strengthen number-${ruler} energy — it is reinforced nowhere else in your grid.
      </div>`;
    }
    if (isDriver || isConductor || repeatedIt) {
      return `<div class="harmony-note">
        <strong>Cross-system harmony — a reinforcing overlap:</strong> the planet ruling your Vedic Sun sign — <strong>${esc(planetName)} (number ${ruler})</strong> — is ${isDriver ? "your <strong>Driver (Moolank)</strong>" : isConductor ? "your <strong>Conductor (Bhagyank)</strong>" : "a <strong>repeated number in your Lo Shu grid</strong>"}. The zodiac layer and your grid reinforce each other, so sign-based remedies will amplify a number that already works hard in your chart.
      </div>`;
    }
    return `<div class="harmony-note">
      <strong>Cross-system harmony check:</strong> your Vedic Sun sign's ruler — <strong>${esc(planetName)} (number ${ruler})</strong> — is present in your Lo Shu grid, so the zodiac and grid layers align comfortably. Treat the sign kit below as a supportive layer rather than a corrective one.
    </div>`;
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
    const rows = p.repeated.map((n) => {
      const ee = (db.excessEnergy && db.excessEnergy[n]) || {};
      const overshoot = (ee.overshoot && ee.overshoot[lang]) || (ee.overshoot && ee.overshoot.en) || "";
      const channel = (ee.channel && ee.channel[lang]) || (ee.channel && ee.channel.en) || "";
      const count = p.counts[n] || 0;
      return `<div class="kit-row">
        <div class="kit-ico"><strong>${n}</strong></div>
        <div class="kit-body">
          <div class="kit-label">${esc(db.numbers[n].planet)} — ${lang === "hi" ? `दोहराया गया ${count}×` : lang === "gu" ? `પુનરાવર્તિત ${count}×` : `repeated ${count}×`}</div>
          <div class="kit-value"><strong>${lang === "hi" ? "जब यह बढ़ जाता है:" : lang === "gu" ? "જ્યારે તે વધુ પડતું થાય:" : "When it overshoots:"}</strong> ${esc(overshoot)}</div>
          <div class="kit-value"><strong>${lang === "hi" ? "इसे सही दिशा दें:" : lang === "gu" ? "તેને યોગ્ય દિશા આપો:" : "Channel it:"}</strong> ${esc(channel)}</div>
        </div>
      </div>`;
    }).join("");
    const guidance = lang === "hi"
      ? "एक दोहराया गया अंक प्रतिभा का प्रवर्धक है — इसे दिशा दें, अधिक ईंधन नहीं। जब तक अनुपस्थित अंक भरे नहीं जाते, ऐसे नाम, मोबाइल या वाहन कुल से बचें जो इसी अंक को और बढ़ाएं; अतिरिक्त ऊर्जा को ऊपर दी गई दिशा में लगाएं।"
      : lang === "gu"
        ? "એક પુનરાવર્તિત અંક પ્રતિભાનો પ્રવર્ધક છે — તેને દિશા આપો, વધુ બળતણ નહીં. જ્યાં સુધી ખૂટતા અંક ભરાય નહીં, એવા નામ, મોબાઈલ કે વાહન કુલ ટાળો જે આ જ અંકને વધુ મજબૂત કરે; વધારાની ઊર્જાને ઉપર આપેલી દિશામાં લગાવો."
        : "A repeated number is a talent amplifier — give it direction, not more fuel. Until the missing numbers are filled, avoid name, mobile or vehicle totals that add to this same number; channel the surplus through the actions above instead.";
    return `<div class="card">
      <div class="card-title">${lang === "hi" ? "अधिक ऊर्जा — सही दिशा में लगाएं" : lang === "gu" ? "વધુ ઊર્જા — યોગ્ય દિશામાં લગાવો" : "Excess Energy — Channel It, Don't Fight It"}</div>
      <div class="kit">${rows}</div>
      <div class="card-sub">${guidance}</div>
    </div>`;
  }

  function renderGridCells(counts) {
    const db = getActiveDB();
    const layout = (window.DB && window.DB.loshuLayout) || [[4,9,2],[3,5,7],[8,1,6]];
    return layout.flat().map((n) => {
      const c = counts[n] || 0;
      const cls = c === 0 ? "missing" : c >= 3 ? "present multi" : "present";
      const digits = c > 0 ? Array(c).fill(n).map((x) => `<span>${x}</span>`).join("") : `<span>${n}</span>`;
      return `<div class="loshu-cell ${cls}" title="${n} — ${esc(db.numbers[n].planet)}: ${c} occurrence(s)">
        <div class="digits">${digits}</div>
        ${c > 0 ? `<div class="cnt">${db.numbers[n].planet.split(" ")[0]}</div>` : ""}
      </div>`;
    }).join("");
  }

  function renderLoshu(p) {
    const db = getActiveDB();
    const lang = getLang();
    const cells = renderGridCells(p.counts);

    const planeCards = db.planes.map((pl) => {
      const present = pl.cells.filter((n) => p.counts[n] > 0);
      const absent = pl.cells.filter((n) => p.counts[n] === 0);
      const chips = pl.cells.map((n) => `<span class="plane-chip ${p.counts[n] > 0 ? "on" : "off"}">${n}</span>`).join("");
      const badge = present.length === 3 ? `<span class="badge good">${t("active", "Active")}</span>`
        : present.length === 2 ? `<span class="badge warn">${t("partial", "Partial")}</span>`
        : `<span class="badge bad">${t("weak", "Weak")}</span>`;
      let title, reading;
      if (present.length === 3) {
        title = lang === "hi" ? `पूर्ण ${pl.name}` : lang === "gu" ? `સંપૂર્ણ ${pl.name}` : `Complete ${pl.name}`;
        reading = lang === "hi" ? `आपके पास पूर्ण ${pl.name} है — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} एक साथ काम करते हैं। ${pl.complete}`
          : lang === "gu" ? `તમારી પાસે સંપૂર્ણ ${pl.name} છે — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} સાથે મળીને કામ કરે છે. ${pl.complete}`
          : `You have the full ${pl.name.toLowerCase()} — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} work together. ${pl.complete}`;
      } else if (present.length === 0) {
        title = lang === "hi" ? `${pl.name} — पूर्णतः अनुपस्थित` : lang === "gu" ? `${pl.name} — સંપૂર્ણ ગેરહાજર` : `${pl.name} — Fully Missing`;
        reading = lang === "hi" ? `इस तल की तीनों ऊर्जाओं — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} — को साधना से मजबूत करें। ${absent.map((n) => pl.roles[n].fix).join("; ")}.`
          : lang === "gu" ? `આ સ્તરની ત્રણેય ઊર્જાઓ — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} — ને સાધનાથી મજબૂત કરો. ${absent.map((n) => pl.roles[n].fix).join("; ")}.`
          : `All three energies of this plane — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} — need deliberate support. ${absent.map((n) => pl.roles[n].fix[0].toUpperCase() + pl.roles[n].fix.slice(1)).join("; ")}.`;
      } else {
        const presTxt = present.map((n) => pl.roles[n].label).join(" and ");
        const absTxt = absent.map((n) => pl.roles[n].label).join(" and ");
        title = present.length === 1
          ? (lang === "hi" ? `${pl.name} — केवल ${pl.roles[present[0]].short}` : lang === "gu" ? `${pl.name} — માત્ર ${pl.roles[present[0]].short}` : `${pl.name} — Only ${pl.roles[present[0]].short}`)
          : (lang === "hi" ? `${pl.name} — बिना ${absent.map((n) => pl.roles[n].short).join(" व ")}` : lang === "gu" ? `${pl.name} — વગર ${absent.map((n) => pl.roles[n].short).join(" અને ")}` : `${pl.name} — Without ${absent.map((n) => pl.roles[n].short).join(" & ")}`);
        const cons = absent.map((n) => pl.roles[n].con).join("; ");
        const fixes = absent.map((n) => pl.roles[n].fix).join("; ");
        reading = lang === "hi" ? `आपके ${pl.name} में ${presTxt} मौजूद है, किंतु ${absTxt} निर्बल है। यह ${cons} के रूप में दिख सकता है। उपाय: ${fixes}.`
          : lang === "gu" ? `તમારા ${pl.name} માં ${presTxt} હાજર છે, પરંતુ ${absTxt} નબળું છે. આ ${cons} ના રૂપમાં દેખાઈ શકે છે. ઉપાય: ${fixes}.`
          : `You have ${presTxt} in your ${pl.name.toLowerCase()}, but ${absTxt} ${absent.length > 1 ? "are" : "is"} weaker here. This can show up as ${cons}. Your remedy: ${fixes}.`;
      }
      return `<div class="card plane-card">
        <div class="goal-head">
          <div class="card-title">${esc(title)}</div>
          ${badge}
        </div>
        <div class="card-sub">${esc(pl.zone)}</div>
        <div class="plane-chips">${chips}</div>
        <div class="kit-value plane-about">${esc(pl.about)}</div>
        <div class="kit-value">${esc(reading)}</div>
      </div>`;
    }).join("");

    const sevOf = {};
    (p.missingSeverity || []).forEach((s) => { sevOf[s.n] = s; });
    const missingFixes = p.missing.map((n) => {
      const sev = sevOf[n];
      const badge = sev
        ? (sev.critical ? `<span class="badge bad">${t("critical", "Critical")}</span>` : `<span class="badge warn">Echoed by ${sev.echoedBy.join(", ")}</span>`)
        : "";
      return `
      <div class="kit-row">
        <div class="kit-ico"><strong>${n}</strong></div>
        <div class="kit-body">
          <div class="kit-label">${esc(db.numbers[n].planet)} — ${lang === "hi" ? "निर्बल / अनुपस्थित" : lang === "gu" ? "નિર્બળ / ખૂટતો અંક" : "weak / missing"} ${badge}</div>
          <div class="kit-value">${esc(db.missingFix[n])}</div>
        </div>
      </div>`;
    }).join("");

    const arrowCards = db.arrows.map((ar) => {
      const present = ar.line.filter((n) => p.counts[n] > 0).length;
      const state = present === 3 ? "strong" : present === 0 ? "missing" : "partial";
      const badge = state === "strong" ? `<span class="badge good">${t("strong", "Strong")}</span>`
        : state === "partial" ? `<span class="badge warn">${t("partial", "Partial")}</span>`
        : `<span class="badge bad">${t("frustrated", "Frustrated")}</span>`;
      const chips = ar.line.map((n) => `<span class="plane-chip ${p.counts[n] > 0 ? "on" : "off"}">${n}</span>`).join("");
      const reading = state === "strong" ? ar.present : (state === "partial" ? (lang === "hi" ? `आंशिक रूप से उपस्थित — पूरी रेखा नहीं बनी है। ${ar.missing}` : lang === "gu" ? `આંશિક રીતે હાજર — પૂરી રેખા બની નથી. ${ar.missing}` : `Only partially present — the full line is not formed. ${ar.missing}`) : ar.missing);
      return `<div class="card arrow-card">
        <div class="goal-head">
          <div class="card-title">${esc(ar.name)}</div>
          ${badge}
        </div>
        <div class="card-sub">${esc(ar.axis)}</div>
        <div class="plane-chips">${chips}</div>
        <div class="kit-value">${esc(reading)}</div>
      </div>`;
    }).join("");

    const loshuExplanation = lang === "hi"
      ? "३×३ का एक ऊर्जा ग्रिड जो आपकी जन्मतिथि में मौजूद, निर्बल या अनुपस्थित ऊर्जाओं का नक्शा बनाता है। १ से ९ तक का प्रत्येक अंक एक निश्चित स्थान पर बैठता है। प्रत्येक पंक्ति, कॉलम और विकर्ण एक 'तल' (Plane) बन जाता है — जो आपकी सोच, भावनाओं, इच्छाशक्ति और भौतिक जीवन के बारे में सटीक जानकारी देता है।"
      : lang === "gu"
        ? "૩×૩ નો એક પ્રાચીન ઊર્જા ગ્રીડ જે તમારી જન્મ તારીખમાં હાજર, નિર્બળ કે ખૂટતી ઊર્જાઓનો નકશો બનાવે છે. ૧ થી ૯ સુધીનો દરેક અંક એક નિશ્ચિત ખાનામાં બેસે છે. દરેક હરોળ, સ્તંભ અને કર્ણ એક 'સ્તર' (Plane) બની જાય છે — જે તમારી વિચારસરણી, લાગણીઓ, મનોબળ અને વ્યવહારિક જીવન વિશે સચોટ માહિતી આપે છે."
        : "A 3×3 grid that maps which energies are present, weak, or missing in your birth. Every number from 1 to 9 sits in a fixed cell. When we plot the digits of your date of birth (along with your Mulank and Bhagyank) onto that grid, each row, column, and diagonal becomes a <strong>plane</strong> — an energy line that tells us something specific about your mind, emotions, will, and material life. Below, each of the 8 planes is interpreted based on exactly which of its required numbers you have.";

    return `
    <section class="rsection" id="loshu-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.loshu}</span>${t("secLoshu", "Your Loshu Grid — the 8 Planes, Fully Analysed")}</h2>
      <div class="card">
        <div class="card-title">${lang === "hi" ? "लो-शू ग्रिड क्या है?" : lang === "gu" ? "લો-શુ ગ્રીડ શું છે?" : "What is the Loshu Grid?"}</div>
        <div class="kit-value">${loshuExplanation}</div>
      </div>
      <div class="loshu-wrap">
        <div>
          <div class="loshu-grid" role="img" aria-label="Loshu grid visualization">${cells}</div>
          <div class="loshu-legend" style="margin-top:8px">
            <span><i class="dot g"></i>${t("present", "Present")}</span>
            <span><i class="dot y"></i>${lang === "hi" ? "दोहराया गया (अधिक)" : lang === "gu" ? "પુનરાવર્તિત (વધારાનું)" : "Repeated (excess)"}</span>
            <span><i class="dot w"></i>${lang === "hi" ? "अनुपस्थित (निर्बल)" : lang === "gu" ? "ગેરહાજર (નિર્બળ)" : "Missing (weak)"}</span>
          </div>
        </div>
        <div class="card">
          <div class="card-title">${lang === "hi" ? "आपके अंक एक नजर में" : lang === "gu" ? "તમારા અંકો એક નજરે" : "Your Numbers at a Glance"}</div>
          <div class="kit-value"><span class="badge good">${t("present", "Present")}</span> ${Object.keys(p.counts).filter((k) => p.counts[k] > 0).join(", ")}</div>
          ${p.weak.length ? `<div class="kit-value"><span class="badge warn">${t("weak", "Weak")}</span> ${p.weak.join(", ")} <span class="card-sub">— ${lang === "hi" ? "केवल एक बार आया है, हल्के सहारे की जरूरत है।" : lang === "gu" ? "માત્ર એક વખત આવ્યો છે, હળવા ટેકાની જરૂર છે." : "appears only once, so it needs light support."}</span></div>` : ""}
          <div class="kit-value"><span class="badge bad">${t("missing", "Missing")}</span> ${p.missing.length ? p.missing.join(", ") : (lang === "hi" ? "कोई नहीं — पूर्ण ग्रिड" : lang === "gu" ? "કોઈ નહીં — સંપૂર્ણ ગ્રીડ" : "none — complete grid")}</div>
          <div class="card-sub">${lang === "hi" ? "हरे रंग के खाने आपके चार्ट में मौजूद हैं। खाली खाने वे ऊर्जाएं हैं जिन्हें मजबूत करने की आवश्यकता है।" : lang === "gu" ? "લીલા રંગના ખાના તમારા ચાર્ટમાં હાજર છે. ખાલી ખાના તે ઊર્જાઓ છે જેને બળવાન બનાવવાની જરૂર છે." : "Green cells are present in your chart. Empty cells are missing energies — they mark the planets that need strengthening."}</div>
        </div>
      </div>
      <div class="plane-cards">${planeCards}</div>
      <div class="card">
        <div class="card-title">${lang === "hi" ? "आपके लो-शू ग्रिड के ८ तीर" : lang === "gu" ? "તમારા લો-શુ ગ્રીડના ૮ તીર" : "The 8 Arrows of Your Loshu Grid"}</div>
        <div class="card-sub">${lang === "hi" ? "प्रत्येक रेखा का शास्त्रीय तीर नाम। तीनों अंक मौजूद होने पर तीर मजबूत होता है; पूरी तरह खाली होने पर इसे साधना से मजबूत करना होता है।" : lang === "gu" ? "દરેક રેખાનું શાસ્ત્રીય તીર નામ. ત્રણેય અંક હાજર હોય તો તીર મજબૂત બને છે; ખાલી હોય તો તેને સાધનાથી મજબૂત કરવું પડે છે." : 'The classical "arrow" names for each line. An arrow with all three numbers is strong; a fully empty arrow is a frustrated / confused energy to consciously build.'}</div>
      </div>
      <div class="plane-cards">${arrowCards}</div>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">${lang === "hi" ? "नाम ग्रिड (Name Grid)" : lang === "gu" ? "નામ ગ્રીડ (Name Grid)" : "Name Grid"}</div>
          <div class="loshu-grid" role="img" aria-label="Name-based Loshu grid">${renderGridCells(p.nameCounts)}</div>
          <div class="card-sub">${lang === "hi" ? "आपके नाम के अक्षरों के चालडियन मान। ध्यान दें: चालडियन पद्धति में ९ का अंक नहीं होता, इसलिए वह खाना खाली रहता है।" : lang === "gu" ? "તમારા નામના અક્ષરોના ચાલ્ડિયન મૂલ્યો. નોંધ: ચાલ્ડિયન પદ્ધતિમાં ૯ નો અંક નથી હોતો, તેથી તે ખાનું ખાલી રહે છે." : "The Chaldean values of your name's letters, plotted the same way. Note: the Chaldean system has no value 9, so that cell stays empty in the name grid."}</div>
        </div>
        <div class="card">
          <div class="card-title">${lang === "hi" ? "संयुक्त ग्रिड (जन्म + नाम)" : lang === "gu" ? "સંયુક્ત ગ્રીડ (જન્મ + નામ)" : "Combined Grid (DOB + Name)"}</div>
          <div class="loshu-grid" role="img" aria-label="Combined Loshu grid">${renderGridCells(p.combinedCounts)}</div>
          <div class="card-sub">${lang === "hi" ? "जन्मतिथि और नाम के अंकों का कुल योग — वह संयुक्त ऊर्जा जो आप दुनिया के सामने पेश करते हैं।" : lang === "gu" ? "જન્મ તારીખ અને નામના અંકોનો કુલ સરવાળો — તે સંયુક્ત ઊર્જા જે તમે દુનિયા સમક્ષ પ્રસ્તુત કરો છો." : "Birth digits and name values together — the blended energy you project into the world."}</div>
        </div>
      </div>
      ${p.missing.length ? `<div class="card"><div class="card-title">${lang === "hi" ? "अनुपस्थित अंक — त्वरित संतुलन उपाय" : lang === "gu" ? "ખૂટતા અંકો — સરળ સંતુલન ઉપાયો" : "Missing Numbers — Quick Balancers"}</div><div class="kit">${missingFixes}</div></div>` : `<div class="card"><div class="kit-value"><span class="badge good">${lang === "hi" ? "पूर्ण ग्रिड" : lang === "gu" ? "સંપૂર્ણ ગ્રીડ" : "Complete grid"}</span> ${lang === "hi" ? "सभी नौ अंक मौजूद हैं — यह एक दुर्लभ और संतुलित चार्ट है। साप्ताहिक दिनचर्या से ग्रहों की ऊर्जा बनाए रखें।" : lang === "gu" ? "બધા જ નવ અંકો હાજર છે — આ એક દુર્લભ અને સંતુલિત ચાર્ટ છે. સાપ્તાહિક નિયમોથી ગ્રહોની ઊર્જા જાળવી રાખો." : "All nine numbers are present — a rare, well-balanced chart. Maintain your planets with the weekly rhythm in your Priority Plan."}</div></div>`}
      ${p.repeated.length ? `<div class="rsection-desc">${lang === "hi" ? `३+ बार दोहराए गए अंक: <strong>${p.repeated.join(", ")}</strong>` : lang === "gu" ? `૩+ વખત પુનરાવર્તિત અંકો: <strong>${p.repeated.join(", ")}</strong>` : `Repeated 3+ times: <strong>${p.repeated.join(", ")}</strong>`}</div>${renderExcessEnergyCard(p)}` : ""}
    </section>`;
  }

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
        <div class="kit-row"><div class="kit-ico">🎨</div><div class="kit-body"><div class="kit-label">${t("colorDayMetal", "Colour / Day / Metal")}</div><div class="kit-value">${esc(i.color)} · ${esc(i.day)} · ${esc(i.metal)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🎁</div><div class="kit-body"><div class="kit-label">${t("charity", "Charity")}</div><div class="kit-value">${esc(i.charity)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🌿</div><div class="kit-body"><div class="kit-label">${t("lifestyle", "Lifestyle")}</div><div class="kit-value">${esc(i.lifestyle)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🍽</div><div class="kit-body"><div class="kit-label">${t("fast", "Fast")}</div><div class="kit-value">${esc(i.fast)}</div></div></div>
      </div>
    </div>`;
  }

  function crystalGuide(p) {
    const db = getActiveDB();
    const zz = db.zodiac[p.zodiac] || (window.DB && window.DB.zodiac && window.DB.zodiac[p.zodiac]) || {};
    const sources = [
      ...(zz.crystals || []),
      db.numbers[p.driver].crystal,
      db.numbers[p.conductor].crystal,
      ...p.missing.map((n) => db.numbers[n].crystal)
    ];
    const keys = Object.keys(db.crystals || {}).filter((k) => k !== "Selenite" && k !== "5 Mukhi Rudraksha");
    const seen = new Set();
    const picks = [];
    for (const src of sources) {
      const s = String(src || "").toLowerCase();
      for (const k of keys) {
        if (!seen.has(k) && s.includes(k.toLowerCase())) { seen.add(k); picks.push(k); }
      }
    }

    const rudrakshaPool = [
      db.numbers[p.driver].rudraksha,
      db.numbers[p.conductor].rudraksha,
      ...p.missing.map((n) => db.numbers[n].rudraksha)
    ].join(" ").toLowerCase();
    const rudrakshaNote = rudrakshaPool.includes("5 mukhi") ? db.crystals["5 Mukhi Rudraksha"] : null;

    return { picks: picks.slice(0, 5), rudrakshaNote };
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
    const priorities = priorityPlan(p, nameSug, mobSug, vastu);
    const watch = watchSpec(p);
    const evolving = evolvingChartData(p, timing);
    const summary = northstarSummary(p, timing, goals, vastu, nameSug, mobSug);
    const activation = activationPlan(p, timing, goals, vastu, nameSug, mobSug);
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

    const weakNums = p.missing.filter((n) => n !== p.driver && n !== p.conductor);
    const weakSection = p.missing.length
      ? `<section class="rsection" id="remedy-section">
          <h2 class="rsection-title"><span class="idx">${SECTION.weak}</span>${t("secWeak", "Weak Planet Remedy Kits")}</h2>
          <p class="rsection-desc">${lang === "hi" ? "लो-शू ग्रिड में अनुपस्थित ग्रहों के पूर्ण उपाय किट (मूलांक व भाग्यांक के ग्रह पहले से सहयोगी हैं)।" : lang === "gu" ? "લો-શુ ગ્રીડમાં ખૂટતા ગ્રહોના સંપૂર્ણ ઉપાય કિટ (મૂળાંક અને ભાગ્યાંકના ગ્રહો પહેલેથી સહયોગી છે)." : `Full remedy kits for the planets missing from your grid${weakNums.length !== p.missing.length ? " (your Driver/Conductor planets are inherently supported)" : ""}.`}</p>
          <div class="card-grid two">${p.missing.slice(0, 4).map((n) => kitCard(n)).join("")}</div>
          ${p.missing.length > 4 ? `<p class="rsection-desc">+ ${p.missing.length - 4} more missing numbers — apply their quick balancers from Section ${SECTION.loshu}.</p>` : ""}
        </section>` : "";

    const z = db.zodiac[p.zodiac] || {};
    const zodiacSection = `<section class="rsection" id="vedic-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.zodiac}</span>${t("secZodiac", "Your Vedic Zodiac Power Kit — {sign}").replace("{sign}", esc(p.zodiac))}</h2>
      <p class="rsection-desc">This is your <strong>Vedic Sun Sign (Surya Rashi)</strong> — the sidereal / Nirayana position using the <strong>Lahiri ayanamsa</strong> (the fixed sky sits ~24° behind the Western tropical zodiac due to precession). Your date of birth alone is enough to compute it, and it stays the primary Vedic reference in this report. Western tropical reference: <strong>${esc(p.zodiacTropical)}</strong> ${p.zodiac !== p.zodiacTropical ? `(your tropical Sun would fall in ${esc(p.zodiacTropical)} — the sidereal sign is usually the one before it; we always follow the Vedic / Lahiri position).` : "(in this case the two systems agree)."} Numerology (Driver, Conductor, Lo Shu Grid) remains the engine of this report — the sign layer tunes which crystals, intentions and affirmations resonate most strongly with you.</p>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">${esc(p.zodiac)} — ${esc(z.element)} sign, ruled by ${esc(db.numbers[z.ruler].planet)}</div>
          <span class="badge info">Supports intentions: ${esc(z.intentions)}</span>
        </div>
        <div class="kit">
          <div class="kit-row"><div class="kit-ico">💎</div><div class="kit-body"><div class="kit-label">Your Sign's Crystals</div><div class="kit-value">${(z.crystals || []).map(esc).join(" · ")}</div></div></div>
          <div class="kit-row"><div class="kit-ico">🙏</div><div class="kit-body"><div class="kit-label">Sign Mantra</div><div class="kit-value"><span class="mantra">${esc(z.dev)}</span> <em>(${esc(z.pron)})</em><br><span class="card-sub">${esc(z.meaning)} ${lang === "hi" ? "प्रतिदिन सुबह ११ बार जपें।" : lang === "gu" ? "દરરોજ સવારે ૧૧ વખત જાપ કરો." : "Chant 11 times each morning."}</span></div></div></div>
          <div class="kit-row"><div class="kit-ico">📝</div><div class="kit-body"><div class="kit-label">Wish-Paper Affirmation</div><div class="kit-value">“${esc(z.affirmation)}”</div></div></div>
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
            ? `<div class="card-sub"><strong>${lang === "hi" ? "सुझाई गई स्पेलिंग" : lang === "gu" ? "સૂચવેલી સ્પેલિંગ" : "Recommended spellings"}</strong> — ${lang === "hi" ? "उच्चारण वही रहता है; अक्षरों को ध्वनि-सुरक्षित तरीके से बदला गया है:" : lang === "gu" ? "ઉચ્ચાર એ જ રહે છે; અક્ષરોને ધ્વનિ-સુરક્ષિત રીતે બદલવામાં આવ્યા છે:" : "pronunciation stays the same; letters are doubled, added or swapped for same-sound equivalents (the way Tripti became Triptii and Sunil became Suniel). Priority is given to spellings that fill the missing numbers in your Loshu grid:"}</div>
               ${spellingTableHtml(nameSug.variants)}
               <div class="card-sub">${lang === "hi" ? `नई स्पेलिंग को रोज २१ बार ४० दिनों तक लिखें और ${dayOf(p.driver)} से शुरुआत करें।` : lang === "gu" ? `નવી સ્પેલિંગ રોજ ૨૧ વખત ૪૦ દિવસ સુધી લખો અને ${dayOf(p.driver)} ના દિવસે શરૂ કરો.` : `Write the new spelling 21 times daily for 40 days, update it on non-legal items first (email signature, social profiles, visiting cards), and introduce it on a ${DAY_OF[p.driver]}.`}</div>`
            : `<div class="card-sub">Consult a numerologist for a custom spelling — targets friendly to both your numbers are limited. Favour spellings totalling a number that fills a missing number in your grid (${p.missing.join(", ") || "none missing"}) or is friendly to Driver ${p.driver} and Conductor ${p.conductor}.</div>`)
          : `<div class="kit-value">${esc(db.nameAdvice[nameVerdictTone === "good" ? "friendly" : "neutral"])}</div>${(nameSug.optional && nameSug.optional.variants && nameSug.optional.variants.length) ? `<div class="card" style="margin-top:12px">
               <div class="goal-head">
                 <div class="card-title">${lang === "hi" ? "वैकल्पिक वृद्धि (Optional Enhancement)" : lang === "gu" ? "વૈકલ્પિક ઉન્નતિ (Optional Enhancement)" : "Optional Enhancement"}</div>
                 <span class="badge info">${lang === "hi" ? "केवल वैकल्पिक — कोई बदलाव आवश्यक नहीं" : lang === "gu" ? "માત્ર વૈકલ્પિક — કોઈ ફેરફાર જરૂરી નથી" : "Optional only — no change required"}</span>
               </div>
               <div class="kit-value">${lang === "hi" ? `आपका नाम पहले से ही आपके जन्म अंकों के अनुकूल है, इसलिए कुछ भी बदलना आवश्यक नहीं है। नीचे दी गई स्पेलिंगें आपके लो-शू ग्रिड में अनुपस्थित अंक को जोड़ने का एक <em>वैकल्पिक</em> तरीका हैं — इनका उच्चारण समान रहता है, ये मूलांक ${p.driver} और भाग्यांक ${p.conductor} के अनुकूल रहती हैं, और ऐसे अंक में कभी वृद्धि नहीं करतीं जो आपके पास पहले से अधिक मात्रा में है।` : lang === "gu" ? `તમારું નામ પહેલેથી જ તમારા જન્મ અંકો સાથે સુમેળભર્યું છે, તેથી કંઈ બદલવાની જરૂર નથી. નીચે આપેલી સ્પેલિંગો તમારા લો-શુ ગ્રીડમાં ખૂટતો અંક ઉમેરવાનો <em>વૈકલ્પિક</em> માર્ગ છે — ઉચ્ચાર એ જ રહે છે, તે મૂળાંક ${p.driver} અને ભાગ્યાંક ${p.conductor} સાથે અનુકૂળ રહે છે, અને એવા અંકમાં ક્યારેય વધારો કરતી નથી જે તમારી પાસે પહેલેથી વધુ માત્રામાં હોય.` : `Your name already harmonises with your birth numbers, so nothing needs to change. The spellings below are an <em>optional</em> way to consciously add a number your Lo Shu grid is missing — they keep the same pronunciation, stay harmonious with Driver ${p.driver} and Conductor ${p.conductor}, and never add fuel to a number you already have in excess.`}</div>
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
    const crystalSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.crystal}</span>${t("secCrystal", "Crystal Companion Guide")}</h2>
      <p class="rsection-desc">Your chart (Driver ${p.driver}, Conductor ${p.conductor}, ${esc(p.zodiac)} sign${p.missing.length ? `, missing ${p.missing.join("/")}` : ""}) points to these crystals — each with its energy centre, core benefits and the pairing that amplifies it.</p>
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
      }).join("")}</div>` : `<div class="card"><div class="kit-value">Your primary crystals are listed with each planet kit above — follow the pairings below for best results.</div></div>`}
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
          ${p.missing.includes(3) ? ` Number 3 (Jupiter) is missing from your grid — careers involving teaching, finance or advisory need extra Jupiter remedy support (see Section 4).` : ""}
          ${p.missing.includes(8) ? ` Number 8 (Saturn) is missing — long-term career stability improves as you apply the Saturn remedies in Section 4.` : ""}</div>
      </div>
    </section>`;

    const timingSection = `<section class="rsection" id="timing-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.timing}</span>${t("secTiming", "Favourable Years & Timing")}</h2>
      <div class="card">
        <div class="card-title">Your Personal Year Cycle</div>
        <div class="table-scroll"><table class="rtable">
          <tr><th>Year</th><th>Personal Year</th><th>Theme — how to use it</th></tr>
          ${timing.years.map((y) => `<tr${y.current ? ' class="hl-row"' : ""}>
            <td><strong>${y.yr}</strong>${y.current ? ` <span class="badge info">${lang === "hi" ? "वर्तमान" : lang === "gu" ? "હાલમાં" : "Now"}</span>` : ""}</td>
            <td>${y.n} (${esc(db.numbers[y.n].planet.split(" ")[0])})</td>
            <td>${esc(y.meaning)}</td>
          </tr>`).join("")}
        </table></div>
      </div>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">Best Years Ahead</div>
          <div class="kit">${timing.luckyYears.map((l) => `<div class="kit-row"><div class="kit-ico"><strong>${l.yr}</strong></div><div class="kit-body"><div class="kit-value">Personal year ${l.py} — ${esc(l.why)}</div></div></div>`).join("")}</div>
          <div class="card-sub">${lang === "hi" ? "नए उद्यम, निवेश, नौकरी बदलाव और बड़े निर्णय इन वर्षों में लें।" : lang === "gu" ? "નવા સાહસ, રોકાણ, નોકરી બદલાવ અને મોટા નિર્ણયો આ વર્ષોમાં લો." : "Schedule launches, investments, job switches and major purchases in these years for maximum support."}</div>
        </div>
        <div class="card">
          <div class="card-title">Milestone Ages</div>
          <div class="kit">${timing.milestones.map((m) => `<div class="kit-row"><div class="kit-ico"><strong>${m.age}</strong></div><div class="kit-body"><div class="kit-value">Year ${m.yr} — ${esc(m.why)}</div></div></div>`).join("")}</div>
          <div class="card-sub">${lang === "hi" ? "ये उम्र जीवन में विशेष गति लाती हैं — बड़े फैसले इनके आसपास रखें।" : lang === "gu" ? "આ ઉંમર જીવનમાં વિશેષ ગતિ લાવે છે — મોટા નિર્ણયો આની આસપાસ રાખો." : "These ages carry extra momentum — plan your biggest moves to land on them."}</div>
        </div>
      </div>
    </section>`;

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

    const vastuSection = vastu.length
      ? `<section class="rsection" id="vastu-section">
          <h2 class="rsection-title"><span class="idx">${SECTION.vastu}</span>${t("secVastu", "Vastu Dosh Scan")}</h2>
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
      : `<section class="rsection" id="vastu-section">
          <h2 class="rsection-title"><span class="idx">${SECTION.vastu}</span>${t("secVastu", "Vastu Dosh Scan")}</h2>
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

    /* Compatibility remedy card — turns the pairwise match into a shared,
       prescriptive plan: friction -> bridge conduct, couple rituals drawn
       from the two planets' remedy kits, and numbers acceptable to both. */
    const compatRemedyCard = !cRem ? "" : (function () {
      const T = [];
      const introText = (compat.verdict === "Strong" || compat.verdict === "Good")
        ? LT("Your pairing is naturally aligned — the plan below protects the bond, converts the neutral links into strengths, and gives the relationship a shared weekly rhythm.",
             "आपका मिलान स्वाभाविक रूप से अनुकूल है — नीचे दी योजना बंधन को सुरक्षित रखती है, तटस्थ कड़ियों को सामर्थ्य में बदलती है, और संबंध को साझा साप्ताहिक लय देती है।",
             "તમારું મિલાન કુદરતી રીતે અનુકૂળ છે — નીચેની યોજના બંધનને સુરક્ષિત રાખે છે, તટસ્થ કડીઓને શક્તિમાં બદલે છે, અને સંબંધને સામુહિક સાપ્તાહિક લય આપે છે.")
        : (compat.verdict === "Workable")
          ? LT("These remedies target the specific conflicting pairs — practise them together for one 40-day mandala to soften the friction and build the bridge.",
               "ये उपाय विशेष रूप से टकराव वाली कड़ियों पर काम करते हैं — एक 40-दिन मंडल तक साथ करें, घर्षण घटेगा और सेतु बनेगी।",
               "આ ઉપાયો ખાસ ટકરાવવાળી કડીઓ પર કામ કરે છે — એક 40-દિવસ મંડળ સુધી સાથે કરો, ઘર્ષણ ઘટશે અને સેતુ બનશે.")
          : LT("This pairing needs conscious bridging — treat the plan below as priority repair work. Every remedy is small enough to do together; consistency converts friction into understanding.",
               "इस मिलान को सजग सेतु-निर्माण चाहिए — नीचे की योजना को प्राथमिक मरम्मत कार्य मानें। हर उपाय साथ में करने लायक सरल है; निरंतरता ही घर्षण को समझ में बदलती है।",
               "આ મિલાનને જાગૃત સેતુ-નિર્માણ જોઈએ — નીચેની યોજનાને પ્રાથમિક સમારકામ ગણો. દરેક ઉપાય સાથે કરી શકાય એટલો સરળ છે; નિયમિતતા જ ઘર્ષણને સમજણમાં બદલે.");
      T.push('<div class="card" id="compat-remedies">');
      T.push('<div class="goal-head"><div class="card-title">🤝 ' + LT("Compatibility remedy plan", "सामंजस्य उपाय योजना", "સુસંગતતા ઉપાય યોજના") + " — " + esc(p.name.split(/\s+/)[0]) + " &amp; " + esc(partnerFirst) + '</div><span class="badge ' + (compat.enemy ? "warn" : "good") + '">' + (cRem.conflicts.length ? cRem.conflicts.length + " " + LT("clash pair(s)", "टकराव जोड़(ें)", "ટકરાવ જોડી(ઓ)") : LT("no clashes", "कोई टकराव नहीं", "કોઈ ટકરાવ નહીં")) + "</span></div>");
      T.push('<div class="kit-value">' + introText + "</div>");
      cRem.conflicts.forEach(function (c) {
        T.push('<div class="kit-row"><div class="kit-ico">⚡</div><div class="kit-body"><div class="kit-label">' + esc(c.a) + " (" + esc(c.planetA.split(" ")[0]) + ") × " + esc(c.b) + " (" + esc(c.planetB.split(" ")[0]) + ")</div>");
        T.push(c.friction
          ? '<div class="kit-value">' + esc(c.friction[lang] || c.friction.en) + '</div><div class="kit-value">🌉 ' + esc(c.bridge[lang] || c.bridge.en) + "</div>"
          : '<div class="kit-value">' + LT("Conflicting planets — both partners keep their own planet's remedy kit active (kits below).", "प्रतिकूल ग्रह — दोनों साथी अपने-अपने ग्रह का उपाय-किट सक्रिय रखें (नीचे किट देखें)।", "પ્રતિકૂળ ગ્રહો — બંને ભાગીદારો પોતાના ગ્રહનો ઉપાય-કિટ સક્રિય રાખે (નીચે કિટ જુઓ).") + "</div>");
        T.push("</div></div>");
        T.push('<div class="kit-row"><div class="kit-ico">🕊</div><div class="kit-body"><div class="kit-label">' + LT("Couple remedy for this pair", "इस जोड़ी का संयुक्त उपाय", "આ જોડીનો સંયુક્ત ઉપાય") + "</div>");
        T.push('<div class="kit-value">' + LT("You", "आप", "તમે") + ": " + esc(db.numbers[c.aNum].charity) + " · " + LT("chant", "जपें", "જપો") + ' <span class="mantra">' + esc(db.mantraShort[c.aNum].dev) + "</span> 11×<br>" + esc(partnerFirst) + ": " + esc(db.numbers[c.bNum].charity) + " · " + LT("chants", "जपें", "જપો") + ' <span class="mantra">' + esc(db.mantraShort[c.bNum].dev) + "</span> 11×</div>");
        T.push('<div class="kit-value">' + LT("On those two weekdays wear", "उन दो वारों पर पहनें", "એ બે વારે પહેરો") + " <strong>" + esc(db.numbers[c.aNum].color.split(",")[0]) + "</strong> / <strong>" + esc(db.numbers[c.bNum].color.split(",")[0]) + "</strong> " + LT("and avoid hard conversations on the other's weekday.", "और दूसरे के वार पर कठिन बातचीत टालें।", "અને બીજાના વારે કઠિન વાતચીત ટાળો.") + "</div></div></div>");
      });
      if (!cRem.conflicts.length && cRem.neutralLinks) {
        const rows = compat.pairs.filter(function (pr) { return pr.r === "neutral"; }).map(function (pr) {
          const nn = pr.bNum;
          return LT(pr.b + " (" + db.numbers[nn].planet.split(" ")[0] + ") — on " + db.numbers[nn].day + ", one of you wears " + db.numbers[nn].color.split(",")[0] + " and you donate together: " + db.numbers[nn].charity + ".",
                    esc(pr.b) + " (" + esc(db.numbers[nn].planet.split(" ")[0]) + ") — " + esc(db.numbers[nn].day) + " को आप दोनों में से एक " + esc(db.numbers[nn].color.split(",")[0]) + " पहने और साथ दान करें: " + esc(db.numbers[nn].charity) + ".",
                    esc(pr.b) + " (" + esc(db.numbers[nn].planet.split(" ")[0]) + ") — " + esc(db.numbers[nn].day) + "એ તમે બંનેમાંથી એક " + esc(db.numbers[nn].color.split(",")[0]) + " પહેરો અને સાથે દાન કરો: " + esc(db.numbers[nn].charity) + ".");
        }).join("<br>");
        T.push('<div class="kit-row"><div class="kit-ico">🌱</div><div class="kit-body"><div class="kit-label">' + LT("Activate the neutral links", "तटस्थ कड़ियों को सक्रिय करें", "તટસ્થ કડીઓ સક્રિય કરો") + '</div><div class="kit-value">' + rows + "</div></div></div>");
      }
      if (cRem.bridges.length) {
        const b0 = cRem.bridges[0];
        const useText = LT("Use them where the two of you share a number: the last digit of a new mobile number, vehicle totals, house/flat numbers, joint account or firm names (Chaldean total), and the digit-sum of engagement/wedding/launch dates. " + b0.n + " is your strongest shared vibration — its day is " + b0.day + ", its colour " + b0.color + ".",
                           "इन्हें वहाँ चुनें जहाँ दोनों का अंक साझा होता है: नए मोबाइल का अंतिम अंक, वाहन कुल, मकान/फ्लैट नंबर, संयुक्त खाते या फर्म का नाम (कालदेवी कुल), और सगाई/विवाह/उद्घाटन तिथि का अंक-योग। " + b0.n + " आपकी सबसे प्रबल साझा कंपन है — इसका वार " + b0.day + " और रंग " + b0.color + " है।",
                           "તેમને ત્યાં પસંદ કરો જ્યાં બંનેનો અંક સાઝો હોય: નવા મોબાઈલનો છેલ્લો અંક, વાહન કુલ, મકાન/ફ્લેટ નંબર, સંયુક્ત ખાતાં કે ફર્મનું નામ (કલ્દી કુલ), અને સગાઈ/લગ્ન/ઉદ્ઘાટન તારીખનો અંક-સરવાળો. " + b0.n + " તમારો સૌથી પ્રબળ સાઝો કંપન છે — તેનો વાર " + b0.day + " અને રંગ " + b0.color + ".");
        T.push('<div class="kit-row"><div class="kit-ico">🌉</div><div class="kit-body"><div class="kit-label">' + LT("Bridge numbers — friendly to both charts", "सेतु अंक — दोनों के अनुकूल", "સેતુ અંક — બંનેને અનુકૂળ") + '</div><div class="kit-value">' + cRem.bridges.map(function (br) { return "<strong>" + br.n + "</strong> (" + esc(br.planet) + ")"; }).join(" · ") + '</div><div class="kit-value">' + useText + "</div></div></div>");
      }
      if (cRem.conflicts.length) {
        T.push('<div class="kit-value" style="margin-top:8px">🧩 ' + LT("Bridge kits below carry the full remedy set (mantra, crystal, rudraksha, yantra, fasting) for the partner-side planets in your top conflicts — run both partners' kits in parallel through the 40-day plan.",
          "नीचे के सेतु-किट में आपके प्रमुख टकरावों के पार्टनर-पक्ष ग्रहों का पूरा उपाय-सेट (मंत्र, रत्न, रुद्राक्ष, यंत्र, व्रत) है — 40-दिन योजना के दौरान दोनों किट समानांतर चलाएँ।",
          "નીચેના સેતુ-કિટમાં તમારા મુખ્ય ટકરાવોના પાર્ટનર-પક્ષ ગ્રહોનો સંપૂર્ણ ઉપાય-સેટ (મંત્ર, રત્ન, રુદ્રાક્ષ, યંત્ર, વ્રત) છે — 40-દિવસ યોજના દરમિયાન બંને કિટ સમાંતર ચલાવો.") + "</div>");
        const seenKit = [];
        const kitHtml = cRem.conflicts.map(function (c) {
          if (seenKit.indexOf(c.bNum) !== -1) return "";
          seenKit.push(c.bNum);
          if (seenKit.length > 2) return "";
          return kitCard(c.bNum, LT("Bridge kit — accommodate " + partnerFirst + "'s " + c.planetB, partnerFirst + " के " + c.planetB + " के लिए सेतु-किट", partnerFirst + "ના " + c.planetB + " માટે સેતુ-કિટ"));
        }).join("");
        T.push('<div class="card-grid two">' + kitHtml + "</div>");
      }
      T.push("</div>");
      return T.join("");
    })();

    const compatSection = `<section class="rsection" id="compatibility-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.compatibility}</span>${t("secCompat", "Compatibility & Matchmaking")}</h2>
      ${compat ? `<p class="rsection-desc">Pairwise Driver / Conductor match between <strong>${esc(p.name)}</strong> and <strong>${esc(p.partnerName)}</strong> (marriage or business partnership).</p>
        <div class="card">
          <div class="goal-head">
            <div class="card-title">Overall verdict: ${compat.verdict}</div>
            <span class="badge ${compat.verdict === "Strong" || compat.verdict === "Good" ? "good" : compat.verdict === "Workable" ? "warn" : "bad"}">${compat.friendly} harmonious · ${compat.neutral} neutral · ${compat.enemy} conflicting</span>
          </div>
          <div class="table-scroll"><table class="rtable">
            <tr><th>Pairing</th><th>Relation</th></tr>
            ${compat.pairs.map((pr) => `<tr><td>${esc(pr.a)} × ${esc(pr.b)}</td><td>${relBadge(pr.r)}</td></tr>`).join("")}
          </table></div>
          <div class="kit-value">${compat.verdict === "Strong" ? (lang === "hi" ? "स्वाभाविक रूप से सहयोगी और शुभ मिलान — आपके अंक एक दूसरे को शक्ति देते हैं।" : lang === "gu" ? "કુદરતી રીતે સહયોગી અને શુભ મિલાન — તમારા અંકો એકબીજાને બળ આપે છે." : "A naturally cooperative pairing — your numbers reinforce each other.") : compat.verdict === "Good" ? (lang === "hi" ? "सकारात्मक और अनुकूल मिलान — कुछ सामान्य कड़ियों के साथ यह संबंध सुखद रहेगा।" : lang === "gu" ? "હકારાત્મક અને અનુકૂળ મિલાન — કેટલીક સામાન્ય કડીઓ સાથે આ સંબંધ સુખદ રહેશે." : "A supportive pairing with a couple of neutral links — manageable and mostly aligned.") : compat.verdict === "Workable" ? (lang === "hi" ? "साध्य मिलान, किंतु थोड़ा प्रयास आवश्यक है — प्रतिकूल कड़ियों पर समझदारी जरूरी है।" : lang === "gu" ? "સાધ્ય મિલાન, પણ થોડો પ્રયાસ જરૂરી છે — પ્રતિકૂળ કડીઓ પર સમજણ જરૂરી છે." : "Workable, but needs conscious effort — the conflicting links are the areas to manage.") : (lang === "hi" ? "चुनौतीपूर्ण मिलान — विरोधी अंकों के प्रभाव को कम करने के लिए उपाय और संवाद आवश्यक है।" : lang === "gu" ? "પડકારરૂપ મિલાન — વિરોધી અંકોના પ્રભાવને ઘટાડવા માટે ઉપાયો અને સંવાદ જરૂરી છે." : "Challenging pairing — the conflicting numbers need remedies and clear communication to bridge.")}</div>
        </div>
        ${compatRemedyCard}`
      : `<div class="card">
          <div class="card-title">${lang === "hi" ? "आपके लिए कौन से अंक अनुकूल हैं?" : lang === "gu" ? "તમારા માટે કયા અંકો અનુકૂળ છે?" : "Who are you compatible with?"}</div>
          <div class="kit-value">${lang === "hi" ? "पूर्ण मिलान के लिए पार्टनर का नाम और जन्मतिथि जोड़ें। इस बीच, यहां देखें कि आपके अंक अन्य मूलांकों से कैसे मेल खाते हैं:" : lang === "gu" ? "સંપૂર્ણ મિલાન માટે પાર્ટનરનું નામ અને જન્મ તારીખ ઉમેરો. દરમિયાન, અહીં જુઓ કે તમારા અંકો અન્ય મૂળાંકો સાથે કેવી રીતે મેળ ખાય છે:" : "Add a <strong>partner's name and date of birth</strong> (Edit Details → Compatibility) for a full two-person Driver / Conductor match. Meanwhile, here is how your numbers relate to every other Driver:"}</div>
          <div class="table-scroll"><table class="rtable">
            <tr><th>${lang === "hi" ? "अन्य व्यक्ति का मूलांक" : lang === "gu" ? "અન્ય વ્યક્તિનો મૂળાંક" : "Other person's Driver"}</th><th>vs your Driver ${p.driver}</th><th>vs your Conductor ${p.conductor}</th></tr>
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<tr><td><strong>${n}</strong> (${esc(db.numbers[n].planet.split(" ")[0])})</td><td>${relBadge(relation(p.driver, n))}</td><td>${relBadge(relation(p.conductor, n))}</td></tr>`).join("")}
          </table></div>
        </div>`}
    </section>`;

    const goalsStart = SECTION.goalsStart;
    const goalSections = goals.map((g, i) => `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${goalsStart + i}</span>${esc(g.goal)} — ${lang === "hi" ? "उपाय योजना" : lang === "gu" ? "ઉપાય યોજના" : "Remedy Plan"}</h2>
      <p class="rsection-desc">${g.weak.length
        ? (lang === "hi" ? `ग्रिड में अनुपस्थित अंक <strong>${g.weak.join(", ")}</strong> के कारण रुकावट — इन ग्रहों के उपाय प्राथमिकता हैं।` : lang === "gu" ? `ગ્રીડમાં ખૂટતા અંક <strong>${g.weak.join(", ")}</strong> ના કારણે અવરોધ — આ ગ્રહોના ઉપાયો પ્રાથમિકતા છે.` : `Blocked by missing number${g.weak.length > 1 ? "s" : ""} <strong>${g.weak.join(", ")}</strong> in your grid — these planet kits are your ${esc(g.goal.toLowerCase())} priority.`)
        : (lang === "hi" ? "कोई ग्रह अनुपस्थित नहीं है — मुख्य ग्रहों की ऊर्जा नियमित बनाए रखें।" : lang === "gu" ? "કોઈ ગ્રહ ખૂટતો નથી — મુખ્ય ગ્રહોની ઊર્જા નિયમિત જાળવી રાખો." : `No ${esc(g.goal.toLowerCase())} planet is missing from your grid — maintain momentum with your key ${esc(g.goal.toLowerCase())} planets.`)}</p>
      <div class="card-grid two">${g.focus.map((f) => kitCard(f.n)).join("")}</div>
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
        ? (lang === "hi" ? `सर्वोत्तम शुरुआत के लिए <strong>${dayOf(p.driver)}</strong> की सुबह से प्रारंभ करें और दिन १ पर टैप करें।` : lang === "gu" ? `શ્રેષ્ઠ શરૂઆત માટે <strong>${dayOf(p.driver)}</strong> ની સવારથી પ્રારંભ કરો અને દિવસ ૧ પર ટેપ કરો.` : `Begin on a <strong>${DAY_OF[p.driver]}</strong> morning for the strongest start, then tap Day 1. The ritual takes under 10 minutes — consistency is the remedy.`)
        : (lang === "hi" ? `${planDone} / ${PLAN_DAYS} दिन पूर्ण — अगला दिन ${planNext + 1} है। नियम न तोड़ें।` : lang === "gu" ? `${planDone} / ${PLAN_DAYS} દિવસ પૂર્ણ — આગામી દિવસ ${planNext + 1} છે. સાતત્ય જાળવી રાખો.` : `${planDone} of ${PLAN_DAYS} days done — Day ${planNext + 1} is next${planNext + 1 <= PLAN_DAYS ? `, ${PLAN_DAYS - planDone} day${PLAN_DAYS - planDone === 1 ? "" : "s"} to go` : ""}. Keep the thread unbroken.`);

    const prioritySection = `<section class="rsection" id="plan-section">
      <h2 class="rsection-title"><span class="idx">${goalsStart + goals.length}</span>${t("secPlan", "Your 40-Day Activation Plan")}</h2>
      <p class="rsection-desc">${lang === "hi" ? "शास्त्रों में ४० दिनों को 'मंडल' कहा गया है — किसी भी उपाय का स्थायी प्रभाव स्थापित करने का न्यूनतम चक्र। यह आपकी कार्ययोजना है: दैनिक साधना, साप्ताहिक क्रम, चार चरण और एक दैनिक ट्रैकर।" : lang === "gu" ? "શાસ્ત્રોમાં ૪૦ દિવસને 'મંડળ' કહેવાય છે — કોઈપણ ઉપાયનો કાયમી પ્રભાવ સ્થાપિત કરવાનો ન્યૂનતમ સમયગાળો. આ તમારી કાર્યયોજના છે: દૈનિક સાધના, સાપ્તાહિક ક્રમ, ચાર તબક્કા અને એક દૈનિક ટ્રેકર." : "Forty days is the classical <strong>mandala</strong> — the minimum cycle for a remedy to imprint its vibration. This page is your itinerary: one small daily ritual, a weekly rhythm, four phases, and a tracker to keep you honest. The action checklist that follows is the full to-do list of this report — it lives here, once, tagged by how often each action runs."}</p>
      <div class="card-grid two">
        <div class="card ritual-card">
          <div class="card-title">${lang === "hi" ? "आपकी दैनिक मुख्य साधना — प्रतिदिन सुबह, बिना चूके" : lang === "gu" ? "તમારી દૈનિક મુખ્ય સાધના — દરરોજ સવારે, ચૂક્યા વગર" : "Your Daily Core Ritual — every morning, without negotiation"}</div>
          <div class="kit">
            ${activation.daily.map((row) => `<div class="kit-row"><div class="kit-ico">${row.ico}</div><div class="kit-body"><div class="kit-label">${row.label}</div><div class="kit-value">${row.value}<br><span class="card-sub">${row.sub}</span></div></div></div>`).join("")}
          </div>
        </div>
        <div class="card">
          <div class="card-title">${lang === "hi" ? "आपका साप्ताहिक क्रम — ऊर्जावान वार" : lang === "gu" ? "તમારો સાપ્તાહિક ક્રમ — ઊર્જાવાન વાર" : "Your Weekly Rhythm — the charged days"}</div>
          <div class="table-scroll"><table class="rtable">
            <tr><th>Day</th><th>Planet</th><th>Charity</th><th>Fast</th></tr>
            ${activation.weekly.map((w) => `<tr>
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
        <nav class="report-nav" aria-label="Quick report navigation">
          <a href="#summary-section">${t("navSummary", "Summary")}</a>
          <a href="#core-profile">${t("navProfile", "Profile")}</a>
          <a href="#loshu-section">${t("navLoshu", "Loshu Grid")}</a>
          <a href="#vedic-section">${t("navVedic", "Vedic Sign")}</a>
          <a href="#timing-section">${t("navTiming", "Timing")}</a>
          <a href="#memory-section">${t("navMemory", "Evolving Chart")}</a>
          <a href="#vastu-section">${t("navVastu", "Vastu")}</a>
          <a href="#plan-section">${t("navPlan", "40-Day Plan")}</a>
        </nav>
      </div>
      ${summarySection}
      <section class="rsection" id="core-profile">
        <h2 class="rsection-title"><span class="idx">${SECTION.core}</span>${t("secProfile", "Core Numerology Profile")}</h2>
        <div class="card-grid">
          ${numCard(t("driverLabel", "Driver (Moolank)"), p.driver, lang === "hi" ? "आपकी सोच, व्यक्तित्व और दैनिक ऊर्जा" : lang === "gu" ? "તમારી વિચારસરણી, વ્યક્તિત્વ અને દૈનિક ઊર્જા" : "Your mind, personality and day-to-day energy")}
          ${numCard(t("conductorLabel", "Conductor (Bhagyank)"), p.conductor, lang === "hi" ? "आपका भाग्य मार्ग और दीर्घकालिक सफलता" : lang === "gu" ? "તમારો ભાગ્ય માર્ગ અને દીર્ઘકાલીન સફળતા" : "Your destiny path and long-term results")}
          ${numCard("Name Number", p.nameNum, `Chaldean total ${p.nameCompound} — ${lang === "hi" ? "दुनिया आपको कैसे स्वीकारती है" : lang === "gu" ? "દુનિયા તમને કેવી રીતે સ્વીકારે છે" : "how the world receives you"}`)}
          ${numCard("Mobile Number", p.mobNum, `Digits total ${p.mobCompound} — ${lang === "hi" ? "सर्वाधिक प्रयुक्त दैनिक ऊर्जा" : lang === "gu" ? "સૌથી વધુ વપરાતી દૈનિક ઊર્જા" : "your most-used vibration"}`)}
          <div class="card num-card">
            <div class="num-value" style="font-size:26px">${esc(p.zodiac)}</div>
            <div class="num-label">Vedic Sun Sign · Surya Rashi</div>
            <div class="num-planet">${esc(db.zodiac[p.zodiac].element)} · Ruled by ${esc(db.numbers[db.zodiac[p.zodiac].ruler].planet)}</div>
            <div class="num-traits">Sidereal / Lahiri ayanamsa · Crystals: ${(db.zodiac[p.zodiac].crystals || []).map(esc).join(", ")}</div>
            <div class="num-traits vedic-western-ref">Western tropical reference: ${esc(p.zodiacTropical)}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Driver ${p.driver} × Conductor ${p.conductor} combination</div>
          <div class="kit-value">Your mind runs on <strong>${esc(db.numbers[p.driver].planet)}</strong> (${esc(db.numbers[p.driver].traits.split(",")[0].toLowerCase())}) while your destiny demands <strong>${esc(db.numbers[p.conductor].planet)}</strong> (${esc(db.numbers[p.conductor].traits.split(",")[0].toLowerCase())}). This pair is <strong>${relation(p.driver, p.conductor)}</strong> — ${relation(p.driver, p.conductor) === "friendly" ? "a naturally cooperative chart; remedies will amplify what already flows." : relation(p.driver, p.conductor) === "neutral" ? "a workable chart; targeted remedies will sharpen results." : "the remedies below are chosen to bridge these two energies."}</div>
        </div>
      </section>
      ${traitsSection}
      ${renderLoshu(p)}
      ${weakSection}
      ${zodiacSection}
      ${nameSection}
      ${mobSection}
      ${vehicleSection}
      ${watchSection}
      ${crystalSection}
      ${colorSection}
      ${careerSection}
      ${timingSection}
      ${memorySection}
      ${vastuSection}
      ${kuaSection}
      ${compatSection}
      ${goalSections}
      ${prioritySection}
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

  function bindReportInteractions() {
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
    computeProfile, nameSuggestions, buildOptionalSpellings, brandAnalysis, spellingCandidates,
    mobileSuggestion, vehicleAnalysis, timingAnalysis, zodiacSign,
    zodiacSignSidereal, kuaNumber, compatibility, compatRemedies, compoundMeaning,
    masterNumber, reduce, relation, chaldeanValue, validatePack,
    normalizePack, contributionPayload, formatBirthTime, setLanguage, getLang,
    renderReport, showReport, showIntake, getActiveDB
  };
})();
