const { auth } = require('./auth');

const groupAccess = async (req, res, next) => {
  try {
    const Group = require('../models/Group');
    const groupId = req.params.groupId || req.body.groupId;
    
    if (!groupId) {
      return next();
    }

    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.'
      });
    }

    const isMember = group.members.some(
      m => m.user.toString() === req.userId.toString()
    );
    const isLeader = group.leader.toString() === req.userId.toString();

    if (!isMember && !isLeader) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group.'
      });
    }

    req.group = group;
    req.isLeader = isLeader;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking group access.'
    });
  }
};

const leaderOnly = async (req, res, next) => {
  if (!req.isLeader) {
    return res.status(403).json({
      success: false,
      message: 'Only group leader can perform this action.'
    });
  }
  next();
};

module.exports = { groupAccess, leaderOnly };
