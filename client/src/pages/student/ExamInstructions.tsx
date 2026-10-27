import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Exam } from '../../types';
import {
  ShieldAlert,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  BookOpen,
} from 'lucide-react';

export const ExamInstructions: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${examId}`);
        if (res.data.success) {
          setExam(res.data.exam);
          if (res.data.attempt && ['submitted', 'evaluated'].includes(res.data.attempt.status)) {
            navigate(`/student/result/${res.data.attempt._id}`);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load exam details.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, navigate]);

  const handleStartExam = async () => {
    if (!agreed) return;
    setStarting(true);
    setError('');

    try {
      // Trigger fullscreen if supported
      if (document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (fsErr) {
          console.warn('Fullscreen request blocked or dismissed by user:', fsErr);
        }
      }

      // Initialize or retrieve attempt
      const res = await api.post(`/attempts/start/${examId}`);
      if (res.data.success) {
        navigate(`/student/exam/${examId}/room`);
      } else {
        setError(res.data.message || 'Unable to start examination.');
        setStarting(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error starting exam session.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-800">Exam not found or unavailable</h2>
        <button
          onClick={() => navigate('/student')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md w-fit mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{exam.subject}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{exam.title}</h1>
        <p className="text-sm text-slate-500 mt-2">{exam.description}</p>

        {/* Quick parameters */}
        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Duration</p>
            <p className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-1 mt-0.5">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>{exam.durationMinutes} Mins</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Marks</p>
            <p className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-1 mt-0.5">
              <Award className="h-4 w-4 text-indigo-600" />
              <span>{exam.totalMarks} Marks</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Passing Score</p>
            <p className="text-lg font-bold text-slate-800 flex items-center justify-center space-x-1 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{exam.passingMarks} Marks</span>
            </p>
          </div>
        </div>
      </div>

      {/* Proctoring Warning Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 text-amber-900">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-base text-amber-950">Academic Integrity & Proctoring Rules</h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              This examination employs automated browser-level proctoring to monitor academic integrity.
              Exiting fullscreen mode, switching tabs, leaving window focus, or attempting clipboard operations
              will trigger warning strikes recorded on your official evaluation audit log.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-amber-900">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Mandatory Fullscreen Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Tab Switch & Focus Detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Clipboard / Copy-Paste Interception</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Max Allowed Warnings: {exam.proctoringConfig?.maxWarnings || 5}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Instructions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base">Candidate Instructions</h3>
        <ul className="space-y-2.5 text-sm text-slate-600">
          {(exam.instructions || []).map((inst, index) => (
            <li key={index} className="flex items-start space-x-2.5">
              <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span>{inst}</span>
            </li>
          ))}
        </ul>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Agreement checkbox */}
        <div className="pt-4 border-t border-slate-100">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-relaxed select-none">
              I have read, understood, and agreed to adhere to the university examination guidelines and
              automated proctoring rules. I consent to fullscreen monitoring and integrity tracking.
            </span>
          </label>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartExam}
          disabled={!agreed || starting}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-100 text-sm"
        >
          <Maximize2 className="h-4 w-4" />
          <span>{starting ? 'Initiating Secure Room...' : 'Enter Fullscreen & Begin Exam'}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
