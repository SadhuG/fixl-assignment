const { forbidden } = require('../utils/AppError');

const requireRole = (role) => (req, res, next) => {
  if (req.membership?.role !== role) throw forbidden(`Only organization ${role.toLowerCase()}s can do this`);
  next();
};

// For "ADMIN or the person who created it" rules on projects and tasks.
const requireAdminOrCreator = (reqKey) => (req, res, next) => {
  const resource = req[reqKey];
  const creatorId = resource.createdBy?._id ?? resource.createdBy;
  if (req.membership.role === 'ADMIN' || String(creatorId) === String(req.user._id)) return next();
  throw forbidden(`Only admins or the ${reqKey}'s creator can do this`);
};

module.exports = { requireRole, requireAdminOrCreator };
