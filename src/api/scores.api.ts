import { Score } from '../types';
import api, { unwrapData } from './axios';

export async function getScore(studentId: string): Promise<Score | null> {
  return unwrapData(api.get(`/api/scores/${studentId}`));
}

export async function submitScore(
  studentId: string,
  supervisorScore: number,
  industryScore: number,
  _orientation: number | null,
  _enteredBy: string,
): Promise<Score> {
  return unwrapData(
    api.post(`/api/scores/${studentId}`, {
      supervisorScore,
      industryScore,
    }),
  );
}

export async function saveDraft(
  studentId: string,
  supervisorScore: number | null,
  industryScore: number | null,
  _enteredBy: string,
): Promise<Score> {
  return unwrapData(
    api.patch(`/api/scores/${studentId}/draft`, {
      supervisorScore,
      industryScore,
    }),
  );
}

export interface BulkScoreEntry {
  studentId: string;
  supervisorScore: number;
  industryScore: number;
}

export interface BulkScoreResult {
  studentId: string;
  status: 'ok' | 'error';
  message?: string;
  score?: Score;
}

export interface BulkSubmitResponse {
  succeeded: number;
  failed: number;
  results: BulkScoreResult[];
}

export async function bulkSubmitScores(
  entries: BulkScoreEntry[],
): Promise<BulkSubmitResponse> {
  return unwrapData(api.post('/api/scores/bulk', { entries }));
}

export async function getAllScores(): Promise<Score[]> {
  return [];
}

