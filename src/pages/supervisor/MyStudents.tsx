import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, BookUser, ArrowRight } from 'lucide-react';
import { getStudentsForSupervisor } from '../../api/assignments.api';
import { useAuthStore } from '../../store/auth.store';
import { StudentWithStatus } from '../../types';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/cn';

const STATUS_META: Record<StudentWithStatus['status'], { label: string; color: string }> = {
  completed:          { label: 'Fully Scored', color: 'text-green-600 bg-green-50' },
  'partially-scored': { label: 'Partial',      color: 'text-amber-600 bg-amber-50' },
  assigned:           { label: 'Pending',       color: 'text-slate-500 bg-slate-50' },
  unassigned:         { label: 'Unassigned',    color: 'text-slate-400 bg-slate-50' },
};

export default function MyStudents() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'' | 'pending' | 'completed'>('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['supervisor-students', user?.id],
    queryFn: () => getStudentsForSupervisor(user!.id),
    enabled: !!user,
  });

  const filtered = students.filter((s) => {
    const lq = debouncedSearch.toLowerCase();
    const matchSearch =
      !lq ||
      s.name.toLowerCase().includes(lq) ||
      s.matricNo.toLowerCase().includes(lq) ||
      (s.course?.toLowerCase().includes(lq) ?? false) ||
      (s.faculty?.toLowerCase().includes(lq) ?? false);
    const matchFilter =
      !filter ||
      (filter === 'completed' && s.status === 'completed') ||
      (filter === 'pending' && (s.status === 'assigned' || s.status === 'partially-scored'));
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="My Students"
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''} assigned`}
        action={
          <Link to="/supervisor/bulk-upload" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors">
            Bulk Upload
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student…"
            className="w-full h-9 pl-8 pr-3 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700"
          />
        </div>
        {(['', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'h-9 px-3 rounded-md text-sm font-medium border transition-colors',
              filter === f
                ? 'bg-primary-700 text-white border-primary-700'
                : 'bg-white text-slate-600 border-border hover:border-primary-400',
            )}
          >
            {f === '' ? 'All' : f === 'pending' ? 'Pending' : 'Scored'}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 skeleton rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookUser className="w-6 h-6" />}
          title="No students found"
          description="No students match your current filter."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const meta = STATUS_META[s.status];
            const score = s.score;
            return (
              <Link
                key={s.id}
                to={`/supervisor/students/${s.id}/score`}
                className="group flex items-center gap-4 bg-white rounded-lg border border-border px-4 py-3.5 hover:shadow-md hover:border-primary-300 transition-all"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold font-heading flex items-center justify-center shrink-0 text-sm">
                  {s.surname.charAt(0)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary-700">
                    {s.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="font-mono">{s.matricNo}</span> · {s.course} · Lvl {s.level}
                  </p>
                </div>
                {/* Score summary */}
                {score && (
                  <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 shrink-0">
                    <div className="text-center">
                      <p className="font-semibold text-slate-700">{score.orientation ?? '—'}</p>
                      <p>Orient</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-700">{score.supervisorScore ?? '—'}</p>
                      <p>Sup</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-700">{score.industryScore ?? '—'}</p>
                      <p>Ind</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-primary-700 text-sm">{score.siewesFinal ?? '—'}</p>
                      <p>/50</p>
                    </div>
                  </div>
                )}
                {/* Status */}
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full shrink-0', meta.color)}>
                  {meta.label}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
