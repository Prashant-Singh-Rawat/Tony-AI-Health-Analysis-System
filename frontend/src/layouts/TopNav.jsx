import { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, Command } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';

export default function TopNav({ onCommandOpen }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  // Generate breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0
    ? pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')
    : 'Dashboard';

  return (
    <header className="sticky top-0 right-0 z-20 h-16 bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-6">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
        <span>Tony Health</span>
        <span>/</span>
        <span className="text-text-main font-bold">{breadcrumb}</span>
      </div>

      {/* Right: Search, Notification, Profile */}
      <div className="flex items-center gap-4">
        {/* Ctrl+K Command indicator */}
        <button
          onClick={onCommandOpen}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-bg-base border border-border-subtle rounded-xl text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
        >
          <Command className="w-3 h-3" />
          <span>Search</span>
          <kbd className="bg-bg-surface px-1 py-0.5 rounded border border-border-subtle">Ctrl+K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-bg-surface-hover rounded-xl text-text-muted hover:text-text-main transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-bg-surface" />
        </button>

        {/* Profile Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-bg-surface-hover rounded-xl text-sm font-semibold text-text-main transition-colors"
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="hidden md:block">{user.name}</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-bg-surface border border-border-subtle rounded-xl shadow-xl py-1 z-30">
                <div className="px-4 py-2 border-b border-border-subtle">
                  <p className="text-xs text-text-muted">Signed in as</p>
                  <p className="text-sm font-bold text-text-main truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-text-main hover:bg-bg-surface-hover transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-text-main hover:bg-bg-surface-hover transition-colors"
                >
                  Settings
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
