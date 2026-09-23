const User = require('../models/User');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');

// @route GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [totalStudents, totalCompanies, activeJobs, totalApplications] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Company.countDocuments(),
      PlacementDrive.countDocuments({ status: 'active' }),
      Application.countDocuments(),
    ]);

    // Application status breakdown
    const statusAgg = await Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const statusBreakdown = statusAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Most common missing skills across all applications
    const missingSkillsAgg = await Application.aggregate([
      { $unwind: '$missingSkills' },
      { $group: { _id: '$missingSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      success: true,
      stats: { totalStudents, totalCompanies, activeJobs, totalApplications },
      statusBreakdown,
      commonMissingSkills: missingSkillsAgg.map((s) => ({ skill: s._id, count: s.count })),
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/students
const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email createdAt').sort({ createdAt: -1 });
    const profiles = await StudentProfile.find({ userId: { $in: students.map((s) => s._id) } });
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const enriched = students.map((s) => {
      const profile = profileMap.get(s._id.toString());
      return {
        id: s._id,
        name: s.name,
        email: s.email,
        joinedAt: s.createdAt,
        course: profile?.education?.course || 'N/A',
        cgpa: profile?.education?.cgpa || 0,
        skillCount: profile?.getAllSkills ? profile.getAllSkills().length : 0,
      };
    });

    res.json({ success: true, students: enriched });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getStudents };
