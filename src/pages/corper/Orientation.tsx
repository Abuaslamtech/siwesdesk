import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudents } from '../../api/students.api';
import {
  getOrientationStatus,
  markAllAttended,
  markSelected,
} from '../../api/orientation.api';
import { StudentWithStatus } from '../../types';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/cn';
import { useActiveSession } from '../../hooks/useActiveSession';

type BulkPreview = {
  found: {
    studentId: string;
    matricNo: string;
    name: string;
    department: string | null;
  }[];
  notFound: string[];
};

export default function Orientation() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'marked' | 'absent'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<BulkPreview | null>(null);
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

  const filtered = students.filter((s) => {
    if (statusFilter === 'marked' && !markedMap[s.id]) return false;
    if (statusFilter === 'absent' && markedMap[s.id]) return false;
    if (!debouncedSearch) return true;
    return (
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.matricNo.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  });

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

  const parseMatricNos = () =>
    Array.from(
      new Set(
        bulkText
      .split(/[\n,;\t]+/)
      .map((value) => value.trim().toUpperCase())
          .filter(Boolean),
      ),
    );

  const buildBulkPreview = (matricNos: string[]): BulkPreview => {
    const studentMap = new Map(
      students.map((student) => [student.matricNo.trim().toUpperCase(), student]),
    );

    const found: BulkPreview['found'] = [];
    const notFound: string[] = [];

    for (const matricNo of matricNos) {
      const student = studentMap.get(matricNo);
      if (!student) {
        notFound.push(matricNo);
        continue;
      }

      found.push({
        studentId: student.id,
        matricNo: student.matricNo,
        name: student.name,
        department: student.department ?? null,
      });
    }

    return { found, notFound };
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

  const markBulkMutation = useMutation({
    mutationFn: (studentIds: string[]) => markSelected(studentIds),
    onSuccess: ({ marked }) => {
      const notFoundCount = bulkPreview?.notFound.length ?? 0;
      toast.success(
        `${marked} student${marked !== 1 ? 's' : ''} marked${
          notFoundCount > 0 ? `, ${notFoundCount} not found` : ''
        }`,
      );
      setBulkOpen(false);
      setBulkText('');
      setBulkPreview(null);
      qc.invalidateQueries({ queryKey: ['orientation'] });
    },
    onError: () => toast.error('Failed to mark by matric list'),
  });

  const handlePreviewBulk = () => {
    const matricNos = parseMatricNos();
    if (matricNos.length === 0) {
      toast.error('Paste at least one matric number');
      return;
    }

    const preview = buildBulkPreview(matricNos);
    setBulkPreview(preview);

    if (preview.found.length === 0) {
      toast.error('No matching matric numbers found');
      return;
    }

    toast.success(
      `${preview.found.length} matched${
        preview.notFound.length > 0 ? `, ${preview.notFound.length} not found` : ''
      }`,
    );
  };

  const handleMarkBulk = () => {
    const matricNos = parseMatricNos();
    if (matricNos.length === 0) {
      toast.error('Paste at least one matric number');
      return;
    }

    const preview = bulkPreview ?? buildBulkPreview(matricNos);
    setBulkPreview(preview);

    if (preview.found.length === 0) {
      toast.error('No matching matric numbers found');
      return;
    }

    markBulkMutation.mutate(preview.found.map((student) => student.studentId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Orientation"
        subtitle={`${markedCount} of ${students.length} students marked as attended`}
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setBulkOpen(true)}
            >
              Mark by Matric List
            </Button>
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
        <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
          <div className="min-w-[120px]">
            <p className="text-xs text-slate-500">Marked Attended</p>
            <p className="text-3xl font-heading font-bold text-primary-700">{markedCount}</p>
          </div>
          <div className="min-w-[120px]">
            <p className="text-xs text-slate-500">Total Students</p>
            <p className="text-3xl font-heading font-bold text-slate-700">{students.length}</p>
          </div>
          <div className="min-w-[120px]">
            <p className="text-xs text-slate-500">Absent / Untracked</p>
            <p className="text-3xl font-heading font-bold text-amber-600">{students.length - markedCount}</p>
          </div>
          {allMarked && students.length > 0 && (
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <Badge variant="success" size="md" dot>All students attended</Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Student list */}
      <div className="bg-white rounded-lg border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="flex flex-1 items-center gap-2 min-w-[200px] border-r border-border pr-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student…"
              className="flex-1 w-full text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 min-w-0 bg-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'marked' | 'absent')}
            className="h-8 rounded-md border border-border bg-slate-50 text-xs px-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-700/30 font-medium text-slate-700"
          >
            <option value="all">All Status</option>
            <option value="marked">Attended</option>
            <option value="absent">Absent</option>
          </select>
          {filtered.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer shrink-0 ml-auto">
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

      <Modal
        isOpen={bulkOpen}
        onClose={() => {
          setBulkOpen(false);
          setBulkText('');
          setBulkPreview(null);
        }}
        title="Mark by Matric Numbers"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setBulkOpen(false);
                setBulkText('');
                setBulkPreview(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePreviewBulk}
            >
              Preview Matches
            </Button>
            <Button
              size="sm"
              loading={markBulkMutation.isPending}
              onClick={handleMarkBulk}
            >
              Mark Matric List
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Matric Numbers
            </label>
            <textarea
              value={bulkText}
              onChange={(event) => {
                setBulkText(event.target.value);
                setBulkPreview(null);
              }}
              placeholder="Paste matric numbers separated by new lines or commas"
              className="min-h-40 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700"
            />
            <p className="text-xs text-slate-500">
              Use this when attendance was taken on paper and ticking one by one is too slow.
            </p>
          </div>

          {bulkPreview && (
            <div className="space-y-3 rounded-lg border border-border bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded bg-green-50 p-3">
                  <p className="text-lg font-bold text-green-700">
                    {bulkPreview.found.length}
                  </p>
                  <p className="text-xs text-slate-500">Matched</p>
                </div>
                <div className="rounded bg-amber-50 p-3">
                  <p className="text-lg font-bold text-amber-700">
                    {bulkPreview.notFound.length}
                  </p>
                  <p className="text-xs text-slate-500">Not Found</p>
                </div>
              </div>

              {bulkPreview.found.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Matched Students
                  </p>
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-border bg-white p-2">
                    {bulkPreview.found.map((student) => (
                      <div
                        key={student.matricNo}
                        className="flex items-center justify-between gap-3 rounded px-2 py-1.5 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {student.name}
                          </p>
                          <p className="font-mono text-xs text-slate-400">
                            {student.matricNo}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-500">
                          {student.department || 'No department'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bulkPreview.notFound.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Not Found
                  </p>
                  <div className="rounded border border-amber-200 bg-amber-50 p-2">
                    <p className="text-xs text-amber-800">
                      {bulkPreview.notFound.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
