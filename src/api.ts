import { z } from "zod";
import { listSchema, runSchema, type Filters } from "./domain";
export const mockMode = import.meta.env.VITE_API_MODE !== "live";
const root = mockMode
  ? ""
  : (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
      /\/$/,
      "",
    );
let readToken = "";
export function setReadToken(value: string) {
  readToken = value;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (readToken) headers.set("X-Read-Token", readToken);
  const response = await fetch(`${root}${path}`, { ...init, headers });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 401
        ? "Access token rejected. Reconnect with the demo token."
        : `Request failed (${response.status}). Try again.`,
    );
  }
  return response.json();
}
export async function getRuns(filters: Filters, signal?: AbortSignal) {
  const params = new URLSearchParams(
    Object.entries(filters).map(([k, v]) => [k, String(v)]),
  );
  return listSchema.parse(await request(`/api/runs?${params}`, { signal }));
}
export async function getRun(
  id: string,
  scenario: string,
  signal?: AbortSignal,
) {
  return runSchema.parse(
    await request(`/api/runs/${encodeURIComponent(id)}?scenario=${scenario}`, {
      signal,
    }),
  );
}
export async function setReviewed(
  id: string,
  reviewed: boolean,
  scenario: string,
) {
  return runSchema.parse(
    await request(
      `/api/runs/${encodeURIComponent(id)}/review?scenario=${scenario}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed }),
      },
    ),
  );
}

const explanationSchema = z.object({
  mode: z.enum(["mock", "live"]),
  explanation: z.object({
    summary: z.string(),
    observations: z.array(
      z.object({ statement: z.string(), stepIds: z.array(z.string()) }),
    ),
    possibleCauses: z.array(z.string()),
    nextChecks: z.array(z.string()),
    insufficientEvidence: z.boolean(),
  }),
});
export type ExplanationResponse = z.infer<typeof explanationSchema>;
export async function explainRun(
  id: string,
  scenario: string,
  signal: AbortSignal,
) {
  return explanationSchema.parse(
    await request(
      `/api/runs/${encodeURIComponent(id)}/explanation?scenario=${scenario}`,
      { method: "POST", signal },
    ),
  );
}
