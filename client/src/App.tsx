import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ExamInstructions } from './pages/student/ExamInstructions';
import { ExamRoom } from './pages/student/ExamRoom';
import { ExamResult } from './pages/student/ExamResult';
import { StudentAnalytics } from './pages/student/StudentAnalytics';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { CreateExam } from './pages/faculty/CreateExam';
import { ManageQuestions } from './pages/faculty/ManageQuestions';
import { EvaluateExam } from './pages/faculty/EvaluateExam';
import { ProctoringLogView } from './pages/faculty/ProctoringLogView';
import { FacultyAnalytics } from './pages/faculty/FacultyAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AcademicIntegrityReport } from './pages/admin/AcademicIntegrityReport';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Dedicated Fullscreen Examination Room (Outside standard dashboard layout) */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/exam/:examId/room" element={<ExamRoom />} />
          </Route>

          {/* Student Protected Routes in DashboardLayout */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/exam/:examId/instructions" element={<ExamInstructions />} />
              <Route path="/student/result/:attemptId" element={<ExamResult />} />
              <Route path="/student/results" element={<StudentDashboard />} />
              <Route path="/student/analytics" element={<StudentAnalytics />} />
            </Route>
          </Route>

          {/* Faculty Protected Routes in DashboardLayout */}
          <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/faculty/create" element={<CreateExam />} />
              <Route path="/faculty/exam/:examId/questions" element={<ManageQuestions />} />
              <Route path="/faculty/evaluations" element={<EvaluateExam />} />
              <Route path="/faculty/proctoring" element={<ProctoringLogView />} />
              <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
            </Route>
          </Route>

          {/* Admin Protected Routes in DashboardLayout */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/integrity" element={<AcademicIntegrityReport />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
