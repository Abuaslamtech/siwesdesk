import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, ClipboardList, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProgress } from '../../api/reports.api';
import { getSupervisors } from '../../api/users.api';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import { useActiveSession } from '../../hooks/useActiveSession';

export default function DirectorDashboard() {
  const { data: activeSession } = useActiveSession();
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['progress', activeSession?.id],
    queryFn: () => getProgress(activeSession?.id),
    enabled: !!activeSession,
  });

  const { data: supervisors, isLoading: loadingSups } = useQuery({
    queryKey: ['supervisors'],
    queryFn: getSupervisors,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Director Dashboard"
        subtitle={activeSession ? `SIWES ${activeSession.year} — Overview` : 'No active session'}
        action={
          <Link to="/director/assign">
            <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View Assignments
            </Button>
          </Link>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={progress?.totalStudents ?? '—'}
          icon={<Users className="w-5 h-5" />}
          color="primary"
          loading={loadingProgress}
        />
        <StatCard
          title="Assigned"
          value={progress?.assigned ?? '—'}
          subtitle={`${progress?.unassigned ?? 0} unassigned`}
          icon={<UserCheck className="w-5 h-5" />}
          color="green"
          loading={loadingProgress}
        />
        <StatCard
          title="Fully Scored"
          value={progress?.fullyScored ?? '—'}
          icon={<ClipboardList className="w-5 h-5" />}
          color="gold"
          loading={loadingProgress}
        />
        <StatCard
          title="Pending Scores"
          value={progress?.pending ?? '—'}
          icon={<Clock className="w-5 h-5" />}
          color={progress && progress.pending > 0 ? 'red' : 'green'}
          loading={loadingProgress}
        />
      </div>

      {/* Overall Progress */}
      {progress && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Overall Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {progress.fullyScored} of {progress.totalStudents} students fully scored
              </p>
            </div>
            <span className="text-2xl font-heading font-bold text-primary-700">
              {progress.completionPercentage}%
            </span>
          </div>
          <ProgressBar
            value={progress.completionPercentage}
            size="md"
            color={progress.completionPercentage === 100 ? 'green' : 'primary'}
            showLabel={false}
          />
        </Card>
      )}

      {/* Per-Supervisor Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            Supervisor Progress
          </h3>
          <Link
            to="/director/supervisors"
            className="text-xs text-primary-700 hover:underline font-medium"
          >
            Manage Supervisors →
          </Link>
        </div>
        {loadingProgress || loadingSups ? (
          <div className="divide-y divide-border">
            {[1,2,3,4].map((i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="h-4 skeleton rounded flex-1" />
                <div className="h-4 skeleton rounded w-20" />
                <div className="h-4 skeleton rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(progress?.perSupervisor ?? []).map((row) => {
              const pct = row.total === 0 ? 0 : Math.round((row.scored / row.total) * 100);
              return (
                <Link
                  to={`/director/assign?supervisor=${row.supervisor.id}`}
                  key={row.supervisor.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-primary-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-700">
                      {row.supervisor.name}
                    </p>
                    <p className="text-xs text-slate-400">{row.supervisor.email}</p>
                  </div>
                  <div className="text-xs text-slate-500 text-right w-28 flex-shrink-0 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Assigned</span><span className="font-medium text-slate-700">{row.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scored</span><span className="font-medium text-green-600">{row.scored}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span className={row.pending > 0 ? 'font-medium text-amber-600' : 'font-medium text-slate-400'}>
                        {row.pending}
                      </span>
                    </div>
                  </div>
                  <div className="w-28 flex-shrink-0">
                    <ProgressBar
                      value={pct}
                      size="sm"
                      color={pct === 100 ? 'green' : pct > 50 ? 'primary' : 'gold'}
                      showLabel
                    />
                  </div>
                </Link>
              );
            })}
            {(progress?.perSupervisor ?? []).length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400">No supervisors assigned yet.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
