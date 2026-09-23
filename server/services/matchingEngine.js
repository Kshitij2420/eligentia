/**
 * ELIGENTIA Smart Matching Engine
 * ---------------------------------
 * Two independent outputs:
 *   1. Eligibility check  -> hard pass/fail against the drive's baseline criteria
 *   2. Match percentage   -> weighted, continuous score of profile-fit, calculated
 *                            regardless of eligibility outcome.
 *
 * Weights (kept here so they're easy to tune):
 */
const WEIGHTS = {
  academic: 0.2,
  requiredSkills: 0.5,
  preferredSkills: 0.1,
  projects: 0.1,
  certifications: 0.1,
};

const normalize = (str) => (str || '').toString().trim().toLowerCase();

const uniqueNormalizedSet = (arr = []) => {
  const set = new Set();
  arr.forEach((item) => {
    const n = normalize(item);
    if (n) set.add(n);
  });
  return set;
};

/**
 * Checks hard eligibility criteria: course, branch, graduation year, CGPA, backlogs.
 * Returns { eligible: boolean, reasons: string[] }
 */
function checkEligibility(studentProfile, drive) {
  const reasons = [];
  const criteria = drive.eligibilityCriteria || {};
  const education = studentProfile.education || {};

  // Course check (only enforced if drive specifies allowed courses)
  if (Array.isArray(criteria.allowedCourses) && criteria.allowedCourses.length > 0) {
    const allowed = uniqueNormalizedSet(criteria.allowedCourses);
    if (!allowed.has(normalize(education.course))) {
      reasons.push(
        `Your course (${education.course || 'N/A'}) is not in the eligible list: ${criteria.allowedCourses.join(', ')}.`
      );
    }
  }

  // Branch check (only enforced if drive specifies allowed branches)
  if (Array.isArray(criteria.allowedBranches) && criteria.allowedBranches.length > 0) {
    const allowed = uniqueNormalizedSet(criteria.allowedBranches);
    if (!allowed.has(normalize(education.branch))) {
      reasons.push(
        `Your branch (${education.branch || 'N/A'}) is not in the eligible list: ${criteria.allowedBranches.join(', ')}.`
      );
    }
  }

  // Graduation year (only enforced if drive specifies one)
  if (criteria.graduationYear) {
    if (Number(education.graduationYear) !== Number(criteria.graduationYear)) {
      reasons.push(
        `This drive is for the ${criteria.graduationYear} graduating batch; your batch is ${education.graduationYear || 'N/A'}.`
      );
    }
  }

  // CGPA
  const minCgpa = criteria.minCgpa ?? 0;
  const studentCgpa = Number(education.cgpa) || 0;
  if (studentCgpa < minCgpa) {
    reasons.push(`Your CGPA is below the company's minimum requirement of ${minCgpa}.`);
  }

  // Backlogs
  const maxBacklogs = criteria.maxBacklogs ?? 0;
  const studentBacklogs = Number(education.backlogs) || 0;
  if (studentBacklogs > maxBacklogs) {
    reasons.push(
      `You have ${studentBacklogs} active backlog(s), which exceeds the allowed maximum of ${maxBacklogs}.`
    );
  }

  return { eligible: reasons.length === 0, reasons };
}

/**
 * Academic score: rewards CGPA headroom above the minimum, and clean backlog record.
 * Returns 0-100.
 */
function scoreAcademics(studentProfile, drive) {
  const criteria = drive.eligibilityCriteria || {};
  const education = studentProfile.education || {};

  const minCgpa = criteria.minCgpa ?? 0;
  const studentCgpa = Number(education.cgpa) || 0;

  let cgpaScore;
  if (minCgpa <= 0) {
    // no requirement set - score purely on absolute CGPA out of 10
    cgpaScore = Math.min(100, (studentCgpa / 10) * 100);
  } else {
    // scale: meeting minimum = 70, scaling up to 100 at minCgpa + 2, floor at 0 for well below
    const diff = studentCgpa - minCgpa;
    cgpaScore = Math.max(0, Math.min(100, 70 + diff * 15));
  }

  const maxBacklogs = criteria.maxBacklogs ?? 0;
  const studentBacklogs = Number(education.backlogs) || 0;
  let backlogScore = 100;
  if (studentBacklogs > maxBacklogs) {
    backlogScore = Math.max(0, 100 - (studentBacklogs - maxBacklogs) * 25);
  }

  return Math.round(cgpaScore * 0.75 + backlogScore * 0.25);
}

/**
 * Compares a list of required/preferred skill strings against the student's skill set.
 * Returns { matched: string[], missing: string[], percentage: number }
 */
