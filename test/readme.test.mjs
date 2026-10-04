import { test } from "node:test";
import assert from "node:assert/strict";
import { renderTables, replaceBetweenMarkers, MARKER_START, MARKER_END } from "../scripts/lib/readme.mjs";

const TODAY = "2026-10-01";

const base = {
  type: "internship",
  tracks: [],
  fields: ["tech"],
  recurring: "yearly",
  active: true,
  is_visible: true,
  source: "manual",
  added_at: "2026-10-01",
  updated_at: "2026-10-01",
};

const programs = [
  { ...base, slug: "a-open", name: "A Open", company: { name: "Alpha", slug: "alpha" }, official_url: "https://a.example/p" },
  { ...base, slug: "b-closed", name: "B Closed", company: { name: "Beta", slug: null }, official_url: "https://b.example/p", fields: ["finance", "audit-consulting"] },
  { ...base, slug: "c-hidden", name: "C Hidden", company: { name: "Gamma", slug: null }, official_url: "https://c.example/p", is_visible: false },
  { ...base, slug: "d-upcoming", name: "D Upcoming", type: "fresher", company: { name: "Delta", slug: null }, official_url: "https://d.example/p" },
];

const cycles = [
  { program_slug: "a-open", year: 2026, opens_at: "2026-09-01", deadline: "2026-10-31", sources: ["https://s.example/1"], updated_at: TODAY },
  { program_slug: "b-closed", year: 2026, opens_at: null, deadline: "2026-03-15", sources: ["https://s.example/2"], updated_at: TODAY },
  { program_slug: "d-upcoming", year: 2027, opens_at: "2027-02-01", deadline: null, sources: ["https://s.example/3"], updated_at: TODAY },
];

test("hides programs with is_visible=false", () => {
  const md = renderTables({ programs, cycles, today: TODAY });
  assert.ok(!md.includes("C Hidden"));
});

test("lists open programs before upcoming and closed ones", () => {
  const md = renderTables({ programs, cycles, today: TODAY });
  const iOpen = md.indexOf("A Open");
  const iUpcoming = md.indexOf("D Upcoming");
  const iClosed = md.indexOf("B Closed");
  assert.ok(iOpen > -1 && iUpcoming > iOpen && iClosed > iUpcoming);
});

test("lists most recently closed programs first", () => {
  const md = renderTables({
    programs: [programs[0], programs[1]],
    cycles: [
      { ...cycles[0], deadline: "2026-05-01", opens_at: null },
      { ...cycles[1], deadline: "2026-09-01" },
    ],
    today: TODAY,
  });
  assert.ok(md.indexOf("B Closed") < md.indexOf("A Open"));
});

test("links company to techjobs.vn only when slug is known", () => {
  const md = renderTables({ programs, cycles, today: TODAY });
  assert.ok(md.includes("https://techjobs.vn/companies/alpha"));
  assert.ok(!md.includes("techjobs.vn/companies/null"));
});

test("formats dates as dd/mm/yyyy", () => {
  const md = renderTables({ programs, cycles, today: TODAY });
  assert.ok(md.includes("31/10/2026"));
});

test("uses the latest cycle per program", () => {
  const md = renderTables({
    programs: [programs[0]],
    cycles: [
      cycles[0],
      { program_slug: "a-open", year: 2025, opens_at: null, deadline: "2025-03-01", sources: ["https://s.example/0"], updated_at: TODAY },
    ],
    today: TODAY,
  });
  assert.ok(md.includes("31/10/2026"));
  assert.ok(!md.includes("01/03/2025"));
});

test("header date is the latest data update, not today, so the README only changes with data or status", () => {
  const md = renderTables({ programs, cycles, today: "2026-12-25" });
  assert.ok(md.includes("Cập nhật dữ liệu: 01/10/2026"));
  assert.ok(!md.includes("25/12/2026"));
});

test("escapes markdown link syntax in names so rows cannot inject links", () => {
  const md = renderTables({
    programs: [{ ...programs[0], name: "x](https://evil.example) [y", company: { name: "C [z](https://e.x)", slug: null } }],
    cycles: [cycles[0]],
    today: TODAY,
  });
  assert.ok(!md.includes("](https://evil.example)"));
  assert.ok(!md.includes("](https://e.x)"));
});

test("prefers the latest dated cycle over a newer placeholder without dates", () => {
  const md = renderTables({
    programs: [programs[0]],
    cycles: [cycles[0], { program_slug: "a-open", year: 2027, opens_at: null, deadline: null, sources: [], updated_at: TODAY }],
    today: TODAY,
  });
  assert.ok(md.includes("🟢 Đang mở"));
  assert.ok(md.includes("31/10/2026"));
});

test("sorts upcoming programs by opening date", () => {
  const p = (slug, name) => ({ ...programs[3], slug, name, official_url: `https://${slug}.example` });
  const md = renderTables({
    programs: [p("late", "Opens Late"), p("early", "Opens Early")],
    cycles: [
      { program_slug: "late", year: 2026, opens_at: "2026-12-01", deadline: "2026-12-10", sources: ["https://s.example/l"], updated_at: TODAY },
      { program_slug: "early", year: 2026, opens_at: "2026-11-01", deadline: "2026-12-31", sources: ["https://s.example/e"], updated_at: TODAY },
    ],
    today: TODAY,
  });
  assert.ok(md.indexOf("Opens Early") < md.indexOf("Opens Late"));
});

test("escapes pipe characters in names", () => {
  const md = renderTables({
    programs: [{ ...programs[0], name: "A | B" }],
    cycles: [cycles[0]],
    today: TODAY,
  });
  assert.ok(md.includes("A \\| B"));
});

test("replaceBetweenMarkers swaps only the generated block", () => {
  const doc = `intro\n${MARKER_START}\nold\n${MARKER_END}\noutro\n`;
  const out = replaceBetweenMarkers(doc, "new");
  assert.equal(out, `intro\n${MARKER_START}\nnew\n${MARKER_END}\noutro\n`);
});

test("replaceBetweenMarkers throws when markers are missing", () => {
  assert.throws(() => replaceBetweenMarkers("no markers", "x"));
});

test("shows each program's fields in a Lĩnh vực column", () => {
  const md = renderTables({ programs, cycles, today: TODAY });
  assert.ok(md.includes("| Lĩnh vực |"));
  const openRow = md.split("\n").find((line) => line.includes("A Open"));
  const closedRow = md.split("\n").find((line) => line.includes("B Closed"));
  assert.ok(openRow.includes("| Công nghệ |"));
  assert.ok(closedRow.includes("| Tài chính, Kiểm toán – Tư vấn |"));
});
