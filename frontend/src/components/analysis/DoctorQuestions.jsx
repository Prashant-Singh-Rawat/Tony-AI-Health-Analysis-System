import React from 'react';
import { HelpCircle, MessageSquarePlus } from 'lucide-react';

export default function DoctorQuestions({ parameters = [], diseaseType = 'General Health' }) {
  const isAbnormal = (status = '') => {
    const s = status.toLowerCase();
    return s && s !== 'normal' && s !== 'stable';
  };

  const getQuestions = (parameters, diseaseType) => {
    const questions = [
      'Which specific abnormal value in this report needs the most urgent attention?',
      'Do you recommend repeating these tests after a few weeks of lifestyle modifications?',
      'Are there any additional diagnostic tests I should undergo based on these findings?'
    ];

    const abnormalParams = parameters.filter((p) => isAbnormal(p.status));
    if (abnormalParams.length > 0) {
      const topMarkers = abnormalParams.slice(0, 2).map(p => p.name);
      questions.push(`Is my ${topMarkers.join(' / ')} level concerning for my age and health history?`);
      questions.push('Could these changes be managed purely through diet and exercise, or will I need medication?');
    } else {
      questions.push('What preventive markers or metrics should I focus on keeping in range next?');
    }

    questions.push('How often should I monitor these specific health markers going forward?');
    return questions;
  };

  const qs = getQuestions(parameters, diseaseType);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
          <HelpCircle className="w-4.5 h-4.5 text-brand-primary" /> Questions To Ask Your Doctor
        </h3>
        <p className="text-xs text-text-muted mt-0.5">Bring this list of AI-suggested questions to your next medical checkup</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {qs.map((q, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 bg-bg-surface-hover/30 border border-border-subtle rounded-xl text-xs text-text-main"
          >
            <MessageSquarePlus className="w-4.5 h-4.5 text-brand-accent flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{q}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
