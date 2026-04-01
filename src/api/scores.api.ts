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

export async function getAllScores(): Promise<Score[]> {
  return [];
}
