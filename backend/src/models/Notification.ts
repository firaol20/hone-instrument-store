import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index to automatically delete notifications after 30 days
// 30 days * 24 hours * 60 minutes * 60 seconds = 2592000 seconds
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model<INotification>('Notification', notificationSchema);
