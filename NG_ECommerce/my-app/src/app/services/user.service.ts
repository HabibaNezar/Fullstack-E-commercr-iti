import { IUser } from './../models/iuser';
// users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {

  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // READ — get all users
  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.apiUrl);
  }

  // CREATE — add new user
  addUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.apiUrl, user);
  }

  // UPDATE — edit existing user
  updateUser(user: IUser): Observable<IUser> {
    return this.http.put<IUser>(`${this.apiUrl}/${user.id}`, user);
  }

  // DELETE — remove user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}