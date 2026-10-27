import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const AcademicIntegrityReport: React.FC = () => {
  const [flaggedAttempts, setFlaggedAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/proctoring/flagged');
        if (res.data.success) {
          setFlaggedAttempts(res.data.attempts);
        }
      } catch (err) {
        console.error('Error fetching integrity reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Integrity Compliance Log</h1>
        <p className="text-xs text-slate-500">
          Institution-wide audit trail of recorded proctoring strikes and candidate irregularity reports
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : flaggedAttempts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">Zero Integrity Infractions</h3>
          <p className="text-xs text-slate-400 mt-1">No proctoring violations recorded in the system.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Student Candidate</th>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Strikes</th>
                  <th className="py-3 px-4">Flagged Irregularities</th>
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-6 text-right">Integrity Status</th>
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
                    <td className="py-4 px-4 text-rose-700 max-w-xs">
                      {(attempt.flagReasons || []).length > 0 ? (
                        <ul className="list-disc list-inside text-[11px] space-y-0.5 font-medium">
                          {attempt.flagReasons.map((r: string, idx: number) => (
                            <li key={idx} className="truncate">{r}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 italic">Within normal bounds</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-[11px]">
                      {new Date(attempt.updatedAt || attempt.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {attempt.isFlagged ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[11px] inline-flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Flagged for Review</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-[11px]">
                          Under Monitoring
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
