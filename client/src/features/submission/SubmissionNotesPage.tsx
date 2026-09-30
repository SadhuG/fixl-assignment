import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Check, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import '@/features/landing/landing.css';
import { DataModelDiagram, DeploymentDiagram } from './ArchitectureDiagrams';
import {
  apiLatency,
  bonusFeatures,
  decisions,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  LIVE_URL,
  limitations,
  nextSteps,
  people,
  performanceRoutes,
  REPO_URL,
  terminalLines,
  testAreas,
  tradeOffs,
  scriptCommand,
  type OrgRole,
} from './content';
import CopyButton from './CopyButton';
import RequestPipeline from './RequestPipeline';
import TestAreas from './TestAreas';
import TryIt from './TryIt';

const container = 'mx-auto w-[min(1200px,calc(100%-40px))] sm:w-[min(1200px,calc(100%-48px))]';
const sectionPad = 'py-16 sm:py-20 lg:py-[110px]';
const ORG_COLORS = { acme: '#2b367f', beta: '#75420a' };

function SectionHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 id={id} className="text-[clamp(34px,5vw,48px)] leading-[1.04] font-semibold tracking-[-0.05em]">
        {title}
      </h2>
      {children && <p className="max-w-[560px] text-[16px] leading-[26px] text-muted-foreground">{children}</p>}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = [
    ['#accounts', 'Accounts'],
    ['#architecture', 'Architecture'],
    ['#tests', 'Tests'],
    ['#performance', 'Performance'],
    ['#try-it', 'Try it yourself'],
  ];
  return (
    <header className="landing-header">
      <Link to="/" aria-label="TaskHive home" className="landing-logo">
        <Logo />
      </Link>
      <button
        className="landing-menu-toggle"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav className={cn('landing-nav', open && 'open')} aria-label="Page sections">
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={close}>
            {label}
          </a>
        ))}
        <div className="landing-nav-actions">
          <Link to="/login" onClick={close}>
            Log in
          </Link>
          <Link className="landing-button landing-button-honey" to="/login?demo=1" onClick={close}>
            Try the demo
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SubmissionCard() {
  const rows: { label: string; value: ReactNode; copy?: string }[] = [
    { label: 'Candidate', value: 'Sudhansh' },
    {
      label: 'Live app',
      value: (
        <Link to="/" className="font-semibold text-action hover:underline">
          {LIVE_URL.replace('https://', '')}
        </Link>
      ),
    },
    {
      label: 'Repository',
      value: (
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-semibold text-action hover:underline">
          {REPO_URL.replace('https://', '')}
        </a>
      ),
    },
    { label: 'Demo email', value: <span className="font-mono">{DEMO_EMAIL}</span>, copy: DEMO_EMAIL },
    { label: 'Demo password', value: <span className="font-mono">{DEMO_PASSWORD}</span>, copy: DEMO_PASSWORD },
  ];
  return (
    <div className="rounded-modal border border-line bg-surface px-4 py-1 sm:px-6 sm:py-2">
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 border-b border-line-soft py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4"
          >
            <dt className="text-small text-muted-foreground">{row.label}</dt>
            <dd className="flex min-w-0 items-center justify-between gap-2.5 text-body font-medium break-all sm:justify-end">
              {row.value}
              {row.copy && <CopyButton value={row.copy} label={row.label.toLowerCase()} />}
            </dd>
          </div>
        ))}
      </dl>
      <p className="py-3 text-micro text-muted-foreground sm:py-4">
        The live app is seeded. Alice and Bob use the same password.
      </p>
    </div>
  );
}

function Role({ role }: { role: OrgRole }) {
  if (!role) return <span className="text-small text-faint">Not a member</span>;
  return (
    <span
      className={cn(
        'rounded-badge px-2 py-0.5 text-micro font-semibold',
        role === 'Admin' ? 'bg-action-tint text-action' : 'bg-sunk text-muted-foreground',
      )}
    >
      {role}
    </span>
  );
}

function OrgName({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-3.5 rounded-[3px]" style={{ background: color }} aria-hidden="true" />
      {name}
    </span>
  );
}

