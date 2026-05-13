import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../models/iuser';

@Injectable({ providedIn: 'root' })
export class UsersService {

  private api = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.api);
  }

  getUserById(id: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.api}/${id}`);
  }

  addUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.api, user);
  }

  updateUser(user: IUser): Observable<IUser> {
    return this.http.put<IUser>(`${this.api}/${user.id}`, user);
  }

  patchUser(id: string, data: Partial<IUser>): Observable<IUser> {
    return this.http.patch<IUser>(`${this.api}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}