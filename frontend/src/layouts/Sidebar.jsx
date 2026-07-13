import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  MessageSquare,
  Activity,
  FileText,
  History,
  TrendingUp,
  Apple,
  Dumbbell,
  Pill,
  Calendar,
  BarChart2,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Assistant', path: '/chat', icon: MessageSquare },
    { name: 'Health Analysis', path: '/analysis', icon: Activity },
    { name: 'Medical Reports', path: '/analysis', icon: FileText },
    { name: 'Health History', path: '/patient-corner', icon: History },
    { name: 'Health Trends', path: '/hospitals', icon: TrendingUp },
    { name: 'Nutrition', path: '/services', icon: Apple },
    { name: 'Workout', path: '/services', icon: Dumbbell },
    { name: 'Medication', path: '/medicines', icon: Pill },
    { name: 'Appointments', path: '/hospitals', icon: Calendar },
    { name: 'Analytics', path: '/dashboard', icon: BarChart2 },
    { name: 'Notifications', path: '/dashboard', icon: Bell },
    { name: 'Settings', path: '/dashboard', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 bg-bg-surface border-r border-border-subtle flex flex-col justify-between transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-brand-primary">
              <Activity className="w-6 h-6 animate-pulse" />
              <span>Tony Health</span>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto text-brand-primary">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-bg-surface-hover rounded-xl text-text-muted hover:text-text-main transition-colors hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                  ${isActive
                    ? 'bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-surface-hover'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer (User details, settings, themes, logout) */}
      <div className="p-3 border-t border-border-subtle space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Logout */}
        {user && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
