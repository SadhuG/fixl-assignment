import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/api/client';

// Maps the API's details[] onto React Hook Form fields; returns false if nothing matched.
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (!(error instanceof ApiError)) return false;
  let applied = false;
  for (const detail of error.details) {
    const field = fields.find((f) => f === detail.field);
    if (!field) continue;
    setError(field, { type: 'server', message: detail.message }, { shouldFocus: !applied });
    applied = true;
  }
  return applied;
}
