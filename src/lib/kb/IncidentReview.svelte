<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const unique = uniqueById(reports as Report[]);
  const merged = unique.filter((r) => r.mergedInto === 4471);
  const groups = groupByCause(merged, tenantOf);
  const receivedDays = merged.map((r) => r.receivedAt.slice(0, 10)).sort();
  const firstMerge = merged.flatMap((r) => r.mergedAt ? [r.mergedAt.slice(0, 10)] : []).sort()[0];
  const earlier = merged.filter((r) => r.receivedAt.slice(0, 10) < firstMerge);
  const onFirstMerge = merged.filter((r) => r.mergedAt?.startsWith(firstMerge));
  const later = merged.filter((r) => r.receivedAt.slice(0, 10) > firstMerge);
  const mismatches = groups.reduce((n, g) => n + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0);
  const flagged = groups.reduce((n, g) => n + readAs(g, notes.oneDayMove), 0);
  const months = [...new Set(merged.map((r) => r.receivedAt.slice(0, 7)))].sort();
</script>

<p><strong>{merged.length} unique reports</strong> are merged into #4471, from {reports.length} export rows.
  Deduplicating by report ID removes {reports.length - unique.length} repeated rows.
  Reports were received from {receivedDays[0]} through {receivedDays[receivedDays.length - 1]}.</p>

<table>
  <thead><tr><th>Problem</th><th>Unique reports</th><th>Tenant count</th><th>First / last received</th></tr></thead>
  <tbody>
    {#each groups as group (group.cause)}
      <tr><td><code>{group.cause}</code></td><td>{group.reports.length}</td><td>{group.tenants}</td><td>{group.firstSeen} / {group.lastSeen}</td></tr>
    {/each}
  </tbody>
</table>

<p>Intake tags disagree with tenant-and-channel classification on {mismatches} reports.
  The desk notes flag {flagged} reports read as one-day moves; all remain in their tenant-derived groups.
  These descriptions merit investigation, but do not establish a separate timezone bug.</p>

<h3>Receipt time is not merge time</h3>
<p>The first merge day is {firstMerge}: {onFirstMerge.length} reports were merged that day,
  including a backlog of {earlier.length} reports received before that day.
  Another {later.length} reports arrived after that day. The queue did not stop when the ticket was grouped.</p>

<table>
  <thead><tr><th>Month</th><th>Received</th><th>Merged</th></tr></thead>
  <tbody>
    {#each months as month (month)}
      <tr><td>{month}</td><td>{merged.filter((r) => r.receivedAt.startsWith(month)).length}</td><td>{merged.filter((r) => r.mergedAt?.startsWith(month)).length}</td></tr>
    {/each}
  </tbody>
</table>
