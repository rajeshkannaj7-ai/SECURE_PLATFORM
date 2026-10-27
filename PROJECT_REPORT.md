# ExamShield: Next-Gen AI-Proctored Online Examination & Assessment Platform
## Comprehensive Academic Project Report & Technical Source Code Appendix

---

### Project Metadata
- **Project Title:** ExamShield — Secure AI-Proctored Online Examination & Assessment Platform
- **Architecture:** Full-Stack MERN (MongoDB, Express.js, React.js, Node.js) with TypeScript
- **Security & Integrity Engine:** Automated Anti-Cheat Detection (Tab-Switch, Fullscreen Guard, WebRTC Video Proctoring, AI Suspicious Movement & Audio Analysis)
- **Authentication & Security:** JSON Web Token (JWT) Bearer Auth, Bcrypt Hashing, Multi-Role RBAC (Student, Examiner/Proctor, Administrator)
- **Deployment:** Docker, Docker Compose, Multi-tier Redis/Memory Caching, Socket.io Real-Time Telemetry

---

## TABLE OF CONTENTS
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [System Architecture & Data Flow](#2-system-architecture--data-flow)
3. [Project Directory Structure](#3-project-directory-structure)
4. [Environment Configuration & Dependencies](#4-environment-configuration--dependencies)
5. [Database Models & Anti-Tampering Schemas](#5-database-models--anti-tampering-schemas)
6. [Security & Authentication Middleware](#6-security--authentication-middleware)
7. [Core Business Logic & Backend Controllers](#7-core-business-logic--backend-controllers)
8. [Express Application Setup & Routing Pipeline](#8-express-application-setup--routing-pipeline)
9. [REST API Interface Specification & Sample Payloads](#9-rest-api-interface-specification--sample-payloads)
10. [Frontend Highlights: Secure Exam Room & Live Proctoring Feed](#10-frontend-highlights-secure-exam-room--live-proctoring-feed)
11. [Project Screenshots & Interface Directory (Figures A.1 – A.7)](#11-project-screenshots--interface-directory-figures-a1--a7)
12. [Installation, Testing & Execution Guide](#12-installation-testing--execution-guide)

---

## 1. EXECUTIVE SUMMARY & PROBLEM STATEMENT

### 1.1 The Academic & Certification Problem
The transition to remote education and professional certifications has highlighted significant vulnerabilities in remote assessments. Traditional online assessment platforms suffer from systemic flaws:
- **Pervasive Academic Dishonesty:** Unmonitored candidate environments allow screen sharing, tab switching, and unauthorized external aids.
- **Absence of Real-Time Proctoring:** Assessors receive submissions without continuous behavioral telemetry or audit logs.
- **Manual Grading Inefficiencies:** Grading mixed question types (MCQs, coding challenges, descriptive responses) is time-consuming and introduces subjectivity.
- **Integrity Disputes & Lack of Forensics:** When cheating is suspected, institutions lack forensic event logs (e.g., timestamps of tab loss, gaze aversion, secondary audio).

### 1.2 The ExamShield Solution
**ExamShield** is an enterprise-grade secure examination lifecycle platform uniting **Students**, **Proctors/Examiners**, and **Academic Administrators**:
- **Students** take examinations inside a locked fullscreen environment with automated webcam/microphone validation, real-time violation warnings, and auto-saving answer state machines.
- **Examiners/Proctors** build randomized question banks, configure strict tolerance rules (e.g., max 3 tab switches before auto-disqualification), watch multi-candidate live streams, and review flagged incidents.
- **Administrators** audit institutional pass rates, monitor cheating frequency heatmaps, oversee exam scheduling, and review proctor intervention logs.

```
[ STUDENT ] ─────────► ENROLLED
                           │
                 (System Pre-Check: Cam/Mic/Fullscreen)
                           ▼
                       VERIFIED ─────────► [ BLOCKED ] (Hardware/Permission Fail)
                           │
                    (Exam Activated)
                           ▼
                      IN_PROGRESS
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
 [ NORMAL ATTEMPT ]                 [ VIOLATION FLAGGED ]
 (Continuous Auto-Save)             (Tab Switch / Gaze Loss / Audio)
       │                                       │
       │                                 (Max Violations Exceeded)
       │                                       ▼
       │                                [ DISQUALIFIED ]
       ▼                                       │
   SUBMITTED ◄─────────────────────────────────┘
       │
 (Auto-Grading & Proctor Audit)
       │
       ▼
    PUBLISHED (Final Grade & Integrity Score Released)
```

---

## 2. SYSTEM ARCHITECTURE & DATA FLOW

The platform follows a three-tier decoupled, event-driven architecture:
1. **Presentation Tier:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, and WebRTC/HTML5 Fullscreen API for lockdown client enforcement.
2. **Application Tier:** Node.js and Express.js REST API with Socket.io real-time proctoring streams, JWT authentication, Multer snapshot processing, and Redis caching.
3. **Data Tier:** MongoDB document database with compound indexing, sub-document audit trails for violation telemetry, and an in-memory MongoDB fallback for testing.

```
                       [ Student / Proctor / Admin ]
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │   React + TypeScript Frontend (Vite)    │
                │  - Lockdown Fullscreen & Tab Monitor    │
                │  - WebRTC Video Stream & Snapshot Loop  │
                │  - Recharts Grade & Integrity Analytics │
                └────────────────────┬────────────────────┘
                                     │ HTTP / WebSockets / JWT
                                     ▼
                ┌─────────────────────────────────────────┐
                │     Express.js + Node.js Server         │
                │  - JWT Bearer Auth & RBAC Middleware    │
                │  - Socket.io Live Violation Telemetry   │
                │  - Automated MCQ & Code Auto-Grader     │
                │  - Redis / In-Memory Session Cache      │
                └────────────────────┬────────────────────┘
                                     │ Mongoose ODM
                                     ▼
                ┌─────────────────────────────────────────┐
                │      MongoDB / MongoDB Atlas Database   │
                │  - Users, Exams, Questions, Submissions │
                │  - Time-series Violation Audit Trail    │
                │  - Cryptographic Result Verification    │
                └─────────────────────────────────────────┘
```

---

## 3. PROJECT DIRECTORY STRUCTURE

```text
ExamShield/
├── docker-compose.yml              # Container orchestration (Node, React, Mongo, Redis)
├── package.json                    # Workspace orchestrator
├── README.md                       # Repository guide
├── PROJECT_REPORT.md               # Unified academic report & source code appendix
│
├── server/                         # Express + Node.js API Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB connection with MongoMemoryServer fallback
│   │   │   ├── redis.ts            # Redis client initialization with in-memory caching
│   │   │   └── socket.ts           # Socket.io real-time proctoring event broker
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Registration, authentication, and JWT issuance
│   │   │   ├── examController.ts   # Exam creation, question management, access control
│   │   │   ├── submissionController.ts # Exam attempt & submission routes (/api/submissions)
│   │   │   ├── proctorController.ts # Real-time flag dispatch, live stream telemetry
│   │   │   └── dashboardController.ts # Institutional performance & cheating frequency metrics
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT Bearer verification
│   │   │   ├── role.ts             # Role-based access control (Student, Proctor, Admin)
│   │   │   ├── upload.ts           # Multer configuration for proctoring snapshot storage
│   │   │   ├── rateLimiter.ts      # Sliding-window rate limiter for anti-DDoS/brute-force
│   │   │   └── errorHandler.ts     # Global Express error interceptor
│   │   ├── models/
│   │   │   ├── User.ts             # User schema with bcrypt password hashing
│   │   │   ├── Exam.ts             # Exam schedule, settings, questions, and anti-cheat policies
│   │   │   ├── Submission.ts       # Student responses, scores, integrity status, and logs
│   │   │   └── ViolationLog.ts     # Time-stamped cheating incidents with snapshot references
│   │   ├── routes/
│   │   │   ├── authRoutes.ts       # Authentication endpoints (/api/auth)
│   │   │   ├── examRoutes.ts       # Exam lifecycle routes (/api/exams)
│   │   │   ├── submissionRoutes.ts # Exam attempt & submission routes (/api/submissions)
│   │   │   ├── proctorRoutes.ts    # Proctor intervention routes (/api/proctor)
│   │   │   └── dashboardRoutes.ts  # Administrative analytics routes (/api/dashboard)
│   │   ├── services/
│   │   │   ├── cacheService.ts     # Multi-tier Redis / memory caching service
│   │   │   ├── gradingService.ts   # Automated answer scoring engine
│   │   │   └── proctorService.ts   # Anomaly detection & live event emitter
│   │   ├── tests/
│   │   │   ├── api.test.ts         # Automated backend test suite
│   │   │   └── e2e-exam-flow.test.js # End-to-end exam taking and violation test
│   │   ├── utils/
│   │   │   ├── seed.ts             # Seed script for mock courses, exams, and users
│   │   │   └── logger.ts           # Structured console logging utility
│   │   ├── app.ts                  # Express application pipeline configuration
│   │   └── server.ts               # HTTP & Socket.io server bootstrap
│   ├── uploads/                    # Local proctor snapshot storage
│   ├── .env.example                # Environment variables template
│   ├── package.json                # Backend dependency manifest
│   └── tsconfig.json               # Backend TypeScript compiler settings
│
└── client/                         # React.js + TypeScript Modern Single-Page App
    ├── src/
    │   ├── components/
    │   │   ├── ExamTimer.tsx       # Synchronized countdown clock with auto-submit
    │   │   ├── FullscreenGuard.tsx # Lockdown fullscreen enforcer and escape listener
    │   │   ├── LiveWebcamFeed.tsx  # Video capture component with periodic snapshot trigger
    │   │   ├── Navbar.tsx          # Dynamic navigation bar with role badges & alert bell
    │   │   ├── QuestionPalette.tsx # Status matrix (Answered, Flagged, Unvisited)
    │   │   ├── ProtectedRoute.tsx  # Route guard checking authentication and roles
    │   │   ├── StatCard.tsx        # KPI metrics counter card
    │   │   ├── ViolationAlertModal.tsx # Disruption warning overlay for students
    │   │   └── ProctorLiveGrid.tsx # Multi-candidate live video stream wall for proctors
    │   ├── context/
    │   │   ├── AuthContext.tsx     # Authentication state, login, and logout provider
    │   │   └── ExamSessionContext.tsx # Live exam state, telemetry, and answer manager
    │   ├── pages/
    │   │   ├── Landing.tsx         # Platform overview with feature showcase
    │   │   ├── Login.tsx           # Authentication portal with 1-Click Demo Accounts
    │   │   ├── Register.tsx        # Student account creation form
    │   │   ├── StudentDashboard.tsx# Student upcoming, active, and completed exams
    │   │   ├── ProctorDashboard.tsx# Live exam oversight, violation triage, and feeds
    │   │   ├── AdminDashboard.tsx  # Institutional analytics, exam scheduler, and users
    │   │   ├── ExamRoom.tsx        # High-security exam environment with question viewer
    │   │   ├── ExamCreator.tsx     # Exam drafting portal with custom anti-cheat limits
    │   │   ├── ResultView.tsx      # Comprehensive score breakdown and violation audit
    │   │   └── UserManagement.tsx  # Institutional user management and role assignment
    │   ├── services/
    │   │   ├── api.ts              # Axios instance configured with JWT request interceptor
    │   │   ├── authService.ts      # Authentication API calls
    │   │   ├── examService.ts      # Exam CRUD and question bank operations
    │   │   └── submissionService.ts# Real-time answer saving and violation reporting
    │   ├── types/
    │   │   └── index.ts            # Global TypeScript interfaces and domain models
    │   ├── utils/
    │   │   ├── formatTime.ts       # Time formatting helper
    │   │   └── integrityScore.ts   # Heuristic integrity calculation algorithm
    │   ├── App.tsx                 # Client routing declarations
    │   ├── main.tsx                # React DOM tree entry
    │   └── index.css               # Tailwind CSS declarations and layout styles
    ├── index.html                  # HTML5 base document
    ├── package.json                # Frontend dependency manifest
    ├── tailwind.config.js          # Tailwind CSS styling and theme tokens
    └── vite.config.ts              # Vite compilation and proxy configuration
```

---

## 4. ENVIRONMENT CONFIGURATION & DEPENDENCIES

### 4.1 Environment Variables Configuration (`server/.env`)
```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Database Configuration (Local MongoDB or Atlas URI)
MONGODB_URI=mongodb://127.0.0.1:27017/examshield

# Security Configuration - JSON Web Token Secret
JWT_SECRET=examshield_super_secure_jwt_key_2026_academic_demo
JWT_EXPIRES_IN=7d

# Optional Redis Connection (Leave empty to use built-in in-memory cache)
REDIS_URL=

# Socket.io Allowed Origins
CLIENT_ORIGIN=http://localhost:5173

# Anti-Cheat Snapshot Directory
UPLOAD_DIR=uploads/snapshots
```

### 4.2 Backend Dependency Configuration (`server/package.json`)
```json
{
  "name": "examshield-server",
  "version": "1.0.0",
  "description": "ExamShield API Server - Secure AI-Proctored Online Examination Platform",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "tsx src/utils/seed.ts",
    "test": "tsx src/tests/api.test.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "ioredis": "^5.4.2",
    "jsonwebtoken": "^9.0.2",
    "mongodb-memory-server": "^10.1.3",
    "mongoose": "^8.9.5",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.8.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.8",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.10.7",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
```

### 4.3 Frontend Dependency Configuration (`client/package.json`)
```json
{
  "name": "examshield-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "clsx": "^2.1.1",
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.1",
    "recharts": "^2.15.0",
    "socket.io-client": "^4.8.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.7",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "vite": "^6.0.7"
  }
}
```

---

## 5. DATABASE MODELS & ANTI-TAMPERING SCHEMAS

### 5.1 MongoDB Connection Setup (`server/src/config/db.ts`)
```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance: any = null;

export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/examshield';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB] Connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return uri;
  } catch (primaryError: any) {
    const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
    console.warn(`[MongoDB] Could not connect to primary URI (${maskedUri}): ${primaryError.message}`);
    console.log('[MongoDB] Initializing in-memory MongoDB server fallback for demonstration...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to Embedded MongoDB Server: ${memoryUri}`);
      return memoryUri;
    } catch (fallbackError: any) {
      console.error('[MongoDB] Failed to connect to both primary URI and in-memory server:', fallbackError);
      throw fallbackError;
    }
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
```

### 5.2 User Model (`server/src/models/User.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'student' | 'proctor' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'proctor', 'admin'],
      default: 'student',
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
```

### 5.3 Exam & Anti-Cheat Rule Model (`server/src/models/Exam.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

export interface IAntiCheatSettings {
  maxTabSwitches: number;
  requireWebcam: boolean;
  requireMicrophone: boolean;
  enforceFullscreen: boolean;
  captureIntervalSeconds: number;
}

export interface IExam extends Document {
  title: string;
  courseCode: string;
  description: string;
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
  totalMarks: number;
  passingMarks: number;
  questions: IQuestion[];
  antiCheat: IAntiCheatSettings;
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true, select: false },
  marks: { type: Number, default: 1 },
});

const AntiCheatSchema = new Schema<IAntiCheatSettings>({
  maxTabSwitches: { type: Number, default: 3 },
  requireWebcam: { type: Boolean, default: true },
  requireMicrophone: { type: Boolean, default: true },
  enforceFullscreen: { type: Boolean, default: true },
  captureIntervalSeconds: { type: Number, default: 30 },
});

const ExamSchema = new Schema<IExam>(
  {
    title: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    durationMinutes: { type: Number, required: true, min: 5 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    questions: [QuestionSchema],
    antiCheat: { type: AntiCheatSchema, default: () => ({}) },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ExamSchema.index({ courseCode: 1, startTime: 1 });
export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
export default Exam;
```

### 5.4 Submission & Violation Telemetry Model (`server/src/models/Submission.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'DISQUALIFIED';
export type ViolationType = 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'MULTIPLE_FACES' | 'NO_FACE' | 'AUDIO_ANOMALY';

export interface IViolationItem {
  type: ViolationType;
  timestamp: Date;
  snapshotUrl?: string;
  metadata?: string;
}

export interface IAnswerItem {
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex: number;
  isCorrect?: boolean;
  awardedMarks?: number;
}

export interface ISubmission extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IAnswerItem[];
  status: SubmissionStatus;
  violations: IViolationItem[];
  integrityScore: number; // 0 - 100%
  score: number;
  startedAt: Date;
  submittedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, required: true },
        selectedOptionIndex: { type: Number, required: true },
        isCorrect: { type: Boolean },
        awardedMarks: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'DISQUALIFIED'],
      default: 'IN_PROGRESS',
    },
    violations: [
      {
        type: {
          type: String,
          enum: ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'MULTIPLE_FACES', 'NO_FACE', 'AUDIO_ANOMALY'],
          required: true,
        },
        timestamp: { type: Date, default: Date.now },
        snapshotUrl: { type: String, default: '' },
        metadata: { type: String, default: '' },
      },
    ],
    integrityScore: { type: Number, default: 100 },
    score: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });
export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
export default Submission;
```

---

## 6. SECURITY & AUTHENTICATION MIDDLEWARE

### 6.1 JWT Bearer Token Verification (`server/src/middleware/auth.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authorization token required.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'examshield_super_secure_jwt_key_2026_academic_demo';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Candidate account no longer active.' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};
```

### 6.2 Role-Based Access Control Guard (`server/src/middleware/role.ts`)
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated session.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' lacks sufficient privileges for this operational endpoint.`,
      });
      return;
    }

    next();
  };
};
```

---

## 7. CORE BUSINESS LOGIC & BACKEND CONTROLLERS

### 7.1 Authentication Controller (`server/src/controllers/authController.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'examshield_super_secure_jwt_key_2026_academic_demo';
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, studentId } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'All registration fields are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Account with this email already registered.' });
      return;
    }

    const assignedRole: UserRole = role && ['student', 'proctor', 'admin'].includes(role) ? role : 'student';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      studentId: studentId || '',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### 7.2 Exam Submission, Anti-Cheat & Auto-Grading Controller (`server/src/controllers/submissionController.ts`)
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Submission from '../models/Submission';
import Exam from '../models/Exam';

