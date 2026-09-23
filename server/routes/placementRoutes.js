const express = require('express');
const router = express.Router();
const {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getMatchForPlacement,
} = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getPlacements);
router.get('/:id', protect, getPlacementById);
router.get('/:id/match', protect, authorize('student'), getMatchForPlacement);
router.post('/', protect, authorize('admin'), createPlacement);
router.put('/:id', protect, authorize('admin'), updatePlacement);
router.delete('/:id', protect, authorize('admin'), deletePlacement);

module.exports = router;
