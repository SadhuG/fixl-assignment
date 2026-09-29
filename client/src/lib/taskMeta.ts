import type { Priority, Status } from '@/api/types';

export const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const satisfies readonly Status[];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const satisfies readonly Priority[];
export const STATUS_LABEL: Record<Status, string> = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' };
export const PRIORITY_LABEL: Record<Priority, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
export const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }));
