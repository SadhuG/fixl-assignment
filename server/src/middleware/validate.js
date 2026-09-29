// Express 5 makes req.query read-only, so parsed values live on req.valid.
function validate(schemas) {
  return (req, res, next) => {
    req.valid = req.valid || {};
    for (const key of ['body', 'query']) {
      if (!schemas[key]) continue;
      const result = schemas[key].safeParse(req[key] ?? {});
      if (!result.success) return next(result.error);
      req.valid[key] = result.data;
    }
    next();
  };
}

module.exports = { validate };
