const fs = require('fs');
const path = require('path');

// A small, curated keyword list used to detect extra skills from raw resume text.
// This intentionally stays simple - the structured profile remains the primary
// source of truth for matching (see server/services/matchingEngine.js).
const KNOWN_SKILL_KEYWORDS = [
  'javascript', 'typescript', 'react', 'react.js', 'node', 'node.js', 'express',
  'mongodb', 'mysql', 'postgresql', 'oracle', 'sql', 'html5', 'html', 'css',
  'tailwind', 'bootstrap', 'python', 'java', 'c++', 'c', 'core java',
  'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'rest api',
  'graphql', 'dsa', 'data structures', 'redux', 'next.js', 'spring boot',
  'django', 'flask', 'jwt', 'firebase',
];

/**
 * Extracts raw text from an uploaded resume file (PDF or DOCX).
 * Falls back gracefully - resume parsing is a supplementary feature only.
 */
async function extractText(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text || '';
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      path.extname(filePath).toLowerCase() === '.docx'
    ) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    return '';
  } catch (err) {
    console.error('Resume text extraction failed:', err.message);
    return '';
  }
}

/**
 * Detects additional skill keywords mentioned in the resume's raw text.
 */
function extractSkillsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_SKILL_KEYWORDS.filter((kw) => lower.includes(kw));
}

/**
 * Computes a resume completeness score (0-100) based on structured profile fields.
 * Returns { score, suggestions }
 */
function computeResumeCompleteness(studentProfile, hasResumeFile) {
  const suggestions = [];
  let score = 0;
  const weights = {
    resumeUploaded: 15,
    education: 15,
    skills: 20,
    projects: 20,
    certifications: 15,
    socialLinks: 15,
  };

  if (hasResumeFile) {
    score += weights.resumeUploaded;
  } else {
    suggestions.push('Upload your resume file (PDF or DOCX).');
  }

  const edu = studentProfile.education || {};
  if (edu.course && edu.cgpa) {
    score += weights.education;
  } else {
    suggestions.push('Complete your academic details (course, CGPA).');
  }

  const skillCount = studentProfile.getAllSkills ? studentProfile.getAllSkills().length : 0;
  if (skillCount >= 5) {
    score += weights.skills;
  } else if (skillCount > 0) {
    score += Math.round(weights.skills * (skillCount / 5));
    suggestions.push('Add more technical skills to strengthen your profile.');
  } else {
    suggestions.push('Add your technical skills.');
  }

  const projectCount = (studentProfile.projects || []).length;
  if (projectCount >= 2) {
    score += weights.projects;
  } else if (projectCount === 1) {
    score += Math.round(weights.projects * 0.6);
    suggestions.push('Add at least one more project with details.');
  } else {
    suggestions.push('Add project details.');
  }

  const certCount = (studentProfile.certifications || []).length;
  if (certCount >= 1) {
    score += weights.certifications;
  } else {
    suggestions.push('Add certifications.');
  }

  const links = studentProfile.socialLinks || {};
  const linkCount = ['github', 'linkedin', 'portfolio'].filter((k) => links[k]).length;
  if (linkCount >= 2) {
    score += weights.socialLinks;
  } else if (linkCount === 1) {
    score += Math.round(weights.socialLinks * 0.5);
    suggestions.push('Add your GitHub and LinkedIn links.');
  } else {
    suggestions.push('Add GitHub link.');
  }

  return { score: Math.min(100, Math.round(score)), suggestions };
}

module.exports = { extractText, extractSkillsFromText, computeResumeCompleteness };