function Accounts() {
  return (
    <section aria-labelledby="accounts" className={cn(container, sectionPad)}>
      <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-20">
        <SectionHeading id="accounts" title="Three people, two organizations.">
          Log in as each one and the same app shows different work. Alice plays the attacker in every isolation check on
          this page.
        </SectionHeading>
        <div className="flex flex-col gap-6">
          <div className="hidden overflow-hidden rounded-panel border border-line bg-surface sm:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#f7f9f8]">
                <tr className="h-14 text-small">
                  <th scope="col" className="px-6 text-micro font-medium text-muted-foreground">
                    Demo account
                  </th>
                  <th scope="col" className="w-[27%] px-6 font-semibold">
                    <OrgName name="Acme Inc." color={ORG_COLORS.acme} />
                  </th>
                  <th scope="col" className="w-[27%] px-6 font-semibold">
                    <OrgName name="Beta Labs" color={ORG_COLORS.beta} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.email} className="h-[76px] border-t border-line-soft">
                    <th scope="row" className="px-6 font-normal">
                      <span className="block text-body font-semibold">{p.name}</span>
                      <span className="block font-mono text-micro text-muted-foreground">{p.email}</span>
                    </th>
                    <td className="px-6">
                      <Role role={p.acme} />
                    </td>
                    <td className="px-6">
                      <Role role={p.beta} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="overflow-hidden rounded-panel border border-line bg-surface sm:hidden">
            {people.map((p) => (
              <li key={p.email} className="flex flex-col gap-2.5 border-b border-line-soft p-4 last:border-b-0">
                <div>
                  <p className="text-body font-semibold">{p.name}</p>
                  <p className="font-mono text-micro text-muted-foreground">{p.email}</p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-small">
                  <span className="flex items-center gap-2">
                    <OrgName name="Acme:" color={ORG_COLORS.acme} /> <Role role={p.acme} />
                  </span>
                  <span className="flex items-center gap-2">
                    <OrgName name="Beta Labs:" color={ORG_COLORS.beta} /> <Role role={p.beta} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-small text-muted-foreground">
            Every account uses the password {DEMO_PASSWORD}. Demo is in both orgs, so it shows the organization
            switcher.
          </p>
        </div>
      </div>
    </section>
  );
}

function RuleRows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="border-t border-[#8b9695]">
      {rows.map(([title, text]) => (
        <div
          key={title}
          className="grid gap-2 border-b border-[#8b9695] py-5 sm:py-6 md:grid-cols-[minmax(0,460px)_1fr] md:gap-5"
        >
          <dt className="text-[17px] font-semibold">{title}</dt>
          <dd className="text-body leading-[25px] text-muted-foreground">{text}</dd>
        </div>
      ))}
    </dl>
  );
}

function Architecture() {
  return (
    <section aria-labelledby="architecture" className="bg-paper">
      <div className={cn(container, sectionPad, 'flex flex-col gap-14')}>
        <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-20">
          <SectionHeading id="architecture" title="One API, every tenant checked.">
            Vercel serves the React app and forwards /api to the Express API on Render, so the session cookie stays
            first-party.
          </SectionHeading>
          <div className="flex min-w-0 flex-col gap-6">
            <DeploymentDiagram />
            <DataModelDiagram />
          </div>
        </div>
        <div>
          <h3 className="sr-only">Architecture decisions</h3>
          <RuleRows rows={decisions} />
        </div>
        <div className="flex flex-col gap-6">
          <h3 className="text-[26px] leading-8 font-semibold tracking-[-0.03em]">Trade-offs I accepted</h3>
          <RuleRows rows={tradeOffs} />
        </div>
      </div>
    </section>
  );
}

function Terminal() {
  return (
    <figure className="min-w-0 overflow-hidden rounded-modal bg-ink">
      <figcaption className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
        <code className="min-w-0 truncate font-mono text-micro text-[#e7ebe8]">{scriptCommand}</code>
        <CopyButton value={scriptCommand} label="attack script command" tone="dark" />
      </figcaption>
      <pre className="overflow-x-auto px-5 pt-5 pb-5 font-mono text-micro leading-[20px] text-[#d9dedb]">
        {terminalLines.map((line) =>
          line.kind === 'heading' ? (
            <span key={line.text} className="block text-faint">
              {line.text}
            </span>
          ) : (
            <span key={line.text} className="block">
              <span className="font-medium text-[#7fd4ab]">PASS</span>
              {'  '}
              {line.text}
            </span>
          ),
        )}
        <span className="mt-3 block font-medium text-white">42 passed, 0 failed</span>
      </pre>
    </figure>
  );
}

