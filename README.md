# Secure Online Examination and Assessment Platform

A full-stack, enterprise-grade academic assessment portal built with the **MERN** stack (MongoDB, Express, React, Node.js + TypeScript & Tailwind CSS). Designed for educational institutions requiring secure digital testing, real-time proctoring event tracking, automated scoring, subjective manual evaluation, and student/faculty performance analytics.

---

## 🌟 Key Features

### 1. 🛡️ Academic Integrity Monitoring & Proctoring
- **Fullscreen Enforcement**: Candidates must remain in fullscreen mode; leaving fullscreen triggers immediate warning alerts and logs events to the server.
- **Tab Switch & Focus Detection**: Browser `visibilitychange` and window `blur` events track when students leave the exam window.
- **Clipboard & Context Menu Lock**: Prevents copying questions or pasting external answers into the examination interface.
- **Warning Threshold & Flagging**: Attempts exceeding the configurable warning limit (default: 5 warnings) are automatically flagged for faculty review.
- **Proctoring Audit Trail**: Faculty and administrators can inspect timestamped event logs for every candidate attempt.

### 2. 📝 Automated & Subjective Evaluation
- **Automated Grading**: Instant evaluation for Multiple Choice Questions (MCQ) and True/False questions upon submission.
- **Subjective Short-Answer Grading**: Faculty can review student text responses against grading rubrics, assign custom marks, and provide individual feedback.
- **Dynamic Scorecards**: Generates breakdown of correct, incorrect, unanswered, and pending evaluation counts with percentage and pass/fail status.

### 3. 👥 Role-Based Dashboards
- **👨‍💼 Administrator**:
  - Platform-wide statistics (total users, exams, submissions, pass rates, integrity incidents).
  - User Directory: Add faculty/students, change user roles, activate/deactivate accounts, delete users.
  - Academic Integrity Compliance Log: Filterable by violation type and examination.
- **👩‍🏫 Faculty / Examiner**:
  - Exam builder: Configure titles, subject, duration, total marks, passing marks, schedule dates, and proctoring rules.
  - Question bank: Add MCQs with multiple choices, True/False toggles, and short-answer prompts with rubric keys.
  - Subjective grading queue: Grade pending short-answer submissions and update student scores.
  - Real-time proctoring audit: View flagged attempts with violation details.
  - Class analytics: Performance charts powered by Recharts (exam breakdown, subject mastery, student comparisons).
- **🎓 Student**:
  - Exam Schedule: View published tests with durations, marks, and active status.
  - Fullscreen Exam Room: Live countdown timer, color-coded question palette, mark-for-review, auto-saving answers, and confirmation modal.
  - Comprehensive Results: Review questions, candidate answers vs correct answers, faculty feedback, and explanations.
  - Performance Trends: Score progression line chart and subject-wise averages.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Axios, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, JWT (jsonwebtoken), bcryptjs, CORS, dotenv |
| **Database** | MongoDB Atlas / Local MongoDB (Database: `online_exam_platform`) |

---

## 📂 Project Structure

```
d:/FSD/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, StatCard, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── layouts/            # DashboardLayout (role-aware navigation)
│   │   ├── pages/
│   │   │   ├── auth/           # Login (with 1-click demo accounts), Register
│   │   │   ├── admin/          # AdminDashboard, UserManagement, AcademicIntegrityReport
│   │   │   ├── faculty/        # FacultyDashboard, CreateExam, ManageQuestions, EvaluateExam, ProctoringLogView, FacultyAnalytics
│   │   │   └── student/        # StudentDashboard, ExamInstructions, ExamRoom, ExamResult, StudentAnalytics
│   │   ├── services/           # Axios instance with auth interceptors
│   │   ├── types/              # TypeScript interfaces for Models and APIs
│   │   ├── App.tsx             # Route definitions and access control
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind CSS
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.ts)
│   │   ├── controllers/        # auth, user, exam, question, attempt, evaluation, proctoring, analytics
│   │   ├── middleware/         # JWT verification, Role authorization
│   │   ├── models/             # User, Exam, Question, ExamAttempt, Answer, ProctoringEvent
│   │   ├── routes/             # REST API routes
│   │   ├── seed/               # Database seeder with realistic test data
│   │   └── index.ts            # Express server initialization
│   ├── .env                    # Configured MongoDB Atlas connection
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── package.json                # Root package with concurrently scripts
└── README.md
```

