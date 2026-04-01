import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://siwesdesk-api.onrender.com',
  timeout: 30000,
});

// Attach JWT
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('siwesdesk_auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore
    }
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('siwesdesk_auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export async function unwrapData<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  const response = await request;
  return response.data.data;
}

function inferFilename(
  contentDisposition: string | undefined,
  fallbackName: string,
): string {
  if (!contentDisposition) return fallbackName;
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? fallbackName;
}

export async function downloadResponse(
  request: Promise<AxiosResponse<Blob>>,
  fallbackName: string,
): Promise<void> {
  const response = await request;
  const blob = response.data;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = inferFilename(
    response.headers['content-disposition'],
    fallbackName,
  );
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export default api;
