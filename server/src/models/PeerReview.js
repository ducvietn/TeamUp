const mongoose = require('mongoose');

const peerReviewSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  criteria: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    collaboration: {
      type: Number,
      min: 1,
      max: 5
    },
    responsibility: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isAnonymous: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

peerReviewSchema.index({ group: 1, reviewee: 1 });
peerReviewSchema.index({ reviewer: 1, group: 1 });

peerReviewSchema.pre('save', function(next) {
  if (this.isNew && this.reviewer.toString() === this.reviewee.toString()) {
    return next(new Error('Cannot review yourself'));
  }
  next();
});

peerReviewSchema.statics.getGroupReviews = async function(groupId) {
  return this.aggregate([
    { $match: { group: mongoose.Types.ObjectId(groupId) } },
    {
      $group: {
        _id: '$reviewee',
        averageScore: { $avg: '$score' },
        reviews: { $push: '$$ROOT' }
      }
    }
  ]);
};

module.exports = mongoose.model('PeerReview', peerReviewSchema);
