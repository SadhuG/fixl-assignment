const { z } = require('zod');

const name = z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer');
const description = z.string().trim().max(1000, 'Description must be 1,000 characters or fewer');

const createProjectBody = z.object({ name, description: description.optional() });

// Written separately with no defaults, so a partial update never resets fields it omits.
const updateProjectBody = z
  .object({ name: name.optional(), description: description.optional() })
  .refine((body) => Object.keys(body).length > 0, { message: 'Provide at least one field to update' });

module.exports = { createProjectBody, updateProjectBody };
