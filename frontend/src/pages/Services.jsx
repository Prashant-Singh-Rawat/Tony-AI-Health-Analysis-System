import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Search, Calendar, User, Clock, CheckCircle, FileText, ChevronRight, Stethoscope, Activity, ShieldCheck, CreditCard } from 'lucide-react';
import MainNav from '../components/MainNav';
import AuthModal from '../components/AuthModal';

const CHECKUP_PACKAGES = [
  {
    id: 'chk-basic',
    name: 'Essential Health Checkup',
    price: '$99',
    description: 'Perfect for a regular preventive wellness screening.',
    features: ['Complete Blood Count (CBC)', 'Fast Blood Glucose', 'Lipid Profile (Cholesterol)', 'Urine Routine Analysis', 'Doctor Consultation'],
    category: 'General',
    color: 'emerald'
  },
  {
    id: 'chk-cardiac',
    name: 'Comprehensive Cardiac Care',
    price: '$249',
    description: 'Advanced evaluation of heart and cardiovascular health.',
    features: ['Electrocardiogram (ECG)', 'Echocardiogram (ECHO)', 'Lipid Profile & HbA1c', 'Treadmill Test (TMT)', 'Senior Cardiologist Review'],
    category: 'Cardiac',
    color: 'red'
  },
  {
    id: 'chk-women',
    name: 'Women Wellness Platinum',
    price: '$199',
    description: 'Specially curated checkup covering key female health markers.',
    features: ['Thyroid Profile (T3, T4, TSH)', 'Vitamin D & B12 Levels', 'Bone Mineral Density Scan', 'Mammography / Ultrasound', 'Gynaecologist Consultation'],
    category: 'Women',
    color: 'pink'
  },
  {
    id: 'chk-senior',
    name: 'Active Senior Citizens (Co-ed)',
    price: '$179',
    description: 'Comprehensive screening tailored for older adults.',
    features: ['Kidney Function Test (KFT)', 'Liver Function Test (LFT)', 'PSA (for men) / Thyroid', 'Arthritis Panel (Rheumatoid)', 'Geriatric Consultation'],
    category: 'Senior',
    color: 'indigo'
  }
];

const DIAGNOSTIC_TESTS = [
  { id: 'tst-ecg', name: 'Electrocardiogram (ECG)', price: '$35', duration: '15 mins', category: 'Heart' },
  { id: 'tst-echo', name: '2D Echocardiography (ECHO)', price: '$120', duration: '30 mins', category: 'Heart' },
  { id: 'tst-lipid', name: 'Lipid Profile Panel', price: '$25', duration: '10 mins', category: 'Blood' },
  { id: 'tst-hba1c', name: 'HbA1c (Glycated Haemoglobin)', price: '$20', duration: '10 mins', category: 'Blood' },
  { id: 'tst-cbc', name: 'Complete Blood Count', price: '$15', duration: '10 mins', category: 'Blood' },
  { id: 'tst-tsh', name: 'Thyroid Stimulating Hormone (TSH)', price: '$18', duration: '10 mins', category: 'Hormones' },
  { id: 'tst-lft', name: 'Liver Function Test (LFT)', price: '$30', duration: '15 mins', category: 'Organs' },
  { id: 'tst-kft', name: 'Kidney Function Test (KFT)', price: '$30', duration: '15 mins', category: 'Organs' },
  { id: 'tst-vitd', name: 'Vitamin D (25-Hydroxy)', price: '$45', duration: '10 mins', category: 'Vitamins' },
];

