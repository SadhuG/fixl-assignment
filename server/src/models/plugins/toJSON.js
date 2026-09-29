// One JSON shape for every model: string `id`, no `_id`, `__v` or password hash.
function toJSON(schema) {
  schema.set('toJSON', {
    versionKey: false,
    transform(doc, ret) {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    },
  });
}

module.exports = { toJSON };
