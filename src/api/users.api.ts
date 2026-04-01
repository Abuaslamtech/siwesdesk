import { User, CreateSupervisorForm } from '../types';
import api, { unwrapData } from './axios';

export async function getSupervisors(): Promise<User[]> {
  return unwrapData(api.get('/api/users/supervisors'));
}

export async function createSupervisor(form: CreateSupervisorForm): Promise<User> {
  return unwrapData(
    api.post('/api/users', {
      ...form,
      role: 'supervisor',
    }),
  );
}

export async function updateSupervisor(
  id: string,
  form: Partial<CreateSupervisorForm>,
): Promise<User> {
  return unwrapData(api.patch(`/api/users/${id}`, form));
}

export async function getSupervisorCounts(): Promise<Record<string, number>> {
  const progress = await unwrapData<{
    perSupervisor: Array<{ supervisor: User; total: number }>;
  }>(api.get('/api/scores/progress/stats'));

  return Object.fromEntries(
    progress.perSupervisor.map((row) => [row.supervisor.id, row.total]),
  );
}
