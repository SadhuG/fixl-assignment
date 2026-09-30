const memberships = require('../services/memberships');
const activity = require('../services/activity');

async function list(req, res) {
  res.json({ data: await memberships.listMembers(req.org._id) });
}

async function add(req, res) {
  const member = await memberships.addMember(req.org._id, req.valid.body);
  await activity.memberEntry(req, member, 'MEMBER_ADDED', [{ field: 'role', from: null, to: member.role }]);
  res.status(201).json(member);
}

async function changeRole(req, res) {
  const before = await memberships.listMembers(req.org._id).catch(() => []);
  const old = before.find((member) => member.id === req.params.userId);
  const member = await memberships.changeRole(req.org._id, req.params.userId, req.valid.body.role);
  if (old && old.role !== member.role) {
    await activity.memberEntry(req, member, 'MEMBER_ROLE_CHANGED', [
      { field: 'role', from: old.role, to: member.role },
    ]);
  }
  res.json(member);
}

async function remove(req, res) {
  const before = await memberships.listMembers(req.org._id).catch(() => []);
  const member = before.find((item) => item.id === req.params.userId);
  await memberships.removeMember(req.org._id, req.params.userId);
  if (member)
    await activity.memberEntry(req, member, 'MEMBER_REMOVED', [{ field: 'role', from: member.role, to: null }]);
  res.status(204).end();
}

module.exports = { list, add, changeRole, remove };
