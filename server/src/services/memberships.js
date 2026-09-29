const Membership = require('../models/Membership');
const User = require('../models/User');
const Task = require('../models/Task');
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
  if (await Membership.exists({ organization: orgId, user: user._id })) {
    throw conflict('ALREADY_MEMBER', 'This person is already a member', 'email');
  }
  const membership = await Membership.create({ organization: orgId, user: user._id, role });
  return toMember(user, membership);
}

async function findMembership(orgId, userId) {
  if (!isObjectId(userId)) throw notFound('Member');
  const membership = await Membership.findOne({ organization: orgId, user: userId }).populate('user', 'name email');
  if (!membership || !membership.user) throw notFound('Member');
  return membership;
}

const countAdmins = (orgId) => Membership.countDocuments({ organization: orgId, role: 'ADMIN' });

// The pre-check gives a clean 409. The recount after writing catches two admins demoting
// each other at the same moment, which both pass the pre-check.
async function undoIfNoAdminLeft(orgId, undo) {
  if ((await countAdmins(orgId)) > 0) return;
  await undo();
  throw conflict('LAST_ADMIN', LAST_ADMIN, 'role');
}

async function changeRole(orgId, userId, role) {
  const membership = await findMembership(orgId, userId);
  if (membership.role === role) return toMember(membership.user, membership);

  const demoting = membership.role === 'ADMIN';
  if (demoting && (await countAdmins(orgId)) <= 1) throw conflict('LAST_ADMIN', LAST_ADMIN, 'role');

  membership.role = role;
  await membership.save();
  if (demoting) await undoIfNoAdminLeft(orgId, () => Membership.updateOne({ _id: membership._id }, { role: 'ADMIN' }));
  return toMember(membership.user, membership);
}

async function removeMember(orgId, userId) {
  const membership = await findMembership(orgId, userId);
  const wasAdmin = membership.role === 'ADMIN';
  if (wasAdmin && (await countAdmins(orgId)) <= 1) throw conflict('LAST_ADMIN', LAST_ADMIN, 'role');

  await Membership.deleteOne({ _id: membership._id });
  if (wasAdmin) {
    await undoIfNoAdminLeft(orgId, () =>
      Membership.create({ organization: orgId, user: membership.user._id, role: 'ADMIN' }),
    );
  }
  // Open work goes back to the pool; finished tasks keep who did them.
  await Task.updateMany(
    { organization: orgId, assignee: membership.user._id, status: { $ne: 'DONE' } },
    { $set: { assignee: null } },
  );
}

module.exports = { listMembers, addMember, changeRole, removeMember };
