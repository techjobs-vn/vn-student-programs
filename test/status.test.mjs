import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStatus } from "../scripts/lib/status.mjs";

const TODAY = "2026-10-01";

test("closed when deadline has passed", () => {
  assert.equal(computeStatus({ opens_at: "2026-02-01", deadline: "2026-03-15" }, TODAY), "closed");
});

test("open on the deadline day itself", () => {
  assert.equal(computeStatus({ deadline: TODAY }, TODAY), "open");
});

test("upcoming when opens_at is in the future", () => {
  assert.equal(computeStatus({ opens_at: "2026-11-01", deadline: "2026-12-01" }, TODAY), "upcoming");
});

test("open between opens_at and deadline", () => {
  assert.equal(computeStatus({ opens_at: "2026-09-01", deadline: "2026-10-15" }, TODAY), "open");
});

test("open when only a future deadline is known", () => {
  assert.equal(computeStatus({ deadline: "2026-10-20" }, TODAY), "open");
});

test("falls back to manual status when no dates are known", () => {
  assert.equal(computeStatus({ status: "open" }, TODAY), "open");
});

test("unknown when no dates and no manual status", () => {
  assert.equal(computeStatus({}, TODAY), "unknown");
});

test("dates win over a stale manual status", () => {
  assert.equal(computeStatus({ deadline: "2026-03-15", status: "open" }, TODAY), "closed");
});
