import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../shared/services/user.service';
import { OrderService } from '../../../core/services/order.service';
import { ReviewService } from '../../../shared/services/review.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../shared/services/wishlist.service';
import { MyOrders } from '../../orders/my-orders/my-orders';
import { IUser } from '../../../models/iuser';
import { IOrder } from '../../../models/iorder';
import { IReview } from '../../../models/ireview';
import { IProduct } from '../../../models/iproduct';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout, catchError, finalize, of } from 'rxjs';

/** UI-only fields used by userprofile.html (beyond IUser). */
export interface UserPaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

export type ProfileUser = IUser & {
  phone?: string;
  wishlist?: number[];
  paymentDetails?: UserPaymentDetails;
};

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MyOrders],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.css'
})
export class UserProfile implements OnInit {
  user: ProfileUser | null = null;
  isEditing = false;
  message = '';
  private messageTimer: any;

  activeTab: 'Account' | 'Orders' | 'Wishlist' | 'Reviews' = 'Account';

  wishlistProducts: IProduct[] = [];
  userReviews: IReview[] = [];

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private reviewService: ReviewService,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUser();

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const tab = (params['tab'] ?? '').toLowerCase();
        if (tab === 'wishlist') {
          this.activeTab = 'Wishlist';
          this.loadTabData();
        }
      });
  }

  loadUser(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const u = currentUser as ProfileUser;
      this.user = {
        ...currentUser,
        phone: u.phone ?? currentUser.phoneNumber,
        paymentDetails: u.paymentDetails ?? {
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolderName: '',
        },
      };
      this.loadTabData();
    }
  }

  setTab(tab: 'Account' | 'Orders' | 'Wishlist' | 'Reviews'): void {
    this.activeTab = tab;
    this.loadTabData();
  }

  loadTabData(): void {
    if (this.activeTab === 'Wishlist') {
      this.wishlistProducts = [];
      const ids = this.user?.wishlist;
      if (ids?.length) {
        ids.forEach(id => {
          this.productService.getProductById(id).subscribe(product => {
            if (product) {
              this.wishlistProducts.push(product);
            }
            this.cdr.detectChanges();
          });
        });
      }
    } else if (this.activeTab === 'Reviews') {
      if (!this.user?.id) return;
      this.userReviews = [];
      this.reviewService.getReviewsByUserId(this.user.id).subscribe(reviews => {
        this.userReviews = reviews;
        this.cdr.detectChanges();
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.message = '';
    if (!this.isEditing) this.loadUser();
  }

  addToCart(product: IProduct): void {
    this.cartService.addToCart(product);
    this.showMessage(`Successfully added ${product.name} to your cart!`);
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.toggleWishlist(productId).subscribe(() => {
      this.wishlistProducts = this.wishlistProducts.filter(p => p.id !== productId);
      this.cdr.detectChanges();
    });
  }

  saveProfile(): void {
    if (!this.user) {
      this.message = 'User data is missing. Please re-login.';
      this.cdr.detectChanges();
      return;
    }

    const dtoUser = this.user as IUser;
    if (this.authService.isSeller()) {
      this.usersService
        .updateSellerProfile({
          firstName: dtoUser.firstName,
          lastName: dtoUser.lastName,
          address: dtoUser.address,
          phoneNumber: dtoUser.phoneNumber,
        })
        .subscribe({
          next: () => {
            this.authService.updateCurrentUser({
              ...dtoUser,
              wishlist: dtoUser.wishlist,
              paymentDetails: (this.user as ProfileUser).paymentDetails,
            });
            this.user = {
              ...dtoUser,
              phone: dtoUser.phoneNumber,
              paymentDetails: (this.user as ProfileUser).paymentDetails,
            } as ProfileUser;
            this.isEditing = false;
            this.showMessage('Profile updated successfully!');
          },
          error: () => {
            this.message = 'Failed to update profile. Please try again.';
            this.cdr.detectChanges();
          },
        });
      return;
    }

    this.authService.updateCurrentUser({
      ...dtoUser,
      wishlist: dtoUser.wishlist,
      paymentDetails: (this.user as ProfileUser).paymentDetails,
    });
    this.user = {
      ...dtoUser,
      phone: dtoUser.phoneNumber,
      paymentDetails: (this.user as ProfileUser).paymentDetails,
    } as ProfileUser;
    this.isEditing = false;
    this.showMessage('Profile updated successfully!');
  }

  private showMessage(msg: string): void {
    this.message = msg;
    if (this.messageTimer) clearTimeout(this.messageTimer);
    this.cdr.detectChanges();
    this.messageTimer = setTimeout(() => {
      this.message = '';
      this.cdr.detectChanges();
    }, 5000);
  }
}