import { useState, FormEvent } from 'react';
import { Search, GraduationCap, Calendar, MapPin, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import {
  lookupStudentResult,
  ResultLookupResponse,
} from '../../api/public';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';

// ─── Grade helper ───────────────────────────────────────────────────────────
function getGrade(score: number): { letter: string; label: string; color: 'green' | 'primary' | 'gold' | 'red' } {
  if (score >= 70) return { letter: 'A', label: 'Distinction', color: 'green' };
  if (score >= 60) return { letter: 'B', label: 'Credit',      color: 'primary' };
  if (score >= 50) return { letter: 'C', label: 'Merit',       color: 'gold' };
  if (score >= 45) return { letter: 'D', label: 'Pass',        color: 'gold' };
  return                  { letter: 'F', label: 'Fail',        color: 'red' };
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function ScoreRow({ label, score, max, color = 'primary' }: { label: string; score: number; max: number; color?: 'primary' | 'gold' | 'green' | 'red' }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{score} / {max}</span>
      </div>
      <ProgressBar value={(score / max) * 100} size="sm" color={color} />
    </div>
  );
}

export default function ResultLookup() {
  const [matricNo, setMatricNo] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'not-found' | 'error'>('idle');
  const [data, setData] = useState<ResultLookupResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!matricNo.trim()) return;
    setStatus('loading');
    setData(null);
    setErrorMsg('');

    try {
      const result = await lookupStudentResult(matricNo);
      setData(result);
      setStatus(result.found ? 'success' : 'not-found');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error.');
      setStatus('error');
    }
  }

  const grade =
    data &&
    'available' in data &&
    data.available &&
    data.result
      ? getGrade(data.result.total)
      : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white shadow-lg mb-2">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">SIWES Result Portal</h1>
          <p className="text-slate-500 max-w-sm mx-auto">
            Enter your matriculation number to check your placement and assessment results.
          </p>
        </div>

        {/* Lookup Card */}
        <Card padding="lg" className="shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="matric-input" className="text-sm font-semibold text-slate-700">
                Matriculation Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  id="matric-input"
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 transition-all outline-none text-sm"
                  placeholder="e.g. HUI/CSC/21/0001"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  disabled={status === 'loading'}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !matricNo.trim()}
              className="w-full h-11 px-4 bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white text-sm font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Results'
              )}
            </button>
          </form>

          {/* ── States ─────────────────────────────────────────────────────── */}

          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">System Error</p>
                <p className="text-xs mt-0.5 opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {status === 'not-found' && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-700 animate-in fade-in slide-in-from-top-2">
              <Search className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">No Student Found</p>
                <p className="text-xs mt-0.5 opacity-90">
                  No record matched <strong>{matricNo.trim().toUpperCase()}</strong>. Please verify the number.
                </p>
              </div>
            </div>
          )}

          {/* Found but not yet published */}
          {status === 'success' && data && 'available' in data && !data.available && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                  {data.student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{data.student.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{data.student.matricNo}</p>
                </div>
              </div>

              <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-primary-600 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-primary-900">Results Pending</p>
                  <p className="text-sm text-primary-700 leading-relaxed max-w-xs mx-auto">
                    {data.message || 'Your SIWES results are currently being processed and will be available soon.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Full Results Display */}
          {status === 'success' && data && 'available' in data && data.available && grade && (
            <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-border">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-border text-primary-700 flex items-center justify-center font-bold text-xl shrink-0">
                  {data.student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{data.student.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded uppercase tracking-wider">{data.student.matricNo}</span>
                    {data.student.department && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        {data.student.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grade Card */}
                <div className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center space-y-2 ${
                  grade.color === 'green' ? 'bg-green-50 border-green-200 text-green-700' :
                  grade.color === 'primary' ? 'bg-primary-50 border-primary-200 text-primary-700' :
                  grade.color === 'gold' ? 'bg-gold-50 border-gold-200 text-gold-700' :
                  'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <span className="text-5xl font-heading font-black">{grade.letter}</span>
                  <div className="space-y-0.5">
                    <p className="font-bold uppercase tracking-widest text-[10px] opacity-60">Final Grade</p>
                    <p className="text-sm font-bold">{grade.label}</p>
                  </div>
                </div>

                {/* Final Score */}
                <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-heading font-bold">{data.result.total}</span>
                    <span className="text-lg opacity-40">/ 100</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">Total Score</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Detailed Breakdown
                </h4>
                <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-border">
                  <ScoreRow label="Orientation"      score={data.result.orientation}     max={20} color="primary" />
                  <ScoreRow label="Supervisor Score" score={data.result.supervisorScore} max={60} color="primary" />
                  <ScoreRow label="Industry Score"   score={data.result.industryScore}   max={20} color="primary" />
                  

                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-[11px] font-medium text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>Published on {new Date(data.result.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                {data.student.industry && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>{data.student.industry}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-slate-400 font-medium pb-8">
          Having trouble? Please contact your departmental SIWES coordinator.
        </p>
      </div>
    </div>
  );
}
