const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
  },
  { _id: true }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    personalInfo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },

    education: {
      course: { type: String, default: '' }, // e.g. MCA, BTech
      branch: { type: String, default: '' }, // e.g. CS, IT
      graduationYear: { type: Number },
      cgpa: { type: Number, min: 0, max: 10, default: 0 },
      tenthPercentage: { type: Number, min: 0, max: 100 },
      twelfthPercentage: { type: Number, min: 0, max: 100 },
      backlogs: { type: Number, default: 0, min: 0 },
    },

    skills: {
      programmingLanguages: [{ type: String }],
      frontend: [{ type: String }],
      backend: [{ type: String }],
      database: [{ type: String }],
      tools: [{ type: String }],
    },

    projects: [projectSchema],

    certifications: [
      {
        name: { type: String, required: true },
      },
    ],

    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Convenience: flatten all skills into one array
studentProfileSchema.methods.getAllSkills = function () {
  const s = this.skills || {};
  return [
    ...(s.programmingLanguages || []),
    ...(s.frontend || []),
    ...(s.backend || []),
    ...(s.database || []),
    ...(s.tools || []),
  ].map((sk) => sk.trim());
};

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
