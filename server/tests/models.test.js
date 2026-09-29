const mongoose = require('mongoose');
const User = require('../src/models/User');
const Membership = require('../src/models/Membership');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

const oid = () => new mongoose.Types.ObjectId();

test('user email is trimmed, lowercased and unique', async () => {
  await User.create({ name: 'A', email: '  Mixed@Case.DEV ', passwordHash: 'h' });
  expect(await User.findOne({ email: 'mixed@case.dev' })).not.toBeNull();
  await expect(User.create({ name: 'B', email: 'mixed@case.dev', passwordHash: 'h' })).rejects.toMatchObject({ code: 11000 });
});

test('passwordHash is never selected or serialised by default', async () => {
  const created = await User.create({ name: 'A', email: 'a@test.dev', passwordHash: 'h' });
  const json = created.toJSON();
  expect(json.passwordHash).toBeUndefined();
  expect(json._id).toBeUndefined();
  expect(json.id).toBe(String(created._id));

  expect((await User.findById(created._id)).passwordHash).toBeUndefined();
  expect((await User.findById(created._id).select('+passwordHash')).passwordHash).toBe('h');
});

test('a user can only have one membership per organization', async () => {
  const user = oid();
  const organization = oid();
  await Membership.create({ user, organization, role: 'ADMIN' });
  await expect(Membership.create({ user, organization, role: 'MEMBER' })).rejects.toMatchObject({ code: 11000 });
});

test('membership role defaults to MEMBER and rejects unknown roles', async () => {
  expect(new Membership({ user: oid(), organization: oid() }).role).toBe('MEMBER');
  await expect(new Membership({ user: oid(), organization: oid(), role: 'OWNER' }).validate()).rejects.toThrow();
});

test('task defaults and enums', async () => {
  const base = { title: 'x', project: oid(), organization: oid(), createdBy: oid() };
  const task = new Task(base);
  expect(task.status).toBe('TODO');
  expect(task.priority).toBe('MEDIUM');
  expect(task.assignee).toBeNull();
  await expect(new Task({ ...base, status: 'BLOCKED' }).validate()).rejects.toThrow();
  await expect(new Task({ ...base, priority: 'URGENT' }).validate()).rejects.toThrow();
});

test('project name is limited to 100 characters', async () => {
  const base = { organization: oid(), createdBy: oid() };
  await expect(new Project({ ...base, name: 'a'.repeat(101) }).validate()).rejects.toThrow();
  await expect(new Project({ ...base, name: 'a'.repeat(100) }).validate()).resolves.toBeUndefined();
});
