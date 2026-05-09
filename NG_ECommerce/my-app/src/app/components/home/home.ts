import { Component } from '@angular/core';
import { Category } from "../category/category";
import { Products } from "../products/products";
import { MasterProducts } from "../master-product/master-product";

@Component({
  selector: 'app-home',
  imports: [Category, Products, MasterProducts],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
