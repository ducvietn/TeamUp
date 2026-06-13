const express = require('express');
const router = express.Router();
const { cloudinary, multerConfig } = require('../config/cloudinary');
const multer = require('multer');
const submissionController = require('../controllers/submissionController');
const { auth } = require('../middleware/auth');

const upload = multer(multerConfig);

router.post('/', auth, upload.array('files', 10), submissionController.createSubmission);

router.get('/my', auth, submissionController.getMySubmissions);

router.get('/task/:taskId', auth, submissionController.getSubmissionsByTask);

router.get('/:submissionId', auth, submissionController.getSubmissionById);

router.post('/:submissionId/approve', auth, submissionController.approveSubmission);

router.post('/:submissionId/reject', auth, [
  (req, res, next) => {
    req.feedback = req.body.feedback;
    next();
  }
], submissionController.rejectSubmission);

module.exports = router;
