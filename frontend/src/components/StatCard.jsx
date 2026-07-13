import Card from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendType = 'up', description, className = '' }) {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-text-main mt-2 tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="flex items-center gap-1.5 mt-4 text-xs font-medium">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 font-bold ${trendType === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trendType === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
          {description && <span className="text-text-muted">{description}</span>}
        </div>
      )}
    </Card>
  );
}
