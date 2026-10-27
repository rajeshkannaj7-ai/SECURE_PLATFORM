import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Users,
  Award,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/integrity', label: 'Academic Integrity', icon: AlertTriangle },
  ];

  const facultyLinks = [
    { to: '/faculty', label: 'Examinations', icon: BookOpen },
    { to: '/faculty/create', label: 'Create New Exam', icon: FilePlus },
    { to: '/faculty/evaluations', label: 'Subjective Grading', icon: CheckCircle2 },
    { to: '/faculty/proctoring', label: 'Proctoring Flags', icon: AlertTriangle },
    { to: '/faculty/analytics', label: 'Class Analytics', icon: BarChart3 },
  ];

  const studentLinks = [
    { to: '/student', label: 'Available Exams', icon: BookOpen },
    { to: '/student/results', label: 'My Exam Results', icon: Award },
    { to: '/student/analytics', label: 'Performance Trends', icon: BarChart3 },
  ];

  const links =
    user.role === 'admin'
      ? adminLinks
      : user.role === 'faculty'
      ? facultyLinks
      : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
            {user.role} Navigation
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/faculty' || link.to === '/student' || link.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500">
        <p className="font-semibold text-slate-700 mb-0.5">Secure Assessment Mode</p>
        <p className="leading-relaxed">Automated evaluation & proctoring active.</p>
      </div>
    </aside>
  );
};
