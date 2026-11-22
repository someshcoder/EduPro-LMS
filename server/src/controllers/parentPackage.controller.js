const ParentPackage = require('../models/ParentPackage');
const Package = require('../models/Package');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const SystemSettings = require('../models/SystemSettings');
const { getActiveUserCourseAccess, syncUserEnrolledPackages, getDynamicUltimateCourses } = require('../utils/accessControl');
const { v4: uuidv4 } = require('uuid');

// Helper to get or create settings
const getSettings = async () => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  return settings;
};

/**
 * @desc    Get all published Parent Packages (Public with optional user purchase info)
 * @route   GET /api/parent-packages
 */
exports.getParentPackages = async (req, res) => {
  try {
    const packages = await ParentPackage.find({ isPublished: true })
      .populate('courses', 'title thumbnail totalVideos totalDuration price discountPrice category level description')
      .sort({ tierOrder: 1 });

    let userPurchases = [];
    let currentHighestPackage = null;

    if (req.user) {
      const now = new Date();
      userPurchases = await Purchase.find({
        user: req.user._id,
        itemType: { $in: ['parent_package', 'package_upgrade'] },
        status: 'active',
        expiresAt: { $gt: now },
      }).populate('parentPackage');

      // Find the highest tier currently owned
      let highestOrder = 0;
      for (const p of userPurchases) {
        if (p.parentPackage && p.parentPackage.tierOrder > highestOrder) {
          highestOrder = p.parentPackage.tierOrder;
          currentHighestPackage = p;
        }
      }
    }

    const annotatedPackages = packages.map((pkg) => {
      const pkgObj = pkg.toObject();
      pkgObj.isPurchased = false;
      pkgObj.accessStatus = 'locked'; // 'locked', 'unlocked', 'expired', 'upgraded'
      pkgObj.upgradeEligible = false;
      pkgObj.upgradePrice = null;
      pkgObj.previouslyPaidAdjusted = 0;
      pkgObj.expiresAt = null;
      pkgObj.daysRemaining = null;

      if (req.user) {
        // Direct purchase check
        const directPurchase = userPurchases.find(
          (p) => p.parentPackage && p.parentPackage._id.toString() === pkg._id.toString()
        );

        if (directPurchase) {
          pkgObj.isPurchased = true;
          pkgObj.accessStatus = 'unlocked';
          pkgObj.expiresAt = directPurchase.expiresAt;
          pkgObj.daysRemaining = Math.max(
            0,
            Math.ceil((new Date(directPurchase.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
          );
        } else if (currentHighestPackage && currentHighestPackage.parentPackage) {
          // If user owns a higher tier (e.g. Ultimate covers Starter, Intermediate, Advanced)
          if (currentHighestPackage.parentPackage.tierOrder >= pkg.tierOrder) {
            pkgObj.isPurchased = true;
            pkgObj.accessStatus = 'unlocked';
            pkgObj.isIncludedInHigherTier = true;
            pkgObj.includedInName = currentHighestPackage.parentPackage.name;
            pkgObj.expiresAt = currentHighestPackage.expiresAt;
            pkgObj.daysRemaining = Math.max(
              0,
              Math.ceil((new Date(currentHighestPackage.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
            );
          } else {
            // User owns a lower tier and this package is higher -> eligible for upgrade!
            const targetPrice = pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price;
            const previouslyPaid = currentHighestPackage.totalAmount || 0;
            const remainingToPay = Math.max(0, targetPrice - previouslyPaid);

            pkgObj.upgradeEligible = true;
            pkgObj.previouslyPaidAdjusted = previouslyPaid;
            pkgObj.upgradePrice = remainingToPay;
            pkgObj.upgradingFromPackage = {
              _id: currentHighestPackage.parentPackage._id,
              name: currentHighestPackage.parentPackage.name,
              tier: currentHighestPackage.parentPackage.tier,
            };
          }
        }
      }

      return pkgObj;
    });

    res.json({
      success: true,
      packages: annotatedPackages,
      currentActivePackage: currentHighestPackage
        ? {
            id: currentHighestPackage.parentPackage._id,
            name: currentHighestPackage.parentPackage.name,
            tier: currentHighestPackage.parentPackage.tier,
            tierOrder: currentHighestPackage.parentPackage.tierOrder,
            paidAmount: currentHighestPackage.totalAmount,
            expiresAt: currentHighestPackage.expiresAt,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single Parent Package by ID or Slug
 * @route   GET /api/parent-packages/:idOrSlug
 */
exports.getParentPackageByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let query = {};
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: idOrSlug };
    } else {
      query = { slug: idOrSlug.toLowerCase() };
    }

    const pkg = await ParentPackage.findOne(query).populate({
      path: 'courses',
      select: 'title description thumbnail price discountPrice totalVideos totalDuration category level isPublished',
    });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Parent Package not found.' });
    }

    const pkgObj = pkg.toObject();

    // If tier is ultimate, dynamically ensure all lower-tier courses are included in the syllabus view
    if (pkg.tier === 'ultimate') {
      const dynamicCourseIds = await getDynamicUltimateCourses();
      const allUltimateCourses = await Package.find({ _id: { $in: dynamicCourseIds } }).select(
        'title description thumbnail price discountPrice totalVideos totalDuration category level isPublished'
      );
      pkgObj.courses = allUltimateCourses.map((c) => c.toObject());
    }

    pkgObj.isPurchased = false;
    pkgObj.accessStatus = 'locked';
    pkgObj.upgradeEligible = false;
    pkgObj.upgradePrice = null;
    pkgObj.previouslyPaidAdjusted = 0;
    pkgObj.expiresAt = null;
    pkgObj.daysRemaining = null;

    if (req.user) {
      const now = new Date();
      const userPurchases = await Purchase.find({
        user: req.user._id,
        itemType: { $in: ['parent_package', 'package_upgrade'] },
        status: 'active',
        expiresAt: { $gt: now },
      }).populate('parentPackage');

      let currentHighestPackage = null;
      let highestOrder = 0;
      for (const p of userPurchases) {
        if (p.parentPackage && p.parentPackage.tierOrder > highestOrder) {
          highestOrder = p.parentPackage.tierOrder;
          currentHighestPackage = p;
        }
      }

      const directPurchase = userPurchases.find(
        (p) => p.parentPackage && p.parentPackage._id.toString() === pkg._id.toString()
      );

      if (directPurchase) {
        pkgObj.isPurchased = true;
        pkgObj.accessStatus = 'unlocked';
        pkgObj.expiresAt = directPurchase.expiresAt;
        pkgObj.daysRemaining = Math.max(
          0,
          Math.ceil((new Date(directPurchase.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
        );
      } else if (currentHighestPackage && currentHighestPackage.parentPackage) {
        if (currentHighestPackage.parentPackage.tierOrder >= pkg.tierOrder) {
          pkgObj.isPurchased = true;
          pkgObj.accessStatus = 'unlocked';
          pkgObj.isIncludedInHigherTier = true;
          pkgObj.includedInName = currentHighestPackage.parentPackage.name;
          pkgObj.expiresAt = currentHighestPackage.expiresAt;
          pkgObj.daysRemaining = Math.max(
            0,
            Math.ceil((new Date(currentHighestPackage.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
          );
        } else {
          const targetPrice = pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price;
          const previouslyPaid = currentHighestPackage.totalAmount || 0;
          const remainingToPay = Math.max(0, targetPrice - previouslyPaid);

          pkgObj.upgradeEligible = true;
          pkgObj.previouslyPaidAdjusted = previouslyPaid;
          pkgObj.upgradePrice = remainingToPay;
          pkgObj.upgradingFromPackage = {
            _id: currentHighestPackage.parentPackage._id,
            name: currentHighestPackage.parentPackage.name,
            tier: currentHighestPackage.parentPackage.tier,
          };
        }
      }

      // Check which individual courses user already has progress or access to
      const courseAccessMap = await getActiveUserCourseAccess(req.user._id);
      pkgObj.courses = pkgObj.courses.map((course) => ({
        ...course,
        isUnlocked: courseAccessMap.has(course._id.toString()),
      }));
    }

    res.json({ success: true, package: pkgObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Purchase or Upgrade Parent Package
 * @route   POST /api/parent-packages/purchase
 */
exports.purchaseParentPackage = async (req, res) => {
  try {
    const { parentPackageId, paymentMethod = 'Online', billingDetails } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const targetPkg = await ParentPackage.findById(parentPackageId).populate('courses');
    if (!targetPkg || !targetPkg.isPublished) {
      return res.status(404).json({ success: false, message: 'Parent Package not found or is unpublished.' });
    }

    const now = new Date();

    // Check existing active purchases of parent packages
    const activeParentPurchases = await Purchase.find({
      user: userId,
      itemType: { $in: ['parent_package', 'package_upgrade'] },
      status: 'active',
      expiresAt: { $gt: now },
    }).populate('parentPackage');

    // Find highest tier currently owned
    let previousPurchase = null;
    let highestTierOrder = 0;

    for (const p of activeParentPurchases) {
      if (p.parentPackage && p.parentPackage.tierOrder > highestTierOrder) {
        highestTierOrder = p.parentPackage.tierOrder;
        previousPurchase = p;
      }
    }

    // Check if user already owns this package or higher
    if (highestTierOrder >= targetPkg.tierOrder) {
      return res.status(400).json({
        success: false,
        message: `You already have active access to this or a higher package (${previousPurchase.parentPackage.name}).`,
      });
    }

    const isUpgrade = !!previousPurchase;
    const standardPrice = targetPkg.discountPrice && targetPkg.discountPrice > 0 ? targetPkg.discountPrice : targetPkg.price;
    let previousPaidAdjusted = 0;
    let finalPayable = standardPrice;

    if (isUpgrade) {
      // Eligible deduction is the amount paid for the previous lower tier
      previousPaidAdjusted = previousPurchase.totalAmount || 0;
      finalPayable = Math.max(0, standardPrice - previousPaidAdjusted);
    }

    const settings = await getSettings();

    // Financial Calculation with GST
    const taxRate = settings.taxRatePercent || 18;
    const taxableAmount = Math.round((finalPayable / (1 + taxRate / 100)) * 100) / 100;
    const taxAmount = Math.round((finalPayable - taxableAmount) * 100) / 100;
    const halfTax = Math.round((taxAmount / 2) * 100) / 100;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `${settings.invoicePrefix || 'INV-EDP'}-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const paymentRef = `PAY-PKG-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    // 1-Year (365 days) Access Validity
    const purchaseDate = new Date();
    const expiresAt = new Date(purchaseDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Create Invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      user: userId,
      itemType: isUpgrade ? 'package_upgrade' : 'parent_package',
      parentPackage: targetPkg._id,
      packageName: `${targetPkg.name}${isUpgrade ? ` (Upgraded from ${previousPurchase.parentPackage.name})` : ''}`,
      basePrice: standardPrice,
      discountAmount: previousPaidAdjusted,
      taxableAmount,
      taxRate,
      taxAmount,
      cgst: halfTax,
      sgst: halfTax,
      totalAmount: finalPayable,
      paymentMethod,
      paymentRef,
      status: 'paid',
      billingDetails: {
        name: billingDetails?.name || user.name,
        email: billingDetails?.email || user.email,
        phone: billingDetails?.phone || user.phone || '',
        address: billingDetails?.address || 'India',
        state: billingDetails?.state || 'Delhi',
      },
      companyDetails: {
        legalName: settings.companyName,
        gstin: settings.companyGstin,
        address: settings.companyAddress,
        email: settings.companyEmail,
        phone: settings.companyPhone,
      },
    });

    // Granted courses: all course IDs in this Parent Package
    let grantedCourses = targetPkg.courses.map((c) => c._id || c);
    if (targetPkg.tier === 'ultimate') {
      const dynamicCourses = await getDynamicUltimateCourses();
      grantedCourses = Array.from(new Set([...grantedCourses.map((c) => c.toString()), ...dynamicCourses]));
    }

    // Create Purchase Record
    const purchase = await Purchase.create({
      user: userId,
      itemType: isUpgrade ? 'package_upgrade' : 'parent_package',
      parentPackage: targetPkg._id,
      grantedCourses,
      upgradedFrom: isUpgrade ? previousPurchase._id : null,
      previousPaidAdjusted,
      basePrice: standardPrice,
      discountAmount: previousPaidAdjusted,
      taxableAmount,
      taxRate,
      taxAmount,
      totalAmount: finalPayable,
      paymentMethod,
      paymentRef,
      invoice: invoice._id,
      invoiceNumber,
      status: 'active',
      purchaseDate,
      expiresAt,
    });

    // If upgrading, mark previous purchase as 'upgraded' so it's superseded
    if (isUpgrade && previousPurchase) {
      previousPurchase.status = 'upgraded';
      await previousPurchase.save();
    }

    // Record purchase transaction for user
    await Transaction.create({
      user: userId,
      type: 'purchase',
      amount: -finalPayable,
      description: isUpgrade
        ? `Upgraded to ${targetPkg.name} (Adjusted ₹${previousPaidAdjusted})`
        : `Purchased ${targetPkg.name}`,
      reference: invoice.invoiceNumber,
      status: 'completed',
    });

    // Automatically sync and grant access to all courses in the user's enrolledPackages list
    await syncUserEnrolledPackages(userId);

    // ================= DISTRIBUTE MULTI-LEVEL COMMISSIONS =================
    // Commissions are distributed on the actual net amount paid!
    if (finalPayable > 0) {
      const level1Percent = targetPkg.commissionRules?.level1Percent ?? 30;
      const level2Percent = targetPkg.commissionRules?.level2Percent ?? 10;

      // Direct referrer (Level 1)
      if (user.referredBy) {
        const level1User = await User.findById(user.referredBy);
        if (level1User && !level1User.isBlocked) {
          const l1Commission = Math.round((finalPayable * level1Percent) / 100);
          if (l1Commission > 0) {
            level1User.walletBalance += l1Commission;
            level1User.totalEarnings += l1Commission;
            await level1User.save();

            await Transaction.create({
              user: level1User._id,
              type: 'commission',
              amount: l1Commission,
              description: `Level 1 Commission from ${user.name} (${targetPkg.name})`,
              reference: invoice.invoiceNumber,
              fromUser: user._id,
              level: 1,
              status: 'completed',
              balanceAfter: level1User.walletBalance,
            });
          }

          // Indirect referrer (Level 2)
          if (level1User.referredBy) {
            const level2User = await User.findById(level1User.referredBy);
            if (level2User && !level2User.isBlocked) {
              const l2Commission = Math.round((finalPayable * level2Percent) / 100);
              if (l2Commission > 0) {
                level2User.walletBalance += l2Commission;
                level2User.totalEarnings += l2Commission;
                await level2User.save();

                await Transaction.create({
                  user: level2User._id,
                  type: 'commission',
                  amount: l2Commission,
                  description: `Level 2 Commission from ${user.name} via ${level1User.name}`,
                  reference: invoice.invoiceNumber,
                  fromUser: user._id,
                  level: 2,
                  status: 'completed',
                  balanceAfter: level2User.walletBalance,
                });
              }
            }
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: isUpgrade
        ? `Successfully upgraded to ${targetPkg.name}! All included courses are now unlocked for 1 year.`
        : `Successfully purchased ${targetPkg.name}! All ${grantedCourses.length} included courses are now unlocked for 1 year.`,
      invoice,
      purchase,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user's purchased Parent Packages (User Dashboard)
 * @route   GET /api/parent-packages/my-purchased
 */
exports.getMyPurchasedPackages = async (req, res) => {
  try {
    const userId = req.user._id;
    const purchases = await Purchase.find({
      user: userId,
      itemType: { $in: ['parent_package', 'package_upgrade'] },
    })
      .populate({
        path: 'parentPackage',
        populate: {
          path: 'courses',
          select: 'title thumbnail totalVideos totalDuration category level',
        },
      })
      .populate('invoice', 'invoiceNumber paymentMethod totalAmount')
      .sort({ purchaseDate: -1 });

    const now = new Date();

    const formattedPurchases = purchases.map((p) => {
      const pObj = p.toObject();
      const isExpired = new Date(p.expiresAt) <= now;
      let effectiveStatus = p.status;
      if (p.status === 'active' && isExpired) {
        effectiveStatus = 'expired';
      }

      const daysRemaining = isExpired
        ? 0
        : Math.max(0, Math.ceil((new Date(p.expiresAt) - now) / (1000 * 60 * 60 * 24)));

      return {
        ...pObj,
        effectiveStatus,
        daysRemaining,
        isExpired,
      };
    });

    res.json({ success: true, purchases: formattedPurchases, purchasedPackages: formattedPurchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get complete purchase history for user
 * @route   GET /api/parent-packages/purchase-history
 */
exports.getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const purchases = await Purchase.find({ user: userId })
      .populate('parentPackage', 'name thumbnail tier tierOrder slug')
      .populate('course', 'title thumbnail category level')
      .populate('invoice', 'invoiceNumber paymentMethod totalAmount status')
      .sort({ purchaseDate: -1 });

    const now = new Date();

    const history = purchases.map((p) => {
      const isExpired = new Date(p.expiresAt) <= now;
      let displayStatus = p.status;
      if (p.status === 'active' && isExpired) {
        displayStatus = 'expired';
      }

      return {
        id: p._id,
        itemType: p.itemType,
        title:
          p.parentPackage?.name ||
          p.course?.title ||
          (p.itemType === 'package_upgrade' ? 'Package Upgrade' : 'Course Purchase'),
        thumbnail: p.parentPackage?.thumbnail || p.course?.thumbnail || '',
        purchaseDate: p.purchaseDate,
        expiresAt: p.expiresAt,
        amountPaid: p.totalAmount,
        basePrice: p.basePrice,
        previousPaidAdjusted: p.previousPaidAdjusted,
        status: displayStatus,
        isExpired,
        daysRemaining: isExpired ? 0 : Math.ceil((new Date(p.expiresAt) - now) / (1000 * 60 * 60 * 24)),
        invoiceNumber: p.invoiceNumber,
        invoiceId: p.invoice?._id || null,
        paymentRef: p.paymentRef,
        paymentMethod: p.paymentMethod,
        grantedCoursesCount: p.grantedCourses?.length || (p.course ? 1 : 0),
      };
    });

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
