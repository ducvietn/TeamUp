const Submission = require('../models/Submission');
const Task = require('../models/Task');
const Group = require('../models/Group');
const ActivityLog = require('../models/ActivityLog');
const { AppError } = require('../middleware/errorHandler');

exports.createSubmission = async (req, res, next) => {
  try {
    const { taskId, notes } = req.body;
    const files = req.files || [];

    const task = await Task.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.assignedTo.toString() !== req.userId.toString()) {
      throw new AppError('You are not assigned to this task', 403);
    }

    if (task.progress < 100) {
      throw new AppError('Task must be 100% complete before submission', 400);
    }

    // Cloudinary returns secure_url for each file
    const fileUrls = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: file.path // Cloudinary URL
    }));

    const isLate = task.deadline && new Date() > new Date(task.deadline);

    const submission = await Submission.create({
      task: taskId,
      submittedBy: req.userId,
      files: fileUrls,
      notes,
      isLate
    });

    task.status = 'pending_review';
    await task.save();

    await ActivityLog.create({
      user: req.userId,
      task: taskId,
      group: task.group,
      action: 'submission_made',
      description: `Submitted: ${task.title}`,
      metadata: { isLate }
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email');

    res.status(201).json({
      success: true,
      message: isLate ? 'Submission received (late)' : 'Submission received successfully',
      data: { submission: populatedSubmission }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubmissionsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const submissions = await Submission.find({ task: taskId })
      .populate('submittedBy', 'name email avatar')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.userId })
      .populate('task', 'title status deadline')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    const task = await Task.findById(submission.task);
    const group = await Group.findById(task.group);

    if (!group.isLeader(req.userId)) {
      throw new AppError('Only group leader can approve submissions', 403);
    }

    submission.status = 'approved';
    submission.reviewedBy = req.userId;
    submission.reviewedAt = new Date();
    await submission.save();

    task.status = 'done';
    task.progress = 100;
    await task.save();

    await ActivityLog.create({
      user: req.userId,
      task: task._id,
      group: task.group,
      action: 'submission_approved',
      description: `Submission approved for: ${task.title}`
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('submittedBy', 'name email avatar')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Submission approved',
      data: { submission: populatedSubmission }
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    const task = await Task.findById(submission.task);
    const group = await Group.findById(task.group);

    if (!group.isLeader(req.userId)) {
      throw new AppError('Only group leader can reject submissions', 403);
    }

    submission.status = 'rejected';
    submission.feedback = feedback;
    submission.reviewedBy = req.userId;
    submission.reviewedAt = new Date();
    await submission.save();

    task.status = 'in_progress';
    await task.save();

    await ActivityLog.create({
      user: req.userId,
      task: task._id,
      group: task.group,
      action: 'submission_rejected',
      description: `Submission rejected for: ${task.title}`,
      metadata: { reason: feedback }
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('submittedBy', 'name email avatar')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Submission rejected',
      data: { submission: populatedSubmission }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubmissionById = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('task', 'title description deadline group')
      .populate('submittedBy', 'name email avatar')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};