// Start or Resume Candidate Exam Session
export const startExamSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { examId } = req.params;
    const studentId = req.user!._id;

    const exam = await Exam.findById(examId);
    if (!exam || !exam.isPublished) {
      res.status(404).json({ success: false, message: 'Assessment not found or unpublished.' });
      return;
    }

    let submission = await Submission.findOne({ examId, studentId });

    if (!submission) {
      submission = await Submission.create({
        examId,
        studentId,
        answers: [],
        violations: [],
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        integrityScore: 100,
      });
    }

    if (submission.status === 'SUBMITTED' || submission.status === 'DISQUALIFIED') {
      res.status(403).json({ success: false, message: 'This examination has already concluded.' });
      return;
    }

    // Strip answers from questions
    const safeQuestions = exam.questions.map((q) => ({
      _id: q._id,
      prompt: q.prompt,
      options: q.options,
      marks: q.marks,
    }));

    res.status(200).json({
      success: true,
      submission,
      exam: {
        title: exam.title,
        courseCode: exam.courseCode,
        durationMinutes: exam.durationMinutes,
        antiCheat: exam.antiCheat,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Log Integrity Disruption / Anti-Cheat Violation
export const recordViolation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { examId } = req.params;
    const { type, metadata, snapshotUrl } = req.body;
    const studentId = req.user!._id;

    const submission = await Submission.findOne({ examId, studentId });
    if (!submission || submission.status !== 'IN_PROGRESS') {
      res.status(400).json({ success: false, message: 'No active session to record violation.' });
      return;
    }

    const exam = await Exam.findById(examId);
    const maxAllowed = exam?.antiCheat.maxTabSwitches ?? 3;

    submission.violations.push({
      type,
      timestamp: new Date(),
      metadata: metadata || '',
      snapshotUrl: snapshotUrl || '',
    });

    // Reduce integrity score
    submission.integrityScore = Math.max(0, submission.integrityScore - 15);

    const tabViolationsCount = submission.violations.filter((v) => v.type === 'TAB_SWITCH' || v.type === 'FULLSCREEN_EXIT').length;

    let autoDisqualified = false;
    if (tabViolationsCount >= maxAllowed) {
      submission.status = 'DISQUALIFIED';
      submission.submittedAt = new Date();
      autoDisqualified = true;
    }

    await submission.save();

    res.status(200).json({
      success: true,
      violationsCount: submission.violations.length,
      remainingChances: Math.max(0, maxAllowed - tabViolationsCount),
      autoDisqualified,
      integrityScore: submission.integrityScore,
    });
  } catch (error) {
    next(error);
  }
};

// Finalize & Automated Grading Engine
export const submitExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;
    const studentId = req.user!._id;

    const submission = await Submission.findOne({ examId, studentId });
    if (!submission) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const exam = await Exam.findById(examId).select('+questions.correctOptionIndex');
    if (!exam) {
      res.status(404).json({ success: false, message: 'Associated exam missing.' });
      return;
    }

    let calculatedScore = 0;
    const gradedAnswers = (answers || []).map((ans: any) => {
      const q = exam.questions.id(ans.questionId);
      const isCorrect = q ? q.correctOptionIndex === ans.selectedOptionIndex : false;
      const awardedMarks = isCorrect ? q.marks : 0;
      if (isCorrect) calculatedScore += awardedMarks;

      return {
        questionId: ans.questionId,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect,
        awardedMarks,
      };
    });

    submission.answers = gradedAnswers;
    submission.score = calculatedScore;
    submission.status = submission.status === 'DISQUALIFIED' ? 'DISQUALIFIED' : 'SUBMITTED';
    submission.submittedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Assessment completed and recorded.',
      totalScore: calculatedScore,
      maxMarks: exam.totalMarks,
      status: submission.status,
      integrityScore: submission.integrityScore,
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 8. EXPRESS APPLICATION SETUP & ROUTING PIPELINE

### 8.1 Express Main App File (`server/src/app.ts`)
```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import examRoutes from './routes/examRoutes';
import submissionRoutes from './routes/submissionRoutes';
import proctorRoutes from './routes/proctorRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(rateLimiter({ windowMs: 60 * 1000, max: 200 }));

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'online', platform: 'ExamShield AI Proctor API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/proctor', proctorRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
```

### 8.2 Submission Router Pipeline (`server/src/routes/submissionRoutes.ts`)
```typescript
import { Router } from 'express';
import { startExamSession, recordViolation, submitExam } from '../controllers/submissionController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/role';

const router = Router();

// Student routes
router.post('/session/:examId', authenticate, authorizeRoles('student', 'admin'), startExamSession);
router.post('/violation/:examId', authenticate, authorizeRoles('student'), recordViolation);
router.post('/submit/:examId', authenticate, authorizeRoles('student', 'admin'), submitExam);

export default router;
```

---

## 9. REST API INTERFACE SPECIFICATION & SAMPLE PAYLOADS

### 9.1 Authentication (`POST /api/auth/login`)
#### Request:
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "student@examshield.edu",
  "password": "Student@123"
}
```
#### Response:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66f790ac89b1a12345678901",
    "name": "Sarah Connor",
    "email": "student@examshield.edu",
    "role": "student",
    "studentId": "STU-2026-908"
  }
}
```

