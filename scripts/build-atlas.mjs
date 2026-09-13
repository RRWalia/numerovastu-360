#!/usr/bin/env node
/**
 * Build compact regional atlas chunks for NumeroVastu 360.
 *
 * Preferred source: GeoNames IN.zip (PPLA–PPLA4 + PPL population ≥ 5000).
 * When download.geonames.org is blocked, fall back to local dumps:
 *   - geonamescache cities500.json  (best India coverage)
 *   - country-state-city city.json  (GCC extras; India districts are skipped)
 *   - cities.json admin1.json       (admin1 display names)
 *
 * Output (classic IIFE, no import()):
 *   atlas/atlas-in.js    India towns, default-loaded
 *   atlas/atlas-gcc.js   Gulf (AE SA QA KW BH OM), lazy
 *   atlas/atlas-world.js top 5000 pop ≥ 100k excluding IN+GCC, lazy
 *
 * Packed rows:
 *   IN:    Name|lat*100|lon*100|adminIdx
 *   other: Name|lat*100|lon*100|tzIdx|cc|adminIdx
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "atlas");
const CACHE_DIR = path.join(ROOT, ".cache", "geonames");

const GCC = new Set(["AE", "SA", "QA", "KW", "BH", "OM"]);
const GCC_TZ = {
  AE: [4, false],
  OM: [4, false],
  SA: [3, false],
  QA: [3, false],
  KW: [3, false],
  BH: [3, false]
};
const WORLD_LIMIT = 5000;
const WORLD_MIN_POP = 100000;
const SIZE_WARN = 250000;

const SOURCE_CANDIDATES = {
  cities500: [
    path.join(CACHE_DIR, "cities500.json"),
    "/tmp/gnc/geonamescache/data/cities500.json"
  ],
  admin1: [
    path.join(CACHE_DIR, "admin1.json"),
    "/tmp/citydata/cjson/package/admin1.json"
  ],
  csc: [
    path.join(CACHE_DIR, "csc-city.json"),
    "/tmp/citydata/csc/package/lib/cjs/assets/city.json"
  ],
  cities1000: [
    path.join(CACHE_DIR, "cities1000.txt"),
    "/tmp/citydata/c1000/package/cities1000.txt"
  ]
};

function findFile(key) {
  for (const p of SOURCE_CANDIDATES[key] || []) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const ASCII_NAME = /^[A-Z][A-Za-z .'-]+$/;

function stripDiacritics(s) {
  return String(s || "").normalize("NFKD").replace(/\p{M}/gu, "");
}

function foldKey(s) {
  return stripDiacritics(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function packName(s) {
  return String(s || "").replace(/[\n\r|]/g, " ").replace(/\s+/g, " ").trim();
}

function niceAscii(name, alternates) {
  const n = packName(name);
  if (ASCII_NAME.test(n) && n.length >= 2 && n.length <= 48) return n;
  const list = Array.isArray(alternates)
    ? alternates
    : String(alternates || "").split(",");
  let best = "";
  for (const raw of list) {
    const t = packName(raw);
    if (!ASCII_NAME.test(t) || t.length < 2 || t.length > 40) continue;
    if (!best || t.length < best.length) best = t;
  }
  if (best) return best;
  const stripped = packName(stripDiacritics(n));
  if (/^[A-Za-z][A-Za-z .'-]*$/.test(stripped) && stripped.length >= 2) {
    return stripped.replace(/^[a-z]/, (c) => c.toUpperCase());
  }
  const ascii = stripped.replace(/[^\x20-\x7E]/g, "").trim();
  return ascii.length >= 2 ? ascii : n;
}

function offsetHours(zone, iso) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "longOffset"
    }).formatToParts(new Date(iso));
    const v = (parts.find((p) => p.type === "timeZoneName") || {}).value || "";
    const m = v.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return 0;
    const h = Number(m[2]) + (m[3] ? Number(m[3]) / 60 : 0);
    return m[1] === "+" ? h : -h;
  } catch {
    return 0;
  }
}

const TZ_CACHE = new Map();
function zoneOffset(zone) {
  if (!zone) return [0, false];
  if (TZ_CACHE.has(zone)) return TZ_CACHE.get(zone);
  const jan = offsetHours(zone, "2026-01-15T12:00:00Z");
  const jul = offsetHours(zone, "2026-07-15T12:00:00Z");
  const hours = Math.abs(jan) <= Math.abs(jul) ? jan : jul;
  const dst = jan !== jul;
  const slot = [hours, dst];
  TZ_CACHE.set(zone, slot);
  return slot;
}

async function tryDownloadGeonames() {
  const url = "https://download.geonames.org/export/dump/IN.zip";
  const dest = path.join(CACHE_DIR, "IN.zip");
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return dest;
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 8000);
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`downloaded ${url} (${buf.length} bytes)`);
    return dest;
  } catch (err) {
    console.log(`GeoNames dump unavailable (${err.message || err}); using local fallbacks.`);
    return null;
  }
}

function loadAdmin1() {
  const file = findFile("admin1");
  const map = new Map();
  if (!file) return map;
  const rows = readJson(file);
  for (const row of rows) {
    if (row && row.code) map.set(String(row.code), String(row.name || ""));
  }
  console.log(`admin1 names: ${map.size} from ${file}`);
  return map;
}

function loadCities500() {
  const file = findFile("cities500");
  if (!file) throw new Error("cities500.json not found. Place geonamescache data under .cache/geonames/ or /tmp/gnc/geonamescache/data/");
  const raw = readJson(file);
  const list = Array.isArray(raw) ? raw : Object.values(raw);
  console.log(`cities500: ${list.length} from ${file}`);
  return list;
}

function loadCsc() {
  const file = findFile("csc");
  if (!file) return [];
  const rows = readJson(file);
  console.log(`csc cities: ${rows.length} from ${file}`);
  return rows;
}

function asCity({ name, lat, lon, cc, adminCode, adminName, population, timezone, alternatenames, source }) {
  const display = niceAscii(name, alternatenames);
  const packed = packName(display);
  if (!packed || packed.length < 2) return null;
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return {
    name: packed,
    lat: latitude,
    lon: longitude,
    cc: String(cc || "").toUpperCase(),
    adminCode: adminCode == null ? "" : String(adminCode),
    adminName: adminName || "",
    population: Number(population) || 0,
    timezone: timezone || "",
    source: source || "cities500"
  };
}

function fromGnc(row) {
  return asCity({
    name: row.name,
    lat: row.latitude,
    lon: row.longitude,
    cc: row.countrycode,
    adminCode: row.admin1code,
    population: row.population,
    timezone: row.timezone,
    alternatenames: row.alternatenames,
    source: "cities500"
  });
}

function dedupPush(bucket, city, keyFn) {
  const key = keyFn(city);
  const prev = bucket.get(key);
  if (!prev) {
    bucket.set(key, city);
    return;
  }
  if ((city.population || 0) > (prev.population || 0)) bucket.set(key, city);
}

function adminLabel(cc, adminCode, adminName, admin1) {
  if (adminName) return packName(adminName);
  if (!adminCode) return "";
  const code = String(adminCode);
  const hit = admin1.get(`${cc}.${code}`) || admin1.get(code);
  return packName(hit || "");
}

function emitIife(region, payload) {
  const json = JSON.stringify(payload);
  const key = region.toUpperCase();
  return `/* Generated by scripts/build-atlas.mjs — do not edit. */\n(function (g) {\n  "use strict";\n  g.NV_ATLAS = g.NV_ATLAS || {};\n  g.NV_ATLAS.${key} = ${json};\n  if (g.NVAstro && typeof g.NVAstro.ingestAtlas === "function") g.NVAstro.ingestAtlas(g.NV_ATLAS.${key});\n})(typeof globalThis !== "undefined" ? globalThis : this);\n`;
}

function packIn(cities, admin1) {
  const adminList = [];
  const adminIdx = new Map();
  function idxOf(label) {
    const name = packName(label);
    if (adminIdx.has(name)) return adminIdx.get(name);
    const i = adminList.length;
    adminList.push(name);
    adminIdx.set(name, i);
    return i;
  }
  const lines = [];
  for (const c of cities) {
    const state = adminLabel(c.cc, c.adminCode, c.adminName, admin1);
    const lat100 = Math.round(c.lat * 100);
    const lon100 = Math.round(c.lon * 100);
    lines.push(`${c.name}|${lat100}|${lon100}|${idxOf(state)}`);
  }
  return {
    region: "in",
    country: "India",
    cc: "IN",
    tzHours: 5.5,
    dst: false,
    format: "in",
    admin1: adminList,
    packed: lines.join("\n"),
    meta: { count: lines.length, builtAt: "2026-09-05", source: "geonamescache-cities500" }
  };
}

function packGeo(region, cities, admin1, extraCcNames) {
  const adminList = [];
  const adminIdx = new Map();
  const tzList = [];
  const tzIdx = new Map();
  const ccNames = Object.assign({}, extraCcNames || {});
  function idxAdmin(label) {
    const name = packName(label);
    if (adminIdx.has(name)) return adminIdx.get(name);
    const i = adminList.length;
    adminList.push(name);
    adminIdx.set(name, i);
    return i;
  }
  function idxTz(hours, dst) {
    const key = `${hours}|${dst ? 1 : 0}`;
    if (tzIdx.has(key)) return tzIdx.get(key);
    const i = tzList.length;
    tzList.push([hours, !!dst]);
    tzIdx.set(key, i);
    return i;
  }
  const lines = [];
  for (const c of cities) {
    let hours, dst;
    if (c.timezone) {
      const slot = zoneOffset(c.timezone);
      hours = slot[0];
      dst = slot[1];
    } else if (GCC_TZ[c.cc]) {
      hours = GCC_TZ[c.cc][0];
      dst = GCC_TZ[c.cc][1];
    } else {
      hours = Math.round(c.lon / 15);
      dst = false;
    }
    const state = adminLabel(c.cc, c.adminCode, c.adminName, admin1);
    if (c.cc && !ccNames[c.cc]) ccNames[c.cc] = c.countryName || c.cc;
    const lat100 = Math.round(c.lat * 100);
    const lon100 = Math.round(c.lon * 100);
    lines.push(`${c.name}|${lat100}|${lon100}|${idxTz(hours, dst)}|${c.cc}|${idxAdmin(state)}`);
  }
  return {
    region,
    format: "geo",
    tzTable: tzList,
    ccNames,
    admin1: adminList,
    packed: lines.join("\n"),
    meta: { count: lines.length, builtAt: "2026-09-05", source: "geonamescache-cities500" }
  };
}

const CC_NAMES = {
  AE: "United Arab Emirates", SA: "Saudi Arabia", QA: "Qatar", KW: "Kuwait",
  BH: "Bahrain", OM: "Oman", US: "USA", GB: "United Kingdom", CN: "China",
  JP: "Japan", DE: "Germany", FR: "France", IT: "Italy", ES: "Spain",
  BR: "Brazil", RU: "Russia", CA: "Canada", AU: "Australia", MX: "Mexico",
  ID: "Indonesia", PK: "Pakistan", BD: "Bangladesh", NG: "Nigeria",
  EG: "Egypt", TR: "Turkey", IR: "Iran", TH: "Thailand", PH: "Philippines",
  VN: "Vietnam", KR: "South Korea", MM: "Myanmar", ZA: "South Africa",
  AR: "Argentina", CO: "Colombia", PE: "Peru", CL: "Chile", VE: "Venezuela",
  UA: "Ukraine", PL: "Poland", NL: "Netherlands", BE: "Belgium", SE: "Sweden",
  CH: "Switzerland", AT: "Austria", GR: "Greece", PT: "Portugal", CZ: "Czechia",
  RO: "Romania", HU: "Hungary", MY: "Malaysia", SG: "Singapore", NZ: "New Zealand",
  IE: "Ireland", IL: "Israel", IQ: "Iraq", AF: "Afghanistan", NP: "Nepal",
  LK: "Sri Lanka", KE: "Kenya", TZ: "Tanzania", UG: "Uganda", GH: "Ghana",
  ET: "Ethiopia", MA: "Morocco", DZ: "Algeria", TN: "Tunisia", SD: "Sudan",
  AO: "Angola", MZ: "Mozambique", CM: "Cameroon", CI: "Côte d'Ivoire",
  SN: "Senegal", ZW: "Zimbabwe", ZM: "Zambia", RW: "Rwanda", SO: "Somalia",
  YE: "Yemen", SY: "Syria", JO: "Jordan", LB: "Lebanon", PS: "Palestine",
  KZ: "Kazakhstan", UZ: "Uzbekistan", AZ: "Azerbaijan", GE: "Georgia",
  AM: "Armenia", BY: "Belarus", LT: "Lithuania", LV: "Latvia", EE: "Estonia",
  FI: "Finland", NO: "Norway", DK: "Denmark", IS: "Iceland", GL: "Greenland",
  CU: "Cuba", DO: "Dominican Republic", GT: "Guatemala", HN: "Honduras",
  SV: "El Salvador", NI: "Nicaragua", CR: "Costa Rica", PA: "Panama",
  EC: "Ecuador", BO: "Bolivia", PY: "Paraguay", UY: "Uruguay",
  KH: "Cambodia", LA: "Laos", MN: "Mongolia", NP: "Nepal", BT: "Bhutan",
  TW: "Taiwan", HK: "Hong Kong", MO: "Macau", PR: "Puerto Rico",
  JM: "Jamaica", TT: "Trinidad and Tobago", HT: "Haiti",
  CD: "DR Congo", CG: "Congo", MG: "Madagascar", MW: "Malawi",
  NE: "Niger", ML: "Mali", BF: "Burkina Faso", GN: "Guinea",
  LY: "Libya", MR: "Mauritania", NA: "Namibia", BW: "Botswana",
  LS: "Lesotho", SZ: "Eswatini", BI: "Burundi", SS: "South Sudan",
  ER: "Eritrea", DJ: "Djibouti", GM: "Gambia", SL: "Sierra Leone",
  LR: "Liberia", TG: "Togo", BJ: "Benin", CF: "Central African Republic",
  TD: "Chad", GA: "Gabon", GQ: "Equatorial Guinea",
  AL: "Albania", MK: "North Macedonia", RS: "Serbia", ME: "Montenegro",
  BA: "Bosnia and Herzegovina", HR: "Croatia", SI: "Slovenia", SK: "Slovakia",
  BG: "Bulgaria", MD: "Moldova", CY: "Cyprus", MT: "Malta", LU: "Luxembourg",
  LI: "Liechtenstein", MC: "Monaco", AD: "Andorra", SM: "San Marino",
  VA: "Vatican City", KG: "Kyrgyzstan", TJ: "Tajikistan", TM: "Turkmenistan",
  MV: "Maldives", FJ: "Fiji", PG: "Papua New Guinea", NC: "New Caledonia",
  PF: "French Polynesia", WS: "Samoa", TO: "Tonga", VU: "Vanuatu",
  SB: "Solomon Islands", GU: "Guam", MP: "Northern Mariana Islands",
  VI: "U.S. Virgin Islands", CW: "Curaçao", SX: "Sint Maarten",
  AW: "Aruba", KY: "Cayman Islands", BM: "Bermuda", BS: "Bahamas",
  BB: "Barbados", LC: "Saint Lucia", GD: "Grenada", VC: "Saint Vincent",
  KN: "Saint Kitts and Nevis", AG: "Antigua and Barbuda", DM: "Dominica",
  SR: "Suriname", GY: "Guyana", GF: "French Guiana", BZ: "Belize",
  GT: "Guatemala", HN: "Honduras", MX: "Mexico", US: "USA", CA: "Canada",
  IN: "India", LK: "Sri Lanka", PK: "Pakistan", BD: "Bangladesh", NP: "Nepal"
};

function writeChunk(region, payload) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `atlas-${region}.js`);
  const body = emitIife(region, payload);
  fs.writeFileSync(file, body);
  const bytes = Buffer.byteLength(body);
  const warn = bytes > SIZE_WARN ? "  ** exceeds 250KB **" : "";
  console.log(`wrote ${path.relative(ROOT, file)}  ${payload.meta.count} places  ${bytes} bytes${warn}`);
  return { file, bytes, count: payload.meta.count };
}

async function main() {
  await tryDownloadGeonames();
  const admin1 = loadAdmin1();
  const gnc = loadCities500();
  const csc = loadCsc();

  const india = new Map();
  const gcc = new Map();
  const world = [];

  for (const row of gnc) {
    const city = fromGnc(row);
    if (!city) continue;
    if (city.cc === "IN") {
      dedupPush(india, city, (c) => `${foldKey(c.name)}|${c.adminCode}|${Math.round(c.lat * 100)}|${Math.round(c.lon * 100)}`);
    } else if (GCC.has(city.cc)) {
      dedupPush(gcc, city, (c) => `${foldKey(c.name)}|${c.cc}`);
    } else if ((city.population || 0) >= WORLD_MIN_POP) {
      world.push(city);
    }
  }

  const gccKeys = new Set([...gcc.keys()]);
  for (const row of csc) {
    if (!Array.isArray(row) || row.length < 5) continue;
    const [name, cc, state, lat, lon] = row;
    if (!GCC.has(cc)) continue;
    const city = asCity({
      name,
      lat,
      lon,
      cc,
      adminCode: state,
      population: 0,
      source: "csc"
    });
    if (!city) continue;
    const key = `${foldKey(city.name)}|${city.cc}`;
    if (gccKeys.has(key) || gcc.has(key)) continue;
    gcc.set(key, city);
  }

  const indiaList = [...india.values()].sort((a, b) => (b.population - a.population) || a.name.localeCompare(b.name));
  const gccList = [...gcc.values()].sort((a, b) => (b.population - a.population) || a.name.localeCompare(b.name));
  world.sort((a, b) => (b.population - a.population) || a.name.localeCompare(b.name));
  const worldList = world.slice(0, WORLD_LIMIT);

  const inPayload = packIn(indiaList, admin1);
  const gccPayload = packGeo("gcc", gccList, admin1, CC_NAMES);
  gccPayload.meta.source = "geonamescache-cities500+csc";
  const worldPayload = packGeo("world", worldList, admin1, CC_NAMES);

  const a = writeChunk("in", inPayload);
  const b = writeChunk("gcc", gccPayload);
  const c = writeChunk("world", worldPayload);
  console.log(`default payload (atlas-in.js): ${a.bytes} bytes`);
  console.log(`lazy extra (gcc+world): ${b.bytes + c.bytes} bytes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
