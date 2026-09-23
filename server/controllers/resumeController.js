const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');
const { extractText, extractSkillsFromText, computeResumeCompleteness } = require('../services/resumeParser');

// @route POST /api/resumes/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Accepted types: PDF, DOCX.' });
    }

    const { path: filePath, originalname, mimetype } = req.file;

    const extractedText = await extractText(filePath, mimetype);
    const extractedSkills = extractSkillsFromText(extractedText);

    // Remove any previous resume for this student to keep only the latest
    const previous = await Resume.findOne({ studentId: req.user._id });
    if (previous) {
      try {
        if (fs.existsSync(previous.filePath)) fs.unlinkSync(previous.filePath);
      } catch (e) {
        console.warn('Could not remove old resume file:', e.message);
      }
      await Resume.deleteOne({ _id: previous._id });
    }

    const resume = await Resume.create({
      studentId: req.user._id,
      fileName: originalname,
      filePath,
      fileType: mimetype,
      extractedText: extractedText.slice(0, 20000), // cap stored text
      extractedSkills,
    });

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const { score, suggestions } = computeResumeCompleteness(profile, true);

    res.status(201).json({
      success: true,
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
        extractedSkills: resume.extractedSkills,
      },
      completeness: { score, suggestions },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/resumes
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ studentId: req.user._id }).sort({ uploadedAt: -1 });
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const { score, suggestions } = computeResumeCompleteness(profile, !!resume);

    res.json({
      success: true,
      resume: resume
        ? {
            id: resume._id,
            fileName: resume.fileName,
            uploadedAt: resume.uploadedAt,
            extractedSkills: resume.extractedSkills,
          }
        : null,
      completeness: { score, suggestions },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getResume };
