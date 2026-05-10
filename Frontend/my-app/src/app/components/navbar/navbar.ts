import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DarkModeDirective } from '../../directives/dark-mode';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/AuthServices/auth-service';
import { CommonModule } from '@angular/common';
import { IUser } from '../../models/iuser';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(public cartService: CartService, public authService: AuthService) {}

  
  //* properties
  cartItemCount: number = 0;
  private cartSub!: Subscription;

  currentUser: IUser | null = null;
  private sub!: Subscription;
 
  ngOnInit() {
    // Subscribe to the item count Observable
    this.cartSub = this.cartService.itemCountObservable$.subscribe(count => {
      this.cartItemCount = count;
    });

    // Subscribe to the current user Observable
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
    // Unsubscribe from user Observable
    if (this.sub) {
      this.sub.unsubscribe();
    } 
  }

  logout(): void {
    this.authService.logout();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
