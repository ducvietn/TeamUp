const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'pending_review', 'done'],
    default: 'todo'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  deadline: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  lastProgressUpdate: {
    type: Date,
    default: Date.now
  },
  progressHistory: [{
    progress: Number,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isFrozen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

taskSchema.index({ group: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ lastProgressUpdate: 1 });

taskSchema.pre('save', function(next) {
  if (this.isModified('progress')) {
    this.lastProgressUpdate = new Date();
    this.progressHistory.push({
      progress: this.progress,
      updatedAt: new Date()
    });
    
    if (this.progress === 0) {
      this.status = 'todo';
    } else if (this.progress > 0 && this.progress < 100) {
      this.status = 'in_progress';
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
