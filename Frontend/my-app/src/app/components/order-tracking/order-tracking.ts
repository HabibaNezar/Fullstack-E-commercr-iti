import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { IOrder } from '../../models/iorder';

// ✅ Match IOrder status union exactly
type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css'
})
export class OrderTracking implements OnInit {

  order: IOrder | null = null;
  loading = true;
  error = '';

  // ✅ IOrder status: 'Pending' | 'Shipped' | 'Delivered' — Cancelled is a special state, not a step
  readonly steps: OrderStatus[] = ['Pending', 'Shipped', 'Delivered'];

  readonly stepMeta: Record<string, { icon: string; label: string; desc: string }> = {
    Pending: { icon: '⏳', label: 'Order Placed', desc: 'We received your order and are reviewing it.' },
    Shipped: { icon: '🚚', label: 'Shipped', desc: 'Your order is on its way!' },
    Delivered: { icon: '🎉', label: 'Delivered', desc: 'Your order has been delivered. Enjoy!' },
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    // ✅ Use navigation state first (faster — no HTTP call)
    const nav = history.state as { order?: IOrder };
    if (nav?.order) {
      this.order = nav.order;
      this.loading = false;
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Order not found.';
      this.loading = false;
      return;
    }

    this.orderService.getOrderById(id).subscribe({
      next: (o) => { this.order = o; this.loading = false; },
      error: () => { this.error = 'Could not load order.'; this.loading = false; }
    });
  }

  isReached(step: OrderStatus): boolean {
    if (!this.order) return false;
    return this.steps.indexOf(step) <= this.steps.indexOf(this.order.status as OrderStatus);
  }

  isCurrent(step: OrderStatus): boolean {
    return this.order?.status === step;
  }
}