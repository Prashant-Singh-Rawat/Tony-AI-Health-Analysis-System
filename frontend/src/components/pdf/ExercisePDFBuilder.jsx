import React from 'react';
import { Heart, Activity, Dumbbell, Shield, Check, Flame, Clock } from 'lucide-react';

export default function ExercisePDFBuilder({ plan, patientName, reportDate }) {
  if (!plan || !plan.schedule) return null;

  return (
    <div
      id="exercise-pdf-template"
      className="bg-white p-10 font-sans relative"
      style={{
        width: '1200px',
        minHeight: '800px',
        color: '#333'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Heart className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tony Health</h1>
            <p className="text-sm text-slate-500">AI Health Analysis System</p>
          </div>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p>Patient: <span className="font-bold text-slate-800">{patientName}</span></p>
          <p>Report Date: {reportDate}</p>
          <p>Plan Duration: 1 Week</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Column */}
        <div className="w-1/3 flex flex-col gap-6">
          <div>
            <h2 className="text-4xl font-bold text-slate-800">Weekly</h2>
            <h2 className="text-4xl font-bold text-blue-600 mb-4">Exercise Plan</h2>
            <p className="text-slate-600 leading-relaxed">
              A personalized 7-day exercise plan designed to improve your overall fitness, boost energy levels and support better health.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
              <Activity className="text-blue-500 w-5 h-5" /> Plan Overview
            </h3>
            <div className="grid grid-cols-2 gap-y-6 text-center">
              <div>
                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="font-bold text-lg">{plan.plan_overview?.calories_burn || 2100}</div>
                <div className="text-xs text-slate-500">Est. Calories Burn</div>
              </div>
              <div>
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="font-bold text-lg">{plan.plan_overview?.recommended_days || "5-6"}</div>
                <div className="text-xs text-slate-500">Recommended Days</div>
              </div>
              <div>
                <Dumbbell className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="font-bold text-lg">{plan.plan_overview?.strength_days || "2-3"}</div>
                <div className="text-xs text-slate-500">Strength Training</div>
              </div>
              <div>
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="font-bold text-lg">{plan.plan_overview?.daily_avg || "30-45"} Min</div>
                <div className="text-xs text-slate-500">Daily Average</div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 flex-1">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
              <Shield className="text-blue-500 w-5 h-5" /> Guidelines
            </h3>
            <ul className="space-y-3">
              {(plan.guidelines || []).map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-2/3 flex flex-col gap-6">
          <div className="border border-slate-200 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
              <Clock className="text-blue-500 w-5 h-5" /> 7-Day Exercise Schedule
            </h3>
            <div className="space-y-4">
              {plan.schedule.map((dayPlan, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                  <div className={`w-16 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    idx === 0 ? 'bg-green-500' :
                    idx === 1 ? 'bg-blue-500' :
                    idx === 2 ? 'bg-purple-500' :
                    idx === 3 ? 'bg-orange-500' :
                    idx === 4 ? 'bg-pink-500' :
                    idx === 5 ? 'bg-teal-500' : 'bg-yellow-500'
                  }`}>
                    {dayPlan.day || ["MON","TUE","WED","THU","FRI","SAT","SUN"][idx]}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{dayPlan.activity}</h4>
                    <p className="text-sm text-slate-500">{dayPlan.intensity}</p>
                  </div>
                  <div className="text-right font-bold text-slate-800 text-green-600">
                    {dayPlan.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 flex-1">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
              <Check className="text-green-500 w-5 h-5" /> Benefits You'll Gain
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {(plan.benefits || []).slice(0,4).map((benefit, idx) => (
                <div key={idx} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    idx % 4 === 0 ? 'bg-red-100 text-red-500' :
                    idx % 4 === 1 ? 'bg-blue-100 text-blue-500' :
                    idx % 4 === 2 ? 'bg-green-100 text-green-500' : 'bg-purple-100 text-purple-500'
                  }`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t text-center text-xs text-slate-400">
        Generated by Tony Health AI • {reportDate}
      </div>
    </div>
  );
}
