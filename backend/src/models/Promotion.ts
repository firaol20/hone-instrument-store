import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  title: string;
  description?: string;
  bannerImage?: string;
  type: 'holiday' | 'price-drop' | 'banner' | 'special offer';
  status: 'active' | 'inactive';
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['holiday', 'price-drop', 'banner', 'special offer'],
      default: 'banner',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

promotionSchema.index({ status: 1 });
promotionSchema.index({ expiryDate: 1 });

export default mongoose.model<IPromotion>('Promotion', promotionSchema);
