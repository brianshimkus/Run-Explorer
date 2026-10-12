import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRuns, mockMode, setReadToken } from "./api";
import { useUrl } from "./url";
import { RunTable } from "./components/RunTable";
export default function App() {
  const { filters, selectedId, update } = useUrl();
  const [draft, setDraft] = useState(filters.q);
  const [connected, setConnected] = useState(mockMode);
  const [token, setToken] = useState("");
  const client = useQueryClient();
  useEffect(() => {
    setDraft(filters.q);
  }, [filters.q]);
  const query = useQuery({
    queryKey: ["runs", filters],
    enabled: connected,
    queryFn: ({ signal }) => getRuns(filters, signal),
    refetchInterval: (q) =>
      q.state.data?.items.some((r) => r.status === "running") ? 3000 : false,
  });
  const data = query.data;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (
    <>
      <a className="skip" href="#runs">
        Skip to runs
      </a>
      <main>
        <header className="hero">
          <div>
            <p className="eyebrow">Execution observatory</p>
            <h1>
              Run <em>Explorer</em>
            </h1>
            <p className="lead">See every step. Find the failure.</p>
          </div>
          <span className="mode">
            {mockMode
              ? "Interactive demo · synthetic data"
              : "Connected API · single operator"}
          </span>
        </header>
        {!mockMode && (
          <form
            className="connection"
            onSubmit={(e) => {
              e.preventDefault();
              setReadToken(token);
              client.clear();
              setConnected(true);
            }}
          >
            <label>
              Demo access token{" "}
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
                required
              />
            </label>
            <button>Connect</button>
            <small>Kept in memory for this tab only.</small>
          </form>
        )}
        <section className="workspace" aria-labelledby="runs-heading">
          <div className="section-heading">
            <h2 id="runs-heading">Application runs</h2>
            <span className="subtle">
              {data ? `${data.total} matching runs` : "Inspect activity"}
            </span>
          </div>
          <form
            className="filters"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: draft.trim(), page: 1, run: null });
            }}
          >
            <label className="search">
              Search runs
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Run ID or application"
                maxLength={80}
              />
            </label>
            <button type="submit">Search</button>
            <label>
              Status
              <select
                aria-label="Status"
                value={filters.status}
                onChange={(e) =>
                  update({ status: e.target.value, page: 1, run: null })
                }
              >
                {["all", "queued", "running", "succeeded", "failed"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Sort
              <select
                aria-label="Sort"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value, page: 1 })}
              >
                <option value="newest">Newest first</option>
                <option value="duration">Longest first</option>
              </select>
            </label>
            {mockMode && (
              <label>
                Demo scenario
                <select
                  aria-label="Demo scenario"
                  value={filters.scenario}
                  onChange={(e) =>
                    update({ scenario: e.target.value, page: 1, run: null })
                  }
                >
                  {["normal", "slow", "error", "empty", "reject"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            )}
          </form>
          <div id="runs" tabIndex={-1} aria-busy={query.isFetching}>
            {!connected ? (
              <p className="message">Enter the API demo token to load runs.</p>
            ) : query.isPending ? (
              <p className="message" role="status">
                Loading runs…
              </p>
            ) : query.isError ? (
              <div className="message" role="alert">
                <h3>Runs could not be refreshed</h3>
                <p>{query.error.message}</p>
                <button onClick={() => query.refetch()}>Retry runs</button>
              </div>
            ) : null}
            {data && (
              <>
                {query.isFetching && (
                  <p className="subtle" role="status">
                    Refreshing runs…
                  </p>
                )}
                {data.items.length ? (
                  <RunTable
                    runs={data.items}
                    onOpen={(id) => update({ run: id })}
                  />
                ) : (
                  <p className="message">
                    No runs on this page. Try another filter or return to page
                    1.
                  </p>
                )}
                <nav className="pagination" aria-label="Run pages">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() =>
                      update({ page: filters.page - 1, run: null })
                    }
                  >
                    Previous
                  </button>
                  <span>
                    Page {filters.page} of {pages}
                  </span>
                  <button
                    disabled={filters.page >= pages}
                    onClick={() =>
                      update({ page: filters.page + 1, run: null })
                    }
                  >
                    Next
                  </button>
                  <button
                    onClick={() =>
                      update({
                        q: null,
                        status: null,
                        sort: null,
                        page: null,
                        run: null,
                      })
                    }
                  >
                    Reset filters
                  </button>
                </nav>
              </>
            )}
          </div>
        </section>
        <footer>
          Run Explorer · Frontend engineering lab{" "}
          <span>
            Durations are reported values. Synthetic timelines are illustrative.
          </span>
        </footer>
        {selectedId && (
          <p>Selected {selectedId}. Detail inspection comes next.</p>
        )}
      </main>
    </>
  );
}
