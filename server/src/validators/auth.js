const { z } = require('zod');
const { email } = require('./common');

const registerBody = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
  email,
  // bcrypt ignores bytes after 72, so longer passwords would silently collide.
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
});

const loginBody = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(200),
});

module.exports = { registerBody, loginBody };
