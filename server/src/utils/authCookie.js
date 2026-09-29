const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const COOKIE_NAME = 'th_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// SameSite=Lax is enough because Vercel proxies /api, so the cookie is first-party.
const cookieOptions = () => ({ httpOnly: true, secure: env.isProd, sameSite: 'lax', path: '/' });

function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, env.jwtSecret, { algorithm: 'HS256', expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: MAX_AGE_MS });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
