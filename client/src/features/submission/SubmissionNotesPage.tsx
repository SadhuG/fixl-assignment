import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Check, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import '@/features/landing/landing.css';
import { DataModelDiagram, DeploymentDiagram } from './ArchitectureDiagrams';
import {
  bonusFeatures,
  decisions,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  LIVE_URL,
  limitations,
  nextSteps,
  people,
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
    '5 client tests pass (node:test)',
    '42 live checks pass against the deployed app',
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
                  decisions behind it, and every test the brief asks for, with a way to run each one yourself.
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
