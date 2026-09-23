const express = require('express');
const router = express.Router();
const { getDashboard, getStudents } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);

module.exports = router;
