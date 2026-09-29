const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');
const { registerBody, loginBody } = require('../validators/auth');
const auth = require('../controllers/auth');

const router = express.Router();

router.post('/register', authLimiter, validate({ body: registerBody }), auth.register);
router.post('/login', authLimiter, validate({ body: loginBody }), auth.login);
// Public and idempotent: an expired session must still be able to clear its cookie.
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);

module.exports = router;
