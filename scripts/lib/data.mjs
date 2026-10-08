import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const DATA_DIR = path.join(ROOT, "data");

async function readJson(file) {
  const full = path.join(DATA_DIR, file);
  try {
    return JSON.parse(await readFile(full, "utf8"));
  } catch (err) {
    throw new Error(`Cannot read ${path.relative(ROOT, full)}: ${err.message}`);
  }
}

export async function loadSeenText() {
  return readFile(path.join(DATA_DIR, "seen.jsonl"), "utf8");
}

export async function loadDataset() {
  const [programs, cycles] = await Promise.all([readJson("programs.json"), readJson("cycles.json")]);
  return { programs, cycles };
}

/** data/details.json is optional: programs without researched details simply have no entry. */
export async function loadDetails() {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, "details.json"), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw new Error(`Cannot read data/details.json: ${err.message}`);
  }
}

// Vietnam has no DST, so a fixed +07:00 offset is exact.
export function todayInVietnam(now = new Date()) {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
