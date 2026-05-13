import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IReview } from '../models/ireview';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = 'http://localhost:3001/reviews';

  constructor(private http: HttpClient) {}

  getReviewsByProductId(productId: number): Observable<IReview[]> {
    return this.http.get<IReview[]>(`${this.apiUrl}?productId=${productId}`);
  }

  getReviewsByUserId(userId: any): Observable<IReview[]> {
    return this.http.get<IReview[]>(`${this.apiUrl}?userId=${userId}`);
  }

  addReview(review: IReview): Observable<IReview> {
    return this.http.post<IReview>(this.apiUrl, review);
  }

  deleteReview(reviewId: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }
}
