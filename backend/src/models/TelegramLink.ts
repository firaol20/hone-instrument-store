import mongoose, { Document, Schema } from 'mongoose';

export interface ITelegramLink extends Document {
  productId: mongoose.Types.ObjectId | string;
  telegramMessageId: string;
  telegramChatId: string;
  userId: number;
  importMethod: string;
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
    telegramChatId: {
      type: String,
      required: false,
      default: '',
    },
    userId: {
      type: Number,
      default: 0,
    },
    importMethod: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
telegramLinkSchema.index({ productId: 1 });
telegramLinkSchema.index({ telegramChatId: 1 });
telegramLinkSchema.index({ telegramMessageId: 1 });

export default mongoose.model<ITelegramLink>('TelegramLink', telegramLinkSchema);
