import fs from 'node:fs';
import { groupByCause, uniqueById } from '../src/lib/kb/causes.ts';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../src/lib/data/${name}`, import.meta.url), 'utf8'));
const tenants = new Map(fs.readdirSync(new URL('../src/lib/data/tenants/', import.meta.url)).map((name) => {
  const tenant = read(`tenants/${name}`);
  return [tenant.handle, tenant];
}));
const merged = uniqueById(read('reports-4471.json')).filter((r) => r.mergedInto === 4471);
const groups = groupByCause(merged, (r) => tenants.get(r.tenant));
const repo = 'https://github.com/slawek-kordaczuk/mega-s01e03-what-it-shows';
const details = {
  parser: {
    title: 'Shared parser reads day-first tenant dates as MM/DD',
    text: `The shared parser assumes month-first input for day-first tenants. This is the main cause in #4471, not evidence that all merged reports share one bug.

## Reproduction and expected result

Use harbour.dental (en-GB, booking-v2), or another day-first tenant on an app/email or booking-v2 path. Enter 07/04/2026 as 7 April: the reported failure interprets it as 4 July. Expected: interpret the input using the tenant's locale, or require unambiguous input, and keep the intended calendar date.

Evidence: R-41200 describes 7 April becoming 4 July; R-41201 corrects its direction. These are source reports, not a live product reproduction. The cause logic is in src/lib/kb/causes.ts; tenant configuration is in src/lib/data/tenants/.

## Acceptance criteria

- Respect the tenant's date order across app, email, and booking-v2 paths.
- Test day/month-ambiguous values, days greater than twelve, and non-day-first tenants.
- Do not treat the booking-v3 hint bug as fixed by this change.
- Preserve R-41202, R-41209, R-41236, R-41344, and R-41620 as one-day/timing caveats for investigation. The export groups them here; their wording alone does not prove a separate timezone cause.`,
  },
  hint: {
    title: 'Booking-v3 date hint disagrees with day-first tenant parsing',
    text: `Booking-v3 displays MM/DD/YYYY, but its form interprets input using the day-first tenant locale. A user following the hint can therefore get the wrong date. This is distinct from the shared month-first parser bug.

## Reproduction and expected result

Use the booking-v3 form for alder.physio (de-DE), copper.studio (es-ES), or pale.harbour (pt-PT). Follow its MM/DD/YYYY hint and enter 04/07/2026 intending 7 April. Day-first interpretation yields 4 July. Expected: the date hint and interpretation agree with the tenant's locale, preserving the intended date.

Evidence: R-41230 (copper.studio, form), R-41241 (alder.physio, form), and R-41251 (pale.harbour, form). These are source reports, not a live product reproduction. The mismatch is encoded in DATE_HINT and causeOf in src/lib/kb/causes.ts.

## Acceptance criteria

- Make the booking-v3 hint and date interpretation agree for all affected locales.
- Test ambiguous values and confirm the intended date survives submission.
- Test the same tenant through app/email separately: those paths can have the parser cause instead.
- Keep this issue separate from the shared-parser issue even when subject lines match.`,
  },
};
const dir = new URL('../tickets/', import.meta.url);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(new URL('report-ids.json', dir), JSON.stringify(Object.fromEntries(groups.map((g) => [g.cause, g.reports.map((r) => r.id)])), null, 2) + '\n');
for (const group of groups) {
  const detail = details[group.cause];
  if (!detail) throw new Error(`Unclassified cause: ${group.cause}`);
  const body = `# ${detail.title}\n\n## Scope and count\n\n**${group.reports.length} unique reports** from #4471 across ${group.tenants} tenants, received ${group.firstSeen} through ${group.lastSeen}. Snapshot: export dated 2026-10-04, not the current desk queue.\n\nCount method: deduplicate by report ID, filter mergedInto === 4471, then group by causeOf using tenant locale, booking-form version, and report channel. Do not count rows or trust intake tags.\n\n${detail.text}\n\n## Audit trail\n\n- [All assigned report IDs](${repo}/blob/main/tickets/report-ids.json) (key: ${group.cause}).\n- [Signed KB review source](${repo}/blob/main/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx).\n- [Actual rendered page](${repo}/blob/main/rendered/kb/decisions/0002-dedupe-by-cause/index.html).\n- [Reproduce counts](${repo}/blob/main/scripts/analyze.mjs).\n\nSubject-only merging combined distinct causes. Preserve decision 0001 as history and review proposed decision 0002 before changing desk policy.\n`;
  fs.writeFileSync(new URL(`${group.cause}.md`, dir), body);
  console.log(`${group.cause}: ${group.reports.length} reports; tickets/${group.cause}.md`);
}
