const { signUp, createOrg, addMember, createProject, createTask } = require('./helpers');

const FAKE_ID = '0123456789abcdef01234567';

describe('tasks', () => {
  let admin;
  let member;
  let outsider;
  let org;
  let project;

  beforeEach(async () => {
    admin = await signUp();
    member = await signUp();
    outsider = await signUp();
    org = await createOrg(admin.agent, 'Acme');
    await addMember(admin.agent, org.id, member.user.email);
    await createOrg(outsider.agent, 'Elsewhere');
    project = await createProject(admin.agent, org.id, { name: 'Website' });
  });

  const listUrl = (query = '') => `/api/projects/${project.id}/tasks${query}`;

  test('create applies defaults and ignores tenant fields in the body', async () => {
    const task = await createTask(member.agent, project.id, {
      title: 'Write copy',
      organization: FAKE_ID,
      project: FAKE_ID,
      createdBy: admin.user.id,
    });
    expect(task).toMatchObject({
      title: 'Write copy',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      assignee: null,
      project: project.id,
      organization: org.id,
      createdBy: { id: member.user.id, name: member.user.name },
    });
  });

  test('assigning to an org member returns the populated assignee', async () => {
    const task = await createTask(admin.agent, project.id, { title: 'Assigned', assignee: member.user.id });
    expect(task.assignee).toEqual({ id: member.user.id, name: member.user.name, email: member.user.email });
  });

  test('an assignee outside the org is rejected on create (400)', async () => {
    const res = await admin.agent.post(listUrl()).send({ title: 'x', assignee: outsider.user.id }).expect(400);
    expect(res.body.error).toMatchObject({
      code: 'INVALID_ASSIGNEE',
      details: [{ field: 'assignee', message: expect.any(String) }],
    });
  });

  test('status and priority changes persist; the assignee can be cleared', async () => {
    const task = await createTask(member.agent, project.id, { title: 'Move me', assignee: member.user.id });
    await member.agent.patch(`/api/tasks/${task.id}`).send({ status: 'IN_PROGRESS', priority: 'HIGH' }).expect(200);
    const cleared = await member.agent.patch(`/api/tasks/${task.id}`).send({ assignee: null }).expect(200);
    expect(cleared.body.assignee).toBeNull();

    const list = await member.agent.get(listUrl()).expect(200);
    expect(list.body.data[0]).toMatchObject({ id: task.id, status: 'IN_PROGRESS', priority: 'HIGH', assignee: null });
  });

  test('invalid values and empty updates are rejected (400)', async () => {
    const task = await createTask(member.agent, project.id, { title: 'x' });
    const bad = await member.agent.patch(`/api/tasks/${task.id}`).send({ status: 'BLOCKED' }).expect(400);
    expect(bad.body.error.details[0].field).toBe('status');
    await member.agent.patch(`/api/tasks/${task.id}`).send({}).expect(400);
    await member.agent
      .post(listUrl())
      .send({ title: 'a'.repeat(201) })
      .expect(400);
  });

  test('PATCH cannot move a task to another project or org, or change its creator', async () => {
    const other = await createProject(admin.agent, org.id, { name: 'Other' });
    const task = await createTask(member.agent, project.id, { title: 'Stay' });
    const res = await member.agent
      .patch(`/api/tasks/${task.id}`)
      .send({ title: 'Renamed', project: other.id, organization: FAKE_ID, createdBy: admin.user.id })
      .expect(200);
    expect(res.body).toMatchObject({
      title: 'Renamed',
      project: project.id,
      organization: org.id,
      createdBy: { id: member.user.id },
    });
  });

  test('delete: admin any, creator own, other members 403', async () => {
    const byAdmin = await createTask(admin.agent, project.id, { title: 'admin task' });
    const byMember = await createTask(member.agent, project.id, { title: 'member task' });

    const denied = await member.agent.delete(`/api/tasks/${byAdmin.id}`).expect(403);
    expect(denied.body.error.code).toBe('FORBIDDEN');
    await member.agent.delete(`/api/tasks/${byMember.id}`).expect(204);
    await admin.agent.delete(`/api/tasks/${byAdmin.id}`).expect(204);
  });

  test('list filters by status, assignee=me, assignee=none and title search', async () => {
    await createTask(admin.agent, project.id, { title: 'Done thing', status: 'DONE' });
    await createTask(admin.agent, project.id, { title: 'My thing', assignee: member.user.id });
    await createTask(admin.agent, project.id, { title: 'Loose (thing)' });

    const titles = async (query) =>
      (await member.agent.get(listUrl(query)).expect(200)).body.data.map((t) => t.title).sort();
    expect(await titles('?status=DONE')).toEqual(['Done thing']);
    expect(await titles('?assignee=me')).toEqual(['My thing']);
    expect(await titles('?assignee=none')).toEqual(['Done thing', 'Loose (thing)']);
    expect(await titles('?q=(thing')).toEqual(['Loose (thing)']);
    await member.agent.get(listUrl('?status=BOGUS')).expect(400);
  });

  test('the project list counts tasks by status', async () => {
    await createTask(admin.agent, project.id, { title: 'a', status: 'DONE' });
    await createTask(admin.agent, project.id, { title: 'b' });
    const res = await admin.agent.get(`/api/organizations/${org.id}/projects`).expect(200);
    expect(res.body.data[0].taskCounts).toEqual({ TODO: 1, IN_PROGRESS: 0, DONE: 1 });
  });
});
