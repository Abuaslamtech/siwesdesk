import api, { unwrapData } from './axios';

export async function markAllAttended(
  _sessionId: string,
): Promise<{ marked: number }> {
  return unwrapData(api.post('/api/orientation/mark-all'));
}

export async function markByMatricList(
  matricNos: string[],
): Promise<{ marked: number; notFound: string[] }> {
  const result = await unwrapData<{ marked: number; notFound: string[] }>(
    api.post('/api/orientation/mark-bulk', { matricNos }),
  );
  return result;
}

export async function previewBulkMatricList(
  matricNos: string[],
): Promise<{
  found: { matricNo: string; name: string; department: string | null }[];
  notFound: string[];
}> {
  return unwrapData(
    api.post('/api/orientation/preview-bulk', { matricNos }),
  );
}

export async function markSelected(
  studentIds: string[],
): Promise<{ marked: number }> {
  return unwrapData(api.post('/api/orientation/mark-individual', { studentIds }));
}

export async function getOrientationStatus(): Promise<
  { studentId: string; mark: number | null }[]
> {
  return unwrapData(api.get('/api/orientation'));
}

export function getOrientationMark(studentId: string): number | null {
  return null;
}
