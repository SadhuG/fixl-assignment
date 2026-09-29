import type { Member, UserRef } from '@/api/types';
import type { SelectOption } from '@/components/InlineSelect';

// Only current members are selectable. A finished task can still point at someone who
// has left the org, so that person is shown (disabled) instead of a blank select.
export function assigneeOptions(members: Member[], current: UserRef | null | undefined): SelectOption[] {
  const options: SelectOption[] = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];
  if (current && !members.some((m) => m.id === current.id)) {
    options.push({ value: current.id, label: `${current.name} (former member)`, disabled: true });
  }
  return options;
}
