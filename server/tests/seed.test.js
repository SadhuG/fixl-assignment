const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Membership = require('../src/models/Membership');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const Activity = require('../src/models/Activity');
const { seed, seedActivity, PASSWORD } = require('../scripts/seed');
const { app, request, signUp, createOrg } = require('./helpers');

test('seed is idempotent and demonstrates isolation for alice', async () => {
  await seed();
  await seed();

  expect(await User.countDocuments()).toBe(3);
  expect(await Organization.countDocuments()).toBe(2);
  expect(await Membership.countDocuments()).toBe(4);
  expect(await Project.countDocuments()).toBe(3);
  expect(await Task.countDocuments()).toBe(21);
  expect(await Activity.countDocuments()).toBeGreaterThan(10);

  const demo = request.agent(app);
  await demo.post('/api/auth/login').send({ email: 'demo@taskhive.dev', password: PASSWORD }).expect(200);
  const orgs = (await demo.get('/api/organizations').expect(200)).body.data;
  expect(orgs.map((o) => [o.slug, o.role]).sort()).toEqual([
    ['acme-inc', 'ADMIN'],
    ['beta-labs', 'MEMBER'],
  ]);

  const alice = request.agent(app);
  await alice.post('/api/auth/login').send({ email: 'alice@taskhive.dev', password: PASSWORD }).expect(200);
  const mobile = await Project.findOne({ name: 'Mobile Application' });
  await alice.get(`/api/projects/${mobile.id}`).expect(404);
});

test('activity-only seed is idempotent and leaves projects, tasks and memberships intact', async () => {
  await seed();
  const taskIds = (await Task.find().sort({ _id: 1 }).select('_id')).map((task) => String(task._id));
  const before = await Activity.countDocuments();
  await seedActivity();
  await seedActivity();
  expect(await Activity.countDocuments()).toBe(before);
  expect((await Task.find().sort({ _id: 1 }).select('_id')).map((task) => String(task._id))).toEqual(taskIds);
  expect(await Membership.countDocuments()).toBe(4);
  const hero = await Task.findOne({ title: 'Design homepage hero variants' });
  const history = await Activity.find({ task: hero._id }).sort({ createdAt: -1 });
  expect(history.map((entry) => entry.action)).toEqual(['TASK_UPDATED', 'TASK_CREATED']);
  expect(history[0].changes).toEqual(
    expect.arrayContaining([expect.objectContaining({ field: 'status', from: 'TODO', to: 'IN_PROGRESS' })]),
  );
});

test('activity-only seed refuses missing demo data', async () => {
  await expect(seedActivity()).rejects.toThrow(/Missing demo user/);
  expect(await Activity.countDocuments()).toBe(0);
});

test('seed refuses to touch an org that a real user created with a seed slug', async () => {
  const { agent } = await signUp();
  await createOrg(agent, 'Acme Inc.');
  await expect(seed()).rejects.toThrow(/Refusing/);
});
