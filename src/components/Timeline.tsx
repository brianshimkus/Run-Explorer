import { formatDuration, type Run } from "../domain";
export function Timeline({ run }: { run: Run }) {
  const extent = Math.max(
    1,
    run.durationMs,
    ...run.steps.map((s) => s.offsetMs + (s.durationMs ?? 0)),
  );
  return (
    <ol className="timeline">
      {run.steps.map((step) => (
        <li key={step.id} id={`step-${encodeURIComponent(step.id)}`}>
          <div className="step-heading">
            <strong>{step.name}</strong>
            <span className={`badge ${step.status}`}>{step.status}</span>
          </div>
          <div className="track" aria-hidden="true">
            <span
              className={`bar ${step.status}`}
              style={{
                marginLeft: `${(step.offsetMs / extent) * 100}%`,
                width: `${Math.max(0.5, ((step.durationMs ?? 0) / extent) * 100)}%`,
              }}
            />
          </div>
          <p className="subtle">
            Starts at {formatDuration(step.offsetMs)} ·{" "}
            {step.durationMs === null
              ? "duration unavailable"
              : formatDuration(step.durationMs)}
          </p>
          <p>{step.summary}</p>
        </li>
      ))}
    </ol>
  );
}
