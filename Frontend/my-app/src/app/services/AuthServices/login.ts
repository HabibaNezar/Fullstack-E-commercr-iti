import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IUser } from '../../models/iuser';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = 'http://localhost:3001/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<IUser> {
    // 👇 Step 1 — search by EMAIL ONLY first
    return this.http.get<IUser[]>(
      `${this.apiUrl}?email=${email}`
    ).pipe(
      map(users => {

        // 👇 No user with this email at all
        if (users.length === 0) {
          throw new Error('NO_ACCOUNT');
          //               ☝️ special code we'll use to show the right message
        }

        // 👇 Email exists — now check password
        const user = users[0];
        if (user.password !== password) {
          throw new Error('WRONG_PASSWORD');
          //               ☝️ different code for wrong password
        }

        // ✅ Both match — return the full user
        return user;
      })
    );
  }
}