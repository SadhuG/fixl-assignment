const crypto = require('crypto');
const Organization = require('../models/Organization');
const Membership = require('../models/Membership');
const { slugify } = require('../utils/slugify');
const { conflict } = require('../utils/AppError');

async function uniqueSlug(name) {
  const base = slugify(name);
  for (let n = 1; n <= 20; n += 1) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    if (!(await Organization.exists({ slug: candidate }))) return candidate;
  }
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

async function createOrganization(user, name) {
  // The unique index is the real guard; retry if a concurrent create took the slug.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = await uniqueSlug(name);
    try {
      const org = await Organization.create({ name, slug, createdBy: user._id });
      await Membership.create({ organization: org._id, user: user._id, role: 'ADMIN' });
      return { ...org.toJSON(), role: 'ADMIN' };
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.slug) continue;
      throw err;
    }
  }
  throw conflict('SLUG_TAKEN', 'Could not create a unique URL for this name. Try a different name.', 'name');
}

async function listMyOrganizations(userId) {
  const memberships = await Membership.find({ user: userId }).populate('organization').sort({ createdAt: 1 });
  return memberships.filter((m) => m.organization).map((m) => ({ ...m.organization.toJSON(), role: m.role }));
}

module.exports = { createOrganization, listMyOrganizations };
