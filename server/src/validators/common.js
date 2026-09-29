const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const email = z.string().trim().toLowerCase().max(254).email('Enter a valid email address');

module.exports = { objectId, email };
