const Project = require('../models/Project');
const Task = require('../models/Task');
const { STATUSES } = require('../models/constants');
const mongoose = require('mongoose');
const { notFound } = require('../utils/AppError');

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

// Task creation and cascade deletion must write the same parent within their
// transaction, so a request holding an old project cannot insert after deletion.
function withProjectWrite(project, write) {
  return mongoose.connection.transaction(async (session) => {
    const current = await Project.findOneAndUpdate(
      { _id: project._id, organization: project.organization },
      { $inc: { __v: 1 } },
      { session, timestamps: false, returnDocument: 'after' },
    );
    if (!current) throw notFound('Project');
    return write(session);
  });
}

async function deleteProject(project) {
  return withProjectWrite(project, async (session) => {
    await Task.deleteMany({ project: project._id, organization: project.organization }, { session });
    await Project.deleteOne({ _id: project._id, organization: project.organization }, { session });
  });
}

module.exports = { listProjects, deleteProject, withProjectWrite };
