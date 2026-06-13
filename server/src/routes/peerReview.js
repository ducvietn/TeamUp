const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const peerReviewController = require('../controllers/peerReviewController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { groupAccess } = require('../middleware/groupAccess');

router.post('/', auth, [
  body('groupId').notEmpty().withMessage('Group ID is required'),
  body('revieweeId').notEmpty().withMessage('Reviewee ID is required'),
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
  validate
], peerReviewController.createReview);

router.get('/group/:groupId', auth, groupAccess, peerReviewController.getGroupReviews);

router.get('/received/:groupId', auth, groupAccess, peerReviewController.getMyReviewsReceived);

router.get('/given/:groupId', auth, groupAccess, peerReviewController.getMyReviewsGiven);

router.get('/stats/:groupId', auth, groupAccess, peerReviewController.getGroupStats);

router.get('/status/:groupId', auth, groupAccess, peerReviewController.checkPeerReviewStatus);

module.exports = router;
