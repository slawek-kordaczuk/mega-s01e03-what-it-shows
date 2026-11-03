# S01E03 — what it shows

## Deliverables

- New signed source page: [`src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`](src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx).
- Actual prerendered page: [`rendered/kb/decisions/0002-dedupe-by-cause/index.html`](rendered/kb/decisions/0002-dedupe-by-cause/index.html).
- The entire prerendered KB and required CSS/JavaScript assets are under `rendered/`.
- Public GitHub issues: [parser: 379 reports](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/issues/1) and [hint: 33 reports](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/issues/2).

The original export is preserved. The accepted decision 0001 has not been rewritten.
The new decision is proposed for support-desk acceptance, not falsely attributed to the desk.
All data are from the 2026-10-04 export. The review date is not a claim of fresh desk data.

## Reproduce and inspect

Use Node.js 22.18+ (native TypeScript stripping is used by the analysis/tests) and npm.

```sh
npm ci
npm run analyze
npm run build
npm test
npm run preview
```

Open `http://127.0.0.1:4173/kb/decisions/0002-dedupe-by-cause/`.
The build uses mdsvex and SvelteKit to execute the supplied components, rather than
making a static imitation of their output. `npm run build` refreshes `rendered/`.

## Counting method

Use the exported `uniqueById`, `groupByCause`, `causeOf`, and `readAs` functions.
Load each tenant's locale and booking-form version from its JSON file. Browser locale,
subject, and intake tag do not override the tenant-derived cause. There are 427 rows,
412 unique report IDs, two causes, and 38 disagreements with the intake tags.
Five one-day/timing descriptions stay visible as caveats within the parser group.

## Publication status

Repository: https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows

The initial fine-grained token could not create a repository. The human replaced it with
a suitable token and explicitly approved this public repository, file pushes, and issues.
The course accepted the two tickets at step one. Its next engineering update says #4471
closed on 2026-10-05: parser fixed (`fix(dates): parse dd/mm for eu locales`), hint won't fix
(booking-v3 form retired). The public closures preserve those different outcomes:
parser completed; hint not planned.

The course accepted the final submission on 2026-11-03 at 20:59:22 UTC.
Debrief: https://hq.mega.dev/challenges/what-it-shows#debrief
