import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Exam, Question, QuestionType } from '../../types';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const ManageQuestions: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [evaluationGuidelines, setEvaluationGuidelines] = useState('');
  const [marks, setMarks] = useState(5);
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchQuestions = async () => {
    try {
      const examRes = await api.get(`/exams/${examId}`);
      if (examRes.data.success) {
        setExam(examRes.data.exam);
      }

      const qRes = await api.get(`/questions/exam/${examId}`);
      if (qRes.data.success) {
        setQuestions(qRes.data.questions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!questionText.trim()) {
      setError('Question prompt is required.');
      return;
    }

    if (questionType === 'mcq') {
      const validOptions = options.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        setError('At least 2 non-empty options are required for MCQ.');
        return;
      }
      if (!correctAnswer) {
        setError('Please select the correct option.');
        return;
      }
    }

    if (questionType === 'true_false' && !correctAnswer) {
      setError('Please select true or false as the correct answer.');
      return;
    }

    if (questionType === 'short_answer' && !correctAnswer.trim()) {
      setError('Reference answer or key points are required for manual grading.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/questions/exam/${examId}`, {
        questionText,
        questionType,
        options: questionType === 'mcq' ? options.map((o) => o.trim()).filter(Boolean) : [],
        correctAnswer: correctAnswer.trim(),
        evaluationGuidelines: evaluationGuidelines.trim(),
        marks: Number(marks),
        explanation: explanation.trim(),
      });

      if (res.data.success) {
        // Reset form
        setQuestionText('');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
        setEvaluationGuidelines('');
        setExplanation('');
        setShowAddModal(false);
        fetchQuestions();
      } else {
        setError(res.data.message || 'Failed to add question.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error adding question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await api.delete(`/questions/${qId}`);
      if (res.data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== qId));
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/faculty')}
        className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Examiner Dashboard</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
            {exam?.subject}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{exam?.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {questions.length} Questions Configured • Total Marks: <strong>{totalCalculatedMarks}</strong> (Target: {exam?.totalMarks})
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-100 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700">No questions added yet</h3>
            <p className="text-xs text-slate-400 mt-1">Click "Add New Question" above to build your examination questionnaire.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                    {q.questionType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900">{q.questionText}</p>

                {q.questionType === 'mcq' && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg border text-xs flex items-center space-x-2 ${
                          opt === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {opt === q.correctAnswer && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.questionType === 'true_false' && (
                  <div className="text-xs font-medium text-slate-600">
                    Correct Answer: <strong className="text-emerald-700 uppercase">{q.correctAnswer}</strong>
                  </div>
                )}

                {q.questionType === 'short_answer' && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <p className="font-semibold text-slate-700 mb-0.5">Reference Solution:</p>
                    <p className="italic">{q.correctAnswer}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDeleteQuestion(q._id)}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition shrink-0"
                title="Delete Question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 my-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Question to Exam</h2>
            <p className="text-xs text-slate-500 mb-4">Choose question format and specify evaluation criteria</p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) => {
                    const t = e.target.value as QuestionType;
                    setQuestionType(t);
                    setCorrectAnswer(t === 'true_false' ? 'true' : '');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mcq">Multiple Choice Question (MCQ - Auto Graded)</option>
                  <option value="true_false">True / False (Auto Graded)</option>
                  <option value="short_answer">Short-Answer (Subjective - Faculty Graded)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Question Prompt *</label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question text..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* MCQ Options */}
              {questionType === 'mcq' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    Options & Correct Answer Selection:
                  </label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={correctAnswer === opt && opt !== ''}
                        onChange={() => setCorrectAnswer(opt)}
                        disabled={!opt}
                        className="h-4 w-4 text-indigo-600"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400">Select the radio button next to the correct answer.</p>
                </div>
              )}

              {/* True/False Selector */}
              {questionType === 'true_false' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Correct Answer</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['true', 'false'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCorrectAnswer(v)}
                        className={`py-2 rounded-xl text-xs font-bold border capitalize transition ${
                          correctAnswer === v
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Answer Reference Solution */}
              {questionType === 'short_answer' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Reference Answer / Key Points *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="Model answer for grading..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Evaluation Rubric / Guidelines
                    </label>
                    <textarea
                      rows={2}
                      value={evaluationGuidelines}
                      onChange={(e) => setEvaluationGuidelines(e.target.value)}
                      placeholder="e.g. 5 marks for definition, 5 marks for trade-offs..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Marks Weightage</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Explanation (Post-Exam)</label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Rationale displayed after submission"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
