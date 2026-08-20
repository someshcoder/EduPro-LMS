const FraudAlert = require('../models/FraudAlert');
const Session = require('../models/Session');

/**
 * Checks for suspicious activity on login / payout
 * Creates fraud alerts if thresholds exceeded
 */
exports.checkFraud = async (userId, type, metadata = {}) => {
  try {
    if (type === 'multiple_logins') {
      const recentSessions = await Session.countDocuments({
        user: userId,
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (recentSessions > 5) {
        await FraudAlert.create({
          user: userId,
          alertType: 'multiple_logins',
          severity: recentSessions > 10 ? 'high' : 'medium',
          description: `${recentSessions} active sessions detected in last 24 hours`,
          metadata: { sessionCount: recentSessions, ...metadata },
          ipAddress: metadata.ip,
        });
      }
    }

    if (type === 'suspicious_payout') {
      const PayoutRequest = require('../models/PayoutRequest');
      const recentPayouts = await PayoutRequest.countDocuments({
        user: userId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      if (recentPayouts > 3) {
        await FraudAlert.create({
          user: userId,
          alertType: 'suspicious_payout',
          severity: 'high',
          description: `${recentPayouts} payout requests in last 7 days`,
          metadata: { payoutCount: recentPayouts, amount: metadata.amount },
          ipAddress: metadata.ip,
        });
      }
    }
  } catch (err) {
    console.error('Fraud check error:', err.message);
  }
};
