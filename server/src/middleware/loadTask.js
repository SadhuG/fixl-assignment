const Task = require('../models/Task');
const { requireMembership } = require('../services/access');
const { isObjectId } = require('../utils/objectId');
const { notFound } = require('../utils/AppError');

async function loadTask(req, res, next) {
  const { taskId } = req.params;
  if (!isObjectId(taskId)) throw notFound('Task');
  const task = await Task.findById(taskId);
  if (!task) throw notFound('Task');
  const membership = await requireMembership(req.user._id, task.organization, 'Task');
  req.task = task;
  req.membership = membership;
  req.org = membership.organization;
  next();
}

module.exports = { loadTask };
