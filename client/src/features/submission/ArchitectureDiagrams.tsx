import { ArrowDown, ArrowRight } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

const hops = [
  { name: 'Browser', detail: 'React 19 app' },
  { name: 'Vercel', detail: 'Static app, /api rewrite' },
  { name: 'Render', detail: 'Express 5 API', highlight: true },
  { name: 'MongoDB Atlas', detail: '5 collections' },
];

export function DeploymentDiagram() {
  return (
    <figure className="rounded-panel border border-line bg-surface p-5 sm:p-6">
      <figcaption className="mb-4 text-micro text-muted-foreground">
        Same origin: the cookie is HttpOnly, Secure and SameSite=Lax
      </figcaption>
      <ol className="flex flex-col items-stretch gap-1.5 md:flex-row md:items-center md:gap-2">
        {hops.map((hop, i) => (
          <Fragment key={hop.name}>
            <li
              className={cn(
                'flex items-baseline gap-2.5 rounded-card border px-3.5 py-3 md:min-h-[72px] md:flex-1 md:flex-col md:items-start md:gap-1',
                hop.highlight ? 'border-[#b7d8cf] bg-action-tint' : 'border-line bg-paper',
              )}
            >
              <span className="text-body font-semibold">{hop.name}</span>
              <span className="text-micro text-muted-foreground">{hop.detail}</span>
              {hop.highlight && (
                <span className="text-micro font-semibold text-action md:sr-only">Tenant checks happen here</span>
              )}
            </li>
            {i < hops.length - 1 && (
              <li aria-hidden="true" className="flex justify-center text-faint">
                <ArrowDown size={16} className="md:hidden" />
                <ArrowRight size={18} className="hidden md:block" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
      <p
        className="mt-3 hidden text-micro font-semibold text-action md:block md:pl-[calc(50%+14px)]"
        aria-hidden="true"
      >
        Tenant checks happen here
      </p>
    </figure>
  );
}

type Box = { x: number; y: number; name: string; fields: string[]; index: string; highlight?: boolean };

const boxes: Box[] = [
  { x: 24, y: 84, name: 'users', fields: ['name, email, password hash'], index: 'email unique' },
  {
    x: 266,
    y: 84,
    name: 'memberships',
    fields: ['user, organization, role'],
    index: '{user, organization} unique',
    highlight: true,
  },
  { x: 508, y: 84, name: 'organizations', fields: ['name, slug, createdBy'], index: 'slug unique' },
  {
    x: 266,
    y: 240,
    name: 'tasks',
    fields: ['title, status, priority, project,', 'organization, assignee'],
    index: '{project, status}',
  },
  {
    x: 508,
    y: 240,
    name: 'projects',
    fields: ['name, description,', 'organization, createdBy'],
    index: '{organization, createdAt}',
  },
];

const arrows: { d: string; head: string; dashed?: boolean }[] = [
  { d: 'M266 140H234', head: 'M240 134l-6 6 6 6' },
  { d: 'M474 140H506', head: 'M500 134l6 6-6 6' },
  { d: 'M612 240V198', head: 'M606 204l6-6 6 6' },
  { d: 'M474 296H506', head: 'M500 290l6 6-6 6' },
  { d: 'M266 320H128V198', head: 'M122 204l6-6 6 6' },
  { d: 'M370 352V380H724V140H718', head: 'M724 134l-6 6 6 6', dashed: true },
];

export function DataModelDiagram() {
  return (
    <figure className="rounded-panel border border-line bg-surface">
      <div className="px-5 pt-5 sm:px-6">
        <figcaption>
          <span className="block text-body font-semibold">Data model</span>
          <span className="block text-micro text-muted-foreground">
            Arrows point to the document each field references.
          </span>
        </figcaption>
      </div>
      <div
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Data model diagram, scrolls sideways on small screens"
      >
        <svg
          viewBox="0 64 740 340"
          className="block h-auto w-full min-w-[640px]"
          role="img"
          aria-label="users, memberships, organizations, projects and tasks. A membership references a user and an organization. A project references its organization. A task references its project, its assignee (a user) and a copy of its organization."
        >
          {arrows.map((a) => (
            <g
              key={a.d}
              fill="none"
              stroke={a.dashed ? 'var(--color-action)' : 'var(--color-faint)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={a.d} strokeDasharray={a.dashed ? '4 4' : undefined} />
              <path d={a.head} />
            </g>
          ))}
          {boxes.map((b) => (
            <g key={b.name}>
              <rect
                x={b.x}
                y={b.y}
                width="208"
                height="112"
                rx="8"
                fill={b.highlight ? '#fffaf0' : 'var(--color-paper)'}
                stroke={b.highlight ? '#f0d9a6' : 'var(--color-line)'}
              />
              <text x={b.x + 14} y={b.y + 28} className="fill-ink text-[15px] font-semibold">
                {b.name}
              </text>
              {b.fields.map((line, i) => (
                <text key={line} x={b.x + 14} y={b.y + 50 + i * 18} className="fill-muted-foreground text-[12.5px]">
                  {line}
                </text>
              ))}
              <text x={b.x + 14} y={b.y + 98} className="fill-faint font-mono text-[11.5px]">
                {b.index}
              </text>
            </g>
          ))}
          <text x="136" y="314" className="fill-faint text-[12px]">
            assignee
          </text>
          <text className="fill-action text-[12.5px]">
            <tspan x="24" y="352">
              Dashed: each task keeps a copy of its
            </tspan>
            <tspan x="24" y="369">
              org, a second tenant filter on every
            </tspan>
            <tspan x="24" y="386">
              task query.
            </tspan>
          </text>
        </svg>
      </div>
    </figure>
  );
}
