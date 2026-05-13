export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  image?: string;
  categoryId: number;
  categoryName?: string;
}

export interface IProductFormData {
  Name: string;
  Description: string;
  Price: number;
  StockQuantity: number;
  CategoryId: number;
  Image?: File;
}