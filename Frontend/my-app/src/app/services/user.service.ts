import { IUser } from './../models/iuser';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/api/Admin`;

  constructor(private http: HttpClient) {}

  // READ — get all users (Admin only)
  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.apiUrl}/AllUsers`);
  }

  // CREATE — add new user
  addUser(user: IUser): Observable<IUser> {
    // Backend uses Acount/Register for this
    return this.http.post<IUser>(`${environment.apiUrl}/api/Acount/Register`, user);
  }

  // UPDATE — edit existing user
  updateUser(user: IUser): Observable<IUser> {
    // SellerController has UpdateProfile, but we might need a more general one
    return this.http.put<IUser>(`${environment.apiUrl}/api/Seller/UpdateProfile`, user);
  }

  // DELETE — remove user
  deleteUser(id: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteUser/${id}`);
  }
}