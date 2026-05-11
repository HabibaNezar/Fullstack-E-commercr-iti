import { Component, OnInit } from '@angular/core';
import { CartService }        from "../../services/cart.service";
import { CommonModule }       from '@angular/common';
import { RouterLink }         from '@angular/router';          // ✅ added for routerLink="/checkout"
import { DecimalPipe }        from "../../pipes/decimal-pipe";

@Component({
  selector:    'app-cart',
  imports:     [CommonModule, DecimalPipe, RouterLink],         // ✅ RouterLink added
  templateUrl: './cart.html',
  styleUrl:    './cart.css',
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
}