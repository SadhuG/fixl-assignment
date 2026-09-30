#!/usr/bin/env node
// Black-box checks for the assignment's tenant-isolation and authorization requirements.
// Runs against any TaskHive API that has the demo seed loaded.
//
//   node submission/verify-api.mjs                                   # http://localhost:4000
//   node submission/verify-api.mjs https://fixl-assignment.onrender.com
//
// Every check is expected to be refused by the server, so a passing run changes no data.
// Exits 1 if any check fails.

const BASE = (process.argv[2] || process.env.API_URL || 'http://localhost:4000').replace(/\/+$/, '');
const PASSWORD = process.env.SEED_PASSWORD || 'TaskHive#2026';
const MISSING_ID = '0123456789abcdef01234567';

let passed = 0;
let failed = 0;

function check(label, ok, detail = '') {
  if (ok) passed += 1;
  else failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && detail ? `\n      ${detail}` : ''}`);
}

async function call(method, path, { cookie, body } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Non-JSON bodies are reported as text below.
  }
  return { status: res.status, json, text, setCookie: res.headers.getSetCookie?.() ?? [] };
}

function expectStatus(label, res, status) {
  check(`${label} → ${status}`, res.status === status, `got ${res.status}: ${res.text.slice(0, 200)}`);
}

async function login(email) {
  const res = await call('POST', '/auth/login', { body: { email, password: PASSWORD } });
  const token = res.setCookie.map((c) => c.split(';')[0]).find((c) => c.startsWith('th_token='));
  if (res.status !== 200 || !token) {
    throw new Error(`Could not log in as ${email} (${res.status}). Is the demo seed loaded? ${res.text.slice(0, 200)}`);
  }
  return { cookie: token, user: res.json };
}

async function main() {
  console.log(`TaskHive API checks against ${BASE}\n`);

  // Render's free tier sleeps; the first request can take ~30 s.
  const health = await call('GET', '/health');
  expectStatus('GET /health', health, 200);

  console.log('\n# Authentication');
  expectStatus('GET /auth/me without a cookie', await call('GET', '/auth/me'), 401);
  expectStatus('GET /organizations without a cookie', await call('GET', '/organizations'), 401);
  expectStatus(
    'GET /auth/me with a forged cookie',
    await call('GET', '/auth/me', { cookie: 'th_token=forged.jwt.value' }),
    401,
  );
  const wrong = await call('POST', '/auth/login', {
    body: { email: 'demo@taskhive.dev', password: 'wrong-password-1' },
  });
  const unknown = await call('POST', '/auth/login', {
    body: { email: 'nobody@taskhive.dev', password: 'wrong-password-1' },
  });
  expectStatus('login with a wrong password', wrong, 401);
  check(
    'wrong password and unknown email give identical responses',
    wrong.text === unknown.text && unknown.status === 401,
  );

  const demo = await login('demo@taskhive.dev');
  const alice = await login('alice@taskhive.dev');
  const bob = await login('bob@taskhive.dev');
  check('login responses never include a password hash', ![demo, alice, bob].some((s) => 'passwordHash' in s.user));
  const loginRes = await call('POST', '/auth/login', { body: { email: 'demo@taskhive.dev', password: PASSWORD } });
  check(
    'session cookie is HttpOnly',
    loginRes.setCookie.some((c) => /th_token=.*;\s*HttpOnly/i.test(c)),
  );
  if (BASE.startsWith('https://')) {
    check(
      'session cookie is Secure over HTTPS',
      loginRes.setCookie.some((c) => /th_token=.*;\s*Secure/i.test(c)),
    );
  }

  console.log('\n# Organizations and membership');
  const demoOrgs = (await call('GET', '/organizations', { cookie: demo.cookie })).json.data;
  const acme = demoOrgs.find((o) => o.slug === 'acme-inc');
  const beta = demoOrgs.find((o) => o.slug === 'beta-labs');
  check('demo belongs to Acme (ADMIN) and Beta Labs (MEMBER)', acme?.role === 'ADMIN' && beta?.role === 'MEMBER');
  const aliceOrgs = (await call('GET', '/organizations', { cookie: alice.cookie })).json.data;
  check('alice only sees Acme Inc.', aliceOrgs.length === 1 && aliceOrgs[0].id === acme.id);
  const bobOrgs = (await call('GET', '/organizations', { cookie: bob.cookie })).json.data;
  check('bob only sees Beta Labs', bobOrgs.length === 1 && bobOrgs[0].id === beta.id);

  // IDs for the attack table, fetched by a legitimate member of each org.
  const acmeProjects = (await call('GET', `/organizations/${acme.id}/projects`, { cookie: demo.cookie })).json.data;
  const betaProjects = (await call('GET', `/organizations/${beta.id}/projects`, { cookie: bob.cookie })).json.data;
  const acmeProject = acmeProjects.find((p) => p.name === 'Website Redesign');
  const betaProject = betaProjects.find((p) => p.name === 'Mobile Application');
  const acmeTask = (await call('GET', `/projects/${acmeProject.id}/tasks`, { cookie: demo.cookie })).json.data[0];
  const betaTasks = (await call('GET', `/projects/${betaProject.id}/tasks`, { cookie: bob.cookie })).json.data;
  const betaTask = betaTasks.find((t) => t.createdBy?.id !== demo.user.id);

  console.log('\n# Tenant isolation: alice (Acme only) attacks Beta Labs by ID');
  expectStatus(
    'GET /organizations/:betaId',
    await call('GET', `/organizations/${beta.id}`, { cookie: alice.cookie }),
    404,
  );
  expectStatus(
    'GET /organizations/:betaId/members',
    await call('GET', `/organizations/${beta.id}/members`, { cookie: alice.cookie }),
    404,
  );
  expectStatus(
    'GET /organizations/:betaId/projects',
    await call('GET', `/organizations/${beta.id}/projects`, { cookie: alice.cookie }),
    404,
  );
  expectStatus(
    'GET /organizations/:betaId/stats',
    await call('GET', `/organizations/${beta.id}/stats`, { cookie: alice.cookie }),
    404,
  );

  const foreign = await call('GET', `/projects/${betaProject.id}`, { cookie: alice.cookie });
  const missing = await call('GET', `/projects/${MISSING_ID}`, { cookie: alice.cookie });
  expectStatus("GET /projects/:betaProjectId (the brief's example attack)", foreign, 404);
  check('...and the body is identical to a project that does not exist', foreign.text === missing.text);
  check('...and it leaks no Beta Labs data', !foreign.text.includes('Mobile Application'));

  expectStatus(
    'PATCH /projects/:betaProjectId',
    await call('PATCH', `/projects/${betaProject.id}`, { cookie: alice.cookie, body: { name: 'Pwned' } }),
    404,
  );
  expectStatus(
    'DELETE /projects/:betaProjectId',
    await call('DELETE', `/projects/${betaProject.id}`, { cookie: alice.cookie }),
    404,
  );
  expectStatus(
    'GET /projects/:betaProjectId/tasks',
    await call('GET', `/projects/${betaProject.id}/tasks`, { cookie: alice.cookie }),
    404,
  );
  expectStatus(
    'POST /projects/:betaProjectId/tasks',
    await call('POST', `/projects/${betaProject.id}/tasks`, { cookie: alice.cookie, body: { title: 'Planted' } }),
    404,
  );
  expectStatus(
    'POST /organizations/:betaId/projects',
    await call('POST', `/organizations/${beta.id}/projects`, { cookie: alice.cookie, body: { name: 'Planted' } }),
    404,
  );
  expectStatus(
    'PATCH /tasks/:betaTaskId',
    await call('PATCH', `/tasks/${betaTask.id}`, { cookie: alice.cookie, body: { title: 'Pwned' } }),
    404,
  );
  expectStatus(
    'DELETE /tasks/:betaTaskId',
    await call('DELETE', `/tasks/${betaTask.id}`, { cookie: alice.cookie }),
    404,
  );
  expectStatus(
    'GET /tasks/:betaTaskId/activity',
    await call('GET', `/tasks/${betaTask.id}/activity`, { cookie: alice.cookie }),
    404,
  );

  const afterProject = await call('GET', `/projects/${betaProject.id}`, { cookie: bob.cookie });
  check('Beta Labs project is unchanged after the attacks', afterProject.json?.name === 'Mobile Application');

  console.log('\n# Tenant isolation: tampered bodies, queries and IDs');
  const query = await call(
    'GET',
    `/projects/${acmeProject.id}/tasks?organization=${beta.id}&project=${betaProject.id}`,
    { cookie: alice.cookie },
  );
  check(
    'extra organization/project query params cannot widen a task list',
    query.status === 200 &&
      query.json.data.every((t) => t.project === acmeProject.id) &&
      !query.text.includes(betaTask.title),
    `got ${query.status}: ${query.text.slice(0, 200)}`,
  );
  expectStatus(
    'Mongo operator in a body ({"title": {"$ne": ""}})',
    await call('PATCH', `/tasks/${acmeTask.id}`, { cookie: alice.cookie, body: { title: { $ne: '' } } }),
    400,
  );
  expectStatus(
    'assigning an Acme task to bob, who is not an Acme member',
    await call('PATCH', `/tasks/${acmeTask.id}`, { cookie: demo.cookie, body: { assignee: bob.user.id } }),
    400,
  );
  expectStatus('malformed project id', await call('GET', '/projects/not-an-id', { cookie: alice.cookie }), 404);
  expectStatus(
    'malformed task id',
    await call('PATCH', '/tasks/not-an-id', { cookie: alice.cookie, body: { title: 'x' } }),
    404,
  );
  expectStatus(
    'malformed organization id',
    await call('GET', '/organizations/not-an-id', { cookie: alice.cookie }),
    404,
  );

  console.log('\n# Roles inside an org the user belongs to');
  expectStatus(
    'alice (Acme MEMBER) deletes an Acme project',
    await call('DELETE', `/projects/${acmeProject.id}`, { cookie: alice.cookie }),
    403,
  );
  expectStatus(
    'alice (Acme MEMBER) renames Acme',
    await call('PATCH', `/organizations/${acme.id}`, { cookie: alice.cookie, body: { name: 'Mine now' } }),
    403,
  );
  expectStatus(
    'alice (Acme MEMBER) demotes the Acme admin',
    await call('PATCH', `/organizations/${acme.id}/members/${demo.user.id}`, {
      cookie: alice.cookie,
      body: { role: 'MEMBER' },
    }),
    403,
  );
  expectStatus(
    'demo (Beta MEMBER) adds a member to Beta Labs',
    await call('POST', `/organizations/${beta.id}/members`, {
      cookie: demo.cookie,
      body: { email: 'alice@taskhive.dev' },
    }),
    403,
  );
  expectStatus(
    'demo (Beta MEMBER) deletes a task someone else created',
    await call('DELETE', `/tasks/${betaTask.id}`, { cookie: demo.cookie }),
    403,
  );
  expectStatus(
    'demo (Beta MEMBER) can still read Beta Labs projects',
    await call('GET', `/organizations/${beta.id}/projects`, { cookie: demo.cookie }),
    200,
  );

  console.log('\n# Logout');
  const logout = await call('POST', '/auth/logout', { cookie: alice.cookie });
  expectStatus('POST /auth/logout', logout, 204);
  check(
    'logout clears the session cookie',
    logout.setCookie.some((c) => /th_token=;/.test(c) || /Expires=Thu, 01 Jan 1970/i.test(c)),
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((err) => {
  console.error(`\nERROR: ${err.message}`);
  process.exitCode = 1;
});
