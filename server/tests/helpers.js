const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();
let counter = 0;

// Registers a fresh user and returns a supertest agent that carries their auth cookie.
async function signUp(overrides = {}) {
  counter += 1;
  const agent = request.agent(app);
  const body = { name: `User ${counter}`, email: `user${counter}@test.dev`, password: 'password123', ...overrides };
  const res = await agent.post('/api/auth/register').send(body).expect(201);
  return { agent, user: res.body };
}

module.exports = { app, request, signUp };
