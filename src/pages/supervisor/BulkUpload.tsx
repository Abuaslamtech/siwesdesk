import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  Download,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudentsForSupervisor } from '../../api/assignments.api';
import {
  bulkSubmitScores,
  BulkScoreEntry,
  BulkSubmitResponse,
} from '../../api/scores.api';
import { useAuthStore } from '../../store/auth.store';
import { StudentWithStatus } from '../../types';
import { computeFinal } from '../../utils/formatScore';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';

interface RowState {
  studentId: string;
  name: string;
  matricNo: string;
  course: string;
  level: string;
  supervisorScore: string;
  industryScore: string;
  orientation: number;
  isAlreadySubmitted: boolean;
}

type Step = 'prepare' | 'results';

function parseIntSafe(v: string, max: number): number | null {
  const n = parseInt(v, 10);
  if (isNaN(n) || n < 0 || n > max) return null;
  return n;
}

export default function BulkUpload() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('prepare');
  const [rows, setRows] = useState<RowState[]>([]);
  const [results, setResults] = useState<BulkSubmitResponse | null>(null);

  const { data: students, isLoading } = useQuery({
    queryKey: ['supervisor-students', user?.id],
    queryFn: () => getStudentsForSupervisor(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (students) {
      setRows((prev) => {
        // Keep any scores already typed if the list refreshes
        const prevMap = Object.fromEntries(prev.map((r) => [r.studentId, r]));
        return students.map((s) => ({
          studentId: s.id,
          name: s.name,
          matricNo: s.matricNo,
          course: s.course ?? '',
          level: String(s.level),
          orientation: s.score?.orientation ?? 0,
          supervisorScore:
            prevMap[s.id]?.supervisorScore ??
            (s.score?.supervisorScore != null
              ? String(s.score.supervisorScore)
              : ''),
          industryScore:
            prevMap[s.id]?.industryScore ??
            (s.score?.industryScore != null
              ? String(s.score.industryScore)
              : ''),
          isAlreadySubmitted:
            s.status === 'completed' &&
            s.score != null &&
            !s.score.isDraft,
        }));
      });
    }
  }, [students]);

  const mutation = useMutation({
    mutationFn: (entries: BulkScoreEntry[]) => bulkSubmitScores(entries),
    onSuccess: (data) => {
      setResults(data);
      setStep('results');
      qc.invalidateQueries({ queryKey: ['supervisor-students', user?.id] });
      if (data.failed === 0) {
        toast.success(`All ${data.succeeded} scores submitted!`);
      } else {
        toast(`${data.succeeded} submitted, ${data.failed} failed`, {
          icon: '⚠️',
        });
      }
    },
    onError: () => toast.error('Submission failed. Please try again.'),
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const updateRow = useCallback(
    (idx: number, field: 'supervisorScore' | 'industryScore', val: string) => {
      setRows((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)),
      );
    },
    [],
  );

  // CSV download ─────────────────────────────────────────────────────────────

  function downloadTemplate() {
    const header = 'studentId,name,matricNo,supervisorScore,industryScore\n';
    const body = rows
      .map(
        (r) =>
          `${r.studentId},"${r.name}",${r.matricNo},${r.supervisorScore},${r.industryScore}`,
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'siwes_scores_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // CSV import ───────────────────────────────────────────────────────────────

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      const dataLines = lines.slice(1); // skip header

      const importMap: Record<
        string,
        { supervisorScore: string; industryScore: string }
      > = {};

      for (const line of dataLines) {
        // handle quoted names
        const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        const [sid, , , sup, ind] = cols.map((c) => c.replace(/^"|"$/g, '').trim());
        if (sid) {
          importMap[sid] = {
            supervisorScore: sup ?? '',
            industryScore: ind ?? '',
          };
        }
      }

      setRows((prev) =>
        prev.map((r) =>
          importMap[r.studentId]
            ? { ...r, ...importMap[r.studentId] }
            : r,
        ),
      );
      toast.success('CSV imported — review and submit');
    };
    reader.readAsText(file);
    // reset so same file can be re-imported
    e.target.value = '';
  }

  // Submit ───────────────────────────────────────────────────────────────────

  function handleSubmit() {
    const entries: BulkScoreEntry[] = [];
    const errors: string[] = [];

    for (const r of rows) {
      if (r.isAlreadySubmitted) continue; // skip locked rows
      const sup = parseIntSafe(r.supervisorScore, 40);
      const ind = parseIntSafe(r.industryScore, 50);
      if (sup === null || ind === null) {
        errors.push(r.name);
      } else {
        entries.push({
          studentId: r.studentId,
          supervisorScore: sup,
          industryScore: ind,
        });
      }
    }

    if (errors.length > 0) {
      toast.error(
        `Fix scores for: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` +${errors.length - 3} more` : ''}`,
      );
      return;
    }

    if (entries.length === 0) {
      toast('Nothing to submit — all students already have final scores.', {
        icon: 'ℹ️',
      });
      return;
    }

    mutation.mutate(entries);
  }

  // ── Render: Results step ─────────────────────────────────────────────────

  if (step === 'results' && results) {
    const resultMap = Object.fromEntries(
      results.results.map((r) => [r.studentId, r]),
    );

    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div>
          <button
            onClick={() => setStep('prepare')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to upload
          </button>
          <h2 className="text-xl font-heading font-bold text-slate-900">
            Submission Results
          </h2>
        </div>

        {/* Summary banner */}
        <div
          className={cn(
            'rounded-xl border p-5 flex items-start gap-4',
            results.failed === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200',
          )}
        >
          {results.failed === 0 ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-slate-800">
              {results.succeeded} submitted successfully
              {results.failed > 0 && `, ${results.failed} failed`}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {results.failed > 0
                ? 'Review the errors below and correct those students individually.'
                : 'All scores have been finalised.'}
            </p>
          </div>
        </div>

        {/* Row-by-row table */}
        <Card padding="none">
          <div className="divide-y divide-border">
            {rows.map((r) => {
              const res = resultMap[r.studentId];
              if (!res) return null; // wasn't submitted (locked row)
              const ok = res.status === 'ok';
              return (
                <div
                  key={r.studentId}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {r.matricNo}
                    </p>
                  </div>
                  {ok ? (
                    <div className="text-right text-xs text-slate-500 hidden sm:block">
                      <p>
                        Sup: <span className="font-semibold">{r.supervisorScore}</span> · Ind:{' '}
                        <span className="font-semibold">{r.industryScore}</span>
                      </p>
                      <p className="text-primary-700 font-semibold">
                        SIWES:{' '}
                        {computeFinal({
                          orientation: r.orientation,
                          supervisorScore: Number(r.supervisorScore),
                          industryScore: Number(r.industryScore),
                        })}
                        /50
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-red-600 max-w-[180px] text-right">
                      {res.message}
                    </p>
                  )}
                  {ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep('prepare')}>
            Upload More
          </Button>
          <Link to="/supervisor/students">
            <Button>Back to Students</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: Prepare step ─────────────────────────────────────────────────

  const editableCount = rows.filter((r) => !r.isAlreadySubmitted).length;
  const filledCount = rows.filter((r) => {
    if (r.isAlreadySubmitted) return false;
    const sup = parseIntSafe(r.supervisorScore, 40);
    const ind = parseIntSafe(r.industryScore, 50);
    return sup !== null && ind !== null;
  }).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Bulk Score Upload"
        subtitle={
          rows.length > 0
            ? `${editableCount} students to score · ${filledCount} filled`
            : 'Loading students…'
        }
        action={
          <Link to="/supervisor/students">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Individual Entry
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={downloadTemplate}
          disabled={rows.length === 0}
        >
          Download CSV Template
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Import CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleImport}
          className="hidden"
          id="csv-import-input"
        />
        <div className="flex-1" />
        <Button
          size="sm"
          leftIcon={<Send className="w-4 h-4" />}
          loading={mutation.isPending}
          onClick={handleSubmit}
          disabled={rows.length === 0}
        >
          Submit All Scores
        </Button>
      </div>

      {/* CSV info banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
        <strong>How to use:</strong> Download the CSV template, fill in the
        Supervisor Score (0–40) and Industry Score (0–50) columns, then import
        it back. Or type scores directly in the table below.
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <p className="text-center text-slate-500 py-8 text-sm">
            No students assigned to you yet.
          </p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Matric No</th>
                  <th className="px-4 py-3 hidden md:table-cell">Course</th>
                  <th className="px-4 py-3 text-center">Orient</th>
                  <th className="px-4 py-3">Sup Score /40</th>
                  <th className="px-4 py-3">Ind Score /50</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">SIWES /50</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r, idx) => {
                  const locked = r.isAlreadySubmitted;
                  const sup = parseIntSafe(r.supervisorScore, 40);
                  const ind = parseIntSafe(r.industryScore, 50);
                  const supErr =
                    r.supervisorScore !== '' && sup === null;
                  const indErr =
                    r.industryScore !== '' && ind === null;
                  const liveTotal =
                    sup !== null && ind !== null
                      ? computeFinal({
                          orientation: r.orientation,
                          supervisorScore: sup,
                          industryScore: ind,
                        })
                      : null;

                  return (
                    <tr
                      key={r.studentId}
                      className={cn(
                        'transition-colors',
                        locked
                          ? 'bg-green-50/60'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 truncate max-w-[140px]">
                          {r.name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono sm:hidden">
                          {r.matricNo}
                        </p>
                      </td>

                      {/* Matric */}
                      <td className="px-4 py-3 text-slate-500 font-mono hidden sm:table-cell">
                        {r.matricNo}
                      </td>

                      {/* Course */}
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell truncate max-w-[120px]">
                        {r.course}
                      </td>

                      {/* Orientation (read-only) */}
                      <td className="px-4 py-3 text-center font-semibold text-slate-600">
                        {r.orientation}
                      </td>

                      {/* Supervisor Score */}
                      <td className="px-4 py-2">
                        {locked ? (
                          <span className="font-semibold text-green-700">
                            {r.supervisorScore}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={r.supervisorScore}
                            onChange={(e) =>
                              updateRow(idx, 'supervisorScore', e.target.value)
                            }
                            placeholder="0–40"
                            className={cn(
                              'w-20 h-8 rounded-md border text-sm px-2 text-center focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700',
                              supErr
                                ? 'border-red-400 bg-red-50 text-red-700'
                                : 'border-border bg-white',
                            )}
                          />
                        )}
                      </td>

                      {/* Industry Score */}
                      <td className="px-4 py-2">
                        {locked ? (
                          <span className="font-semibold text-green-700">
                            {r.industryScore}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={r.industryScore}
                            onChange={(e) =>
                              updateRow(idx, 'industryScore', e.target.value)
                            }
                            placeholder="0–50"
                            className={cn(
                              'w-20 h-8 rounded-md border text-sm px-2 text-center focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700',
                              indErr
                                ? 'border-red-400 bg-red-50 text-red-700'
                                : 'border-border bg-white',
                            )}
                          />
                        )}
                      </td>

                      {/* Live SIWES total */}
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {liveTotal !== null ? (
                          <span className="font-bold text-primary-700">
                            {liveTotal}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {locked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Scored
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'text-xs font-medium px-2.5 py-0.5 rounded-full',
                              liveTotal !== null
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-slate-400 bg-slate-50',
                            )}
                          >
                            {liveTotal !== null ? 'Ready' : 'Pending'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-slate-50">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{filledCount}</span> of{' '}
              <span className="font-semibold text-slate-700">{editableCount}</span> pending students filled
              {rows.filter((r) => r.isAlreadySubmitted).length > 0 &&
                ` · ${rows.filter((r) => r.isAlreadySubmitted).length} already scored (locked)`}
            </p>
            <Button
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              loading={mutation.isPending}
              onClick={handleSubmit}
              disabled={filledCount === 0}
            >
              Submit All
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
