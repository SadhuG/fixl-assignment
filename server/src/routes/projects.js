const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { loadProject } = require('../middleware/loadProject');
const { requireRole, requireAdminOrCreator } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { createProjectBody, updateProjectBody } = require('../validators/projects');
const projects = require('../controllers/projects');
const { createTaskBody, listTasksQuery } = require('../validators/tasks');
const tasks = require('../controllers/tasks');

// Collection routes: mounted under /organizations/:orgId/projects after authenticate + loadOrg.
const orgProjectsRouter = express.Router({ mergeParams: true });
orgProjectsRouter.get('/', projects.list);
orgProjectsRouter.post('/', validate({ body: createProjectBody }), projects.create);

// Single-resource routes: /projects/:projectId; the org is derived from the project itself.
const projectsRouter = express.Router();
projectsRouter.use(authenticate);
projectsRouter.get('/:projectId', loadProject, projects.get);
projectsRouter.patch(
  '/:projectId',
  loadProject,
  requireAdminOrCreator('project'),
  validate({ body: updateProjectBody }),
  projects.update,
);
projectsRouter.delete('/:projectId', loadProject, requireRole('ADMIN'), projects.remove);
// Task routes nested under a project are added below this line.
projectsRouter.get('/:projectId/tasks', loadProject, validate({ query: listTasksQuery }), tasks.list);
projectsRouter.post('/:projectId/tasks', loadProject, validate({ body: createTaskBody }), tasks.create);

module.exports = { orgProjectsRouter, projectsRouter };
