const { z } = require('zod');
const { objectId } = require('./common');
const { STATUSES, PRIORITIES } = require('../models/constants');

const title = z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer');
const description = z.string().trim().max(5000, 'Description must be 5,000 characters or fewer');
const status = z.enum(STATUSES);
const priority = z.enum(PRIORITIES);
const assignee = objectId.nullable();
const dueDate = z.iso.date().nullable();

const createTaskBody = z.object({
  title,
  description: description.optional(),
  status: status.optional(),
  priority: priority.optional(),
  assignee: assignee.optional(),
  dueDate: dueDate.optional(),
});

// No defaults on update: omitted fields stay as they are.
const updateTaskBody = z
  .object({
    title: title.optional(),
    description: description.optional(),
    status: status.optional(),
    priority: priority.optional(),
    assignee: assignee.optional(),
    dueDate: dueDate.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'Provide at least one field to update' });

const listTasksQuery = z.object({
  status: status.optional(),
  priority: priority.optional(),
  assignee: z.union([objectId, z.literal('me'), z.literal('none')]).optional(),
  q: z.string().trim().max(100).optional(),
});

module.exports = { createTaskBody, updateTaskBody, listTasksQuery };
