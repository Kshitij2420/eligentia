# ELIGENTIA

### Smart Eligibility & Placement Intelligence Platform

**Know Your Fit. Find Your Gaps. Build Your Future.**

---

## Overview

ELIGENTIA is a MERN-based Smart Eligibility & Placement Intelligence Platform designed to enhance the college placement process. Instead of simply listing placement opportunities, ELIGENTIA compares a student's academic profile, skills, projects, certifications and resume information with individual job requirements. It calculates a transparent match percentage, identifies missing skills and eligibility gaps, and provides personalized improvement suggestions to help students become more placement-ready.

## Problem Statement

Traditional college placement portals are static job boards: they list opportunities but leave students to guess whether they qualify and how competitive their profile actually is. Students waste time applying to roles they're not eligible for, or miss roles they'd be strong candidates for, simply because there's no feedback loop between a student's profile and a job's requirements.

## Solution

ELIGENTIA introduces a **Smart Eligibility & Resume Matching** engine that runs every time a student views a job. It answers, in real time:

1. Am I eligible?
2. How closely does my profile match this job?
3. What skills do I already have?
4. What skills am I missing?
5. What should I learn or improve?
6. How can I improve my placement readiness overall?

## Main Innovation — the Matching Engine

**Eligibility** and **Match Percentage** are deliberately separate outputs:

- **Eligibility** is a hard pass/fail check against course, branch, graduation year, minimum CGPA, and maximum backlogs.
- **Match Percentage** is a continuous, weighted score (0–100%) calculated *regardless* of eligibility outcome, so an ineligible student can still see how strong their profile is.

The score is a transparent, weighted sum — no random numbers, no black-box AI:

| Component            | Weight |
|-----------------------|--------|
| Academics              | 20%   |
| Required Skills        | 50%   |
| Preferred Skills       | 10%   |
| Projects                | 10%   |
| Certifications/Experience | 10% |

Weights live in one place (`server/services/matchingEngine.js`) and are easy to tune.

## Features

- Student registration/login, profile builder (education, skills, projects, certifications, social links)
- Resume upload (PDF/DOCX) with basic text extraction and a resume-completeness score
- Admin-managed companies and placement drives with configurable eligibility criteria and skill requirements
- Per-job eligibility check + match percentage + matched/missing skills + improvement suggestions
- Placement readiness score (technical skills, academics, projects, resume, certifications)
- Job applications with duplicate prevention, status tracking (Applied → Under Review → Shortlisted → Selected/Rejected)
- In-app notifications (new jobs, status changes)
- Admin dashboard: student/company/job counts, application status breakdown, most common missing skills across all applicants
- JWT authentication with role-based authorization (student / admin)

## Technology Stack

**Frontend:** React, Vite, React Router, Tailwind CSS, Axios, Lucide React, Recharts
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, dotenv, cors

## Architecture

```
Student Profile / Resume
        ↓
  Job Requirements
        ↓
  Eligibility Check
        ↓
Profile-Job Matching
        ↓
  Match Percentage
        ↓
  Matched Skills
        ↓
  Missing Skills
        ↓
Improvement Suggestions
        ↓
Placement Readiness
        ↓
   Job Application
```

## Folder Structure

```
eligentia/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Navbar, Sidebar, MatchScore, JobCard, SkillGap...
│       ├── pages/
│       │   ├── student/     # Dashboard, Profile, Resume, Jobs, JobDetails, Applications, Notifications
│       │   └── admin/       # Dashboard, Students, Companies, PlacementDrives, Applications
│       ├── context/         # AuthContext
│       └── services/        # api.js (Axios client)
│
└── server/                  # Express backend
    ├── controllers/
    ├── models/               # User, StudentProfile, Resume, Company, PlacementDrive, Application, Notification
    ├── routes/
    ├── middleware/           # authMiddleware, roleMiddleware, errorMiddleware
    ├── services/             # matchingEngine.js, resumeParser.js, notificationService.js
    └── utils/seedData.js
```

## Database Design

