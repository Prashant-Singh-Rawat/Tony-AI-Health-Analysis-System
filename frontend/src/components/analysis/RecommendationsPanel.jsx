import { Dumbbell, Utensils, Download } from 'lucide-react';
import jsPDF from 'jspdf';

function downloadPDF(title, content) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(title, 20, 20);
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  const lines = doc.splitTextToSize(content, 170);
  doc.text(lines, 20, 32);
  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}

function PlanCard({ icon: Icon, title, content, accentColor, bgColor, borderColor, buttonColor }) {
  if (!content) return null;
  const lines = content
    .split(/\n|\.(?=\s)/)
    .map(s => s.trim())
    .filter(s => s.length > 5)
    .slice(0, 8);

  return (
    <div className={`rounded-2xl border p-6 flex flex-col gap-5 ${bgColor} ${borderColor}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
      </div>

      <ul className="space-y-2.5">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accentColor} opacity-80`} />
            {line.replace(/^[-•*]\s*/, '')}
          </li>
        ))}
      </ul>

      <button
        onClick={() => downloadPDF(title, content)}
        className={`mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold border-2 transition-all ${buttonColor}`}
      >
        <Download className="w-4 h-4" /> Download PDF
      </button>
    </div>
  );
}

export default function RecommendationsPanel({ exercisePlan, foodPlan }) {
  if (!exercisePlan && !foodPlan) return null;

  return (
    <div>
      <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <Dumbbell className="w-4 h-4 text-white" />
        </span>
        AI Recommendations
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PlanCard
          icon={Dumbbell}
          title="Exercise Plan"
          content={exercisePlan}
          accentColor="bg-emerald-500"
          bgColor="bg-emerald-50/60"
          borderColor="border-emerald-200"
          buttonColor="border-emerald-400 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
        />
        <PlanCard
          icon={Utensils}
          title="Nutrition Plan"
          content={foodPlan}
          accentColor="bg-amber-500"
          bgColor="bg-amber-50/60"
          borderColor="border-amber-200"
          buttonColor="border-amber-400 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500"
        />
      </div>
    </div>
  );
}
