import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Calendar, Stethoscope, AlertTriangle, Activity, CheckCircle2,
  ExternalLink, RefreshCw, ChevronRight, Info, TrendingUp, TrendingDown,
  FlaskConical, Heart, ShieldCheck, ClipboardList, Utensils, Dumbbell,
  MessageSquare, ArrowRight, Download, HelpCircle, Layers, FileText,
  AlertCircle, XCircle, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import ReportUpload from '../components/analysis/ReportUpload';
import AnalysisLoader from '../components/analysis/AnalysisLoader';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('tony_health_user')); }
  catch { return null; }
};

const getRiskMeta = (score) => {
  if (score >= 85) return { label: 'Critical Risk',  color: '#ef4444', bg: 'bg-red-500/10',    border: 'border-red-300',    text: 'text-red-600',    dot: 'bg-red-500' };
  if (score >= 70) return { label: 'High Risk',      color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-300', text: 'text-orange-600', dot: 'bg-orange-500' };
  if (score >= 40) return { label: 'Moderate Risk',  color: '#f59e0b', bg: 'bg-amber-500/10',  border: 'border-amber-300',  text: 'text-amber-600',  dot: 'bg-amber-500' };
  return               { label: 'Low Risk',          color: '#10b981', bg: 'bg-emerald-500/10',border: 'border-emerald-300',text: 'text-emerald-600',dot: 'bg-emerald-500' };
};

const getParamStyle = (status) => {
  const s = (status || 'normal').toLowerCase();
  if (s === 'high')    return { bg: 'bg-red-50 dark:bg-red-950/20',    badge: 'bg-red-500 text-white',     border: 'border-l-4 border-l-red-400',    icon: '↑', iconColor: 'text-red-500' };
  if (s === 'low')     return { bg: 'bg-blue-50 dark:bg-blue-950/20',  badge: 'bg-blue-500 text-white',    border: 'border-l-4 border-l-blue-400',   icon: '↓', iconColor: 'text-blue-500' };
  if (s === 'abnormal')return { bg: 'bg-orange-50 dark:bg-orange-950/20', badge: 'bg-orange-500 text-white',border: 'border-l-4 border-l-orange-400',icon: '!', iconColor: 'text-orange-500' };
  return                      { bg: 'bg-green-50 dark:bg-green-950/20',badge: 'bg-emerald-500 text-white', border: 'border-l-4 border-l-emerald-400', icon: '✓', iconColor: 'text-emerald-500' };
};

// Animated score gauge arc
function ScoreGauge({ score = 0, size = 140 }) {
  const risk = getRiskMeta(score);
  const radius = 52;
  const circumference = Math.PI * radius;
  const filled = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 1.6} viewBox="0 0 120 72">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path d="M 10 66 A 52 52 0 0 1 110 66"
          fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        {/* Fill */}
        <path d="M 10 66 A 52 52 0 0 1 110 66"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        {/* Score text */}
        <text x="60" y="60" textAnchor="middle" fontSize="20" fontWeight="800" fill={risk.color}>
          {Math.round(score)}
        </text>
        <text x="60" y="72" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">
          / 100
        </text>
      </svg>
      <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${risk.bg} ${risk.text}`}>
        {risk.label}
      </span>
    </div>
  );
}

// Parameter Row
function ParamRow({ param, index }) {
  const style = getParamStyle(param.status);
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`${style.bg} ${style.border} hover:brightness-95 transition-all`}
    >
      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-sm">{param.name}</td>
      <td className="px-4 py-3 text-sm">
        <span className="font-black text-slate-900 dark:text-white">{param.value}</span>
        {param.unit && <span className="text-slate-400 ml-1 text-xs">{param.unit}</span>}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-medium">{param.reference_interval || '—'}</td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${style.badge}`}>
          <span>{style.icon}</span>
          {param.status || 'normal'}
        </span>
      </td>
    </motion.tr>
  );
}

