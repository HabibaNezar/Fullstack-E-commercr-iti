import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './seller-orders.html',
  styleUrl: './seller-orders.css',
})
export class SellerOrders implements OnInit {
  private sellerService = inject(SellerService);

  loading = signal(true);
  orders = signal<any[]>([]);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.sellerService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'confirmed') return 'status-confirmed';
    if (statusLower === 'shipped') return 'status-shipped';
    if (statusLower === 'delivered') return 'status-delivered';
    if (statusLower === 'cancelled') return 'status-cancelled';
    return '';
  }
}
