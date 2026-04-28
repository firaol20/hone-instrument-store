import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId | string;
  quantity: number;
  price: number;
}

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IAddress {
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  coordinates?: ICoordinates;
  mapUrl?: string;
  deliveryInstructions?: string;
  pickupStoreId?: string;
}

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId | string;
  items: IOrderItem[];
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  total: number;
  subtotal: number;
  shippingFee: number;
  address: IAddress;
  deliveryOption: 'standard' | 'express' | 'pickup' | 'free_delivery';
  paymentId?: string;
  chapaTxRef?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const coordinatesSchema = new Schema<ICoordinates>(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const addressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
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
  coordinates: { type: coordinatesSchema, required: false },
  mapUrl: { type: String },
  deliveryInstructions: { type: String },
  pickupStoreId: { type: String },
});

const orderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered'],
      default: 'pending',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    address: addressSchema,
    deliveryOption: {
      type: String,
      enum: ['standard', 'express', 'pickup', 'free_delivery'],
      default: 'standard',
    },
    paymentId: {
      type: String,
      sparse: true,
    },
    chapaTxRef: {
      type: String,
      sparse: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);
