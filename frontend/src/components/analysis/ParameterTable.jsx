import { Activity } from 'lucide-react';

const STATUS_MAP = {
  normal: { label: 'NORMAL', classes: 'bg-emerald-100 text-emerald-700' },
  high:   { label: 'HIGH',   classes: 'bg-rose-100 text-rose-700' },
  low:    { label: 'LOW',    classes: 'bg-amber-100 text-amber-700' },
};

export default function ParameterTable({ parameters = [] }) {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-slate-800">Extracted Biomarkers</h3>
        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {parameters.length} parameters
        </span>
      </div>

      {/* Mobile: card grid */}
      <div className="block sm:hidden divide-y divide-slate-50">
        {parameters.map((param, idx) => {
          const key = param.status?.toLowerCase();
          const badge = STATUS_MAP[key] || { label: (param.status || 'N/A').toUpperCase(), classes: 'bg-slate-100 text-slate-600' };
          return (
            <div key={idx} className="p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{param.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{param.reference_interval || '—'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-slate-900 text-lg leading-none">
                  {param.value}<span className="text-xs font-semibold text-slate-400 ml-1">{param.unit}</span>
                </p>
                <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${badge.classes}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Parameter</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Reference Range</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {parameters.map((param, idx) => {
              const key = param.status?.toLowerCase();
              const badge = STATUS_MAP[key] || { label: (param.status || 'N/A').toUpperCase(), classes: 'bg-slate-100 text-slate-600' };
              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{param.name}</td>
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900 text-lg">{param.value}</span>
                    {param.unit && <span className="text-xs text-slate-400 ml-1 font-semibold">{param.unit}</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{param.reference_interval || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
