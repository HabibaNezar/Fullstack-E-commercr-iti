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

  checkoutForm!: FormGroup;
  cartItems: any[] = [];
  total: number = 0;
  loading: boolean = false;
  errorMsg: string = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // ── Build form ───────────────────────────────
    this.checkoutForm = new FormGroup({
      address: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      city: new FormControl('', Validators.required),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)
      ]),
      paymentMethod: new FormControl('cash', Validators.required)
    });

    // ── Load cart ────────────────────────────────
    this.cartItems = this.cartService.getItems();
    this.total = this.cartService.getTotalPrice();

    // ── Redirect if cart is empty ────────────────
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  // Shortcut to access form controls in template
  get f() { return this.checkoutForm.controls; }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const user = this.authService.getCurrentUser()!;

    const order = {
      userId: String(user.id),
      userName: `${user.firstName} ${user.lastName}`,
      items: this.cartItems.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail
      })),
      status: 'pending' as const,
      total: this.total,
      address: this.checkoutForm.value.address,
      city: this.checkoutForm.value.city,
      phone: this.checkoutForm.value.phone,
      paymentMethod: this.checkoutForm.value.paymentMethod,
      createdAt: new Date().toISOString()
    };

    this.orderService.placeOrder(order).subscribe({
      next: (res) => {
        this.cartService.clearCart();
        this.router.navigate(
          ['/order', res.id, 'confirmation'],
          { state: { order: res } }
        );
      },
      error: (err) => {
        this.errorMsg = 'Something went wrong. Please try again.';
        this.loading = false;
      }
    });
  }
}
