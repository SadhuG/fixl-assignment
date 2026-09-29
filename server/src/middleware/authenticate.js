const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');
const { COOKIE_NAME } = require('../utils/authCookie');
const { unauthorized } = require('../utils/AppError');

async function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw unauthorized('Your session has ended. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw unauthorized('Your session has ended. Please log in again.');
  req.user = user;
  next();
}

module.exports = { authenticate };
