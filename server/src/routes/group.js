const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { groupAccess, leaderOnly } = require('../middleware/groupAccess');

router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('classId').trim().notEmpty().withMessage('Class ID is required'),
  validate
], groupController.createGroup);

router.get('/my', auth, groupController.getMyGroups);

router.get('/all', auth, groupController.getAllGroupsForTeacher);

router.get('/:groupId', auth, groupAccess, groupController.getGroupById);

router.post('/join', auth, [
  body('inviteCode').trim().notEmpty().withMessage('Invite code is required'),
  validate
], groupController.joinGroup);

router.put('/:groupId', auth, groupAccess, leaderOnly, [
  body('name').optional().trim().notEmpty().withMessage('Group name cannot be empty'),
  validate
], groupController.updateGroup);

router.delete('/:groupId', auth, groupAccess, leaderOnly, groupController.deleteGroup);

router.get('/:groupId/members', auth, groupAccess, groupController.getGroupMembers);

router.delete('/:groupId/members/:memberId', auth, groupAccess, leaderOnly, groupController.removeMember);

router.post('/:groupId/regenerate-code', auth, groupAccess, leaderOnly, groupController.regenerateInviteCode);

router.post('/:groupId/enable-peer-review', auth, groupAccess, leaderOnly, groupController.enablePeerReview);

module.exports = router;
