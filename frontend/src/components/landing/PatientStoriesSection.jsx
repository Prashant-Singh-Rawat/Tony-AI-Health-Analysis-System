import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareQuote, ShieldCheck, User, Star, Quote } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

export default function PatientStoriesSection({ apiBase = API_BASE_URL }) {
  const [stories, setStories] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | empty | error | ready
  const [activeIdx, setActiveIdx] = useState(0);

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${apiBase}/testimonials?consent_granted=true`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const approved = (data.testimonials || []).filter((s) => s.consent_granted);
        setStories(approved);
        setStatus(approved.length === 0 ? 'empty' : 'ready');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setStatus(err.message.includes('404') ? 'empty' : 'error');
      }
    })();
    return () => controller.abort();
  }, [apiBase]);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + stories.length) % stories.length);
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Curved wave top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden rotate-180 line-height-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[30px]">
          <path d="M0 0 L1200 0 L1200 120 C600 120 600 0 0 0 Z" className="fill-gray-50 dark:fill-gray-900" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-3">Verified Testimonials</p>
          <h2 className="text-3xl sm:text-4.5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            Stories of Recovery
          </h2>
          <p className="text-gray-500 mt-4 text-sm font-medium">
            Read real, consent-approved recovery stories from patients treated at our clinical partner facilities.
          </p>
        </div>

        {status === 'loading' && (
          <div className="premium-glass-card p-10 space-y-4">
            <div className="skeleton h-5 w-1/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        )}

        {status === 'empty' && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 rounded-3xl p-16 text-center max-w-lg mx-auto">
            <MessageSquareQuote className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-bold">No Verified Patient Stories Yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Verified patient stories appear here once patients submit them with explicit display consent.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 rounded-3xl p-12 text-center max-w-lg mx-auto text-gray-500 text-sm">
            Clinical reviews are currently unavailable. Please refresh or try again later.
          </div>
        )}

        {status === 'ready' && stories.length > 0 && (
          <div className="relative">
            <AnimatePresence mode="wait">
              {stories.map((story, idx) => {
                if (idx !== activeIdx) return null;
                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="premium-glass-card p-8 md:p-12 relative"
                  >
                    <Quote className="absolute top-8 left-8 w-14 h-14 text-brand/10" />

                    <div className="relative z-10 space-y-6">
                      <blockquote className="text-base md:text-lg text-gray-700 dark:text-gray-250 italic font-semibold leading-relaxed">
                        "{story.testimonial}"
                      </blockquote>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-6 border-t border-gray-100 dark:border-gray-900">
                        <div className="flex items-center gap-4">
                          {story.photo_consent && story.photo_url ? (
                            <img
                              src={story.photo_url}
                              alt={story.display_name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-brand-soft"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                              <User className="w-7 h-7 text-brand/60" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-2">
                              {story.display_name}
                              <span className="flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-black uppercase">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </span>
                            </h4>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">
                              {story.city} · Treated for {story.treatment}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Clinical Facility</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{story.hospital}</p>
                          <p className="text-[10px] text-brand font-black uppercase tracking-wider">Recovery: {story.recovery_time || 'Standard'}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Slider Controls */}
            {stories.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={handlePrev}
                  className="w-11 h-11 bg-white dark:bg-gray-950 border border-gray-150 rounded-full flex items-center justify-center hover:border-brand hover:text-brand transition shadow-sm"
                  aria-label="Previous story"
                >
                  ❮
                </button>
                <button
                  onClick={handleNext}
                  className="w-11 h-11 bg-white dark:bg-gray-950 border border-gray-150 rounded-full flex items-center justify-center hover:border-brand hover:text-brand transition shadow-sm"
                  aria-label="Next story"
                >
                  ❯
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
