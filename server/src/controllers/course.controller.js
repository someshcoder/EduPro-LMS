const Package = require('../models/Package');
const Video = require('../models/Video');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { getActiveUserCourseAccess, hasCourseAccess } = require('../utils/accessControl');

// @desc    Get all published packages (PUBLIC — no auth required, for homepage)
// @route   GET /api/courses/public
exports.getPublicPackages = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { isPublished: true };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    const packages = await Package.find(query)
      .select('title description thumbnail price discountPrice category level totalVideos totalDuration rating ratingCount enrolledCount isFeatured')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(50);

    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all published packages
// @route   GET /api/courses
exports.getPackages = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 100 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.title = { $regex: search, $options: 'i' };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;

    const packages = await Package.find(query)
      .select('-videos')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Package.countDocuments(query);

    res.json({ success: true, packages, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single package
// @route   GET /api/courses/:id
exports.getPackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate('videos', 'title duration order isLocked thumbnailUrl')
      .populate('createdBy', 'name');

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    // Check if user is enrolled via accessControl (active purchase, parent package, or legacy)
    const isEnrolled = await hasCourseAccess(req.user.id, pkg._id);

    // Non-enrolled users can only view published packages
    if (!pkg.isPublished && !isEnrolled) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    let progress = null;
    let accessInfo = null;
    if (isEnrolled) {
      progress = await Progress.findOne({ user: req.user.id, package: pkg._id });
      const accessMap = await getActiveUserCourseAccess(req.user.id);
      const access = accessMap.get(pkg._id.toString());
      if (access) {
        const now = new Date();
        accessInfo = {
          sourceType: access.sourceType,
          sourceName: access.sourceName,
          purchaseDate: access.purchaseDate,
          expiresAt: access.expiresAt,
          daysRemaining: Math.max(0, Math.ceil((new Date(access.expiresAt) - now) / (1000 * 60 * 60 * 24))),
        };
      }
    }

    res.json({ success: true, package: pkg, isEnrolled, progress, accessInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get video for watching (must be enrolled)
// @route   GET /api/courses/:packageId/videos/:videoId
exports.getVideo = async (req, res) => {
  try {
    const isEnrolled = await hasCourseAccess(req.user.id, req.params.packageId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Your access to this course is locked or has expired. Please enroll or renew your access.',
      });
    }

    const video = await Video.findOne({ _id: req.params.videoId, package: req.params.packageId });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });

    // Increment views
    video.views += 1;
    await video.save();

    res.json({
      success: true,
      video,
      watermark: {
        enabled: video.watermarkEnabled,
        text: req.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update video progress
// @route   POST /api/courses/:packageId/progress
exports.updateProgress = async (req, res) => {
  try {
    const { videoId, watchedSeconds, isCompleted } = req.body;
    const { packageId } = req.params;

    const hasAccess = await hasCourseAccess(req.user.id, packageId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Your access to this course is locked or has expired.',
      });
    }

    let progress = await Progress.findOne({ user: req.user.id, package: packageId });
    if (!progress) {
      progress = new Progress({ user: req.user.id, package: packageId });
    }

    // Update video progress
    const videoIndex = progress.videoProgress.findIndex((v) => v.video.toString() === videoId);
    if (videoIndex >= 0) {
      progress.videoProgress[videoIndex].watchedSeconds = watchedSeconds;
      if (isCompleted) progress.videoProgress[videoIndex].isCompleted = true;
    } else {
      progress.videoProgress.push({ video: videoId, watchedSeconds, isCompleted });
    }

    // Add to completed videos if done
    if (isCompleted && !progress.completedVideos.includes(videoId)) {
      progress.completedVideos.push(videoId);
    }

    // Calculate percentage
    const pkg = await Package.findById(packageId);
    if (pkg) {
      progress.progressPercent = Math.round((progress.completedVideos.length / pkg.totalVideos) * 100);
      if (progress.progressPercent >= 100) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
      }
    }

    progress.lastWatchedVideo = videoId;
    progress.lastWatchedAt = new Date();
    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's enrolled packages with progress and validity (deduplicated across all active purchases)
// @route   GET /api/courses/my-courses
exports.getMyCourses = async (req, res) => {
  try {
    const accessMap = await getActiveUserCourseAccess(req.user.id);
    const courseIds = Array.from(accessMap.keys());

    const packages = await Package.find({ _id: { $in: courseIds } })
      .select('title description thumbnail price discountPrice totalVideos totalDuration category level');
    const progresses = await Progress.find({ user: req.user.id });

    const now = new Date();
    const courses = packages.map((pkg) => {
      const prog = progresses.find((p) => p.package.toString() === pkg._id.toString());
      const access = accessMap.get(pkg._id.toString());
      const isExpired = access ? new Date(access.expiresAt) <= now : false;
      const daysRemaining =
        access && !isExpired
          ? Math.max(0, Math.ceil((new Date(access.expiresAt) - now) / (1000 * 60 * 60 * 24)))
          : 0;

      return {
        ...pkg.toObject(),
        progress: prog || { progressPercent: 0, completedVideos: [] },
        accessInfo: access
          ? {
              sourceType: access.sourceType,
              sourceName: access.sourceName,
              purchaseDate: access.purchaseDate,
              expiresAt: access.expiresAt,
              isExpired,
              daysRemaining,
            }
          : null,
      };
    });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
