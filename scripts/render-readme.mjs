#!/usr/bin/env node
// Usage: node scripts/render-readme.mjs [--check] [--today YYYY-MM-DD]
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDataset, ROOT, todayInVietnam } from "./lib/data.mjs";
import { renderTables, replaceBetweenMarkers } from "./lib/readme.mjs";
import { validateDataset, isValidDate } from "./lib/validate.mjs";

const args = process.argv.slice(2);
const check = args.includes("--check");
const todayArg = args[args.indexOf("--today") + 1];
const today = args.includes("--today") ? todayArg : todayInVietnam();

try {
  if (!isValidDate(today)) throw new Error(`--today must be YYYY-MM-DD, got "${todayArg}"`);

  const dataset = await loadDataset();
  const errors = validateDataset(dataset);
  if (errors.length) throw new Error(`dữ liệu không hợp lệ, chạy npm run validate (${errors.length} lỗi)`);

  const readmePath = path.join(ROOT, "README.md");
  const current = await readFile(readmePath, "utf8");
  const next = replaceBetweenMarkers(current, renderTables({ ...dataset, today }));

  if (check) {
    if (next !== current) {
      console.error("✗ README.md chưa cập nhật — chạy npm run readme");
      process.exit(1);
    }
    console.log("✓ README.md đã cập nhật");
  } else if (next !== current) {
    await writeFile(readmePath, next);
    console.log("✓ Đã cập nhật README.md");
  } else {
    console.log("✓ README.md không đổi");
  }
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
