# TaskHive: submission

```
Candidate Name:        Sudhansh
GitHub Repository:     https://github.com/SadhuG/fixl-assignment
Deployed Application:  https://client-rho-ten-81.vercel.app
Demo Email:            demo@taskhive.dev
Demo Password:         TaskHive#2026
```

The demo user is **Admin in Acme Inc.** and **Member in Beta Labs**, so one login shows organization switching and both roles. Two more seeded users, with the same password, make the isolation checks possible:

| User                 | Acme Inc. | Beta Labs |
| -------------------- | --------- | --------- |
| `demo@taskhive.dev`  | ADMIN     | MEMBER    |
| `alice@taskhive.dev` | MEMBER    | —         |
| `bob@taskhive.dev`   | —         | ADMIN     |

> The API runs on Render's free tier and sleeps when idle. The first request after a pause can take about 30 seconds.

The API is served from the same origin through a Vercel rewrite (`https://client-rho-ten-81.vercel.app/api`); it runs on Render at https://fixl-assignment.onrender.com.

Setup, environment variables, the full API table and the data model are in the [README](../README.md). This file covers the additional notes, how to check every test area the brief names, and the production performance test of the complete deployed UI and API path.

---

## Production performance test

The audit ran on **30 September 2026** against `https://client-rho-ten-81.vercel.app`. It covers all six primary routes (Landing, Log in, Dashboard, Projects, Project detail and Members) in Lighthouse 13's default simulated-mobile profile and desktop preset. After a layout fix, the dashboard mobile profile was rerun on the live deployment (median of three runs), and that rerun replaces its first result below. The same session also measured seven API read paths through both the Vercel rewrite and Render, three logins, and 200 task-list requests from 10 parallel clients.

### Headline results

| Measure                                                 |                                Result |
| ------------------------------------------------------- | ------------------------------------: |
| Lighthouse mobile performance, average across 6 routes  |                  **94** (range 93–95) |
| Lighthouse desktop performance, average across 6 routes |        **100** rounded (range 99–100) |
| Lighthouse accessibility, average across all 12 audits  |                 **99** (range 95–100) |
| Mobile LCP, average / worst                             |                   **2.48 s / 2.61 s** |
| Total Blocking Time across all 12 audits                |                           **0–14 ms** |
| Transferred payload per route                           |                        **281–305 KB** |
| Concurrent task-list reads                              | **200**, **0 errors**, 4.9 requests/s |
| Concurrent latency                                      |        p50 **1.74 s**, p95 **2.39 s** |

| Route          | Mobile performance | Mobile accessibility | Desktop performance | Desktop accessibility | Mobile LCP | Desktop LCP |
| -------------- | -----------------: | -------------------: | ------------------: | --------------------: | ---------: | ----------: |
| Landing        |                 95 |                   95 |                 100 |                    95 |     2.35 s |      0.51 s |
| Log in         |                 93 |                  100 |                 100 |                   100 |     2.57 s |      0.53 s |
| Dashboard¹     |                 95 |                  100 |                  99 |                   100 |     2.43 s |      0.55 s |
| Projects       |                 94 |                  100 |                 100 |                   100 |     2.50 s |      0.52 s |
| Project detail |                 93 |                  100 |                  99 |                   100 |     2.61 s |      0.79 s |
| Members        |                 94 |                  100 |                 100 |                   100 |     2.44 s |      0.51 s |

¹ Dashboard mobile is the live rerun after the layout fix. Its loading view now reserves the status cards and task sections, so CLS measured **0**, down from **0.169** in the first audit, and performance rose from 88 to **95**.

The accessibility average is **99 across all 12 audits**. Every authenticated route scored 100 in both profiles; the public Landing route scored 95. The larger performance constraint is the hosted API/database path: Vercel p50 read latency ranged from **308 ms** for health to **1,713 ms** for the task list. Direct Render timings were close, so the Vercel rewrite adds little relative to the database-backed work. Login measured p50 **2,895 ms** (bcrypt cost 12 contributes intentionally).

These figures are dated measurements, not an SLA. Network location, Render load and MongoDB Atlas conditions affect them. The [merged result](perf/results/lighthouse-merged.json), [first audit](perf/results/lighthouse.json), [dashboard mobile rerun](perf/results/dashboard-mobile-after.json), and repeatable harnesses are in [`perf/`](perf/):

