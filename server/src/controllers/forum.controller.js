const mongoose = require('mongoose');
const ForumQuestion = require('../models/ForumQuestion');
const ForumAnswer = require('../models/ForumAnswer');
const ForumReport = require('../models/ForumReport');
const ForumNotification = require('../models/ForumNotification');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FORUM_QUESTION_REWARD = 10;  // coins
const FORUM_BEST_ANSWER_REWARD = 25; // coins

/** Create a forum notification safely (no-throw, dedup) */
async function notify(recipientId, type, message, link, questionId, answerId) {
  try {
    const dedupeKey = answerId
      ? `${type}:${recipientId}:${answerId}`
      : `${type}:${recipientId}:${questionId}`;
    await ForumNotification.findOneAndUpdate(
      { dedupeKey },
      {
        $setOnInsert: {
          recipient: recipientId,
          type,
          message,
          link,
          question: questionId || undefined,
          answer: answerId || undefined,
          isRead: false,
          dedupeKey,
        },
      },
      { upsert: true, returnDocument: 'before' }
    );
  } catch (_) {
    // swallow dedup errors
  }
}

// ─── Questions ────────────────────────────────────────────────────────────────

/**
 * GET /api/forum/questions
 * Public (filtered to active) – paginated feed
 */
exports.getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = 'latest',    // latest | discussed | upvoted
      search = '',
      tag = '',
      solved = '',        // 'true' | 'false' | ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = { status: 'active' };

    if (search.trim()) {
      filter.$text = { $search: search.trim() };
    }
    if (tag.trim()) {
      filter.tags = { $in: [tag.trim().toLowerCase()] };
    }
    if (solved === 'true') filter.isSolved = true;
    if (solved === 'false') filter.isSolved = false;

    let sortObj = {};
    if (sort === 'discussed') sortObj = { answerCount: -1, createdAt: -1 };
    else if (sort === 'upvoted') sortObj = { upvoteCount: -1, createdAt: -1 };
    else sortObj = { createdAt: -1 };

    const [questions, total] = await Promise.all([
      ForumQuestion.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('author', 'name avatar')
        .select('-editHistory -attachments'),
      ForumQuestion.countDocuments(filter),
    ]);

    // If logged in, flag which questions current user has upvoted
    const userId = req.user?._id?.toString();
    const questionsWithVote = questions.map((q) => {
      const obj = q.toObject();
      obj.hasUpvoted = userId ? q.upvotes.some((id) => id.toString() === userId) : false;
      delete obj.upvotes; // don't send full array
      return obj;
    });

    res.json({
      success: true,
      questions: questionsWithVote,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/forum/questions/:id
 * Get single question with full details
 */
exports.getQuestion = async (req, res) => {
  try {
    const question = await ForumQuestion.findOne({
      _id: req.params.id,
      status: { $ne: 'deleted' },
    })
      .populate('author', 'name avatar email')
      .populate('questionRewardTxnId', 'amount createdAt');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const userId = req.user?._id?.toString();
    const isAuthor = question.author?._id?.toString() === userId;
    const isAdmin = req.user?.role === 'admin';
    if (question.status === 'hidden' && !isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'This discussion is currently hidden by moderators.' });
    }

    // Increment view count (non-blocking)
    ForumQuestion.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    const obj = question.toObject();
    obj.hasUpvoted = userId
      ? question.upvotes.some((id) => id.toString() === userId)
      : false;
    delete obj.upvotes;

    res.json({ success: true, question: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/forum/questions
 * Create a question + award +10 Forum Coins (idempotent)
 */
exports.createQuestion = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }
    if (title.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Title must be at least 10 characters.' });
    }
    if (description.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Description must be at least 20 characters.' });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      const raw = typeof tags === 'string' ? JSON.parse(tags) : tags;
      parsedTags = raw
        .map((t) => t.toLowerCase().trim().replace(/^#/, ''))
        .filter((t) => t.length > 0 && t.length <= 30)
        .slice(0, 10);
    }

    // Handle attachments
    const attachments = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `/uploads/forum/${f.filename}`,
    }));

    // Create question
    const question = await ForumQuestion.create({
      author: req.user._id,
      title: title.trim(),
      description: description.trim(),
      tags: parsedTags,
      attachments,
    });

    // Award +10 Forum Coins (idempotent via questionRewardCredited flag)
    let txn = null;
    if (!question.questionRewardCredited) {
      const user = await User.findById(req.user._id);
      if (user) {
        const newBalance = (user.walletBalance || 0) + FORUM_QUESTION_REWARD;
        user.walletBalance = newBalance;
        user.totalEarnings = (user.totalEarnings || 0) + FORUM_QUESTION_REWARD;
        await user.save();

        txn = await Transaction.create({
          user: req.user._id,
          type: 'forum_question',
          amount: FORUM_QUESTION_REWARD,
          description: `Forum Question Reward: "${title.trim().substring(0, 60)}"`,
          reference: question._id.toString(),
          status: 'completed',
          balanceAfter: newBalance,
        });

        question.questionRewardCredited = true;
        question.questionRewardTxnId = txn._id;
        await question.save();
      }
    }

    // Notification (async, non-blocking with error catch)
    await notify(
      req.user._id,
      'coins_credited',
      `+${FORUM_QUESTION_REWARD} Forum Coins earned for posting a question!`,
      `/forum/question/${question._id}`,
      question._id
    );

    res.status(201).json({
      success: true,
      message: 'Question posted successfully! +10 Forum Coins earned.',
      question,
      coinsEarned: FORUM_QUESTION_REWARD,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/forum/questions/:id
 * Edit own question
 */
exports.editQuestion = async (req, res) => {
  try {
    const question = await ForumQuestion.findOne({
      _id: req.params.id,
      status: 'active',
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this question.' });
    }

    const { title, description, tags } = req.body;

    // Save edit history
    question.editHistory.push({
      editedAt: new Date(),
      previousTitle: question.title,
      previousDescription: question.description,
    });

    if (title?.trim()) question.title = title.trim();
    if (description?.trim()) question.description = description.trim();
    if (tags !== undefined) {
      const raw = typeof tags === 'string' ? JSON.parse(tags) : tags;
      question.tags = raw
        .map((t) => t.toLowerCase().trim().replace(/^#/, ''))
        .filter((t) => t.length > 0 && t.length <= 30)
        .slice(0, 10);
    }

    await question.save();
    res.json({ success: true, message: 'Question updated.', question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/forum/questions/:id  (soft archive)
 */
exports.archiveQuestion = async (req, res) => {
  try {
    const question = await ForumQuestion.findOne({ _id: req.params.id });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }
    if (question.status === 'deleted') {
      return res.status(400).json({ success: false, message: 'Question already archived.' });
    }

    question.status = 'archived';
    await question.save();
    res.json({ success: true, message: 'Question archived.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Upvotes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/forum/questions/:id/upvote
 * Toggle upvote on a question
 */
exports.toggleUpvote = async (req, res) => {
  try {
    const question = await ForumQuestion.findOne({
      _id: req.params.id,
      status: 'active',
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const userId = req.user._id;
    const hasVoted = question.upvotes.some((id) => id.toString() === userId.toString());

    if (hasVoted) {
      question.upvotes.pull(userId);
      question.upvoteCount = Math.max(0, question.upvoteCount - 1);
    } else {
      question.upvotes.addToSet(userId);
      question.upvoteCount = question.upvotes.length;
    }

    await question.save();

    res.json({
      success: true,
      upvoteCount: question.upvoteCount,
      hasUpvoted: !hasVoted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Answers ─────────────────────────────────────────────────────────────────

/**
 * GET /api/forum/questions/:id/answers
 */
exports.getAnswers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const questionId = req.params.id;

    const [bestAnswers, regularAnswers, total] = await Promise.all([
      // Best answers sorted by position
      ForumAnswer.find({ question: questionId, isBestAnswer: true, status: 'active' })
        .sort({ bestAnswerPosition: 1, bestAnswerPublishedAt: 1 })
        .limit(3)
        .populate('author', 'name avatar'),
      // Regular answers chronological
      ForumAnswer.find({ question: questionId, isBestAnswer: false, status: 'active' })
        .sort({ createdAt: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('author', 'name avatar'),
      ForumAnswer.countDocuments({ question: questionId, isBestAnswer: false, status: 'active' }),
    ]);

    const userId = req.user?._id?.toString();

    const mapAnswer = (a) => {
      const obj = a.toObject();
      obj.isOwnAnswer = userId ? a.author._id.toString() === userId : false;
      return obj;
    };

    res.json({
      success: true,
      bestAnswers: bestAnswers.map(mapAnswer),
      answers: regularAnswers.map(mapAnswer),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/forum/questions/:id/answers
 * Submit an answer
 */
exports.createAnswer = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Answer content is required.' });
    }
    if (content.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Answer must be at least 10 characters.' });
    }

    const question = await ForumQuestion.findOne({
      _id: req.params.id,
      status: 'active',
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found or not available.' });
    }

    const answer = await ForumAnswer.create({
      question: question._id,
      author: req.user._id,
      content: content.trim(),
    });

    // Update answer count on question
    question.answerCount = (question.answerCount || 0) + 1;
    await question.save();

    // Notify question author (if different user)
    if (question.author.toString() !== req.user._id.toString()) {
      await notify(
        question.author,
        'new_answer',
        `${req.user.name} answered your question: "${question.title.substring(0, 60)}"`,
        `/forum/question/${question._id}`,
        question._id,
        answer._id
      );
    }

    const populated = await ForumAnswer.findById(answer._id).populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Answer submitted successfully!',
      answer: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/forum/answers/:id
 * Edit own answer
 */
exports.editAnswer = async (req, res) => {
  try {
    const answer = await ForumAnswer.findOne({ _id: req.params.id, status: 'active' });

    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found.' });
    }
    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this answer.' });
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required.' });
    }
    if (content.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Answer must be at least 10 characters.' });
    }

    answer.editHistory.push({ editedAt: new Date(), previousContent: answer.content });
    answer.content = content.trim();
    await answer.save();

    const populated = await ForumAnswer.findById(answer._id).populate('author', 'name avatar');
    res.json({ success: true, message: 'Answer updated.', answer: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── My Activity ─────────────────────────────────────────────────────────────

/**
 * GET /api/forum/my/questions
 */
exports.getMyQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [questions, total] = await Promise.all([
      ForumQuestion.find({
        author: req.user._id,
        status: { $ne: 'deleted' },
      })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('title answerCount upvoteCount isSolved status createdAt questionRewardCredited tags'),
      ForumQuestion.countDocuments({ author: req.user._id, status: { $ne: 'deleted' } }),
    ]);

    res.json({
      success: true,
      questions,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/forum/my/answers
 */
exports.getMyAnswers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [answers, total] = await Promise.all([
      ForumAnswer.find({ author: req.user._id, status: 'active' })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('question', 'title isSolved')
        .select('content createdAt isBestAnswer bestAnswerRewardCredited bestAnswerRewardAmount question'),
      ForumAnswer.countDocuments({ author: req.user._id, status: 'active' }),
    ]);

    res.json({
      success: true,
      answers,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Forum Wallet / Transactions ─────────────────────────────────────────────

/**
 * GET /api/forum/wallet
 */
exports.getForumWallet = async (req, res) => {
  try {
    const userId = req.user._id;

    const [questionTxns, bestAnswerTxns, recentTxns, user] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, type: 'forum_question', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'forum_best_answer', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.find({ user: userId, type: { $in: ['forum_question', 'forum_best_answer'] } })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('type amount description reference createdAt balanceAfter status'),
      User.findById(userId).select('walletBalance totalEarnings'),
    ]);

    res.json({
      success: true,
      wallet: {
        totalBalance: user.walletBalance,
        questionCoins: questionTxns[0]?.total || 0,
        questionCount: questionTxns[0]?.count || 0,
        bestAnswerCoins: bestAnswerTxns[0]?.total || 0,
        bestAnswerCount: bestAnswerTxns[0]?.count || 0,
        totalForumCoins: (questionTxns[0]?.total || 0) + (bestAnswerTxns[0]?.total || 0),
      },
      transactions: recentTxns,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * GET /api/forum/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));

    const [notifications, total, unreadCount] = await Promise.all([
      ForumNotification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ForumNotification.countDocuments({ recipient: req.user._id }),
      ForumNotification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/forum/notifications/read-all
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await ForumNotification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/forum/notifications/:id/read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    await ForumNotification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Reports ─────────────────────────────────────────────────────────────────

/**
 * POST /api/forum/reports
 */
exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid target type.' });
    }
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Target ID is required.' });
    }
    const validReasons = ['spam', 'harassment', 'inappropriate', 'misinformation', 'off_topic', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid report reason.' });
    }

    // Check if already reported
    const existing = await ForumReport.findOne({
      reporter: req.user._id,
      targetType,
      targetId,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reported this content.' });
    }

    const report = await ForumReport.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details: details?.trim()?.substring(0, 500),
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Thank you for helping keep the forum safe.',
      report,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reported this content.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Tags ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/forum/tags
 * Returns popular tags
 */
exports.getPopularTags = async (req, res) => {
  try {
    const tags = await ForumQuestion.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);
    res.json({ success: true, tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
