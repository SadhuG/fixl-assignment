const orgService = require('../services/organizations');

async function listMine(req, res) {
  res.json({ data: await orgService.listMyOrganizations(req.user._id) });
}

async function create(req, res) {
  res.status(201).json(await orgService.createOrganization(req.user, req.valid.body.name));
}

function get(req, res) {
  res.json({ ...req.org.toJSON(), role: req.membership.role });
}

async function rename(req, res) {
  req.org.name = req.valid.body.name;
  await req.org.save();
  res.json({ ...req.org.toJSON(), role: req.membership.role });
}

async function stats(req, res) {
  res.json(await orgService.orgStats(req.org._id, req.user._id));
}

module.exports = { listMine, create, get, rename, stats };
