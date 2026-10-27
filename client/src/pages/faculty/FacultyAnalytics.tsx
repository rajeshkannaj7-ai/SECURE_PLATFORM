import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatCard } from '../../components/StatCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const FacultyAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/faculty');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching faculty analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalStudents: 0,
    totalExams: 0,
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passPercentage: 0,
    flaggedAttemptsCount: 0,
  };

  const examData = data?.examWisePerformance || [];
  const subjectData = data?.subjectWisePerformance || [];
  const studentComparison = data?.studentPerformanceComparison || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Class Performance & Evaluation Analytics</h1>
        <p className="text-xs text-slate-500">
          Aggregated cohort statistics, subject mastery comparisons, and academic integrity metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={stats.totalAttempts}
          subtitle={`Across ${stats.totalExams} examinations`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Cohort Average"
          value={`${stats.averageScore}%`}
          subtitle={`Highest: ${stats.highestScore}% | Lowest: ${stats.lowestScore}%`}
          icon={TrendingUp}
          color="sky"
        />
        <StatCard
          title="Overall Pass Rate"
          value={`${stats.passPercentage}%`}
          subtitle="Cumulative percentage"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Flagged Attempts"
          value={stats.flaggedAttemptsCount}
          subtitle="Integrity alerts"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam-wise average and pass rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Exam Performance Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="averageScore" name="Avg Score (%)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="passRate" name="Pass Rate (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject performance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Subject-wise Mastery</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="averageScore" name="Subject Avg (%)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="attempts" name="Submissions" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Student Performance Comparison</h2>
          <span className="text-xs text-slate-400 font-medium">Recent Attempts Sample</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Candidate</th>
                <th className="py-3 px-4">Marks Awarded</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Integrity Strikes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {studentComparison.map((st: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-900">{st.studentName}</div>
                    <div className="text-slate-400 text-[11px]">{st.studentId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{st.score}</span> / {st.totalMarks}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">{st.percentage}%</td>
                  <td className="py-3.5 px-4">
                    {st.passed ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                        Passed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[10px]">
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={st.warnings > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                      {st.warnings} Warnings
                    </span>
                    {st.isFlagged && <span className="ml-1 text-rose-600 font-bold">(Flagged)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
