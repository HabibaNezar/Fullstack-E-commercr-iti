import { Component, OnInit } from '@angular/core';
import { CartService } from "../../services/cart.service";
import { CommonModule } from '@angular/common';
import { DecimalPipe } from "../../pipes/decimal-pipe";

@Component({
  selector: 'app-cart',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {

  cartItems: any[] = [];

  constructor(public cartService: CartService) {}

  ngOnInit() {
    this.cartItems = this.cartService.getItems();
  }

  get totalPrice(): number {
    return this.cartService.getTotalPrice();
  }

  increment(productId: number) {
    this.cartService.incrementItem(productId);
    // 👇 sync local array after removal
    this.cartItems = this.cartService.getItems();
  }

  decrement(productId: number) {
    this.cartService.decrementItem(productId);
    // 👇 sync local array after removal
    this.cartItems = this.cartService.getItems();
  }

  remove(productId: number) {
    this.cartService.removeItem(productId);
    // 👇 sync local array after removal
    this.cartItems = this.cartService.getItems();
  }

  clearCart() {
    this.cartService.clearCart();
    this.cartItems = [];
  }
}