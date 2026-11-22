const ParentPackage = require('../models/ParentPackage');
const Package = require('../models/Package');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const { getActiveUserCourseAccess, syncUserEnrolledPackages } = require('../utils/accessControl');

/**
 * @desc    Get all Parent Packages (Admin view with active purchaser count)
 * @route   GET /api/admin/parent-packages
 */
exports.getAdminParentPackages = async (req, res) => {
  try {
    const packages = await ParentPackage.find()
      .populate('courses', 'title thumbnail totalVideos totalDuration price discountPrice category level isPublished')
      .sort({ tierOrder: 1 });

    const now = new Date();

    // Attach active purchaser counts
    const annotatedPackages = await Promise.all(
      packages.map(async (pkg) => {
        const activeCount = await Purchase.countDocuments({
          parentPackage: pkg._id,
          status: 'active',
          expiresAt: { $gt: now },
        });

        const totalPurchases = await Purchase.countDocuments({
          parentPackage: pkg._id,
        });

        return {
          ...pkg.toObject(),
          activePurchasersCount: activeCount,
          totalPurchasesCount: totalPurchases,
        };
      })
    );

    res.json({ success: true, packages: annotatedPackages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new Parent Package
 * @route   POST /api/admin/parent-packages
 */
exports.createAdminParentPackage = async (req, res) => {
  try {
    const {
      name,
      slug,
      tagline,
      tier,
      tierOrder,
      description,
      shortDescription,
      price,
      discountPrice,
      badge,
      highlights,
      courses,
      isPublished,
      level1Percent,
      level2Percent,
    } = req.body;

    if (!name || !tier || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, tier, and price are required.' });
    }

    // Check tier uniqueness
    const existingTier = await ParentPackage.findOne({ tier: tier.toLowerCase() });
    if (existingTier) {
      return res.status(400).json({
        success: false,
        message: `A Parent Package with tier "${tier}" already exists (${existingTier.name}). Please edit it instead.`,
      });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let thumbnail = req.body.thumbnail || '';
    if (req.file) {
      thumbnail = req.file.path.replace(/\\/g, '/');
    }

    let parsedHighlights = [];
    if (highlights) {
      parsedHighlights = Array.isArray(highlights) ? highlights : JSON.parse(highlights || '[]');
    }

    let parsedCourses = [];
    if (courses) {
      parsedCourses = Array.isArray(courses) ? courses : JSON.parse(courses || '[]');
    }

    const newPackage = await ParentPackage.create({
      name,
      slug: generatedSlug,
      tagline,
      tier: tier.toLowerCase(),
      tierOrder: tierOrder || 1,
      description: description || name,
      shortDescription,
      thumbnail,
      badge,
      price: Number(price) || 0,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      highlights: parsedHighlights,
      courses: parsedCourses,
      isPublished: isPublished === true || isPublished === 'true',
      commissionRules: {
        level1Percent: level1Percent !== undefined ? Number(level1Percent) : 30,
        level2Percent: level2Percent !== undefined ? Number(level2Percent) : 10,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Parent Package created successfully!',
      package: newPackage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Parent Package details
 * @route   PUT /api/admin/parent-packages/:id
 */
exports.updateAdminParentPackage = async (req, res) => {
  try {
    const pkg = await ParentPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Parent Package not found.' });
    }

    const {
      name,
      slug,
      tagline,
      tier,
      tierOrder,
      description,
      shortDescription,
      price,
      discountPrice,
      badge,
      highlights,
      courses,
      isPublished,
      level1Percent,
      level2Percent,
    } = req.body;

    if (name) pkg.name = name;
    if (slug) pkg.slug = slug.toLowerCase();
    if (tagline !== undefined) pkg.tagline = tagline;
    if (tier && tier !== pkg.tier) {
      const existing = await ParentPackage.findOne({ tier: tier.toLowerCase(), _id: { $ne: pkg._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Tier "${tier}" is already assigned to another package.` });
      }
      pkg.tier = tier.toLowerCase();
    }
    if (tierOrder !== undefined) pkg.tierOrder = Number(tierOrder);
    if (description !== undefined) pkg.description = description;
    if (shortDescription !== undefined) pkg.shortDescription = shortDescription;
    if (price !== undefined) pkg.price = Number(price);
    if (discountPrice !== undefined) pkg.discountPrice = discountPrice ? Number(discountPrice) : undefined;
    if (badge !== undefined) pkg.badge = badge;
    if (isPublished !== undefined) pkg.isPublished = isPublished === true || isPublished === 'true';

    if (req.file) {
      pkg.thumbnail = req.file.path.replace(/\\/g, '/');
    } else if (req.body.thumbnail !== undefined) {
      pkg.thumbnail = req.body.thumbnail;
    }

    if (highlights !== undefined) {
      pkg.highlights = Array.isArray(highlights) ? highlights : JSON.parse(highlights || '[]');
    }

    if (courses !== undefined) {
      pkg.courses = Array.isArray(courses) ? courses : JSON.parse(courses || '[]');
    }

    if (level1Percent !== undefined || level2Percent !== undefined) {
      pkg.commissionRules = {
        level1Percent: level1Percent !== undefined ? Number(level1Percent) : pkg.commissionRules?.level1Percent || 30,
        level2Percent: level2Percent !== undefined ? Number(level2Percent) : pkg.commissionRules?.level2Percent || 10,
      };
    }

    await pkg.save();

    const populatedPkg = await ParentPackage.findById(pkg._id).populate(
      'courses',
      'title thumbnail totalVideos totalDuration price discountPrice category level isPublished'
    );

    res.json({
      success: true,
      message: 'Parent Package updated successfully!',
      package: populatedPkg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle Publish / Unpublish status
 * @route   PATCH /api/admin/parent-packages/:id/publish
 */
exports.togglePublishStatus = async (req, res) => {
  try {
    const pkg = await ParentPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Parent Package not found.' });
    }

    pkg.isPublished = !pkg.isPublished;
    await pkg.save();

    res.json({
      success: true,
      message: `Package "${pkg.name}" is now ${pkg.isPublished ? 'Published' : 'Unpublished'}.`,
      isPublished: pkg.isPublished,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to synchronize Ultimate Package courses with lower tiers (Starter + Intermediate + Advanced + Growth Hack)
 */
const performUltimateSync = async () => {
  const ultimatePkg = await ParentPackage.findOne({ tier: 'ultimate' });
  if (!ultimatePkg) return null;

  const [starter, intermediate, advanced, growthHackCourse] = await Promise.all([
    ParentPackage.findOne({ tier: 'starter' }),
    ParentPackage.findOne({ tier: 'intermediate' }),
    ParentPackage.findOne({ tier: 'advanced' }),
    Package.findOne({ title: { $regex: /growth hack/i } }),
  ]);

  const combinedCourseSet = new Set();
  starter?.courses?.forEach((c) => combinedCourseSet.add(c.toString()));
  intermediate?.courses?.forEach((c) => combinedCourseSet.add(c.toString()));
  advanced?.courses?.forEach((c) => combinedCourseSet.add(c.toString()));
  if (growthHackCourse) combinedCourseSet.add(growthHackCourse._id.toString());

  ultimatePkg.courses = Array.from(combinedCourseSet);
  await ultimatePkg.save();
  return ultimatePkg;
};

/**
 * @desc    Add or remove courses from Parent Package
 * @route   PATCH /api/admin/parent-packages/:id/courses
 */
exports.updatePackageCourses = async (req, res) => {
  try {
    const { action, courseId, courseIds } = req.body;
    const pkg = await ParentPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Parent Package not found.' });
    }

    if (courseIds && Array.isArray(courseIds)) {
      // Direct replace with verified array
      pkg.courses = courseIds;
    } else if (action === 'add' && courseId) {
      if (!pkg.courses.some((id) => id.toString() === courseId.toString())) {
        pkg.courses.push(courseId);
      }
    } else if (action === 'remove' && courseId) {
      // Unlink course without deleting the original course
      pkg.courses = pkg.courses.filter((id) => id.toString() !== courseId.toString());
    }

    await pkg.save();

    // Auto-sync Ultimate if a lower tier was updated
    if (pkg.tier !== 'ultimate') {
      await performUltimateSync();
    }

    const updated = await ParentPackage.findById(pkg._id).populate(
      'courses',
      'title thumbnail totalVideos totalDuration price discountPrice category level isPublished'
    );

    res.json({
      success: true,
      message: 'Course assignments updated successfully!',
      package: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Synchronize Ultimate Package courses with lower tiers (Starter + Intermediate + Advanced + Growth Hack)
 * @route   POST /api/admin/parent-packages/sync-ultimate
 */
exports.syncUltimatePackage = async (req, res) => {
  try {
    const syncedUltimate = await performUltimateSync();
    if (!syncedUltimate) {
      return res.status(404).json({ success: false, message: 'Ultimate Parent Package not found.' });
    }

    const populated = await ParentPackage.findById(syncedUltimate._id).populate(
      'courses',
      'title thumbnail totalVideos totalDuration price discountPrice category level'
    );

    res.json({
      success: true,
      message: `Ultimate Package synchronized successfully! Now includes ${populated.courses.length} courses.`,
      package: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete Parent Package (Protected with verification)
 * @route   DELETE /api/admin/parent-packages/:id
 */
exports.deleteAdminParentPackage = async (req, res) => {
  try {
    const pkg = await ParentPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Parent Package not found.' });
    }

    const activePurchases = await Purchase.countDocuments({
      parentPackage: pkg._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (activePurchases > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete package "${pkg.name}" because it currently has ${activePurchases} active enrolled student(s). Unpublish it instead.`,
      });
    }

    await ParentPackage.findByIdAndDelete(pkg._id);

    res.json({ success: true, message: `Package "${pkg.name}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all purchases (Parent Packages, Courses, Upgrades)
 * @route   GET /api/admin/purchases
 */
exports.getAllPurchases = async (req, res) => {
  try {
    const { search, status, itemType, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      if (status === 'expired') {
        query.status = 'active';
        query.expiresAt = { $lte: new Date() };
      } else {
        query.status = status;
      }
    }

    if (itemType && itemType !== 'all') {
      query.itemType = itemType;
    }

    // Search query by invoice number or payment ref
    if (search) {
      // Find matching users first
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { paymentRef: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const purchases = await Purchase.find(query)
      .populate('user', 'name email phone referralCode')
      .populate('parentPackage', 'name thumbnail tier tierOrder')
      .populate('course', 'title thumbnail category level')
      .populate('invoice', 'invoiceNumber paymentMethod totalAmount')
      .sort({ purchaseDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Purchase.countDocuments(query);
    const now = new Date();

    const formatted = purchases.map((p) => {
      const isExpired = new Date(p.expiresAt) <= now;
      let effectiveStatus = p.status;
      if (p.status === 'active' && isExpired) {
        effectiveStatus = 'expired';
      }

      return {
        ...p.toObject(),
        effectiveStatus,
        isExpired,
        daysRemaining: isExpired ? 0 : Math.max(0, Math.ceil((new Date(p.expiresAt) - now) / (1000 * 60 * 60 * 24))),
      };
    });

    res.json({
      success: true,
      purchases: formatted,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Refund or Cancel a Purchase (With recalculation of user access)
 * @route   POST /api/admin/purchases/:id/refund
 */
exports.refundOrCancelPurchase = async (req, res) => {
  try {
    const { action = 'refund', adminRemarks = '' } = req.body;
    const purchase = await Purchase.findById(req.params.id)
      .populate('user', 'name email')
      .populate('parentPackage', 'name')
      .populate('course', 'title');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase record not found.' });
    }

    if (purchase.status === 'refunded' || purchase.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `This purchase is already marked as ${purchase.status}.`,
      });
    }

    const newStatus = action === 'cancel' ? 'cancelled' : 'refunded';
    purchase.status = newStatus;
    purchase.adminRemarks = adminRemarks;

    if (newStatus === 'refunded') {
      purchase.refundedAt = new Date();
    } else {
      purchase.cancelledAt = new Date();
    }

    await purchase.save();

    // Also update invoice status if exists
    if (purchase.invoice) {
      await Invoice.findByIdAndUpdate(purchase.invoice, { status: newStatus });
    }

    // Record refund/cancellation transaction
    await Transaction.create({
      user: purchase.user._id,
      type: 'refund',
      amount: purchase.totalAmount,
      description: `${action === 'cancel' ? 'Cancellation' : 'Refund'} of ${
        purchase.parentPackage?.name || purchase.course?.title || 'Enrollment'
      }`,
      reference: purchase.invoiceNumber,
      status: 'completed',
    });

    // Recalculate and synchronize user's active courses!
    // Access rule: Only courses solely granted by this refunded purchase are revoked.
    // If another valid purchase independently grants the same course, access remains ACTIVE.
    const activeCourseIds = await syncUserEnrolledPackages(purchase.user._id);

    res.json({
      success: true,
      message: `Purchase ${newStatus} successfully! User access recalculated (${activeCourseIds.length} course(s) remain active).`,
      purchase,
      remainingActiveCoursesCount: activeCourseIds.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get detailed user access & purchase overview for Admin inspection
 * @route   GET /api/admin/users/:id/access-overview
 */
exports.getUserAccessOverview = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email phone role kycStatus createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const purchases = await Purchase.find({ user: user._id })
      .populate('parentPackage', 'name thumbnail tier tierOrder')
      .populate('course', 'title thumbnail price')
      .populate('invoice', 'invoiceNumber totalAmount')
      .sort({ purchaseDate: -1 });

    const accessMap = await getActiveUserCourseAccess(user._id);
    const activeCourseIds = Array.from(accessMap.keys());

    const activeCourses = await Package.find({ _id: { $in: activeCourseIds } }).select(
      'title thumbnail totalVideos totalDuration category level price'
    );

    const now = new Date();
    const coursesWithAccessInfo = activeCourses.map((c) => {
      const access = accessMap.get(c._id.toString());
      const isExpired = access ? new Date(access.expiresAt) <= now : false;
      const daysRemaining = access && !isExpired ? Math.ceil((new Date(access.expiresAt) - now) / (1000 * 60 * 60 * 24)) : 0;

      return {
        ...c.toObject(),
        accessInfo: {
          ...access,
          isExpired,
          daysRemaining,
        },
      };
    });

    res.json({
      success: true,
      user,
      purchases,
      activeCourses: coursesWithAccessInfo,
      totalActiveCourses: coursesWithAccessInfo.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
