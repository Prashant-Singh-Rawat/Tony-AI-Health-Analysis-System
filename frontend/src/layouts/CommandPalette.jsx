import { useState, useEffect, useRef } from 'react';
import { Search, Command, Activity, MessageSquare, History, Pill, Heart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const commands = [
    { name: 'Dashboard', desc: 'Overview of health metrics', path: '/dashboard', icon: Activity },
    { name: 'AI Chat Assistant', desc: 'Ask about health concerns', path: '/chat', icon: MessageSquare },
    { name: 'Upload Report', desc: 'Analyze PDF report', path: '/analysis', icon: Heart },
    { name: 'Patient Corner', desc: 'Access medical history', path: '/patient-corner', icon: History },
    { name: 'Recommended Medicines', desc: 'View AI-powered medicine matches', path: '/medicines', icon: Pill },
  ];

  const filtered = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
        />

        {/* Palette dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -10 }}
          className="relative w-full max-w-lg bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-10 overflow-hidden"
        >
          {/* Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
            <Search className="w-5 h-5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search features or actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-text-main placeholder-text-muted outline-none text-sm"
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-bg-surface-hover rounded-lg text-text-muted hover:text-text-main"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Command list */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filtered.length > 0 ? (
              filtered.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(cmd.path);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-surface-hover rounded-xl text-left transition-colors"
                  >
                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-main">{cmd.name}</p>
                      <p className="text-xs text-text-muted">{cmd.desc}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center py-6 text-sm text-text-muted font-medium">No results found</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
