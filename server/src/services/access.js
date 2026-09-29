const Membership = require('../models/Membership');
const { notFound } = require('../utils/AppError');

// The single tenant gate. Callers pass the org id read from the database (or the URL for
// /organizations/:orgId); a missing org and a foreign org produce the same 404.
async function requireMembership(userId, orgId, resourceName) {
  const membership = await Membership.findOne({ user: userId, organization: orgId }).populate('organization');
  if (!membership || !membership.organization) throw notFound(resourceName);
  return membership;
}

module.exports = { requireMembership };
