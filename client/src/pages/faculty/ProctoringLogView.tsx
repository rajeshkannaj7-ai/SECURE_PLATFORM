import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const ProctoringLogView: React.FC = () => {
  const [flaggedAttempts, setFlaggedAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected attempt audit timeline
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    const fetchFlagged = async () => {
      try {
        const res = await api.get('/proctoring/flagged');
        if (res.data.success) {
          setFlaggedAttempts(res.data.attempts);
        }
      } catch (err) {
        console.error('Error fetching flagged attempts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlagged();
  }, []);

  const openAuditTrail = async (attempt: any) => {
    setSelectedAttempt(attempt);
    setEventsLoading(true);
    try {
      const res = await api.get(`/proctoring/attempt/${attempt._id}`);
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error fetching attempt events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Integrity & Proctoring Audit</h1>
        <p className="text-xs text-slate-500">
          Review attempts with detected irregularities, window blur, fullscreen exits, or copy-paste actions
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : flaggedAttempts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">Clean Academic Integrity Record</h3>
          <p className="text-xs text-slate-400 mt-1">No proctoring violations or flagged attempts recorded.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Student Candidate</th>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Warning Strikes</th>
                  <th className="py-3 px-4">Flag Status</th>
                  <th className="py-3 px-4">Detected Reasons</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {flaggedAttempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{attempt.studentId?.name}</div>
                      <div className="text-slate-400 text-[11px]">
                        {attempt.studentId?.studentId || attempt.studentId?.email}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{attempt.examId?.title}</div>
                      <div className="text-slate-400 text-[11px]">{attempt.examId?.subject}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 text-sm">{attempt.warningCount}</span>
                      <span className="text-slate-400 text-[11px]"> / {attempt.examId?.proctoringConfig?.maxWarnings || 5}</span>
                    </td>
                    <td className="py-4 px-4">
                      {attempt.isFlagged ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[11px] inline-flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-[11px]">
                          Under Review
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs">
                      {(attempt.flagReasons || []).length > 0 ? (
                        <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-700 font-medium">
                          {attempt.flagReasons.map((r: string, idx: number) => (
                            <li key={idx} className="truncate">{r}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 italic">Minor infractions only</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openAuditTrail(attempt)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect Events</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Audit Trail: {selectedAttempt.studentId?.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedAttempt.examId?.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Candidate metadata */}
            <div className="grid grid-cols-2 gap-3 my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Total Warning Strikes:</span>
                <span className="font-bold text-rose-600 text-sm">{selectedAttempt.warningCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Attempt Status:</span>
                <span className="font-bold text-slate-800 text-sm uppercase">{selectedAttempt.status}</span>
              </div>
            </div>

            {eventsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : events.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No individual event logs found.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-1.5 py-0.5 uppercase tracking-wider font-bold text-[10px] rounded bg-amber-200 text-amber-900">
                          {evt.eventType.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-slate-700">Strike #{evt.warningNumber}</span>
                      </div>
                      <p className="text-slate-600">{evt.eventDetails}</p>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-3">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
