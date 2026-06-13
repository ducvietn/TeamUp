const Group = require('../models/Group');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { AppError } = require('../middleware/errorHandler');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, classId, description } = req.body;

    const group = await Group.create({
      name,
      classId,
      description,
      leader: req.userId,
      members: [{ user: req.userId }]
    });

    await ActivityLog.create({
      user: req.userId,
      group: group._id,
      action: 'group_created',
      description: `Created group: ${name}`
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('leader', 'name email')
      .populate('members.user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group: populatedGroup }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      $or: [
        { leader: req.userId },
        { 'members.user': req.userId }
      ],
      isActive: true
    })
      .populate('leader', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { groups }
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('leader', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    res.json({
      success: true,
      data: { group }
    });
  } catch (error) {
    next(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    const group = await Group.findOne({ inviteCode });
    
    if (!group) {
      throw new AppError('Invalid invite code', 404);
    }

    if (group.members.some(m => m.user.toString() === req.userId.toString())) {
      throw new AppError('You are already a member of this group', 400);
    }

    group.members.push({ user: req.userId });
    await group.save();

    await ActivityLog.create({
      user: req.userId,
      group: group._id,
      action: 'member_joined',
      description: `Joined group: ${group.name}`
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('leader', 'name email')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Joined group successfully',
      data: { group: populatedGroup }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, description, classId } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { name, description, classId },
      { new: true, runValidators: true }
    )
      .populate('leader', 'name email')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    await Group.findByIdAndUpdate(groupId, { isActive: false });

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members.user', 'name email avatar role');

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    res.json({
      success: true,
      data: {
        leader: group.leader,
        members: group.members
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    
    if (!group.isLeader(req.userId)) {
      throw new AppError('Only leader can remove members', 403);
    }

    if (memberId === group.leader.toString()) {
      throw new AppError('Cannot remove the group leader', 400);
    }

    group.members = group.members.filter(
      m => m.user.toString() !== memberId
    );
    await group.save();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.regenerateInviteCode = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    
    if (!group.isLeader(req.userId)) {
      throw new AppError('Only leader can regenerate invite code', 403);
    }

    group.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await group.save();

    res.json({
      success: true,
      message: 'Invite code regenerated',
      data: { inviteCode: group.inviteCode }
    });
  } catch (error) {
    next(error);
  }
};

exports.enablePeerReview = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { peerReviewEnabled: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Peer review enabled',
      data: { peerReviewEnabled: group.peerReviewEnabled }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllGroupsForTeacher = async (req, res, next) => {
  try {
    const groups = await Group.find({ isActive: true })
      .populate('leader', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { groups }
    });
  } catch (error) {
    next(error);
  }
};
