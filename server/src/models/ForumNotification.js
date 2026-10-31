const mongoose = require('mongoose');

const forumNotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'new_answer',         // Someone answered your question
        'best_answer',        // Your answer was selected as best
        'coins_credited',     // Forum coins credited
        'question_status',    // Question status update
      ],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String }, // e.g. /forum/question/:id
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumQuestion' },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumAnswer' },
    isRead: { type: Boolean, default: false },
    // Deduplication key – prevents duplicate notifications for same event
    dedupeKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

forumNotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('ForumNotification', forumNotificationSchema);

