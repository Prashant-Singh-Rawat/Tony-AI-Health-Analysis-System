import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, Bell, Menu, X, ShieldAlert, Sparkles, ChevronDown, Check, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainNav({ detectedState, userLat, userLon }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { name: 'Hospitals', to: '/hospitals' },
    { name: 'Doctors', to: '/hospitals?tab=doctors' },
    { name: 'Services', to: '/services' },
    { name: 'Patient Corner', to: '/patient-corner' },
    { name: 'Dashboard', to: '/dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 premium-glass border-b border-red-50/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl gradient-premium-brand flex items-center justify-center shadow-lg shadow-red-200/50 group-hover:scale-105 transition-transform duration-300">
            <Heart className="w-5 h-5 text-white fill-white animate-pulse-brand" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              Tony Health <Sparkles className="w-4 h-4 text-brand animate-bounce-slow" />
            </span>
            <p className="text-[10px] text-brand uppercase font-bold tracking-widest leading-none">Healthcare Elevated</p>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-8 font-semibold text-sm text-gray-700 dark:text-gray-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="hover:text-brand dark:hover:text-brand-light transition duration-300 relative py-1 group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Action Panel */}
        <div className="hidden lg:flex items-center gap-5">
          {/* Notification Indicator */}
          <button className="relative p-2 rounded-xl hover:bg-red-50/40 dark:hover:bg-gray-800 transition" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full ring-2 ring-white" />
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-red-50/40 dark:hover:bg-gray-800 transition font-bold text-xs"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Emergency trigger — animated red gradient */}
          <a
            href="tel:102"
            className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
              boxShadow: '0 3px 12px rgba(229,57,53,0.4)',
              animation: 'emergencyPulse 2s ease-in-out infinite',
            }}
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" /> Emergency Call
          </a>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 border px-3.5 py-1.5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(229,57,53,0.08) 0%, rgba(124,58,237,0.08) 100%)',
                  borderColor: 'rgba(229,57,53,0.25)',
                  color: 'var(--text-main)',
                }}
              >
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs text-brand font-black">
                  {user.name?.[0] || 'U'}
                </div>
                <span>{user.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-floating p-2.5 text-xs text-gray-650 dark:text-gray-300 font-semibold space-y-1.5"
                  >
                    <Link to="/dashboard" className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50/50 dark:hover:bg-gray-800 transition">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-50/50 dark:hover:bg-gray-800 text-brand transition font-bold"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #E53935 0%, #7C3AED 100%)',
                boxShadow: '0 4px 16px rgba(229,57,53,0.35)',
              }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-700 dark:text-white hover:text-brand transition"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 px-6 py-6 space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block text-base font-bold text-gray-800 dark:text-gray-200 hover:text-brand transition"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-900 flex flex-col gap-3">
              <a
                href="tel:102"
                className="w-full text-center bg-brand-soft text-brand font-black py-3 rounded-xl hover:bg-brand hover:text-white transition"
              >
                🚨 Emergency Call 102
              </a>
              {user ? (
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
                  className="w-full bg-brand text-white font-bold py-3 rounded-xl shadow-md"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
