import { z } from 'zod';

const email = z.string().trim().min(1, 'Enter your email').email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'Enter your password')
    .refine((password) => new TextEncoder().encode(password).length <= 72, 'Password must be 72 UTF-8 bytes or fewer'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80, 'Name must be 80 characters or fewer'),
  email,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((password) => new TextEncoder().encode(password).length <= 72, 'Password must be 72 UTF-8 bytes or fewer'),
});
export type RegisterValues = z.infer<typeof registerSchema>;
