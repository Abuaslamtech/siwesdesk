import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Calendar, BookUser,
  GraduationCap, ClipboardList, FileBarChart2, ClipboardCheck,
  BookOpen, X, LogOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/auth.store';
import { Role } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navByRole: Record<Role, NavItem[]> = {
  director: [
    { label: 'Dashboard',       path: '/director/dashboard',  icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: 'Supervisors',     path: '/director/supervisors',icon: <UserCheck className="w-[18px] h-[18px]" /> },
    { label: 'Students',        path: '/director/students',   icon: <GraduationCap className="w-[18px] h-[18px]" /> },
    { label: 'Assign Students', path: '/director/assign',     icon: <Users className="w-[18px] h-[18px]" /> },
    { label: 'Sessions',        path: '/director/sessions',   icon: <Calendar className="w-[18px] h-[18px]" /> },
  ],
  corper: [
    { label: 'Dashboard',   path: '/corper/dashboard',    icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: 'Students',    path: '/corper/students',     icon: <GraduationCap className="w-[18px] h-[18px]" /> },
    { label: 'Orientation', path: '/corper/orientation',  icon: <ClipboardCheck className="w-[18px] h-[18px]" /> },
    { label: 'Reports',     path: '/corper/reports',      icon: <FileBarChart2 className="w-[18px] h-[18px]" /> },
  ],
  supervisor: [
    { label: 'Dashboard',    path: '/supervisor/dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: 'My Students',  path: '/supervisor/students',  icon: <BookUser className="w-[18px] h-[18px]" /> },
    { label: 'Bulk Upload',  path: '/supervisor/bulk-upload', icon: <ClipboardList className="w-[18px] h-[18px]" /> },
  ],
};

interface SidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export default function Sidebar({ onClose, mobile = false }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const nav = user ? navByRole[user.role] : [];

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-primary-700 text-white',
        mobile ? 'w-64' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-primary-600/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gold-400 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary-900" />
          </div>
          <div>
            <p className="text-sm font-heading font-bold text-white leading-tight">SiwesDesk</p>
            <p className="text-[10px] text-primary-300 leading-tight">Al-Hikmah University</p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="p-1 rounded text-primary-300 hover:text-white hover:bg-primary-600 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role label */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] uppercase tracking-widest text-primary-400 font-semibold">
          {user?.role === 'director' ? 'Director' : user?.role === 'corper' ? 'Secretary / Corper' : 'Supervisor'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
        {nav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-800 text-gold-400'
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-primary-600/50 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-900 font-bold text-xs">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-primary-300 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-primary-300 hover:text-white hover:bg-primary-800 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
