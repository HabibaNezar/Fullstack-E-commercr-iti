export interface IOrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface IOrder {
  id?: string;
  userId: string;
  userName: string;
  items: IOrderItem[];
  status: OrderStatus;
  total: number;
  address: string;
  city: string;
  phone: string;
  paymentMethod: 'cash' | 'card';
  createdAt: string;
}