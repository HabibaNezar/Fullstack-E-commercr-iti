import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {

  private items: any[] = [];

  private itemCountBehaviorSubject = new BehaviorSubject<number>(0);
  itemCountObservable$ = this.itemCountBehaviorSubject.asObservable();

  addToCart(product: any) {
    // 👇 Check if the product already exists in the cart
    const existingItem = this.items.find(item => item.id === product.id);

    if (existingItem) {
      // ✅ Already in cart — just increase quantity
      existingItem.quantity++;
    } else {
      // ✅ New item — add it with quantity 1
      this.items.push({ ...product, quantity: 1 });
    }

    // 👇 Count = number of UNIQUE items (not total quantity)
    this.itemCountBehaviorSubject.next(this.items.length);
  }

  getItems() {
    return this.items;
  }

  clearCart() {
    this.items = [];
    this.itemCountBehaviorSubject.next(0); // 👈 reset the badge too
    return this.items;
  }

  getTotalPrice() {
    // 👇 Now must multiply price × quantity per item
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity, 0
    );
  }

  getItemCount() {
    return this.items.length;
  }

  incrementItem(productId: number) {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.quantity++;
      this.itemCountBehaviorSubject.next(this.items.length);
    }
  }

  decrementItem(productId: number) {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;          // 👈 just decrease
      } else {
        this.removeItem(productId); // 👈 if quantity = 1, remove it entirely
      }
      this.itemCountBehaviorSubject.next(this.items.length);
    }
  }

  removeItem(productId: number) {
    this.items = this.items.filter(i => i.id !== productId);
    this.itemCountBehaviorSubject.next(this.items.length);
  }

}