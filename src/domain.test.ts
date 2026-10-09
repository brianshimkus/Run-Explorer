import { describe, it, expect } from "vitest";
import { readFilters, selectRuns, runSchema } from "./domain";
import { makeRuns } from "./fixtures";
describe("run list contracts", () => {
  it("normalizes invalid URL state", () => {
    expect(readFilters("?status=wat&page=-2&sort=x").status).toBe("all");
    expect(readFilters("?page=NaN").page).toBe(1);
  });
  it("filters without mutating the original", () => {
    const runs = makeRuns();
    const first = runs[0].id;
    const page = selectRuns(runs, readFilters("?status=failed&sort=duration"));
    expect(page.total).toBe(6);
    expect(page.items.every((r) => r.status === "failed")).toBe(true);
    expect(runs[0].id).toBe(first);
  });
  it("paginates after filtering and sorting", () => {
    const page = selectRuns(makeRuns(), readFilters("?page=2"));
    expect(page.items[0].id).toBe("run-007");
    expect(page.total).toBe(24);
  });
  it("searches case-insensitively", () => {
    expect(selectRuns(makeRuns(), readFilters("?q=TANSTACK")).total).toBe(12);
  });
  it("rejects malformed network data", () => {
    expect(() =>
      runSchema.parse({ ...makeRuns()[0], status: "finished-ish" }),
    ).toThrow();
  });
  it("keeps zero-result pages explicit", () => {
    expect(selectRuns(makeRuns(), readFilters("?page=100")).items).toEqual([]);
  });
});
