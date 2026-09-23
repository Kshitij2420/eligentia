const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    placementDriveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },

    matchPercentage: { type: Number, default: 0 },
    eligibilityStatus: { type: String, enum: ['eligible', 'not_eligible'], required: true },
    eligibilityReason: { type: String, default: '' },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],

    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'],
      default: 'Applied',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, placementDriveId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
