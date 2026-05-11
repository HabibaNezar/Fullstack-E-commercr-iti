import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  ActivatedRoute
} from '@angular/router';
import { OrderService } from '../../services/order.service';
import { IOrder } from '../../models/iorder';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css'
})
export class OrderConfirmation implements OnInit {

  order: IOrder | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    // ── Read :id from URL /order/:id/confirmation ──
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Order not found.';
      this.loading = false;
      return;
    }

    this.orderService.getOrderById(id).subscribe({
      next: (o) => {
        this.order = o;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load your order.';
        this.loading = false;
      }
    });
  }
}
