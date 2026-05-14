import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { SellerStatsService } from '../services/seller-stats.service';

interface KeyValue {
  label: string;
  value: string;
  variant?: 'default' | 'warning' | 'success';
}

interface DashRow {
  title: string;
  fields: KeyValue[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);
  private adminUrl = `${environment.apiUrl}/Admin`;
  private products = inject(ProductService);
  private categories = inject(CategoryService);
  private sellerStats = inject(SellerStatsService);

  loading = signal(true);
  userCount = signal(0);
  orderCount = signal(0);
  productCount = signal(0);
  categoryCount = signal(0);

  totalRevenue = signal<number | null>(null);

  ngOnInit(): void {
    // TODO: Verify /Admin/AllStates endpoint exists in backend. If not, remove this and use sellerStats.salesStatus() directly.
    const states$ = this.http.get<unknown>(`${this.adminUrl}/AllStates`).pipe(
      catchError(() => {
        // Fallback to seller endpoint if admin endpoint doesn't exist
        return this.sellerStats.salesStatus();
      })
    );

    forkJoin({
      users: this.http.get<unknown[]>(`${this.adminUrl}/AllUsers`).pipe(catchError(() => of([]))),
      orders: this.http.get<unknown[]>(`${this.adminUrl}/AllOrders`).pipe(catchError(() => of([]))),
      states: states$,
      products: this.products.getProducts().pipe(catchError(() => of([]))),
      categories: this.categories.getCategories().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (r) => {
        this.userCount.set(Array.isArray(r.users) ? r.users.length : 0);
        this.orderCount.set(Array.isArray(r.orders) ? r.orders.length : 0);
        this.productCount.set(Array.isArray(r.products) ? r.products.length : 0);
        this.categoryCount.set(Array.isArray(r.categories) ? r.categories.length : 0);

        this.totalRevenue.set(this.extractRevenue(r.states, r.orders));

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private extractRevenue(states: unknown, orders: unknown): number | null {
    if (states && typeof states === 'object') {
      const o = states as Record<string, unknown>;
      for (const k of ['totalRevenue', 'TotalRevenue', 'revenue', 'Revenue', 'total', 'Total']) {
        const v = o[k];
        if (typeof v === 'number') return v;
      }
    }
    if (Array.isArray(orders)) {
      let sum = 0;
      for (const ord of orders) {
        const v = (ord as Record<string, unknown>)?.['totalPrice'] ?? (ord as Record<string, unknown>)?.['total'];
        if (typeof v === 'number') sum += v;
      }
      return sum;
    }
    return null;
  }
}