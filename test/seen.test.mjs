import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSeen } from "../scripts/lib/validate.mjs";

const line = (o) => JSON.stringify({ url: "https://a.example/p", first_seen: "2026-10-01", verdict: "added", ...o });

test("accepts valid lines and ignores blank lines", () => {
  assert.deepEqual(validateSeen(`${line()}\n\n${line({ url: "https://b.example", verdict: "rejected", reason: "x" })}\n`), []);
});

test("reports invalid JSON with its line number", () => {
  const errors = validateSeen(`${line()}\n{oops\n`);
  assert.ok(errors.some((e) => e.includes("line 2")));
});

test("requires reason for rejected", () => {
  assert.ok(validateSeen(line({ verdict: "rejected" })).some((e) => e.includes("reason")));
});

test("rejects unknown verdict", () => {
  assert.ok(validateSeen(line({ verdict: "maybe" })).some((e) => e.includes("verdict")));
});

test("rejects invalid first_seen", () => {
  assert.ok(validateSeen(line({ first_seen: "2026-13-01" })).some((e) => e.includes("first_seen")));
});

test("rejects duplicate urls", () => {
  assert.ok(validateSeen(`${line()}\n${line()}\n`).some((e) => e.includes("duplicate")));
});
