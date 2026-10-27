import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/StatCard';
import {
  Users,
  BookOpen,
  Award,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/analytics/admin');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalExams: 0,
    totalAttempts: 0,
    flaggedAttempts: 0,
    totalProctoringEvents: 0,
    overallPassRate: 0,
  };

  const eventBreakdown = data?.eventBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 mb-3 backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>University Examination Cell Administrator</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Platform Overview & Integrity Monitor</h1>
            <p className="text-indigo-200 text-xs mt-1 max-w-xl">
              Real-time administrative control over university users, faculty examinations, proctoring alerts,
              and academic compliance across departments.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-900/50"
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => navigate('/admin/integrity')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Integrity Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.totalFaculty} Faculty • ${stats.totalStudents} Students`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Examinations"
          value={stats.totalExams}
          subtitle={`${stats.totalAttempts} Submissions`}
          icon={BookOpen}
          color="sky"
        />
        <StatCard
          title="University Pass Rate"
          value={`${stats.overallPassRate}%`}
          subtitle="All exams combined"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Integrity Incidents"
          value={stats.totalProctoringEvents}
          subtitle={`${stats.flaggedAttempts} Flagged Attempts`}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Grid: Events Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Proctoring Events Distribution</h3>
            <span className="text-xs text-slate-400 font-medium">Logged Incidents</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventBreakdown} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Incidents" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Management Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Administrative Portals</h3>
            <p className="text-xs text-slate-400 mb-4">Direct shortcuts to control system modules</p>

            <div className="space-y-3">
              <div
                onClick={() => navigate('/admin/users')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">User & Faculty Directory</p>
                    <p className="text-[11px] text-slate-500">Manage credentials & roles</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>

              <div
                onClick={() => navigate('/admin/integrity')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Integrity Violation Audit</p>
                    <p className="text-[11px] text-slate-500">Review suspicious activities</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>

              <div
                onClick={() => navigate('/faculty')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">All Examination Schedules</p>
                    <p className="text-[11px] text-slate-500">Examine all published papers</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            System running securely • Role-based access control enforced
          </div>
        </div>
      </div>
    </div>
  );
};
