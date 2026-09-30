import { Minus, Plus } from 'lucide-react';
import type { TestArea } from './content';
import Inline from './Inline';

function AreaTable({ area }: { area: TestArea }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-panel border border-line bg-surface md:block">
        <table className="w-full border-collapse text-left text-small">
          <thead className="bg-[#f7f9f8] text-micro font-medium text-muted-foreground">
            <tr>
              {area.columns.map((col) => (
                <th key={col} scope="col" className="px-4 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {area.rows.map((row) => (
              <tr key={row[0]} className="border-t border-line-soft align-top">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="w-[26%] px-4 py-3 font-medium text-ink">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="px-4 py-3 text-muted-foreground">
                      <Inline text={cell} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-2.5 md:hidden">
        {area.rows.map((row) => (
          <li key={row[0]} className="rounded-card border border-line bg-surface p-4">
            <p className="text-small font-semibold">{row[0]}</p>
            <dl className="mt-2 flex flex-col gap-2">
              {row.slice(1).map((cell, i) => (
                <div key={i}>
                  <dt className="text-micro text-faint">{area.columns[i + 1]}</dt>
                  <dd className="text-small text-muted-foreground">
                    <Inline text={cell} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function TestAreas({ areas }: { areas: TestArea[] }) {
  return (
    <div className="border-t border-[#8b9695]">
      {areas.map((area) => (
        <details key={area.title} className="group border-b border-[#8b9695]">
          <summary className="flex cursor-pointer list-none items-center gap-5 py-5 sm:py-6 [&::-webkit-details-marker]:hidden">
            <h3 className="flex-1 text-[17px] font-semibold sm:text-[19px]">{area.title}</h3>
            <span className="hidden text-small text-muted-foreground sm:inline">{area.brief}</span>
            <span className="hidden text-small text-muted-foreground sm:inline">{area.countLabel}</span>
            <Plus size={20} className="shrink-0 text-action group-open:hidden" aria-hidden="true" />
            <Minus size={20} className="hidden shrink-0 text-action group-open:block" aria-hidden="true" />
          </summary>
          <div className="flex flex-col gap-4 pb-8">
            <p className="text-micro text-muted-foreground sm:hidden">
              {area.brief}, {area.countLabel}
            </p>
            {area.quote && (
              <blockquote className="rounded-card border-l-[3px] border-honey bg-paper px-4.5 py-3.5 text-body">
                {area.quote}
              </blockquote>
            )}
            {area.intro && <p className="text-body text-muted-foreground">{area.intro}</p>}
            <AreaTable area={area} />
            {area.note && (
              <p className="text-small text-muted-foreground">
                <Inline text={area.note} />
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
