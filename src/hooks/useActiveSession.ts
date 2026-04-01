import { useQuery } from '@tanstack/react-query';
import { getActiveSession } from '../api/sessions.api';

export function useActiveSession() {
  return useQuery({
    queryKey: ['active-session'],
    queryFn: getActiveSession,
  });
}
