require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const {
  authRoutes,
  groupRoutes,
  taskRoutes,
  submissionRoutes,
  peerReviewRoutes,
  reportRoutes,
  notificationRoutes
} = require('./routes');

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TeamUp API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/peer-reviews', peerReviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Debug routes - remove after testing
app.get('/api/test', (req, res) => res.json({ success: true, message: 'Direct test OK' }));
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    routes: [
      '/api/auth',
      '/api/groups',
      '/api/tasks',
      '/api/submissions',
      '/api/peer-reviews',
      '/api/reports',
      '/api/notifications'
    ]
  });
});

// Debug auth route directly
app.post('/api/auth/test-register', (req, res) => {
  res.json({ success: true, message: 'Direct auth route works', body: req.body });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    try {
      const { startCronJobs } = require('./services/cronJob');
      startCronJobs();
    } catch (error) {
      console.log('Cron jobs will be started separately');
    }
  });
}

module.exports = app;
