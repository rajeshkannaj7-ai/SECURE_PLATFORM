import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Exam } from '../../types';
import { StatCard } from '../../components/StatCard';
import {
  BookOpen,
  FilePlus,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ListPlus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      if (res.data.success) {
        setExams(res.data.exams);
      }
    } catch (err) {
      console.error('Error fetching faculty exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleTogglePublish = async (examId: string) => {
    try {
      const res = await api.patch(`/exams/${examId}/toggle-publish`);
      if (res.data.success) {
        setExams((prev) =>
          prev.map((e) => (e._id === examId ? { ...e, isPublished: !e.isPublished } : e))
        );
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam and all its questions and attempts?')) return;
    try {
      const res = await api.delete(`/exams/${examId}`);
      if (res.data.success) {
        setExams((prev) => prev.filter((e) => e._id !== examId));
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const totalAttempts = exams.reduce((sum, e) => sum + (e.totalAttempts || 0), 0);
  const totalFlagged = exams.reduce((sum, e) => sum + (e.flaggedAttempts || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Examiner Portal</h1>
          <p className="text-xs text-slate-500">Create, monitor, and evaluate student assessments</p>
        </div>
        <button
          onClick={() => navigate('/faculty/create')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-100 transition"
        >
          <FilePlus className="h-4 w-4" />
          <span>Create New Examination</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Exams"
          value={exams.length}
          subtitle="Managed by you"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Total Submissions"
          value={totalAttempts}
          subtitle="Student submissions"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Flagged Attempts"
          value={totalFlagged}
          subtitle="Integrity alerts"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Active Schedules"
          value={exams.filter((e) => e.isPublished).length}
          subtitle="Visible to students"
          icon={CheckCircle2}
          color="sky"
        />
      </div>

      {/* Examinations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Your Examinations</h2>
          <span className="text-xs text-slate-400 font-medium">{exams.length} Exams Created</span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No examinations created yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Create New Examination" to set up your first exam.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Exam Details</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Duration & Marks</th>
                  <th className="py-3 px-4">Submissions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{exam.title}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-1">{exam.description || 'No description'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                        {exam.subject}
                      </span>
                    </td>
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{exam.durationMinutes} mins</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {exam.totalMarks} Marks • {exam.questionsCount} Questions
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900">{exam.totalAttempts || 0}</span>
                      {exam.flaggedAttempts ? (
                        <span className="ml-1.5 text-rose-600 font-bold">({exam.flaggedAttempts} flagged)</span>
                      ) : null}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(exam._id)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                          exam.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {exam.isPublished ? (
                          <>
                            <ToggleRight className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-3.5 w-3.5 text-slate-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/faculty/exam/${exam._id}/questions`)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition flex items-center space-x-1"
                          title="Manage Questions"
                        >
                          <ListPlus className="h-3.5 w-3.5" />
                          <span>Questions ({exam.questionsCount})</span>
                        </button>

                        <button
                          onClick={() => handleDeleteExam(exam._id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Exam"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
