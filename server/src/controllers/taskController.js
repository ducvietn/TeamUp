const Task = require('../models/Task');
const Group = require('../models/Group');
const Submission = require('../models/Submission');
const ActivityLog = require('../models/ActivityLog');
const { AppError } = require('../middleware/errorHandler');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, groupId, assignedTo, deadline, estimatedHours, difficulty } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const isMember = group.members.some(
      m => m.user.toString() === req.userId.toString()
    );
    const isLeader = group.leader.toString() === req.userId.toString();

    if (!isMember && !isLeader) {
      throw new AppError('You are not a member of this group', 403);
    }

    const task = await Task.create({
      title,
      description,
      group: groupId,
      assignedTo,
      createdBy: req.userId,
      deadline,
      estimatedHours,
      difficulty
    });

    await ActivityLog.create({
      user: req.userId,
      group: groupId,
      task: task._id,
      action: 'task_created',
      description: `Created task: ${title}`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTasksByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { status } = req.query;

    const query = { group: groupId };
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyTasks = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { assignedTo: req.userId };
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('group', 'name classId')
      .populate('createdBy', 'name email')
      .sort({ deadline: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('group', 'name classId leader');

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, deadline, estimatedHours, difficulty } = req.body;

    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.assignedTo.toString() !== req.userId.toString()) {
      const group = await Group.findById(task.group);
      if (!group.isLeader(req.userId)) {
        throw new AppError('Only assigned user or leader can update this task', 403);
      }
    }

    Object.assign(task, {
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      deadline: deadline !== undefined ? deadline : task.deadline,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : task.estimatedHours,
      difficulty: difficulty || task.difficulty
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    
    // Check if this is a multipart form with files
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    let { progress } = req.body;
    let note = '';
    let evidence = [];

    if (isMultipart) {
      progress = parseInt(req.body.progress);
      note = req.body.note || '';
      
      // Handle file uploads
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          evidence.push({
            originalName: file.originalname,
            filename: file.filename,
            url: file.path || file.url, // Cloudinary URL or local path
            mimeType: file.mimetype,
            size: file.size
          });
        }
      }
    } else {
      progress = parseInt(req.body.progress);
      note = req.body.note || '';
    }

    if (isNaN(progress) || progress < 0 || progress > 100) {
      throw new AppError('Progress must be between 0 and 100', 400);
    }

    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.assignedTo.toString() !== req.userId.toString()) {
      const group = await Group.findById(task.group);
      if (!group.isLeader(req.userId)) {
        throw new AppError('Only assigned user can update progress', 403);
      }
    }

    if (task.status === 'done') {
      throw new AppError('Cannot update progress of a completed task', 400);
    }

    if (progress <= task.progress) {
      throw new AppError('New progress must be greater than current progress', 400);
    }

    if (task.status === 'pending_review' && progress < 100) {
      task.status = 'in_progress';
    }

    task.progress = progress;
    task.progressHistory.push({
      progress,
      note,
      evidence,
      updatedAt: new Date(),
      updatedBy: req.userId
    });
    task.lastProgressUpdate = new Date();
    
    if (progress === 100) {
      task.status = 'pending_review';
    } else if (progress > 0) {
      task.status = 'in_progress';
    } else {
      task.status = 'todo';
    }

    await task.save();

    await ActivityLog.create({
      user: req.userId,
      task: task._id,
      group: task.group,
      action: 'task_updated',
      description: `Updated progress to ${progress}%${note ? `: ${note}` : ''}`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const group = await Group.findById(task.group);
    if (!group.isLeader(req.userId)) {
      throw new AppError('Only group leader can approve tasks', 403);
    }

    if (task.status !== 'pending_review') {
      throw new AppError('Task is not pending review', 400);
    }

    task.status = 'done';
    task.progress = 100;
    await task.save();

    await ActivityLog.create({
      user: req.userId,
      task: task._id,
      group: task.group,
      action: 'task_completed',
      description: `Task approved: ${task.title}`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task approved successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { feedback } = req.body;

    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const group = await Group.findById(task.group);
    if (!group.isLeader(req.userId)) {
      throw new AppError('Only group leader can reject tasks', 403);
    }

    if (task.status !== 'pending_review') {
      throw new AppError('Task is not pending review', 400);
    }

    task.status = 'in_progress';
    await task.save();

    if (feedback) {
      await Submission.create({
        task: task._id,
        submittedBy: task.assignedTo,
        notes: `Rejected: ${feedback}`,
        status: 'rejected',
        feedback
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task rejected',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const group = await Group.findById(task.group);
    if (!group.isLeader(req.userId) && task.createdBy.toString() !== req.userId.toString()) {
      throw new AppError('Only leader or creator can delete this task', 403);
    }

    await Task.findByIdAndDelete(taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskStats = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const tasks = await Task.find({ group: groupId });
    
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pendingReview: tasks.filter(t => t.status === 'pending_review').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length
    };

    const avgProgress = tasks.length > 0
      ? Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length)
      : 0;

    res.json({
      success: true,
      data: { stats, averageProgress: avgProgress }
    });
  } catch (error) {
    next(error);
  }
};
