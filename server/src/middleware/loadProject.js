const Project = require('../models/Project');
const { requireMembership } = require('../services/access');
const { isObjectId } = require('../utils/objectId');
const { notFound } = require('../utils/AppError');

async function loadProject(req, res, next) {
  const { projectId } = req.params;
  if (!isObjectId(projectId)) throw notFound('Project');
  const project = await Project.findById(projectId);
  if (!project) throw notFound('Project');
  // The tenant comes from the stored project, never from the URL or body.
  const membership = await requireMembership(req.user._id, project.organization, 'Project');
  req.project = project;
  req.membership = membership;
  req.org = membership.organization;
  next();
}

module.exports = { loadProject };
