import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Globe, Loader2, Navigation, AlertCircle, Hospital, ArrowRight, Search } from 'lucide-react';
import apiService from '../services/api';

export default function HospitalFinder() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | requesting | denied | found
  const [userCoords, setUserCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHospitals = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getNearbyHospitals(lat, lon);
      setHospitals(data.hospitals || []);
    } catch (err) {
      setError('Failed to fetch nearby hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        setLocationStatus('found');
        fetchHospitals(latitude, longitude);
      },
      () => {
        setLocationStatus('denied');
        setError('Location access denied. Please allow location access and try again.');
      }
    );
  };

  // Auto-request on mount
  useEffect(() => { requestLocation(); }, []);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDirectionsUrl = (h) =>
    `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)'}} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-blue-300 text-sm font-medium mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Find Hospitals</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
              <Hospital className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Nearest Hospitals & Clinics</h1>
              <p className="text-blue-200 mt-1">Real-time GPS search · Live distance calculation · Direct navigation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Status / Request Button */}
        {locationStatus === 'idle' || locationStatus === 'denied' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Enable Location Access</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Allow location access to find hospitals and clinics nearest to your current position, with real distances calculated instantly.
            </p>
            <button
              onClick={requestLocation}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <Navigation className="w-5 h-5" /> Use My Location
            </button>
            {locationStatus === 'denied' && (
              <p className="text-rose-500 text-sm mt-3 font-medium">⚠ Location was denied. Please allow it in your browser settings.</p>
            )}
          </div>
        ) : locationStatus === 'requesting' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center mb-8">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Detecting your location…</p>
          </div>
        ) : null}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-4 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Search + Stats bar */}
        {hospitals.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospitals by name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm whitespace-nowrap">
              <MapPin className="w-4 h-4 text-blue-500" />
              {filtered.length} hospitals found nearby
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">Finding hospitals near you…</p>
            <p className="text-slate-400 text-sm mt-1">Searching within 10 km radius</p>
          </div>
        )}

        {/* Hospital Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((hospital, idx) => (
              <div
                key={hospital.id || idx}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Distance badge */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <Hospital className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                        {hospital.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">Healthcare Facility</span>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100 whitespace-nowrap">
                    📍 {hospital.distance_km} km
                  </span>
                </div>

                <div className="px-5 pb-5 space-y-3">
                  {hospital.phone && hospital.phone !== 'Not available' && (
                    <a
                      href={`tel:${hospital.phone}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{hospital.phone}</span>
                    </a>
                  )}

                  {hospital.website && (
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="font-medium truncate">{hospital.website}</span>
                    </a>
                  )}

                  <a
                    href={getDirectionsUrl(hospital)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                  >
                    <Navigation className="w-4 h-4" /> Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state when no hospitals found */}
        {!loading && locationStatus === 'found' && filtered.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <Hospital className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-700 mb-2">No hospitals found</h3>
            <p className="text-slate-400 text-sm">Try clearing your search or expanding the radius.</p>
          </div>
        )}
      </div>
    </div>
  );
}
