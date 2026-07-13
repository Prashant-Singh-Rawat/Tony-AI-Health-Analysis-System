import React from 'react';
import { Star, Truck, ShieldCheck, MapPin } from 'lucide-react';

export default function PharmacyCard({ pharmacy, onOrder }) {
  const { name, distance, rating, deliveryTime, deliveryFee, isOpen, is24Hour, emoji, address, providerId } = pharmacy;

  return (
    <div className={`glass-panel border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md ${
      isOpen ? 'border-border-subtle' : 'border-rose-500/20 bg-rose-500/5'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-bg-surface-hover rounded-xl shadow-inner">{emoji || '🏥'}</span>
          <div>
            <h3 className="font-bold text-text-main text-sm leading-snug line-clamp-1">{name}</h3>
            <span className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-brand-primary" /> {address}
            </span>
          </div>
        </div>
        <span className="text-xs bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded uppercase">
          {providerId.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-bg-surface-hover/30 border border-border-subtle/50 rounded-xl p-3 mb-4">
        <div className="text-center border-r border-border-subtle/50">
          <span className="text-[10px] text-text-muted block uppercase tracking-wide">Distance</span>
          <span className="font-bold text-xs text-text-main">{distance} km</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-text-muted block uppercase tracking-wide">Delivery Time</span>
          <span className="font-bold text-xs text-text-main">{deliveryTime} mins</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-500" /> {rating}
        </div>
        <div className="flex items-center gap-1 text-text-muted font-medium">
          <Truck className="w-3.5 h-3.5" /> {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle/40">
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-xs font-semibold text-text-main">
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
          {is24Hour && (
            <span className="text-[9px] bg-indigo-500/10 text-indigo-500 font-extrabold px-1.5 py-0.5 rounded-full border border-indigo-500/20">
              24H
            </span>
          )}
        </div>
        <button
          onClick={onOrder}
          disabled={!isOpen}
          className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition ${
            isOpen
              ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/10'
              : 'bg-border-subtle text-text-muted cursor-not-allowed'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Select Store
        </button>
      </div>
    </div>
  );
}
