import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HighLight } from '../../directives/high-light';
import { TruncateWordsPipe } from '../../pipes/truncate-words-pipe';
import { ZoomImageDirective } from '../../directives/zoom-image';
import { ProductService } from '../../services/product.service';
import { IProduct } from '../../models/iproduct';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { DecimalPipe } from "../../pipes/decimal-pipe";
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [CommonModule, NgClass, HighLight, TruncateWordsPipe, ZoomImageDirective, DecimalPipe],
  templateUrl: './products.html',
  styleUrl: './products.css',
  standalone: true
})
export class Products implements OnChanges {

  // ⬇️ Receives selected category NAME from parent
  @Input() selectedCategory: string = 'All';

  // ⬆️ Sends total price up to parent
  @Output() totalPrice = new EventEmitter<number>();

  // ⬆️ Sends edit and delete events
  @Output() editProduct = new EventEmitter<IProduct>();
  @Output() deleteProduct = new EventEmitter<number>();

  filteredList: IProduct[] = [];

  // ✅ Inject the service — Angular provides it automatically
  constructor(private productService: ProductService, private CartService: CartService, private authService: AuthService, private router: Router) {
    this.applyFilter();
  }

  // Runs every time @Input() changes (parent sends new category)
  ngOnChanges(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const all = this.productService.products;

    this.filteredList = this.selectedCategory === 'All'
      ? [...all]
      : all.filter(p => p.category === this.selectedCategory);

    // Emit total price up to parent
    const total = this.filteredList.reduce((sum, p) => sum + p.price, 0);
    this.totalPrice.emit(total);
  }

  get inStockCount(): number {
    return this.filteredList.filter(p => p.stock > 0).length;
  }

  onEdit(product: IProduct) {
    this.editProduct.emit(product);
  }

  onDelete(id: number) {
    this.deleteProduct.emit(id);
  }

  onAddToCart(product: IProduct) {
    // Use the Cart service to add the product to the cart
    this.CartService.addToCart(product);
    console.log('Current cart items:', this.CartService.getItems());
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
goToLogin() {
  this.router.navigate(['/login']);
}
}
