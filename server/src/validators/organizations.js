const { z } = require('zod');
const { email } = require('./common');
const { ROLES } = require('../models/constants');

const orgBody = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
});

const memberAddBody = z.object({ email, role: z.enum(ROLES).default('MEMBER') });
const memberRoleBody = z.object({ role: z.enum(ROLES) });

module.exports = { orgBody, memberAddBody, memberRoleBody };
