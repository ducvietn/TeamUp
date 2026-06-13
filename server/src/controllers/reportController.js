const Task = require('../models/Task');
const Submission = require('../models/Submission');
const PeerReview = require('../models/PeerReview');
const Group = require('../models/Group');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { AppError } = require('../middleware/errorHandler');

exports.getContributionStats = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members.user', 'name email avatar');

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const tasks = await Task.find({ group: groupId });

    const memberStats = {};

    for (const member of group.members) {
      const userId = member.user._id.toString();
      memberStats[userId] = {
        user: member.user,
        tasksAssigned: 0,
        tasksCompleted: 0,
        totalProgress: 0,
        averageProgress: 0
      };
    }

    const leaderId = group.leader.toString();
    if (!memberStats[leaderId]) {
      const leader = await User.findById(leaderId);
      memberStats[leaderId] = {
        user: leader,
        tasksAssigned: 0,
        tasksCompleted: 0,
        totalProgress: 0,
        averageProgress: 0
      };
    }

    for (const task of tasks) {
      const assignedId = task.assignedTo?.toString();
      if (assignedId && memberStats[assignedId]) {
        memberStats[assignedId].tasksAssigned += 1;
        memberStats[assignedId].totalProgress += task.progress;
        
        if (task.status === 'done') {
          memberStats[assignedId].tasksCompleted += 1;
        }
      }
    }

    const contributionData = Object.values(memberStats).map(stat => ({
      ...stat,
      averageProgress: stat.tasksAssigned > 0 
        ? Math.round(stat.totalProgress / stat.tasksAssigned) 
        : 0
    }));

    const totalContribution = contributionData.reduce(
      (sum, m) => sum + m.averageProgress, 0
    );

    const contributionWithPercentage = contributionData.map(m => ({
      ...m,
      contributionPercentage: totalContribution > 0 
        ? Math.round((m.averageProgress / totalContribution) * 100) 
        : 0
    }));

    res.json({
      success: true,
      data: {
        contributions: contributionWithPercentage,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardData = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('leader', 'name email avatar')
      .populate('members.user', 'name email avatar');

    const tasks = await Task.find({ group: groupId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    const submissions = await Submission.find({ task: { $in: tasks.map(t => t._id) } })
      .populate('submittedBy', 'name email');

    const recentActivity = await ActivityLog.find({ group: groupId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    const taskStats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pendingReview: tasks.filter(t => t.status === 'pending_review').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => {
        if (!t.deadline || t.status === 'done') return false;
        return new Date(t.deadline) < new Date();
      }).length
    };

    const contributionData = await exports.getContributionStats(req, res, next);
    const contributions = contributionData.data?.contributions || [];

    res.json({
      success: true,
      data: {
        group,
        taskStats,
        contributions,
        recentActivity,
        totalSubmissions: submissions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.exportReportPDF = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('leader', 'name email')
      .populate('members.user', 'name email');

    const tasks = await Task.find({ group: groupId })
      .populate('assignedTo', 'name email');

    const submissions = await Submission.find({ task: { $in: tasks.map(t => t._id) } })
      .populate('submittedBy', 'name email');

    const reviews = await PeerReview.aggregate([
      { $match: { group: require('mongoose').Types.ObjectId(groupId) } },
      {
        $group: {
          _id: '$reviewee',
          avgScore: { $avg: '$score' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${group.name}-${Date.now()}.pdf`);
    doc.pipe(res);

    doc.fontSize(24).text('TeamUp Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Group: ${group.name}`, { align: 'center' });
    doc.fontSize(12).text(`Class: ${group.classId}`, { align: 'center' });
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(18).text('Contribution Summary', { underline: true });
    doc.moveDown();

    const contributionData = Object.values(
      tasks.reduce((acc, task) => {
        const userId = task.assignedTo?._id?.toString() || 'unassigned';
        if (!acc[userId]) {
          acc[userId] = {
            name: task.assignedTo?.name || 'Unassigned',
            totalProgress: 0,
            taskCount: 0
          };
        }
        acc[userId].totalProgress += task.progress;
        acc[userId].taskCount += 1;
        return acc;
      }, {})
    );

    contributionData.forEach(member => {
      const avg = member.taskCount > 0 ? Math.round(member.totalProgress / member.taskCount) : 0;
      doc.fontSize(12).text(`${member.name}: ${avg}% (${member.taskCount} tasks)`);
    });
    doc.moveDown(2);

    doc.fontSize(18).text('Task Overview', { underline: true });
    doc.moveDown();

    const tasksByStatus = {
      done: tasks.filter(t => t.status === 'done'),
      pending: tasks.filter(t => t.status === 'pending_review'),
      inProgress: tasks.filter(t => t.status === 'in_progress'),
      todo: tasks.filter(t => t.status === 'todo')
    };

    doc.fontSize(12).text(`Total Tasks: ${tasks.length}`);
    doc.text(`Completed: ${tasksByStatus.done.length}`);
    doc.text(`Pending Review: ${tasksByStatus.pending.length}`);
    doc.text(`In Progress: ${tasksByStatus.inProgress.length}`);
    doc.text(`To Do: ${tasksByStatus.todo.length}`);
    doc.moveDown(2);

    if (submissions.length > 0) {
      doc.fontSize(18).text('Submission History', { underline: true });
      doc.moveDown();

      const lateSubmissions = submissions.filter(s => s.isLate);
      if (lateSubmissions.length > 0) {
        doc.fontSize(12).fillColor('red').text('Late Submissions:', { underline: true });
        doc.fillColor('black');
        lateSubmissions.forEach(sub => {
          const submittedDate = new Date(sub.submittedAt).toLocaleString();
          doc.text(`- ${sub.submittedBy?.name || 'Unknown'}: ${submittedDate}`);
        });
        doc.moveDown();
      }

      doc.fontSize(12).text('All Submissions:');
      submissions.slice(0, 10).forEach(sub => {
        const status = sub.status === 'approved' ? '✓' : sub.status === 'rejected' ? '✗' : '○';
        doc.text(`${status} ${sub.submittedBy?.name || 'Unknown'} - ${new Date(sub.submittedAt).toLocaleDateString()}`);
      });
      doc.moveDown(2);
    }

    if (reviews.length > 0) {
      doc.fontSize(18).text('Peer Review Scores', { underline: true });
      doc.moveDown();

      for (const review of reviews) {
        const user = await User.findById(review._id);
        if (user) {
          doc.fontSize(12).text(`${user.name}: ${review.avgScore.toFixed(2)}/5 (${review.reviewCount} reviews)`);
        }
      }
    }

    doc.moveDown(2);
    doc.fontSize(10).text('Generated by TeamUp - Project Management Platform', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.exportReportExcel = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('leader', 'name email')
      .populate('members.user', 'name email');

    const tasks = await Task.find({ group: groupId })
      .populate('assignedTo', 'name email');

    const submissions = await Submission.find({ task: { $in: tasks.map(t => t._id) } })
      .populate('submittedBy', 'name email');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TeamUp';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];
    summarySheet.addRow({ metric: 'Group Name', value: group.name });
    summarySheet.addRow({ metric: 'Class ID', value: group.classId });
    summarySheet.addRow({ metric: 'Leader', value: group.leader?.name });
    summarySheet.addRow({ metric: 'Total Members', value: group.members.length });
    summarySheet.addRow({ metric: 'Total Tasks', value: tasks.length });
    summarySheet.addRow({ metric: 'Completed Tasks', value: tasks.filter(t => t.status === 'done').length });
    summarySheet.addRow({ metric: 'Total Submissions', value: submissions.length });
    summarySheet.addRow({ metric: 'Late Submissions', value: submissions.filter(s => s.isLate).length });
    summarySheet.addRow({ metric: 'Report Generated', value: new Date().toISOString() });

    const contributionSheet = workbook.addWorksheet('Contributions');
    contributionSheet.columns = [
      { header: 'Member', key: 'member', width: 25 },
      { header: 'Tasks Assigned', key: 'tasksAssigned', width: 15 },
      { header: 'Tasks Completed', key: 'tasksCompleted', width: 15 },
      { header: 'Average Progress', key: 'avgProgress', width: 18 },
      { header: 'Contribution %', key: 'contribution', width: 15 }
    ];

    const contributionData = Object.values(
      tasks.reduce((acc, task) => {
        const userId = task.assignedTo?._id?.toString() || 'unassigned';
        if (!acc[userId]) {
          acc[userId] = { name: task.assignedTo?.name || 'Unassigned', totalProgress: 0, taskCount: 0, completed: 0 };
        }
        acc[userId].totalProgress += task.progress;
        acc[userId].taskCount += 1;
        if (task.status === 'done') acc[userId].completed += 1;
        return acc;
      }, {})
    );

    const totalProgress = contributionData.reduce((sum, m) => sum + m.totalProgress, 0);
    contributionData.forEach(member => {
      const avg = member.taskCount > 0 ? Math.round(member.totalProgress / member.taskCount) : 0;
      const pct = totalProgress > 0 ? Math.round((member.totalProgress / totalProgress) * 100) : 0;
      contributionSheet.addRow({
        member: member.name,
        tasksAssigned: member.taskCount,
        tasksCompleted: member.completed,
        avgProgress: `${avg}%`,
        contribution: `${pct}%`
      });
    });

    const tasksSheet = workbook.addWorksheet('Tasks');
    tasksSheet.columns = [
      { header: 'Task', key: 'title', width: 30 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Progress', key: 'progress', width: 12 },
      { header: 'Deadline', key: 'deadline', width: 15 }
    ];

    tasks.forEach(task => {
      tasksSheet.addRow({
        title: task.title,
        assignedTo: task.assignedTo?.name || 'Unassigned',
        status: task.status,
        progress: `${task.progress}%`,
        deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'
      });
    });

    const submissionsSheet = workbook.addWorksheet('Submissions');
    submissionsSheet.columns = [
      { header: 'Submitted By', key: 'submittedBy', width: 20 },
      { header: 'Task', key: 'task', width: 25 },
      { header: 'Submitted At', key: 'submittedAt', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Late', key: 'isLate', width: 10 },
      { header: 'Feedback', key: 'feedback', width: 30 }
    ];

    for (const sub of submissions) {
      submissionsSheet.addRow({
        submittedBy: sub.submittedBy?.name || 'Unknown',
        task: tasks.find(t => t._id.equals(sub.task))?.title || 'Unknown',
        submittedAt: new Date(sub.submittedAt).toLocaleString(),
        status: sub.status,
        isLate: sub.isLate ? 'Yes' : 'No',
        feedback: sub.feedback || ''
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${group.name}-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
