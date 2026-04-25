import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { getStudentsForSupervisor } from '../../api/assignments.api';
import { useAuthStore } from '../../store/auth.store';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import { useActiveSession } from '../../hooks/useActiveSession';

export default function SupervisorDashboard() {
  const { user } = useAuthStore();
  const { data: activeSession } = useActiveSession();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['supervisor-students', user?.id],
    queryFn: () => getStudentsForSupervisor(user!.id),
    enabled: !!user,
  });

  const total = students.length;
  const scored = students.filter((s) => s.status === 'completed').length;
  const partial = students.filter((s) => s.status === 'partially-scored').length;
  const pending = total - scored;
  const completionPct = total === 0 ? 0 : Math.round((scored / total) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Dashboard"
        subtitle={
          activeSession
            ? `SIWES ${activeSession.year} — ${user?.name}`
            : user?.name || 'Supervisor'
        }
        action={
          <div className="flex gap-2">
            <Link to="/supervisor/bulk-upload">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Bulk Upload
              </Button>
            </Link>
            <Link to="/supervisor/students">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Score Students
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="My Students"
          value={total}
          icon={<ClipboardList className="w-5 h-5" />}
          color="primary"
          loading={isLoading}
        />
        <StatCard
          title="Scored"
          value={scored}
          subtitle={partial > 0 ? `+${partial} partial` : undefined}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={<Clock className="w-5 h-5" />}
          color={pending > 0 ? 'red' : 'green'}
          loading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Progress */}
      {!isLoading && total > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Scoring Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">{scored} of {total} students fully scored</p>
            </div>
            <span className="text-2xl font-heading font-bold text-primary-700">{completionPct}%</span>
          </div>
          <ProgressBar value={completionPct} size="md" color={completionPct === 100 ? 'green' : 'primary'} />
        </Card>
      )}

      {/* Recent students card */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">My Students (Recent 8)</h3>
          <Link to="/supervisor/students" className="text-xs text-primary-700 hover:underline font-medium">
            View All →
          </Link>
        </div>
        {isLoading ? (
          <div className="divide-y divide-border">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-4 skeleton rounded flex-1" />
                <div className="h-5 skeleton rounded w-16" />
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title="No students assigned"
            description="Contact the director to assign students to you."
          />
        ) : (
          <div className="divide-y divide-border">
            {students.slice(0, 8).map((s) => (
              <Link
                key={s.id}
                to={`/supervisor/students/${s.id}/score`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-primary-700 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">
                    <span className="font-mono">{s.matricNo}</span> · {s.course}
                  </p>
                </div>
                <Badge
                  variant={
                    s.status === 'completed' ? 'success' :
                    s.status === 'partially-scored' ? 'warning' : 'neutral'
                  }
                >
                  {s.status === 'completed' ? 'Scored' : s.status === 'partially-scored' ? 'Partial' : 'Pending'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
