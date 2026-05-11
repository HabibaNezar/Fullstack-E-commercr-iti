import { Component, OnInit } from '@angular/core';
import { CommonModule }        from '@angular/common';
import { RouterLink }          from '@angular/router';
import { OrderService }        from '../../services/order.service';
import { AuthService }         from '../../services/AuthServices/auth-service';
import { IOrder }              from '../../models/iorder';

@Component({
  selector:    'app-my-orders',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl:    './my-orders.css'
})
export class MyOrders implements OnInit {

  orders:  IOrder[] = [];
  loading: boolean  = true;
  error:   string   = '';

  constructor(
    private orderService: OrderService,
    private authService:  AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) { this.error = 'Please log in.'; this.loading = false; return; }

    this.orderService.getOrdersByUser(String(user.id)).subscribe({
      next: (orders) => {
        // newest first
        this.orders  = orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: () => { this.error = 'Could not load orders.'; this.loading = false; }
    });
  }

  // Badge class per status
  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending:   'tag--orange',
      confirmed: 'tag--blue',
      shipped:   'tag--purple',
      delivered: 'tag--green',
      cancelled: 'tag--red'
    };
    return map[status] ?? 'tag--blue';
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending:   '⏳',
      confirmed: '✅',
      shipped:   '🚚',
      delivered: '🎉',
      cancelled: '❌'
    };
    return icons[status] ?? '📦';
  }
}
