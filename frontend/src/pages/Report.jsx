import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, TrendingUp, TrendingDown, Activity, AlertTriangle, ListChecks, ArrowLeft, Download, ShieldCheck, HeartPulse } from 'lucide-react';
import jsPDF from 'jspdf';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reports/${id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch report.');
        }

        const data = await response.json();
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
    doc.setTextColor(220, 38, 38); // Brand Red
    doc.text(title, 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 30);
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-rose-600';
    if (score >= 40) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getRiskGradient = (score) => {
    if (score >= 70) return 'from-rose-500 to-red-600';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    return 'from-emerald-400 to-teal-500';
  };

  const getRiskBg = (score) => {
    if (score >= 70) return 'bg-rose-50 border-rose-100';
    if (score >= 40) return 'bg-amber-50 border-amber-100';
    return 'bg-emerald-50 border-emerald-100';
  };

  const getStatusIcon = (status) => {
    if (status === 'Improving') return <TrendingUp className="w-6 h-6 text-emerald-500" />;
    if (status === 'Worsening') return <TrendingDown className="w-6 h-6 text-rose-500" />;
    return <Activity className="w-6 h-6 text-blue-500" />;
  };

  // Generate Projection Data for the Chart
  const generateProjectionData = (currentRisk) => {
    if (typeof currentRisk !== 'number') return [];
    
    // Simulate a 6 month trajectory
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <HeartPulse className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Generating your AI Health Analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-rose-600 font-medium mb-4">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-md transition">Back to Dashboard</button>
      </div>
    );
  }

  if (!report) return null;

  const chartData = generateProjectionData(report.risk_score);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Header Section */}
          <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <h1 className="text-3xl font-extrabold tracking-tight">AI Health Analysis</h1>
                </div>
                <p className="text-slate-400 font-medium">Personalized diagnostic insights & prevention plan</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Generated On</p>
                <p className="text-lg font-semibold">{new Date(report.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10">
            
            {/* Patient Info Bar */}
            {(report.patient_name || report.patient_age) && (
              <div className="flex flex-wrap items-center gap-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                 {report.patient_name && <div><p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Patient Name</p><p className="font-bold text-slate-800 text-lg">{report.patient_name}</p></div>}
                 {report.patient_age && <div><p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Age</p><p className="font-bold text-slate-800 text-lg">{report.patient_age} Yrs</p></div>}
              </div>
            )}

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Risk Score Card */}
              <div className={`col-span-1 md:col-span-1 rounded-3xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-center ${getRiskBg(report.risk_score)}`}>
                <div className="relative z-10">
                  <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-70">Risk Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black tracking-tighter ${getRiskColor(report.risk_score)}`}>
                      {report.risk_score?.toFixed(0)}
                    </span>
                    <span className="text-xl font-bold opacity-50">/ 100</span>
                  </div>
                </div>
                {/* Visual Progress Bar inside Card */}
                <div className="w-full bg-white/50 rounded-full h-2 mt-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getRiskGradient(report.risk_score)}`}
                    style={{ width: `${report.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Status Cards */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 hover:bg-white transition-colors rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center group">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Diagnosis Concept</p>
                  <p className="font-bold text-slate-800 text-xl leading-tight">{report.disease_type || 'General Health'}</p>
                </div>
                
                <div className="bg-slate-50 hover:bg-white transition-colors rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center group">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {getStatusIcon(report.overall_status)}
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Status</p>
                  <p className="font-bold text-slate-800 text-xl leading-tight">{report.overall_status}</p>
                </div>
              </div>
            </div>

            {/* NEW: Recharts Projection Graph */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-emerald-500" /> Projected Health Trajectory
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Expected risk score reduction over 6 months if the prevention plan is strictly followed.</p>
                </div>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrevention" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="Current Path" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                      <Area type="monotone" dataKey="With Prevention Plan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrevention)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Extracted Biomarkers */}
            {report.extracted_parameters && report.extracted_parameters.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" /> Extracted Biomarkers
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <th className="px-8 py-4 font-bold">Parameter</th>
                        <th className="px-8 py-4 font-bold">Value</th>
                        <th className="px-8 py-4 font-bold">Reference Range</th>
                        <th className="px-8 py-4 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {report.extracted_parameters.map((param, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4 font-semibold text-slate-700">{param.name}</td>
                          <td className="px-8 py-4">
                            <span className="text-slate-900 font-black text-lg">{param.value}</span>
                            <span className="text-xs text-slate-400 font-semibold ml-1">{param.unit}</span>
                          </td>
                          <td className="px-8 py-4 text-sm text-slate-500 font-medium">{param.reference_interval}</td>
                          <td className="px-8 py-4 text-right">
                            <span className={`inline-flex items-center justify-center text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${
                              param.status?.toLowerCase() === 'normal' ? 'bg-emerald-100 text-emerald-700' : 
                              param.status?.toLowerCase() === 'high' ? 'bg-rose-100 text-rose-700' : 
                              param.status?.toLowerCase() === 'low' ? 'bg-amber-100 text-amber-700' : 
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {param.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Medical Concerns Alert */}
            {report.concerns && (
              <div className="bg-rose-50/50 rounded-3xl p-8 border border-rose-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/50 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2 text-lg relative z-10">
                  <AlertTriangle className="w-6 h-6 text-rose-500" /> Medical Concerns Identified
                </h3>
                <p className="text-rose-900/80 leading-relaxed font-medium relative z-10">{report.concerns}</p>
                
                {report.potential_diseases && report.potential_diseases.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-rose-200/50 relative z-10">
                    <p className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-3">Potential Risks (If Uncontrolled)</p>
                    <div className="flex flex-wrap gap-2">
                      {report.potential_diseases.map((disease, idx) => (
                        <span key={idx} className="bg-white/60 backdrop-blur-sm text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-sm font-bold">
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prevention Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Exercise Plan */}
              <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-xl mb-4">Preventative Exercise Plan</h3>
                  <p className="text-slate-600 leading-relaxed mb-8">{report.exercise_plan}</p>
                </div>
                <button 
                  onClick={() => downloadPDF('Weekly Exercise Plan', report.exercise_plan)}
                  className="flex items-center justify-center gap-2 w-full bg-white border-2 border-emerald-500 text-emerald-600 px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-emerald-200"
                >
                  <Download className="w-5 h-5" /> Download Exercise PDF
                </button>
              </div>

              {/* Diet Plan */}
              <div className="bg-amber-50/50 rounded-3xl p-8 border border-amber-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                    <ListChecks className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-xl mb-4">Preventative Diet Plan</h3>
                  <p className="text-slate-600 leading-relaxed mb-8">{report.food_plan}</p>
                </div>
                <button 
                  onClick={() => downloadPDF('Weekly Diet Plan', report.food_plan)}
                  className="flex items-center justify-center gap-2 w-full bg-white border-2 border-amber-500 text-amber-600 px-6 py-3.5 rounded-xl font-bold hover:bg-amber-500 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-amber-200"
                >
                  <Download className="w-5 h-5" /> Download Diet PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

