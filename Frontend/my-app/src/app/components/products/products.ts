import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HighLight } from '../../directives/high-light';
import { TruncateWordsPipe } from '../../pipes/truncate-words-pipe';
import { ZoomImageDirective } from '../../directives/zoom-image';
import { ProductService } from '../../services/product.service';
import { IProduct } from '../../models/iproduct';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { DecimalPipe } from "../../pipes/decimal-pipe";
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [CommonModule, NgClass, HighLight, TruncateWordsPipe, ZoomImageDirective, DecimalPipe, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
  standalone: true
})
export class Products implements OnInit, OnDestroy {  // ✅ Added interfaces

  @Input() selectedCategory: string = 'All';
  @Input() maxPrice: number = 1000;
  @Input() searchQuery: string = '';       


  @Output() totalPrice = new EventEmitter<number>();
  @Output() editProduct = new EventEmitter<IProduct>();
  @Output() deleteProduct = new EventEmitter<number>();

  products: IProduct[] = [];
  private userSub!: Subscription; // 🛰️ To track wishlist changes

  constructor(
    private productService: ProductService,
    private CartService: CartService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private router: Router,
    private cdr: ChangeDetectorRef // 👈 needed for async updates
  ) {
    this.products = this.productService.getProducts(); 
  }

  ngOnInit(): void {
    // 🔗 Listen for user/wishlist changes globally
    this.userSub = this.authService.currentUser$.subscribe(() => {
      this.cdr.detectChanges(); // Re-render hearts if wishlist changes elsewhere
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }


  get filteredProducts(): IProduct[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.products.filter(p => {
      const matchesCategory =
        this.selectedCategory === 'All' || p.category === this.selectedCategory;
      const matchesPrice = p.price <= this.maxPrice;
      const matchesSearch =
        query === '' ||
        p.title.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }
  // ✅ Getter for inStockCount based on filtered result
  get inStockCount(): number {
    return this.filteredProducts.filter(p => p.stock > 0).length;
  }

  onEdit(product: IProduct) { this.editProduct.emit(product); }
  onDelete(id: number) { this.deleteProduct.emit(id); }

  onAddToCart(product: IProduct) {
    this.CartService.addToCart(product);
  }

  toggleWishlist(productId: number) {
    if (!this.isLoggedIn()) {
      this.goToLogin();
      return;
    }
    this.wishlistService.toggleWishlist(productId).subscribe();
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  isAdmin(): boolean { return this.authService.isAdmin(); }
  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }
  goToLogin() { this.router.navigate(['/login']); }
}