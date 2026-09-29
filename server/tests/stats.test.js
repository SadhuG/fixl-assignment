const { twoTenants, createTask } = require('./helpers');

test('stats cover only the active org and list my open tasks', async () => {
  const w = await twoTenants();
  await createTask(w.a.agent, w.projectA.id, { title: 'A done', status: 'DONE', assignee: w.a.user.id });
  await createTask(w.a.agent, w.projectA.id, { title: 'A mine', assignee: w.a.user.id });
  await createTask(w.a.agent, w.projectA.id, { title: 'A loose', status: 'IN_PROGRESS' });
  await createTask(w.b.agent, w.projectB.id, { title: 'B task' });

  const res = await w.a.agent.get(`/api/organizations/${w.orgA.id}/stats`).expect(200);
  expect(res.body.byStatus).toEqual({ TODO: 1, IN_PROGRESS: 1, DONE: 1 });
  expect(res.body.assignedToMe.map((t) => t.title)).toEqual(['A mine']);
  expect(res.body.assignedToMe[0].project).toEqual({ id: w.projectA.id, name: 'Project A' });
  expect(res.body.recentProjects.map((p) => p.id)).toEqual([w.projectA.id]);

  await w.a.agent.get(`/api/organizations/${w.orgB.id}/stats`).expect(404);
});
