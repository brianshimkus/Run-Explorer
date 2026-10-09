import { formatDuration, type Run } from "../domain";
export function RunTable({
  runs,
  onOpen,
}: {
  runs: Run[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">
          Application runs. Open a run to inspect its steps.
        </caption>
        <thead>
          <tr>
            <th scope="col">Run / application</th>
            <th scope="col">Status</th>
            <th scope="col">Duration</th>
            <th scope="col">Started (UTC)</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <td>
                <button className="run-link" onClick={() => onOpen(run.id)}>
                  {run.id}
                </button>
                <span className="subtle block">{run.project}</span>
              </td>
              <td>
                <span className={`badge ${run.status}`}>{run.status}</span>
              </td>
              <td>
                {formatDuration(run.durationMs)}
                {run.status === "running" && (
                  <span className="subtle block">last reported</span>
                )}
              </td>
              <td>
                <time dateTime={run.startedAt}>
                  {run.startedAt.slice(11, 19)}
                </time>
              </td>
              <td>{run.reviewed ? "Reviewed" : "Unreviewed"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
