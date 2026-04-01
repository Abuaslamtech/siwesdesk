import { ProgressStats } from '../types';
import api, { downloadResponse, unwrapData } from './axios';

export async function getProgress(sessionId?: string): Promise<ProgressStats> {
  return unwrapData(
    api.get('/api/scores/progress/stats', { params: { sessionId } }),
  );
}

export async function downloadInternalReport(sessionId?: string): Promise<void> {
  return downloadResponse(
    api.get('/api/reports/export/internal', {
      params: { sessionId },
      responseType: 'blob',
    }),
    'siwesdesk-internal.xlsx',
  );
}

export async function downloadExternalReport(
  includeIncomplete = false,
  sessionId?: string,
): Promise<void> {
  return downloadResponse(
    api.get('/api/reports/export/external', {
      params: { sessionId, includeIncomplete },
      responseType: 'blob',
    }),
    includeIncomplete
      ? 'siwesdesk-external-incomplete.xlsx'
      : 'siwesdesk-external.xlsx',
  );
}
