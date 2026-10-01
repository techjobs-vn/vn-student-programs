import { computeStatus } from "./status.mjs";

export const MARKER_START = "<!-- PROGRAMS:START — tự sinh bởi scripts/render-readme.mjs, đừng sửa tay -->";
export const MARKER_END = "<!-- PROGRAMS:END -->";

const SITE = "https://techjobs.vn";
const UTM = "utm_source=github&utm_medium=vn-tech-programs";

const STATUS_LABEL = {
  open: "🟢 Đang mở",
  upcoming: "🟡 Sắp mở",
  unknown: "⚪ Chưa rõ",
  closed: "🔴 Đã đóng",
};
const STATUS_ORDER = ["open", "upcoming", "unknown", "closed"];

const TYPE_LABEL = {
  internship: "Thực tập",
  fresher: "Fresher",
  graduate: "Graduate",
  management_trainee: "Quản trị viên tập sự",
  ambassador: "Đại sứ sinh viên",
};

function escapeCell(text) {
  return String(text ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function latestCycleBySlug(cycles) {
  const latest = new Map();
  for (const c of cycles) {
    const prev = latest.get(c.program_slug);
    if (!prev || c.year > prev.year) latest.set(c.program_slug, c);
  }
  return latest;
}

function companyCell(company) {
  const name = escapeCell(company.name);
  return company.slug ? `[${name}](${SITE}/companies/${company.slug}?${UTM})` : name;
}

function sortKey(row) {
  // Within a status group: soonest deadline/opening first, unknown dates last.
  return row.cycle?.deadline ?? row.cycle?.opens_at ?? "9999-12-31";
}

function toRows(programs, cycles, today) {
  const latest = latestCycleBySlug(cycles);
  return programs
    .filter((p) => p.is_visible && p.active)
    .map((p) => {
      const cycle = latest.get(p.slug) ?? null;
      return { program: p, cycle, status: computeStatus(cycle, today) };
    });
}

function renderRow({ program, cycle, status }) {
  return [
    companyCell(program.company),
    `[${escapeCell(program.name)}](${program.official_url})`,
    TYPE_LABEL[program.type],
    STATUS_LABEL[status],
    cycle ? `${cycle.year}` : "—",
    formatDate(cycle?.opens_at),
    formatDate(cycle?.deadline),
  ].join(" | ");
}

const HEADER =
  "| Công ty | Chương trình | Loại | Trạng thái | Đợt | Mở đơn | Hạn nộp |\n" +
  "| --- | --- | --- | --- | :---: | :---: | :---: |";

function renderTable(rows) {
  return `${HEADER}\n${rows.map((r) => `| ${renderRow(r)} |`).join("\n")}`;
}

export function renderTables({ programs, cycles, today }) {
  const rows = toRows(programs, cycles, today).sort((a, b) => {
    const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (byStatus !== 0) return byStatus;
    return sortKey(a).localeCompare(sortKey(b)) || a.program.name.localeCompare(b.program.name);
  });

  const active = rows.filter((r) => r.status !== "closed");
  const closed = rows.filter((r) => r.status === "closed");

  // Use the newest data date rather than `today`, otherwise the daily job would commit every day.
  const lastUpdated = [...programs, ...cycles].map((x) => x.updated_at).sort().at(-1);
  const openCount = active.filter((r) => r.status === "open").length;
  const parts = [
    `_Cập nhật dữ liệu: ${formatDate(lastUpdated)} · ${rows.length} chương trình · ${openCount} đang mở_`,
    "",
    active.length ? renderTable(active) : "_Chưa có chương trình nào đang mở hoặc sắp mở._",
  ];
  if (closed.length) {
    parts.push(
      "",
      `<details>\n<summary>Đã đóng đợt gần nhất (${closed.length}) — thường mở lại hằng năm</summary>\n`,
      renderTable(closed),
      "\n</details>",
    );
  }
  return parts.join("\n");
}

export function replaceBetweenMarkers(doc, content) {
  const start = doc.indexOf(MARKER_START);
  const end = doc.indexOf(MARKER_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("README.md is missing the PROGRAMS:START / PROGRAMS:END markers");
  }
  return `${doc.slice(0, start + MARKER_START.length)}\n${content}\n${doc.slice(end)}`;
}
