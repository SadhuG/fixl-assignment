const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Membership = require('../src/models/Membership');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const { seed, PASSWORD } = require('../scripts/seed');
const { app, request, signUp, createOrg } = require('./helpers');

test('seed is idempotent and demonstrates isolation for alice', async () => {
  await seed();
  await seed();

  expect(await User.countDocuments()).toBe(3);
  expect(await Organization.countDocuments()).toBe(2);
  expect(await Membership.countDocuments()).toBe(4);
  expect(await Project.countDocuments()).toBe(3);
  expect(await Task.countDocuments()).toBe(21);

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

test('seed refuses to touch an org that a real user created with a seed slug', async () => {
  const { agent } = await signUp();
  await createOrg(agent, 'Acme Inc.');
  await expect(seed()).rejects.toThrow(/Refusing/);
});
