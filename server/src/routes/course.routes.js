const express = require('express');
const router = express.Router();
const { getPackages, getPackage, getVideo, updateProgress, getMyCourses } = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getPackages);
router.get('/my-courses', getMyCourses);
router.get('/:id', getPackage);
router.get('/:packageId/videos/:videoId', getVideo);
router.post('/:packageId/progress', updateProgress);

module.exports = router;
