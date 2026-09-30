import { Tabs } from 'radix-ui';
import type { ReactNode } from 'react';
import { browserSteps, scriptCommand, suiteCommands } from './content';
import CopyButton from './CopyButton';

const HEX = 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)';

function Command({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-modal bg-ink">
      <div className="flex items-start justify-between gap-4 px-5 py-3.5">
        <pre className="min-w-0 overflow-x-auto font-mono text-micro whitespace-pre text-[#e7ebe8]">{code}</pre>
        <CopyButton value={code} label={label} tone="dark" />
      </div>
    </div>
  );
}

function Panel({ value, children }: { value: string; children: ReactNode }) {
  return (
    <Tabs.Content value={value} className="outline-none focus-visible:outline-2 focus-visible:outline-offset-4">
      {children}
    </Tabs.Content>
  );
}

const tabs = [
  ['browser', 'In the browser'],
  ['script', 'Attack script'],
  ['suite', 'Test suite'],
] as const;

export default function TryIt({ heading }: { heading: ReactNode }) {
  return (
    <Tabs.Root defaultValue="browser" className="flex flex-col gap-10 sm:gap-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-20">
        <div className="lg:w-[380px] lg:shrink-0">{heading}</div>
        <Tabs.List
          aria-label="Ways to check the submission"
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-card bg-sunk p-1"
        >
          {tabs.map(([value, label]) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="rounded-control border border-transparent px-4 py-2 text-small font-medium whitespace-nowrap text-muted-foreground hover:text-ink data-[state=active]:border-line data-[state=active]:bg-surface data-[state=active]:font-semibold data-[state=active]:text-ink"
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      <Panel value="browser">
        <ol className="grid gap-x-12 md:grid-cols-2">
          {browserSteps.map(([title, detail], i) => (
            <li
              key={title}
              className={`flex gap-4.5 border-b border-line py-6 ${i < 2 ? 'md:border-t' : ''} ${i === 0 ? 'border-t' : ''}`}
            >
              <span
                className="grid h-[30px] w-[34px] shrink-0 place-items-center bg-honey text-[11px] font-bold text-ink"
                style={{ clipPath: HEX }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold">{title}</h3>
                <p className="mt-1.5 text-body text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel value="script">
        <div className="flex max-w-[860px] flex-col gap-5">
          <p className="text-body text-muted-foreground">
            From a clone of the repository, this logs in as the three demo users and runs 42 checks against the live
            app. Every check is a request the server must refuse, so a passing run changes no data. It needs only Node
            22 or later, with nothing to install.
          </p>
          <Command label="attack script command" code={scriptCommand} />
          <p className="text-small text-muted-foreground">
            Expect <code className="font-mono text-ink">42 passed, 0 failed</code>. Login is limited to 20 attempts per
            15 minutes, and each run uses six, so wait a few minutes after three runs in a row.
          </p>
        </div>
      </Panel>

      <Panel value="suite">
        <div className="flex max-w-[860px] flex-col gap-5">
          <p className="text-body text-muted-foreground">
            The server tests start an in-memory MongoDB replica set, so no database or <code>.env</code> file is needed.
            The first run downloads a MongoDB binary of about 800 MB.
          </p>
          <Command label="test suite commands" code={suiteCommands} />
          <p className="text-small text-muted-foreground">
            Expect 103 server tests and 5 client tests to pass. Run one area with{' '}
            <code className="font-mono text-ink">npm --prefix server test -- isolation</code>.
          </p>
        </div>
      </Panel>
    </Tabs.Root>
  );
}
