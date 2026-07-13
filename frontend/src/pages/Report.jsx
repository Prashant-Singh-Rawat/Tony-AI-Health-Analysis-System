import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, TrendingUp, TrendingDown, Activity, AlertTriangle,
  ListChecks, ArrowLeft, Download, ShieldCheck, HeartPulse, Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import apiService from '../services/api';
import { Card, Button, Badge } from '../components';
import { motion } from 'framer-motion';

// New health insight components
import HealthSummaryBar from '../components/analysis/HealthSummaryBar';
import PriorityMarkers from '../components/analysis/PriorityMarkers';
import BiomarkerInsights from '../components/analysis/BiomarkerInsights';
import LifestyleActionMap from '../components/analysis/LifestyleActionMap';
import DoctorQuestions from '../components/analysis/DoctorQuestions';
import TrendReadiness from '../components/analysis/TrendReadiness';
import NextHealthSteps from '../components/analysis/NextHealthSteps';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await apiService.getReportById(id);
        setReport(data);
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const downloadPDF = (title, content) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // Brand Primary Blue
    doc.text(title, 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 30);
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-rose-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getRiskGradient = (score) => {
    if (score >= 70) return 'from-rose-500 to-red-600';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    return 'from-emerald-400 to-teal-500';
  };

  const getStatusIcon = (status) => {
    if (status === 'Improving') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (status === 'Worsening') return <TrendingDown className="w-5 h-5 text-rose-500" />;
    return <Activity className="w-5 h-5 text-brand-primary" />;
  };

  const generateProjectionData = (currentRisk) => {
    if (typeof currentRisk !== 'number') return [];
    return [
      { month: 'Month 0', 'Current Path': currentRisk, 'With Prevention Plan': currentRisk },
      { month: 'Month 1', 'Current Path': Math.min(100, currentRisk * 1.05), 'With Prevention Plan': currentRisk * 0.85 },
      { month: 'Month 2', 'Current Path': Math.min(100, currentRisk * 1.08), 'With Prevention Plan': currentRisk * 0.70 },
      { month: 'Month 3', 'Current Path': Math.min(100, currentRisk * 1.12), 'With Prevention Plan': currentRisk * 0.55 },
      { month: 'Month 4', 'Current Path': Math.min(100, currentRisk * 1.15), 'With Prevention Plan': currentRisk * 0.45 },
      { month: 'Month 5', 'Current Path': Math.min(100, currentRisk * 1.18), 'With Prevention Plan': currentRisk * 0.35 },
      { month: 'Month 6', 'Current Path': Math.min(100, currentRisk * 1.20), 'With Prevention Plan': currentRisk * 0.30 },
    ].map(d => ({
      ...d,
      'Current Path': Math.round(d['Current Path']),
      'With Prevention Plan': Math.round(d['With Prevention Plan'])
    }));
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <HeartPulse className="w-12 h-12 text-brand-primary animate-pulse mb-4" />
        <p className="text-text-muted font-semibold animate-pulse text-sm">Ingesting health records & diagnostics...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text-main">Unable to Load Diagnostics</h2>
        <p className="text-text-muted text-sm">
          Something went wrong loading this report. It may have been deleted or access permission was revoked.
        </p>
        <Button onClick={() => navigate('/dashboard')} variant="primary" className="w-full">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const chartData = generateProjectionData(report.risk_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-main transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Main Diagnostic Card Layout */}
      <div className="bg-bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-8 text-white relative overflow-hidden border-b border-border-subtle">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-extrabold tracking-tight">AI Health Analysis Report</h1>
              </div>
              <p className="text-xs text-slate-400">Personalized biomarker parsing & prevention guide</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Generated On</span>
              <span className="text-sm font-semibold">{new Date(report.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        {/* Content Container */}
        <div className="p-6 space-y-8">
          
          {/* Health Summary Bar */}
          <HealthSummaryBar
            riskScore={report.risk_score ?? 0}
            overallStatus={report.overall_status}
            diseaseType={report.disease_type}
            parameters={report.extracted_parameters ?? []}
          />
          
          {/* Patient Details Bar */}
          {(report.patient_name || report.patient_age) && (
            <div className="flex flex-wrap items-center gap-8 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
              {report.patient_name && (
                <div>
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-0.5">Patient Name</p>
                  <p className="text-base font-extrabold text-text-main">{report.patient_name}</p>
                </div>
              )}
              {report.patient_age && (
                <div>
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-0.5">Age</p>
                  <p className="text-base font-extrabold text-text-main">{report.patient_age} Years</p>
                </div>
              )}
            </div>
          )}

          {/* Top Row Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Gauge Card */}
            <Card className="flex flex-col justify-center bg-bg-surface-hover/20">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Calculated Risk Score</p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-5xl font-black ${getRiskColor(report.risk_score)}`}>
                  {report.risk_score?.toFixed(0)}
                </span>
                <span className="text-sm text-text-muted">/ 100</span>
              </div>
              <div className="w-full bg-border-subtle rounded-full h-1.5 mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getRiskGradient(report.risk_score)}`}
                  style={{ width: `${report.risk_score}%` }}
                />
              </div>
            </Card>

            {/* Disease Type Info */}
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Diagnostic Category</p>
                <p className="text-lg font-extrabold text-text-main mt-0.5 leading-tight">{report.disease_type || 'General Health'}</p>
              </div>
            </Card>

            {/* Overall Status */}
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-bg-surface-hover rounded-2xl">
                {getStatusIcon(report.overall_status)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Overall Trend</p>
                <p className="text-lg font-extrabold text-text-main mt-0.5 leading-tight">{report.overall_status}</p>
              </div>
            </Card>
          </div>

          {/* Trajectory Projection Chart */}
          {chartData.length > 0 && (
            <Card>
              <div className="mb-6">
                <h3 className="text-base font-bold text-text-main flex items-center gap-1.5">
                  <TrendingDown className="w-5 h-5 text-brand-accent" /> Projected Health Trajectory
                </h3>
                <p className="text-xs text-text-muted mt-0.5">Estimated risk index decline assuming optimal wellness alignment</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrevention" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 100]} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="Current Path" stroke="var(--brand-primary)" strokeWidth={2.5} fill="url(#colorCurrent)" />
                    <Area type="monotone" dataKey="With Prevention Plan" stroke="var(--brand-accent)" strokeWidth={2.5} fill="url(#colorPrevention)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Extracted Lab Parameters Table */}
          {report.extracted_parameters && report.extracted_parameters.length > 0 && (
            <div className="border border-border-subtle rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-bg-surface-hover/30 border-b border-border-subtle">
                <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                  <ListChecks className="w-4.5 h-4.5 text-brand-primary" /> Extracted Parameters
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-bg-surface border-b border-border-subtle text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <th className="px-6 py-3">Parameter Name</th>
                      <th className="px-6 py-3">Measured Value</th>
                      <th className="px-6 py-3">Reference Range</th>
                      <th className="px-6 py-3 text-right">Status Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {report.extracted_parameters.map((param, idx) => (
                      <tr key={idx} className="hover:bg-bg-surface-hover/20 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-text-main">{param.name}</td>
                        <td className="px-6 py-3.5 font-extrabold text-text-main text-sm">
                          {param.value} <span className="text-[10px] text-text-muted font-normal ml-0.5">{param.unit}</span>
                        </td>
                        <td className="px-6 py-3.5 text-text-muted font-medium">{param.reference_interval}</td>
                        <td className="px-6 py-3.5 text-right">
                          <Badge variant={param.status?.toLowerCase() === 'normal' ? 'success' : param.status?.toLowerCase() === 'high' ? 'danger' : 'warning'}>
                            {param.status?.toUpperCase() || 'NORMAL'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Medical Warnings/Concerns */}
          {report.concerns && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> AI Clinical Assessment Concerns
              </h3>
              <p className="text-xs text-text-main leading-relaxed font-semibold">{report.concerns}</p>

              {report.potential_diseases && report.potential_diseases.length > 0 && (
                <div className="pt-4 border-t border-border-subtle">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Target Risk Vectors</p>
                  <div className="flex flex-wrap gap-2">
                    {report.potential_diseases.map((d, idx) => (
                      <Badge key={idx} variant="danger" className="text-[10px]">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. Priority Health Markers */}
          <PriorityMarkers parameters={report.extracted_parameters ?? []} />

          {/* 8. Biomarker Insight Cards */}
          <BiomarkerInsights parameters={report.extracted_parameters ?? []} />

          {/* 9. What To Improve First (Lifestyle Action Mapping) */}
          <LifestyleActionMap parameters={report.extracted_parameters ?? []} />

          {/* 10. Questions To Ask Your Doctor */}
          <DoctorQuestions parameters={report.extracted_parameters ?? []} diseaseType={report.disease_type} />

          {/* 11. Track Progress Over Time (Trend Readiness) */}
          <TrendReadiness currentRisk={report.risk_score ?? 0} />

          {/* 12. Next Health Steps */}
          <NextHealthSteps
            parameters={report.extracted_parameters ?? []}
            hasConcerns={!!report.concerns}
            hasDietPlan={!!report.food_plan}
            hasExercisePlan={!!report.exercise_plan}
          />

          {/* 13. Diet & Exercise Action Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workout Card */}
            <Card className="flex flex-col justify-between border-border-subtle hover:border-brand-primary/30 transition-colors">
              <div>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-brand-primary" /> Exercise Recommendation
                </h3>
                <p className="text-xs text-text-muted leading-relaxed mb-6">{report.exercise_plan}</p>
              </div>
              <Button
                onClick={() => downloadPDF('Weekly Exercise Plan', report.exercise_plan)}
                variant="secondary"
                className="w-full flex items-center gap-2 text-xs py-3"
              >
                <Download className="w-4 h-4" /> Download Plan PDF
              </Button>
            </Card>

            {/* Nutrition Card */}
            <Card className="flex flex-col justify-between border-border-subtle hover:border-brand-primary/30 transition-colors">
              <div>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2 mb-3">
                  <ListChecks className="w-5 h-5 text-brand-accent" /> Dietary Prevention Plan
                </h3>
                <p className="text-xs text-text-muted leading-relaxed mb-6">{report.food_plan}</p>
              </div>
              <Button
                onClick={() => downloadPDF('Weekly Nutrition Plan', report.food_plan)}
                variant="secondary"
                className="w-full flex items-center gap-2 text-xs py-3"
              >
                <Download className="w-4 h-4" /> Download Plan PDF
              </Button>
            </Card>
          </div>

          {/* Medical Disclaimer */}
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            <Info className="w-4.5 h-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-bold text-slate-700 dark:text-slate-350">Medical Disclaimer:</span> This analysis is educational and should be reviewed with a qualified doctor. Do not make medical decisions or change treatment plans without seeking professional clinical advice.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
