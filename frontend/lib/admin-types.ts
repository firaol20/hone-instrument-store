import { Product, Category, Customer, Order, OrderItem } from './types';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  orderStats: Record<string, number>;
}

export interface AdminProduct extends Omit<Product, 'categoryId'> {
  categoryId: Category;
}

export interface AdminOrder extends Omit<Order, 'customerId' | 'items'> {
  customerId: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
}

export interface AdminCustomer extends Omit<Customer, 'userId'> {
  userId: {
    _id: string;
    email: string;
    role: 'user' | 'admin' | 'owner';
  };
}

export interface RevenueStats {
  revenueByDay: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}

export interface PaginatedAdminResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
