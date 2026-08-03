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

  function chaldeanValue(name) {
    return name.toUpperCase().split("").reduce((a, ch) => a + (DB.chaldean[ch] || 0), 0);
  }

  const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dirLabel = (d) => (DB.vastu.directions[d] ? DB.vastu.directions[d].label : d);

  /* ---------------- intake setup ---------------- */
  const roomSelects = ["entrance", "kitchen", "bedroom", "toilet"];
  roomSelects.forEach((id) => {
    const sel = $("#" + id);
    const opts = ['<option value="unsure">Not sure</option>']
      .concat(DIRS.map((d) => `<option value="${d}">${dirLabel(d)}</option>`));
    sel.innerHTML = opts.join("");
  });

  const selectedGoals = new Set();
  $$("#goalChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const g = chip.dataset.goal;
      if (selectedGoals.has(g)) { selectedGoals.delete(g); chip.classList.remove("selected"); }
      else { selectedGoals.add(g); chip.classList.add("selected"); }
      $("#err-goals").hidden = selectedGoals.size > 0;
    });
  });

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

    // Name (Chaldean)
    const nameCompound = chaldeanValue(input.name);
    const nameNum = reduce(nameCompound);
    const nameRelD = relation(driver, nameNum);
    const nameRelC = relation(conductor, nameNum);

    // Mobile
    const mobCompound = digitSum(input.mobile);
    const mobNum = reduce(mobCompound);
    const mobRelD = relation(driver, mobNum);
    const mobRelC = relation(conductor, mobNum);

    return {
      ...input, day: d, month: m, year: y,
      driver, conductor, counts, missing, repeated,
      nameCompound, nameNum, nameRelD, nameRelC,
      mobCompound, mobNum, mobRelD, mobRelC
    };
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
    const name = p.name;
    const up = name.toUpperCase();
    const S = DB.spelling;
    const candidates = []; // {text, change, compound, kind}
    const seen = new Set([up.replace(/\s+/g, " ")]);
    const keepCase = (i, str) => { // match original letter case at position
      return str.split("").map((c, j) => {
        const orig = name[i + j];
        if (orig && orig === orig.toLowerCase()) return c.toLowerCase();
        return c;
      }).join("");
    };
    const addCand = (text, change, kind, deltaV) => {
      const key = text.toUpperCase();
      if (seen.has(key)) return;
      seen.add(key);
      const compound = chaldeanValue(text);
      candidates.push({ text, change, compound, reduced: reduce(compound), kind, delta: Math.abs(compound - p.nameCompound) + (deltaV || 0) });
    };

    up.split("").forEach((ch, i) => {
      const v = DB.chaldean[ch];
      if (!v) return; // skip spaces / non-letters
      // 1) double a letter (vowel or consonant) — Triptii, Kumarr
      if ("BCDFGHJKLMNPQRSTVWXYZ".includes(ch) || S.vowelDoubles[ch]) {
        const t = name.slice(0, i) + name[i] + name.slice(i);
        addCand(t, `double "${name[i]}"`, "double", 0);
      }
      // 2) homophone swap — same sound, different value (C<->K, S->SH, I->Y...)
      (S.homophones[ch] || []).forEach((rep) => {
        const t = name.slice(0, i) + keepCase(i, rep) + name.slice(i + 1);
        addCand(t, `${name[i]} → ${rep}`, "swap", 1);
      });
      // 3) vowel insertion after this letter — Suniel style (only inside words)
      if (i > 0 && up[i - 1] !== " ") {
        S.insertVowels.forEach((vowel) => {
          const t = name.slice(0, i + 1) + keepCase(i, vowel) + name.slice(i + 1);
          addCand(t, `insert "${vowel}" after "${name[i]}"`, "insert", 2);
        });
      }
    });

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
    const roomMap = { kitchen: "Kitchen", bedroom: "Master Bedroom", toilet: "Toilet" };
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
    items.push(`Wear the aligned watch spec (metal, dial, geometry as per Section 7) — activate it on <strong>${DAY_OF[p.driver]}</strong> morning, 6:30–8:30 AM.`);
    vastu.filter((f) => f.tone === "bad").slice(0, 2).forEach((f) => {
      items.push(`Vastu correction: <strong>${esc(f.item)}</strong> — apply the remedy listed in Section 11.`);
    });
    const day2 = DAY_OF[p.conductor];
    items.push(`Weekly rhythm: observe your Driver day (<strong>${DAY_OF[p.driver]}</strong>) and Conductor day (<strong>${day2}</strong>) remedies — charity, colours and fasting as listed.`);
    return items.slice(0, 7);
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

  function renderLoshu(p) {
    const cells = DB.loshuLayout.flat().map((n) => {
      const c = p.counts[n];
      const cls = c === 0 ? "missing" : c >= 3 ? "present multi" : "present";
      const digits = c > 0 ? Array(c).fill(n).map((x) => `<span>${x}</span>`).join("") : `<span>${n}</span>`;
      return `<div class="loshu-cell ${cls}" title="${n} — ${esc(DB.numbers[n].planet)}: ${c} occurrence(s)">
        <div class="digits">${digits}</div>
        ${c > 0 ? `<div class="cnt">${DB.numbers[n].planet.split(" ")[0]}</div>` : ""}
      </div>`;
    }).join("");

    const planes = DB.planes.map((pl) => {
      const complete = pl.cells.every((n) => p.counts[n] > 0);
      return `<div class="plane-item ${complete ? "complete" : ""}">
        <span class="pname">${esc(pl.name)}</span>
        <span class="pdesc">${esc(pl.meaning)}</span>
        <span class="cells">${pl.cells.join("-")} ${complete ? "✓" : ""}</span>
      </div>`;
    }).join("");

    const missingFixes = p.missing.map((n) => `
      <div class="kit-row">
        <div class="kit-ico"><strong>${n}</strong></div>
        <div class="kit-body">
          <div class="kit-label">${esc(DB.numbers[n].planet)} — weak / missing</div>
          <div class="kit-value">${esc(DB.missingFix[n])}</div>
        </div>
      </div>`).join("");

    return `
    <section class="rsection">
      <h2 class="rsection-title"><span class="idx">2</span>Your Loshu Grid</h2>
      <p class="rsection-desc">Built from your date of birth plus your Driver and Conductor numbers. Missing numbers mark the planets that need strengthening.</p>
      <div class="loshu-wrap">
        <div>
          <div class="loshu-grid" role="img" aria-label="Loshu grid visualization">${cells}</div>
          <div class="loshu-legend" style="margin-top:8px">
            <span><i class="dot g"></i>Present</span>
            <span><i class="dot y"></i>Repeated (excess)</span>
            <span><i class="dot w"></i>Missing (weak)</span>
          </div>
        </div>
        <div class="plane-list">${planes}</div>
      </div>
      ${p.missing.length ? `<div class="card"><div class="card-title">Missing Numbers — Quick Balancers</div><div class="kit">${missingFixes}</div></div>` : `<div class="card"><div class="kit-value"><span class="badge good">Complete grid</span> All nine numbers are present — a rare, well-balanced chart. Maintain your planets with the weekly rhythm in your Priority Plan.</div></div>`}
      ${p.repeated.length ? `<p class="rsection-desc">Repeated 3+ times: <strong>${p.repeated.join(", ")}</strong> — strong energy here; use it, don't let it dominate (e.g. excess 9 → channel Mars into sport, excess 8 → delegate Saturn's workload).</p>` : ""}
    </section>`;
  }

  function kitCard(n, heading) {
    const i = DB.numbers[n];
    return `<div class="card">
      <div class="goal-head">
        <div class="num-value" style="width:40px;height:40px;font-size:18px;line-height:40px">${n}</div>
        <div>
          <div class="card-title">${esc(i.planet)}</div>
          <div class="card-sub">${esc(heading || i.traits)}</div>
        </div>
      </div>
      <div class="kit">
        <div class="kit-row"><div class="kit-ico">🕉</div><div class="kit-body"><div class="kit-label">Mantra</div><div class="kit-value"><span class="mantra">${esc(i.mantra)}</span><br>${esc(i.mantraCount)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">💎</div><div class="kit-body"><div class="kit-label">Crystal</div><div class="kit-value">${esc(i.crystal)}</div></div></div>
        <div class="kit-row"><div class="kit-ico">📿</div><div class="kit-body"><div class="kit-label">Rudraksha</div><div class="kit-value">${esc(i.rudraksha)}</div></div></div>
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
    const vehicle = vehicleAnalysis(p);
    const timing = timingAnalysis(p);
    const vastu = vastuReport(p);
    const goals = goalPlan(p);
    const priorities = priorityPlan(p, nameSug, mobSug, vastu);
    const watch = watchSpec(p);
    const dobStr = `${String(p.day).padStart(2, "0")}/${String(p.month).padStart(2, "0")}/${p.year}`;

    /* Section 3: weak planets */
    const weakNums = p.missing.filter((n) => n !== p.driver && n !== p.conductor);
    const weakSection = p.missing.length
      ? `<section class="rsection">
          <h2 class="rsection-title"><span class="idx">3</span>Weak Planet Remedy Kits</h2>
          <p class="rsection-desc">Full remedy kits for the planets missing from your grid${weakNums.length !== p.missing.length ? " (your Driver/Conductor planets are inherently supported)" : ""}.</p>
          <div class="card-grid two">${p.missing.slice(0, 4).map((n) => kitCard(n)).join("")}</div>
          ${p.missing.length > 4 ? `<p class="rsection-desc">+ ${p.missing.length - 4} more missing numbers — apply their quick balancers from Section 2.</p>` : ""}
        </section>` : "";

    /* Section 4: name */
    const nameVerdictTone = nameSug.verdict === "enemy" || (p.nameRelD === "enemy" || p.nameRelC === "enemy") ? "bad" : nameSug.verdict === "neutral" ? "warn" : "good";
    const nameSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">4</span>Name Analysis &amp; Spelling Correction</h2>
      <div class="card">
        <div class="goal-head">
          <div class="card-title">${esc(p.name)}</div>
          <span class="badge info">Chaldean total ${p.nameCompound} → Name Number ${p.nameNum}</span>
          ${relBadge(p.nameRelD === "enemy" || p.nameRelC === "enemy" ? "enemy" : p.nameRelD === "neutral" || p.nameRelC === "neutral" ? "neutral" : "friendly")}
        </div>
        <table class="rtable">
          <tr><th>Name number vs Driver ${p.driver}</th><td>${relBadge(p.nameRelD)} ${p.nameRelD === "enemy" ? "— clashes with your core mind/self energy" : ""}</td></tr>
          <tr><th>Name number vs Conductor ${p.conductor}</th><td>${relBadge(p.nameRelC)} ${p.nameRelC === "enemy" ? "— works against your destiny path" : ""}</td></tr>
        </table>
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
    </section>`;

    /* Section 5: mobile */
    const mobSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">5</span>Mobile Number Vibration</h2>
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
        ${mobSug.needed
          ? `<div class="kit-value">Your mobile number works against your birth numbers — since your phone is your most-used device, this is a high-impact change. When choosing a new number, pick one whose digits total <strong>${mobSug.goodTotals.join(", ")}</strong>. Activate the new SIM on a ${DAY_OF[p.driver]} or ${DAY_OF[p.conductor]} morning.</div>`
          : `<div class="kit-value">Your mobile number vibrates acceptably with your birth numbers — no change required.</div>`}
      </div>
    </section>`;

    /* Section 6: vehicle number */
    const vehicleSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">6</span>Vehicle Number Vibration</h2>
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

    /* Section 7: watch */
    const watchSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">7</span>Watch &amp; Wearable Remedy</h2>
      <p class="rsection-desc">Your watch sits on your pulse all day — its metal, colour and geometry continuously feed planetary energy. Spec aligned to Driver ${p.driver} (${esc(DB.numbers[p.driver].planet)}) + Conductor ${p.conductor} (${esc(DB.numbers[p.conductor].planet)}).</p>
      <div class="table-scroll"><table class="rtable">
        <tr><th>Element</th><th>Recommended</th><th>Why</th></tr>
        ${watch.rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}
      </table></div>
      ${watch.avoids.length ? `<div class="card"><div class="card-title">Avoid</div>${watch.avoids.map((a) => `<div class="kit-value">• ${esc(a)}</div>`).join("")}</div>` : ""}
      ${watch.currentVerdict ? `<div class="card"><div class="goal-head"><div class="card-title">Your current watch</div><span class="badge ${watch.currentVerdict.tone}">${watch.currentVerdict.tone === "good" ? "Aligned" : watch.currentVerdict.tone === "warn" ? "Caution" : "Note"}</span></div><div class="kit-value">${esc(watch.currentVerdict.text)}</div></div>` : ""}
      <div class="card"><div class="card-title">Auspicious Activation</div><div class="kit-value">Wear the new watch for the first time on a <strong>${watch.days.join(" or ")}</strong> morning, ${watch.time}. Set a clear intention for your ${esc(p.goals[0] || "goal")} goal while putting it on.</div></div>
    </section>`;

    /* Section 8: lucky colours & day-wise dressing */
    const powerDaySet = [...new Set([DAY_OF[p.driver], DAY_OF[p.conductor]])];
    const colorSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">8</span>Lucky Colours &amp; Day-wise Dressing</h2>
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

    /* Section 9: career & profession guidance */
    const driverCareers = DB.careers[p.driver], conductorCareers = DB.careers[p.conductor];
    const overlap = driverCareers.filter((c) => conductorCareers.includes(c));
    const careerSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">9</span>Best Fields &amp; Professions</h2>
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
          ${p.missing.includes(3) ? ` Number 3 (Jupiter) is missing from your grid — careers involving teaching, finance or advisory need extra Jupiter remedy support (see Section 3).` : ""}
          ${p.missing.includes(8) ? ` Number 8 (Saturn) is missing — long-term career stability improves as you apply the Saturn remedies in Section 3.` : ""}</div>
      </div>
    </section>`;

    /* Section 10: favourable years & timing */
    const timingSection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">10</span>Favourable Years &amp; Timing</h2>
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

    /* Section 11: vastu */
    const vastuSection = vastu.length
      ? `<section class="rsection">
          <h2 class="rsection-title"><span class="idx">11</span>Vastu Dosh Scan</h2>
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
      : `<section class="rsection">
          <h2 class="rsection-title"><span class="idx">11</span>Vastu Dosh Scan</h2>
          <div class="card"><div class="kit-value">No direction details were provided — re-run with your entrance, kitchen, bedroom and toilet directions for a full dosh scan.</div></div>
        </section>`;

    /* Section 12+: goal plans */
    const goalSections = goals.map((g, i) => `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${12 + i}</span>${esc(g.goal)} — Remedy Plan</h2>
      <p class="rsection-desc">${g.weak.length
        ? `Blocked by missing number${g.weak.length > 1 ? "s" : ""} <strong>${g.weak.join(", ")}</strong> in your grid — these planet kits are your ${esc(g.goal.toLowerCase())} priority.`
        : `No ${esc(g.goal.toLowerCase())} planet is missing from your grid — maintain momentum with your key ${esc(g.goal.toLowerCase())} planets.`}</p>
      <div class="card-grid two">${g.focus.map((f) => kitCard(f.n)).join("")}</div>
    </section>`).join("");

    /* final section: priority plan */
    const prioritySection = `<section class="rsection">
      <h2 class="rsection-title"><span class="idx">${12 + goals.length}</span>Your 40-Day Priority Plan</h2>
      <p class="rsection-desc">Start here — the highest-impact actions, ordered. Consistency for 40 days is the classical activation period.</p>
      <div class="priority-list">${priorities.map((t) => `<div class="priority-item">${t}</div>`).join("")}</div>
    </section>`;

    return `
      <div class="report-hero">
        <h1>Remedy Report — ${esc(p.name)}</h1>
        <p>DOB ${dobStr} · Focus: ${p.goals.map(esc).join(", ")} · Generated locally on your device</p>
      </div>
      <section class="rsection">
        <h2 class="rsection-title"><span class="idx">1</span>Core Numerology Profile</h2>
        <div class="card-grid">
          ${numCard("Driver (Moolank)", p.driver, "Your mind, personality and day-to-day energy")}
          ${numCard("Conductor (Bhagyank)", p.conductor, "Your destiny path and long-term results")}
          ${numCard("Name Number", p.nameNum, `Chaldean total ${p.nameCompound} — how the world receives you`)}
          ${numCard("Mobile Number", p.mobNum, `Digits total ${p.mobCompound} — your most-used vibration`)}
        </div>
        <div class="card">
          <div class="card-title">Driver ${p.driver} × Conductor ${p.conductor} combination</div>
          <div class="kit-value">Your mind runs on <strong>${esc(DB.numbers[p.driver].planet)}</strong> (${esc(DB.numbers[p.driver].traits.split(",")[0].toLowerCase())}) while your destiny demands <strong>${esc(DB.numbers[p.conductor].planet)}</strong> (${esc(DB.numbers[p.conductor].traits.split(",")[0].toLowerCase())}). This pair is <strong>${relation(p.driver, p.conductor)}</strong> — ${relation(p.driver, p.conductor) === "friendly" ? "a naturally cooperative chart; remedies will amplify what already flows." : relation(p.driver, p.conductor) === "neutral" ? "a workable chart; targeted remedies will sharpen results." : "the remedies below are chosen to bridge these two energies."}</div>
        </div>
      </section>
      ${renderLoshu(p)}
      ${weakSection}
      ${nameSection}
      ${mobSection}
      ${vehicleSection}
      ${watchSection}
      ${colorSection}
      ${careerSection}
      ${timingSection}
      ${vastuSection}
      ${goalSections}
      ${prioritySection}
    `;
  }

  /* ---------------- view switching ---------------- */
  let lastProfile = null;

  function showReport(p) {
    $("#reportRoot").innerHTML = renderReport(p);
    $("#intakeView").classList.add("hidden");
    $("#reportView").classList.remove("hidden");
    $("#editBtn").classList.remove("hidden");
    $("#printBtn").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
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
      watchType: $("#watchType").value
    };
    lastProfile = computeProfile(input);
    showReport(lastProfile);
  });

  $("#editBtn").addEventListener("click", showIntake);
  $("#printBtn").addEventListener("click", () => window.print());

  /* expose for smoke tests */
  window.__NV = { computeProfile, nameSuggestions, mobileSuggestion, vehicleAnalysis, timingAnalysis, reduce, relation, chaldeanValue };
})();
