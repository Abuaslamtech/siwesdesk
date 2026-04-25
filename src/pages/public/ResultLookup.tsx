import { useState, FormEvent } from 'react';
import {
  lookupStudentResult,
  ResultLookupResponse,
} from '../../api/public';
import './ResultLookup.css';

// ─── Grade helper ───────────────────────────────────────────────────────────
function getGrade(siewesFinal: number): { letter: string; label: string; color: string } {
  if (siewesFinal >= 70) return { letter: 'A', label: 'Distinction', color: '#22c55e' };
  if (siewesFinal >= 60) return { letter: 'B', label: 'Credit',      color: '#3b82f6' };
  if (siewesFinal >= 50) return { letter: 'C', label: 'Merit',       color: '#a855f7' };
  if (siewesFinal >= 45) return { letter: 'D', label: 'Pass',        color: '#f59e0b' };
  return                        { letter: 'F', label: 'Fail',        color: '#ef4444' };
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function ScoreRow({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className="rl-score-row">
      <div className="rl-score-label-row">
        <span className="rl-score-label">{label}</span>
        <span className="rl-score-value">{score} / {max}</span>
      </div>
      <div className="rl-bar-track">
        <div
          className="rl-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ResultLookup() {
  const [matricNo, setMatricNo] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'not-found' | 'error'
  >('idle');
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
      ? getGrade(data.result.siewesFinal)
      : null;

  return (
    <div className="rl-root">
      {/* Animated background blobs */}
      <div className="rl-blob rl-blob-1" />
      <div className="rl-blob rl-blob-2" />
      <div className="rl-blob rl-blob-3" />

      <div className="rl-container">
        {/* Header */}
        <header className="rl-header">
          <div className="rl-logo-ring">
            <svg viewBox="0 0 24 24" fill="none" className="rl-logo-icon">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="rl-title">SIWES Result Portal</h1>
          <p className="rl-subtitle">
            Enter your matriculation number to check your SIWES placement results
          </p>
        </header>

        {/* Lookup card */}
        <div className="rl-card">
          <form onSubmit={handleSubmit} className="rl-form" id="result-lookup-form">
            <label htmlFor="matric-input" className="rl-form-label">
              Matriculation Number
            </label>
            <div className="rl-input-row">
              <input
                id="matric-input"
                type="text"
                className="rl-input"
                placeholder="e.g. HUI/CSC/21/0001"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                id="check-result-btn"
                className="rl-btn"
                disabled={status === 'loading' || !matricNo.trim()}
              >
                {status === 'loading' ? (
                  <span className="rl-spinner" />
                ) : (
                  'Check Results'
                )}
              </button>
            </div>
          </form>

          {/* ── States ─────────────────────────────────────────────────────── */}

          {status === 'error' && (
            <div className="rl-state rl-state-error" role="alert">
              <span className="rl-state-icon">⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {status === 'not-found' && (
            <div className="rl-state rl-state-warn" role="alert">
              <span className="rl-state-icon">🔍</span>
              <p>No student found with matric number <strong>{matricNo.trim().toUpperCase()}</strong>.</p>
              <p className="rl-state-hint">Double-check the number and try again.</p>
            </div>
          )}

          {/* Found but not yet published */}
          {status === 'success' && data && 'available' in data && !data.available && (
            <div className="rl-result-wrap">
              <div className="rl-student-header">
                <div className="rl-avatar">{data.student.name.charAt(0)}</div>
                <div>
                  <p className="rl-student-name">{data.student.name}</p>
                  <p className="rl-student-meta">{data.student.matricNo}</p>
                  {data.student.department && (
                    <p className="rl-student-meta">{data.student.department}</p>
                  )}
                </div>
              </div>
              <div className="rl-state rl-state-pending" role="status">
                <span className="rl-state-icon">⏳</span>
                <p>{data.message}</p>
                <p className="rl-state-hint">Please check back later or contact your coordinator.</p>
              </div>
            </div>
          )}

          {/* Full results */}
          {status === 'success' && data && 'available' in data && data.available && grade && (
            <div className="rl-result-wrap">
              {/* Student info */}
              <div className="rl-student-header">
                <div className="rl-avatar">{data.student.name.charAt(0)}</div>
                <div>
                  <p className="rl-student-name">{data.student.name}</p>
                  <p className="rl-student-meta">{data.student.matricNo}</p>
                  {data.student.department && (
                    <p className="rl-student-meta">{data.student.department}{data.student.faculty ? ` · ${data.student.faculty}` : ''}</p>
                  )}
                  {data.student.industry && (
                    <p className="rl-student-meta">📍 {data.student.industry}{data.student.state ? `, ${data.student.state}` : ''}</p>
                  )}
                </div>
              </div>

              <div className="rl-divider" />

              {/* Grade badge */}
              <div className="rl-grade-row">
                <div className="rl-grade-badge" style={{ borderColor: grade.color, color: grade.color }}>
                  <span className="rl-grade-letter">{grade.letter}</span>
                  <span className="rl-grade-label">{grade.label}</span>
                </div>
                <div className="rl-final-score">
                  <span className="rl-final-num">{data.result.siewesFinal.toFixed(1)}</span>
                  <span className="rl-final-denom">/ 100</span>
                  <span className="rl-final-tag">SIWES Final</span>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="rl-breakdown">
                <p className="rl-breakdown-title">Score Breakdown</p>
                <ScoreRow label="Orientation"      score={data.result.orientation}     max={20} />
                <ScoreRow label="Supervisor Score" score={data.result.supervisorScore} max={60} />
                <ScoreRow label="Industry Score"   score={data.result.industryScore}   max={20} />
              </div>

              {/* Total raw */}
              <div className="rl-total-row">
                <span>Raw Total</span>
                <span className="rl-total-num">{data.result.total} / 100</span>
              </div>

              <p className="rl-timestamp">
                Published on{' '}
                {new Date(data.result.submittedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        <p className="rl-footer">
          Having trouble? Contact your SIWES coordinator.
        </p>
      </div>
    </div>
  );
}
