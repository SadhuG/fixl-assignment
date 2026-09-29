const Project = require('../models/Project');
const Task = require('../models/Task');
const { STATUSES } = require('../models/constants');

const emptyCounts = () => Object.fromEntries(STATUSES.map((s) => [s, 0]));

// orgId must be an ObjectId (req.org._id): aggregate pipelines don't cast strings.
async function listProjects(orgId) {
  const [projects, counts] = await Promise.all([
    Project.find({ organization: orgId }).sort({ createdAt: -1, _id: -1 }).populate('createdBy', 'name'),
    Task.aggregate([
      { $match: { organization: orgId } },
      { $group: { _id: { project: '$project', status: '$status' }, count: { $sum: 1 } } },
    ]),
  ]);

  const byProject = new Map();
  for (const { _id, count } of counts) {
    const key = String(_id.project);
    if (!byProject.has(key)) byProject.set(key, emptyCounts());
    byProject.get(key)[_id.status] = count;
  }
  return projects.map((p) => ({ ...p.toJSON(), taskCounts: byProject.get(String(p._id)) ?? emptyCounts() }));
}

// No transaction (standalone Mongo in dev/tests): delete tasks first so a partial failure
// leaves an empty project, never orphaned tasks, and a retry finishes the job.
async function deleteProject(project) {
  await Task.deleteMany({ project: project._id, organization: project.organization });
  await Project.deleteOne({ _id: project._id, organization: project.organization });
}

module.exports = { listProjects, deleteProject };
