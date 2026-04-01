import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudents } from '../../api/students.api';
import { markAllAttended, markSelected, getOrientationStatus } from '../../api/orientation.api';
import { StudentWithStatus } from '../../types';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/cn';
import { useActiveSession } from '../../hooks/useActiveSession';

export default function Orientation() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 300);
  const { data: activeSession, isLoading: loadingSession } = useActiveSession();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', activeSession?.id, {}],
    queryFn: () => getStudents(activeSession!.id),
    enabled: !!activeSession,
  });

  const { data: orientationRecs = [] } = useQuery({
    queryKey: ['orientation', activeSession?.id],
    queryFn: getOrientationStatus,
    enabled: !!activeSession,
  });

  // Build a map: studentId → marked (true/false)
  const markedMap = Object.fromEntries(
    orientationRecs.map((r) => [r.studentId, r.mark === 10]),
  );

  const allMarked = students.every((s) => markedMap[s.id]);
  const markedCount = students.filter((s) => markedMap[s.id]).length;

  const filtered = students.filter(
    (s) =>
      !debouncedSearch ||
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.matricNo.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };

  const markAllMutation = useMutation({
    mutationFn: () => markAllAttended(activeSession?.id || ''),
    onSuccess: ({ marked }) => {
      toast.success(`${marked} students marked as attended`);
      qc.invalidateQueries({ queryKey: ['orientation'] });
    },
    onError: () => toast.error('Failed to mark orientation'),
  });

  const markSelectedMutation = useMutation({
    mutationFn: () => markSelected([...selected]),
    onSuccess: ({ marked }) => {
      toast.success(`${marked} students marked`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['orientation'] });
    },
    onError: () => toast.error('Failed to mark orientation'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Orientation"
        subtitle={`${markedCount} of ${students.length} students marked as attended`}
        action={
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                loading={markSelectedMutation.isPending}
                onClick={() => markSelectedMutation.mutate()}
              >
                Mark {selected.size} Selected
              </Button>
            )}
            <Button
              size="sm"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              loading={markAllMutation.isPending}
              onClick={() => {
                if (confirm('Mark ALL students as orientation attended?')) {
                  markAllMutation.mutate();
                }
              }}
            >
              Mark All Attended
            </Button>
          </div>
        }
      />

      {/* Progress summary */}
      <Card>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-500">Marked Attended</p>
            <p className="text-3xl font-heading font-bold text-primary-700">{markedCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Students</p>
            <p className="text-3xl font-heading font-bold text-slate-700">{students.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Absent / Untracked</p>
            <p className="text-3xl font-heading font-bold text-amber-600">{students.length - markedCount}</p>
          </div>
          {allMarked && students.length > 0 && (
            <Badge variant="success" size="md" dot>All students attended</Badge>
          )}
        </div>
      </Card>

      {/* Student list */}
      <div className="bg-white rounded-lg border border-border">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student…"
            className="flex-1 text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
          {filtered.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded accent-primary-700"
              />
              Select all
            </label>
          )}
        </div>

        {isLoading || loadingSession ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-primary-200 border-t-primary-700 rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="w-6 h-6" />}
            title="No students found"
            description="Try adjusting your search."
          />
        ) : (
          <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
            {filtered.map((s) => {
              const isMarked = markedMap[s.id];
              const isSelected = selected.has(s.id);

              return (
                <label
                  key={s.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                    isSelected ? 'bg-primary-50' : isMarked ? 'bg-green-50/50' : 'hover:bg-slate-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(s.id)}
                    className="rounded accent-primary-700 w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.matricNo} · {s.department || s.course}</p>
                  </div>
                  {isMarked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Attended
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Absent</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
