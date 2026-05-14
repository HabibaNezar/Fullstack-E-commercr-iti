import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-seller-earnings',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './seller-earnings.html',
  styleUrl: './seller-earnings.css',
})
export class SellerEarnings implements OnInit {
  private sellerService = inject(SellerService);

  loading = signal(true);
  totalRevenue = signal<number | null>(null);
  monthlyRevenue = signal<number | null>(null);
  pendingPayouts = signal<number | null>(null);
  completedPayouts = signal<number | null>(null);

  ngOnInit(): void {
    this.loadEarnings();
  }

  loadEarnings(): void {
    this.sellerService.getSalesStatus().subscribe({
      next: (data) => {
        this.totalRevenue.set(data.totalRevenue);
        this.monthlyRevenue.set(data.totalRevenue * 0.1); // Mock calculation
        this.pendingPayouts.set(data.totalRevenue * 0.05); // Mock calculation
        this.completedPayouts.set(data.totalRevenue * 0.05); // Mock calculation
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
