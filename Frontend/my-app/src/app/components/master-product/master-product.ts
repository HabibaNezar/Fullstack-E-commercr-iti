import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Products } from '../products/products';
import { FormsModule } from '@angular/forms';
import { ICategory } from '../../models/icategory';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { Cart } from '../cart/cart';
import { IProduct } from '../../models/iproduct';
import { AuthService } from '../../services/AuthServices/auth-service';

@Component({
  selector: 'app-master-products',
  imports: [Products, FormsModule, CommonModule, Cart],
  templateUrl: './master-product.html',
  styleUrl: './master-product.css',
})
export class MasterProducts implements AfterViewInit {

  selectedCategory: string = 'All';
  maxPrice: number = 1000;
  searchQuery: string = '';           
  totalparentPrice: number = 0;
  catList: ICategory[] = [];

  isEditMode: boolean = false;
  currentProduct: IProduct = this.getEmptyProduct();

  catOpen: boolean = false;
  priceOpen: boolean = false;

  @ViewChild(Products) productsChild!: Products;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {
    this.catList = this.productService.getCategories();
  }

  ngAfterViewInit(): void {
    console.log('Filtered products count:', this.productsChild.filteredProducts.length);
  }

  // ✅ Clears all three filters at once
  clearAll(): void {
    this.selectedCategory = 'All';
    this.maxPrice = 1000;
    this.searchQuery = '';
    this.catOpen = false;
    this.priceOpen = false;
  }

  // ✅ True when any filter is active — drives "Clear all" visibility
  get hasActiveFilters(): boolean {
    return this.selectedCategory !== 'All'
      || this.maxPrice < 1000
     ;
  }

  RecievedTotalPrice(price: number): void {
    this.totalparentPrice = price;
  }

  getEmptyProduct(): IProduct {
    return {
      id: 0, title: '', description: '', category: '', price: 0,
      discountPercentage: 0, rating: 0, stock: 0, tags: [], brand: '',
      sku: '', weight: 0,
      dimensions: { width: 0, height: 0, depth: 0 },
      warrantyInformation: '', shippingInformation: '',
      availabilityStatus: 'In Stock', reviews: [], returnPolicy: '',
      minimumOrderQuantity: 1,
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        barcode: '', qrCode: ''
      },
      images: [], thumbnail: ''
    };
  }

  addProduct(): void {
    this.isEditMode = false;
    this.currentProduct = this.getEmptyProduct();
  }

  editProduct(product: IProduct): void {
    this.isEditMode = true;
    this.currentProduct = { ...product };
  }

  saveProduct(): void {
    if (this.isEditMode) {
      this.productService.updateProduct(this.currentProduct.id, this.currentProduct);
    } else {
      this.productService.createProduct(this.currentProduct);
    }
    this.resetForm();
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
    }
  }

  isAdmin(): boolean { return this.authService.isAdmin(); }
  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  private resetForm(): void {
    this.currentProduct = this.getEmptyProduct();
    this.isEditMode = false;
  }
}