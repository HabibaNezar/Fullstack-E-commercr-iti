import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthServices/auth-service';
import { UsersService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { ReviewService } from '../../services/review.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { IUser } from '../../models/iuser';
import { IOrder } from '../../models/iorder';
import { IReview } from '../../models/ireview';
import { IProduct } from '../../models/iproduct';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.css'
})
export class UserProfile implements OnInit {
  user: IUser | null = null;
  isEditing = false;
  message = '';
  private messageTimer: any;

  // Tabs management
  activeTab: 'Account' | 'Orders' | 'Wishlist' | 'Reviews' = 'Account';

  // Data for tabs
  userOrders: IOrder[] = [];
  wishlistProducts: IProduct[] = [];
  userReviews: IReview[] = [];

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private orderService: OrderService,
    private reviewService: ReviewService,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = { 
        ...currentUser,
        paymentDetails: currentUser.paymentDetails || {
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolderName: ''
        }
      };
      this.loadTabData();
    }
  }

  setTab(tab: 'Account' | 'Orders' | 'Wishlist' | 'Reviews'): void {
    this.activeTab = tab;
    this.loadTabData();
  }

  loadTabData(): void {
    if (!this.user || !this.user.id) return;

    if (this.activeTab === 'Orders') {
      this.userOrders = []; // 🧹 Clear old data
      this.orderService.getOrdersByUserId(this.user.id).subscribe(orders => {
        this.userOrders = orders;
        this.cdr.detectChanges();
      });
    } else if (this.activeTab === 'Wishlist') {
      this.wishlistProducts = []; // 🧹 Clear old data
      if (this.user.wishlist && this.user.wishlist.length > 0) {
        this.user.wishlist.forEach(id => {
          this.productService.getProductById(id).subscribe(product => {
            if (product) this.wishlistProducts.push(product);
            this.cdr.detectChanges();
          });
        });
      }
    } else if (this.activeTab === 'Reviews') {
      this.userReviews = []; // 🧹 Clear old data
      this.reviewService.getReviewsByUserId(this.user.id).subscribe(reviews => {
        this.userReviews = reviews;
        this.cdr.detectChanges();
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.message = '';
    if (!this.isEditing) {
      this.loadUser();
    }
  }

  // 🛒 Shopping Actions
  addToCart(product: IProduct): void {
    this.cartService.addToCart(product);
    this.message = `Successfully added ${product.title} to your cart!`;
    
    if (this.messageTimer) clearInterval(this.messageTimer);
    this.cdr.detectChanges();

    this.messageTimer = setInterval(() => {
      this.message = '';
      this.cdr.detectChanges();
      clearInterval(this.messageTimer);
    }, 5000);
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.toggleWishlist(productId).subscribe(() => {
      // Update local wishlist display instantly
      this.wishlistProducts = this.wishlistProducts.filter(p => p.id !== productId);
      this.cdr.detectChanges();
    });
  }

  saveProfile(): void {
    if (this.user && (this.user.id !== undefined && this.user.id !== null)) {
      this.usersService.updateUser(this.user).subscribe({
        next: (updatedUser) => {
          this.authService.updateCurrentUser(updatedUser);
          this.user = { ...updatedUser };
          this.isEditing = false;
          this.message = 'Profile updated successfully!';
          
          if (this.messageTimer) clearInterval(this.messageTimer);
          this.cdr.detectChanges();
          
          this.messageTimer = setInterval(() => {
            this.message = '';
            this.cdr.detectChanges();
            clearInterval(this.messageTimer);
          }, 5000);
        },
        error: (err) => {
          this.message = 'Failed to update profile. Please try again.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.message = 'User ID is missing. Please re-login.';
      this.cdr.detectChanges();
    }
  }
}
