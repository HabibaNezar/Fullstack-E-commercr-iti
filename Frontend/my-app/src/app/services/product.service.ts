import { Injectable } from '@angular/core';
import { IProduct } from '../models/iproduct';
import { ICategory } from '../models/icategory';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  products: IProduct[] = [
    {"id":1,"title":"Essence Mascara Lash Princess","description":"The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.","category":"beauty","price":9.99,"discountPercentage":10.48,"rating":2.56,"stock":99,"tags":["beauty","mascara"],"brand":"Essence","sku":"BEA-ESS-ESS-001","weight":4,"dimensions":{"width":15.14,"height":13.08,"depth":22.99},"warrantyInformation":"1 week warranty","shippingInformation":"Ships in 3-5 business days","availabilityStatus":"In Stock","reviews":[{"rating":3,"comment":"Would not recommend!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Eleanor Collins","reviewerEmail":"eleanor.collins@x.dummyjson.com"},{"rating":4,"comment":"Very satisfied!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Lucas Gordon","reviewerEmail":"lucas.gordon@x.dummyjson.com"},{"rating":5,"comment":"Highly impressed!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Eleanor Collins","reviewerEmail":"eleanor.collins@x.dummyjson.com"}],"returnPolicy":"No return policy","minimumOrderQuantity":48,"meta":{"createdAt":"2025-04-30T09:41:02.053Z","updatedAt":"2025-04-30T09:41:02.053Z","barcode":"5784719087687","qrCode":"https://cdn.dummyjson.com/public/qr-code.png"},"images":["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"],"thumbnail":"https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp"},{"id":2,"title":"Eyeshadow Palette with Mirror","description":"The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.","category":"beauty","price":19.99,"discountPercentage":18.19,"rating":2.86,"stock":34,"tags":["beauty","eyeshadow"],"brand":"Glamour Beauty","sku":"BEA-GLA-EYE-002","weight":9,"dimensions":{"width":9.26,"height":22.47,"depth":27.67},"warrantyInformation":"1 year warranty","shippingInformation":"Ships in 2 weeks","availabilityStatus":"In Stock","reviews":[{"rating":2,"comment":"Not as described!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Nora Russell","reviewerEmail":"nora.russell@x.dummyjson.com"},{"rating":1,"comment":"Very disappointed!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Elena Baker","reviewerEmail":"elena.baker@x.dummyjson.com"},{"rating":2,"comment":"Poor quality!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Liam Garcia","reviewerEmail":"liam.garcia@x.dummyjson.com"}],"returnPolicy":"30 days return policy","minimumOrderQuantity":32,"meta":{"createdAt":"2025-04-30T09:41:02.053Z","updatedAt":"2025-04-30T09:41:02.053Z","barcode":"2512019909242","qrCode":"https://cdn.dummyjson.com/public/qr-code.png"},"images":["https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp"],"thumbnail":"https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp"},{"id":3,"title":"Powder Canister","description":"The Powder Canister is a finely milled setting powder designed to mattify the skin and set makeup for a flawless finish. It comes in a convenient canister for easy application.","category":"beauty","price":14.99,"discountPercentage":18.14,"rating":3.82,"stock":59,"tags":["beauty","face powder"],"brand":"Velvet Touch","sku":"BEA-VEL-POW-003","weight":8,"dimensions":{"width":24.16,"height":10.7,"depth":11.07},"warrantyInformation":"2 year warranty","shippingInformation":"Ships in 1-2 business days","availabilityStatus":"In Stock","reviews":[{"rating":5,"comment":"Very happy with my purchase!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Ethan Thompson","reviewerEmail":"ethan.thompson@x.dummyjson.com"},{"rating":4,"comment":"Great value for money!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Levi Wright","reviewerEmail":"levi.wright@x.dummyjson.com"},{"rating":5,"comment":"Highly recommended!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Emily Johnson","reviewerEmail":"emily.johnson@x.dummyjson.com"}],"returnPolicy":"90 days return policy","minimumOrderQuantity":25,"meta":{"createdAt":"2025-04-30T09:41:02.053Z","updatedAt":"2025-04-30T09:41:02.053Z","barcode":"0516267971277","qrCode":"https://cdn.dummyjson.com/public/qr-code.png"},"images":["https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp"],"thumbnail":"https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"},{"id":4,"title":"Red Lipstick","description":"The Red Lipstick is a classic and bold choice for adding a pop of color to your lips. With a creamy and highly pigmented formula, it provides a vibrant and long-lasting finish.","category":"beauty","price":12.99,"discountPercentage":19.03,"rating":4.12,"stock":68,"tags":["beauty","lipstick"],"brand":"Chic Cosmetics","sku":"BEA-CHI-LIP-004","weight":5,"dimensions":{"width":14.37,"height":13.94,"depth":14.6},"warrantyInformation":"No warranty","shippingInformation":"Ships in 1 month","availabilityStatus":"In Stock","reviews":[{"rating":5,"comment":"Very pleased!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Leo Rivera","reviewerEmail":"leo.rivera@x.dummyjson.com"},{"rating":4,"comment":"Great value for money!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Oscar Ward","reviewerEmail":"oscar.ward@x.dummyjson.com"},{"rating":5,"comment":"Highly recommended!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Ruby Miller","reviewerEmail":"ruby.miller@x.dummyjson.com"}],"returnPolicy":"7 days return policy","minimumOrderQuantity":6,"meta":{"createdAt":"2025-04-30T09:41:02.053Z","updatedAt":"2025-04-30T09:41:02.053Z","barcode":"9409341324690","qrCode":"https://cdn.dummyjson.com/public/qr-code.png"},"images":["https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp"],"thumbnail":"https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp"},{"id":5,"title":"Red Nail Polish","description":"The Red Nail Polish offers a rich and glossy red shade for your nails. With a quick-drying formula, it provides a professional-looking manicure that lasts.","category":"beauty","price":8.99,"discountPercentage":2.46,"rating":3.91,"stock":71,"tags":["beauty","nail polish"],"brand":"Nail Couture","sku":"BEA-NAI-POL-005","weight":9,"dimensions":{"width":8.11,"height":10.89,"depth":29.06},"warrantyInformation":"1 year warranty","shippingInformation":"Ships in 1 week","availabilityStatus":"In Stock","reviews":[{"rating":5,"comment":"Very pleased!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Leo Rivera","reviewerEmail":"leo.rivera@x.dummyjson.com"},{"rating":1,"comment":"Very disappointed!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Evan Reed","reviewerEmail":"evan.reed@x.dummyjson.com"},{"rating":5,"comment":"Highly recommended!","date":"2025-04-30T09:41:02.053Z","reviewerName":"Evelyn Sanchez","reviewerEmail":"evelyn.sanchez@x.dummyjson.com"}],"returnPolicy":"No return policy","minimumOrderQuantity":46,"meta":{"createdAt":"2025-04-30T09:41:02.053Z","updatedAt":"2025-04-30T09:41:02.053Z","barcode":"3212847902461","qrCode":"https://cdn.dummyjson.com/public/qr-code.png"},"images":["https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/1.webp"],"thumbnail":"https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp"}
  ];

  getProducts(): IProduct[] {
    return this.products;
  }

  getCategories(): ICategory[] {
    const uniqueNames = [...new Set(this.products.map((product) => product.category))];
    return uniqueNames.map((name, index) => ({ id: index + 1, name }));
  }

  getProductById(id: number): Observable<IProduct | undefined> {
    const product = this.products.find((product) => product.id === id);
    return of(product);
  }

  createProduct(product: Omit<IProduct, 'id'>): IProduct {
    const newId = Math.max(...this.products.map((product) => product.id), 0) + 1;
    const newProduct: IProduct = { id: newId, ...product };
    this.products.push(newProduct);
    return newProduct;
  }

  updateProduct(id: number, updatedProduct: Partial<IProduct>): IProduct | null {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) {
      return null;
    }
    this.products[index] = { ...this.products[index], ...updatedProduct };
    return this.products[index];
  }

  deleteProduct(id: number): boolean {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) {
      return false;
    }
    this.products.splice(index, 1);
    return true;
  }
}
