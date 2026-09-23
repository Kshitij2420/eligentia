const StudentProfile = require('../models/StudentProfile');
const Resume = require('../models/Resume');
const { computeResumeCompleteness } = require('../services/resumeParser');

// @route GET /api/students/profile
const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id,
        personalInfo: { name: req.user.name, email: req.user.email, phone: '' },
      });
    }
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/students/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['personalInfo', 'education', 'skills', 'projects', 'certifications', 'socialLinks'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/students/readiness
// Computes placement readiness score from academics, skills, projects, certs, resume.
const getPlacementReadiness = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const resume = await Resume.findOne({ studentId: req.user._id }).sort({ uploadedAt: -1 });
    const { score: resumeScore } = computeResumeCompleteness(profile, !!resume);

    const skillCount = profile.getAllSkills().length;
    const technicalSkillsScore = Math.min(100, Math.round((skillCount / 8) * 100));

    const edu = profile.education || {};
    let academicsScore = Math.min(100, Math.round(((edu.cgpa || 0) / 10) * 100));
    if ((edu.backlogs || 0) > 0) academicsScore = Math.max(0, academicsScore - edu.backlogs * 10);

    const projectsScore = Math.min(100, (profile.projects || []).length * 35);

    const certCount = (profile.certifications || []).length;
    const certificationsScore = certCount === 0 ? 0 : certCount === 1 ? 50 : certCount === 2 ? 80 : 100;

    const overall = Math.round(
      technicalSkillsScore * 0.3 +
        academicsScore * 0.25 +
        projectsScore * 0.2 +
        resumeScore * 0.15 +
        certificationsScore * 0.1
    );

    res.json({
      success: true,
      readiness: {
        overall,
        categories: {
          technicalSkills: technicalSkillsScore,
          academics: academicsScore,
          projects: projectsScore,
          resume: resumeScore,
          certifications: certificationsScore,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getPlacementReadiness };
