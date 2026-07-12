import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Direct integration wrapper with existing AuthContext
      await login(email, password, isSignUp ? name : undefined);
      onClose();
    } catch {
      // Gracefully reset loader
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-950 rounded-3xl w-full max-w-md overflow-hidden shadow-floating relative p-8 border border-red-50/10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {isSignUp ? 'Create Health ID' : 'Welcome to Tony Health'}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              {isSignUp ? 'Set up your secure, HIPAA-compliant patient profile.' : 'Access report analyses, medical profiles, and appointments.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-450" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prashant Singh Rawat"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-gray-900 dark:text-white font-semibold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-450" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-gray-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-450" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-gray-900 dark:text-white font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700"
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand-dark transition shadow-md shadow-red-200 dark:shadow-none mt-2 text-sm disabled:opacity-40"
            >
              {loading ? 'Processing…' : isSignUp ? 'Register Profile' : 'Access Account'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-xs font-semibold text-gray-500">
            {isSignUp ? 'Already have a health ID?' : 'New to Tony Health?'} {' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand font-black hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Create One Now'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}