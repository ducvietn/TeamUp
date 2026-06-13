-- =====================================================
-- TeamUp Database Schema (SQL Reference)
-- This file documents the MongoDB schema structure
-- For actual implementation, use Mongoose models in /server/src/models/
-- =====================================================

-- =====================================================
-- 1. USERS (Người dùng)
-- =====================================================
-- Collection: users
/*
{
  _id: ObjectId,
  name: String (required, max 100),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  role: Enum ['student', 'teacher'] (default: 'student'),
  avatar: String (URL, optional),
  notifications: [
    {
      message: String,
      type: Enum ['warning', 'info', 'success', 'error'],
      read: Boolean (default: false),
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
*/

-- =====================================================
-- 2. GROUPS (Nhóm)
-- =====================================================
-- Collection: groups
/*
{
  _id: ObjectId,
  name: String (required, max 100),
  classId: String (required),
  description: String (optional, max 500),
  leader: ObjectId (ref: users, required),
  members: [
    {
      user: ObjectId (ref: users),
      joinedAt: Date (default: Date.now)
    }
  ],
  inviteCode: String (unique, auto-generated, 6 chars),
  isActive: Boolean (default: true),
  peerReviewEnabled: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
*/

-- =====================================================
-- 3. TASKS (Công việc)
-- =====================================================
-- Collection: tasks
/*
{
  _id: ObjectId,
  title: String (required, max 200),
  description: String (optional, max 2000),
  group: ObjectId (ref: groups, required),
  assignedTo: ObjectId (ref: users),
  createdBy: ObjectId (ref: users, required),
  status: Enum ['todo', 'in_progress', 'pending_review', 'done'] (default: 'todo'),
  progress: Number (0-100, default: 0),
  deadline: Date (optional),
  estimatedHours: Number (default: 0),
  difficulty: Enum ['easy', 'medium', 'hard'] (default: 'medium'),
  lastProgressUpdate: Date (default: Date.now),
  progressHistory: [
    {
      progress: Number,
      updatedAt: Date,
      updatedBy: ObjectId (ref: users)
    }
  ],
  isFrozen: Boolean (default: false) - Đánh dấu khi không có thay đổi 3 ngày
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { group: 1, status: 1 }
- { assignedTo: 1, status: 1 }
- { lastProgressUpdate: 1 }
*/

-- =====================================================
-- 4. SUBMISSIONS (Bài nộp)
-- =====================================================
-- Collection: submissions
/*
{
  _id: ObjectId,
  task: ObjectId (ref: tasks, required),
  submittedBy: ObjectId (ref: users, required),
  files: [
    {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String (path to file)
    }
  ],
  notes: String (optional, max 1000),
  status: Enum ['pending', 'approved', 'rejected'] (default: 'pending'),
  feedback: String (optional, max 500),
  reviewedBy: ObjectId (ref: users),
  reviewedAt: Date,
  submittedAt: Date (default: Date.now),
  isLate: Boolean (default: false)
}

Indexes:
- { task: 1, submittedBy: 1 }
- { submittedAt: -1 }
*/

-- =====================================================
-- 5. PEER_REVIEWS (Đánh giá ẩn danh)
-- =====================================================
-- Collection: peerreviews
/*
{
  _id: ObjectId,
  group: ObjectId (ref: groups, required),
  reviewer: ObjectId (ref: users, required) - BỊ ẨN KHI TRẢ VỀ CLIENT
  reviewee: ObjectId (ref: users, required),
  task: ObjectId (ref: tasks, optional),
  score: Number (1-5, required),
  comment: String (optional, max 500),
  criteria: {
    communication: Number (1-5),
    collaboration: Number (1-5),
    responsibility: Number (1-5),
    quality: Number (1-5)
  },
  isAnonymous: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { group: 1, reviewee: 1 }
- { reviewer: 1, group: 1 }
*/

-- =====================================================
-- 6. NOTIFICATIONS (Thông báo)
-- =====================================================
-- Collection: notifications
/*
{
  _id: ObjectId,
  user: ObjectId (ref: users, required),
  group: ObjectId (ref: groups, optional),
  task: ObjectId (ref: tasks, optional),
  type: Enum ['warning', 'info', 'success', 'error', 'deadline', 'review', 'submission'],
  title: String (required),
  message: String (required),
  read: Boolean (default: false),
  link: String (optional),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { user: 1, read: 1, createdAt: -1 }
*/

-- =====================================================
-- 7. ACTIVITY_LOGS (Nhật ký hoạt động)
-- =====================================================
-- Collection: activitylogs
/*
{
  _id: ObjectId,
  user: ObjectId (ref: users, required),
  group: ObjectId (ref: groups, optional),
  task: ObjectId (ref: tasks, optional),
  action: Enum [
    'task_created',
    'task_updated',
    'task_completed',
    'submission_made',
    'submission_approved',
    'submission_rejected',
    'member_joined',
    'member_left',
    'peer_review_submitted',
    'group_created'
  ] (required),
  description: String,
  metadata: Mixed (optional),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { user: 1, createdAt: -1 }
- { group: 1, createdAt: -1 }
- { task: 1, createdAt: -1 }
*/

-- =====================================================
-- RELATIONSHIPS
-- =====================================================

-- Users (1) --> (N) Groups (as leader)
-- Users (N) <--> (N) Groups (as members)
-- Groups (1) --> (N) Tasks
-- Users (1) --> (N) Tasks (as assignedTo)
-- Tasks (1) --> (N) Submissions
-- Users (1) --> (N) Submissions (as submittedBy)
-- Groups (1) --> (N) PeerReviews
-- Users (1) --> (N) PeerReviews (as reviewer and reviewee)
-- Users (1) --> (N) Notifications
-- Users (1) --> (N) ActivityLogs

-- =====================================================
-- SAMPLE SQL QUERIES (for reference)
-- =====================================================

-- Get all members with their task progress
/*
SELECT 
  u.name,
  COUNT(t._id) as tasks_assigned,
  SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as tasks_completed,
  AVG(t.progress) as avg_progress
FROM users u
JOIN tasks t ON u._id = t.assignedTo
WHERE t.group = ObjectId('group_id')
GROUP BY u._id, u.name
*/

-- Get late submissions
/*
SELECT 
  s.*,
  u.name as submitted_by,
  t.title as task_title
FROM submissions s
JOIN users u ON s.submittedBy = u._id
JOIN tasks t ON s.task = t._id
WHERE s.isLate = true
ORDER BY s.submittedAt DESC
*/

-- Get peer review stats
/*
SELECT 
  pr.reviewee,
  u.name,
  AVG(pr.score) as avg_score,
  COUNT(*) as review_count
FROM peerreviews pr
JOIN users u ON pr.reviewee = u._id
WHERE pr.group = ObjectId('group_id')
GROUP BY pr.reviewee, u.name
*/