function matchSkillList(studentSkillsSet, requiredList = []) {
  const required = (requiredList || []).map((s) => s.toString().trim()).filter(Boolean);
  if (required.length === 0) {
    return { matched: [], missing: [], percentage: 100 }; // nothing required -> full marks
  }

  const matched = [];
  const missing = [];

  required.forEach((skill) => {
    if (studentSkillsSet.has(normalize(skill))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const percentage = Math.round((matched.length / required.length) * 100);
  return { matched, missing, percentage };
}

/**
 * Project score: credit for each required skill that appears in at least one of the
 * student's projects' technology lists, plus a small baseline for simply having projects.
 */
function scoreProjects(studentProfile, drive) {
  const projects = studentProfile.projects || [];
  const requiredSkills = (drive.requiredSkills || []).map(normalize).filter(Boolean);
  const preferredSkills = (drive.preferredSkills || []).map(normalize).filter(Boolean);
  const relevantSkills = [...new Set([...requiredSkills, ...preferredSkills])];

  if (projects.length === 0) return 0;

  // baseline for having at least one project, capped
  const baseline = Math.min(40, projects.length * 15);

  if (relevantSkills.length === 0) {
    return baseline;
  }

  const projectTechSet = new Set();
  projects.forEach((p) => {
    (p.technologies || []).forEach((t) => projectTechSet.add(normalize(t)));
  });

  const covered = relevantSkills.filter((s) => projectTechSet.has(s));
  const coverageScore = (covered.length / relevantSkills.length) * 60;

  return Math.round(Math.min(100, baseline + coverageScore));
}

/**
 * Certifications / experience score: simple count-based scaling.
 */
function scoreCertifications(studentProfile) {
  const certCount = (studentProfile.certifications || []).length;
  // 0 certs = 0, 1 = 50, 2 = 80, 3+ = 100
  if (certCount <= 0) return 0;
  if (certCount === 1) return 50;
  if (certCount === 2) return 80;
  return 100;
}

/**
 * Main entry point: runs eligibility + weighted match score for one student against one drive.
 */
function evaluateMatch(studentProfile, drive) {
  const eligibility = checkEligibility(studentProfile, drive);

  const studentSkillsSet = uniqueNormalizedSet(studentProfile.getAllSkills ? studentProfile.getAllSkills() : []);

  const academicScore = scoreAcademics(studentProfile, drive);
  const requiredMatch = matchSkillList(studentSkillsSet, drive.requiredSkills);
  const preferredMatch = matchSkillList(studentSkillsSet, drive.preferredSkills);
  const projectScore = scoreProjects(studentProfile, drive);
  const certScore = scoreCertifications(studentProfile);

  const weightedTotal =
    academicScore * WEIGHTS.academic +
    requiredMatch.percentage * WEIGHTS.requiredSkills +
    preferredMatch.percentage * WEIGHTS.preferredSkills +
    projectScore * WEIGHTS.projects +
    certScore * WEIGHTS.certifications;

  const matchPercentage = Math.round(Math.max(0, Math.min(100, weightedTotal)));

  return {
    eligibility: {
      status: eligibility.eligible ? 'eligible' : 'not_eligible',
      reasons: eligibility.reasons,
    },
    matchPercentage,
    breakdown: {
      academics: academicScore,
      requiredSkills: requiredMatch.percentage,
      preferredSkills: preferredMatch.percentage,
      projects: projectScore,
      certifications: certScore,
    },
    matchedSkills: [...new Set([...requiredMatch.matched, ...preferredMatch.matched])],
    missingSkills: [...new Set([...requiredMatch.missing, ...preferredMatch.missing])],
    requiredSkillsDetail: requiredMatch,
    preferredSkillsDetail: preferredMatch,
  };
}

/**
 * Generates plain-language improvement suggestions from missing skills / weak areas.
 */
const SKILL_ADVICE = {
  dsa: 'Learn arrays, strings, linked lists, stacks, queues and trees, then practice problems daily.',
  'data structures': 'Strengthen core data structures and practice problem solving regularly.',
  java: 'Revisit Java fundamentals - OOP concepts, collections, and exception handling.',
  sql: 'Practice SQL joins, aggregations, and query optimization on real datasets.',
  mongodb: 'Learn MongoDB CRUD operations, indexing, and the aggregation pipeline.',
  'node.js': 'Build a small REST API with Node.js and Express to solidify backend basics.',
  nodejs: 'Build a small REST API with Node.js and Express to solidify backend basics.',
  react: 'Build a small project with React hooks, state management, and component design.',
  docker: 'Learn Docker basics and containerize one of your existing projects.',
  git: 'Practice Git branching, merging, and collaborative workflows on GitHub.',
  'spring boot': 'Learn Spring Boot fundamentals and build a simple REST API with it.',
  python: 'Practice core Python syntax and build a small automation or data script.',
  'rest api': 'Learn REST API design principles and build/consume a few APIs.',
  aws: 'Get familiar with core AWS services like EC2, S3, and IAM basics.',
};

function getAdviceForSkill(skill) {
  const key = normalize(skill);
  return SKILL_ADVICE[key] || `Build a small project or complete a short course focused on ${skill}.`;
}

function generateImprovementSuggestions(missingSkills = []) {
  return missingSkills.slice(0, 6).map((skill) => ({
    skill,
    advice: getAdviceForSkill(skill),
  }));
}

module.exports = {
  WEIGHTS,
  checkEligibility,
  evaluateMatch,
  generateImprovementSuggestions,
  scoreAcademics,
  scoreProjects,
  scoreCertifications,
};
