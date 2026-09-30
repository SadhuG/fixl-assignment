// Content for /submission-notes. Mirrors submission/submission.md; keep the two in sync.
// Table cells use two inline marks: `code` and _test name_ (rendered by <Inline />).

export const LIVE_URL = 'https://client-rho-ten-81.vercel.app';
export const REPO_URL = 'https://github.com/SadhuG/fixl-assignment';
export const DEMO_EMAIL = 'demo@taskhive.dev';
export const DEMO_PASSWORD = 'TaskHive#2026';

export const performanceRoutes = [
  {
    route: 'Landing',
    mobile: { performance: 95, accessibility: 95, lcp: '2.35 s' },
    desktop: { performance: 100, accessibility: 95, lcp: '0.51 s' },
  },
  {
    route: 'Log in',
    mobile: { performance: 93, accessibility: 100, lcp: '2.57 s' },
    desktop: { performance: 100, accessibility: 100, lcp: '0.53 s' },
  },
  {
    route: 'Dashboard',
    mobile: { performance: 95, accessibility: 100, lcp: '2.43 s' },
    desktop: { performance: 99, accessibility: 100, lcp: '0.55 s' },
  },
  {
    route: 'Projects',
    mobile: { performance: 94, accessibility: 100, lcp: '2.50 s' },
    desktop: { performance: 100, accessibility: 100, lcp: '0.52 s' },
  },
  {
    route: 'Project detail',
    mobile: { performance: 93, accessibility: 100, lcp: '2.61 s' },
    desktop: { performance: 99, accessibility: 100, lcp: '0.79 s' },
  },
  {
    route: 'Members',
    mobile: { performance: 94, accessibility: 100, lcp: '2.44 s' },
    desktop: { performance: 100, accessibility: 100, lcp: '0.51 s' },
  },
] as const;

/** p50 of 30 sequential reads per endpoint, through the Vercel rewrite and direct to Render. */
export const apiLatency = [
  { endpoint: 'Health check', vercel: 308, render: 293 },
  { endpoint: 'Current user', vercel: 534, render: 515 },
  { endpoint: 'My organizations', vercel: 994, render: 982 },
  { endpoint: 'Dashboard stats', vercel: 1484, render: 1458 },
  { endpoint: 'Project list', vercel: 1475, render: 1450 },
  { endpoint: 'Task list', vercel: 1713, render: 1694 },
  { endpoint: 'Members', vercel: 1477, render: 1456 },
] as const;

export type OrgRole = 'Admin' | 'Member' | null;

export const people: { name: string; email: string; acme: OrgRole; beta: OrgRole }[] = [
  { name: 'Dana Demo', email: 'demo@taskhive.dev', acme: 'Admin', beta: 'Member' },
  { name: 'Alice Chen', email: 'alice@taskhive.dev', acme: 'Member', beta: null },
  { name: 'Bob Okafor', email: 'bob@taskhive.dev', acme: null, beta: 'Admin' },
];

export const decisions: [string, string][] = [
  [
    '404 for other tenants',
    'A project from another org returns exactly the same response as one that doesn’t exist. A member who lacks the role gets 403, because they already know it exists.',
  ],
  [
    'Tenant fields are server-set',
    'organization, project and createdBy always come from the loaded records. Zod strips unknown body keys, so a smuggled organization is ignored.',
  ],
  [
    'Roles are read live',
    'Membership is looked up on every request instead of trusting the token, so removing someone or changing their role applies on their next click.',
  ],
  [
    'Membership is its own collection',
    '“Is this user in this org, and as what?” is one indexed lookup, and no document grows without limit.',
  ],
  [
    'Transactions where races bite',
    'An org always keeps an admin, and deleting a project can’t leave orphan tasks, even under concurrent requests.',
  ],
  [
    'Server cache keyed by org',
    'The client keys every org-scoped query by org id, so switching orgs never shows the previous org’s rows.',
  ],
];

export const tradeOffs: [string, string][] = [
  [
    'Stateless JWT, no session store',
    'Logout clears the cookie, but a stolen token lasts until it expires in 7 days. It can never reach past the victim’s current memberships, because those are checked live.',
  ],
  [
    'Add members by existing email',
    'No invite emails keeps scope tight. The cost: an admin can tell whether an email already has an account.',
  ],
  [
    'Org slugs are unique across all orgs',
    'acme, then acme-2. This reveals that an org name is taken, but nothing inside it.',
  ],
  [
    'No express-mongo-sanitize',
    'It doesn’t support Express 5. Zod type-checks every field and a small middleware rejects $ and . keys instead.',
  ],
  [
    'Board moves by status select',
    'No drag-and-drop, so the board works with a keyboard and a screen reader out of the box.',
  ],
];

