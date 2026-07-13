import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Upload, PhoneCall, ShieldCheck, Heart, Sparkles, Navigation, Globe, ShieldAlert, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const POPULAR_SPECIALTIES = [
  { label: 'Cardiologist', icon: '❤️', color: 'from-rose-500 to-red-600',      shadow: 'shadow-rose-200',   text: 'text-white' },
  { label: 'Orthopaedics', icon: '🦴', color: 'from-blue-500 to-indigo-600',   shadow: 'shadow-blue-200',   text: 'text-white' },
  { label: 'Oncology',     icon: '🔬', color: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-200', text: 'text-white' },
  { label: 'Neurology',    icon: '🧠', color: 'from-amber-500 to-orange-500',  shadow: 'shadow-amber-200',  text: 'text-white' },
  { label: 'Paediatrics',  icon: '👶', color: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-200',text: 'text-white' },
];

// ECG bar colors for animated gradient effect
const BAR_COLORS = [
  'bg-rose-500','bg-orange-500','bg-red-500','bg-pink-500',
  'bg-rose-400','bg-red-600','bg-orange-400','bg-rose-500',
  'bg-red-500','bg-orange-500','bg-rose-600','bg-red-400',
];

export default function HeroSection({ detectedAddress, onBookAppointment }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/hospitals?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-bg-base py-20">
      {/* ── Background Animations & Waves ── */}
      <div className="absolute inset-0 z-0">
        {/* Vibrant animated gradient blobs */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25], x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full filter blur-[100px]"
          style={{ background: 'radial-gradient(circle, #EF5350 0%, #E53935 60%, transparent 100%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15], x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full filter blur-[100px]"
          style={{ background: 'radial-gradient(circle, #10B981 0%, #06B6D4 60%, transparent 100%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full filter blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, #7C3AED22 0%, transparent 70%)' }}
        />

        {/* Heartbeat ECG Line Canvas Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none">
            <path
              d="M0 300 H400 L420 280 L440 330 L460 250 L480 340 L500 290 L520 310 H1440"
              stroke="url(#ecgGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="ecgGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E53935" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left text column */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

          {/* ── "Trustworthy AI-Powered Care" badge ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full px-4.5 py-2 text-xs font-black uppercase tracking-wider text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #E53935 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" /> Trustworthy AI-Powered Care
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-text-main leading-[1.08] tracking-tight"
          >
            Healthcare<br />
            <span className="text-brand">Completely Redefined</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-text-muted max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
          >
            AI health report analyses, live GPS hospital locator, and real-time medical updates. Simple, accurate, and completely transparent.
          </motion.p>

          {/* ── Search bar ── */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl mx-auto lg:mx-0 bg-bg-surface rounded-3xl p-2 flex flex-col md:flex-row items-stretch gap-2"
            style={{ boxShadow: '0 8px 40px rgba(229,57,53,0.12)', border: '1.5px solid rgba(229,57,53,0.15)' }}
          >
            <div className="flex items-center gap-2.5 px-4 border-b md:border-b-0 md:border-r border-border-subtle py-2.5 md:py-0 flex-shrink-0">
              <MapPin className="w-5 h-5 text-brand" />
              <span className="text-xs font-black text-text-main truncate max-w-[150px]">
                {detectedAddress || 'Searching location…'}
              </span>
            </div>
            <div className="flex-1 flex items-center px-3">
              <Search className="w-5 h-5 text-text-muted mr-2 flex-shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for doctors, specialists, clinics..."
                className="w-full bg-transparent py-3 text-sm text-text-main outline-none placeholder-text-muted font-semibold"
              />
            </div>
            {/* ── Search button — vibrant gradient ── */}
            <button
              type="submit"
              className="text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
                boxShadow: '0 4px 16px rgba(229,57,53,0.4)',
              }}
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </motion.form>

          {/* ── Popular specialty pills — each with unique gradient ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-2"
          >
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Popular:</span>
            {POPULAR_SPECIALTIES.map(({ label, icon, color, shadow, text }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                onClick={() => navigate(`/hospitals?q=${encodeURIComponent(label)}`)}
                className={`flex items-center gap-1.5 text-xs font-black ${text} bg-gradient-to-r ${color} px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${shadow}`}
              >
                <span>{icon}</span> {label}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* ── Right side — Clinical Dashboard card ── */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[420px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm rounded-3xl p-7 space-y-6 relative overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid rgba(229,57,53,0.15)',
              boxShadow: '0 20px 60px rgba(229,57,53,0.12), 0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            {/* ── HIPAA READY badge — teal gradient ── */}
            <div
              className="absolute top-0 right-0 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-2xl flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #0D9488 100%)', boxShadow: '0 2px 10px rgba(16,185,129,0.4)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA READY
            </div>

            <div className="space-y-1 pt-2">
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'linear-gradient(90deg,#E53935,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Clinical Dashboard
              </p>
              <h3 className="text-lg font-bold text-text-main">Active Health Risk Index</h3>
            </div>

            {/* ── ECG Analytics section ── */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ background: 'linear-gradient(135deg, rgba(229,57,53,0.05) 0%, rgba(124,58,237,0.05) 100%)', border: '1px solid rgba(229,57,53,0.12)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-bold">ECG Baseline</span>
                {/* ── Live Tracking badge — animated red ── */}
                <span
                  className="text-[10px] font-black px-2.5 py-1 rounded-full text-white flex items-center gap-1 animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)', boxShadow: '0 2px 8px rgba(239,83,80,0.5)' }}
                >
                  ● Live Tracking
                </span>
              </div>

              {/* ── Colorful animated ECG bars ── */}
              <div className="flex items-end gap-1 h-12">
                {[40, 20, 90, 10, 30, 80, 50, 20, 10, 95, 20, 60].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h}%`, `${Math.max(h * 0.4, 8)}%`, `${h}%`] }}
                    transition={{ duration: 1.8 + i * 0.1, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                    className={`flex-1 ${BAR_COLORS[i]} rounded-full opacity-90`}
                    style={{ minHeight: '4px' }}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-text-main">Heart Rate</span>
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)' }}
                >
                  72 BPM
                </span>
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Book Visit — warm red-to-orange gradient */}
              <button
                onClick={onBookAppointment}
                className="w-full text-white font-extrabold text-xs py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.04] active:scale-95 flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #EF5350 0%, #FF6B35 100%)',
                  boxShadow: '0 4px 15px rgba(239,83,80,0.45)',
                }}
              >
                <Heart className="w-3.5 h-3.5 fill-white" /> Book Visit
              </button>

              {/* Report AI — purple-to-indigo gradient */}
              <button
                onClick={() => navigate('/analysis')}
                className="w-full text-white font-extrabold text-xs py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.04] active:scale-95 flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                  boxShadow: '0 4px 15px rgba(124,58,237,0.45)',
                }}
              >
                <Upload className="w-3.5 h-3.5" /> Report AI
              </button>
            </div>
          </motion.div>

          {/* ── Floating badge: Analysis Precision / Gold Standard ── */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -left-4 p-3.5 rounded-2xl flex items-center gap-2.5"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 8px 24px rgba(245,158,11,0.5)',
            }}
          >
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-sm">
              98%
            </div>
            <div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">Analysis Precision</p>
              <p className="text-xs font-extrabold text-white flex items-center gap-1">
                <Award className="w-3 h-3" /> Gold Standard
              </p>
            </div>
          </motion.div>

          {/* ── Floating badge: Auto-Locator / India-Wide ── */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -right-4 p-3.5 rounded-2xl flex items-center gap-2.5"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #0891B2 100%)',
              boxShadow: '0 8px 24px rgba(16,185,129,0.5)',
            }}
          >
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-sm">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">Auto-Locator</p>
              <p className="text-xs font-extrabold text-white">India-Wide Coverage</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Wave Separator */}
      <div className="curved-divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill" />
        </svg>
      </div>
    </div>
  );
}
