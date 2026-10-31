const mongoose = require('mongoose');

const forumReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['question', 'answer'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'off_topic', 'other'],
      required: true,
    },
    details: { type: String, maxlength: 500 },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

// Prevent duplicate reports from the same user for the same content
forumReportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });
forumReportSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('ForumReport', forumReportSchema);

