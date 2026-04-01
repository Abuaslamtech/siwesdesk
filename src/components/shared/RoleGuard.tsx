import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Role } from '../../types';
import { useRole } from '../../hooks/useRole';

interface RoleGuardProps {
  allowed: Role[];
}

export default function RoleGuard({ allowed }: RoleGuardProps) {
  const { user } = useAuthStore();
  const { dashboardPath } = useRole();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to={dashboardPath} replace />;

  return <Outlet />;
}
