import { useQuery, useMutation } from '@tanstack/react-query';
import { FileDown, FileSpreadsheet, BarChart3, Users, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProgress,
  downloadInternalReport,
  downloadExternalReport,
  downloadMasterList,
  downloadSupervisorScores,
} from '../../api/reports.api';
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

  const masterListMutation = useMutation({
    mutationFn: () => downloadMasterList(activeSession?.id),
    onSuccess: () => toast.success('Master list downloaded successfully'),
    onError: () => toast.error('Failed to download master list'),
  });

  const supervisorScoresMutation = useMutation({
    mutationFn: () => downloadSupervisorScores(activeSession?.id),
    onSuccess: () => toast.success('Supervisor scores report downloaded'),
    onError: () => toast.error('Failed to download supervisor scores'),
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
        title="Reports & Exports"
        subtitle={activeSession ? `SIWES ${activeSession.year} — Official registers and assessment data` : 'No active session'}
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

      {/* Downloads Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Master List Card */}
        <Card className="flex flex-col justify-between gap-4 border-l-4 border-l-primary-600">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary-50">
                <Users className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">SIWES Master List</h3>
                <p className="text-xs text-slate-500">Official student register formatted for long-term archive</p>
              </div>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>All uploaded students with matric, name, level, course & faculty</li>
              <li>Contacts, phone, WhatsApp & email</li>
              <li>SIWES placement establishment, address, LGA & state</li>
              <li>Industry supervisor name, phone & SIWES duration</li>
              <li>ITF stipend allowance bank name, account number & sort code</li>
              <li>Assigned institutional supervisor status</li>
            </ul>
          </div>
          <Button
            variant="primary"
            leftIcon={<FileDown className="w-4 h-4" />}
            loading={masterListMutation.isPending}
            onClick={() => masterListMutation.mutate()}
          >
            Download Master List (.xlsx)
          </Button>
        </Card>

        {/* Supervisor Uploaded Scores Card */}
        <Card className="flex flex-col justify-between gap-4 border-l-4 border-l-green-600">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50">
                <ClipboardCheck className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Supervisor Uploaded Scores</h3>
                <p className="text-xs text-slate-500">Comprehensive score audit as submitted by supervisors</p>
              </div>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>Scores grouped by supervisor with supervisor email</li>
              <li>Orientation (/10), Supervisor (/40) and Industry (/50) breakdown</li>
              <li>Total (/100) and Final SIWES Grade (/50)</li>
              <li>Status (Completed, Draft, Pending) and submission timestamps</li>
              <li>Includes dedicated "Supervisor Summary" sheet with completion rates</li>
            </ul>
          </div>
          <Button
            variant="secondary"
            leftIcon={<FileDown className="w-4 h-4" />}
            loading={supervisorScoresMutation.isPending}
            onClick={() => supervisorScoresMutation.mutate()}
          >
            Download Supervisor Scores (.xlsx)
          </Button>
        </Card>

        {/* Internal Report Card */}
        <Card className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100">
                <BarChart3 className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Internal Assessment Report</h3>
                <p className="text-xs text-slate-500">Full internal report combining grading, placement & supervisor data</p>
              </div>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>All students across all departments in the active session</li>
              <li>Complete scoring breakdown + placement details</li>
              <li>Full contact and ITF allowance information</li>
            </ul>
          </div>
          <Button
            variant="secondary"
            leftIcon={<FileDown className="w-4 h-4" />}
            loading={internalMutation.isPending}
            onClick={() => internalMutation.mutate()}
          >
            Download Internal Report (.xlsx)
          </Button>
        </Card>

        {/* External Report Card */}
        <Card className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gold-50">
                <FileSpreadsheet className="w-5 h-5 text-gold-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">External Registry Report</h3>
                <p className="text-xs text-slate-500">One sheet per department / program for Senate & Exams/Records</p>
              </div>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>Grouped by department / programme (one tab per department)</li>
              <li>Matric No, Student Name, Final SIWES Score / 50</li>
              <li>Official submission format for exams & records</li>
            </ul>
            {progress && progress.fullyScored === 0 && (
              <p className="text-xs text-amber-600">No completed scores yet — report will be empty.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              leftIcon={<FileDown className="w-4 h-4" />}
              loading={externalMutation.isPending}
              onClick={() => externalMutation.mutate()}
            >
              Download External Report (.xlsx)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileDown className="w-3.5 h-3.5" />}
              loading={externalInclusiveMutation.isPending}
              onClick={() => externalInclusiveMutation.mutate()}
            >
              Export Including Incomplete
            </Button>
          </div>
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
