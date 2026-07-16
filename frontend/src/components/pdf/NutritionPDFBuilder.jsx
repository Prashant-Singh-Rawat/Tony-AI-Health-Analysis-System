import React from 'react';
import { Apple, Droplets, Info, Star, CheckCircle, Heart } from 'lucide-react';

export default function NutritionPDFBuilder({ plan, patientName, reportDate }) {
  if (!plan || !plan.daily_meals) return null;

  return (
    <div
      id="nutrition-pdf-template"
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
            <h2 className="text-4xl font-bold text-green-600 mb-4">Nutrition Plan</h2>
            <p className="text-slate-600 leading-relaxed">
              A balanced nutrition plan tailored to address your specific biomarkers, correct deficiencies, and support overall wellness.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
              <Apple className="text-green-500 w-5 h-5" /> Nutrition Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              {(plan.nutrition_overview?.focus || []).slice(0, 4).map((f, i) => (
                <div key={i}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    i===0 ? 'bg-green-100 text-green-600' :
                    i===1 ? 'bg-blue-100 text-blue-600' :
                    i===2 ? 'bg-amber-100 text-amber-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{f}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
              <Info className="text-green-500 w-5 h-5" /> Key Focus
            </h3>
            <ul className="space-y-3">
              {(plan.nutrition_overview?.guidelines || []).map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-2 h-2 bg-green-500 rounded-sm mt-1 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 flex-1 bg-blue-50/50">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
              <Droplets className="text-blue-500 w-5 h-5" /> Hydration Goal
            </h3>
            <p className="text-sm text-slate-600 mb-4">Drink {plan.nutrition_overview?.hydration_glasses || 8} glasses of water daily</p>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(plan.nutrition_overview?.hydration_glasses || 8, 10) }).map((_, i) => (
                <div key={i} className="w-8 h-10 bg-blue-200 rounded flex items-end">
                  <div className="w-full h-3/4 bg-blue-500 rounded-b"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-2/3 flex flex-col gap-6">
          <div className="border border-slate-200 rounded-2xl p-6 flex-1">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
              <Apple className="text-green-500 w-5 h-5" /> Daily Meal Plan
            </h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white text-center">
                  <th className="bg-transparent text-slate-800 pb-4">Day</th>
                  <th className="bg-green-500 rounded-lg px-2 py-1 mx-1 font-semibold">Breakfast</th>
                  <th className="bg-blue-500 rounded-lg px-2 py-1 mx-1 font-semibold">Lunch</th>
                  <th className="bg-orange-500 rounded-lg px-2 py-1 mx-1 font-semibold">Snack</th>
                  <th className="bg-purple-500 rounded-lg px-2 py-1 mx-1 font-semibold">Dinner</th>
                </tr>
              </thead>
              <tbody>
                {plan.daily_meals.map((meal, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4 font-bold text-slate-700">
                      {meal.day || ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][idx]}
                    </td>
                    <td className="py-4 px-2 text-slate-600 bg-green-50/30 rounded">{meal.breakfast}</td>
                    <td className="py-4 px-2 text-slate-600 bg-blue-50/30 rounded">{meal.lunch}</td>
                    <td className="py-4 px-2 text-slate-600 bg-orange-50/30 rounded">{meal.snack}</td>
                    <td className="py-4 px-2 text-slate-600 bg-purple-50/30 rounded">{meal.dinner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Recommendations Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-2xl p-5 bg-green-50">
              <h4 className="font-bold text-slate-800 text-sm mb-3">Foods to Eat</h4>
              <div className="flex flex-wrap gap-2">
                {(plan.recommendations?.foods_to_eat || []).map((food, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white rounded border border-green-200 text-green-700 font-medium">
                    {food.name || food}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-2xl p-5 bg-red-50">
              <h4 className="font-bold text-slate-800 text-sm mb-3">Foods to Avoid</h4>
              <div className="flex flex-wrap gap-2">
                {(plan.recommendations?.foods_to_avoid || []).map((food, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white rounded border border-red-200 text-red-700 font-medium">
                    {food}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-amber-50">
              <h4 className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-3">
                <Star className="w-4 h-4 text-amber-500" /> Nutrition Tip
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {plan.recommendations?.nutrition_tip || "Eat well, live well!"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center px-10 rounded-b-xl">
        <p className="text-white text-sm font-semibold">Good nutrition today for a healthier tomorrow. Eat well, live well!</p>
      </div>
    </div>
  );
}

