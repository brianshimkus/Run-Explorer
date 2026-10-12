import { delay, http, HttpResponse } from "msw";
import { makeRuns } from "../fixtures";
import { readFilters, selectRuns } from "../domain";
let runs = makeRuns();
let epoch = Date.now();
export function resetMock() {
  runs = makeRuns();
  epoch = Date.now();
}
function currentRuns() {
  return runs.map((r) =>
    r.status === "running" && Date.now() - epoch > 12000
      ? {
          ...r,
          status: "succeeded" as const,
          steps: r.steps.map((s) =>
            s.status === "running"
              ? {
                  ...s,
                  status: "succeeded" as const,
                  durationMs: 900,
                  summary: "Checks completed in the simulation.",
                }
              : s,
          ),
        }
      : r,
  );
}
async function simulate(request: Request) {
  const scenario = new URL(request.url).searchParams.get("scenario");
  await delay(scenario === "slow" ? 1400 : 120);
  return scenario;
}
export const handlers = [
  http.post("*/api/runs/:id/explanation", async ({ params, request }) => {
    const scenario = new URL(request.url).searchParams.get("scenario");
    await delay(scenario === "slow" ? 2400 : 600);
    if (scenario === "reject") return HttpResponse.json({}, { status: 502 });
    const run = currentRuns().find((r) => r.id === params.id);
    if (!run) return HttpResponse.json({}, { status: 404 });
    if (run.status !== "failed") return HttpResponse.json({}, { status: 409 });
    const failed = run.steps.filter((s) => s.status === "failed");
    return HttpResponse.json({
      mode: "mock",
      explanation: {
        summary:
          "Validation rejected a citation. This records a symptom, not a proven root cause.",
        observations: failed.map((s) => ({
          statement: s.summary,
          stepIds: [s.id],
        })),
        possibleCauses: [
          "The generated answer may reference a document that was not retrieved.",
        ],
        nextChecks: [
          "Compare the failed citation with the retrieved document IDs.",
        ],
        insufficientEvidence: false,
      },
    });
  }),
  http.get("*/api/runs", async ({ request }) => {
    const scenario = await simulate(request);
    if (scenario === "error")
      return HttpResponse.json({ detail: "Simulated outage" }, { status: 503 });
    const result = selectRuns(
      scenario === "empty" ? [] : currentRuns(),
      readFilters(new URL(request.url).search),
    );
    return HttpResponse.json(result);
  }),
  http.get("*/api/runs/:id", async ({ params, request }) => {
    await simulate(request);
    const run = currentRuns().find((r) => r.id === params.id);
    return run
      ? HttpResponse.json(run)
      : HttpResponse.json({ detail: "Unknown run" }, { status: 404 });
  }),
  http.patch("*/api/runs/:id/review", async ({ params, request }) => {
    const scenario = await simulate(request);
    if (scenario === "reject")
      return HttpResponse.json(
        { detail: "Simulated write rejection" },
        { status: 409 },
      );
    const body = (await request.json()) as { reviewed: boolean };
    if (typeof body.reviewed !== "boolean")
      return HttpResponse.json({}, { status: 422 });
    const run = runs.find((r) => r.id === params.id);
    if (!run) return HttpResponse.json({}, { status: 404 });
    run.reviewed = body.reviewed;
    return HttpResponse.json(currentRuns().find((r) => r.id === params.id));
  }),
];
