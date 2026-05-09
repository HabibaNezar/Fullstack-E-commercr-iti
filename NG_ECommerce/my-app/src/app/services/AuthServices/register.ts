import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IUser } from '../../models/iuser';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  register(user: IUser): Observable<IUser> {

    // 👇 Step 1 — check if email already exists FIRST
    return this.http.get<IUser[]>(
      `${this.apiUrl}?email=${user.email}`
    ).pipe(
      switchMap(existingUsers => {

        // 👇 Step 2 — email already taken
        if (existingUsers.length > 0) {
          return throwError(() => new Error('ACCOUNT_EXISTS'));
          //                                ☝️ error code
        }

        // 👇 Step 3 — email is free → create the account
        return this.http.post<IUser>(this.apiUrl, user);
      })
    );
  }
}