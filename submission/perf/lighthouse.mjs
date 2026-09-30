#!/usr/bin/env node
// Lighthouse (performance, accessibility, best practices, SEO) for every main page of a TaskHive deployment,
// on Lighthouse's default mobile profile (simulated slow 4G, mid-range phone) and its desktop preset.
// Signed-in pages are measured as demo@taskhive.dev.
//
//   node submission/perf/lighthouse.mjs https://client-rho-ten-81.vercel.app
//   PAGE=Dashboard PRESET=mobile LIGHTHOUSE_OUTPUT=dashboard-mobile-after.json \
//     node submission/perf/lighthouse.mjs http://127.0.0.1:4173
//
// Writes submission/perf/results/lighthouse.json. Needs Chrome installed; downloads Lighthouse via npx.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const BASE = (process.argv[2] || 'https://client-rho-ten-81.vercel.app').replace(/\/+$/, '');
const PASSWORD = process.env.SEED_PASSWORD || 'TaskHive#2026';
const RUNS = Number(process.env.RUNS || 1);
const PAGE = process.env.PAGE;
const PRESET = process.env.PRESET;
const OUT_DIR = new URL('./results/', import.meta.url);
const OUTPUT = process.env.LIGHTHOUSE_OUTPUT || 'lighthouse.json';
const NPX_CLI = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js');

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'demo@taskhive.dev', password: PASSWORD }),
  });
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .find((c) => c.startsWith('th_token='));
  if (!res.ok || !cookie) throw new Error(`Demo login failed (${res.status})`);
  return cookie;
}

async function projectPath(cookie) {
  const orgs = (await (await fetch(`${BASE}/api/organizations`, { headers: { cookie } })).json()).data;
  const acme = orgs.find((o) => o.slug === 'acme-inc');
  const projects = (
    await (await fetch(`${BASE}/api/organizations/${acme.id}/projects`, { headers: { cookie } })).json()
  ).data;
  return `/o/acme-inc/projects/${projects.find((p) => p.name === 'Website Redesign').id}`;
}

function lighthouse(url, preset, cookie) {
  const file = join(tmpdir(), `th-lh-${Date.now()}.json`);
  const headersFile = cookie ? join(tmpdir(), `th-lh-headers-${Date.now()}.json`) : null;
  const args = [
    '-y',
    'lighthouse@13',
    url,
    '--quiet',
    '--output=json',
    `--output-path=${file}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless=new',
  ];
  if (preset === 'desktop') args.push('--preset=desktop');
  if (headersFile) {
    writeFileSync(headersFile, JSON.stringify({ Cookie: cookie }));
    args.push(`--extra-headers=${headersFile}`);
  }
  try {
    if (process.platform === 'win32') execFileSync(process.execPath, [NPX_CLI, ...args], { stdio: 'ignore' });
    else execFileSync('npx', args, { stdio: 'ignore' });
  } finally {
    if (headersFile) rmSync(headersFile, { force: true });
  }
  const lhr = JSON.parse(readFileSync(file, 'utf8'));
  rmSync(file);
  const a = lhr.audits;
  const score = (k) => Math.round(lhr.categories[k].score * 100);
  return {
    finalUrl: lhr.finalDisplayedUrl,
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    fcpMs: Math.round(a['first-contentful-paint'].numericValue),
    lcpMs: Math.round(a['largest-contentful-paint'].numericValue),
    tbtMs: Math.round(a['total-blocking-time'].numericValue),
    cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
    speedIndexMs: Math.round(a['speed-index'].numericValue),
    transferKb: Math.round(a['total-byte-weight'].numericValue / 1024),
  };
}

// Median run by performance score, so one noisy run doesn't decide the result.
function median(runs) {
  return [...runs].sort((x, y) => x.performance - y.performance)[Math.floor(runs.length / 2)];
}

const cookie = await login();
const pages = [
  { name: 'Landing', path: '/', auth: false },
  { name: 'Log in', path: '/login', auth: false },
  { name: 'Dashboard', path: '/o/acme-inc', auth: true },
  { name: 'Projects', path: '/o/acme-inc/projects', auth: true },
  ...(PAGE && PAGE !== 'Project detail' ? [] : [{ name: 'Project detail', path: await projectPath(cookie), auth: true }]),
  { name: 'Members', path: '/o/acme-inc/members', auth: true },
].filter((page) => !PAGE || page.name.toLowerCase() === PAGE.toLowerCase());
if (!pages.length) throw new Error(`Unknown page: ${PAGE}`);
if (PRESET && !['mobile', 'desktop'].includes(PRESET)) throw new Error(`Unknown preset: ${PRESET}`);

const results = [];
for (const page of pages) {
  for (const preset of PRESET ? [PRESET] : ['mobile', 'desktop']) {
    const runs = [];
    for (let i = 0; i < RUNS; i += 1) runs.push(lighthouse(BASE + page.path, preset, page.auth ? cookie : null));
    const r = { page: page.name, path: page.path, preset, runs: RUNS, ...median(runs) };
    results.push(r);
    console.log(
      `${page.name.padEnd(15)} ${preset.padEnd(8)} perf ${r.performance}  a11y ${r.accessibility}  ` +
        `bp ${r.bestPractices}  seo ${r.seo}  LCP ${r.lcpMs} ms  TBT ${r.tbtMs} ms  CLS ${r.cls}  ${r.transferKb} KB`,
    );
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  new URL(OUTPUT, OUT_DIR),
  JSON.stringify({ base: BASE, lighthouse: '13', date: new Date().toISOString(), results }, null, 2),
);