### 9.2 Record Anti-Cheat Violation Event (`POST /api/submissions/violation/:examId`)
#### Request:
```http
POST /api/submissions/violation/66f8002a78c934561234abcd HTTP/1.1
Host: localhost:5000
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "type": "TAB_SWITCH",
  "metadata": "Candidate lost window focus to an external application (Chrome DevTools / PDF)",
  "snapshotUrl": "/uploads/snapshots/snap_candidate_908_frame2.jpg"
}
```
#### Response:
```json
{
  "success": true,
  "violationsCount": 2,
  "remainingChances": 1,
  "autoDisqualified": false,
  "integrityScore": 70
}
```

### 9.3 Exam Finalization & Scoring Result (`POST /api/submissions/submit/:examId`)
#### Request:
```http
POST /api/submissions/submit/66f8002a78c934561234abcd HTTP/1.1
Host: localhost:5000
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "answers": [
    { "questionId": "66f80111a8c9345612341111", "selectedOptionIndex": 1 },
    { "questionId": "66f80111a8c9345612342222", "selectedOptionIndex": 3 }
  ]
}
```
#### Response:
```json
{
  "success": true,
  "message": "Assessment completed and recorded.",
  "totalScore": 48,
  "maxMarks": 50,
  "status": "SUBMITTED",
  "integrityScore": 85
}
```

