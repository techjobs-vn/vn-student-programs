import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDataset } from "../scripts/lib/validate.mjs";

const program = (overrides = {}) => ({
  slug: "viettel-digital-talent",
  name: "Viettel Digital Talent",
  type: "internship",
  company: { name: "Viettel", slug: "viettel" },
  official_url: "https://tuyendung.viettel.vn/page/page-digitalTalent",
  tracks: ["Cloud"],
  fields: ["tech"],
  recurring: "yearly",
  active: true,
  is_visible: true,
  source: "manual",
  added_at: "2026-10-01",
  updated_at: "2026-10-01",
  ...overrides,
});

const cycle = (overrides = {}) => ({
  program_slug: "viettel-digital-talent",
  year: 2026,
  opens_at: "2026-02-23",
  deadline: "2026-03-15",
  sources: ["https://viettelfamily.com/news/viettel-talent-2026-chinh-thuc-mo-cong-dang-ky"],
  updated_at: "2026-10-01",
  ...overrides,
});

test("accepts a valid dataset", () => {
  assert.deepEqual(validateDataset({ programs: [program()], cycles: [cycle()] }), []);
});

test("rejects duplicate program slugs", () => {
  const errors = validateDataset({ programs: [program(), program()], cycles: [] });
  assert.ok(errors.some((e) => e.includes("duplicate slug")));
});

test("rejects duplicate official_url across programs", () => {
  const errors = validateDataset({
    programs: [program(), program({ slug: "other" })],
    cycles: [],
  });
  assert.ok(errors.some((e) => e.includes("duplicate official_url")));
});

test("rejects unknown program type", () => {
  const errors = validateDataset({ programs: [program({ type: "job" })], cycles: [] });
  assert.ok(errors.some((e) => e.includes("type")));
});

test("rejects non-kebab-case slug", () => {
  const errors = validateDataset({ programs: [program({ slug: "Viettel_DT" })], cycles: [] });
  assert.ok(errors.some((e) => e.includes("slug")));
});

test("rejects social-media official_url", () => {
  const errors = validateDataset({
    programs: [program({ official_url: "https://www.facebook.com/fptjobs/posts/1" })],
    cycles: [],
  });
  assert.ok(errors.some((e) => e.includes("official_url")));
});

test("rejects non-https official_url", () => {
  const errors = validateDataset({
    programs: [program({ official_url: "http://example.com" })],
    cycles: [],
  });
  assert.ok(errors.some((e) => e.includes("official_url")));
});

test("rejects cycle pointing to unknown program", () => {
  const errors = validateDataset({ programs: [program()], cycles: [cycle({ program_slug: "nope" })] });
  assert.ok(errors.some((e) => e.includes("unknown program")));
});

test("rejects duplicate cycle for same program and year", () => {
  const errors = validateDataset({ programs: [program()], cycles: [cycle(), cycle()] });
  assert.ok(errors.some((e) => e.includes("duplicate cycle")));
});

test("rejects deadline before opens_at", () => {
  const errors = validateDataset({
    programs: [program()],
    cycles: [cycle({ opens_at: "2026-04-01", deadline: "2026-03-15" })],
  });
  assert.ok(errors.some((e) => e.includes("deadline before opens_at")));
});

test("rejects invalid calendar date", () => {
  const errors = validateDataset({ programs: [program()], cycles: [cycle({ deadline: "2026-02-30" })] });
  assert.ok(errors.some((e) => e.includes("deadline")));
});

test("requires at least one source when a cycle has dates", () => {
  const errors = validateDataset({ programs: [program()], cycles: [cycle({ sources: [] })] });
  assert.ok(errors.some((e) => e.includes("sources")));
});

test("rejects unknown manual status", () => {
  const errors = validateDataset({
    programs: [program()],
    cycles: [cycle({ opens_at: null, deadline: null, status: "maybe" })],
  });
  assert.ok(errors.some((e) => e.includes("status")));
});

test("rejects unexpected fields to catch typos", () => {
  const errors = validateDataset({ programs: [program({ deadlin: "2026-01-01" })], cycles: [] });
  assert.ok(errors.some((e) => e.includes("unexpected field")));
});