function Tests() {
  const results = [
    '103 server tests pass (Jest + Supertest)',
    '7 client tests pass (node:test)',
    '42 live checks pass against the deployed app',
    '12 Lighthouse audits of the deployed app',
  ];
  return (
    <section aria-labelledby="tests" className={cn(container, sectionPad, 'flex flex-col gap-14')}>
      <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-20">
        <div className="flex flex-col gap-7">
          <SectionHeading id="tests" title="Every test the brief asks for.">
            The brief names six areas to test. Each dropdown lists the automated tests that cover an area and a check
            you can run yourself.
          </SectionHeading>
          <ul className="flex flex-col gap-2.5">
            {results.map((r) => (
              <li key={r} className="flex items-center gap-2.5 text-body font-medium">
                <span className="grid size-[18px] place-items-center rounded-full bg-action-tint text-action">
                  <Check size={11} strokeWidth={3.5} aria-hidden="true" />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <Terminal />
      </div>
      <TestAreas areas={testAreas} />
    </section>
  );
}

const LATENCY_SCALE_MS = 2000;
const latencyTicks = [0, 500, 1000, 1500, 2000];
const formatMs = (ms: number) => `${ms.toLocaleString('en-US')} ms`;

function ScoreLedger() {
  const figures = [
    ['94', 'Mobile performance', 'Six routes, 93 to 95'],
    ['100', 'Desktop performance', 'Six routes, 99 to 100'],
    ['99', 'Accessibility', 'All 12 audits, 95 to 100'],
    ['2.48 s', 'Mobile LCP', 'Slowest route 2.61 s'],
  ] as const;
  return (
    <dl className="grid grid-cols-2 self-start border-t border-[#8b9695]">
      {figures.map(([value, label, detail], i) => (
        <div
          key={label}
          className={cn(
            'flex flex-col border-b border-line-soft py-5 sm:py-7',
            i % 2 === 1 ? 'border-l pl-5 sm:pl-8' : 'pr-5 sm:pr-8',
          )}
        >
          <dt className="order-2 mt-3 text-body font-semibold">{label}</dt>
          <dd className="order-1 text-[clamp(38px,5vw,56px)] leading-none font-semibold tracking-[-0.05em] tabular-nums">
            {value}
          </dd>
          <dd className="order-3 text-small text-muted-foreground">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

function RouteScores() {
  const score = (value: number) =>
    value < 90 ? (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-warn">
        <span className="rounded-[4px] bg-warn-tint px-1.5 text-micro font-medium">Below 90</span>
        {value}
      </span>
    ) : (
      value
    );
  const groupStart = 'border-l border-line-soft';
  const columns = ['Performance', 'Accessibility', 'LCP'];
  return (
    <div
      role="region"
      aria-label="Scores by route"
      tabIndex={0}
      className="scroll-x-panel overflow-x-auto rounded-panel border border-line bg-surface"
    >
      <table className="w-full min-w-[640px] border-collapse text-right text-small whitespace-nowrap tabular-nums">
        <caption className="sr-only">Lighthouse scores and largest contentful paint by route and profile</caption>
        <thead className="bg-[#f7f9f8]">
          <tr>
            <td className="sticky left-0 bg-[#f7f9f8]" />
            <th scope="colgroup" colSpan={3} className="px-4 pt-4 pb-1 text-center font-semibold">
              Mobile
            </th>
            <th scope="colgroup" colSpan={3} className={cn(groupStart, 'px-4 pt-4 pb-1 text-center font-semibold')}>
              Desktop
            </th>
          </tr>
          <tr className="text-micro text-muted-foreground">
            <th scope="col" className="sticky left-0 bg-[#f7f9f8] px-5 pt-1 pb-3 text-left font-medium">
              Route
            </th>
            {[...columns, ...columns].map((label, i) => (
              <th key={i} scope="col" className={cn('px-4 pt-1 pb-3 font-medium', i === 3 && groupStart)}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {performanceRoutes.map(({ route, mobile, desktop }) => (
            <tr key={route} className="h-12 border-t border-line-soft">
              <th scope="row" className="sticky left-0 bg-surface px-5 text-left font-medium whitespace-nowrap">
                {route}
              </th>
              <td className="px-4 font-semibold">{score(mobile.performance)}</td>
              <td className="px-4 font-semibold">{mobile.accessibility}</td>
              <td className="px-4 text-muted-foreground">{mobile.lcp}</td>
              <td className={cn(groupStart, 'px-4 font-semibold')}>{score(desktop.performance)}</td>
              <td className="px-4 font-semibold">{desktop.accessibility}</td>
              <td className="px-4 text-muted-foreground">{desktop.lcp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LatencyChart() {
  const pct = (ms: number) => `${(ms / LATENCY_SCALE_MS) * 100}%`;
  const rowGrid = 'grid grid-cols-[1fr_auto] gap-x-4 sm:grid-cols-[136px_1fr_76px] sm:items-center';
  return (
    <figure className="flex min-w-0 flex-col gap-4">
      <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2 text-small text-muted-foreground">
        <span>Median of 30 sequential reads per endpoint</span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-5 rounded-[3px] bg-action" aria-hidden="true" />
          Through Vercel
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1 w-5 rounded-full bg-[#8b9695]" aria-hidden="true" />
          Direct to Render
        </span>
      </figcaption>
      <ul className="flex flex-col border-t border-line-soft">
        {apiLatency.map(({ endpoint, vercel, render }) => (
          <li key={endpoint} className={cn(rowGrid, 'gap-y-1.5 pt-2.5 sm:pt-0')}>
            <span className="text-small font-medium">{endpoint}</span>
            <span className="text-right text-small font-semibold tabular-nums sm:order-last">
              {formatMs(vercel)}
              <span className="sr-only"> through Vercel, {formatMs(render)} direct to Render</span>
            </span>
            <span
              className="col-span-2 flex flex-col gap-1 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px)] bg-size-[25%_100%] py-1 sm:col-span-1 sm:py-3.5"
              aria-hidden="true"
            >
              <span className="block h-2.5 rounded-r-[3px] bg-action" style={{ width: pct(vercel) }} />
              <span className="block h-1 rounded-r-full bg-[#8b9695]" style={{ width: pct(render) }} />
            </span>
          </li>
        ))}
      </ul>
      <div className={cn(rowGrid, 'text-micro text-muted-foreground tabular-nums')} aria-hidden="true">
        <span className="hidden sm:block" />
        <span className="relative col-span-2 h-4 sm:col-span-1">
          {latencyTicks.map((ms, i) => (
            <span
              key={ms}
              className={cn(
                'absolute top-0 whitespace-nowrap',
                i > 0 && (i === latencyTicks.length - 1 ? '-translate-x-full' : '-translate-x-1/2'),
              )}
              style={{ left: pct(ms) }}
            >
              {ms === 0 ? '0' : `${ms / 1000} s`}
            </span>
          ))}
        </span>
      </div>
    </figure>
  );
}

function Performance() {
  const loadChecks: [string, string][] = [
    ['200 task-list reads, 0 errors', '10 parallel clients at 4.9 requests a second. Median 1.74 s, p95 2.39 s.'],
    ['Log in takes 2.9 s', 'Most of that is password hashing at bcrypt cost 12, which is deliberate.'],
  ];
  return (
    <section aria-labelledby="performance" className={cn(container, sectionPad, 'flex flex-col gap-14')}>
      <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-20">
        <SectionHeading id="performance" title="Fast in the browser. Database-bound at the API.">
          Lighthouse audited every primary route of the live deployment on 30 September 2026. The API timings are from
          the same day.
        </SectionHeading>
        <ScoreLedger />
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="text-[26px] leading-8 font-semibold tracking-[-0.03em]">Scores by route</h3>
        <RouteScores />
      </div>

      <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-20">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <h3 className="text-[26px] leading-8 font-semibold tracking-[-0.03em]">Where the time goes</h3>
            <p className="text-[16px] leading-[26px] text-muted-foreground">
              Each read takes almost as long direct to Render as through Vercel, so the rewrite adds under 30 ms. The
              rest is database work behind each endpoint.
            </p>
          </div>
          <dl className="border-t border-line-soft">
            {loadChecks.map(([title, text]) => (
              <div key={title} className="flex flex-col gap-1 border-b border-line-soft py-3.5">
                <dt className="text-body font-semibold">{title}</dt>
                <dd className="text-small text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <LatencyChart />
      </div>

      <p className="max-w-[760px] text-micro leading-5 text-muted-foreground">
        Lighthouse 13, default simulated mobile profile and desktop preset, one run per route and profile. Dashboard
        mobile is the median of three runs, taken after a layout fix removed its loading shift. API timings were
        measured from one machine, so network and hosting conditions apply. Raw results and scripts are in{' '}
        <a
          href={`${REPO_URL}/tree/main/submission/perf`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-action hover:underline"
        >
          submission/perf
        </a>
        .
      </p>
    </section>
  );
}

function Limits() {
  const lists = [
    ['Known limitations', limitations],
    ['With more time', nextSteps],
  ] as const;
  return (
    <section aria-labelledby="limits" className={cn(container, sectionPad)}>
      <div className="grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeading id="limits" title="What’s missing, and what’s next." />
          <div className="flex flex-col gap-3">
            <h3 className="text-[17px] font-semibold">Beyond the brief</h3>
            <ul className="flex flex-wrap gap-2">
              {bonusFeatures.map((f) => (
                <li key={f} className="rounded-full bg-action-tint px-2.5 py-1 text-[13.5px] font-medium text-action">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12">
          {lists.map(([title, items]) => (
            <div key={title}>
              <h3 className="pb-3.5 text-[17px] font-semibold">{title}</h3>
              <ul className="border-t border-line-soft">
                {items.map((item) => (
                  <li
                    key={item}
                    className="border-b border-line-soft py-3.5 text-body leading-[23px] text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SubmissionNotesPage() {
  return (
    <div className="landing-page">
      <title>Submission notes | TaskHive</title>
      <a className="landing-skip" href="#submission-main">
        Skip to content
      </a>
      <Header />
      <main id="submission-main">
        <section aria-labelledby="submission-title" className="mx-2 rounded-[18px] bg-paper sm:mx-4 sm:rounded-[22px]">
          <div
            className={cn(
              container,
              'flex flex-col gap-10 pt-10 pb-6 sm:pt-16 sm:pb-12 lg:gap-16 lg:pt-24 lg:pb-[104px]',
            )}
          >
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,640px)_440px] lg:justify-between lg:gap-20">
              <div className="flex flex-col gap-6 sm:gap-7">
                <h1
                  id="submission-title"
                  className="max-w-[640px] text-[clamp(44px,6.2vw,76px)] leading-[0.97] font-semibold tracking-[-0.055em]"
                >
                  Every request proves where it belongs.
                </h1>
                <p className="max-w-[600px] text-[16px] leading-[25px] text-muted-foreground sm:text-[18px] sm:leading-[29px]">
                  TaskHive is my take on the multi-tenant project portal brief. This page covers what I built, the
                  decisions behind it, every test the brief asks for, and a performance readout, with a way to run each
                  one yourself.
                </p>
              </div>
              <SubmissionCard />
            </div>
            <RequestPipeline />
          </div>
        </section>
        <Accounts />
        <Architecture />
        <Tests />
        <Performance />
        <section aria-labelledby="try-it" className="bg-paper">
          <div className={cn(container, sectionPad)}>
            <TryIt
              heading={
                <SectionHeading id="try-it" title="Check it yourself.">
                  Pick how deep you want to go. The browser walkthrough needs nothing installed.
                </SectionHeading>
              }
            />
          </div>
        </section>
        <Limits />
      </main>
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div>
            <Logo />
            <span>Submission notes for the MERN multi-tenant portal assignment</span>
          </div>
          <nav aria-label="Footer navigation">
            <Link to="/login?demo=1">Try the demo</Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub repository
            </a>
            <Link to="/">Home</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
