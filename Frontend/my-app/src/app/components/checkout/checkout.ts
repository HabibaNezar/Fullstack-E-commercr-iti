import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormGroup,
  FormControl, Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/AuthServices/auth-service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  form!: FormGroup;
  submitting = false;
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
      return;
    }

    this.form = new FormGroup({
      address: new FormControl('', [Validators.required, Validators.minLength(10)]),
      city: new FormControl('', Validators.required),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]),
      paymentMethod: new FormControl<'cash' | 'card'>('cash', Validators.required)
    });
  }

  get f() { return this.form.controls; }
  get cartItems() { return this.cartService.getItems(); }
  get total() { return this.cartService.getTotalPrice(); }

  placeOrder(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting) return;

    const user = this.authService.getCurrentUser();
    if (!user) { this.router.navigate(['/login']); return; }

    this.submitting = true;
    this.error = '';

    const order = {
      userId: String(user.id),
      userName: `${user.firstName} ${user.lastName}`,
      items: this.cartItems.map(i => ({
        productId: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        thumbnail: i.thumbnail ?? i.images?.[0] ?? ''
      })),
      status: 'pending' as const,
      total: this.total,
      address: this.f['address'].value.trim(),
      city: this.f['city'].value.trim(),
      phone: this.f['phone'].value.trim(),
      paymentMethod: this.f['paymentMethod'].value as 'cash' | 'card',
      createdAt: new Date().toISOString()
    };

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