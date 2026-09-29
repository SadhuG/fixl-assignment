const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { env } = require('../config/env');
const { conflict, unauthorized } = require('../utils/AppError');

// Compared against when the email is unknown, so both failure paths take similar time.
const DUMMY_HASH = bcrypt.hashSync('taskhive-timing-equaliser', env.bcryptCost);

async function register({ name, email, password }) {
  if (await User.exists({ email })) {
    throw conflict('EMAIL_TAKEN', 'An account with this email already exists', 'email');
  }
  const passwordHash = await bcrypt.hash(password, env.bcryptCost);
  return User.create({ name, email, passwordHash });
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) throw unauthorized('Incorrect email or password');
  return user;
}

module.exports = { register, login };
