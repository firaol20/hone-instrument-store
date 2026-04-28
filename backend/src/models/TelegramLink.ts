import mongoose, { Document, Schema } from 'mongoose';

export interface ITelegramLink extends Document {
  productId: mongoose.Types.ObjectId | string;
  telegramMessageId: string;
  telegramGroupId: string;
  createdAt: Date;
  updatedAt: Date;
}

const telegramLinkSchema = new Schema<ITelegramLink>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    telegramMessageId: {
      type: String,
      required: false,
      default: '',
    },
    telegramGroupId: {
      type: String,
      required: false,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
telegramLinkSchema.index({ productId: 1 });
telegramLinkSchema.index({ telegramGroupId: 1 });

export default mongoose.model<ITelegramLink>('TelegramLink', telegramLinkSchema);
