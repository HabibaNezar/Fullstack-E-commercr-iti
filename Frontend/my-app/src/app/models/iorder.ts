export interface IOrderItem {
  productId: number;
  title:     string;
  price:     number;
  quantity:  number;
  thumbnail: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface IOrder {
  id?:           string;        // assigned by json-server
  userId:        string;        // from AuthService.getCurrentUser().id
  userName:      string;        // firstName + lastName
  items:         IOrderItem[];  // from CartService.getItems()
  status:        OrderStatus;
  total:         number;        // from CartService.getTotalPrice()
  address:       string;
  city:          string;
  phone:         string;
  paymentMethod: 'cash' | 'card';
  createdAt:     string;        // ISO string
}
