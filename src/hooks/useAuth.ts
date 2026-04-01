import { useAuthStore } from '../store/auth.store';

/** Returns the current auth state. */
export function useAuth() {
  return useAuthStore();
}
