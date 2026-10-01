/* ============================================================
   NumeroVastu 360 — iCalendar (RFC 5545) writer
   ============================================================

   WHY THIS EXISTS, AND WHY IT IS NOT A NOTIFICATION SYSTEM
   -------------------------------------------------------
   A client who wants their 40-day practice to show up beside their
   work and family commitments has exactly two options. One is a push
   notification daemon: a service worker subscription, a permission
   prompt, a background wake-up, a vendor push endpoint, and a server
   that knows when you last opened the app. That is retention
   machinery built for ad-supported portals that must manufacture
   daily active users, and it is the opposite of what a consultation
   dossier should do to a person.

   The other is this file. The client taps a button, the browser
   serialises a static text file on the device, and the file is theirs.
   They import it into whichever calendar they already live in, and
   from that moment the app is not involved at all — no subscription,
   no permission, no background process, no battery cost, no server
   that learns their practice habits, and nothing to revoke except a
   calendar entry they can delete themselves.

   Everything below is therefore deliberately one-way and inert: a pure
   string serialiser with no DOM access, no network access, no storage
   and no clock of its own beyond the timestamp the caller passes in.

   DESIGN NOTES THAT MATTER FOR CORRECTNESS
   ----------------------------------------
   * Line folding is measured in OCTETS, not characters (RFC 5545 §3.1).
     Devanagari and Gujarati text is 3 bytes per character in UTF-8, so
     a naive 75-character fold produces lines that are 225 bytes long
     and calendar clients truncate them. The folder below counts real
     UTF-8 bytes and refuses to split inside a character or a surrogate
     pair, which is the single most common way a hand-rolled .ics file
     corrupts non-Latin text.

   * Times are written as FLOATING local time (no TZID, no Z suffix).
     For a sunrise practice this is the semantically correct choice: the
     event means "at this clock time, where you are", and it avoids
     shipping a VTIMEZONE database for every zone on earth. The export
     card states this to the client in plain language rather than
     leaving them to discover it after a flight.

   * UIDs are derived from a non-reversible hash of the profile key, not
     from the name or date of birth. A calendar entry frequently syncs
     to Google or Exchange, and a UID of "priya-sharma-1995-04-12@..."
     would quietly export a client's identity and birth date to a third
     party the consultation never agreed to involve. The hash is lossy
     and one-way; what it buys is that re-exporting after changing
     practice depth UPDATES the existing entries instead of duplicating
     all forty of them.
   ============================================================ */
