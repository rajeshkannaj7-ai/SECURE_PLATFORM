import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, UserCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-indigo-100 shadow-md">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">ProctorExam</span>
          <span className="text-xs ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded-full border border-indigo-200/60">
            Secure Portal
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 pr-4 border-r border-slate-200">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
              <UserCircle className="h-6 w-6 text-slate-500" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-xs uppercase font-bold tracking-wider px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                  {user.role}
                </span>
                <span className="text-xs text-slate-400">
                  {user.studentId || user.employeeId || user.email}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};
