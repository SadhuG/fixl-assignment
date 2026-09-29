import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(100, 'Name must be 100 characters or fewer'),
  description: z.string().trim().max(1000, 'Description must be 1,000 characters or fewer'),
});
export type ProjectValues = z.infer<typeof projectSchema>;
