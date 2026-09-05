#!/usr/bin/env node
/* ============================================================
   NumeroVastu 360 — birthplace-atlas validator (maintenance)
   Verifies every entry of the offline atlas in astro.js:
     1. structural integrity — lat/lon ranges, tz range, dst flag,
        unique lookup keys, every key resolvable via matchPlace()
     2. time zones — each non-Indian entry is checked against the
        IANA zone table below via Node's ICU (Intl): the atlas
        standard offset must equal the zone's minimum (winter)
        offset, and the dst flag must match seasonal shifting.
        Morocco is special-cased (permanent +1, Ramadan −1).
     3. coordinates are validated separately against GeoNames /
        simplemaps datasets when developing (dev-only check).

   Run:  node scripts/validate-atlas.mjs
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'astro.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'astro.js' });
const NVAstro = sandbox.window.NVAstro;
if (!NVAstro || !NVAstro.cities) {
  console.error('FATAL: window.NVAstro.cities() not available — export it from astro.js');
  process.exit(1);
}
const CITIES = (typeof NVAstro.coreCities === 'function' ? NVAstro.coreCities() : NVAstro.cities());

/* IANA zone per non-Indian display name (new + legacy entries) */
const ZONES = {
  "Abidjan": "Africa/Abidjan",
  "Abuja": "Africa/Lagos",
  "Alexandria": "Africa/Cairo",
  "Amman": "Asia/Amman",
  "Andorra la Vella": "Europe/Andorra",
  "Antananarivo": "Indian/Antananarivo",
  "Antwerp": "Europe/Brussels",
  "Apia": "Pacific/Apia",
  "Ashgabat": "Asia/Ashgabat",
  "Asmara": "Africa/Asmara",
  "Asunción": "America/Asuncion",
  "Bamako": "Africa/Bamako",
  "Bangui": "Africa/Bangui",
  "Banjul": "Africa/Banjul",
  "Basseterre": "America/St_Kitts",
  "Beirut": "Asia/Beirut",
  "Belgrade": "Europe/Belgrade",
  "Belmopan": "America/Belize",
  "Belo Horizonte": "America/Sao_Paulo",
  "Benin City": "Africa/Lagos",
  "Bern": "Europe/Zurich",
  "Bishkek": "Asia/Bishkek",
  "Bissau": "Africa/Bissau",
  "Bloemfontein": "Africa/Johannesburg",
  "Brasília": "America/Sao_Paulo",
  "Bratislava": "Europe/Bratislava",
  "Brazzaville": "Africa/Brazzaville",
  "Bridgetown": "America/Barbados",
  "Bucharest": "Europe/Bucharest",
  "Budapest": "Europe/Budapest",
  "Bujumbura": "Africa/Bujumbura",
  "Bulawayo": "Africa/Harare",
  "Busan": "Asia/Seoul",
  "Cali": "America/Bogota",
  "Castries": "America/St_Lucia",
  "Chengdu": "Asia/Shanghai",
  "Chiang Mai": "Asia/Bangkok",
  "Chișinău": "Europe/Chisinau",
  "Cologne": "Europe/Berlin",
  "Conakry": "Africa/Conakry",
  "Cork": "Europe/Dublin",
  "Cotonou": "Africa/Porto-Novo",
  "Córdoba": "America/Argentina/Cordoba",
  "Dakar": "Africa/Dakar",
  "Damascus": "Asia/Damascus",
  "Dammam": "Asia/Riyadh",
  "Darwin": "Australia/Darwin",
  "Denpasar": "Asia/Makassar",
  "Djibouti City": "Africa/Djibouti",
  "Dodoma": "Africa/Dar_es_Salaam",
  "Douala": "Africa/Douala",
  "Douglas": "Europe/Isle_of_Man",
  "Dushanbe": "Asia/Dushanbe",
  "El Aaiún": "Africa/El_Aaiun",
  "Faisalabad": "Asia/Karachi",
  "Fortaleza": "America/Fortaleza",
  "Freetown": "Africa/Freetown",
  "Fukuoka": "Asia/Tokyo",
  "Funafuti": "Pacific/Funafuti",
  "Gaborone": "Africa/Gaborone",
  "Gaza City": "Asia/Gaza",
  "George Town": "America/Cayman",
  "Gibraltar": "Europe/Gibraltar",
  "Gitega": "Africa/Bujumbura",
  "Giza": "Africa/Cairo",
  "Gold Coast": "Australia/Brisbane",
  "Guadalajara": "America/Mexico_City",
  "Guangzhou": "Asia/Shanghai",
  "Guatemala City": "America/Guatemala",
  "Hagåtña": "Pacific/Guam",
  "Haifa": "Asia/Jerusalem",
  "Hamburg": "Europe/Berlin",
  "Hamilton": "Atlantic/Bermuda",
  "Harare": "Africa/Harare",
  "Hargeisa": "Africa/Mogadishu",
  "Havana": "America/Havana",
  "Herat": "Asia/Kabul",
  "Hobart": "Australia/Hobart",
  "Honiara": "Pacific/Guadalcanal",
  "Ibadan": "Africa/Lagos",
  "Jerusalem": "Asia/Jerusalem",
  "Juba": "Africa/Juba",
  "Kandahar": "Asia/Kabul",
  "Kandy": "Asia/Colombo",
  "Kano": "Africa/Lagos",
  "Kaohsiung": "Asia/Taipei",
  "Kazan": "Europe/Moscow",
  "Khartoum": "Africa/Khartoum",
  "Kigali": "Africa/Kigali",
  "Kingstown": "America/St_Vincent",
  "Kinshasa": "Africa/Kinshasa",
  "Koror": "Pacific/Palau",
  "Kraków": "Europe/Warsaw",
  "Kumasi": "Africa/Accra",
  "La Paz": "America/La_Paz",
  "Leeds": "Europe/London",
  "Libreville": "Africa/Libreville",
  "Lilongwe": "Africa/Blantyre",
  "Liverpool": "Europe/London",
  "Ljubljana": "Europe/Ljubljana",
  "Lomé": "Africa/Lome",
  "Luanda": "Africa/Luanda",
  "Lubumbashi": "Africa/Lubumbashi",
  "Lusaka": "Africa/Lusaka",
  "Luxembourg City": "Europe/Luxembourg",
  "Lyon": "Europe/Paris",
  "Macau": "Asia/Macau",
  "Majuro": "Pacific/Majuro",
  "Malabo": "Africa/Malabo",
  "Managua": "America/Managua",
  "Maputo": "Africa/Maputo",
  "Marrakesh": "Africa/Casablanca",
  "Maseru": "Africa/Maseru",
  "Mbabane": "Africa/Mbabane",
  "Mecca": "Asia/Riyadh",
  "Medellín": "America/Bogota",
  "Medina": "Asia/Riyadh",
  "Minsk": "Europe/Minsk",
  "Mogadishu": "Africa/Mogadishu",
  "Mombasa": "Africa/Nairobi",
  "Monaco": "Europe/Monaco",
  "Monrovia": "Africa/Monrovia",
  "Monterrey": "America/Mexico_City",
  "Montevideo": "America/Montevideo",
  "Moroni": "Indian/Comoro",
  "N'Djamena": "Africa/Ndjamena",
  "Naples": "Europe/Rome",
  "Naypyidaw": "Asia/Yangon",
  "Ngerulmud": "Pacific/Palau",
  "Niamey": "Africa/Niamey",
  "North Nicosia": "Europe/Istanbul",
  "Nouakchott": "Africa/Nouakchott",
  "Nouméa": "Pacific/Noumea",
  "Novosibirsk": "Asia/Novosibirsk",
  "Nuku'alofa": "Pacific/Tongatapu",
  "Nuuk": "America/Nuuk",
  "Odesa": "Europe/Kyiv",
  "Oran": "Africa/Algiers",
  "Oranjestad": "America/Aruba",
  "Ouagadougou": "Africa/Ouagadougou",
  "Palikir": "Pacific/Pohnpei",
  "Panama City": "America/Panama",
  "Papeete": "Pacific/Tahiti",
  "Peshawar": "Asia/Karachi",
  "Podgorica": "Europe/Podgorica",
  "Port Harcourt": "Africa/Lagos",
  "Port Vila": "Pacific/Efate",
  "Port-au-Prince": "America/Port-au-Prince",
  "Porto": "Europe/Lisbon",
  "Porto-Novo": "Africa/Porto-Novo",
  "Praia": "Atlantic/Cape_Verde",
  "Pretoria": "Africa/Johannesburg",
  "Pristina": "Europe/Belgrade",
  "Putrajaya": "Asia/Kuala_Lumpur",
  "Pyongyang": "Asia/Pyongyang",
  "Quebec City": "America/Toronto",
  "Quito": "America/Guayaquil",
  "Rabat": "Africa/Casablanca",
  "Ramallah": "Asia/Hebron",
  "Rawalpindi": "Asia/Karachi",
  "Recife": "America/Recife",
  "Riga": "Europe/Riga",
  "Road Town": "America/Tortola",
  "Rosario": "America/Argentina/Cordoba",
  "Roseau": "America/Dominica",
  "Rotterdam": "Europe/Amsterdam",
  "Saint Helier": "Europe/Jersey",
  "Saint Peter Port": "Europe/Guernsey",
  "Saipan": "Pacific/Saipan",
  "Salvador": "America/Bahia",
  "Samarkand": "Asia/Samarkand",
  "San José": "America/Costa_Rica",
  "San Juan": "America/Puerto_Rico",
  "San Marino": "Europe/San_Marino",
  "San Salvador": "America/El_Salvador",
  "Sana'a": "Asia/Aden",
  "Santo Domingo": "America/Santo_Domingo",
  "Sapporo": "Asia/Tokyo",
  "Sarajevo": "Europe/Sarajevo",
  "Shenzhen": "Asia/Shanghai",
  "Skopje": "Europe/Skopje",
  "Sofia": "Europe/Sofia",
  "Sri Jayawardenepura Kotte": "Asia/Colombo",
  "St George's": "America/Grenada",
  "St John's": "America/Antigua",
  "St Petersburg": "Europe/Moscow",
  "Sucre": "America/La_Paz",
  "Surabaya": "Asia/Jakarta",
  "São Tomé": "Africa/Sao_Tome",
  "Tallinn": "Europe/Tallinn",
  "Tangier": "Africa/Casablanca",
  "Tarawa": "Pacific/Tarawa",
  "Tegucigalpa": "America/Tegucigalpa",
  "The Hague": "Europe/Amsterdam",
  "Thimphu": "Asia/Thimphu",
  "Tijuana": "America/Tijuana",
  "Tirana": "Europe/Tirane",
  "Turin": "Europe/Rome",
  "Tórshavn": "Atlantic/Faroe",
  "Vaduz": "Europe/Vaduz",
  "Valencia": "Europe/Madrid",
  "Vatican City": "Europe/Vatican",
  "Vilnius": "Europe/Vilnius",
  "Vladivostok": "Asia/Vladivostok",
  "Willemstad": "America/Curacao",
  "Windhoek": "Africa/Windhoek",
  "Yamoussoukro": "Africa/Abidjan",
  "Yaoundé": "Africa/Douala",
  "Yaren": "Pacific/Nauru",
  "Yekaterinburg": "Asia/Yekaterinburg",
  "Zagreb": "Europe/Zagreb",
  "Zanzibar": "Africa/Dar_es_Salaam",
  /* — legacy world entries — */
  'Kathmandu': 'Asia/Kathmandu', 'Colombo': 'Asia/Colombo', 'Dhaka': 'Asia/Dhaka',
  'Karachi': 'Asia/Karachi', 'Lahore': 'Asia/Karachi', 'Islamabad': 'Asia/Karachi',
  'Kabul': 'Asia/Kabul', 'Tehran': 'Asia/Tehran', 'Baghdad': 'Asia/Baghdad',
  'Dubai': 'Asia/Dubai', 'Abu Dhabi': 'Asia/Dubai', 'Sharjah': 'Asia/Dubai',
  'Muscat': 'Asia/Muscat', 'Doha': 'Asia/Qatar', 'Riyadh': 'Asia/Riyadh',
  'Jeddah': 'Asia/Riyadh', 'Kuwait City': 'Asia/Kuwait', 'Manama': 'Asia/Bahrain',
  'Singapore': 'Asia/Singapore', 'Kuala Lumpur': 'Asia/Kuala_Lumpur', 'Bangkok': 'Asia/Bangkok',
  'Jakarta': 'Asia/Jakarta', 'Manila': 'Asia/Manila', 'Hong Kong': 'Asia/Hong_Kong',
  'Tokyo': 'Asia/Tokyo', 'Osaka': 'Asia/Tokyo', 'Seoul': 'Asia/Seoul',
  'Beijing': 'Asia/Shanghai', 'Shanghai': 'Asia/Shanghai', 'Taipei': 'Asia/Taipei',
  'London': 'Europe/London', 'Manchester': 'Europe/London', 'Birmingham': 'Europe/London',
  'Leicester': 'Europe/London', 'Edinburgh': 'Europe/London', 'Glasgow': 'Europe/London',
  'Dublin': 'Europe/Dublin', 'Paris': 'Europe/Paris', 'Berlin': 'Europe/Berlin',
  'Frankfurt': 'Europe/Berlin', 'Munich': 'Europe/Berlin', 'Amsterdam': 'Europe/Amsterdam',
  'Brussels': 'Europe/Brussels', 'Zurich': 'Europe/Zurich', 'Geneva': 'Europe/Zurich',
  'Rome': 'Europe/Rome', 'Milan': 'Europe/Rome', 'Madrid': 'Europe/Madrid',
  'Barcelona': 'Europe/Madrid', 'Lisbon': 'Europe/Lisbon', 'Stockholm': 'Europe/Stockholm',
  'Oslo': 'Europe/Oslo', 'Copenhagen': 'Europe/Copenhagen', 'Helsinki': 'Europe/Helsinki',
  'Warsaw': 'Europe/Warsaw', 'Prague': 'Europe/Prague', 'Vienna': 'Europe/Vienna',
  'Athens': 'Europe/Athens', 'Istanbul': 'Europe/Istanbul',
  'Ankara': 'Europe/Istanbul', 'Moscow': 'Europe/Moscow',
  'Kyiv': 'Europe/Kyiv', 'Tel Aviv': 'Asia/Jerusalem', 'Cairo': 'Africa/Cairo',
  'Nairobi': 'Africa/Nairobi', 'Lagos': 'Africa/Lagos', 'Accra': 'Africa/Accra',
  'Johannesburg': 'Africa/Johannesburg', 'Cape Town': 'Africa/Johannesburg',
  'Durban': 'Africa/Johannesburg', 'Nassau': 'America/Nassau', 'Toronto': 'America/Toronto',
  'Vancouver': 'America/Vancouver', 'Calgary': 'America/Edmonton', 'Montreal': 'America/Toronto',
  'Ottawa': 'America/Toronto', 'Edmonton': 'America/Edmonton', 'Winnipeg': 'America/Winnipeg',
  'Halifax': 'America/Halifax', 'New York': 'America/New_York', 'Los Angeles': 'America/Los_Angeles',
  'Chicago': 'America/Chicago', 'Houston': 'America/Chicago', 'San Francisco': 'America/Los_Angeles',
  'San Jose': 'America/Los_Angeles', 'Seattle': 'America/Los_Angeles', 'Boston': 'America/New_York',
  'Washington, D.C.': 'America/New_York', 'Atlanta': 'America/New_York', 'Miami': 'America/New_York',
  'Orlando': 'America/New_York', 'Dallas': 'America/Chicago', 'Austin': 'America/Chicago',
  'Denver': 'America/Denver', 'Phoenix': 'America/Phoenix', 'Las Vegas': 'America/Los_Angeles',
  'San Diego': 'America/Los_Angeles', 'Portland': 'America/Los_Angeles', 'Minneapolis': 'America/Chicago',
  'Detroit': 'America/Detroit', 'Philadelphia': 'America/New_York', 'Pittsburgh': 'America/New_York',
  'Raleigh': 'America/New_York', 'Charlotte': 'America/New_York', 'Nashville': 'America/Chicago',
  'Columbus': 'America/New_York', 'Indianapolis': 'America/Indiana/Indianapolis',
  'Salt Lake City': 'America/Denver', 'Honolulu': 'Pacific/Honolulu', 'Anchorage': 'America/Anchorage',
  'Mexico City': 'America/Mexico_City', 'Bogotá': 'America/Bogota', 'Lima': 'America/Lima',
  'Santiago': 'America/Santiago', 'Buenos Aires': 'America/Argentina/Buenos_Aires',
  'São Paulo': 'America/Sao_Paulo', 'Rio de Janeiro': 'America/Sao_Paulo', 'Caracas': 'America/Caracas',
  'Kingston': 'America/Jamaica', 'Georgetown': 'America/Guyana', 'Paramaribo': 'America/Paramaribo',
  'Port of Spain': 'America/Port_of_Spain', 'Sydney': 'Australia/Sydney', 'Melbourne': 'Australia/Melbourne',
  'Brisbane': 'Australia/Brisbane', 'Perth': 'Australia/Perth', 'Adelaide': 'Australia/Adelaide',
  'Canberra': 'Australia/Sydney', 'Auckland': 'Pacific/Auckland', 'Wellington': 'Pacific/Auckland',
  'Christchurch': 'Pacific/Auckland', 'Suva': 'Pacific/Fiji', 'Nadi': 'Pacific/Fiji',
  'Port Moresby': 'Pacific/Port_Moresby', 'Dili': 'Asia/Dili', 'Yangon': 'Asia/Yangon',
  'Hanoi': 'Asia/Ho_Chi_Minh', 'Ho Chi Minh City': 'Asia/Ho_Chi_Minh', 'Phnom Penh': 'Asia/Phnom_Penh',
  'Vientiane': 'Asia/Vientiane', 'Bandar Seri Begawan': 'Asia/Brunei', 'Malé': 'Indian/Maldives',
  'Port Louis': 'Indian/Mauritius', 'Victoria': 'Indian/Mahe', 'Kampala': 'Africa/Kampala',
  'Dar es Salaam': 'Africa/Dar_es_Salaam', 'Addis Ababa': 'Africa/Addis_Ababa',
  'Algiers': 'Africa/Algiers', 'Casablanca': 'Africa/Casablanca', 'Tunis': 'Africa/Tunis',
  'Tripoli': 'Africa/Tripoli', 'Reykjavík': 'Atlantic/Reykjavik', 'Nicosia': 'Asia/Nicosia',
  'Valletta': 'Europe/Malta', 'Tbilisi': 'Asia/Tbilisi', 'Yerevan': 'Asia/Yerevan',
  'Baku': 'Asia/Baku', 'Tashkent': 'Asia/Tashkent', 'Almaty': 'Asia/Almaty',
  'Ulaanbaatar': 'Asia/Ulaanbaatar', 'Astana': 'Asia/Almaty'
};

