'use client';

import React from 'react';
import { Star } from 'lucide-react';
import StarRating from './StarRating';

interface RatingSummaryProps {
  stats: {
    averageRating: number;
    totalRatings: number;
    distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  };
}

export default function RatingSummary({ stats }: RatingSummaryProps) {
  const { averageRating, totalRatings, distribution } = stats;

  if (totalRatings === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        <Star className="mx-auto mb-2 text-slate-200" size={32} />
        <p className="font-bold">No ratings yet</p>
        <p className="text-xs mt-1">Be the first to review this instrument</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
      {/* Big number */}
      <div className="text-center flex-shrink-0">
        <p className="text-5xl font-black text-slate-900 leading-none">{averageRating}</p>
        <div className="mt-2">
          <StarRating rating={Math.round(averageRating)} readonly size={14} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star];
          const pct = totalRatings ? (count / totalRatings) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-2 text-slate-500 font-bold">{star}</span>
              <Star size={10} className="fill-slate-300 text-slate-300 flex-shrink-0" />
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-5 text-right text-slate-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
