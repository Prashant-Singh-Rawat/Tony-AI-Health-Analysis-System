import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch, Cpu, ScanText, Microscope,
  Brain, CheckCircle2, ShieldCheck, Sparkles
} from 'lucide-react';

const STAGES = [
  {
    icon: FileSearch,
    label: 'Reading PDF Document…',
    sub: 'Detecting format — digital text or scanned image PDF',
    duration: 2500,
    color: 'from-rose-500 to-red-600',
    glow: 'shadow-red-200',
  },
  {
    icon: Cpu,
    label: 'Running Multi-Engine Extraction…',
    sub: 'Trying pdfplumber → PyMuPDF → PyPDF2 to get the richest text',
    duration: 3500,
    color: 'from-orange-500 to-amber-500',
    glow: 'shadow-amber-200',
  },
  {
    icon: ScanText,
    label: 'Detecting Patient Details…',
    sub: 'Regex patterns scanning for Name, Age, Gender, Hospital, Doctor…',
    duration: 3000,
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-purple-200',
  },
  {
    icon: Microscope,
    label: 'Analyzing Biomarkers & Lab Values…',
    sub: 'Extracting test names, values, units, and reference ranges',
    duration: 4000,
    color: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-200',
  },
  {
    icon: Brain,
    label: 'Generating AI Clinical Insights…',
    sub: 'Gemini 2.5 Flash structuring findings, risk score, and recommendations',
    duration: 5000,
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-200',
  },
  {
    icon: CheckCircle2,
    label: 'Finalizing Report…',
    sub: 'Validating patient data, cross-checking values, preparing your analysis',
    duration: 1500,
    color: 'from-brand to-rose-700',
    glow: 'shadow-red-200',
  },
];

export default function AnalysisLoader({ wakingUp = false }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);


  useEffect(() => {
    let totalMs = 0;
    const timers = [];

    STAGES.forEach((stage, i) => {
      timers.push(setTimeout(() => setStageIndex(i), totalMs));
      totalMs += stage.duration;
    });

    // Smooth progress bar advancing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + 0.3;
      });
    }, 80);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  const current = STAGES[stageIndex];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Animated Icon Ring */}
      <div className="relative w-28 h-28 mb-8">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 112 112"
          aria-hidden="true"
        >
          <circle cx="56" cy="56" r="50" fill="none" stroke="#FFE4E4" strokeWidth="5" />
          <motion.circle
            cx="56" cy="56" r="50"
            fill="none"
            stroke="#E53935"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${Math.round(progress * 3.14)} 314`}
            animate={{ strokeDasharray: `${Math.round(progress * 3.14)} 314` }}
            transition={{ duration: 0.3 }}
          />
        </svg>

        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${current.color} rounded-2xl flex items-center justify-center shadow-lg ${current.glow}`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stage Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="space-y-2"
        >
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{current.label}</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">{current.sub}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-full max-w-sm bg-red-50 rounded-full h-2.5 mt-9 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-rose-700"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2.5 font-bold tracking-wider">{Math.round(progress)}% COMPLETE</p>

      {wakingUp && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400 rounded-2xl text-xs max-w-sm mx-auto font-bold leading-relaxed animate-pulse"
        >
          Backend is waking up from standby. The first request can take up to 50 seconds on the Render free plan. Please wait...
        </motion.div>
      )}


      {/* Stage dots progress track */}
      <div className="flex gap-2 mt-7">
        {STAGES.map((s, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === stageIndex ? 24 : 8,
              backgroundColor: i < stageIndex ? '#E53935' : i === stageIndex ? '#E53935' : '#FFE4E4'
            }}
            className="rounded-full h-2 transition-colors"
          />
        ))}
      </div>

      {/* Security indicator */}
      <div className="mt-9 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        Your medical documents are processed securely and never shared.
      </div>
    </div>
  );
}
