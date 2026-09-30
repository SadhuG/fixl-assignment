#!/usr/bin/env node
// Replace only the dashboard mobile baseline with its targeted rerun on the live deployment.
import { readFileSync, writeFileSync } from 'node:fs';

const resultsDir = new URL('./results/', import.meta.url);
const baseline = JSON.parse(readFileSync(new URL('lighthouse.json', resultsDir), 'utf8'));
const rerun = JSON.parse(readFileSync(new URL('dashboard-mobile-after.json', resultsDir), 'utf8'));
if (rerun.results.length !== 1) throw new Error('Expected exactly one dashboard mobile rerun');

const replacement = rerun.results[0];
if (replacement.page !== 'Dashboard' || replacement.preset !== 'mobile') {
  throw new Error('The rerun must be for the mobile dashboard');
}

let replaced = 0;
const results = baseline.results.map((result) => {
  if (result.page !== replacement.page || result.preset !== replacement.preset) return result;
  if (result.path !== replacement.path) throw new Error('Dashboard paths differ');
  replaced += 1;
  return { ...replacement, source: 'live deployment rerun after the layout fix' };
});
if (replaced !== 1) throw new Error(`Expected one baseline dashboard mobile result, found ${replaced}`);

writeFileSync(
  new URL('lighthouse-merged.json', resultsDir),
  `${JSON.stringify(
    {
      lighthouse: baseline.lighthouse,
      baselineDate: baseline.date,
      rerunDate: rerun.date,
      baseline: baseline.base,
      rerun: rerun.base,
      results,
    },
    null,
    2,
  )}\n`,
);
