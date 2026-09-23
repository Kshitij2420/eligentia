const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const StudentProfile = require('../models/StudentProfile');
const { evaluateMatch } = require('../services/matchingEngine');
const { notifyStatusChange } = require('../services/notificationService');

// @route POST /api/applications (student only)
const applyToPlacement = async (req, res, next) => {
  try {
    const { placementDriveId } = req.body;
    if (!placementDriveId) {
      return res.status(400).json({ success: false, message: 'placementDriveId is required' });
    }

    const drive = await PlacementDrive.findById(placementDriveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }
    if (drive.status !== 'active' || new Date(drive.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'This placement drive is no longer accepting applications' });
    }

    const existing = await Application.findOne({ studentId: req.user._id, placementDriveId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied to this placement drive' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Complete your student profile before applying' });
    }

    const result = evaluateMatch(profile, drive);

    if (result.eligibility.status !== 'eligible') {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for this placement drive',
        reasons: result.eligibility.reasons,
      });
    }

    const application = await Application.create({
      studentId: req.user._id,
      placementDriveId,
      matchPercentage: result.matchPercentage,
      eligibilityStatus: result.eligibility.status,
      eligibilityReason: result.eligibility.reasons.join(' '),
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      status: 'Applied',
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied to this placement drive' });
    }
    next(err);
  }
};

// @route GET /api/applications/my (student only)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate({
        path: 'placementDriveId',
        populate: { path: 'companyId', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/applications (admin only) - all applications, optionally filtered by drive
const getAllApplications = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.placementDriveId) filter.placementDriveId = req.query.placementDriveId;

    const applications = await Application.find(filter)
      .populate('studentId', 'name email')
      .populate({
        path: 'placementDriveId',
        populate: { path: 'companyId', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/applications/:id/status (admin only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('placementDriveId', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await notifyStatusChange(application.studentId, application.placementDriveId, status);

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

module.exports = { applyToPlacement, getMyApplications, getAllApplications, updateApplicationStatus };
