const mongoose = require('mongoose');

const forumAnswerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumQuestion', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 10000 },

    // Best answer fields (set by admin only)
    isBestAnswer: { type: Boolean, default: false },
    bestAnswerPublishedAt: { type: Date },
    bestAnswerPosition: { type: Number }, // 1, 2, or 3

    // Coin reward for best answer
    bestAnswerRewardCredited: { type: Boolean, default: false },
    bestAnswerRewardTxnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    bestAnswerRewardAmount: { type: Number, default: 25 },

    // Edit history
    editHistory: [
      {
        editedAt: { type: Date, default: Date.now },
        previousContent: { type: String },
      },
    ],

    // Status: active, hidden, deleted
    status: { type: String, enum: ['active', 'hidden', 'deleted'], default: 'active' },
  },
  { timestamps: true }
);

forumAnswerSchema.index({ question: 1, createdAt: 1 });
forumAnswerSchema.index({ author: 1, createdAt: -1 });
forumAnswerSchema.index({ question: 1, isBestAnswer: 1 });

module.exports = mongoose.model('ForumAnswer', forumAnswerSchema);

