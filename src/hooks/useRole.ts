import { useAuthStore } from '../store/auth.store';
import { Role } from '../types';

/** Returns role helpers for the current user. */
export function useRole() {
  const { user } = useAuthStore();

  const is = (role: Role) => user?.role === role;

  return {
    role: user?.role,
    isDirector: is('director'),
    isCorper: is('corper'),
    isSupervisor: is('supervisor'),
    dashboardPath:
      user?.role === 'director'
        ? '/director/dashboard'
        : user?.role === 'corper'
          ? '/corper/dashboard'
          : '/supervisor/dashboard',
  };
}
