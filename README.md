# Run Explorer

See every step. Find the failure. Explain it from the recorded evidence.

![Run Explorer](public/thumbnail.png)

## Demo

The two-minute demo and the write-up will be linked here once the dashboard is live. The opening beat is a failed run whose timeline names the step that broke. The same run, explained from the recorded steps, comes back with the step IDs it used.

## The customer problem

A developer asks an AI why a request failed and pastes the explanation it returns. The model never saw the steps that ran, so it invents a provider, a timeout, or a bad credential. The answer sounds confident, and nothing records which evidence it used.

Run Explorer is an unofficial portfolio prototype of the inspection step:

Record → Store → Inspect → Explain → Grade

The program reads events from Ask TanStack Query, rebuilds the run, and writes a failure brief that cites the steps. It does not rerun the original request, fix the failure, or speak for the TanStack team.

## What it does

- Accepts ordered events from an application and stores them in Postgres
- Rebuilds a run when those events arrive late, twice, or out of order
- Lists runs with filters and shows each step on a timeline
- Says when a duration was never recorded, instead of drawing it as zero
- Marks a run reviewed, and restores the previous flag if the save is rejected
- Writes a failure brief that cites step IDs, and grades it on known cases

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript and Python 3.12 | TypeScript runs the dashboard; Python validates events and calls the model |
| UI | React and Vite | Renders the run list, the dialog, and the timeline |
| Server state | TanStack Query | Caches each filtered page and drops a request the user has already left |
| API | FastAPI | Accepts events and serves the same routes the dashboard calls |
| Database | PostgreSQL | Stores each event and a run snapshot that remain after a restart |
| Model | OpenAI | Writes a structured failure brief from the recorded steps |
| Evals | Six known failure cases | Grades each brief for support, citations, and an honest next check |
