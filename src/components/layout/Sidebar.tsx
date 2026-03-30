import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, Settings, LogOut,
  ChevronLeft, Bell, ClipboardList, BarChart3, Building2
} from 'lucide-react';
import { cn, ROLE_CONFIG } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/lib/firebase-service';
import { useAppStore } from '@/store/app-store';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['employee','manager','hr_admin','super_admin'] },
  { to: '/leaves', icon: Calendar, label: 'My Leaves', roles: ['employee','manager','hr_admin','super_admin'] },
  { to: '/approvals', icon: ClipboardList, label: 'Approvals', roles: ['manager','hr_admin','super_admin'] },
  { to: '/employees', icon: Users, label: 'Employees', roles: ['hr_admin','super_admin'] },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['hr_admin','super_admin'] },
  { to: '/organization', icon: Building2, label: 'Organization', roles: ['super_admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['employee','manager','hr_admin','super_admin'] },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, notifications } = useAppStore();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/login');
    toast.success('Signed out successfully');
  };

  const visibleItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col bg-slate-950 border-r border-slate-800/50 h-screen z-30 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-display font-bold text-white text-lg leading-none">LeaveFlow</p>
              <p className="text-xs text-slate-500 mt-0.5">Leave Management</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors z-10"
      >
        <ChevronLeft className={cn('w-3 h-3 text-slate-400 transition-transform', !sidebarOpen && 'rotate-180')} />
      </button>

      {/* User Card */}
      {user && (
        <div className={cn('mx-3 mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3', !sidebarOpen && 'justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.displayName?.split(' ').map((n:string) => n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-medium text-slate-200 truncate">{user.displayName}</p>
                <p className={cn('text-xs', ROLE_CONFIG[user.role]?.color)}>{ROLE_CONFIG[user.role]?.label}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto scrollbar-none">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
              isActive
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80',
              !sidebarOpen && 'justify-center'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.label === 'Approvals' && unreadCount > 0 && (
                  <span className={cn('w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center flex-shrink-0', sidebarOpen ? '' : 'absolute -top-1 -right-1')}>
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-slate-800/50 pt-4">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all',
            !sidebarOpen && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
