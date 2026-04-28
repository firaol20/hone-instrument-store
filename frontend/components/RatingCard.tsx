'use client';

import React from 'react';
import StarRating from './StarRating';
import { CheckCircle } from 'lucide-react';

interface RatingCardProps {
  rating: {
    _id: string;
    rating: number;
    review: string;
    isVerifiedPurchase: boolean;
    customerId: { name: string };
    createdAt: string;
  };
}

export default function RatingCard({ rating }: RatingCardProps) {
  const timeAgo = React.useMemo(() => {
    try {
      const diff = Date.now() - new Date(rating.createdAt).getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 30) return `${days} days ago`;
      const months = Math.floor(days / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } catch {
      return '';
    }
  }, [rating.createdAt]);

  return (
    <div className="p-5 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center text-white text-xs font-black uppercase">
            {rating.customerId?.name?.[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm">
                {rating.customerId?.name || 'Anonymous'}
              </span>
              {rating.isVerifiedPurchase && (
                <span className="flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                  <CheckCircle size={9} className="inline" /> Verified
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">{timeAgo}</span>
          </div>
        </div>
        <StarRating rating={rating.rating} readonly size={14} />
      </div>

      {rating.review && (
        <p className="text-sm text-slate-600 leading-relaxed pl-11">{rating.review}</p>
      )}
    </div>
  );
}
