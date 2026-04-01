import { Student, StudentWithStatus, ParsedStudentRow } from '../types';
import api, { unwrapData } from './axios';

export interface StudentFilters {
  faculty?: string;
  department?: string;
  course?: string;
  state?: string;
  industry?: string;
  status?: string;
  search?: string;
}

export async function getStudents(
  sessionId: string,
  filters: StudentFilters = {},
): Promise<StudentWithStatus[]> {
  return unwrapData(
    api.get('/api/students', {
      params: {
        sessionId,
        faculty: filters.faculty,
        department: filters.department,
        course: filters.course,
        state: filters.state,
        industry: filters.industry,
        status: filters.status,
        search: filters.search,
      },
    }),
  );
}

export async function getStudent(id: string): Promise<StudentWithStatus | null> {
  return unwrapData(api.get(`/api/students/${id}`));
}

export async function uploadStudents(
  _sessionId: string,
  rows: ParsedStudentRow[],
): Promise<{ uploaded: number; skipped: number }> {
  const students = rows
    .filter((row) => row._errors.length === 0)
    .map(({ _errors, _rowIndex, ...row }) => row);

  const response = await unwrapData<{ uploaded: number; skipped: number }>(
    api.post('/api/students/upload', { students }, { timeout: 180000 }),
  );

  return {
    uploaded: response.uploaded,
    skipped: response.skipped + rows.filter((row) => row._errors.length > 0).length,
  };
}

export async function getDepartments(): Promise<string[]> {
  return unwrapData(api.get('/api/students/departments'));
}

export async function getFaculties(): Promise<string[]> {
  return unwrapData(api.get('/api/students/faculties'));
}

export async function getCourses(): Promise<string[]> {
  return unwrapData(api.get('/api/students/courses'));
}

export async function getStates(): Promise<string[]> {
  return unwrapData(api.get('/api/students/states'));
}

export async function getIndustries(): Promise<string[]> {
  const students = await getStudents('', {});
  return [...new Set(students.map((s) => s.industry).filter(Boolean) as string[])].sort();
}
