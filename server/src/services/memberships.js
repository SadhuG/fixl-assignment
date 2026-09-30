const Membership = require('../models/Membership');
const User = require('../models/User');
const Task = require('../models/Task');
const Organization = require('../models/Organization');
const mongoose = require('mongoose');
const { AppError, conflict, notFound } = require('../utils/AppError');
const { isObjectId } = require('../utils/objectId');

const LAST_ADMIN = 'An organization needs at least one admin. Make someone else an admin first.';

const toMember = (user, membership) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: membership.role,
  joinedAt: membership.createdAt,
});

async function listMembers(orgId) {
  const memberships = await Membership.find({ organization: orgId })
    .populate('user', 'name email')
    .sort({ createdAt: 1, _id: 1 });
  return memberships.filter((m) => m.user).map((m) => toMember(m.user, m));
}

async function addMember(orgId, { email, role }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'No TaskHive account uses this email. Ask them to register first.', [
      { field: 'email', message: 'No account uses this email' },
    ]);
  }
  const alreadyMember = () => conflict('ALREADY_MEMBER', 'This person is already a member', 'email');
  if (await Membership.exists({ organization: orgId, user: user._id })) throw alreadyMember();
  try {
    const membership = await Membership.create({ organization: orgId, user: user._id, role });
    return toMember(user, membership);
  } catch (err) {
    // A concurrent add won the race past the pre-check; the unique index catches it.
    if (err.code === 11000) throw alreadyMember();
    throw err;
  }
}

async function findMembership(orgId, userId, session) {
  if (!isObjectId(userId)) throw notFound('Member');
  const membership = await Membership.findOne({ organization: orgId, user: userId })
    .session(session)
    .populate('user', 'name email');
  if (!membership || !membership.user) throw notFound('Member');
  return membership;
}

// A shared document write prevents snapshot-isolation write skew between different
// memberships. Conflicting transactions retry and read the newly committed roles.
function withMembershipWrite(orgId, write) {
  return mongoose.connection.transaction(async (session) => {
    const result = await Organization.updateOne({ _id: orgId }, { $inc: { __v: 1 } }, { session, timestamps: false });
    if (!result.matchedCount) throw notFound('Organization');
    return write(session);
  });
}

async function changeRole(orgId, userId, role) {
  return withMembershipWrite(orgId, async (session) => {
    const membership = await findMembership(orgId, userId, session);
    if (membership.role === role) return toMember(membership.user, membership);
    if (
      membership.role === 'ADMIN' &&
      (await Membership.countDocuments({ organization: orgId, role: 'ADMIN' }).session(session)) <= 1
    ) {
      throw conflict('LAST_ADMIN', LAST_ADMIN, 'role');
    }
    membership.role = role;
    await membership.save({ session });
    return toMember(membership.user, membership);
  });
}

async function removeMember(orgId, userId) {
  return withMembershipWrite(orgId, async (session) => {
    const membership = await findMembership(orgId, userId, session);
    if (
      membership.role === 'ADMIN' &&
      (await Membership.countDocuments({ organization: orgId, role: 'ADMIN' }).session(session)) <= 1
    ) {
      throw conflict('LAST_ADMIN', LAST_ADMIN, 'role');
    }
    await Membership.deleteOne({ _id: membership._id }, { session });
    // Open work goes back to the pool; finished tasks keep who did them.
    await Task.updateMany(
      { organization: orgId, assignee: membership.user._id, status: { $ne: 'DONE' } },
      { $set: { assignee: null } },
      { session },
    );
  });
}

module.exports = { listMembers, addMember, changeRole, removeMember };
