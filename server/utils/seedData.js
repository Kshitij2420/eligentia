/**
 * Seed script for ELIGENTIA.
 * Run with: npm run seed  (from inside /server)
 *
 * Creates:
 *  - 1 admin account
 *  - 5 students with varied CGPA / skills / projects / backlogs
 *  - 3 companies
 *  - 5 placement drives with different requirements
 *
 * This demonstrates that different students receive different, dynamically
 * calculated eligibility outcomes and match percentages against the same jobs.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    Company.deleteMany({}),
    PlacementDrive.deleteMany({}),
    mongoose.connection.collection('applications').deleteMany({}).catch(() => {}),
    mongoose.connection.collection('notifications').deleteMany({}).catch(() => {}),
    mongoose.connection.collection('resumes').deleteMany({}).catch(() => {}),
  ]);

  console.log('Creating admin...');
  const admin = await User.create({
    name: 'Placement Officer',
    email: 'admin@eligentia.com',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('Creating students...');
  const studentSeeds = [
    {
      name: 'Aarav Sharma',
      email: 'aarav@eligentia.com',
      education: { course: 'MCA', branch: 'Computer Applications', graduationYear: 2027, cgpa: 8.1, tenthPercentage: 88, twelfthPercentage: 84, backlogs: 0 },
      skills: {
        programmingLanguages: ['Java', 'JavaScript'],
        frontend: ['React', 'HTML5', 'CSS'],
        backend: [],
        database: ['SQL'],
        tools: ['Git'],
      },
      projects: [
        { name: 'Library Management System', description: 'Full-stack library system', technologies: ['React', 'Java', 'SQL'] },
      ],
      certifications: [{ name: 'Java Programming - Coursera' }],
      socialLinks: { github: 'github.com/aaravsharma', linkedin: 'linkedin.com/in/aaravsharma', portfolio: '' },
    },
    {
      name: 'Isha Verma',
      email: 'isha@eligentia.com',
      education: { course: 'MCA', branch: 'Computer Applications', graduationYear: 2027, cgpa: 7.1, tenthPercentage: 80, twelfthPercentage: 78, backlogs: 1 },
      skills: {
        programmingLanguages: ['Python', 'JavaScript'],
        frontend: ['React'],
        backend: ['Node.js', 'Express'],
        database: ['MongoDB'],
        tools: ['Git'],
      },
      projects: [
        { name: 'Expense Tracker', description: 'MERN based expense tracker', technologies: ['React', 'Node.js', 'MongoDB'] },
        { name: 'Portfolio Website', description: 'Personal portfolio', technologies: ['React', 'Tailwind'] },
      ],
      certifications: [],
      socialLinks: { github: 'github.com/ishaverma', linkedin: '', portfolio: '' },
    },
    {
      name: 'Rohan Gupta',
      email: 'rohan@eligentia.com',
      education: { course: 'MCA', branch: 'Computer Applications', graduationYear: 2027, cgpa: 9.0, tenthPercentage: 92, twelfthPercentage: 90, backlogs: 0 },
      skills: {
        programmingLanguages: ['Java', 'C++', 'Python'],
        frontend: ['React'],
        backend: ['Node.js'],
        database: ['SQL', 'MongoDB'],
        tools: ['Git', 'Docker'],
      },
      projects: [
        { name: 'AI Resume Screener', description: 'ML-based resume screening tool', technologies: ['Python', 'React', 'MongoDB'] },
        { name: 'E-commerce Platform', description: 'Full MERN e-commerce app', technologies: ['React', 'Node.js', 'MongoDB'] },
        { name: 'Chat Application', description: 'Real-time chat app', technologies: ['React', 'Node.js', 'Docker'] },
      ],
      certifications: [{ name: 'DSA Specialization' }, { name: 'AWS Cloud Practitioner' }],
      socialLinks: { github: 'github.com/rohangupta', linkedin: 'linkedin.com/in/rohangupta', portfolio: 'rohangupta.dev' },
    },
    {
      name: 'Priya Nair',
      email: 'priya@eligentia.com',
      education: { course: 'MCA', branch: 'Computer Applications', graduationYear: 2027, cgpa: 6.4, tenthPercentage: 75, twelfthPercentage: 70, backlogs: 2 },
      skills: {
        programmingLanguages: ['C', 'JavaScript'],
        frontend: ['HTML5', 'CSS'],
        backend: [],
        database: [],
        tools: ['Git'],
      },
      projects: [{ name: 'Student Result Portal', description: 'Basic CRUD portal', technologies: ['HTML5', 'CSS', 'JavaScript'] }],
      certifications: [],
      socialLinks: { github: '', linkedin: '', portfolio: '' },
    },
    {
      name: 'Kabir Singh',
      email: 'kabir@eligentia.com',
      education: { course: 'MCA', branch: 'Computer Applications', graduationYear: 2027, cgpa: 7.8, tenthPercentage: 85, twelfthPercentage: 82, backlogs: 0 },
      skills: {
        programmingLanguages: ['Java', 'JavaScript', 'Python'],
        frontend: ['React'],
        backend: ['Node.js', 'Express'],
        database: ['SQL', 'MongoDB'],
        tools: ['Git'],
      },
      projects: [
        { name: 'Voice to SQL Generator', description: 'Converts spoken queries to SQL', technologies: ['React', 'Node.js', 'Python'] },
        { name: 'AI-RAN Traffic Simulator', description: 'Network traffic simulation with ML', technologies: ['React', 'Node.js', 'MongoDB'] },
      ],
      certifications: [{ name: 'MERN Stack Development' }],
      socialLinks: { github: 'github.com/kabirsingh', linkedin: 'linkedin.com/in/kabirsingh', portfolio: '' },
    },
  ];

  for (const s of studentSeeds) {
    const user = await User.create({ name: s.name, email: s.email, password: 'Student@123', role: 'student' });
    await StudentProfile.create({
      userId: user._id,
      personalInfo: { name: s.name, email: s.email, phone: '9000000000' },
      education: s.education,
      skills: s.skills,
      projects: s.projects,
      certifications: s.certifications,
      socialLinks: s.socialLinks,
    });
  }

  console.log('Creating companies...');
  const [tcs, infosys, accenture] = await Company.insertMany([
    { name: 'TCS', industry: 'IT Services', description: 'Global leader in IT services and consulting.', website: 'tcs.com' },
    { name: 'Infosys', industry: 'IT Services', description: 'Global digital services and consulting company.', website: 'infosys.com' },
    { name: 'Accenture', industry: 'Consulting', description: 'Global professional services company.', website: 'accenture.com' },
  ]);

  console.log('Creating placement drives...');
  const inDays = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

  await PlacementDrive.insertMany([
    {
      companyId: tcs._id,
      title: 'Software Developer',
      description: 'Build and maintain enterprise web applications.',
      package: '7 LPA',
      location: 'Bengaluru',
      eligibilityCriteria: { allowedCourses: ['MCA'], allowedBranches: [], minCgpa: 7.0, graduationYear: 2027, maxBacklogs: 0 },
      requiredSkills: ['Java', 'DSA', 'SQL', 'Git', 'React'],
      preferredSkills: ['Node.js', 'MongoDB'],
      deadline: inDays(30),
      status: 'active',
    },
    {
      companyId: infosys._id,
      title: 'MERN Stack Developer',
      description: 'Develop full-stack applications using the MERN stack.',
      package: '6.5 LPA',
      location: 'Pune',
      eligibilityCriteria: { allowedCourses: ['MCA'], allowedBranches: [], minCgpa: 6.5, graduationYear: 2027, maxBacklogs: 1 },
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      preferredSkills: ['Docker', 'AWS'],
      deadline: inDays(21),
      status: 'active',
    },
    {
      companyId: accenture._id,
      title: 'Associate Software Engineer',
      description: 'Work on client projects across various tech stacks.',
      package: '5.8 LPA',
      location: 'Hyderabad',
      eligibilityCriteria: { allowedCourses: ['MCA'], allowedBranches: [], minCgpa: 6.0, graduationYear: 2027, maxBacklogs: 2 },
      requiredSkills: ['JavaScript', 'HTML5', 'CSS', 'Git'],
      preferredSkills: ['React'],
      deadline: inDays(45),
      status: 'active',
    },
    {
      companyId: tcs._id,
      title: 'Backend Engineer',
      description: 'Design and build scalable backend services.',
      package: '8.5 LPA',
      location: 'Chennai',
      eligibilityCriteria: { allowedCourses: ['MCA'], allowedBranches: [], minCgpa: 7.5, graduationYear: 2027, maxBacklogs: 0 },
      requiredSkills: ['Node.js', 'MongoDB', 'SQL', 'Docker', 'Git'],
      preferredSkills: ['AWS', 'Spring Boot'],
      deadline: inDays(15),
      status: 'active',
    },
    {
      companyId: infosys._id,
      title: 'Data-Driven Frontend Developer',
      description: 'Build data-rich, high-performance UI experiences.',
      package: '6 LPA',
      location: 'Remote',
      eligibilityCriteria: { allowedCourses: ['MCA'], allowedBranches: [], minCgpa: 6.5, graduationYear: 2027, maxBacklogs: 1 },
      requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS', 'Git'],
      preferredSkills: ['Tailwind', 'Node.js'],
      deadline: inDays(25),
      status: 'active',
    },
  ]);

  console.log('\nSeed complete!\n');
  console.log('Admin login: admin@eligentia.com / Admin@123');
  console.log('Student logins (all use password Student@123):');
  studentSeeds.forEach((s) => console.log(`  ${s.email}`));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
