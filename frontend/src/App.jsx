import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Shell from './layouts/Shell';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import HospitalFinder from './pages/HospitalFinder';
import MedicinePrices from './pages/MedicinePrices';
import Services from './pages/Services';
import PatientCorner from './pages/PatientCorner';
import Report from './pages/Report';
import Chat from './pages/Chat';
import Login from './pages/Login';
import WorkoutTracker from './pages/WorkoutTracker';
import ProtectedRoute from './components/ProtectedRoute';
import { AlertOctagon, Server, Settings } from 'lucide-react';

// Simple layout wrapper for inner/dashboard paths
function ShellWrapper({ children }) {
  return (
    <ProtectedRoute>
      <Shell>{children}</Shell>
    </ProtectedRoute>
  );
}

function ConfigErrorScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
            <AlertOctagon className="w-8 h-8" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Configuration Error</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The frontend production build is missing the backend API URL configuration.
          </p>
        </div>
        
        <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-5 space-y-3">
          <div className="flex gap-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider items-center">
            <Settings className="w-4 h-4 text-indigo-400" /> Action Required:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please add a <code className="bg-slate-800 text-rose-400 px-1.5 py-0.5 rounded">VITE_API_URL</code> environment variable to your build environment.
          </p>
          <div className="text-[11px] text-slate-500 leading-normal space-y-1">
            <p>1. Go to GitHub Repo → Settings → Secrets & Variables → Actions</p>
            <p>2. Create a Repository Secret named <strong className="text-slate-400">VITE_API_URL</strong></p>
            <p>3. Set it to your Render service URL: <code className="text-slate-400">https://your-app.onrender.com</code></p>
            <p>4. Re-run your GitHub Actions deployment workflow</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-600">
          <Server className="w-3.5 h-3.5" /> Heart-AI-System Build Check
        </div>
      </div>
    </div>
  );
}

function App() {
  // Check if API_BASE_URL is missing in production mode
  const isProd = import.meta.env.PROD;
  const hasApiUrl = !!import.meta.env.VITE_API_URL;

  if (isProd && !hasApiUrl) {
    return <ConfigErrorScreen />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Inner Dashboard pages wrapped inside the Shell layout */}
            <Route path="/dashboard" element={<ShellWrapper><Dashboard /></ShellWrapper>} />
            <Route path="/chat" element={<ShellWrapper><Chat /></ShellWrapper>} />
            <Route path="/analysis" element={<ShellWrapper><Analysis /></ShellWrapper>} />
            <Route path="/report/:id" element={<ShellWrapper><Report /></ShellWrapper>} />
            <Route path="/hospitals" element={<ShellWrapper><HospitalFinder /></ShellWrapper>} />
            <Route path="/medicines" element={<ShellWrapper><MedicinePrices /></ShellWrapper>} />
            <Route path="/services" element={<ShellWrapper><Services /></ShellWrapper>} />
            <Route path="/workout" element={<ShellWrapper><WorkoutTracker /></ShellWrapper>} />
            <Route path="/patient-corner" element={<ShellWrapper><PatientCorner /></ShellWrapper>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
