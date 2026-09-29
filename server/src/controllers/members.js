const memberships = require('../services/memberships');

async function list(req, res) {
  res.json({ data: await memberships.listMembers(req.org._id) });
}

async function add(req, res) {
  res.status(201).json(await memberships.addMember(req.org._id, req.valid.body));
}

async function changeRole(req, res) {
  res.json(await memberships.changeRole(req.org._id, req.params.userId, req.valid.body.role));
}

async function remove(req, res) {
  await memberships.removeMember(req.org._id, req.params.userId);
  res.status(204).end();
}

module.exports = { list, add, changeRole, remove };
