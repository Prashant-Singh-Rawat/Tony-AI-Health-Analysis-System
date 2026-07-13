export default function RiskGauge({ score = 0 }) {
  // Thresholds from backend n8n logic: 70 = High, 85 = Critical
  const getLevel = (s) => {
    if (s >= 85) return { label: 'Critical', color: '#dc2626', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', track: '#fca5a5' };
    if (s >= 70) return { label: 'High Risk', color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', track: '#fed7aa' };
    if (s >= 40) return { label: 'Moderate', color: '#eab308', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', track: '#fde68a' };
    return { label: 'Low Risk', color: '#22c55e', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', track: '#bbf7d0' };
  };

  const level = getLevel(score);
  const clampedScore = Math.min(100, Math.max(0, score));

  // SVG Arc gauge (180° semicircle)
  const R = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = -180;
  const endAngle = 0;
  const totalArc = endAngle - startAngle; // 180°
  const scoreArc = (clampedScore / 100) * totalArc;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (from, to) => {
    const x1 = cx + R * Math.cos(toRad(from));
    const y1 = cy + R * Math.sin(toRad(from));
    const x2 = cx + R * Math.cos(toRad(to));
    const y2 = cy + R * Math.sin(toRad(to));
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  };

  const needleAngle = startAngle + scoreArc;
  const needleX = cx + (R - 12) * Math.cos(toRad(needleAngle));
  const needleY = cy + (R - 12) * Math.sin(toRad(needleAngle));

  return (
    <div className={`rounded-2xl border p-6 ${level.bg} ${level.border} flex flex-col items-center`}>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Risk Score</p>

      <div className="relative w-full" style={{ maxWidth: 200 }}>
        <svg viewBox="0 0 180 100" className="w-full overflow-visible">
          {/* Background track */}
          <path
            d={arcPath(-180, 0)}
            fill="none"
            stroke={level.track}
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Score arc */}
          {clampedScore > 0 && (
            <path
              d={arcPath(-180, needleAngle)}
              fill="none"
              stroke={level.color}
              strokeWidth="14"
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s ease-out',
              }}
            />
          )}
          {/* Needle dot */}
          <circle cx={needleX} cy={needleY} r="6" fill={level.color} stroke="white" strokeWidth="2.5" />
          {/* Center labels */}
          <text x={cx} y={cy - 4} textAnchor="middle" className="font-black" style={{ fontSize: 28, fill: level.color, fontWeight: 900 }}>
            {clampedScore.toFixed(0)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}>
            out of 100
          </text>
        </svg>
      </div>

      <span className={`mt-3 text-sm font-bold px-4 py-1.5 rounded-full ${level.text} bg-white border ${level.border}`}>
        {level.label}
      </span>

      {/* Threshold labels */}
      <div className="flex justify-between w-full mt-4 text-xs text-slate-400 font-medium px-1">
        <span className="text-emerald-500">Low</span>
        <span className="text-amber-500">Moderate</span>
        <span className="text-orange-500">High</span>
        <span className="text-rose-600">Critical</span>
      </div>
    </div>
  );
}
