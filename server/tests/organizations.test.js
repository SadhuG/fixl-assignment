const { app, request, signUp, createOrg, grantMembership } = require('./helpers');

describe('organizations', () => {
  test('the creator becomes ADMIN and sees the org in their list', async () => {
    const { agent } = await signUp();
    const org = await createOrg(agent, 'Acme Inc.');
    expect(org).toMatchObject({ name: 'Acme Inc.', slug: 'acme-inc', role: 'ADMIN' });

    const res = await agent.get('/api/organizations').expect(200);
    expect(res.body.data).toEqual([expect.objectContaining({ id: org.id, role: 'ADMIN' })]);
  });

  test('the list only contains orgs I belong to, with my role in each', async () => {
    const a = await signUp();
    const b = await signUp();
    const orgA = await createOrg(a.agent, 'Alpha');
    const orgB = await createOrg(b.agent, 'Beta');
    await grantMembership(a.user.id, orgB.id, 'MEMBER');

    const res = await a.agent.get('/api/organizations').expect(200);
    const roles = Object.fromEntries(res.body.data.map((o) => [o.id, o.role]));
    expect(roles).toEqual({ [orgA.id]: 'ADMIN', [orgB.id]: 'MEMBER' });

    const other = await signUp();
    expect((await other.agent.get('/api/organizations').expect(200)).body.data).toEqual([]);
  });

  test('slugs are unique across tenants', async () => {
    const a = await signUp();
    const b = await signUp();
    expect((await createOrg(a.agent, 'Acme')).slug).toBe('acme');
    expect((await createOrg(b.agent, 'ACME!')).slug).toBe('acme-2');
  });

  test('names without ASCII letters still get a usable, unique slug', async () => {
    const { agent } = await signUp();
    expect((await createOrg(agent, '!!!')).slug).toBe('org');
    expect((await createOrg(agent, '日本語')).slug).toBe('org-2');
  });

  test('name is required and limited to 80 characters', async () => {
    const { agent } = await signUp();
    const empty = await agent.post('/api/organizations').send({ name: '   ' }).expect(400);
    expect(empty.body.error.details[0].field).toBe('name');
    await agent.post('/api/organizations').send({ name: 'a'.repeat(81) }).expect(400);
  });

  test('GET /organizations/:orgId returns details with my role', async () => {
    const { agent } = await signUp();
    const org = await createOrg(agent, 'Acme');
    const res = await agent.get(`/api/organizations/${org.id}`).expect(200);
    expect(res.body).toMatchObject({ id: org.id, name: 'Acme', role: 'ADMIN' });
  });

  test('only admins can rename, and the slug stays stable', async () => {
    const admin = await signUp();
    const member = await signUp();
    const org = await createOrg(admin.agent, 'Acme');
    await grantMembership(member.user.id, org.id, 'MEMBER');

    const denied = await member.agent.patch(`/api/organizations/${org.id}`).send({ name: 'Hacked' }).expect(403);
    expect(denied.body.error.code).toBe('FORBIDDEN');

    const res = await admin.agent.patch(`/api/organizations/${org.id}`).send({ name: 'Acme Corp' }).expect(200);
    expect(res.body).toMatchObject({ name: 'Acme Corp', slug: 'acme' });
  });
});

describe('tenant isolation: organizations', () => {
  test('a non-member gets 404 for another org, identical to a missing org', async () => {
    const a = await signUp();
    const b = await signUp();
    const orgB = await createOrg(b.agent, 'Beta');

    const foreign = await a.agent.get(`/api/organizations/${orgB.id}`).expect(404);
    const missing = await a.agent.get('/api/organizations/0123456789abcdef01234567').expect(404);
    expect(foreign.body).toEqual(missing.body);
    await a.agent.patch(`/api/organizations/${orgB.id}`).send({ name: 'Mine now' }).expect(404);
  });

  test('a malformed org id returns 404, not 500', async () => {
    const { agent } = await signUp();
    await agent.get('/api/organizations/not-an-id').expect(404);
  });

  test('requests without a cookie return 401', async () => {
    await request(app).get('/api/organizations').expect(401);
    await request(app).post('/api/organizations').send({ name: 'x' }).expect(401);
  });
});
