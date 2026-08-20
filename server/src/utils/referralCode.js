const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique referral code for a user
 * Format: EDP-XXXXXX (uppercase alphanumeric)
 */
exports.generateReferralCode = () => {
  const uuid = uuidv4().replace(/-/g, '').toUpperCase();
  return `EDP-${uuid.substring(0, 6)}`;
};

/**
 * Build referral tree (up to 2 levels)
 * @param {string} userId - The user whose team to fetch
 * @param {Model} UserModel - The User model
 */
exports.getTeamTree = async (userId, UserModel) => {
  // Level 1 - Direct referrals
  const level1 = await UserModel.find({ referredBy: userId })
    .select('name email phone createdAt walletBalance totalEarnings kycStatus isBlocked referralCode')
    .lean();

  // Level 2 - Indirect referrals (referrals of referrals)
  const level1Ids = level1.map((u) => u._id);
  const level2 = await UserModel.find({ referredBy: { $in: level1Ids } })
    .select('name email phone createdAt walletBalance totalEarnings kycStatus isBlocked referredBy referralCode')
    .lean();

  return { level1, level2, totalTeam: level1.length + level2.length };
};
