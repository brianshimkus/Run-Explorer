import { useEffect, useRef, useState } from "react";
import { explainRun, type ExplanationResponse } from "../api";
type State =
  | { status: "idle" | "loading" | "cancelled" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ExplanationResponse };
export function ExplanationPanel({
  id,
  scenario,
}: {
  id: string;
  scenario: string;
}) {
  const [state, setState] = useState<State>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      controller.current?.abort();
    },
    [],
  );
  async function explain() {
    controller.current?.abort();
    const current = ++generation.current;
    const request = new AbortController();
    controller.current = request;
    setState({ status: "loading" });
    try {
      const data = await explainRun(id, scenario, request.signal);
      if (current === generation.current) setState({ status: "ready", data });
    } catch (error) {
      if (current !== generation.current) return;
      if (request.signal.aborted) setState({ status: "cancelled" });
      else
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Explanation failed.",
        });
    }
  }
  function cancel() {
    generation.current++;
    controller.current?.abort();
    setState({ status: "cancelled" });
  }
  return (
    <section className="explanation" aria-labelledby="explanation-title">
      <h3 id="explanation-title">Failure brief</h3>
      <p className="subtle">
        An explanation of recorded evidence. Suggestions require your judgment.
      </p>
      <button disabled={state.status === "loading"} onClick={explain}>
        Explain this failure
      </button>
      {state.status === "loading" && (
        <>
          <button onClick={cancel}>Cancel explanation</button>
          <p role="status">Preparing the explanation…</p>
        </>
      )}
      {state.status === "cancelled" && (
        <p role="status">Explanation cancelled in this browser.</p>
      )}
      {state.status === "error" && (
        <p role="alert">
          Explanation unavailable. {state.message} The timeline is still usable.
        </p>
      )}
      {state.status === "ready" && (
        <div>
          <p className="eyebrow">
            {state.data.mode === "mock"
              ? "Scripted demo · no model call"
              : "AI generated · verify against evidence"}
          </p>
          <p>{state.data.explanation.summary}</p>
          {state.data.explanation.insufficientEvidence && (
            <p className="warning">
              Evidence is incomplete. A root cause cannot be established.
            </p>
          )}
          <h4>Observed</h4>
          <ul>
            {state.data.explanation.observations.map((o, i) => (
              <li key={i}>
                {o.statement}
                <br />
                <small>
                  Evidence:{" "}
                  {o.stepIds.map((stepId) => (
                    <a
                      key={stepId}
                      href={`#step-${encodeURIComponent(stepId)}`}
                    >
                      {stepId}{" "}
                    </a>
                  ))}
                </small>
              </li>
            ))}
          </ul>
          <h4>Possible causes</h4>
          {state.data.explanation.possibleCauses.length ? (
            <ul>
              {state.data.explanation.possibleCauses.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          ) : (
            <p>None established from the supplied records.</p>
          )}
          <h4>Next checks</h4>
          <ul>
            {state.data.explanation.nextChecks.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
