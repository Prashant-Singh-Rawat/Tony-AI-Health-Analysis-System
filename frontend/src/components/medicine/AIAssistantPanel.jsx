import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Brain, HeartHandshake, ShieldAlert, AlertCircle } from 'lucide-react';

const CLINICAL_RESPONSES = {
  'paracetamol': {
    explanation: 'Paracetamol (Acetaminophen) is a widely used analgesic (pain reliever) and antipyretic (fever reducer). It acts primarily in the central nervous system to block pain impulses and regulate core body temperature.',
    precautions: 'Do not exceed 4,000 mg in 24 hours to avoid liver toxicity. Avoid alcohol consumption during therapy.',
    sideEffects: 'Generally safe at correct doses. Rare side effects include skin rashes, nausea, or dark stools.',
  },
  'amoxicillin': {
    explanation: 'Amoxicillin is a moderate-spectrum, bactericidal beta-lactam antibiotic. It inhibits the synthesis of bacterial cell walls, leading to osmotic lysis and cell death.',
    precautions: 'Requires a valid prescription. Take full course even if feeling better to prevent resistance.',
    sideEffects: 'Nausea, diarrhoea, mild skin rash, or oral thrush.',
  },
  'aspirin': {
    explanation: 'Aspirin (Acetylsalicylic Acid) is a non-steroidal anti-inflammatory drug (NSAID) and antiplatelet agent. It irreversibly inhibits cyclooxygenase (COX-1 & COX-2) enzymes.',
    precautions: 'Monitor for signs of GI bleeding. Do not give to children or teenagers due to Reye syndrome risk.',
    sideEffects: 'Heartburn, indigestion, increased risk of bruising or bleeding.',
  }
};

export default function AIAssistantPanel({ isOpen, onClose, targetMedicine }) {
  const [loading, setLoading] = useState(false);
  const [medInfo, setMedInfo] = useState(null);

  React.useEffect(() => {
    if (!targetMedicine) return;
    setLoading(true);
    const key = targetMedicine.toLowerCase();
    
    // Simulate real clinical backend retrieval
    const timer = setTimeout(() => {
      const match = CLINICAL_RESPONSES[key] || {
        explanation: `${targetMedicine} is a common clinical formulation. It is used to treat diagnosed indications. For specific pharmaceutical details, refer to the packaging insert.`,
        precautions: 'Always consult your primary care doctor before starting new drug regimens.',
        sideEffects: 'Side effects may vary depending on patient characteristics and clinical history.'
      };
      setMedInfo(match);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [targetMedicine]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-lg h-full bg-white dark:bg-gray-950 shadow-floating flex flex-col border-l border-red-50/10"
        >
          {/* Header */}
          <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1">
                  AI Clinical Insights <Sparkles className="w-3.5 h-3.5 text-brand" />
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gemini-Powered Explanation</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="space-y-4 py-10">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            ) : medInfo ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pharmacological Action</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-250 leading-relaxed font-semibold">
                    {medInfo.explanation}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-2xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Precautions & Warnings</h5>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-semibold">
                      {medInfo.precautions}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100/30 rounded-2xl flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-brand flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-brand uppercase tracking-wider mb-1">Common Side Effects</h5>
                    <p className="text-xs text-gray-650 dark:text-gray-400 leading-relaxed font-semibold">
                      {medInfo.sideEffects}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Disclaimer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 text-[10px] text-gray-400 leading-relaxed flex gap-2">
            <HeartHandshake className="w-4 h-4 text-brand flex-shrink-0" />
            <span>
              Disclaimer: Provided for informational purposes only. Do not self-medicate. Consult a medical practitioner before modifying any dosage regimens.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
