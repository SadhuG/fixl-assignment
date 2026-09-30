import test from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, registerSchema } from '../src/features/auth/schemas.ts';
import { logoutSession } from '../src/lib/logoutSession.ts';

test('registration limits passwords to 72 UTF-8 bytes', () => {
  const body = { name: 'Reviewer', email: 'reviewer@example.com', password: '\u00e9'.repeat(36) };
  assert.equal(registerSchema.safeParse(body).success, true);
  assert.equal(registerSchema.safeParse({ ...body, password: body.password + 'suffix' }).success, false);
});

test('login rejects passwords that bcrypt would truncate', () => {
  assert.equal(loginSchema.safeParse({ email: 'reviewer@example.com', password: '\u00e9'.repeat(36) }).success, true);
  assert.equal(
    loginSchema.safeParse({ email: 'reviewer@example.com', password: '\u00e9'.repeat(36) + 'suffix' }).success,
    false,
  );
});

test('failed logout keeps the session and cache and reports a retryable error', async () => {
  let signedIn = true;
  let cacheCleared = false;
  let failure;
  await logoutSession(
    async () => {
      throw new Error('Network unavailable');
    },
    () => {
      signedIn = false;
      cacheCleared = true;
    },
    (error) => {
      failure = error;
    },
  );
  assert.equal(signedIn, true);
  assert.equal(cacheCleared, false);
  assert.equal(failure.message, 'Network unavailable');
});

test('successful logout clears local session only after the server responds', async () => {
  const calls = [];
  await logoutSession(
    async () => {
      calls.push('server');
    },
    () => {
      calls.push('signed out');
    },
    () => {
      assert.fail('Unexpected logout failure');
    },
  );
  assert.deepEqual(calls, ['server', 'signed out']);
});
