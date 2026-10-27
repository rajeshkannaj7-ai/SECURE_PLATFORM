import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatCard } from '../../components/StatCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Award, CheckCircle2, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';

export const StudentAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/student');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching student analytics:', err);
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
    totalAttempts: 0,
    passedCount: 0,
    failedCount: 0,
    averageScore: 0,
    highestScore: 0,
    passRate: 0,
  };

  const history = data?.performanceHistory || [];
  const subjects = data?.subjectProgress || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
        <p className="text-xs text-slate-500">Track your academic progress, score trends, and subject mastery</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Exams Attempted"
          value={stats.totalAttempts}
          subtitle={`${stats.passedCount} Passed`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Cumulative average"
          icon={TrendingUp}
          color="sky"
        />
        <StatCard
          title="Highest Score"
          value={`${stats.highestScore}%`}
          subtitle="Personal best"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats.passRate}%`}
          subtitle="Total success ratio"
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">No examination attempts yet</h3>
          <p className="text-xs text-slate-400 mt-1">Complete your scheduled exams to generate performance insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score progression chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Exam Score Progression (%)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="examTitle" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject progress bar chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Subject-wise Average Score (%)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjects} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                    formatter={(val: any) => [`${val}%`, 'Average']}
                  />
                  <Bar dataKey="averageScore" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
