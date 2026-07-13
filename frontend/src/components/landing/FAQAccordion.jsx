import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

const FAQS = [
  {
    question: 'How accurate is the AI medical report analysis?',
    answer: 'Our report analysis uses the advanced Google Gemini LLM API, checking for biological markers, common range boundaries, and known clinical risk vectors. It acts as an educational and preventive summary, not a medical replacement. Always review summaries with your consulting physician.'
  },
  {
    question: 'Are my medical documents and files secure?',
    answer: 'Yes, completely. Files uploaded for analysis are processed using end-to-end encryption. The system strictly follows privacy guidelines, and no health record data is shared with third parties or advertisers without explicit clinical consent.'
  },
  {
    question: 'How does the Hospital and Doctor locator work?',
    answer: 'The locator runs queries directly against OpenStreetMap using the live Overpass API based on your current coordinate coordinates. This ensures that you see actual, physical healthcare facilities nearest to you, without artificial ratings or paid promotions.'
  },
  {
    question: 'Can I purchase prescription medicines here?',
    answer: 'Yes. Our medicine portal aggregates search lookup queries across major trusted pharmacy channels in India (including Blinkit, Tata 1mg, Apollo 24/7). You can compare estimates, view alternative generic formulations, and complete bookings securely.'
  }
];

export default function FAQAccordion() {
  const [activeIdx, setActiveIdx] = useState(null);

  const toggle = (idx) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-3">Support Center</p>
          <h2 className="text-3xl sm:text-4.5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 mt-4 text-sm font-medium">
            Learn more about our AI-driven features, user privacy guidelines, and integrations.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = activeIdx === i;
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-brand flex-shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed pl-14">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
