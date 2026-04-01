import { useQuery, useMutation } from '@tanstack/react-query';
import { FileDown, FileSpreadsheet, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProgress, downloadInternalReport, downloadExternalReport } from '../../api/reports.api';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import { useActiveSession } from '../../hooks/useActiveSession';

export default function Reports() {
  const { data: activeSession } = useActiveSession();
  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress', activeSession?.id],
    queryFn: () => getProgress(activeSession?.id),
    enabled: !!activeSession,
  });

  const internalMutation = useMutation({
    mutationFn: () => downloadInternalReport(activeSession?.id),
    onSuccess: () => toast.success('Internal report downloaded'),
    onError: () => toast.error('Download failed'),
  });

  const externalMutation = useMutation({
    mutationFn: () => downloadExternalReport(false, activeSession?.id),
    onSuccess: () => toast.success('External report downloaded'),
    onError: () => toast.error('Download failed'),
  });

  const externalInclusiveMutation = useMutation({
    mutationFn: () => downloadExternalReport(true, activeSession?.id),
    onSuccess: () => toast.success('External report with incomplete rows downloaded'),
    onError: () => toast.error('Download failed'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle={activeSession ? `SIWES ${activeSession.year} — Export assessment data` : 'No active session'}
      />

      {/* Summary */}
      {isLoading ? (
        <div className="h-28 skeleton rounded-lg" />
      ) : progress && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-4">
            {[
              { label: 'Total Students', value: progress.totalStudents, cls: 'text-primary-700' },
              { label: 'Fully Scored',   value: progress.fullyScored,    cls: 'text-green-700' },
              { label: 'Pending',        value: progress.pending,         cls: progress.pending > 0 ? 'text-amber-600' : 'text-slate-400' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="text-center">
                <p className={`text-3xl font-heading font-bold ${cls}`}>{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-slate-500">Assessment Completion</span>
              <span className="text-xs font-semibold text-primary-700">{progress.completionPercentage}%</span>
            </div>
            <ProgressBar value={progress.completionPercentage} size="md" />
          </div>
        </Card>
      )}

      {/* Downloads */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary-50">
              <BarChart3 className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Internal Report</h3>
              <p className="text-xs text-slate-500">Full breakdown: scores, supervisor, placement</p>
            </div>
          </div>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
            <li>All students in session</li>
            <li>Orientation, supervisor score, industry score</li>
            <li>Total / 100 and SIWES final / 50</li>
            <li>Assignment and status information</li>
          </ul>
          <Button
            variant="secondary"
            leftIcon={<FileDown className="w-4 h-4" />}
            loading={internalMutation.isPending}
            onClick={() => internalMutation.mutate()}
          >
            Download Internal Report (.xlsx)
          </Button>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-50">
              <FileSpreadsheet className="w-5 h-5 text-gold-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">External Report</h3>
              <p className="text-xs text-slate-500">One sheet per department / program — SIWES scores only</p>
            </div>
          </div>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
            <li>Only fully-scored students</li>
            <li>Grouped by department / program (one sheet each)</li>
            <li>Matric No, Name, SIWES Score / 50</li>
            <li>Suitable for submission to the registry</li>
          </ul>
          {progress && progress.fullyScored === 0 && (
            <p className="text-xs text-amber-600">No completed scores yet — report will be empty.</p>
          )}
          <Button
            variant="primary"
            leftIcon={<FileDown className="w-4 h-4" />}
            loading={externalMutation.isPending}
            onClick={() => externalMutation.mutate()}
          >
            Download External Report (.xlsx)
          </Button>
          <Button
            variant="secondary"
            leftIcon={<FileDown className="w-4 h-4" />}
            loading={externalInclusiveMutation.isPending}
            onClick={() => externalInclusiveMutation.mutate()}
          >
            Export Including Incomplete
          </Button>
        </Card>
      </div>

      {/* Per-supervisor breakdown */}
      {progress && progress.perSupervisor.length > 0 && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-slate-800">Supervisor Completion</h3>
          </div>
          <div className="divide-y divide-border">
            {progress.perSupervisor.map((row) => {
              const pct = row.total > 0 ? Math.round((row.scored / row.total) * 100) : 0;
              return (
                <div key={row.supervisor.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{row.supervisor.name}</p>
                    <p className="text-xs text-slate-400">{row.scored}/{row.total} scored</p>
                  </div>
                  <div className="w-36 shrink-0">
                    <ProgressBar value={pct} size="sm" showLabel />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
