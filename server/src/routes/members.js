const express = require('express');
const { requireRole } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { memberAddBody, memberRoleBody } = require('../validators/organizations');
const members = require('../controllers/members');

// Mounted under /organizations/:orgId/members after authenticate + loadOrg.
const router = express.Router({ mergeParams: true });

router.get('/', members.list);
router.post('/', requireRole('ADMIN'), validate({ body: memberAddBody }), members.add);
router.patch('/:userId', requireRole('ADMIN'), validate({ body: memberRoleBody }), members.changeRole);
router.delete('/:userId', requireRole('ADMIN'), members.remove);

module.exports = router;
