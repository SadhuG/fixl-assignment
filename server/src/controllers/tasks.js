const Task = require('../models/Task');
const { assertAssignable, buildTaskFilter } = require('../services/tasks');

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
  res.status(201).json(task);
}

async function update(req, res) {
  const body = req.valid.body;
  if (body.assignee) await assertAssignable(req.task.organization, body.assignee);
  req.task.set(body);
  await req.task.save();
  await req.task.populate(POPULATE);
  res.json(req.task);
}

async function remove(req, res) {
  await Task.deleteOne({ _id: req.task._id, organization: req.task.organization });
  res.status(204).end();
}

module.exports = { list, create, update, remove };
