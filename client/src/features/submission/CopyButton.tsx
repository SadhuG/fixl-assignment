import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = { value: string; label: string; tone?: 'light' | 'dark' };

export default function CopyButton({ value, label, tone = 'light' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={cn(
        'inline-flex h-7 min-w-14 shrink-0 items-center justify-center rounded-badge border px-2 text-micro font-medium transition-colors',
        tone === 'light'
          ? 'border-line bg-surface text-muted-foreground hover:bg-sunk hover:text-ink'
          : 'border-[#3a4652] text-[#c4ccd1] hover:bg-white/10 hover:text-white',
      )}
    >
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}</span>
    </button>
  );
}
