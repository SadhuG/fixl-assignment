const Membership = require('../models/Membership');
const { badRequest } = require('../utils/AppError');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isMember = (orgId, userId, session = null) =>
  Membership.exists({ organization: orgId, user: userId }).session(session);

async function assertAssignable(orgId, userId, session) {
  if (!(await isMember(orgId, userId, session))) {
    throw badRequest('The assignee must be a member of this organization', 'assignee', 'INVALID_ASSIGNEE');
  }
}

// Always starts from the loaded project's own org: filters can narrow results, never widen them.
function buildTaskFilter(project, query, userId) {
  const filter = { project: project._id, organization: project.organization };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assignee === 'me') filter.assignee = userId;
  else if (query.assignee === 'none') filter.assignee = null;
  else if (query.assignee) filter.assignee = query.assignee;
  if (query.q) filter.title = { $regex: escapeRegex(query.q), $options: 'i' };
  return filter;
}

module.exports = { assertAssignable, isMember, buildTaskFilter };
