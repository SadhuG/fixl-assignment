const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const { z } = require('zod');
const { errorHandler } = require('../src/middleware/errorHandler');
const { AppError, conflict } = require('../src/utils/AppError');

function appThrowing(err) {
  const app = express();
  app.get('/boom', () => {
    throw err;
  });
  app.use(errorHandler);
  return app;
}

test('AppError keeps its status, code and details', async () => {
  const res = await request(appThrowing(conflict('EMAIL_TAKEN', 'Taken', 'email')))
    .get('/boom')
    .expect(409);
  expect(res.body).toEqual({
    error: { code: 'EMAIL_TAKEN', message: 'Taken', details: [{ field: 'email', message: 'Taken' }] },
  });
});

test('ZodError becomes 400 with field details', async () => {
  const zodError = z.object({ name: z.string() }).safeParse({}).error;
  const res = await request(appThrowing(zodError)).get('/boom').expect(400);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
  expect(res.body.error.details[0].field).toBe('name');
});

test('CastError becomes 404, not 500', async () => {
  const castError = new mongoose.Error.CastError('ObjectId', 'nope', '_id');
  const res = await request(appThrowing(castError)).get('/boom').expect(404);
  expect(res.body.error.code).toBe('NOT_FOUND');
});

test('duplicate key becomes 409 naming the field', async () => {
  const dup = Object.assign(new Error('E11000'), { code: 11000, keyPattern: { email: 1 } });
  const res = await request(appThrowing(dup)).get('/boom').expect(409);
  expect(res.body.error.details).toEqual([{ field: 'email', message: 'Already in use' }]);
});

test('unexpected errors become 500 without a stack trace', async () => {
  const res = await request(appThrowing(new Error('secret internals')))
    .get('/boom')
    .expect(500);
  expect(res.body.error.code).toBe('INTERNAL_ERROR');
  expect(JSON.stringify(res.body)).not.toMatch(/at .*\.js/);
});

test('AppError without details omits the details key', async () => {
  const res = await request(appThrowing(new AppError(403, 'FORBIDDEN', 'No')))
    .get('/boom')
    .expect(403);
  expect(res.body).toEqual({ error: { code: 'FORBIDDEN', message: 'No' } });
});
