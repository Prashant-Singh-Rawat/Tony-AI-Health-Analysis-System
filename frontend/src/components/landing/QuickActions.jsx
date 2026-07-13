import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Building2, Pill, Microscope, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  {
    icon: Stethoscope,
    title: 'Analyze Report',
    desc: 'Upload health records & reports for deep AI analysis.',
    to: '/analysis',
    color: 'text-rose-600',
    bg: 'bg-rose-50/50 dark:bg-rose-950/15',
    border: 'border-rose-100/50 dark:border-rose-900/10'
  },
  {
    icon: Building2,
    title: 'Find Hospitals',
    desc: 'Locate certified healthcare facilities nearby.',
    to: '/hospitals',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/15',
    border: 'border-indigo-100/50 dark:border-indigo-900/10'
  },
  {
    icon: Pill,
    title: 'Order Medicines',
    desc: 'Fast home delivery with live pharmacy inventory.',
    to: '/medicines',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/15',
    border: 'border-emerald-100/50 dark:border-emerald-900/10'
  },
  {
    icon: Microscope,
    title: 'Book Lab Tests',
    desc: 'Essential checkup packages at local labs.',
    to: '/services?tab=tests',
    color: 'text-amber-600',
    bg: 'bg-amber-50/50 dark:bg-amber-950/15',
    border: 'border-amber-100/50 dark:border-amber-900/10'
  }
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-3">On-Demand Care</p>
          <h2 className="text-3xl sm:text-4.5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            What are you looking for today?
          </h2>
          <p className="text-gray-500 mt-4 text-sm font-medium">
            Access our key digital healthcare portals instantly. Unified intelligence at your service.
          </p>
        </div>

        {/* Bento-style Quick Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5">
          {ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => navigate(action.to)}
                className={`premium-glass-card p-8 flex flex-col text-left justify-between items-start min-h-[220px] premium-glow-card border ${action.border}`}
              >
                <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {action.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-brand group-hover:gap-3 transition-all duration-300">
                  Access Portal <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
