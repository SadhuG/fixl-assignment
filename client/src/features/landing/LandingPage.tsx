import { useState } from 'react';
import { Link } from 'react-router';
import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  Menu,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { Priority, Status } from '@/api/types';
import { PriorityBars, StatusGlyph } from '@/components/Badges';
import Logo from '@/components/Logo';
import './landing.css';

const demoTasks = [
  ['Build responsive header component', 'progress', 'High', 'Demo User'],
  ['Write copy for pricing page', 'progress', 'Medium', 'Priya Nair'],
  ['Set up redirects for old URLs', 'todo', 'High', 'Alice Moreno'],
  ['Accessibility pass on forms', 'todo', 'Medium', 'Marcus Webb'],
  ['Migrate blog posts to new CMS', 'todo', 'Low', 'Unassigned'],
  ['Draft new information architecture', 'done', 'Low', 'Demo User'],
  ['Audit current site navigation', 'done', 'Medium', 'Alice Moreno'],
] as const;

const heroTasks: {
  task: string;
  status: Status;
  priority: Priority;
  assignee: [string, string] | null;
  updated: string;
}[] = [
  {
    task: 'Build responsive header component',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee: ['Demo User', '#35607a'],
    updated: '2h ago',
  },
  {
    task: 'Write copy for pricing page',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignee: ['Priya Nair', '#7a2e6b'],
    updated: '5h ago',
  },
  {
    task: 'Set up redirects for old URLs',
    status: 'TODO',
    priority: 'HIGH',
    assignee: ['Alice Moreno', '#35607a'],
    updated: 'Yesterday',
  },
  {
    task: 'Accessibility pass on forms',
    status: 'TODO',
    priority: 'MEDIUM',
    assignee: ['Marcus Webb', '#0e5c52'],
    updated: 'Yesterday',
  },
  { task: 'Migrate blog posts to new CMS', status: 'TODO', priority: 'LOW', assignee: null, updated: 'Sep 22' },
  {
    task: 'Draft new information architecture',
    status: 'DONE',
    priority: 'HIGH',
    assignee: ['Demo User', '#35607a'],
    updated: 'Sep 19',
  },
  {
    task: 'Audit current site navigation',
    status: 'DONE',
    priority: 'MEDIUM',
    assignee: ['Alice Moreno', '#35607a'],
    updated: 'Sep 16',
  },
];

const statusLabel: Record<Status, string> = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' };
const priorityLabel: Record<Priority, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

