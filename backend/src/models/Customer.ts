import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  type: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId | string;
  phone: string;
  name: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  type: {
    type: String,
    default: 'home',
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

const customerSchema = new Schema<ICustomer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// Index for queries
customerSchema.index({ userId: 1 });

export default mongoose.model<ICustomer>('Customer', customerSchema);
