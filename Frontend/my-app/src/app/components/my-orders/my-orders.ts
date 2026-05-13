import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { IOrder } from '../../models/iorder';
import { finalize, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {

  orders: IOrder[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (!user || !user.id) {
      this.error = 'Please log in to view your orders.';
      this.loading = false;
      return;
    }

    const userIdStr = String(user.id);

    this.orderService.getOrdersByUser(userIdStr)
      .pipe(
        // ✅ لو السيرفر مش شغال أو بطيء، يطلع error بعد 8 ثوان بدل ما يستنى للأبد
        timeout(8000),
        catchError((err) => {
          const isTimeout = err?.name === 'TimeoutError';
          this.error = isTimeout
            ? 'Server is not responding. Make sure JSON Server is running on port 3000.'
            : 'Could not connect to server. Make sure JSON Server is running.';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (orders) => {
          if (orders && orders.length > 0) {
            this.orders = orders.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            this.error = '';
          } else {
            this.orders = [];
          }
        }
      });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'tag--orange',
      confirmed: 'tag--blue',
      shipped: 'tag--purple',
      delivered: 'tag--green',
      cancelled: 'tag--red'
    };
    return map[status] ?? 'tag--blue';
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      shipped: '🚚',
      delivered: '🎉',
      cancelled: '❌'
    };
    return icons[status] ?? '📦';
  }
}