// The project list view as it looks in the app, cropped to the main column.
function HeroPreview() {
  return (
    <div className="hero-app" aria-hidden="true">
      <div className="hero-app-crumbs">
        Projects <ChevronRight size={14} /> <span>Website Redesign</span>
      </div>
      <h3>Website Redesign</h3>
      <p className="hero-app-description">
        Rebuild the marketing site on the new design system, starting with navigation and pricing.
      </p>
      <div className="hero-app-meta">
        <span className="hero-app-person">
          <span className="hero-app-avatar" style={{ background: '#35607a' }}>
            DU
          </span>
          Demo User
        </span>
        <span className="hero-app-muted">Created Sep 12</span>
        <span className="hero-app-progress">
          <span className="hero-app-bar">
            <span />
          </span>
          2/7
        </span>
      </div>
      <div className="hero-app-toolbar">
        <div className="hero-app-segments">
          <span className="active">
            All <small>7</small>
          </span>
          <span>
            To do <small>3</small>
          </span>
          <span>
            In progress <small>2</small>
          </span>
          <span>
            Done <small>2</small>
          </span>
        </div>
        <span className="hero-app-field hero-app-select">
          <UserRound size={16} /> <span>Anyone</span> <ChevronDown size={16} />
        </span>
        <span className="hero-app-field hero-app-search">
          <Search size={16} /> Search tasks
        </span>
      </div>
      <div className="hero-app-table">
        <div className="hero-app-row hero-app-head">
          <span>Task</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Assignee</span>
          <span>Updated</span>
        </div>
        {heroTasks.map(({ task, status, priority, assignee, updated }, index) => (
          <div className={`hero-app-row ${index === 0 ? 'hover' : ''} ${status === 'DONE' ? 'done' : ''}`} key={task}>
            <span className="hero-app-task">{task}</span>
            <span>
              <span className={`hero-app-status ${status.toLowerCase()}`}>
                <StatusGlyph status={status} />
                {statusLabel[status]}
                <ChevronDown size={12} />
              </span>
            </span>
            <span>
              <span className={`hero-app-priority ${priority.toLowerCase()}`}>
                <PriorityBars priority={priority} />
                {priorityLabel[priority]}
              </span>
            </span>
            <span className="hero-app-person">
              {assignee ? (
                <span className="hero-app-avatar small" style={{ background: assignee[1] }}>
                  {initials(assignee[0])}
                </span>
              ) : (
                <span className="hero-app-avatar small unassigned" />
              )}
              <span className={assignee ? undefined : 'hero-app-muted'}>{assignee ? assignee[0] : 'Unassigned'}</span>
            </span>
            <span className="hero-app-muted">{updated}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoWorkspace() {
  return (
    <div className="landing-workspace" aria-hidden="true">
      <aside className="landing-workspace-sidebar">
        <span>Workspace</span>
        <div>▦ &nbsp; Dashboard</div>
        <div className="selected">
          ▣ &nbsp; Projects <small>2</small>
        </div>
        <div>
          <Users size={13} /> &nbsp; Members <small>5</small>
        </div>
      </aside>
      <div className="landing-workspace-main">
        <div className="landing-workspace-top">
          <Logo inverted />
          <span className="workspace-org">🟦 &nbsp; Acme Inc. &nbsp; Admin &nbsp;⌄</span>
        </div>
        <div className="landing-workspace-body">
          <div className="workspace-breadcrumb">
            Projects <ChevronRight size={12} /> <strong>Website Redesign</strong>
          </div>
          <h3>Website Redesign</h3>
          <p>Rebuild the marketing site on the new design system, starting with navigation and pricing.</p>
          <div className="workspace-meta">
            <span className="workspace-avatar">DU</span> Demo User <span>Created Sep 12</span>
            <span className="workspace-progress" />
            <span>2/7</span>
          </div>
          <div className="workspace-filters">
            <span className="active">
              All <small>7</small>
            </span>
            <span>
              To do <small>3</small>
            </span>
            <span>
              In progress <small>2</small>
            </span>
            <span>
              Done <small>2</small>
            </span>
            <span className="workspace-select">
              ♙ &nbsp; Anyone <ChevronDown size={12} />
            </span>
            <span className="workspace-search">
              <Search size={13} /> Search tasks
            </span>
          </div>
          <div className="workspace-table">
            <div className="workspace-row workspace-head">
              <span>Task</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Assignee</span>
            </div>
            {demoTasks.map(([task, status, priority, assignee]) => (
              <div className="workspace-row" key={task}>
                <span>{task}</span>
                <span>
                  <span className={`workspace-status ${status}`}>
                    {status === 'done' ? <CircleCheck size={12} /> : <CircleDashed size={12} />}
                    {status === 'progress' ? 'In progress' : status === 'todo' ? 'To do' : 'Done'}
                    <ChevronDown size={10} />
                  </span>
                </span>
                <span className={`workspace-priority ${priority.toLowerCase()}`}>▥ &nbsp;{priority}</span>
                <span>{assignee}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Ctas() {
  return (
    <div className="landing-ctas">
      <Link className="landing-button landing-button-primary" to="/register">
        Create an account
      </Link>
      <Link className="landing-button landing-button-secondary" to="/login?demo=1">
        Try the demo
      </Link>
    </div>
  );
}

const features = [
  [
    'Separate by default',
    'Another team’s projects never show up in your lists, search or links. A task from a different org looks exactly like one that doesn’t exist.',
  ],
  [
    'Two roles, clear rules',
    'Admins run projects and people. Members pick up tasks and move them forward. Controls you can’t use are hidden or explain who can.',
  ],
  [
    'Work that moves',
    'Change status, priority and assignee right in the list, or flip to the board. Every change saves as you make it.',
  ],
];

const permissions = [
  ['See every project in the org', true],
  ['Create and update tasks', true],
  ['Assign tasks to teammates', true],
  ['Create, edit and delete projects', false],
  ['Add, remove and re-role members', false],
  ['Rename the organization', false],
] as const;

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
      <a className="landing-skip" href="#landing-main">
        Skip to content
      </a>
      <header className="landing-header">
        <Link to="/" aria-label="TaskHive home" className="landing-logo">
          <Logo />
        </Link>
        <button
          className="landing-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={`landing-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <a href="#features" onClick={closeMenu}>
            Features
          </a>
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a href="#roles" onClick={closeMenu}>
            Roles
          </a>
          <a href="#demo" onClick={closeMenu}>
            Demo
          </a>
          <div className="landing-nav-actions">
            <Link to="/login" onClick={closeMenu}>
              Log in
            </Link>
            <Link className="landing-button landing-button-honey" to="/register" onClick={closeMenu}>
              Create account
            </Link>
          </div>
        </nav>
      </header>

      <main id="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <h1 id="landing-title">
              Every team gets
              <br />
              its own hive.
            </h1>
            <p>
              TaskHive gives each organization its own projects, tasks and people.
              <br className="landing-desktop-break" /> Switch teams from the top bar. Nothing crosses over.
            </p>
            <Ctas />
            <span className="landing-free-note">Free to try. demo@taskhive.dev is ready to go</span>
          </div>
          <div className="landing-hero-preview">
            <HeroPreview />
          </div>
        </section>

        <section className="landing-demo" id="demo" aria-label="TaskHive project preview">
          <DemoWorkspace />
        </section>

        <section className="landing-features landing-container" id="features">
          <div className="landing-section-copy">
            <h2>
              Built around the
              <br /> organization.
            </h2>
            <p>
              Projects, tasks and people all belong to an org. TaskHive keeps each one in its own space and makes
              switching between them one click.
            </p>
          </div>
          <div className="landing-feature-list">
            {features.map(([title, description]) => (
              <div className="landing-feature-row" key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-switch-section">
          <div className="landing-container landing-switch-grid">
            <div className="landing-org-art" aria-hidden="true">
              <div className="landing-org-card north">
                <div>
                  ▣ &nbsp; Northwind Studio <small>Admin</small>
                </div>
                <p>◉ &nbsp; Brand guidelines v2</p>
                <p>◯ &nbsp; Design onboarding screens</p>
              </div>
              <div className="landing-org-card beta">
                <div>
                  ▣ &nbsp; Beta Labs <small>Member</small>
                </div>
                <p>◉ &nbsp; Design onboarding screens</p>
                <p>◯ &nbsp; Offline mode for task list</p>
              </div>
              <div className="landing-org-card acme">
                <div>
                  ▣ &nbsp; Acme Inc. <small>Admin</small>
                </div>
                <p>◉ &nbsp; Build responsive header</p>
                <p>◯ &nbsp; Set up redirects for old URLs</p>
                <p>◉ &nbsp; Write copy for pricing page</p>
                <p>◉ &nbsp; Audit current site navigation</p>
              </div>
            </div>
            <div className="landing-switch-copy">
              <h2>
                Every team you’re on,
                <br /> one click apart.
              </h2>
              <p>
                Switch organizations from the top bar. The colour of the bar changes with the org, so you always know
                whose work you’re looking at.
              </p>
              <ul>
                <li>
                  <CircleCheck size={19} /> Your role is shown next to every org name
                </li>
                <li>
                  <CircleCheck size={19} /> Lists reload for the new org; old rows never linger
                </li>
                <li>
                  <CircleCheck size={19} /> Each org gets its own link: /o/acme-inc
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="landing-roles-section" id="roles">
          <div className="landing-container landing-roles-grid">
            <div className="landing-section-copy">
              <h2>
                Admins steer.
                <br />
                Members ship.
              </h2>
              <p>The server checks every rule, so the interface can stay simple.</p>
            </div>
            <div className="landing-permissions">
              <div className="landing-permission-row heading">
                <span>What you can do</span>
                <strong>Admin</strong>
                <strong>Member</strong>
              </div>
              {permissions.map(([label, member]) => (
                <div className="landing-permission-row" key={label}>
                  <span>{label}</span>
                  <Check size={16} aria-label="Yes" />
                  <span className={member ? 'permission-yes' : 'permission-no'}>
                    {member ? <Check size={16} aria-label="Yes" /> : 'No'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-steps landing-container" id="how-it-works">
          <h2>Up and running in three steps.</h2>
          <div className="landing-step-grid">
            <div>
              <span className="landing-step-num">01</span>
              <h3>Create an organization</h3>
              <p>Name it and you’re its first admin. Make as many as you need.</p>
            </div>
            <div>
              <span className="landing-step-num">02</span>
              <h3>Bring in your team</h3>
              <p>Add people by email and choose who’s an admin and who’s a member.</p>
            </div>
            <div>
              <span className="landing-step-num">03</span>
              <h3>Plan and ship</h3>
              <p>Start a project, break it into tasks and watch the progress bar fill.</p>
            </div>
          </div>
        </section>

        <section className="landing-final landing-container">
          <div className="landing-color-rule" />
          <div className="landing-final-row">
            <div>
              <h2>
                Give every team
                <br /> its own space.
              </h2>
              <p>Create an account in under a minute, or look around with the demo.</p>
            </div>
            <Ctas />
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div>
            <Logo />
            <span>A multi-tenant project portal. © 2026</span>
          </div>
          <nav aria-label="Footer navigation">
            <Link to="/submission-notes">Submission notes</Link>
            <Link to="/login">Log in</Link>
            <Link to="/register">Create account</Link>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
