import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowLeft,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export const ExamResult: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/attempts/${attemptId}/result`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.attempt) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-800">Result not found</h2>
        <button
          onClick={() => navigate('/student')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { attempt, breakdown, proctoringEvents } = data;
  const exam = attempt.examId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Return button */}
      <button
        onClick={() => navigate('/student')}
        className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Assessments</span>
      </button>

      {/* Main Scorecard Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md w-fit mb-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{exam?.subject}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{exam?.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitted on: {new Date(attempt.submittedAt || attempt.updatedAt).toLocaleString()}
            </p>
          </div>

          {/* Pass / Fail / Pending Badge */}
          <div className="text-right">
            {attempt.pendingEvaluationCount > 0 ? (
              <div className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl font-bold text-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Pending Manual Grading</span>
              </div>
            ) : attempt.passed ? (
              <div className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Examination Passed</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold text-sm">
                <XCircle className="h-4 w-4 text-rose-600" />
                <span>Needs Improvement (Failed)</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Score</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.totalMarks}</span>
            </p>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-center">
            <p className="text-xs text-indigo-600 font-semibold uppercase">Percentage</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{attempt.percentage}%</p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-semibold uppercase">Objective Correct</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{attempt.correctCount}</p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-semibold uppercase">Integrity Warnings</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{attempt.warningCount}</p>
          </div>
        </div>
      </div>

      {/* Proctoring Event Audit Trail */}
      {proctoringEvents && proctoringEvents.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm mb-4">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Academic Integrity Monitoring Log ({proctoringEvents.length} events logged)</span>
          </div>

          <div className="space-y-2">
            {proctoringEvents.map((evt: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs flex items-start justify-between"
              >
                <div>
                  <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-amber-100 rounded mr-2">
                    {evt.eventType.replace('_', ' ')}
                  </span>
                  <span className="text-slate-700">{evt.eventDetails}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-3">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question Review Breakdown */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Question-by-Question Evaluation</h2>
          <span className="text-xs text-slate-500 font-medium">
            {breakdown.length} Total Questions
          </span>
        </div>

        <div className="space-y-6">
          {breakdown.map((q: any, idx: number) => {
            const isObjective = q.questionType === 'mcq' || q.questionType === 'true_false';

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition ${
                  isObjective
                    ? q.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-rose-200 bg-rose-50/20'
                    : q.isEvaluated
                    ? 'border-indigo-200 bg-indigo-50/20'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-700">Question {idx + 1}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {q.questionType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      Score: {q.marksAwarded} / {q.marks}
                    </span>
                    {isObjective ? (
                      q.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-600" />
                      )
                    ) : q.isEvaluated ? (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-sm font-semibold text-slate-900 mb-4">{q.questionText}</p>

                {/* Candidate's answer */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                    <span className="font-semibold text-slate-500 block mb-0.5">Your Response:</span>
                    <span className={`font-medium ${isObjective ? (q.isCorrect ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-800'}`}>
                      {q.studentAnswer || '(No answer provided)'}
                    </span>
                  </div>

                  {/* Expected / Correct Answer */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                    <span className="font-semibold text-slate-500 block mb-0.5">
                      {q.questionType === 'short_answer' ? 'Reference Guidelines:' : 'Correct Answer:'}
                    </span>
                    <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                  </div>

                  {/* Explanation if available */}
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900">
                      <span className="font-semibold block mb-0.5">Academic Rationale / Explanation:</span>
                      <span>{q.explanation}</span>
                    </div>
                  )}

                  {/* Faculty feedback if short answer */}
                  {q.facultyFeedback && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <span className="font-bold block mb-0.5">Faculty Feedback:</span>
                      <span>{q.facultyFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
