import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductMedia {
  type: 'image' | 'audio';
  cloudinaryUrl: string;
  order: number;
}

export interface IProduct extends Document {
  categoryId: Types.ObjectId | string;
  name: string;
  slug: string;
  description: string;
  specs: Record<string, any>;
  price: number;
  sku: string;
  images: string[];
  audioDemo?: string;
  media: IProductMedia[];
  createdAt: Date;
  updatedAt: Date;
}

const productMediaSchema = new Schema<IProductMedia>({
  type: {
    type: String,
    enum: ['image', 'audio'],
    required: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const productSchema = new Schema<IProduct>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    images: [
      {
        type: String,
        default: '',
      },
    ],
    audioDemo: {
      type: String,
      default: '',
    },
    media: [productMediaSchema],
  },
  {
    timestamps: true,
  }
);

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ sku: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
