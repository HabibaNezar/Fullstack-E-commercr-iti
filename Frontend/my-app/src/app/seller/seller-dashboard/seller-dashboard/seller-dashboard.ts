import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { SellerService } from '../../../core/services/seller.service';
 
@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css',
})
export class SellerDashboard implements OnInit {
  private products = inject(ProductService);
  private orders = inject(OrderService);
  private sellerService = inject(SellerService);
 
  loading = signal(true);
  productCount = signal(0);
  orderCount = signal(0);
  lowStockCount = signal(0);
  totalRevenue = signal<number | null>(null);
 
  salesStatus = signal<any>(null);
  lowStockProducts = signal<any[]>([]);
  topSellingProducts = signal<any[]>([]);
 
  ngOnInit(): void {
    this.loadData();
  }
 
  loadData(): void {
    this.sellerService.getSalesStatus().subscribe({
      next: (data) => {
        this.salesStatus.set(data);
        this.totalRevenue.set(data.totalRevenue);
      },
    });
 
    this.sellerService.getLowStock().subscribe({
      next: (data) => {
        this.lowStockProducts.set(data);
        this.lowStockCount.set(data.length);
      },
    });
 
    this.sellerService.getTopProducts().subscribe({
      next: (data) => {
        this.topSellingProducts.set(data);
      },
    });
 
    this.products.getProducts().subscribe({
      next: (data) => {
        this.productCount.set(data.length);
      },
    });
 
    this.sellerService.getMyOrders().subscribe({
      next: (data) => {
        this.orderCount.set(data.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
 


