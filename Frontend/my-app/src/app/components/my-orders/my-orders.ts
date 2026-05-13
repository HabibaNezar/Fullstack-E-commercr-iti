import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { IOrder } from '../../models/iorder';
import { finalize, timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {

  orders: IOrder[] = [];
  loading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    // ✅ Added: guarantees UI updates even if change detection misses the async update
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (!user?.id) {
      this.error = 'Please log in to view your orders.';
      this.loading = false;
      return;
    }

    this.orderService.getOrdersByUserId(String(user.id))
      .pipe(
        // ✅ Reduced from 8s → 5s for faster user feedback
        timeout(5000),
        catchError((err) => {
          this.error = err?.name === 'TimeoutError'
            ? 'Server is not responding. Make sure JSON Server is running on port 3001.'
            : 'Could not connect to server. Make sure JSON Server is running on port 3001.';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
          // ✅ Force UI refresh after loading state changes
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (orders) => {
          this.orders = (orders ?? []).sort((a, b) => {
            const tA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
            const tB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
            return tB - tA;
          });
          // ✅ Force UI refresh after data arrives
          this.cdr.detectChanges();
        }
      });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'tag--orange',
      Shipped: 'tag--purple',
      Delivered: 'tag--green',
      Cancelled: 'tag--red'
    };
    return map[status] ?? 'tag--blue';
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      Pending: '⏳',
      Shipped: '🚚',
      Delivered: '🎉',
      Cancelled: '❌'
    };
    return icons[status] ?? '📦';
  }
}