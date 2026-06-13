const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { groupAccess } = require('../middleware/groupAccess');
const { cloudinary, multerConfig } = require('../config/cloudinary');
const multer = require('multer');

const upload = multer({
  ...multerConfig,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max per file
});

router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('groupId').notEmpty().withMessage('Group ID is required'),
  validate
], taskController.createTask);

router.get('/my', auth, taskController.getMyTasks);

router.get('/group/:groupId', auth, groupAccess, taskController.getTasksByGroup);

router.get('/:taskId', auth, taskController.getTaskById);

router.put('/:taskId', auth, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  validate
], taskController.updateTask);

router.put('/:taskId/progress', auth, upload.array('files', 5), taskController.updateProgress);

router.post('/:taskId/approve', auth, taskController.approveTask);

router.post('/:taskId/reject', auth, [
  body('feedback').optional().trim(),
  validate
], taskController.rejectTask);

router.delete('/:taskId', auth, taskController.deleteTask);

router.get('/group/:groupId/stats', auth, groupAccess, taskController.getTaskStats);

module.exports = router;
