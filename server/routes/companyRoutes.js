const express = require('express');
const router = express.Router();
const { getCompanies, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getCompanies);
router.post('/', protect, authorize('admin'), createCompany);
router.put('/:id', protect, authorize('admin'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
