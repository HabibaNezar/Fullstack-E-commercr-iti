import { IProduct } from './iproduct';

export interface IOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  id?: any;
  userId: any;
  items: IOrderItem[];
  totalPrice: number;
  orderDate: Date;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
}
