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

const Membership = require('../src/models/Membership');

async function createOrg(agent, name = 'Org') {
  const res = await agent.post('/api/organizations').send({ name }).expect(201);
  return res.body;
}

// Direct DB write for tests that run before the members API exists.
function grantMembership(userId, orgId, role = 'MEMBER') {
  return Membership.create({ user: userId, organization: orgId, role });
}

module.exports = { app, request, signUp, createOrg, grantMembership };
