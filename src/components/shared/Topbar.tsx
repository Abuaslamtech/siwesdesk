import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useActiveSession } from '../../hooks/useActiveSession';

const pageTitles: Record<string, string> = {
  '/director/dashboard':  'Dashboard',
  '/director/supervisors':'Supervisors',
  '/director/assign':     'Assign Students',
  '/director/sessions':   'Sessions',
  '/corper/dashboard':    'Dashboard',
  '/corper/students':     'Students',
  '/corper/orientation':  'Orientation',
  '/corper/reports':      'Reports',
  '/supervisor/dashboard':'Dashboard',
  '/supervisor/students': 'My Students',
};

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const { data: activeSession } = useActiveSession();

  const title = pageTitles[location.pathname] ??
    (location.pathname.includes('/score') ? 'Score Entry' : 'SiwesDesk');

  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-base font-heading font-semibold text-slate-800 flex-1">
        {title}
      </h1>

      {/* Session badge */}
      <div className="px-3 py-1 rounded-full bg-gold-400 text-primary-900 text-xs font-bold tracking-wide">
        {activeSession ? `SIWES ${activeSession.year}` : 'No Active Session'}
      </div>

      {/* User chip */}
      <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
        <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {user?.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
          {user?.name}
        </span>
      </div>
    </header>
  );
}
