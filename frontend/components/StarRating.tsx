'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  onRatingChange,
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  const display = hoverRating || rating;

  return (
    <div className="flex gap-0.5">
      {[...Array(maxRating)].map((_, i) => {
        const val = i + 1;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(val)}
            onMouseEnter={() => !readonly && setHoverRating(val)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
            aria-label={`Rate ${val} stars`}
          >
            <Star
              size={size}
              className={val <= display
                ? 'fill-orange-500 text-orange-500'
                : 'fill-slate-200 text-slate-200'}
            />
          </button>
        );
      })}
    </div>
  );
}
