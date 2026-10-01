#!/usr/bin/env node
import { loadDataset } from "./lib/data.mjs";
import { validateDataset } from "./lib/validate.mjs";

try {
  const dataset = await loadDataset();
  const errors = validateDataset(dataset);
  if (errors.length) {
    console.error(`✗ ${errors.length} lỗi dữ liệu:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✓ ${dataset.programs.length} chương trình, ${dataset.cycles.length} đợt — hợp lệ`);
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
