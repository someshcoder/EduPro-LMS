const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    thumbnail: { type: String },
    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number },
    currency: { type: String, default: 'INR' },
    category: { type: String },
    tags: [{ type: String }],
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    language: { type: String, default: 'Hindi' },
    totalVideos: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // in minutes
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    resources: [
      {
        title: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
      },
    ],
    commissionRules: {
      level1Percent: { type: Number, default: 10 },
      level2Percent: { type: Number, default: 5 },
    },
    requirements: [{ type: String }],
    whatYouLearn: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
