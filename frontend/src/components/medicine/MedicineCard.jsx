import React from 'react';
import { ShoppingCart, Heart, Activity, AlertCircle, HelpCircle } from 'lucide-react';

export default function MedicineCard({ medicine, onOrder, onExplain }) {
  const {
    name,
    genericName,
    strength,
    packSize,
    prescriptionRequired,
    priceINR,
    mrpINR,
    provider,
    category
  } = medicine;

  const saved = mrpINR ? mrpINR - priceINR : 0;

  return (
    <div className="premium-glass-card p-6.5 flex flex-col justify-between items-stretch hover:border-brand/35 transition duration-300">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-black uppercase bg-red-50 dark:bg-red-950/20 text-brand px-2.5 py-1 rounded-md">
              {category || 'General'}
            </span>
            {prescriptionRequired && (
              <span className="text-[10px] font-black uppercase bg-amber-50 dark:bg-amber-950/20 text-amber-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Rx Required
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
            {provider || 'Local Pharmacy'}
          </span>
        </div>

        <h4 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug">{name}</h4>
        <p className="text-xs text-gray-400 mt-1 font-semibold">{genericName || 'Generic Formulation'}</p>

        <div className="flex items-center gap-3.5 text-xs text-gray-500 font-semibold mt-4">
          <span>Strength: <strong className="text-gray-800 dark:text-white font-bold">{strength || 'N/A'}</strong></span>
          <span>Pack: <strong className="text-gray-800 dark:text-white font-bold">{packSize || 'N/A'}</strong></span>
        </div>
      </div>

      <div className="mt-6.5 pt-4.5 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between">
        <div>
          <div className="text-2xl font-black text-gray-950 dark:text-white">
            ₹{priceINR?.toLocaleString('en-IN')}
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

        <div className="flex gap-2">
          <button
            onClick={() => onExplain(name)}
            className="w-10 h-10 bg-gray-50 dark:bg-gray-900 hover:bg-red-50 text-gray-650 hover:text-brand border border-gray-150 rounded-xl flex items-center justify-center transition"
            aria-label="Explain medication action"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOrder(medicine)}
            className="bg-brand hover:bg-brand-dark text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl transition shadow-md shadow-red-200 dark:shadow-none flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" /> Order
          </button>
        </div>
      </div>
    </div>
  );
}