---

## 10. FRONTEND HIGHLIGHTS: SECURE EXAM ROOM & LIVE PROCTORING FEED

### 10.1 Login Page with 1-Click Demo Buttons (`client/src/pages/Login.tsx`)
```tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await authService.login({ email: demoEmail, password: demoPass });
      if (res.success) {
        login(res.token, res.user);
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'proctor') navigate('/proctor/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Demo authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-white text-2xl tracking-wide">ExamShield</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-200">Secure Examination Gateway</h2>
        </div>

        {/* 1-Click Demonstration Account Switcher */}
        <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/30 shadow-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Instant 1-Click Academic Demo Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student@examshield.edu', 'Student@123')}
              className="px-2.5 py-2 text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-xl border border-indigo-700/50 transition-all"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('proctor@examshield.edu', 'Proctor@123')}
              className="px-2.5 py-2 text-xs font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded-xl border border-amber-700/50 transition-all"
            >
              Proctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@examshield.edu', 'Admin@123')}
              className="px-2.5 py-2 text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-xl border border-emerald-700/50 transition-all"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 10.2 Fullscreen Lockdown Guard & Tab-Switch Sensor (`client/src/components/FullscreenGuard.tsx`)
```tsx
import React, { useEffect } from 'react';

interface Props {
  onViolation: (type: string, desc: string) => void;
  isActive: boolean;
}

