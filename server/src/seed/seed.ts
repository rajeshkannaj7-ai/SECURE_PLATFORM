import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { ExamAttempt } from '../models/ExamAttempt';
import { Answer } from '../models/Answer';
import { ProctoringEvent } from '../models/ProctoringEvent';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_exam_platform';
    console.log(`Connecting to MongoDB for seeding: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Starting database seeding...');

    // Clear existing data in our specific database
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Question.deleteMany({});
    await ExamAttempt.deleteMany({});
    await Answer.deleteMany({});
    await ProctoringEvent.deleteMany({});

    console.log('Cleared existing collections in online_exam_platform.');

    // 1. Create Users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@examplatform.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'University Examination Cell',
      employeeId: 'ADM-2026-001',
    });

    const faculty = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'faculty@examplatform.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-CSE-104',
    });

    const student1 = await User.create({
      name: 'Rahul Verma',
      email: 'student1@examplatform.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2026-042',
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'student2@examplatform.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Information Technology',
      studentId: 'STU-2026-088',
    });

    const student3 = await User.create({
      name: 'Ananya Iyer',
      email: 'student3@examplatform.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2026-115',
    });

    console.log('Users created successfully.');

    // 2. Create Exams
    console.log('Creating examinations...');
    const exam1 = await Exam.create({
      title: 'Advanced Database Systems & NoSQL Architecture',
      description: 'Comprehensive mid-semester assessment covering ACID transactions, distributed database consistency, MongoDB indexing, and horizontal scaling strategies.',
      subject: 'Database Systems',
      faculty: faculty._id,
      durationMinutes: 45,
      totalMarks: 50,
      passingMarks: 20,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days ahead
      instructions: [
        'Fullscreen mode is strictly enforced throughout the duration of this exam.',
        'Leaving fullscreen, switching tabs, or window focus loss triggers immediate integrity flags.',
        'Copy-paste functionality is disabled on all question prompts.',
        'Objective questions (MCQ / True-False) are automatically evaluated upon submission.',
        'Subjective short-answer questions will be evaluated by the course instructor.',
        'Submit the exam before the countdown reaches 00:00.',
      ],
      isPublished: true,
      shuffleQuestions: false,
      proctoringConfig: {
        enforceFullscreen: true,
        detectTabSwitch: true,
        detectCopyPaste: true,
        detectWindowBlur: true,
        maxWarnings: 5,
      },
      questionsCount: 7,
    });

    const exam2 = await Exam.create({
      title: 'Full Stack Web Development & RESTful APIs',
      description: 'End-term practical examination covering React component lifecycles, Express middleware architectures, and JWT security tokens.',
      subject: 'Web Technologies',
      faculty: faculty._id,
      durationMinutes: 60,
      totalMarks: 40,
      passingMarks: 16,
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      instructions: [
        'Read every question carefully before selecting an answer.',
        'Proctoring events are tracked and saved in your audit log.',
        'Short-answer questions will undergo manual grading by the faculty.',
      ],
      isPublished: true,
      shuffleQuestions: false,
      proctoringConfig: {
        enforceFullscreen: true,
        detectTabSwitch: true,
        detectCopyPaste: true,
        detectWindowBlur: true,
        maxWarnings: 4,
      },
      questionsCount: 5,
    });

    // 3. Create Questions for Exam 1
    console.log('Creating questions for Exam 1...');
    const q1 = await Question.create({
      examId: exam1._id,
      questionText: 'Which ACID property guarantees that all database transactions will provide valid data according to all defined constraints and cascading rules?',
      questionType: 'mcq',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctAnswer: 'Consistency',
      explanation: 'Consistency ensures that a transaction can only bring the database from one valid state to another, maintaining invariants and relational integrity.',
      marks: 5,
      order: 1,
    });

    const q2 = await Question.create({
      examId: exam1._id,
      questionText: 'In MongoDB, which query method is invoked on a cursor to sort matched documents in ascending or descending order?',
      questionType: 'mcq',
      options: ['.order()', '.sort()', '.filter()', '.arrange()'],
      correctAnswer: '.sort()',
      explanation: 'The .sort() cursor method specifies the order in which the query returns matching documents (e.g., .sort({ createdAt: -1 })).',
      marks: 5,
      order: 2,
    });

    const q3 = await Question.create({
      examId: exam1._id,
      questionText: 'What fundamental trade-off does the CAP theorem state regarding distributed data stores over an asynchronous network?',
      questionType: 'mcq',
      options: [
        'A distributed system can easily guarantee all three: Consistency, Availability, and Partition Tolerance simultaneously.',
        'A distributed system can guarantee at most two of the three properties: Consistency, Availability, and Partition Tolerance.',
        'Partition tolerance is only required in centralized relational database clusters.',
        'Network latency has zero effect on consistency models.'
      ],
      correctAnswer: 'A distributed system can guarantee at most two of the three properties: Consistency, Availability, and Partition Tolerance.',
      explanation: 'Eric Brewer CAP theorem establishes that any distributed data store can only simultaneously provide at most two out of Consistency, Availability, and Partition Tolerance.',
      marks: 5,
      order: 3,
    });

    const q4 = await Question.create({
      examId: exam1._id,
      questionText: 'In MongoDB, documents belonging to the same collection must adhere strictly to identical schema columns and fixed data types.',
      questionType: 'true_false',
      options: [],
      correctAnswer: 'false',
      explanation: 'MongoDB collections are schema-flexible; documents in the same collection do not need to possess the same set of fields or data types.',
      marks: 5,
      order: 4,
    });

    const q5 = await Question.create({
      examId: exam1._id,
      questionText: 'Database indexing accelerates query read speeds but introduces computational overhead and storage consumption during write and update operations.',
      questionType: 'true_false',
      options: [],
      correctAnswer: 'true',
      explanation: 'Indexes create auxiliary B-tree data structures that enable fast search, but every insert or update requires updating these index structures.',
      marks: 5,
      order: 5,
    });

    const q6 = await Question.create({
      examId: exam1._id,
      questionText: 'Explain the core architectural differences between horizontal scaling (sharding) and vertical scaling (replication/hardware upgrade) in high-throughput database systems.',
      questionType: 'short_answer',
      options: [],
      correctAnswer: 'Horizontal scaling divides data across multiple commodity nodes through partition keys (sharding), providing near-linear elasticity. Vertical scaling upgrades memory, CPU, and disk capacity on a single master machine, which eventually hits hardware and cost ceilings.',
      evaluationGuidelines: 'Look for: 1) Definition of sharding / partitioning across nodes; 2) Hardware upgrade limit on single node; 3) Cost and elasticity trade-offs.',
      explanation: 'Sharding distributes data sets across clusters of nodes, whereas vertical scaling upgrades CPU/RAM on one server.',
      marks: 10,
      order: 6,
    });

    const q7 = await Question.create({
      examId: exam1._id,
      questionText: 'Why does MongoDB utilize binary-encoded JSON (BSON) as its internal storage and data transfer format instead of conventional text JSON?',
      questionType: 'short_answer',
      options: [],
      correctAnswer: 'BSON enables fast binary traversal, length prefixing, and adds native support for essential data types absent in plain JSON, including Date, ObjectId, 64-bit integers, and raw binary byte buffers.',
      evaluationGuidelines: 'Key points required: Binary encoding speed, length prefix traversal efficiency, additional data types (Date, ObjectId, BinData, Long).',
      explanation: 'BSON was designed to be lightweight, traversable, and efficient while extending JSON with types like Date and ObjectId.',
      marks: 15,
      order: 7,
    });

    // 4. Create Questions for Exam 2
    console.log('Creating questions for Exam 2...');
    await Question.create([
      {
        examId: exam2._id,
        questionText: 'Which React Hook is primarily used to perform side effects such as data fetching, timers, or subscribing to external stores?',
        questionType: 'mcq',
        options: ['useContext', 'useEffect', 'useReducer', 'useCallback'],
        correctAnswer: 'useEffect',
        explanation: 'useEffect handles component side-effects after rendering.',
        marks: 5,
        order: 1,
      },
      {
        examId: exam2._id,
        questionText: 'What HTTP status code represents an unauthorized request due to missing or invalid authentication credentials?',
        questionType: 'mcq',
        options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
        correctAnswer: '401 Unauthorized',
        explanation: 'HTTP 401 signifies that the request requires user authentication.',
        marks: 5,
        order: 2,
      },
      {
        examId: exam2._id,
        questionText: 'JSON Web Tokens (JWT) are encrypted by default, preventing anyone who intercepts the token from viewing its payload claims.',
        questionType: 'true_false',
        options: [],
        correctAnswer: 'false',
        explanation: 'Standard JWTs are digitally signed and base64url encoded, NOT encrypted. Anyone can decode and inspect the payload.',
        marks: 10,
        order: 3,
      },
      {
        examId: exam2._id,
        questionText: 'Explain the role and lifecycle of Express middleware functions in handling incoming HTTP requests.',
        questionType: 'short_answer',
        options: [],
        correctAnswer: 'Express middleware functions have access to the req and res objects and the next() function. They can execute code, modify req/res, terminate the request-response cycle, or call next() to pass control to the subsequent handler.',
        evaluationGuidelines: 'Assess understanding of req, res, next(), error handling middleware, and request interception.',
        explanation: 'Middleware acts as a pipeline for request processing in Express.',
        marks: 20,
        order: 4,
      },
    ]);

    // 5. Seed Realistic Exam Attempt 1: Rahul Verma (Completed & Evaluated)
    console.log('Seeding completed exam attempt for Rahul Verma...');
    const attempt1 = await ExamAttempt.create({
      examId: exam1._id,
      studentId: student1._id,
      startTime: new Date(Date.now() - 3600 * 1000 * 5),
      submittedAt: new Date(Date.now() - 3600 * 1000 * 4.3),
      status: 'evaluated',
      warningCount: 1,
      isFlagged: false,
      flagReasons: [],
      score: 47,
      totalMarks: 50,
      percentage: 94.0,
      passed: true,
      totalQuestions: 7,
      answeredCount: 7,
      correctCount: 5,
      incorrectCount: 0,
      pendingEvaluationCount: 0,
      isEvaluated: true,
      facultyNotes: 'Exceptional performance. Demonstrated thorough mastery of database internals and distributed systems concepts.',
      evaluatedBy: faculty._id,
      evaluatedAt: new Date(Date.now() - 3600 * 1000 * 3),
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
    });

    // Answers for Rahul Verma
    await Answer.create([
      {
        attemptId: attempt1._id,
        examId: exam1._id,
        studentId: student1._id,
        questionId: q1._id,
        studentAnswer: 'Consistency',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt1._id,
        examId: exam1._id,
        studentId: student1._id,
        questionId: q2._id,
        studentAnswer: '.sort()',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt1._id,
        examId: exam1._id,
        studentId: student1._id,
        questionId: q3._id,
        studentAnswer: 'A distributed system can guarantee at most two of the three properties: Consistency, Availability, and Partition Tolerance.',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt1._id,
        examId: exam1._id,
        studentId: student1._id,
        questionId: q4._id,
        studentAnswer: 'false',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt1._id,
        examId: exam1._id,
        studentId: student1._id,
        questionId: q5._id,
        studentAnswer: 'true',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt1._id,
        examId: exam1._id,
        studentId: student1._id,
        questionId: q6._id,
        studentAnswer: 'Horizontal scaling partitions records across multiple database server instances via sharding keys. Vertical scaling scales a single server by upgrading CPU and RAM. Horizontal provides limitless scalability while vertical hits hardware capacity limits.',
        isCorrect: true,
        marksAwarded: 9,
        isEvaluated: true,
        facultyFeedback: 'Accurate distinction and clear explanation of sharding and hardware bounds.',
      },
      {
        attemptId: attempt1._id,
        examId: exam1._id,
        studentId: student1._id,
        questionId: q7._id,
        studentAnswer: 'MongoDB uses BSON because it provides binary encoding for high-speed scanning and adds support for Date, ObjectId, and 64-bit integers which plain JSON lacks.',
        isCorrect: true,
        marksAwarded: 13,
        isEvaluated: true,
        facultyFeedback: 'Well written answer covering both traversal efficiency and custom data types.',
      },
    ]);

    // Proctoring event for Rahul (minor warning)
    await ProctoringEvent.create({
      attemptId: attempt1._id,
      examId: exam1._id,
      studentId: student1._id,
      eventType: 'window_blur',
      eventDetails: 'Window focus briefly lost for 3 seconds.',
      warningNumber: 1,
      timestamp: new Date(Date.now() - 3600 * 1000 * 4.7),
    });

    // 6. Seed Realistic Exam Attempt 2: Priya Patel (Submitted with Flagged Integrity Violations & Pending Grading)
    console.log('Seeding flagged exam attempt for Priya Patel...');
    const attempt2 = await ExamAttempt.create({
      examId: exam1._id,
      studentId: student2._id,
      startTime: new Date(Date.now() - 3600 * 1000 * 2),
      submittedAt: new Date(Date.now() - 3600 * 1000 * 1.3),
      status: 'submitted',
      warningCount: 3,
      isFlagged: true,
      flagReasons: ['Multiple tab switches detected during exam session', 'Attempted copy-paste operation'],
      score: 15,
      totalMarks: 50,
      percentage: 30.0,
      passed: false,
      totalQuestions: 7,
      answeredCount: 7,
      correctCount: 3,
      incorrectCount: 2,
      pendingEvaluationCount: 2,
      isEvaluated: false,
      ipAddress: '192.168.1.109',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    });

    // Answers for Priya Patel
    await Answer.create([
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        questionId: q1._id,
        studentAnswer: 'Consistency',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        questionId: q2._id,
        studentAnswer: '.order()', // incorrect
        isCorrect: false,
        marksAwarded: 0,
        isEvaluated: true,
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        questionId: q3._id,
        studentAnswer: 'A distributed system can guarantee at most two of the three properties: Consistency, Availability, and Partition Tolerance.',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        questionId: q4._id,
        studentAnswer: 'true', // incorrect
        isCorrect: false,
        marksAwarded: 0,
        isEvaluated: true,
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        questionId: q5._id,
        studentAnswer: 'true',
        isCorrect: true,
        marksAwarded: 5,
        isEvaluated: true,
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        questionId: q6._id,
        studentAnswer: 'Vertical scaling is adding more RAM while horizontal is adding more servers.',
        marksAwarded: 0,
        isEvaluated: false,
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        questionId: q7._id,
        studentAnswer: 'BSON supports dates and is stored in binary.',
        marksAwarded: 0,
        isEvaluated: false,
      },
    ]);

    // Proctoring events for Priya Patel
    await ProctoringEvent.create([
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        eventType: 'tab_switch',
        eventDetails: 'Student navigated away from exam tab to another browser tab.',
        warningNumber: 1,
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.8),
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        eventType: 'tab_switch',
        eventDetails: 'Second tab switch detected.',
        warningNumber: 2,
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.6),
      },
      {
        attemptId: attempt2._id,
        examId: exam1._id,
        studentId: student2._id,
        eventType: 'copy_paste',
        eventDetails: 'Attempted to paste text from external clipboard into subjective answer box.',
        warningNumber: 3,
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.4),
      },
    ]);

    console.log('\n======================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY! DEMO CREDENTIALS:');
    console.log('======================================================');
    console.log('1. Admin:');
    console.log('   Email:    admin@examplatform.edu');
    console.log('   Password: Admin@123\n');
    console.log('2. Faculty:');
    console.log('   Email:    faculty@examplatform.edu');
    console.log('   Password: Faculty@123\n');
    console.log('3. Student 1 (Completed & Evaluated Attempt):');
    console.log('   Email:    student1@examplatform.edu');
    console.log('   Password: Student@123\n');
    console.log('4. Student 2 (Flagged Attempt with Pending Evaluation):');
    console.log('   Email:    student2@examplatform.edu');
    console.log('   Password: Student@123\n');
    console.log('5. Student 3 (Fresh Account Ready to Attempt Exam):');
    console.log('   Email:    student3@examplatform.edu');
    console.log('   Password: Student@123\n');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
