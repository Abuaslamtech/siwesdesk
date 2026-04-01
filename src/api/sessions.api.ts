import { Session } from '../types';
import api, { unwrapData } from './axios';

export async function getSessions(): Promise<Session[]> {
  return unwrapData(api.get('/api/sessions'));
}

export async function getActiveSession(): Promise<Session | null> {
  try {
    return await unwrapData(api.get('/api/sessions/active'));
  } catch {
    return null;
  }
}

export async function createSession(year: number): Promise<Session> {
  return unwrapData(api.post('/api/sessions', { year }));
}
