import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as submission from '../src/features/submission/content.ts';

test('published performance data includes accessibility for every route and profile', () => {
  assert.ok(Array.isArray(submission.performanceRoutes), 'performanceRoutes should be published');
  assert.equal(submission.performanceRoutes.length, 6);

  for (const route of submission.performanceRoutes) {
    assert.equal(typeof route.mobile.accessibility, 'number');
    assert.equal(typeof route.desktop.accessibility, 'number');
  }

  const landing = submission.performanceRoutes.find((route) => route.route === 'Landing');
  assert.equal(landing.mobile.accessibility, 95);
  assert.equal(landing.desktop.accessibility, 95);
  assert.equal(
    submission.performanceRoutes
      .filter((route) => route.route !== 'Landing')
      .every((route) => route.mobile.accessibility === 100 && route.desktop.accessibility === 100),
    true,
  );
});

test('submission route scores match the merged Lighthouse results', () => {
  const merged = JSON.parse(
    readFileSync(new URL('../../submission/perf/results/lighthouse-merged.json', import.meta.url)),
  );
  assert.equal(merged.results.length, 12);

  for (const route of submission.performanceRoutes) {
    for (const preset of ['mobile', 'desktop']) {
      const result = merged.results.find((row) => row.page === route.route && row.preset === preset);
      assert.ok(result, `${route.route} ${preset} result is present`);
      assert.equal(route[preset].performance, result.performance);
      assert.equal(route[preset].accessibility, result.accessibility);
      assert.equal(route[preset].lcp, `${(result.lcpMs / 1000).toFixed(2)} s`);
    }
  }

  const dashboard = merged.results.find((row) => row.page === 'Dashboard' && row.preset === 'mobile');
  assert.equal(dashboard.cls, 0);
  assert.equal(dashboard.performance, 95);
  assert.equal(dashboard.finalUrl, 'https://client-rho-ten-81.vercel.app/o/acme-inc');
  assert.equal(dashboard.source, 'live deployment rerun after the layout fix');
});
