const Project = require('../models/Project');
const projectService = require('../services/projects');
const activity = require('../services/activity');

async function list(req, res) {
  res.json({ data: await projectService.listProjects(req.org._id) });
}

async function create(req, res) {
  const project = await Project.create({ ...req.valid.body, organization: req.org._id, createdBy: req.user._id });
  await project.populate('createdBy', 'name');
  await activity.projectEntry(req, project, 'PROJECT_CREATED');
  res.status(201).json(project);
}

async function get(req, res) {
  await req.project.populate('createdBy', 'name');
  res.json(req.project);
}

async function update(req, res) {
  const before = req.project.toObject();
  req.project.set(req.valid.body);
  await req.project.save();
  const changes = activity.changedFields(before, req.project, ['name', 'description']);
  if (changes.length) await activity.projectEntry(req, req.project, 'PROJECT_UPDATED', changes);
  await req.project.populate('createdBy', 'name');
  res.json(req.project);
}

async function remove(req, res) {
  await projectService.deleteProject(req.project);
  await activity.projectEntry(req, req.project, 'PROJECT_DELETED');
  res.status(204).end();
}

module.exports = { list, create, get, update, remove };
