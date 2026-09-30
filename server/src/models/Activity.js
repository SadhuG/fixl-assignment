const { Schema, model } = require('mongoose');
const { toJSON } = require('./plugins/toJSON');

const activitySchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
  task: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actorName: { type: String, required: true },
  projectName: { type: String, default: null },
  taskTitle: { type: String, default: null },
  memberName: { type: String, default: null },
  action: { type: String, required: true },
  changes: [{ _id: false, field: String, from: { type: String, default: null }, to: { type: String, default: null } }],
  createdAt: { type: Date, default: Date.now },
});
activitySchema.index({ organization: 1, createdAt: -1, _id: -1 });
activitySchema.index({ organization: 1, task: 1, createdAt: -1, _id: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
activitySchema.plugin(toJSON);

module.exports = model('Activity', activitySchema);
