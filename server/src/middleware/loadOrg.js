const { requireMembership } = require('../services/access');
const { isObjectId } = require('../utils/objectId');
const { notFound } = require('../utils/AppError');

async function loadOrg(req, res, next) {
  const { orgId } = req.params;
  if (!isObjectId(orgId)) throw notFound('Organization');
  const membership = await requireMembership(req.user._id, orgId, 'Organization');
  req.membership = membership;
  req.org = membership.organization;
  next();
}

module.exports = { loadOrg };
