import React from 'react';
import { Target, Compass, RefreshCw } from 'lucide-react';

export default function LifestyleActionMap({ parameters = [] }) {
  const isAbnormal = (status = '') => {
    const s = status.toLowerCase();
    return s && s !== 'normal' && s !== 'stable';
  };

  const getActionMappings = (parameters) => {
    const actions = [];

    parameters.forEach((p) => {
      if (!isAbnormal(p.status)) return;
      const lowerName = p.name.toLowerCase();
      const isHigh = p.status.toLowerCase().includes('high');
      const isLow = p.status.toLowerCase().includes('low');

      if ((lowerName.includes('cholesterol') || lowerName.includes('ldl')) && isHigh) {
        actions.push({
          marker: p.name,
          title: 'Improve Lipid & Heart Profile',
          impact: 'Reduces cardiovascular risk and keeps arteries clear.',
          points: [
            'Incorporate soluble fiber: Eat oats, barley, beans, and lentils daily.',
            'Switch to healthy fats: Use olive oil instead of butter, eat avocados and almonds.',
            'Increase daily movement: Walk briskly for 30 minutes at least 5 days a week.'
          ]
        });
      }
      else if ((lowerName.includes('glucose') || lowerName.includes('sugar') || lowerName.includes('hba1c')) && isHigh) {
        actions.push({
          marker: p.name,
          title: 'Stabilize Blood Glucose Levels',
          impact: 'Supports metabolic health and sustained daily energy.',
          points: [
            'Minimize refined carbohydrates: Avoid white bread, pastries, and sugary drinks.',
            'Pair carbs with protein/fat: Slows down digestion and sugar absorption spikes.',
            'Stay active after meals: A 10-minute walk post-meal significantly aids glucose uptake.'
          ]
        });
      }
      else if ((lowerName.includes('hemoglobin') || lowerName.includes('hgb')) && isLow) {
        actions.push({
          marker: p.name,
          title: 'Support Red Blood Cell Health',
          impact: 'Improves body oxygenation and reduces fatigue.',
          points: [
            'Consume iron-rich foods: Include spinach, legumes, lean meat, or fortified cereals.',
            'Boost absorption with Vitamin C: Eat citrus fruits or bell peppers alongside iron source.',
            'Limit tea/coffee near meals: Tannins in these drinks can reduce iron absorption.'
          ]
        });
      }
      else if (lowerName.includes('triglycerides') && isHigh) {
        actions.push({
          marker: p.name,
          title: 'Reduce Blood Triglycerides',
          impact: 'Optimizes cholesterol ratios and supports metabolic health.',
          points: [
            'Limit simple sugars & alcohol: These are directly converted to triglycerides in the liver.',
            'Eat fatty fish twice a week: Rich in Omega-3 (salmon, mackerel, sardines).',
            'Incorporate strength training: Helps burn stored fat reserves efficiently.'
          ]
        });
      }
    });

    // Default recommendation if no matches or all normal
    if (actions.length === 0) {
      actions.push({
        marker: 'General Health',
        title: 'Maintain Core Wellness Alignment',
        impact: 'Protects vital organs and supports biological resilience.',
        points: [
          'Hydration baseline: Aim for 2.5–3 liters of clean water daily.',
          'Quality recovery: Ensure 7-8 hours of uninterrupted sleep for cellular repair.',
          'Mindful stress management: Dedicate 5-10 minutes to breathing exercises daily.'
        ]
      });
    }

    return actions;
  };

  const actionPlans = getActionMappings(parameters);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
          <Target className="w-4.5 h-4.5 text-brand-primary" /> What To Improve First
        </h3>
        <p className="text-xs text-text-muted mt-0.5">Lifestyle actions tailored to address your specific biomarkers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actionPlans.map((plan, idx) => (
          <div key={idx} className="space-y-3 bg-bg-surface-hover/20 p-4.5 rounded-xl border border-border-subtle">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-black uppercase bg-brand/10 text-brand px-2 py-0.5 rounded-md">
                  {plan.marker}
                </span>
              </div>
              <h4 className="font-extrabold text-text-main text-sm">{plan.title}</h4>
              <p className="text-[11px] text-text-muted mt-0.5 font-semibold leading-normal">{plan.impact}</p>
            </div>
            
            <ul className="space-y-2">
              {plan.points.map((pt, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2 text-xs text-text-main">
                  <Compass className="w-3.5 h-3.5 text-brand-accent flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
