const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { env } = require('../src/config/env');
const { connectDb } = require('../src/config/db');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Membership = require('../src/models/Membership');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

const PASSWORD = process.env.SEED_PASSWORD || 'TaskHive#2026';

const USERS = [
  { key: 'demo', name: 'Dana Demo', email: 'demo@taskhive.dev' },
  { key: 'alice', name: 'Alice Chen', email: 'alice@taskhive.dev' },
  { key: 'bob', name: 'Bob Okafor', email: 'bob@taskhive.dev' },
];

// [title, status, priority, assigneeKey | null]
const ORGS = [
  {
    name: 'Acme Inc.',
    slug: 'acme-inc',
    owner: 'demo',
    members: { demo: 'ADMIN', alice: 'MEMBER' },
    projects: [
      {
        name: 'Website Redesign',
        description: 'Refresh the marketing site: new IA, faster pages, accessible components.',
        tasks: [
          ['Audit current site analytics', 'DONE', 'MEDIUM', 'alice'],
          ['Draft new information architecture', 'DONE', 'HIGH', 'demo'],
          ['Design homepage hero variants', 'IN_PROGRESS', 'HIGH', 'alice'],
          ['Build responsive navigation', 'IN_PROGRESS', 'MEDIUM', 'demo'],
          ['Write accessibility checklist', 'TODO', 'LOW', null],
          ['Migrate blog content', 'TODO', 'MEDIUM', 'alice'],
          ['Set up redirects for old URLs', 'TODO', 'HIGH', null],
        ],
      },
      {
        name: 'Q4 Marketing',
        description: 'Campaigns, events and content for the last quarter.',
        tasks: [
          ['Finalize Q4 campaign budget', 'DONE', 'HIGH', 'demo'],
          ['Brief the design agency', 'IN_PROGRESS', 'MEDIUM', 'demo'],
          ['Plan webinar series', 'TODO', 'MEDIUM', 'alice'],
          ['Draft launch email sequence', 'TODO', 'HIGH', 'alice'],
          ['Update case study library', 'IN_PROGRESS', 'LOW', null],
          ['Book booth for DevConf', 'DONE', 'LOW', 'demo'],
        ],
      },
    ],
  },
  {
    name: 'Beta Labs',
    slug: 'beta-labs',
    owner: 'bob',
    members: { bob: 'ADMIN', demo: 'MEMBER' },
    projects: [
      {
        name: 'Mobile Application',
        description: 'Cross-platform app for field teams, offline first.',
        tasks: [
          ['Set up React Native project', 'DONE', 'HIGH', 'bob'],
          ['Implement login screen', 'DONE', 'MEDIUM', 'demo'],
          ['Offline sync spike', 'IN_PROGRESS', 'HIGH', 'bob'],
          ['Push notification permissions flow', 'IN_PROGRESS', 'MEDIUM', 'demo'],
          ['App Store screenshots', 'TODO', 'LOW', null],
          ['Crash reporting integration', 'TODO', 'HIGH', 'bob'],
          ['Dark mode palette', 'TODO', 'MEDIUM', 'demo'],
          ['Beta tester onboarding doc', 'TODO', 'LOW', null],
        ],
      },
    ],
  },
];

// Re-running resets the demo orgs to this exact state; other orgs are never touched.
async function seed() {
  const passwordHash = await bcrypt.hash(PASSWORD, env.bcryptCost);
  const users = {};
  for (const u of USERS) {
    users[u.key] = await User.findOneAndUpdate(
      { email: u.email },
      { $set: { name: u.name, passwordHash } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  }

  for (const o of ORGS) {
    const owner = users[o.owner];
    let org = await Organization.findOne({ slug: o.slug });
    if (org && String(org.createdBy) !== String(owner._id)) {
      throw new Error(`Slug "${o.slug}" belongs to an organization the seed did not create. Refusing to modify it.`);
    }
    if (!org) org = await Organization.create({ name: o.name, slug: o.slug, createdBy: owner._id });

    await Task.deleteMany({ organization: org._id });
    await Project.deleteMany({ organization: org._id });
    await Membership.deleteMany({ organization: org._id });

    for (const [key, role] of Object.entries(o.members)) {
      await Membership.create({ organization: org._id, user: users[key]._id, role });
    }
    for (const p of o.projects) {
      const project = await Project.create({
        name: p.name,
        description: p.description,
        organization: org._id,
        createdBy: owner._id,
      });
      await Task.insertMany(
        p.tasks.map(([title, status, priority, assigneeKey]) => ({
          title,
          status,
          priority,
          project: project._id,
          organization: org._id,
          assignee: assigneeKey ? users[assigneeKey]._id : null,
          createdBy: owner._id,
        })),
      );
    }
  }
}

if (require.main === module) {
  connectDb(env.mongoUri)
    .then(seed)
    .then(() => {
      console.log(`Seed complete. Log in as demo@taskhive.dev / ${PASSWORD}`);
      return mongoose.disconnect();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seed, PASSWORD };
