import React, { useState, useEffect } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useMedicineRecommendation } from '../hooks/useMedicineRecommendation';
import { useDeliveryTracking } from '../hooks/useDeliveryTracking';
import { getProviders, getNearbyPharmaciesFromAll } from '../services/pharmacy';

// Reusable components
import LocationBanner from '../components/medicine/LocationBanner';
import MedicineRecommendationCard from '../components/medicine/MedicineRecommendationCard';
import PharmacyCard from '../components/medicine/PharmacyCard';
import DeliveryTracker from '../components/medicine/DeliveryTracker';
import EmergencyMode from '../components/medicine/EmergencyMode';
import MedicineReminder from '../components/medicine/MedicineReminder';

import {
  Sparkles, FileText, Bell, MapPin, Pill, ShieldAlert,
  ChevronRight, AlertCircle, RefreshCw, Navigation
} from 'lucide-react';

export default function MedicinePrices() {
  const location = useLocation();
  const { recommendations, loading, hasData, message, error, refresh } = useMedicineRecommendation();
  const tracking = useDeliveryTracking();

  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  // Load nearby pharmacies when coordinates are updated
  useEffect(() => {
    if (location.coords) {
      setLoadingPharmacies(true);
      getNearbyPharmaciesFromAll(location.coords.lat, location.coords.lon)
        .then((data) => setNearbyPharmacies(data.slice(0, 4)))
        .catch((e) => console.error(e))
        .finally(() => setLoadingPharmacies(false));
    } else {
      setNearbyPharmacies([]);
    }
  }, [location.coords]);

  const handlePlaceOrder = (drug) => {
    tracking.startTracking({
      medicine: {
        id: drug.name,
        name: drug.name,
        price: drug.price_inr,
        provider: drug.nearby_pharmacy,
      },
      timestamp: new Date().toISOString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build the OpenStreetMap Embed URL based on user location coords
  const mapLat = location.coords?.lat || 28.6139; // Delhi coords fallback
  const mapLon = location.coords?.lon || 77.2090;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapLon - 0.02}%2C${mapLat - 0.02}%2C${mapLon + 0.02}%2C${mapLat + 0.02}&layer=mapnik&marker=${mapLat}%2C${mapLon}`;

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-950 px-6 max-w-7xl mx-auto pt-10">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-br from-white via-white to-red-50/20 dark:from-gray-900 dark:to-gray-950 rounded-3xl p-8 border border-red-50/20 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, var(--brand) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="bg-brand/5 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-bounce-slow" /> AI Diagnostics Integration
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Pill className="w-9 h-9 text-brand animate-pulse-brand" /> AI Medicine Recommendations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed text-sm font-medium">
            Personalized medical drug recommendations generated directly from your uploaded clinical reports, blood parameters, and diagnostic history.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setShowEmergency(true)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-extrabold px-5 py-3.5 rounded-2xl transition shadow-lg shadow-red-200 dark:shadow-none text-xs uppercase tracking-wider"
        >
          🚨 Emergency Support
        </button>
        <button
          onClick={() => setShowReminders(!showReminders)}
          className={`flex items-center gap-2 font-black px-5 py-3.5 rounded-2xl transition text-xs border ${
            showReminders
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Bell className="w-4.5 h-4.5" /> Pill Reminders
        </button>
        <button
          onClick={refresh}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-black px-5 py-3.5 rounded-2xl transition text-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin-slow' : ''}`} /> Refresh Recommendations
        </button>
      </div>

      {/* Live tracking overlay if active */}
      <DeliveryTracker tracking={tracking} />

      {/* Collapsible Action Widgets */}
      {showReminders && (
        <div className="mb-8">
          <MedicineReminder />
        </div>
      )}

      {/* Location Access Banner */}
      <div className="mb-8">
        <LocationBanner location={location} />
      </div>

      {/* Clinical Disclaimer Block */}
      {hasData && (
        <div className="bg-red-50/20 border border-brand/20 rounded-2xl p-5 mb-8 flex gap-3 text-xs text-gray-650 dark:text-gray-300">
          <AlertCircle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">
            <strong>Clinical Safety Notice:</strong> These recommendations are generated from your uploaded health records and are for informational purposes only. Please consult your doctor before starting, stopping, or changing any medication.
          </p>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="mb-10">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
          Recommended Formulations
        </span>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 border border-gray-150 rounded-2xl p-6 space-y-4">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : !hasData ? (
          <div className="bg-white dark:bg-gray-950 border border-dashed border-gray-200 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-brand/40 mx-auto" />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">No Recommendations Available</h3>
            <p className="text-xs text-gray-500 font-semibold max-w-sm mx-auto leading-relaxed">
              Upload a medical report or complete a health analysis to receive personalized medicine recommendations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((drug) => (
              <MedicineRecommendationCard
                key={drug.name}
                drug={drug}
                onOrder={handlePlaceOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Map Section */}
      <div className="premium-glass-card border border-red-50/20 rounded-3xl p-6.5 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-brand" />
          <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">Pharmacy Dispatch Mapping</h3>
        </div>
        <div className="w-full h-80 rounded-2xl overflow-hidden border border-gray-150 relative shadow-inner">
          <iframe
            title="OpenStreetMap Location Viewer"
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            src={mapEmbedUrl}
            style={{ border: 0 }}
          />
          <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-150 text-[10px] text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-lg font-bold shadow-sm flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-brand" /> Active Location Tracking Enabled
          </div>
        </div>
      </div>

      {/* Nearby Pharmacies Section */}
      {location.coords && (
        <div className="mb-10">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
            Nearby Physical Retail Partners
          </span>
          {loadingPharmacies ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-950 border border-gray-150 rounded-2xl p-5 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyPharmacies.map((store) => (
                <PharmacyCard
                  key={store.id}
                  pharmacy={store}
                  onOrder={() => handlePlaceOrder({ name: 'Prescription Order', providerId: store.providerId, price_inr: 0 })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emergency Mode Modal Overlay */}
      <EmergencyMode isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
}
