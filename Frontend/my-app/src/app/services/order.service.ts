import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrder } from '../models/iorder';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/Orders`;

  constructor(private http: HttpClient) {}

  getOrdersByUserId(userId: any): Observable<IOrder[]> {
    // Backend uses the token to identify the user
    return this.http.get<IOrder[]>(`${this.apiUrl}/My-Orders`);
  }

  createOrder(orderData: any): Observable<any> {
    const shippingAddress = orderData.shippingAddress || 'Default Address';
    return this.http.post<any>(`${this.apiUrl}/CheckOut?shippingAddress=${encodeURIComponent(shippingAddress)}`, {});
  }

  updateOrderStatus(orderId: any, status: string): Observable<any> {
    // AdminController handles this: [HttpPut("UpdateOrderStatus/{id}")]
    return this.http.put<any>(`${environment.apiUrl}/api/Admin/UpdateOrderStatus/${orderId}`, status);
  }
}

