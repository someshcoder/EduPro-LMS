const express = require('express');
const router = express.Router();
const adminForum = require('../controllers/adminForum.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// All admin forum routes require authentication and admin role
router.use(protect, adminOnly);

// Dashboard stats
router.get('/stats', adminForum.getDashboardStats);

// Questions management
router.get('/questions', adminForum.getQuestions);
router.get('/questions/:id', adminForum.getQuestionDetail);
router.patch('/questions/:id/moderate', adminForum.moderateQuestion);

// Top 3 best answers selection & publication
router.post('/questions/:id/publish-best-answers', adminForum.publishBestAnswers);

// Answers moderation
router.patch('/answers/:id/moderate', adminForum.moderateAnswer);

// Reward management
router.get('/rewards', adminForum.getRewards);
router.post('/rewards/:txnId/retry', adminForum.retryFailedReward);

// Reports management
router.get('/reports', adminForum.getReports);
router.patch('/reports/:id/review', adminForum.reviewReport);

// Audit history
router.get('/audit-logs', adminForum.getAuditLogs);

module.exports = router;
