import { cn } from '@/lib/utils';

export default function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', inverted ? 'text-white' : 'text-ink')}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" className="fill-honey" />
      </svg>
      TaskHive
    </span>
  );
}
