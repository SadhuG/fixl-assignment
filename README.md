# TaskHive

A multi-tenant project and task tracker (MERN). Many organizations share one deployment, and **no user can read or change another organization's data**. The server enforces this on every request, independent of the UI.

- **Live app:** _Not deployed yet_ (the intended setup is under [Deployment](#deployment))
- **API health:** _Not deployed yet_ (`GET /api/health` locally: `http://localhost:4000/api/health`)
- **Demo login:** `demo@taskhive.dev` / `TaskHive#2026` (Admin in **Acme Inc.**, Member in **Beta Labs**), after running the seed script
- Also seeded: `alice@taskhive.dev` (Acme member only) and `bob@taskhive.dev` (Beta Labs admin only), with the same password.
- **Features:** organizations and members with roles, projects, tasks with status, priority and assignee, task search and filters, and a List/Board view of a project's tasks (`?view=board`).
- **Verification:** the local accessibility, responsive and failure-mode pass is in [VERIFICATION.md](VERIFICATION.md).

**Try the isolation yourself:** log in as demo, open Beta Labs → Mobile Application and copy the URL. Log out, log in as alice, and paste it. You get "Project not found", because the API answered 404.

## Tech stack

| Layer    | Choice                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | React 19, Vite 8, **TypeScript** (strict), React Router 8, TanStack Query 5, React Hook Form + Zod 4, Tailwind CSS 4, shadcn/ui (Radix), axios |
| Backend  | Node ≥ 22.9, Express 5, Mongoose 9, Zod 4, JWT in an httpOnly cookie, bcryptjs, helmet, express-rate-limit (JavaScript, CommonJS)              |
| Database | MongoDB (Atlas M0 in the intended deployment)                                                                                                  |
| Tests    | Jest, Supertest, mongodb-memory-server                                                                                                         |
| Hosting  | Not deployed yet. Intended: Vercel (SPA + `/api` rewrite) → Render (API) → Atlas                                                               |

## Run it locally

Prerequisites: Node ≥ 22.9 and a MongoDB (Atlas, or `docker run -d -p 27017:27017 mongo:7`).

```bash
git clone <REPO_URL> taskhive && cd taskhive   # replace <REPO_URL> with this repository's clone URL

npm run setup                  # installs root, server and client dependencies
cp server/.env.example server/.env   # set MONGODB_URI and a JWT_SECRET of at least 32 characters
npm --prefix server run seed   # demo users, orgs, projects, tasks (safe to re-run)
npm run dev                    # API on http://localhost:4000, web on http://localhost:5173 (proxies /api)
```

Scripts, from the repo root:

| Command                                   | What it does                                     |
| ----------------------------------------- | ------------------------------------------------ |
| `npm run dev`                             | API and web together                             |
| `npm test`                                | Server test suite (runs in band)                 |
| `npm run lint`                            | ESLint (server) and oxlint (client)              |
| `npm run build`                           | Client typecheck (`tsc -b`) and production build |
| `npm run typecheck`                       | Client typecheck only                            |
| `npm run format` / `npm run format:check` | Prettier                                         |
| `npm --prefix server run seed`            | Seed the demo data                               |

Run the tests with `npm test`. They need no database of your own: an in-memory MongoDB starts automatically, and the first run downloads its `mongod` binary (cached in `~/.cache/mongodb-binaries`).

## Environment variables

**server/.env** (see `server/.env.example`)

| Variable        | Required | Example / default            | Purpose                                                            |
| --------------- | -------- | ---------------------------- | ------------------------------------------------------------------ |
| `MONGODB_URI`   | yes      | `mongodb+srv://…/taskhive`   | Database connection                                                |
| `JWT_SECRET`    | yes      | 64 random hex chars (min 32) | Signs session tokens                                               |
| `CLIENT_ORIGIN` | yes      | `http://localhost:5173`      | CORS allow-list (comma-separated)                                  |
| `NODE_ENV`      | no       | `production`                 | Enables the `Secure` cookie flag and hides error details           |
| `PORT`          | no       | `4000`                       | HTTP port                                                          |
| `BCRYPT_COST`   | no       | `12`                         | Password hashing cost                                              |
| `TRUST_PROXY`   | no       | `1` (prod: `2`)              | Proxy hops before Express, for correct client IPs in rate limiting |
| `SEED_PASSWORD` | no       | `TaskHive#2026`              | Password for seeded demo users                                     |

**client/.env** (see `client/.env.example`): `VITE_API_URL` stays **empty**. The app calls `/api` on its own origin (Vite proxy in dev, Vercel rewrite in prod).

The server exits at startup if a required variable is missing.

## MongoDB configuration

- One database, `taskhive`, with five collections: `users`, `organizations`, `memberships`, `projects` and `tasks`.
- For Atlas, use a database user with **readWrite on `taskhive` only**. Network access is `0.0.0.0/0` because Render's free tier has no static egress IPs; the credential is long and random.
- Indexes are declared in the Mongoose schemas and built on startup (see [Data model](#data-model)).

## API

REST over JSON under `/api`. Collections are nested under their parent, and single resources are addressed flat by ID. Every route except register, login, logout and health requires the session cookie.

| Method | Path                                      | Who                         | Purpose                                                     |
| ------ | ----------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| GET    | /api/health                               | public                      | Liveness check                                              |
| POST   | /api/auth/register                        | public (rate-limited)       | Create account, start session                               |
| POST   | /api/auth/login                           | public (rate-limited)       | Start session                                               |
| POST   | /api/auth/logout                          | anyone                      | Clear session cookie                                        |
| GET    | /api/auth/me                              | signed in                   | Current user                                                |
| GET    | /api/organizations                        | signed in                   | My orgs, with my role in each                               |
| POST   | /api/organizations                        | signed in                   | Create org (creator becomes ADMIN)                          |
| GET    | /api/organizations/:orgId                 | member                      | Org details                                                 |
| PATCH  | /api/organizations/:orgId                 | ADMIN                       | Rename                                                      |
| GET    | /api/organizations/:orgId/stats           | member                      | Dashboard counts, my open tasks, recent projects            |
| GET    | /api/organizations/:orgId/members         | member                      | Members with roles                                          |
| POST   | /api/organizations/:orgId/members         | ADMIN                       | Add an existing user by email                               |
| PATCH  | /api/organizations/:orgId/members/:userId | ADMIN                       | Change role                                                 |
| DELETE | /api/organizations/:orgId/members/:userId | ADMIN                       | Remove member (unassigns their open tasks)                  |
| GET    | /api/organizations/:orgId/projects        | member                      | List projects (newest first, with task counts)              |
| POST   | /api/organizations/:orgId/projects        | member                      | Create project                                              |
| GET    | /api/projects/:projectId                  | member of the project's org | Project details                                             |
| PATCH  | /api/projects/:projectId                  | ADMIN or creator            | Update name/description                                     |
| DELETE | /api/projects/:projectId                  | ADMIN                       | Delete project and its tasks                                |
| GET    | /api/projects/:projectId/tasks            | member                      | List tasks: `?status=&priority=&assignee=<id\|me\|none>&q=` |
| POST   | /api/projects/:projectId/tasks            | member                      | Create task                                                 |
| PATCH  | /api/tasks/:taskId                        | member                      | Update title, description, status, priority, assignee       |
| DELETE | /api/tasks/:taskId                        | ADMIN or creator            | Delete task                                                 |

Success returns the resource, or `{ "data": [...] }` for lists. Errors always look like:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid",
    "details": [{ "field": "name", "message": "Name is required" }]
  }
}
```

Status codes: 400 invalid input · 401 not signed in · 403 member lacking the role · 404 missing **or another tenant's** · 409 conflict (duplicate email/member, last admin) · 413 body too large · 429 too many auth attempts (20 per 15 minutes per IP) · 500 unexpected.

## Architecture

```
Browser ── https://<app>.vercel.app ──┬── static SPA (React)
                                      └── /api/* rewrite ──► Render: Express API ──► MongoDB Atlas
```

(That is the intended deployment. Locally, Vite proxies `/api` to Express on :4000.)

**Server** (`server/src`): `routes` → `middleware` (authenticate, tenant loaders, role guards, validation) → thin `controllers` → `services` for business rules (last-admin guard, cascade delete, slug generation, stats). `app.js` builds the app without listening, so tests drive it in memory. A central `errorHandler` maps Zod, Mongoose CastError/ValidationError, duplicate keys and `AppError` to the error shape above and hides internals in production.

**Client** (`client/src`, TypeScript): `api/` (axios with credentials, one module per resource, errors normalised to `ApiError`) · `context/` (AuthContext: session status and user; OrgContext: active org resolved from `/o/:orgSlug`) · `hooks/` (TanStack Query per resource) · `features/` (screens) · `components/` (shared UI, with shadcn/ui primitives in `components/ui`). All server data lives in TanStack Query, keyed by org id; the contexts only hold the session and the active org.

## How tenant isolation works

Every org-scoped request finds its organization **on the server, from the database**, and checks the caller's membership **before any controller runs**. The UI's state, route params, headers and body fields are never trusted to identify the tenant.

```
authenticate            cookie JWT → req.user                                   401 if missing/invalid
  → loadOrg             /organizations/:orgId → Membership{user, org}?          404 if not a member
  | loadProject         /projects/:id → project.organization → Membership?      404 if missing or not a member
  | loadTask            /tasks/:id    → task.organization    → Membership?      404 if missing or not a member
  → requireRole / requireAdminOrCreator                                         403 if the role is insufficient
  → validate → controller   every query filters by the loaded org/project
```

Rules:

1. **404, not 403, for other tenants.** A foreign ID and a non-existent ID return byte-identical 404 bodies, so an outsider can't tell whether something exists. A _member_ lacking a role gets 403.
2. **Tenant fields are server-set.** `organization`, `project` and `createdBy` come from `req.*`. Zod strips unknown body keys, so `{"organization": "<other org>"}` is ignored on create and update.
3. **Tasks store their `organization`** (copied from the project at creation). That gives one indexed filter per query and a second line of defence.
4. **Assignees must be members** of the task's org (400 otherwise). The UI only offers members, but the server checks anyway.
5. **Malformed IDs return 404**, never a 500.
6. **Authorization is read live** from `Membership` on every request, so removing someone or changing their role takes effect immediately, even with a valid JWT.

The tests prove it: `server/tests/isolation.test.js` covers cross-org GET/PATCH/DELETE of projects and tasks, listing or creating in another org, smuggling `organization` in a body, assigning an outsider, malformed IDs and no cookie. `server/tests/projects.test.js` covers MEMBER → DELETE project = 403.

## Data model

| Collection    | Key fields                                                                       | Indexes (and the query each serves)                                                                                                    |
| ------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| users         | name, email (lowercased), passwordHash (`select: false`)                         | `email` unique: login, add-member lookup                                                                                               |
| organizations | name, slug, createdBy                                                            | `slug` unique: URLs                                                                                                                    |
| memberships   | user, organization, role                                                         | `{user, organization}` unique: the membership check on every request, no duplicates · `{organization, role}`: member list, admin count |
| projects      | name, description, organization, createdBy                                       | `{organization, createdAt: -1}`: project list, newest first                                                                            |
| tasks         | title, description, status, priority, project, organization, assignee, createdBy | `{project, status}`: task list and board · `{organization, assignee}`: "assigned to me", unassign on removal                           |

Membership is its own collection (not an array on User or Organization), so "is X in Y, and with what role?" is one indexed lookup and no document grows without bound.

## Deployment

Not deployed yet. The intended setup is Vercel for the SPA, with a rewrite that proxies `/api/*` to a Render web service running the Express API, which talks to MongoDB Atlas (M0). Set `NODE_ENV=production`, `TRUST_PROXY=2` (Vercel → Render), and `CLIENT_ORIGIN` to the Vercel origin on the API. Leave `VITE_API_URL` empty on the client. After deploying, run the seed once against Atlas and repeat the deployment-only checks in [VERIFICATION.md](VERIFICATION.md). On Render's free tier the API sleeps when idle, so the first request after a pause can take about 30 seconds.

## Trade-offs and decisions

- **Cookie, not localStorage.** The JWT sits in an `httpOnly; SameSite=Lax` cookie (`Secure` in production), so XSS can't read it. The planned Vercel `/api` rewrite makes the API same-origin, which avoids third-party-cookie blocking (Safari) and makes CORS a fallback only.
- **Stateless JWT with a live membership check.** There's no server-side session store. Logout clears the cookie; a stolen token stays valid until it expires (7 days), but it can never exceed the victim's _current_ memberships.
- **Add members by existing email** instead of email invites. This keeps scope tight, at the cost of revealing whether an email has an account (to admins only).
- **Cascade delete without a transaction.** Tasks are deleted before their project, so a partial failure leaves an empty project, never orphaned tasks. Transactions need a replica set, which local and test databases don't have.
- **Last-admin rule under concurrency.** It's checked before and re-counted after each demotion or removal, and undone if the org would be left without an admin. A concurrent test pins this.
- **Slugs are unique across all orgs** (`acme`, `acme-2`, …). This reveals that an org _name_ exists but nothing inside it, and slugs stay stable when an org is renamed.
- **Express 5 without `express-mongo-sanitize`**, which is incompatible with Express 5. Zod type-checks every field, Express 5's query parser doesn't build objects, and a small middleware rejects `$`/`.` keys in bodies.
- **Board "move" uses a status select, not drag-and-drop.** It's keyboard- and screen-reader-accessible by default.
- **No frontend unit tests.** Test time went to the security-critical server paths. The UI was verified by hand, and the results are in [VERIFICATION.md](VERIFICATION.md).
- **Server in JavaScript, client in TypeScript.** A deliberate split: the server stays CommonJS JavaScript, and only the client is typed.

## Known limitations and future improvements

- **Deployment-only checks are pending:** the Vercel rewrite, the `Secure` cookie over HTTPS, the Render cold-start and suspend behaviour, and a Safari/VoiceOver pass. See [VERIFICATION.md](VERIFICATION.md).
- **The List/Board toggle is 36 px tall on mobile** (360 px wide), under the 40 px target. It passes WCAG 2.5.8 (24 px).
- **The task title buttons are about 22 px tall.** They span the full row width, and each row's 40 × 40 Actions menu also has Open.
- No email invites, password reset, or email verification.
- No pagination. Lists are fine for small teams; add cursor pagination on `{organization, createdAt}` next.
- No real-time updates; other users' changes appear on refetch (focus/navigation).
- No refresh-token rotation or server-side session revocation.
- Render free tier cold starts (~30 s) once deployed.
- Possible additions: activity log, due dates, per-project permissions, OpenAPI docs, Playwright end-to-end tests.
