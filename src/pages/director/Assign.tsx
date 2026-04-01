import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import { getSupervisors } from "../../api/users.api";
import { bulkAssign, getAssignmentStats } from "../../api/assignments.api";
import {
  getStudents,
  getFaculties,
  getCourses,
  getStates,
} from "../../api/students.api";
import { StudentWithStatus } from "../../types";
import PageHeader from "../../components/shared/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../utils/cn";
import { useActiveSession } from "../../hooks/useActiveSession";

const statusBadge = (s: StudentWithStatus) => {
  if (s.status === "completed")
    return (
      <Badge variant="success">
        {s.assignment?.supervisor?.name ?? "Assigned"}
      </Badge>
    );
  if (s.status === "partially-scored")
    return <Badge variant="warning">{s.assignment?.supervisor?.name}</Badge>;
  if (s.status === "assigned")
    return <Badge variant="assigned">{s.assignment?.supervisor?.name}</Badge>;
  return <Badge variant="neutral">Unassigned</Badge>;
};

export default function Assign() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(
    searchParams.get("supervisor") ?? "",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 300);
  const { data: activeSession } = useActiveSession();

  const { data: students = [], isLoading } = useQuery({
    queryKey: [
      "students",
      activeSession?.id,
      {
        faculty: facultyFilter,
        course: courseFilter,
        state: stateFilter,
        status: statusFilter,
        search: debouncedSearch,
      },
    ],
    queryFn: () =>
      getStudents(activeSession!.id, {
        faculty: facultyFilter || undefined,
        course: courseFilter || undefined,
        state: stateFilter || undefined,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
      }),
    enabled: !!activeSession,
  });

  const { data: supervisors = [] } = useQuery({
    queryKey: ["supervisors"],
    queryFn: getSupervisors,
  });
  const { data: stats = [] } = useQuery({
    queryKey: ["assignment-stats"],
    queryFn: getAssignmentStats,
  });
  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: getFaculties,
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: getStates,
  });

  const statMap = Object.fromEntries(
    stats.map((s) => [s.supervisorId, s.count]),
  );
  const allSelected =
    students.length > 0 && students.every((s) => selectedIds.has(s.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  const assignMutation = useMutation({
    mutationFn: () => bulkAssign([...selectedIds], selectedSupervisor),
    onSuccess: ({ assigned }) => {
      toast.success(`${assigned} student${assigned !== 1 ? "s" : ""} assigned`);
      setSelectedIds(new Set());
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["assignment-stats"] });
    },
    onError: () => toast.error("Assignment failed. Try again."),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Assign Students"
        subtitle="Select students and assign to a supervisor"
      />

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* ── Left: Student list ── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Filter bar */}
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
              {
                label: "Faculty",
                val: facultyFilter,
                set: setFacultyFilter,
                opts: faculties,
              },
              {
                label: "Program",
                val: courseFilter,
                set: setCourseFilter,
                opts: courses,
              },
              {
                label: "State",
                val: stateFilter,
                set: setStateFilter,
                opts: states,
              },
            ].map(({ label, val, set, opts }) => (
              <select
                key={label}
                value={val}
                onChange={(e) => set(e.target.value)}
                className="h-9 rounded-md border border-border bg-white text-sm px-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700 min-w-[100px]"
              >
                <option value="">All {label}s</option>
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
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
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Select all */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="select-all"
              checked={allSelected}
              onChange={toggleAll}
              className="rounded accent-primary-700 w-4 h-4"
            />
            <label
              htmlFor="select-all"
              className="text-xs font-medium text-slate-600 cursor-pointer"
            >
              Select all ({students.length} filtered)
            </label>
            {selectedIds.size > 0 && (
              <span className="ml-auto text-xs font-semibold text-primary-700">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          {/* List */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : students.length === 0 ? (
              <EmptyState
                icon={<Users className="w-6 h-6" />}
                title="No students found"
                description="Try adjusting your filters or upload a student list first."
              />
            ) : (
              <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                {students.map((s) => (
                  <label
                    key={s.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                      selectedIds.has(s.id)
                        ? "bg-primary-50"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="mt-0.5 rounded accent-primary-700 w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800">
                          {s.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {s.matricNo}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                        <span>{s.course}</span>·<span>{s.state}</span>
                      </div>
                    </div>
                    <div className="shrink-0">{statusBadge(s)}</div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Assign panel ── */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-lg border border-border p-5 space-y-4 sticky top-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Assign to Supervisor
            </h3>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Selected students</p>
              <p className="text-2xl font-heading font-bold text-primary-700">
                {selectedIds.size}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Supervisor
              </label>
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700"
              >
                <option value="">Select supervisor…</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({statMap[sup.id] ?? 0} assigned)
                  </option>
                ))}
              </select>
            </div>
            <Button
              fullWidth
              loading={assignMutation.isPending}
              disabled={selectedIds.size === 0 || !selectedSupervisor}
              onClick={() => assignMutation.mutate()}
            >
              Assign {selectedIds.size > 0 ? selectedIds.size : ""} Student
              {selectedIds.size !== 1 ? "s" : ""}
            </Button>
            {selectedIds.size > 0 && !selectedSupervisor && (
              <p className="text-xs text-amber-600 text-center">
                Select a supervisor first
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