export const FullscreenGuard: React.FC<Props> = ({ onViolation, isActive }) => {
  useEffect(() => {
    if (!isActive) return;

    // Detect Tab Switching or Loss of Focus
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolation('TAB_SWITCH', 'Candidate switched browser tabs or minimized window.');
      }
    };

    // Detect Exit from Lockdown Fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onViolation('FULLSCREEN_EXIT', 'Candidate terminated locked fullscreen assessment mode.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, onViolation]);

  return null;
};
```

---

## 11. PROJECT SCREENSHOTS & INTERFACE DIRECTORY (FIGURES A.1 – A.7)

> **Report Note:** Insert the captured graphic screenshots into each designated figure section below for physical printout or PDF export.

---

### Figure A.1: Sign-in Portal with 1-Click Demonstration Account Switchers
```text
+-----------------------------------------------------------------------------------+
|  [ExamShield Shield Logo]                                                         |
|                                                                                   |
|  Secure Examination Gateway                                                      |
|  Authenticate to access locked proctored testing sessions                         |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  * INSTANT 1-CLICK ACADEMIC DEMO LOGIN                                      |  |
|  |  +---------------------+  +--------------------+  +----------------------+  |  |
|  |  | [ Student ]         |  | [ Proctor ]        |  | [ Administrator ]    |  |  |
|  |  +---------------------+  +--------------------+  +----------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  University Email: [ student@examshield.edu                              ]        |
|  Password:         [ ************                                        ]        |
|                                                                                   |
|  [                 Enter Secure ExamShield Environment                   ]        |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.1: ExamShield Authentication Portal featuring role-based credential inputs and 1-Click instant demo switchers for Student, Live Proctor, and Academic Administrator.*

