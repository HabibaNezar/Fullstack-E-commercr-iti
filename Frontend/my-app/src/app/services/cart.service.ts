import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IProduct } from '../models/iproduct';
import { AuthService } from './AuthServices/auth-service';

/** Cart line shape aligned with `cart.html` (title, images[], stock). */
export interface CartItem {
  id: number;
  name: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  thumbnail?: string;
  images: string[];
  stock: number;
}

function pick<T>(obj: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return undefined;
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}

function normalizeCartLine(raw: unknown, fallbackImage: string): CartItem {
  const o = asRecord(raw);
  const nested = asRecord(pick(o, ['product', 'Product']));
  const id = Number(
    pick(o, ['productId', 'ProductId', 'id', 'Id']) ??
      pick(nested, ['id', 'Id']) ??
      0
  );
  const name = String(
    pick(o, ['productName', 'ProductName', 'name', 'Name', 'title', 'Title']) ??
      pick(nested, ['name', 'Name', 'title', 'Title']) ??
      ''
  );
  const price = Number(
    pick(o, [
      'currentPrice',
      'CurrentPrice',
      'price',
      'Price',
      'unitPrice',
      'UnitPrice',
    ]) ??
      pick(nested, ['price', 'Price', 'currentPrice', 'CurrentPrice']) ??
      0
  );
  const quantity = Number(pick(o, ['quantity', 'Quantity', 'qty', 'Qty']) ?? 1);
  const img = pick<string>(o, [
    'image',
    'Image',
    'imageUrl',
    'ImageUrl',
    'thumbnail',
    'Thumbnail',
  ]) ?? pick<string>(nested, ['image', 'Image', 'imageUrl', 'ImageUrl']);
  const images = img ? [img] : [fallbackImage];
  const stock = Number(
    pick(o, ['stockQuantity', 'StockQuantity', 'stock', 'Stock']) ??
      pick(nested, ['stockQuantity', 'StockQuantity', 'stock', 'Stock']) ??
      999
  );
  return {
    id,
    name,
    title: name,
    price,
    quantity,
    image: img,
    thumbnail: img,
    images,
    stock,
  };
}

/** Try every common .NET / JSON:API wrapper key to find the items array. */
function extractRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;

  const r = asRecord(raw);

  // JSON.NET $values (circular reference resolver)
  if (Array.isArray(r['$values'])) return r['$values'] as unknown[];

  // Common wrapper keys
  const candidates = [
    'cartItems', 'CartItems',
    'items',     'Items',
    'data',      'Data',
    'result',    'Result',
    'value',     'Value',
  ];
  for (const key of candidates) {
    const v = r[key];
    if (Array.isArray(v)) return v;
    // one level deeper: { data: { items: [...] } }
    if (v && typeof v === 'object') {
      const inner = asRecord(v);
      for (const k2 of candidates) {
        if (Array.isArray(inner[k2])) return inner[k2] as unknown[];
      }
      if (Array.isArray(inner['$values'])) return inner['$values'] as unknown[];
    }
  }
  return [];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/ShoppingCart`;

  private items: CartItem[] = [];
  private readonly fallbackImg =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="#e8e8ed"/></svg>'
    );

  private itemCountSubject = new BehaviorSubject<number>(0);
  itemCountObservable$ = this.itemCountSubject.asObservable();

  private get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  private emitQty(): void {
    const n = this.items.reduce((s, i) => s + i.quantity, 0);
    this.itemCountSubject.next(n);
  }

  private lineFromProduct(product: IProduct, quantity: number): CartItem {
    const img = product.image?.trim();
    const images = img ? [img] : [this.fallbackImg];
    return {
      id: product.id,
      name: product.name,
      title: product.name,
      price: product.price,
      quantity,
      image: product.image,
      thumbnail: product.image,
      images,
      stock: product.stockQuantity,
    };
  }

  addToCart(product: IProduct, quantity = 1): void {
    const existing = this.items.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push(this.lineFromProduct(product, quantity));
    }
    this.emitQty();

    if (this.isLoggedIn) {
      this._syncAddToApi(product.id, quantity).subscribe();
    }
  }

  private _syncAddToApi(productId: number, quantity: number): Observable<unknown> {
    const params = new HttpParams().set('ProductId', productId).set('Quantity', quantity);
    return this.http.post(`${this.apiUrl}/Add_To_Cart`, null, { params });
  }

  loadCartFromApi(): Observable<CartItem[]> {
    return this.http.get<unknown>(`${this.apiUrl}/Get_Cart_Items`).pipe(
      map((raw) => {
        const rows = extractRows(raw);
        return rows.map((r) => normalizeCartLine(r, this.fallbackImg));
      }),
      tap((items) => {
        this.items = items ?? [];
        this.emitQty();
      })
    );
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.items.reduce((s, i) => s + i.quantity, 0);
  }

  incrementItem(productId: number): void {
    const item = this.items.find((i) => i.id === productId);
    if (item) {
      item.quantity++;
      this.emitQty();
      if (this.isLoggedIn) this._syncAddToApi(productId, 1).subscribe();
    }
  }

  decrementItem(productId: number): void {
    const item = this.items.find((i) => i.id === productId);
    if (!item) return;
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(productId);
    }
    this.emitQty();
  }

  removeItem(productId: number): void {
    this.items = this.items.filter((i) => i.id !== productId);
    this.emitQty();
  }

  clearCart(): void {
    this.items = [];
    this.emitQty();
  }
}