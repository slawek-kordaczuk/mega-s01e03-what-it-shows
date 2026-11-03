# Booking-v3 date hint disagrees with day-first tenant parsing

## Scope and count

**33 unique reports** from #4471 across 3 tenants, received 2026-04-17 through 2026-09-22. Snapshot: export dated 2026-10-04, not the current desk queue.

Count method: deduplicate by report ID, filter mergedInto === 4471, then group by causeOf using tenant locale, booking-form version, and report channel. Do not count rows or trust intake tags.

Booking-v3 displays MM/DD/YYYY, but its form interprets input using the day-first tenant locale. A user following the hint can therefore get the wrong date. This is distinct from the shared month-first parser bug.

## Reproduction and expected result

Use the booking-v3 form for alder.physio (de-DE), copper.studio (es-ES), or pale.harbour (pt-PT). Follow its MM/DD/YYYY hint and enter 04/07/2026 intending 7 April. Day-first interpretation yields 4 July. Expected: the date hint and interpretation agree with the tenant's locale, preserving the intended date.

Evidence: R-41230 (copper.studio, form), R-41241 (alder.physio, form), and R-41251 (pale.harbour, form). These are source reports, not a live product reproduction. The mismatch is encoded in DATE_HINT and causeOf in src/lib/kb/causes.ts.

## Acceptance criteria

- Make the booking-v3 hint and date interpretation agree for all affected locales.
- Test ambiguous values and confirm the intended date survives submission.
- Test the same tenant through app/email separately: those paths can have the parser cause instead.
- Keep this issue separate from the shared-parser issue even when subject lines match.

## Audit trail

- [All assigned report IDs](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/tickets/report-ids.json) (key: hint).
- [Signed KB review source](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx).
- [Actual rendered page](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/rendered/kb/decisions/0002-dedupe-by-cause/index.html).
- [Reproduce counts](https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows/blob/main/scripts/analyze.mjs).

Subject-only merging combined distinct causes. Preserve decision 0001 as history and review proposed decision 0002 before changing desk policy.
