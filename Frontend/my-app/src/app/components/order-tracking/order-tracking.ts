import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  ActivatedRoute
} from '@angular/router';
import { OrderService } from '../../services/order.service';
import { IOrder, OrderStatus } from '../../models/iorder';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css'
})
export class OrderTracking implements OnInit {

  order: IOrder | null = null;
  loading: boolean = true;
  error: string = '';

  // The 4 visible steps (cancelled is handled separately)
  readonly steps: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

  readonly stepMeta: Record<string, { icon: string; label: string; desc: string }> = {
    pending: { icon: '⏳', label: 'Order Placed', desc: 'We received your order and are reviewing it.' },
    confirmed: { icon: '✅', label: 'Confirmed', desc: 'Your order has been confirmed and is being prepared.' },
    shipped: { icon: '🚚', label: 'Shipped', desc: 'Your order is on its way!' },
    delivered: { icon: '🎉', label: 'Delivered', desc: 'Your order has been delivered. Enjoy!' },
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'Order not found.'; this.loading = false; return; }

    this.orderService.getOrderById(id).subscribe({
      next: (o) => { this.order = o; this.loading = false; },
      error: () => { this.error = 'Could not load order.'; this.loading = false; }
    });
  }

  // Returns true if this step is reached
  isReached(step: OrderStatus): boolean {
    if (!this.order) return false;
    return this.steps.indexOf(step) <= this.steps.indexOf(this.order.status as OrderStatus);
  }

  // Returns true if this is the current step
  isCurrent(step: OrderStatus): boolean {
    return this.order?.status === step;
  }
}
