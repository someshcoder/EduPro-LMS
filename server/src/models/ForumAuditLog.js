const mongoose = require('mongoose');

const forumAuditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'publish_best_answers',
        'update_best_answers',
        'clear_best_answers',
        'moderate_question',
        'moderate_answer',
        'review_report',
        'dismiss_report',
        'retry_reward',
      ],
      required: true,
    },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumQuestion' },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumAnswer' },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumReport' },
    // Snapshot of previous best answer selection (array of answer IDs with positions)
    previousSelection: [
      {
        answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumAnswer' },
        position: { type: Number },
      },
    ],
    // New selection after the action
    newSelection: [
      {
        answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumAnswer' },
        position: { type: Number },
      },
    ],
    // Human-readable details about the action
    details: { type: String, maxlength: 1000 },
    // Transaction IDs created during this action
    transactionRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    // Extra metadata (e.g. moderation reason, report action taken)
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

forumAuditLogSchema.index({ admin: 1, createdAt: -1 });
forumAuditLogSchema.index({ question: 1, createdAt: -1 });
forumAuditLogSchema.index({ action: 1, createdAt: -1 });
forumAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ForumAuditLog', forumAuditLogSchema);

