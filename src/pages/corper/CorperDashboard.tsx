import { useQuery } from '@tanstack/react-query';
import { GraduationCap, ClipboardCheck, FileBarChart2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProgress } from '../../api/reports.api';
import { getStudents } from '../../api/students.api';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import { useActiveSession } from '../../hooks/useActiveSession';

export default function CorperDashboard() {
  const { data: activeSession } = useActiveSession();
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['progress', activeSession?.id],
    queryFn: () => getProgress(activeSession?.id),
    enabled: !!activeSession,
  });

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students', activeSession?.id, {}],
    queryFn: () => getStudents(activeSession!.id),
    enabled: !!activeSession,
  });

  const byDept = Object.values(
    students.reduce<Record<string, { dept: string; count: number; scored: number }>>(
      (acc, student) => {
        const dept =
          student.department?.trim() ||
          student.course?.trim() ||
          'Unspecified';

        if (!acc[dept]) {
          acc[dept] = { dept, count: 0, scored: 0 };
        }

        acc[dept].count += 1;
        if (student.status === 'completed') {
          acc[dept].scored += 1;
        }

        return acc;
      },
      {},
    ),
  ).sort((a, b) => a.dept.localeCompare(b.dept));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Corper / Secretary Dashboard"
        subtitle={activeSession ? `SIWES ${activeSession.year} — Student Management` : 'No active session'}
        action={
          <div className="flex gap-2">
            <Link to="/corper/students">
              <Button variant="secondary" size="sm">Upload Students</Button>
            </Link>
            <Link to="/corper/reports">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Reports</Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={progress?.totalStudents ?? '—'}
          icon={<GraduationCap className="w-5 h-5" />}
          color="primary"
          loading={loadingProgress}
        />
        <StatCard
          title="Orientation Marked"
          value={progress?.orientationMarked ?? '—'}
          subtitle={`of ${progress?.totalStudents ?? 0} students`}
          icon={<ClipboardCheck className="w-5 h-5" />}
          color="green"
          loading={loadingProgress}
        />
        <StatCard
          title="Fully Scored"
          value={progress?.fullyScored ?? '—'}
          icon={<FileBarChart2 className="w-5 h-5" />}
          color="gold"
          loading={loadingProgress}
        />
        <StatCard
          title="Pending"
          value={progress?.pending ?? '—'}
          icon={<Clock className="w-5 h-5" />}
          color={progress && progress.pending > 0 ? 'red' : 'green'}
          loading={loadingProgress}
        />
      </div>

      {/* Progress Bar */}
      {progress && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Assessment Completion</h3>
              <p className="text-xs text-slate-500 mt-0.5">{progress.fullyScored} of {progress.totalStudents} fully scored</p>
            </div>
            <span className="text-2xl font-heading font-bold text-primary-700">{progress.completionPercentage}%</span>
          </div>
          <ProgressBar value={progress.completionPercentage} size="md" showLabel={false} />
        </Card>
      )}

      {/* By Department */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Students by Department</h3>
          <Link to="/corper/students" className="text-xs text-primary-700 hover:underline font-medium">
            View All →
          </Link>
        </div>
        {loadingStudents ? (
          <div className="divide-y divide-border">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-4 skeleton rounded flex-1" />
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            No students uploaded yet. <Link to="/corper/students" className="text-primary-700 underline">Upload now</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {byDept.map(({ dept, count, scored }) => {
              const pct = count === 0 ? 0 : Math.round((scored / count) * 100);
              return (
                <Link
                  key={dept}
                  to={`/corper/students?dept=${encodeURIComponent(dept)}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-primary-700 truncate">{dept}</p>
                    <p className="text-xs text-slate-400">{count} students</p>
                  </div>
                  <ProgressBar value={pct} size="sm" showLabel className="w-32 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
