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

// Simple layout wrapper for inner/dashboard paths
function ShellWrapper({ children }) {
  return <Shell>{children}</Shell>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing page remains without Shell */}
            <Route path="/" element={<LandingPage />} />

            {/* Inner Dashboard pages wrapped inside the Shell layout */}
            <Route path="/dashboard" element={<ShellWrapper><Dashboard /></ShellWrapper>} />
            <Route path="/chat" element={<ShellWrapper><Chat /></ShellWrapper>} />
            <Route path="/analysis" element={<ShellWrapper><Analysis /></ShellWrapper>} />
            <Route path="/report/:id" element={<ShellWrapper><Report /></ShellWrapper>} />
            <Route path="/hospitals" element={<ShellWrapper><HospitalFinder /></ShellWrapper>} />
            <Route path="/medicines" element={<ShellWrapper><MedicinePrices /></ShellWrapper>} />
            <Route path="/services" element={<ShellWrapper><Services /></ShellWrapper>} />
            <Route path="/patient-corner" element={<ShellWrapper><PatientCorner /></ShellWrapper>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
