import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrder } from '../models/iorder';

@Injectable({ providedIn: 'root' })
export class OrderService {

  private api = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) { }

  createOrder(order: IOrder): Observable<IOrder> {
    return this.http.post<IOrder>(this.api, order);
  }

  getOrderById(id: string): Observable<IOrder> {
    return this.http.get<IOrder>(`${this.api}/${id}`);
  }

  getOrdersByUserId(userId: string): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`http://localhost:3000/orders?userId=${userId}`);
  }

  getAllOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(this.api);
  }

  updateOrderStatus(id: string, status: string): Observable<IOrder> {
    return this.http.patch<IOrder>(`${this.api}/${id}`, { status });
  }

  cancelOrder(id: string): Observable<IOrder> {
    return this.http.patch<IOrder>(`${this.api}/${id}`, { status: 'cancelled' });
  }
}