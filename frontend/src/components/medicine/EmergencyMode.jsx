import React from 'react';
import { ShieldAlert, X, PhoneCall, Heart, Clock, Navigation } from 'lucide-react';

export default function EmergencyMode({ isOpen, onClose }) {
  if (!isOpen) return null;

  const EMERGENCY_CONTACTS = [
    { name: 'National Medical Helpline', phone: '1800-180-1104', type: 'Toll-Free' },
    { name: 'Emergency Ambulance Services', phone: '102', type: 'Emergency Response' },
    { name: 'Disaster Management Services', phone: '108', type: 'Emergency Care' },
    { name: 'Centralized Health Helpline', phone: '112', type: 'Primary Emergency' },
  ];

  const NEARBY_24H_PHARMACIES = [
    { name: 'Max Pharmacy 24/7 — Saket', phone: '+91-11-26515050', distance: '1.2 km' },
    { name: 'Fortis Pharmacy 24/7 — Shalimar Bagh', phone: '+91-11-42776222', distance: '2.8 km' },
    { name: 'Apollo Pharmacy 24/7 — Safdarjung', phone: '+91-11-26162334', distance: '0.8 km' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-bg-base border border-rose-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-zoom-in">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1 bg-black/20 hover:bg-black/35 rounded-full transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
            <div>
              <h2 className="text-xl font-black">🚨 EMERGENCY MODE ACTIVE</h2>
              <p className="text-xs text-rose-100 mt-0.5">Instant connection to 24-hour pharmaceutical dispatch</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Emergency Contacts */}
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-3">
              National Emergency Helplines
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMERGENCY_CONTACTS.map((contact, idx) => (
                <a
                  key={idx}
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between p-3.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-2xl transition group"
                >
                  <div>
                    <span className="text-xs font-bold text-text-main group-hover:text-rose-500 transition-colors block">
                      {contact.name}
                    </span>
                    <span className="text-[9px] text-text-muted mt-0.5 block">{contact.type}</span>
                  </div>
                  <span className="bg-rose-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* 24-hour stores */}
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-3">
              Nearest 24-Hour Pharmacies
            </span>
            <div className="space-y-2.5">
              {NEARBY_24H_PHARMACIES.map((store, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-bg-surface border border-border-subtle rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-main block">{store.name}</span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                        <Navigation className="w-3 h-3 text-brand-primary" /> {store.distance} away
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${store.phone}`}
                    className="text-xs font-extrabold text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/5 px-3 py-2 rounded-lg transition"
                  >
                    Call Pharmacy
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-bg-surface-hover/50 p-4 border-t border-border-subtle text-center">
          <p className="text-[9px] text-text-muted leading-normal">
            For critical life-threatening conditions, please call 102/112 or visit the nearest hospital emergency room immediately.
          </p>
        </div>

      </div>
    </div>
  );
}
