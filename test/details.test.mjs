import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanDetail, validateDetails } from "../scripts/lib/details.mjs";

const SLUGS = new Set(["sea-global-map"]);

const detail = (overrides = {}) => ({
  program_slug: "sea-global-map",
  overview: "Chương trình quản trị viên tập sự toàn cầu kéo dài 2 năm, luân chuyển qua các mảng kinh doanh của Sea.",
  eligibility: ["Sinh viên năm cuối hoặc tốt nghiệp dưới 2 năm"],
  benefits: ["Luân chuyển 4 vị trí trong 2 năm"],
  selection_process: ["Nộp hồ sơ online", "Bài test trực tuyến", "Phỏng vấn"],
  locations: ["TP.HCM", "Singapore"],
  stipend: "Lương cạnh tranh",
  faq: [{ q: "Có cần tiếng Anh không?", a: "Có, chương trình làm việc bằng tiếng Anh." }],
  sources: ["https://seagmap.sea.com/"],
  confidence: "high",
  updated_at: "2026-10-08",
  ...overrides,
});

test("accepts a valid details list", () => {
  assert.deepEqual(validateDetails([detail()], SLUGS), []);
});

test("accepts a detail with only an overview and sources", () => {
  const minimal = { program_slug: "sea-global-map", overview: detail().overview, sources: detail().sources, confidence: "medium", updated_at: "2026-10-08" };
  assert.deepEqual(validateDetails([minimal], SLUGS), []);
});

test("rejects details for unknown programs and duplicates", () => {
  const errors = validateDetails([detail(), detail(), detail({ program_slug: "ghost" })], SLUGS);
  assert.ok(errors.some((e) => e.includes("unknown program_slug")));
  assert.ok(errors.some((e) => e.includes("duplicate details")));
});

test("rejects low confidence, missing sources and unexpected fields", () => {
  const errors = validateDetails([detail({ confidence: "low", sources: [], extra: 1 })], SLUGS);
  assert.ok(errors.some((e) => e.includes("confidence")));
  assert.ok(errors.some((e) => e.includes("sources")));
  assert.ok(errors.some((e) => e.includes('unexpected field "extra"')));
});

test("rejects URLs, emails and phone numbers inside text", () => {
  const errors = validateDetails(
    [detail({ overview: "Xem https://x.com", benefits: ["Liên hệ hr@sea.com"], eligibility: ["Gọi 0901 234 567"] })],
    SLUGS,
  );
  assert.equal(errors.filter((e) => e.includes("link, email or phone")).length, 3);
});

test("keeps money amounts, years and dates that look numeric", () => {
  const ok = detail({ stipend: "Trợ cấp 20.000.000 VNĐ/tháng", overview: "Đợt 2026–2027, mở từ 01/10/2026 đến 0912 hạn.", benefits: ["Thưởng 1.000.000 đồng"] });
  assert.deepEqual(validateDetails([ok], SLUGS), []);
});

test("rejects text over the length limits", () => {
  const errors = validateDetails([detail({ overview: "a".repeat(900) })], SLUGS);
  assert.ok(errors.some((e) => e.includes("overview")));
});

test("cleanDetail trims, drops empty and over-long items, keeps only https sources", () => {
  const cleaned = cleanDetail(
    {
      overview: "  Tổng quan.  ",
      eligibility: ["  Năm cuối ", "", "x".repeat(400)],
      faq: [{ q: "Hỏi?", a: "" }, { q: "Bao lâu?", a: "2 năm." }],
      stipend: "",
      sources: ["https://seagmap.sea.com/", "http://insecure.example", "nonsense"],
      confidence: "high",
      bogus: "drop me",
    },
    "sea-global-map",
    "2026-10-08",
  );
  assert.deepEqual(cleaned, {
    program_slug: "sea-global-map",
    overview: "Tổng quan.",
    eligibility: ["Năm cuối"],
    faq: [{ q: "Bao lâu?", a: "2 năm." }],
    sources: ["https://seagmap.sea.com/"],
    confidence: "high",
    updated_at: "2026-10-08",
  });
});

test("cleanDetail returns null without an overview or sources", () => {
  assert.equal(cleanDetail({ overview: "", sources: ["https://a.vn"], confidence: "high" }, "s", "2026-10-08"), null);
  assert.equal(cleanDetail({ overview: "Có", sources: [], confidence: "high" }, "s", "2026-10-08"), null);
});
