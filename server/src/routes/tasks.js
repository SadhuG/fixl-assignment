const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { loadTask } = require('../middleware/loadTask');
const { requireAdminOrCreator } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { updateTaskBody } = require('../validators/tasks');
const tasks = require('../controllers/tasks');
const activity = require('../services/activity');

const router = express.Router();
router.use(authenticate);
router.get('/:taskId/activity', loadTask, activity.listTask);

router.patch('/:taskId', loadTask, validate({ body: updateTaskBody }), tasks.update);
router.delete('/:taskId', loadTask, requireAdminOrCreator('task'), tasks.remove);

module.exports = router;
