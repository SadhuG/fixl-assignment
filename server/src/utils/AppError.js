class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const fieldDetails = (field, message) => (field ? [{ field, message }] : undefined);

const badRequest = (message, field, code = 'VALIDATION_ERROR') =>
  new AppError(400, code, message, fieldDetails(field, message));
const unauthorized = (message = 'Please log in to continue') => new AppError(401, 'UNAUTHENTICATED', message);
const forbidden = (message = 'You do not have permission to do this') => new AppError(403, 'FORBIDDEN', message);
const notFound = (resource = 'Resource') => new AppError(404, 'NOT_FOUND', `${resource} not found`);
const conflict = (code, message, field) => new AppError(409, code, message, fieldDetails(field, message));

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict };
