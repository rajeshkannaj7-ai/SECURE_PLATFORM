import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Exam } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      if (res.data.success) {
        setExams(res.data.exams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const completedCount = exams.filter(
    (e) => e.userAttempt && ['submitted', 'evaluated'].includes(e.userAttempt.status)
  ).length;

  const inProgressExam = exams.find(
    (e) => e.userAttempt && e.userAttempt.status === 'in_progress'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-indigo-100 mb-3 backdrop-blur-xs">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>AI & Integrity Monitored Assessment Environment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-2xl">
            Access your university examination schedule, continue active sessions, and review your graded
            results with full automated evaluation breakdowns.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Available Exams"
          value={exams.length}
          subtitle="Scheduled this term"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Completed Exams"
          value={completedCount}
          subtitle="Submitted for grading"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active Sessions"
          value={inProgressExam ? 1 : 0}
          subtitle={inProgressExam ? 'Click below to resume' : 'No running exams'}
          icon={Clock}
          color={inProgressExam ? 'amber' : 'sky'}
        />
      </div>

      {/* Available Exams Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Examinations</h2>
            <p className="text-xs text-slate-500">Select an assessment to review instructions and start</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No active examinations published right now.</p>
            <p className="text-xs text-slate-400 mt-1">Please check back once your faculty releases new schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exams.map((exam) => {
              const attempt = exam.userAttempt;
              const isCompleted = attempt && ['submitted', 'evaluated'].includes(attempt.status);
              const isInProgress = attempt && attempt.status === 'in_progress';

              return (
                <div
                  key={exam._id}
                  className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                        {exam.subject}
                      </span>
                      {isCompleted ? (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Submitted</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center space-x-1 animate-pulse">
                          <RotateCcw className="h-3 w-3" />
                          <span>In Progress</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                          Ready to Take
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{exam.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{exam.description}</p>

                    <div className="flex items-center space-x-4 mt-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{exam.durationMinutes} mins</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Award className="h-3.5 w-3.5 text-slate-400" />
                        <span>{exam.totalMarks} Marks</span>
                      </span>
                      <span>Pass: {exam.passingMarks}</span>
                    </div>
                  </div>

                  {/* Card Action footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {isCompleted ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="text-xs">
                          <span className="text-slate-400">Score: </span>
                          <span className="font-bold text-slate-800">
                            {attempt.score}/{attempt.totalMarks} ({attempt.percentage}%)
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/student/result/${attempt.attemptId}`)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Result</span>
                        </button>
                      </div>
                    ) : isInProgress ? (
                      <button
                        onClick={() => navigate(`/student/exam/${exam._id}/room`)}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Resume In-Progress Exam</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/student/exam/${exam._id}/instructions`)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>View Instructions & Start</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
