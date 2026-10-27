import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Exam, Question, Answer, ExamAttempt } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  XCircle,
  Send,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

export const ExamRoom: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core exam state
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<{ [qId: string]: { studentAnswer: string; isMarkedForReview: boolean } }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proctoring state
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Auto-save debounce ref
  const saveTimeoutRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

  // 1. Log Proctoring Event to Backend
  const reportProctoringEvent = useCallback(
    async (eventType: 'tab_switch' | 'fullscreen_exit' | 'window_blur' | 'copy_paste', details: string) => {
      if (!attempt || attempt.status !== 'in_progress') return;

      try {
        const res = await api.post(`/proctoring/log/${attempt._id}`, {
          eventType,
          eventDetails: details,
        });

        if (res.data.success) {
          const newCount = res.data.warningCount;
          setWarningCount(newCount);
          setWarningMessage(
            `Proctoring Alert: ${details} (Warning ${newCount} of ${exam?.proctoringConfig?.maxWarnings || 5})`
          );
          setShowWarningModal(true);
        }
      } catch (err) {
        console.error('Failed to log proctoring event:', err);
      }
    },
    [attempt, exam]
  );

  // 2. Fetch Exam, Questions, and Active Attempt
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Fetch Exam details
        const examRes = await api.get(`/exams/${examId}`);
        if (!examRes.data.success) throw new Error('Exam not found');
        const examData = examRes.data.exam;
        setExam(examData);

        // Fetch Questions (sanitized without answers for students)
        const qRes = await api.get(`/questions/exam/${examId}`);
        if (!qRes.data.success) throw new Error('Failed to load questions');
        setQuestions(qRes.data.questions);

        // Start or resume attempt
        const startRes = await api.post(`/attempts/start/${examId}`);
        if (startRes.data.success) {
          const att = startRes.data.attempt;
          setAttempt(att);
          setRemainingSeconds(startRes.data.remainingSeconds || examData.durationMinutes * 60);
          setWarningCount(att.warningCount || 0);

          // Fetch previously saved answers if any
          const progRes = await api.get(`/attempts/${att._id}/progress`);
          if (progRes.data.success) {
            const savedMap: { [key: string]: { studentAnswer: string; isMarkedForReview: boolean } } = {};
            (progRes.data.answers || []).forEach((a: Answer) => {
              savedMap[a.questionId] = {
                studentAnswer: a.studentAnswer || '',
                isMarkedForReview: !!a.isMarkedForReview,
              };
            });
            setAnswers(savedMap);
            if (progRes.data.remainingSeconds !== undefined) {
              setRemainingSeconds(progRes.data.remainingSeconds);
            }
          }
        }
      } catch (error: any) {
        console.error('Error loading exam room:', error);
        if (error.response?.data?.attemptId) {
          navigate(`/student/result/${error.response.data.attemptId}`);
        } else {
          navigate('/student');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeRoom();
  }, [examId, navigate]);

  // 3. Countdown Timer
  useEffect(() => {
    if (loading || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, remainingSeconds]);

  // 4. Academic Integrity & Proctoring Listeners
  useEffect(() => {
    if (!attempt || loading) return;

    // Fullscreen change listener
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        reportProctoringEvent('fullscreen_exit', 'Student exited fullscreen mode.');
      }
    };

    // Tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportProctoringEvent('tab_switch', 'Browser tab switched or minimized.');
      }
    };

    // Window blur
    const handleWindowBlur = () => {
      reportProctoringEvent('window_blur', 'Window lost active focus.');
    };

    // Copy / Paste / Context Menu interception
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportProctoringEvent('copy_paste', 'Copy action attempted on examination question.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      reportProctoringEvent('copy_paste', 'External clipboard paste attempted.');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [attempt, loading, reportProctoringEvent]);

  // 5. Save Answer Progress
  const saveAnswerToBackend = async (questionId: string, answerText: string, isMarked: boolean) => {
    if (!attempt) return;
    setIsSaving(true);
    try {
      await api.post(`/attempts/${attempt._id}/save-answer`, {
        questionId,
        studentAnswer: answerText,
        isMarkedForReview: isMarked,
      });
    } catch (err) {
      console.error('Failed to sync answer with server:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAnswer = (questionId: string, val: string) => {
    const isMarked = answers[questionId]?.isMarkedForReview || false;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { studentAnswer: val, isMarkedForReview: isMarked },
    }));

    // Debounce save for text, immediate for choice
    if (saveTimeoutRef.current[questionId]) {
      clearTimeout(saveTimeoutRef.current[questionId]);
    }

    saveTimeoutRef.current[questionId] = setTimeout(() => {
      saveAnswerToBackend(questionId, val, isMarked);
    }, 300);
  };

  const handleToggleMarkReview = (questionId: string) => {
    const current = answers[questionId] || { studentAnswer: '', isMarkedForReview: false };
    const updated = !current.isMarkedForReview;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...current, isMarkedForReview: updated },
    }));

    saveAnswerToBackend(questionId, current.studentAnswer, updated);
  };

  const handleClearAnswer = (questionId: string) => {
    const isMarked = answers[questionId]?.isMarkedForReview || false;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { studentAnswer: '', isMarkedForReview: isMarked },
    }));

    saveAnswerToBackend(questionId, '', isMarked);
  };

  // 6. Submit Exam
  const handleSubmitExam = async () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Exit fullscreen before redirect
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }

      const res = await api.post(`/attempts/${attempt._id}/submit`);
      if (res.data.success) {
        navigate(`/student/result/${attempt._id}`);
      } else {
        alert(res.data.message || 'Error submitting exam.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      alert(err.response?.data?.message || 'Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Re-enter Fullscreen handler
  const reenterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setShowWarningModal(false);
    } catch (err) {
      console.error('Failed to re-enter fullscreen:', err);
    }
  };

  // Time format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide">Configuring Secure Proctored Room...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentAnsObj = answers[currentQ._id] || { studentAnswer: '', isMarkedForReview: false };
  const isTimeCritical = remainingSeconds < 300; // less than 5 minutes

  // Palette counts
  let answeredCount = 0;
  let markedCount = 0;
  questions.forEach((q) => {
    const a = answers[q._id];
    if (a?.studentAnswer && a.studentAnswer.trim() !== '') answeredCount++;
    if (a?.isMarkedForReview) markedCount++;
  });
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 leading-tight truncate max-w-xs md:max-w-md">
              {exam?.title}
            </h1>
            <p className="text-xs text-slate-500">{exam?.subject} • Candidate: {user?.name}</p>
          </div>
        </div>

        {/* Center Timer */}
        <div
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl border font-mono font-bold text-base transition ${
            isTimeCritical
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <Clock className={`h-4 w-4 ${isTimeCritical ? 'text-rose-600' : 'text-slate-500'}`} />
          <span>{formatTime(remainingSeconds)}</span>
        </div>

        {/* Right Action */}
        <div className="flex items-center space-x-3">
          <span className="text-xs hidden md:inline px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-semibold">
            Warnings: {warningCount}/{exam?.proctoringConfig?.maxWarnings || 5}
          </span>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Finish Exam</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Active Question Workspace */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              {/* Question metadata badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-base">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 uppercase tracking-wider font-bold rounded-md bg-indigo-50 text-indigo-700">
                    {currentQ.questionType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                  {isSaving && (
                    <span className="text-xs text-indigo-600 font-medium animate-pulse">
                      Saving...
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="py-6">
                <p className="text-base md:text-lg text-slate-900 font-medium leading-relaxed">
                  {currentQ.questionText}
                </p>
              </div>

              {/* Answer Controls based on Type */}
              <div className="space-y-3 mt-2">
                {currentQ.questionType === 'mcq' && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((option, optIdx) => {
                      const isSelected = currentAnsObj.studentAnswer === option;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectAnswer(currentQ._id, option)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center space-x-3.5 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/60 shadow-xs text-indigo-950 font-medium'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm leading-normal">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['true', 'false'].map((tfVal) => {
                      const isSelected = currentAnsObj.studentAnswer === tfVal;
                      return (
                        <button
                          key={tfVal}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQ._id, tfVal)}
                          className={`p-6 rounded-2xl border text-center transition font-bold text-base capitalize ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {tfVal}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === 'short_answer' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Type your answer below (Subject to instructor manual evaluation):
                    </label>
                    <textarea
                      rows={6}
                      value={currentAnsObj.studentAnswer}
                      onChange={(e) => handleSelectAnswer(currentQ._id, e.target.value)}
                      placeholder="Enter your detailed answer here..."
                      className="w-full p-4 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition leading-relaxed"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Characters: {currentAnsObj.studentAnswer.length} • Saved automatically
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Mark review, clear, previous, next */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleMarkReview(currentQ._id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition ${
                    currentAnsObj.isMarkedForReview
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>{currentAnsObj.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>

                {currentAnsObj.studentAnswer && (
                  <button
                    type="button"
                    onClick={() => handleClearAnswer(currentQ._id)}
                    className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center space-x-1"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center space-x-1 transition shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & Status */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Question Palette</h3>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pb-4 border-b border-slate-100 mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="font-bold text-emerald-700 text-sm">{answeredCount}</p>
                <p className="text-slate-500 text-[10px]">Answered</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                <p className="font-bold text-amber-700 text-sm">{markedCount}</p>
                <p className="text-slate-500 text-[10px]">Review</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-600 text-sm">{unansweredCount}</p>
                <p className="text-slate-400 text-[10px]">Unanswered</p>
              </div>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ansObj = answers[q._id];
                const hasAnswer = ansObj && ansObj.studentAnswer && ansObj.studentAnswer.trim() !== '';
                const isMarked = ansObj?.isMarkedForReview;
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isMarked) {
                  btnClass = 'bg-amber-400 text-slate-900 border-amber-500 font-bold';
                } else if (hasAnswer) {
                  btnClass = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                }

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-semibold border flex items-center justify-center transition relative ${btnClass} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-600 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Integrity Monitor Panel */}
          <div className="bg-indigo-900 rounded-3xl p-5 text-white shadow-xs">
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold mb-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Integrity Active</span>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Fullscreen tracking & tab switch detection are continually operating. Do not leave this tab.
            </p>
            <div className="mt-3 pt-3 border-t border-indigo-800/80 flex items-center justify-between text-xs">
              <span className="text-indigo-200">Strikes:</span>
              <span className="font-bold text-amber-300">{warningCount} / {exam?.proctoringConfig?.maxWarnings || 5}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring Warning Modal */}
      {(!isFullscreen || showWarningModal) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-bounce-short">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Academic Integrity Warning</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {warningMessage || 'Fullscreen was exited or an unauthorized navigation was detected.'}
            </p>
            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-amber-900 text-xs font-medium">
              Warning count: <strong>{warningCount}</strong> of{' '}
              {exam?.proctoringConfig?.maxWarnings || 5}. Further violations will result in your attempt
              being flagged for faculty review.
            </div>
            <button
              onClick={reenterFullscreen}
              className="mt-5 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center space-x-2"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Re-enter Fullscreen & Continue Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-3 text-slate-900 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Confirm Final Submission</h3>
                <p className="text-xs text-slate-500">Review your attempt summary</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs font-medium text-slate-700 mb-5">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold text-slate-900">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Marked for Review:</span>
                <span className="font-bold">{markedCount}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Unanswered:</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Once submitted, objective questions will be evaluated immediately. You will not be able
              to change any answers.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitExam}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <span>{isSubmitting ? 'Evaluating...' : 'Yes, Submit Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
