const PeerReview = require('../models/PeerReview');
const Group = require('../models/Group');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { AppError } = require('../middleware/errorHandler');

exports.createReview = async (req, res, next) => {
  try {
    const { groupId, revieweeId, taskId, score, comment, criteria } = req.body;

    const group = await Group.findById(groupId);
    
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.peerReviewEnabled) {
      throw new AppError('Peer review is not enabled for this group', 400);
    }

    if (!group.hasMember(req.userId)) {
      throw new AppError('You are not a member of this group', 403);
    }

    if (revieweeId === req.userId.toString()) {
      throw new AppError('You cannot review yourself', 400);
    }

    const existingReview = await PeerReview.findOne({
      group: groupId,
      reviewer: req.userId,
      reviewee: revieweeId
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this person', 400);
    }

    const review = await PeerReview.create({
      group: groupId,
      reviewer: req.userId,
      reviewee: revieweeId,
      task: taskId,
      score,
      comment,
      criteria,
      isAnonymous: true
    });

    await ActivityLog.create({
      user: req.userId,
      group: groupId,
      action: 'peer_review_submitted',
      description: `Submitted peer review`
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupReviews = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const reviews = await PeerReview.find({ group: groupId })
      .populate('reviewer', 'name email')
      .populate('reviewee', 'name email');

    const reviewsWithHiddenReviewer = reviews.map(review => ({
      _id: review._id,
      reviewee: review.reviewee,
      task: review.task,
      score: review.score,
      comment: review.comment,
      criteria: review.criteria,
      isAnonymous: review.isAnonymous,
      createdAt: review.createdAt
    }));

    res.json({
      success: true,
      data: { reviews: reviewsWithHiddenReviewer }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReviewsReceived = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const reviews = await PeerReview.find({ 
      group: groupId,
      reviewee: req.userId
    }).populate('reviewer', 'name email');

    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReviewsGiven = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const reviews = await PeerReview.find({
      group: groupId,
      reviewer: req.userId
    }).populate('reviewee', 'name email');

    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupStats = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const reviews = await PeerReview.find({ group: groupId });

    const stats = {};
    
    for (const review of reviews) {
      const revieweeId = review.reviewee.toString();
      if (!stats[revieweeId]) {
        stats[revieweeId] = {
          totalScore: 0,
          count: 0,
          scores: [],
          criteria: {
            communication: [],
            collaboration: [],
            responsibility: [],
            quality: []
          }
        };
      }
      stats[revieweeId].totalScore += review.score;
      stats[revieweeId].count += 1;
      stats[revieweeId].scores.push(review.score);
      
      if (review.criteria) {
        if (review.criteria.communication) {
          stats[revieweeId].criteria.communication.push(review.criteria.communication);
        }
        if (review.criteria.collaboration) {
          stats[revieweeId].criteria.collaboration.push(review.criteria.collaboration);
        }
        if (review.criteria.responsibility) {
          stats[revieweeId].criteria.responsibility.push(review.criteria.responsibility);
        }
        if (review.criteria.quality) {
          stats[revieweeId].criteria.quality.push(review.criteria.quality);
        }
      }
    }

    const result = Object.keys(stats).map(revieweeId => {
      const s = stats[revieweeId];
      const avgCriteria = {};
      
      if (s.criteria.communication.length > 0) {
        avgCriteria.communication = s.criteria.communication.reduce((a, b) => a + b, 0) / s.criteria.communication.length;
      }
      if (s.criteria.collaboration.length > 0) {
        avgCriteria.collaboration = s.criteria.collaboration.reduce((a, b) => a + b, 0) / s.criteria.collaboration.length;
      }
      if (s.criteria.responsibility.length > 0) {
        avgCriteria.responsibility = s.criteria.responsibility.reduce((a, b) => a + b, 0) / s.criteria.responsibility.length;
      }
      if (s.criteria.quality.length > 0) {
        avgCriteria.quality = s.criteria.quality.reduce((a, b) => a + b, 0) / s.criteria.quality.length;
      }

      return {
        reviewee: revieweeId,
        averageScore: s.totalScore / s.count,
        reviewCount: s.count,
        criteriaAverages: avgCriteria
      };
    });

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    next(error);
  }
};

exports.checkPeerReviewStatus = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members.user', 'name email');

    if (!group.peerReviewEnabled) {
      return res.json({
        success: true,
        data: { enabled: false }
      });
    }

    const reviewsGiven = await PeerReview.countDocuments({
      group: groupId,
      reviewer: req.userId
    });

    const totalMembers = group.members.length;
    const reviewsNeeded = totalMembers - 1;

    const pendingReviews = [];
    for (const member of group.members) {
      if (member.user._id.toString() === req.userId.toString()) continue;
      
      const hasReviewed = await PeerReview.findOne({
        group: groupId,
        reviewer: req.userId,
        reviewee: member.user._id
      });
      
      if (!hasReviewed) {
        pendingReviews.push({
          user: member.user,
          needsReview: true
        });
      }
    }

    res.json({
      success: true,
      data: {
        enabled: true,
        reviewsGiven,
        reviewsNeeded,
        totalMembers,
        pendingReviews,
        isComplete: reviewsGiven >= reviewsNeeded
      }
    });
  } catch (error) {
    next(error);
  }
};