```bash
node submission/perf/lighthouse.mjs https://client-rho-ten-81.vercel.app
PAGE=Dashboard PRESET=mobile RUNS=3 LIGHTHOUSE_OUTPUT=dashboard-mobile-after.json \
  node submission/perf/lighthouse.mjs https://client-rho-ten-81.vercel.app
node submission/perf/merge-lighthouse.mjs
node submission/perf/api-latency.mjs https://client-rho-ten-81.vercel.app https://fixl-assignment.onrender.com
```

---

## Additional notes

### Architecture decisions

- **Tenant resolved by the server, before the controller runs.** Every org-scoped route goes through `authenticate → loadOrg | loadProject | loadTask → requireRole → validate → controller`. `loadProject` and `loadTask` read the resource, take its `organization` from the database and look up the caller's `Membership` for that org. Nothing from the URL, body, query or frontend state is trusted to identify the tenant. See `server/src/middleware/`.
- **404 for other tenants, 403 for insufficient roles.** A foreign ID returns a body that is byte-for-byte identical to a missing ID, so an outsider can't probe for existence. A member of the org who lacks the role gets 403, because they already know the resource exists.
- **Membership is its own collection** with a unique `{user, organization}` index. "Is X in Y, and as what?" is one indexed lookup on every request, and no document grows without bound.
- **Tasks store `organization`** (copied from the project on create). Task queries get a single indexed tenant filter, and it's a second line of defence if a project lookup is ever skipped.
- **Tenant fields are server-set.** `organization`, `project` and `createdBy` come from `req.*`. Zod strips unknown body keys, so a smuggled `organization` is ignored.
- **Roles are read live** from `Membership` on every request, not from the JWT. Removing a member or demoting an admin takes effect on their next request.
- **JWT in an `httpOnly`, `SameSite=Lax` cookie** (`Secure` in production), never in `localStorage`. Vercel rewrites `/api/*` to Render, so the API is same-origin and the cookie stays first-party (this avoids Safari's third-party cookie blocking).
- **Transactions for the invariants that races can break:** at least one admin per org, and no orphan tasks when a project is deleted while a task is being created. `server/tests/concurrency.test.js` covers both.
- **Client:** TypeScript (strict), TanStack Query for all server state keyed by org id, so switching orgs can't show another org's cached data. React Hook Form + Zod for forms. The server stays CommonJS JavaScript by choice.

### Trade-offs

- **Stateless JWT, no session store.** Logout clears the cookie, but a stolen token stays valid until it expires (7 days). It can never exceed the victim's _current_ memberships, because those are checked live.
- **Members are added by existing email**, not invited. That keeps scope tight, at the cost of telling an admin whether an email has an account.
- **Org slugs are unique across all orgs** (`acme`, `acme-2`). This reveals that an org _name_ is taken, but nothing inside it.
- **No `express-mongo-sanitize`** (incompatible with Express 5). Zod type-checks every field, Express 5's query parser doesn't build objects, and a small middleware rejects `$` and `.` keys in bodies.
- **Board view uses a status select, not drag-and-drop**, so it works with a keyboard and screen reader out of the box.

### Bonus features included

Task search and filters (status, priority, assignee, `me`/`none`), a List/Board view, dashboard statistics, an organization and task activity log, a seed script, CI (GitHub Actions: lint and tests), and 110 automated tests.

### Known limitations

- No pagination on project and task lists (the activity feed is paginated). No email invites, password reset or email verification.
- No real-time updates: other users' changes appear on refetch (window focus or navigation).
- No refresh-token rotation or server-side session revocation.
- Render free-tier cold starts (~30 s).
- Two touch targets on a 360 px phone are below the 40 px target (still above WCAG 2.5.8's 24 px); details in [VERIFICATION.md](../VERIFICATION.md).

### With more time

Cursor pagination for project and task lists on `{organization, createdAt}`, email invitations with expiring tokens, Playwright end-to-end tests of the isolation walkthrough below, OpenAPI docs, a short-lived access token plus a revocable refresh token, and a fuller UI and UX design pass for a more polished, modern interface.

---

## Tests the brief asks for

Section 11 of the brief asks for tests around **authentication, authorization, tenant isolation, organization membership, project access and task access**. Section 5 adds the attack scenario and the list of things an attacker may tamper with, and section 8 the status codes. Each dropdown below maps one area to its automated tests and to a check you can run yourself.

- **Automated** tests live in `server/tests/` (Jest + Supertest against an in-memory MongoDB replica set).
- **Script** checks are in [`verify-api.mjs`](verify-api.mjs) and run against any deployment (see [Option 2](#option-2-run-the-attack-script-against-the-live-api)).
- **UI** checks are the numbered steps in [Option 3](#option-3-check-it-in-the-browser).

<details>
<summary><strong>1. Authentication (brief §4.1, §8)</strong></summary>

| Requirement                            | Automated test                                                                                                                                        | Check yourself                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Register, log in, log out              | `auth.test.js`: _creates the user, sets an httpOnly cookie and never returns the hash_; _me returns the current user and logout ends the session_     | Script: Authentication, Logout · UI: steps 1, 9                      |
| Passwords never stored in plain text   | `auth.test.js`: _stores a bcrypt hash, never the plain password_ · `models.test.js`: _passwordHash is never selected or serialised by default_        | Script: _login responses never include a password hash_              |
| Protected areas need a session         | `auth.test.js`: _GET /api/auth/me without a cookie returns 401_; _…with a garbage cookie returns 401_; _a valid token for a deleted user returns 401_ | Script: _without a cookie → 401_, _forged cookie → 401_ · UI: step 9 |
| No account enumeration on login        | `auth.test.js`: _wrong password and unknown email get the same 401_                                                                                   | Script: _identical responses_                                        |
| Duplicate email → 409, bad input → 400 | `auth.test.js`: _rejects a duplicate email regardless of case or spaces (409)_; _rejects a short password with a field error (400)_                   | UI: step 1 (register with a seeded email)                            |
| Token protected in the browser         | `auth.test.js`: _sets an httpOnly cookie_                                                                                                             | Script: _HttpOnly_, _Secure over HTTPS_                              |

</details>

<details>
<summary><strong>2. Tenant isolation: the attack scenario (brief §5)</strong></summary>

> User A belongs to Organization A and requests `GET /api/projects/<project-id-from-Organization-B>`. Organization B's data must not be exposed.

Here User A is **alice** (Acme only) and Organization B is **Beta Labs**. Every request below must return **404**, with the same body as an ID that doesn't exist, and change nothing.

| Tampered input                  | Request                                                                              | Automated test (`isolation.test.js` unless noted)                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project ID in the URL           | `GET /api/projects/:betaProjectId`                                                   | _GET /api/projects/:idFromOrgB → 404 with no project data, identical to a missing id_                                                                          |
| Project ID, write               | `PATCH`, `DELETE /api/projects/:betaProjectId`                                       | _PATCH and DELETE /api/projects/:idFromOrgB → 404 and the project is unchanged_                                                                                |
| Organization ID in the URL      | `GET /api/organizations/:betaId`, `/members`, `/projects`, `/stats`                  | `organizations.test.js`: _a non-member gets 404 for another org, identical to a missing org_ · _GET /api/organizations/:orgB/projects → 404_ · `stats.test.js` |
| Organization ID, write          | `POST /api/organizations/:betaId/projects`                                           | _POST /api/organizations/:orgB/projects → 404 and nothing is created_                                                                                          |
| Task ID in the URL              | `PATCH`, `DELETE /api/tasks/:betaTaskId`                                             | _PATCH /api/tasks/:idFromOrgB with a new title → 404, task unchanged_ · _DELETE /api/tasks/:idFromOrgB → 404, task still exists_                               |
| Project ID for task collections | `GET`, `POST /api/projects/:betaProjectId/tasks`                                     | _GET and POST /api/projects/:idFromOrgB/tasks → 404, nothing created_                                                                                          |
| Organization ID in the body     | `POST /api/organizations/:acmeId/projects {"organization": betaId}`                  | _…with organization: orgB in the body → 201 under Org A_ · `tasks.test.js`: _create applies defaults and ignores tenant fields in the body_                    |
| Move a resource by body         | `PATCH /api/projects/:id {"organization": …}`, `PATCH /api/tasks/:id {"project": …}` | _PATCH cannot move a project to another org_ · `tasks.test.js`: _PATCH cannot move a task to another project or org, or change its creator_                    |
| Assignee from another org       | `PATCH /api/tasks/:acmeTaskId {"assignee": bobId}`                                   | _PATCH /api/tasks/:idInOrgA with assignee: userOnlyInOrgB → 400_ · `tasks.test.js`: _an assignee outside the org is rejected on create (400)_                  |
| Query parameters                | `GET /api/projects/:acmeProjectId/tasks?organization=betaId&project=…`               | Script only: the list stays scoped to the URL's project, whose org came from the database                                                                      |
| Operators in the body           | `{"title": {"$ne": ""}}`                                                             | `app.test.js`: _Mongo operator keys in the body are rejected_                                                                                                  |
| Malformed IDs                   | `/api/projects/not-an-id`                                                            | _a malformed project id → 404, not 500_ (and the task and org equivalents)                                                                                     |
| Activity feeds                  | `GET /api/tasks/:betaTaskId/activity`                                                | `activity.test.js`: _feed and task history deny foreign tenant access_                                                                                         |

</details>

<details>
<summary><strong>3. Authorization and roles (brief §4.3, §5)</strong></summary>

| Requirement                           | Automated test                                                                                                                                           | Check yourself                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| MEMBER can't delete a project → 403   | `projects.test.js`: _a MEMBER cannot delete a project in their own org (403)_                                                                            | Script · UI: step 6                                 |
| Only admin or creator edits a project | `projects.test.js`: _a member edits their own project but not an admin-created one; admins edit any_                                                     | UI: step 6                                          |
| Only admin or creator deletes a task  | `tasks.test.js`: _delete: admin any, creator own, other members 403_                                                                                     | Script: _deletes a task someone else created → 403_ |
| Only admins rename the org            | `organizations.test.js`: _only admins can rename, and the slug stays stable_                                                                             | Script: _alice renames Acme → 403_                  |
| Only admins manage members            | `members.test.js`: _members cannot add, change roles or remove (403)_                                                                                    | Script · UI: step 7                                 |
| An org always keeps an admin          | `members.test.js`: _the last admin can be neither demoted nor removed (409)_ · `concurrency.test.js`: _concurrent demotions and removal retain an admin_ | UI: step 8                                          |
| Role changes apply immediately        | `members.test.js`: _removing a member unassigns their open tasks, keeps done ones, and revokes access_                                                   | UI: step 8                                          |

</details>

<details>
<summary><strong>4. Organization membership and switching (brief §4.2, §4.4)</strong></summary>

| Requirement                                | Automated test                                                                                                          | Check yourself                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Users see only their orgs, with their role | `organizations.test.js`: _the list only contains orgs I belong to, with my role in each_                                | Script: Organizations · UI: step 2 |
| A user can belong to several orgs          | `seed.test.js`: _seed is idempotent and demonstrates isolation for alice_ (demo is in both orgs)                        | UI: step 2                         |
| Creator becomes ADMIN                      | `organizations.test.js`: _the creator becomes ADMIN and sees the org in their list_                                     | UI: step 10                        |
| One membership per user per org            | `models.test.js`: _a user can only have one membership per organization_ · `members.test.js`: _…existing member is 409_ | —                                  |
| Switching updates projects, tasks, members | `stats.test.js`: _stats cover only the active org and list my open tasks_                                               | UI: steps 2–4                      |
| Backend validates membership on switch     | Every row in section 2                                                                                                  | UI: step 5                         |

</details>

<details>
<summary><strong>5. Project and task access (brief §4.5, §4.6)</strong></summary>

| Requirement                                  | Automated test                                                                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project CRUD with server-set org and creator | `projects.test.js`: _create sets tenant fields on the server…_; _a partial PATCH keeps omitted fields…_; _an admin delete removes the project and only its tasks_ |
| Project validation                           | `projects.test.js`: _validation: name required and at most 100 chars; description at most 1,000_                                                                  |
| Task CRUD, status, priority, assignee        | `tasks.test.js`: _status and priority changes persist; the assignee can be cleared_; _assigning to an org member returns the populated assignee_                  |
| Task validation                              | `tasks.test.js`: _invalid values and empty updates are rejected (400)_ · `models.test.js`: _task defaults and enums_                                              |
| Deleting a project can't leave orphan tasks  | `concurrency.test.js`: _a create request holding a deleted project cannot insert an orphan task_; _failed project deletion rolls back its task deletion_          |

</details>

<details>
<summary><strong>6. Error handling and status codes (brief §8)</strong></summary>

| Code | Covered by                                                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `errorHandler.test.js`: _ZodError becomes 400 with field details_ · `app.test.js`: _malformed JSON returns 400_                    |
| 401  | `auth.test.js` session tests · both _requests without a cookie → 401_ tests in `isolation.test.js`                                 |
| 403  | Section 3 above                                                                                                                    |
| 404  | Section 2 above · `app.test.js`: _unknown API routes return a JSON 404_ · `errorHandler.test.js`: _CastError becomes 404, not 500_ |
| 409  | `errorHandler.test.js`: _duplicate key becomes 409 naming the field_ · duplicate email, duplicate member, last admin               |
| 500  | `errorHandler.test.js`: _unexpected errors become 500 without a stack trace_                                                       |

Also covered: security headers (`app.test.js`: _helmet security headers are set_), and fail-fast config (`env.test.js`: _fails fast listing every missing variable_, _rejects a short JWT secret_).

</details>

---

## How to run the tests yourself

### Option 1: the automated suite (local, no database needed)

Prerequisite: Node ≥ 22.9.

```bash
git clone https://github.com/SadhuG/fixl-assignment.git taskhive && cd taskhive
npm run setup      # installs root, server and client dependencies
npm test           # server (Jest) then client (node:test)
```

Expected: `Test Suites: 15 passed, 15 total`, `Tests: 103 passed, 103 total`, then 7 client tests passing. The server tests start an in-memory MongoDB replica set, so no `.env` or database is needed. The first run downloads a `mongod` binary (about 800 MB, cached in `~/.cache/mongodb-binaries`).

To run one area:

```bash
npm --prefix server test -- isolation      # the attack table (section 2)
npm --prefix server test -- auth members projects tasks organizations
```

### Option 2: run the attack script against the live API

[`verify-api.mjs`](verify-api.mjs) logs in as the three demo users and runs the 42 checks marked "Script" above against a real deployment. Every check is something the server must refuse, so a passing run changes no data. It needs only Node ≥ 22 (it uses the built-in `fetch`), with no install.

```bash
node submission/verify-api.mjs https://client-rho-ten-81.vercel.app
```

Expected last line: `42 passed, 0 failed` (exit code 0). Any failure prints the status and body it got.

To run it locally instead, start a seeded stack (README, "Run it locally") and run `node submission/verify-api.mjs` (it defaults to `http://localhost:4000`).

The script makes six login attempts per run. Login is rate-limited to 20 attempts per 15 minutes per IP, so wait a few minutes after three runs in a row.

### Option 3: check it in the browser

Open the deployed app. Use a private window, or log out between users.

1. **Register and log in.** Register with `demo@taskhive.dev`: you get "An account with this email already exists" (409). Log in as `demo@taskhive.dev` / `TaskHive#2026`.
2. **Switch organizations.** The switcher shows Acme Inc. (Admin) and Beta Labs (Member). Switch to Beta Labs: the dashboard, Projects and Members change to Beta Labs, and the URL changes to `/o/beta-labs`.
3. **Projects and tasks.** In Beta Labs → Mobile Application, create a task, change its status and priority, and assign it to Bob Okafor. The assignee list only offers Beta Labs members. Delete the task you created.
4. **Board view.** Switch the project to Board and move a task by changing its status.
5. **The attack scenario, from the UI.** Still in Beta Labs → Mobile Application, copy the page URL. Log out, log in as `alice@taskhive.dev`, and paste it. You get "Project not found": the API answered 404, and nothing from Beta Labs is shown. Alice's switcher only lists Acme Inc., and opening `/o/beta-labs` directly shows "Organization not found".
6. **Member limits.** As alice (Member in Acme), open Acme → Website Redesign. There is no Edit project or Delete project action, because demo created it and alice isn't an admin. Create your own project: it has Edit project but no Delete (log in as demo afterwards to delete it).
7. **Admin-only members page.** As alice, open Members: you can see the list, but there are no role controls or Add member button. Log in as demo (Admin in Acme): both are there.
8. **Last admin and live roles.** As demo in Acme → Members, change your own role to Member: it's refused with "An organization needs at least one admin. Make someone else an admin first." (409). Now promote alice to Admin. In a second window, log in as alice and open Acme → Members: she has the role controls. Back as demo, demote alice to Member. In alice's still-open window, change a role: the server answers 403 ("Only organization admins can do this") because it reads roles live, and her badge drops back to Member. She never had to log in again.
9. **Logout protects the app.** Log out, then open `/o/acme-inc` directly: you're sent to the login page.
10. **Create an organization.** Create a new org from the switcher: you become its Admin, and it's empty. None of Acme's or Beta Labs' data appears.
