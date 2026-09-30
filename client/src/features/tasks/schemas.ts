import { z } from 'zod';
import { PRIORITIES, STATUSES } from '@/lib/taskMeta';

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title').max(200, 'Title must be 200 characters or fewer'),
  description: z.string().trim().max(5000, 'Description must be 5,000 characters or fewer'),
  status: z.enum(STATUSES),
  priority: z.enum(PRIORITIES),
  assignee: z.string(),
  dueDate: z.string(),
});
export type TaskValues = z.infer<typeof taskSchema>;
