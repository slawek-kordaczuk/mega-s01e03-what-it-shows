# Shared parser reads day-first tenant dates as MM/DD

## Scope and count

**379 unique reports** from #4471 across 11 tenants, received 2026-04-01 through 2026-10-04. Snapshot: export dated 2026-10-04, not the current desk queue.

Count method: deduplicate by report ID, filter mergedInto === 4471, then group by causeOf using tenant locale, booking-form version, and report channel. Do not count rows or trust intake tags.

The shared parser assumes month-first input for day-first tenants. This is the main cause in #4471, not evidence that all merged reports share one bug.

## Reproduction and expected result

Use harbour.dental (en-GB, booking-v2), or another day-first tenant on an app/email or booking-v2 path. Enter 07/04/2026 as 7 April: the reported failure interprets it as 4 July. Expected: interpret the input using the tenant's locale, or require unambiguous input, and keep the intended calendar date.

Evidence: R-41200 describes 7 April becoming 4 July; R-41201 corrects its direction. These are source reports, not a live product reproduction. The cause logic is in src/lib/kb/causes.ts; tenant configuration is in src/lib/data/tenants/.

## Acceptance criteria

- Respect the tenant's date order across app, email, and booking-v2 paths.
- Test day/month-ambiguous values, days greater than twelve, and non-day-first tenants.
- Do not treat the booking-v3 hint bug as fixed by this change.
- Preserve R-41202, R-41209, R-41236, R-41344, and R-41620 as one-day/timing caveats for investigation. The export groups them here; their wording alone does not prove a separate timezone cause.

## Audit trail

- [All assigned report IDs](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/tickets/report-ids.json) (key: parser).
- [Signed KB review source](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx).
- [Actual rendered page](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/rendered/kb/decisions/0002-dedupe-by-cause/index.html).
- [Reproduce counts](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/scripts/analyze.mjs).

Subject-only merging combined distinct causes. Preserve decision 0001 as history and review proposed decision 0002 before changing desk policy.
