#!/usr/bin/env node
// API response times for a TaskHive deployment, measured from this machine.
//
//   node submission/perf/api-latency.mjs https://client-rho-ten-81.vercel.app https://fixl-assignment.onrender.com
//
// 1. Sequential: 30 requests per read endpoint, through the Vercel /api rewrite and direct to Render.
// 2. Login: 3 logins (bcrypt cost 12 dominates; login is rate-limited to 20 per 15 minutes, so keep this small).
// 3. Concurrency: 10 parallel clients x 20 requests to the task list, through Vercel.
// Writes submission/perf/results/api.json. All requests are reads except the logins.

import { mkdirSync, writeFileSync } from 'node:fs';

const WEB = (process.argv[2] || 'https://client-rho-ten-81.vercel.app').replace(/\/+$/, '');
const API = (process.argv[3] || 'https://fixl-assignment.onrender.com').replace(/\/+$/, '');
const PASSWORD = process.env.SEED_PASSWORD || 'TaskHive#2026';
const SAMPLES = 30;

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
function stats(times) {
  const s = [...times].sort((a, b) => a - b);
  return { n: s.length, p50: Math.round(pct(s, 50)), p95: Math.round(pct(s, 95)), max: Math.round(s[s.length - 1]) };
}

async function timed(url, init) {
  const t = performance.now();
  const res = await fetch(url, init);
  await res.arrayBuffer();
  return { ms: performance.now() - t, status: res.status, res };
}

async function login(base) {
  const r = await timed(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'demo@taskhive.dev', password: PASSWORD }),
  });
  const cookie = r.res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .find((c) => c.startsWith('th_token='));
  if (r.status !== 200 || !cookie) throw new Error(`login failed (${r.status})`);
  return { cookie, ms: r.ms };
}

const json = async (url, cookie) => (await fetch(url, { headers: { cookie } })).json();

const first = await login(WEB);
const cookie = first.cookie;
const orgs = (await json(`${WEB}/api/organizations`, cookie)).data;
const acme = orgs.find((o) => o.slug === 'acme-inc');
const project = (await json(`${WEB}/api/organizations/${acme.id}/projects`, cookie)).data.find(
  (p) => p.name === 'Website Redesign',
);

const endpoints = [
  ['Health check', '/api/health'],
  ['Current user', '/api/auth/me'],
  ['My organizations', '/api/organizations'],
  ['Dashboard stats', `/api/organizations/${acme.id}/stats`],
  ['Project list', `/api/organizations/${acme.id}/projects`],
  ['Task list', `/api/projects/${project.id}/tasks`],
  ['Members', `/api/organizations/${acme.id}/members`],
];

const sequential = [];
for (const [name, path] of endpoints) {
  const row = { name, path: path.replace(acme.id, ':orgId').replace(project.id, ':projectId') };
  for (const [label, base] of [
    ['vercel', WEB],
    ['render', API],
  ]) {
    const times = [];
    for (let i = 0; i < SAMPLES; i += 1) {
      const r = await timed(base + path, { headers: { cookie } });
      if (r.status !== 200) throw new Error(`${name} via ${label} returned ${r.status}`);
      times.push(r.ms);
    }
    row[label] = stats(times);
  }
  sequential.push(row);
  console.log(
    `${name.padEnd(17)} vercel p50 ${row.vercel.p50} ms p95 ${row.vercel.p95} ms | render p50 ${row.render.p50} ms p95 ${row.render.p95} ms`,
  );
}

const logins = [first.ms];
for (let i = 0; i < 2; i += 1) logins.push((await login(WEB)).ms);
const loginStats = stats(logins);
console.log(`Login (x3)        p50 ${loginStats.p50} ms max ${loginStats.max} ms`);

// Concurrency: 10 clients, 20 requests each, against the task list.
const CLIENTS = 10;
const PER_CLIENT = 20;
const taskUrl = `${WEB}/api/projects/${project.id}/tasks`;
const times = [];
let errors = 0;
const t0 = performance.now();
await Promise.all(
  Array.from({ length: CLIENTS }, async () => {
    for (let i = 0; i < PER_CLIENT; i += 1) {
      const r = await timed(taskUrl, { headers: { cookie } });
      if (r.status === 200) times.push(r.ms);
      else errors += 1;
    }
  }),
);
const elapsed = (performance.now() - t0) / 1000;
const concurrency = {
  clients: CLIENTS,
  requests: CLIENTS * PER_CLIENT,
  errors,
  seconds: Number(elapsed.toFixed(1)),
  requestsPerSecond: Number(((CLIENTS * PER_CLIENT) / elapsed).toFixed(1)),
  ...stats(times),
};
console.log(
  `Concurrency       ${concurrency.requests} req, ${errors} errors, ${concurrency.requestsPerSecond} req/s, p50 ${concurrency.p50} ms p95 ${concurrency.p95} ms`,
);

const outDir = new URL('./results/', import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  new URL('api.json', outDir),
  JSON.stringify(
    { web: WEB, api: API, date: new Date().toISOString(), sequential, login: loginStats, concurrency },
    null,
    2,
  ),
);
