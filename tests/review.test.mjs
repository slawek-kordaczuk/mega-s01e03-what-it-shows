import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { causeOf, groupByCause, readAs, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const data = new URL('../src/lib/data/', import.meta.url);
const read = (name) => JSON.parse(fs.readFileSync(new URL(name, data), 'utf8'));
const raw = read('reports-4471.json');
const tenants = new Map(fs.readdirSync(new URL('tenants/', data)).map((name) => {
  const tenant = read(`tenants/${name}`);
  return [tenant.handle, tenant];
}));
const tenantOf = (report) => tenants.get(report.tenant);
const merged = uniqueById(raw).filter((r) => r.mergedInto === 4471);
const groups = groupByCause(merged, tenantOf);

test('overlapping export pages count once per report ID', () => {
  assert.equal(raw.length, 427);
  assert.equal(merged.length, 412);
  assert.equal(uniqueById([...raw, ...raw]).length, merged.length);
});

test('tenant locale and channel split the ticket into two causes', () => {
  assert.deepEqual(Object.fromEntries(groups.map((g) => [g.cause, g.reports.length])), { parser: 379, hint: 33 });
  assert.equal(groups.reduce((sum, g) => sum + g.reports.length, 0), merged.length);
  assert.equal(groups.reduce((sum, g) => sum + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0), 38);
});

test('equal subjects can have different causes; different subjects can share one', () => {
  const form = { tenant: 'alder.physio', channel: 'form', subject: 'Same subject' };
  const app = { ...form, channel: 'app' };
  assert.equal(sameCause(form, tenantOf(form), app, tenantOf(app)), false);
  assert.equal(sameCause(app, tenantOf(app), { ...app, channel: 'email', subject: 'Different' }, tenantOf(app)), true);
  assert.equal(sameCause(form, undefined, form, undefined), false);
  assert.equal(causeOf(form, { ...tenantOf(form), locale: 'en-US' }), null);
});

test('one-day descriptions stay visible without inventing another confirmed cause', () => {
  const ids = read('desk-notes.json').oneDayMove;
  assert.equal(readAs(groups.find((g) => g.cause === 'parser'), ids), 5);
  assert.equal(readAs(groups.find((g) => g.cause === 'hint'), ids), 0);
});

test('the page is genuinely rendered, signed, and contains computed evidence', () => {
  const source = fs.readFileSync(new URL('../src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx', import.meta.url), 'utf8');
  const signature = source.match(/^signature: '(.+)'$/m)[1];
  const html = fs.readFileSync(new URL('../rendered/kb/decisions/0002-dedupe-by-cause/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes(deskRef(signature)));
  assert.ok(html.includes('379'));
  assert.ok(html.includes('33'));
  assert.ok(html.includes('38 reports'));
  assert.ok(html.includes('different causes'));
  assert.ok(html.includes('183'));
  assert.ok(!html.includes('no desk ref:'));
  assert.ok(!html.includes('<RenderStamp'));
});
