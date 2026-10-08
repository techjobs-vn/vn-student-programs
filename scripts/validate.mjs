#!/usr/bin/env node
import { loadDataset, loadDetails, loadSeenText } from "./lib/data.mjs";
import { validateDetails } from "./lib/details.mjs";
import { validateDataset, validateSeen } from "./lib/validate.mjs";

try {
  const dataset = await loadDataset();
  const details = await loadDetails();
  const programSlugs = new Set(dataset.programs.map((p) => p.slug));
  const errors = [
    ...validateDataset(dataset),
    ...validateSeen(await loadSeenText()),
    ...validateDetails(details, programSlugs),
  ];
  if (errors.length) {
    console.error(`✗ ${errors.length} lỗi dữ liệu:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(
    `✓ ${dataset.programs.length} chương trình, ${dataset.cycles.length} đợt, ${details.length} trang chi tiết — hợp lệ`,
  );
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
