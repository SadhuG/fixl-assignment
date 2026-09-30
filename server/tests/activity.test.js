const { app, request, signUp, createOrg, createProject, createTask, addMember, twoTenants } = require('./helpers');
const Activity = require('../src/models/Activity');

describe('activity', () => {
  test('records task creation and changed fields with title snapshots, then keeps history after rename', async () => {
    const owner = await signUp();
    const org = await createOrg(owner.agent);
    const project = await createProject(owner.agent, org.id, { name: 'Original project' });
    const task = await createTask(owner.agent, project.id, { title: 'Original task' });
    await owner.agent
      .patch(`/api/tasks/${task.id}`)
      .send({ title: 'Renamed task', status: 'DONE', dueDate: '2026-10-10' })
      .expect(200);
    const history = await owner.agent.get(`/api/tasks/${task.id}/activity`).expect(200);
    expect(history.body.data.map((entry) => entry.action)).toEqual(['TASK_UPDATED', 'TASK_CREATED']);
    expect(history.body.data[0]).toMatchObject({
      taskTitle: 'Renamed task',
      projectName: 'Original project',
      actorName: owner.user.name,
    });
    expect(history.body.data[0].changes).toEqual(
      expect.arrayContaining([
        { field: 'title', from: 'Original task', to: 'Renamed task' },
        { field: 'status', from: 'TODO', to: 'DONE' },
        { field: 'dueDate', from: null, to: '2026-10-10' },
      ]),
    );
    expect(history.body.data[1].taskTitle).toBe('Original task');
    await owner.agent.patch(`/api/tasks/${task.id}`).send({ status: 'DONE' }).expect(200);
    expect((await owner.agent.get(`/api/tasks/${task.id}/activity`).expect(200)).body.data).toHaveLength(2);
  });

  test('org feed includes project, task, and member events with pagination', async () => {
    const owner = await signUp();
    const member = await signUp();
    const org = await createOrg(owner.agent);
    const project = await createProject(owner.agent, org.id);
    await createTask(owner.agent, project.id);
    await addMember(owner.agent, org.id, member.user.email);
    await owner.agent
      .patch(`/api/organizations/${org.id}/members/${member.user.id}`)
      .send({ role: 'ADMIN' })
      .expect(200);
    await owner.agent.delete(`/api/organizations/${org.id}/members/${member.user.id}`).expect(204);
    const first = await owner.agent.get(`/api/organizations/${org.id}/activity?limit=2&page=1`).expect(200);
    const second = await owner.agent.get(`/api/organizations/${org.id}/activity?limit=2&page=2`).expect(200);
    expect(first.body.total).toBe(5);
    expect(first.body.data).toHaveLength(2);
    expect(second.body.data).toHaveLength(2);
    expect([...first.body.data, ...second.body.data].map((e) => e.action)).toEqual([
      'MEMBER_REMOVED',
      'MEMBER_ROLE_CHANGED',
      'MEMBER_ADDED',
      'TASK_CREATED',
    ]);
    expect(first.body.data[0]).toMatchObject({ memberName: member.user.name, actorName: owner.user.name });
    expect(first.body.data[1].changes).toEqual([{ field: 'role', from: 'MEMBER', to: 'ADMIN' }]);
    const invalid = await owner.agent.get(`/api/organizations/${org.id}/activity?page=0`).expect(400);
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('project events retain their names after rename and deletion', async () => {
    const owner = await signUp();
    const org = await createOrg(owner.agent);
    const project = await createProject(owner.agent, org.id, { name: 'First' });
    await owner.agent.patch(`/api/projects/${project.id}`).send({ name: 'Second' }).expect(200);
    await owner.agent.delete(`/api/projects/${project.id}`).expect(204);
    const feed = await owner.agent.get(`/api/organizations/${org.id}/activity`).expect(200);
    expect(feed.body.data.map((entry) => [entry.action, entry.projectName])).toEqual([
      ['PROJECT_DELETED', 'Second'],
      ['PROJECT_UPDATED', 'Second'],
      ['PROJECT_CREATED', 'First'],
    ]);
    expect(feed.body.data[1].changes).toEqual([{ field: 'name', from: 'First', to: 'Second' }]);
  });

  test('activity expires after 90 days', () => {
    const ttl = Activity.schema.indexes().find(([fields]) => fields.createdAt === 1);
    expect(ttl[1].expireAfterSeconds).toBe(90 * 24 * 60 * 60);
  });

  test('feed and task history deny foreign tenant access', async () => {
    const w = await twoTenants();
    const taskB = await createTask(w.b.agent, w.projectB.id, { title: 'Secret' });
    await w.a.agent.get(`/api/organizations/${w.orgB.id}/activity`).expect(404);
    await w.a.agent.get(`/api/tasks/${taskB.id}/activity`).expect(404);
    const feed = await w.a.agent.get(`/api/organizations/${w.orgA.id}/activity`).expect(200);
    expect(JSON.stringify(feed.body)).not.toContain('Secret');
    await request(app).get(`/api/organizations/${w.orgA.id}/activity`).expect(401);
  });

  test('a failed activity insert does not fail the action', async () => {
    const owner = await signUp();
    const org = await createOrg(owner.agent);
    const spy = jest.spyOn(Activity, 'create').mockRejectedValueOnce(new Error('log unavailable'));
    await owner.agent.post(`/api/organizations/${org.id}/projects`).send({ name: 'Still created' }).expect(201);
    spy.mockRestore();
  });
});
