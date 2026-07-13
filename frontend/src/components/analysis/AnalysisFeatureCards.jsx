import { Link } from 'react-router-dom';
import { LayoutDashboard, Hospital, Pill, UserRound, FileText, Sparkles } from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: LayoutDashboard,
    title: 'My Reports',
    desc: 'View and track all your past health analyses in one place.',
    to: '/dashboard',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    hover: 'hover:shadow-blue-100',
  },
  {
    icon: Hospital,
    title: 'Find Hospitals',
    desc: 'Locate certified hospitals and clinics near your location.',
    to: '/hospitals',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    hover: 'hover:shadow-rose-100',
  },
  {
    icon: Pill,
    title: 'Recommended Medicines',
    desc: 'Get AI-powered medicine recommendations based on your latest health reports, prescriptions, and medical history.',
    to: '/medicines',
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    hover: 'hover:shadow-red-100',
  },
  {
    icon: UserRound,
    title: 'Patient Corner',
    desc: 'Access patient stories, breakthrough cases, and health tips.',
    to: '/patient-corner',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    hover: 'hover:shadow-emerald-100',
  },
  {
    icon: FileText,
    title: 'Health Services',
    desc: 'Browse our full range of health checkup packages and services.',
    to: '/services',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    hover: 'hover:shadow-violet-100',
  },
];

export default function AnalysisFeatureCards() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Quick Access</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {FEATURE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className={`group flex items-start gap-4 p-4 rounded-2xl border border-transparent bg-white hover:border-slate-200 hover:shadow-lg ${card.hover} transition-all duration-200`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{card.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
