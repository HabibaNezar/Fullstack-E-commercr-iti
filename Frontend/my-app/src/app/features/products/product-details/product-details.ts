import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { IProduct } from '../../../models/iproduct';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, switchMap, timeout, of, distinctUntilChanged } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { DecimalPipe } from '../../../shared/pipes/decimal-pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  constructor() {
    console.log('💎 ProductDetails instance created:', Math.random());
  }
  product: IProduct | null = null;
  private _loading = false;

  get loading(): boolean {
    return this._loading;
  }

  set loading(val: boolean) {
    console.trace('🔴 loading set to:', val);
    this._loading = val;
  }

  error = '';
  quantity = 1;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(params => Number(params.get('id'))),
        distinctUntilChanged(),
        switchMap(id => {
          if (isNaN(id) || id === 0) {
            return of({ status: 'invalid' as const });
          }
          this.product = null;
          this.error = '';
          this.loading = true;

          return this.productService.getProductById(id).pipe(
            timeout(10000),
            map(product => {
              console.log('🟡 raw product from service:', product);
              console.log('🟡 product truthy?', !!product);
              return { status: 'success' as const, product };
            }),
            catchError(err => {
              console.error('🔴 API Error:', err);
              return of({ status: 'error' as const });
            })
          );
        })
      )
      .subscribe({
        next: (result) => {
          console.log('🟢 next() called, result:', result);
          switch (result.status) {
            case 'success':
              console.log('🟢 SUCCESS — setting product:', result.product);
              this.product = result.product;
              this.quantity = 1;
              this.error = '';
              this.loading = false;
              console.log('🟢 after success: loading=', this.loading, '| product=', this.product);
              break;

            case 'error':
              console.log('🟢 ERROR case');
              this.product = null;
              this.error = 'Failed to load product details. Please try again later.';
              this.loading = false;
              break;

            case 'invalid':
              console.log('🟢 INVALID case');
              this.product = null;
              this.error = 'Invalid product ID';
              this.loading = false;
              break;
          }
        },
        error: (err) => {
          console.error('🔴 Unexpected subscription error:', err);
          this.loading = false;
          this.error = 'An unexpected error occurred.';
        }
      });
  }

  productImageUrl(): string {
    const rawImage = this.product?.image || (this.product as any)?.imagePath;
    if (!rawImage || typeof rawImage !== 'string') {
      return 'assets/placeholder.png';
    }

    let trimmed = rawImage.trim();

    if (trimmed.includes('localhost') && trimmed.includes('http', 5)) {
      const actualUrlStart = trimmed.indexOf('http', 5);
      if (actualUrlStart !== -1) {
        trimmed = trimmed.substring(actualUrlStart);
      }
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    const env = environment as { apiUrl: string; apiServerOrigin?: string };
    const base = env.apiUrl.startsWith('http')
      ? env.apiUrl.replace(/\/api\/?$/, '')
      : (env.apiServerOrigin ?? '').replace(/\/$/, '');

    if (!base) return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAddToCart(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.product) {
      for (let i = 0; i < this.quantity; i++) {
        this.cartService.addToCart(this.product);
      }
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}