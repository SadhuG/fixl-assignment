import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const checks = [
  { question: 'Signed in?', code: 'authenticate', outcome: '401 if not' },
  { question: 'Member of this org?', code: 'loadProject', outcome: '404 if not' },
  { question: 'Role allows it?', code: 'requireRole', outcome: '403 if not' },
  { question: 'Input valid?', code: 'validate', outcome: '400 if not' },
  { question: 'Run the query', code: 'controller', outcome: 'scoped to the org' },
];

// Index of the check that stops alice's request.
const STOP = 1;

// Centre of the second of five equal columns separated by 24px gaps.
const toStop = 'calc((100% - 96px) * 0.3 + 24px)';

function StepNumber({ n }: { n: number }) {
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-badge bg-honey px-1 text-[11px] font-semibold text-ink">
      {n}
    </span>
  );
}

function Desktop() {
  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      <div className="grid grid-cols-5 gap-6">
        {checks.map((c, i) => (
          <div key={c.code} className="flex flex-col">
            <div
              className={cn(
                'relative h-[100px] rounded-panel border p-3.5',
                i === STOP ? 'border-[#f1c5c0] bg-[#fff8f7]' : 'border-line bg-paper',
              )}
            >
              <div className="flex items-center gap-2.5">
                <StepNumber n={i + 1} />
                <span className="text-body font-semibold">{c.question}</span>
              </div>
              <div className="mt-2.5 font-mono text-micro text-muted-foreground">{c.code}</div>
              <div className={cn('mt-1 text-micro font-medium', i === 4 ? 'text-action' : 'text-faint')}>
                {c.outcome}
              </div>
              {i < checks.length - 1 && <span className="absolute top-1/2 -right-5 h-px w-4 bg-faint" />}
            </div>
            {/* Column track: a dashed drop line and the two lane dots. */}
            <div className="relative h-[200px]">
              <span className="absolute top-0 bottom-6 left-1/2 border-l-[1.5px] border-dashed border-line-soft" />
              <span className="absolute top-[58px] left-1/2 z-10 size-3.5 -translate-1/2 rounded-full border-[3px] border-action bg-surface" />
              {i === 0 && (
                <span className="absolute top-[134px] left-1/2 z-10 size-3.5 -translate-1/2 rounded-full border-[3px] border-danger bg-surface" />
              )}
              {i === STOP && (
                <span className="absolute top-[134px] left-1/2 z-10 grid size-6 -translate-1/2 place-items-center rounded-full bg-danger text-white">
                  <X size={14} strokeWidth={3} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lane A: demo reads an Acme project and passes every check. */}
      <div className="absolute inset-x-0 top-[116px] flex items-baseline gap-2 text-micro [&>span]:bg-surface [&>span]:pr-1">
        <span className="font-semibold text-action">demo</span>
        <span className="font-mono text-muted-foreground">GET /api/projects/:acmeProjectId</span>
      </div>
      <span className="absolute inset-x-0 top-[157px] h-[3px] rounded-full bg-action" />
      <span className="absolute top-[174px] right-0 rounded-full bg-action-tint px-2.5 py-1 text-micro font-semibold text-action">
        200 Website Redesign
      </span>

      {/* Lane B: alice asks for a Beta Labs project and is stopped at the membership check. */}
      <div className="absolute inset-x-0 top-[192px] flex items-baseline gap-2 text-micro [&>span]:bg-surface [&>span]:pr-1">
        <span className="font-semibold text-danger">alice</span>
        <span className="font-mono text-muted-foreground">GET /api/projects/:betaProjectId</span>
      </div>
      <span className="absolute top-[233px] left-0 h-[3px] rounded-full bg-danger" style={{ width: toStop }} />
      <span
        className="absolute top-[234px] right-0 border-t-2 border-dashed border-line-soft"
        style={{ left: `calc(${toStop} + 14px)` }}
      />
      <div className="absolute top-[221px] flex flex-col gap-1.5" style={{ left: `calc(${toStop} + 26px)` }}>
        <span className="w-fit rounded-full bg-danger-tint px-2.5 py-1 text-micro font-semibold text-danger">
          404 Project not found
        </span>
        <span className="text-micro text-muted-foreground">
          The same answer as an ID that doesn’t exist, so Beta Labs stays invisible.
        </span>
      </div>
    </div>
  );
}

function Mark({ kind }: { kind: 'pass' | 'stop' | 'skip' }) {
  return (
    <span
      className={cn(
        'grid size-[22px] place-items-center rounded-full',
        kind === 'pass' && 'bg-action-tint text-action',
        kind === 'stop' && 'bg-danger text-white',
        kind === 'skip' && 'bg-sunk',
      )}
    >
      {kind === 'pass' && <Check size={13} strokeWidth={3} />}
      {kind === 'stop' && <X size={13} strokeWidth={3} />}
    </span>
  );
}

function Stacked() {
  return (
    <div className="lg:hidden" aria-hidden="true">
      <div className="mb-2 flex justify-end gap-1 pr-3 text-micro font-semibold">
        <span className="w-11 text-center text-action">demo</span>
        <span className="w-11 text-center text-danger">alice</span>
      </div>
      <ol className="flex flex-col gap-2">
        {checks.map((c, i) => (
          <li
            key={c.code}
            className={cn(
              'flex items-center gap-2.5 rounded-card px-3 py-2.5',
              i === STOP ? 'bg-[#fff8f7]' : 'bg-paper',
            )}
          >
            <StepNumber n={i + 1} />
            <div className="min-w-0 flex-1">
              <div className="text-small font-semibold">{c.question}</div>
              <div className="font-mono text-[12px] text-muted-foreground">{c.code}</div>
            </div>
            <div className="flex gap-1 [&>span]:mx-[11px]">
              <Mark kind="pass" />
              <Mark kind={i < STOP ? 'pass' : i === STOP ? 'stop' : 'skip'} />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-col items-start gap-2">
        <span className="rounded-full bg-action-tint px-2.5 py-1 text-micro font-semibold text-action">
          demo: 200 Website Redesign
        </span>
        <span className="rounded-full bg-danger-tint px-2.5 py-1 text-micro font-semibold text-danger">
          alice: 404 Project not found
        </span>
        <span className="text-micro text-muted-foreground">
          The same answer as an ID that doesn’t exist, so Beta Labs stays invisible.
        </span>
      </div>
    </div>
  );
}

export default function RequestPipeline() {
  return (
    <figure
      className="rounded-[14px] border border-line bg-surface p-5 shadow-[0_20px_50px_-12px_rgb(22_32_42/0.12)] sm:p-8 lg:p-10"
      aria-labelledby="pipeline-title"
    >
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-start lg:justify-between">
        <figcaption>
          <h2 id="pipeline-title" className="text-[17px] font-semibold sm:text-[20px]">
            What the server checks before it answers
          </h2>
          <p className="mt-1 hidden text-small text-muted-foreground sm:block">
            Every route runs these checks in order. The tenant comes from the database, never from the URL or the
            request body.
          </p>
        </figcaption>
        <ul className="hidden shrink-0 flex-col gap-1.5 text-micro text-muted-foreground lg:flex" aria-hidden="true">
          <li className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-action" /> demo reads an Acme project
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-danger" /> alice asks for a Beta Labs project
          </li>
        </ul>
      </div>
      <Desktop />
      <Stacked />
      <ol className="sr-only">
        {checks.map((c) => (
          <li key={c.code}>
            {c.question} ({c.code}): {c.outcome}.
          </li>
        ))}
        <li>
          demo requests an Acme project, passes every check and gets 200. alice requests a Beta Labs project and is
          stopped at the membership check with 404 Project not found, the same answer as an ID that doesn’t exist.
        </li>
      </ol>
    </figure>
  );
}
