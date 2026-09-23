const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getPlacementReadiness } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/readiness', getPlacementReadiness);

module.exports = router;
