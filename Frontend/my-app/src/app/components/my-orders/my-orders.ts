import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { IOrder } from '../../models/iorder';
import { timeout, catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {

  orders: IOrder[] = [];
  ordersLoading = false;
  ordersError = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (!user?.id) {
      this.ordersError = 'Please log in to view your orders.';
      return;
    }

    this.loadOrders(String(user.id));
  }

  loadOrders(userId: string): void {
    this.ordersLoading = true;
    this.ordersError = '';

    this.orderService.getOrdersByUserId(userId)
      .pipe(
        timeout(8000),
        catchError((err) => {
          this.ordersError = err?.name === 'TimeoutError'
            ? 'Server not responding. Run: npx json-server db.json'
            : 'Could not load orders. Run: npx json-server db.json';
          return of([]);
        }),
        finalize(() => { this.ordersLoading = false; })
      )
      .subscribe(orders => {
        this.orders = orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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