// Section card wrapper
function Section({ title, icon: Icon, iconColor = 'text-indigo-500', children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Plan list item
function PlanItem({ text, index }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex-shrink-0">
        {index + 1}
      </span>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────
function AnalysisResults({ report, onReset }) {
  const [paramFilter, setParamFilter] = useState('all');

  const risk = getRiskMeta(report.risk_score ?? 0);
  const params = report.extracted_parameters ?? [];
  const abnormalParams = params.filter(p => (p.status || 'normal').toLowerCase() !== 'normal');
  const normalParams   = params.filter(p => (p.status || 'normal').toLowerCase() === 'normal');
  const doctorQuestions = report.doctor_questions || [];
  const nextSteps = report.next_steps || [];

  const filteredParams = useMemo(() => {
    if (paramFilter === 'abnormal') return params.filter(p => (p.status || 'normal') !== 'normal');
    if (paramFilter === 'normal')   return params.filter(p => (p.status || 'normal') === 'normal');
    return params;
  }, [params, paramFilter]);

  // Parse plan text into bullet points
  const parsePlan = (text) => {
    if (!text) return [];
    return text.split(/\n|•|\d+\.\s/).map(s => s.trim()).filter(s => s.length > 5);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ─── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-indigo-600 transition-colors font-medium">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <button onClick={onReset} className="hover:text-indigo-600 transition-colors font-medium">Analysis</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Results</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Upload className="w-3.5 h-3.5" /> New Report
            </button>
            {report.id && (
              <Link
                to={`/report/${report.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all"
              >
                Full Report <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ─── Hero Summary Row ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {/* Health Score Gauge */}
          <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col items-center justify-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Health Index</p>
            <ScoreGauge score={report.risk_score ?? 0} />
          </div>

          {/* Report Type */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Report Type</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-tight">{report.disease_type || 'General Health'}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`w-2 h-2 rounded-full ${risk.dot}`} />
                <span className={`text-xs font-bold ${risk.text}`}>{report.overall_status || risk.label}</span>
              </div>
            </div>
          </div>

          {/* Abnormal Findings */}
          <div className={`rounded-2xl border shadow-sm p-5 flex flex-col justify-between gap-3 ${abnormalParams.length > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${abnormalParams.length > 0 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <XCircle className={`w-5 h-5 ${abnormalParams.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Abnormal</p>
              <p className={`font-black text-4xl ${abnormalParams.length > 0 ? 'text-red-600' : 'text-slate-300'}`}>{abnormalParams.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">findings</p>
            </div>
          </div>

          {/* Normal Findings */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm p-5 flex flex-col justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Normal</p>
              <p className="font-black text-4xl text-emerald-600">{normalParams.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">findings</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Patient</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-tight truncate">{report.patient_name || 'Anonymous'}</p>
              {report.patient_age && (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {report.patient_age}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Success Banner ──────────────────────────────────────────── */}
        {params.length > 0 ? (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900 px-5 py-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
              Analysis Complete — {params.length} medical parameters extracted and analyzed from your report.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900 px-5 py-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
              Report was processed but no specific lab parameters were detected. The AI used the full report text for assessment.
            </p>
          </div>
        )}

        {/* ─── Main Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left: Primary content ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Parameters Table */}
            {params.length > 0 && (
              <Section title="Lab Parameters & Findings" icon={FlaskConical} iconColor="text-violet-500">
                {/* Filter tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { key: 'all',      label: `All (${params.length})` },
                    { key: 'abnormal', label: `Abnormal (${abnormalParams.length})` },
                    { key: 'normal',   label: `Normal (${normalParams.length})` },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setParamFilter(key)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        paramFilter === key
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Parameter</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredParams.map((p, i) => <ParamRow key={i} param={p} index={i} />)}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Medical Concerns */}
            {report.concerns && (
              <Section title="AI Medical Assessment" icon={AlertTriangle} iconColor="text-rose-500">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{report.concerns}</p>
                {(report.potential_diseases ?? []).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Conditions to Monitor</p>
                    <div className="flex flex-wrap gap-2">
                      {report.potential_diseases.map((d, i) => (
                        <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Doctor Questions */}
            {doctorQuestions.length > 0 && (
              <Section title="Questions to Ask Your Doctor" icon={MessageSquare} iconColor="text-teal-500">
                <div className="space-y-3">
                  {doctorQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900">
                      <HelpCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{q}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Next Steps */}
            {nextSteps.length > 0 && (
              <Section title="Your Next Health Steps" icon={ArrowRight} iconColor="text-blue-500">
                <div className="space-y-3">
                  {nextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-bold text-slate-700 dark:text-slate-300">Medical Disclaimer: </span>
                This AI analysis is for educational reference only. Always consult a qualified healthcare professional before making any medical decisions or changing treatment plans.
              </p>
            </div>
          </div>

          {/* ── Right: Sidebar ─────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Abnormal Highlights */}
            {abnormalParams.length > 0 && (
              <Section title="Priority Findings" icon={AlertCircle} iconColor="text-rose-500">
                <div className="space-y-3">
                  {abnormalParams.slice(0, 6).map((p, i) => {
                    const style = getParamStyle(p.status);
                    return (
                      <div key={i} className={`flex items-center justify-between gap-3 p-3 rounded-xl ${style.bg} ${style.border}`}>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.value} {p.unit}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap uppercase ${style.badge}`}>
                          {p.status}
                        </span>
                      </div>
                    );
                  })}
                  {abnormalParams.length > 6 && (
                    <p className="text-xs text-center text-slate-400 font-medium">+{abnormalParams.length - 6} more abnormal findings in table above</p>
                  )}
                </div>
              </Section>
            )}

            {/* Exercise Plan */}
            {report.exercise_plan && (
              <Section title="Exercise Plan" icon={Dumbbell} iconColor="text-orange-500">
                <div className="space-y-2">
                  {parsePlan(report.exercise_plan).map((item, i) => (
                    <PlanItem key={i} text={item} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Nutrition Plan */}
            {report.food_plan && (
              <Section title="Nutrition Plan" icon={Utensils} iconColor="text-green-500">
                <div className="space-y-2">
                  {parsePlan(report.food_plan).map((item, i) => (
                    <PlanItem key={i} text={item} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white">
              <ShieldCheck className="w-8 h-8 text-white/80 mb-3" />
              <h4 className="font-extrabold text-base mb-1">Want a detailed view?</h4>
              <p className="text-xs text-indigo-200 mb-4">Open the full report for in-depth analysis, trajectory charts, and more.</p>
              {report.id ? (
                <Link
                  to={`/report/${report.id}`}
                  className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors w-full"
                >
                  <Layers className="w-4 h-4" /> Open Full Report
                </Link>
              ) : (
                <button
                  onClick={onReset}
                  className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors w-full"
                >
                  <Upload className="w-4 h-4" /> Upload New Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upload View ──────────────────────────────────────────────────────────────
function UploadView({ file, setFile, loading, error, onSubmit, wakingUp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            <Heart className="w-3.5 h-3.5" /> AI Medical Analysis
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">Upload Your Medical Report</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Upload any PDF medical report — blood tests, lipid panels, thyroid, kidney, liver function, and more.
            Our AI will extract every parameter and generate a personalized health analysis.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {loading ? (
            <AnalysisLoader wakingUp={wakingUp} />
          ) : (
            <>
              <ReportUpload
                file={file}
                setFile={setFile}
                loading={loading}
                onSubmit={onSubmit}
                error={error}
              />

              {/* Supported types */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 text-center mb-3 uppercase tracking-wider">Supported Report Types</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Blood CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Panel', 'HbA1c / Diabetes', 'Urine Analysis', 'Metabolic Panel'].map(t => (
                    <span key={t} className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          <Link to="/dashboard" className="hover:text-indigo-600 font-medium transition-colors">← Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Analysis() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setLoading(true);
    setWakingUp(false);

    // If the request doesn't complete within 6 seconds, we assume the backend is starting up (cold start)
    const timer = setTimeout(() => {
      setWakingUp(true);
    }, 6000);

    const user = getUser();
    try {
      const data = await apiService.uploadReport(file, user?.id);
      console.log('[Analysis] Upload response:', data);
      setReport(data);
    } catch (err) {
      const msg =
        err.friendlyMessage ||
        err?.response?.data?.detail ||
        err?.message ||
        'Upload failed. Please check the file and try again.';
      console.error('[Analysis] Upload error:', err);
      setError(msg);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setWakingUp(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setFile(null);
    setError('');
  };

  if (report) {
    return <AnalysisResults report={report} onReset={handleReset} />;
  }

  return (
    <UploadView
      file={file}
      setFile={setFile}
      loading={loading}
      error={error}
      onSubmit={handleUpload}
      wakingUp={wakingUp}
    />
  );
}

