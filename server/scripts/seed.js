const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { createHash } = require('crypto');
const { env } = require('../src/config/env');
const { connectDb } = require('../src/config/db');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Membership = require('../src/models/Membership');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const Activity = require('../src/models/Activity');

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

// Stable IDs make the activity-only command safe to re-run without duplicate demo entries.
function activityId(key) {
  return new mongoose.Types.ObjectId(
    createHash('sha256').update(`taskhive-demo-activity:${key}`).digest('hex').slice(0, 24),
  );
}

async function seedActivity() {
  const users = {};
  for (const user of USERS) {
    users[user.key] = await User.findOne({ email: user.email });
    if (!users[user.key]) throw new Error(`Missing demo user ${user.email}. Run the full seed first.`);
  }

  const entries = [];
  const add = (key, hoursAgo, entry) =>
    entries.push({
      _id: activityId(key),
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      changes: [],
      ...entry,
    });

  for (const fixture of ORGS) {
    const org = await Organization.findOne({ slug: fixture.slug });
    if (!org) throw new Error(`Missing demo organization ${fixture.slug}. Run the full seed first.`);
    if (String(org.createdBy) !== String(users[fixture.owner]._id)) {
      throw new Error(
        `Slug "${fixture.slug}" belongs to an organization the seed did not create. Refusing to modify it.`,
      );
    }
    const base = { organization: org._id };
    const actor = (key) => ({ actor: users[key]._id, actorName: users[key].name });

    for (const [key, role] of Object.entries(fixture.members)) {
      if (key === fixture.owner) continue;
      add(`${fixture.slug}:member-added:${key}`, 140, {
        ...base,
        ...actor(fixture.owner),
        memberName: users[key].name,
        action: 'MEMBER_ADDED',
        changes: [{ field: 'role', from: null, to: role }],
      });
    }

    for (const [projectIndex, projectFixture] of fixture.projects.entries()) {
      const project = await Project.findOne({ organization: org._id, name: projectFixture.name });
      if (!project) throw new Error(`Missing demo project ${projectFixture.name}. Run the full seed first.`);
      const projectEntry = { ...base, project: project._id, projectName: project.name };
      add(`${fixture.slug}:project:${projectFixture.name}`, 160 - projectIndex * 4, {
        ...projectEntry,
        ...actor(fixture.owner),
        action: 'PROJECT_CREATED',
      });

      const tasks = await Task.find({ organization: org._id, project: project._id });
      const byTitle = new Map(tasks.map((task) => [task.title, task]));
      for (const [taskIndex, [title, status, , assigneeKey]] of projectFixture.tasks.entries()) {
        const task = byTitle.get(title);
        if (!task) throw new Error(`Missing demo task ${title}. Run the full seed first.`);
        const taskEntry = { ...projectEntry, task: task._id, taskTitle: task.title };
        const key = `${fixture.slug}:${projectFixture.name}:${title}`;
        add(`${key}:created`, 120 - projectIndex * 4 - taskIndex, {
          ...taskEntry,
          ...actor(fixture.owner),
          action: 'TASK_CREATED',
        });
        const changes = [];
        if (status !== 'TODO') {
          changes.push({ field: 'status', from: status === 'DONE' ? 'IN_PROGRESS' : 'TODO', to: status });
        }
        if (assigneeKey) changes.push({ field: 'assignee', from: null, to: users[assigneeKey].name });
        if (changes.length) {
          add(`${key}:updated`, 36 - projectIndex * 4 - taskIndex, {
            ...taskEntry,
            ...actor(assigneeKey || fixture.owner),
            action: 'TASK_UPDATED',
            changes,
          });
        }
      }
    }

    if (fixture.slug === 'beta-labs') {
      add('beta-labs:demo-role', 20, {
        ...base,
        ...actor('bob'),
        memberName: users.demo.name,
        action: 'MEMBER_ROLE_CHANGED',
        changes: [{ field: 'role', from: 'ADMIN', to: 'MEMBER' }],
      });
    } else if (fixture.slug === 'acme-inc') {
      add('acme-inc:bob-added', 56, {
        ...base,
        ...actor('demo'),
        memberName: users.bob.name,
        action: 'MEMBER_ADDED',
        changes: [{ field: 'role', from: null, to: 'MEMBER' }],
      });
      add('acme-inc:bob-removed', 12, {
        ...base,
        ...actor('demo'),
        memberName: users.bob.name,
        action: 'MEMBER_REMOVED',
        changes: [{ field: 'role', from: 'MEMBER', to: null }],
      });
    }
  }

  if (entries.length) {
    await Activity.bulkWrite(
      entries.map((entry) => ({
        updateOne: { filter: { _id: entry._id }, update: { $setOnInsert: entry }, upsert: true },
      })),
    );
  }
  return entries.length;
}

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
    await Activity.deleteMany({ organization: org._id });
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
  await seedActivity();
}

if (require.main === module) {
  const activityOnly = process.argv.includes('--activity-only');
  connectDb(env.mongoUri)
    .then(activityOnly ? seedActivity : seed)
    .then((count) => {
      if (activityOnly) console.log(`Activity seed complete: ${count} demo entries checked.`);
      else console.log(`Seed complete. Log in as demo@taskhive.dev / ${PASSWORD}`);
      return mongoose.disconnect();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seed, seedActivity, PASSWORD };
