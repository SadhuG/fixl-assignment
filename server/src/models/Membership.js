const { Schema, model } = require('mongoose');
const { toJSON } = require('./plugins/toJSON');
const { ROLES } = require('./constants');

const membershipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: { type: String, enum: ROLES, default: 'MEMBER' },
  },
  { timestamps: true },
);
// Serves the membership check on every request and blocks duplicate memberships.
membershipSchema.index({ user: 1, organization: 1 }, { unique: true });
// Serves the member list and the admin count for the last-admin rule.
membershipSchema.index({ organization: 1, role: 1 });
membershipSchema.plugin(toJSON);

module.exports = model('Membership', membershipSchema);
