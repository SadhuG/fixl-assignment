const Membership = require('../src/models/Membership');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const { signUp, createOrg, addMember } = require('./helpers');

describe('members', () => {
  let admin;
  let member;
  let org;

  beforeEach(async () => {
    admin = await signUp();
    member = await signUp();
    org = await createOrg(admin.agent, 'Acme');
  });

  const membersUrl = (userId = '') => `/api/organizations/${org.id}/members${userId ? `/${userId}` : ''}`;

  test('admin adds an existing user by email in any case; every member can list', async () => {
    const res = await admin.agent.post(membersUrl()).send({ email: member.user.email.toUpperCase() }).expect(201);
    expect(res.body).toMatchObject({ id: member.user.id, email: member.user.email, role: 'MEMBER' });

    const list = await member.agent.get(membersUrl()).expect(200);
    expect(list.body.data.map((m) => [m.id, m.role])).toEqual([
      [admin.user.id, 'ADMIN'],
      [member.user.id, 'MEMBER'],
    ]);
    expect(Object.keys(list.body.data[0]).sort()).toEqual(['email', 'id', 'joinedAt', 'name', 'role']);
  });

  test('unknown email is 404 on the email field; existing member is 409', async () => {
    const unknown = await admin.agent.post(membersUrl()).send({ email: 'nobody@test.dev' }).expect(404);
    expect(unknown.body.error).toMatchObject({
      code: 'USER_NOT_FOUND',
      details: [{ field: 'email', message: expect.any(String) }],
    });

    await addMember(admin.agent, org.id, member.user.email);
    const dup = await admin.agent.post(membersUrl()).send({ email: member.user.email }).expect(409);
    expect(dup.body.error.code).toBe('ALREADY_MEMBER');
  });

  test('a duplicate that slips past the pre-check still reports ALREADY_MEMBER (409)', async () => {
    await addMember(admin.agent, org.id, member.user.email);
    const exists = jest.spyOn(Membership, 'exists').mockResolvedValueOnce(null);
    const res = await admin.agent.post(membersUrl()).send({ email: member.user.email }).expect(409);
    exists.mockRestore();
    expect(res.body.error).toMatchObject({
      code: 'ALREADY_MEMBER',
      details: [{ field: 'email', message: expect.any(String) }],
    });
  });

  test('members cannot add, change roles or remove (403)', async () => {
    const third = await signUp();
    await addMember(admin.agent, org.id, member.user.email);
    await member.agent.post(membersUrl()).send({ email: third.user.email }).expect(403);
    await member.agent.patch(membersUrl(admin.user.id)).send({ role: 'MEMBER' }).expect(403);
    await member.agent.delete(membersUrl(admin.user.id)).expect(403);
  });

  test('admin can promote a member, and the new role shows in their org list', async () => {
    await addMember(admin.agent, org.id, member.user.email);
    const res = await admin.agent.patch(membersUrl(member.user.id)).send({ role: 'ADMIN' }).expect(200);
    expect(res.body.role).toBe('ADMIN');
    const orgs = await member.agent.get('/api/organizations').expect(200);
    expect(orgs.body.data[0].role).toBe('ADMIN');
  });

  test('the last admin can be neither demoted nor removed (409)', async () => {
    const demote = await admin.agent.patch(membersUrl(admin.user.id)).send({ role: 'MEMBER' }).expect(409);
    expect(demote.body.error.code).toBe('LAST_ADMIN');
    const remove = await admin.agent.delete(membersUrl(admin.user.id)).expect(409);
    expect(remove.body.error.code).toBe('LAST_ADMIN');
  });

  test('concurrent mutual demotions never leave the org without an admin', async () => {
    await addMember(admin.agent, org.id, member.user.email, 'ADMIN');
    await Promise.all([
      admin.agent.patch(membersUrl(member.user.id)).send({ role: 'MEMBER' }),
      member.agent.patch(membersUrl(admin.user.id)).send({ role: 'MEMBER' }),
    ]);
    expect(await Membership.countDocuments({ organization: org.id, role: 'ADMIN' })).toBeGreaterThanOrEqual(1);
  });

  test('removing a member unassigns their open tasks, keeps done ones, and revokes access', async () => {
    await addMember(admin.agent, org.id, member.user.email);
    const project = await Project.create({ name: 'P', organization: org.id, createdBy: admin.user.id });
    const base = { project: project._id, organization: org.id, createdBy: admin.user.id, assignee: member.user.id };
    const open = await Task.create({ ...base, title: 'Open', status: 'IN_PROGRESS' });
    const done = await Task.create({ ...base, title: 'Done', status: 'DONE' });

    await admin.agent.delete(membersUrl(member.user.id)).expect(204);

    expect((await Task.findById(open._id)).assignee).toBeNull();
    expect(String((await Task.findById(done._id)).assignee)).toBe(member.user.id);
    await member.agent.get(`/api/organizations/${org.id}`).expect(404);
  });

  test('malformed or non-member user ids return 404; an invalid role is 400', async () => {
    const stranger = await signUp();
    await admin.agent.patch(membersUrl('not-an-id')).send({ role: 'ADMIN' }).expect(404);
    await admin.agent.delete(membersUrl(stranger.user.id)).expect(404);
    await admin.agent.patch(membersUrl(admin.user.id)).send({ role: 'OWNER' }).expect(400);
  });
});
