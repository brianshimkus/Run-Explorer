import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRun, setReviewed } from "../api";
import type { Run } from "../domain";
import { Timeline } from "./Timeline";
export function RunDialog({
  id,
  scenario,
  onClose,
}: {
  id: string;
  scenario: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const client = useQueryClient();
  const key = ["run", id, scenario] as const;
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getRun(id, scenario, signal),
    refetchInterval: (q) => (q.state.data?.status === "running" ? 1500 : false),
  });
  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const element = dialog.current!;
    element.showModal();
    close.current?.focus();
    return () => {
      element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="run-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="dialog-heading">
        <div>
          <p className="eyebrow">Execution detail</p>
          <h2 id="run-title">{id}</h2>
        </div>
        <button ref={close} onClick={onClose}>
          Close
        </button>
      </header>
      {query.isPending && <p role="status">Loading run details…</p>}
      {query.isError && (
        <div role="alert">
          <p>{query.error.message}</p>
          <button onClick={() => query.refetch()}>Retry details</button>
        </div>
      )}
      {query.data && (
        <>
          <p>
            {query.data.project} ·{" "}
            <span className={`badge ${query.data.status}`}>
              {query.data.status}
            </span>
          </p>
          {query.data.incomplete && (
            <p className="warning">
              Some events are missing. This timeline may be incomplete.
            </p>
          )}
          <p className="subtle">
            {query.isFetching ? "Refreshing…" : "Latest received snapshot"}
          </p>
          <Timeline run={query.data} />
        </>
      )}
    </dialog>
  );
}
