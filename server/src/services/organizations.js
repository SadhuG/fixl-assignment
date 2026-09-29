const crypto = require('crypto');
const Organization = require('../models/Organization');
const Membership = require('../models/Membership');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { STATUSES } = require('../models/constants');
const { slugify } = require('../utils/slugify');
const { conflict } = require('../utils/AppError');

async function uniqueSlug(name) {
  const base = slugify(name);
  for (let n = 1; n <= 20; n += 1) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    if (!(await Organization.exists({ slug: candidate }))) return candidate;
  }
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

async function createOrganization(user, name) {
  // The unique index is the real guard; retry if a concurrent create took the slug.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = await uniqueSlug(name);
    try {
      const org = await Organization.create({ name, slug, createdBy: user._id });
      await Membership.create({ organization: org._id, user: user._id, role: 'ADMIN' });
      return { ...org.toJSON(), role: 'ADMIN' };
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.slug) continue;
      throw err;
    }
  }
  throw conflict('SLUG_TAKEN', 'Could not create a unique URL for this name. Try a different name.', 'name');
}

async function listMyOrganizations(userId) {
  const memberships = await Membership.find({ user: userId }).populate('organization').sort({ createdAt: 1 });
  return memberships.filter((m) => m.organization).map((m) => ({ ...m.organization.toJSON(), role: m.role }));
}

// orgId must be an ObjectId (req.org._id): aggregate pipelines don't cast strings.
async function orgStats(orgId, userId) {
  const [statusCounts, assignedToMe, recentProjects] = await Promise.all([
    Task.aggregate([{ $match: { organization: orgId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.find({ organization: orgId, assignee: userId, status: { $ne: 'DONE' } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('project', 'name'),
    Project.find({ organization: orgId }).sort({ updatedAt: -1 }).limit(5),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const { _id, count } of statusCounts) byStatus[_id] = count;
  return { byStatus, assignedToMe, recentProjects };
}

module.exports = { createOrganization, listMyOrganizations, orgStats };
