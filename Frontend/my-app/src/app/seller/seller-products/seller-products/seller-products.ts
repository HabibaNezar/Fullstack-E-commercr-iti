import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { IProduct } from '../../../models/iproduct';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-products.html',
  styleUrl: './seller-products.css',
})
export class SellerProducts implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products = signal<IProduct[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  searchQuery = signal('');

  currentProduct: Partial<IProduct> = {};
  isEditMode = signal(false);
  showForm = signal(false);
  saving = signal(false);
  saveError = signal('');

  selectedImageFile: File | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
    }
  }

  addProduct(): void {
    this.currentProduct = {};
    this.isEditMode.set(false);
    this.showForm.set(true);
    this.selectedImageFile = null;
    this.saveError.set('');
  }

  editProduct(product: IProduct): void {
    this.currentProduct = { ...product };
    this.isEditMode.set(true);
    this.showForm.set(true);
    this.selectedImageFile = null;
    this.saveError.set('');
  }

  cancelEdit(): void {
    this.showForm.set(false);
    this.currentProduct = {};
    this.selectedImageFile = null;
    this.saveError.set('');
  }

  saveProduct(): void {
    if (!this.currentProduct.name || !this.currentProduct.price) {
      this.saveError.set('Name and price are required');
      return;
    }

    this.saving.set(true);
    this.saveError.set('');

    const formData = this.productService.buildFormData(this.currentProduct, this.selectedImageFile);

    const observable = this.isEditMode()
      ? this.productService.updateProduct(this.currentProduct.id!, formData)
      : this.productService.createProduct(formData);

    observable.subscribe({
      next: () => {
        this.loadData();
        this.cancelEdit();
        this.saving.set(false);
      },
      error: () => {
        this.saveError.set('Failed to save product');
        this.saving.set(false);
      },
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadData();
        },
      });
    }
  }

  get filteredProducts(): IProduct[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.products();
    return this.products().filter(
      (p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
    );
  }
}