---

### Figure A.2: Student Pre-Check & Hardware Validation Portal
```text
+-----------------------------------------------------------------------------------+
|  ExamShield   [Active Assessments]   [Results]   (System Health)    [Sarah Connor]|
+-----------------------------------------------------------------------------------+
|  System Diagnostic & Anti-Cheat Validation: CS-401 Distributed Algorithms         |
|                                                                                   |
|  +------------------------------------+  +-------------------------------------+  |
|  |  Webcam Validation:                |  |  Candidate Verification:            |  |
|  |  [ LIVE STREAM FEED ACTIVE ]       |  |  Name: Sarah Connor                 |  |
|  |  * Face detected in center frame   |  |  Roll No: STU-2026-908              |  |
|  |  * Ambient light: PASS             |  |  Proctoring Mode: STRICT AI + HUMAN |  |
|  +------------------------------------+  +-------------------------------------+  |
|                                                                                   |
|  Pre-Exam System Checks:                                                          |
|  [v] Browser Fullscreen Lock Capability ................... DETECTED & READY      |
|  [v] Microphone Audio Baseline ............................ NORMAL (28 dB)        |
|  [v] Dual Monitor Detection ............................... SINGLE DISPLAY (OK)   |
|                                                                                   |
|  [                    Enter Fullscreen & Begin Assessment                    ]    |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.2: Student Hardware Pre-Flight Verification validating camera position, audio baseline, and screen constraints prior to initiating assessment timer.*

---

### Figure A.3: High-Security Exam Room with Lockdown and Live Gaze Track
```text
+-----------------------------------------------------------------------------------+
|  CS-401 Algorithms Final Exam   [ TIME LEFT: 00:44:12 ]    [ EXIT FULLSCREEN (X) ]|
+-----------------------------------------------------------------------------------+
|  Question 14 of 40:                                       | Live Proctoring Guard:|
|  What is the time complexity of building a Fibonacci     | +-------------------+ |
|  heap from an arbitrary array of n keys?                 | | [CAM FEED: Sarah] | |
|                                                           | | Status: ACTIVE    | |
|  ( ) A. O(n log n)                                        | | Violations: 0/3   | |
|  (*) B. O(n)                                              | +-------------------+ |
|  ( ) C. O(log n)                                          | Question Palette:     |
|  ( ) D. O(n^2)                                            | [ 1][ 2][ 3][ 4][ 5]  |
|                                                           | [ 6][ 7][ 8][ 9][10]  |
|  [ Save & Next ]   [ Mark for Review ]   [ Clear Answer ] | [11][12][13][*14][15] |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.3: High-Security Candidate Exam Room illustrating the locked fullscreen boundary, question palette navigation, real-time timer, and background proctor stream.*

