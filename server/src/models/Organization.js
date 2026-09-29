const { Schema, model } = require('mongoose');
const { toJSON } = require('./plugins/toJSON');

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);
organizationSchema.plugin(toJSON);

module.exports = model('Organization', organizationSchema);
