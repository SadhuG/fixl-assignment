const Project = require('../src/models/Project');
const { app, request, twoTenants } = require('./helpers');

// The attack table from the brief (section 5). User A belongs to Org A only.
describe('tenant isolation: projects', () => {
  let w;
  beforeEach(async () => {
    w = await twoTenants();
  });

  test('GET /api/projects/:idFromOrgB → 404 with no project data, identical to a missing id', async () => {
    const foreign = await w.a.agent.get(`/api/projects/${w.projectB.id}`).expect(404);
    const missing = await w.a.agent.get('/api/projects/0123456789abcdef01234567').expect(404);
    expect(foreign.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    expect(foreign.body).toEqual(missing.body);
  });

  test('GET /api/organizations/:orgB/projects → 404', async () => {
    const res = await w.a.agent.get(`/api/organizations/${w.orgB.id}/projects`).expect(404);
    expect(JSON.stringify(res.body)).not.toContain('Project B');
  });

  test('POST /api/organizations/:orgB/projects → 404 and nothing is created', async () => {
    await w.a.agent.post(`/api/organizations/${w.orgB.id}/projects`).send({ name: 'Planted' }).expect(404);
    expect(await Project.countDocuments({ organization: w.orgB.id })).toBe(1);
  });

  test('PATCH and DELETE /api/projects/:idFromOrgB → 404 and the project is unchanged', async () => {
    await w.a.agent.patch(`/api/projects/${w.projectB.id}`).send({ name: 'Pwned' }).expect(404);
    await w.a.agent.delete(`/api/projects/${w.projectB.id}`).expect(404);
    const stored = await Project.findById(w.projectB.id);
    expect(stored.name).toBe('Project B');
  });

  test('POST /api/organizations/:orgA/projects with organization: orgB in the body → 201 under Org A', async () => {
    const res = await w.a.agent
      .post(`/api/organizations/${w.orgA.id}/projects`)
      .send({ name: 'Sneaky', organization: w.orgB.id, createdBy: w.b.user.id })
      .expect(201);
    expect(res.body.organization).toBe(w.orgA.id);
    expect(res.body.createdBy.id).toBe(w.a.user.id);
    expect(String((await Project.findById(res.body.id)).organization)).toBe(w.orgA.id);
  });

  test('PATCH cannot move a project to another org', async () => {
    const res = await w.a.agent
      .patch(`/api/projects/${w.projectA.id}`)
      .send({ name: 'Renamed', organization: w.orgB.id, createdBy: w.b.user.id })
      .expect(200);
    expect(res.body).toMatchObject({ name: 'Renamed', organization: w.orgA.id, createdBy: { id: w.a.user.id } });
  });

  test('a malformed project id → 404, not 500', async () => {
    await w.a.agent.get('/api/projects/not-an-id').expect(404);
    await w.a.agent.patch('/api/projects/123').send({ name: 'x' }).expect(404);
  });

  test('requests without a cookie → 401', async () => {
    const calls = [
      ['get', `/api/organizations/${w.orgA.id}/projects`],
      ['post', `/api/organizations/${w.orgA.id}/projects`],
      ['get', `/api/projects/${w.projectA.id}`],
      ['patch', `/api/projects/${w.projectA.id}`],
      ['delete', `/api/projects/${w.projectA.id}`],
    ];
    for (const [method, url] of calls) {
      await request(app)[method](url).expect(401);
    }
  });
});
