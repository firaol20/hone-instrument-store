import mongoose, { Document, Schema } from 'mongoose';

export interface IRatingStats extends Document {
  productId: mongoose.Types.ObjectId;
  averageRating: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
  totalRatings: number;
  updatedAt: Date;
}

const ratingStatsSchema = new Schema<IRatingStats>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    averageRating: { type: Number, default: 0 },
    rating1Count:  { type: Number, default: 0 },
    rating2Count:  { type: Number, default: 0 },
    rating3Count:  { type: Number, default: 0 },
    rating4Count:  { type: Number, default: 0 },
    rating5Count:  { type: Number, default: 0 },
    totalRatings:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

ratingStatsSchema.index({ productId: 1 });

export default mongoose.model<IRatingStats>('RatingStats', ratingStatsSchema);
