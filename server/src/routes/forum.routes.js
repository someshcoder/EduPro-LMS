const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect } = require('../middleware/auth.middleware');
const fc = require('../controllers/forum.controller');

// ─── Forum attachment upload ──────────────────────────────────────────────────
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const forumStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/forum';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${req.user.id}-${safe}`);
  },
});

const forumFileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'text/plain',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images (jpg/png/webp/gif), PDFs, and text files are allowed.'), false);
};

const uploadForumAttachment = multer({
  storage: forumStorage,
  fileFilter: forumFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 }, // 5MB each, max 3 files
});

// ─── Rate limits ─────────────────────────────────────────────────────────────
const questionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,
  message: { success: false, message: 'Too many questions posted. Please wait before posting again.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
});

const answerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 20,
  message: { success: false, message: 'Too many answers submitted. Please slow down.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 min
  max: 30,
  message: { success: false, message: 'Too many vote requests.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,
  message: { success: false, message: 'Too many reports submitted.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
});

// ─── Public routes (questions feed / tags) ────────────────────────────────────
// Uses optional auth to know if user has voted
router.use(async (req, res, next) => {
  // Try to attach user without blocking
  try {
    const { verifyAccessToken } = require('../utils/jwt');
    const User = require('../models/User');
    const Session = require('../models/Session');
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      const session = await Session.findOne({ token, isActive: true });
      if (session) {
        const user = await User.findById(decoded.id).select('-password');
        if (user && !user.isBlocked) req.user = user;
      }
    }
  } catch (_) {}
  next();
});

router.get('/questions', fc.getQuestions);
router.get('/tags', fc.getPopularTags);
router.get('/questions/:id', fc.getQuestion);
router.get('/questions/:id/answers', fc.getAnswers);

// ─── Protected routes ─────────────────────────────────────────────────────────
router.use(protect);

// Questions
router.post('/questions', questionLimiter, uploadForumAttachment.array('attachments', 3), fc.createQuestion);
router.put('/questions/:id', fc.editQuestion);
router.delete('/questions/:id', fc.archiveQuestion);
router.post('/questions/:id/upvote', voteLimiter, fc.toggleUpvote);

// Answers
router.post('/questions/:id/answers', answerLimiter, fc.createAnswer);
router.put('/answers/:id', fc.editAnswer);

// My activity
router.get('/my/questions', fc.getMyQuestions);
router.get('/my/answers', fc.getMyAnswers);

// Forum wallet
router.get('/wallet', fc.getForumWallet);

// Notifications
router.get('/notifications', fc.getNotifications);
router.patch('/notifications/read-all', fc.markAllNotificationsRead);
router.patch('/notifications/:id/read', fc.markNotificationRead);

// Reports
router.post('/reports', reportLimiter, fc.createReport);

module.exports = router;

