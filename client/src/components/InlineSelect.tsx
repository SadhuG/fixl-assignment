import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface InlineSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

// A native <select> gives keyboard, screen-reader and mobile picker support for free.
export default function InlineSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  icon,
  disabled = false,
  className,
}: InlineSelectProps<T>) {
  return (
    <label
      className={cn(
        'relative inline-flex h-10 items-center gap-1.5 rounded-control border border-line bg-surface pl-2 text-small focus-within:ring-2 focus-within:ring-action hover:border-faint has-[select:open]:border-action sm:h-8',
        disabled && 'opacity-60',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      {icon}
      {/* Invisible copies of every label keep the control as wide as its longest option, so rows line up
          even where a customizable select would shrink to the current value. */}
      <span className="inline-grid h-full min-w-0">
        {options.map((option) => (
          <span key={option.value} aria-hidden="true" className="invisible col-start-1 row-start-1 h-0 truncate pr-6">
            {option.label}
          </span>
        ))}
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as T)}
          className="col-start-1 row-start-1 h-full min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-6 outline-none disabled:cursor-not-allowed"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
      <ChevronDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 text-muted-foreground"
      />
    </label>
  );
}
