const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middleware/auth');
const { groupAccess } = require('../middleware/groupAccess');

router.get('/contribution/:groupId', auth, groupAccess, reportController.getContributionStats);

router.get('/dashboard/:groupId', auth, groupAccess, reportController.getDashboardData);

router.get('/export/pdf/:groupId', auth, groupAccess, reportController.exportReportPDF);

router.get('/export/excel/:groupId', auth, groupAccess, reportController.exportReportExcel);

module.exports = router;
