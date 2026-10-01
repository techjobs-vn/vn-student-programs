// Status is derived from dates whenever they exist, so it never goes stale.
// A manual `status` only applies to cycles with no known dates.

export const STATUSES = ["open", "upcoming", "closed", "unknown"];

export function computeStatus(cycle, today) {
  const { opens_at: opensAt, deadline, status } = cycle ?? {};

  if (deadline && today > deadline) return "closed";
  if (opensAt && today < opensAt) return "upcoming";
  if (deadline) return "open";
  if (status && STATUSES.includes(status)) return status;
  if (opensAt) return "open";
  return "unknown";
}
