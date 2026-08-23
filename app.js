/* ============================================================
   NumeroVastu 360 — calculation engine + report renderer
   All computation is local. Depends on data.js (DB).
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
    const f = DB.friendship[a];
    if (!f) return "neutral";
    if (f.friends.includes(b)) return "friendly";
    if (f.neutral.includes(b)) return "neutral";
    return "enemy";
  }
  const relBadge = (r) =>
    r === "friendly" ? '<span class="badge good">Harmonious</span>'
    : r === "neutral" ? '<span class="badge warn">Neutral</span>'
    : '<span class="badge bad">Conflicting</span>';

  const DAY_OF = { 1: "Sunday", 2: "Monday", 9: "Tuesday", 5: "Wednesday", 3: "Thursday", 6: "Friday", 8: "Saturday", 4: "Saturday", 7: "Tuesday" };
  const APP_VERSION = ($('meta[name="nv-version"]') && $('meta[name="nv-version"]').content) || "2.1.0";
  const BUILD_LABEL = ($('meta[name="nv-build-label"]') && $('meta[name="nv-build-label"]').content) || "Build local";
  const DEFAULT_MANIFEST_PATH = "knowledge-pack/latest.json";
  const STORAGE_KEYS = {
    packCache: "nv360.packCache.v1",
    history: "nv360.history.v1",
    practice: "nv360.practice.v1",
    journal: "nv360.journal.v1",
    contributionEnabled: "nv360.contributionEnabled.v1",
    contributionOutbox: "nv360.contributionOutbox.v1"
  };
  const SECTION = { core: 1, traits: 2, loshu: 3, weak: 4, zodiac: 5, name: 6, mobile: 7, vehicle: 8, watch: 9, crystal: 10, colours: 11, career: 12, timing: 13, memory: 14, vastu: 15, kua: 16, compatibility: 17, goalsStart: 18 };
  const state = {
    pack: null,
    history: [],
    contributionEnabled: false,
    lastInput: null,
    activeProfileKey: "",
    toastTimer: null,
    updatePromise: null
  };

  function safeJSONParse(value, fallback) {
    if (!value) return fallback;
    try { return JSON.parse(value); } catch { return fallback; }
  }
  function readStore(key, fallback) {
    try {
      return safeJSONParse(window.localStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }
  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
  function compareVersions(a, b) {
    const pa = String(a || "0").split(".").map((n) => parseInt(n, 10) || 0);
    const pb = String(b || "0").split(".").map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff) return diff;
    }
    return 0;
  }
  function isoDate(d) {
    return new Date(d || Date.now()).toISOString();
  }
  function prettyDate(input) {
    try {
      return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(input));
    } catch {
      return String(input || "");
    }
  }
  /* Format an HH:MM (24h) birth time as 12h clock, e.g. "14:05" -> "2:05 PM".
     Empty or malformed input returns "" (no birth time given). */
  function formatBirthTime(t) {
    if (!t) return "";
    const m = String(t).trim().match(/^(\d{1,2}):(\d{2})/);
    if (!m) return String(t).trim();
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${min} ${ampm}`;
  }
  function profileKeyOf(input) {
    return `${String(input.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}|${input.dob || ""}`;
  }
  function normalizePack(raw, source) {
    if (!raw) return null;
    if (raw.db && raw.packVersion) {
      return {
        app: raw.app || "NumeroVastu 360",
        schemaVersion: Number(raw.schemaVersion) || 1,
        packVersion: String(raw.packVersion),
        generatedAt: raw.generatedAt || null,
        manifestPath: raw.manifestPath || DEFAULT_MANIFEST_PATH,
        contribution: raw.contribution || { mode: "scaffold", endpoint: null },
        db: raw.db,
        source: source || raw.source || "bundled"
      };
    }
    if (raw.numbers && raw.friendship) {
      return {
        app: "NumeroVastu 360",
        schemaVersion: 1,
        packVersion: APP_VERSION,
        generatedAt: null,
        manifestPath: DEFAULT_MANIFEST_PATH,
        contribution: { mode: "scaffold", endpoint: null },
        db: raw,
        source: source || "legacy"
      };
    }
    return null;
  }
  function validatePack(pack) {
    const errors = [];
    if (!pack || typeof pack !== "object") errors.push("pack must be an object");
    if (!pack || !pack.packVersion) errors.push("missing packVersion");
    const db = pack && pack.db;
    if (!db || typeof db !== "object") errors.push("missing db");
    const requiredTop = ["chaldean", "friendship", "numbers", "watch", "loshuLayout", "planes", "traits", "missingFix", "yantra", "arrows", "kua", "goals", "vastu", "careers", "dayWear", "personalYear", "spelling", "mantraShort", "zodiac", "crystals", "compound", "masterNumbers", "nameAdvice"];
    requiredTop.forEach((key) => { if (!db || !(key in db)) errors.push(`db.${key} missing`); });
    if (db && (!Array.isArray(db.loshuLayout) || db.loshuLayout.length !== 3)) errors.push("db.loshuLayout must have 3 rows");
    if (db && (!Array.isArray(db.planes) || db.planes.length < 8)) errors.push("db.planes must contain the full plane set");
    if (db && (!Array.isArray(db.arrows) || db.arrows.length < 8)) errors.push("db.arrows must contain the full arrow set");
    for (let n = 1; n <= 9; n++) {
      if (!db || !db.numbers || !db.numbers[n]) errors.push(`db.numbers.${n} missing`);
      if (!db || !db.friendship || !db.friendship[n]) errors.push(`db.friendship.${n} missing`);
    }
    return { ok: errors.length === 0, errors };
  }
  function showToast(message, tone) {
    const host = $("#toastViewport");
    if (!host) return;
    const toast = document.createElement("div");
    toast.className = `toast ${tone || "info"}`;
    toast.textContent = message;
    host.appendChild(toast);
    clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => { toast.remove(); }, 3200);
  }
  function bundledPack() {
    return normalizePack(window.__NV_BUNDLED_PACK || (typeof DB !== "undefined" ? DB : null), "bundled");
  }
  function activePack() {
    return state.pack || bundledPack();
  }
  function setActivePack(pack, source, persist) {
    const normalized = normalizePack(pack, source);
    const check = validatePack(normalized);
    if (!check.ok) return false;
    state.pack = normalized;
    DB = normalized.db;
    if (persist) writeStore(STORAGE_KEYS.packCache, normalized);
    updateKnowledgeUI();
    return true;
  }
  function latestSnapshot() {
    return state.history[0] || null;
  }
  function hydrateState() {
    const bundled = bundledPack();
    const cached = normalizePack(readStore(STORAGE_KEYS.packCache, null), "cached");
    const bundledVersion = bundled ? bundled.packVersion : APP_VERSION;
    if (cached && validatePack(cached).ok && compareVersions(cached.packVersion, bundledVersion) > 0) setActivePack(cached, "cached", false);
    else if (bundled) setActivePack(bundled, bundled.source || "bundled", false);
    state.history = readStore(STORAGE_KEYS.history, []).sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")));
    state.contributionEnabled = !!readStore(STORAGE_KEYS.contributionEnabled, false);
  }
  function updateContributionUI() {
    const toggle = $("#contributeAnonymous");
    if (toggle) toggle.checked = !!state.contributionEnabled;
    const hint = $("#contributionHint");
    if (hint) hint.textContent = state.contributionEnabled
      ? "Opt-in is on. Only anonymous aggregate counts are prepared — never your name, DOB, phone, vehicle number or free-text journal notes."
      : "Off by default. No names, dates of birth, phone numbers, vehicle numbers or free-text journal notes are shared.";
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
    return name.toUpperCase().split("").reduce((a, ch) => a + (DB.chaldean[ch] || 0), 0);
  }

  // Compound-number meaning for a Chaldean total (1–108); null if out of range.
  const compoundMeaning = (n) => (n >= 1 && n <= 108 ? DB.compound[n] : null);
  // Master numbers (11 / 22 / 33) — applied to name & business totals only.
  const masterNumber = (n) => DB.masterNumbers[n] || null;

  /* ---- sun-sign (zodiac) from day & month ----
     Two zodiacs are computed:
     • Sayana (tropical) — the fixed-date Western zodiac (kept for reference).
     • Nirayana (sidereal) — the Vedic zodiac, which the report uses. Because
       of precession the fixed sidereal sky sits ~24° behind the tropical one
       (Lahiri ayanamsa), so a sidereal sign is usually the sign BEFORE the
       tropical one. Boundaries below are the standard Lahiri table for the
       Sun (accurate to ~1 day over recent decades).
     NOTE: this is the SUN sign. The true Vedic Rashi (Chandra Rashi / Moon
     sign) additionally requires birth time, place and a panchang — out of
     scope for a date-only intake. */
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

  /* ---- Kua number (Feng Shui personal-direction number) ----
     NOTE: a Chinese system, NOT classical Vastu Shastra (labelled as such in
     the report). Formula — reduce the last two digits of the birth year to a
     single digit n, then:
       male:   10 − n (pre-2000) or 9 − n (2000+)
       female: n + 5 (pre-2000) or n + 6 (2000+)
     Reduce the result to a single digit; a result of 5 becomes 2 (male) /
     8 (female). Returns null when gender is not given. */
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
  const dirLabel = (d) => (DB.vastu.directions[d] ? DB.vastu.directions[d].label : d);

  /* ---------------- intake setup ---------------- */
  const roomSelects = ["entrance", "kitchen", "bedroom", "toilet", "study", "staircase"];
  roomSelects.forEach((id) => {
    const sel = $("#" + id);
    const opts = ['<option value="unsure">Not sure</option>']
      .concat(DIRS.map((d) => `<option value="${d}">${dirLabel(d)}</option>`));
    sel.innerHTML = opts.join("");
  });

  /* Birthplace suggestions from the built-in offline atlas (astro.js) */
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
    $("#err-goals").hidden = selectedGoals.size > 0;
  }
  $$("#goalChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const g = chip.dataset.goal;
      if (selectedGoals.has(g)) { selectedGoals.delete(g); chip.classList.remove("selected"); }
      else { selectedGoals.add(g); chip.classList.add("selected"); }
      $("#err-goals").hidden = selectedGoals.size > 0;
    });
  });
  function fillFormFromSnapshot(snapshot) {
    if (!snapshot || !snapshot.input) return;
    $("#fullName").value = snapshot.input.name || "";
    $("#dob").value = snapshot.input.dob || "";
    $("#mobile").value = snapshot.input.mobile || "";
    $("#vehicle").value = snapshot.input.vehicle || "";
    $("#entrance").value = snapshot.input.entrance || "unsure";
    $("#kitchen").value = snapshot.input.kitchen || "unsure";
    $("#bedroom").value = snapshot.input.bedroom || "unsure";
    $("#toilet").value = snapshot.input.toilet || "unsure";
    $("#study").value = snapshot.input.study || "unsure";
    $("#staircase").value = snapshot.input.staircase || "unsure";
    $("#plotShape").value = snapshot.input.plotShape || "unsure";
    $("#watchType").value = snapshot.input.watchType || "none";
    $("#gender").value = snapshot.input.gender || "";
    $("#birthTime").value = snapshot.input.birthTime || "";
    $("#birthPlace").value = snapshot.input.birthPlace || "";
    $("#brand").value = snapshot.input.brand || "";
    $("#partnerName").value = snapshot.input.partnerName || "";
    $("#partnerDob").value = snapshot.input.partnerDob || "";
    syncGoalChips(snapshot.input.goals || []);
  }

  /* ---------------- validation ---------------- */
  function setErr(id, on) {
    $("#err-" + id).hidden = !on;
    $("#" + id).classList.toggle("error", on);
  }
  function validate() {
    let ok = true, first = null;
    const name = $("#fullName").value.trim();
    const badName = name.length < 2 || !/[a-zA-Z]/.test(name);
    setErr("fullName", badName); if (badName) { ok = false; first = first || $("#fullName"); }

    const dob = $("#dob").value;
    const badDob = !dob || isNaN(new Date(dob).getTime()) || new Date(dob) > new Date();
    setErr("dob", badDob); if (badDob) { ok = false; first = first || $("#dob"); }

    const mob = $("#mobile").value.replace(/\D/g, "");
    const badMob = mob.length < 8;
    setErr("mobile", badMob); if (badMob) { ok = false; first = first || $("#mobile"); }

    const badGoals = selectedGoals.size === 0;
    $("#err-goals").hidden = !badGoals; if (badGoals) ok = false;

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

    // Name-based Loshu grid (Chaldean letter values 1–8; no 9 in Chaldean),
    // and the combined grid (birth digits + name values).
    const nameCounts = {};
    for (let i = 1; i <= 9; i++) nameCounts[i] = 0;
    input.name.toUpperCase().split("").forEach((ch) => { const v = DB.chaldean[ch]; if (v) nameCounts[v]++; });
    const combinedCounts = {};
    for (let i = 1; i <= 9; i++) combinedCounts[i] = counts[i] + nameCounts[i];

    // Mobile
    const mobCompound = digitSum(input.mobile);
    const mobNum = reduce(mobCompound);
    const mobRelD = relation(driver, mobNum);
    const mobRelC = relation(conductor, mobNum);

    // Severity tiers for missing numbers: a number missing from the grid but
    // echoed by the name or mobile vibration is "partially supported"; one
    // missing everywhere is "critical".
    const missingSeverity = missing.map((n) => {
      const echoedBy = [];
      if (nameNum === n) echoedBy.push("name number");
      if (mobNum === n) echoedBy.push("mobile number");
      return { n, critical: echoedBy.length === 0, echoedBy };
    });
    const kua = kuaNumber(input.gender, y);

    // Vedic precision tiers (numerology stays the primary engine):
    //   Tier 1 = date-of-birth only — Vedic Sun Sign (Surya Rashi), sidereal/Lahiri.
    //   Tier 2 = birth time + place — prepares Chandra Rashi, Nakshatra & transit
    //            precision for a future update (stored on-device only).
    const birthTimeRaw = String(input.birthTime || "").trim();
    const birthPlaceRaw = String(input.birthPlace || "").trim();
    const hasBirthTime = !!birthTimeRaw;
    const hasBirthPlace = !!birthPlaceRaw;
    const vedicTier = hasBirthTime && hasBirthPlace ? 2 : (hasBirthTime || hasBirthPlace) ? "partial" : 1;

    // Astro-Identity Snapshot (Tier 2): in-browser Vedic ephemeris via the
    // self-contained Meeus port in astro.js (no external libraries).
    // Full chart when time + place resolve; otherwise the date-only Sun
    // (Surya Rashi) + unlock prompt.
    const astro = (typeof window !== "undefined" && window.NVAstro)
      ? window.NVAstro.compute({ dob: input.dob, time: birthTimeRaw, place: birthPlaceRaw })
      : { ok: false, reason: "engine-missing" };

    return {
      ...input, day: d, month: m, year: y,
      driver, conductor, counts, missing, repeated, weak,
      nameCompound, nameNum, nameRelD, nameRelC,
      nameCounts, combinedCounts,
      mobCompound, mobNum, mobRelD, mobRelC,
      missingSeverity, kua,
      zodiac: zodiacSignSidereal(d, m),
      zodiacTropical: zodiacSign(d, m),
      birthTime: birthTimeRaw,
      birthPlace: birthPlaceRaw,
      birthTimeDisplay: formatBirthTime(birthTimeRaw),
      vedicTier,
      astro
    };
  }

  /* -------- sound-preserving spelling transforms (shared) --------
     Generates candidate respellings of a name that preserve pronunciation:
       double a letter (Tripti -> Triptii), swap a homophone (Sunil -> Suniel),
       or insert a vowel (Suniel style). Never drops letters.
     Returns [{ text, change, compound, reduced, kind, delta }]. */
  function spellingCandidates(name, baseCompound) {
    const up = name.toUpperCase();
    const S = DB.spelling;
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
      const v = DB.chaldean[ch];
      if (!v) return; // skip spaces / non-letters
      if ("BCDFGHJKLMNPQRSTVWXYZ".includes(ch) || S.vowelDoubles[ch]) {
        const t = name.slice(0, i) + name[i] + name.slice(i);
        addCand(t, `double "${name[i]}"`, "double", 0);
      }
      (S.homophones[ch] || []).forEach((rep) => {
        const t = name.slice(0, i) + keepCase(i, rep) + name.slice(i + 1);
        addCand(t, `${name[i]} → ${rep}`, "swap", 1);
      });
      if (i > 0 && up[i - 1] !== " ") {
        S.insertVowels.forEach((vowel) => {
          const t = name.slice(0, i + 1) + keepCase(i, vowel) + name.slice(i + 1);
          addCand(t, `insert "${vowel}" after "${name[i]}"`, "insert", 2);
        });
      }
    });
    return candidates;
  }

  /* -------- name spelling suggestions --------
     Two correction goals, in priority order:
       A) compensate a MISSING Loshu number (practitioner style — e.g.
          Meher Afrose, missing 6 -> "MMeher Afrose", total 51 -> 6)
       B) align with numbers harmonious to Driver & Conductor
     All transforms preserve pronunciation (Bollywood style: Tripti ->
     Triptii, Sunil -> Suniel, Kumar -> Kumarr) — never letter drops. */
  function nameSuggestions(p) {
    if (p.nameRelD !== "enemy" && p.nameRelC !== "enemy") return { needed: false, verdict: p.nameRelD === "neutral" || p.nameRelC === "neutral" ? "neutral" : "friendly" };

    // ---- target numbers ----
    // A) missing grid numbers, best first: friendly-to-both > enemy-to-one > enemy-to-both
    const missingRanked = p.missing.slice().sort((a, b) => {
      const score = (n) => {
        const rd = relation(p.driver, n), rc = relation(p.conductor, n);
        if (rd === "friendly" && rc === "friendly") return 0;
        if (rd !== "enemy" || rc !== "enemy") return 1;
        return 2;
      };
      return score(a) - score(b);
    }).map((n) => ({ n, why: `compensates your missing number ${n} (${DB.numbers[n].planet})` }));
    // B) harmonious numbers not already covered
    const harm = [];
    for (let n = 1; n <= 9; n++) {
      const rd = relation(p.driver, n), rc = relation(p.conductor, n);
      if (rd !== "enemy" && rc !== "enemy" && !p.missing.includes(n)) {
        harm.push({ n, why: rd === "friendly" && rc === "friendly"
          ? `harmonious with both Driver ${p.driver} and Conductor ${p.conductor}`
          : `acceptable to Driver ${p.driver} and Conductor ${p.conductor}` });
      }
    }
    const targets = missingRanked.concat(harm);
    if (!targets.length) return { needed: true, verdict: "enemy", variants: [], targets: [] };

    // ---- candidate transforms (sound-preserving only) ----
    const candidates = spellingCandidates(p.name, p.nameCompound);

    // ---- pick best candidates per target ----
    const kindRank = { double: 0, swap: 1, insert: 2 };
    const variants = [];
    targets.forEach((t) => {
      const hits = candidates
        .filter((c) => c.reduced === t.n)
        .sort((a, b) => kindRank[a.kind] - kindRank[b.kind] || a.delta - b.delta);
      hits.slice(0, 2).forEach((c) => variants.push({ ...c, why: t.why, targetN: t.n }));
    });
    // de-dupe by spelling, keep target priority order
    const finalSeen = new Set();
    const out = [];
    variants.forEach((v) => {
      const k = v.text.toUpperCase();
      if (finalSeen.has(k)) return;
      finalSeen.add(k); out.push(v);
    });
    return { needed: true, verdict: "enemy", variants: out.slice(0, 6), targets: targets.map((t) => t.n) };
  }

  /* -------- business / brand name analysis --------
     Same Chaldean engine, framed for business success. Computes the brand's
     compound number, reduced root, relationship to the owner's Driver &
     Conductor, and (when conflicting) sound-preserving spelling corrections. */
  function brandAnalysis(brand, p) {
    const total = chaldeanValue(brand);
    const root = reduce(total);
    const relD = relation(p.driver, root);
    const relC = relation(p.conductor, root);
    const conflicting = relD === "enemy" || relC === "enemy";

    // auspicious business roots: not-enemy to both Driver & Conductor
    const auspicious = [];
    for (let n = 1; n <= 9; n++) {
      if (relation(p.driver, n) !== "enemy" && relation(p.conductor, n) !== "enemy") auspicious.push(n);
    }

    let suggestions = [];
    if (conflicting) {
      const candidates = spellingCandidates(brand, total);
      const kindRank = { double: 0, swap: 1, insert: 2 };
      suggestions = candidates
        .filter((c) => auspicious.includes(c.reduced))
        .sort((a, b) => kindRank[a.kind] - kindRank[b.kind] || a.delta - b.delta)
        .slice(0, 6)
        .map((c) => ({ ...c, why: `brand number ${c.reduced} is friendly to your Driver ${p.driver} and Conductor ${p.conductor}` }));
    }

    return {
      brand, total, root, relD, relC, conflicting, auspicious,
      suggestions,
      master: masterNumber(total),
      compound: compoundMeaning(total)
    };
  }

  /* -------- mobile number suggestion -------- */
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

  /* -------- compatibility (two-person Driver/Conductor match) --------
     Compares all four Driver/Conductor cross-pairs using the friendship table.
     Score: friendly = 2, neutral = 1, enemy = 0 (max 8). */
  function compatibility(a, b) {
    const pairs = [
      { a: `Your Driver ${a.driver}`, b: `their Driver ${b.driver}`, r: relation(a.driver, b.driver) },
      { a: `Your Driver ${a.driver}`, b: `their Conductor ${b.conductor}`, r: relation(a.driver, b.conductor) },
      { a: `Your Conductor ${a.conductor}`, b: `their Driver ${b.driver}`, r: relation(a.conductor, b.driver) },
      { a: `Your Conductor ${a.conductor}`, b: `their Conductor ${b.conductor}`, r: relation(a.conductor, b.conductor) }
    ];
    const score = pairs.reduce((s, p) => s + (p.r === "friendly" ? 2 : p.r === "neutral" ? 1 : 0), 0);
    const friendly = pairs.filter((p) => p.r === "friendly").length;
    const neutral = pairs.filter((p) => p.r === "neutral").length;
    const enemy = pairs.filter((p) => p.r === "enemy").length;
    const verdict = score >= 7 ? "Strong" : score >= 5 ? "Good" : score >= 3 ? "Workable" : "Challenging";
    return { pairs, score, max: 8, verdict, friendly, neutral, enemy };
  }

  /* -------- vehicle number analysis -------- */
  function vehicleAnalysis(p) {
    // good totals: friendly to both driver & conductor; fallback not-enemy to either
    const bothGood = [], okTotals = [];
    for (let t = 4; t <= 45; t++) {
      const r = reduce(t);
      const rd = relation(p.driver, r), rc = relation(p.conductor, r);
      if (rd === "friendly" && rc === "friendly") bothGood.push(t);
      else if (rd !== "enemy" && rc !== "enemy") okTotals.push(t);
    }
    const goodTotals = bothGood.length ? bothGood : okTotals;
    // lucky vehicle colours: friendly planets' colours
    const luckyPlanetNums = [p.driver, p.conductor].filter((n, i, a) => a.indexOf(n) === i);
    const luckyColors = luckyPlanetNums.map((n) => DB.numbers[n].color.split(",")[0] + " (" + DB.numbers[n].planet.split(" ")[0] + ")");

    if (!p.vehicle) return { provided: false, goodTotals: goodTotals.slice(0, 8), luckyColors };

    // letters carry Chaldean values, digits carry face value
    const letters = p.vehicle.replace(/[^a-zA-Z]/g, "");
    const digits = p.vehicle.replace(/\D/g, "");
    const letterVal = chaldeanValue(letters);
    const digitVal = digitSum(digits);
    const total = letterVal + digitVal;
    const num = reduce(total);
    const relD = relation(p.driver, num), relC = relation(p.conductor, num);
    return {
      provided: true, raw: p.vehicle.toUpperCase(),
      letters: letters.toUpperCase(), letterVal, digitVal, total, num,
      relD, relC,
      conflicting: relD === "enemy" || relC === "enemy",
      goodTotals: goodTotals.slice(0, 8), luckyColors
    };
  }

  /* -------- timing: personal years, lucky years, milestone ages -------- */
  function timingAnalysis(p) {
    const now = new Date();
    const cy = now.getFullYear();
    const personalYearNum = (yr) => reduce(p.day + p.month + reduce(yr));

    // current + next 3 personal years
    const years = [0, 1, 2, 3].map((off) => {
      const yr = cy + off;
      const n = personalYearNum(yr);
      return { yr, n, meaning: DB.personalYear[n], current: off === 0 };
    });

    // lucky calendar years (next 12): year vibration friendly to driver,
    // or personal year matching driver/conductor/friendly
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

    // milestone ages (next 25 years of life): age reduces to driver,
    // conductor, or a number friendly to both
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

  /* -------- watch remedy spec -------- */
  function watchSpec(p) {
    const d = p.driver, c = p.conductor;
    const rows = [
      ["Metal / Case", DB.watch.metal[d], `Supports Driver ${d} (${DB.numbers[d].planet})`],
      ["Dial Colour", DB.watch.dial[d], `Calms and strengthens the ${DB.numbers[d].planet} mind`],
      ["Case Geometry", DB.watch.geometry[c], `Mirrors Conductor ${c} (${DB.numbers[c].planet}) structure`],
      ["Strap", DB.watch.strap[d], "Metal grounds energy; avoid rubber/silicone"],
      ["Key Features", DB.watch.features[c], `Conductor ${c} execution support`],
    ];
    const avoids = [DB.watch.avoid[d], DB.watch.avoid[c]].filter(Boolean);
    const days = [...new Set([DAY_OF[d], DAY_OF[c]])];
    return {
      rows, avoids, days,
      time: "between 6:30 AM and 8:30 AM (sunrise hours)",
      currentVerdict: currentWatchVerdict(p)
    };
  }
  function currentWatchVerdict(p) {
    const t = p.watchType;
    if (!t || t === "none") return null;
    if (t === "smart") {
      const sensitive = [2, 7].includes(p.driver) || [2, 7].includes(p.conductor);
      return sensitive
        ? { tone: "warn", text: `Your smartwatch runs on Rahu (4) energy — constant wrist notifications can disturb your ${DB.numbers[p.driver].planet} driver. If you keep it: switch to a metallic strap, use a minimal ${p.driver === 2 ? "silver/white" : "calm"} watch-face, and enable Do-Not-Disturb during sleep and deep work.` }
        : { tone: "info", text: "A smartwatch is acceptable for your chart — keep notifications curated and prefer a metallic strap to ground the Rahu (4) electronic energy." };
    }
    if (t === "digital") return { tone: "info", text: "A digital watch is neutral. Upgrading to a metal-strap analog aligned with the spec above would add planetary support." };
    return { tone: "good", text: "A classic analog watch suits your chart. Match the metal, dial colour and geometry to the spec above for full alignment." };
  }

  /* -------- vastu evaluation -------- */
  function vastuReport(p) {
    const findings = [];
    if (p.entrance && p.entrance !== "unsure") {
      const e = DB.vastu.entrance[p.entrance];
      findings.push({
        item: `Main entrance — ${dirLabel(p.entrance)}`,
        tone: e.score === "Excellent" || e.score === "Good" ? "good" : e.score === "Moderate" ? "warn" : "bad",
        label: e.score, note: e.note
      });
    }
    const roomMap = { kitchen: "Kitchen", bedroom: "Master Bedroom", toilet: "Toilet", study: "Study Room", staircase: "Staircase" };
    Object.entries(roomMap).forEach(([key, roomName]) => {
      const dir = p[key];
      if (!dir || dir === "unsure") return;
      const rule = DB.vastu.roomRules.find((r) => r.room === roomName);
      if (!rule) return;
      const status = rule.ideal.includes(dir) ? "ideal" : rule.acceptable.includes(dir) ? "ok" : "dosh";
      findings.push({
        item: `${roomName} — ${dirLabel(dir)}`,
        tone: status === "ideal" ? "good" : status === "ok" ? "warn" : "bad",
        label: status === "ideal" ? "Ideal" : status === "ok" ? "Acceptable" : "Dosh",
        note: status === "dosh" ? rule.doshText.replace("{dir}", dirLabel(dir)) + " " + rule.fix : status === "ok" ? "Acceptable placement. " + rule.fix : "Well placed — supports balanced energy."
      });
    });
    // Plot shape (missing corners / extensions)
    if (p.plotShape && p.plotShape !== "unsure" && DB.vastu.plotShapes[p.plotShape]) {
      const ps = DB.vastu.plotShapes[p.plotShape];
      findings.push({
        item: `Plot shape — ${p.plotShape.replace(/-/g, " ")}`,
        tone: ps.tone,
        label: ps.tone === "good" ? "Balanced" : ps.tone === "warn" ? "Caution" : "Dosh",
        note: ps.note
      });
    }
    return findings;
  }

  /* -------- goal-wise remedy plan -------- */
  function goalPlan(p) {
    return p.goals.map((g) => {
      const nums = DB.goals[g] || [];
      const weak = nums.filter((n) => p.missing.includes(n));
      const strong = nums.filter((n) => !p.missing.includes(n));
      const focus = weak.length ? weak : nums.slice(0, 2); // if nothing missing, maintain key planets
      return { goal: g, weak, strong, focus: focus.map((n) => ({ n, ...DB.numbers[n] })) };
    });
  }

  /* -------- priority action plan -------- */
  function priorityPlan(p, nameSug, mobSug, vastu) {
    const items = [];
    const weakGoalNums = new Set();
    p.goals.forEach((g) => (DB.goals[g] || []).forEach((n) => { if (p.missing.includes(n)) weakGoalNums.add(n); }));
    weakGoalNums.forEach((n) => {
      const info = DB.numbers[n];
      items.push(`Strengthen <strong>${info.planet}</strong> (missing ${n} in your grid): chant <span class="mantra">${esc(info.mantra)}</span> ${esc(info.mantraCount)}, wear ${esc(info.color.split(",")[0])} on ${esc(info.day)}, and consider ${esc(info.crystal)}.`);
    });
    if (nameSug.needed && nameSug.variants && nameSug.variants.length) {
      items.push(`Correct your name spelling — try <strong>${esc(nameSug.variants[0].text)}</strong> (${nameSug.variants[0].compound} → ${nameSug.variants[0].reduced}) to align with your birth numbers.`);
    }
    if (mobSug.needed) {
      items.push(`Plan a mobile-number change — choose a number whose digits total <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong> for harmony with Driver ${p.driver} and Conductor ${p.conductor}.`);
    }
    items.push(`Wear the aligned watch spec (metal, dial, geometry as per Section ${SECTION.watch}) — activate it on <strong>${DAY_OF[p.driver]}</strong> morning, 6:30–8:30 AM.`);
    vastu.filter((f) => f.tone === "bad").slice(0, 2).forEach((f) => {
      items.push(`Vastu correction: <strong>${esc(f.item)}</strong> — apply the remedy listed in Section ${SECTION.vastu}.`);
    });
    const day2 = DAY_OF[p.conductor];
    items.push(`Weekly rhythm: observe your Driver day (<strong>${DAY_OF[p.driver]}</strong>) and Conductor day (<strong>${day2}</strong>) remedies — charity, colours and fasting as listed.`);
    return items.slice(0, 7);
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

  function northstarSummary(p, timing, goals, priorities, vastu, nameSug, mobSug) {
    const driverInfo = DB.numbers[p.driver];
    const conductorInfo = DB.numbers[p.conductor];
    const currentYear = timing.years[0];
    const criticalMissing = (p.missingSeverity || []).filter((m) => m.critical).map((m) => m.n);
    const missingFocus = criticalMissing.length ? criticalMissing : p.missing.slice(0, 3);
    const goalNames = p.goals.length ? p.goals : ["overall growth"];
    const doshCount = vastu.filter((f) => f.tone === "bad").length;
    const firstGoal = goals[0];
    const firstGoalFocus = firstGoal && firstGoal.focus && firstGoal.focus.length
      ? firstGoal.focus.map((f) => `${f.n} (${f.planet})`).join(", ")
      : `${p.driver} (${driverInfo.planet}) and ${p.conductor} (${conductorInfo.planet})`;
    const nameLine = nameSug.needed && nameSug.variants && nameSug.variants.length
      ? `Name correction is a high-leverage identity action: test <strong>${esc(nameSug.variants[0].text)}</strong> for 40 days before making legal changes.`
      : "Your current name vibration is workable; focus first on consistency, remedies and environment.";
    const mobileLine = mobSug.needed
      ? `Your mobile vibration can be improved; prefer future totals <strong>${mobSug.goodTotals.slice(0, 3).join(", ")}</strong>.`
      : "Your mobile vibration is not the first bottleneck; keep attention on the priority practices below.";
    const vastuLine = doshCount
      ? `${doshCount} Vastu correction${doshCount === 1 ? "" : "s"} need attention; handle the most-used zones first.`
      : "No major Vastu dosh dominates the inputs given; keep Brahmasthan clean and northeast light active.";
    const actionItems = priorities.slice(0, 5).map((item, idx) => `<li><span class="summary-step">${idx + 1}</span><span>${item}</span></li>`).join("");

    return {
      headline: `${esc(firstNameOf(p.name))}, your northstar is disciplined ${esc(goalNames.join(" + ").toLowerCase())} growth through ${esc(driverInfo.planet.split(" ")[0])} clarity and ${esc(conductorInfo.planet.split(" ")[0])} execution.`,
      story: `Your Driver ${p.driver} (${esc(driverInfo.planet)}) shapes how you think and respond each day, while Conductor ${p.conductor} (${esc(conductorInfo.planet)}) shows the destiny path that gives lasting results. In simple terms: lead with ${esc(driverInfo.traits.split(",")[0].toLowerCase())}, but build systems that satisfy ${esc(conductorInfo.traits.split(",")[0].toLowerCase())}. ${missingFocus.length ? `The main leaks to plug are missing number${missingFocus.length > 1 ? "s" : ""} <strong>${missingFocus.join(", ")}</strong>; these become the first remedy targets because they affect your selected focus areas.` : "Your birth grid has no missing numbers, so the path is about refinement rather than repair."}`,
      cards: [
        { label: "Primary direction", value: `Focus on ${esc(goalNames.join(", "))}`, note: `Use Driver ${p.driver} for daily decisions and Conductor ${p.conductor} for long-term commitments.` },
        { label: "This year", value: currentYear ? `Personal Year ${currentYear.n}` : "Timing check", note: currentYear ? esc(currentYear.meaning) : "Use the timing section before major moves." },
        { label: "Remedy focus", value: esc(firstGoalFocus), note: firstGoal && firstGoal.weak.length ? `These numbers block ${esc(firstGoal.goal.toLowerCase())} when unsupported.` : "Maintain these energies through colour, mantra and weekly rhythm." },
        { label: "Environment", value: doshCount ? `${doshCount} Vastu dosh${doshCount === 1 ? "" : "es"}` : "Vastu maintenance", note: esc(plainText(vastuLine)) }
      ],
      checks: [nameLine, mobileLine, vastuLine],
      actionItems
    };
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
      goals: input.goals,
      personalYear: timing.years[0] ? timing.years[0].n : null,
      input: Object.assign({}, input)
    };
    state.activeProfileKey = snapshot.key;
    state.history = [snapshot].concat(state.history).slice(0, 24);
    writeStore(STORAGE_KEYS.history, state.history);
    updateMemoryUI();
    return snapshot;
  }
  function readPracticeStore() {
    return readStore(STORAGE_KEYS.practice, {});
  }
  function writePracticeStore(store) {
    writeStore(STORAGE_KEYS.practice, store);
  }
  function readJournalStore() {
    return readStore(STORAGE_KEYS.journal, {});
  }
  function writeJournalStore(store) {
    writeStore(STORAGE_KEYS.journal, store);
  }
  function logPractice(profileKey, number) {
    const store = readPracticeStore();
    const current = store[profileKey] || [];
    current.unshift({ number, at: isoDate() });
    store[profileKey] = current.slice(0, 120);
    writePracticeStore(store);
  }
  function addJournalEntry(profileKey, text) {
    const store = readJournalStore();
    const current = store[profileKey] || [];
    current.unshift({ text: text.trim(), at: isoDate() });
    store[profileKey] = current.slice(0, 40);
    writeJournalStore(store);
  }
  function contributionPayload(profile, timing) {
    const counts = {};
    profile.missing.forEach((n) => { counts[n] = (counts[n] || 0) + 1; });
    return {
      schemaVersion: 1,
      packVersion: activePack().packVersion,
      createdAt: isoDate(),
      driver: profile.driver,
      conductor: profile.conductor,
      zodiac: profile.zodiac,
      goals: profile.goals,
      missingCounts: counts,
      hasVehicle: !!profile.vehicle,
      hasBrand: !!profile.brand,
      hasPartner: !!(profile.partnerName && profile.partnerDob),
      currentPersonalYear: timing.years[0] ? timing.years[0].n : null
    };
  }
  function queueAnonymousContribution(profile, timing) {
    if (!state.contributionEnabled) return;
    const pack = activePack();
    const payload = contributionPayload(profile, timing);
    if (pack.contribution && pack.contribution.endpoint) {
      try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) navigator.sendBeacon(pack.contribution.endpoint, new Blob([body], { type: "application/json" }));
        else if (window.fetch) window.fetch(pack.contribution.endpoint, { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
      } catch {
        // ignore transport failures; analytics must never block UX
      }
      return;
    }
    const outbox = readStore(STORAGE_KEYS.contributionOutbox, []);
    outbox.unshift(payload);
    writeStore(STORAGE_KEYS.contributionOutbox, outbox.slice(0, 20));
  }
  function evolvingChartData(profile, timing) {
    const key = state.activeProfileKey || profileKeyOf(profile);
    const snapshots = state.history.filter((entry) => entry.key === key);
    const practice = readPracticeStore()[key] || [];
    const journal = readJournalStore()[key] || [];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisYear = String(new Date().getFullYear());
    const focusNumbers = Array.from(new Set([].concat(profile.missing.slice(0, 2), [profile.driver, profile.conductor]))).slice(0, 4);
    const practiceSummary = focusNumbers.map((n) => {
      const total = practice.filter((entry) => entry.number === n).length;
      const month = practice.filter((entry) => entry.number === n && String(entry.at).slice(0, 7) === thisMonth).length;
      return { n, total, month };
    });
    const currentYearLucky = timing.luckyYears.some((entry) => entry.yr === new Date().getFullYear());
    const movesThisYear = journal.filter((entry) => String(entry.at).slice(0, 4) === thisYear).length;
    return {
      key,
      snapshots,
      practiceSummary,
      journal: journal.slice(0, 4),
      currentYearLucky,
      movesThisYear,
      previewPayload: contributionPayload(profile, timing)
    };
  }

  /* ---------------- rendering ---------------- */
  const numCard = (label, num, sub) => {
    const info = DB.numbers[num];
    return `<div class="card num-card">
      <div class="num-value">${num}</div>
      <div class="num-label">${esc(label)}</div>
      <div class="num-planet">${esc(info.planet)}</div>
      <div class="num-traits">${esc(sub || info.traits)}</div>
    </div>`;
  };

  /* ---- Cross-system harmony note (zodiac ruler vs Lo Shu grid) ----
     The Vedic Sun sign's ruling number is compared with the birth Lo Shu
     grid: a ruler missing from the grid is an important overlap (both
     systems flag the same gap), while a ruler that is the Driver/
     Conductor or repeated in the grid is a reinforcing overlap. */
  function zodiacHarmonyNote(p, z) {
    const ruler = z.ruler;
    const num = DB.numbers[ruler];
    const planetName = num.planet;
    const crystal = z.crystals && z.crystals[0] ? z.crystals[0] : "sign crystal";
    const missingIt = p.missing.includes(ruler);
    const repeatedIt = p.repeated.includes(ruler);
    const isDriver = p.driver === ruler;
    const isConductor = p.conductor === ruler;

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

  /* ---- Astro-Identity Snapshot card (in-browser Vedic ephemeris) ----
     Tier 2 (birth time + recognised birthplace) → full chart: sidereal Sun,
     Moon + Nakshatra/pada, Lagna and Midheaven. Date-only → sidereal Sun
     with the unlock prompt. All values are computed locally. */
  const pad2n = (n) => String(n).padStart(2, "0");
  function fmtAy(deg) {
    const d = Math.floor(deg), m = Math.round((deg - d) * 60);
    return `${d}°${pad2n(m)}′`;
  }
  function fmtTz(tz) {
    const sign = tz < 0 ? "-" : "+";
    const abs = Math.abs(tz);
    return `UTC${sign}${Math.floor(abs)}:${pad2n(Math.round((abs % 1) * 60))}`;
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
    // reduced card: date-only Sun + unlock prompt
    const need = [];
    if (!p.birthTime) need.push("<strong>exact birth time</strong>");
    if (!p.birthPlace) need.push("<strong>birth city / place</strong>");
    let unlockText;
    if (a.placeUnmatched) {
      unlockText = `We couldn't match <strong>“${esc(p.birthPlace)}”</strong> to the built-in atlas (${(window.NVAstro && window.NVAstro.cityNames().length) || 400}+ cities, fully offline). Try “City, State” — e.g. <strong>Faridabad, India</strong> — or enter coordinates like <strong>“28.41, 77.32”</strong> (add a third number to override the time zone, e.g. “40.71, -74.01, -5”).`;
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

  /* ---- Tier 2 progressive-disclosure card (Chandra Rashi / Nakshatra / Lagna) ---- */
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

  function renderGridCells(counts) {
    return DB.loshuLayout.flat().map((n) => {
      const c = counts[n] || 0;
      const cls = c === 0 ? "missing" : c >= 3 ? "present multi" : "present";
      const digits = c > 0 ? Array(c).fill(n).map((x) => `<span>${x}</span>`).join("") : `<span>${n}</span>`;
      return `<div class="loshu-cell ${cls}" title="${n} — ${esc(DB.numbers[n].planet)}: ${c} occurrence(s)">
        <div class="digits">${digits}</div>
        ${c > 0 ? `<div class="cnt">${DB.numbers[n].planet.split(" ")[0]}</div>` : ""}
      </div>`;
    }).join("");
  }

  function renderLoshu(p) {
    const cells = renderGridCells(p.counts);

    /* 8 fully-analysed plane cards */
    const planeCards = DB.planes.map((pl) => {
      const present = pl.cells.filter((n) => p.counts[n] > 0);
      const absent = pl.cells.filter((n) => p.counts[n] === 0);
      const chips = pl.cells.map((n) => `<span class="plane-chip ${p.counts[n] > 0 ? "on" : "off"}">${n}</span>`).join("");
      const badge = present.length === 3 ? '<span class="badge good">Active</span>'
        : present.length === 2 ? '<span class="badge warn">Partial</span>'
        : '<span class="badge bad">Weak</span>';
      let title, reading;
      if (present.length === 3) {
        title = `Complete ${pl.name}`;
        reading = `You have the full ${pl.name.toLowerCase()} — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} work together. ${pl.complete}`;
      } else if (present.length === 0) {
        title = `${pl.name} — Fully Missing`;
        reading = `All three energies of this plane — ${pl.cells.map((n) => pl.roles[n].label).join(", ")} — need deliberate support. ${absent.map((n) => pl.roles[n].fix[0].toUpperCase() + pl.roles[n].fix.slice(1)).join("; ")}.`;
      } else {
        const presTxt = present.map((n) => pl.roles[n].label).join(" and ");
        const absTxt = absent.map((n) => pl.roles[n].label).join(" and ");
        title = present.length === 1
          ? `${pl.name} — Only ${pl.roles[present[0]].short}`
          : `${pl.name} — Without ${absent.map((n) => pl.roles[n].short).join(" & ")}`;
        const cons = absent.map((n) => pl.roles[n].con).join("; ");
        const fixes = absent.map((n) => pl.roles[n].fix).join("; ");
        reading = `You have ${presTxt} in your ${pl.name.toLowerCase()}, but ${absTxt} ${absent.length > 1 ? "are" : "is"} weaker here. This can show up as ${cons}. Your remedy: ${fixes}.`;
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
        ? (sev.critical ? '<span class="badge bad">Critical</span>' : `<span class="badge warn">Echoed by ${sev.echoedBy.join(", ")}</span>`)
        : "";
      return `
      <div class="kit-row">
        <div class="kit-ico"><strong>${n}</strong></div>
        <div class="kit-body">
          <div class="kit-label">${esc(DB.numbers[n].planet)} — weak / missing ${badge}</div>
          <div class="kit-value">${esc(DB.missingFix[n])}</div>
        </div>
      </div>`;
    }).join("");

    const arrowCards = DB.arrows.map((ar) => {
      const present = ar.line.filter((n) => p.counts[n] > 0).length;
      const state = present === 3 ? "strong" : present === 0 ? "missing" : "partial";
      const badge = state === "strong" ? '<span class="badge good">Strong</span>'
        : state === "partial" ? '<span class="badge warn">Partial</span>'
        : '<span class="badge bad">Frustrated</span>';
      const chips = ar.line.map((n) => `<span class="plane-chip ${p.counts[n] > 0 ? "on" : "off"}">${n}</span>`).join("");
      const reading = state === "strong" ? ar.present : (state === "partial" ? `Only partially present — the full line is not formed. ${ar.missing}` : ar.missing);
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

    return `
    <section class="rsection" id="loshu-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.loshu}</span>Your Loshu Grid — the 8 Planes, Fully Analysed</h2>
      <div class="card">
        <div class="card-title">What is the Loshu Grid?</div>
        <div class="kit-value">A 3×3 grid that maps which energies are present, weak, or missing in your birth. Every number from 1 to 9 sits in a fixed cell. When we plot the digits of your date of birth (along with your Mulank and Bhagyank) onto that grid, each row, column, and diagonal becomes a <strong>plane</strong> — an energy line that tells us something specific about your mind, emotions, will, and material life. Below, each of the 8 planes is interpreted based on exactly which of its required numbers you have.</div>
      </div>
      <div class="loshu-wrap">
        <div>
          <div class="loshu-grid" role="img" aria-label="Loshu grid visualization">${cells}</div>
          <div class="loshu-legend" style="margin-top:8px">
            <span><i class="dot g"></i>Present</span>
            <span><i class="dot y"></i>Repeated (excess)</span>
            <span><i class="dot w"></i>Missing (weak)</span>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Your Numbers at a Glance</div>
          <div class="kit-value"><span class="badge good">Present</span> ${Object.keys(p.counts).filter((k) => p.counts[k] > 0).join(", ")}</div>
          ${p.weak.length ? `<div class="kit-value"><span class="badge warn">Weak</span> ${p.weak.join(", ")} <span class="card-sub">— appears only once, so it needs light support.</span></div>` : ""}
          <div class="kit-value"><span class="badge bad">Missing</span> ${p.missing.length ? p.missing.join(", ") : "none — complete grid"}</div>
          <div class="card-sub">Green cells are present in your chart. Empty cells are missing energies — they mark the planets that need strengthening.</div>
        </div>
      </div>
      <div class="plane-cards">${planeCards}</div>
      <div class="card">
        <div class="card-title">The 8 Arrows of Your Loshu Grid</div>
        <div class="card-sub">The classical "arrow" names for each line. An arrow with all three numbers is strong; a fully empty arrow is a frustrated / confused energy to consciously build.</div>
      </div>
      <div class="plane-cards">${arrowCards}</div>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">Name Grid</div>
          <div class="loshu-grid" role="img" aria-label="Name-based Loshu grid">${renderGridCells(p.nameCounts)}</div>
          <div class="card-sub">The Chaldean values of your name's letters, plotted the same way. Note: the Chaldean system has no value 9, so that cell stays empty in the name grid.</div>
        </div>
        <div class="card">
          <div class="card-title">Combined Grid (DOB + Name)</div>
          <div class="loshu-grid" role="img" aria-label="Combined Loshu grid">${renderGridCells(p.combinedCounts)}</div>
          <div class="card-sub">Birth digits and name values together — the blended energy you project into the world.</div>
        </div>
      </div>
      ${p.missing.length ? `<div class="card"><div class="card-title">Missing Numbers — Quick Balancers</div><div class="kit">${missingFixes}</div></div>` : `<div class="card"><div class="kit-value"><span class="badge good">Complete grid</span> All nine numbers are present — a rare, well-balanced chart. Maintain your planets with the weekly rhythm in your Priority Plan.</div></div>`}
      ${p.repeated.length ? `<p class="rsection-desc">Repeated 3+ times: <strong>${p.repeated.join(", ")}</strong> — strong energy here; use it, don't let it dominate (e.g. excess 9 → channel Mars into sport, excess 8 → delegate Saturn's workload).</p>` : ""}
    </section>`;
  }

  function kitCard(n, heading) {
    const i = DB.numbers[n];
    const sm = DB.mantraShort[n];
    return `<div class="card">
      <div class="goal-head">
        <div class="num-value" style="width:40px;height:40px;font-size:18px;line-height:40px">${n}</div>
        <div>
          <div class="card-title">${esc(i.planet)}</div>
          <div class="card-sub">${esc(heading || i.traits)}</div>
        </div>
      </div>
      <div class="kit">
        <div class="kit-row"><div class="kit-ico">🕉</div><div class="kit-body"><div class="kit-label">Beej Mantra</div><div class="kit-value"><span class="mantra">${esc(i.mantra)}</span><br>${esc(i.mantraCount)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🙏</div><div class="kit-body"><div class="kit-label">Daily Short Mantra</div><div class="kit-value"><span class="mantra">${esc(sm.dev)}</span> <em>(${esc(sm.pron)})</em><br><span class="card-sub">${esc(sm.meaning)}</span></div></div></div>
        <div class="kit-row"><div class="kit-ico">📝</div><div class="kit-body"><div class="kit-label">Wish-Paper Affirmation</div><div class="kit-value">“${esc(sm.affirmation)}”<br><span class="card-sub">Write this on your wish paper 11 times daily, then keep the paper in your wallet or under your pillow.</span></div></div></div>
        <div class="kit-row"><div class="kit-ico">💎</div><div class="kit-body"><div class="kit-label">Crystal</div><div class="kit-value">${esc(i.crystal)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">📿</div><div class="kit-body"><div class="kit-label">Rudraksha</div><div class="kit-value">${esc(i.rudraksha)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🔱</div><div class="kit-body"><div class="kit-label">Yantra</div><div class="kit-value">${esc(DB.yantra[n])}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🎨</div><div class="kit-body"><div class="kit-label">Colour / Day / Metal</div><div class="kit-value">${esc(i.color)} · ${esc(i.day)} · ${esc(i.metal)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🎁</div><div class="kit-body"><div class="kit-label">Charity</div><div class="kit-value">${esc(i.charity)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🌿</div><div class="kit-body"><div class="kit-label">Lifestyle</div><div class="kit-value">${esc(i.lifestyle)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">🍽</div><div class="kit-body"><div class="kit-label">Fast</div><div class="kit-value">${esc(i.fast)}</div></div></div>
      </div>
    </div>`;
  }

  function renderReport(p) {
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
    const summary = northstarSummary(p, timing, goals, priorities, vastu, nameSug, mobSug);
    const dobStr = `${String(p.day).padStart(2, "0")}/${String(p.month).padStart(2, "0")}/${p.year}`;

    const summarySection = `<section class="rsection summary-section" id="summary-section">
      <div class="summary-shell">
        <p class="summary-kicker">Northstar Summary</p>
        <h2 class="summary-title">${summary.headline}</h2>
        <p class="summary-story">${summary.story}</p>
        <div class="summary-card-grid">
          ${summary.cards.map((card) => `<div class="summary-card"><div class="summary-label">${card.label}</div><div class="summary-value">${card.value}</div><p>${card.note}</p></div>`).join("")}
        </div>
        <div class="summary-next">
          <div>
            <h3>Key action points</h3>
            <ol class="summary-actions">${summary.actionItems}</ol>
          </div>
          <div class="summary-way-forward">
            <h3>Way forward</h3>
            ${summary.checks.map((line) => `<p>${line}</p>`).join("")}
            <p><strong>Use this as your northstar:</strong> do not try every remedy at once. Complete the first 40-day rhythm, then review results in Your Evolving Chart.</p>
          </div>
        </div>
      </div>
    </section>`;

    /* Section 2: core nature — traits, strengths & shadows */
    const td = DB.traits[p.driver], tc = DB.traits[p.conductor];
    const traitsSection = `<section class="rsection" id="traits-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.traits}</span>Your Core Nature — Traits, Strengths &amp; Shadows</h2>
      <div class="card">
        <div class="card-sub" style="text-transform:uppercase;letter-spacing:.05em;font-weight:600">Two numbers shape your nature</div>
        <div class="nature-pair">
          <div class="nature-chip">
            <div class="num-value">${p.driver}</div>
            <div class="num-label">Mulank · ${esc(DB.numbers[p.driver].planet.split(" ")[0])}</div>
          </div>
          <div class="nature-chip">
            <div class="num-value alt">${p.conductor}</div>
            <div class="num-label">Bhagyank · ${esc(DB.numbers[p.conductor].planet.split(" ")[0])}</div>
          </div>
        </div>
        <div class="kit-value">${esc(td.nature)} Beneath the surface, your Bhagyank carries ${esc(tc.innerDrive)}.</div>
        <div class="judge-note"><strong>How we judge this:</strong> Your nature is not read from your Mulank alone. Your <strong>Mulank</strong> (from your birth day) is your visible, day-to-day personality, while your <strong>Bhagyank</strong> (from your full birth date) drives your deeper instincts. We read <strong>both together</strong> for the full picture.</div>
      </div>
      <div class="card-grid two">
        <div class="card strength-card">
          <div class="card-title">Your Strengths — Amplify These</div>
          <div class="kit">${td.strengths.map((s) => `<div class="kit-row"><div class="kit-ico good-ico">✓</div><div class="kit-body"><div class="kit-value">${esc(s)}</div></div></div>`).join("")}</div>
        </div>
        <div class="card shadow-card">
          <div class="card-title">Your Shadows — Watch These</div>
          <div class="kit">${td.shadows.map((s) => `<div class="kit-row"><div class="kit-ico bad-ico">!</div><div class="kit-body"><div class="kit-value">${esc(s)}</div></div></div>`).join("")}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Which Qualities to Adopt, Which to Let Go</div>
        <div class="adopt-release">
          <div class="adopt-col">
            <div class="kit-label" style="color:var(--positive)">Adopt</div>
            ${td.adopt.map((s) => `<div class="ar-item">+ ${esc(s)}</div>`).join("")}
          </div>
          <div class="release-col">
            <div class="kit-label" style="color:var(--danger)">Release</div>
            ${td.release.map((s) => `<div class="ar-item">− ${esc(s)}</div>`).join("")}
          </div>
        </div>
        <div class="judge-note"><strong>How we judge this:</strong> Each Mulank carries a signature set of strengths to <strong>amplify</strong> and tendencies to <strong>release</strong>, shaped by its ruling planet and how that planet tends to over- or under-express in daily life.</div>
      </div>
    </section>`;

    /* Section 4: weak planets */
    const weakNums = p.missing.filter((n) => n !== p.driver && n !== p.conductor);
    const weakSection = p.missing.length
      ? `<section class="rsection" id="remedy-section">
          <h2 class="rsection-title"><span class="idx">${SECTION.weak}</span>Weak Planet Remedy Kits</h2>
          <p class="rsection-desc">Full remedy kits for the planets missing from your grid${weakNums.length !== p.missing.length ? " (your Driver/Conductor planets are inherently supported)" : ""}.</p>
          <div class="card-grid two">${p.missing.slice(0, 4).map((n) => kitCard(n)).join("")}</div>
          ${p.missing.length > 4 ? `<p class="rsection-desc">+ ${p.missing.length - 4} more missing numbers — apply their quick balancers from Section ${SECTION.loshu}.</p>` : ""}
        </section>` : "";

    /* Section 4: zodiac power kit (Tier 1 — Vedic Sun Sign, sidereal/Lahiri,
       with Western tropical reference + cross-system harmony + Tier 2 disclosure) */
    const z = DB.zodiac[p.zodiac];
    const zodiacSection = `<section class="rsection" id="vedic-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.zodiac}</span>Your Vedic Zodiac Power Kit — ${esc(p.zodiac)}</h2>
      <p class="rsection-desc">This is your <strong>Vedic Sun Sign (Surya Rashi)</strong> — the sidereal / Nirayana position using the <strong>Lahiri ayanamsa</strong> (the fixed sky sits ~24° behind the Western tropical zodiac due to precession). Your date of birth alone is enough to compute it, and it stays the primary Vedic reference in this report. Western tropical reference: <strong>${esc(p.zodiacTropical)}</strong> ${p.zodiac !== p.zodiacTropical ? `(your tropical Sun would fall in ${esc(p.zodiacTropical)} — the sidereal sign is usually the one before it; we always follow the Vedic / Lahiri position).` : "(in this case the two systems agree)."} Numerology (Driver, Conductor, Lo Shu Grid) remains the engine of this report — the sign layer tunes which crystals, intentions and affirmations resonate most strongly with you.</p>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">${esc(p.zodiac)} — ${esc(z.element)} sign, ruled by ${esc(DB.numbers[z.ruler].planet)}</div>
          <span class="badge info">Supports intentions: ${esc(z.intentions)}</span>
        </div>
        <div class="kit">
          <div class="kit-row"><div class="kit-ico">💎</div><div class="kit-body"><div class="kit-label">Your Sign's Crystals</div><div class="kit-value">${z.crystals.map(esc).join(" · ")}</div></div></div>
          <div class="kit-row"><div class="kit-ico">🙏</div><div class="kit-body"><div class="kit-label">Sign Mantra</div><div class="kit-value"><span class="mantra">${esc(z.dev)}</span> <em>(${esc(z.pron)})</em><br><span class="card-sub">${esc(z.meaning)} Chant 11 times each morning.</span></div></div></div>
          <div class="kit-row"><div class="kit-ico">📝</div><div class="kit-body"><div class="kit-label">Wish-Paper Affirmation</div><div class="kit-value">“${esc(z.affirmation)}”</div></div></div>
        </div>
      </div>
      ${zodiacHarmonyNote(p, z)}
      ${vedicSnapshotCard(p)}
      ${vedicTierDisclosure(p)}
    </section>`;

    /* Section 5: name */
    const nameVerdictTone = nameSug.verdict === "enemy" || (p.nameRelD === "enemy" || p.nameRelC === "enemy") ? "bad" : nameSug.verdict === "neutral" ? "warn" : "good";
    const nameMaster = masterNumber(p.nameCompound);
    const nameSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.name}</span>Name Analysis &amp; Spelling Correction</h2>
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
            ? `<div class="card-sub"><strong>Recommended spellings</strong> — pronunciation stays the same; letters are doubled, added or swapped for same-sound equivalents (the way Tripti became Triptii and Sunil became Suniel). Priority is given to spellings that fill the missing numbers in your Loshu grid:</div>
               <div class="table-scroll"><table class="rtable">
                 <tr><th>Suggested spelling</th><th>Change</th><th>New total</th><th>New number</th><th>Why it helps</th></tr>
                 ${nameSug.variants.map((v) => `<tr><td><strong>${esc(v.text)}</strong></td><td>${esc(v.change)}</td><td>${v.compound}</td><td>${v.reduced}</td><td>${esc(v.why)}</td></tr>`).join("")}
               </table></div>
               <div class="card-sub">Write the new spelling 21 times daily for 40 days, update it on non-legal items first (email signature, social profiles, visiting cards), and introduce it on a ${DAY_OF[p.driver]}.</div>`
            : `<div class="card-sub">Consult a numerologist for a custom spelling — targets friendly to both your numbers are limited. Favour spellings totalling a number that fills a missing number in your grid (${p.missing.join(", ") || "none missing"}) or is friendly to Driver ${p.driver} and Conductor ${p.conductor}.</div>`)
          : `<div class="kit-value">${esc(DB.nameAdvice[nameVerdictTone === "good" ? "friendly" : "neutral"])}</div>`}
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

    /* Section 6: mobile */
    const mobSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.mobile}</span>Mobile Number Vibration</h2>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">${esc(p.mobile)}</div>
          <span class="badge info">Digits total ${p.mobCompound} → Number ${p.mobNum} (${esc(DB.numbers[p.mobNum].planet)})</span>
          ${relBadge(p.mobRelD === "enemy" || p.mobRelC === "enemy" ? "enemy" : p.mobRelD === "neutral" && p.mobRelC === "neutral" ? "neutral" : "friendly")}
        </div>
        <table class="rtable">
          <tr><th>vs Driver ${p.driver}</th><td>${relBadge(p.mobRelD)}</td></tr>
          <tr><th>vs Conductor ${p.conductor}</th><td>${relBadge(p.mobRelC)}</td></tr>
        </table>
        ${compoundMeaning(p.mobCompound) ? `<div class="judge-note"><strong>Compound Number ${p.mobCompound}:</strong> ${esc(compoundMeaning(p.mobCompound))}</div>` : ""}
        ${mobSug.needed
          ? `<div class="kit-value">Your mobile number works against your birth numbers — since your phone is your most-used device, this is a high-impact change. When choosing a new number, pick one whose digits total <strong>${mobSug.goodTotals.join(", ")}</strong>. Activate the new SIM on a ${DAY_OF[p.driver]} or ${DAY_OF[p.conductor]} morning.</div>`
          : `<div class="kit-value">Your mobile number vibrates acceptably with your birth numbers — no change required.</div>`}
      </div>
    </section>`;

    /* Section 7: vehicle number */
    const vehicleSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.vehicle}</span>Vehicle Number Vibration</h2>
      <p class="rsection-desc">You travel inside your vehicle's vibration every day — its registration number carries Chaldean letter values plus digit values.</p>
      ${vehicle.provided
        ? `<div class="card">
            <div class="goal-head">
              <div class="card-title">${esc(vehicle.raw)}</div>
              <span class="badge info">Letters ${vehicle.letterVal} + digits ${vehicle.digitVal} = ${vehicle.total} → Number ${vehicle.num} (${esc(DB.numbers[vehicle.num].planet)})</span>
              ${relBadge(vehicle.conflicting ? "enemy" : vehicle.relD === "neutral" && vehicle.relC === "neutral" ? "neutral" : "friendly")}
            </div>
            <table class="rtable">
              <tr><th>vs Driver ${p.driver}</th><td>${relBadge(vehicle.relD)}</td></tr>
              <tr><th>vs Conductor ${p.conductor}</th><td>${relBadge(vehicle.relC)}</td></tr>
            </table>
            ${vehicle.conflicting
              ? `<div class="kit-value">This number works against your birth numbers. When you next register or change a vehicle, choose a plate whose letters (Chaldean) + digits total <strong>${vehicle.goodTotals.join(", ")}</strong>. Until then, keep a small ${esc(DB.numbers[p.driver].crystal.split(" ")[0])} or ${esc(DB.numbers[p.driver].planet.split(" ")[0])} yantra in the vehicle and start new journeys on ${DAY_OF[p.driver]}.</div>`
              : `<div class="kit-value">Your vehicle number vibrates acceptably with your birth numbers — keep it. For your next vehicle, the totals below remain your best picks.</div>`}
          </div>`
        : `<div class="card"><div class="kit-value">No vehicle number was entered — use the guidance below whenever you buy a car/bike or choose a registration number.</div></div>`}
      <div class="card">
        <div class="card-title">Choosing a Lucky Vehicle Number</div>
        <div class="kit-value">Pick a registration whose <strong>letter values + digits total</strong> is one of: <strong>${vehicle.goodTotals.join(", ")}</strong> (these reduce to numbers in harmony with Driver ${p.driver} and Conductor ${p.conductor}). Favour vehicle colours <strong>${esc(vehicle.luckyColors.join(" or "))}</strong>. Take delivery of a new vehicle on a <strong>${DAY_OF[p.driver]}</strong> or <strong>${DAY_OF[p.conductor]}</strong>, ideally in the morning.</div>
      </div>
    </section>`;

    /* Section 8: watch */
    const watchSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.watch}</span>Watch &amp; Wearable Remedy</h2>
      <p class="rsection-desc">Your watch sits on your pulse all day — its metal, colour and geometry continuously feed planetary energy. Spec aligned to Driver ${p.driver} (${esc(DB.numbers[p.driver].planet)}) + Conductor ${p.conductor} (${esc(DB.numbers[p.conductor].planet)}).</p>
      <div class="table-scroll"><table class="rtable">
        <tr><th>Element</th><th>Recommended</th><th>Why</th></tr>
        ${watch.rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}
      </table></div>
      ${watch.avoids.length ? `<div class="card"><div class="card-title">Avoid</div>${watch.avoids.map((a) => `<div class="kit-value">• ${esc(a)}</div>`).join("")}</div>` : ""}
      ${watch.currentVerdict ? `<div class="card"><div class="goal-head"><div class="card-title">Your current watch</div><span class="badge ${watch.currentVerdict.tone}">${watch.currentVerdict.tone === "good" ? "Aligned" : watch.currentVerdict.tone === "warn" ? "Caution" : "Note"}</span></div><div class="kit-value">${esc(watch.currentVerdict.text)}</div></div>` : ""}
      <div class="card"><div class="card-title">Auspicious Activation</div><div class="kit-value">Wear the new watch for the first time on a <strong>${watch.days.join(" or ")}</strong> morning, ${watch.time}. Set a clear intention for your ${esc(p.goals[0] || "goal")} goal while putting it on.</div></div>
    </section>`;

    /* Section 9: crystal companion guide */
    function crystalGuide(p) {
      const zz = DB.zodiac[p.zodiac];
      // Chart-relevant sources, in priority order: zodiac sign → Driver →
      // Conductor → missing planets. Each source string lists one or more
      // crystals (with alternates/substitutes), matched by full crystal name.
      const sources = [
        ...zz.crystals,
        DB.numbers[p.driver].crystal,
        DB.numbers[p.conductor].crystal,
        ...p.missing.map((n) => DB.numbers[n].crystal)
      ];
      const keys = Object.keys(DB.crystals).filter((k) => k !== "Selenite" && k !== "5 Mukhi Rudraksha");
      const seen = new Set();
      const picks = [];
      for (const src of sources) {
        const s = src.toLowerCase();
        for (const k of keys) {
          if (!seen.has(k) && s.includes(k.toLowerCase())) { seen.add(k); picks.push(k); }
        }
      }

      // 5 Mukhi Rudraksha note: check the actual rudraksha fields (not the
      // crystal text) — it is prescribed for number 3 (Jupiter).
      const rudrakshaPool = [
        DB.numbers[p.driver].rudraksha,
        DB.numbers[p.conductor].rudraksha,
        ...p.missing.map((n) => DB.numbers[n].rudraksha)
      ].join(" ").toLowerCase();
      const rudrakshaNote = rudrakshaPool.includes("5 mukhi") ? DB.crystals["5 Mukhi Rudraksha"] : null;

      return { picks: picks.slice(0, 5), rudrakshaNote };
    }
    const cg = crystalGuide(p);
    const crystalSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.crystal}</span>Crystal Companion Guide</h2>
      <p class="rsection-desc">Your chart (Driver ${p.driver}, Conductor ${p.conductor}, ${esc(p.zodiac)} sign${p.missing.length ? `, missing ${p.missing.join("/")}` : ""}) points to these crystals — each with its energy centre, core benefits and the pairing that amplifies it.</p>
      ${cg.picks.length ? `<div class="card-grid two">${cg.picks.map((k) => {
        const c = DB.crystals[k];
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
        <div class="kit-value">${esc(DB.crystals["Selenite"].benefits)}<br><strong>${esc(DB.seleniteRitual)}</strong></div>
      </div>
      ${cg.rudrakshaNote ? `<div class="card"><div class="card-title">📿 5 Mukhi Rudraksha Note</div><div class="kit-value">${esc(cg.rudrakshaNote.benefits)} Best paired with: ${esc(cg.rudrakshaNote.pair)}.</div></div>` : ""}
    </section>`;

    /* Section 10: lucky colours & day-wise dressing */
    const powerDaySet = [...new Set([DAY_OF[p.driver], DAY_OF[p.conductor]])];
    const colorSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.colours}</span>Lucky Colours &amp; Day-wise Dressing</h2>
      <div class="card">
        <div class="card-title">Your Power Colours</div>
        <div class="kit-value">Wear <strong>${esc(DB.numbers[p.driver].color)}</strong> most often — they feed your Driver ${p.driver} (${esc(DB.numbers[p.driver].planet)}), your core personality. Add <strong>${esc(DB.numbers[p.conductor].color)}</strong> for important days, meetings and decisions — they support your Conductor ${p.conductor} (${esc(DB.numbers[p.conductor].planet)}).</div>
      </div>
      <div class="card">
        <div class="card-title">What to Wear, Day by Day</div>
        <div class="table-scroll"><table class="rtable">
          <tr><th>Day</th><th>Planet</th><th>Wear these colours</th><th>Note</th></tr>
          ${DB.dayWear.map((d) => `<tr${powerDaySet.includes(d.day) ? ' class="hl-row"' : ""}>
            <td><strong>${esc(d.day)}</strong>${powerDaySet.includes(d.day) ? ' <span class="badge good">Your power day</span>' : ""}</td>
            <td>${esc(DB.numbers[d.num].planet.split(" ")[0])}</td>
            <td>${esc(d.colors)}</td>
            <td>${esc(d.note)}</td>
          </tr>`).join("")}
        </table></div>
        <div class="card-sub">Rule of thumb: never wear dull or torn clothes on your power days — that is when your planets receive energy most directly.</div>
      </div>
    </section>`;

    /* Section 11: career & profession guidance */
    const driverCareers = DB.careers[p.driver], conductorCareers = DB.careers[p.conductor];
    const overlap = driverCareers.filter((c) => conductorCareers.includes(c));
    const careerSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${SECTION.career}</span>Best Fields &amp; Professions</h2>
      <p class="rsection-desc">Fields ruled by your Driver suit your natural talent; fields ruled by your Conductor bring destiny-level success. The sweet spot is where they overlap.</p>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">Natural Talent — Driver ${p.driver} (${esc(DB.numbers[p.driver].planet)})</div>
          <div class="kit">${driverCareers.map((c) => `<div class="kit-row"><div class="kit-ico">›</div><div class="kit-body"><div class="kit-value">${esc(c)}</div></div></div>`).join("")}</div>
        </div>
        <div class="card">
          <div class="card-title">Destiny Growth — Conductor ${p.conductor} (${esc(DB.numbers[p.conductor].planet)})</div>
          <div class="kit">${conductorCareers.map((c) => `<div class="kit-row"><div class="kit-ico">›</div><div class="kit-body"><div class="kit-value">${esc(c)}</div></div></div>`).join("")}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Career Direction Verdict</div>
        <div class="kit-value">${overlap.length
          ? `Your talent and destiny align beautifully in: <strong>${overlap.map(esc).join(", ")}</strong> — prioritise these for the highest chance of excelling.`
          : `Your Driver and Conductor pull towards different fields — combine them (e.g. a Driver-${p.driver} skill applied inside a Conductor-${p.conductor} industry) and success probability multiplies.`}
          ${p.missing.includes(3) ? ` Number 3 (Jupiter) is missing from your grid — careers involving teaching, finance or advisory need extra Jupiter remedy support (see Section 4).` : ""}
          ${p.missing.includes(8) ? ` Number 8 (Saturn) is missing — long-term career stability improves as you apply the Saturn remedies in Section 4.` : ""}</div>
      </div>
    </section>`;

    /* Section 12: favourable years & timing */
    const timingSection = `<section class="rsection" id="timing-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.timing}</span>Favourable Years &amp; Timing</h2>
      <div class="card">
        <div class="card-title">Your Personal Year Cycle</div>
        <div class="table-scroll"><table class="rtable">
          <tr><th>Year</th><th>Personal Year</th><th>Theme — how to use it</th></tr>
          ${timing.years.map((y) => `<tr${y.current ? ' class="hl-row"' : ""}>
            <td><strong>${y.yr}</strong>${y.current ? ' <span class="badge info">Now</span>' : ""}</td>
            <td>${y.n} (${esc(DB.numbers[y.n].planet.split(" ")[0])})</td>
            <td>${esc(y.meaning)}</td>
          </tr>`).join("")}
        </table></div>
      </div>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">Best Years Ahead</div>
          <div class="kit">${timing.luckyYears.map((l) => `<div class="kit-row"><div class="kit-ico"><strong>${l.yr}</strong></div><div class="kit-body"><div class="kit-value">Personal year ${l.py} — ${esc(l.why)}</div></div></div>`).join("")}</div>
          <div class="card-sub">Schedule launches, investments, job switches and major purchases in these years for maximum support.</div>
        </div>
        <div class="card">
          <div class="card-title">Milestone Ages</div>
          <div class="kit">${timing.milestones.map((m) => `<div class="kit-row"><div class="kit-ico"><strong>${m.age}</strong></div><div class="kit-body"><div class="kit-value">Year ${m.yr} — ${esc(m.why)}</div></div></div>`).join("")}</div>
          <div class="card-sub">These ages carry extra momentum — plan your biggest moves to land on them.</div>
        </div>
      </div>
    </section>`;

    const memorySection = `<section class="rsection" id="memory-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.memory}</span>Your Evolving Chart</h2>
      <p class="rsection-desc">This section is private, on-device memory only. It helps the app learn your own journey over time without uploading personal data.</p>
      <div class="insight-grid">
        <div class="metric-card">
          <div class="metric-label">Saved snapshots</div>
          <div class="metric-value">${evolving.snapshots.length}</div>
          <div class="metric-sub">Latest saved on ${evolving.snapshots[0] ? prettyDate(evolving.snapshots[0].savedAt) : "this device not yet"}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">This year in context</div>
          <div class="metric-value">${evolving.currentYearLucky ? "Favourable" : "Build steadily"}</div>
          <div class="metric-sub">${evolving.currentYearLucky ? "This year appears in your lucky-year window." : "Not one of your top timing windows — use discipline and consistency."}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Moves logged this year</div>
          <div class="metric-value">${evolving.movesThisYear}</div>
          <div class="metric-sub">A local reality-check against your timing cycle.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Knowledge source</div>
          <div class="metric-value">v${esc(activePack().packVersion)}</div>
          <div class="metric-sub">${esc(activePack().source === "remote" ? "Live-updated content pack" : activePack().source === "cached" ? "Cached content pack" : "Bundled starter pack")}</div>
        </div>
      </div>
      <div class="card-grid two">
        <div class="card">
          <div class="card-title">Remedy engagement this month</div>
          <div class="card-sub">One tap adds a private check-in for the planets that matter most in this chart.</div>
          <div class="engagement-list">
            ${evolving.practiceSummary.map((item) => `<div class="engagement-item"><div><strong>${item.n} — ${esc(DB.numbers[item.n].planet)}</strong><span>${item.month} logged this month · ${item.total} total</span></div><button class="btn btn-secondary btn-32" type="button" data-practice-number="${item.n}">Log practice</button></div>`).join("")}
          </div>
        </div>
        <div class="card">
          <div class="card-title">Lucky-year timing vs what you actually did</div>
          <div class="card-sub">Log a real-world move locally — job switch, launch, purchase, proposal, relocation, or a strong 40-day remedy push.</div>
          <form id="localJournalForm" class="mini-form">
            <input id="localJournalText" class="input" type="text" maxlength="160" placeholder="e.g. Started Friday Venus remedy streak and redesigned bedroom" />
            <button class="btn btn-primary btn-32" type="submit">Save locally</button>
          </form>
          <div class="timeline">
            ${evolving.journal.length ? evolving.journal.map((entry) => `<div class="timeline-item"><div><strong>${esc(entry.text)}</strong><span>${prettyDate(entry.at)}</span></div></div>`).join("") : `<div class="timeline-item"><div><strong>No local moves logged yet</strong><span>Your notes stay on this device and never enter the anonymous contribution payload.</span></div></div>`}
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

    /* Section 15: vastu */
    const vastuSection = vastu.length
      ? `<section class="rsection" id="vastu-section">
          <h2 class="rsection-title"><span class="idx">${SECTION.vastu}</span>Vastu Dosh Scan</h2>
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
          <p class="rsection-desc">General upkeep: keep the centre (Brahmasthan) of the property empty and clean; place a bowl of sea salt in dosh zones and replace it weekly; keep the northeast lit with a daily diya.</p>
        </section>`
      : `<section class="rsection" id="vastu-section">
          <h2 class="rsection-title"><span class="idx">${SECTION.vastu}</span>Vastu Dosh Scan</h2>
          <div class="card"><div class="kit-value">No direction details were provided — re-run with your entrance, kitchen, bedroom and toilet directions for a full dosh scan.</div></div>
        </section>`;

    /* Section 15: personal lucky directions (Kua — Feng Shui, clearly labelled) */
    const kuaInfo = p.kua ? DB.kua[p.kua] : null;
    const kuaSection = `<section class="rsection" id="kua-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.kua}</span>Personal Lucky Directions — Kua Number</h2>
      <p class="rsection-desc">Note: the <strong>Kua number is a Feng Shui (Chinese) system</strong>, not classical Vastu Shastra — we include it clearly separated because it is commonly requested as "your personal lucky direction".</p>
      ${kuaInfo ? `<div class="card">
        <div class="goal-head">
          <div class="card-title">Your Kua number is ${p.kua} — ${esc(kuaInfo.group)} group, ${esc(kuaInfo.element)} element</div>
          <span class="badge info">Feng Shui</span>
        </div>
        <div class="kit-value">Your best direction (Sheng Chi — wealth &amp; success) is <strong>${esc(kuaInfo.shengChi)}</strong>. Face this direction when working or sleeping for maximum support.</div>
        <div class="kit-value">Your four auspicious directions: <strong>${kuaInfo.auspicious.map(esc).join(", ")}</strong>. Orient your desk, bed head and main door towards these wherever practical.</div>
      </div>` : `<div class="card"><div class="kit-value">Add your <strong>gender</strong> in the intake form (use "Edit Details" and re-run) to compute your Kua number and personal lucky directions.</div></div>`}
    </section>`;

    /* Section 16: compatibility */
    const partnerValid = p.partnerName && p.partnerDob && !isNaN(new Date(p.partnerDob).getTime());
    const compat = partnerValid
      ? compatibility(p, computeProfile({ name: p.partnerName, dob: p.partnerDob, mobile: "", goals: [], vehicle: "", watchType: "none", entrance: "unsure", kitchen: "unsure", bedroom: "unsure", toilet: "unsure", gender: "" }))
      : null;
    const compatSection = `<section class="rsection" id="compatibility-section">
      <h2 class="rsection-title"><span class="idx">${SECTION.compatibility}</span>Compatibility &amp; Matchmaking</h2>
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
          <div class="kit-value">${compat.verdict === "Strong" ? "A naturally cooperative pairing — your numbers reinforce each other." : compat.verdict === "Good" ? "A supportive pairing with a couple of neutral links — manageable and mostly aligned." : compat.verdict === "Workable" ? "Workable, but needs conscious effort — the conflicting links are the areas to manage." : "Challenging pairing — the conflicting numbers need remedies and clear communication to bridge."}</div>
        </div>`
      : `<div class="card">
          <div class="card-title">Who are you compatible with?</div>
          <div class="kit-value">Add a <strong>partner's name and date of birth</strong> (Edit Details → Compatibility) for a full two-person Driver / Conductor match. Meanwhile, here is how your numbers relate to every other Driver:</div>
          <div class="table-scroll"><table class="rtable">
            <tr><th>Other person's Driver</th><th>vs your Driver ${p.driver}</th><th>vs your Conductor ${p.conductor}</th></tr>
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<tr><td><strong>${n}</strong> (${esc(DB.numbers[n].planet.split(" ")[0])})</td><td>${relBadge(relation(p.driver, n))}</td><td>${relBadge(relation(p.conductor, n))}</td></tr>`).join("")}
          </table></div>
        </div>`}
    </section>`;

    /* Section 18+: goal plans */
    const goalsStart = SECTION.goalsStart;
    const goalSections = goals.map((g, i) => `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${goalsStart + i}</span>${esc(g.goal)} — Remedy Plan</h2>
      <p class="rsection-desc">${g.weak.length
        ? `Blocked by missing number${g.weak.length > 1 ? "s" : ""} <strong>${g.weak.join(", ")}</strong> in your grid — these planet kits are your ${esc(g.goal.toLowerCase())} priority.`
        : `No ${esc(g.goal.toLowerCase())} planet is missing from your grid — maintain momentum with your key ${esc(g.goal.toLowerCase())} planets.`}</p>
      <div class="card-grid two">${g.focus.map((f) => kitCard(f.n)).join("")}</div>
    </section>`).join("");

    /* final section: priority plan */
    const prioritySection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${goalsStart + goals.length}</span>Your 40-Day Priority Plan</h2>
      <p class="rsection-desc">Start here — the highest-impact actions, ordered. Consistency for 40 days is the classical activation period.</p>
      <div class="priority-list">${priorities.map((t) => `<div class="priority-item">${t}</div>`).join("")}</div>
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
        <h1>Remedy Report — ${esc(p.name)}</h1>
        <p>DOB ${dobStr}${birthLine ? ` · Born ${esc(birthLine)}` : ""} · Focus: ${p.goals.map(esc).join(", ")} · Generated locally on your device</p>
        <div class="report-meta">
          <span class="status-pill status-private">Private report · browser only</span>
          <span class="status-pill status-knowledge">Knowledge pack v${esc(activePack().packVersion)}</span>
          <span class="status-pill status-memory">${evolving.snapshots.length} local snapshot${evolving.snapshots.length === 1 ? "" : "s"}</span>
          ${vedicPill}
        </div>
        <nav class="report-nav" aria-label="Quick report navigation">
          <a href="#summary-section">Summary</a>
          <a href="#core-profile">Profile</a>
          <a href="#loshu-section">Loshu Grid</a>
          <a href="#vedic-section">Vedic Sign</a>
          <a href="#timing-section">Timing</a>
          <a href="#memory-section">Evolving Chart</a>
          <a href="#vastu-section">Vastu</a>
        </nav>
      </div>
      ${summarySection}
      <section class="rsection" id="core-profile">
        <h2 class="rsection-title"><span class="idx">${SECTION.core}</span>Core Numerology Profile</h2>
        <div class="card-grid">
          ${numCard("Driver (Moolank)", p.driver, "Your mind, personality and day-to-day energy")}
          ${numCard("Conductor (Bhagyank)", p.conductor, "Your destiny path and long-term results")}
          ${numCard("Name Number", p.nameNum, `Chaldean total ${p.nameCompound} — how the world receives you`)}
          ${numCard("Mobile Number", p.mobNum, `Digits total ${p.mobCompound} — your most-used vibration`)}
          <div class="card num-card">
            <div class="num-value" style="font-size:26px">${esc(p.zodiac)}</div>
            <div class="num-label">Vedic Sun Sign · Surya Rashi</div>
            <div class="num-planet">${esc(DB.zodiac[p.zodiac].element)} · Ruled by ${esc(DB.numbers[DB.zodiac[p.zodiac].ruler].planet)}</div>
            <div class="num-traits">Sidereal / Lahiri ayanamsa · Crystals: ${DB.zodiac[p.zodiac].crystals.map(esc).join(", ")}</div>
            <div class="num-traits vedic-western-ref">Western tropical reference: ${esc(p.zodiacTropical)}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Driver ${p.driver} × Conductor ${p.conductor} combination</div>
          <div class="kit-value">Your mind runs on <strong>${esc(DB.numbers[p.driver].planet)}</strong> (${esc(DB.numbers[p.driver].traits.split(",")[0].toLowerCase())}) while your destiny demands <strong>${esc(DB.numbers[p.conductor].planet)}</strong> (${esc(DB.numbers[p.conductor].traits.split(",")[0].toLowerCase())}). This pair is <strong>${relation(p.driver, p.conductor)}</strong> — ${relation(p.driver, p.conductor) === "friendly" ? "a naturally cooperative chart; remedies will amplify what already flows." : relation(p.driver, p.conductor) === "neutral" ? "a workable chart; targeted remedies will sharpen results." : "the remedies below are chosen to bridge these two energies."}</div>
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

  /* ---------------- view switching ---------------- */
  let lastProfile = null;

  function bindReportInteractions() {
    $$('[data-practice-number]', $("#reportRoot")).forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = Number(btn.getAttribute("data-practice-number"));
        if (!state.activeProfileKey || !n) return;
        logPractice(state.activeProfileKey, n);
        showToast(`Logged ${DB.numbers[n].planet} practice locally`, "good");
        lastProfile = computeProfile(state.lastInput);
        showReport(lastProfile, { preserveScroll: true });
        const anchor = $("#memory-section");
        if (anchor) anchor.scrollIntoView({ block: "start" });
      });
    });
    const journalForm = $("#localJournalForm");
    const journalInput = $("#localJournalText");
    if (journalForm && journalInput) {
      journalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = journalInput.value.trim();
        if (!text || !state.activeProfileKey) return;
        addJournalEntry(state.activeProfileKey, text);
        journalInput.value = "";
        showToast("Saved to your local evolving chart", "good");
        lastProfile = computeProfile(state.lastInput);
        showReport(lastProfile, { preserveScroll: true });
        const anchor = $("#memory-section");
        if (anchor) anchor.scrollIntoView({ block: "start" });
      });
    }
  }
  function showReport(p, options) {
    const opts = options || {};
    const scrollTop = window.scrollY || 0;
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

  hydrateState();
  updateContributionUI();
  updateKnowledgeUI();
  updateMemoryUI();

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

  /* expose for smoke tests */
  window.__NV = { computeProfile, nameSuggestions, brandAnalysis, spellingCandidates, mobileSuggestion, vehicleAnalysis, timingAnalysis, zodiacSign, zodiacSignSidereal, kuaNumber, compatibility, compoundMeaning, masterNumber, reduce, relation, chaldeanValue, validatePack, normalizePack, contributionPayload, formatBirthTime };
})();
