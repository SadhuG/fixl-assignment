const { Schema, model } = require('mongoose');
const { toJSON } = require('./plugins/toJSON');

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);
// Serves the project list for the active org, newest first.
projectSchema.index({ organization: 1, createdAt: -1 });
projectSchema.plugin(toJSON);

module.exports = model('Project', projectSchema);
