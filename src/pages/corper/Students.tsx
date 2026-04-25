import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, Upload, GraduationCap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStudents, uploadStudents, getFaculties, getCourses, getStates } from '../../api/students.api';
import { parseStudentFile } from '../../utils/parseStudentFile';
import { StudentWithStatus } from '../../types';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Table, { Column } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import FileUploader from '../../components/shared/FileUploader';
import Spinner from '../../components/ui/Spinner';
import { useDebounce } from '../../hooks/useDebounce';
import { useActiveSession } from '../../hooks/useActiveSession';

const STATUS_BADGE: Record<StudentWithStatus['status'], { label: string; variant: 'success' | 'assigned' | 'warning' | 'neutral' }> = {
  completed:         { label: 'Scored',             variant: 'success' },
  assigned:          { label: 'Assigned',           variant: 'assigned' },
  'partially-scored': { label: 'Partial',          variant: 'warning' },
  unassigned:        { label: 'Unassigned',         variant: 'neutral' },
};

export default function Students() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<Awaited<ReturnType<typeof parseStudentFile>> | null>(null);
  const [parsing, setParsing] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { data: activeSession, isLoading: loadingSession } = useActiveSession();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', activeSession?.id, { faculty: facultyFilter, course: courseFilter, state: stateFilter, status: statusFilter, search: debouncedSearch }],
    queryFn: () => getStudents(activeSession!.id, {
      faculty: facultyFilter || undefined,
      course: courseFilter || undefined,
      state: stateFilter || undefined,
      status: statusFilter || undefined,
      search: debouncedSearch || undefined,
    }),
    enabled: !!activeSession,
  });

  const { data: faculties = [] } = useQuery({ queryKey: ['faculties'], queryFn: getFaculties });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: getCourses });
  const { data: states = [] } = useQuery({ queryKey: ['states'], queryFn: getStates });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!parseResult || !activeSession) throw new Error('No file parsed');
      return uploadStudents(activeSession.id, parseResult.rows);
    },
    onSuccess: ({ uploaded, skipped }) => {
      const msg = skipped > 0
        ? `${uploaded} uploaded, ${skipped} skipped (errors or duplicates)`
        : `${uploaded} students uploaded successfully`;
      toast.success(msg, { duration: 5000 });
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['faculties'] });
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['states'] });
      setUploadOpen(false);
      setSelectedFile(null);
      setParseResult(null);
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  });

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setParsing(true);
    try {
      const result = await parseStudentFile(file);
      setParseResult(result);
    } catch (err) {
      toast.error(`Failed to parse file: ${(err as Error).message}`);
      setParseResult(null);
    } finally {
      setParsing(false);
    }
  };

  const columns: Column<StudentWithStatus>[] = [
    { key: 'matricNo', header: 'Matric No',
      render: (s) => <span className="font-mono text-xs text-slate-600">{s.matricNo}</span>
    },
    { key: 'name', header: 'Name',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-800 text-sm">{s.name}</p>
          <p className="text-xs text-slate-400">
            {s.course} {s.faculty ? `(${s.faculty})` : ''} · Lvl {s.level}
            {s.phone && <span className="text-primary-600 font-medium ml-1">· {s.phone}</span>}
          </p>
        </div>
      )
    },
    { key: 'state', header: 'SIWES State', render: (s) => s.state },
    { key: 'industry', header: 'Placement',
      render: (s) => s.industry ? (
        <div className="max-w-[200px]">
          <p className="text-xs text-slate-700 truncate font-medium">{s.industry}</p>
          {s.location && <p className="text-xs text-slate-400">{s.location}, {s.state}</p>}
          {s.address && (
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight" title={s.address}>
              {s.address}
            </p>
          )}
        </div>
      ) : <span className="text-slate-300 text-xs">—</span>
    },
    { key: 'status', header: 'Status', align: 'center',
      render: (s) => {
        const b = STATUS_BADGE[s.status];
        return <Badge variant={b.variant}>{b.label}</Badge>;
      }
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Students"
        subtitle={
          activeSession
            ? `${students.length} student${students.length !== 1 ? 's' : ''} in SIWES ${activeSession.year}`
            : 'No active session'
        }
        action={
          <Button leftIcon={<Upload className="w-4 h-4" />} onClick={() => setUploadOpen(true)}>
            Upload List
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or matric…"
            className="w-full h-9 pl-8 pr-3 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700"
          />
        </div>
        {[
          { label: 'Faculty', val: facultyFilter, set: setFacultyFilter, opts: faculties },
          { label: 'Program', val: courseFilter, set: setCourseFilter, opts: courses },
          { label: 'SIWES State', val: stateFilter, set: setStateFilter, opts: states },
        ].map(({ label, val, set, opts }) => (
          <select
            key={label}
            value={val}
            onChange={(e) => set(e.target.value)}
            className="h-9 rounded-md border border-border bg-white text-sm px-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-700/30 min-w-[100px]"
          >
            <option value="">All {label === 'SIWES State' ? 'States' : label + 's'}</option>
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-white text-sm px-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-700/30 min-w-[110px]"
        >
          <option value="">All Status</option>
          <option value="unassigned">Unassigned</option>
          <option value="assigned">Assigned</option>
          <option value="partially-scored">Partial</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={students}
        loading={isLoading || loadingSession}
        keyExtractor={(s) => s.id}
        emptyState={
          <EmptyState
            icon={<GraduationCap className="w-6 h-6" />}
            title="No students found"
            description="Upload a student list or adjust your filters."
            action={{ label: 'Upload Students', onClick: () => setUploadOpen(true) }}
          />
        }
      />

      {/* Upload modal */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => { setUploadOpen(false); setSelectedFile(null); setParseResult(null); }}
        title="Upload Student List"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => { setUploadOpen(false); setSelectedFile(null); setParseResult(null); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={uploadMutation.isPending}
              disabled={!activeSession || !parseResult || parseResult.validRows === 0}
              onClick={() => uploadMutation.mutate()}
            >
              Upload {parseResult ? `${parseResult.validRows} Students` : ''}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FileUploader onFile={handleFile} />

          {parsing && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Spinner size="sm" />
              <span className="text-sm text-slate-500">Parsing file…</span>
            </div>
          )}

          {parseResult && !parsing && (
            <div className="rounded-lg border border-border p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Parse Summary</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-slate-50 p-2">
                  <p className="text-lg font-bold text-slate-800">{parseResult.totalRows}</p>
                  <p className="text-xs text-slate-500">Total rows</p>
                </div>
                <div className="rounded bg-green-50 p-2">
                  <p className="text-lg font-bold text-green-700">{parseResult.validRows}</p>
                  <p className="text-xs text-slate-500">Valid</p>
                </div>
                <div className="rounded bg-red-50 p-2">
                  <p className="text-lg font-bold text-red-600">{parseResult.totalRows - parseResult.validRows}</p>
                  <p className="text-xs text-slate-500">Errors</p>
                </div>
              </div>
              {parseResult.columnErrors.length > 0 && (
                <div className="text-xs text-red-600 bg-red-50 rounded p-2 space-y-0.5">
                  {parseResult.columnErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
          )}

          {!activeSession && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-sm text-red-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>
                <strong>No Active Session:</strong> You must create and activate a session (e.g., 2025/2026) in the Sessions tab before you can upload students.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
