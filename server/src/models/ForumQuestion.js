const mongoose = require('mongoose');

const forumQuestionSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    tags: [{ type: String, trim: true, maxlength: 50 }],
    attachments: [
      {
        filename: { type: String },
        originalName: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        url: { type: String },
      },
    ],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    // Status: active, archived, hidden, deleted
    status: { type: String, enum: ['active', 'archived', 'hidden', 'deleted'], default: 'active' },

    // Solved: true when admin has published at least one best answer
    isSolved: { type: Boolean, default: false },
    bestAnswerPublishedAt: { type: Date },
    bestAnswerPublishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bestAnswerCount: { type: Number, default: 0 },

    // Coin reward tracking
    questionRewardCredited: { type: Boolean, default: false },
    questionRewardTxnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

    // Edit history
    editHistory: [
      {
        editedAt: { type: Date, default: Date.now },
        previousTitle: { type: String },
        previousDescription: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Text index for search
forumQuestionSchema.index({ title: 'text', description: 'text', tags: 'text' });
forumQuestionSchema.index({ author: 1, createdAt: -1 });
forumQuestionSchema.index({ status: 1, createdAt: -1 });
forumQuestionSchema.index({ upvoteCount: -1 });
forumQuestionSchema.index({ answerCount: -1 });

module.exports = mongoose.model('ForumQuestion', forumQuestionSchema);