/* offset of `zone` at UTC instant `iso`, in hours (e.g. 5.5, -3.5) */
function offsetHours(zone, iso) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(iso));
  const v = parts.find((p) => p.type === 'timeZoneName').value; // "GMT+05:30" | "GMT-3" | "GMT"
  const m = v.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const h = +m[2] + (m[3] ? +m[3] / 60 : 0);
  return m[1] === '+' ? h : -h;
}

let errors = 0;
const fail = (msg) => { console.error('FAIL ' + msg); errors++; };

const seenKeys = new Set();
for (const row of CITIES) {
  const [keys, name, state, country, lat, lon, tz, dst] = row;
  const tag = `${name} (${country})`;
  if (typeof name !== 'string' || !name) fail(`${tag}: bad display name`);
  if (typeof state !== 'string' || !state) fail(`${tag}: bad state`);
  if (typeof country !== 'string' || !country) fail(`${tag}: bad country`);
  if (!Number.isFinite(lat) || Math.abs(lat) > 90) fail(`${tag}: lat out of range (${lat})`);
  if (!Number.isFinite(lon) || Math.abs(lon) > 180) fail(`${tag}: lon out of range (${lon})`);
  if (!Number.isFinite(tz) || tz < -12 || tz > 14) fail(`${tag}: tz out of range (${tz})`);
  if (typeof dst !== 'boolean') fail(`${tag}: dst must be boolean`);
  for (const k of keys.split(',').map((s) => s.trim())) {
    if (!k) { fail(`${tag}: empty key`); continue; }
    if (seenKeys.has(k)) fail(`${tag}: duplicate key "${k}"`);
    seenKeys.add(k);
    const hit = NVAstro.matchPlace(k);
    if (!hit || hit.name !== name) fail(`${tag}: key "${k}" does not resolve`);
  }
  if (country === 'India') {
    if (tz !== 5.5 || dst !== false) fail(`${tag}: Indian entry must be UTC+5:30, no DST`);
    continue;
  }
  const zone = ZONES[name];
  if (!zone) { fail(`${tag}: no IANA zone mapped in validator`); continue; }
  try {
    const jan = offsetHours(zone, '2026-01-15T12:00Z');
    const jul = offsetHours(zone, '2026-07-15T12:00Z');
    const standard = Math.min(jan, jul);
    const seasonal = jan !== jul;
    if (country === 'Morocco') {
      if (tz !== 1 || dst !== false && dst !== true) fail(`${tag}: Morocco must be UTC+1 (Ramadan shift flagged via dst)`);
      continue;
    }
    if (Math.abs(standard - tz) > 0.01) fail(`${tag}: tz ${tz} != IANA standard ${standard} (${zone})`);
    if (seasonal !== dst) fail(`${tag}: dst ${dst} != IANA seasonal shift ${seasonal} (${zone})`);
  } catch {
    fail(`${tag}: unknown IANA zone ${zone}`);
  }
}

const total = CITIES.length;
console.log(`Atlas: ${total} entries, ${seenKeys.size} lookup keys.`);
if (errors) {
  console.error(`${errors} problem(s) found.`);
  process.exit(1);
}
console.log('validate-atlas: all checks passed.');
