import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrder } from '../models/iorder';

// ✅ type للـ create — بدون id لأن الـ server هو اللي بيديه
type CreateOrderDto = Omit<IOrder, 'id'>;

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  // ✅ Fix: بياخد CreateOrderDto مش Order كاملة
  placeOrder(order: CreateOrderDto): Observable<IOrder> {
    return this.http.post<IOrder>(this.apiUrl, order);
  }

  getOrderById(id: string): Observable<IOrder> {
    return this.http.get<IOrder>(`${this.apiUrl}/${id}`);
  }

  getOrdersByUser(userId: string): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getAllOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(this.apiUrl);
  }

  updateOrderStatus(id: string, status: string): Observable<IOrder> {
    return this.http.patch<IOrder>(`${this.apiUrl}/${id}`, { status });
  }

  cancelOrder(id: string): Observable<IOrder> {
    return this.http.patch<IOrder>(`${this.apiUrl}/${id}`, { status: 'cancelled' });
  }
}