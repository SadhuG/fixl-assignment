// Stricter than mongoose.isValidObjectId, which also accepts any 12-character string.
const isObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

module.exports = { isObjectId };
