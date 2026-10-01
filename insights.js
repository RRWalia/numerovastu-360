/* ============================================================
   NumeroVastu 360 — insights.js
   Parity layers the core engine did not carry.

   Why this file exists
   --------------------
   A 2026-10 competitive review of the consumer and practitioner
   numerology market found four capabilities that essentially every
   competing product ships and this one did not:

     1. The vowel / consonant split of the name — Soul Urge
        (Heart's Desire), Personality and Expression. The app scored
        one Chaldean total for the whole string and stopped there.
     2. Sub-annual timing — Personal Month and Personal Day, a dated
        calendar and a favourable-date finder for a real event. The
        app had Personal Year and a Dasha ladder, and nothing between
        "this year" and "this Mahadasha".
     3. The Western (Pythagorean) chart as an explicit cross-reference —
        Karmic Lessons, Hidden Passion, Balance, Rational Thought,
        Subconscious Self, Cornerstone / Capstone, Planes of
        Expression, Maturity.
     4. Premises numerology — house / flat / plot / office / desk and
        account numbers. Conspicuous in a product whose other half is
        Vastu.

   Design rules, inherited from the rest of the project
   ----------------------------------------------------
   · Pure functions. No DOM, no storage, no network, no clock reads
     except where a date is passed in explicitly.
   · Tradition separation is structural, not editorial. Chaldean and
     Pythagorean results are returned in separate objects carrying
     their own `system` tag; nothing here ever merges the two into a
     single "the number is X" claim.
   · The Western layer is a CROSS-REFERENCE. It never selects a
     remedy, a crystal, a deity or a Dasha. The renderer is
     responsible for keeping it out of any remedy-bearing scope.
   · Nothing here invents doctrine. Life-event significators for the
     date finder are read from the knowledge pack's own
     `db.dasha.lifeEvents`, so the date finder and the Dasha event
     windows can never disagree about what rules "marriage".
   ============================================================ */

(function () {
  "use strict";

  var VERSION = "1.0.0";

  /* ---------------------------------------------------------------
     Letter value tables
     --------------------------------------------------------------- */

  /* Pythagorean (modern Western). A=1..I=9, J=1..R=9, S=1..Z=8.
     This is the school that owns Karmic Lessons, Hidden Passion and
     the Planes of Expression, which is precisely why those three are
     computed here and not on the Chaldean map: Chaldean assigns no
     letter the value 9, so a Chaldean "karmic lesson" scan would
     report a missing 9 for every human being who ever lived. */
  var PYTHAGOREAN = Object.freeze({
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
  });

  /* Chaldean fallback — identical to the bundled knowledge pack's
     db.chaldean. The live map is read from window.DB when present so a
     pack update flows through; this copy only keeps the module usable
     standalone. A smoke assertion pins the two together so they cannot
     drift. */
  var CHALDEAN_FALLBACK = Object.freeze({
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
    S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
  });

  /* Decoz Planes of Expression. Every letter appears exactly once;
     the quality column (creative / vacillating / grounded) is part of
     the classical table and is kept rather than flattened away.
       Physical   creative E      vacillating W           grounded D M
       Mental     creative A      vacillating H J N P     grounded G L
       Emotional  creative I O R Z vacillating B S T X    grounded —
       Intuitive  creative K      vacillating F Q U Y     grounded C V */
  var PLANES = Object.freeze({
    physical: Object.freeze({ creative: "E", vacillating: "W", grounded: "DM" }),
    mental: Object.freeze({ creative: "A", vacillating: "HJNP", grounded: "GL" }),
    emotional: Object.freeze({ creative: "IORZ", vacillating: "BSTX", grounded: "" }),
    intuitive: Object.freeze({ creative: "K", vacillating: "FQUY", grounded: "CV" })
  });
  var PLANE_KEYS = Object.freeze(["physical", "mental", "emotional", "intuitive"]);
  var QUALITY_KEYS = Object.freeze(["creative", "vacillating", "grounded"]);

  var PLANE_OF_LETTER = (function () {
    var map = {};
    PLANE_KEYS.forEach(function (plane) {
      QUALITY_KEYS.forEach(function (quality) {
        String(PLANES[plane][quality] || "").split("").forEach(function (ch) {
          map[ch] = { plane: plane, quality: quality };
        });
      });
    });
    return Object.freeze(map);
  })();

  /* Weekday → planetary lord number, in the app's own numbering
     (1 Sun, 2 Moon, 3 Jupiter, 5 Mercury, 6 Venus, 8 Saturn, 9 Mars).
     Index is JavaScript getDay(): 0 = Sunday. */
  var WEEKDAY_LORD = Object.freeze([1, 2, 9, 5, 3, 6, 8]);

  var MASTER_NUMBERS = Object.freeze([11, 22, 33]);

  /* ---------------------------------------------------------------
     Primitives
     --------------------------------------------------------------- */

  function upper(value) {
    return String(value === undefined || value === null ? "" : value).toUpperCase();
  }

  function letters(value) {
    return upper(value).replace(/[^A-Z]/g, "");
  }

  /* Digital root, matching app.js reduce(): 0 is never returned. */
  function reduce(n) {
    n = Math.abs(Math.trunc(Number(n) || 0));
    while (n > 9) n = String(n).split("").reduce(function (a, d) { return a + Number(d); }, 0);
    return n || 9;
  }

  /* Western reduction: stop on a master number instead of collapsing
     it. 29 → 11 (stop), 38 → 11 (stop), 48 → 12 → 3. */
  function reduceMaster(n) {
    n = Math.abs(Math.trunc(Number(n) || 0));
    while (n > 9 && MASTER_NUMBERS.indexOf(n) === -1) {
      n = String(n).split("").reduce(function (a, d) { return a + Number(d); }, 0);
    }
    return n || 9;
  }

  function isMaster(n) {
    return MASTER_NUMBERS.indexOf(Number(n)) !== -1;
  }

  function chaldeanMap() {
    try {
      if (typeof window !== "undefined" && window.DB && window.DB.chaldean) return window.DB.chaldean;
    } catch (e) { /* standalone */ }
    return CHALDEAN_FALLBACK;
  }

  function tableFor(system) {
    return String(system) === "pythagorean" ? PYTHAGOREAN : chaldeanMap();
  }

  /* Planetary friendship, mirroring app.js relation() exactly —
     including the non-removable Grahan (Rahu 4 / Moon 2) guard that a
     knowledge pack is not allowed to soften. A smoke assertion
     cross-checks all 81 ordered pairs against the app's own function
     so the two implementations cannot drift. */
  function relation(a, b) {
    if ((a === 4 && b === 2) || (a === 2 && b === 4)) return "enemy";
    if (a === b) return "friendly";
    var f = null;
    try {
      if (typeof window !== "undefined" && window.DB && window.DB.friendship) f = window.DB.friendship[a];
    } catch (e) { /* standalone */ }
    if (!f) return "neutral";
    if (f.friends.indexOf(b) !== -1) return "friendly";
    if (f.neutral.indexOf(b) !== -1) return "neutral";
    return "enemy";
  }

  /* Y is a vowel only when it carries the syllable alone — i.e. when
     neither neighbour is a vowel. Mary → Y vowel; Maya → Y consonant;
     Yolanda → Y consonant; Lynn → Y vowel. W is always treated as a
     consonant: the diphthong cases (Bowen) are not decidable from
     spelling and guessing them would silently change a Soul Urge. */
  function isVowelAt(name, index) {
    var up = upper(name);
    var ch = up[index];
    if ("AEIOU".indexOf(ch) !== -1) return true;
    if (ch !== "Y") return false;
    var prev = "";
    for (var i = index - 1; i >= 0; i--) { if (/[A-Z]/.test(up[i])) { prev = up[i]; break; } if (up[i] !== "") break; }
    var next = "";
    for (var j = index + 1; j < up.length; j++) { if (/[A-Z]/.test(up[j])) { next = up[j]; break; } break; }
    if ("AEIOU".indexOf(prev) !== -1) return false;
    if ("AEIOU".indexOf(next) !== -1) return false;
    return true;
  }

  /* Every alphabetic character of a name, tagged with its value in the
     requested system and whether it reads as a vowel. */
  function letterValues(name, system) {
    var table = tableFor(system);
    var up = upper(name);
    var out = [];
    for (var i = 0; i < up.length; i++) {
      var ch = up[i];
      if (!/[A-Z]/.test(ch)) continue;
      out.push({ ch: ch, index: i, value: Number(table[ch] || 0), vowel: isVowelAt(name, i) });
    }
    return out;
  }

  function sumOf(list) {
    return list.reduce(function (a, item) { return a + item.value; }, 0);
  }

  function totalOf(list, preserveMaster) {
    var compound = sumOf(list);
    return {
      compound: compound,
      reduced: preserveMaster ? reduceMaster(compound) : reduce(compound),
      master: preserveMaster && isMaster(reduceMaster(compound)) ? reduceMaster(compound) : null
    };
  }

  function nameParts(name) {
    return String(name === undefined || name === null ? "" : name)
      .split(/\s+/)
      .map(function (token) { return token.replace(/[^A-Za-z]/g, ""); })
      .filter(Boolean);
  }

  /* ---------------------------------------------------------------
     1 · Name architecture — the vowel / consonant split
     --------------------------------------------------------------- */

  /* Returns the three classical name numbers plus the structural
     letters, in ONE named system. The caller decides which system is
     authoritative; nothing is merged here.

       expression   all letters        — what you do, the outer destiny
       soulUrge     vowels only        — what you want, privately
       personality  consonants only    — what the room meets first  */
  function nameArchitecture(name, options) {
    var opts = options || {};
    var system = String(opts.system || "chaldean") === "pythagorean" ? "pythagorean" : "chaldean";
    var preserveMaster = opts.preserveMaster !== false && system === "pythagorean";
    var all = letterValues(name, system);
    var vowels = all.filter(function (l) { return l.vowel; });
    var consonants = all.filter(function (l) { return !l.vowel; });
    var parts = nameParts(name);
    var first = parts[0] || "";

    var counts = {};
    for (var n = 1; n <= 9; n++) counts[n] = 0;
    all.forEach(function (l) { if (l.value >= 1 && l.value <= 9) counts[l.value]++; });

    var firstVowelLetter = null;
    for (var i = 0; i < all.length; i++) { if (all[i].vowel) { firstVowelLetter = all[i]; break; } }
    var firstLetters = letters(first);

    return {
      system: system,
      name: String(name || ""),
      parts: parts,
      letters: all,
      vowels: vowels,
      consonants: consonants,
      counts: counts,
      expression: totalOf(all, preserveMaster),
      soulUrge: totalOf(vowels, preserveMaster),
      personality: totalOf(consonants, preserveMaster),
      cornerstone: firstLetters ? { ch: firstLetters[0], value: Number(tableFor(system)[firstLetters[0]] || 0) } : null,
      capstone: firstLetters ? { ch: firstLetters[firstLetters.length - 1], value: Number(tableFor(system)[firstLetters[firstLetters.length - 1]] || 0) } : null,
      firstVowel: firstVowelLetter ? { ch: firstVowelLetter.ch, value: firstVowelLetter.value } : null,
      firstNameTotal: totalOf(letterValues(first, system), preserveMaster)
    };
  }

  /* ---------------------------------------------------------------
     2 · The Western (Pythagorean) cross-reference chart
     --------------------------------------------------------------- */

  /* Karmic Lessons — digits 1-9 that NO letter of the name carries.
     Pythagorean only, by definition of the technique. */
  function karmicLessons(name) {
    var arch = nameArchitecture(name, { system: "pythagorean" });
    var out = [];
    for (var n = 1; n <= 9; n++) if (!arch.counts[n]) out.push(n);
    return out;
  }

  /* Hidden Passion — the digit that appears most often. Ties are
     returned together rather than silently resolved by array order. */
  function hiddenPassion(name) {
    var arch = nameArchitecture(name, { system: "pythagorean" });
    var max = 0;
    for (var n = 1; n <= 9; n++) if (arch.counts[n] > max) max = arch.counts[n];
    var out = [];
    if (!max) return { numbers: [], count: 0 };
    for (var k = 1; k <= 9; k++) if (arch.counts[k] === max) out.push(k);
    return { numbers: out, count: max };
  }

  /* Planes of Expression — letter counts and value totals per plane,
     plus the quality breakdown the classical chart also reports. */
  function planesOfExpression(name) {
    var all = letterValues(name, "pythagorean");
    var planes = {};
    PLANE_KEYS.forEach(function (key) { planes[key] = { letters: [], count: 0, total: 0, reduced: 0, qualities: { creative: 0, vacillating: 0, grounded: 0 } }; });
    var qualities = { creative: 0, vacillating: 0, grounded: 0 };
    all.forEach(function (l) {
      var slot = PLANE_OF_LETTER[l.ch];
      if (!slot) return;
      var bucket = planes[slot.plane];
      bucket.letters.push(l.ch);
      bucket.count++;
      bucket.total += l.value;
      bucket.qualities[slot.quality]++;
      qualities[slot.quality]++;
    });
    PLANE_KEYS.forEach(function (key) { planes[key].reduced = planes[key].count ? reduceMaster(planes[key].total) : 0; });
    var dominant = PLANE_KEYS.slice().sort(function (a, b) { return planes[b].count - planes[a].count; })[0];
    var weakest = PLANE_KEYS.slice().sort(function (a, b) { return planes[a].count - planes[b].count; })[0];
    return { planes: planes, qualities: qualities, dominant: dominant, weakest: weakest, order: PLANE_KEYS.slice() };
  }

  /* The full Western chart. `day`, `month`, `year` are calendar
     integers; `name` is the string the chart is read on. */
  function westernProfile(input) {
    var src = input || {};
    var day = Math.trunc(Number(src.day) || 0);
    var month = Math.trunc(Number(src.month) || 0);
    var year = Math.trunc(Number(src.year) || 0);
    var name = String(src.name || "");

    /* Life Path: reduce each component first, preserving masters, then
       reduce the sum — the standard Decoz three-step method. */
    var mPart = reduceMaster(month);
    var dPart = reduceMaster(day);
    var yPart = reduceMaster(year);
    var lifePathCompound = mPart + dPart + yPart;
    var lifePath = reduceMaster(lifePathCompound);

    var arch = nameArchitecture(name, { system: "pythagorean" });
    var lessons = karmicLessons(name);
    var parts = nameParts(name);
    var table = PYTHAGOREAN;
    var balanceCompound = parts.reduce(function (a, token) { return a + Number(table[upper(token)[0]] || 0); }, 0);
    var firstNameCompound = letters(parts[0] || "").split("").reduce(function (a, ch) { return a + Number(table[ch] || 0); }, 0);

    return {
      system: "pythagorean",
      lifePath: { compound: lifePathCompound, reduced: lifePath, master: isMaster(lifePath) ? lifePath : null, parts: { month: mPart, day: dPart, year: yPart } },
      birthday: { value: day, reduced: reduceMaster(day) },
      /* Attitude (a.k.a. Sun number in some schools): birth day + birth month. */
      attitude: { compound: day + month, reduced: reduceMaster(day + month) },
      expression: arch.expression,
      soulUrge: arch.soulUrge,
      personality: arch.personality,
      maturity: (function () {
        var compound = lifePath + arch.expression.reduced;
        return { compound: compound, reduced: reduceMaster(compound) };
      })(),
      balance: { compound: balanceCompound, reduced: reduceMaster(balanceCompound), initials: parts.map(function (token) { return upper(token)[0]; }) },
      rationalThought: (function () {
        var compound = firstNameCompound + day;
        return { compound: compound, reduced: reduceMaster(compound), firstName: parts[0] || "" };
      })(),
      karmicLessons: lessons,
      subconsciousSelf: 9 - lessons.length,
      hiddenPassion: hiddenPassion(name),
      cornerstone: arch.cornerstone,
      capstone: arch.capstone,
      firstVowel: arch.firstVowel,
      planes: planesOfExpression(name),
      counts: arch.counts
    };
  }

  /* ---------------------------------------------------------------
     3 · Personal cycles — year, month, day
     --------------------------------------------------------------- */

  /* Calendar-year school, deliberately identical to the app's existing
     Personal-Year section so the two can never print different numbers
     for the same year:
         PY = reduce(birthDay + birthMonth + reduce(calendarYear))
         PM = reduce(PY + calendarMonth)
         PD = reduce(PM + calendarDay)
     The Universal Day is the plain digital root of the date itself. */
  function personalYearOf(birth, year) {
    return reduce(Math.trunc(Number(birth.day) || 0) + Math.trunc(Number(birth.month) || 0) + reduce(year));
  }

  function personalCycles(birth, date) {
    var d = date instanceof Date ? date : new Date(date);
    var y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate();
    var py = personalYearOf(birth, y);
    var pm = reduce(py + m);
    var pd = reduce(pm + dd);
    return {
      date: new Date(y, m - 1, dd),
      year: y, month: m, day: dd,
      weekday: d.getDay(),
      weekdayLord: WEEKDAY_LORD[d.getDay()],
      personalYear: py,
      personalMonth: pm,
      personalDay: pd,
      universalDay: reduce(y + m + dd),
      universalYear: reduce(y),
      formula: { py: birth.day + " + " + birth.month + " + " + reduce(y) + " → " + py, pm: py + " + " + m + " → " + pm, pd: pm + " + " + dd + " → " + pd }
    };
  }

  /* ---------------------------------------------------------------
     4 · Date grading & the favourable-date finder
     --------------------------------------------------------------- */

  /* Life-event significators come from the knowledge pack so the date
     finder and the Dasha event windows always agree on doctrine. The
     fallback mirrors the bundled pack; `purposes()` reports what is
     actually available to the UI. */
  var PURPOSE_FALLBACK = Object.freeze({
    marriage: { primary: [6, 2], support: [3] },
    abroad: { primary: [4, 7], support: [5] },
    career: { primary: [1, 8], support: [3] },
    property: { primary: [8, 9], support: [4] },
    wealth: { primary: [3, 6], support: [5] }
  });

  function lifeEvents() {
    try {
      if (typeof window !== "undefined" && window.DB && window.DB.dasha && window.DB.dasha.lifeEvents) return window.DB.dasha.lifeEvents;
    } catch (e) { /* standalone */ }
    return PURPOSE_FALLBACK;
  }

  function purposes() {
    return Object.keys(lifeEvents());
  }

  function purposeSignificators(purpose) {
    var events = lifeEvents();
    var row = purpose && events[purpose] ? events[purpose] : null;
    return {
      key: row ? purpose : null,
      primary: row && Array.isArray(row.primary) ? row.primary.slice() : [],
      support: row && Array.isArray(row.support) ? row.support.slice() : []
    };
  }

  /* Score one calendar date for one chart.

     The weights are deliberately explicit and every contribution is
     returned in `reasons`, so the report can show the client WHY a day
     was graded rather than asking them to trust a star rating:

       Personal Day × Driver        friendly +3 · neutral +1 · enemy −3
       Personal Day × Conductor     friendly +2 · neutral +1 · enemy −2
       Personal Day is the Driver / Conductor itself      +2
       Date root × Driver           friendly +1 · enemy −2
       Weekday lord × Driver        friendly +2 · enemy −2
       Purpose significator hit     primary +3 · support +1
       Purpose significator clash   enemy of every primary −2          */
  function gradeDate(chart, date, options) {
    var opts = options || {};
    var driver = Math.trunc(Number(chart.driver) || 0);
    var conductor = Math.trunc(Number(chart.conductor) || 0);
    var cycles = personalCycles({ day: chart.day, month: chart.month }, date);
    var sig = purposeSignificators(opts.purpose);
    var reasons = [];
    var score = 0;

    function add(points, code, detail) {
      score += points;
      reasons.push({ code: code, points: points, detail: detail || null });
    }

    var rD = relation(driver, cycles.personalDay);
    add(rD === "friendly" ? 3 : rD === "neutral" ? 1 : -3, "pd-driver", { relation: rD, pd: cycles.personalDay, driver: driver });
    var rC = relation(conductor, cycles.personalDay);
    add(rC === "friendly" ? 2 : rC === "neutral" ? 1 : -2, "pd-conductor", { relation: rC, pd: cycles.personalDay, conductor: conductor });
    if (cycles.personalDay === driver) add(2, "pd-is-driver", { pd: cycles.personalDay });
    else if (cycles.personalDay === conductor) add(2, "pd-is-conductor", { pd: cycles.personalDay });

    var dateRoot = reduce(cycles.day);
    var rRoot = relation(driver, dateRoot);
    if (rRoot === "friendly") add(1, "date-root", { relation: rRoot, root: dateRoot });
    else if (rRoot === "enemy") add(-2, "date-root", { relation: rRoot, root: dateRoot });

    var rWeek = relation(driver, cycles.weekdayLord);
    if (rWeek === "friendly") add(2, "weekday-lord", { relation: rWeek, lord: cycles.weekdayLord, weekday: cycles.weekday });
    else if (rWeek === "enemy") add(-2, "weekday-lord", { relation: rWeek, lord: cycles.weekdayLord, weekday: cycles.weekday });

    if (sig.key) {
      if (sig.primary.indexOf(cycles.personalDay) !== -1) add(3, "purpose-primary", { purpose: sig.key, pd: cycles.personalDay });
      else if (sig.support.indexOf(cycles.personalDay) !== -1) add(1, "purpose-support", { purpose: sig.key, pd: cycles.personalDay });
      else if (sig.primary.length && sig.primary.every(function (n) { return relation(n, cycles.personalDay) === "enemy"; })) {
        add(-2, "purpose-clash", { purpose: sig.key, pd: cycles.personalDay });
      }
    }

    var grade = score >= 8 ? "excellent" : score >= 5 ? "good" : score >= 2 ? "workable" : "avoid";
    return {
      date: cycles.date,
      iso: cycles.date.getFullYear() + "-" + String(cycles.month).padStart(2, "0") + "-" + String(cycles.day).padStart(2, "0"),
      cycles: cycles,
      score: score,
      grade: grade,
      purpose: sig.key,
      reasons: reasons
    };
  }

  /* A dated month grid: every day of one calendar month, graded. */
  function personalCalendar(chart, year, month, options) {
    var days = new Date(year, month, 0).getDate();
    var out = [];
    for (var d = 1; d <= days; d++) out.push(gradeDate(chart, new Date(year, month - 1, d), options));
    return { year: year, month: month, days: out };
  }

  /* The top N upcoming dates for a stated purpose. `fromMs` is passed
     in rather than read from the clock so the result is reproducible
     in a test. */
  function favourableDates(chart, options) {
    var opts = options || {};
    var from = new Date(opts.fromMs !== undefined && opts.fromMs !== null ? opts.fromMs : Date.now());
    var span = Math.max(1, Math.trunc(Number(opts.days) || 90));
    var limit = Math.max(1, Math.trunc(Number(opts.limit) || 6));
    var start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    var graded = [];
    for (var i = 0; i < span; i++) {
      var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      graded.push(gradeDate(chart, day, { purpose: opts.purpose }));
    }
    var best = graded.slice().sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.date.getTime() - b.date.getTime();
    }).slice(0, limit).sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
    var worst = graded.filter(function (g) { return g.grade === "avoid"; })
      .sort(function (a, b) { return a.score - b.score || a.date.getTime() - b.date.getTime(); })
      .slice(0, 3);
    return { purpose: opts.purpose || null, from: start, days: span, scanned: graded.length, best: best, caution: worst };
  }

  /* ---------------------------------------------------------------
     5 · Premises numerology — house / flat / plot / office / account
     --------------------------------------------------------------- */

  /* Two totals are reported, because practice genuinely uses two and
     conflating them is how consumer calculators disagree with each
     other:

       doorDigits  the digits alone (flat 402 → 6). This is the number
                   the occupant lives "inside" and the one classical
                   house-number practice reads.
       fullToken   digits plus the Chaldean value of any block or wing
                   letter (A-402 → 402 + A). This is the full postal
                   identity.

     The "nameplate tuning" suggestions are the actionable half: a
     suffix letter changes the full token without anyone having to move
     house, which is exactly what the practice does with an added
     letter or symbol on the plate. Only letters that land the total on
     a number non-hostile to BOTH Driver and Conductor are offered. */
  var PREMISES_KINDS = Object.freeze(["home", "flat", "plot", "office", "shop", "desk", "account"]);

  function premisesNumerology(raw, chart, options) {
    var opts = options || {};
    var text = String(raw === undefined || raw === null ? "" : raw).trim();
    if (!text) return { ok: false, reason: "empty" };
    var table = chaldeanMap();
    var digitsOnly = text.replace(/\D/g, "");
    if (!digitsOnly) return { ok: false, reason: "no-digits", raw: text };

    var letterTokens = [];
    upper(text).split("").forEach(function (ch) {
      if (/[A-Z]/.test(ch)) letterTokens.push({ ch: ch, value: Number(table[ch] || 0) });
    });

    var digitSum = digitsOnly.split("").reduce(function (a, d) { return a + Number(d); }, 0);
    var letterSum = letterTokens.reduce(function (a, l) { return a + l.value; }, 0);
    var driver = Math.trunc(Number(chart && chart.driver) || 0);
    var conductor = Math.trunc(Number(chart && chart.conductor) || 0);

    function judge(compound) {
      var reduced = reduce(compound);
      var rD = relation(driver, reduced);
      var rC = relation(conductor, reduced);
      var verdict = (rD === "enemy" || rC === "enemy") ? "hostile"
        : (rD === "friendly" && rC === "friendly") ? "excellent"
          : (rD === "friendly" || rC === "friendly") ? "supportive" : "neutral";
      return { compound: compound, reduced: reduced, relD: rD, relC: rC, verdict: verdict };
    }

    var door = judge(digitSum);
    var full = judge(digitSum + letterSum);
    var operative = letterTokens.length ? full : door;

    /* Nameplate tuning: which single suffix letter would carry the full
       token onto a harmonious number. Chaldean letter values are 1-8,
       so the reachable set is bounded and we list the cleanest option
       per target number rather than all 26 letters. */
    var tuning = [];
    if (operative.verdict === "hostile" || operative.verdict === "neutral") {
      var seen = {};
      Object.keys(table).forEach(function (ch) {
        var value = Number(table[ch] || 0);
        if (!value) return;
        var next = judge(operative.compound + value);
        if (next.verdict !== "excellent" && next.verdict !== "supportive") return;
        if (seen[next.reduced]) return;
        seen[next.reduced] = true;
        tuning.push({ letter: ch, letterValue: value, compound: next.compound, reduced: next.reduced, verdict: next.verdict, relD: next.relD, relC: next.relC });
      });
      tuning.sort(function (a, b) {
        if (a.verdict !== b.verdict) return a.verdict === "excellent" ? -1 : 1;
        return a.letterValue - b.letterValue;
      });
      tuning = tuning.slice(0, 4);
    }

    /* Which door totals suit this chart at all — useful when the client
       is choosing a flat rather than rationalising the one they have. */
    var harmonious = [];
    for (var n = 1; n <= 9; n++) {
      var rD2 = relation(driver, n), rC2 = relation(conductor, n);
      if (rD2 !== "enemy" && rC2 !== "enemy" && (rD2 === "friendly" || rC2 === "friendly")) harmonious.push(n);
    }

    return {
      ok: true,
      raw: text,
      kind: PREMISES_KINDS.indexOf(String(opts.kind || "")) !== -1 ? String(opts.kind) : "home",
      digits: digitsOnly,
      letters: letterTokens,
      door: door,
      full: full,
      /* `operative` is the reading the report leads with: the full
         token when a block/wing letter exists, otherwise the digits. */
      operative: operative,
      hasLetters: letterTokens.length > 0,
      tuning: tuning,
      harmonious: harmonious
    };
  }

  /* ---------------------------------------------------------------
     Exports
     --------------------------------------------------------------- */


  /* ==================================================================
     16-zone Vastu compass — degree-precise zone resolution
     ==================================================================
     Commercial Vastu suites sell a 16-zone / degree-based compass; this
     app read eight fixed 45-degree sectors chosen from a dropdown. The
     gap is real, and it is pure geometry — no new remedy doctrine is
     introduced here. A degree resolves to BOTH:

       - its 16-zone (22.5 degrees wide, N centred on 0), and
       - its classical 8-direction sector (45 degrees wide),

     and the 8-direction parent is computed from the SAME degree rather
     than from the zone, so the existing shipped remedy for that
     direction continues to govern. That is deliberate: inventing
     sixteen new remedy prescriptions would cross the practitioner
     sign-off gate in CONTRIBUTING.md, and geometry does not.

     Two honesty features no surveyed competitor offers:

       1. BOUNDARY FLAG. A reading within `edgeTolerance` degrees of a
          zone edge is flagged as unreliable, because a handheld compass
          is not accurate to a quarter of a degree and a confident zone
          call at 33.6 degrees is false precision.
       2. SPLIT FLAG. Where the 16-zone and the 8-sector disagree about
          which side of a classical boundary a reading falls on (NNE at
          20 degrees is in the N sector; NNE at 30 degrees is in the NE
          sector), that is stated rather than silently resolved. */

  var ZONE16 = Object.freeze([
    { key: "N", label: "North" }, { key: "NNE", label: "North-North-East" },
    { key: "NE", label: "North-East" }, { key: "ENE", label: "East-North-East" },
    { key: "E", label: "East" }, { key: "ESE", label: "East-South-East" },
    { key: "SE", label: "South-East" }, { key: "SSE", label: "South-South-East" },
    { key: "S", label: "South" }, { key: "SSW", label: "South-South-West" },
    { key: "SW", label: "South-West" }, { key: "WSW", label: "West-South-West" },
    { key: "W", label: "West" }, { key: "WNW", label: "West-North-West" },
    { key: "NW", label: "North-West" }, { key: "NNW", label: "North-North-West" }
  ]);
  var SECTOR8 = Object.freeze(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);

  function normDeg(d) {
    var x = Number(d);
    if (!isFinite(x)) return null;
    x = x % 360;
    if (x < 0) x += 360;
    return x;
  }

  /* Zone index: N spans 348.75..11.25, so shift by half a zone before
     dividing. Same construction for the 8 sectors at 45 degrees. */
  function zone16Of(deg) {
    var d = normDeg(deg);
    if (d === null) return null;
    return Math.floor(((d + 11.25) % 360) / 22.5);
  }
  function sector8Of(deg) {
    var d = normDeg(deg);
    if (d === null) return null;
    return Math.floor(((d + 22.5) % 360) / 45);
  }

  function vastuZone(deg, opts) {
    var o = opts || {};
    var tol = isFinite(o.edgeTolerance) ? Number(o.edgeTolerance) : 2;
    var d = normDeg(deg);
    if (d === null) return { ok: false, reason: "not-a-degree" };
    var zi = zone16Of(d), si = sector8Of(d);
    var zone = ZONE16[zi], sector = SECTOR8[si];
    var zoneStart = (zi * 22.5 - 11.25 + 360) % 360;
    var zoneEnd = (zoneStart + 22.5) % 360;
    var centre = (zoneStart + 11.25) % 360;
    /* Signed distance from the zone centre, and absolute distance to the
       nearer edge, both wrapped across 0/360. */
    var fromCentre = ((d - centre + 540) % 360) - 180;
    var toEdge = 11.25 - Math.abs(fromCentre);
    var sectorStart = (si * 45 - 22.5 + 360) % 360;
    var sectorCentre = (sectorStart + 22.5) % 360;
    var fromSectorCentre = ((d - sectorCentre + 540) % 360) - 180;
    return {
      ok: true,
      degree: d,
      zone: zone.key,
      zoneLabel: zone.label,
      zoneIndex: zi,
      zoneStart: zoneStart,
      zoneEnd: zoneEnd,
      zoneCentre: centre,
      offCentre: fromCentre,
      toEdge: toEdge,
      sector: sector,
      sectorIndex: si,
      sectorOffCentre: fromSectorCentre,
      /* An intermediate zone (NNE, ESE, ...) straddles two of the eight
         classical sectors, so which direction GOVERNS THE REMEDY depends
         on exactly where inside the zone the reading falls: NNE at 20
         degrees is governed by the North, NNE at 30 degrees by the
         North-East. `sectorFlip` fires when the reading is close enough
         to that boundary that ordinary compass error would change the
         governing direction — the single most consequential thing a
         degree-based compass can tell a practitioner, and the reason
         this is worth more than a dropdown. */
      intermediate: SECTOR8.indexOf(zone.key) === -1,
      toSectorEdge: 22.5 - Math.abs(fromSectorCentre),
      sectorFlip: (22.5 - Math.abs(fromSectorCentre)) <= tol,
      boundary: toEdge <= tol,
      edgeTolerance: tol
    };
  }

  /* Several tagged readings at once, plus the pairs a practitioner is
     actually asked about. Each element declares the sectors it wants and
     the sectors it must avoid, using ONLY the eight classical
     directions already shipped in DB.vastu — this function returns
     structure, never prescription text. */
  var VASTU_ELEMENTS = Object.freeze({
    entrance: { ideal: ["N", "NE", "E"], avoid: ["SW", "S"], label: "Main entrance" },
    kitchen: { ideal: ["SE"], avoid: ["NE", "N", "SW"], label: "Kitchen / burner" },
    bedroom: { ideal: ["SW"], avoid: ["NE", "SE", "NW"], label: "Master bed" },
    water: { ideal: ["NE", "N", "E"], avoid: ["SE", "SW", "S"], label: "Water source / tank" },
    toilet: { ideal: ["NW", "W"], avoid: ["NE", "SW", "SE"], label: "Toilet" },
    cash: { ideal: ["N", "SW"], avoid: ["SE", "S"], label: "Cash locker" }
  });

  function vastuCompass(readings, opts) {
    var o = opts || {};
    var out = { ok: false, readings: [], boundaryCount: 0, flipCount: 0, idealCount: 0, avoidCount: 0 };
    if (!readings || typeof readings !== "object") return out;
    Object.keys(readings).forEach(function (key) {
      var raw = readings[key];
      if (raw === "" || raw === null || raw === undefined) return;
      var z = vastuZone(raw, o);
      if (!z.ok) return;
      var meta = VASTU_ELEMENTS[key] || { ideal: [], avoid: [], label: key };
      z.element = key;
      z.elementLabel = meta.label;
      z.verdict = meta.avoid.indexOf(z.sector) !== -1 ? "avoid"
        : meta.ideal.indexOf(z.sector) !== -1 ? "ideal" : "acceptable";
      z.ideal = meta.ideal.slice();
      z.avoidList = meta.avoid.slice();
      /* How far, in degrees, to the nearest ideal sector's centre. This
         is the number a consultant actually wants: "your burner is 18
         degrees off the Agni corner", not "your kitchen is wrong". */
      var best = null;
      meta.ideal.forEach(function (want) {
        var wi = SECTOR8.indexOf(want);
        if (wi === -1) return;
        var wc = (wi * 45) % 360;
        var delta = ((z.degree - wc + 540) % 360) - 180;
        if (best === null || Math.abs(delta) < Math.abs(best.delta)) best = { sector: want, delta: delta, centre: wc };
      });
      z.nearestIdeal = best;
      if (z.boundary) out.boundaryCount++;
      if (z.sectorFlip) out.flipCount = (out.flipCount || 0) + 1;
      if (z.verdict === "ideal") out.idealCount++;
      if (z.verdict === "avoid") out.avoidCount++;
      out.readings.push(z);
    });
    out.ok = out.readings.length > 0;
    out.zones = ZONE16.map(function (z) { return z.key; });
    return out;
  }


  /* ==================================================================
     Mobile number — internal digit flow
     ==================================================================
     The app already scores a mobile number's TOTAL against the Driver
     and Conductor. Commercial tools go further and read the number as a
     sequence: adjacent digit pairs, repeats, absent digits. That extra
     reading is genuinely useful to a business client who stares at the
     string all day, and it is cheap to do honestly.

     Two rules govern this implementation:

       1. NO BLACK-BOX SCORES. Nothing here emits "74% lucky". Every
          pair is classified by the SAME one-way Moolank Maitri relation
          the rest of the app uses — friendly, neutral or enemy — so any
          verdict can be traced to a row of the shipped friendship
          chart and argued with.
       2. NO SECOND DOCTRINE. No table of invented two-digit meanings is
          introduced. A pair is read as the relation between its two
          digits, nothing more.

     `relationFn` is injected so the caller passes the live
     DB.friendship-backed relation rather than this module's fallback,
     keeping one friendship chart in the product. */

  function digitFlow(raw, chart, opts) {
    var o = opts || {};
    var rel = typeof o.relationFn === "function" ? o.relationFn : relation;
    var digits = String(raw == null ? "" : raw).replace(/\D/g, "");
    if (digits.length < 2) return { ok: false, reason: "too-short", digits: digits };

    var counts = {};
    for (var n = 0; n <= 9; n++) counts[n] = 0;
    digits.split("").forEach(function (d) { counts[Number(d)]++; });

    /* Adjacent pairs. A pair containing 0 has no planetary ruler in this
       system, so it is reported as `void` rather than forced into a
       relation it cannot have — the honest answer, and the one the
       classical texts imply by giving 0 no lord. */
    var pairs = [];
    for (var i = 0; i < digits.length - 1; i++) {
      var a = Number(digits[i]), b = Number(digits[i + 1]);
      var kind, r = null;
      if (a === 0 || b === 0) kind = "void";
      else if (a === b) kind = "repeat";
      else { r = rel(a, b); kind = r; }
      pairs.push({ index: i, a: a, b: b, text: String(a) + String(b), kind: kind, relation: r });
    }

    var tally = { friend: 0, neutral: 0, enemy: 0, repeat: 0, void: 0 };
    pairs.forEach(function (pr) {
      var k = pr.kind === "friendly" ? "friend" : pr.kind === "enemy" ? "enemy" : pr.kind === "neutral" ? "neutral" : pr.kind;
      if (tally[k] !== undefined) tally[k]++;
    });

    /* Longest unbroken run of non-hostile adjacency — the "clean stretch"
       a practitioner points at when explaining why one number reads more
       smoothly than another of the same total. */
    var best = 0, run = 0;
    pairs.forEach(function (pr) {
      if (pr.kind === "enemy") { run = 0; } else { run++; if (run > best) best = run; }
    });

    var missing = [];
    for (var m = 1; m <= 9; m++) if (!counts[m]) missing.push(m);
    var repeated = [];
    for (var q = 1; q <= 9; q++) if (counts[q] >= 3) repeated.push({ digit: q, count: counts[q] });

    /* Which digits in the string are hostile to the birth numbers. This
       is the one place the chart enters, and it uses the same relation
       function as everything else. */
    var hostileToChart = [], friendlyToChart = [];
    if (chart && chart.driver) {
      for (var d2 = 1; d2 <= 9; d2++) {
        if (!counts[d2]) continue;
        var rd = rel(d2, chart.driver);
        var rc = chart.conductor ? rel(d2, chart.conductor) : "neutral";
        if (rd === "enemy" || rc === "enemy") hostileToChart.push({ digit: d2, count: counts[d2], toDriver: rd, toConductor: rc });
        else if (rd === "friendly" || rc === "friendly") friendlyToChart.push({ digit: d2, count: counts[d2], toDriver: rd, toConductor: rc });
      }
    }

    return {
      ok: true,
      digits: digits,
      length: digits.length,
      counts: counts,
      pairs: pairs,
      tally: tally,
      longestCleanRun: best,
      missing: missing,
      repeated: repeated,
      hostileToChart: hostileToChart,
      friendlyToChart: friendlyToChart,
      /* Deliberately NOT a score. A plain count of hostile adjacencies,
         which the reader can verify by eye against the table. */
      hostileAdjacencies: tally.enemy
    };
  }

  var api = {
    VERSION: VERSION,
    PYTHAGOREAN: PYTHAGOREAN,
    CHALDEAN_FALLBACK: CHALDEAN_FALLBACK,
    PLANES: PLANES,
    PLANE_KEYS: PLANE_KEYS,
    PLANE_OF_LETTER: PLANE_OF_LETTER,
    WEEKDAY_LORD: WEEKDAY_LORD,
    MASTER_NUMBERS: MASTER_NUMBERS,
    PREMISES_KINDS: PREMISES_KINDS,
    reduce: reduce,
    reduceMaster: reduceMaster,
    isMaster: isMaster,
    relation: relation,
    isVowelAt: isVowelAt,
    letterValues: letterValues,
    nameParts: nameParts,
    nameArchitecture: nameArchitecture,
    karmicLessons: karmicLessons,
    hiddenPassion: hiddenPassion,
    planesOfExpression: planesOfExpression,
    westernProfile: westernProfile,
    personalYearOf: personalYearOf,
    personalCycles: personalCycles,
    purposes: purposes,
    purposeSignificators: purposeSignificators,
    gradeDate: gradeDate,
    personalCalendar: personalCalendar,
    favourableDates: favourableDates,
    premisesNumerology: premisesNumerology,
    ZONE16: ZONE16,
    SECTOR8: SECTOR8,
    VASTU_ELEMENTS: VASTU_ELEMENTS,
    zone16Of: zone16Of,
    sector8Of: sector8Of,
    vastuZone: vastuZone,
    vastuCompass: vastuCompass,
    digitFlow: digitFlow
  };

  if (typeof window !== "undefined") window.NVInsights = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
