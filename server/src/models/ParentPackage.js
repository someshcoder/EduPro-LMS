const mongoose = require('mongoose');

const parentPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    tagline: { type: String, trim: true },
    tier: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tierOrder: { type: Number, required: true }, // 1: Starter, 2: Intermediate, 3: Advanced, 4: Ultimate
    description: { type: String, required: true },
    shortDescription: { type: String },
    thumbnail: { type: String },
    badge: { type: String },
    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number },
    currency: { type: String, default: 'INR' },
    isPublished: { type: Boolean, default: true },
    highlights: [{ type: String }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
    commissionRules: {
      level1Percent: { type: Number, default: 30 },
      level2Percent: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParentPackage', parentPackageSchema);
