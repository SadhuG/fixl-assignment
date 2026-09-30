import { cn } from '@/lib/utils';

export default function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', inverted ? 'text-white' : 'text-ink')}>
      {/* Same mark as public/favicon.svg. */}
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 2l12.12 7v14L16 30 3.88 23V9z" className="fill-honey" />
        <path d="M16 9.5l5.63 3.25v6.5L16 22.5l-5.63-3.25v-6.5z" className="fill-ink" />
      </svg>
      TaskHive
    </span>
  );
}
