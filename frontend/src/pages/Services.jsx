import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin, Navigation, Search, Clock, Star, Phone,
  ExternalLink, RefreshCw, Dumbbell, Pill, Compass,
  CheckCircle, AlertCircle, WifiOff, ChevronRight,
  Activity, Heart, Stethoscope, Calendar, X,
  ShieldCheck, CreditCard, Info
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

// ─── Indian Rupee diagnostic packages (INR, not USD) ────────────────────────
const CHECKUP_PACKAGES = [
  {
    id: 'chk-basic',
    name: 'Essential Health Checkup',
    priceINR: 1999,
    mrpINR: 2999,
    description: 'Perfect for a regular preventive wellness screening.',
    features: ['Complete Blood Count (CBC)', 'Fasting Blood Glucose', 'Lipid Profile', 'Urine Routine Analysis', 'Doctor Consultation'],
    category: 'General',
    color: 'emerald',
  },
  {
    id: 'chk-cardiac',
    name: 'Comprehensive Cardiac Care',
    priceINR: 4999,
    mrpINR: 7499,
    description: 'Advanced evaluation of heart and cardiovascular health.',
    features: ['Electrocardiogram (ECG)', 'Echocardiogram (ECHO)', 'Lipid Profile & HbA1c', 'Treadmill Test (TMT)', 'Senior Cardiologist Review'],
    category: 'Cardiac',
    color: 'red',
  },
  {
    id: 'chk-women',
    name: 'Women Wellness Platinum',
    priceINR: 3999,
    mrpINR: 5999,
    description: 'Specially curated checkup covering key female health markers.',
    features: ['Thyroid Profile (T3, T4, TSH)', 'Vitamin D & B12', 'Bone Mineral Density Scan', 'Mammography / Ultrasound', 'Gynaecologist Consultation'],
    category: 'Women',
    color: 'pink',
  },
  {
    id: 'chk-senior',
    name: 'Active Senior Citizens (Co-ed)',
    priceINR: 3499,
    mrpINR: 4999,
    description: 'Comprehensive screening tailored for older adults.',
    features: ['Kidney Function Test (KFT)', 'Liver Function Test (LFT)', 'PSA (men) / Thyroid', 'Arthritis Panel', 'Geriatric Consultation'],
    category: 'Senior',
    color: 'indigo',
  },
];

const DIAGNOSTIC_TESTS = [
  { id: 'tst-ecg',   name: 'Electrocardiogram (ECG)',          priceINR: 299,   duration: '15 mins', category: 'Heart' },
  { id: 'tst-echo',  name: '2D Echocardiography (ECHO)',       priceINR: 1999,  duration: '30 mins', category: 'Heart' },
  { id: 'tst-lipid', name: 'Lipid Profile Panel',              priceINR: 499,   duration: '10 mins', category: 'Blood' },
  { id: 'tst-hba1c', name: 'HbA1c (Glycated Haemoglobin)',     priceINR: 349,   duration: '10 mins', category: 'Blood' },
  { id: 'tst-cbc',   name: 'Complete Blood Count (CBC)',        priceINR: 249,   duration: '10 mins', category: 'Blood' },
  { id: 'tst-tsh',   name: 'Thyroid Stimulating Hormone (TSH)', priceINR: 299,  duration: '10 mins', category: 'Hormones' },
  { id: 'tst-lft',   name: 'Liver Function Test (LFT)',         priceINR: 599,  duration: '15 mins', category: 'Organs' },
  { id: 'tst-kft',   name: 'Kidney Function Test (KFT)',        priceINR: 549,  duration: '15 mins', category: 'Organs' },
  { id: 'tst-vitd',  name: 'Vitamin D (25-Hydroxy)',            priceINR: 799,  duration: '10 mins', category: 'Vitamins' },
  { id: 'tst-vitb',  name: 'Vitamin B12',                       priceINR: 499,  duration: '10 mins', category: 'Vitamins' },
  { id: 'tst-sugar', name: 'Random Blood Sugar (RBS)',           priceINR: 99,   duration: '5 mins',  category: 'Blood' },
  { id: 'tst-urine', name: 'Urine Routine & Microscopy',        priceINR: 149,  duration: '10 mins', category: 'Urine' },
];

// ─── Overpass API helpers (same as hospitals.py pattern) ────────────────────

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return +(Math.sqrt(a) * R * 2).toFixed(2);
}

