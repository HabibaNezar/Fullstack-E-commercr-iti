import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';  // ✅ RouterLink مرة واحدة بس
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUser } from '../../models/iuser';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,   
    CommonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {  

  cartItemCount = 0;
  currentUser: IUser | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    public cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cartService.itemCountObservable$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => this.cartItemCount = count);

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => this.currentUser = user);
  }

  logout(): void {
    this.authService.logout();
  }
}