export type TestArea = {
  title: string;
  brief: string;
  countLabel: string;
  quote?: string;
  intro?: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export const testAreas: TestArea[] = [
  {
    title: 'Authentication',
    brief: 'Brief 4.1, 8',
    countLabel: '6 checks',
    columns: ['Requirement', 'Automated test', 'Check yourself'],
    rows: [
      [
        'Register, log in, log out',
        '`auth.test.js`: _creates the user, sets an httpOnly cookie and never returns the hash_; _me returns the current user and logout ends the session_',
        'Script: Authentication, Logout. Browser: steps 1 and 9',
      ],
      [
        'Passwords never stored in plain text',
        '`auth.test.js`: _stores a bcrypt hash, never the plain password_. `models.test.js`: _passwordHash is never selected or serialised by default_',
        'Script: _login responses never include a password hash_',
      ],
      [
        'Protected areas need a session',
        '`auth.test.js`: _GET /api/auth/me without a cookie returns 401_; _…with a garbage cookie returns 401_; _a valid token for a deleted user returns 401_',
        'Script: _without a cookie → 401_, _forged cookie → 401_. Browser: step 9',
      ],
      [
        'No account enumeration on login',
        '`auth.test.js`: _wrong password and unknown email get the same 401_',
        'Script: _identical responses_',
      ],
      [
        'Duplicate email → 409, bad input → 400',
        '`auth.test.js`: _rejects a duplicate email regardless of case or spaces (409)_; _rejects a short password with a field error (400)_',
        'Browser: step 1',
      ],
      [
        'Token protected in the browser',
        '`auth.test.js`: _sets an httpOnly cookie_',
        'Script: _HttpOnly_, _Secure over HTTPS_',
      ],
    ],
  },
  {
    title: 'Tenant isolation: the attack scenario',
    brief: 'Brief 5',
    countLabel: '13 checks',
    quote:
      'From the brief: User A belongs to Organization A and requests GET /api/projects/<project-id-from-Organization-B>. Organization B’s data must not be exposed.',
    intro:
      'Here User A is alice (Acme only) and Organization B is Beta Labs. Every request must return 404, with the same body as an ID that doesn’t exist, and change nothing.',
    columns: ['Tampered input', 'Request', 'Automated test (isolation.test.js unless noted)'],
    rows: [
      [
        'Project ID in the URL',
        '`GET /api/projects/:betaProjectId`',
        '_GET /api/projects/:idFromOrgB → 404 with no project data, identical to a missing id_',
      ],
      [
        'Project ID, write',
        '`PATCH, DELETE /api/projects/:betaProjectId`',
        '_PATCH and DELETE /api/projects/:idFromOrgB → 404 and the project is unchanged_',
      ],
      [
        'Organization ID in the URL',
        '`GET /api/organizations/:betaId` and its `/members`, `/projects`, `/stats`',
        '`organizations.test.js`: _a non-member gets 404 for another org, identical to a missing org_. `stats.test.js`',
      ],
      [
        'Organization ID, write',
        '`POST /api/organizations/:betaId/projects`',
        '_POST /api/organizations/:orgB/projects → 404 and nothing is created_',
      ],
      [
        'Task ID in the URL',
        '`PATCH, DELETE /api/tasks/:betaTaskId`',
        '_PATCH /api/tasks/:idFromOrgB with a new title → 404, task unchanged_; _DELETE … → 404, task still exists_',
      ],
      [
        'Project ID for task collections',
        '`GET, POST /api/projects/:betaProjectId/tasks`',
        '_GET and POST /api/projects/:idFromOrgB/tasks → 404, nothing created_',
      ],
      [
        'Organization ID in the body',
        '`POST /api/organizations/:acmeId/projects {"organization": betaId}`',
        '_…with organization: orgB in the body → 201 under Org A_. `tasks.test.js`: _create ignores tenant fields in the body_',
      ],
      [
        'Move a resource by body',
        '`PATCH /api/projects/:id {"organization": …}`',
        '_PATCH cannot move a project to another org_. `tasks.test.js`: _PATCH cannot move a task to another project or org_',
      ],
      [
        'Assignee from another org',
        '`PATCH /api/tasks/:acmeTaskId {"assignee": bobId}`',
        '_PATCH /api/tasks/:idInOrgA with assignee: userOnlyInOrgB → 400_',
      ],
      [
        'Query parameters',
        '`GET /api/projects/:acmeProjectId/tasks?organization=betaId`',
        'Script only: the list stays scoped to the URL’s project, whose org came from the database',
      ],
      [
        'Operators in the body',
        '`{"title": {"$ne": ""}}`',
        '`app.test.js`: _Mongo operator keys in the body are rejected_',
      ],
      [
        'Malformed IDs',
        '`GET /api/projects/not-an-id`',
        '_a malformed project id → 404, not 500_, and the task and org versions',
      ],
      [
        'Activity feeds',
        '`GET /api/tasks/:betaTaskId/activity`',
        '`activity.test.js`: _feed and task history deny foreign tenant access_',
      ],
    ],
  },
  {
    title: 'Authorization and roles',
    brief: 'Brief 4.3, 5',
    countLabel: '7 checks',
    columns: ['Requirement', 'Automated test', 'Check yourself'],
    rows: [
      [
        'A member can’t delete a project → 403',
        '`projects.test.js`: _a MEMBER cannot delete a project in their own org (403)_',
        'Script. Browser: step 6',
      ],
      [
        'Only an admin or the creator edits a project',
        '`projects.test.js`: _a member edits their own project but not an admin-created one; admins edit any_',
        'Browser: step 6',
      ],
      [
        'Only an admin or the creator deletes a task',
        '`tasks.test.js`: _delete: admin any, creator own, other members 403_',
        'Script: _deletes a task someone else created → 403_',
      ],
      [
        'Only admins rename the org',
        '`organizations.test.js`: _only admins can rename, and the slug stays stable_',
        'Script: _alice renames Acme → 403_',
      ],
      [
        'Only admins manage members',
        '`members.test.js`: _members cannot add, change roles or remove (403)_',
        'Script. Browser: step 7',
      ],
      [
        'An org always keeps an admin',
        '`members.test.js`: _the last admin can be neither demoted nor removed (409)_. `concurrency.test.js`: _concurrent demotions and removal retain an admin_',
        'Browser: step 8',
      ],
      [
        'Role changes apply immediately',
        '`members.test.js`: _removing a member unassigns their open tasks, keeps done ones, and revokes access_',
        'Browser: step 8',
      ],
    ],
  },
  {
    title: 'Organization membership and switching',
    brief: 'Brief 4.2, 4.4',
    countLabel: '6 checks',
    columns: ['Requirement', 'Automated test', 'Check yourself'],
    rows: [
      [
        'Users see only their orgs, with their role',
        '`organizations.test.js`: _the list only contains orgs I belong to, with my role in each_',
        'Script: Organizations. Browser: step 2',
      ],
      [
        'A user can belong to several orgs',
        '`seed.test.js`: _seed is idempotent and demonstrates isolation for alice_',
        'Browser: step 2',
      ],
      [
        'The creator becomes admin',
        '`organizations.test.js`: _the creator becomes ADMIN and sees the org in their list_',
        'Browser: step 10',
      ],
      [
        'One membership per user per org',
        '`models.test.js`: _a user can only have one membership per organization_. `members.test.js`: _…existing member is 409_',
        'Automated only',
      ],
      [
        'Switching updates projects, tasks and members',
        '`stats.test.js`: _stats cover only the active org and list my open tasks_',
        'Browser: steps 2 to 4',
      ],
      ['The backend validates membership on switch', 'Every row in the tenant isolation table', 'Browser: step 5'],
    ],
  },
  {
    title: 'Project and task access',
    brief: 'Brief 4.5, 4.6',
    countLabel: '5 checks',
    columns: ['Requirement', 'Automated test'],
    rows: [
      [
        'Project CRUD with server-set org and creator',
        '`projects.test.js`: _create sets tenant fields on the server_; _a partial PATCH keeps omitted fields_; _an admin delete removes the project and only its tasks_',
      ],
      [
        'Project validation',
        '`projects.test.js`: _validation: name required and at most 100 chars; description at most 1,000_',
      ],
      [
        'Task CRUD, status, priority and assignee',
        '`tasks.test.js`: _status and priority changes persist; the assignee can be cleared_; _assigning to an org member returns the populated assignee_',
      ],
      [
        'Task validation',
        '`tasks.test.js`: _invalid values and empty updates are rejected (400)_. `models.test.js`: _task defaults and enums_',
      ],
      [
        'Deleting a project can’t leave orphan tasks',
        '`concurrency.test.js`: _a create request holding a deleted project cannot insert an orphan task_; _failed project deletion rolls back its task deletion_',
      ],
    ],
  },
  {
    title: 'Error handling and status codes',
    brief: 'Brief 8',
    countLabel: '6 codes',
    columns: ['Code', 'Covered by'],
    rows: [
      [
        '400',
        '`errorHandler.test.js`: _ZodError becomes 400 with field details_. `app.test.js`: _malformed JSON returns 400_',
      ],
      ['401', '`auth.test.js` session tests, and both _requests without a cookie → 401_ tests in `isolation.test.js`'],
      ['403', 'Every 403 row in Authorization and roles'],
      [
        '404',
        'Every row in the tenant isolation table. `app.test.js`: _unknown API routes return a JSON 404_. `errorHandler.test.js`: _CastError becomes 404, not 500_',
      ],
      [
        '409',
        '`errorHandler.test.js`: _duplicate key becomes 409 naming the field_, plus duplicate email, duplicate member and last admin',
      ],
      ['500', '`errorHandler.test.js`: _unexpected errors become 500 without a stack trace_'],
    ],
    note: 'Also covered: security headers (`app.test.js`: _helmet security headers are set_) and fail-fast config (`env.test.js`: _fails fast listing every missing variable_, _rejects a short JWT secret_).',
  },
];

export const terminalLines: { kind: 'heading' | 'pass'; text: string }[] = [
  { kind: 'heading', text: '# Tenant isolation: alice (Acme only) attacks Beta Labs by ID' },
  { kind: 'pass', text: 'GET /organizations/:betaId → 404' },
  { kind: 'pass', text: 'GET /projects/:betaProjectId (the brief’s example attack) → 404' },
  { kind: 'pass', text: '...and the body is identical to a project that does not exist' },
  { kind: 'pass', text: 'PATCH /tasks/:betaTaskId → 404' },
  { kind: 'pass', text: 'DELETE /projects/:betaProjectId → 404' },
  { kind: 'heading', text: '# Roles inside an org the user belongs to' },
  { kind: 'pass', text: 'alice (Acme MEMBER) deletes an Acme project → 403' },
  { kind: 'pass', text: 'demo (Beta MEMBER) adds a member to Beta Labs → 403' },
];

export const browserSteps: [string, string][] = [
  [
    'Register and log in',
    'Registering demo@taskhive.dev shows “An account with this email already exists”. Then log in as demo.',
  ],
  [
    'Switch organizations',
    'The switcher lists Acme Inc. (Admin) and Beta Labs (Member). Switch, and the dashboard, projects and members all change.',
  ],
  [
    'Work on tasks',
    'In Beta Labs › Mobile Application, create a task, change its status and priority, assign it to Bob, then delete it.',
  ],
  ['Use the board', 'Switch the project to Board and move a task by changing its status.'],
  [
    'Try the attack',
    'Copy the Mobile Application URL, log out, log in as alice and paste it. You get “Project not found”.',
  ],
  [
    'Hit a member’s limits',
    'As alice, Website Redesign has no Edit or Delete. A project she creates has Edit but no Delete.',
  ],
  ['See admin-only controls', 'As alice, Members is read-only. As demo, role controls and Add member appear.'],
  [
    'Keep one admin',
    'As demo, demoting yourself is refused with a 409. Promote and demote alice to see roles change live.',
  ],
  ['Log out', 'Open /o/acme-inc after logging out and you’re sent to the login page.'],
  ['Create an organization', 'You become its Admin and it starts empty. Nothing from Acme or Beta Labs appears.'],
];

export const scriptCommand = `node submission/verify-api.mjs ${LIVE_URL}`;

export const suiteCommands = `git clone ${REPO_URL}.git taskhive && cd taskhive
npm run setup
npm test`;

export const bonusFeatures = [
  'Task search and filters',
  'List and board views',
  'Dashboard statistics',
  'Activity log',
  'Seed script',
  'CI on GitHub Actions',
  '108 automated tests',
];

export const limitations = [
  'No pagination on project and task lists. The activity feed is paginated.',
  'No email invites, password reset or email verification.',
  'Other people’s changes appear on refetch, not in real time.',
  'No refresh-token rotation or server-side session revocation.',
  'The API sleeps when idle, so the first request can take about 30 seconds.',
];

export const nextSteps = [
  'Cursor pagination for project and task lists',
  'Email invitations with expiring tokens',
  'Playwright tests for the browser walkthrough',
  'OpenAPI docs for the REST API',
  'Short-lived access tokens with a revocable refresh token',
  'A fuller UI and UX design pass for a more polished, modern interface',
];
