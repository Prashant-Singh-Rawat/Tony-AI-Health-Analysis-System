import React, { useState } from 'react';
import { ListTodo, CheckSquare, Square } from 'lucide-react';

export default function NextHealthSteps({ parameters = [], hasConcerns = false, hasDietPlan = false, hasExercisePlan = false }) {
  const isAbnormal = (status = '') => {
    const s = status.toLowerCase();
    return s && s !== 'normal' && s !== 'stable';
  };

  const getInitialTasks = () => {
    const tasks = [
      { id: 'save-report', text: 'Save or download this clinical analysis report.', done: false },
      { id: 'trends', text: 'Schedule next follow-up panel to track progress over time.', done: false }
    ];

    const abnormalCount = parameters.filter((p) => isAbnormal(p.status)).length;
    if (abnormalCount > 0) {
      tasks.unshift({ id: 'discuss-marker', text: 'Discuss abnormal parameters with your doctor.', done: false });
    }
    if (hasConcerns) {
      tasks.push({ id: 'concerns', text: 'Review target risks listed in AI concerns section.', done: false });
    }
    if (hasDietPlan) {
      tasks.push({ id: 'diet', text: 'Align meals with custom dietary prevention guidelines.', done: false });
    }
    if (hasExercisePlan) {
      tasks.push({ id: 'exercise', text: 'Start custom physical wellness movement plan.', done: false });
    }

    return tasks;
  };

  const [tasks, setTasks] = useState(getInitialTasks);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
          <ListTodo className="w-4.5 h-4.5 text-brand-primary" /> Next Health Steps
        </h3>
        <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Interactive Checklist</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all duration-200 hover:scale-[1.01] ${
              task.done
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 opacity-75'
                : 'bg-bg-surface border-border-subtle text-text-main'
            }`}
          >
            {task.done ? (
              <CheckSquare className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4.5 h-4.5 text-text-muted flex-shrink-0 mt-0.5" />
            )}
            <span className={`leading-relaxed font-semibold ${task.done ? 'line-through' : ''}`}>
              {task.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
