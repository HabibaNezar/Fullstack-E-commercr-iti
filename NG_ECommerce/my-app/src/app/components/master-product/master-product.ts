import { Component, ViewChild } from '@angular/core';
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
export class MasterProducts {

  selectedCategory: string = 'All';
  totalparentPrice: number = 0;
  catList: ICategory[] = [];

  // Form for add/edit
  isEditMode: boolean = false;
  currentProduct: IProduct = this.getEmptyProduct();

  //* Same service injection — Angular gives the SAME instance
  constructor(private productService: ProductService, private authService: AuthService) {
    this.catList = this.productService.getCategories();
  }

  RecievedTotalPrice(data: number): void {
    this.totalparentPrice = data;
  }

  @ViewChild(Products) productsChild!: Products;
  ngAfterViewInit(): void {
    // At this point the child component is ready
    // You can now directly read or call anything on it
    console.log('Products child component:', this.productsChild);
    console.log('Filtered list from child:', this.productsChild.filteredList);
  }

  getEmptyProduct(): IProduct {
    return {
      id: 0,
      title: '',
      description: '',
      category: '',
      price: 0,
      discountPercentage: 0,
      rating: 0,
      stock: 0,
      tags: [],
      brand: '',
      sku: '',
      weight: 0,
      dimensions: { width: 0, height: 0, depth: 0 },
      warrantyInformation: '',
      shippingInformation: '',
      availabilityStatus: 'In Stock',
      reviews: [],
      returnPolicy: '',
      minimumOrderQuantity: 1,
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), barcode: '', qrCode: '' },
      images: [],
      thumbnail: ''
    };
  }

  addProduct() {
    this.isEditMode = false;
    this.currentProduct = this.getEmptyProduct();
  }

  editProduct(product: IProduct) {
    this.isEditMode = true;
    this.currentProduct = { ...product };
  }

  saveProduct() {
    if (this.isEditMode) {
      this.productService.updateProduct(this.currentProduct.id, this.currentProduct);
    } else {
      this.productService.createProduct(this.currentProduct);
    }
    this.currentProduct = this.getEmptyProduct();
    this.isEditMode = false;
    // Refresh the child
    this.productsChild.applyFilter();
  }

  cancelEdit() {
    this.currentProduct = this.getEmptyProduct();
    this.isEditMode = false;
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
      this.productsChild.applyFilter();
    }
  }
  isAdmin(): boolean {
    return this.authService.isAdmin(); }
}