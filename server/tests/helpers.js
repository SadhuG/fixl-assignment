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

async function addMember(adminAgent, orgId, email, role = 'MEMBER') {
  const res = await adminAgent.post(`/api/organizations/${orgId}/members`).send({ email, role }).expect(201);
  return res.body;
}

async function createProject(agent, orgId, body = { name: 'Project' }) {
  const res = await agent.post(`/api/organizations/${orgId}/projects`).send(body).expect(201);
  return res.body;
}

// User A is only in Org A and User B is only in Org B, each with one project.
async function twoTenants() {
  const a = await signUp({ name: 'User A', email: 'a@test.dev' });
  const b = await signUp({ name: 'User B', email: 'b@test.dev' });
  const orgA = await createOrg(a.agent, 'Org A');
  const orgB = await createOrg(b.agent, 'Org B');
  const projectA = await createProject(a.agent, orgA.id, { name: 'Project A' });
  const projectB = await createProject(b.agent, orgB.id, { name: 'Project B' });
  return { a, b, orgA, orgB, projectA, projectB };
}

async function createTask(agent, projectId, body = { title: 'Task' }) {
  const res = await agent.post(`/api/projects/${projectId}/tasks`).send(body).expect(201);
  return res.body;
}

module.exports = { app, request, signUp, createOrg, grantMembership, addMember, createProject, twoTenants, createTask };
