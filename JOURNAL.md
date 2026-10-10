# Journal

## Day 1

> [!TIP]
> **What I did.** I copied the Run Explorer starter into this folder, switched to Node 24, and installed the locked dependency versions with `npm ci`. `npm run dev` opened a page with six runs. In another terminal, `npm run build` typechecked the app and wrote `dist/`, and `npm test` passed six tests.

> [!WARNING]
> **What broke.** I changed the import in `src/main.tsx` to `./AppMissing`. Vite stopped the page and said it could not resolve that import. The browser overlay and the dev-server terminal showed the same missing file. Then I called `makeRuns('6')`. The quotes made `6` a string, and `makeRuns` requires a number, so the typecheck failed. I put both files back.

> [!IMPORTANT]
> **What I learned.** The dev server, the typecheck, and the tests are three separate checks. Vite serves the page and fails immediately when a file is missing. TypeScript checks the shape of the code, then disappears when the browser runs it. A run status has to be `queued`, `running`, `succeeded`, or `failed`. A missing duration is `null`, because `0` would pretend a measurement exists.

## Day 2

> [!TIP]
> **What I did.** I read the run table and set the browser to 390 pixels wide. The table scrolled sideways and the rest of the page stayed still. Then I added `src/url.ts` and replaced `App.tsx`. The page lists 24 runs, six per page. Typing in the search box stays in the component until I press Search. Status, sort, and page go straight into the URL.

> [!WARNING]
> **What broke.** I removed `overflow-x: auto` from `.table-scroll`. At 390 pixels the whole page slid sideways, including the title. I removed the pink `outline` on `button:focus-visible`. Tab still moved, and nothing showed where focus was. I put both rules back. I also removed the `popstate` listener in `subscribe`. Back changed the address and left the table on the old filter. I put that listener back too.

> [!IMPORTANT]
> **What I learned.** The rows are a real table, and each run id is a real button. `overflow-x: auto` keeps the sideways scroll inside the table so the page does not move. The focus ring is how a keyboard user sees their place. The unfinished search text is local state. The submitted filters belong in the URL, so refresh and Back can restore them. `pushState` does not tell React anything. The custom `run-explorer:url` event covers that gap, and `popstate` covers Back and Forward. The matching rows are calculated by `selectRuns` during render.
