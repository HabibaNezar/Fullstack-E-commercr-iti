import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { IProduct } from '../../models/iproduct';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { DecimalPipe } from '../../pipes/decimal-pipe';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  product: IProduct | undefined;
  mainImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productService.getProductById(id).subscribe(p => {
        this.product = p;
        if (p && p.images.length > 0) {
          this.mainImage = p.images[0];
        }
      });
    }
  }

  setMainImage(img: string): void {
    this.mainImage = img;
  }

  onAddToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
    }
  }

  toggleWishlist(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.product) {
      this.wishlistService.toggleWishlist(this.product.id).subscribe();
    }
  }

  isInWishlist(): boolean {
    return this.product ? this.wishlistService.isInWishlist(this.product.id) : false;
  }

  goBack(): void {
    this.location.back();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
