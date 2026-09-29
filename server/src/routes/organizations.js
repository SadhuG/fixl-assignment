const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { loadOrg } = require('../middleware/loadOrg');
const { requireRole } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { orgBody } = require('../validators/organizations');
const membersRouter = require('./members');
const { orgProjectsRouter } = require('./projects');
const orgs = require('../controllers/organizations');

const router = express.Router();
router.use(authenticate);

router.get('/', orgs.listMine);
router.post('/', validate({ body: orgBody }), orgs.create);
router.get('/:orgId', loadOrg, orgs.get);
// Role check runs before validation so a member gets 403, not a 400 about the body.
router.patch('/:orgId', loadOrg, requireRole('ADMIN'), validate({ body: orgBody }), orgs.rename);
// Nested org routes are mounted below this line.
router.use('/:orgId/members', loadOrg, membersRouter);
router.use('/:orgId/projects', loadOrg, orgProjectsRouter);

module.exports = router;
