import mongoose, { Document, Schema } from 'mongoose';

export interface IMediaAsset extends Document {
  name: string;
  url: string;
  type: string;
  size: number;
  cloudinaryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    cloudinaryId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

mediaAssetSchema.index({ type: 1 });

export default mongoose.model<IMediaAsset>('MediaAsset', mediaAssetSchema);
