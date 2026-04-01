import { User } from '../types';
import api, { unwrapData } from './axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return unwrapData(api.post('/api/auth/login', payload));
}
