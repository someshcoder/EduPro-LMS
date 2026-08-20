const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    duration: { type: Number, default: 0 }, // in seconds
    order: { type: Number, default: 0 },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    isLocked: { type: Boolean, default: false },
    isDRM: { type: Boolean, default: false },
    watermarkEnabled: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
