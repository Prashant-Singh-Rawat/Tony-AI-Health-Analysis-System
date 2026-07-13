import React from 'react';

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 border border-border-subtle bg-bg-surface/50 rounded-2xl animate-pulse space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-border-subtle rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-border-subtle rounded w-28" />
                <div className="h-3 bg-border-subtle rounded w-20" />
              </div>
            </div>
            <div className="h-6 bg-border-subtle rounded-full w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-border-subtle rounded w-3/4" />
            <div className="h-3 bg-border-subtle rounded w-1/2" />
          </div>
          <div className="h-10 bg-border-subtle rounded-xl w-full" />
        </div>
      ))}
    </>
  );
}
