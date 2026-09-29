const { badRequest } = require('../utils/AppError');

const MAX_DEPTH = 20;

function hasOperatorKey(value, depth = 0) {
  if (value === null || typeof value !== 'object') return false;
  if (depth > MAX_DEPTH) return true;
  return Object.entries(value).some(
    ([key, child]) => key.startsWith('$') || key.includes('.') || hasOperatorKey(child, depth + 1),
  );
}

// Defence in depth against NoSQL operator injection; Zod type checks are the first line.
function rejectOperators(req, res, next) {
  if (hasOperatorKey(req.body)) return next(badRequest('Field names may not start with "$" or contain "."'));
  next();
}

module.exports = { rejectOperators };
