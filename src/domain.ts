import { z } from "zod";
export const statusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
]);
export type Status = z.infer<typeof statusSchema>;
export const stepSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: statusSchema,
  offsetMs: z.number().nonnegative(),
  durationMs: z.number().nonnegative().nullable(),
  summary: z.string(),
});
export const runSchema = z.object({
  id: z.string(),
  project: z.string(),
  status: statusSchema,
  startedAt: z.string().datetime(),
  durationMs: z.number().nonnegative(),
  reviewed: z.boolean(),
  incomplete: z.boolean(),
  steps: z.array(stepSchema),
});
export type Run = z.infer<typeof runSchema>;
export const listSchema = z.object({
  items: z.array(runSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export type Filters = {
  q: string;
  status: string;
  sort: string;
  page: number;
  scenario: string;
};
export function readFilters(search: string): Filters {
  const p = new URLSearchParams(search);
  const status = p.get("status") ?? "all";
  const page = Number(p.get("page") ?? "1");
  const scenario = p.get("scenario") ?? "normal";
  return {
    q: (p.get("q") ?? "").slice(0, 80),
    status: ["all", ...statusSchema.options].includes(status) ? status : "all",
    sort: p.get("sort") === "duration" ? "duration" : "newest",
    page: Number.isSafeInteger(page) && page >= 1 && page <= 100000 ? page : 1,
    scenario: ["normal", "slow", "error", "empty", "reject"].includes(scenario)
      ? scenario
      : "normal",
  };
}
export function selectRuns(runs: Run[], filters: Filters, pageSize = 6) {
  const filtered = runs.filter(
    (r) =>
      (filters.status === "all" || r.status === filters.status) &&
      `${r.id} ${r.project}`
        .toLowerCase()
        .includes(filters.q.trim().toLowerCase()),
  );
  const sorted = [...filtered].sort(
    (a, b) =>
      (filters.sort === "duration"
        ? b.durationMs - a.durationMs
        : b.startedAt.localeCompare(a.startedAt)) || a.id.localeCompare(b.id),
  );
  return {
    items: sorted.slice((filters.page - 1) * pageSize, filters.page * pageSize),
    total: sorted.length,
    page: filters.page,
    pageSize,
  };
}
export function formatDuration(ms: number) {
  return `${(ms / 1000).toFixed(1)} s`;
}
