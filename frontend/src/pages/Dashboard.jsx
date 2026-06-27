import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, TrendingUp, AlertCircle, CheckCircle, LogOut, 
  Activity, Heart, Thermometer, Clock, Calendar, CheckSquare, 
  ChevronRight, ArrowRight
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Mock data for new features
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
    const storedUser = localStorage.getItem('tony_health_user');
    if (!storedUser) {
      navigate('/'); 
      return;
    }
    
    setUser(JSON.parse(storedUser));
    
    // Set to empty state by default until real data is generated
    setReports([]);
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('tony_health_user');
    navigate('/');
  };

  if (!user) return null; 

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand font-black text-2xl tracking-tighter">
            <Heart className="w-6 h-6 fill-brand" />
            Tony Health
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/hospitals" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-brand">Hospitals</Link>
            <Link to="/analysis" className="bg-brand text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-brand-dark transition">
              + New Analysis
            </Link>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
              {user.name.charAt(0)}
            </div>
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition">
              <LogOut className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Health Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-slate-700">{user.name}</span>. Here is your daily health summary.</p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center max-w-3xl mx-auto mt-12">
            <div className="bg-gray-50 w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6">
              <FileText className="text-gray-400 w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No analysis found</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              You haven't submitted any medical reports yet. Upload your first report to unlock your Health Dashboard, Vitals Tracker, and Risk Radar.
            </p>
            <Link to="/analysis" className="bg-brand text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-dark transition shadow">
              Start First Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Feature 1: Vital Signs Tracker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">Normal</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Heart Rate</p>
                    <p className="text-3xl font-black text-slate-800">72 <span className="text-sm text-slate-400 font-medium">bpm</span></p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Elevated</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Blood Pressure</p>
                    <p className="text-3xl font-black text-slate-800">128/82</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">Normal</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">BMI</p>
                    <p className="text-3xl font-black text-slate-800">22.4</p>
                  </div>
                </div>
              </div>

              {/* Feature 2: Health Risk Radar Chart */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Health Risk Assessment</h3>
                  <button className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1">View Details <ChevronRight className="w-4 h-4"/></button>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Radar name="Risk Score" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Analysis Reports (Original Feature updated) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">AI Analysis Reports</h3>
                  <Link to="/analysis" className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1">Upload New <ArrowRight className="w-4 h-4"/></Link>
                </div>
                
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-brand/30 transition group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{report.disease}</h4>
                          <p className="text-xs text-slate-500 font-medium">{report.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-800">{report.score}% <span className="text-xs font-medium text-slate-500 font-normal">Risk</span></div>
                        <div className={`text-xs font-bold flex items-center gap-1 justify-end ${report.status === 'Improving' ? 'text-green-500' : 'text-red-500'}`}>
                          {report.status === 'Improving' ? <TrendingUp className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                          {report.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Side Column (1/3 width) */}
            <div className="space-y-6">
              
              {/* Feature 3: Upcoming Appointments */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-10"></div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Visit</h3>
                {appointments.map(apt => (
                  <div key={apt.id} className="bg-brand text-white p-5 rounded-xl shadow-lg shadow-brand/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">{apt.doctor}</p>
                        <p className="text-xs text-white/80">{apt.spec}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-black/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <span className="font-medium">{apt.date}</span>
                      <span className="font-bold">{apt.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature 4: Daily Health Goals */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Daily Goals</h3>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">2/4 Done</span>
                </div>
                <div className="space-y-3">
                  {goals.map(goal => (
                    <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                      <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${goal.done ? 'bg-brand border-brand' : 'border-gray-300'}`}>
                        {goal.done && <CheckSquare className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${goal.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {goal.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature 5: Recent Consultations */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Past Consultations</h3>
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {history.map((hist, idx) => (
                    <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-6 last:pb-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-brand text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-900 text-sm">{hist.doctor}</div>
                          <time className="font-medium text-brand text-xs">{hist.date}</time>
                        </div>
                        <div className="text-slate-500 text-xs">{hist.diagnosis}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
