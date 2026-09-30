const Activity = require('../models/Activity');
const Project = require('../models/Project');
const User = require('../models/User');

async function record(entry) {
  try {
    await Activity.create(entry);
  } catch {
    // An audit insert is best effort; the completed user action must still succeed.
  }
}

const value = (input) =>
  input == null ? null : input instanceof Date ? input.toISOString().slice(0, 10) : String(input);

function changedFields(before, after, fields) {
  return fields
    .filter((field) => value(before[field]) !== value(after[field]))
    .map((field) => ({
      field,
      from: value(before[field]),
      to: value(after[field]),
    }));
}

async function taskEntry(req, task, action, changes = []) {
  try {
    const project = await Project.findOne({ _id: task.project, organization: task.organization }).select('name');
    const assigneeChange = changes.find((change) => change.field === 'assignee');
    if (assigneeChange) {
      const ids = [assigneeChange.from, assigneeChange.to].filter(Boolean);
      const users = await User.find({ _id: { $in: ids } }).select('name');
      const names = new Map(users.map((user) => [String(user._id), user.name]));
      assigneeChange.from = assigneeChange.from ? (names.get(assigneeChange.from) ?? assigneeChange.from) : null;
      assigneeChange.to = assigneeChange.to ? (names.get(assigneeChange.to) ?? assigneeChange.to) : null;
    }
    await record({
      organization: task.organization,
      project: task.project,
      task: task._id,
      actor: req.user._id,
      actorName: req.user.name,
      projectName: project?.name ?? null,
      taskTitle: task.title,
      action,
      changes,
    });
  } catch {
    // Snapshot lookup is also best effort.
  }
}

async function projectEntry(req, project, action, changes = []) {
  await record({
    organization: project.organization,
    project: project._id,
    actor: req.user._id,
    actorName: req.user.name,
    projectName: project.name,
    action,
    changes,
  });
}

async function memberEntry(req, member, action, changes = []) {
  await record({
    organization: req.org._id,
    actor: req.user._id,
    actorName: req.user.name,
    memberName: member.name,
    action,
    changes,
  });
}

async function listOrg(req, res) {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 50 ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid activity pagination' } });
  }
  const filter = { organization: req.org._id };
  const [data, total] = await Promise.all([
    Activity.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Activity.countDocuments(filter),
  ]);
  res.json({ data, page, limit, total });
}

async function listTask(req, res) {
  const data = await Activity.find({ organization: req.task.organization, task: req.task._id }).sort({
    createdAt: -1,
    _id: -1,
  });
  res.json({ data });
}

module.exports = { record, changedFields, taskEntry, projectEntry, memberEntry, listOrg, listTask };
