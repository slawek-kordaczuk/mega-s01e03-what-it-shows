import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uniqueById, groupByCause, readAs } from '../src/lib/kb/causes.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, 'src/lib/data', name), 'utf8'));
const tenants = new Map(fs.readdirSync(path.join(root, 'src/lib/data/tenants')).map((name) => {
  const tenant = json(`tenants/${name}`);
  return [tenant.handle, tenant];
}));
const raw = json('reports-4471.json');
const unique = uniqueById(raw);
const merged = unique.filter((r) => r.mergedInto === 4471);
const notes = json('desk-notes.json');
const groups = groupByCause(merged, (r) => tenants.get(r.tenant));
const monthCounts = (field) => Object.fromEntries([...new Set(merged.map((r) => r[field]?.slice(0, 7)))].sort().map((month) => [month, merged.filter((r) => r[field]?.startsWith(month)).length]));
console.log(JSON.stringify({
  raw: raw.length,
  unique: unique.length,
  merged: merged.length,
  duplicateIds: raw.filter((r, i) => raw.findIndex((other) => other.id === r.id) !== i).map((r) => r.id),
  receivedByMonth: monthCounts('receivedAt'),
  mergedByMonth: monthCounts('mergedAt'),
  groups: groups.map((g) => ({ ...g, reports: g.reports.length, oneDayMove: readAs(g, notes.oneDayMove), examples: g.reports.slice(0, 3), ids: g.reports.map((r) => r.id) })),
  tenants: [...tenants.values()],
  oneDayReports: unique.filter((r) => notes.oneDayMove.includes(r.id)),
}, null, 2));
