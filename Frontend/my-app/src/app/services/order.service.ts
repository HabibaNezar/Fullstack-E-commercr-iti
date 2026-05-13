import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrder } from '../models/iorder';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3001/orders';

  constructor(private http: HttpClient) {}

  getOrdersByUserId(userId: any): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.apiUrl}?userId=${userId}`);
  }

  createOrder(order: IOrder): Observable<IOrder> {
    return this.http.post<IOrder>(this.apiUrl, order);
  }

  updateOrderStatus(orderId: any, status: string): Observable<IOrder> {
    return this.http.patch<IOrder>(`${this.apiUrl}/${orderId}`, { status });
  }
}
