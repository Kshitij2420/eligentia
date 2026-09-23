const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');

// @route GET /api/companies
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({ success: true, companies });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/companies (admin only)
const createCompany = async (req, res, next) => {
  try {
    const { name, industry, description, website } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }
    const company = await Company.create({ name, industry, description, website });
    res.status(201).json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/companies/:id (admin only)
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/companies/:id (admin only)
const deleteCompany = async (req, res, next) => {
  try {
    const activeDrives = await PlacementDrive.countDocuments({ companyId: req.params.id });
    if (activeDrives > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a company that has placement drives. Remove the drives first.',
      });
    }
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, message: 'Company deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCompanies, createCompany, updateCompany, deleteCompany };
