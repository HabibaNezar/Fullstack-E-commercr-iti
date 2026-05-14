import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProduct } from '../models/iproduct';
import { ICategory } from '../models/icategory';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/Products`;
  private categoryUrl = `${environment.apiUrl}/api/Categories`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<IProduct[]> {
  return this.http.get<any[]>(`${this.apiUrl}/Get_All_Products`).pipe(
    map((products) => products.map((p) => this.mapToIProduct(p))),
    catchError((error) => {
      console.error('Error fetching products:', error);
      return throwError(() => error);
    })
  );
}

  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.categoryUrl}/Get_All_Categories`);
  }

 getProductById(id: number): Observable<IProduct | undefined> {
  return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
    map((p) => this.mapToIProduct(p)),
    catchError((error) => {
      console.error('Error fetching product:', error);
      return throwError(() => error);
    })
  );
}

  private mapToIProduct(p: any): IProduct {
    const isFullUrl = (url: string) => url && (url.startsWith('http://') || url.startsWith('https://'));
    
    let imageUrl = 'assets/placeholder.png';
    
    // 1. Try imagePath (PascalCase or camelCase)
    const path = p.imagePath || p.ImagePath;
    if (path) {
      if (isFullUrl(path)) {
        imageUrl = path;
      } else {
        // Prepend backend URL and Images folder
        imageUrl = `${environment.apiUrl}/Images/${path}`;
      }
    } 
    // 2. Fallback to imageUrl if provided (e.g. from GetById)
    else if (p.imageUrl || p.ImageUrl) {
      let url = p.imageUrl || p.ImageUrl;
      // Fix potential backend bug where /Images/ is missing in the returned URL
      if (url.includes(environment.apiUrl) && !url.includes('/Images/') && !isFullUrl(path)) {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        if (filename) {
          url = `${environment.apiUrl}/Images/${filename}`;
        }
      }
      imageUrl = url;
    }

    return {
      id: p.id || p.Id,
      title: p.name || p.Name || p.title,
      description: p.description || p.Description,
      price: p.price || p.Price,
      stock: p.stockQuantity !== undefined ? p.stockQuantity : (p.StockQuantity !== undefined ? p.StockQuantity : p.stock),
      category: p.categoryName || (p.category ? (typeof p.category === 'object' ? p.category.name : p.category) : 'Uncategorized'),
      images: [imageUrl], // Changed to array
      thumbnail: imageUrl,
      discountPercentage: p.discountPercentage || 0,
      rating: p.rating || 0,
      tags: p.tags || [],
      sku: p.sku || '',
      weight: p.weight || 0,
      dimensions: p.dimensions || { width: 0, height: 0, depth: 0 },
      warrantyInformation: p.warrantyInformation || '',
      shippingInformation: p.shippingInformation || '',
      availabilityStatus: p.availabilityStatus || (p.stockQuantity > 0 || p.StockQuantity > 0 ? 'In Stock' : 'Out of Stock'),
      reviews: p.reviews || [],
      returnPolicy: p.returnPolicy || '',
      minimumOrderQuantity: p.minimumOrderQuantity || 1,
      meta: p.meta || { createdAt: '', updatedAt: '', barcode: '', qrCode: '' }
    };
  }

  createProduct(product: Omit<IProduct, 'id'>): Observable<any> {
    const formData = new FormData();
    formData.append('Name', product.title);
    formData.append('Description', product.description);
    formData.append('Price', product.price.toString());
    formData.append('StockQuantity', product.stock.toString());
    // Note: CategoryId needs to be handled
    return this.http.post(`${this.apiUrl}/Add_New_Product`, formData);
  }

  updateProduct(id: number, updatedProduct: Partial<IProduct>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updatedProduct);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
