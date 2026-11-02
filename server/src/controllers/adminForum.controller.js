const mongoose = require('mongoose');
const ForumQuestion = require('../models/ForumQuestion');
const ForumAnswer = require('../models/ForumAnswer');
const ForumReport = require('../models/ForumReport');
const ForumNotification = require('../models/ForumNotification');
const ForumAuditLog = require('../models/ForumAuditLog');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const FORUM_BEST_ANSWER_REWARD = 25; // coins

/** Helper to send notifications without throwing */
async function notify(recipientId, type, message, link, questionId, answerId) {
  try {
    const dedupeKey = `${type}:${recipientId}:${questionId || ''}:${answerId || ''}:${Date.now()}`;
    await ForumNotification.create({
      recipient: recipientId,
      type,
      message,
      link,
      question: questionId || undefined,
      answer: answerId || undefined,
      isRead: false,
      dedupeKey,
    });
  } catch (_) {
    // swallow notification errors
  }
}

// ─── 1. Dashboard Stats ───────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalQuestions,
      activeQuestions,
      solvedQuestions,
      hiddenQuestions,
      archivedQuestions,
      totalAnswers,
      hiddenAnswers,
      totalBestAnswers,
      pendingReports,
      reviewedReports,
      rewardStats,
      recentQuestions,
      recentReports,
      recentAuditLogs,
      questionAuthors,
      answerAuthors,
      pendingFailedRewardsCount,
    ] = await Promise.all([
      ForumQuestion.countDocuments(),
      ForumQuestion.countDocuments({ status: 'active' }),
      ForumQuestion.countDocuments({ isSolved: true }),
      ForumQuestion.countDocuments({ status: 'hidden' }),
      ForumQuestion.countDocuments({ status: 'archived' }),
      ForumAnswer.countDocuments(),
      ForumAnswer.countDocuments({ status: 'hidden' }),
      ForumAnswer.countDocuments({ isBestAnswer: true }),
      ForumReport.countDocuments({ status: 'pending' }),
      ForumReport.countDocuments({ status: 'reviewed' }),
      Transaction.aggregate([
        {
          $match: {
            type: { $in: ['forum_question', 'forum_best_answer'] },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      ForumQuestion.find()
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ForumReport.find({ status: 'pending' })
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ForumAuditLog.find()
        .populate('admin', 'name email')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ForumQuestion.distinct('author'),
      ForumAnswer.distinct('author'),
      Transaction.countDocuments({
        type: { $in: ['forum_question', 'forum_best_answer'] },
        status: { $in: ['pending', 'failed'] },
      }),
    ]);

    const participantIds = new Set([
      ...questionAuthors.map((id) => id.toString()),
      ...answerAuthors.map((id) => id.toString()),
    ]);
    const totalParticipants = participantIds.size;

    let totalCoinsAwarded = 0;
    let questionCoins = 0;
    let bestAnswerCoins = 0;
    rewardStats.forEach((r) => {
      totalCoinsAwarded += r.totalAmount || 0;
      if (r._id === 'forum_question') questionCoins = r.totalAmount || 0;
      if (r._id === 'forum_best_answer') bestAnswerCoins = r.totalAmount || 0;
    });

    res.json({
      success: true,
      stats: {
        totalQuestions,
        activeQuestions,
        solvedQuestions,
        unsolvedQuestions: totalQuestions - solvedQuestions,
        hiddenQuestions,
        archivedQuestions,
        totalAnswers,
        hiddenAnswers,
        totalBestAnswers,
        totalParticipants,
        pendingReports,
        reviewedReports,
        pendingFailedRewards: pendingFailedRewardsCount,
        totalCoinsAwarded,
        questionCoins,
        bestAnswerCoins,
      },
      recentQuestions,
      recentReports,
      recentAuditLogs,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard statistics' });
  }
};

// ─── 2. Questions Management ──────────────────────────────────────────────────

exports.getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      search = '',
      status = 'all',
      solved = 'all',
      tag = '',
      hasReports = 'all',
      sort = 'latest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }
    if (solved === 'true') filter.isSolved = true;
    if (solved === 'false') filter.isSolved = false;

    if (tag && tag.trim()) {
      filter.tags = { $in: [new RegExp(tag.trim(), 'i')] };
    }

    if (hasReports === 'true') {
      const reportedQuestionIds = await ForumReport.find({
        targetType: 'question',
        status: 'pending',
      }).distinct('targetId');
      filter._id = { $in: reportedQuestionIds };
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'answers') sortObj = { answerCount: -1 };
    else if (sort === 'upvotes') sortObj = { upvoteCount: -1 };
    else if (sort === 'views') sortObj = { viewCount: -1 };

    const [questions, total] = await Promise.all([
      ForumQuestion.find(filter)
        .populate('author', 'name email avatar')
        .populate('bestAnswerPublishedBy', 'name email')
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ForumQuestion.countDocuments(filter),
    ]);

    // Attach pending report count per question
    const questionIds = questions.map((q) => q._id);
    const reportsCount = await ForumReport.aggregate([
      {
        $match: {
          targetType: 'question',
          targetId: { $in: questionIds },
          status: 'pending',
        },
      },
      {
        $group: {
          _id: '$targetId',
          count: { $sum: 1 },
        },
      },
    ]);

    const reportMap = {};
    reportsCount.forEach((r) => {
      reportMap[r._id.toString()] = r.count;
    });

    const enriched = questions.map((q) => ({
      ...q,
      pendingReportsCount: reportMap[q._id.toString()] || 0,
    }));

    res.json({
      success: true,
      questions: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('admin getQuestions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
};

exports.getQuestionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    const question = await ForumQuestion.findById(id)
      .populate('author', 'name email avatar role')
      .populate('bestAnswerPublishedBy', 'name email')
      .lean();

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Load all answers (including hidden/deleted)
    const answers = await ForumAnswer.find({ question: id })
      .populate('author', 'name email avatar role')
      .populate('bestAnswerRewardTxnId')
      .sort({ bestAnswerPosition: 1, createdAt: 1 })
      .lean();

    // Load reports for this question & its answers
    const answerIds = answers.map((a) => a._id);
    const [questionReports, answerReports, auditLogs] = await Promise.all([
      ForumReport.find({ targetType: 'question', targetId: id })
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      ForumReport.find({ targetType: 'answer', targetId: { $in: answerIds } })
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      ForumAuditLog.find({ question: id })
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Map answer reports to answers
    const enrichedAnswers = answers.map((ans) => ({
      ...ans,
      reports: answerReports.filter((r) => r.targetId.toString() === ans._id.toString()),
    }));

    res.json({
      success: true,
      question: {
        ...question,
        reports: questionReports,
      },
      answers: enrichedAnswers,
      auditLogs,
    });
  } catch (err) {
    console.error('getQuestionDetail error:', err);
    res.status(500).json({ success: false, message: 'Failed to load question details' });
  }
};

exports.moderateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason = '' } = req.body;

    if (!['active', 'hidden', 'archived', 'deleted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const question = await ForumQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const oldStatus = question.status;
    question.status = status;
    await question.save();

    // Create audit log
    await ForumAuditLog.create({
      admin: req.user._id,
      action: 'moderate_question',
      question: question._id,
      details: `Status changed from ${oldStatus} to ${status}. Reason: ${reason || 'N/A'}`,
      meta: { oldStatus, newStatus: status, reason },
    });

    // Notify author if hidden or restored
    if (status === 'hidden') {
      await notify(
        question.author,
        'question_status',
        `Your discussion "${question.title.substring(0, 50)}..." was hidden by moderators. Reason: ${reason || 'Community guidelines'}`,
        `/forum/question/${question._id}`,
        question._id
      );
    } else if (status === 'active' && oldStatus === 'hidden') {
      await notify(
        question.author,
        'question_status',
        `Your discussion "${question.title.substring(0, 50)}..." has been restored by moderators.`,
        `/forum/question/${question._id}`,
        question._id
      );
    }

    res.json({
      success: true,
      message: `Question status updated to ${status}`,
      question,
    });
  } catch (err) {
    console.error('moderateQuestion error:', err);
    res.status(500).json({ success: false, message: 'Failed to moderate question' });
  }
};

// ─── 3. Answers Moderation ────────────────────────────────────────────────────

exports.moderateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason = '' } = req.body;

    if (!['active', 'hidden', 'deleted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const answer = await ForumAnswer.findById(id).populate('question');
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    const oldStatus = answer.status;
    answer.status = status;
    await answer.save();

    await ForumAuditLog.create({
      admin: req.user._id,
      action: 'moderate_answer',
      question: answer.question._id,
      answer: answer._id,
      details: `Answer status changed from ${oldStatus} to ${status}. Reason: ${reason || 'N/A'}`,
      meta: { oldStatus, newStatus: status, reason },
    });

    if (status === 'hidden') {
      await notify(
        answer.author,
        'question_status',
        `Your answer in "${answer.question.title.substring(0, 50)}..." was hidden by moderators. Reason: ${reason || 'Community guidelines'}`,
        `/forum/question/${answer.question._id}`,
        answer.question._id,
        answer._id
      );
    }

    res.json({
      success: true,
      message: `Answer status updated to ${status}`,
      answer,
    });
  } catch (err) {
    console.error('moderateAnswer error:', err);
    res.status(500).json({ success: false, message: 'Failed to moderate answer' });
  }
};

// ─── 4. Top 3 Best Answers Publication & Rewards ──────────────────────────────

exports.publishBestAnswers = async (req, res) => {
  try {
    const { id } = req.params; // Question ID
    const { selectedAnswers = [] } = req.body;
    // selectedAnswers is an array: [{ answerId: string, position: 1|2|3 }]

    if (!Array.isArray(selectedAnswers)) {
      return res.status(400).json({ success: false, message: 'selectedAnswers must be an array' });
    }

    if (selectedAnswers.length > 3) {
      return res.status(400).json({ success: false, message: 'You can select at most 3 best answers' });
    }

    // Validate positions: must be 1, 2, or 3 with no duplicates
    const positions = selectedAnswers.map((s) => Number(s.position));
    const positionSet = new Set(positions);
    if (positionSet.size !== positions.length || positions.some((p) => p < 1 || p > 3)) {
      return res.status(400).json({
        success: false,
        message: 'Each selected answer must have a unique rank position between 1 and 3',
      });
    }

    const question = await ForumQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Fetch all current answers for this question
    const allAnswers = await ForumAnswer.find({ question: id });
    const answerMap = new Map(allAnswers.map((a) => [a._id.toString(), a]));

    // Validate all selected answer IDs exist and belong to this question
    for (const item of selectedAnswers) {
      if (!answerMap.has(item.answerId)) {
        return res.status(400).json({
          success: false,
          message: `Answer ID ${item.answerId} does not belong to this discussion`,
        });
      }
    }

    // Capture previous selection snapshot for audit log
    const previousSelection = allAnswers
      .filter((a) => a.isBestAnswer)
      .map((a) => ({ answerId: a._id, position: a.bestAnswerPosition }));

    const selectedIds = new Set(selectedAnswers.map((s) => s.answerId));
    const transactionRefs = [];
    const rewardedAuthors = [];

    // Step 1: Unset any previous best answers that are no longer selected
    for (const ans of allAnswers) {
      if (ans.isBestAnswer && !selectedIds.has(ans._id.toString())) {
        ans.isBestAnswer = false;
        ans.bestAnswerPosition = undefined;
        await ans.save();
      }
    }

    // Step 2: Set and reward newly selected answers
    for (const item of selectedAnswers) {
      const ans = answerMap.get(item.answerId);
      const isNewBestAnswer = !ans.isBestAnswer;

      ans.isBestAnswer = true;
      ans.bestAnswerPosition = Number(item.position);
      ans.bestAnswerPublishedAt = new Date();

      // Check if reward was already credited (Idempotent guard)
      if (!ans.bestAnswerRewardCredited) {
        // Credit 25 coins to user wallet
        const authorUser = await User.findById(ans.author);
        if (authorUser) {
          const newBalance = (authorUser.walletBalance || 0) + FORUM_BEST_ANSWER_REWARD;
          authorUser.walletBalance = newBalance;
          authorUser.totalEarnings = (authorUser.totalEarnings || 0) + FORUM_BEST_ANSWER_REWARD;
          await authorUser.save();

          // Create transaction record
          const txn = await Transaction.create({
            user: authorUser._id,
            type: 'forum_best_answer',
            amount: FORUM_BEST_ANSWER_REWARD,
            description: `Awarded 25 Forum Coins for Top ${item.position} Best Answer on: "${question.title.substring(0, 40)}"`,
            reference: question._id.toString(),
            status: 'completed',
            balanceAfter: newBalance,
          });

          ans.bestAnswerRewardCredited = true;
          ans.bestAnswerRewardTxnId = txn._id;
          ans.bestAnswerRewardAmount = FORUM_BEST_ANSWER_REWARD;
          transactionRefs.push(txn._id);
          rewardedAuthors.push({ authorId: authorUser._id, name: authorUser.name, position: item.position });

          // Send notification to author
          await notify(
            authorUser._id,
            'best_answer',
            `Congratulations! Your answer was chosen as Top ${item.position} Best Answer and you earned +25 Forum Coins!`,
            `/forum/question/${question._id}`,
            question._id,
            ans._id
          );
        }
      }

      await ans.save();
    }

    // Step 3: Update question state
    question.isSolved = selectedAnswers.length > 0;
    question.bestAnswerCount = selectedAnswers.length;
    question.bestAnswerPublishedAt = new Date();
    question.bestAnswerPublishedBy = req.user._id;
    await question.save();

    // Step 4: Record audit log
    const newSelection = selectedAnswers.map((s) => ({
      answerId: new mongoose.Types.ObjectId(s.answerId),
      position: Number(s.position),
    }));

    await ForumAuditLog.create({
      admin: req.user._id,
      action: previousSelection.length > 0 ? 'update_best_answers' : 'publish_best_answers',
      question: question._id,
      previousSelection,
      newSelection,
      details: `Published ${selectedAnswers.length} best answers (Ranks: ${positions.join(', ')}). Credited ${transactionRefs.length * FORUM_BEST_ANSWER_REWARD} coins total.`,
      transactionRefs,
    });

    res.json({
      success: true,
      message: `Successfully published ${selectedAnswers.length} best answer(s) and credited coin rewards!`,
      selectedCount: selectedAnswers.length,
      rewardedCount: transactionRefs.length,
      question,
    });
  } catch (err) {
    console.error('publishBestAnswers error:', err);
    res.status(500).json({ success: false, message: 'Failed to publish best answers' });
  }
};

// ─── 5. Reward Management ─────────────────────────────────────────────────────

exports.getRewards = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = 'all', // all | forum_question | forum_best_answer
      status = 'all', // all | completed | pending | failed
      search = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = {};
    if (type !== 'all') {
      filter.type = type;
    } else {
      filter.type = { $in: ['forum_question', 'forum_best_answer'] };
    }

    if (status !== 'all') {
      filter.status = status;
    }

    // Search user by name/email
    if (search && search.trim()) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
        ],
      }).select('_id');
      filter.user = { $in: matchingUsers.map((u) => u._id) };
    }

    const [transactions, total, summary] = await Promise.all([
      Transaction.find(filter)
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
      Transaction.aggregate([
        { $match: { type: { $in: ['forum_question', 'forum_best_answer'] } } },
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      summary,
    });
  } catch (err) {
    console.error('getRewards error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reward transactions' });
  }
};

