import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, ShieldAlert, AlertTriangle, Info,
  ShoppingCart, Star, MapPin, ChevronDown, ChevronUp, AlertCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedicineRecommendationCard({ drug, onOrder }) {
  const [expanded, setExpanded] = useState(false);

  const priceINR = drug.price_inr;
  const mrpINR = drug.mrp_inr;
  const saved = mrpINR ? mrpINR - priceINR : 0;

  return (
    <div className="premium-glass-card p-6 border-2 border-red-100/50 hover:border-brand/40 shadow-sm hover:shadow-raised transition duration-300 flex flex-col justify-between items-stretch">
      {/* Upper header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-black uppercase bg-red-50 text-brand px-2.5 py-1 rounded-md tracking-wider">
              {drug.category}
            </span>
            {drug.prescription_required ? (
              <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Rx Required
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                OTC Drug
              </span>
            )}
          </div>

          <span className="text-[10px] font-black text-gray-500 uppercase bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {drug.doctor_status}
          </span>
        </div>

        {/* Info & Description */}
        <h3 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg tracking-tight leading-snug">
          {drug.name}
        </h3>
        <p className="text-xs text-gray-400 font-semibold mt-0.5 italic">{drug.generic_name}</p>

        {/* Reason / Purpose */}
        <div className="bg-red-50/20 border border-red-50/40 rounded-2xl p-4.5 mt-4 space-y-2">
          <p className="text-xs text-gray-700 dark:text-gray-250 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand animate-pulse-brand" /> Why Recommended
          </p>
          <p className="text-xs text-gray-550 leading-relaxed font-semibold">
            {drug.reason_recommended}
          </p>
        </div>

        {/* Purpose summary */}
        <p className="text-xs text-gray-450 mt-4 leading-relaxed pl-1 border-l-2 border-brand">
          {drug.purpose}
        </p>

        {/* Schedule & Dosage */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Recommended Dosage</p>
            <p className="text-xs font-bold text-gray-800 dark:text-white mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand" /> {drug.dosage || 'Consult Physician'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Administration</p>
            <p className="text-xs font-bold text-gray-800 dark:text-white mt-1">
              {drug.food_relation || 'After Food'}
            </p>
          </div>
        </div>

        {/* Schedule Tags */}
        <div className="flex gap-2 mt-4">
          {['Morning', 'Afternoon', 'Night'].map((time) => {
            const isScheduled = drug.schedule[time.toLowerCase()];
            return (
              <span
                key={time}
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                  isScheduled
                    ? 'bg-brand/5 border-brand/20 text-brand'
                    : 'bg-gray-50 border-gray-150 text-gray-400'
                }`}
              >
                {time}
              </span>
            );
          })}
        </div>

        {/* Nearby Pharmacy */}
        <div className="mt-5.5 flex items-center gap-2.5 text-xs font-bold text-gray-650 dark:text-gray-300">
          <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
          <span>{drug.nearby_pharmacy} ({drug.distance_km} km)</span>
          <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black uppercase tracking-wider">
            {drug.delivery_time} Delivery
          </span>
        </div>
      </div>

      {/* Expandable Side Effects / Warnings */}
      <div className="mt-5.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400 hover:text-brand transition py-2"
        >
          <span>Safety, Warnings & Alternatives</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 pt-3.5 border-t border-gray-100 dark:border-gray-900 mt-2 text-xs"
            >
              <div className="space-y-1.5">
                <p className="font-bold text-gray-450 flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-brand" /> Side Effects
                </p>
                <p className="text-gray-500 leading-relaxed font-semibold pl-6">{drug.side_effects}</p>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-gray-450 flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600" /> Warnings & Contraindications
                </p>
                <p className="text-gray-500 leading-relaxed font-semibold pl-6">{drug.warnings}</p>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-gray-450 flex items-center gap-1.5">
                  <Info className="w-4.5 h-4.5 text-blue-500" /> Key Drug Interactions
                </p>
                <p className="text-gray-500 leading-relaxed font-semibold pl-6">{drug.interactions}</p>
              </div>

              {/* Alternatives */}
              {drug.alternatives && drug.alternatives.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-900">
                  <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Alternative Generic Formulations</p>
                  <div className="grid grid-cols-2 gap-2">
                    {drug.alternatives.map((alt) => (
                      <div key={alt.name} className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-850">
                        <p className="font-extrabold text-gray-800 dark:text-white leading-tight">{alt.name}</p>
                        <p className="text-[10px] text-brand font-black mt-1">₹{alt.price_inr}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pricing and Action button */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between">
        <div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            ₹{priceINR.toLocaleString('en-IN')}
          </div>
          {mrpINR && saved > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-450 line-through">₹{mrpINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save ₹{saved}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => onOrder(drug)}
          className="bg-brand hover:bg-brand-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-red-200 dark:shadow-none flex items-center gap-1.5"
        >
          <ShoppingCart className="w-4.5 h-4.5" /> Order Now
        </button>
      </div>
    </div>
  );
}
