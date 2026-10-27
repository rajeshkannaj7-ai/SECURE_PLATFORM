import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  CheckCircle2,
  User,
  ChevronRight,
  Send,
} from 'lucide-react';

export const EvaluateExam: React.FC = () => {
  const [pendingAttempts, setPendingAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected attempt for evaluation
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  // Grading form state per question
  const [grades, setGrades] = useState<{ [qId: string]: { marks: number; feedback: string } }>({});
  const [submittingGrade, setSubmittingGrade] = useState<{ [qId: string]: boolean }>({});
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPending = async () => {
    try {
      const res = await api.get('/evaluation/pending');
      if (res.data.success) {
        setPendingAttempts(res.data.attempts);
      }
    } catch (err) {
      console.error('Error fetching pending evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openEvaluation = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setEvalLoading(true);
    setSuccessMessage('');
    try {
      const res = await api.get(`/evaluation/attempt/${attemptId}`);
      if (res.data.success) {
        setEvaluationData(res.data);
        const initialGrades: any = {};
        (res.data.questionsWithAnswers || []).forEach((item: any) => {
          initialGrades[item.questionId] = {
            marks: item.marksAwarded || 0,
            feedback: item.facultyFeedback || '',
          };
        });
        setGrades(initialGrades);
      }
    } catch (err) {
      console.error('Error opening evaluation:', err);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleGradeSubmit = async (questionId: string) => {
    if (!selectedAttemptId) return;
    const gradeObj = grades[questionId] || { marks: 0, feedback: '' };

    setSubmittingGrade((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await api.post(`/evaluation/grade/${selectedAttemptId}/${questionId}`, {
        marksAwarded: gradeObj.marks,
        facultyFeedback: gradeObj.feedback,
      });

      if (res.data.success) {
        setSuccessMessage(`Marks saved successfully! Total Score updated to: ${res.data.attempt.score}`);
        // Refresh pending list
        fetchPending();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving grade.');
    } finally {
      setSubmittingGrade((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subjective Answer Evaluation</h1>
        <p className="text-xs text-slate-500">
          Review, annotate, and assign marks for student short-answer responses
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : pendingAttempts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">All submissions are evaluated</h3>
          <p className="text-xs text-slate-400 mt-1">There are no pending subjective evaluations waiting for your review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingAttempts.map((attempt) => (
            <div
              key={attempt._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                    {attempt.pendingEvaluationCount} Pending Questions
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{attempt.examId?.title}</h3>
                <p className="text-xs text-slate-500">{attempt.examId?.subject}</p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">{attempt.studentId?.name}</p>
                    <p className="text-slate-400">{attempt.studentId?.studentId || attempt.studentId?.email}</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 flex justify-between">
                  <span>Objective Score:</span>
                  <span className="font-bold text-slate-800">{attempt.score} Marks</span>
                </div>
              </div>

              <button
                onClick={() => openEvaluation(attempt._id)}
                className="mt-5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition shadow-xs"
              >
                <span>Evaluate Submission</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Drawer for evaluating attempt */}
      {selectedAttemptId && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-3xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Grading: {evaluationData?.attempt?.studentId?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {evaluationData?.attempt?.examId?.title} • Current Total: {evaluationData?.attempt?.score} Marks
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptId(null)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close Window
              </button>
            </div>

            {successMessage && (
              <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {evalLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {(evaluationData?.questionsWithAnswers || [])
                  .filter((item: any) => item.questionType === 'short_answer')
                  .map((q: any) => {
                    const gradeVal = grades[q.questionId]?.marks ?? 0;
                    const feedbackVal = grades[q.questionId]?.feedback ?? '';

                    return (
                      <div key={q.questionId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{q.questionText}</span>
                          <span className="text-xs font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded">
                            Max {q.marks} Marks
                          </span>
                        </div>

                        {/* Reference guidelines */}
                        <div className="text-xs text-slate-600 p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-700 block mb-0.5">Reference Solution:</span>
                          <span className="italic">{q.correctAnswer}</span>
                        </div>

                        {/* Student's answer */}
                        <div className="text-xs text-slate-800 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <span className="font-bold text-indigo-950 block mb-1">Student's Response:</span>
                          <p className="leading-relaxed whitespace-pre-wrap">{q.studentAnswer}</p>
                        </div>

                        {/* Grading Inputs */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                          <div className="w-full sm:w-36">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Award Marks (0-{q.marks})
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={q.marks}
                              value={gradeVal}
                              onChange={(e) =>
                                setGrades((prev) => ({
                                  ...prev,
                                  [q.questionId]: {
                                    ...prev[q.questionId],
                                    marks: Math.min(q.marks, Math.max(0, Number(e.target.value))),
                                  },
                                }))
                              }
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold"
                            />
                          </div>

                          <div className="flex-1 w-full">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Instructor Feedback
                            </label>
                            <input
                              type="text"
                              value={feedbackVal}
                              onChange={(e) =>
                                setGrades((prev) => ({
                                  ...prev,
                                  [q.questionId]: {
                                    ...prev[q.questionId],
                                    feedback: e.target.value,
                                  },
                                }))
                              }
                              placeholder="e.g. Well argued with accurate terminology"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                            />
                          </div>

                          <div className="sm:self-end w-full sm:w-auto">
                            <button
                              type="button"
                              disabled={submittingGrade[q.questionId]}
                              onClick={() => handleGradeSubmit(q.questionId)}
                              className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition shadow-xs"
                            >
                              <Send className="h-3 w-3" />
                              <span>{submittingGrade[q.questionId] ? 'Saving...' : 'Save Grade'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
