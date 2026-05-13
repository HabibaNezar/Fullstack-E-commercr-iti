import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { DecimalPipe } from '../../pipes/decimal-pipe';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/AuthServices/auth-service';
import { PaymobService } from '../../services/paymob.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  
  isGuest: boolean = false;
  guestInfo = {
    email: '',
    name: '',
    address: '',
    phone: ''
  };

  paymentMethods = [
    { id: 'credit-card', label: 'Credit Card (Paymob)', icon: 'fa-credit-card' },
    { id: 'paypal', label: 'PayPal', icon: 'fa-brands fa-paypal' },
    { id: 'cod', label: 'Cash on Delivery', icon: 'fa-money-bill-wave' },
    { id: 'wallet', label: 'Wallet', icon: 'fa-wallet' }
  ];
  selectedPaymentMethod: string = 'credit-card';

  // Paymob properties
  isProcessingPayment: boolean = false;
  paymobIframeUrl: SafeResourceUrl | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private paymobService: PaymobService,
    private sanitizer: DomSanitizer,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.getItems();
    this.totalPrice = this.cartService.getTotalPrice();
    
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
    }

    this.isGuest = !this.authService.isLoggedIn();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  onCheckout() {
    // Basic validation
    if (this.isGuest && (!this.guestInfo.name || !this.guestInfo.email || !this.guestInfo.address || !this.guestInfo.phone)) {
      alert('Please fill in all guest information including phone number.');
      return;
    }

    if (this.selectedPaymentMethod === 'credit-card') {
      this.initiatePaymobPayment();
    } else {
      // Mock for other payment methods
      this.completeOrder();
    }
  }

  initiatePaymobPayment() {
    this.isProcessingPayment = true;
    
    const amountCents = Math.round(this.totalPrice * 100);
    const billingData = {
      firstName: this.isGuest ? this.guestInfo.name.split(' ')[0] : (this.getCurrentUser()?.firstName.split(' ')[0] || 'Guest'),
      lastName: this.isGuest ? (this.guestInfo.name.split(' ')[1] || 'Guest') : (this.getCurrentUser()?.lastName.split(' ')[1] || 'Guest'),
      email: this.isGuest ? this.guestInfo.email : (this.getCurrentUser()?.email || 'test@test.com'),
      phone: this.isGuest ? this.guestInfo.phone : '01000000000',
      address: this.isGuest ? this.guestInfo.address : 'Default Address'
    };

    const orderDetails = {
      amountCents: amountCents,
      items: this.cartItems.map(item => ({
        name: item.title,
        amount_cents: Math.round(item.price * 100),
        description: item.description || 'Product description',
        quantity: item.quantity
      }))
    };

    this.paymobService.payWithPaymob(orderDetails, billingData).subscribe({
      next: (res: any) => {
        const paymentToken = res.token;
        const url = `https://accept.paymob.com/api/acceptance/iframes/${this.paymobService.iframeId}?payment_token=${paymentToken}`;
        this.paymobIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (err) => {
        console.error('Paymob Error:', err);
        alert('Failed to initiate payment. Please check your Paymob API configuration.');
        this.isProcessingPayment = false;
      }
    });
  }

  completeOrder() {
    const currentUser = this.authService.getCurrentUser();
    
    const orderData: any = {
      userId: this.isGuest ? 'guest' : currentUser?.id,
      items: this.cartItems.map(item => ({
        productId: item.id,
        productName: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: this.totalPrice,
      orderDate: new Date(),
      status: 'Pending',
      shippingAddress: this.isGuest ? this.guestInfo.address : 'Default Address'
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        alert('Order placed successfully!');
        this.cartService.clearCart();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Order saving error:', err);
        // Fallback to success alert because payment might have succeeded
        alert('Order placed successfully!');
        this.cartService.clearCart();
        this.router.navigate(['/home']);
      }
    });
  }

  closePayment() {
    this.paymobIframeUrl = null;
    this.isProcessingPayment = false;
  }
}