(function (global) {
  "use strict";

  var PRODID = "-//NumeroVastu 360//Practice Calendar//EN";
  var FOLD_OCTETS = 75;

  /* ---------- UTF-8 aware primitives ---------- */

  /* Byte length of one code point in UTF-8. Kept explicit rather than
     using TextEncoder so the module stays usable in any JS host. */
  function octetsOf(codePoint) {
    if (codePoint < 0x80) return 1;
    if (codePoint < 0x800) return 2;
    if (codePoint < 0x10000) return 3;
    return 4;
  }

  function byteLength(text) {
    var total = 0;
    var s = String(text);
    for (var i = 0; i < s.length;) {
      var cp = s.codePointAt(i);
      total += octetsOf(cp);
      i += cp > 0xFFFF ? 2 : 1;
    }
    return total;
  }

  /* RFC 5545 §3.1 — no content line may exceed 75 octets; longer lines
     are split and continued with a single leading space. The split must
     land on a character boundary, so this walks code points rather than
     UTF-16 units and keeps surrogate pairs intact. */
  function foldLine(line) {
    var s = String(line);
    if (byteLength(s) <= FOLD_OCTETS) return s;
    var out = [];
    var chunk = "";
    var used = 0;
    /* A continuation line spends one octet on its leading space. */
    var budget = FOLD_OCTETS;
    for (var i = 0; i < s.length;) {
      var cp = s.codePointAt(i);
      var step = cp > 0xFFFF ? 2 : 1;
      var size = octetsOf(cp);
      if (used + size > budget) {
        out.push(chunk);
        chunk = "";
        used = 0;
        budget = FOLD_OCTETS - 1;
      }
      chunk += s.substr(i, step);
      used += size;
      i += step;
    }
    if (chunk) out.push(chunk);
    return out.join("\r\n ");
  }

  /* RFC 5545 §3.3.11 — backslash must be escaped first or the escapes
     introduced for the other characters get double-escaped. */
  function escapeText(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r\n|\r|\n/g, "\\n");
  }

  /* Property parameter values have their own, narrower rules. */
  function escapeParam(value) {
    return String(value === undefined || value === null ? "" : value).replace(/"/g, "'").replace(/[\r\n]+/g, " ");
  }

  function pad(n, width) {
    var s = String(Math.abs(Math.trunc(Number(n) || 0)));
    while (s.length < (width || 2)) s = "0" + s;
    return s;
  }

  /* ---------- date and time stamps ---------- */

  /* A civil date with no time part: DATE value, used for all-day events. */
  function stampDate(parts) {
    return pad(parts.y, 4) + pad(parts.m) + pad(parts.d);
  }

  /* Floating local date-time: no Z, no TZID. */
  function stampLocal(parts) {
    return stampDate(parts) + "T" + pad(parts.h || 0) + pad(parts.mi || 0) + pad(parts.s || 0);
  }

  /* UTC date-time, used only for DTSTAMP, which must be absolute. */
  function stampUtc(date) {
    var d = date instanceof Date ? date : new Date(date);
    return pad(d.getUTCFullYear(), 4) + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate())
      + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  }

  /* Civil-date arithmetic. Uses a local Date at noon so a daylight-saving
     transition can never roll the result into the previous or next day,
     which is the classic off-by-one in date-only loops. */
  function addDays(parts, n) {
    var base = new Date(parts.y, parts.m - 1, parts.d, 12, 0, 0, 0);
    base.setDate(base.getDate() + Math.trunc(Number(n) || 0));
    return { y: base.getFullYear(), m: base.getMonth() + 1, d: base.getDate() };
  }

  /* Decimal hours (the form every solar routine in this app returns)
     into clock parts, rolling correctly past midnight. */
  function fromDecimalHours(parts, dec) {
    var value = Number(dec);
    if (!isFinite(value)) return null;
    var dayShift = Math.floor(value / 24);
    var within = value - dayShift * 24;
    var totalMinutes = Math.round(within * 60);
    if (totalMinutes >= 1440) { totalMinutes -= 1440; dayShift += 1; }
    var base = dayShift ? addDays(parts, dayShift) : { y: parts.y, m: parts.m, d: parts.d };
    return { y: base.y, m: base.m, d: base.d, h: Math.floor(totalMinutes / 60), mi: totalMinutes % 60, s: 0 };
  }

  function addMinutes(parts, minutes) {
    var total = (parts.h || 0) * 60 + (parts.mi || 0) + Math.trunc(Number(minutes) || 0);
    var dayShift = Math.floor(total / 1440);
    var within = ((total % 1440) + 1440) % 1440;
    var base = dayShift ? addDays(parts, dayShift) : { y: parts.y, m: parts.m, d: parts.d };
    return { y: base.y, m: base.m, d: base.d, h: Math.floor(within / 60), mi: within % 60, s: 0 };
  }

  /* ---------- identity ---------- */

  /* FNV-1a, 32-bit. Chosen because it is four lines long and lossy: the
     point is a stable opaque token, explicitly NOT a reversible encoding
     of the client's identity. Collisions across two profiles on one
     device are harmless — they would simply overwrite each other's
     calendar entries, which is also what the client would expect. */
  function hash32(text) {
    var h = 0x811c9dc5;
    var s = String(text);
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(36);
  }

  function uidFor(profileKey, slot) {
    return "nv" + hash32(profileKey || "anonymous") + "-" + String(slot).replace(/[^A-Za-z0-9_-]/g, "") + "@numerovastu-360.local";
  }

  /* ---------- event serialisation ---------- */

  /* spec = {
       uid, summary, description, location, categories,
       allDay, start:{y,m,d[,h,mi]}, end:{...}, days (all-day span),
       transparent, alarmMinutes, sequence, url
     } */
  function event(spec, stampedAt) {
    if (!spec || !spec.start || !spec.uid) return [];
    var lines = ["BEGIN:VEVENT"];
    lines.push("UID:" + escapeText(spec.uid));
    lines.push("DTSTAMP:" + stampUtc(stampedAt || new Date()));
    if (spec.sequence) lines.push("SEQUENCE:" + Math.trunc(spec.sequence));

    if (spec.allDay) {
      /* DTEND for a DATE value is exclusive, so a single-day event ends
         on the following day. Getting this wrong renders a one-day event
         as a two-day banner in Google Calendar. */
      var span = Math.max(1, Math.trunc(Number(spec.days) || 1));
      lines.push("DTSTART;VALUE=DATE:" + stampDate(spec.start));
      lines.push("DTEND;VALUE=DATE:" + stampDate(addDays(spec.start, span)));
    } else {
      lines.push("DTSTART:" + stampLocal(spec.start));
      lines.push("DTEND:" + stampLocal(spec.end || addMinutes(spec.start, 30)));
    }

    lines.push("SUMMARY:" + escapeText(spec.summary || ""));
    if (spec.description) lines.push("DESCRIPTION:" + escapeText(spec.description));
    if (spec.location) lines.push("LOCATION:" + escapeText(spec.location));
    if (spec.categories && spec.categories.length) {
      lines.push("CATEGORIES:" + spec.categories.map(function (c) { return escapeText(c); }).join(","));
    }
    /* TRANSPARENT keeps an advisory window from marking the client busy
       and blocking colleagues from booking over it. An inauspicious
       window is information, not an appointment. */
    lines.push("TRANSP:" + (spec.transparent ? "TRANSPARENT" : "OPAQUE"));
    lines.push("STATUS:CONFIRMED");

    /* A VALARM is the client's own calendar reminding them, with no
       permission prompt, no push endpoint and nothing running in the
       background. It is only ever emitted when they explicitly ask. */
    if (isFinite(Number(spec.alarmMinutes)) && Number(spec.alarmMinutes) > 0) {
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:" + escapeText(spec.summary || "Practice"));
      lines.push("TRIGGER:-PT" + Math.trunc(Number(spec.alarmMinutes)) + "M");
      lines.push("END:VALARM");
    }

    lines.push("END:VEVENT");
    return lines;
  }

  function calendar(events, options) {
    var opts = options || {};
    var stampedAt = opts.now || new Date();
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:" + PRODID, "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    if (opts.name) {
      /* Non-standard but near-universally honoured; without it the import
         lands in a calendar called "Untitled". */
      lines.push("X-WR-CALNAME:" + escapeText(opts.name));
    }
    if (opts.description) lines.push("X-WR-CALDESC:" + escapeText(opts.description));
    (events || []).forEach(function (spec) {
      Array.prototype.push.apply(lines, Array.isArray(spec) ? spec : event(spec, stampedAt));
    });
    lines.push("END:VCALENDAR");
    /* RFC 5545 §3.1: content lines are delimited by CRLF, and the file
       ends with one. */
    return lines.map(foldLine).join("\r\n") + "\r\n";
  }

  /* Report text is assembled as HTML, but a calendar DESCRIPTION is plain
     text. Tags are dropped first and entities decoded second — the other
     order would turn an escaped "&lt;b&gt;" in a client's own name into a
     tag and then delete it. */
  function htmlToPlain(html) {
    return String(html === undefined || html === null ? "" : html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&amp;/g, "&")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  var API = {
    PRODID: PRODID,
    FOLD_OCTETS: FOLD_OCTETS,
    byteLength: byteLength,
    foldLine: foldLine,
    escapeText: escapeText,
    escapeParam: escapeParam,
    stampDate: stampDate,
    stampLocal: stampLocal,
    stampUtc: stampUtc,
    addDays: addDays,
    addMinutes: addMinutes,
    fromDecimalHours: fromDecimalHours,
    hash32: hash32,
    uidFor: uidFor,
    event: event,
    calendar: calendar,
    htmlToPlain: htmlToPlain
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (global) global.NVCalendar = API;
})(typeof window !== "undefined" ? window : this);