---

## ⚙️ Configuration & MongoDB Atlas Setup

The database connection is defined in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://selvipraveen252_db_user:igHRNC7pZOCOH3Ur@civicadmin.nvud2in.mongodb.net/online_exam_platform?retryWrites=true&w=majority&appName=civicadmin
JWT_SECRET=civicconnect_super_secret_jwt_key_2026_academic_demo
CLIENT_URL=http://localhost:5173
```

> [!IMPORTANT]
> **MongoDB Atlas IP Whitelist Requirement**:
> If you encounter `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`, your current IP address is not whitelisted in your MongoDB Atlas cluster.
> 1. Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
> 2. Go to **Security** -> **Network Access**.
> 3. Click **Add IP Address** and either add your **Current IP Address** or add `0.0.0.0/0` (Allow access from anywhere).
> 4. Wait 1-2 minutes for Atlas to deploy the network change.

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
Run from the root directory (`d:\FSD`):
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Seed Database with Demo Accounts & Sample Exam
Once your IP is whitelisted in Atlas (or when running local MongoDB):
```bash
npm run seed
```
This populates the `online_exam_platform` database with:
- System Administrator
- Course Instructor / Faculty
- 3 Students (Rahul Verma with completed exam, Priya Patel with flagged attempt, Ananya Iyer ready to take exams)
- 2 Comprehensive Examinations with MCQs, True/False, and Short-Answer questions
- Realistic proctoring events and scorecards

### 3. Run the Full Application
Start both backend API (`http://localhost:5000`) and frontend Vite client (`http://localhost:5173`) simultaneously:
```bash
npm run dev
```

Or run them individually in separate terminals:
- **Backend**: `npm run server` (or `cd server && npm run dev`)
- **Frontend**: `npm run client` (or `cd client && npm run dev`)

---

## 🔑 Demo Login Credentials

The login page includes **One-Click Demo Account Buttons** for instant presentation:

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@examplatform.edu` | `Admin@123` | Full access to users, roles, integrity logs & metrics |
| **Faculty / Examiner** | `faculty@examplatform.edu` | `Faculty@123` | Create exams, add questions, grade short-answers, view analytics |
| **Student 1** | `student1@examplatform.edu` | `Student@123` | Completed exam (Rahul Verma, 94% evaluated) |
| **Student 2** | `student2@examplatform.edu` | `Student@123` | Flagged attempt (Priya Patel, 3 integrity warnings) |
| **Student 3** | `student3@examplatform.edu` | `Student@123` | Clean student ready to take the examination live! |

---

## 🧪 Verification & Demonstration Walkthrough

1. **Sign in as Student 3 (`student3@examplatform.edu` / `Student@123`)**:
   - See available exam: *"Advanced Database Systems & NoSQL Architecture"*.
   - Click **View Instructions & Start**. Review proctoring rules and check consent.
   - Click **Enter Fullscreen & Begin Exam**.
   - Answer MCQs, True/False, and write short answer.
   - Test Proctoring: Exit fullscreen or switch tabs -> notice the **Academic Integrity Warning** counter strike appear!
   - Submit the exam -> View the instant Scorecard with automated grading on objective questions and pending status on the subjective question!
2. **Sign in as Faculty (`faculty@examplatform.edu` / `Faculty@123`)**:
   - Go to **Subjective Grading** -> Click **Evaluate Submission** to read Student 3's written answer, assign marks (0-15), enter feedback, and save.
   - Go to **Proctoring Flags** -> Inspect the timestamped log of tab switches and fullscreen exits.
   - Go to **Class Analytics** -> Review the Recharts charts.
3. **Sign in as Admin (`admin@examplatform.edu` / `Admin@123`)**:
   - Go to **User Management** -> Add new users, toggle accounts, change roles.
   - Go to **Academic Integrity** -> Audit institution-wide violation statistics.
