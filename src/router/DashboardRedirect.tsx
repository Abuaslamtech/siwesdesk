import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

export default function DashboardRedirect() {
  const { dashboardPath } = useRole();
  return <Navigate to={dashboardPath} replace />;
}
