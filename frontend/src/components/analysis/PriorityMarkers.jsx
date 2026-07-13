import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export default function PriorityMarkers({ parameters = [] }) {
  const getPriority = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('critical') || s.includes('danger') || s.includes('very high') || s.includes('very low')) {
      return { level: 'High Priority', val: 3, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-100', icon: ShieldAlert };
    }
    if (s.includes('high') || s.includes('low') || s.includes('abnormal')) {
      return { level: 'Medium Priority', val: 2, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-100', icon: AlertTriangle };
    }
    if (s.includes('borderline') || s.includes('slightly') || s.includes('warning')) {
      return { level: 'Low Priority', val: 1, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100', icon: Info };
    }
    return null;
  };

  const prioritized = parameters
    .map((p) => ({ ...p, pri: getPriority(p.status) }))
    .filter((p) => p.pri !== null)
    .sort((a, b) => b.pri.val - a.pri.val);

  if (prioritized.length === 0) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
        <p className="text-sm font-semibold text-emerald-600">🎉 No high-priority biomarkers detected. All measured values are within normal reference ranges.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
          <ShieldAlert className="w-4.5 h-4.5 text-brand-primary" /> Priority Health Markers
        </h3>
        <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Attention Hierarchy</span>
      </div>

      <div className="space-y-3">
        {prioritized.map((param, idx) => {
          const IconComponent = param.pri.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-xl border ${param.pri.color}`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider">{param.pri.level}</span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 uppercase">
                    {param.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-text-main text-sm mb-1">{param.name}</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Value is <span className="font-bold text-text-main">{param.value} {param.unit}</span> (Reference interval: {param.reference_interval || 'N/A'}). Consider checking this marker first as it is outside the healthy range.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
