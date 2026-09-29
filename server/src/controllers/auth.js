const authService = require('../services/auth');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');

async function register(req, res) {
  const user = await authService.register(req.valid.body);
  setAuthCookie(res, user._id);
  res.status(201).json(user);
}

async function login(req, res) {
  const user = await authService.login(req.valid.body);
  setAuthCookie(res, user._id);
  res.json(user);
}

function logout(req, res) {
  clearAuthCookie(res);
  res.status(204).end();
}

function me(req, res) {
  res.json(req.user);
}

module.exports = { register, login, logout, me };