- **User** — name, email, hashed password, role (student/admin)
- **StudentProfile** — 1:1 with User; personalInfo, education, skills (by category), projects, certifications, socialLinks
- **Resume** — latest uploaded file per student, extracted text, detected skills
- **Company** — name, industry, description, website
- **PlacementDrive** — belongs to a Company; eligibilityCriteria, requiredSkills, preferredSkills, deadline, status
- **Application** — links a student to a drive; stores the match snapshot at time of application (matchPercentage, matchedSkills, missingSkills) and a status
- **Notification** — per-user, typed (new_job / status_update / match_ready / general), read flag

## Matching Algorithm (Detail)

1. **Eligibility check** — course, branch, graduation year, CGPA, backlogs against the drive's criteria. Any failure produces a human-readable reason (e.g. *"Your CGPA is below the company's minimum requirement of 7.5."*).
2. **Academic score** — rewards CGPA headroom above the minimum and a clean backlog record.
3. **Required/Preferred skill match** — set comparison between the student's flattened skill list and the drive's skill lists; returns matched/missing arrays and a percentage.
4. **Project score** — credits required/preferred skills that appear in the student's project tech stacks, plus a small baseline for having projects at all.
5. **Certification score** — simple count-based scaling.
6. **Weighted total** — combined per the weights table above, rounded to the nearest integer, clamped to 0–100.
7. **Improvement suggestions** — for each missing skill, a short, curated piece of advice (falls back to a generic "build a small project" suggestion for unrecognized skills). Framed as *"Estimated improvement based on the matching algorithm"* — never a guarantee of selection.

## Installation

### Prerequisites
- Node.js 18+
- A MongoDB connection (local `mongod` or a free MongoDB Atlas cluster)

### 1. Clone and install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Environment setup

```bash
# server/.env
cp server/.env.example server/.env
```

Edit `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
# client/.env
cp client/.env.example client/.env
```

```
VITE_API_URL=http://localhost:5000/api
```

### 3. MongoDB setup

Use a local MongoDB instance, or create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) and paste its connection string into `MONGO_URI`.

### 4. Seed demo data

```bash
cd server
npm run seed
```

This creates 1 admin, 5 students (with deliberately varied CGPA/skills/backlogs so different students get different match results), 3 companies, and 5 placement drives.

### 5. Run

```bash
# Terminal 1 — backend
cd server
npm run dev      # or: npm start

# Terminal 2 — frontend
cd client
npm run dev
```

Frontend: https://eligentiaa24.vercel.app
Backend health check: https://eligentia-api.onrender.com
API: https://eligentia-api.onrender.com/api

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ELIGENTIA-blue?style=for-the-badge)](https://eligentiaa24.vercel.app/)
## Demo Credentials

**Admin**
- Email: `admin@eligentia.com`
- Password: `Admin@123`

**Students** (all use password `Student@123`)
- `aarav@eligentia.com` — strong profile, high CGPA, no backlogs
- `isha@eligentia.com` — mid CGPA, 1 backlog, MERN-leaning skills
- `rohan@eligentia.com` — top profile, multiple certifications and projects
- `priya@eligentia.com` — low CGPA, 2 backlogs, minimal skills (demonstrates "not eligible")
- `kabir@eligentia.com` — solid MERN profile

Log in as different students and open the same job to see how eligibility and match percentage change based on each profile.

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/students/profile
PUT    /api/students/profile
GET    /api/students/readiness

POST   /api/resumes/upload
GET    /api/resumes

GET    /api/companies
POST   /api/companies              (admin)
PUT    /api/companies/:id          (admin)
DELETE /api/companies/:id          (admin)

GET    /api/placements
GET    /api/placements/:id
GET    /api/placements/:id/match   (student)
POST   /api/placements             (admin)
PUT    /api/placements/:id         (admin)
DELETE /api/placements/:id         (admin)

POST   /api/applications           (student)
GET    /api/applications/my        (student)
GET    /api/applications           (admin)
PUT    /api/applications/:id/status (admin)

GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all

GET    /api/admin/dashboard
GET    /api/admin/students
```

All responses follow `{ success: boolean, ...data }` or `{ success: false, message: string }` on error.

## Future Improvements

- Plug an LLM into `server/services/aiService.js` (not required for this version) for semantic skill matching, deeper resume parsing, and job-description analysis
- Email/SMS notifications alongside in-app ones
- Resume versioning and richer parsing (structured section extraction)
- Bulk CSV import for companies/drives
- Analytics export (CSV/PDF) for placement officers