async function queryOverpass(query) {
  const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  for (const url of mirrors) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) return res.json();
    } catch { /* try next mirror */ }
  }
  throw new Error('All Overpass mirrors unavailable');
}

function buildQuery(lat, lon, amenities, radiusM = 8000) {
  const parts = amenities.flatMap((a) => [
    `node["leisure"="${a}"](around:${radiusM},${lat},${lon});`,
    `way["leisure"="${a}"](around:${radiusM},${lat},${lon});`,
    `node["amenity"="${a}"](around:${radiusM},${lat},${lon});`,
    `way["amenity"="${a}"](around:${radiusM},${lat},${lon});`,
  ]);
  return `[out:json][timeout:25];\n(\n${parts.join('\n')}\n);\nout center;`;
}

function parseElements(elements, userLat, userLon) {
  const seen = new Set();
  const results = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const name = (tags.name || '').trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) continue;
    const dist = haversine(userLat, userLon, elLat, elLon);
    results.push({
      id: el.id,
      name,
      address: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || null,
      phone: tags.phone || tags['contact:phone'] || null,
      website: tags.website || tags['contact:website'] || null,
      openingHours: tags.opening_hours || null,
      lat: elLat,
      lon: elLon,
      distance: dist,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${elLat},${elLon}`,
    });
  }
  return results.sort((a, b) => a.distance - b.distance).slice(0, 8);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LocationCard({ geoState, onRequest }) {
  if (geoState.status === 'granted') {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-sm mb-6">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span className="font-semibold text-emerald-800 line-clamp-1">{geoState.address || 'Location detected'}</span>
        <span className="ml-auto text-xs text-emerald-600 font-bold">GPS Active</span>
      </div>
    );
  }
  if (geoState.status === 'requesting') {
    return (
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm mb-6">
        <Compass className="w-4 h-4 text-blue-500 animate-spin-slow flex-shrink-0" />
        <span className="text-blue-700 font-semibold">Detecting your location…</span>
      </div>
    );
  }
  if (geoState.status === 'denied') {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm mb-6">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800 font-semibold">Location access denied — nearest results unavailable.</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">Enable Location</p>
          <p className="text-xs text-gray-500">Find nearest gyms, pharmacies & labs</p>
        </div>
      </div>
      <button
        onClick={onRequest}
        className="bg-brand text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-dark transition flex items-center gap-2"
      >
        <Navigation className="w-4 h-4" /> Use My Location
      </button>
    </div>
  );
}

function PlaceSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-8 w-full rounded-xl" />
    </div>
  );
}

function PlaceCard({ place, type }) {
  const icon = type === 'gym'
    ? <Dumbbell className="w-5 h-5 text-violet-600" />
    : <Pill className="w-5 h-5 text-brand" />;
  const bg = type === 'gym' ? 'bg-violet-50' : 'bg-red-50';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover-lift shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{place.name}</h4>
            {place.address && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{place.address}</p>
            )}
          </div>
        </div>
        <span className="text-xs font-bold text-gray-400 flex-shrink-0 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
          {place.distance} km
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs mb-4">
        {place.openingHours && (
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" /> {place.openingHours}
          </span>
        )}
        {place.phone && (
          <a href={`tel:${place.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
            <Phone className="w-3 h-3" /> {place.phone}
          </a>
        )}
      </div>

      <a
        href={place.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-brand text-white font-bold text-xs py-2.5 rounded-xl transition"
      >
        <Navigation className="w-3.5 h-3.5" /> Get Directions
      </a>
    </div>
  );
}

function NearbySection({ title, icon: Icon, places, loading, status, emptyMsg, type }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-5 h-5 text-brand" />
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {status === 'granted' && !loading && (
          <span className="ml-auto text-xs text-gray-400">{places.length} found nearby</span>
        )}
      </div>

      {status !== 'granted' ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Enable location to see nearby {title.toLowerCase()}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <PlaceSkeleton key={i} />)}
        </div>
      ) : places.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <WifiOff className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">{emptyMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {places.map((p) => <PlaceCard key={p.id} place={p} type={type} />)}
        </div>
      )}
    </div>
  );
}

