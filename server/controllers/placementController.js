const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { evaluateMatch, generateImprovementSuggestions } = require('../services/matchingEngine');
const { notifyNewJobToStudents } = require('../services/notificationService');

// @route GET /api/placements
// Students: returns all active drives, each enriched with eligibility + match for the caller.
// Admin: returns all drives (any status) with applicant counts.
const getPlacements = async (req, res, next) => {
  try {
    const Application = require('../models/Application');

    if (req.user.role === 'admin') {
      const drives = await PlacementDrive.find().populate('companyId', 'name industry').sort({ createdAt: -1 });
      const withCounts = await Promise.all(
        drives.map(async (drive) => {
          const applicantCount = await Application.countDocuments({ placementDriveId: drive._id });
          return { ...drive.toObject(), applicantCount };
        })
      );
      return res.json({ success: true, placements: withCounts });
    }

    // Student view
    const drives = await PlacementDrive.find({ status: 'active' })
      .populate('companyId', 'name industry description website')
      .sort({ createdAt: -1 });

    const profile = await StudentProfile.findOne({ userId: req.user._id });

    const enriched = drives.map((drive) => {
      const result = profile ? evaluateMatch(profile, drive) : null;
      return {
        _id: drive._id,
        title: drive.title,
        description: drive.description,
        package: drive.package,
        location: drive.location,
        deadline: drive.deadline,
        status: drive.status,
        company: drive.companyId,
        requiredSkills: drive.requiredSkills,
        preferredSkills: drive.preferredSkills,
        eligibilityCriteria: drive.eligibilityCriteria,
        eligibilityStatus: result ? result.eligibility.status : null,
        matchPercentage: result ? result.matchPercentage : null,
      };
    });

    res.json({ success: true, placements: enriched });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/placements/:id
const getPlacementById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('companyId', 'name industry description website');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }
    res.json({ success: true, placement: drive });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/placements (admin only)
const createPlacement = async (req, res, next) => {
  try {
    const {
      companyId,
      title,
      description,
      package: pkg,
      location,
      eligibilityCriteria,
      requiredSkills,
      preferredSkills,
      deadline,
    } = req.body;

    if (!companyId || !title || !deadline) {
      return res.status(400).json({ success: false, message: 'companyId, title and deadline are required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({ success: false, message: 'Invalid companyId - company does not exist' });
    }

    const drive = await PlacementDrive.create({
      companyId,
      title,
      description,
      package: pkg,
      location,
      eligibilityCriteria,
      requiredSkills,
      preferredSkills,
      deadline,
    });

    // Notify all students of the new opportunity
    const students = await User.find({ role: 'student' }).select('_id');
    await notifyNewJobToStudents(
      students.map((s) => s._id),
      { _id: drive._id, title: drive.title, companyName: company.name }
    );

    res.status(201).json({ success: true, placement: drive });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/placements/:id (admin only)
const updatePlacement = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }
    res.json({ success: true, placement: drive });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/placements/:id (admin only)
const deletePlacement = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }
    res.json({ success: true, message: 'Placement drive deleted' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/placements/:id/match (student only)
// The heart of ELIGENTIA: eligibility + transparent match score + skill gaps + suggestions.
const getMatchForPlacement = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('companyId', 'name');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Complete your student profile first' });
    }

    const result = evaluateMatch(profile, drive);
    const suggestions = generateImprovementSuggestions(result.missingSkills);

    res.json({
      success: true,
      placement: { id: drive._id, title: drive.title, company: drive.companyId?.name },
      eligibility: result.eligibility,
      matchPercentage: result.matchPercentage,
      breakdown: result.breakdown,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      improvementSuggestions: suggestions,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getMatchForPlacement,
};