export default function Services() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'checkups';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [isBooked, setIsBooked] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const filteredTests = DIAGNOSTIC_TESTS.filter(tst =>
    tst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tst.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenBooking = (item) => {
    setSelectedPackage(item);
    setIsBooked(false);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingDate) return;
    setIsBooked(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <MainNav />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 py-16 text-white text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
            Tony Health Diagnostics
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4 tracking-tight">
            Book Health checkups & Diagnostic Tests
          </h1>
          <p className="text-red-100 max-w-2xl mx-auto text-base md:text-lg">
            Choose from a wide variety of comprehensive preventive packages or specific individual diagnostics. Take control of your health today.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="container mx-auto px-6 mt-10">
        <div className="flex justify-center border-b border-gray-200 mb-8 max-w-lg mx-auto bg-white p-1.5 rounded-full shadow-sm">
          <button
            onClick={() => setActiveTab('checkups')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all ${
              activeTab === 'checkups'
                ? 'bg-brand text-white shadow-md'
                : 'text-slate-500 hover:text-brand'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Health Checkups
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all ${
              activeTab === 'tests'
                ? 'bg-brand text-white shadow-md'
                : 'text-slate-500 hover:text-brand'
            }`}
          >
            <Activity className="w-4 h-4" /> Tests & Services
          </button>
        </div>

        {/* Tab 1: Health Checkup Packages */}
        {activeTab === 'checkups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {CHECKUP_PACKAGES.map((pkg) => {
              const borderColors = {
                red: 'border-red-200 hover:border-red-500 hover:shadow-red-50',
                emerald: 'border-emerald-200 hover:border-emerald-500 hover:shadow-emerald-50',
                pink: 'border-pink-200 hover:border-pink-500 hover:shadow-pink-50',
                indigo: 'border-indigo-200 hover:border-indigo-500 hover:shadow-indigo-50',
              };

              const badgeColors = {
                red: 'bg-red-50 text-red-700',
                emerald: 'bg-emerald-50 text-emerald-700',
                pink: 'bg-pink-50 text-pink-700',
                indigo: 'bg-indigo-50 text-indigo-700',
              };

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border ${borderColors[pkg.color]} p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wide ${badgeColors[pkg.color]}`}>
                        {pkg.category} Package
                      </span>
                      <div className="text-3xl font-black text-slate-900">{pkg.price}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{pkg.name}</h3>
                    <p className="text-sm text-slate-500 mb-6">{pkg.description}</p>
                    
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">Included Tests ({pkg.features.length})</h4>
                    <ul className="space-y-2.5 mb-8">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(pkg)}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-brand transition-all flex items-center justify-center gap-2"
                  >
                    Book Package Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Individual Diagnostic Tests */}
        {activeTab === 'tests' && (
          <div className="max-w-4xl mx-auto">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 mb-8">
              <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search diagnostic tests (e.g. ECG, lipid, blood count, organ profile...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none bg-transparent text-slate-700 font-medium py-2 placeholder-slate-400"
              />
            </div>

            {/* Test Cards List */}
            <div className="space-y-4">
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white border border-gray-150 rounded-2xl p-6 hover:border-brand shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {test.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {test.duration}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">{test.name}</h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <div className="text-2xl font-black text-brand">{test.price}</div>
                      <button
                        onClick={() => handleOpenBooking(test)}
                        className="bg-red-50 text-brand hover:bg-brand hover:text-white font-bold px-6 py-2.5 rounded-xl transition-all"
                      >
                        Book Test
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center text-slate-500">
                  No tests found matching "{searchQuery}". Try searching for keywords like "ECG", "Blood", or "Heart".
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Dialog Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedPackage(null)}
                className="absolute right-6 top-6 text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" /> Complete Booking
              </h3>
              <p className="text-slate-400 text-sm mt-1">{selectedPackage.name}</p>
            </div>

            {/* Booking flow */}
            {!isBooked ? (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-brand text-slate-700"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Preferred Slot</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-brand text-slate-700 bg-white"
                  >
                    <option>07:00 AM - 09:00 AM (Recommended for Fasting Blood Tests)</option>
                    <option>09:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 01:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-bold text-slate-800">Total Price</div>
                      <div className="text-xs text-slate-400">Pay at clinic or online</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-brand">{selectedPackage.price}</div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand text-white font-bold py-3.5 rounded-2xl hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                >
                  <ShieldCheck className="w-5 h-5" /> Confirm Appointment
                </button>
              </form>
            ) : (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400 shadow-md">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-800">Appointment Scheduled!</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                    Your appointment for <strong>{selectedPackage.name}</strong> is confirmed on <strong>{bookingDate}</strong> during <strong>{bookingTime.split(' ')[0]}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl text-left border border-gray-100 space-y-2 text-sm text-slate-600 max-w-sm mx-auto">
                  <div className="flex justify-between"><span>Status:</span><span className="font-bold text-emerald-600 uppercase text-xs">Confirmed</span></div>
                  <div className="flex justify-between"><span>Price:</span><span className="font-bold text-slate-800">{selectedPackage.price}</span></div>
                  <div className="flex justify-between"><span>Location:</span><span className="font-bold text-slate-800">Tony Health Central Lab</span></div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPackage(null);
                      setIsAuthOpen(true);
                    }}
                    className="flex-1 bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition shadow-md shadow-red-50"
                  >
                    Sign In to Sync
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
