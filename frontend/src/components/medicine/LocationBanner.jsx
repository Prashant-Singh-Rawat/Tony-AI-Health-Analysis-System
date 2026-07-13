import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Compass, AlertCircle, Sparkles } from 'lucide-react';

export default function LocationBanner({ location }) {
  const { status, address, error, requestLocation, setManualAddress } = location;
  const [manualInput, setManualInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setManualAddress(manualInput.trim());
    setShowInput(false);
  };

  return (
    <div className="relative z-10 w-full mb-10">
      <AnimatePresence mode="wait">
        {status === 'granted' ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-2xl p-4.5 text-xs sm:text-sm"
          >
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
            <MapPin className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-black text-emerald-800">Active Delivery Address</p>
              <p className="text-emerald-700 font-semibold line-clamp-1 mt-0.5">{address}</p>
            </div>
            <button
              onClick={requestLocation}
              className="ml-auto text-xs font-black text-emerald-600 hover:text-emerald-800 bg-white border border-emerald-100 rounded-lg px-3 py-1.5 transition"
            >
              Refresh GPS
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-3xl p-6.5 shadow-floating flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-brand" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-base">Select Delivery Location</h4>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  We need your location to find nearby pharmacies and check fast delivery times.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={requestLocation}
                disabled={status === 'requesting'}
                className="bg-brand text-white font-extrabold text-xs px-5 py-3.5 rounded-xl hover:bg-brand-dark transition shadow-md shadow-red-200 dark:shadow-none flex items-center gap-1.5"
              >
                <Compass className={`w-4 h-4 ${status === 'requesting' ? 'animate-spin-slow' : ''}`} />
                {status === 'requesting' ? 'Detecting…' : 'Share Location'}
              </button>

              <button
                onClick={() => setShowInput(!showInput)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 text-gray-700 dark:text-gray-300 font-extrabold text-xs px-5 py-3.5 rounded-xl hover:bg-gray-100 transition"
              >
                Enter Manually
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInput && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mt-4 bg-white dark:bg-gray-950 border border-gray-150 rounded-2xl p-4.5 flex gap-2"
          >
            <input
              type="text"
              required
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter city or area name..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand font-semibold text-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="bg-gray-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-brand transition"
            >
              Save
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
