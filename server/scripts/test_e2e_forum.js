require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const ForumQuestion = require('../src/models/ForumQuestion');
const ForumAnswer = require('../src/models/ForumAnswer');
const ForumNotification = require('../src/models/ForumNotification');
const ForumReport = require('../src/models/ForumReport');
const ForumAuditLog = require('../src/models/ForumAuditLog');
const Transaction = require('../src/models/Transaction');

// Import controllers directly to test exact business logic & state
const forumCtrl = require('../src/controllers/forum.controller');
const adminForumCtrl = require('../src/controllers/adminForum.controller');

// Mock response builder
function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Starting Full Forum System End-to-End Test Suite');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    } else {
      console.log(`✅ PASS: ${message}`);
      passedTests++;
    }
  }

  try {
    // Clean up test data from prior runs if any
    const testPrefix = 'e2e_test_' + Date.now();
    const adminEmail = `${testPrefix}_admin@example.com`;
    const userAEmail = `${testPrefix}_userA@example.com`;
    const userBEmail = `${testPrefix}_userB@example.com`;
    const userCEmail = `${testPrefix}_userC@example.com`;
    const userDEmail = `${testPrefix}_userD@example.com`;

    // ─── Setup Users ────────────────────────────────────────────────────────
    console.log('--- Step 0: Setting up Test Users ---');
    const admin = await User.create({
      name: 'Admin Tester',
      email: adminEmail,
      password: 'password123',
      role: 'admin',
      referralCode: 'REF_ADMIN_' + Date.now(),
      walletBalance: 0,
    });

    const userA = await User.create({
      name: 'Student A',
      email: userAEmail,
      password: 'password123',
      role: 'user',
      referralCode: 'REF_A_' + Date.now(),
      walletBalance: 0,
    });

    const userB = await User.create({
      name: 'Student B',
      email: userBEmail,
      password: 'password123',
      role: 'user',
      referralCode: 'REF_B_' + Date.now(),
      walletBalance: 0,
    });

    const userC = await User.create({
      name: 'Student C',
      email: userCEmail,
      password: 'password123',
      role: 'user',
      referralCode: 'REF_C_' + Date.now(),
      walletBalance: 0,
    });

    const userD = await User.create({
      name: 'Student D',
      email: userDEmail,
      password: 'password123',
      role: 'user',
      referralCode: 'REF_D_' + Date.now(),
      walletBalance: 0,
    });

    assert(admin && userA && userB && userC && userD, 'Users A, B, C, D and Admin created');

    // ─── Step 1: User A Creates Question ────────────────────────────────────
    console.log('\n--- Step 1: Question Creation Tests (+10 Coins & Failed Validation Check) ---');

    // 1a: Test failed question creation (too short title) -> MUST NOT award coins
    const initialBalanceA = (await User.findById(userA._id)).walletBalance;
    const reqFailedQ = {
      user: userA,
      body: {
        title: 'Short', // < 10 chars
        description: 'This is a description that is long enough but title is too short.',
      },
    };
    const resFailedQ = createMockRes();
    await forumCtrl.createQuestion(reqFailedQ, resFailedQ);
    assert(resFailedQ.statusCode === 400, 'Failed question validation returns 400');
    const balanceAfterFailed = (await User.findById(userA._id)).walletBalance;
    assert(balanceAfterFailed === initialBalanceA, 'Failed question creation awards NO coins');
    const txnsAfterFailed = await Transaction.countDocuments({ user: userA._id, type: 'forum_question' });
    assert(txnsAfterFailed === 0, 'No transaction created on failed question');

    // 1b: Valid question creation
    const reqCreateQ = {
      user: userA,
      body: {
        title: 'How to build fullstack React & Node.js apps effectively?',
        description: 'I want to understand the complete architectural breakdown for fullstack apps with state management and authentication.',
        tags: '["react", "nodejs", "mongodb"]',
      },
    };
    const resCreateQ = createMockRes();
    await forumCtrl.createQuestion(reqCreateQ, resCreateQ);

    assert(resCreateQ.statusCode === 201, 'Question created with status 201');
    assert(resCreateQ.data.success === true, 'Response indicates success');
    const createdQuestionId = resCreateQ.data.question._id;

    // Verify User A Wallet Balance updated to +10
    const userAPost = await User.findById(userA._id);
    assert(userAPost.walletBalance === 10, 'User A wallet balance is exactly 10 coins');

    // Verify Transaction created
    const txnA = await Transaction.findOne({ user: userA._id, type: 'forum_question' });
    assert(txnA !== null && txnA.amount === 10, 'Transaction record exists for +10 forum_question');

    // Verify Notification sent to User A
    const notifA = await ForumNotification.findOne({ recipient: userA._id, type: 'coins_credited' });
    assert(notifA !== null, 'Coin credit notification delivered to User A');

    // ─── Step 1c: Upvote Toggle Testing ──────────────────────────────────────
    console.log('\n--- Step 1c: Question Upvote Toggle Testing ---');
    const reqUpvote1 = { user: userB, params: { id: createdQuestionId } };
    const resUpvote1 = createMockRes();
    await forumCtrl.toggleUpvote(reqUpvote1, resUpvote1);
    assert(resUpvote1.statusCode === 200 && resUpvote1.data.upvoteCount === 1, 'First upvote increases count to 1');
    assert(resUpvote1.data.hasUpvoted === true, 'hasUpvoted is true after first vote');

    const reqUpvote2 = { user: userB, params: { id: createdQuestionId } };
    const resUpvote2 = createMockRes();
    await forumCtrl.toggleUpvote(reqUpvote2, resUpvote2);
    assert(resUpvote2.statusCode === 200 && resUpvote2.data.upvoteCount === 0, 'Second upvote removes vote (count returns to 0)');
    assert(resUpvote2.data.hasUpvoted === false, 'hasUpvoted is false after toggle removal');

    // ─── Step 1d: Question Editing & Permissions Testing ─────────────────────
    console.log('\n--- Step 1d: Question Editing & Security Permissions ---');
    // Non-author attempting to edit
    const reqEditUnauthorized = {
      user: userB,
      params: { id: createdQuestionId },
      body: { title: 'Unauthorized edit title attempt here', description: 'Unauthorized edit description attempt.' },
    };
    const resEditUnauthorized = createMockRes();
    await forumCtrl.editQuestion(reqEditUnauthorized, resEditUnauthorized);
    assert(resEditUnauthorized.statusCode === 403, 'Non-author cannot edit question (403 Forbidden)');

    // Author editing question
    const reqEditAuthorized = {
      user: userA,
      params: { id: createdQuestionId },
      body: {
        title: 'How to build scalable React & Node.js apps effectively?',
        description: 'Updated description: I want to understand fullstack architectural patterns with state management and authentication.',
        tags: '["react", "nodejs", "mongodb", "scaling"]',
      },
    };
    const resEditAuthorized = createMockRes();
    await forumCtrl.editQuestion(reqEditAuthorized, resEditAuthorized);
    assert(resEditAuthorized.statusCode === 200, 'Author successfully edited question');
    const updatedQ = await ForumQuestion.findById(createdQuestionId);
    assert(updatedQ.title.includes('scalable'), 'Question title updated in database');
    assert(updatedQ.editHistory.length === 1, 'Question editHistory recorded previous version');

    // ─── Step 2: Users B, C, D Submit Answers ──────────────────────────────
    console.log('\n--- Step 2: Users B, C, D Submit Answers ---');
    const answersData = [
      { user: userB, content: 'First ensure clean separation between client components and backend REST controllers with robust validation.' },
      { user: userC, content: 'Use database indexing on MongoDB and caching for frequently requested aggregations to keep it responsive.' },
      { user: userD, content: 'Always secure your routes with JWT middleware and enforce role-based access control at the server boundary.' },
    ];

    const createdAnswerIds = [];
    for (const item of answersData) {
      const reqAns = {
        user: item.user,
        params: { id: createdQuestionId },
        body: { content: item.content },
      };
      const resAns = createMockRes();
      await forumCtrl.createAnswer(reqAns, resAns);
      assert(resAns.statusCode === 201, `Answer by ${item.user.name} submitted successfully`);
      createdAnswerIds.push(resAns.data.answer._id);
    }

    // Verify Question answer count
    const qAfterAnswers = await ForumQuestion.findById(createdQuestionId);
    assert(qAfterAnswers.answerCount === 3, 'Question answer count incremented to 3');

    // ─── Step 2b: Answer Editing & Security Testing ─────────────────────────
    console.log('\n--- Step 2b: Answer Editing & Security Permissions ---');
    // Non-author attempting to edit User B's answer
    const reqEditAnsUnauthorized = {
      user: userC,
      params: { id: createdAnswerIds[0] },
      body: { content: 'Unauthorized answer update attempt by user C.' },
    };
    const resEditAnsUnauthorized = createMockRes();
    await forumCtrl.editAnswer(reqEditAnsUnauthorized, resEditAnsUnauthorized);
    assert(resEditAnsUnauthorized.statusCode === 403, 'Non-author cannot edit another user answer (403 Forbidden)');

    // Author editing own answer
    const reqEditAnsAuthorized = {
      user: userB,
      params: { id: createdAnswerIds[0] },
      body: { content: 'First ensure clean separation between client components and backend REST controllers with robust schema validation and error boundaries.' },
    };
    const resEditAnsAuthorized = createMockRes();
    await forumCtrl.editAnswer(reqEditAnsAuthorized, resEditAnsAuthorized);
    assert(resEditAnsAuthorized.statusCode === 200, 'Author successfully edited their answer');
    const updatedAnsB = await ForumAnswer.findById(createdAnswerIds[0]);
    assert(updatedAnsB.content.includes('error boundaries'), 'Answer content updated in database');
    assert(updatedAnsB.editHistory.length === 1, 'Answer editHistory recorded previous content');

    // ─── Step 3: Admin Reviews Question Details & Answers ──────────────────
    console.log('\n--- Step 3: Admin Question Review ---');
    const reqAdminDetail = { params: { id: createdQuestionId } };
    const resAdminDetail = createMockRes();
    await adminForumCtrl.getQuestionDetail(reqAdminDetail, resAdminDetail);

    assert(resAdminDetail.statusCode === 200, 'Admin can inspect question detail');
    assert(resAdminDetail.data.answers.length === 3, 'Admin sees all 3 submitted answers');

    // ─── Step 4: Admin Publishes Top 3 Best Answers (+25 Coins each) ────────
    console.log('\n--- Step 4: Top 3 Best Answers Publication & Reward Engine ---');

    // 4a: Test Validation (Rejecting duplicate positions)
    const reqInvalidRanks = {
      user: admin,
      params: { id: createdQuestionId },
      body: {
        selectedAnswers: [
          { answerId: createdAnswerIds[0].toString(), position: 1 },
          { answerId: createdAnswerIds[1].toString(), position: 1 }, // duplicate rank 1
        ],
      },
    };
    const resInvalidRanks = createMockRes();
    await adminForumCtrl.publishBestAnswers(reqInvalidRanks, resInvalidRanks);
    assert(resInvalidRanks.statusCode === 400, 'Server correctly rejects duplicate ranks');

    // 4b: Test Validation (Rejecting >3 selections)
    const reqOver3 = {
      user: admin,
      params: { id: createdQuestionId },
      body: {
        selectedAnswers: [
          { answerId: createdAnswerIds[0].toString(), position: 1 },
          { answerId: createdAnswerIds[1].toString(), position: 2 },
          { answerId: createdAnswerIds[2].toString(), position: 3 },
          { answerId: createdAnswerIds[0].toString(), position: 4 }, // 4th item
        ],
      },
    };
    const resOver3 = createMockRes();
    await adminForumCtrl.publishBestAnswers(reqOver3, resOver3);
    assert(resOver3.statusCode === 400, 'Server correctly rejects more than 3 selections');

    // 4c: Successful publication with Rank 1, 2, 3
    const reqPublishValid = {
      user: admin,
      params: { id: createdQuestionId },
      body: {
        selectedAnswers: [
          { answerId: createdAnswerIds[0].toString(), position: 1 },
          { answerId: createdAnswerIds[1].toString(), position: 2 },
          { answerId: createdAnswerIds[2].toString(), position: 3 },
        ],
      },
    };
    const resPublishValid = createMockRes();
    await adminForumCtrl.publishBestAnswers(reqPublishValid, resPublishValid);

    assert(resPublishValid.statusCode === 200, 'Best answers published successfully');
    assert(resPublishValid.data.rewardedCount === 3, 'Exactly 3 authors rewarded +25 coins each');

    // Check Users B, C, D wallet balances
    const [userBPost, userCPost, userDPost] = await Promise.all([
      User.findById(userB._id),
      User.findById(userC._id),
      User.findById(userD._id),
    ]);
    assert(userBPost.walletBalance === 25, 'User B wallet balance is exactly 25 coins');
    assert(userCPost.walletBalance === 25, 'User C wallet balance is exactly 25 coins');
    assert(userDPost.walletBalance === 25, 'User D wallet balance is exactly 25 coins');

    // Verify Question isSolved status
    const qSolved = await ForumQuestion.findById(createdQuestionId);
    assert(qSolved.isSolved === true, 'Question marked isSolved = true');
    assert(qSolved.bestAnswerCount === 3, 'Question bestAnswerCount is 3');

    // Verify Audit Log recorded
    const auditPublish = await ForumAuditLog.findOne({
      question: createdQuestionId,
      action: 'publish_best_answers',
    });
    assert(auditPublish !== null, 'ForumAuditLog entry created for publication');
    assert(auditPublish.transactionRefs.length === 3, 'Audit log references all 3 transactions');

    // ─── Step 5: Idempotency Verification ──────────────────────────────────
    console.log('\n--- Step 5: Idempotency & Zero Duplicate Rewards Check ---');
    // Admin republishes the exact same selection:
    const resRepublish = createMockRes();
    await adminForumCtrl.publishBestAnswers(reqPublishValid, resRepublish);

    assert(resRepublish.statusCode === 200, 'Republish request handled gracefully');
    assert(resRepublish.data.rewardedCount === 0, 'ZERO new rewards credited on republish');

    // Verify wallet balances did not increase
    const userBRecheck = await User.findById(userB._id);
    assert(userBRecheck.walletBalance === 25, 'User B balance remains 25 (no duplicate credit)');

    const txnCountB = await Transaction.countDocuments({ user: userB._id, type: 'forum_best_answer' });
    assert(txnCountB === 1, 'Exactly one transaction exists for User B');

    // ─── Step 6: User-Side View & Best Answer Presentation ──────────────────
    console.log('\n--- Step 6: User-Side Thread Integration ---');
    const reqUserAnswers = { params: { id: createdQuestionId }, query: { page: 1, limit: 20 } };
    const resUserAnswers = createMockRes();
    await forumCtrl.getAnswers(reqUserAnswers, resUserAnswers);

    assert(resUserAnswers.statusCode === 200, 'User side can fetch thread answers');
    assert(resUserAnswers.data.bestAnswers.length === 3, 'Top answers section contains 3 best answers');
    assert(resUserAnswers.data.bestAnswers[0].bestAnswerPosition === 1, 'First best answer is rank #1');
    assert(resUserAnswers.data.bestAnswers[1].bestAnswerPosition === 2, 'Second best answer is rank #2');
    assert(resUserAnswers.data.bestAnswers[2].bestAnswerPosition === 3, 'Third best answer is rank #3');
    assert(resUserAnswers.data.answers.length === 0, 'Non-best regular answers list is empty (all 3 are in bestAnswers)');

    // ─── Step 7: Selection Change & Preservation of Historical Rewards ──────
    console.log('\n--- Step 7: Selection Update (Removing D from best answers) ---');
    // Admin now keeps only B (#1) and C (#2)
    const reqUpdateSelection = {
      user: admin,
      params: { id: createdQuestionId },
      body: {
        selectedAnswers: [
          { answerId: createdAnswerIds[0].toString(), position: 1 },
          { answerId: createdAnswerIds[1].toString(), position: 2 },
        ],
      },
    };
    const resUpdateSelection = createMockRes();
    await adminForumCtrl.publishBestAnswers(reqUpdateSelection, resUpdateSelection);

    assert(resUpdateSelection.statusCode === 200, 'Selection updated successfully');

    // D was removed from best answers, but historical reward MUST NOT be reversed:
    const userDRecheck = await User.findById(userD._id);
    assert(userDRecheck.walletBalance === 25, 'User D retains +25 coins (historical rewards preserved)');

    // Now D should appear in regular answers on user side, while B & C remain in bestAnswers
    const resUserAnswersUpdated = createMockRes();
    await forumCtrl.getAnswers(reqUserAnswers, resUserAnswersUpdated);
    assert(resUserAnswersUpdated.data.bestAnswers.length === 2, 'Best answers count is now 2');
    assert(resUserAnswersUpdated.data.answers.length === 1, 'Answer D now appears in regular answers list');

    // ─── Step 8: Moderation Integration (Hiding Content) ───────────────────
    console.log('\n--- Step 8: Content Moderation & Feed Sync ---');
    // Admin hides the question
    const reqHideQ = {
      user: admin,
      params: { id: createdQuestionId },
      body: { status: 'hidden', reason: 'Community review' },
    };
    const resHideQ = createMockRes();
    await adminForumCtrl.moderateQuestion(reqHideQ, resHideQ);
    assert(resHideQ.statusCode === 200, 'Question status changed to hidden');

    // User feed should not list hidden question
    const reqPublicFeed = { query: { page: 1, limit: 12, search: 'React & Node' } };
    const resPublicFeed = createMockRes();
    await forumCtrl.getQuestions(reqPublicFeed, resPublicFeed);
    const foundInFeed = resPublicFeed.data.questions.some(q => q._id.toString() === createdQuestionId.toString());
    assert(foundInFeed === false, 'Hidden question is excluded from public feed');

    // Restore question
    const reqRestoreQ = {
      user: admin,
      params: { id: createdQuestionId },
      body: { status: 'active', reason: 'Verified safe' },
    };
    const resRestoreQ = createMockRes();
    await adminForumCtrl.moderateQuestion(reqRestoreQ, resRestoreQ);
    assert(resRestoreQ.statusCode === 200, 'Question restored to active');

    // ─── Step 9: Content Reporting & Review ────────────────────────────────
    console.log('\n--- Step 9: Content Reporting & Moderation Queue ---');
    const reqReport = {
      user: userB,
      body: {
        targetType: 'answer',
        targetId: createdAnswerIds[2].toString(),
        reason: 'spam',
        details: 'Suspected duplicate answer',
      },
    };
    const resReport = createMockRes();
    await forumCtrl.createReport(reqReport, resReport);
    assert(resReport.statusCode === 201, 'Report created successfully');
    const reportId = resReport.data.report._id;

    // Admin reviews report
    const reqReviewReport = {
      user: admin,
      params: { id: reportId },
      body: { status: 'reviewed', actionTaken: 'none', moderationReason: 'Content is valid' },
    };
    const resReviewReport = createMockRes();
    await adminForumCtrl.reviewReport(reqReviewReport, resReviewReport);
    assert(resReviewReport.statusCode === 200, 'Report reviewed and resolved');

    // ─── Step 10: Reward Ledger & Safe Retry ────────────────────────────────
    console.log('\n--- Step 10: Reward Management & Failed Transaction Retry ---');
    // Create a mock failed transaction
    const failedTxn = await Transaction.create({
      user: userD._id,
      type: 'forum_best_answer',
      amount: 25,
      description: 'Failed reward simulation',
      status: 'failed',
    });

    const initialDWallet = (await User.findById(userD._id)).walletBalance;

    const reqRetry = {
      user: admin,
      params: { txnId: failedTxn._id },
    };
    const resRetry = createMockRes();
    await adminForumCtrl.retryFailedReward(reqRetry, resRetry);

    assert(resRetry.statusCode === 200, 'Failed reward retried successfully');
    const postRetryD = await User.findById(userD._id);
    assert(postRetryD.walletBalance === initialDWallet + 25, 'User D balance credited on retry');

    const updatedTxn = await Transaction.findById(failedTxn._id);
    assert(updatedTxn.status === 'completed', 'Transaction status updated to completed');

    // ─── Step 10b: Question Archiving & Security Testing ───────────────────
    console.log('\n--- Step 10b: Question Archiving & Security Testing ---');
    // Non-author attempting to archive question
    const reqArchiveUnauthorized = {
      user: userB,
      params: { id: createdQuestionId },
    };
    const resArchiveUnauthorized = createMockRes();
    await forumCtrl.archiveQuestion(reqArchiveUnauthorized, resArchiveUnauthorized);
    assert(resArchiveUnauthorized.statusCode === 403, 'Non-author cannot archive question (403 Forbidden)');

    // Author archiving question
    const reqArchiveAuthorized = {
      user: userA,
      params: { id: createdQuestionId },
    };
    const resArchiveAuthorized = createMockRes();
    await forumCtrl.archiveQuestion(reqArchiveAuthorized, resArchiveAuthorized);
    assert(resArchiveAuthorized.statusCode === 200, 'Author successfully archived discussion');
    const archivedQ = await ForumQuestion.findById(createdQuestionId);
    assert(archivedQ.status === 'archived', 'Question status in DB is archived');

    // Attempting to post answer to archived question must fail
    const reqAnswerArchived = {
      user: userC,
      params: { id: createdQuestionId },
      body: { content: 'This answer should be rejected because question is archived.' },
    };
    const resAnswerArchived = createMockRes();
    await forumCtrl.createAnswer(reqAnswerArchived, resAnswerArchived);
    assert(resAnswerArchived.statusCode === 404, 'Cannot answer archived question (rejected)');

    // Restore question status to active for subsequent search tests
    archivedQ.status = 'active';
    await archivedQ.save();

    // ─── Step 10c: Search, Filtering & Stats Testing ────────────────────────
    console.log('\n--- Step 10c: Search, Tag Filtering & Dashboard Stats ---');
    // Tag filter
    const reqFilterTag = { query: { tag: 'scaling' } };
    const resFilterTag = createMockRes();
    await forumCtrl.getQuestions(reqFilterTag, resFilterTag);
    assert(resFilterTag.data.questions.length >= 1, 'Tag filter correctly returns matching questions');

    // Solved filter
    const reqFilterSolved = { query: { solved: 'true' } };
    const resFilterSolved = createMockRes();
    await forumCtrl.getQuestions(reqFilterSolved, resFilterSolved);
    assert(resFilterSolved.data.questions.some(q => q._id.toString() === createdQuestionId.toString()), 'Solved filter includes solved question');

    // Admin Dashboard Stats verification
    const resStats = createMockRes();
    await adminForumCtrl.getDashboardStats({}, resStats);
    assert(resStats.statusCode === 200, 'Admin Dashboard stats retrieved successfully');
    assert(resStats.data.stats.totalQuestions >= 1, 'Stats reflects total questions in database');
    assert(resStats.data.stats.totalAnswers >= 3, 'Stats reflects total answers in database');
    assert(resStats.data.stats.totalBestAnswers >= 2, 'Stats reflects total published best answers');
    assert(resStats.data.stats.totalCoinsAwarded >= 60, 'Stats reflects coins awarded from DB');

    // ─── Step 11: Security & Non-Admin Rejection ───────────────────────────
    console.log('\n--- Step 11: Security Checks & Role Verification ---');
    // Verify admin middleware blocks non-admin
    const { adminOnly } = require('../src/middleware/admin.middleware');
    let blockedNonAdmin = false;
    const reqNonAdmin = { user: userA };
    const resNonAdmin = createMockRes();
    adminOnly(reqNonAdmin, resNonAdmin, () => {
      blockedNonAdmin = false;
    });
    if (resNonAdmin.statusCode === 403) {
      blockedNonAdmin = true;
    }
    assert(blockedNonAdmin === true, 'adminOnly middleware returns 403 for non-admin user');

    // Clean up test data
    console.log('\n--- Cleaning up Test Artifacts ---');
    await ForumQuestion.deleteMany({ author: userA._id });
    await ForumAnswer.deleteMany({ _id: { $in: createdAnswerIds } });
    await Transaction.deleteMany({ user: { $in: [userA._id, userB._id, userC._id, userD._id] } });
    await ForumNotification.deleteMany({ recipient: { $in: [userA._id, userB._id, userC._id, userD._id] } });
    await ForumReport.deleteMany({ _id: reportId });
    await ForumAuditLog.deleteMany({ admin: admin._id });
    await User.deleteMany({ _id: { $in: [admin._id, userA._id, userB._id, userC._id, userD._id] } });
    console.log('✅ Test artifacts cleaned up');

    console.log('\n====================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions`);
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUNNER ERROR:', err);
    process.exit(1);
  }
}

runTests();
