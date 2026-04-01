import { Assignment, StudentWithStatus } from '../types';
import api, { unwrapData } from './axios';

export async function getAssignments(sessionId: string): Promise<Assignment[]> {
  return unwrapData(api.get('/api/assignments', { params: { sessionId } }));
}

export async function bulkAssign(
  studentIds: string[],
  supervisorId: string,
): Promise<{ assigned: number }> {
  return unwrapData(api.post('/api/assignments/bulk', { studentIds, supervisorId }));
}

export async function getAssignmentStats(): Promise<
  { supervisorId: string; count: number }[]
> {
  const progress = await unwrapData<{
    perSupervisor: Array<{
      supervisor: { id: string };
      total: number;
    }>;
  }>(api.get('/api/scores/progress/stats'));

  return progress.perSupervisor.map((row) => ({
    supervisorId: row.supervisor.id,
    count: row.total,
  }));
}

export async function getStudentsForSupervisor(
  _supervisorId: string,
): Promise<StudentWithStatus[]> {
  return unwrapData(api.get('/api/assignments/my-students'));
}
