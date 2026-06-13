const authRoutes = require('./auth');
const groupRoutes = require('./group');
const taskRoutes = require('./task');
const submissionRoutes = require('./submission');
const peerReviewRoutes = require('./peerReview');
const reportRoutes = require('./report');
const notificationRoutes = require('./notification');

module.exports = {
  authRoutes,
  groupRoutes,
  taskRoutes,
  submissionRoutes,
  peerReviewRoutes,
  reportRoutes,
  notificationRoutes
};
