import React from 'react';
import { Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

export default function TrendReadiness({ currentRisk = 0, previousRisk = null }) {
  const isTrendAvailable = previousRisk !== null;

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
          <TrendingUp className="w-4.5 h-4.5 text-brand-primary" /> Track Progress Over Time
        </h3>
        <p className="text-xs text-text-muted mt-0.5 font-semibold">Monitor wellness trajectories across multiple checkups</p>
      </div>

      {isTrendAvailable ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-bg-surface-hover/20 p-4 rounded-xl border border-border-subtle">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-black text-brand uppercase tracking-wider block">Trend Diagnostic</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-text-main">{currentRisk.toFixed(0)}</span>
              <span className="text-xs text-text-muted font-bold">vs Previous: {previousRisk.toFixed(0)}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${
                currentRisk <= previousRisk ? 'bg-emerald-500 shadow-sm shadow-emerald-500/25' : 'bg-rose-500 shadow-sm shadow-rose-500/25'
              }`}>
                {currentRisk <= previousRisk ? 'IMPROVING' : 'ATTENTION ADVISED'}
              </span>
            </div>
            <p className="text-xs text-text-muted">Nice work tracking your health. Keep up your active routine to lock in improvements!</p>
          </div>
        </div>
      ) : (
        <div className="bg-bg-surface-hover/20 border border-dashed border-border-subtle rounded-xl p-6 text-center space-y-2">
          <Sparkles className="w-6 h-6 text-brand-primary mx-auto animate-bounce-slow" />
          <h4 className="font-extrabold text-text-main text-xs">Ready for Longitudinal Tracking</h4>
          <p className="text-[11px] text-text-muted max-w-md mx-auto leading-relaxed">
            Upload your next blood panel or diagnostic report in a few weeks or months. The AI engine will automatically link and graph your progress across key markers.
          </p>
        </div>
      )}
    </div>
  );
}
