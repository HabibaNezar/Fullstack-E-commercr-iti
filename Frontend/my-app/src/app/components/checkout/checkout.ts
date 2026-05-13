import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { IOrder } from '../../models/iorder';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  // ── Form fields ────────────────────────────────────────────────────
  shippingAddress = '';

  // UI-only — not part of IOrder model
  paymentMethod: 'cash' | 'card' = 'cash';

  submitting = false;
  submitted = false; // triggers inline validation messages
  error = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.cartService.getItemCount() === 0) {
      this.router.navigate(['/cart']);
    }
  }

  get cartItems() { return this.cartService.getItems(); }
  get total() { return this.cartService.getTotalPrice(); }

  placeOrder(): void {
    this.submitted = true;
    if (!this.shippingAddress.trim()) return;

    const user = this.authService.getCurrentUser();
    if (!user) { this.router.navigate(['/login']); return; }

    // ✅ Matches IOrder exactly
    const order: IOrder = {
      userId: user.id,
      items: this.cartItems.map(i => ({
        productId: i.id,
        productName: i.title,
        quantity: i.quantity,
        price: i.price
      })),
      totalPrice: this.total,
      orderDate: new Date(),
      status: 'Pending',
      shippingAddress: this.shippingAddress.trim()
    };

    this.submitting = true;
    this.orderService.createOrder(order).subscribe({
      next: (created) => {
        this.cartService.clearCart();
        this.router.navigate(['/order', created.id, 'confirmation'], {
          state: { order: created }
        });
      },
      error: () => {
        this.error = 'Could not place your order. Please try again.';
        this.submitting = false;
      }
    });
  }
}