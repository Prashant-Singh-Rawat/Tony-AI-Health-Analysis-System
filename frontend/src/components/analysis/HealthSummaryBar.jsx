import React from 'react';
import { AlertCircle, CheckCircle, Activity, Award } from 'lucide-react';

export default function HealthSummaryBar({ riskScore = 0, overallStatus = 'Unknown', diseaseType = 'General Health', parameters = [] }) {
  const normalCount = parameters.filter(
    (p) => p.status?.toLowerCase() === 'normal' || !p.status
  ).length;
  
  const abnormalCount = parameters.length - normalCount;

  const getRiskBg = (score) => {
    if (score >= 70) return 'from-rose-500/10 to-red-500/10 border-red-200 text-rose-700 dark:text-rose-400';
    if (score >= 40) return 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700 dark:text-amber-400';
    return 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700 dark:text-emerald-400';
  };

  return (
    <div className={`w-full rounded-2xl border bg-gradient-to-r p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-bold ${getRiskBg(riskScore)}`}>
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 animate-pulse" />
        <span>Health Index: <span className="text-sm font-black">{riskScore.toFixed(0)}/100</span></span>
      </div>

      <div className="h-4 w-px bg-current/20 hidden sm:block" />

      <div className="flex items-center gap-1.5">
        <span className="opacity-75">Status:</span>
        <span className="px-2 py-0.5 rounded-full bg-current/10 uppercase tracking-wider text-[10px]">
          {overallStatus || 'Stable'}
        </span>
      </div>

      <div className="h-4 w-px bg-current/20 hidden sm:block" />

      <div className="flex items-center gap-1.5">
        <span className="opacity-75">Area:</span>
        <span className="text-text-main dark:text-white">{diseaseType || 'General Health'}</span>
      </div>

      <div className="h-4 w-px bg-current/20 hidden sm:block" />

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5" /> {abnormalCount} Abnormal
        </span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" /> {normalCount} Normal
        </span>
      </div>
    </div>
  );
}
