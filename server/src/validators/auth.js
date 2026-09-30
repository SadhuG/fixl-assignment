const { z } = require('zod');
const { email } = require('./common');

const registerBody = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
  email,
  // bcrypt ignores bytes after 72, so longer passwords would silently collide.
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, 'Password must be 72 UTF-8 bytes or fewer'),
});

const loginBody = z.object({
  email,
  password: z
    .string()
    .min(1, 'Password is required')
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, 'Password must be 72 UTF-8 bytes or fewer'),
});

module.exports = { registerBody, loginBody };
