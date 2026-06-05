import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { WishlistService } from '../../../shared/services/wishlist.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUser } from '../../../models/iuser';
import { ICategory } from '../../../models/icategory';

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
  isMobileMenuOpen = false;
  categories: ICategory[] = [];

  isAccountDropdownOpen = false;
  isMegaMenuOpen = false;

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private categoryService: CategoryService,
    public wishlistService: WishlistService,
  ) { }

  ngOnInit() {
    this.cartService.itemCountObservable$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => {
        this.cartItemCount = count;
        this.cdr.markForCheck();
      });

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUser = user;
        setTimeout(() => {
          if (user && this.authService.isLoggedIn()) {
            this.cartService.loadCartFromApi().subscribe({ error: () => { } });
          } else {
            this.cartService.clearCart();
          }
        });
      });

    this.categoryService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cats => {
        this.categories = cats;
      });
  }

  get wishlistCount(): number {
    return this.currentUser?.wishlist?.length ?? 0;
  }

  toggleAccountDropdown(): void {
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  closeAccountDropdown(): void {
    this.isAccountDropdownOpen = false;
  }

  openMegaMenu(): void {
    this.isMegaMenuOpen = true;
  }

  closeMegaMenu(): void {
    this.isMegaMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.closeAccountDropdown();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isAccountDropdownOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown-wrap')) {
      this.isAccountDropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAccountDropdown();
    this.closeMegaMenu();
  }
}
