const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alertType: {
      type: String,
      enum: [
        'multiple_logins',
        'suspicious_payout',
        'rapid_referrals',
        'vpn_detected',
        'unusual_activity',
        'bulk_referral',
      ],
      required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    resolvedNote: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);
