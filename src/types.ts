export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  stock: number;
  rating: number;
  features: string[];
  specs: Record<string, string>;
  reviews?: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod?: 'card' | 'upi' | 'cod';
  upiId?: string;
  shippingInfo: ShippingInfo;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalSales: number;
  totalOrders: number;
  lowStockItemsCount: number;
  salesByCategory: { category: string; value: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
}

export interface Recommendation {
  productId: string;
  name: string;
  reason: string;
  confidenceScore: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: any;
  timestamp: string;
}
