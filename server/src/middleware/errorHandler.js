const mongoose = require('mongoose');
const { ZodError } = require('zod');
const { AppError, notFound } = require('../utils/AppError');
const { env } = require('../config/env');

function send(res, status, code, message, details) {
  const error = { code, message };
  if (details && details.length) error.details = details;
  return res.status(status).json({ error });
}

function notFoundHandler(req, res, next) {
  next(notFound('Route'));
}

// Express recognises error handlers by their four parameters; keep `next`.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) return send(res, err.status, err.code, err.message, err.details);
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return send(res, 400, 'VALIDATION_ERROR', 'Some fields are invalid', details);
  }
  if (err instanceof mongoose.Error.CastError) return send(res, 404, 'NOT_FOUND', 'Resource not found');
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return send(res, 400, 'VALIDATION_ERROR', 'Some fields are invalid', details);
  }
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return send(
      res,
      409,
      'CONFLICT',
      'That value is already in use',
      field ? [{ field, message: 'Already in use' }] : undefined,
    );
  }
  if (err && err.type === 'entity.parse.failed')
    return send(res, 400, 'VALIDATION_ERROR', 'Request body is not valid JSON');
  if (err && err.type === 'entity.too.large') return send(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');

  if (env.nodeEnv !== 'test') console.error(err);
  return send(res, 500, 'INTERNAL_ERROR', env.isProd ? 'Something went wrong' : String(err && err.message));
}

module.exports = { errorHandler, notFoundHandler };