// ─── Booking modal ───────────────────────────────────────────────────────────
function BookingModal({ item, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:00 AM - 09:00 AM');
  const [booked, setBooked] = useState(false);

  const priceINR = item.priceINR;
  const mrpINR = item.mrpINR;
  const saved = mrpINR ? mrpINR - priceINR : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-floating animate-zoom-in">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 relative">
          <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-white transition" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-brand" />
            <span className="text-sm font-bold text-gray-300">Complete Booking</span>
          </div>
          <h3 className="text-lg font-bold leading-snug">{item.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-black text-brand">
              ₹{priceINR?.toLocaleString('en-IN')}
            </span>
            {mrpINR && (
              <>
                <span className="text-sm text-gray-400 line-through">₹{mrpINR.toLocaleString('en-IN')}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  Save ₹{saved.toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>
        </div>

        {!booked ? (
          <form
            onSubmit={(e) => { e.preventDefault(); if (date) setBooked(true); }}
            className="p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand text-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time Slot</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand text-gray-700 bg-white text-sm"
              >
                <option>07:00 AM – 09:00 AM (Recommended for Fasting)</option>
                <option>09:00 AM – 11:00 AM</option>
                <option>11:00 AM – 01:00 PM</option>
                <option>02:00 PM – 04:00 PM</option>
                <option>04:00 PM – 06:00 PM</option>
              </select>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Total Payable</p>
                  <p className="text-xs text-gray-400">Pay at lab or via UPI / Card</p>
                </div>
              </div>
              <span className="text-xl font-black text-brand">₹{priceINR?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              Prices are indicative. Actual charges may vary by lab. Always confirm with the diagnostic centre.
            </div>
            <button
              type="submit"
              className="w-full bg-brand text-white font-bold py-3.5 rounded-2xl hover:bg-brand-dark transition shadow-md shadow-red-200 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Confirm Appointment
            </button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-800">Appointment Scheduled!</h4>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                <strong>{item.name}</strong> booked for <strong>{date}</strong> during{' '}
                <strong>{time.split('–')[0].trim()}</strong>.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-600 p-4 space-y-2 text-left">
              <div className="flex justify-between"><span>Status</span><span className="font-bold text-emerald-600">Confirmed</span></div>
              <div className="flex justify-between"><span>Price</span><span className="font-bold">₹{priceINR?.toLocaleString('en-IN')}</span></div>
            </div>
            <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Services() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'nearby';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // ── Geolocation state ──────────────────────────────────────────────────────
  const [geoState, setGeoState] = useState({ status: 'idle', lat: null, lon: null, address: '' });

  // ── Nearby data ────────────────────────────────────────────────────────────
  const [gyms, setGyms] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);

  // Request location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState((s) => ({ ...s, status: 'denied' }));
      return;
    }
    setGeoState((s) => ({ ...s, status: 'requesting' }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let address = '';
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const d = await r.json();
          const a = d.address || {};
          address = [a.suburb, a.city || a.town, a.state].filter(Boolean).join(', ');
        } catch { /* ignore */ }
        setGeoState({ status: 'granted', lat, lon, address });
      },
      () => setGeoState((s) => ({ ...s, status: 'denied' }))
    );
  }, []);

  // Auto-request on first load
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Fetch nearby gyms
  useEffect(() => {
    if (geoState.status !== 'granted' || !geoState.lat) return;
    setLoadingGyms(true);
    const q = buildQuery(geoState.lat, geoState.lon, ['fitness_centre', 'sports_centre', 'gym']);
    queryOverpass(q)
      .then((d) => setGyms(parseElements(d.elements || [], geoState.lat, geoState.lon)))
      .catch(() => setGyms([]))
      .finally(() => setLoadingGyms(false));
  }, [geoState.lat, geoState.lon, geoState.status]);

  // Fetch nearby pharmacies
  useEffect(() => {
    if (geoState.status !== 'granted' || !geoState.lat) return;
    setLoadingPharmacies(true);
    const q = buildQuery(geoState.lat, geoState.lon, ['pharmacy']);
    queryOverpass(q)
      .then((d) => setPharmacies(parseElements(d.elements || [], geoState.lat, geoState.lon)))
      .catch(() => setPharmacies([]))
      .finally(() => setLoadingPharmacies(false));
  }, [geoState.lat, geoState.lon, geoState.status]);

  const filteredTests = DIAGNOSTIC_TESTS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS = [
    { id: 'nearby',   label: 'Near Me',       icon: MapPin },
    { id: 'checkups', label: 'Health Checkups', icon: Stethoscope },
    { id: 'tests',    label: 'Lab Tests',       icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Hero banner */}
      <div className="gradient-brand py-14 text-white text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white, transparent 60%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Tony Health Services
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-5 mb-4 tracking-tight">
            Health Services Near You
          </h1>
          <p className="text-red-100 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Find nearby gyms, pharmacies, and diagnostic labs. Book health checkups and tests — all prices in Indian Rupees.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-8">

        {/* ── TAB: Near Me ──────────────────────────────────────────────── */}
        {activeTab === 'nearby' && (
          <div>
            <LocationCard geoState={geoState} onRequest={requestLocation} />

            {/* Nearest Gyms / Fitness Centres */}
            <NearbySection
              title="Gyms & Fitness Centres"
              icon={Dumbbell}
              places={gyms}
              loading={loadingGyms}
              status={geoState.status}
              emptyMsg="No gyms or fitness centres found within 8 km of your location."
              type="gym"
            />

            {/* Nearest Pharmacies */}
            <NearbySection
              title="Pharmacies & Medical Stores"
              icon={Pill}
              places={pharmacies}
              loading={loadingPharmacies}
              status={geoState.status}
              emptyMsg="No pharmacies found within 8 km of your location."
              type="pharmacy"
            />

            {/* Data attribution */}
            <p className="text-xs text-gray-400 text-center mt-6">
              Location data sourced from{' '}
              <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                OpenStreetMap
              </a>{' '}
              contributors. Results may be incomplete in some areas.
            </p>
          </div>
        )}

        {/* ── TAB: Health Checkup Packages ──────────────────────────────── */}
        {activeTab === 'checkups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {CHECKUP_PACKAGES.map((pkg) => {
              const BORDER = {
                red: 'border-red-200 hover:border-brand',
                emerald: 'border-emerald-200 hover:border-emerald-500',
                pink: 'border-pink-200 hover:border-pink-500',
                indigo: 'border-indigo-200 hover:border-indigo-500',
              };
              const BADGE = {
                red: 'bg-red-50 text-brand',
                emerald: 'bg-emerald-50 text-emerald-700',
                pink: 'bg-pink-50 text-pink-700',
                indigo: 'bg-indigo-50 text-indigo-700',
              };
              const saved = pkg.mrpINR - pkg.priceINR;
              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border-2 ${BORDER[pkg.color]} p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wide ${BADGE[pkg.color]}`}>
                        {pkg.category} Package
                      </span>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900">₹{pkg.priceINR.toLocaleString('en-IN')}</div>
                        <div className="flex items-center gap-2 justify-end mt-0.5">
                          <span className="text-sm text-gray-400 line-through">₹{pkg.mrpINR.toLocaleString('en-IN')}</span>
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Save ₹{saved.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 mb-6">{pkg.description}</p>
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3">
                      Included Tests ({pkg.features.length})
                    </h4>
                    <ul className="space-y-2.5 mb-8">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-gray-700 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setSelectedItem(pkg)}
                    className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-2xl hover:bg-brand transition-all flex items-center justify-center gap-2"
                  >
                    Book Package Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            <p className="col-span-full text-xs text-gray-400 text-center mt-2">
              Prices are indicative. Confirm with your chosen diagnostic centre before booking.
            </p>
          </div>
        )}

        {/* ── TAB: Individual Lab Tests ──────────────────────────────────── */}
        {activeTab === 'tests' && (
          <div className="max-w-4xl mx-auto">
            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3 mb-7">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests — e.g. ECG, Lipid, Blood Count, Thyroid…"
                className="flex-1 outline-none bg-transparent text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            <div className="space-y-3">
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white border border-gray-150 rounded-2xl px-6 py-4 hover:border-brand shadow-sm transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {test.category}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {test.duration}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-gray-800">{test.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <span className="text-2xl font-black text-brand">₹{test.priceINR.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => setSelectedItem(test)}
                        className="bg-red-50 text-brand hover:bg-brand hover:text-white font-bold px-5 py-2 rounded-xl transition text-sm"
                      >
                        Book Test
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-500 text-sm">
                  No tests found for <strong>"{searchQuery}"</strong>. Try "blood", "heart", or "thyroid".
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center mt-6">
              All prices are in Indian Rupees (₹). Indicative rates — confirm at lab before visiting.
            </p>
          </div>
        )}
      </div>

      {/* Booking modal */}
      {selectedItem && <BookingModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
