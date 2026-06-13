const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  action: {
    type: String,
    enum: [
      'task_created',
      'task_updated',
      'task_completed',
      'submission_made',
      'submission_approved',
      'submission_rejected',
      'member_joined',
      'member_left',
      'peer_review_submitted',
      'group_created'
    ],
    required: true
  },
  description: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ group: 1, createdAt: -1 });
activityLogSchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
