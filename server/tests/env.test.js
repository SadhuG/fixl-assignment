const { loadEnv } = require('../src/config/env');

const valid = {
  MONGODB_URI: 'mongodb://x',
  JWT_SECRET: 'x'.repeat(32),
  CLIENT_ORIGIN: 'http://a.test, http://b.test',
};

test('fails fast listing every missing variable', () => {
  expect(() => loadEnv({})).toThrow('Missing required env vars: MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN');
});

test('rejects a short JWT secret', () => {
  expect(() => loadEnv({ ...valid, JWT_SECRET: 'short' })).toThrow(/at least 32/);
});

test('parses origins and applies defaults', () => {
  const env = loadEnv(valid);
  expect(env.clientOrigins).toEqual(['http://a.test', 'http://b.test']);
  expect(env.port).toBe(4000);
  expect(env.bcryptCost).toBe(12);
  expect(env.trustProxy).toBe(1);
  expect(env.isProd).toBe(false);
});
