const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();

test('health check responds', async () => {
  await request(app).get('/api/health').expect(200, { ok: true });
});

test('unknown API routes return a JSON 404', async () => {
  const res = await request(app).get('/api/does-not-exist').expect(404);
  expect(res.body.error.code).toBe('NOT_FOUND');
});

test('malformed JSON returns 400', async () => {
  const res = await request(app)
    .post('/api/does-not-exist')
    .set('Content-Type', 'application/json')
    .send('{"broken":')
    .expect(400);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
});

test('Mongo operator keys in the body are rejected', async () => {
  const res = await request(app)
    .post('/api/does-not-exist')
    .send({ email: { $gt: '' } })
    .expect(400);
  expect(res.body.error.message).toMatch(/\$/);
});

test('helmet security headers are set', async () => {
  const res = await request(app).get('/api/health');
  expect(res.headers['x-content-type-options']).toBe('nosniff');
  expect(res.headers['x-powered-by']).toBeUndefined();
});
