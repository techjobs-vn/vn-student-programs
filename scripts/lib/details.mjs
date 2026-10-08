// Per-program detail page content (data/details.json): short self-written facts with sources.
// Low-confidence research never lands in the file, so every entry here is publishable.

export const DETAIL_CONFIDENCE = ["high", "medium"];

export const LIMITS = {
  overview: 700,
  item: 240,
  stipend: 160,
  location: 60,
  faqQ: 160,
  faqA: 400,
};

export const MAX_ITEMS = {
  eligibility: 6,
  benefits: 6,
  selection_process: 8,
  locations: 6,
  faq: 5,
  sources: 6,
};

const LIST_FIELDS = ["eligibility", "benefits", "selection_process", "locations"];
const DETAIL_FIELDS = new Set([
  "program_slug", "overview", ...LIST_FIELDS, "stipend", "faq", "sources", "confidence", "updated_at",
]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Content rule: facts only, no personal contacts and no links inside text (links live in sources).
const CONTACT_RE = /https?:\/\/|www\.|[\w.+-]+@[\w-]+\.[\w.]+|(?<![\d.,])(?:\+84|0)\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}(?![\d.,])/i;

const isPlainObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function itemLimit(field) {
  return field === "locations" ? LIMITS.location : LIMITS.item;
}

function checkText(value, max, label) {
  if (typeof value !== "string" || !value.trim()) return [`${label} must be a non-empty string`];
  const errors = [];
  if (value.length > max) errors.push(`${label} is longer than ${max} characters`);
  if (CONTACT_RE.test(value)) errors.push(`${label} must not contain a link, email or phone number`);
  return errors;
}

function validateDetail(d, programSlugs) {
  if (!isPlainObject(d)) return ["details entries must be objects"];
  const label = `details ${d.program_slug ?? "<no program_slug>"}`;
  const errors = Object.keys(d)
    .filter((k) => !DETAIL_FIELDS.has(k))
    .map((k) => `${label}: unexpected field "${k}"`);

  if (!programSlugs.has(d.program_slug)) errors.push(`${label}: unknown program_slug`);
  errors.push(...checkText(d.overview, LIMITS.overview, `${label}: overview`));

  for (const field of LIST_FIELDS) {
    if (d[field] === undefined) continue;
    if (!Array.isArray(d[field]) || d[field].length === 0 || d[field].length > MAX_ITEMS[field]) {
      errors.push(`${label}: ${field} must be a list of 1–${MAX_ITEMS[field]} items`);
      continue;
    }
    d[field].forEach((item, i) => errors.push(...checkText(item, itemLimit(field), `${label}: ${field}[${i}]`)));
  }

  if (d.stipend !== undefined) errors.push(...checkText(d.stipend, LIMITS.stipend, `${label}: stipend`));

  if (d.faq !== undefined) {
    if (!Array.isArray(d.faq) || d.faq.length === 0 || d.faq.length > MAX_ITEMS.faq) {
      errors.push(`${label}: faq must be a list of 1–${MAX_ITEMS.faq} items`);
    } else {
      d.faq.forEach((entry, i) => {
        if (!isPlainObject(entry)) {
          errors.push(`${label}: faq[${i}] must be an object`);
          return;
        }
        errors.push(...checkText(entry.q, LIMITS.faqQ, `${label}: faq[${i}].q`));
        errors.push(...checkText(entry.a, LIMITS.faqA, `${label}: faq[${i}].a`));
      });
    }
  }

  if (!Array.isArray(d.sources) || d.sources.length === 0 || d.sources.length > MAX_ITEMS.sources) {
    errors.push(`${label}: sources must list 1–${MAX_ITEMS.sources} https URLs`);
  } else if (!d.sources.every(isHttpsUrl)) {
    errors.push(`${label}: sources must be https URLs`);
  }
  if (!DETAIL_CONFIDENCE.includes(d.confidence)) {
    errors.push(`${label}: confidence must be one of ${DETAIL_CONFIDENCE.join(", ")}`);
  }
  if (typeof d.updated_at !== "string" || !DATE_RE.test(d.updated_at)) {
    errors.push(`${label}: updated_at must be YYYY-MM-DD`);
  }
  return errors;
}

export function validateDetails(details, programSlugs) {
  if (!Array.isArray(details)) return ["details.json must be an array"];
  const errors = details.flatMap((d) => validateDetail(d, programSlugs));
  const seen = new Set();
  for (const d of details) {
    if (!isPlainObject(d)) continue;
    if (seen.has(d.program_slug)) errors.push(`duplicate details for "${d.program_slug}"`);
    seen.add(d.program_slug);
  }
  return errors;
}

function cleanString(value, max) {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length > max || CONTACT_RE.test(text)) return null;
  return text;
}

function cleanList(value, max, maxItems) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => cleanString(v, max)).filter(Boolean).slice(0, maxItems);
}

/** Normalises one LLM research result; null when there is nothing publishable. */
export function cleanDetail(raw, programSlug, today) {
  if (!isPlainObject(raw)) return null;
  const overview = cleanString(raw.overview, LIMITS.overview);
  const sources = (Array.isArray(raw.sources) ? raw.sources : [])
    .filter((s) => typeof s === "string" && isHttpsUrl(s.trim()))
    .map((s) => s.trim())
    .filter((s, i, all) => all.indexOf(s) === i)
    .slice(0, MAX_ITEMS.sources);
  if (!overview || sources.length === 0) return null;

  const out = { program_slug: programSlug, overview };
  for (const field of LIST_FIELDS) {
    const items = cleanList(raw[field], itemLimit(field), MAX_ITEMS[field]);
    if (items.length) out[field] = items;
  }
  const stipend = cleanString(raw.stipend, LIMITS.stipend);
  if (stipend) out.stipend = stipend;
  const faq = (Array.isArray(raw.faq) ? raw.faq : [])
    .map((f) => (isPlainObject(f) ? { q: cleanString(f.q, LIMITS.faqQ), a: cleanString(f.a, LIMITS.faqA) } : null))
    .filter((f) => f && f.q && f.a)
    .slice(0, MAX_ITEMS.faq);
  if (faq.length) out.faq = faq;
  out.sources = sources;
  out.confidence = ["high", "medium", "low"].includes(raw.confidence) ? raw.confidence : "low";
  out.updated_at = today;
  return out;
}
