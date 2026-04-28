'use client';

import React, { useState } from 'react';
import StarRating from './StarRating';
import { useRatingStore } from '@/lib/rating-store';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface RatingFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function RatingForm({ productId, onSuccess }: RatingFormProps) {
  const [rating, setRatingValue] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const { setRating } = useRatingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      setLoading(true);
      await setRating(productId, rating, review.trim());
      toast.success('Thanks for your review!');
      setRatingValue(0);
      setReview('');
      onSuccess?.();
    } catch (err: any) {
      if (err.response?.status === 401 || err.message === 'Authentication required') {
        toast.error('Session expired', { description: 'Please log in again to save your rating.' });
      } else {
        toast.error(err.response?.data?.error || 'Failed to submit rating');
      }
    } finally {
      setLoading(false);
    }
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4"
    >
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Write a Review</h3>

      <div>
        <div className="flex items-center gap-3">
          <StarRating rating={rating} onRatingChange={setRatingValue} size={28} />
          {rating > 0 && (
            <span className="text-sm font-bold text-orange-600">{labels[rating]}</span>
          )}
        </div>
      </div>

      <div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this instrument... (optional)"
          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-orange-500/20 outline-none"
          rows={3}
          maxLength={1000}
        />
        <p className="text-[10px] text-slate-400 text-right mt-1">{review.length}/1000</p>
      </div>

      <button
        type="submit"
        disabled={rating === 0 || loading}
        className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
