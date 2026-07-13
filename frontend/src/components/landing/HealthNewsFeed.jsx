import React, { useEffect, useState, useCallback } from 'react';
import { ExternalLink, RefreshCw, Wifi, WifiOff, Calendar, Tag, Sparkles } from 'lucide-react';
import { fetchHealthNews, formatNewsDate } from '../../services/healthNewsService';

export default function HealthNewsFeed({ count = 6 }) {
  const [state, setState] = useState({ articles: [], loading: true, unavailable: false, error: null, lastFetched: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const result = await fetchHealthNews(count);
    setState({
      articles: result.articles,
      loading: false,
      unavailable: result.unavailable,
      error: result.error,
      lastFetched: new Date(),
    });
  }, [count]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-14">
          <div>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-3">Health Intelligence</p>
            <h2 className="text-3xl sm:text-4.5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              Global Medical Releases
            </h2>
            <p className="text-gray-500 mt-4 text-sm font-medium">
              Verified clinical updates from WHO, NIH, and CDC. Real news, zero speculation.
            </p>
          </div>
          <div className="flex items-center gap-3.5">
            {state.lastFetched && (
              <span className="text-xs text-gray-400 font-semibold hidden sm:block">
                Refreshed {formatNewsDate(state.lastFetched)}
              </span>
            )}
            <button
              onClick={load}
              disabled={state.loading}
              className="w-10 h-10 bg-white dark:bg-gray-950 border border-gray-150 rounded-xl flex items-center justify-center text-gray-500 hover:text-brand transition"
              aria-label="Refresh news"
            >
              <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin-slow' : ''}`} />
            </button>
          </div>
        </div>

        {/* Source Feed Strip */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {['WHO', 'NIH', 'CDC', 'NHS'].map((src) => (
            <span key={src} className="text-xs font-black bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 text-gray-650 dark:text-gray-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {src} Feed
            </span>
          ))}
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
          {state.loading ? (
            Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6.5 space-y-4">
                <div className="skeleton h-44 w-full rounded-2xl" />
                <div className="skeleton h-4.5 w-1/4" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-5 w-5/6" />
              </div>
            ))
          ) : state.unavailable ? (
            <div className="col-span-full bg-white dark:bg-gray-950 border border-dashed border-gray-200 rounded-3xl p-16 text-center max-w-lg mx-auto">
              <WifiOff className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 font-bold">News Streams Offline</p>
              <p className="text-xs text-gray-400 mt-1">Unable to load RSS news. Check your connection and try again.</p>
            </div>
          ) : (
            state.articles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6.5 flex flex-col justify-between hover-lift transition duration-300 shadow-sm"
              >
                <div className="space-y-4.5">
                  <div className="relative h-44 bg-red-50/20 dark:bg-gray-900 rounded-2xl overflow-hidden flex-shrink-0">
                    {article.thumbnail ? (
                      <img
                        src={article.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        <Sparkles className="w-12 h-12 text-brand" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-brand uppercase tracking-widest px-2.5 py-1 rounded-md shadow">
                      {article.sourceName}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Tag className="w-3.5 h-3.5 text-brand" />
                      <span className="font-bold uppercase tracking-wider">{article.category}</span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white leading-snug line-clamp-3 group-hover:text-brand transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4.5 border-t border-gray-100 dark:border-gray-900">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatNewsDate(article.publishedAt)}</span>
                  </div>
                  <span className="text-brand text-xs font-black flex items-center gap-1">
                    Read Release <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
