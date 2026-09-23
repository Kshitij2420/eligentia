const express = require('express');
const router = express.Router();
const {
  applyToPlacement,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('student'), applyToPlacement);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/', protect, authorize('admin'), getAllApplications);
router.put('/:id/status', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;
