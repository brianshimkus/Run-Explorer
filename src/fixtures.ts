import type { Run, Status } from "./domain";
export function makeRuns(count = 24): Run[] {
  return Array.from({ length: count }, (_, i) => {
    const status: Status =
      i % 4 === 0 ? "failed" : i % 4 === 1 ? "running" : "succeeded";
    const duration = 900 + (i % 17) * 190;
    return {
      id: `run-${String(i + 1).padStart(3, "0")}`,
      project: i % 2 ? "Ask TanStack Query" : "Document review",
      status,
      startedAt: new Date(Date.UTC(2026, 9, 9, 12, 0, -i * 90)).toISOString(),
      durationMs: duration,
      reviewed: false,
      incomplete: false,
      steps: [
        {
          id: "retrieve",
          name: "Retrieve evidence",
          status: "succeeded",
          offsetMs: 0,
          durationMs: 220,
          summary: "Three synthetic documents matched.",
        },
        {
          id: "generate",
          name: "Generate answer",
          status: "succeeded",
          offsetMs: 220,
          durationMs: 500,
          summary: "A demonstration answer was produced.",
        },
        {
          id: "validate",
          name: "Validate citations",
          status,
          offsetMs: 720,
          durationMs: status === "running" ? null : duration - 720,
          summary:
            status === "failed"
              ? "Citation P-999 does not exist in the source set."
              : status === "running"
                ? "Checking the referenced documents."
                : "All referenced documents exist.",
        },
      ],
    };
  });
}
