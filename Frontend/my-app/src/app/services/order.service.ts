import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { IOrder } from '../models/iorder';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) { }

  placeOrder(order: IOrder): Observable<IOrder> {
    return this.http.post<IOrder>(this.apiUrl, order);
  }

  getOrdersByUser(userId: string): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(this.apiUrl).pipe(
      map(orders => orders.filter(o => String(o.userId) === String(userId)))
    );
  }

  getOrderById(id: string): Observable<IOrder> {
    return this.http.get<IOrder>(`${this.apiUrl}/${id}`);
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