---

### Figure A.4: Real-Time Violation Warning Overlay Modal
```text
+-----------------------------------------------------------------------------------+
|                                                                                   |
|         +---------------------------------------------------------------+         |
|         |  ! SECURITY WARNING: UNLAWFUL TAB SWITCH DETECTED             |         |
|         |---------------------------------------------------------------|         |
|         |  The system detected an unfocus event or attempted minimize.  |         |
|         |                                                               |         |
|         |  Violations Recorded: 2 / 3                                   |         |
|         |  Warning: 1 more violation will result in AUTOMATIC          |         |
|         |  DISQUALIFICATION and exam invalidation.                      |         |
|         |                                                               |         |
|         |  Snapshot recorded with forensic timestamp.                   |         |
|         |                                                               |         |
|         |  [ I Acknowledge & Return to Assessment ]                     |         |
|         +---------------------------------------------------------------+         |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.4: Anti-Cheat Intervention Modal warning candidate of detected window unfocus events and tracking cumulative violation strikes toward auto-disqualification.*

---

### Figure A.5: Multi-Candidate Live Proctoring Grid & Alert Stream
```text
+-----------------------------------------------------------------------------------+
|  Proctor Live Control Desk: CS-401 (Enrolled: 42 | Active: 39 | Flagged: 3)       |
+-----------------------------------------------------------------------------------+
|  +--------------------+  +--------------------+  +--------------------+           |
|  | [Candidate: Sarah] |  | [Candidate: James] |  | [Candidate: Emily] |           |
|  | Status: NORMAL     |  | Status: ! FLAG (Tab|  | Status: NORMAL     |           |
|  | Integrity: 100%    |  | Integrity: 70%     |  | Integrity: 95%     |           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  | [Candidate: Lucas] |  | [Candidate: Maya]  |  | [Candidate: Sean]  |           |
|  | Status: ! NO FACE  |  | Status: NORMAL     |  | Status: NORMAL     |           |
|  | Integrity: 60%     |  | Integrity: 100%    |  | Integrity: 100%    |           |
|  +--------------------+  +--------------------+  +--------------------+           |
|                                                                                   |
|  Live Security Event Stream:                                                      |
|  - 10:14:02 | James K. tab switched to external application. (Snapshot #492)     |
|  - 10:15:33 | Lucas M. facial landmarks missing from webcam frame.                |
|  Quick Actions: [ Broadcast Message ]  [ Terminate Session ]  [ Filter Flagged ]  |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.5: Live Proctoring Multi-Feed Wall providing concurrent stream observation, automated anomaly highlighting, and immediate session revocation controls.*

---

### Figure A.6: Examination Score Breakdown & Forensics Audit Report
```text
+-----------------------------------------------------------------------------------+
|  Official Assessment Performance & Integrity Audit: #EXAM-90812                   |
|  Candidate: Sarah Connor | Course: CS-401 Algorithms | Score: 48 / 50 (96%)       |
|                                                                                   |
|  Integrity Verification:                                                          |
|  +-----------------------------------------------------------------------------+  |
|  |  OVERALL INTEGRITY RATING: 100% (CLEAN ATTEMPT)                             |  |
|  |  Tab Violations: 0 | Audio Anomalies: 0 | Fullscreen Exits: 0               |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  Candidate Timeline & Activity Log:                                               |
|  - 09:00:10: Biometric pre-flight checks approved. Lockdown initialized.          |
|  - 09:44:22: All 40 questions answered and auto-saved to cloud engine.            |
|  - 09:45:00: Exam submitted by candidate. Proctor verification: VALIDATED.       |
|                                                                                   |
|  [ Download Cryptographically Signed Transcript ]  [ Print Audit Sheet ]          |
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.6: Comprehensive Post-Exam Audit View detailing final scores, question-by-question analytics, and the forensic timeline confirming academic integrity.*

---

### Figure A.7: Executive Academic Administrator Analytics Console
```text
+-----------------------------------------------------------------------------------+
|  Institutional Academic Oversight Dashboard                     [Admin Officer]   |
|                                                                                   |
|  +---------------+  +---------------+  +---------------+  +--------------------+  |
|  | TOTAL EXAMS   |  | CANDIDATES    |  | CHEAT ATTEMPTS|  | AVG PASS RATE      |  |
|  |      48       |  |     1,840     |  |   14 (0.76%)  |  |      88.4%         |  |
|  +---------------+  +---------------+  +---------------+  +--------------------+  |
|                                                                                   |
|  [ Cheating Anomalies by Category ]        [ Score Distribution vs. Integrity ]   |
|  - Tab-Switch Minimization: 58%            - 90-100% Integrity: 96% of Cohort     |
|  - Multiple Persons Detected: 24%          - <70% Integrity (Disqualified): 4%    |
|  - Audio / External Speech: 18%                                                   |
|                                                                                   |
|  Quick Admin Actions: [ Create Assessment ]  [ Manage Faculties ]  [ Global Logs ]|
+-----------------------------------------------------------------------------------+
```
**Caption**: *Figure A.7: Institutional Administrator Console visualizing longitudinal pass rates, anomaly distribution charts, and university-wide proctoring integrity indicators.*

---

## 12. INSTALLATION, TESTING & EXECUTION GUIDE

### 12.1 Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local or MongoDB Atlas connection string)
- **Docker & Docker Compose** (Optional, for containerized run)

### 12.2 Development Setup Steps
```bash
# 1. Install Server Dependencies
npm --prefix server install

# 2. Install Client Dependencies
npm --prefix client install

# 3. Execute Automated Tests (Verifies Auth, Anti-Cheat State Machine, and Auto-Grader)
npm --prefix server test

# 4. Start Server Backend
npm --prefix server run dev
# Backend runs at http://localhost:5000

# 5. Start Client Web Application
npm --prefix client run dev
# Frontend runs at http://localhost:5173
```

### 12.3 Automated Test Execution Output
```bash
> examshield-server@1.0.0 test
> tsx src/tests/api.test.ts

[Test 1] Connect to MongoDB Database ...................... PASSED
[Test 2] Password Hashing & Salt Verification .............. PASSED
[Test 3] JWT Token Issuance & Role Authorization Guard ..... PASSED
[Test 4] Anti-Cheat Violation Threshold & Disqualification . PASSED
[Test 5] Automated Assessment Auto-Grading Engine ......... PASSED

All 5 core system tests passed successfully.
```

### 12.4 Pre-Configured Demo Credentials
| Role | Email | Password | Scope & Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@examshield.edu` | `Admin@123` | Institutional Director (Global policies, exams, analytics) |
| **Proctor / Examiner** | `proctor@examshield.edu` | `Proctor@123` | Live proctoring wall, student flagging, session revocation |
| **Lead Instructor** | `faculty.cs@examshield.edu` | `Faculty@123` | Question bank creation, exam scheduling, score review |
| **Student (Sarah)** | `student@examshield.edu` | `Student@123` | Registered student test-taking account |
| **Student (James)** | `james.student@examshield.edu` | `Student@123` | Enrolled student test-taking account |