test("rejects official_url containing markdown-breaking characters", () => {
  const errors = validateDataset({
    programs: [program({ official_url: "https://a.com/x)[click](https://evil.example" })],
    cycles: [],
  });
  assert.ok(errors.some((e) => e.includes("official_url")));
});

test("rejects social hosts written with a trailing dot", () => {
  const errors = validateDataset({
    programs: [program({ official_url: "https://facebook.com./x" })],
    cycles: [],
  });
  assert.ok(errors.some((e) => e.includes("official_url")));
});

test("rejects form and shortlink hosts as official_url", () => {
  for (const url of ["https://forms.gle/abc", "https://docs.google.com/forms/d/x", "https://zalo.me/g/abc"]) {
    const errors = validateDataset({ programs: [program({ official_url: url })], cycles: [] });
    assert.ok(errors.some((e) => e.includes("official_url")), url);
  }
});

test("reports non-object entries instead of throwing", () => {
  const errors = validateDataset({ programs: [null], cycles: [null] });
  assert.ok(errors.some((e) => e.includes("programs[0]")));
  assert.ok(errors.some((e) => e.includes("cycles[0]")));
});

test("rejects year that does not match opens_at", () => {
  const errors = validateDataset({ programs: [program()], cycles: [cycle({ year: 2025 })] });
  assert.ok(errors.some((e) => e.includes("year")));
});

test("accepts year one before deadline year when opens_at is unknown", () => {
  const errors = validateDataset({
    programs: [program()],
    cycles: [cycle({ year: 2026, opens_at: null, deadline: "2027-01-10" })],
  });
  assert.deepEqual(errors, []);
});

test("rejects manual status alongside dates since it would be ignored", () => {
  const errors = validateDataset({ programs: [program()], cycles: [cycle({ status: "open" })] });
  assert.ok(errors.some((e) => e.includes("status")));
});

test("requires at least one known field", () => {
  const missing = validateDataset({ programs: [program({ fields: undefined })], cycles: [cycle()] });
  assert.ok(missing.some((e) => e.includes("fields")));
  const empty = validateDataset({ programs: [program({ fields: [] })], cycles: [cycle()] });
  assert.ok(empty.some((e) => e.includes("fields")));
  const unknown = validateDataset({ programs: [program({ fields: ["tech", "cooking"] })], cycles: [cycle()] });
  assert.ok(unknown.some((e) => e.includes('unknown field "cooking"')));
});

test("rejects duplicate fields on one program", () => {
  const errors = validateDataset({ programs: [program({ fields: ["tech", "tech"] })], cycles: [cycle()] });
  assert.ok(errors.some((e) => e.includes("duplicate field")));
});

test("accepts multi-field programs", () => {
  const errors = validateDataset({ programs: [program({ fields: ["business", "finance", "tech"] })], cycles: [cycle()] });
  assert.deepEqual(errors, []);
});

test("accepts an optional bare company domain for logos", () => {
  const ok = validateDataset({ programs: [program({ company: { name: "EY Việt Nam", slug: null, domain: "ey.com" } })], cycles: [cycle()] });
  assert.deepEqual(ok, []);
  for (const domain of ["https://ey.com", "ey", "EY.com/careers", 42]) {
    const errors = validateDataset({ programs: [program({ company: { name: "EY", slug: null, domain } })], cycles: [cycle()] });
    assert.ok(errors.some((e) => e.includes("company.domain")), String(domain));
  }
});

test("accepts a short description and rejects empty or overlong ones", () => {
  const ok = validateDataset({ programs: [program({ description: "Chương trình thực tập 3 tháng cho sinh viên năm cuối ngành CNTT." })], cycles: [cycle()] });
  assert.deepEqual(ok, []);
  for (const description of ["", "   ", "x".repeat(281), 42]) {
    const errors = validateDataset({ programs: [program({ description })], cycles: [cycle()] });
    assert.ok(errors.some((e) => e.includes("description")), JSON.stringify(description).slice(0, 20));
  }
});
