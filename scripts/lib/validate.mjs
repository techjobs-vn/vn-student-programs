import { STATUSES } from "./status.mjs";

export const PROGRAM_TYPES = ["internship", "fresher", "graduate", "management_trainee", "ambassador", "scholarship"];
export const RECURRING = ["yearly", "multiple", "unknown"];
// Career fields a program recruits for; a rotation MT can list several.
export const PROGRAM_FIELD_IDS = [
  "tech",
  "finance",
  "audit-consulting",
  "business",
  "operations",
  "engineering",
  "hr",
  "general",
];
export const SOURCES_KIND = /^(manual|routine|github:[A-Za-z0-9-]+)$/;

// Social posts and university reposts are evidence (cycle.sources), never the apply link.
const NON_OFFICIAL_HOSTS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "tiktok.com",
  "threads.net",
  "linkedin.com",
  "youtube.com",
  "lnkd.in",
  "bit.ly",
  "tinyurl.com",
  "forms.gle",
  "docs.google.com",
  "zalo.me",
  "t.me",
];

// Characters that would let a URL break out of the README's markdown link syntax.
const URL_SAFE_RE = /^[^\s()<>\[\]"'`]+$/;
export const SEEN_VERDICTS = ["added", "rejected", "duplicate"];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Short summary shown under the program name on listing pages.
const MAX_DESCRIPTION = 280;
// Bare hostname of the company website, used to fetch a logo when the company has no techjobs.vn slug.
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

const PROGRAM_FIELDS = new Set([
  "slug", "name", "type", "company", "official_url", "description", "tracks", "fields", "duration",
  "eligibility", "recurring", "active", "is_visible", "source", "added_at",
  "updated_at", "notes",
]);
const CYCLE_FIELDS = new Set([
  "program_slug", "year", "opens_at", "deadline", "status", "sources", "updated_at", "notes",
]);

export function isValidDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isOfficialHost(value) {
  const host = new URL(value).hostname.toLowerCase().replace(/\.+$/, "");
  return !NON_OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

function checkUnexpected(obj, allowed, label) {
  return Object.keys(obj)
    .filter((k) => !allowed.has(k))
    .map((k) => `${label}: unexpected field "${k}"`);
}

function checkOptionalDate(obj, field, label) {
  const v = obj[field];
  if (v === undefined || v === null) return [];
  return isValidDate(v) ? [] : [`${label}: ${field} must be a real YYYY-MM-DD date`];
}

function validateProgram(p) {
  const label = `program ${p.slug ?? "<no slug>"}`;
  const errors = checkUnexpected(p, PROGRAM_FIELDS, label);

  if (typeof p.slug !== "string" || !SLUG_RE.test(p.slug)) errors.push(`${label}: slug must be kebab-case`);
  if (typeof p.name !== "string" || !p.name.trim()) errors.push(`${label}: name is required`);
  if (!PROGRAM_TYPES.includes(p.type)) errors.push(`${label}: type must be one of ${PROGRAM_TYPES.join(", ")}`);
  if (!RECURRING.includes(p.recurring)) errors.push(`${label}: recurring must be one of ${RECURRING.join(", ")}`);
  if (typeof p.active !== "boolean") errors.push(`${label}: active must be boolean`);
  if (typeof p.is_visible !== "boolean") errors.push(`${label}: is_visible must be boolean`);
  if (typeof p.source !== "string" || !SOURCES_KIND.test(p.source)) {
    errors.push(`${label}: source must be manual, routine or github:<username>`);
  }

  if (!p.company || typeof p.company.name !== "string" || !p.company.name.trim()) {
    errors.push(`${label}: company.name is required`);
  } else if (p.company.slug !== null && (typeof p.company.slug !== "string" || !SLUG_RE.test(p.company.slug))) {
    errors.push(`${label}: company.slug must be kebab-case or null`);
  }
  if (p.company && p.company.domain !== undefined && !(typeof p.company.domain === "string" && DOMAIN_RE.test(p.company.domain))) {
    errors.push(`${label}: company.domain must be a bare lowercase hostname like "ey.com"`);
  }

  if (!isHttpsUrl(p.official_url) || !URL_SAFE_RE.test(p.official_url)) {
    errors.push(`${label}: official_url must be an https URL without spaces, quotes, brackets or parentheses`);
  } else if (!isOfficialHost(p.official_url)) {
    errors.push(`${label}: official_url must be the company/ATS site, not social media (put that in cycle sources)`);
  }

  if (p.tracks !== undefined && !(Array.isArray(p.tracks) && p.tracks.every((t) => typeof t === "string"))) {
    errors.push(`${label}: tracks must be an array of strings`);
  }

  if (p.description !== undefined && !(typeof p.description === "string" && p.description.trim() && p.description.length <= MAX_DESCRIPTION)) {
    errors.push(`${label}: description must be a non-empty string of at most ${MAX_DESCRIPTION} characters`);
  }

  if (!Array.isArray(p.fields) || p.fields.length === 0) {
    errors.push(`${label}: fields must be a non-empty array of ${PROGRAM_FIELD_IDS.join(", ")}`);
  } else {
    const seenFields = new Set();
    for (const f of p.fields) {
      if (!PROGRAM_FIELD_IDS.includes(f)) errors.push(`${label}: unknown field "${f}"`);
      if (seenFields.has(f)) errors.push(`${label}: duplicate field "${f}"`);
      seenFields.add(f);
    }
  }

  for (const field of ["added_at", "updated_at"]) {
    if (!isValidDate(p[field])) errors.push(`${label}: ${field} must be a real YYYY-MM-DD date`);
  }
  return errors;
}

function validateCycle(c, programSlugs) {
  const label = `cycle ${c.program_slug ?? "<no program>"}/${c.year ?? "<no year>"}`;
  const errors = checkUnexpected(c, CYCLE_FIELDS, label);

  if (!programSlugs.has(c.program_slug)) errors.push(`${label}: unknown program "${c.program_slug}"`);
  if (!Number.isInteger(c.year) || c.year < 2000 || c.year > 2100) errors.push(`${label}: year must be an integer`);

  errors.push(...checkOptionalDate(c, "opens_at", label), ...checkOptionalDate(c, "deadline", label));
  if (isValidDate(c.opens_at) && isValidDate(c.deadline) && c.deadline < c.opens_at) {
    errors.push(`${label}: deadline before opens_at`);
  }
  if (c.status !== undefined && !STATUSES.includes(c.status)) {
    errors.push(`${label}: status must be one of ${STATUSES.join(", ")}`);
  } else if (c.status !== undefined && (c.opens_at || c.deadline)) {
    errors.push(`${label}: status is only for cycles without dates (dates decide the status)`);
  }
  errors.push(...checkYear(c, label));

  const sources = c.sources ?? [];
  if (!Array.isArray(sources) || !sources.every(isHttpsUrl)) {
    errors.push(`${label}: sources must be an array of https URLs`);
  } else if ((c.opens_at || c.deadline || c.status) && sources.length === 0) {
    errors.push(`${label}: sources must cite where dates/status came from`);
  }

  if (!isValidDate(c.updated_at)) errors.push(`${label}: updated_at must be a real YYYY-MM-DD date`);
  return errors;
}

// `year` is the year applications open; with only a deadline it may be that year or the one before.
function checkYear(c, label) {
  if (!Number.isInteger(c.year)) return [];
  if (isValidDate(c.opens_at)) {
    return Number(c.opens_at.slice(0, 4)) === c.year ? [] : [`${label}: year must equal the opens_at year`];
  }
  if (isValidDate(c.deadline)) {
    const deadlineYear = Number(c.deadline.slice(0, 4));
    return [deadlineYear, deadlineYear - 1].includes(c.year)
      ? []
      : [`${label}: year must be the deadline year or the year before`];
  }
  return [];
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonObjectErrors(list, name) {
  return list.flatMap((x, i) => (isPlainObject(x) ? [] : [`${name}[${i}] must be an object`]));
}

function findDuplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  return [...dupes];
}

export function validateDataset({ programs, cycles }) {
  if (!Array.isArray(programs)) return ["programs.json must be an array"];
  if (!Array.isArray(cycles)) return ["cycles.json must be an array"];
  const shapeErrors = [...nonObjectErrors(programs, "programs"), ...nonObjectErrors(cycles, "cycles")];
  if (shapeErrors.length) return shapeErrors;

  const errors = programs.flatMap(validateProgram);
  errors.push(...findDuplicates(programs.map((p) => p.slug)).map((s) => `duplicate slug "${s}"`));
  errors.push(
    ...findDuplicates(programs.map((p) => p.official_url).filter(Boolean)).map(
      (u) => `duplicate official_url "${u}"`,
    ),
  );

  const programSlugs = new Set(programs.map((p) => p.slug));
  errors.push(...cycles.flatMap((c) => validateCycle(c, programSlugs)));
  errors.push(
    ...findDuplicates(cycles.map((c) => `${c.program_slug}/${c.year}`)).map((k) => `duplicate cycle "${k}"`),
  );
  return errors;
}

export function validateSeen(text) {
  const errors = [];
  const urls = [];
  text.split("\n").forEach((raw, i) => {
    const label = `seen.jsonl line ${i + 1}`;
    if (!raw.trim()) return;
    let row;
    try {
      row = JSON.parse(raw);
    } catch {
      errors.push(`${label}: invalid JSON`);
      return;
    }
    if (!isPlainObject(row)) {
      errors.push(`${label}: must be a JSON object`);
      return;
    }
    if (!isHttpsUrl(row.url)) errors.push(`${label}: url must be an https URL`);
    else urls.push(row.url);
    if (!isValidDate(row.first_seen)) errors.push(`${label}: first_seen must be a real YYYY-MM-DD date`);
    if (!SEEN_VERDICTS.includes(row.verdict)) {
      errors.push(`${label}: verdict must be one of ${SEEN_VERDICTS.join(", ")}`);
    } else if (row.verdict === "rejected" && !(typeof row.reason === "string" && row.reason.trim())) {
      errors.push(`${label}: rejected rows need a reason`);
    }
  });
  errors.push(...findDuplicates(urls).map((u) => `seen.jsonl: duplicate url "${u}"`));
  return errors;
}
