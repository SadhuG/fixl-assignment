const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const { signUp, createOrg, addMember, createProject } = require('./helpers');

describe('projects', () => {
  let admin;
  let member;
  let org;

  beforeEach(async () => {
    admin = await signUp();
    member = await signUp();
    org = await createOrg(admin.agent, 'Acme');
    await addMember(admin.agent, org.id, member.user.email);
  });

  test('create sets tenant fields on the server; the list is newest first with task counts', async () => {
    const first = await createProject(member.agent, org.id, { name: 'First' });
    expect(first).toMatchObject({
      name: 'First',
      description: '',
      organization: org.id,
      createdBy: { id: member.user.id, name: member.user.name },
    });

    await createProject(admin.agent, org.id, { name: 'Second' });
    const res = await member.agent.get(`/api/organizations/${org.id}/projects`).expect(200);
    expect(res.body.data.map((p) => p.name)).toEqual(['Second', 'First']);
    expect(res.body.data[0].taskCounts).toEqual({ TODO: 0, IN_PROGRESS: 0, DONE: 0 });
  });

  test('validation: name required and at most 100 chars; description at most 1,000', async () => {
    const url = `/api/organizations/${org.id}/projects`;
    const missing = await admin.agent.post(url).send({ description: 'x' }).expect(400);
    expect(missing.body.error.details[0].field).toBe('name');
    await admin.agent
      .post(url)
      .send({ name: 'a'.repeat(101) })
      .expect(400);
    const long = await admin.agent
      .post(url)
      .send({ name: 'ok', description: 'a'.repeat(1001) })
      .expect(400);
    expect(long.body.error.details[0].field).toBe('description');
  });

  test('a member edits their own project but not an admin-created one; admins edit any', async () => {
    const mine = await createProject(member.agent, org.id, { name: 'Mine' });
    const theirs = await createProject(admin.agent, org.id, { name: 'Theirs' });

    await member.agent.patch(`/api/projects/${mine.id}`).send({ name: 'Mine v2' }).expect(200);
    const denied = await member.agent.patch(`/api/projects/${theirs.id}`).send({ name: 'Nope' }).expect(403);
    expect(denied.body.error.code).toBe('FORBIDDEN');
    await admin.agent.patch(`/api/projects/${mine.id}`).send({ name: 'Admin edit' }).expect(200);
  });

  test('a partial PATCH keeps omitted fields; an empty PATCH is 400', async () => {
    const project = await createProject(admin.agent, org.id, { name: 'Keep me', description: 'Original' });
    const res = await admin.agent.patch(`/api/projects/${project.id}`).send({ description: 'Updated' }).expect(200);
    expect(res.body).toMatchObject({ name: 'Keep me', description: 'Updated' });
    await admin.agent.patch(`/api/projects/${project.id}`).send({}).expect(400);
  });

  test('a MEMBER cannot delete a project in their own org (403)', async () => {
    const mine = await createProject(member.agent, org.id, { name: 'Mine' });
    const res = await member.agent.delete(`/api/projects/${mine.id}`).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(await Project.exists({ _id: mine.id })).not.toBeNull();
  });

  test('an admin delete removes the project and only its tasks', async () => {
    const doomed = await createProject(admin.agent, org.id, { name: 'Doomed' });
    const kept = await createProject(admin.agent, org.id, { name: 'Kept' });
    const base = { organization: org.id, createdBy: admin.user.id };
    await Task.create([
      { ...base, title: 't1', project: doomed.id },
      { ...base, title: 't2', project: doomed.id },
      { ...base, title: 't3', project: kept.id },
    ]);

    await admin.agent.delete(`/api/projects/${doomed.id}`).expect(204);

    expect(await Project.exists({ _id: doomed.id })).toBeNull();
    expect(await Task.countDocuments({ project: doomed.id })).toBe(0);
    expect(await Task.countDocuments({ project: kept.id })).toBe(1);
  });
});
