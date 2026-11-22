const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Package = require('../models/Package');
const ParentPackage = require('../models/ParentPackage');

/**
 * Dynamically resolves all courses that belong to the Ultimate Parent Package:
 * - All courses currently assigned to Starter
 * - All courses currently assigned to Intermediate
 * - All courses currently assigned to Advanced
 * - Growth Hack Strategies
 * - Any additional courses directly linked to Ultimate
 */
async function getDynamicUltimateCourses() {
  const [starter, intermediate, advanced, ultimate, growthHack] = await Promise.all([
    ParentPackage.findOne({ tier: 'starter' }).select('courses'),
    ParentPackage.findOne({ tier: 'intermediate' }).select('courses'),
    ParentPackage.findOne({ tier: 'advanced' }).select('courses'),
    ParentPackage.findOne({ tier: 'ultimate' }).select('courses'),
    Package.findOne({ title: { $regex: /growth hack/i } }).select('_id'),
  ]);

  const courseSet = new Set();
  starter?.courses?.forEach((c) => courseSet.add(c.toString()));
  intermediate?.courses?.forEach((c) => courseSet.add(c.toString()));
  advanced?.courses?.forEach((c) => courseSet.add(c.toString()));
  ultimate?.courses?.forEach((c) => courseSet.add(c.toString()));
  if (growthHack) courseSet.add(growthHack._id.toString());
  return Array.from(courseSet);
}

/**
 * Recalculate and return all currently active course IDs accessible by a user.
 * Combines:
 * 1. Active, non-expired Parent Package purchases (including Ultimate dynamic sync)
 * 2. Active, non-expired individual Course purchases
 * 3. Active package upgrades
 * 4. Preserves backward-compatible legacy enrollments (giving them valid 1-year access)
 */
async function getActiveUserCourseAccess(userId) {
  const now = new Date();

  // Find all active, non-expired purchases
  const activePurchases = await Purchase.find({
    user: userId,
    status: 'active',
    expiresAt: { $gt: now },
  }).populate('parentPackage');

  const courseAccessMap = new Map();
  let cachedUltimateCourses = null;

  for (const purchase of activePurchases) {
    let accessibleCourses = [];

    if (purchase.itemType === 'parent_package' || purchase.itemType === 'package_upgrade') {
      if (purchase.parentPackage?.tier === 'ultimate') {
        if (!cachedUltimateCourses) {
          cachedUltimateCourses = await getDynamicUltimateCourses();
        }
        accessibleCourses = cachedUltimateCourses;
      } else if (purchase.parentPackage?.courses && purchase.parentPackage.courses.length > 0) {
        accessibleCourses = purchase.parentPackage.courses.map((c) => c.toString());
      } else if (purchase.grantedCourses && purchase.grantedCourses.length > 0) {
        accessibleCourses = purchase.grantedCourses.map((c) => c.toString());
      }
    } else if (purchase.course) {
      accessibleCourses = [purchase.course.toString()];
    } else if (purchase.grantedCourses && purchase.grantedCourses.length > 0) {
      accessibleCourses = purchase.grantedCourses.map((c) => c.toString());
    }

    for (const courseId of accessibleCourses) {
      const idStr = courseId.toString();
      if (!courseAccessMap.has(idStr) || courseAccessMap.get(idStr).expiresAt < purchase.expiresAt) {
        courseAccessMap.set(idStr, {
          courseId: idStr,
          purchaseId: purchase._id,
          sourceType: purchase.itemType,
          sourceName: purchase.parentPackage?.name || 'Individual Course',
          purchaseDate: purchase.purchaseDate,
          expiresAt: purchase.expiresAt,
        });
      }
    }
  }

  // Handle legacy user.enrolledPackages: ensure existing users do not lose access
  const user = await User.findById(userId);
  if (user && user.enrolledPackages && user.enrolledPackages.length > 0) {
    for (const legacyPkgId of user.enrolledPackages) {
      const idStr = legacyPkgId.toString();
      if (!courseAccessMap.has(idStr)) {
        // If no purchase record exists yet, create or grant standard 1-year grace access
        courseAccessMap.set(idStr, {
          courseId: idStr,
          purchaseId: null,
          sourceType: 'legacy_enrollment',
          sourceName: 'Course Enrollment',
          purchaseDate: user.createdAt,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
      }
    }
  }

  return courseAccessMap;
}

/**
 * Checks whether user has valid active access to a specific course ID.
 */
async function hasCourseAccess(userId, courseId) {
  const courseIdStr = courseId.toString();
  const accessMap = await getActiveUserCourseAccess(userId);
  return accessMap.has(courseIdStr);
}

/**
 * Synchronize user.enrolledPackages array with active valid courses.
 */
async function syncUserEnrolledPackages(userId) {
  const accessMap = await getActiveUserCourseAccess(userId);
  const activeCourseIds = Array.from(accessMap.keys());
  await User.findByIdAndUpdate(userId, { enrolledPackages: activeCourseIds });
  return activeCourseIds;
}

module.exports = {
  getActiveUserCourseAccess,
  hasCourseAccess,
  syncUserEnrolledPackages,
  getDynamicUltimateCourses,
};
