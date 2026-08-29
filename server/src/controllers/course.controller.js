const Package = require('../models/Package');
const Video = require('../models/Video');
const Progress = require('../models/Progress');
const User = require('../models/User');

// @desc    Get all published packages
// @route   GET /api/courses
exports.getPackages = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.title = { $regex: search, $options: 'i' };

    const packages = await Package.find(query)
      .select('-videos')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Package.countDocuments(query);

    res.json({ success: true, packages, total, page: parseInt(page), pages: Math.ceil(total / limit) });
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

    // Check if user is enrolled
    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledPackages.includes(pkg._id);

    // Non-enrolled users can only view published packages
    if (!pkg.isPublished && !isEnrolled) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    let progress = null;
    if (isEnrolled) {
      progress = await Progress.findOne({ user: req.user.id, package: pkg._id });
    }

    res.json({ success: true, package: pkg, isEnrolled, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get video for watching (must be enrolled)
// @route   GET /api/courses/:packageId/videos/:videoId
exports.getVideo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledPackages.includes(req.params.packageId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'Please enroll to access this video.' });
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

// @desc    Get user's enrolled packages with progress
// @route   GET /api/courses/my-courses
exports.getMyCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledPackages', 'title thumbnail totalVideos totalDuration');
    const progresses = await Progress.find({ user: req.user.id });

    const courses = user.enrolledPackages.map((pkg) => {
      const prog = progresses.find((p) => p.package.toString() === pkg._id.toString());
      return { ...pkg.toObject(), progress: prog || { progressPercent: 0 } };
    });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
