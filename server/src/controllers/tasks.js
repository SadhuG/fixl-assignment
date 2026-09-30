const Task = require('../models/Task');
const { assertAssignable, isMember, buildTaskFilter } = require('../services/tasks');
const activity = require('../services/activity');

const POPULATE = [
  { path: 'assignee', select: 'name email' },
  { path: 'createdBy', select: 'name' },
];

async function list(req, res) {
  const filter = buildTaskFilter(req.project, req.valid.query, req.user._id);
  const tasks = await Task.find(filter).sort({ createdAt: -1, _id: -1 }).populate(POPULATE);
  res.json({ data: tasks });
}

async function create(req, res) {
  const body = req.valid.body;
  if (body.assignee) await assertAssignable(req.project.organization, body.assignee);
  const task = await Task.create({
    ...body,
    project: req.project._id,
    organization: req.project.organization,
    createdBy: req.user._id,
  });
  await task.populate(POPULATE);
  await activity.taskEntry(req, task, 'TASK_CREATED');
  res.status(201).json(task);
}

async function update(req, res) {
  const body = req.valid.body;
  const before = req.task.toObject();
  if (body.assignee) await assertAssignable(req.task.organization, body.assignee);
  req.task.set(body);
  // Removing a member leaves them on their DONE tasks; reopening one must not keep a non-member assigned.
  const { task } = req;
  if (
    task.status !== 'DONE' &&
    task.assignee &&
    !('assignee' in body) &&
    !(await isMember(task.organization, task.assignee))
  ) {
    task.assignee = null;
  }
  await req.task.save();
  const changes = activity.changedFields(before, req.task, ['title', 'status', 'priority', 'assignee', 'dueDate']);
  if (changes.length) await activity.taskEntry(req, req.task, 'TASK_UPDATED', changes);
  await req.task.populate(POPULATE);
  res.json(req.task);
}

async function remove(req, res) {
  await Task.deleteOne({ _id: req.task._id, organization: req.task.organization });
  await activity.taskEntry(req, req.task, 'TASK_DELETED');
  res.status(204).end();
}

module.exports = { list, create, update, remove };
