const Membership = require('../src/models/Membership');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const memberships = require('../src/services/memberships');
const projects = require('../src/services/projects');
const tasks = require('../src/controllers/tasks');
const { signUp, createOrg, addMember, createProject } = require('./helpers');

afterEach(() => jest.restoreAllMocks());

test('removal cannot delete an admin whose role changed after the membership read', async () => {
  const a = await signUp();
  const b = await signUp();
  const org = await createOrg(b.agent);
  await addMember(b.agent, org.id, a.user.email);
  const originalDelete = Membership.deleteOne.bind(Membership);
  jest.spyOn(Membership, 'deleteOne').mockImplementationOnce(async (...args) => {
    // Interleave a promotion and another admin's demotion with the pending removal.
    await Membership.updateOne({ organization: org.id, user: a.user.id }, { role: 'ADMIN' });
    await Membership.updateOne({ organization: org.id, user: b.user.id }, { role: 'MEMBER' });
    return originalDelete(...args);
  });
  await expect(memberships.removeMember(org.id, a.user.id)).rejects.toMatchObject({ code: 'LAST_ADMIN' });
  expect(await Membership.countDocuments({ organization: org.id, role: 'ADMIN' })).toBe(1);
});

test('concurrent demotions and removal retain an admin', async () => {
  const a = await signUp();
  const b = await signUp();
  const org = await createOrg(a.agent);
  await addMember(a.agent, org.id, b.user.email, 'ADMIN');
  await Promise.allSettled([
    memberships.changeRole(org.id, a.user.id, 'MEMBER'),
    memberships.changeRole(org.id, b.user.id, 'MEMBER'),
    memberships.removeMember(org.id, a.user.id),
  ]);
  expect(await Membership.countDocuments({ organization: org.id, role: 'ADMIN' })).toBeGreaterThanOrEqual(1);
});

test('a create request holding a deleted project cannot insert an orphan task', async () => {
  const { agent, user } = await signUp();
  const org = await createOrg(agent);
  const created = await createProject(agent, org.id);
  const project = await Project.findById(created.id);
  await projects.deleteProject(project);
  const req = { project, user: { _id: user.id, name: user.name }, valid: { body: { title: 'Too late' } } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await expect(tasks.create(req, res)).rejects.toMatchObject({ status: 404 });
  expect(await Task.countDocuments({ project: project._id })).toBe(0);
});

test('failed project deletion rolls back its task deletion', async () => {
  const { agent, user } = await signUp();
  const org = await createOrg(agent);
  const created = await createProject(agent, org.id);
  const project = await Project.findById(created.id);
  await Task.create({ title: 'Keep me', project: project._id, organization: org.id, createdBy: user.id });
  jest.spyOn(Project, 'deleteOne').mockRejectedValueOnce(new Error('Delete failed'));
  await expect(projects.deleteProject(project)).rejects.toThrow('Delete failed');
  expect(await Project.exists({ _id: project._id })).not.toBeNull();
  expect(await Task.countDocuments({ project: project._id })).toBe(1);
});
