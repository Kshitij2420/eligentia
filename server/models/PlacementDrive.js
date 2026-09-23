const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    package: { type: String, default: '' }, // e.g. "7 LPA"
    location: { type: String, default: '' },

    eligibilityCriteria: {
      allowedCourses: [{ type: String }], // e.g. ["MCA", "BTech"]
      allowedBranches: [{ type: String }],
      minCgpa: { type: Number, default: 0 },
      graduationYear: { type: Number },
      maxBacklogs: { type: Number, default: 0 },
    },

    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],

    deadline: { type: Date, required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
