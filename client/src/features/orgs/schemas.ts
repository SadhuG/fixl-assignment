import { z } from 'zod';

export const orgSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(80, 'Name must be 80 characters or fewer'),
});
export type OrgValues = z.infer<typeof orgSchema>;
