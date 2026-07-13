import React from 'react';
import { Lightbulb, ArrowRight, HelpCircle } from 'lucide-react';

export default function BiomarkerInsights({ parameters = [] }) {
  const isAbnormal = (status = '') => {
    const s = status.toLowerCase();
    return s && s !== 'normal' && s !== 'stable';
  };

  const getInsightText = (name = '', status = '', value = '') => {
    const lowerName = name.toLowerCase();
    const isHigh = status.toLowerCase().includes('high');
    const isLow = status.toLowerCase().includes('low');

    if (lowerName.includes('cholesterol') || lowerName.includes('ldl')) {
      if (isHigh) {
        return {
          desc: 'Elevated cholesterol/LDL may lead to plaque accumulation in arteries, increasing cardiovascular risks over time.',
          step: 'Consider decreasing saturated fat intake, increasing soluble fiber (oats, beans), and doing regular aerobic exercise.'
        };
      }
    }
    if (lowerName.includes('glucose') || lowerName.includes('sugar') || lowerName.includes('hba1c')) {
      if (isHigh) {
        return {
          desc: 'High glucose levels suggest elevated blood sugar, which may point to metabolic strain or insulin resistance.',
          step: 'Focus on reducing refined sugars and simple carbs, drinking plenty of water, and discussing a fasting sugar or HbA1c test with a physician.'
        };
      }
    }
    if (lowerName.includes('hemoglobin') || lowerName.includes('hgb')) {
      if (isLow) {
        return {
          desc: 'Low hemoglobin levels could indicate reduced oxygen-carrying capacity in the blood, often causing fatigue or weakness.',
          step: 'Consider discussing iron-rich foods, vitamin C (to enhance absorption), and checking ferritin or vitamin B12 levels with your doctor.'
        };
      }
    }
    if (lowerName.includes('triglycerides')) {
      if (isHigh) {
        return {
          desc: 'High triglycerides are a type of blood fat that, when elevated, can be associated with increased heart health strain.',
          step: 'Reducing alcohol, sugary drinks, and highly processed carbohydrates while increasing physical activity can help lower levels.'
        };
      }
    }
    if (lowerName.includes('urea') || lowerName.includes('creatinine')) {
      if (isHigh) {
        return {
          desc: 'Elevated kidney markers can sometimes indicate dehydration, high protein intake, or need for kidney filtration assessment.',
          step: 'Ensure optimal daily hydration, monitor protein consumption, and request a repeat kidney profile or urine routine test if recommended.'
        };
      }
    }

    return {
      desc: `This biomarker value is currently registered as ${status.toLowerCase()} compared to standard clinical references.`,
      step: 'Discuss these findings during your next healthcare consultation to interpret them in context with your full health history.'
    };
  };

  const abnormalParams = parameters.filter((p) => isAbnormal(p.status));

  if (abnormalParams.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5 px-1">
        <Lightbulb className="w-4.5 h-4.5 text-brand-primary" /> Biomarker Insight Cards
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {abnormalParams.map((param, idx) => {
          const insight = getInsightText(param.name, param.status || 'abnormal', param.value);
          return (
            <div
              key={idx}
              className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Biomarker Detail</span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    param.status?.toLowerCase().includes('high') || param.status?.toLowerCase().includes('low') 
                      ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {param.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-text-main text-sm mb-1">{param.name}</h4>
                <div className="text-xs font-semibold text-text-muted mb-3">
                  Measured: <span className="text-text-main font-bold">{param.value} {param.unit}</span> | Range: {param.reference_interval || 'N/A'}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{insight.desc}</p>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-semibold text-text-main">
                  <span className="text-[10px] uppercase font-black text-emerald-600 block mb-0.5">Suggested Action</span>
                  {insight.step}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
