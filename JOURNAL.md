# Journal

## Day 1

> [!TIP]
> **What I did.** I copied the Run Explorer starter into this folder, switched to Node 24, and installed the locked dependency versions with `npm ci`. `npm run dev` opened a page with six runs. In another terminal, `npm run build` typechecked the app and wrote `dist/`, and `npm test` passed six tests.

> [!WARNING]
> **What broke.** I changed the import in `src/main.tsx` to `./AppMissing`. Vite stopped the page and said it could not resolve that import. The browser overlay and the dev-server terminal showed the same missing file. Then I called `makeRuns('6')`. The quotes made `6` a string, and `makeRuns` requires a number, so the typecheck failed. I put both files back.

> [!IMPORTANT]
> **What I learned.** The dev server, the typecheck, and the tests are three separate checks. Vite serves the page and fails immediately when a file is missing. TypeScript checks the shape of the code, then disappears when the browser runs it. A run status has to be `queued`, `running`, `succeeded`, or `failed`. A missing duration is `null`, because `0` would pretend a measurement exists.
