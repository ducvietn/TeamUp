const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  classId: {
    type: String,
    required: [true, 'Class ID is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  peerReviewEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

groupSchema.pre('save', function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

groupSchema.methods.isLeader = function(userId) {
  return this.leader.toString() === userId.toString();
};

groupSchema.methods.hasMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

module.exports = mongoose.model('Group', groupSchema);
