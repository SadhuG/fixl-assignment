import test from 'node:test';
import assert from 'node:assert/strict';
import { hueFor, orgStyle } from '../src/lib/orgHue.ts';

test('organization slugs select stable, distinct demo colors', () => {
  const acme = { slug: 'acme-inc' };
  const beta = { slug: 'beta-labs' };

  assert.notEqual(hueFor(acme).deep, hueFor(beta).deep);
  assert.deepEqual(hueFor(acme), hueFor({ slug: acme.slug }));
  assert.equal(orgStyle(acme)['--org-deep'], hueFor(acme).deep);
});
