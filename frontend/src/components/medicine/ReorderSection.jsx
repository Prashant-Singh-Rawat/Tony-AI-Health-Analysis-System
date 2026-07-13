import React from 'react';
import { History, Star, ShoppingCart } from 'lucide-react';

export default function ReorderSection({ onSelectMedicine }) {
  const PREVIOUS_MEDICINES = [
    { name: 'Paracetamol 500mg', strength: '500mg', price: 12, providerId: 'blinkit', emoji: '💊' },
    { name: 'Atorvastatin 10mg', strength: '10mg', price: 45, providerId: 'blinkit', emoji: '❤️' },
  ];

  const FAVORITES = [
    { name: 'Cetirizine 10mg', strength: '10mg', price: 18, providerId: 'blinkit', emoji: '🌿' },
    { name: 'Vitamin D3 60000 IU', strength: '60000 IU', price: 55, providerId: 'apollo247', emoji: '☀️' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Recent Orders */}
      <div className="glass-panel border border-border-subtle rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-brand-primary" />
          <h4 className="font-extrabold text-sm text-text-main">Recent Orders</h4>
        </div>
        <div className="space-y-3">
          {PREVIOUS_MEDICINES.map((med, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-bg-surface-hover/30 border border-border-subtle/50 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{med.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-text-main block">{med.name}</span>
                  <span className="text-[10px] text-text-muted mt-0.5 block">{med.strength}</span>
                </div>
              </div>
              <button
                onClick={() => onSelectMedicine(med)}
                className="text-xs bg-brand-primary text-white font-bold px-3 py-1.5 rounded-lg hover:bg-brand-primary/90 transition flex items-center gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Reorder
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Favorites */}
      <div className="glass-panel border border-border-subtle rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h4 className="font-extrabold text-sm text-text-main">Favorites</h4>
        </div>
        <div className="space-y-3">
          {FAVORITES.map((med, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-bg-surface-hover/30 border border-border-subtle/50 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{med.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-text-main block">{med.name}</span>
                  <span className="text-[10px] text-text-muted mt-0.5 block">{med.strength}</span>
                </div>
              </div>
              <button
                onClick={() => onSelectMedicine(med)}
                className="text-xs border border-border-subtle text-text-main hover:bg-bg-surface-hover font-bold px-3 py-1.5 rounded-lg transition"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
