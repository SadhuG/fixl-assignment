const Project = require('../models/Project');
const projectService = require('../services/projects');

async function list(req, res) {
  res.json({ data: await projectService.listProjects(req.org._id) });
}

async function create(req, res) {
  const project = await Project.create({ ...req.valid.body, organization: req.org._id, createdBy: req.user._id });
  await project.populate('createdBy', 'name');
  res.status(201).json(project);
}

async function get(req, res) {
  await req.project.populate('createdBy', 'name');
  res.json(req.project);
}

async function update(req, res) {
  req.project.set(req.valid.body);
  await req.project.save();
  await req.project.populate('createdBy', 'name');
  res.json(req.project);
}

async function remove(req, res) {
  await projectService.deleteProject(req.project);
  res.status(204).end();
}

module.exports = { list, create, get, update, remove };
