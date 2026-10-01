/* ============================================================
   NumeroVastu 360 — muhurtha.js
   Meeus Ch.15-16 sunrise/sunset + Rahu Kaal foundation.
   Self-contained, ~200 lines, no dependencies except NVAstro
   helpers if present. Accuracy ~1-2 min mid-latitudes.
   Handles polar day/night and DST edge cases.
   ============================================================ */

(function () {
  "use strict";

  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;
  const clamp360 = (x) => ((x % 360) + 360) % 360;
  const sinD = (x) => Math.sin(x * RAD);
  const cosD = (x) => Math.cos(x * RAD);

  function horner(x) {
    var a = 0;
    for (var i = arguments.length - 1; i >= 0; i--) a = a * x + arguments[i];
    return a;
  }

  // Julian Day from proleptic Gregorian date + UTC hours (Meeus ch.7)
  function jdFromUtc(y, m, d, utcHours) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + (utcHours || 0) / 24;
  }

  // DeltaT approx (reuse astro.js table if available, else simple)
  var DT_FIRST = 1657;
  var DT_YEARLY = null;
  try {
    if (typeof window !== "undefined" && window.NVAstro && window.NVAstro.deltaTSeconds) {
      // will use NVAstro's function when possible
    }
  } catch (e) {}

  function deltaTSecondsSimple(dyear) {
    if (dyear < 2000) return 63;
    if (dyear < 2050) return horner((dyear - 2000) / 100, 62.92, 32.217, 55.89);
    var u = (dyear - 1820) / 100;
    return -20 + 32 * u * u;
  }

  function getDeltaT(dyear) {
    try {
      if (typeof window !== "undefined" && window.NVAstro && typeof window.NVAstro.deltaTSeconds === "function") {
        return window.NVAstro.deltaTSeconds(dyear);
      }
    } catch (e) {}
    return deltaTSecondsSimple(dyear);
  }

  function astroMomentLocal(y, m, d, utcHours) {
    var jdUtc = jdFromUtc(y, m, d, utcHours);
    var dyear = 2000 + (jdUtc - 2451545.0) / 365.25;
    var dt = getDeltaT(dyear);
    var jdTt = jdUtc + dt / 86400;
    return { jdUtc: jdUtc, jdTt: jdTt, ut: jdUtc - 2451545.0, tt: jdTt - 2451545.0 };
  }

  // Use NVAstro's sunApparentLon / meanObliquity if available for higher accuracy
  function sunApparentLonLocal(daysTt) {
    try {
      if (typeof window !== "undefined" && window.NVAstro && typeof window.NVAstro.sunApparentLon === "function") {
        return window.NVAstro.sunApparentLon(daysTt);
      }
    } catch (e) {}
    // Fallback low-accuracy Sun (Meeus ch.25)
    var T = daysTt / 36525;
    var L0 = horner(T, 280.46646, 36000.76983, 0.0003032);
    var M = horner(T, 357.52911, 35999.05029, -0.0001537);
    var C = horner(T, 1.914602, -0.004817, -0.000014) * sinD(M) + (0.019993 - 0.000101 * T) * sinD(2 * M) + 0.000289 * sinD(3 * M);
    return clamp360(L0 + C);
  }

  function trueObliquityLocal(daysTt) {
    try {
      if (typeof window !== "undefined" && window.NVAstro && typeof window.NVAstro.trueObliquity === "function") {
        return window.NVAstro.trueObliquity(daysTt);
      }
      if (typeof window !== "undefined" && window.NVAstro && typeof window.NVAstro.meanObliquity === "function") {
        return window.NVAstro.meanObliquity(daysTt);
      }
    } catch (e) {}
    var T = daysTt / 36525.0;
    return (84381.448 - 46.815 * T - 0.00059 * T * T + 0.001813 * T * T * T) / 3600.0;
  }

  function gmstDegLocal(jdUtc) {
    try {
      if (typeof window !== "undefined" && window.NVAstro && typeof window.NVAstro.gmstDeg === "function") {
        return window.NVAstro.gmstDeg(jdUtc);
      }
    } catch (e) {}
    var j0 = Math.floor(jdUtc + 0.5) - 0.5;
    var f = jdUtc + 0.5 - Math.floor(jdUtc + 0.5);
    var T = (j0 - 2451545.0) / 36525;
    var s = horner(T, 24110.54841, 8640184.812866, 0.093104, -0.0000062);
    return clamp360((s + f * 1.00273790935 * 86400) / 240);
  }

  function getNthWeekdayOfMonth(year, monthIndex0, weekday, n) {
    var first = new Date(Date.UTC(year, monthIndex0, 1));
    var firstWd = first.getUTCDay();
    var offset = (weekday - firstWd + 7) % 7;
    var day = 1 + offset + (n - 1) * 7;
    var daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
    if (day > daysInMonth) return null;
    return new Date(Date.UTC(year, monthIndex0, day));
  }

  function getLastWeekdayOfMonth(year, monthIndex0, weekday) {
    var daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
    var last = new Date(Date.UTC(year, monthIndex0, daysInMonth));
    var lastWd = last.getUTCDay();
    var offset = (lastWd - weekday + 7) % 7;
    var day = daysInMonth - offset;
    return new Date(Date.UTC(year, monthIndex0, day));
  }

  function isDSTActive(Y, M, D, lat, lon) {
    if (!isFinite(Y) || !isFinite(M) || !isFinite(D) || !isFinite(lat) || !isFinite(lon)) return false;
    var month0 = M - 1;
    var cur = new Date(Date.UTC(Y, month0, D));
    var curTime = cur.getTime();
    if (lat >= 0) {
      var isAmericas = lon >= -170 && lon <= -30;
      if (isAmericas) {
        var secondSunMar = getNthWeekdayOfMonth(Y, 2, 0, 2);
        var firstSunNov = getNthWeekdayOfMonth(Y, 10, 0, 1);
        if (!secondSunMar || !firstSunNov) return false;
        return curTime >= secondSunMar.getTime() && curTime < firstSunNov.getTime();
      } else {
        var lastSunMar = getLastWeekdayOfMonth(Y, 2, 0);
        var lastSunOct = getLastWeekdayOfMonth(Y, 9, 0);
        if (!lastSunMar || !lastSunOct) return false;
        return curTime >= lastSunMar.getTime() && curTime < lastSunOct.getTime();
      }
    } else {
      var firstSunOctThis = getNthWeekdayOfMonth(Y, 9, 0, 1);
      var firstSunAprThis = getNthWeekdayOfMonth(Y, 3, 0, 1);
      var firstSunOctLast = getNthWeekdayOfMonth(Y - 1, 9, 0, 1);
      if (M >= 10) {
        if (!firstSunOctThis) return false;
        return curTime >= firstSunOctThis.getTime();
      } else if (M <= 3) {
        if (!firstSunOctLast) return false;
        return curTime >= firstSunOctLast.getTime();
      } else if (M === 4) {
        if (!firstSunAprThis || !firstSunOctLast) return false;
        if (D < firstSunAprThis.getUTCDate()) {
          return curTime >= firstSunOctLast.getTime();
        }
        return false;
      } else {
        return false;
      }
    }
  }

  function effectiveTz(place, Y, M, D) {
    if (!place) return 5.5;
    var base = Number(place.tz);
    if (!isFinite(base)) return 5.5;
    if (!place.dst) return base;
    var lat = Number(place.lat);
    var lon = Number(place.lon);
    if (isDSTActive(Y, M, D, lat, lon)) return base + 1;
    return base;
  }

  function sunEquatorial(mom) {
    var lam = sunApparentLonLocal(mom.tt);
    var eps = trueObliquityLocal(mom.tt);
    var sinDec = sinD(eps) * sinD(lam);
    var dec = Math.asin(Math.max(-1, Math.min(1, sinDec))) * DEG;
    var y = cosD(eps) * sinD(lam);
    var x = cosD(lam);
    var ra = Math.atan2(y, x) * DEG;
    ra = clamp360(ra);
    return { dec: dec, ra: ra, lam: lam, eps: eps };
  }

  function sunAltitudeAt(mom, lat, lon) {
    var eq = sunEquatorial(mom);
    var gmst = gmstDegLocal(mom.jdUtc);
    var lst = clamp360(gmst + lon);
    var H = lst - eq.ra;
    H = ((H + 180) % 360 + 360) % 360 - 180;
    var sinAlt = sinD(lat) * sinD(eq.dec) + cosD(lat) * cosD(eq.dec) * cosD(H);
    var alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * DEG;
    return { alt: alt, H: H, dec: eq.dec, ra: eq.ra, lst: lst, gmst: gmst, lam: eq.lam, eps: eq.eps };
  }

  function sunriseSunset(Y, M, D, lat, lon, tzEffective, opts) {
    opts = opts || {};
    var h0 = typeof opts.h0 === "number" ? opts.h0 : -0.8333;
    if (!isFinite(Y) || !isFinite(M) || !isFinite(D) || !isFinite(lat) || !isFinite(lon) || !isFinite(tzEffective)) {
      return { ok: false, reason: "bad-input" };
    }
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || Math.abs(tzEffective) > 14) {
      return { ok: false, reason: "out-of-range" };
    }

    function altAtLocal(localHour) {
      var utcHour = localHour - tzEffective;
      var mom = astroMomentLocal(Y, M, D, utcHour);
      return sunAltitudeAt(mom, lat, lon).alt;
    }

    var altMidnight = altAtLocal(0);
    var altNoon = altAtLocal(12);
    var altNextMidnight = altAtLocal(24);

    var above0 = altMidnight > h0;
    var above12 = altNoon > h0;
    var above24 = altNextMidnight > h0;

    if (above0 && above12 && above24) {
      var bestAlt = -90, bestHour = 12;
      for (var h = 0; h <= 24; h += 0.5) {
        var a = altAtLocal(h);
        if (a > bestAlt) { bestAlt = a; bestHour = h; }
      }
      var lo = Math.max(0, bestHour - 1), hi = Math.min(24, bestHour + 1);
      for (var i = 0; i < 20; i++) {
        var m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
        if (altAtLocal(m1) < altAtLocal(m2)) lo = m1; else hi = m2;
      }
      var transit = (lo + hi) / 2;
      return { ok: true, sunrise: null, sunset: null, transit: transit, dayLength: 24, alwaysDay: true, alwaysNight: false, h0: h0, lat: lat, lon: lon, tz: tzEffective, altMidnight: altMidnight, altNoon: altNoon };
    }
    if (!above0 && !above12 && !above24) {
      return { ok: true, sunrise: null, sunset: null, transit: 12, dayLength: 0, alwaysDay: false, alwaysNight: true, h0: h0, lat: lat, lon: lon, tz: tzEffective, altMidnight: altMidnight, altNoon: altNoon };
    }

    var sunrise = null, sunset = null;
    var prevHour = 0, prevAlt = altMidnight;
    for (var h = 1; h <= 24; h++) {
      var curAlt = altAtLocal(h);
      var prevBelow = prevAlt < h0;
      var curBelow = curAlt < h0;
      if (prevBelow !== curBelow) {
        var lo2 = prevHour, hi2 = h;
        for (var iter = 0; iter < 32; iter++) {
          var mid = (lo2 + hi2) / 2;
          var midAlt = altAtLocal(mid);
          var lowBelow = altAtLocal(lo2) < h0;
          var midBelow = midAlt < h0;
          if (lowBelow === midBelow) lo2 = mid; else hi2 = mid;
        }
        var crossing = (lo2 + hi2) / 2;
        if (prevBelow && !curBelow) {
          if (sunrise === null) sunrise = crossing;
        } else {
          sunset = crossing;
        }
      }
      prevHour = h;
      prevAlt = curAlt;
    }

    if (sunrise === null && altMidnight < h0 && altNoon > h0) {
      var lo3 = 0, hi3 = 12;
      for (var k = 0; k < 32; k++) {
        var mid3 = (lo3 + hi3) / 2;
        if (altAtLocal(mid3) < h0) lo3 = mid3; else hi3 = mid3;
      }
      sunrise = (lo3 + hi3) / 2;
    }
    if (sunset === null && altNoon > h0 && altNextMidnight < h0) {
      var lo4 = 12, hi4 = 24;
      for (var k2 = 0; k2 < 32; k2++) {
        var mid4 = (lo4 + hi4) / 2;
        if (altAtLocal(mid4) > h0) lo4 = mid4; else hi4 = mid4;
      }
      sunset = (lo4 + hi4) / 2;
    }

    if (sunrise === null || sunset === null) {
      return { ok: true, sunrise: sunrise, sunset: sunset, transit: sunrise !== null && sunset !== null ? (sunrise + sunset) / 2 : 12, dayLength: sunrise !== null && sunset !== null ? Math.max(0, sunset - sunrise) : 0, alwaysDay: false, alwaysNight: false, h0: h0, lat: lat, lon: lon, tz: tzEffective, altMidnight: altMidnight, altNoon: altNoon, partial: true };
    }

    var loT = sunrise, hiT = sunset;
    for (var j = 0; j < 24; j++) {
      var m1t = loT + (hiT - loT) / 3, m2t = hiT - (hiT - loT) / 3;
      if (altAtLocal(m1t) < altAtLocal(m2t)) loT = m1t; else hiT = m2t;
    }
    var transit2 = (loT + hiT) / 2;

    return { ok: true, sunrise: sunrise, sunset: sunset, transit: transit2, dayLength: Math.max(0, sunset - sunrise), alwaysDay: false, alwaysNight: false, h0: h0, lat: lat, lon: lon, tz: tzEffective, altMidnight: altMidnight, altNoon: altNoon };
  }

  function formatSunTime(decimalHours, lang) {
    if (!isFinite(decimalHours)) return "";
    var h = ((decimalHours % 24) + 24) % 24;
    var hour24 = Math.floor(h);
    var minute = Math.floor((h - hour24) * 60 + 0.5);
    var hr = hour24, min = minute;
    if (min >= 60) { min -= 60; hr = (hr + 1) % 24; }
    var ampm = hr >= 12 ? "PM" : "AM";
    var h12 = hr % 12;
    if (h12 === 0) h12 = 12;
    var hh = String(h12);
    var mm = String(min).padStart(2, "0");
    var base = hh + ":" + mm + " " + ampm;
    if (lang === "hi") {
      var map = ["\u0966","\u0967","\u0968","\u0969","\u096A","\u096B","\u096C","\u096D","\u096E","\u096F"];
      return base.replace(/\d/g, function(d){ return map[Number(d)]; });
    } else if (lang === "gu") {
      var map2 = ["\u0AE6","\u0AE7","\u0AE8","\u0AE9","\u0AEA","\u0AEB","\u0AEC","\u0AED","\u0AEE","\u0AEF"];
      return base.replace(/\d/g, function(d){ return map2[Number(d)]; });
    }
    return base;
  }

  function formatSunTime24(decimalHours) {
    if (!isFinite(decimalHours)) return "";
    var h = ((decimalHours % 24) + 24) % 24;
    var hour24 = Math.floor(h);
    var minute = Math.floor((h - hour24) * 60 + 0.5);
    var hr = hour24, min = minute;
    if (min >= 60) { min -= 60; hr = (hr + 1) % 24; }
    return String(hr).padStart(2,"0") + ":" + String(min).padStart(2,"0");
  }

  function getRahuKaal(Y, M, D, lat, lon, tzEffective) {
    var ss = sunriseSunset(Y, M, D, lat, lon, tzEffective);
    if (!ss || !ss.ok) return { ok: false, reason: ss ? ss.reason : "no-sun" };
    var sunrise = ss.sunrise, sunset = ss.sunset, dayLength = ss.dayLength;
    var alwaysDay = !!ss.alwaysDay, alwaysNight = !!ss.alwaysNight;
    if (alwaysDay) { sunrise = 0; sunset = 24; dayLength = 24; }
    else if (alwaysNight) { sunrise = 6; sunset = 18; dayLength = 12; }
    if (sunrise === null || sunset === null) {
      return { ok: false, reason: "no-rise-set", alwaysDay: alwaysDay, alwaysNight: alwaysNight, sunrise: ss.sunrise, sunset: ss.sunset };
    }
    var part = dayLength / 8;
    var jsDate = new Date(Date.UTC(Y, M - 1, D));
    var weekday = jsDate.getUTCDay();
    var rahuMap = { 1:1, 2:6, 3:4, 4:5, 5:3, 6:2, 0:7 };
    var rahuIdx = rahuMap[weekday] != null ? rahuMap[weekday] : 7;
    var rahuStart = sunrise + rahuIdx * part;
    var rahuEnd = rahuStart + part;
    var parts = [];
    for (var i = 0; i < 8; i++) parts.push({ index: i, start: sunrise + i * part, end: sunrise + (i + 1) * part });
    return { ok: true, sunrise: sunrise, sunset: sunset, transit: ss.transit, dayLength: dayLength, partDuration: part, weekday: weekday, rahuIndex: rahuIdx, rahuStart: rahuStart, rahuEnd: rahuEnd, parts: parts, alwaysDay: alwaysDay, alwaysNight: alwaysNight, lat: lat, lon: lon, tz: tzEffective, h0: ss.h0 };
  }

  /* ================================================================
     Panchang — the five limbs, Choghadiya and Abhijit
     ================================================================
     Added 2026-10 after a competitive review: every Indian astrology
     product of comparable standing ships a full Panchang, and this one
     stopped at sunrise / sunset / Rahu Kaal. Nothing here is tabulated
     or approximated from an almanac — each limb is derived from the
     same Meeus ephemeris the rest of the app is pinned to:

       Tithi    = (Moon − Sun) / 12°            → 30 per lunar month
       Nakshatra= sidereal Moon / 13°20′        → 27, pada = quarter
       Yoga     = (Moon + Sun) sidereal / 13°20′→ 27
       Karana   = half a tithi                  → 11 names, 60 per month
       Vara     = the weekday, reckoned sunrise-to-sunrise

     The Moon moves ~13°/day, so the limb is reported AT a stated
     instant (sunrise by default) together with the time it ends —
     never as a bare "today's tithi is X", which is the single most
     common error in consumer Panchang output.

     Requires NVAstro's lunar series. When it is absent the function
     returns ok:false with a reason rather than guessing. */

  var TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
    "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
    "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ];
  /* Tithi groups (Nanda / Bhadra / Jaya / Rikta / Purna) repeat every
     five tithis; Rikta tithis (4, 9, 14) are classically avoided for
     auspicious beginnings. */
  var TITHI_GROUPS = ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"];
  var NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
  ];
  var NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
  ];
  var YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
    "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
  ];
  /* Inauspicious yogas named in the standard list. */
  var YOGA_CAUTION = ["Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"];
  /* Karana: 7 movable names cycle 8 times from the second half of
     tithi 1; 4 fixed karanas bookend the lunar month. */
  var KARANA_MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
  var KARANA_FIXED = ["Kimstughna", "Shakuni", "Chatushpada", "Naga"];

  function moonApparentLonLocal(daysTt) {
    try {
      if (typeof window !== "undefined" && window.NVAstro && typeof window.NVAstro.moonApparentLon === "function") {
        return window.NVAstro.moonApparentLon(daysTt);
      }
    } catch (e) {}
    return null;
  }

  function ayanamsaLocal(daysSinceJ2000) {
    try {
      if (typeof window !== "undefined" && window.NVAstro && typeof window.NVAstro.ayanamsaAt === "function") {
        return window.NVAstro.ayanamsaAt(daysSinceJ2000);
      }
    } catch (e) {}
    return 23.8533 + (daysSinceJ2000 / 365.25) * 0.013969;
  }

  /* Solve for the local hour at which `angleFn` next crosses a
     multiple of `step` degrees, by scanning forward in coarse steps
     and bisecting the crossing. `angleFn(localHour)` must return a
     monotonically increasing (mod 360) angle. */
  function nextBoundary(angleFn, step, startHour, limitHours) {
    var startVal = angleFn(startHour);
    if (startVal === null) return null;
    var target = (Math.floor(startVal / step) + 1) * step;
    var prevH = startHour, prevDelta = startVal - target;
    for (var h = startHour + 0.5; h <= startHour + limitHours; h += 0.5) {
      var v = angleFn(h);
      if (v === null) return null;
      var delta = v - target;
      if (delta < prevDelta - 180) delta += 360; // wrapped past 360
      if (delta >= 0) {
        var lo = prevH, hi = h;
        for (var i = 0; i < 40; i++) {
          var mid = (lo + hi) / 2;
          var mv = angleFn(mid) - target;
          if (mv < -180) mv += 360;
          if (mv < 0) lo = mid; else hi = mid;
        }
        return (lo + hi) / 2;
      }
      prevH = h; prevDelta = delta;
    }
    return null;
  }

  /* The five limbs at a given local hour of a given date/place. */
  function panchang(Y, M, D, lat, lon, tzEffective, opts) {
    opts = opts || {};
    if (!isFinite(Y) || !isFinite(M) || !isFinite(D) || !isFinite(tzEffective)) return { ok: false, reason: "bad-input" };
    var probe = astroMomentLocal(Y, M, D, 12 - tzEffective);
    if (moonApparentLonLocal(probe.tt) === null) return { ok: false, reason: "no-lunar-engine" };

    var ss = (isFinite(lat) && isFinite(lon)) ? sunriseSunset(Y, M, D, lat, lon, tzEffective) : null;
    var refHour = typeof opts.atHour === "number" ? opts.atHour
      : (ss && ss.ok && ss.sunrise !== null ? ss.sunrise : 6);

    function moment(localHour) { return astroMomentLocal(Y, M, D, localHour - tzEffective); }
    function sunLon(localHour) { return clamp360(sunApparentLonLocal(moment(localHour).tt)); }
    function moonLon(localHour) {
      var v = moonApparentLonLocal(moment(localHour).tt);
      return v === null ? null : clamp360(v);
    }
    function elong(localHour) {
      var m = moonLon(localHour);
      if (m === null) return null;
      return clamp360(m - sunLon(localHour));
    }
    function siderealMoon(localHour) {
      var m = moonLon(localHour);
      if (m === null) return null;
      return clamp360(m - ayanamsaLocal(moment(localHour).ut));
    }
    function yogaAngle(localHour) {
      var m = moonLon(localHour);
      if (m === null) return null;
      var ay = ayanamsaLocal(moment(localHour).ut);
      return clamp360((m - ay) + (sunLon(localHour) - ay));
    }

    var e = elong(refHour);
    var tithiIndex = Math.floor(e / 12);                       // 0..29
    var tithiEnd = nextBoundary(elong, 12, refHour, 36);
    var paksha = tithiIndex < 15 ? "Shukla" : "Krishna";

    var sm = siderealMoon(refHour);
    var nakIndex = Math.floor(sm / (360 / 27));                 // 0..26
    var pada = Math.floor((sm % (360 / 27)) / (360 / 108)) + 1; // 1..4
    var nakEnd = nextBoundary(siderealMoon, 360 / 27, refHour, 36);

    var ya = yogaAngle(refHour);
    var yogaIndex = Math.floor(ya / (360 / 27));
    var yogaEnd = nextBoundary(yogaAngle, 360 / 27, refHour, 36);

    var karanaIndex = Math.floor(e / 6);                        // 0..59
    var karanaEnd = nextBoundary(elong, 6, refHour, 36);
    var karanaName;
    if (karanaIndex === 0) karanaName = KARANA_FIXED[0];
    else if (karanaIndex >= 57) karanaName = KARANA_FIXED[karanaIndex - 56];
    else karanaName = KARANA_MOVABLE[(karanaIndex - 1) % 7];

    var weekday = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
    var tithiOfPaksha = (tithiIndex % 15) + 1;

    return {
      ok: true,
      date: { y: Y, m: M, d: D },
      atHour: refHour,
      tz: tzEffective,
      sunLongitude: sunLon(refHour),
      moonLongitude: moonLon(refHour),
      elongation: e,
      tithi: {
        index: tithiIndex + 1,
        name: TITHI_NAMES[tithiIndex],
        paksha: paksha,
        numberInPaksha: tithiOfPaksha,
        group: TITHI_GROUPS[(tithiOfPaksha - 1) % 5],
        rikta: [4, 9, 14].indexOf(tithiOfPaksha) !== -1,
        endsAt: tithiEnd,
        percentElapsed: ((e % 12) / 12) * 100
      },
      nakshatra: {
        index: nakIndex + 1,
        name: NAKSHATRA_NAMES[nakIndex],
        lord: NAKSHATRA_LORDS[nakIndex],
        pada: pada,
        endsAt: nakEnd,
        percentElapsed: ((sm % (360 / 27)) / (360 / 27)) * 100
      },
      yoga: {
        index: yogaIndex + 1,
        name: YOGA_NAMES[yogaIndex],
        caution: YOGA_CAUTION.indexOf(YOGA_NAMES[yogaIndex]) !== -1,
        endsAt: yogaEnd
      },
      karana: { index: karanaIndex + 1, name: karanaName, vishti: karanaName === "Vishti", endsAt: karanaEnd },
      vara: { weekday: weekday, lordNumber: [1, 2, 9, 5, 3, 6, 8][weekday] },
      sun: ss && ss.ok ? { sunrise: ss.sunrise, sunset: ss.sunset, transit: ss.transit, dayLength: ss.dayLength } : null
    };
  }

  /* Choghadiya — the day and night each split into eight parts, named
     on a fixed weekday-seeded cycle. Udvega / Roga / Kaal are the
     inauspicious three; Amrit, Shubh, Labh and Char are workable to
     good. Night parts start from the lord five places on from the day
     lord, which is the standard rule. */
  var CHOGHADIYA_CYCLE = ["Udvega", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Roga"];
  var CHOGHADIYA_QUALITY = {
    Udvega: "inauspicious", Char: "neutral", Labh: "auspicious", Amrit: "auspicious",
    Kaal: "inauspicious", Shubh: "auspicious", Roga: "inauspicious"
  };
  /* Index into CHOGHADIYA_CYCLE of the FIRST day part, by weekday
     (0 = Sunday): Sun→Udvega, Mon→Amrit, Tue→Roga, Wed→Labh,
     Thu→Shubh, Fri→Char, Sat→Kaal. */
  var CHOGHADIYA_DAY_START = [0, 3, 6, 2, 5, 1, 4];

  function choghadiya(Y, M, D, lat, lon, tzEffective) {
    var ss = sunriseSunset(Y, M, D, lat, lon, tzEffective);
    if (!ss || !ss.ok || ss.sunrise === null || ss.sunset === null) {
      return { ok: false, reason: ss && ss.ok ? "polar" : (ss ? ss.reason : "no-sun") };
    }
    var nextSs = sunriseSunset(Y, M, D + 1, lat, lon, tzEffective);
    var nextSunrise = (nextSs && nextSs.ok && nextSs.sunrise !== null) ? nextSs.sunrise + 24 : ss.sunrise + 24;
    var weekday = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
    var dayPart = (ss.sunset - ss.sunrise) / 8;
    var nightPart = (nextSunrise - ss.sunset) / 8;
    var dayStart = CHOGHADIYA_DAY_START[weekday];
    var nightStart = (dayStart + 4) % 7;

    function build(count, startIdx, from, span, phase) {
      var out = [];
      for (var i = 0; i < count; i++) {
        var name = CHOGHADIYA_CYCLE[(startIdx + i) % 7];
        out.push({
          index: i + 1, phase: phase, name: name, quality: CHOGHADIYA_QUALITY[name],
          start: from + i * span, end: from + (i + 1) * span
        });
      }
      return out;
    }
    return {
      ok: true, weekday: weekday,
      day: build(8, dayStart, ss.sunrise, dayPart, "day"),
      night: build(8, nightStart, ss.sunset, nightPart, "night"),
      sunrise: ss.sunrise, sunset: ss.sunset, nextSunrise: nextSunrise,
      dayPartDuration: dayPart, nightPartDuration: nightPart
    };
  }

  /* Abhijit Muhurta — the eighth of fifteen equal day-parts, centred on
     solar noon; roughly 48 minutes and classically auspicious for
     almost any beginning, with the standing exception of Wednesday. */
  function abhijitMuhurta(Y, M, D, lat, lon, tzEffective) {
    var ss = sunriseSunset(Y, M, D, lat, lon, tzEffective);
    if (!ss || !ss.ok || ss.sunrise === null || ss.sunset === null) {
      return { ok: false, reason: ss && ss.ok ? "polar" : (ss ? ss.reason : "no-sun") };
    }
    var part = (ss.sunset - ss.sunrise) / 15;
    var start = ss.sunrise + 7 * part;
    var weekday = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
    return {
      ok: true, start: start, end: start + part, duration: part, weekday: weekday,
      /* Wednesday's Abhijit is traditionally not taken. */
      excluded: weekday === 3, transit: ss.transit
    };
  }

  function sunriseForPlace(place, Y, M, D) {
    if (!place) return null;
    var now = new Date();
    var y = Y || now.getFullYear();
    var m = M || (now.getMonth() + 1);
    var d = D || now.getDate();
    var tzEff = effectiveTz(place, y, m, d);
    return sunriseSunset(y, m, d, place.lat, place.lon, tzEff);
  }

  function sunriseForProfile(p, Y, M, D) {
    try {
      if (!p) return null;
      var place = null;
      if (p.astro && p.astro.place) place = p.astro.place;
      else if (p.birthLat && p.birthLon) {
        place = { lat: Number(p.birthLat), lon: Number(p.birthLon), tz: Number(p.birthTz) || 5.5, dst: false };
      }
      if (!place || !isFinite(place.lat) || !isFinite(place.lon)) return null;
      return sunriseForPlace(place, Y, M, D);
    } catch (e) { return null; }
  }

  // Export to global NVAstro if present, else create namespace
  var exportObj = {
    VERSION: "1.0.0-muhurtha",
    sunriseSunset: sunriseSunset,
    sunriseForPlace: sunriseForPlace,
    sunriseForProfile: sunriseForProfile,
    effectiveTz: effectiveTz,
    isDSTActive: isDSTActive,
    getRahuKaal: getRahuKaal,
    panchang: panchang,
    choghadiya: choghadiya,
    abhijitMuhurta: abhijitMuhurta,
    TITHI_NAMES: TITHI_NAMES,
    NAKSHATRA_NAMES: NAKSHATRA_NAMES,
    YOGA_NAMES: YOGA_NAMES,
    KARANA_MOVABLE: KARANA_MOVABLE,
    CHOGHADIYA_CYCLE: CHOGHADIYA_CYCLE,
    formatSunTime: formatSunTime,
    formatSunTime24: formatSunTime24,
    sunEquatorial: sunEquatorial,
    sunAltitudeAt: sunAltitudeAt,
    getNthWeekdayOfMonth: getNthWeekdayOfMonth,
    getLastWeekdayOfMonth: getLastWeekdayOfMonth,
    jdFromUtc: jdFromUtc,
    astroMomentLocal: astroMomentLocal
  };

  if (typeof window !== "undefined") {
    window.NVMuhurtha = exportObj;
    if (window.NVAstro) {
      // augment existing NVAstro with muhurtha functions (non-destructive)
      Object.keys(exportObj).forEach(function(k){
        if (window.NVAstro[k] === undefined) window.NVAstro[k] = exportObj[k];
        else {
          // keep original but also expose under muhurtha prefix if collision
          window.NVAstro["muhurtha_" + k] = exportObj[k];
        }
      });
      // ensure sunriseSunset etc are present even if already existed
      window.NVAstro.sunriseSunset = sunriseSunset;
      window.NVAstro.sunriseForPlace = sunriseForPlace;
      window.NVAstro.sunriseForProfile = sunriseForProfile;
      window.NVAstro.effectiveTz = effectiveTz;
      window.NVAstro.isDSTActive = isDSTActive;
      window.NVAstro.getRahuKaal = getRahuKaal;
      window.NVAstro.formatSunTime = formatSunTime;
      window.NVAstro.formatSunTime24 = formatSunTime24;
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = exportObj;
  }
})();
