const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    completedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    lastWatchedVideo: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    lastWatchedAt: { type: Date },
    progressPercent: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    videoProgress: [
      {
        video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
        watchedSeconds: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, package: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
