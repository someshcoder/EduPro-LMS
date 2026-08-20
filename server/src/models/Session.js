const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    refreshToken: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceType: { type: String },
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revokeReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
