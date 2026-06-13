const cron = require('node-cron');
const Task = require('../models/Task');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const User = require('../models/User');

const checkFrozenTasks = async () => {
  try {
    console.log('[CRON] Running frozen task check...');
    
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const frozenTasks = await Task.find({
      status: 'in_progress',
      lastProgressUpdate: { $lt: threeDaysAgo },
      isFrozen: false
    }).populate('assignedTo', 'name email notifications')
      .populate('group', 'name');

    console.log(`[CRON] Found ${frozenTasks.length} frozen tasks`);

    for (const task of frozenTasks) {
      task.isFrozen = true;
      await task.save();

      const notification = await Notification.create({
        user: task.assignedTo._id,
        group: task.group._id,
        task: task._id,
        type: 'warning',
        title: 'Cảnh báo: Tiến độ bị đóng băng',
        message: `Công việc "${task.title}" của bạn không có thay đổi trong 3 ngày qua. Vui lòng cập nhật tiến độ!`,
        link: `/tasks/${task._id}`
      });

      await User.findByIdAndUpdate(task.assignedTo._id, {
        $push: { notifications: notification._id }
      });

      console.log(`[CRON] Warning sent to ${task.assignedTo.email} for task: ${task.title}`);
    }

    const tasksToUnfreeze = await Task.find({
      isFrozen: true,
      lastProgressUpdate: { $gte: threeDaysAgo }
    });

    for (const task of tasksToUnfreeze) {
      task.isFrozen = false;
      await task.save();
    }

    console.log('[CRON] Frozen task check completed');
  } catch (error) {
    console.error('[CRON] Error in frozen task check:', error);
  }
};

const checkDeadlines = async () => {
  try {
    console.log('[CRON] Running deadline check...');
    
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const approachingTasks = await Task.find({
      deadline: { $gte: tomorrow, $lt: dayAfterTomorrow },
      status: { $nin: ['done', 'pending_review'] }
    }).populate('assignedTo', 'name email')
      .populate('group', 'name');

    for (const task of approachingTasks) {
      const existingNotification = await Notification.findOne({
        user: task.assignedTo._id,
        task: task._id,
        type: 'deadline',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (!existingNotification) {
        const notification = await Notification.create({
          user: task.assignedTo._id,
          group: task.group._id,
          task: task._id,
          type: 'info',
          title: 'Nhắc nhở: Deadline sắp đến',
          message: `Công việc "${task.title}" có deadline vào ngày mai!`,
          link: `/tasks/${task._id}`
        });

        await User.findByIdAndUpdate(task.assignedTo._id, {
          $push: { notifications: notification._id }
        });
      }
    }

    console.log(`[CRON] Deadline check completed, ${approachingTasks.length} tasks approaching deadline`);
  } catch (error) {
    console.error('[CRON] Error in deadline check:', error);
  }
};

const startCronJobs = () => {
  cron.schedule('0 * * * *', () => {
    checkFrozenTasks();
    checkDeadlines();
  });

  console.log('[CRON] Cron jobs scheduled:');
  console.log('  - Frozen task check: Every hour');
  console.log('  - Deadline check: Every hour');
};

module.exports = { startCronJobs, checkFrozenTasks, checkDeadlines };
