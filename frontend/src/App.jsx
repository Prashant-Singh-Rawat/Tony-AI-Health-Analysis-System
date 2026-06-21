import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import HospitalFinder from './pages/HospitalFinder'
import MedicinePrices from './pages/MedicinePrices'

function App() {
  // Replace with your actual Google Client ID
  const clientId = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/hospitals" element={<HospitalFinder />} />
          <Route path="/medicines" element={<MedicinePrices />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
