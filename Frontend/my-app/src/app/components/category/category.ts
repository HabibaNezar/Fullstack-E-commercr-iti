import { CommonModule } from '@angular/common';
import { ProductService } from './../../services/product.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-category',
  imports: [CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category {
  allCategories: string[] = [];
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.productService.getCategories().subscribe((categories) => {
      this.allCategories = categories.map((c) => c.name);
    });
  }

}
