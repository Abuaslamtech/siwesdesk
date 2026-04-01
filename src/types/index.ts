// ─── Primitives ─────────────────────────────────────────────────────────────

export type Role = 'director' | 'corper' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  year: number;
  isActive: boolean;
  createdAt: string;
  studentCount?: number;
  scoredCount?: number;
}

// ─── Student ─────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  sessionId: string;
  matricNo: string;
  surname: string;
  otherNames: string;
  name: string;          // = surname + ' ' + otherNames (display name)
  department?: string | null;
  faculty?: string | null;
  course: string | null;
  level: string;
  state: string;
  lga?: string | null;
  industry: string | null;      // placement company / organisation
  location: string | null;      // city / town of placement
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  createdAt: string;
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export interface Assignment {
  id: string;
  studentId: string;
  supervisorId: string;
  assignedAt: string;
  student?: Student;
  supervisor?: User;
}

// ─── Score ───────────────────────────────────────────────────────────────────

export interface Score {
  id: string;
  studentId: string;
  orientation: number | null;       // 0 or 10
  supervisorScore: number | null;   // 0–40
  industryScore: number | null;     // 0–50
  enteredById: string | null;
  submittedAt: string;
  updatedAt: string;
  isDraft: boolean;
  // computed
  total?: number;          // orientation + supervisorScore + industryScore (/ 100)
  siewesFinal?: number;    // total / 2 (/ 50)
  isComplete?: boolean;
}

// ─── Aggregates ──────────────────────────────────────────────────────────────

export type StudentStatus =
  | 'unassigned'
  | 'assigned'
  | 'partially-scored'
  | 'completed';

export interface StudentWithStatus extends Student {
  assignment?: Assignment;
  score?: Score;
  status: StudentStatus;
}

export interface SupervisorProgress {
  supervisor: User;
  total: number;
  scored: number;
  pending: number;
}

export interface ProgressStats {
  totalStudents: number;
  assigned: number;
  unassigned: number;
  orientationMarked: number;
  fullyScored: number;
  pending: number;
  completionPercentage: number;
  perSupervisor: SupervisorProgress[];
}

// ─── API wrappers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Form shapes ─────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateSupervisorForm {
  name: string;
  email: string;
  password: string;
}

export interface ScoreForm {
  supervisorScore: number | '';
  industryScore: number | '';
}

export interface SessionForm {
  year: number | '';
}

// ─── Upload / parsed row ─────────────────────────────────────────────────────

export interface ParsedStudentRow {
  matricNo: string;
  surname: string;
  otherNames: string;
  department?: string;
  faculty?: string;
  course: string;
  level: string;
  state: string;
  lga: string;
  email?: string;
  phone?: string;
  gender?: string;
  industry?: string;
  location?: string;
  _rowIndex: number;
  _errors: string[];
}
