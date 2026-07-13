import React from 'react';
import { DELIVERY_STEPS } from '../../hooks/useDeliveryTracking';
import { Truck, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function DeliveryTracker({ tracking }) {
  const { activeOrder, currentStep, currentStepIndex, stepTimestamps, cancelOrder } = tracking;

  if (!activeOrder) return null;

  return (
    <div className="glass-panel border border-brand-primary/20 bg-brand-primary/5 rounded-3xl p-6 shadow-md mb-8 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle/60 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
              Live Delivery Tracking
            </span>
          </div>
          <h3 className="font-extrabold text-base text-text-main mt-1">
            Order Reference: {activeOrder.id}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Item: <span className="font-semibold">{activeOrder.medicine?.name}</span> • Provider:{' '}
            <span className="font-bold text-brand-primary uppercase">
              {activeOrder.medicine?.providerId.replace('_', ' ')}
            </span>
          </p>
        </div>
        <button
          onClick={cancelOrder}
          className="text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-lg transition"
        >
          Cancel Order
        </button>
      </div>

      {/* Horizontal Steps Indicator */}
      <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
        {DELIVERY_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isFuture = idx > currentStepIndex;

          return (
            <div key={step.key} className="flex-1 flex md:flex-col items-start md:items-center text-left md:text-center relative">
              {/* Connector line for horizontal view */}
              {idx < DELIVERY_STEPS.length - 1 && (
                <div
                  className={`hidden md:block absolute top-5 left-[50%] right-[-50%] h-0.5 -z-10 ${
                    idx < currentStepIndex ? 'bg-brand-primary' : 'bg-border-subtle'
                  }`}
                />
              )}

              {/* Icon Container */}
              <div className="flex items-center justify-center mr-4 md:mr-0 mb-0 md:mb-3">
                {isCompleted ? (
                  <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-md shadow-brand-primary/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : isActive ? (
                  <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center ring-4 ring-brand-primary/20 animate-pulse shadow-md">
                    <Truck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-bg-surface border border-border-subtle text-text-muted rounded-full flex items-center justify-center shadow-inner">
                    <Circle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Text Area */}
              <div>
                <span
                  className={`text-xs font-bold block ${
                    isActive ? 'text-brand-primary' : isFuture ? 'text-text-muted' : 'text-text-main'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 block leading-relaxed max-w-[150px] md:mx-auto">
                  {step.desc}
                </span>
                {stepTimestamps[step.key] && (
                  <span className="text-[9px] font-extrabold text-brand-secondary bg-brand-secondary/5 border border-brand-secondary/15 px-1.5 py-0.5 rounded-full mt-1.5 inline-block">
                    ⏱ {stepTimestamps[step.key]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
