import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FilePlus,
  ArrowLeft,
  ShieldAlert,
  Clock,
  Award,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [instructionsText, setInstructionsText] = useState(
    'Ensure you have a stable internet connection.\nFullscreen mode is mandatory during the exam.\nSwitching tabs or minimizing the browser will generate proctoring warnings.\nCopying and pasting inside the examination interface is strictly restricted.\nSubmit your exam before the countdown reaches zero.'
  );

  // Proctoring configuration
  const [enforceFullscreen, setEnforceFullscreen] = useState(true);
  const [detectTabSwitch, setDetectTabSwitch] = useState(true);
  const [detectCopyPaste, setDetectCopyPaste] = useState(true);
  const [maxWarnings, setMaxWarnings] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const instructionsArray = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.post('/exams', {
        title,
        description,
        subject,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        startTime,
        endTime,
        instructions: instructionsArray,
        proctoringConfig: {
          enforceFullscreen,
          detectTabSwitch,
          detectCopyPaste,
          detectWindowBlur: true,
          maxWarnings: Number(maxWarnings),
        },
      });

      if (res.data.success) {
        // Redirect directly to question builder for this new exam!
        navigate(`/faculty/exam/${res.data.exam._id}/questions`);
      } else {
        setError(res.data.message || 'Failed to create exam.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating exam.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/faculty')}
        className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Examinations</span>
      </button>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <FilePlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create New Examination</h1>
            <p className="text-xs text-slate-500">Configure assessment parameters and integrity rules</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Term Assessment in Distributed Systems"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Course Name *</label>
                <div className="relative">
                  <BookOpen className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Database Engineering"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes) *</label>
                <div className="relative">
                  <Clock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="number"
                    required
                    min={5}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of covered modules and objectives..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Scoring parameters */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scoring & Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Marks</label>
                <div className="relative">
                  <Award className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available From</label>
                <div className="relative">
                  <Calendar className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Until</label>
                <div className="relative">
                  <Calendar className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Integrity & Proctoring Configuration */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Academic Integrity & Proctoring Setup
              </h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Enforce Fullscreen Mode</span>
                <input
                  type="checkbox"
                  checked={enforceFullscreen}
                  onChange={(e) => setEnforceFullscreen(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Detect Tab Switching & Minimizing</span>
                <input
                  type="checkbox"
                  checked={detectTabSwitch}
                  onChange={(e) => setDetectTabSwitch(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Block Copy-Paste Operations</span>
                <input
                  type="checkbox"
                  checked={detectCopyPaste}
                  onChange={(e) => setDetectCopyPaste(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600"
                />
              </label>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Warning Strikes Limit</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxWarnings}
                  onChange={(e) => setMaxWarnings(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Candidate Examination Instructions (One instruction per line)
            </label>
            <textarea
              rows={4}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-md shadow-indigo-100"
          >
            {loading ? 'Creating Examination...' : 'Proceed to Add Examination Questions'}
          </button>
        </form>
      </div>
    </div>
  );
};
