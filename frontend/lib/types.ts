// User and Auth Types
export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
}

// Customer Types
export interface Customer {
  _id: string;
  userId: string;
  phone: string;
  name: string;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  _id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  specs: Record<string, any>;
  price: number;
  sku: string;
  images: string[];
  audioDemo?: string;
  media: ProductMedia[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMedia {
  _id: string;
  productId: string;
  type: 'image' | 'audio';
  cloudinaryUrl: string;
  order: number;
}

// Order Types
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  total: number;
  subtotal: number;
  shippingFee: number;
  address: Address;
  deliveryOption: 'standard' | 'express' | 'pickup' | 'free_delivery';
  paymentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Telegram Types
export interface TelegramLink {
  _id: string;
  productId: string;
  telegramMessageId: string;
  telegramGroupId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
