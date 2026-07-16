import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, StatCard, Badge, Button } from '../components';
import { motion } from 'framer-motion';
import {
  FileText, TrendingUp, AlertCircle, Heart, Activity,
  Thermometer, Clock, Calendar, CheckCircle2, ChevronRight,
  ArrowRight, Sparkles, Plus, Star
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const radarData = [
    { subject: 'Cardiac', A: 85, fullMark: 100 },
    { subject: 'Respiratory', A: 65, fullMark: 100 },
    { subject: 'Metabolic', A: 45, fullMark: 100 },
    { subject: 'Musculoskeletal', A: 75, fullMark: 100 },
    { subject: 'Neurological', A: 30, fullMark: 100 },
    { subject: 'Immune', A: 90, fullMark: 100 },
  ];

  const goals = [
    { id: 1, text: '30 mins cardiovascular exercise', done: true },
    { id: 2, text: 'Drink 2L of water', done: true },
    { id: 3, text: 'Take prescribed medication', done: false },
    { id: 4, text: 'Keep sodium under 1500mg', done: false },
  ];

  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Jenkins', spec: 'Cardiologist', date: 'Oct 24, 2026', time: '10:00 AM', status: 'Upcoming' },
  ];

  const history = [
    { id: 1, doctor: 'Dr. Michael Chen', date: 'Sep 12, 2026', diagnosis: 'Routine Checkup' },
    { id: 2, doctor: 'Dr. Sarah Jenkins', date: 'Aug 05, 2026', diagnosis: 'Hypertension Follow-up' },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      try {
        const data = await apiService.getReports();
        setReports(data.reverse()); // newest first
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (!user) return null;

  // Calculate dynamic health score based on newest report risk score
  const newestReport = reports[0];
  const healthScore = newestReport ? Math.max(10, 100 - newestReport.risk_score) : 85;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white overflow-hidden shadow-xl shadow-indigo-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Premium AI Health Account
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user.name}!</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Your real-time vitals and parsed diagnostics are up to date. Explore your latest personalized AI suggestions.
            </p>
          </div>
          <Link to="/analysis">
            <Button variant="glass" className="bg-white/10 text-white hover:bg-white/20 border-white/10 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Health Report
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />
            <div className="h-[400px] bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />
          </div>
          <div className="h-[500px] bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-xl">
          <div className="bg-brand-primary/10 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 text-brand-primary">
            <FileText className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">No Reports Analyzed Yet</h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto text-sm">
            Upload your blood test, ECG, or other medical reports. Our advanced AI parser will generate your diagnostics dashboard instantly.
          </p>
          <Link to="/analysis">
            <Button variant="primary" className="px-8 py-3 font-semibold rounded-xl">
              Start Your First Analysis
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Vitals Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Heart Rate"
                value="72 bpm"
                icon={Heart}
                trend="Normal"
                trendType="up"
                description="from last scan"
              />
              <StatCard
                title="Blood Pressure"
                value="128/82"
                icon={Activity}
                trend="Elevated"
                trendType="down"
                description="systolic check required"
              />
              <StatCard
                title="Body Mass Index"
                value="22.4"
                icon={Thermometer}
                trend="Healthy"
                trendType="up"
                description="within optimal range"
              />
            </div>

            {/* AI Health Score Circular Gauge & Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-1">AI Health Score</h3>
                  <p className="text-xs text-text-muted">Calculated composite based on your recent blood parameters</p>
                </div>
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="var(--border-subtle)" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="var(--brand-primary)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={263.8}
                        strokeDashoffset={263.8 - (263.8 * healthScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-4xl font-black text-text-main">{healthScore.toFixed(0)}</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Score</p>
                    </div>
                  </div>
                </div>
                <div className="text-center text-xs font-semibold text-text-muted">
                  Your cardiovascular and metabolic parameters look stable.
                </div>
              </Card>

              {/* Health Risk Radar */}
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-text-main">Risk Assessment Radar</h3>
                  <Badge variant="info">Composite View</Badge>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="var(--border-subtle)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }} />
                      <Radar name="Risk Score" dataKey="A" stroke="var(--brand-primary)" fill="var(--brand-primary)" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* AI Analysis Reports (linked to detail page) */}
            <Card>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text-main">AI Analysis History</h3>
                  <p className="text-xs text-text-muted">Parsed medical files and predictive analysis summaries</p>
                </div>
                <Link to="/analysis">
                  <Button variant="secondary" size="sm" className="flex items-center gap-1">
                    Upload New <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => navigate(`/report/${report.id}`)}
                    className="flex items-center justify-between p-4 rounded-xl border border-border-subtle hover:border-brand-primary/30 hover:bg-bg-surface-hover/30 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main group-hover:text-brand-primary transition-colors">
                          {report.patient_name || report.disease_type || 'Medical Report'}
                        </h4>
                        <p className="text-xs text-text-muted">
                          {report.patient_age ? `Age: ${report.patient_age} · ` : ''}
                          {new Date(report.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-text-main">{report.risk_score?.toFixed(0)}% <span className="text-xs font-semibold text-text-muted">Risk</span></div>
                      <div className="mt-1">
                        <Badge variant={report.overall_status === 'Improving' ? 'success' : report.overall_status === 'High Risk' ? 'danger' : 'warning'}>
                          {report.overall_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <Card className="relative overflow-hidden border border-border-subtle bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
              <h3 className="text-lg font-bold text-text-main mb-4">Upcoming Appointments</h3>
              {appointments.map(apt => (
                <div key={apt.id} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-500/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{apt.doctor}</p>
                      <p className="text-xs text-white/80">{apt.spec}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-black/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                    <span className="font-semibold">{apt.date}</span>
                    <span className="font-black">{apt.time}</span>
                  </div>
                </div>
              ))}
            </Card>

            {/* Daily Goals */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-text-main">Daily Goals</h3>
                <Badge variant="success">2/4 Completed</Badge>
              </div>
              <div className="space-y-3">
                {goals.map(goal => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-surface-hover/50 transition-colors cursor-pointer border border-transparent hover:border-border-subtle">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${goal.done ? 'bg-brand-primary border-brand-primary text-white' : 'border-border-subtle'}`}>
                      {goal.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-semibold ${goal.done ? 'text-text-muted line-through' : 'text-text-main'}`}>
                      {goal.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Consultation Timeline */}
            <Card>
              <h3 className="text-base font-bold text-text-main mb-4">Consultations History</h3>
              <div className="space-y-4 relative pl-4 border-l border-border-subtle">
                {history.map((hist) => (
                  <div key={hist.id} className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-brand-primary rounded-full ring-4 ring-bg-surface" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-main">{hist.doctor}</span>
                      <time className="text-brand-primary font-semibold">{hist.date}</time>
                    </div>
                    <p className="text-[11px] text-text-muted">{hist.diagnosis}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      )}
    </motion.div>
  );
}
