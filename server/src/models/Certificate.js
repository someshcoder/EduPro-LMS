const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    userName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now },
    verificationUrl: { type: String },
    organizationName: { type: String, default: 'CourseEarn Learning Platform' },
    instructorName: { type: String, default: 'CourseEarn Academic Council' },
    signatoryName: { type: String, default: 'Dr. Rajesh Sharma' },
    signatoryTitle: { type: String, default: 'Director of Academic Affairs' },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, package: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
