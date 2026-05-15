import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { IProduct } from '../../../models/iproduct';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, map, switchMap, timeout } from 'rxjs';
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
  private readonly cdr = inject(ChangeDetectorRef);
  product: IProduct | null = null;
  loading = true;
  error = '';
  quantity = 1;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    console.log('ProductDetails Component Initialized');
    
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(params => {
          const idParam = params.get('id');
          console.log('Route ID Parameter:', idParam);
          return Number(idParam);
        }),
        switchMap(id => {
          if (isNaN(id) || id === 0) {
            console.error('Invalid ID');
            this.error = 'Invalid product ID';
            this.loading = false;
            this.product = null;
            return EMPTY;
          }

          this.loading = true;
          this.error = '';
          return this.productService.getProductById(id).pipe(
            timeout(10000), // 10 seconds timeout
            catchError((err) => {
              console.error('API Error details:', err);
              this.error = 'Failed to load product details. Please try again later.';
              return EMPTY;
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            })
          );
        })
      )
      .subscribe({
        next: (product) => {
          console.log('Product data received:', product);
          this.product = product;
          this.quantity = 1;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Subscription error:', err);
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

  // حل سحري: لو الرابط جواه مسار اللوكال هوست متبوع بـ http تانية، هنقص اللوكال هوست خالص
  if (trimmed.includes('localhost') && trimmed.includes('http', 5)) {
    // هيدور على الـ http التانية وياخد الرابط من أولها
    const actualUrlStart = trimmed.indexOf('http', 5); 
    if (actualUrlStart !== -1) {
      trimmed = trimmed.substring(actualUrlStart);
    }
  }

  // فحص لو الرابط بقى يبدأ بـ http صريحة ونظيفة
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // لو مش رابط كامل، بنحط الـ Localhost والـ Base Url العادي بتاعنا
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
