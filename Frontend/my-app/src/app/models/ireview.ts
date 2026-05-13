export interface IReview {
  id?: any;
  productId: number;
  userId: any;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  reviewDate: Date;
}
