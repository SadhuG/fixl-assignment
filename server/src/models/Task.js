const { Schema, model } = require('mongoose');
const { toJSON } = require('./plugins/toJSON');
const { STATUSES, PRIORITIES } = require('./constants');

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    status: { type: String, enum: STATUSES, default: 'TODO' },
    priority: { type: String, enum: PRIORITIES, default: 'MEDIUM' },
    dueDate: { type: Date, default: null },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    // Denormalised from the project: one indexed tenant filter per query and a second line of defence.
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);
// Serves the task list and board columns.
taskSchema.index({ project: 1, status: 1 });
// Serves "assigned to me" and unassigning a removed member's tasks.
taskSchema.index({ organization: 1, assignee: 1 });
taskSchema.plugin(toJSON);

module.exports = model('Task', taskSchema);
