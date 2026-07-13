import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function DeliveryPartnerCard({ provider, isAvailable }) {
  const { name, tagline, color, bgColor, emoji } = provider;

  return (
    <div
      className={`glass-panel border rounded-2xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        isAvailable ? 'border-border-subtle hover:shadow-md' : 'opacity-65 border-border-subtle bg-bg-surface-hover/20'
      }`}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -z-10"
        style={{ backgroundColor: `${color}15` }}
      />

      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji || '📦'}</span>
            <h4 className="font-extrabold text-sm text-text-main" style={{ color: isAvailable ? color : undefined }}>
              {name}
            </h4>
          </div>
          {isAvailable ? (
            <span className="flex items-center gap-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="w-2.5 h-2.5" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-[9px] font-bold bg-text-muted/10 text-text-muted px-2 py-0.5 rounded-full border border-border-subtle">
              <AlertCircle className="w-2.5 h-2.5" /> Out of Range
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted leading-relaxed mb-4">{tagline}</p>
      </div>

      <button
        disabled={!isAvailable}
        className={`w-full text-[11px] font-extrabold py-2 rounded-lg border transition ${
          isAvailable
            ? 'border-border-subtle text-text-main hover:bg-bg-surface-hover shadow-sm'
            : 'border-border-subtle text-text-muted bg-transparent cursor-not-allowed'
        }`}
      >
        {isAvailable ? 'Open Channel' : 'Service Suspended'}
      </button>
    </div>
  );
}
