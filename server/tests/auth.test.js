const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { app, request, signUp } = require('./helpers');

describe('POST /api/auth/register', () => {
  test('creates the user, sets an httpOnly cookie and never returns the hash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dana', email: 'dana@test.dev', password: 'password123', role: 'ADMIN' })
      .expect(201);

    expect(res.body).toMatchObject({ name: 'Dana', email: 'dana@test.dev' });
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.role).toBeUndefined();

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^th_token=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  test('stores a bcrypt hash, never the plain password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'D', email: 'd@test.dev', password: 'password123' })
      .expect(201);
    const stored = await User.findOne({ email: 'd@test.dev' }).select('+passwordHash');
    expect(stored.passwordHash).not.toBe('password123');
    expect(await bcrypt.compare('password123', stored.passwordHash)).toBe(true);
  });

  test('rejects a duplicate email regardless of case or spaces (409)', async () => {
    await signUp({ email: 'demo@taskhive.dev' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Again', email: '  Demo@TaskHive.dev ', password: 'password123' })
      .expect(409);
    expect(res.body.error).toMatchObject({
      code: 'EMAIL_TAKEN',
      details: [{ field: 'email', message: expect.any(String) }],
    });
  });

  test('a duplicate that slips past the pre-check still reports EMAIL_TAKEN (409)', async () => {
    await signUp({ email: 'race@taskhive.dev' });
    const exists = jest.spyOn(User, 'exists').mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Racer', email: 'race@taskhive.dev', password: 'password123' })
      .expect(409);
    exists.mockRestore();
    expect(res.body.error).toMatchObject({
      code: 'EMAIL_TAKEN',
      details: [{ field: 'email', message: expect.any(String) }],
    });
  });

  test('rejects a short password with a field error (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'D', email: 'x@test.dev', password: 'short' })
      .expect(400);
    expect(res.body.error.details).toEqual([{ field: 'password', message: 'Password must be at least 8 characters' }]);
  });
});

describe('POST /api/auth/login', () => {
  test('logs in with mixed-case email and surrounding spaces', async () => {
    await signUp({ email: 'demo@taskhive.dev' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ' DEMO@taskhive.dev ', password: 'password123' })
      .expect(200);
    expect(res.body.email).toBe('demo@taskhive.dev');
    expect(res.headers['set-cookie'][0]).toMatch(/^th_token=/);
  });

  test('wrong password and unknown email get the same 401', async () => {
    await signUp({ email: 'demo@taskhive.dev' });
    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@taskhive.dev', password: 'nope-nope' })
      .expect(401);
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@taskhive.dev', password: 'nope-nope' })
      .expect(401);
    expect(wrong.body).toEqual(unknown.body);
  });
});

describe('session', () => {
  test('GET /api/auth/me without a cookie returns 401', async () => {
    const res = await request(app).get('/api/auth/me').expect(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  test('GET /api/auth/me with a garbage cookie returns 401', async () => {
    await request(app).get('/api/auth/me').set('Cookie', 'th_token=garbage').expect(401);
  });

  test('a valid token for a deleted user returns 401', async () => {
    const token = jwt.sign({ sub: String(new mongoose.Types.ObjectId()) }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await request(app).get('/api/auth/me').set('Cookie', `th_token=${token}`).expect(401);
  });

  test('me returns the current user and logout ends the session', async () => {
    const { agent, user } = await signUp();
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.id).toBe(user.id);

    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });

  test('logout without a session still succeeds (idempotent)', async () => {
    await request(app).post('/api/auth/logout').expect(204);
  });
});
