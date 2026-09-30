import { useId, type ComponentProps, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

type TextFieldProps =
  | (FieldProps & { as?: 'input' } & Omit<ComponentProps<'input'>, 'className'>)
  | (FieldProps & { as: 'textarea' } & Omit<ComponentProps<'textarea'>, 'className'>)
  | (FieldProps & { as: 'select' } & Omit<ComponentProps<'select'>, 'className'>);

const CONTROL =
  'rounded-control border-line bg-surface px-3 py-2 text-body text-ink placeholder:text-muted-foreground md:text-body';
// Selects always match :read-only, so this only goes on text controls.
const READ_ONLY = 'read-only:bg-paper read-only:text-muted-foreground';

// Label, control and message wired together for screen readers.
export default function TextField(props: TextFieldProps) {
  const autoId = useId();
  const fieldId = props.id ?? autoId;
  const messageId = `${fieldId}-message`;
  const message = props.error || props.hint;
  const aria = {
    id: fieldId,
    'aria-invalid': props.error ? true : undefined,
    'aria-describedby': message ? messageId : undefined,
  };

  let control: ReactNode;
  if (props.as === 'textarea') {
    const { as: _as, label: _l, error: _e, hint: _h, className: _c, ...rest } = props;
    control = <Textarea {...rest} {...aria} className={cn(CONTROL, READ_ONLY, 'min-h-24')} />;
  } else if (props.as === 'select') {
    const { as: _as, label: _l, error: _e, hint: _h, className: _c, children, ...rest } = props;
    control = (
      <div className="relative">
        <select
          {...rest}
          {...aria}
          className={cn(
            CONTROL,
            'block h-10 w-full cursor-pointer appearance-none truncate border pr-9 outline-none open:border-ring hover:border-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive',
          )}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    );
  } else {
    const { as: _as, label: _l, error: _e, hint: _h, className: _c, ...rest } = props;
    control = <Input {...rest} {...aria} className={cn(CONTROL, READ_ONLY, 'h-10')} />;
  }

  return (
    <div className={props.className}>
      <Label htmlFor={fieldId} className="mb-1 text-small font-medium text-ink">
        {props.label}
      </Label>
      {control}
      {message && (
        <p id={messageId} className={cn('mt-1 text-small', props.error ? 'text-danger' : 'text-muted-foreground')}>
          {message}
        </p>
      )}
    </div>
  );
}