exports.retryFailedReward = async (req, res) => {
  try {
    const { txnId } = req.params;
    const txn = await Transaction.findById(txnId).populate('user');

    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (txn.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Transaction is already completed' });
    }

    // Re-credit the user's wallet
    const user = await User.findById(txn.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newBalance = (user.walletBalance || 0) + txn.amount;
    user.walletBalance = newBalance;
    user.totalEarnings = (user.totalEarnings || 0) + txn.amount;
    await user.save();

    txn.status = 'completed';
    txn.balanceAfter = newBalance;
    await txn.save();

    // Create audit log
    await ForumAuditLog.create({
      admin: req.user._id,
      action: 'retry_reward',
      details: `Retried failed transaction ${txn._id}. Credited ${txn.amount} coins to ${user.name} (${user.email}).`,
      transactionRefs: [txn._id],
    });

    res.json({
      success: true,
      message: `Successfully retried transaction! User balance updated.`,
      transaction: txn,
    });
  } catch (err) {
    console.error('retryFailedReward error:', err);
    res.status(500).json({ success: false, message: 'Failed to retry reward transaction' });
  }
};

// ─── 6. Reports Management ────────────────────────────────────────────────────

exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', targetType = 'all' } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = {};
    if (status !== 'all') filter.status = status;
    if (targetType !== 'all') filter.targetType = targetType;

    const [reports, total] = await Promise.all([
      ForumReport.find(filter)
        .populate('reporter', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ForumReport.countDocuments(filter),
    ]);

    // Populate the actual target content (question or answer)
    const enrichedReports = await Promise.all(
      reports.map(async (rep) => {
        let targetContent = null;
        if (rep.targetType === 'question') {
          targetContent = await ForumQuestion.findById(rep.targetId)
            .select('title description status author createdAt')
            .populate('author', 'name email avatar')
            .lean();
        } else if (rep.targetType === 'answer') {
          targetContent = await ForumAnswer.findById(rep.targetId)
            .select('content status author question createdAt')
            .populate('author', 'name email avatar')
            .populate('question', 'title')
            .lean();
        }
        return {
          ...rep,
          targetContent,
        };
      })
    );

    res.json({
      success: true,
      reports: enrichedReports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('getReports error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

exports.reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actionTaken = 'none', moderationReason = '' } = req.body;

    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await ForumReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    // If moderator chose to hide/delete target content
    if (actionTaken === 'hide' || actionTaken === 'delete') {
      const newContentStatus = actionTaken === 'hide' ? 'hidden' : 'deleted';
      if (report.targetType === 'question') {
        await ForumQuestion.findByIdAndUpdate(report.targetId, { status: newContentStatus });
      } else if (report.targetType === 'answer') {
        await ForumAnswer.findByIdAndUpdate(report.targetId, { status: newContentStatus });
      }
    }

    await ForumAuditLog.create({
      admin: req.user._id,
      action: status === 'reviewed' ? 'review_report' : 'dismiss_report',
      report: report._id,
      details: `Report for ${report.targetType} (${report.targetId}) marked as ${status}. Action taken: ${actionTaken}. Reason: ${moderationReason || 'N/A'}`,
      meta: { reportStatus: status, actionTaken, moderationReason },
    });

    res.json({
      success: true,
      message: `Report marked as ${status}`,
      report,
    });
  } catch (err) {
    console.error('reviewReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to update report' });
  }
};

// ─── 7. Audit Logs ────────────────────────────────────────────────────────────

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action = 'all' } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = {};
    if (action !== 'all') {
      filter.action = action;
    }

    const [logs, total] = await Promise.all([
      ForumAuditLog.find(filter)
        .populate('admin', 'name email avatar')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ForumAuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};
