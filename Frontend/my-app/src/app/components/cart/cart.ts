import { Component, OnInit } from '@angular/core';
import { CartService } from "../../services/cart.service";
import { CommonModule } from '@angular/common';
import { DecimalPipe } from "../../pipes/decimal-pipe";
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { Router, RouterLink } from '@angular/router';
import { IProduct } from '../../models/iproduct';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {

  cartItems: any[] = [];

  constructor(
    public cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.getItems();
  }

  get totalPrice(): number {
    return this.cartService.getTotalPrice();
  }

  increment(productId: number) {
    this.cartService.incrementItem(productId);
    this.cartItems = this.cartService.getItems();
  }

  decrement(productId: number) {
    this.cartService.decrementItem(productId);
    this.cartItems = this.cartService.getItems();
  }

  remove(productId: number) {
    this.cartService.removeItem(productId);
    this.cartItems = this.cartService.getItems();
  }

  clearCart() {
    this.cartService.clearCart();
    this.cartItems = [];
  }

  // 💖 Wishlist logic
  toggleWishlist(productId: number) {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.toggleWishlist(productId).subscribe();
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}