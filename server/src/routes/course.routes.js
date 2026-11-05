const express = require('express');
const router = express.Router();
const { getPackages, getPackage, getVideo, updateProgress, getMyCourses, getPublicPackages } = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');

// Public route — no auth required (for homepage courses section)
router.get('/public', getPublicPackages);

router.use(protect);

router.get('/', getPackages);
router.get('/my-courses', getMyCourses);
router.get('/:id', getPackage);
router.get('/:packageId/videos/:videoId', getVideo);
router.post('/:packageId/progress', updateProgress);

module.exports = router;
