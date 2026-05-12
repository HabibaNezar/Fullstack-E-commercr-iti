import { Injectable } from '@angular/core';
import { UsersService } from './user.service';
import { AuthService } from './AuthServices/auth-service';
import { IUser } from '../models/iuser';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  toggleWishlist(productId: number): Observable<IUser | null> {
    const user = this.authService.getCurrentUser();
    if (!user) return of(null);

    if (!user.wishlist) user.wishlist = [];

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    // ⚡ Optimistic Update: Update local state immediately
    this.authService.updateCurrentUser(user);

    // Then sync with backend
    return this.usersService.updateUser(user);
  }

  isInWishlist(productId: number): boolean {
    const user = this.authService.getCurrentUser();
    return user?.wishlist?.includes(productId) || false;
  }
}
